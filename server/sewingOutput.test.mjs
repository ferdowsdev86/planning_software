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
        [{ id : 1, erp_po_id : '10', order_quantity : 10000 }, { id : 2, erp_po_id : '11', order_quantity : 500 }, { id : 3, erp_po_id : '12', order_quantity : 800 }],
        new Map([[10, po(5)], [11, po(5)], [12, po(5)]]), new Map(),
        [{ po_id : 10, clr_id : 5, prod_unit_id : 1, order_id : 900, qty : 3500 }, { po_id : 11, clr_id : 5, prod_unit_id : 1, order_id : 900, qty : 640 }]);
    assert.deepEqual(r.get(1), { sewn : 3500, remaining : 6500, issue : null });
    assert.deepEqual(r.get(2), { sewn : 500, remaining : 0, issue : null });      // over-sewn: never negative
    assert.deepEqual(r.get(3), { sewn : 0, remaining : 800, issue : null });      // nothing sewn yet
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
    assert.deepEqual(r.get(7), { sewn : 100, remaining : 314, issue : null });
});

test('several rows of one PO identity: the output is deducted ONCE, earliest delivery first', () => {
    // one PO + colour in two OS orders of the same unit (two os_order_color rows)
    const r = reconcileSewingOutput(
        [{ id : 21, erp_po_id : 'os-c-2', order_quantity : 600, prod_unit : 3, shipment_date : '2026-12-20' },
         { id : 20, erp_po_id : 'os-c-1', order_quantity : 400, prod_unit : 3, shipment_date : '2026-12-08' }],
        new Map([[50, po(9)]]), new Map([[1, { po_id : 50, clr_id : 9 }], [2, { po_id : 50, clr_id : 9 }]]),
        [{ po_id : 50, clr_id : 9, prod_unit_id : 3, order_id : 900, qty : 550 }]);
    assert.deepEqual(r.get(20), { sewn : 400, remaining : 0, issue : null });
    assert.deepEqual(r.get(21), { sewn : 150, remaining : 450, issue : null });
    assert.equal(r.get(20).sewn + r.get(21).sewn, 550);       // never 550 from each row
});

test('ambiguous: output under another colour / order, or a PO that is gone → reported', () => {
    const r = reconcileSewingOutput(
        [{ id : 1, erp_po_id : '10', order_quantity : 1000 }, { id : 2, erp_po_id : '99', order_quantity : 50 }, { id : 3, erp_po_id : '11', order_quantity : 700 }],
        new Map([[10, po(5)], [11, po(6, 901)]]), new Map(),
        [{ po_id : 10, clr_id : 5, prod_unit_id : 1, order_id : 900, qty : 200 }, { po_id : 10, clr_id : 8, prod_unit_id : 1, order_id : 900, qty : 90 },
         { po_id : 11, clr_id : 6, prod_unit_id : 1, order_id : 777, qty : 40 }]);
    assert.equal(r.get(1).sewn, 200);
    assert.match(r.get(1).issue, /90 pcs .* another colour/);
    assert.match(r.get(2).issue, /not in mr_purchase_order/);
    assert.match(r.get(3).issue, /40 pcs .* another order/);
});

test('a projection row has no PO: nothing deducted, no issue', () => {
    const r = reconcileSewingOutput([{ id : 5, erp_po_id : 'proj-1', order_quantity : 9000 }], new Map(), new Map(), []);
    assert.deepEqual(r.get(5), { sewn : 0, remaining : 9000, issue : null });
});
