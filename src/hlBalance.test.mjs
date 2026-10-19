import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newScenario, newLine, buildLoad, conflicts, reconcile, lineDayMinutes, isOver, usedMinutes, reservationDays } from './hlEngine.js';
import { autoBalance, allocationReport, reconcileAllocation, mergeErpOrders, buildCapIndex, planQty, autoPlanUnits, lcDaysFor, inputDateFor, DEFAULT_PLAN_RULES } from './hlBalance.js';

// three internal units with a few lines each; AQL cannot make Denim Pants
function scenario() {
    const sc = newScenario('T', 'tester');
    sc.id = 'sc_test';
    sc.from = '2026-11-01'; sc.to = '2026-12-31';
    sc.lines = [];
    sc.products = [{ name : 'Denim Pants', smv : 20 }, { name : 'Shirt', smv : 18 }, { name : 'Shorts', smv : 16 }];
    sc.lines.push(newLine(sc, 'M', 'M1', { manpower : 45, eff : 60, id : 'M1' }));   // 810 denim / day
    sc.lines.push(newLine(sc, 'M', 'M2', { manpower : 45, eff : 60, id : 'M2' }));
    sc.lines.push(newLine(sc, 'C', 'C1', { manpower : 30, eff : 50, id : 'C1' }));   // 450 denim / day
    sc.lines.push(newLine(sc, 'A', 'A1', { manpower : 30, eff : 50, id : 'A1' }));
    delete sc.lines[3].products['Denim Pants'];
    return sc;
}
const order = (id, unit, product, qty, delivery, extra = {}) => ({ id, buyer : 'B', style : id, product, qty, outstanding : qty, smv : null, pcd : '2026-11-01', delivery, unitCode : unit, note : id, ...extra });
const apply = (sc, res) => { const rm = new Set(res.removedIds); sc.reservations = sc.reservations.filter(r => !rm.has(r.id)).concat(res.reservations); };

test('contract unit first: an order that fits stays in its unit, nothing goes to GSL', () => {
    const sc = scenario();
    sc.orders.push(order('o1', 'M', 'Denim Pants', 5000, '2026-11-30'));
    const r = autoBalance(sc);
    assert.equal(r.results[0].contract, 5000);
    assert.equal(r.results[0].gsl, 0);
    assert.equal(r.reservations.every(x => sc.lines.find(l => l.id === x.lineId).unitCode === 'M'), true);
    assert.equal(r.reservations.every(x => x.kind === 'contract' && x.status === 'proposed'), true);
});

test('excess goes to the other compatible units in priority order, the rest to GSL — quantities reconcile', () => {
    const sc = scenario();
    sc.orders.push(order('o1', 'M', 'Denim Pants', 100000, '2026-11-20'));
    const r = autoBalance(sc);
    const x = r.results[0];
    assert.equal(x.contract > 0, true);
    assert.equal(x.transfers.length, 1);                 // CEIL takes some, AQL cannot make denim
    assert.equal(x.transfers[0].unit, 'C');
    assert.equal(x.gsl > 0, true);
    assert.equal(x.contract + x.transfers[0].qty + x.gsl + x.unallocated, 100000);
    assert.equal(x.unallocated, 0);
    const g = r.reservations.find(a => a.kind === 'gsl');
    assert.equal(g.extStatus, 'pending');
    assert.equal(sc.lines.find(l => l.id === g.lineId).pool, true);
    apply(sc, r);
    assert.equal(conflicts(sc, buildLoad(sc)).length, 0);              // internal units never above capacity
    const rep = allocationReport(sc);
    assert.equal(reconcileAllocation(rep).length, 0);
    assert.equal(rep.totals.internal + rep.totals.transfer + rep.totals.gsl + rep.totals.unallocated, 100000);
});

test('product-incompatible units are never selected, GSL keeps the product and garment', () => {
    const sc = scenario();
    sc.orders.push(order('o1', 'A', 'Denim Pants', 3000, '2026-11-30', { garment : '5 pocket' }));   // AQL contract, cannot make it
    const r = autoBalance(sc, { allowTransfer : false });
    assert.equal(r.results[0].contract, 0);
    assert.equal(r.results[0].gsl, 3000);
    const g = r.reservations[0];
    assert.equal(g.product, 'Denim Pants');
    assert.equal(g.fromUnit, 'A');
    assert.equal(r.results[0].garment, '5 pocket');
});

test('transfers only to allowed units; no GSL when disabled → unallocated is reported, never lost', () => {
    const sc = scenario();
    sc.orders.push(order('o1', 'M', 'Denim Pants', 100000, '2026-11-20'));
    const r = autoBalance(sc, { transfers : { M : ['A'] }, allowGsl : false });
    const x = r.results[0];
    assert.equal(x.transfers.length, 0);                 // A cannot make it, C not allowed
    assert.equal(x.gsl, 0);
    assert.equal(x.unallocated, 100000 - x.contract);
    assert.equal(x.risk, true);
});

test('locked reservations are preserved and deducted; re-running never duplicates', () => {
    const sc = scenario();
    sc.orders.push(order('o1', 'M', 'Denim Pants', 2000, '2026-11-30'));
    sc.orders.push(order('o2', 'C', 'Shirt', 1000, '2026-11-30'));
    const first = autoBalance(sc);
    apply(sc, first);
    const n = sc.reservations.length;
    sc.reservations[0].locked = true;
    const lockedId = sc.reservations[0].id;
    const second = autoBalance(sc);
    apply(sc, second);
    assert.equal(sc.reservations.some(r => r.id === lockedId && r.locked), true);
    assert.equal(sc.reservations.length, n);                                  // same count: replaced, not duplicated
    const rep = allocationReport(sc);
    assert.equal(rep.totals.qty, 3000);
    assert.equal(rep.totals.internal, 3000);
    assert.equal(reconcileAllocation(rep).length, 0);
});

test('holidays and the delivery deadline are respected; sewing never starts before PCD', () => {
    const sc = scenario();
    sc.holidays.push({ date : '2026-11-02', unitCode : null, label : 'Eid', kind : 'holiday' });
    sc.orders.push(order('o1', 'M', 'Shirt', 500, '2026-11-10', { pcd : '2026-11-03' }));
    const r = autoBalance(sc);
    const a = r.reservations[0];
    assert.equal(a.start >= '2026-11-03', true);
    assert.equal(a.end <= '2026-11-10', true);
    apply(sc, r);
    assert.equal(reservationDays(sc, a).days.some(d => d.date === '2026-11-02'), false);
});

test('proposals never overload a day even when boundary days are shared', () => {
    const sc = scenario();
    for (let i = 0; i < 12; i++) sc.orders.push(order(`o${i}`, 'M', i % 2 ? 'Shirt' : 'Denim Pants', 1234 + i * 77, '2026-12-31'));
    const r = autoBalance(sc);
    apply(sc, r);
    const load = buildLoad(sc);
    assert.equal(conflicts(sc, load).length, 0);
    for (const l of sc.lines) for (let d = '2026-11-01'; d <= '2026-12-31'; d = new Date(new Date(d).getTime() + 86400000).toISOString().slice(0, 10)) {
        assert.equal(isOver(usedMinutes(load, l.id, d), lineDayMinutes(sc, l, d)), false, `${l.id} ${d}`);
    }
    assert.equal(reconcile(sc).length, 0);
});

test('delivery-month demand and production-month loading are separate; summaries reconcile with the orders', () => {
    const sc = scenario();
    sc.orders.push(order('o1', 'M', 'Denim Pants', 20000, '2026-12-05'));     // delivers in December, sews in November
    const r = autoBalance(sc);
    apply(sc, r);
    const rep = allocationReport(sc, { capIndex : buildCapIndex(sc, sc.from, sc.to) });
    const dec = rep.unitMonths.find(m => m.unit === 'M' && m.ym === '2026-12');
    assert.equal(dec.originalQty, 20000);
    assert.equal(dec.internalQty + dec.outQty + dec.gslQty + dec.unallocated, 20000);
    const nov = rep.production.find(p => p.unit === 'M' && p.ym === '2026-11');
    assert.equal(nov.pcs > 0, true);
    assert.equal(rep.production.filter(p => p.unit === 'M').reduce((a, p) => a + p.pcs, 0), dec.internalQty);
    assert.equal(rep.products.find(p => p.product === 'Denim Pants' && p.unit === 'M').proposedQty, dec.internalQty);
});

test('ERP orders merge once per order code and plan the outstanding quantity', () => {
    const sc = scenario();
    const rows = [{ code : '26ORD1', buyer : 'LEVIS', style : 'S1', product : 'Denim Pants', garment : '5 pocket', qty : 10000, outstanding : 6000, smv : 21.5, pcd : '2026-11-01', delivery : '2026-12-01', unitId : 1, priority : 'Y' }];
    let m = mergeErpOrders(sc, rows);
    assert.equal(m.added, 1);
    m = mergeErpOrders(sc, rows);
    assert.equal(m.added, 0); assert.equal(m.updated, 1);
    assert.equal(sc.orders.length, 1);
    assert.equal(sc.orders[0].unitCode, 'M');
    assert.equal(planQty(sc.orders[0], { useOutstanding : true }), 6000);
    assert.equal(planQty(sc.orders[0], { useOutstanding : false }), 10000);
    const r = autoBalance(sc);
    assert.equal(r.results[0].qty, 6000);
    assert.equal(r.reservations[0].smv, 21.5);
});

test('the GSL pool is one row, accepts any quantity and consumes no internal capacity', () => {
    const sc = scenario();
    sc.orders.push(order('o1', 'C', 'Shorts', 5000000, '2026-11-05'));
    const r = autoBalance(sc);
    apply(sc, r);
    assert.equal(sc.lines.filter(l => l.pool).length, 1);
    const g = r.results[0].gsl;
    assert.equal(g > 4000000, true);
    const rep = allocationReport(sc);
    assert.equal(rep.totals.gsl, g);
    assert.equal(conflicts(sc, buildLoad(sc)).length, 0);
    assert.equal(lineDayMinutes(sc, sc.lines.find(l => l.pool), '2026-11-03'), 0);
});

test("GSL's own contract orders go straight to the pool as contract allocations, pending confirmation", () => {
    const sc = scenario();
    sc.orders.push(order('g1', 'G', 'Shirt', 4000, '2026-12-10'));
    const r = autoBalance(sc);
    assert.equal(r.results[0].contract, 4000);
    assert.equal(r.results[0].gsl, 0);
    assert.equal(r.reservations[0].kind, 'contract');
    assert.equal(r.reservations[0].extStatus, 'pending');
    apply(sc, r);
    const rep = allocationReport(sc);
    assert.equal(rep.totals.internal, 4000);
    assert.equal(rep.totals.unallocated, 0);
});

test('unit-wise auto plan: input date = PCD + 7 (new) / + 3 (repeat), learning curve by SMV, none for repeats', () => {
    const sc = scenario();
    const rules = DEFAULT_PLAN_RULES;
    const fresh = order('n1', 'M', 'Denim Pants', 2000, '2026-12-20', { pcd : '2026-11-01', smv : 25 });
    const rep = order('r1', 'M', 'Shirt', 2000, '2026-12-20', { pcd : '2026-11-01', smv : 25, repeat : true });
    const gstar = order('g1', 'M', 'Shirt', 2000, '2026-12-20', { pcd : '2026-11-01', smv : 25, buyer : 'G-STAR' });
    const heavy = order('h1', 'C', 'Shorts', 2000, '2026-12-20', { pcd : '2026-11-01', smv : 55 });
    assert.equal(inputDateFor(fresh, rules), '2026-11-08');
    assert.equal(inputDateFor(rep, rules), '2026-11-04');
    assert.equal(lcDaysFor(sc, fresh, rules), 3);
    assert.equal(lcDaysFor(sc, rep, rules), 0);
    assert.equal(lcDaysFor(sc, gstar, rules), 4);
    assert.equal(lcDaysFor(sc, heavy, rules), 5);
    sc.orders.push(fresh, rep, gstar, heavy);
    const out = autoPlanUnits(sc);
    const byId = Object.fromEntries(out.results.map(r => [r.orderId, r]));
    assert.equal(byId.n1.status, 'ontime');
    assert.equal(byId.n1.start >= '2026-11-08', true);                    // never before the input date
    assert.equal(byId.r1.lcDays, 0);
    assert.equal(out.reservations.find(r => r.orderId === 'n1').lcDays, 3);
    assert.equal(out.reservations.every(r => r.source === 'autoplan' && r.planStatus), true);
    apply(sc, out);
    assert.equal(conflicts(sc, buildLoad(sc)).length, 0);
    assert.equal(reconcile(sc).length, 0);
});

test('unit-wise auto plan status: orange when delivery needs a start before the input date, red when delivery is missed', () => {
    const sc = scenario();
    // tight: 6000 pcs on one C line (450/day) delivering 2026-11-18 with PCD 2026-11-01 → from the input date 11-04 only 13 working days (5,850) fit, from PCD it fits → orange
    sc.orders.push(order('t1', 'C', 'Denim Pants', 6000, '2026-11-18', { pcd : '2026-11-01', smv : 20, repeat : true }));
    // impossible: 100000 pcs by 2026-11-25 → red, but still placed so the overrun is visible
    sc.orders.push(order('x1', 'M', 'Shirt', 100000, '2026-11-25', { pcd : '2026-11-01', smv : 18, repeat : true }));
    const out = autoPlanUnits(sc);
    const byId = Object.fromEntries(out.results.map(r => [r.orderId, r]));
    assert.equal(byId.t1.status, 'pcd');
    assert.equal(byId.t1.start < byId.t1.inputDate, true);
    assert.equal(byId.x1.status, 'late');
    assert.equal(byId.x1.placed > 0, true);
    assert.equal(byId.x1.finish > '2026-11-25', true);
    assert.equal(out.summary.late, 1);
    assert.equal(byId.x1.lateDays > 0, true);
    assert.equal(byId.x1.critical.some(c => /after delivery/.test(c)), true);
    assert.equal(out.summary.critical, 1);
});

test('day capacity rule: a small order takes one day at line capacity, never ten days of crumbs on a busy line', () => {
    const sc = scenario();
    // M1 and M2 92 % busy on each of November's 26 working days with a live bar each (810 denim / day → 65 free)
    for (const l of ['M1', 'M2']) sc.reservations.push({ id : `live_${l}`, orderId : null, lineId : l, product : 'Denim Pants', smv : 20, start : '2026-11-01', end : '2026-11-30', qty : 745 * 26, locked : true, status : 'reserved', source : 'live', kind : 'live' });
    sc.orders.push(order('s1', 'M', 'Denim Pants', 300, '2026-12-20', { pcd : '2026-10-20', smv : 20, repeat : true }));
    const out = autoPlanUnits(sc);
    const s1 = out.results[0];
    assert.equal(s1.status, 'ontime');
    assert.equal(s1.placed, 300);
    assert.equal(s1.barDays, 1);                                   // one bar day, not five 65-piece days
    assert.equal(s1.start >= '2026-12-01', true);                  // waits for a day it can really run on
    assert.equal(s1.stretched, false);
    assert.equal(s1.critical.length, 0);
    // the old crumb floor (5 %) spreads the same order over the busy days
    const old = autoPlanUnits(sc, { rules : { minFill : 0.05 } });
    assert.equal(old.results[0].barDays > 1, true);
    assert.equal(old.results[0].stretched, true);
    // a full-size order on a free line runs at full capacity: bar days = days needed
    const sc2 = scenario();
    sc2.orders.push(order('b1', 'M', 'Denim Pants', 8100, '2026-12-31', { pcd : '2026-10-20', smv : 20, repeat : true }));
    const o2 = autoPlanUnits(sc2).results[0];
    assert.equal(o2.barDays, o2.needDays);
    assert.equal(Math.round(o2.fill * 100), 100);
    apply(sc2, autoPlanUnits(sc2));
    assert.equal(conflicts(sc2, buildLoad(sc2)).length, 0);
});
