import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCalendar, lineDay, simulateBar, prevRunKey } from './prodDayBars.mjs';

// Sat–Thu 08:00, 10 h; Friday off
const WEEK = { 0 : { start : 480, hours : 10 }, 1 : { start : 480, hours : 10 }, 2 : { start : 480, hours : 10 },
    3 : { start : 480, hours : 10 }, 4 : { start : 480, hours : 10 }, 5 : { start : 480, hours : 0 }, 6 : { start : 480, hours : 10 } };
const cal = (overrides = {}, lineOverrides = {}) => ({ days : WEEK, overrides, lineOverrides });
// 50 mp × 600 min × 60 % ÷ SMV 10 = 1,800 pcs / day
const LINE = { id : 1, name : 'Line 01', manpower : 50, eff : 60, hours : 10 };
const bar = (o = {}) => ({ start : '2026-11-01T08:00:00', end : '2026-11-04T18:00:00', qty : 5000, made : 0, smv : 10,
    productType : 'Pant', buyer : 'X', style : 'A1234-1', prevKey : null, ...o });

test('full days at line speed, the last day takes the remainder', () => {
    const r = simulateBar({ cal : cal(), profiles : {}, curve : null }, LINE, bar(), '2026-11-04');
    assert.equal(r.days.get('2026-11-01'), 1800);
    assert.equal(r.days.get('2026-11-02'), 1800);
    assert.equal(r.days.get('2026-11-03'), 1400);          // 5000 − 3600
    assert.equal(r.days.get('2026-11-04'), undefined);     // nothing left
});

test('production already made is cut off the front; a half-day start window halves the first day', () => {
    const r = simulateBar({ cal : cal(), profiles : {}, curve : null }, LINE, bar({ made : 1000, start : '2026-11-01T13:00:00' }), '2026-11-02');
    assert.equal(r.days.get('2026-11-01'), 900);           // 5 of 10 hours
    assert.equal(r.days.get('2026-11-02'), 1800);
});

test('Build up curve ramps the first working days only when the line changes style; Friday is skipped', () => {
    const curve = { pct : [50, 70, 85] };
    const ctx = { cal : cal(), profiles : {}, curve };
    const changed = simulateBar(ctx, LINE, bar({ start : '2026-11-05T08:00:00', end : '2026-11-10T18:00:00', qty : 20000, prevKey : 'pant|b9999' }), '2026-11-08');
    assert.equal(changed.days.get('2026-11-05'), 900);     // Thu 50 %
    assert.equal(changed.days.get('2026-11-06'), undefined); // Fri off
    assert.equal(changed.days.get('2026-11-07'), 1260);    // Sat 70 %
    assert.equal(changed.days.get('2026-11-08'), 1530);    // Sun 85 %
    const same = simulateBar(ctx, LINE, bar({ start : '2026-11-05T08:00:00', end : '2026-11-10T18:00:00', qty : 20000, prevKey : 'pant|a1234' }), '2026-11-05');
    assert.equal(same.days.get('2026-11-05'), 1800);
});

test('calendar: unit override, line override and the weekday default', () => {
    const c = buildCalendar(
        [{ unit_id : 2, interval_type : 'working', weekday_no : 1, start_time : '08:00', end_time : '18:00' }],
        [{ unit_id : 2, resource_id : null, d : '2026-11-02', n : 'HOURS=12' }, { unit_id : 2, resource_id : 7, d : '2026-11-02', n : 'HOURS=0' }], 2);
    const mon = new Date('2026-11-02T00:00:00');
    assert.equal(lineDay(c, { id : 1, hours : 10 }, mon).minutes, 720);   // unit override 12 h
    assert.equal(lineDay(c, { id : 7, hours : 10 }, mon).minutes, 0);     // line off
    assert.equal(lineDay(c, { id : 1, hours : 9 }, new Date('2026-11-09T00:00:00')).minutes, 540); // line's own hours
});

test('prevRunKey: the run that ended right before the bar, not a later one', () => {
    const bars = [
        { id : 1, end : '2026-11-01T18:00:00', productType : 'Pant', style : 'A1234' },
        { id : 2, end : '2026-11-03T18:00:00', productType : 'Shorts', style : 'Z9999' }
    ];
    assert.equal(prevRunKey(bars, '2026-11-02T08:00:00'), 'pant|a1234');
    assert.equal(prevRunKey(bars, '2026-11-04T08:00:00'), 'shorts|z9999');
    assert.equal(prevRunKey(bars, '2026-10-20T08:00:00'), null);
});
