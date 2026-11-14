import test from 'node:test';
import assert from 'node:assert/strict';
import { pickSourceWinners, mrSourceOkSql, mrSourceOkRow, sqlNotIn, osPoColorQtySql } from './orderSources.mjs';

test('mr source rule: os_status 0 and a planning unit only', () => {
    assert.equal(mrSourceOkRow({ os_status : 0, prod_unit : 3 }), true);
    assert.equal(mrSourceOkRow({ os_status : null, prod_unit : 1 }), true);    // never handed to OS
    assert.equal(mrSourceOkRow({ os_status : 1, prod_unit : 3 }), false);
    assert.equal(mrSourceOkRow({ os_status : 2, prod_unit : 2 }), false);
    assert.equal(mrSourceOkRow({ os_status : 0, prod_unit : 16 }), false);     // GSL is not a planning board
    assert.match(mrSourceOkSql('oe'), /oe\.os_status, 0\) = 0 AND oe\.prod_unit IN \(1,2,3\)/);
    assert.match(mrSourceOkSql(''), /^COALESCE\(os_status, 0\) = 0 AND prod_unit IN/);
});

test('sqlNotIn: empty list adds nothing, ids are numeric only', () => {
    assert.equal(sqlNotIn('oe.order_id', []), '');
    assert.equal(sqlNotIn('oe.order_id', [5, '7', 5, 'x; DROP']), ' AND oe.order_id NOT IN (5,7)');
});

test('one source per order: confirm data beats a projection-only source', () => {
    // ERP has POs, the OS order is projection only → ERP wins, the OS order is dropped
    const a = pickSourceWinners([{ mrOrderId : 10, mrOrderCode : 'A', osOrderId : 900, osOrderCode : 'GSL-1', mrHasConfirm : 1, osHasConfirm : 0 }]);
    assert.deepEqual([...a.mrLosers], []);
    assert.deepEqual([...a.osLosers], [900]);
    assert.equal(a.decisions[0].winner, 'mr');
    // the OS order has PO–colour rows, ERP is projection only → OS wins
    const b = pickSourceWinners([{ mrOrderId : 11, osOrderId : 901, mrHasConfirm : 0, osHasConfirm : 1 }]);
    assert.deepEqual([...b.mrLosers], [11]);
    assert.deepEqual([...b.osLosers], []);
});

test('one source per order: a tie falls back to os_orders (both confirm, or both projection only)', () => {
    const both = pickSourceWinners([{ mrOrderId : 12, osOrderId : 902, mrHasConfirm : 1, osHasConfirm : 1 }]);
    assert.deepEqual([...both.mrLosers], [12]);
    assert.equal(both.decisions[0].rule, 'tie — os_orders fallback');
    const none = pickSourceWinners([{ mrOrderId : 13, osOrderId : 903, mrHasConfirm : 0, osHasConfirm : 0 }]);
    assert.deepEqual([...none.mrLosers], [13]);
    assert.deepEqual([...none.osLosers], []);
});

test('one source per order: the whole order goes one way, even with several OS orders and different PO sets', () => {
    // one ERP order split over two OS orders; only one of them has PO rows —
    // the decision is made per business order, never per PO / colour
    const r = pickSourceWinners([
        { mrOrderId : 20, osOrderId : 910, mrHasConfirm : 1, osHasConfirm : 0 },
        { mrOrderId : 20, osOrderId : 911, mrHasConfirm : 1, osHasConfirm : 1 }
    ]);
    assert.deepEqual([...r.mrLosers], [20]);          // tie (both sides have confirm data) → os_orders
    assert.deepEqual([...r.osLosers], []);
    assert.equal(r.decisions.length, 1);
    const s = pickSourceWinners([
        { mrOrderId : 21, osOrderId : 920, mrHasConfirm : 1, osHasConfirm : 0 },
        { mrOrderId : 21, osOrderId : 921, mrHasConfirm : 1, osHasConfirm : 0 }
    ]);
    assert.deepEqual([...s.mrLosers], []);
    assert.deepEqual([...s.osLosers].sort(), [920, 921]);   // every OS record of the order is dropped
});

test('orders in one source only are never touched', () => {
    const r = pickSourceWinners([]);
    assert.equal(r.mrLosers.size + r.osLosers.size, 0);
});

test('OS PO–colour quantity: sizes are reduced to one row per size key before they are summed', () => {
    const sql = osPoColorQtySql('mbm_os');
    assert.match(sql, /GROUP BY cs\.os_order_id, cs\.po_id, cs\.clr_id, cs\.mr_product_size_id/);
    assert.match(sql, /GROUP BY z\.os_order_id, z\.po_id, z\.clr_id/);
    assert.match(sql, /NOT EXISTS \(SELECT 1 FROM `mbm_os`\.os_order_color_size x WHERE x\.os_order_id = c\.os_order_id\)/);
});
