import test from 'node:test';
import assert from 'node:assert/strict';
import { attributeActualsToBars, buildProgressRows, performanceAdjustment, forecastRemaining } from './forecastService.mjs';

const base = (ymd, target, extra = {}) => ({ ymd, off : false, target, fullTarget : target, factor : 1, lcDay : 0, peak : target, ...extra });

test('attribution: the ERP line decides; a PO on a line without its bar is PO-level (not attributed); unknown PO is reported', () => {
    const bars = [
        { id : 'A', lineCode : 'L01', pos : ['PO1'], orderCodes : ['26X'], startYmd : '2026-11-10', endYmd : '2026-11-14' },
        { id : 'B', lineCode : 'L02', pos : ['PO1'], orderCodes : ['26X'], startYmd : '2026-11-10', endYmd : '2026-11-14' }
    ];
    const rows = [
        { date : '2026-11-11', poNo : 'PO1', lineCode : 'L01', qty : 100, n : 2 },
        { date : '2026-11-11', poNo : 'PO1', lineCode : 'L02', qty : 80, n : 1 },
        { date : '2026-11-12', poNo : 'PO1', lineCode : 'L07', qty : 30, n : 1 },   // line with no bar of the PO
        { date : '2026-11-12', poNo : 'PO9', lineCode : 'L01', qty : 5, n : 1 },    // nothing on the board
        { date : '2026-11-13', poNo : 'PO2', lineCode : null, qty : 40, n : 1 }     // no line on the ERP row, one bar of the PO
    ];
    const barsAll = [...bars, { id : 'C', lineCode : 'L03', pos : ['PO2'], orderCodes : ['26Y'], startYmd : '2026-11-12', endYmd : '2026-11-15' }];
    const { byBar, unattributed } = attributeActualsToBars(rows, barsAll);
    assert.equal(byBar.get('A').days['2026-11-11'].qty, 100);
    assert.equal(byBar.get('B').days['2026-11-11'].qty, 80);
    assert.equal(byBar.get('A').days['2026-11-11'].attributed, true);
    assert.equal(byBar.get('A').days['2026-11-12'], undefined, 'output booked on L07 is NOT pushed into another line\'s bar');
    assert.equal(byBar.get('C').days['2026-11-13'].qty, 40);
    assert.equal(byBar.get('C').days['2026-11-13'].attributed, false, 'a row without a line is PO-level on the PO\'s single bar');
    assert.equal(unattributed.length, 3);
    assert.match(unattributed.find(u => u.poNo === 'PO9').reason, /no bar/);
    assert.match(unattributed.find(u => u.poNo === 'PO1' && u.lineCode === 'L07').reason, /no bar of the PO there/);
});

test('progress rows: achievement, variance, cumulative variance over days with a record; missing ≠ zero; today provisional', () => {
    const baseline = [base('2026-11-10', 500, { lcDay : 1, factor : 0.5 }), base('2026-11-11', 800), base('2026-11-12', 1000), base('2026-11-13', 1000), base('2026-11-14', 1000)];
    const actuals = { '2026-11-10' : { qty : 450, erp : true }, '2026-11-11' : { qty : 0, erp : true }, '2026-11-13' : { qty : 600, erp : true } };
    const rows = buildProgressRows({ baseline, actuals, savedPlan : { '2026-11-12' : 950 }, cutoffYmd : '2026-11-13', todayYmd : '2026-11-13' });
    const by = Object.fromEntries(rows.map(r => [r.ymd, r]));
    assert.equal(by['2026-11-10'].achievement, 90);
    assert.equal(by['2026-11-10'].variance, -50);
    assert.equal(by['2026-11-11'].status, 'zero');
    assert.equal(by['2026-11-11'].achievement, 0);
    assert.equal(by['2026-11-12'].status, 'missing');
    assert.equal(by['2026-11-12'].target, 950, 'a saved day plan figure wins over the baseline');
    assert.equal(by['2026-11-12'].achievement, null);
    assert.equal(by['2026-11-13'].status, 'provisional');
    assert.equal(by['2026-11-13'].cumVariance, (450 + 0 + 600) - (500 + 800 + 1000), 'the missing day is not counted on either side');
    assert.equal(by['2026-11-14'].status, 'future');
    const zeroTarget = buildProgressRows({ baseline : [base('2026-11-10', 0)], actuals : { '2026-11-10' : { qty : 10 } }, todayYmd : '2026-11-12' });
    assert.equal(zeroTarget[0].achievement, null, 'N/A when the original target is 0');
});

test('performance adjustment: output basis over the last 3 finalized days; today (provisional) and missing days excluded; sample size reported', () => {
    const rows = buildProgressRows({
        baseline : [base('2026-11-09', 1000), base('2026-11-10', 1000), base('2026-11-11', 1000), base('2026-11-12', 1000), base('2026-11-13', 1000)],
        actuals : { '2026-11-09' : { qty : 500 }, '2026-11-10' : { qty : 900 }, '2026-11-11' : { qty : 800 }, '2026-11-12' : { qty : 700 }, '2026-11-13' : { qty : 100 } },
        todayYmd : '2026-11-13', cutoffYmd : '2026-11-13'
    });
    const adj = performanceAdjustment({ rows, window : 3 });
    assert.equal(adj.basis, 'output');
    assert.equal(adj.sample, 3);
    assert.deepEqual(adj.days, ['2026-11-10', '2026-11-11', '2026-11-12']);
    assert.equal(adj.ratio, 0.8);
    const two = performanceAdjustment({ rows : rows.slice(0, 2).map(r => ({ ...r, status : 'final' })), window : 3 });
    assert.equal(two.sample, 2);
    assert.equal(two.ratio, 0.7);
    const none = performanceAdjustment({ rows : [], window : 3 });
    assert.equal(none.basis, 'none');
    assert.equal(none.ratio, 1);
    // a start-day sliver (target 14 of a 700-pc day) is no sample — the planner saw "× 3.00 from 1 day"
    const sliver = buildProgressRows({ baseline : [{ ymd : '2026-10-11', off : false, target : 14, fullTarget : 700, factor : 1, lcDay : 0, peak : 700 }], actuals : { '2026-10-11' : { qty : 185 } }, todayYmd : '2026-11-18' });
    assert.equal(performanceAdjustment({ rows : sliver, window : 3 }).sample, 0);
    // the run's tail: a day that began with ≥ 90 % of the quantity made is no sample (its low output is "little left", not slow sewing)
    const tail = buildProgressRows({
        baseline : [base('2026-10-20', 700), base('2026-10-21', 700), base('2026-10-22', 700)],
        actuals : { '2026-10-20' : { qty : 700 }, '2026-10-21' : { qty : 700 }, '2026-10-22' : { qty : 60 } }, todayYmd : '2026-11-18'
    });
    const t = performanceAdjustment({ rows : tail, window : 3, qty : 1500 });
    assert.deepEqual(t.days, ['2026-10-20', '2026-10-21']);
    assert.equal(t.ratio, 1);
});

test('performance adjustment: efficiency basis when every sampled day has manpower-minutes and a valid SMV, working-time weighted', () => {
    // day 1: 60 workers × 480 min = 28,800 man-min, plan eff 50 % → expected 480 pcs at SMV 30; actual 384 → 80 %
    // day 2: 60 × 600 = 36,000 man-min → expected 600; actual 600 → 100 %   → weighted (384+600)×30 / ((28800+36000)×0.5) = 0.911
    const rows = buildProgressRows({
        baseline : [base('2026-11-10', 480), base('2026-11-11', 600)],
        actuals : { '2026-11-10' : { qty : 384, manMin : 28800 }, '2026-11-11' : { qty : 600, manMin : 36000 } },
        todayYmd : '2026-11-12'
    });
    const adj = performanceAdjustment({ rows, window : 3, smv : 30, expectedEffPct : 50 });
    assert.equal(adj.basis, 'efficiency');
    assert.equal(adj.ratio, 0.911);
});

test('forecast: remaining allocated exactly once at baseline × ratio, capped at the peak; today only its remaining shift share; finish day found', () => {
    const cap = [
        { ymd : '2026-11-13', off : false, fullTarget : 1000, peak : 1000, winF : 1 },
        { ymd : '2026-11-14', off : true,  fullTarget : 1000, peak : 1000, winF : 1 },
        { ymd : '2026-11-15', off : false, fullTarget : 500,  peak : 1000, winF : 1 },   // a ramp day (factor 0.5)
        { ymd : '2026-11-16', off : false, fullTarget : 1000, peak : 1000, winF : 1 },
        { ymd : '2026-11-17', off : false, fullTarget : 1000, peak : 1000, winF : 1 }
    ];
    const f = forecastRemaining({ remaining : 2000, capacityDays : cap, ratio : 0.8, todayYmd : '2026-11-13', todayFrac : 0.5 });
    assert.deepEqual(f.days.map(d => [d.ymd, d.qty]), [['2026-11-13', 400], ['2026-11-15', 400], ['2026-11-16', 800], ['2026-11-17', 400]]);
    assert.equal(f.allocated, 2000);
    assert.equal(f.finishYmd, '2026-11-17');
    assert.equal(f.finishFrac, 0.5);
    // a ratio above 1 lifts a ramp day but never above the configured peak
    const up = forecastRemaining({ remaining : 5000, capacityDays : cap, ratio : 3, todayYmd : null });
    assert.equal(up.days.find(d => d.ymd === '2026-11-15').qty, 1000);
    assert.equal(up.days.find(d => d.ymd === '2026-11-13').qty, 1000);
    assert.equal(up.exhausted, false);
    assert.equal(up.left, 1000);
});
