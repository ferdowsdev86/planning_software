import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickLearningCurve, buildLineLearning, learningDuration } from './learningCurveService.mjs';

// The configured Build up list as seeded in the app (Setup → Build up curves)
const CURVES = [
    { id : 'bc1', name : '1 Day',  period : 1, pct : [100] },
    { id : 'bc3', name : '3 Days', period : 3, pct : [40, 70, 100] },
    { id : 'bc5', name : '5 Days', period : 5, pct : [25, 45, 65, 85, 100] }
];
const CURVE = pickLearningCurve(CURVES, 3);

test('picks the configured 3-day curve, not a hard-coded one', () => {
    assert.equal(CURVE.name, '3 Days');
    assert.deepEqual(CURVE.pct, [40, 70, 100]);
    assert.equal(pickLearningCurve([], 3), null);
    assert.equal(pickLearningCurve(null, 3), null);
});

// --- sequencing rules ------------------------------------------------------

test('first product on a line gets no learning curve', () => {
    const m = buildLineLearning([
        { id : 'a', typeKey : 'Shirt', workDayIndex : 0 }
    ], CURVE);
    assert.equal(m.get('a').applied, false);
    assert.equal(m.get('a').reason, 'first-on-line');
});

test('same order continuing for days starts the curve only once (no re-application)', () => {
    // one long bar = one entry; a follow-up strip of the SAME order/type
    // several days later is same-product, not a new changeover
    const m = buildLineLearning([
        { id : 'a', typeKey : 'Shirt', workDayIndex : 0 },
        { id : 'b', typeKey : 'Shirt', workDayIndex : 6 }
    ], CURVE);
    assert.equal(m.get('a').applied, false);
    assert.equal(m.get('b').applied, false);
    assert.equal(m.get('b').reason, 'same-product');
});

test('different order but same garment type — no new learning curve', () => {
    const m = buildLineLearning([
        { id : 'a', typeKey : 'Shirt',  workDayIndex : 0 },
        { id : 'b', typeKey : 'Jacket', workDayIndex : 4 },  // changeover
        { id : 'c', typeKey : 'Jacket', workDayIndex : 9 }   // other PO, same type, ramp done
    ], CURVE);
    assert.equal(m.get('b').applied, true);
    assert.equal(m.get('b').reason, 'product-change');
    assert.equal(m.get('c').applied, false);
    assert.equal(m.get('c').reason, 'same-product');
});

test('garment type change applies the 3-working-day curve from day 1', () => {
    const m = buildLineLearning([
        { id : 'a', typeKey : 'Shirt',  workDayIndex : 0 },
        { id : 'b', typeKey : 'Jacket', workDayIndex : 5 }
    ], CURVE);
    assert.deepEqual(m.get('b'), { applied : true, reason : 'product-change', dayOffset : 0, typeKey : 'Jacket' });
});

test('holiday inside the ramp: day count continues, never restarts', () => {
    // workDayIndex already excludes off days — bar c starts 1 WORKING day
    // after the changeover even though calendar days may span a weekend
    const m = buildLineLearning([
        { id : 'a', typeKey : 'Shirt',  workDayIndex : 0 },
        { id : 'b', typeKey : 'Jacket', workDayIndex : 3 },  // ramp day 1
        { id : 'c', typeKey : 'Jacket', workDayIndex : 4 }   // ramp day 2 (after holiday)
    ], CURVE);
    assert.equal(m.get('c').applied, true);
    assert.equal(m.get('c').reason, 'continuation');
    assert.equal(m.get('c').dayOffset, 1);
});

test('ramp finishes after 3 working days — later same-type bars run normal', () => {
    const m = buildLineLearning([
        { id : 'a', typeKey : 'Shirt',  workDayIndex : 0 },
        { id : 'b', typeKey : 'Jacket', workDayIndex : 2 },
        { id : 'c', typeKey : 'Jacket', workDayIndex : 5 }   // offset 3 ≥ period
    ], CURVE);
    assert.equal(m.get('c').applied, false);
    assert.equal(m.get('c').reason, 'same-product');
});

test('previous order deleted: sequence recomputes (Jacket follows Jacket → curve gone)', () => {
    const withShirt = buildLineLearning([
        { id : 'a', typeKey : 'Jacket', workDayIndex : 0 },
        { id : 's', typeKey : 'Shirt',  workDayIndex : 3 },
        { id : 'b', typeKey : 'Jacket', workDayIndex : 6 }
    ], CURVE);
    assert.equal(withShirt.get('b').applied, true);
    // Shirt removed → b now continues the same Jacket run
    const without = buildLineLearning([
        { id : 'a', typeKey : 'Jacket', workDayIndex : 0 },
        { id : 'b', typeKey : 'Jacket', workDayIndex : 6 }
    ], CURVE);
    assert.equal(without.get('b').applied, false);
});

test('deterministic: same input → same result (refresh consistency)', () => {
    const bars = [
        { id : 'a', typeKey : 'Shirt',  workDayIndex : 0 },
        { id : 'b', typeKey : 'Jacket', workDayIndex : 4 }
    ];
    assert.deepEqual(
        [...buildLineLearning(bars, CURVE).entries()],
        [...buildLineLearning(bars, CURVE).entries()]
    );
});

// --- capacity / duration ---------------------------------------------------

const P = { qty : 3000, smv : 20, manpower : 50, baseEffPct : 60, dailyMinutes : 600 };

test('learning days reduce capacity and extend the bar; quantity is unchanged', () => {
    const normal = learningDuration({ ...P, dayPcts : [], dayOffset : 0 });
    const ramped = learningDuration({ ...P, dayPcts : CURVE.pct, dayOffset : 0 });
    assert.ok(ramped.dur > normal.dur, 'ramped bar must be longer');
    // required minutes (qty × smv) identical → no quantity loss or duplication
    assert.equal(ramped.reqMin, normal.reqMin);
    assert.equal(ramped.reqMin, 3000 * 20);
});

test('day capacities follow the configured percentages', () => {
    const r = learningDuration({ ...P, dayPcts : CURVE.pct, dayOffset : 0 });
    // day 1: 50 × 600 × (60% × 40%) = 7200 min → 360 pcs at SMV 20
    assert.equal(r.dayPlan[0].capacity, 360);
    assert.equal(r.dayPlan[0].effPct, 24);
    // day 2: 70% of 60% = 42% → 630 pcs
    assert.equal(r.dayPlan[1].capacity, 630);
    // day 3: 100% → full 900 pcs; day 4 (normal) also 900
    assert.equal(r.dayPlan[2].capacity, 900);
    assert.equal(r.dayPlan[3].capacity, 900);
});

test('a continuation bar enters the ramp at its offset day', () => {
    const d0 = learningDuration({ ...P, dayPcts : CURVE.pct, dayOffset : 0 });
    const d2 = learningDuration({ ...P, dayPcts : CURVE.pct, dayOffset : 2 });
    assert.ok(d2.dur < d0.dur, 'starting at day 3 must be faster than day 1');
    assert.equal(d2.dayPlan[0].day, 3);
    assert.equal(d2.dayPlan[0].capacity, 900); // day-3 pct = 100%
});

test('offset beyond the period behaves exactly like normal efficiency', () => {
    const plain = learningDuration({ ...P, dayPcts : [], dayOffset : 0 });
    const past  = learningDuration({ ...P, dayPcts : CURVE.pct, dayOffset : 3 });
    assert.ok(Math.abs(plain.dur - past.dur) < 1e-9);
    assert.equal(past.learnMin, 0);
});

test('learnMin covers only the ramp portion of the bar', () => {
    const r = learningDuration({ ...P, dayPcts : CURVE.pct, dayOffset : 0 });
    // ramp = 3 full working days = 1800 clock minutes
    assert.equal(r.learnMin, 1800);
    assert.ok(r.workMin > 1800);
});

test('tiny order finishing inside day 1 stays a fraction of a day', () => {
    const r = learningDuration({ ...P, qty : 100, dayPcts : CURVE.pct, dayOffset : 0 });
    assert.ok(r.dur < 0.3, `dur ${r.dur}`);
    assert.ok(r.learnMin > 0);
});
