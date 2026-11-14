import test from 'node:test';
import assert from 'node:assert/strict';
import { qtyMadeBy, cursorSplit } from './splitRules.mjs';

const at = (day, hm) => +new Date(`2026-11-${day}T${hm}:00`);
// a bar of 16,364 pcs: starts 14/11 at 13:00 (half a day), then full days 08:00–18:00
const days = [
    { ws : at(14, '13:00'), we : at(14, '18:00'), q : 1000 },
    { ws : at(15, '08:00'), we : at(15, '18:00'), q : 2000 },
    { ws : at(16, '08:00'), we : at(16, '18:00'), q : 2000 },
    { ws : at(17, '08:00'), we : at(17, '18:00'), q : 0 },          // off day
    { ws : at(18, '08:00'), we : at(18, '18:00'), q : 2000 }
];

test('the cut is the cursor\'s moment inside the day — not the end of that day', () => {
    // 16/11 at 10:30 = a quarter of that day's window → 1,000 + 2,000 + 500
    assert.equal(qtyMadeBy(days, at(16, '10:30')), 3500);
    assert.deepEqual(cursorSplit({ qty : 7000, days, t : at(16, '10:30') }), { q1 : 3500, q2 : 3500 });
    // the old rule cut at the day's end
    assert.equal(qtyMadeBy(days, at(16, '18:00')), 5000);
});

test('the first, part day is shared over the window the bar really covers', () => {
    assert.equal(qtyMadeBy(days, at(14, '15:30')), 500);       // half of 13:00–18:00
    assert.equal(qtyMadeBy(days, at(14, '09:00')), 0);         // before the bar starts
});

test('cursor after hours / on an off day: everything made up to then, nothing more', () => {
    assert.equal(qtyMadeBy(days, at(15, '22:00')), 3000);
    assert.equal(qtyMadeBy(days, at(16, '03:00')), 3000);
    assert.equal(qtyMadeBy(days, at(17, '12:00')), 5000);      // off day
});

test('production already made stays with part 1', () => {
    assert.deepEqual(cursorSplit({ qty : 9000, already : 2000, days, t : at(15, '13:00') }), { q1 : 4000, q2 : 5000 });
});

test('no cut where the cursor leaves nothing on one side; a 1-pc bar cannot be split', () => {
    assert.equal(cursorSplit({ qty : 7000, days, t : at(14, '08:00') }), null);      // before the bar's first piece
    assert.equal(cursorSplit({ qty : 7000, days, t : at(20, '08:00') }), null);      // after its last one
    assert.equal(cursorSplit({ qty : 1, days, t : at(15, '10:00') }), null);
    // with production already made, the bar's very start is a real cut: made | still to make
    assert.deepEqual(cursorSplit({ qty : 9000, already : 2000, days, t : at(14, '08:00') }), { q1 : 2000, q2 : 7000 });
});
