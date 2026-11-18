import { test } from 'node:test';
import assert from 'node:assert/strict';
import { placeBarTip } from './tipPlace.mjs';

const view = { w : 1600, h : 900 };
const card = { w : 460, h : 520 };
const bar  = (x, y, w = 180, h = 40) => ({ x, y, right : x + w, bottom : y + h });
const below = (p, b) => p.y >= b.bottom;
const above = (p, b, c = card) => p.y + c.h <= b.y;
const inView = (p, c = card, v = view) => p.x >= 0 && p.y >= 0 && p.x + c.w <= v.w && p.y + c.h <= v.h;

test('room on the right: the card stands right of the bar, top on the bar line', () => {
    const b = bar(400, 200);
    const p = placeBarTip({ bar : b, card, view });
    assert.equal(p.zone, 'right');
    assert.equal(p.x, b.right + 6);
    assert.equal(p.y, 200);
    assert.ok(inView(p));
});

test('no room on the right: left of the bar', () => {
    const b = bar(1300, 200);
    const p = placeBarTip({ bar : b, card, view });
    assert.equal(p.zone, 'left');
    assert.equal(p.x + card.w, b.x - 6);
    assert.equal(p.y, 200);
});

test('a bar low on the screen: still beside it, slid up to stay in the window — never above', () => {
    const b = bar(400, 820);
    const p = placeBarTip({ bar : b, card, view });
    assert.equal(p.zone, 'right');
    assert.equal(p.y, view.h - 8 - card.h);
    assert.ok(inView(p));
    assert.ok(p.x >= b.right, 'beside the bar, not over it');
    assert.ok(!above(p, b));
});

test('a bar as wide as the board: below it, centred on the pointer', () => {
    const b = bar(260, 150, 1340);
    const p = placeBarTip({ bar : b, card, view, mouse : { x : 900, y : 170 } });
    assert.equal(p.zone, 'below');
    assert.ok(below(p, b));
    assert.equal(p.x, 900 - card.w / 2);
    // pointer near the edge: the card stays inside the window
    const q = placeBarTip({ bar : b, card, view, mouse : { x : 1580, y : 170 } });
    assert.equal(q.x + card.w, view.w - 8);
});

test('wide bar AND low on the screen: beside the pointer, never above the bar', () => {
    const b = bar(260, 800, 1340);
    const p = placeBarTip({ bar : b, card, view, mouse : { x : 600, y : 820 } });
    assert.equal(p.zone, 'cursor-right');
    assert.equal(p.x, 616);
    assert.ok(inView(p));
    assert.ok(!above(p, b));
    const q = placeBarTip({ bar : b, card, view, mouse : { x : 1400, y : 820 } });
    assert.equal(q.zone, 'cursor-left');
    assert.equal(q.x + card.w, 1400 - 16);
    assert.ok(!above(q, b));
});

test('no zone is ever "above", whatever the bar and the window', () => {
    for (const v of [{ w : 1920, h : 1080 }, { w : 1366, h : 768 }, { w : 1024, h : 600 }, { w : 800, h : 500 }]) {
        for (const c of [{ w : 340, h : 300 }, { w : 460, h : 520 }, { w : 460, h : 2000 }]) {
            for (let x = 0; x < v.w; x += 90) for (let y = 60; y < v.h - 40; y += 70) for (const w of [20, 200, 900, 3000]) {
                const b = { x, y, right : Math.min(x + w, v.w), bottom : y + 40 };
                const m = { x : Math.min(b.right, x + 10), y : y + 20 };
                const p = placeBarTip({ bar : b, card : c, view : v, mouse : m });
                const h = Math.min(c.h, v.h - 16), wd = Math.min(c.w, v.w - 16);
                assert.ok(!(p.y + h <= b.y), `above: ${JSON.stringify({ v, c, b, p })}`);
                assert.ok(p.x >= 8 - 1e-9 && p.x + wd <= v.w - 8 + 1e-9 && p.y >= 8 && p.y + h <= v.h - 8, `outside: ${JSON.stringify({ v, c, b, p })}`);
                if (p.zone === 'right') assert.ok(p.x >= b.right);
                if (p.zone === 'left')  assert.ok(p.x + wd <= b.x);
                if (p.zone === 'below') assert.ok(p.y >= b.bottom);
            }
        }
    }
});
