import test from 'node:test';
import assert from 'node:assert/strict';
import { lockWindow, overlapsLock, holdReason, searchFrom, remainingToPlan, AP_HOLD_LOCK } from './autoPlanRules.mjs';

const d = s => new Date(`${s}T00:00:00`);
const ymd = x => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;

test('10-day lock: today … today + 9 inclusive, first editable day = today + 10', () => {
    const w = lockWindow(new Date('2026-11-14T15:30:00'));
    assert.equal(ymd(w.from), '2026-11-14');
    assert.equal(ymd(w.lastLocked), '2026-11-23');
    assert.equal(ymd(w.firstEditable), '2026-11-24');
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
