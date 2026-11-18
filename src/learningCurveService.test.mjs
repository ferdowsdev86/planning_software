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

// --- an order already in production enters the ramp where it left it --------
import { afterProduction } from './learningCurveService.mjs';

test('remaining quantity of an order sewn for 1 day continues at ramp day 2', () => {
    const info = { applied : true, reason : 'product-change', dayOffset : 0, typeKey : 'Pant' };
    const r = afterProduction(info, 1, 3);
    assert.equal(r.applied, true);
    assert.equal(r.dayOffset, 1);
    assert.equal(r.reason, 'continuation');
    assert.equal(r.producedDays, 1);
    // the duration model then charges only days 2 and 3 of the ramp
    const d = learningDuration({ qty : 3000, smv : 10, manpower : 50, baseEffPct : 50, dailyMinutes : 600, dayPcts : CURVE.pct, dayOffset : r.dayOffset });
    assert.equal(d.dayPlan[0].day, 2);
});

test('an order sewn for the whole period (or longer) gets no ramp at all', () => {
    const info = { applied : true, reason : 'product-change', dayOffset : 0, typeKey : 'Pant' };
    for (const days of [3, 5, 40]) {
        const r = afterProduction(info, days, 3);
        assert.equal(r.applied, false);
        assert.equal(r.dayOffset, 3);
        assert.equal(r.reason, 'in-production');
    }
});

test('production days never shorten a line offset and never create a ramp', () => {
    // the line sequence already put it at day 3 of the ramp — production of 1 day does not pull it back
    assert.equal(afterProduction({ applied : true, reason : 'continuation', dayOffset : 2 }, 1, 3).dayOffset, 2);
    // first bar on the line / same product: no ramp before, no ramp after
    const first = { applied : false, reason : 'first-on-line', dayOffset : 0 };
    assert.deepEqual(afterProduction(first, 2, 3), { ...first, dayOffset : 2, producedDays : 2 });
    // nothing produced: untouched
    assert.equal(afterProduction(first, 0, 3), first);
});

// ---------------------------------------------------------------------------
// The curve falls behind with the output (planner, 2026-11-18)
// ---------------------------------------------------------------------------
import { lagTarget, curveLag, consumePlan } from './learningCurveService.mjs';

const tOfPeak = (peak, pct) => k => (k > pct.length ? peak : Math.max(1, Math.floor(peak * pct[Math.max(1, k) - 1] / 100)));

test("curve lag: the planner's table — day 1 made 150 of 189 → 378 / 661 / 945 become 339 / 603 / 886, then 945", () => {
    const pct = [20, 40, 70], tOf = tOfPeak(945, pct);
    assert.deepEqual([1, 2, 3, 4, 5].map(tOf), [189, 378, 661, 945, 945]);
    const { lag } = curveLag([{ ymd : '2026-11-04', target : 189, actual : 150 }]);
    assert.equal(lag, 0.20635);                       // 39 ÷ 189 of a day
    assert.equal(lagTarget(pct, 2 - lag, tOf), 339);
    assert.equal(lagTarget(pct, 3 - lag, tOf), 603);
    assert.equal(lagTarget(pct, 4 - lag, tOf), 886);
    assert.equal(lagTarget(pct, 5 - lag, tOf), 945);  // the ramp is over: the full target
    assert.equal(lagTarget(pct, 6 - lag, tOf), 945);
});

test('curve lag: 27SUJCP006 — day 1 made 90 of 130 → 261 / 458 / 654 become 221 / 397 / 594', () => {
    const pct = [20, 40, 70];
    const tOf = k => [130, 261, 458, 654][Math.min(k, 4) - 1];
    const { lag } = curveLag([{ ymd : '2026-11-04', target : 130, actual : 90 }]);
    assert.ok(Math.abs(lag - 40 / 130) < 1e-4);
    assert.deepEqual([2, 3, 4, 5].map(n => lagTarget(pct, n - lag, tOf)), [221, 397, 594, 654]);
});

test('curve lag: no lag = the plain curve; a day on target adds nothing', () => {
    const pct = [20, 40, 70], tOf = tOfPeak(945, pct);
    assert.deepEqual([1, 2, 3, 4].map(n => lagTarget(pct, n, tOf)), [189, 378, 661, 945]);
    assert.equal(curveLag([{ ymd : 'a', target : 189, actual : 189 }]).lag, 0);
    assert.equal(curveLag([]).lag, 0);
});

test('curve lag adds up day by day, a day above target wins time back, never below 0', () => {
    // day 1: 40 of 130 short (0.30769) · day 2: 21 of 221 short (0.09502)
    const two = curveLag([{ ymd : '2026-11-04', target : 130, actual : 90 }, { ymd : '2026-11-05', target : 221, actual : 200 }]);
    assert.ok(Math.abs(two.lag - (40 / 130 + 21 / 221)) < 1e-4);
    assert.equal(two.history.length, 2);
    // day 2 above its target: 0.30769 − 0.1 = 0.20769
    const back = curveLag([{ ymd : '2026-11-04', target : 130, actual : 90 }, { ymd : '2026-11-05', target : 200, actual : 220 }]);
    assert.ok(Math.abs(back.lag - (40 / 130 - 0.1)) < 1e-4);
    assert.equal(curveLag([{ ymd : 'a', target : 130, actual : 200 }]).lag, 0);
    // a day with no output at all loses the whole day
    assert.equal(curveLag([{ ymd : 'a', target : 130, actual : 0 }]).lag, 1);
});

test('curve lag: a day without a record is not judged', () => {
    assert.equal(curveLag([{ ymd : '2026-11-04', target : 130, actual : null }]).lag, 0);
    assert.equal(curveLag([{ ymd : '2026-11-04', target : 0, actual : 50 }]).lag, 0);
});

test('curve lag of more than a day: the curve steps back across days, never below day 1', () => {
    const pct = [20, 40, 70], tOf = tOfPeak(1000, pct);
    assert.equal(lagTarget(pct, 2 - 1.3, tOf), 200);          // 0.7 → still day 1
    assert.equal(lagTarget(pct, 3 - 1.3, tOf), 340);          // 1.7 → 200 + 0.7 × 200
    assert.equal(lagTarget(pct, 4 - 1.3, tOf), 610);          // 2.7 → 400 + 0.7 × 300
    assert.equal(lagTarget(pct, 5 - 1.3, tOf), 910);          // 3.7 → 700 + 0.7 × 300
    assert.equal(lagTarget(pct, 6 - 1.3, tOf), 1000);
});

test('consumePlan: where the output ends in the plan and what that day still owes', () => {
    assert.deepEqual(consumePlan([130, 261, 458], 90), { idx : 0, rest : 40, fullDays : 0, over : 0 });
    assert.deepEqual(consumePlan([130, 221, 397], 290), { idx : 1, rest : 61, fullDays : 1, over : 0 });
    assert.deepEqual(consumePlan([130, 261], 130), { idx : 1, rest : 261, fullDays : 1, over : 0 });   // day 1 done in full
    assert.deepEqual(consumePlan([130, 261], 0), { idx : 0, rest : 130, fullDays : 0, over : 0 });
    assert.deepEqual(consumePlan([130, 261], 400), { idx : 2, rest : 0, fullDays : 2, over : 9 });
});

import { rampDaysBefore } from './learningCurveService.mjs';

test('ramp days run: a recorded ramp day before the rest\'s start day is done — the rest goes on with the next ramp day', () => {
    const lcT = { '2026-11-04' : 172 };
    // the rest still stands on the recorded day itself: that day keeps its number (day 1)
    assert.equal(rampDaysBefore(lcT, '2026-11-04'), 0);
    // the rest stands on a later day (moved / re-planned): day 1 is run → it begins with day 2
    assert.equal(rampDaysBefore(lcT, '2026-11-05'), 1);
    assert.equal(rampDaysBefore(lcT, '2026-11-20'), 1);
    assert.equal(rampDaysBefore({ '2026-11-04' : 172, '2026-11-05' : 293 }, '2026-11-07'), 2);
    assert.equal(rampDaysBefore(null, '2026-11-07'), 0);
    // 27WISAN011: day 1 made 120 of 172 → lag 0.3023; the rest on another day reads 293 / 526 / 785 / 863 — no day 1
    const pct = [20, 40, 70], tOf = k => [172, 345, 604, 863][Math.min(k, 4) - 1];
    const { lag } = curveLag([{ ymd : '2026-11-04', target : 172, actual : 120 }]);
    const run = rampDaysBefore(lcT, '2026-11-08');
    assert.deepEqual([0, 1, 2, 3].map(i => lagTarget(pct, run + i + 1 - lag, tOf)), [293, 526, 785, 863]);
});
