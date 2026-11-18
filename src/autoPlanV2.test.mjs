import test from 'node:test';
import assert from 'node:assert/strict';
import { planAutoV2, AP2_NO_SPACE, changeDelta, scheduleMetrics } from './autoPlanV2.mjs';

// A small calendar / capacity model: every day works, a line's day runs from
// 08:00 for `hours` hours at a flat `perDay` pieces per working day.
const D = (s, h = 8, m = 0) => { const d = new Date(`${s}T00:00:00`); d.setHours(h, m, 0, 0); return d; };
const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dayStart = (d, line) => { const x = new Date(d); x.setHours(8, 0, 0, 0); return x; };
const dayEnd   = (d, line) => { const x = new Date(d); x.setHours(8 + (line.hours || 10), 0, 0, 0); return x; };
const model = {
    listed : (line, o) => !!line.products?.includes(o.product),
    eff    : (line, o) => line.eff ?? 50,
    startOn : (line, date) => {
        const d = new Date(date);
        if (d < dayStart(d, line)) return dayStart(d, line);
        if (d >= dayEnd(d, line)) { const n = new Date(d); n.setDate(n.getDate() + 1); return dayStart(n, line); }
        return d;
    },
    finishOn : (line, o, start, qty) => {
        const perMin = line.perDay / ((line.hours || 10) * 60);
        let t = model.startOn(line, start), left = qty;
        for (let g = 0; g < 2000; g++) {
            const end = dayEnd(t, line);
            const mins = (end - t) / 60000;
            const can = mins * perMin;
            if (can >= left) return new Date(+t + Math.ceil(left / perMin) * 60000);
            left -= can;
            const n = new Date(t); n.setDate(n.getDate() + 1); t = dayStart(n, line);
        }
        return null;
    },
    piecesBy : (line, o, start, limit) => {
        const perMin = line.perDay / ((line.hours || 10) * 60);
        let t = model.startOn(line, start), made = 0;
        for (let g = 0; g < 2000 && t < limit; g++) {
            const end = new Date(Math.min(+dayEnd(t, line), +limit));
            if (end > t) made += ((end - t) / 60000) * perMin;
            const n = new Date(t); n.setDate(n.getDate() + 1); t = dayStart(n, line);
        }
        return Math.floor(made + 1e-9);
    }
};
const line = (id, perDay, extra = {}) => ({ id, name : id, perDay, hours : 10, eff : 60, products : ['Pant'], windows : [{ from : D('2026-12-01'), to : null }], ...extra });
const opts = { today : D('2026-12-01'), horizonEnd : D('2027-03-01', 18) };

test('split rule: 1,200 + 800 pcs/day lines take an 8,000-pc order as 4,800 + 3,200 and finish together after four working days', () => {
    const lines = [line('A', 1200), line('B', 800)];
    // target = exactly four working days after the start: no single line makes it (A alone needs 6⅔ days)
    const o = { id : 'o1', qty : 8000, product : 'Pant', floor : D('2026-12-01'), target : D('2026-12-04', 18) };
    const { placements, unplaced } = planAutoV2({ orders : [o], lines, model, opts });
    assert.equal(unplaced.length, 0);
    const p = placements[0];
    assert.equal(p.split, 2);
    assert.equal(p.late, false);
    const byLine = Object.fromEntries(p.pieces.map(x => [x.line.id, x]));
    assert.equal(byLine.A.qty, 4800);
    assert.equal(byLine.B.qty, 3200);
    assert.equal(+byLine.A.end, +byLine.B.end, 'both bars end at the same moment');
    assert.equal(ymd(byLine.A.end), '2026-12-04');
    assert.equal(byLine.A.end.getHours(), 18);
});

test('minimum piece 3,000: an order under 6,000 is never split — a late 4,000-pc order runs late on ONE line', () => {
    const lines = [line('A', 1200), line('B', 800)];
    const o = { id : 'o1', qty : 4000, product : 'Pant', floor : D('2026-12-01'), target : D('2026-12-02', 18) };
    const { placements, unplaced } = planAutoV2({ orders : [o], lines, model, opts });
    assert.equal(unplaced.length, 0);
    assert.equal(placements[0].split, 0);
    assert.equal(placements[0].late, true);
    assert.equal(placements[0].pieces[0].line.id, 'A');
});

test('minimum piece 3,000 on a slow line: a late 6,500-pc order splits 3,500 + 3,000 — the slow line is lifted to 3,000 and finishes within 2 days of the fast one', () => {
    const lines = [line('A', 1200), line('B', 800)];
    // A alone needs 5.4 days — late by the 5-day target; proportional shares would give B only 2,600
    const o = { id : 'o1', qty : 6500, product : 'Pant', floor : D('2026-12-01'), target : D('2026-12-05', 18) };
    const { placements, unplaced } = planAutoV2({ orders : [o], lines, model, opts });
    assert.equal(unplaced.length, 0);
    const p = placements[0];
    assert.equal(p.split, 2);
    assert.equal(p.late, false);
    const a = p.pieces.find(x => x.line.id === 'A'), b = p.pieces.find(x => x.line.id === 'B');
    assert.equal(b.qty, 3000, 'the slow line carries the minimum piece');
    assert.equal(a.qty, 3500);
    assert.ok(Math.abs(+b.end - +a.end) <= 2 * 24 * 3600 * 1000, 'the two pieces finish within 2 days of each other');
    assert.ok(p.finish <= o.target);
});

test('over 10,000 pcs: always several lines — even when one line would finish by the target; pieces ≥ 3,000, the fewest lines that meet the target', () => {
    const lines = [line('A', 1200), line('B', 1000), line('C', 900)];
    const o = { id : 'o1', qty : 12000, product : 'Pant', floor : D('2026-12-01'), target : D('2026-12-31', 18) };   // A alone: 10 days, on time
    const { placements } = planAutoV2({ orders : [o], lines, model, opts });
    const p = placements[0];
    assert.equal(p.split, 2, 'two lines suffice for the target: not one, not three');
    assert.equal(p.late, false);
    assert.ok(p.pieces.every(x => x.qty >= 3000));
    assert.equal(p.pieces.reduce((a, x) => a + x.qty, 0), 12000);
    assert.equal(+p.pieces[0].end, +p.pieces[1].end);
    // a tighter target needs the third line
    const o2 = { id : 'o2', qty : 12000, product : 'Pant', floor : D('2026-12-01'), target : D('2026-12-04', 18) };   // 2 best lines make 8,800 in 4 days
    const { placements : p2 } = planAutoV2({ orders : [o2], lines, model, opts });
    assert.equal(p2[0].split, 3);
    assert.equal(p2[0].late, false);
    assert.ok(p2[0].pieces.every(x => x.qty >= 3000));
});

test('over 10,000 pcs with a single listed line: that line, on time, rather than a late split', () => {
    const lines = [line('A', 1200)];
    const o = { id : 'o1', qty : 11000, product : 'Pant', floor : D('2026-12-01'), target : D('2026-12-31', 18) };
    const { placements } = planAutoV2({ orders : [o], lines, model, opts });
    assert.equal(placements[0].split, 0);
    assert.equal(placements[0].late, false);
});

test('single line first: when one line finishes by the target the order is NOT split, even though a split would be faster', () => {
    const lines = [line('A', 1200), line('B', 800)];
    const o = { id : 'o1', qty : 4000, product : 'Pant', floor : D('2026-12-01'), target : D('2026-12-10', 18) };
    const { placements } = planAutoV2({ orders : [o], lines, model, opts });
    assert.equal(placements[0].split, 0);
    assert.equal(placements[0].pieces[0].line.id, 'A');
});

test('ranking: product match first, then earliest feasible start, then higher product efficiency', () => {
    const notListed = line('X', 1200, { products : [], windows : [{ from : D('2026-12-01'), to : null }] });
    const laterListed = line('L', 1200, { windows : [{ from : D('2026-12-03'), to : null }], eff : 80 });
    const earlyListedLowEff = line('E', 1200, { eff : 55 });
    const earlyListedHighEff = line('H', 1200, { eff : 70 });
    const o = { id : 'o1', qty : 1000, product : 'Pant', floor : D('2026-12-01'), target : D('2026-12-20', 18) };
    const { placements } = planAutoV2({ orders : [o], lines : [notListed, laterListed, earlyListedLowEff, earlyListedHighEff], model, opts });
    assert.equal(placements[0].pieces[0].line.id, 'H', 'listed + earliest start + highest efficiency');
    // only the unlisted line is free in time: the listed one still wins while it finishes by the target
    const o2 = { id : 'o2', qty : 1000, product : 'Pant', floor : D('2026-12-01'), target : D('2026-12-20', 18) };
    const { placements : p2 } = planAutoV2({ orders : [o2], lines : [notListed, laterListed], model, opts });
    assert.equal(p2[0].pieces[0].line.id, 'L', 'product match outranks a free unlisted line');
});

test('PCD + 8 is a hard floor: a line free earlier is used only from the floor on', () => {
    const lines = [line('A', 1200)];
    const o = { id : 'o1', qty : 1000, product : 'Pant', floor : D('2026-12-05'), target : D('2026-12-20', 18) };
    const { placements } = planAutoV2({ orders : [o], lines, model, opts });
    assert.equal(ymd(placements[0].pieces[0].start), '2026-12-05');
});

test('split with unequal starts and different calendars: the later / shorter line gets fewer pieces, both end together', () => {
    const A = line('A', 1200);                                                                 // free 01/12, 10 h days
    const B = line('B', 800, { hours : 8, windows : [{ from : D('2026-12-02'), to : null }] }); // free 02/12, 8 h days
    const o = { id : 'o1', qty : 9000, product : 'Pant', floor : D('2026-12-01'), target : D('2026-12-06', 18) };
    const { placements } = planAutoV2({ orders : [o], lines : [A, B], model, opts });
    const p = placements[0];
    assert.equal(p.split, 2);
    const a = p.pieces.find(x => x.line.id === 'A'), b = p.pieces.find(x => x.line.id === 'B');
    assert.equal(a.qty + b.qty, 9000);
    assert.ok(a.qty > b.qty, `A (${a.qty}) runs a day longer at a higher rate than B (${b.qty})`);
    assert.equal(+a.end, +b.end);
    assert.ok(p.finish <= o.target);
    assert.equal(ymd(b.start), '2026-12-02');
});

test('late plan: no single line or synchronized split by the target → the earliest completion after it, marked late (split over several lines, pieces ≥ 3,000)', () => {
    const lines = [line('A', 500), line('B', 300)];
    const o = { id : 'o1', qty : 8000, product : 'Pant', floor : D('2026-12-01'), target : D('2026-12-02', 18) };
    const { placements, unplaced } = planAutoV2({ orders : [o], lines, model, opts });
    assert.equal(unplaced.length, 0);
    assert.equal(placements[0].late, true);
    assert.equal(placements[0].split, 2, 'the split finishes earlier than either line alone');
    assert.ok(placements[0].finish > o.target);
    const [x, y] = placements[0].pieces;
    assert.ok(x.qty >= 3000 && y.qty >= 3000);
    assert.equal(+x.end, +y.end);
});

test('Not Available Space: nothing inside the planning horizon → unplanned', () => {
    const lines = [line('A', 10)];
    const o = { id : 'o1', qty : 100000, product : 'Pant', floor : D('2026-12-01'), target : D('2026-12-20', 18) };
    const { placements, unplaced } = planAutoV2({ orders : [o], lines, model, opts });
    assert.equal(placements.length, 0);
    assert.equal(unplaced[0].reason, AP2_NO_SPACE);
});

test('a placed run consumes the line: the next order starts after it; a gap too short for the run is skipped for the next stretch', () => {
    const A = line('A', 1200, { windows : [{ from : D('2026-12-01'), to : D('2026-12-01', 12) }, { from : D('2026-12-03'), to : null }] });
    const o1 = { id : 'o1', qty : 2400, product : 'Pant', floor : D('2026-12-01'), target : D('2026-12-20', 18) };
    const o2 = { id : 'o2', qty : 1200, product : 'Pant', floor : D('2026-12-01'), target : D('2026-12-20', 18) };
    const { placements } = planAutoV2({ orders : [o1, o2], lines : [A], model, opts });
    assert.equal(ymd(placements[0].pieces[0].start), '2026-12-03', 'the 4-hour gap cannot take a 2-day run');
    assert.ok(+placements[1].pieces[0].start >= +placements[0].pieces[0].end, 'the second order follows the first');
});

test('holdLate: a late plan is reported with its suggested start but takes no line time (the caller parks it on the Holding Row)', () => {
    const lines = [line('A', 500)];
    const late  = { id : 'o1', qty : 4000, product : 'Pant', floor : D('2026-12-01'), target : D('2026-12-02', 18) };   // needs 8 days: late
    const next  = { id : 'o2', qty : 500,  product : 'Pant', floor : D('2026-12-01'), target : D('2026-12-20', 18) };
    const { placements } = planAutoV2({ orders : [late, next], lines, model, opts : { ...opts, holdLate : true } });
    const p1 = placements.find(p => p.order.id === 'o1'), p2 = placements.find(p => p.order.id === 'o2');
    assert.equal(p1.late, true);
    assert.equal(ymd(p1.floor), '2026-12-01', 'suggested start = PCD + 8');
    assert.equal(ymd(p2.pieces[0].start), '2026-12-01', 'the line is still free for the next order: the late one took no line time');
    assert.equal(p2.late, false);
});

// ---------------------------------------------------------------------------
// PRODUCT CONTINUITY (planner, 2026-11-18)
// ---------------------------------------------------------------------------
test('continuity: among on-time lines the one where the same product precedes the slot wins — within the allowed delay', () => {
    // A is free from 01/12 (last ran Shorts), B is free from 02/12 and last ran Chino
    const A = line('A', 1000, { products : ['Chino', 'Shorts'], windows : [{ from : D('2026-12-01'), to : null, prevProduct : 'Shorts' }] });
    const B = line('B', 1000, { products : ['Chino', 'Shorts'], windows : [{ from : D('2026-12-02'), to : null, prevProduct : 'Chino' }] });
    const o = { id : 'o1', qty : 2000, product : 'Chino', floor : D('2026-12-01'), target : D('2026-12-20', 18) };
    const { placements } = planAutoV2({ orders : [o], lines : [A, B], model, opts });
    assert.equal(placements[0].pieces[0].line.id, 'B', 'Chino continues on the Chino line one day later');
    // the same product slot four days later is beyond the 3-day delay: the earliest start wins
    const B2 = line('B', 1000, { products : ['Chino', 'Shorts'], windows : [{ from : D('2026-12-05'), to : null, prevProduct : 'Chino' }] });
    const { placements : p2 } = planAutoV2({ orders : [o], lines : [A, B2], model, opts });
    assert.equal(p2[0].pieces[0].line.id, 'A');
});

test('continuity never outranks an on-time completion: when only the other-product line finishes by the target, it is taken', () => {
    const A = line('A', 1200, { products : ['Chino', 'Shorts'], windows : [{ from : D('2026-12-01'), to : null, prevProduct : 'Shorts' }] });
    const B = line('B', 1200, { products : ['Chino', 'Shorts'], windows : [{ from : D('2026-12-03'), to : null, prevProduct : 'Chino' }] });
    const o = { id : 'o1', qty : 2400, product : 'Chino', floor : D('2026-12-01'), target : D('2026-12-03', 18) };   // 2 days: only A makes it
    const { placements } = planAutoV2({ orders : [o], lines : [A, B], model, opts });
    assert.equal(placements[0].pieces[0].line.id, 'A');
    assert.equal(placements[0].late, false);
});

test('an urgent order of another product goes before a matching product that can wait; a matching product not yet ready (PCD + 8 later) does not hold the slot', () => {
    const A = line('A', 1000, { products : ['Chino', 'Shorts'], windows : [{ from : D('2026-12-01'), to : null, prevProduct : 'Chino' }] });
    const chino  = { id : 'chino',  qty : 2000, product : 'Chino',  floor : D('2026-12-01'), target : D('2026-12-20', 18) };
    const shorts = { id : 'shorts', qty : 2000, product : 'Shorts', floor : D('2026-12-01'), target : D('2026-12-03', 18) };   // urgent
    const { placements } = planAutoV2({ orders : [chino, shorts], lines : [A], model, opts });
    const byId = Object.fromEntries(placements.map(p => [p.order.id, p]));
    assert.ok(+byId.shorts.pieces[0].start < +byId.chino.pieces[0].start, 'Shorts (target 03/12) runs first, Chino after it');
    assert.equal(byId.shorts.late, false);
    // not ready: a Chino whose earliest start is 05/12 cannot take the 01/12 slot — another product runs there
    const late = { id : 'chino2', qty : 1000, product : 'Chino', floor : D('2026-12-05'), target : D('2026-12-20', 18) };
    const other = { id : 'pant', qty : 1000, product : 'Shorts', floor : D('2026-12-01'), target : D('2026-12-20', 18) };
    const { placements : p2 } = planAutoV2({ orders : [late, other], lines : [line('A', 1000, { products : ['Chino', 'Shorts'], windows : [{ from : D('2026-12-01'), to : null, prevProduct : 'Chino' }] })], model, opts });
    const m = Object.fromEntries(p2.map(p => [p.order.id, p]));
    assert.equal(ymd(m.pant.pieces[0].start), '2026-12-01');
    assert.equal(ymd(m.chino2.pieces[0].start), '2026-12-05');
});

test('a locked bar anchors the sequence: the gap before it prefers its product, the gap after it continues it', () => {
    // line A: free 01/12–03/12 (before a locked Chino bar 04/12–06/12), then free from 07/12 after it
    const A = line('A', 1000, { products : ['Chino', 'Shorts'], windows : [
        { from : D('2026-12-01'), to : D('2026-12-04'), prevProduct : 'Shorts', nextProduct : 'Chino' },
        { from : D('2026-12-07'), to : null, prevProduct : 'Chino', nextProduct : null }] });
    const B = line('B', 1000, { products : ['Chino', 'Shorts'], windows : [{ from : D('2026-12-01'), to : null, prevProduct : 'Shorts' }] });
    const o = { id : 'o1', qty : 2000, product : 'Chino', floor : D('2026-12-01'), target : D('2026-12-20', 18) };
    const { placements } = planAutoV2({ orders : [o], lines : [A, B], model, opts });
    assert.equal(placements[0].pieces[0].line.id, 'A', 'the 2-day Chino run fills the gap before the locked Chino bar (no new change) instead of breaking B\'s Shorts sequence');
    assert.equal(ymd(placements[0].pieces[0].start), '2026-12-01');
});

test('improvement pass: an adjacent swap removes a product change when both orders still finish by their targets', () => {
    // one line, Shorts anchor before the window; orders by target: Chino (target earlier) then Shorts
    const A = line('A', 1000, { products : ['Chino', 'Shorts'], windows : [{ from : D('2026-12-01'), to : null, prevProduct : 'Shorts' }] });
    const chino  = { id : 'chino',  qty : 1000, product : 'Chino',  floor : D('2026-12-01'), target : D('2026-12-10', 18) };
    const shorts = { id : 'shorts', qty : 1000, product : 'Shorts', floor : D('2026-12-01'), target : D('2026-12-12', 18) };
    const { placements, improved } = planAutoV2({ orders : [chino, shorts], lines : [A], model, opts });
    const byId = Object.fromEntries(placements.map(p => [p.order.id, p]));
    assert.ok(+byId.shorts.pieces[0].start < +byId.chino.pieces[0].start, 'Shorts first (continues the anchor), Chino second');
    assert.equal(improved.swaps, 1);
    assert.equal(improved.changesAfter, 1);
    assert.ok(byId.chino.finish <= chino.target && byId.shorts.finish <= shorts.target);
    // no swap when it would make the first order late
    const chinoTight = { ...chino, target : D('2026-12-01', 18) };
    const { placements : p2, improved : i2 } = planAutoV2({ orders : [chinoTight, shorts], lines : [line('A', 1000, { products : ['Chino', 'Shorts'], windows : [{ from : D('2026-12-01'), to : null, prevProduct : 'Shorts' }] })], model, opts });
    assert.equal(i2.swaps, 0);
    assert.equal(ymd(p2.find(p => p.order.id === 'chino').pieces[0].start), '2026-12-01');
});

test('improvement pass: a move to a same-product gap on another line is bounded by the continuity delay — a gap 5 days later is left alone', () => {
    const A = line('A', 1000, { products : ['Chino', 'Shorts'], windows : [{ from : D('2026-12-01'), to : null, prevProduct : 'Shorts' }] });
    const B = line('B', 1000, { products : ['Chino', 'Shorts'], windows : [{ from : D('2026-12-06'), to : null, prevProduct : 'Chino' }] });
    const o = { id : 'o1', qty : 1000, product : 'Chino', floor : D('2026-12-01'), target : D('2026-12-20', 18) };
    const { placements, improved } = planAutoV2({ orders : [o], lines : [A, B], model, opts });
    assert.equal(improved.moves, 0);
    assert.equal(placements[0].pieces[0].line.id, 'A');
    assert.equal(ymd(placements[0].pieces[0].start), '2026-12-01');
});

test('changeDelta and scheduleMetrics: changes per line, on time / late, idle hours', () => {
    assert.equal(changeDelta('Chino', null, 'Chino'), 0);
    assert.equal(changeDelta('Chino', null, 'Shorts'), 1);
    assert.equal(changeDelta('Chino', 'Shorts', 'Chino'), 0, 'a change already existed between the neighbours');
    assert.equal(changeDelta('Chino', 'Chino', 'Shorts'), 2);
    const items = [
        { order : 'o1', line : 'A', start : D('2026-12-01'), end : D('2026-12-02', 18), product : 'Chino', target : D('2026-12-05', 18) },
        { order : 'o2', line : 'A', start : D('2026-12-04'), end : D('2026-12-05', 18), product : 'Shorts', target : D('2026-12-04', 18) },
        { order : 'o3', line : 'A', start : D('2026-12-06'), end : D('2026-12-06', 18), product : 'Shorts', target : null }
    ];
    const m = scheduleMetrics(items, { workMinutes : (a, b) => (b - a) / 60000 / 2 });   // half the calendar time is working time
    assert.equal(m.onTime, 2); assert.equal(m.late, 1); assert.equal(m.lateDays, 1);
    assert.equal(m.changesByLine.A, 1);
    assert.ok(m.idleHours > 0);
});
