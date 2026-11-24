import test from 'node:test';
import assert from 'node:assert/strict';
import { calendarState, lineOverrideOf, isLineOffDay, dayCapacityFactor } from './planningData.js';

// A Holding Row follows the unit's LINES on a date the planner changed for
// the lines only (planner, 2026-11-24: MBM Friday 04/12 — lines 10 h, unit
// calendar 0 h — a parked bar planned 0 pcs that day)
test('Holding Row: the most hours any line was given on the date; none → the unit calendar', () => {
    const saved = { overrides : calendarState.overrides, lineOverrides : calendarState.lineOverrides, days : calendarState.days };
    try {
        calendarState.days = { 0 : { hours : '12:00' }, 1 : { hours : '12:00' }, 2 : { hours : '12:00' }, 3 : { hours : '12:00' }, 4 : { hours : '12:00' }, 5 : { hours : '00:00' }, 6 : { hours : '12:00' } };
        calendarState.overrides = { '2026-12-04' : 0 };                       // the unit: Friday off
        calendarState.lineOverrides = { 18 : { '2026-12-04' : 10 }, 19 : { '2026-12-04' : 8 }, 20 : { '2026-12-05' : 13 } };
        const fri = new Date('2026-12-04T00:00:00');
        assert.equal(lineOverrideOf(fri, 'hold-F1'), 10);                       // the lines work 10 h → so does the Holding Row
        assert.equal(isLineOffDay(fri, 'hold-F1'), false);
        assert.equal(dayCapacityFactor(fri, 12, 'hold-F1'), 10 / 12);
        const sat = new Date('2026-12-05T00:00:00');
        assert.equal(lineOverrideOf(sat, 'hold-F1'), 13);
        const sun = new Date('2026-12-06T00:00:00');
        assert.equal(lineOverrideOf(sun, 'hold-F1'), undefined);                // no line figure → the unit calendar decides
        calendarState.lineOverrides = { 18 : { '2026-12-04' : 0 } };            // every line off → the Holding Row off too
        assert.equal(lineOverrideOf(fri, 'hold-F1'), 0);
        assert.equal(isLineOffDay(fri, 'hold-F1'), true);
    }
    finally { Object.assign(calendarState, saved); }
});
