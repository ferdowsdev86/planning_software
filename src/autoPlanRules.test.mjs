import test from 'node:test';
import assert from 'node:assert/strict';
import { lockWindow, overlapsLock, holdReason, searchFrom, remainingToPlan, attributeErpOutput, AP_HOLD_LOCK, isLockHold } from './autoPlanRules.mjs';

const d = s => new Date(`${s}T00:00:00`);
const ymd = x => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;

test('10-day lock: today … today + 9 inclusive, first editable day = today + 10', () => {
    const w = lockWindow(new Date('2026-11-14T15:30:00'));
    assert.equal(ymd(w.from), '2026-11-14');
    assert.equal(ymd(w.lastLocked), '2026-11-23');
    assert.equal(ymd(w.firstEditable), '2026-11-24');
});

test('30-day lock option: today … today + 29 locked, first editable day = today + 30, hold reason names the length', () => {
    const w = lockWindow(d('2026-11-19'), 30);
    assert.equal(w.days, 30);
    assert.equal(ymd(w.from), '2026-11-19');
    assert.equal(ymd(w.lastLocked), '2026-12-18');
    assert.equal(ymd(w.firstEditable), '2026-12-19');
    assert.equal(overlapsLock('2026-12-18T08:00', '2026-12-22T17:00', w), true);    // starts on the last locked day
    assert.equal(overlapsLock('2026-12-19T08:00', '2026-12-22T17:00', w), false);   // starts on the first editable day
    assert.equal(holdReason(d('2026-12-18'), w), '30-Day Plan Lock');
    assert.equal(holdReason(d('2026-12-19'), w), null);
    assert.equal(isLockHold('30-Day Plan Lock'), true);
    assert.equal(isLockHold(AP_HOLD_LOCK), true);
    assert.equal(isLockHold('Capacity'), false);
    assert.equal(lockWindow(d('2026-11-19')).days, 10);                               // default unchanged
    assert.equal(holdReason(d('2026-11-20'), lockWindow(d('2026-11-19'))), AP_HOLD_LOCK);
});

test('a bar overlaps the lock when any part of it is inside today … today + 9', () => {
    const w = lockWindow(d('2026-11-14'));
    assert.equal(overlapsLock('2026-11-10T08:00', '2026-11-14T10:00', w), true);    // ends today
    assert.equal(overlapsLock('2026-11-23T08:00', '2026-12-05T17:00', w), true);    // starts on the last locked day
    assert.equal(overlapsLock('2026-11-01T08:00', '2026-11-13T17:00', w), false);   // ended yesterday
    assert.equal(overlapsLock('2026-11-24T08:00', '2026-11-30T17:00', w), false);   // starts on the first editable day
});

test('Holding: earliest sewing start on the LAST locked day is held; on the FIRST editable day it is not', () => {
    const w = lockWindow(d('2026-11-14'));
    assert.equal(holdReason(d('2026-11-23'), w), AP_HOLD_LOCK);
    assert.equal(holdReason(d('2026-11-14'), w), AP_HOLD_LOCK);
    assert.equal(holdReason(d('2026-11-24'), w), null);
    assert.equal(ymd(searchFrom(d('2026-11-24'), w)), '2026-11-24');                // can be scheduled that day
    assert.equal(ymd(searchFrom(d('2026-12-10'), w)), '2026-12-10');
});

test('a held order is looked at again: once its earliest sewing start is past, it is searched from the first editable day', () => {
    const held = d('2026-11-20');
    assert.equal(holdReason(held, lockWindow(d('2026-11-14'))), AP_HOLD_LOCK);
    const later = lockWindow(d('2026-11-21'));                                       // a week on
    assert.equal(holdReason(held, later), null);
    assert.equal(ymd(searchFrom(held, later)), '2026-12-01');
});

test('spec example: PO 10,000 · sewing output 3,500 · locked bars cover 2,000 unfinished → at most 4,500 more', () => {
    const now = d('2026-11-14');
    const locked = { base : 2000, made : 0, kept : true, start : d('2026-11-16'), end : d('2026-11-19') };   // inside the lock, not started yet
    const r = remainingToPlan({ rowsQty : 10000, erpSewn : 3500, now, bars : [
        { base : 3500, made : 0, kept : false, start : d('2026-10-20'), end : d('2026-10-30') },      // the old bar the output came from
        locked
    ] });
    assert.deepEqual(r, { remaining : 6500, sewn : 3500, cover : 2000, toPlan : 4500 });
    // the same when the old bar is no longer on the board
    assert.equal(remainingToPlan({ rowsQty : 10000, erpSewn : 3500, now, bars : [locked] }).toPlan, 4500);
});

test('remaining = MAX(0, order qty − output): fully sewn or over-sewn → nothing to plan', () => {
    assert.equal(remainingToPlan({ rowsQty : 500, erpSewn : 500 }).toPlan, 0);
    assert.equal(remainingToPlan({ rowsQty : 500, erpSewn : 640 }).toPlan, 0);
    assert.equal(remainingToPlan({ rowsQty : 800, erpSewn : 0 }).toPlan, 800);
});

test('a running locked bar covers only what it still has to make (ERP output the board does not hold yet)', () => {
    // 6,000 order; a locked bar of 4,000 half-way through its span; the ERP shows 1,500 sewn, the board nothing
    const r = remainingToPlan({ rowsQty : 6000, erpSewn : 1500, now : d('2026-11-14'),
        bars : [{ base : 4000, made : 0, kept : true, start : d('2026-11-04'), end : d('2026-11-24') }] });
    assert.deepEqual(r, { remaining : 4500, sewn : 1500, cover : 2500, toPlan : 2000 });
});

test('output never counts on a bar that has not started, and at most the passed share of a running bar', () => {
    const now = d('2026-11-14');
    // not started: its whole quantity stays covered
    assert.equal(remainingToPlan({ rowsQty : 6000, erpSewn : 1500, now, bars : [{ base : 4000, kept : true, start : d('2026-11-16'), end : d('2026-11-22') }] }).cover, 4000);
    // a quarter of the span passed: at most 1,000 of its 4,000 can be the output
    assert.equal(remainingToPlan({ rowsQty : 6000, erpSewn : 1500, now, bars : [{ base : 4000, kept : true, start : d('2026-11-12'), end : d('2026-11-20') }] }).cover, 3000);
});

test('locked bars that already cover everything left: no new allocation (never a duplicate)', () => {
    const r = remainingToPlan({ rowsQty : 3000, erpSewn : 1000, now : d('2026-11-14'), bars : [{ base : 3000, made : 0, kept : true, start : d('2026-11-15'), end : d('2026-11-20') }] });
    assert.equal(r.cover, 3000);
    assert.equal(r.toPlan, 0);
});

test('production the board holds but the ERP does not (entered by hand, finished strips) counts as sewn', () => {
    const r = remainingToPlan({ rowsQty : 5000, erpSewn : 0, doneRemoved : 1000, bars : [
        { base : 2000, made : 800, kept : true, start : d('2026-11-10') },
        { base : 1000, completed : true, kept : true, start : d('2026-11-01') }
    ] });
    assert.equal(r.sewn, 2800);          // 1,000 finished strip + 800 made + 1,000 completed bar
    assert.equal(r.cover, 1200);         // the locked bar still has 1,200 to make
    assert.equal(r.toPlan, 1000);
});

test('quantity an earlier run lost comes back: nothing sewn, a 25,000 order with one 8,334 bar re-planned in full', () => {
    const r = remainingToPlan({ rowsQty : 25000, erpSewn : 0, bars : [{ base : 8334, made : 0, kept : false, start : d('2026-12-01') }] });
    assert.equal(r.toPlan, 25000);
});

test('running twice on the same inputs gives the same allocation', () => {
    const input = { rowsQty : 10000, erpSewn : 3500, now : d('2026-11-14'), bars : [{ base : 2000, made : 0, kept : true, start : d('2026-11-16'), end : d('2026-11-19') }] };
    const first = remainingToPlan(input);
    // second run: the bar the first run created (4,500) is beyond the lock → it leaves and is planned again
    const second = remainingToPlan({ ...input, bars : [...input.bars, { base : first.toPlan, made : 0, kept : false, start : d('2026-11-25'), end : d('2026-12-05') }] });
    assert.equal(first.toPlan, 4500);
    assert.equal(second.toPlan, 4500);
});

test('ERP output on the board: 26H1LEV467 — PO 5,666, 3,801 sewn, one past bar → 3,801 done, the rest remains', () => {
    const m = attributeErpOutput({ erpSewn : 3801, now : d('2026-11-14'), bars : [{ id : 'db-3671', base : 5666, hand : 0, start : d('2026-10-18') }] });
    assert.equal(m.get('db-3671'), 3801);
    assert.equal(5666 - m.get('db-3671'), 1865);
});

test('ERP output on the board: planned order, started bars only, never beyond a bar, never twice with hand entries', () => {
    const now = d('2026-11-14');
    const bars = [
        { id : 'a', base : 2000, hand : 0, start : d('2026-10-20') },
        { id : 'b', base : 3000, hand : 0, start : d('2026-11-10') },
        { id : 'c', base : 4000, hand : 0, start : d('2026-11-25') }       // not started
    ];
    const m = attributeErpOutput({ erpSewn : 4500, now, bars });
    assert.deepEqual([m.get('a'), m.get('b'), m.get('c')], [2000, 2500, undefined]);
    // more output than the started bars hold: the rest is shown on no bar (never on a future bar)
    const big = attributeErpOutput({ erpSewn : 8000, now, bars });
    assert.deepEqual([big.get('a'), big.get('b'), big.get('c')], [2000, 3000, undefined]);
    // production already entered by hand is not counted again
    const hand = attributeErpOutput({ erpSewn : 2500, now, bars : [{ id : 'a', base : 2000, hand : 1800, start : d('2026-10-20') }, { id : 'b', base : 3000, hand : 0, start : d('2026-11-10') }] });
    assert.deepEqual([hand.get('a'), hand.get('b')], [200, 500]);
    // the board holds more than the ERP: nothing is added
    assert.equal(attributeErpOutput({ erpSewn : 1000, now, bars : [{ id : 'a', base : 2000, hand : 1500, start : d('2026-10-20') }] }).size, 0);
    // a finished strip that left the board already took its share
    assert.equal(attributeErpOutput({ erpSewn : 3000, doneRemoved : 3000, now, bars : [{ id : 'b', base : 3000, hand : 0, start : d('2026-11-10') }] }).size, 0);
});

test('planning group: the same delivery always joins; a later delivery (≤ 10 days) only while the group stays ≤ 10,000; beyond the window never (planner 2026-11-22, GSL-251164)', async () => {
    const { joinsDeliveryGroup, AP_GROUP_SMALL_QTY, AP_GROUP_DELIVERY_WINDOW_DAYS } = await import('./autoPlanRules.mjs');
    assert.equal(AP_GROUP_SMALL_QTY, 10000);
    assert.equal(AP_GROUP_DELIVERY_WINDOW_DAYS, 10);
    // GSL-251164: 30,397 pcs due 08/12 — the 15/12 rows (7 days later) do NOT join: the group is big
    assert.equal(joinsDeliveryGroup({ groupShip : d('2026-12-08'), groupQty : 30397, rowShip : d('2026-12-15'), rowQty : 343 }), false);
    // …another colour of the SAME 08/12 delivery joins, however big the group
    assert.equal(joinsDeliveryGroup({ groupShip : d('2026-12-08'), groupQty : 30397, rowShip : new Date('2026-12-08T10:00:00'), rowQty : 5379 }), true);
    // 2620BES060-like: small rows, deliveries 7 days apart → together (first delivery counts)
    assert.equal(joinsDeliveryGroup({ groupShip : d('2026-12-21'), groupQty : 2400, rowShip : d('2026-12-28'), rowQty : 1800 }), true);
    // …but the row that would take the group over 10,000 opens its own group
    assert.equal(joinsDeliveryGroup({ groupShip : d('2026-12-21'), groupQty : 8200, rowShip : d('2026-12-28'), rowQty : 1900 }), false);
    assert.equal(joinsDeliveryGroup({ groupShip : d('2026-12-21'), groupQty : 8200, rowShip : d('2026-12-28'), rowQty : 1800 }), true);
    // exactly 10 days later still inside the window; 11 days is a later wave
    assert.equal(joinsDeliveryGroup({ groupShip : d('2026-12-21'), groupQty : 100, rowShip : d('2026-12-31'), rowQty : 100 }), true);
    assert.equal(joinsDeliveryGroup({ groupShip : d('2026-12-21'), groupQty : 100, rowShip : d('2027-01-01'), rowQty : 100 }), false);
    // no date → no group
    assert.equal(joinsDeliveryGroup({ groupShip : null, groupQty : 1, rowShip : d('2026-12-21'), rowQty : 1 }), false);
});
