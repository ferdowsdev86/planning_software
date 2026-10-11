import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allotByPieces, queueGroupsIntoPieces } from './confirmReplaceService.mjs';

const sum = a => a.reduce((x, y) => x + y, 0);

test('one piece takes everything', () => {
    assert.deepEqual(allotByPieces([2060], 11124), [11124]);
});

test('line + holding row pieces share the confirmed qty by their own quantities', () => {
    // projection split 6,000 on Line 01 + 4,000 on the Holding Row; confirmed 11,124
    const a = allotByPieces([6000, 4000], 11124);
    assert.equal(sum(a), 11124);
    assert.ok(a[0] > a[1]);
    assert.ok(Math.abs(a[0] - 11124 * 0.6) <= 1);
});

test('rounding keeps the total and every piece ≥ 1', () => {
    for (const [pieces, total] of [[[333, 777, 101], 1211], [[1, 1, 1], 7], [[500, 500], 1001], [[10, 2000], 3]]) {
        const a = allotByPieces(pieces, total);
        assert.equal(sum(a), total, JSON.stringify([pieces, total]));
        if (total >= pieces.length) for (const v of a) assert.ok(v >= 1);
    }
});

test('three POs flow through two pieces: PO 2 is split between them, nothing moves', () => {
    const groups = [{ g : 'A', qty : 3708 }, { g : 'B', qty : 3708 }, { g : 'C', qty : 3708 }];
    const allot = allotByPieces([6000, 4000], 11124);          // ≈ 6674 / 4450
    const items = queueGroupsIntoPieces(groups, allot);
    assert.equal(items.length, 2);
    assert.equal(sum(items[0].map(i => i.qty)), allot[0]);
    assert.equal(sum(items[1].map(i => i.qty)), allot[1]);
    assert.deepEqual(items[0].map(i => i.g), ['A', 'B']);      // piece 1: all of A + part of B
    assert.deepEqual(items[1].map(i => i.g), ['B', 'C']);      // piece 2: rest of B + all of C
    assert.equal(items[0][1].qty + items[1][0].qty, 3708);     // B intact across both
});

test('one PO over three pieces is split three ways', () => {
    const items = queueGroupsIntoPieces([{ g : 'A', qty : 900 }], allotByPieces([300, 300, 300], 900));
    assert.deepEqual(items.map(p => p.map(i => i.qty)), [[300], [300], [300]]);
});

test('more groups than pieces: a piece holds several whole groups in order', () => {
    const items = queueGroupsIntoPieces([{ g : 'A', qty : 100 }, { g : 'B', qty : 100 }, { g : 'C', qty : 100 }], [300]);
    assert.deepEqual(items[0].map(i => i.g), ['A', 'B', 'C']);
});
