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

test('free windows: a gap before the line\'s far-future bar takes the order (freeFrom alone hid it)', () => {
    const gappy = [{
        id : 'l1', name : 'Line 01', manpower : 50, eff : 60, hours : 10,
        freeFrom : day('2027-01-10'),   // after the line's LAST bar
        windows  : [
            { from : day('2026-11-12'), to : day('2026-12-20') },   // 5+ free weeks before that bar
            { from : day('2027-01-10'), to : null }
        ]
    }];
    const { placements } = autoPlanOrders([order], gappy, { ...ctxBase });
    assert.equal(placements.length, 1);
    assert.ok(placements[0].start < day('2026-12-01'), `start ${ymd(placements[0].start)} should sit in the gap, not after 10/01`);
});

test('free windows: a run too long for the gap goes after the last bar instead', () => {
    const gappy = [{
        id : 'l1', name : 'Line 01', manpower : 50, eff : 60, hours : 10,
        freeFrom : day('2026-12-01'),
        windows  : [
            { from : day('2026-11-12'), to : day('2026-11-13') },   // one day — too small for ~5.6 days
            { from : day('2026-12-01'), to : null }
        ]
    }];
    const { placements } = autoPlanOrders([{ ...order, qty : 10000 }], gappy, { ...ctxBase });
    assert.equal(placements.length, 1);
    assert.ok(placements[0].start >= day('2026-12-01'), `start ${ymd(placements[0].start)} should be after the last bar`);
});

// Pieces of one order (planner's rule 2026-11-16): the first line is filled
// to its maximum — the next piece goes flush after the order's own piece on
// that line, even though other lines are free right now
test('pieces of one order: the second piece follows the first on the SAME line while that line finishes it in time', () => {
    const three = [
        { id : 'l1', name : 'Line 01', manpower : 50, eff : 60, hours : 10, freeFrom : day('2026-11-12') },
        { id : 'l2', name : 'Line 02', manpower : 50, eff : 60, hours : 10, freeFrom : day('2026-11-12') },
        { id : 'l3', name : 'Line 03', manpower : 50, eff : 60, hours : 10, freeFrom : day('2026-11-12') }
    ];
    const pieces = [
        { ...order, id : 'o1', po : 'P1', qty : 10000 },
        { ...order, id : 'o2', po : 'P2', qty : 10000 }
    ];
    const { placements } = autoPlanOrders(pieces, three, { ...ctxBase, strictDelivery : true });
    assert.equal(placements.length, 2);
    assert.equal(placements[0].line.id, placements[1].line.id, 'same line');
    assert.ok(+placements[1].start >= +placements[0].endDate, `second piece ${ymd(placements[1].start)} starts after the first ends ${ymd(placements[0].endDate)}`);
    assert.ok(placements[1].lateness <= 0, 'and still in time');
});

// …only a piece the first line cannot finish by the latest sewing end spills
// to another line — the line whose finish lies closest to the order's finish
// so far, so the pieces complete together
test('pieces of one order: a piece the first line cannot finish in time spills to the line that ends closest to the order', () => {
    const three = [
        { id : 'l1', name : 'Line 01', manpower : 50, eff : 60, hours : 10, freeFrom : day('2026-11-12') },
        { id : 'l2', name : 'Line 02', manpower : 50, eff : 60, hours : 10, freeFrom : day('2026-11-12') },   // free now: ends well before the order
        { id : 'l3', name : 'Line 03', manpower : 50, eff : 60, hours : 10, freeFrom : day('2026-11-16') }    // free later: ends with the order's first piece
    ];
    // 18,000 min/day a line: the 20,000-pc first piece runs 12/11 → ~23/11,
    // the 10,000-pc second piece ~5.6 working days
    const pieces = [
        { ...order, id : 'o1', po : 'P1', qty : 20000 },
        { ...order, id : 'o2', po : 'P2', qty : 10000 }
    ];
    // latest sewing end 26/11: serial on Line 01 would end ~29/11 (too late);
    // Line 02 (free now) ends ~17/11, Line 03 (free 16/11) ends ~21/11 — nearer the order's 23/11
    const { placements, unplaced } = autoPlanOrders(pieces, three, { ...ctxBase, strictDelivery : true, latestSewEndOf : () => day('2026-11-26') });
    assert.equal(unplaced.length, 0);
    assert.equal(placements.length, 2);
    assert.equal(placements[0].line.id, 'l1');
    assert.notEqual(placements[1].line.id, 'l1', 'the first line cannot finish the second piece by 26/11');
    assert.equal(placements[1].line.id, 'l3', 'Line 03 finishes nearest to the first piece (Line 02 would finish days earlier)');
    assert.ok(placements[1].lateness <= 0);
});

test('older rule on request (sameOrderSerial false): the second piece starts parallel to the first on another line', () => {
    const three = [
        { id : 'l1', name : 'Line 01', manpower : 50, eff : 60, hours : 10, freeFrom : day('2026-11-12') },
        { id : 'l2', name : 'Line 02', manpower : 50, eff : 60, hours : 10, freeFrom : day('2026-11-12') }
    ];
    const pieces = [{ ...order, id : 'o1', po : 'P1', qty : 10000 }, { ...order, id : 'o2', po : 'P2', qty : 10000 }];
    const { placements } = autoPlanOrders(pieces, three, { ...ctxBase, strictDelivery : true, sameOrderSerial : false });
    assert.equal(placements.length, 2);
    assert.equal(+placements[0].start, +placements[1].start, 'same start');
    assert.notEqual(placements[0].line.id, placements[1].line.id, 'parallel lines');
});
