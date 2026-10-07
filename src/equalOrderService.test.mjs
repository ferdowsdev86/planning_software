import { test } from 'node:test';
import assert from 'node:assert/strict';
import { balanceSplits } from './equalOrderService.mjs';

// capacity profile helper: same pieces every day from `from` for `days` days
// (Fridays off like the factory calendar)
function flat(from, days, perDay, skip = []) {
    const cap = {};
    const d = new Date(from + 'T00:00:00');
    const ymd = x => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
    for (let i = 0; i < days; i++) {
        const k = ymd(d);
        if (d.getDay() !== 5 && !skip.includes(k)) cap[k] = perDay;
        d.setDate(d.getDate() + 1);
    }
    return cap;
}
const sum = a => a.reduce((x, y) => x + y, 0);

test('two lines, different capacity: both end on the same day, total kept', () => {
    const caps = [flat('2026-10-12', 30, 1000), flat('2026-10-12', 30, 500)];
    const r = balanceSplits(caps, 7500);
    assert.equal(r.error, undefined);
    assert.equal(sum(r.alloc), 7500);
    // 1500/day together → 5 full days → ends 16/10 (Mon–Fri, Fri off → Sat 17)
    assert.equal(r.D, '2026-10-17');
    // the faster line takes about twice the slower one's share
    assert.ok(r.alloc[0] > r.alloc[1] * 1.8 && r.alloc[0] < r.alloc[1] * 2.2);
});

test('three lines, different manpower/efficiency (daily capacities 1200 / 800 / 400)', () => {
    const caps = [flat('2026-10-12', 40, 1200), flat('2026-10-12', 40, 800), flat('2026-10-12', 40, 400)];
    const r = balanceSplits(caps, 30000);
    assert.equal(r.error, undefined);
    assert.equal(sum(r.alloc), 30000);
    assert.ok(r.alloc[0] > r.alloc[1] && r.alloc[1] > r.alloc[2]);
    // every split still makes something on D
    for (const a of r.alloc) assert.ok(a >= 1);
});

test('rounding: odd quantities stay whole pieces and sum exactly', () => {
    const caps = [flat('2026-10-12', 20, 333), flat('2026-10-12', 20, 777), flat('2026-10-12', 20, 101)];
    assert.equal(balanceSplits(caps, 2).error, 'too few');   // 2 pieces, 3 splits
    for (const R of [3, 7, 1211, 4999, 12345]) {
        const r = balanceSplits(caps, R);
        assert.equal(r.error, undefined, `R=${R}`);
        assert.equal(sum(r.alloc), R, `R=${R}`);
        for (const a of r.alloc) assert.ok(Number.isInteger(a) && a >= 1, `R=${R}`);
    }
});

test('splits starting on different dates: the late starter still gets a share on D', () => {
    const caps = [flat('2026-10-12', 30, 1000), flat('2026-10-20', 30, 1000)];
    const r = balanceSplits(caps, 9000);
    assert.equal(r.error, undefined);
    assert.equal(sum(r.alloc), 9000);
    assert.ok(r.alloc[1] >= 1);
    assert.ok(r.D >= '2026-10-20');
});

test('a line capped by a fixed next order gives the rest to the others', () => {
    // line 2 can only run 3 days (fixed bar after it)
    const caps = [flat('2026-10-12', 30, 1000), flat('2026-10-12', 3, 1000)];
    const r = balanceSplits(caps, 10000);
    assert.equal(r.error, undefined);
    assert.equal(sum(r.alloc), 10000);
    assert.ok(r.alloc[1] <= 3000);
    assert.ok(r.alloc[0] >= 7000);
});

test('infeasible: every line capped before the remaining qty fits → error, nothing allocated', () => {
    const caps = [flat('2026-10-12', 2, 1000), flat('2026-10-12', 2, 1000)];
    const r = balanceSplits(caps, 10000);
    assert.equal(r.error, 'infeasible');
});

test('holiday on the common day of one line: that split ends the day before, total kept', () => {
    const caps = [flat('2026-10-12', 30, 1000), flat('2026-10-12', 30, 1000, ['2026-10-14'])];
    const r = balanceSplits(caps, 5000);
    assert.equal(r.error, undefined);
    assert.equal(sum(r.alloc), 5000);
});

test('running order: only the remaining qty is balanced (caller subtracts produced)', () => {
    const caps = [flat('2026-10-12', 30, 1000), flat('2026-10-12', 30, 1000)];
    const produced = 4000, total = 10000;
    const r = balanceSplits(caps, total - produced);
    assert.equal(sum(r.alloc), 6000);
});

test('nothing to balance / no splits', () => {
    assert.equal(balanceSplits([], 10).error, 'no splits');
    assert.equal(balanceSplits([flat('2026-10-12', 5, 10)], 0).error, 'nothing to balance');
});
