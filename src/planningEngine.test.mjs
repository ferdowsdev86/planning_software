import test from 'node:test';
import assert from 'node:assert/strict';
import { autoPlanOrders } from './planningEngine.js';

const day = s => new Date(`${s}T00:00:00`);
const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;   // local date
const ctxBase = {
    isWorking : () => true,
    today : day('2026-11-12'),
    snapStart : d => new Date(d),
    efficiencyOf : () => 60,
    workMinPerDay : 600
};
const lines = () => [
    { id : 'l1', name : 'Line 01', manpower : 50, eff : 60, hours : 10, freeFrom : day('2026-11-12') },   // free now, not listed
    { id : 'l2', name : 'Line 02', manpower : 50, eff : 60, hours : 10, freeFrom : day('2026-11-20') }    // listed for Chino, busy till the 20th
];
const order = { id : 'o1', mbmOrder : 'X1', po : 'P1', buyer : 'B', qty : 1000, smv : 10, pcd : day('2026-10-01'), ship : day('2027-01-15'), productType : 'Pant', profileType : 'Chino' };
const listed = (lineId, product) => lineId === 'l2' && product === 'Chino';

test('profileFirst: the line listed for the product wins even when another line is free earlier', () => {
    const { placements } = autoPlanOrders([order], lines(), { ...ctxBase, lineHasProductType : listed, profileFirst : true });
    assert.equal(placements[0].line.id, 'l2');
});

test('without profileFirst the earliest free line takes the order (profile only breaks ties)', () => {
    const { placements } = autoPlanOrders([order], lines(), { ...ctxBase, lineHasProductType : listed, profileFirst : false });
    assert.equal(placements[0].line.id, 'l1');
});

test('profileFirst: when no line lists the product, the earliest free line takes it', () => {
    const { placements } = autoPlanOrders([{ ...order, profileType : 'Jacket' }], lines(), { ...ctxBase, lineHasProductType : listed, profileFirst : true });
    assert.equal(placements[0].line.id, 'l1');
});

test('earliest start before today: the bar starts at PCD + 5 working days in the past, not today', () => {
    const past = [{ id : 'l1', name : 'Line 01', manpower : 50, eff : 60, hours : 10, freeFrom : day('2026-09-01') }];
    const { placements } = autoPlanOrders([order], past, { ...ctxBase, today : day('2026-09-01') });
    const start = placements[0].start;
    assert.ok(start >= day('2026-10-01') && start <= day('2026-10-08'), `start ${ymd(start)} should be a few days after the PCD, not today`);
    assert.ok(start < day('2026-11-12'));
});

test('sewStartOf: PCD − 8 days rule replaces the forward pass', () => {
    const past = [{ id : 'l1', name : 'Line 01', manpower : 50, eff : 60, hours : 10, freeFrom : day('2026-09-01') }];
    const { placements } = autoPlanOrders([order], past, { ...ctxBase, today : day('2026-09-01'), sewStartOf : o => new Date(o.pcd.getTime() - 8 * 864e5) });
    assert.equal(ymd(placements[0].start), '2026-09-23');
});

test('strictDelivery: an order no line can finish before its delivery stays unplanned — never a late bar', () => {
    // 50 mp × 600 min × 60 % ÷ SMV 10 = 1,800 pcs/day → 90,000 pcs = 50 days; delivery in 20 days
    const tight = { ...order, qty : 90000, pcd : day('2026-11-01'), ship : day('2026-12-02') };
    const loose = autoPlanOrders([tight], lines(), { ...ctxBase, strictDelivery : false });
    assert.equal(loose.placements.length, 1);
    assert.ok(loose.placements[0].lateness > 0);
    const strict = autoPlanOrders([tight], lines(), { ...ctxBase, strictDelivery : true });
    assert.equal(strict.placements.length, 0);
    assert.equal(strict.unplaced.length, 1);
    assert.match(strict.unplaced[0].reason, /delivery/);
});

test('strictDelivery: a line that is free later but still meets the delivery is taken over a line that would be late', () => {
    const busyEarly = [
        { id : 'l1', name : 'Line 01', manpower : 10, eff : 60, hours : 10, freeFrom : day('2026-11-12') },   // slow line: 360 pcs/day
        { id : 'l2', name : 'Line 02', manpower : 50, eff : 60, hours : 10, freeFrom : day('2026-11-20') }
    ];
    const o = { ...order, qty : 9000, pcd : day('2026-11-01'), ship : day('2026-12-10') };
    const { placements, unplaced } = autoPlanOrders([o], busyEarly, { ...ctxBase, strictDelivery : true });
    assert.equal(unplaced.length, 0);
    assert.equal(placements[0].line.id, 'l2');
});
