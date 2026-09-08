import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveDropPosition, findLineOverlaps, DEFAULT_SNAP_TOLERANCE_DAYS } from './snapService.mjs';

// Plain 24h calendar for tests: every hour is a working hour
const DAY = 86400000;
const H = {
    nextStartAfter : d => new Date(d),
    endOfWork      : (s, days) => new Date(s.getTime() + days * DAY)
};
const d = n => new Date(Date.UTC(2026, 0, 1) + n * DAY); // day n

const barA = { id : 'A', name : 'A', start : d(0), end : d(5) };   // days 0–5
const barB = { id : 'B', name : 'B', start : d(9), end : d(12) };  // days 9–12

function run(desiredDay, dur, bars = [barA, barB], tol = DEFAULT_SNAP_TOLERANCE_DAYS) {
    return resolveDropPosition({ desired : d(desiredDay), dur, bars, tol, helpers : H });
}

test('near previous end (within tolerance) snaps flush after it', () => {
    const r = run(5.5, 2, [barA]); // half a day after A ends, tol = 1
    assert.equal(r.start.getTime(), d(5).getTime());
    assert.equal(r.end.getTime(), d(7).getTime());
    assert.equal(r.snappedAfter?.id, 'A');
});

test('slight overlap over previous tail snaps flush after it', () => {
    const r = run(4, 2, [barA]); // starts inside A's last day
    assert.equal(r.start.getTime(), d(5).getTime());
    assert.equal(r.snappedAfter?.id, 'A');
});

test('deep overlap (dropped inside a bar) lands right after that bar', () => {
    const r = run(2, 2, [barA]);
    assert.equal(r.start.getTime(), d(5).getTime());
});

test('exactly flush stays put with no snap flag', () => {
    const r = run(5, 2, [barA]);
    assert.equal(r.start.getTime(), d(5).getTime());
    assert.equal(r.snappedAfter, null);
    assert.equal(r.bumpedOver, null);
});

test('intentional gap beyond tolerance is kept', () => {
    const r = run(7.5, 1, [barA]); // 2.5 days after A ends
    assert.equal(r.start.getTime(), d(7.5).getTime());
    assert.equal(r.snappedAfter, null);
});

test('duration is preserved: end always start + dur', () => {
    for (const [day, dur] of [[5.5, 3], [2, 1], [20, 4]]) {
        const r = run(day, dur);
        assert.equal(r.end.getTime() - r.start.getTime(), dur * DAY);
    }
});

test('snap into a gap too small for the bar hops after the NEXT bar', () => {
    // A ends day 5, B starts day 9 → 4-day gap; a 6-day bar cannot fit
    const r = run(5.5, 6);
    assert.equal(r.start.getTime(), d(12).getTime()); // after B
    assert.equal(r.bumpedOver?.id, 'B');
});

test('drop before all bars with room stays where dropped', () => {
    const r = resolveDropPosition({ desired : d(0), dur : 2, bars : [barB], tol : 1, helpers : H });
    assert.equal(r.start.getTime(), d(0).getTime());
});

test('drop before a bar whose tail it clips lands after that bar', () => {
    const r = resolveDropPosition({ desired : d(8), dur : 3, bars : [barB], tol : 1, helpers : H });
    // day 8 is >1 day gap from nothing (no prev) but 8+3 overlaps B(9–12)
    assert.equal(r.start.getTime(), d(12).getTime());
    assert.equal(r.bumpedOver?.id, 'B');
});

test('existing bars are never mutated', () => {
    const bars = [
        { id : 'A', name : 'A', start : d(0), end : d(5) },
        { id : 'B', name : 'B', start : d(9), end : d(12) }
    ];
    const frozen = JSON.stringify(bars);
    run(4, 6, bars);
    assert.equal(JSON.stringify(bars), frozen);
});

test('custom tolerance: 2 days snaps a 1.5-day gap, 1 day keeps it', () => {
    const near = run(6.5, 1, [barA], 2);
    assert.equal(near.start.getTime(), d(5).getTime());
    const kept = run(6.5, 1, [barA], 1);
    assert.equal(kept.start.getTime(), d(6.5).getTime());
});

test('findLineOverlaps flags overlapping pairs, ignores touching bars', () => {
    const bars = [
        { id : 1, start : d(0), end : d(5) },
        { id : 2, start : d(5), end : d(8) },   // touching — fine
        { id : 3, start : d(7), end : d(10) }   // overlaps #2
    ];
    const pairs = findLineOverlaps(bars);
    assert.equal(pairs.length, 1);
    assert.deepEqual(pairs[0].map(b => b.id), [2, 3]);
});
