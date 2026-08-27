// ---------------------------------------------------------------------------
// Acceptance tests copied from docs/srs-planning.md sections 8.1, 9, 10, 11
// Run: node tests/engine.test.mjs
// ---------------------------------------------------------------------------
import assert from 'node:assert/strict';
import {
    PLANNING_MASTERS, classifyVolume, dailyOutput, blockDuration,
    forwardPass, backwardPass, feasibility, sequenceOptions, VERDICT
} from '../src/planningEngine.js';

let passed = 0, failed = 0;
const test = (name, fn) => {
    try {
        fn();
        passed++;
        console.log(`  ✓ ${name}`);
    }
    catch (e) {
        failed++;
        console.log(`  ✗ ${name}\n      ${e.message}`);
    }
};

// SRS worked example calendar: consecutive dates (the notes' chain runs
// straight through; weekly holidays are handled by the injected calendar)
const allWorking = () => true;
const D = (d, m) => new Date(2026, m - 1, d);

const line = { operators : 45, shiftMinutes : 480, absenteeismPct : 0 };
const cat  = PLANNING_MASTERS.productCategories['5Pkt'];

console.log('\nSRS 5 — Volume classification');
test('10,000 pcs -> Small/Mid, single line', () => {
    const vc = classifyVolume(10000);
    assert.equal(vc.cls, 'Small / Mid');
    assert.equal(vc.strategy, 'single-line');
});
test('40,000 pcs -> Big, multi line', () => {
    assert.equal(classifyVolume(40000).cls, 'Big');
});

console.log('\nSRS 8.1 — Daily output table (45 op, 480 min, SMV 18, new style)');
const expectDay = [[1, 38, 456], [2, 50, 600], [3, 60, 720], [4, 68, 816], [5, 68, 816]];
for (const [day, eff, pcs] of expectDay) {
    test(`Day ${day}: eff ${eff}% -> ${pcs} pcs`, () => {
        assert.equal(dailyOutput(line, cat, 'new', day, 18), pcs);
    });
}
test('8 working days cumulative = 5,856 pcs', () => {
    let cum = 0;
    for (let d = 1; d <= 8; d++) cum += dailyOutput(line, cat, 'new', d, 18);
    assert.equal(cum, 5856);
});
test('6,000 pcs requires 9 working days at SMV 18', () => {
    const r = blockDuration(6000, line, cat, 'new', 18, D(8, 8), allWorking);
    assert.equal(r.workingDays, 9);
});
test('8 days at SMV 22 yield ~4,790 pcs (4,785–4,795)', () => {
    let cum = 0;
    for (let d = 1; d <= 8; d++) cum += dailyOutput(line, cat, 'new', d, 22);
    assert.ok(cum >= 4785 && cum <= 4795, `got ${cum}`);
});
test('V04: missing SMV throws', () => {
    assert.throws(() => dailyOutput(line, cat, 'new', 1, 0), /V04/);
});

console.log('\nSRS 8.2 — day index continues across colours of the same style');
test('second colour of same style starts at the NEXT day index (no ramp restart)', () => {
    const first  = blockDuration(1056, line, cat, 'new', 18, D(8, 8), allWorking);      // days 1-2 exactly
    const second = blockDuration(720,  line, cat, 'new', 18, D(10, 8), allWorking, first.nextDayIndex);
    assert.equal(first.nextDayIndex, 3);
    assert.equal(second.dailyTargets[0].efficiencyPct, 60);   // day 3, not day 1
});

console.log('\nSRS 9 — Forward, backward, feasibility (worked example)');
test('earliest sew start = 05/08/26 (PCD 01/08 + 5 pre-production days)', () => {
    const f = forwardPass(D(1, 8), null, allWorking);
    assert.equal(f.earliestSewStart.getTime(), D(5, 8).getTime());
});
test('actual sew start = 08/08/26 when the line is free from 08/08', () => {
    const f = forwardPass(D(1, 8), D(8, 8), allWorking);
    assert.equal(f.actualSewStart.getTime(), D(8, 8).getTime());
});
test('backward chain from delivery 21/08: fin 19-20, wash 17-18, sew end 16, sew start 08, cut 07', () => {
    const b = backwardPass(D(21, 8), 9, 6000, allWorking);
    assert.equal(b.exFactory.getTime(),      D(21, 8).getTime());
    assert.equal(b.finishingEnd.getTime(),   D(20, 8).getTime());
    assert.equal(b.finishingStart.getTime(), D(19, 8).getTime());
    assert.equal(b.washEnd.getTime(),        D(18, 8).getTime());
    assert.equal(b.washStart.getTime(),      D(17, 8).getTime());
    assert.equal(b.latestSewEnd.getTime(),   D(16, 8).getTime());
    assert.equal(b.latestSewStart.getTime(), D(8, 8).getTime());
    assert.equal(b.latestCutStart.getTime(), D(7, 8).getTime());
});
test('finishing by day_capacity basis: 6,000 pcs @ 2,000/day -> 3 days', () => {
    const m = { ...PLANNING_MASTERS, finishingBasis : 'day_capacity' };
    assert.equal(backwardPass(D(21, 8), 9, 6000, allWorking, m).finishingDays, 3);
});
test('buffer 0 -> NO_BUFFER with the four remedies', () => {
    const f = feasibility(D(8, 8), D(8, 8), allWorking);
    assert.equal(f.bufferDays, 0);
    assert.equal(f.verdict, VERDICT.NO_BUFFER);
    assert.equal(f.remedies.length, 4);
});
test('buffer >= 5 -> COMFORTABLE', () => {
    assert.equal(feasibility(D(15, 8), D(8, 8), allWorking).verdict, VERDICT.COMFORTABLE);
});

console.log('\nSRS 10 — Sequencing options A / B / C');
const blocks = [
    { po : 'PO-1', colour : 'Red',  wash : 'W1', qty : 3000, deliveryDate : D(21, 8) },
    { po : 'PO-1', colour : 'Blue', wash : 'W1', qty : 3000, deliveryDate : D(21, 8) },
    { po : 'PO-2', colour : 'Red',  wash : 'W1', qty : 1000, deliveryDate : D(28, 8) },
    { po : 'PO-2', colour : 'Blue', wash : 'W1', qty : 3000, deliveryDate : D(28, 8) }
];
const ctx = { line, category : cat, styleType : 'new', smv : 18, startDate : D(8, 8), isWorking : allWorking };
const options = sequenceOptions(blocks, ctx);
const byName = n => options.find(o => o.name.startsWith(n));

test('Option A: 4 blocks, 3 changeovers, feasible', () => {
    const a = byName('A');
    assert.equal(a.blocks, 4);
    assert.equal(a.changeovers, 3);
    assert.equal(a.rejected, false);
});
test('Option B (club Red 4,000): 3 blocks, 2 changeovers, feasible', () => {
    const b = byName('B — club Red');
    assert.ok(b, 'B missing');
    assert.equal(b.blocks, 3);
    assert.equal(b.changeovers, 2);
    assert.equal(b.rejected, false);
});
test('Option C (club both): 2 blocks, 1 changeover, REJECTED (PO-1 Blue late)', () => {
    const c = byName('C');
    assert.equal(c.blocks, 2);
    assert.equal(c.changeovers, 1);
    assert.equal(c.rejected, true);
    assert.match(c.rejectReason, /PO-1/);
});
test('Option B ranks above Option A (fewer changeovers among feasible)', () => {
    const iB = options.indexOf(byName('B — club Red'));
    const iA = options.indexOf(byName('A'));
    assert.ok(iB < iA, `B at ${iB}, A at ${iA}`);
});

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
