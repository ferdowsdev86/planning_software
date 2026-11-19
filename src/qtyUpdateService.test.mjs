import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planQtyChange, orderShares, qtyTol } from './qtyUpdateService.mjs';

const line = (key, qty, o = {}) => ({ key, qty, ...o });
const hold = (key, qty, o = {}) => ({ key, qty, hold : true, ...o });

test('27H1LEV193: planned 1,340, the ERP order is 2,700 now (plan 2,781) — the bar takes the new quantity', () => {
    const r = planQtyChange({ need : 2781, pieces : [line('a', 1340)] });
    assert.equal(r.kind, 'apply');
    assert.equal(r.diff, 1441);
    assert.deepEqual(r.changes, [{ key : 'a', qty : 2781 }]);
    assert.equal(r.toHold, 0);
    assert.equal(r.blocked, 0);
});

test('no room behind the bar: it grows into the free time, the rest goes to the Holding Row', () => {
    const r = planQtyChange({ need : 2781, pieces : [line('a', 1340, { room : 600 })] });
    assert.equal(r.kind, 'apply');
    assert.deepEqual(r.changes, [{ key : 'a', qty : 1940 }]);
    assert.equal(r.toHold, 841);
    // no room at all: everything missing to the Holding Row, the bar untouched
    const z = planQtyChange({ need : 2781, pieces : [line('a', 1340, { room : 0 })] });
    assert.deepEqual(z.changes, []);
    assert.equal(z.toHold, 1441);
});

test('the order already has a bar on the Holding Row: the rest joins it, no second Holding bar', () => {
    const r = planQtyChange({ need : 3000, pieces : [line('a', 1000, { room : 500 }), hold('h', 200)] });
    assert.deepEqual(r.changes, [{ key : 'a', qty : 1500 }, { key : 'h', qty : 1500 }]);
    assert.equal(r.toHold, 0);
});

test('the bar is under the plan lock: nothing moves, the missing quantity is unplanned', () => {
    const r = planQtyChange({ need : 2781, pieces : [line('a', 1340, { locked : true })] });
    assert.equal(r.kind, 'locked');
    assert.deepEqual(r.changes, []);
    assert.equal(r.toHold, 0);
    assert.equal(r.blocked, 1441);
    // the board itself cannot be changed (read only / plan locked by someone else)
    const b = planQtyChange({ need : 2781, pieces : [line('a', 1340)], boardLocked : true });
    assert.equal(b.kind, 'locked');
    assert.equal(b.blocked, 1441);
});

test('a split order: the LAST bar on a line takes the change; its lock decides', () => {
    const free = planQtyChange({ need : 25510, pieces : [line('p1', 5247), line('p2', 7987)] });
    assert.deepEqual(free.changes, [{ key : 'p2', qty : 20263 }]);
    const locked = planQtyChange({ need : 25510, pieces : [line('p1', 5247), line('p2', 7987, { locked : true })] });
    assert.equal(locked.kind, 'locked');
    assert.equal(locked.blocked, 12276);
    // an early piece under the lock does not block the later, free one
    const early = planQtyChange({ need : 25510, pieces : [line('p1', 5247, { locked : true }), line('p2', 7987)] });
    assert.equal(early.kind, 'apply');
    assert.deepEqual(early.changes, [{ key : 'p2', qty : 20263 }]);
});

test('an order only on the Holding Row: the Holding bar takes the new quantity', () => {
    const r = planQtyChange({ need : 5000, pieces : [hold('h', 3000)] });
    assert.deepEqual(r.changes, [{ key : 'h', qty : 5000 }]);
    assert.equal(r.toHold, 0);
});

test('the order shrank: the Holding Row gives first, then the last bar on a line; never below what is made', () => {
    const r = planQtyChange({ need : 2000, pieces : [line('a', 2500), hold('h', 800)] });
    assert.deepEqual(r.changes, [{ key : 'h', qty : 0 }, { key : 'a', qty : 2000 }]);
    const made = planQtyChange({ need : 1000, pieces : [line('a', 2500, { min : 1800 })] });
    assert.deepEqual(made.changes, [{ key : 'a', qty : 1800 }]);
    assert.equal(made.surplus, 800);
    // a locked bar keeps its quantity
    const lk = planQtyChange({ need : 1000, pieces : [line('a', 2500, { locked : true })] });
    assert.equal(lk.kind, 'locked');
    assert.equal(lk.blocked, 0);
});

test('a rounding difference is no change', () => {
    assert.equal(qtyTol(2781), 28);
    assert.equal(qtyTol(300), 10);
    assert.equal(planQtyChange({ need : 2781, pieces : [line('a', 2760)] }).kind, 'same');
    assert.equal(planQtyChange({ need : 2781, pieces : [line('a', 2800)] }).kind, 'same');
    assert.equal(planQtyChange({ need : 2781, pieces : [] }).kind, 'same');
});

test('orderShares: an order by where it stands — line, Holding Row, rest (ERP pieces)', () => {
    // all 2,781 plan pieces on a line = the whole 2,700 order
    assert.deepEqual(orderShares({ qty : 2700, onLine : 2781 }), { line : 2700, hold : 0, rest : 0 });
    // 27H1LEV193 as it stood: 1,340 on Line 22, nothing else
    assert.deepEqual(orderShares({ qty : 2700, onLine : 1340 }), { line : 1301, hold : 0, rest : 1399 });
    // part on a line, the rest on the Holding Row
    assert.deepEqual(orderShares({ qty : 2700, onLine : 1940, onHold : 841 }), { line : 1883, hold : 817, rest : 0 });
    // only on the Holding Row
    assert.deepEqual(orderShares({ qty : 2700, onHold : 2781 }), { line : 0, hold : 2700, rest : 0 });
    // within the 10 % the list allows for: no rest
    assert.deepEqual(orderShares({ qty : 1000, onLine : 950 }), { line : 1000, hold : 0, rest : 0 });
    assert.deepEqual(orderShares({ qty : 1000 }), { line : 0, hold : 0, rest : 1000 });
    // never more than the order
    assert.deepEqual(orderShares({ qty : 1000, onLine : 5000, onHold : 500 }), { line : 1000, hold : 0, rest : 0 });
});
