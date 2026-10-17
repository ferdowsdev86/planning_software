import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    newScenario, newLine, lineDayMinutes, lineDayPieces, isWorkDay, buildLoad, usedMinutes,
    planOrder, autoPlan, conflicts, reconcile, unitDayStatus, unitSummary, addDays
} from './hlEngine.js';

function scenario() {
    const sc = newScenario('T', 'tester');
    sc.from = '2026-11-01'; sc.to = '2026-12-31';
    sc.lines = [];
    sc.products = [{ name : 'Denim Pants', smv : 20 }, { name : 'Shirt', smv : 18 }];
    sc.lines.push(newLine(sc, 'M', 'Line 01', { manpower : 45, eff : 60, id : 'L1' }));
    sc.lines.push(newLine(sc, 'M', 'Line 02', { manpower : 45, eff : 60, id : 'L2' }));
    sc.lines.push(newLine(sc, 'C', 'Line 01', { manpower : 30, eff : 50, id : 'C1' }));
    return sc;
}

test('capacity formula: 45 mp × 600 min × 60% / SMV 20 = 810 pcs', () => {
    const sc = scenario();
    const l = sc.lines[0];
    assert.equal(lineDayMinutes(sc, l, '2026-11-02'), 45 * 600 * 0.6);     // Monday
    assert.equal(Math.round(lineDayPieces(sc, l, 'Denim Pants', '2026-11-02')), 810);
});

test('holidays, weekly off days and inactive lines give zero capacity', () => {
    const sc = scenario();
    const l = sc.lines[0];
    assert.equal(isWorkDay(sc, 'M', '2026-11-06'), false);                  // Friday off
    assert.equal(lineDayMinutes(sc, l, '2026-11-06'), 0);
    sc.holidays.push({ date : '2026-11-02', unitCode : null, label : 'Eid', kind : 'holiday' });
    assert.equal(lineDayMinutes(sc, l, '2026-11-02'), 0);
    sc.holidays.push({ date : '2026-11-03', unitCode : 'C', label : 'C only', kind : 'holiday' });
    assert.equal(lineDayMinutes(sc, l, '2026-11-03') > 0, true);              // M unaffected
    assert.equal(lineDayMinutes(sc, sc.lines[2], '2026-11-03'), 0);
    l.active = false;
    assert.equal(lineDayMinutes(sc, l, '2026-11-04'), 0);
});

test('a product the line cannot make is never planned on it', () => {
    const sc = scenario();
    delete sc.lines[0].products.Shirt;          // Line 01 cannot sew shirts
    sc.orders.push({ id : 'o1', buyer : 'B', style : 'S', product : 'Shirt', qty : 1000, pcd : '2026-11-01', delivery : '2026-11-30', unitCode : 'M' });
    const r = planOrder(sc, sc.orders[0]);
    assert.equal(r.allocations.every(a => a.lineId !== 'L1'), true);
    assert.equal(r.feasible, 1000);
});

test('an order that fits is planned fully, one that does not shows the shortage and the alternatives', () => {
    const sc = scenario();
    sc.orders.push({ id : 'o1', buyer : 'LEVIS', style : 'X', product : 'Denim Pants', qty : 5000, pcd : '2026-11-01', delivery : '2026-11-30', unitCode : 'M' });
    const ok = planOrder(sc, sc.orders[0]);
    assert.equal(ok.feasible, 5000);
    assert.equal(ok.shortage, 0);
    assert.equal(ok.allocations.reduce((a, x) => a + x.qty, 0), 5000);
    sc.orders.push({ id : 'o2', buyer : 'LEVIS', style : 'Y', product : 'Denim Pants', qty : 100000, pcd : '2026-11-01', delivery : '2026-11-30', unitCode : 'M' });
    const big = planOrder(sc, sc.orders[1]);
    assert.equal(big.feasible < 100000, true);
    assert.equal(big.shortage, 100000 - big.feasible);
    assert.equal(typeof big.alternatives.C.feasible, 'number');
    assert.equal(big.completion <= '2026-11-30', true);
});

test('reservations consume capacity, overbooking is a conflict, pieces reconcile', () => {
    const sc = scenario();
    sc.orders.push({ id : 'o1', buyer : 'B', style : 'S', product : 'Denim Pants', qty : 810, pcd : '2026-11-01', delivery : '2026-11-30', unitCode : 'M' });
    sc.reservations.push({ id : 'r1', orderId : 'o1', lineId : 'L1', product : 'Denim Pants', start : '2026-11-02', end : '2026-11-02', qty : 810, status : 'reserved' });
    let load = buildLoad(sc);
    assert.equal(Math.round(usedMinutes(load, 'L1', '2026-11-02')), 16200);     // the whole day
    assert.equal(conflicts(sc, load).length, 0);
    assert.equal(unitDayStatus(sc, 'M', '2026-11-02', load), 'partial');       // one of two lines full
    sc.reservations.push({ id : 'r2', orderId : 'o1', lineId : 'L1', product : 'Denim Pants', start : '2026-11-02', end : '2026-11-02', qty : 100, status : 'reserved' });
    load = buildLoad(sc);
    assert.equal(conflicts(sc, load).length, 1);
    assert.equal(reconcile(sc).length, 0);
    // the next order on that line starts after the booked day
    sc.orders.push({ id : 'o2', buyer : 'B', style : 'T', product : 'Denim Pants', qty : 500, pcd : '2026-11-01', delivery : '2026-11-30', unitCode : 'M' });
    const r = planOrder(sc, sc.orders[1], { load });
    assert.equal(r.feasible, 500);
});

test('auto planning plans every open order earliest delivery first, in its unit', () => {
    const sc = scenario();
    sc.orders.push({ id : 'o1', buyer : 'A', style : '1', product : 'Denim Pants', qty : 3000, pcd : '2026-11-01', delivery : '2026-12-15', unitCode : 'M' });
    sc.orders.push({ id : 'o2', buyer : 'B', style : '2', product : 'Shirt', qty : 2000, pcd : '2026-11-01', delivery : '2026-11-20', unitCode : 'C' });
    const res = autoPlan(sc);
    assert.equal(res[0].order.id, 'o2');                                      // earlier delivery first
    assert.equal(res.every(r => r.allocations.every(a => sc.lines.find(l => l.id === a.lineId).unitCode === r.order.unitCode)), true);
    assert.equal(res.reduce((a, r) => a + r.feasible, 0), 5000);
    const s = unitSummary(sc, 'M', sc.from, addDays(sc.from, 30), buildLoad(sc));
    assert.equal(s.activeLines, 2);
    assert.equal(s.products['Denim Pants'].pcsPerDay, 1620);
});
