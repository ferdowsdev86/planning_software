import test from 'node:test';
import assert from 'node:assert/strict';
import { planAutoV2, AP2_NO_SPACE } from './autoPlanV2.mjs';

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

test('split rule: 1,200 + 800 pcs/day lines take a 4,000-pc order as 2,400 + 1,600 and finish together after two working days', () => {
    const lines = [line('A', 1200), line('B', 800)];
    // target = exactly two working days after the start: no single line makes it (A alone needs 3⅓ days)
    const o = { id : 'o1', qty : 4000, product : 'Pant', floor : D('2026-12-01'), target : D('2026-12-02', 18) };
    const { placements, unplaced } = planAutoV2({ orders : [o], lines, model, opts });
    assert.equal(unplaced.length, 0);
    const p = placements[0];
    assert.equal(p.split, 2);
    assert.equal(p.late, false);
    const byLine = Object.fromEntries(p.pieces.map(x => [x.line.id, x]));
    assert.equal(byLine.A.qty, 2400);
    assert.equal(byLine.B.qty, 1600);
    assert.equal(+byLine.A.end, +byLine.B.end, 'both bars end at the same moment');
    assert.equal(ymd(byLine.A.end), '2026-12-02');
    assert.equal(byLine.A.end.getHours(), 18);
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
    const o = { id : 'o1', qty : 4000, product : 'Pant', floor : D('2026-12-01'), target : D('2026-12-03', 18) };
    const { placements } = planAutoV2({ orders : [o], lines : [A, B], model, opts });
    const p = placements[0];
    assert.equal(p.split, 2);
    const a = p.pieces.find(x => x.line.id === 'A'), b = p.pieces.find(x => x.line.id === 'B');
    assert.equal(a.qty + b.qty, 4000);
    assert.ok(a.qty > b.qty * 2, `A (${a.qty}) runs a day longer at a higher rate than B (${b.qty})`);
    assert.equal(+a.end, +b.end);
    assert.ok(p.finish <= o.target);
    assert.equal(ymd(b.start), '2026-12-02');
});

test('late plan: no single line or synchronized split by the target → the earliest completion after it, marked late', () => {
    const lines = [line('A', 500), line('B', 300)];
    const o = { id : 'o1', qty : 4000, product : 'Pant', floor : D('2026-12-01'), target : D('2026-12-02', 18) };
    const { placements, unplaced } = planAutoV2({ orders : [o], lines, model, opts });
    assert.equal(unplaced.length, 0);
    assert.equal(placements[0].late, true);
    assert.equal(placements[0].split, 2, 'the split finishes earlier than either line alone');
    assert.ok(placements[0].finish > o.target);
    const [x, y] = placements[0].pieces;
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
