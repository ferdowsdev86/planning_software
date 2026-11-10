import test from 'node:test';
import assert from 'node:assert/strict';
import { simulateUnit, simulateAllocation, planQtyOf, profileEfficiency, pickCurve, runKeyOf } from './planAllocation.mjs';

// Sat–Thu 08:00, 10 h; Friday off
const WEEK = { 0 : { start : 480, hours : 10 }, 1 : { start : 480, hours : 10 }, 2 : { start : 480, hours : 10 },
    3 : { start : 480, hours : 10 }, 4 : { start : 480, hours : 10 }, 5 : { start : 480, hours : 0 }, 6 : { start : 480, hours : 10 } };
const cal = (overrides = {}, lineOverrides = {}) => ({ days : WEEK, overrides, lineOverrides });
// 50 mp × 600 min × 60 % ÷ SMV 10 = 1,800 pcs / day
const LINE = { id : 1, name : 'Line 01', manpower : 50, eff : 60, hours : 10 };
const TODAY = '2026-11-01';   // Sunday
const sum = o => Object.values(o.days).reduce((a, b) => a + b, 0);
// day figures come from cumulative rounding (so the days add up), ± 1 piece
const near = (a, b) => assert.ok(Math.abs((a || 0) - b) <= 1, `${a} vs ${b}`);

test('plan qty is +3 % and the result is reported in order pieces', () => {
    assert.equal(planQtyOf(1000), 1030);
    const r = simulateUnit({ unitId : 3, lines : [LINE], calendar : cal(), busy : [], profiles : {},
        orders : [{ key : 'A', qty : 1000, smv : 10, pcd : '2026-11-05', ship : '2026-11-30', productType : 'Pant', buyer : 'X' }] }, TODAY);
    const o = r.orders[0];
    assert.equal(o.placed, 1000);
    assert.equal(o.left, 0);
    assert.equal(sum(o), 1000);
    // 1,030 plan pieces at 1,800 / day → one day; start = PCD − 8 = 28 Oct → not before today (1 Nov)
    assert.equal(o.start, '2026-11-01');
    assert.equal(o.end, '2026-11-01');
});

test('window: PCD − 8 start, delivery − 7 end; Friday and override off days skipped; what does not fit is left', () => {
    // 10,000 pcs ≈ 5.7 days; window 13 Nov (PCD 21 − 8) → 17 Nov (ship 24 − 7); 13 Nov 2026 is a Friday
    const r = simulateUnit({ unitId : 3, lines : [LINE], calendar : cal({ '2026-11-15' : 0 }), busy : [], profiles : {},
        orders : [{ key : 'B', qty : 10000, smv : 10, pcd : '2026-11-21', ship : '2026-11-24', productType : 'Pant' }] }, TODAY);
    const o = r.orders[0];
    assert.deepEqual(Object.keys(o.days), ['2026-11-14', '2026-11-16', '2026-11-17']);   // 13 Fri off, 15 override off
    assert.equal(o.placed, 3 * 1800 - 0 > 10000 ? 10000 : Math.round(3 * 1800 * 10000 / 10300));
    assert.ok(o.left > 0 && o.placed + o.left === 10000);
});

test('a saved bar keeps its minutes: only the free part of the day is used', () => {
    // bar 08:00–13:00 on 2 Nov → 5 h of 10 free → 900 pcs that day
    const r = simulateUnit({ unitId : 3, lines : [LINE], calendar : cal(), profiles : {},
        busy : [{ lineId : 1, start : '2026-11-02T08:00:00', end : '2026-11-02T13:00:00', productType : 'Pant', style : 'S1' }],
        orders : [{ key : 'C', qty : 10000, smv : 10, pcd : '2026-11-10', ship : '2026-12-20', productType : 'Pant', style : 'S1' }] }, TODAY);
    const o = r.orders[0];
    near(o.days['2026-11-02'], Math.round(900 * 10000 / 10300));
    near(o.days['2026-11-03'], Math.round(1800 * 10000 / 10300));
});

test('efficiency: buyer rule beats the profile, the profile beats the line, _Default fills the gap', () => {
    assert.equal(profileEfficiency({ Pant : 70, _Default : 55 }, 'Pant', 60), 70);
    assert.equal(profileEfficiency({ '5 Pkt Pant' : 70, _Default : 55 }, 'pant', 60), 70);   // substring match
    assert.equal(profileEfficiency({ Shirt : 70, _Default : 55 }, 'Pant', 60), 55);
    assert.equal(profileEfficiency({ Shirt : 0 }, 'Pant', 60), 60);
    const mk = (buyer, profiles) => simulateUnit({ unitId : 3, lines : [LINE], calendar : cal(), busy : [], profiles,
        orders : [{ key : 'D', qty : 100000, smv : 10, pcd : '2026-11-10', ship : '2026-11-10', productType : 'Pant', buyer }] }, TODAY).orders[0];
    // window 2 Nov → 3 Nov (late? no: PCD−8 = 2 Nov, ship−7 = 3 Nov) → two days
    const base = mk('X', {});                                   // 60 % → 1,800 / day
    const prof = mk('X', { 'Line 01' : { Pant : 90 } });        // 90 % → 2,700 / day
    const gstar = mk('G-Star RAW', { 'Line 01' : { Pant : 90 } });   // 40 % → 1,200 / day
    near(base.days['2026-11-02'], Math.round(1800 * 100000 / 103000));
    near(prof.days['2026-11-02'], Math.round(2700 * 100000 / 103000));
    near(gstar.days['2026-11-02'], Math.round(1200 * 100000 / 103000));
});

test('learning curve: a product / style changeover ramps the first 3 working days, a continuation does not', () => {
    const curve = { name : '2 Days', period : 3, pct : [25, 55, 100] };
    const unit = { unitId : 3, lines : [LINE], calendar : cal(), profiles : {}, curve,
        busy : [{ lineId : 1, start : '2026-10-25T08:00:00', end : '2026-10-31T18:00:00', productType : 'Shirt', style : 'OLD' }] };
    const r = simulateUnit({ ...unit, orders : [{ key : 'E', qty : 100000, smv : 10, pcd : '2026-11-09', ship : '2026-11-12', productType : 'Pant', style : 'NEW' }] }, TODAY);
    const o = r.orders[0];
    const f = q => Math.round(q * 100000 / 103000);
    near(o.days['2026-11-01'], f(450));    // 25 %
    near(o.days['2026-11-02'], f(990));    // 55 %
    near(o.days['2026-11-03'], f(1800));   // 100 %
    assert.equal(o.lines[0].ramp, true);
    const same = simulateUnit({ ...unit, orders : [{ key : 'F', qty : 100000, smv : 10, pcd : '2026-11-09', ship : '2026-11-12', productType : 'Shirt', style : 'OLD' }] }, TODAY).orders[0];
    near(same.days['2026-11-01'], f(1800));
    assert.equal(same.lines[0].ramp, false);
    assert.equal(runKeyOf('Shirt', '13343941-black'), runKeyOf('shirt', '13343941-blue'));   // colour suffix = the same style
    assert.notEqual(runKeyOf('Shirt', 'OLD-black'), runKeyOf('shirt', 'OLD-blue'));           // a short code keeps its full text
});

test('an order spills over to a second line when one cannot hold it, lines in board order on a tie', () => {
    const L2 = { ...LINE, id : 2, name : 'Line 02' };
    const r = simulateUnit({ unitId : 3, lines : [LINE, L2], calendar : cal(), busy : [], profiles : {},
        orders : [{ key : 'G', qty : 3000, smv : 10, pcd : '2026-11-09', ship : '2026-11-08', productType : 'Pant' }] }, TODAY);
    // window 1 Nov → 1 Nov (ship − 7 = 1 Nov): one day per line, 1,800 + 1,290 plan pcs
    const o = r.orders[0];
    assert.equal(o.lines.length, 2);
    assert.equal(o.lines[0].id, 1);
    assert.equal(o.placed, 3000);
    assert.equal(o.left, 0);
});

test('planning order is PCD first: the earlier PCD takes the capacity, the other is left', () => {
    const r = simulateUnit({ unitId : 3, lines : [LINE], calendar : cal(), busy : [], profiles : {}, orders : [
        { key : 'late-pcd',  qty : 1800, smv : 10, pcd : '2026-11-09', ship : '2026-11-08', productType : 'Pant' },
        { key : 'early-pcd', qty : 1700, smv : 10, pcd : '2026-11-08', ship : '2026-11-08', productType : 'Pant' }
    ] }, TODAY);
    const by = Object.fromEntries(r.orders.map(o => [o.key, o]));
    assert.equal(by['early-pcd'].left, 0);
    assert.ok(by['late-pcd'].left > 0);
});

test('late order (window closed) is planned from today up to its delivery; a past delivery places nothing', () => {
    const r = simulateUnit({ unitId : 3, lines : [LINE], calendar : cal(), busy : [], profiles : {}, orders : [
        { key : 'late', qty : 1000, smv : 10, pcd : '2026-10-01', ship : '2026-11-03', productType : 'Pant' },
        { key : 'past', qty : 1000, smv : 10, pcd : '2026-09-01', ship : '2026-10-20', productType : 'Pant' }
    ] }, TODAY);
    const by = Object.fromEntries(r.orders.map(o => [o.key, o]));
    assert.equal(by.late.late, true);
    assert.equal(by.late.placed, 1000);
    assert.equal(by.past.past, true);
    assert.equal(by.past.placed, 0);
    assert.equal(by.past.left, 1000);
});

test('per-line override: 0 = that line off even on a working day, > 0 = it works on a unit off day', () => {
    const L2 = { ...LINE, id : 2, name : 'Line 02' };
    const r = simulateUnit({ unitId : 3, lines : [LINE, L2], calendar : cal({}, { 1 : { '2026-11-02' : 0 }, 2 : { '2026-11-06' : 8 } }), busy : [], profiles : {},
        orders : [{ key : 'H', qty : 100000, smv : 10, pcd : '2026-11-10', ship : '2026-11-14', productType : 'Pant' }] }, TODAY);
    // window 2 Nov → 7 Nov; line 1 off on 2 Nov → the order starts on line 2 (6 Nov is a Friday, line 2 works 8 h)
    const o = r.orders[0];
    const l2 = o.lines.find(l => l.id === 2), l1 = o.lines.find(l => l.id === 1);
    assert.ok(l2 && l1);
    near(o.days['2026-11-06'], Math.round(1440 * 100000 / 103000));   // only line 2, 8 h × 180 / h
});

test('pickCurve: the unit\'s own 3-step curve, else the shared one, by name order', () => {
    const rows = [
        { curve_name : 'MBM 3 Days', period_days : 3, unit_id : null, day_number : 1, efficiency_pct : 35 },
        { curve_name : 'MBM 3 Days', period_days : 3, unit_id : null, day_number : 2, efficiency_pct : 70 },
        { curve_name : 'MBM 3 Days', period_days : 3, unit_id : null, day_number : 3, efficiency_pct : 100 },
        { curve_name : '2 Days', period_days : 3, unit_id : null, day_number : 1, efficiency_pct : 25 },
        { curve_name : '2 Days', period_days : 3, unit_id : null, day_number : 2, efficiency_pct : 55 },
        { curve_name : '2 Days', period_days : 3, unit_id : null, day_number : 3, efficiency_pct : 100 },
        { curve_name : 'CEIL own', period_days : 3, unit_id : 2, day_number : 1, efficiency_pct : 50 },
        { curve_name : 'CEIL own', period_days : 3, unit_id : 2, day_number : 2, efficiency_pct : 80 },
        { curve_name : 'CEIL own', period_days : 3, unit_id : 2, day_number : 3, efficiency_pct : 100 }
    ].sort((a, b) => a.curve_name.localeCompare(b.curve_name) || a.day_number - b.day_number);
    assert.deepEqual(pickCurve(rows, 2).pct, [50, 80, 100]);
    assert.deepEqual(pickCurve(rows, 3).pct, [25, 55, 100]);
    assert.equal(pickCurve([], 3), null);
});

test('simulateAllocation tags every order with its unit and never exceeds the order qty', () => {
    const r = simulateAllocation({ today : TODAY, units : [
        { unitId : 1, lines : [LINE], calendar : cal(), busy : [], profiles : {}, orders : [{ key : 'a', qty : 777, smv : 10, pcd : '2026-11-10', ship : '2026-12-01', productType : 'Pant' }] },
        { unitId : 2, lines : [], calendar : cal(), busy : [], profiles : {}, orders : [{ key : 'b', qty : 10, smv : 10, pcd : '2026-11-10', ship : '2026-12-01', productType : 'Pant' }] }
    ] });
    assert.equal(r.orders.length, 2);
    assert.equal(r.orders[0].unit, 1);
    assert.equal(r.orders[0].placed + r.orders[0].left, 777);
    assert.equal(r.orders[1].placed, 0);          // no lines → nothing planned
    assert.equal(r.orders[1].left, 10);
});
