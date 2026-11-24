import test from 'node:test';
import assert from 'node:assert/strict';
import { planDedupe, uncoveredRows, dupTol } from './dedupeService.mjs';

const d = s => new Date(s).getTime();

// 26H1LEV701 (2026-11-24): 5,080-pc order, two bars on MBM Line 06+07 —
// 4,905 for its four 19/12 POs (20/12) and 5,232 for the whole order (24/12),
// the four rows on BOTH bars
const R = { 805 : 1228, 806 : 2834, 807 : 400, 808 : 300, 5805 : 318 };
const rows = ids => ids.map(id => ({ id, qty : R[id] }));
test('rows: the later bar is cut to the rows no other bar holds', () => {
    const r = planDedupe({ bars : [
        { key : 'db-12176', qty : 4905, start : d('2026-12-20T12:33'), rows : rows([806, 808, 807, 805]) },
        { key : 'db-12175', qty : 5232, start : d('2026-12-24T17:37'), rows : rows([808, 807, 806, 5805, 805]) }
    ] });
    assert.equal(r.mode, 'rows');
    assert.ok(Math.abs(r.excess - 4905) <= 1);
    assert.deepEqual(r.changes, [{ key : 'db-12175', qty : 328, rows : [5805] }]);
    assert.equal(r.left, 0);
});

test('rows: a whole copy of a PO row goes — even when the order has other rows off the board', () => {
    // 26SPNAU022: PO 77175 (1,164) on a line bar AND a parked bar, 1,199 each;
    // the order's two other rows (92 pcs) are on no bar at all
    const r = planDedupe({ bars : [
        { key : 'line', qty : 1199, start : d('2026-11-11'), rows : [{ id : 1, qty : 1164 }] },
        { key : 'hold', qty : 1199, hold : true, start : d('2026-11-18'), rows : [{ id : 1, qty : 1164 }] }
    ] });
    assert.deepEqual(r.changes, [{ key : 'hold', qty : 0 }]);
    // 26SUBOR498: 295 pcs, two 304-pc bars on Line 09 (07/01 and 01/03) — no idList, the anchor row
    const s = planDedupe({ bars : [
        { key : 'a', qty : 304, start : d('2027-01-07'), rows : [{ id : 9, qty : 295 }] },
        { key : 'b', qty : 304, start : d('2027-03-01'), rows : [{ id : 9, qty : 295 }] }
    ] });
    assert.deepEqual(s.changes, [{ key : 'b', qty : 0 }]);
});

test('rows: split pieces sharing their rows add up to the order — nothing to cut; a fourth piece goes', () => {
    const shared = [{ id : 1, qty : 6000 }, { id : 2, qty : 4000 }];
    const three = [1, 2, 3].map(k => ({ key : k, qty : 3434, start : k, rows : shared }));
    const ok = planDedupe({ bars : three });
    assert.equal(ok.excess, 0);
    assert.deepEqual(ok.changes, []);
    const four = planDedupe({ bars : [...three, { key : 4, qty : 3434, start : 4, rows : shared }] });
    assert.deepEqual(four.changes, [{ key : 4, qty : 0 }]);
    assert.equal(four.left, 0);
});

test('rows: rows held by one bar only are never touched (an order that shrank is no duplicate)', () => {
    const r = planDedupe({ bars : [
        { key : 'black', qty : 1030, start : 1, rows : [{ id : 1, qty : 800 }] },
        { key : 'blue',  qty : 1030, start : 2, rows : [{ id : 2, qty : 700 }] }
    ] });
    assert.equal(r.excess, 0);
    assert.deepEqual(r.changes, []);
    // one bar alone is never a duplicate of itself
    assert.deepEqual(planDedupe({ bars : [{ key : 1, qty : 5000, rows : [{ id : 1, qty : 1000 }] }] }).changes, []);
});

test('rows: Holding Row bars give first; bars with production / under the lock never — the excess is reported', () => {
    // 26H1LEV746: 10,300 on a line + a 1,970 "rest" parked after the order was restored in full
    const r = planDedupe({ bars : [
        { key : 'line', qty : 10300, start : d('2026-11-24'), rows : [{ id : 1, qty : 10000 }] },
        { key : 'hold', qty : 1970, hold : true, start : d('2026-11-23'), rows : [{ id : 1, qty : 10000 }] }
    ] });
    assert.deepEqual(r.changes, [{ key : 'hold', qty : 0 }]);
    const f = planDedupe({ bars : [
        { key : 'a', qty : 4905, start : 1, fixed : true, rows : rows([806, 808, 807, 805]) },
        { key : 'b', qty : 5232, start : 2, fixed : true, rows : rows([808, 807, 806, 5805, 805]) }
    ] });
    assert.deepEqual(f.changes, []);
    assert.ok(Math.abs(f.left - 4905) <= 1);
});

test('order mode (rows unknown): the bars of one order carry at most its quantity', () => {
    const r = planDedupe({ need : 5232, bars : [
        { key : 'db-12176', qty : 4905, start : d('2026-12-20T12:33') },
        { key : 'db-12175', qty : 5232, start : d('2026-12-24T17:37') }
    ] });
    assert.equal(r.mode, 'order');
    assert.deepEqual(r.changes, [{ key : 'db-12175', qty : 327 }]);
    // three synchronized split pieces, each rounded up: no duplicate
    const ok = planDedupe({ need : 10300, bars : [{ key : 1, qty : 3434, start : 1 }, { key : 2, qty : 3434, start : 2 }, { key : 3, qty : 3434, start : 3 }] });
    assert.deepEqual(ok.changes, []);
    // a sliver would be left: the bar goes with it
    const s = planDedupe({ need : 1000, bars : [{ key : 'a', qty : 1000, start : 1 }, { key : 'b', qty : 1005, start : 2 }] });
    assert.deepEqual(s.changes, [{ key : 'b', qty : 0 }]);
    // under the lock: nothing is cut, the excess is reported
    const f = planDedupe({ need : 5232, bars : [{ key : 'a', qty : 4905, start : 1, fixed : true }, { key : 'b', qty : 5232, start : 2, fixed : true }] });
    assert.deepEqual(f.changes, []);
    assert.equal(f.left, 4905);
    assert.equal(dupTol(5232), 78);
});

test('order mode: the cut-down bar keeps the rows no other bar holds — when they make its new quantity', () => {
    const idList = [37234808, 37234807, 37234806, 37235805, 37234805];
    const others = [37234806, 37234808, 37234807, 37234805];
    const rowQty = new Map([[37234808, 300], [37234807, 400], [37234806, 2834], [37235805, 318], [37234805, 1228]]);
    assert.deepEqual(uncoveredRows({ idList, others, rowQty, base : 318 }), { ids : [37235805], apply : true });
    assert.equal(uncoveredRows({ idList, others : idList, rowQty, base : 318 }).apply, false);
    assert.equal(uncoveredRows({ idList, others, rowQty, base : 1000 }).apply, false);
    assert.deepEqual(uncoveredRows({ idList, others, base : 318 }), { ids : [37235805], apply : true });
    assert.equal(uncoveredRows({ idList, others : [], base : 5080 }).apply, false);
});
