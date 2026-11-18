import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcileSewingOutput, sewKeyOfRow, sewingOutputSql, SEW_OUT_SQL } from './sewingOutput.mjs';

const po = (clr, order = 900) => ({ clr_id : clr, order_id : order });

test('source filter: sewing out rows only, grouped per PO identity before any join', () => {
    assert.equal(SEW_OUT_SQL('d'), "d.mr_operation_type_id = 2 AND d.status = 'out'");
    const sql = sewingOutputSql('cuttingedgedb', 3);
    assert.match(sql, /FROM `cuttingedgedb`\.daily_productions d/);
    assert.match(sql, /d\.po_id IN \(\?,\?,\?\)/);
    assert.match(sql, /GROUP BY d\.po_id, d\.clr_id, d\.prod_unit_id, d\.order_id/);
    assert.doesNotMatch(sql, /JOIN/);
});

test('row keys: in-house PO, OS colour row, OS size-key row, projection', () => {
    assert.deepEqual(sewKeyOfRow({ erp_po_id : '76816' }), { kind : 'mr', poId : 76816 });
    assert.deepEqual(sewKeyOfRow({ erp_po_id : 'os-c-3473' }), { kind : 'os', ocId : 3473 });
    assert.deepEqual(sewKeyOfRow({ erp_po_id : 'os-cs-1244-76816-24224' }), { kind : 'os', poId : 76816, clrId : 24224 });
    assert.equal(sewKeyOfRow({ erp_po_id : 'proj-49474' }).kind, 'none');
});

test('remaining = MAX(0, PO qty − actual sewing output)', () => {
    const r = reconcileSewingOutput(
        [{ id : 1, erp_po_id : '10', order_quantity : 10000 }, { id : 2, erp_po_id : '11', order_quantity : 500 }, { id : 3, erp_po_id : '12', order_quantity : 800, shipment_date : '2026-12-01' }],
        new Map([[10, po(5)], [11, po(5)], [12, po(6)]]), new Map(),
        [{ po_id : 10, clr_id : 5, prod_unit_id : 1, order_id : 900, qty : 3500 }, { po_id : 11, clr_id : 5, prod_unit_id : 1, order_id : 900, qty : 640 }]);
    assert.deepEqual(r.get(1), { sewn : 3640, remaining : 6360, issue : null, days : 0, last : null });   // 3,500 own + the 140 booked beyond PO 11 (same lot)
    assert.deepEqual(r.get(2), { sewn : 500, remaining : 0, issue : null, days : 0, last : null });      // over-sewn: never negative
    assert.deepEqual(r.get(3), { sewn : 0, remaining : 800, issue : null, days : 0, last : null });      // another colour: nothing sewn yet
});

test('a lot (one order, one colour, one unit): output booked beyond a PO fills the lot\'s short POs, earliest delivery first', () => {
    // 26H1LEV475 colour 00AFB-0006: the big PO booked 206 beyond its quantity, the small POs look short
    const r = reconcileSewingOutput(
        [{ id : 1, erp_po_id : '10', order_quantity : 4309, prod_unit : 1, shipment_date : '2026-11-12' },
         { id : 2, erp_po_id : '11', order_quantity : 54,   prod_unit : 1, shipment_date : '2026-11-12' },
         { id : 3, erp_po_id : '12', order_quantity : 50,   prod_unit : 1, shipment_date : '2026-11-12' },
         { id : 4, erp_po_id : '13', order_quantity : 800,  prod_unit : 1, shipment_date : '2026-11-20' }],
        new Map([[10, po(5)], [11, po(5)], [12, po(5)], [13, po(5)]]), new Map(),
        [{ po_id : 10, clr_id : 5, prod_unit_id : 1, order_id : 900, qty : 4515, days : 7, last_date : '2026-11-06' },
         { po_id : 11, clr_id : 5, prod_unit_id : 1, order_id : 900, qty : 26,   days : 1, last_date : '2026-11-09' },
         { po_id : 12, clr_id : 5, prod_unit_id : 1, order_id : 900, qty : 32,   days : 1, last_date : '2026-11-09' }]);
    assert.equal(r.get(1).sewn, 4309);                                  // its own rows first, never beyond the quantity
    assert.deepEqual([r.get(2).sewn, r.get(2).remaining], [54, 0]);     // 26 own + 28 of the pool (same delivery, lower id first)
    assert.deepEqual([r.get(3).sewn, r.get(3).remaining], [50, 0]);     // 32 own + 18 of the pool
    assert.deepEqual([r.get(4).sewn, r.get(4).remaining], [160, 640]);  // the rest of the pool (206 − 28 − 18) on the later delivery
    assert.equal(r.get(4).days, 7);                                     // the lot's sewing days / last date go with the spilled pieces
    assert.equal(r.get(4).last, '2026-11-06');
    assert.equal(r.get(1).sewn + r.get(2).sewn + r.get(3).sewn + r.get(4).sewn, 4515 + 26 + 32);   // every piece once
});

test('no spill across colours, orders or production units; nothing spills without an excess', () => {
    const r = reconcileSewingOutput(
        [{ id : 1, erp_po_id : '10', order_quantity : 100, prod_unit : 1 },      // over-sewn by 40
         { id : 2, erp_po_id : '11', order_quantity : 100, prod_unit : 1 },      // other colour
         { id : 3, erp_po_id : '12', order_quantity : 100, prod_unit : 1 },      // other order
         { id : 4, erp_po_id : '13', order_quantity : 100, prod_unit : 2 },      // same lot, other production unit
         { id : 5, erp_po_id : '14', order_quantity : 100, prod_unit : 1 }],     // same lot: takes the 40
        new Map([[10, po(5)], [11, po(6)], [12, po(5, 901)], [13, po(5)], [14, po(5)]]), new Map(),
        [{ po_id : 10, clr_id : 5, prod_unit_id : 1, order_id : 900, qty : 140 }]);
    assert.equal(r.get(1).sewn, 100);
    assert.equal(r.get(2).sewn, 0);
    assert.equal(r.get(3).sewn, 0);
    assert.equal(r.get(4).sewn, 0);
    assert.deepEqual([r.get(5).sewn, r.get(5).remaining], [40, 60]);
    // a PO sewn exactly to its quantity leaves nothing for the others
    const r2 = reconcileSewingOutput(
        [{ id : 1, erp_po_id : '10', order_quantity : 100, prod_unit : 1 }, { id : 5, erp_po_id : '14', order_quantity : 100, prod_unit : 1 }],
        new Map([[10, po(5)], [14, po(5)]]), new Map(), [{ po_id : 10, clr_id : 5, prod_unit_id : 1, order_id : 900, qty : 100 }]);
    assert.equal(r2.get(5).sewn, 0);
});

test('an in-house PO counts the output of every unit that sewed it', () => {
    const r = reconcileSewingOutput([{ id : 1, erp_po_id : '10', order_quantity : 1000, prod_unit : 2 }], new Map([[10, po(5)]]), new Map(),
        [{ po_id : 10, clr_id : 5, prod_unit_id : 2, order_id : 900, qty : 300 }, { po_id : 10, clr_id : 5, prod_unit_id : 1, order_id : 900, qty : 200 }]);
    assert.equal(r.get(1).sewn, 500);
});

test('an OS colour row counts only its own unit\'s output of the PO', () => {
    const r = reconcileSewingOutput([{ id : 7, erp_po_id : 'os-c-3473', order_quantity : 414, prod_unit : 3 }],
        new Map([[76816, po(24224)]]), new Map([[3473, { po_id : 76816, clr_id : 24224 }]]),
        [{ po_id : 76816, clr_id : 24224, prod_unit_id : 3, order_id : 900, qty : 100 }, { po_id : 76816, clr_id : 24224, prod_unit_id : 2, order_id : 900, qty : 5000 }]);
    assert.deepEqual(r.get(7), { sewn : 100, remaining : 314, issue : null, days : 0, last : null });
});

test('several rows of one PO identity: the output is deducted ONCE, earliest delivery first', () => {
    // one PO + colour in two OS orders of the same unit (two os_order_color rows)
    const r = reconcileSewingOutput(
        [{ id : 21, erp_po_id : 'os-c-2', order_quantity : 600, prod_unit : 3, shipment_date : '2026-12-20' },
         { id : 20, erp_po_id : 'os-c-1', order_quantity : 400, prod_unit : 3, shipment_date : '2026-12-08' }],
        new Map([[50, po(9)]]), new Map([[1, { po_id : 50, clr_id : 9 }], [2, { po_id : 50, clr_id : 9 }]]),
        [{ po_id : 50, clr_id : 9, prod_unit_id : 3, order_id : 900, qty : 550 }]);
    assert.deepEqual(r.get(20), { sewn : 400, remaining : 0, issue : null, days : 0, last : null });
    assert.deepEqual(r.get(21), { sewn : 150, remaining : 450, issue : null, days : 0, last : null });
    assert.equal(r.get(20).sewn + r.get(21).sewn, 550);       // never 550 from each row
});

test('ambiguous: output under another colour / order, or a PO that is gone → reported', () => {
    const r = reconcileSewingOutput(
        [{ id : 1, erp_po_id : '10', order_quantity : 1000 }, { id : 2, erp_po_id : '99', order_quantity : 50 }, { id : 3, erp_po_id : '11', order_quantity : 700 }],
        new Map([[10, po(5)], [12, po(8)], [11, po(6, 901)]]), new Map(),      // colour 8 is another PO of order 900
        [{ po_id : 10, clr_id : 5, prod_unit_id : 1, order_id : 900, qty : 200 }, { po_id : 10, clr_id : 8, prod_unit_id : 1, order_id : 900, qty : 90 },
         { po_id : 11, clr_id : 6, prod_unit_id : 1, order_id : 777, qty : 40 }]);
    assert.equal(r.get(1).sewn, 200);
    assert.match(r.get(1).issue, /90 pcs .* another colour/);
    assert.match(r.get(2).issue, /not in mr_purchase_order/);
    assert.match(r.get(3).issue, /40 pcs .* another order/);
});

test('colour alias: output of a PO under a colour id NO PO of the order carries is the PO\'s own (live case 26H1LEV596)', () => {
    // PO 1000652836 (po_id 70296, 526 pcs) is colour 23203 "0057W-0014"; the
    // sewing output — 552 pcs — is booked under 23904, a second master entry
    // of the same colour; the order (43137) has this one PO
    const master = new Map([[70296, po(23203, 43137)]]);
    const out = [{ po_id : 70296, clr_id : 23904, prod_unit_id : 1, order_id : 43137, qty : 552, days : 2, last_date : '2026-10-17' }];
    const r = reconcileSewingOutput([{ id : 5386, erp_po_id : '70296', order_quantity : 526, prod_unit : 1, shipment_date : '2026-11-05' }], master, new Map(), out);
    assert.deepEqual(r.get(5386), { sewn : 526, remaining : 0, issue : null, days : 2, last : '2026-10-17' });
    // own colour + alias add up; the colour of ANOTHER PO of the order stays an issue
    const r2 = reconcileSewingOutput(
        [{ id : 1, erp_po_id : '10', order_quantity : 1000 }, { id : 2, erp_po_id : '12', order_quantity : 300 }],
        new Map([[10, po(5)], [12, po(8)]]), new Map(),
        [{ po_id : 10, clr_id : 5, prod_unit_id : 1, order_id : 900, qty : 200 }, { po_id : 10, clr_id : 77, prod_unit_id : 1, order_id : 900, qty : 150 },
         { po_id : 10, clr_id : 8, prod_unit_id : 1, order_id : 900, qty : 90 }]);
    assert.equal(r2.get(1).sewn, 350);
    assert.match(r2.get(1).issue, /90 pcs .* another colour/);
    assert.equal(r2.get(2).sewn, 0);                          // booked under PO 10: never moved to PO 12
    // an alias of another ORDER's booking is still another order
    const r3 = reconcileSewingOutput([{ id : 1, erp_po_id : '10', order_quantity : 1000 }], new Map([[10, po(5)]]), new Map(),
        [{ po_id : 10, clr_id : 77, prod_unit_id : 1, order_id : 555, qty : 60 }]);
    assert.equal(r3.get(1).sewn, 0);
    assert.match(r3.get(1).issue, /60 pcs .* another order/);
    // an OS colour row keeps the exact colour match
    const r4 = reconcileSewingOutput([{ id : 9, erp_po_id : 'os-c-4', order_quantity : 500, prod_unit : 3 }],
        new Map([[10, po(5)]]), new Map([[4, { po_id : 10, clr_id : 5 }]]),
        [{ po_id : 10, clr_id : 77, prod_unit_id : 3, order_id : 900, qty : 120 }]);
    assert.equal(r4.get(9).sewn, 0);
    assert.match(r4.get(9).issue, /120 pcs .* another colour/);
});

test('a projection row has no PO: nothing deducted, no issue', () => {
    const r = reconcileSewingOutput([{ id : 5, erp_po_id : 'proj-1', order_quantity : 9000 }], new Map(), new Map(), []);
    assert.deepEqual(r.get(5), { sewn : 0, remaining : 9000, issue : null });
});

test('the live case 26H1LEV743: colour 00AF9-0018 — 2,190 pcs booked on five POs, 52 of them beyond their POs, land on the short PO', () => {
    const rows = [
        { id : 3661047, erp_po_id : '76484', order_quantity : 210,  prod_unit : 1, shipment_date : '2026-11-25' },
        { id : 3661247, erp_po_id : '76485', order_quantity : 800,  prod_unit : 1, shipment_date : '2026-11-25' },
        { id : 3661246, erp_po_id : '76487', order_quantity : 1130, prod_unit : 1, shipment_date : '2026-11-25' },
        { id : 3661248, erp_po_id : '76488', order_quantity : 200,  prod_unit : 1, shipment_date : '2026-11-25' },
        { id : 3662246, erp_po_id : '76483', order_quantity : 381,  prod_unit : 1, shipment_date : '2026-11-25' },
        { id : 3675062, erp_po_id : '76491', order_quantity : 200,  prod_unit : 1, shipment_date : '2026-11-25' }];
    const master = new Map([76484, 76485, 76487, 76488, 76483, 76491].map(p => [p, po(23184, 45493)]));
    const out = [[76484, 222], [76485, 826], [76487, 908], [76488, 20], [76491, 214]]
        .map(([p, qty]) => ({ po_id : p, clr_id : 23184, prod_unit_id : 1, order_id : 45493, qty }));
    const r = reconcileSewingOutput(rows, master, new Map(), out);
    const sewn = id => r.get(id).sewn;
    assert.deepEqual([sewn(3661047), sewn(3661247), sewn(3661248), sewn(3675062)], [210, 800, 20, 200]);
    assert.equal(sewn(3661246), 908 + 12 + 26 + 14);     // the three POs' excess
    assert.equal(sewn(3662246), 0);
    assert.equal(rows.reduce((t, x) => t + sewn(x.id), 0), 2190);
    assert.equal(rows.reduce((t, x) => t + r.get(x.id).remaining, 0), 2921 - 2190);   // the colour's true balance
});
