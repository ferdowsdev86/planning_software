import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitByDelivery, mergeSameSource, shareOut } from './deliveryRows.mjs';

const d = (id, po, qty, ship, extra = {}) => ({ id, po, qty, remaining : qty, ship, ...extra });
const ymd = v => { const x = new Date(v); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
const at = s => new Date(`${s}T00:00:00`);

// 2620BES060 · COFFEE BEAN as the pool gives it: one row, 14 PO rows, 5 deliveries
const BES060 = () => ({
    id : 'dbo-66611117', dbId : 66611117, mbmOrder : '2620BES060', color : 'COFFEE BEAN', orderType : 'confirm',
    qty : 14569, baseQty : 14145, orderQty : 14145, sewn : 0, smv : 21.2, pcd : at('2026-11-21'), ship : at('2026-12-21'), poDelivery : at('2026-12-21'),
    po : 'CED4792682', poList : ['CED4792688', 'CED4792698', 'CED4792699', 'CED4792689', 'CED4792682', 'CED4792686', 'CED4792681', 'CED4792684', 'CED4792683', 'CED4792687', 'CED4792668', 'CED4792667', 'CED4806343'],
    idList : [66673443, 66646020, 66646220, 66628862, 66611117, 66611118, 66611119, 66628062, 66646620, 66646621, 66646622, 66664390, 66664391, 66647020],
    poDetails : [
        d(66673443, 'CED4792688', 150, '2026-12-21'),
        d(66646020, 'CED4792698', 15, '2026-12-28'), d(66646220, 'CED4792699', 150, '2026-12-28'),
        d(66628862, 'CED4792689', 330, '2027-01-05'),
        d(66611117, 'CED4792682', 7614, '2027-01-13'), d(66611118, 'CED4792686', 45, '2027-01-13'), d(66611119, 'CED4792681', 1885, '2027-01-13'),
        d(66628062, 'CED4792688', 612, '2027-01-13'), d(66646620, 'CED4792684', 150, '2027-01-13'), d(66646621, 'CED4792683', 45, '2027-01-13'),
        d(66646622, 'CED4792687', 60, '2027-01-13'), d(66664390, 'CED4792668', 15, '2027-01-13'), d(66664391, 'CED4792667', 60, '2027-01-13'),
        d(66647020, 'CED4806343', 3014, '2027-02-10')
    ]
});

test('shareOut: whole pieces, exact total, by largest remainder', () => {
    assert.deepEqual(shareOut(14569, [150, 165, 330, 10486, 3014]), [155, 170, 340, 10800, 3104]);
    assert.equal(shareOut(14569, [150, 165, 330, 10486, 3014]).reduce((a, b) => a + b, 0), 14569);
    assert.deepEqual(shareOut(10, [1, 1, 1]), [4, 3, 3]);
    assert.deepEqual(shareOut(7, [0, 0]), [7, 0]);
    assert.deepEqual(shareOut(0, [5, 5]), [0, 0]);
});

test('2620BES060: one colour, 5 deliveries → the 5 confirm order rows of the Orders list', () => {
    const rows = splitByDelivery(BES060(), { toDate : at });
    assert.equal(rows.length, 5);
    assert.deepEqual(rows.map(r => ymd(r.ship)), ['2026-12-21', '2026-12-28', '2027-01-05', '2027-01-13', '2027-02-10']);
    // the Plan Qty (+3 %) column of the list: 155 · 170 · 340 · 10,801 · 3,104 (one piece of rounding inside the row's 14,569)
    assert.deepEqual(rows.map(r => r.qty), [155, 170, 340, 10800, 3104]);
    assert.equal(rows.reduce((a, r) => a + r.qty, 0), 14569);
    assert.deepEqual(rows.map(r => r.orderQty), [150, 165, 330, 10486, 3014]);
    assert.deepEqual(rows.map(r => r.baseQty), [150, 165, 330, 10486, 3014]);
    // every row stands on a PO row of ITS delivery and carries only its own PO rows
    assert.deepEqual(rows.map(r => r.dbId), [66673443, 66646020, 66628862, 66611117, 66647020]);
    assert.deepEqual(rows.map(r => r.id), ['dbo-66673443', 'dbo-66646020', 'dbo-66628862', 'dbo-66611117', 'dbo-66647020']);
    assert.deepEqual(rows.map(r => r.idList.length), [1, 2, 1, 9, 1]);
    assert.deepEqual(rows[1].poList, ['CED4792698', 'CED4792699']);
    assert.equal(new Set(rows.flatMap(r => r.idList)).size, 14);
    // each knows the pool row it came from; the rest of the row is carried along
    assert.ok(rows.every(r => r.srcId === 'dbo-66611117' && r.srcParts === 5));
    assert.ok(rows.every(r => r.mbmOrder === '2620BES060' && r.color === 'COFFEE BEAN' && r.smv === 21.2));
    assert.deepEqual(rows.map(r => ymd(r.poDelivery)), rows.map(r => ymd(r.ship)));
});

test('one delivery date, no PO rows, or a balance row: the row stays as it is', () => {
    const one = { id : 'dbo-1', dbId : 1, qty : 515, poDetails : [d(1, 'A', 300, '2026-12-21'), d(2, 'B', 200, '2026-12-21')] };
    assert.deepEqual(splitByDelivery(one), [one]);
    const none = { id : 'proj:27X', qty : 900 };
    assert.deepEqual(splitByDelivery(none), [none]);
    const bal = { ...BES060(), id : 'dbo-66611117~b', balance : true };
    assert.deepEqual(splitByDelivery(bal), [bal]);
    assert.deepEqual(splitByDelivery(null), [null]);
});

test('a PO sewn in full sets no delivery: it goes with the first open one', () => {
    const row = { id : 'ck:26X:BLACK', dbId : 10, qty : 2575, baseQty : 2500, orderQty : 2900, sewn : 400,
        poDetails : [d(10, 'P1', 400, '2026-11-14', { remaining : 0, sewn : 400 }), d(11, 'P2', 1500, '2026-12-31'), d(12, 'P3', 1000, '2027-01-28')] };
    const rows = splitByDelivery(row, { toDate : at });
    assert.equal(rows.length, 2);
    assert.deepEqual(rows.map(r => ymd(r.ship)), ['2026-12-31', '2027-01-28']);
    assert.deepEqual(rows.map(r => r.qty), [1545, 1030]);
    assert.deepEqual(rows[0].idList, [11, 10]);            // the sewn PO row rides on the first bar
    assert.equal(rows[0].dbId, 11);                        // …which stands on its own delivery's row
    assert.deepEqual(rows.map(r => r.sewn), [400, 0]);
    assert.deepEqual(rows.map(r => r.orderQty), [1900, 1000]);
    assert.ok(rows.every(r => r.srcId === 'ck:26X:BLACK'));
    // only ONE delivery still open → nothing to cut
    const single = { id : 'dbo-10', dbId : 10, qty : 1030, poDetails : [d(10, 'P1', 400, '2026-11-14', { remaining : 0 }), d(12, 'P3', 1000, '2027-01-28')] };
    assert.deepEqual(splitByDelivery(single), [single]);
});

test('the row\'s quantity is what is shared out (a re-plan of the remaining quantity), never the PO sums', () => {
    // 1,000 + 3,000 open by the PO rows, but only 2,060 left to plan on this row
    const row = { id : 'dbo-1', dbId : 1, qty : 2060, baseQty : 2000, orderQty : 2000, poDetails : [d(1, 'A', 1000, '2026-12-10'), d(2, 'B', 3000, '2027-01-20')] };
    const rows = splitByDelivery(row, { toDate : at });
    assert.deepEqual(rows.map(r => r.qty), [515, 1545]);
    assert.deepEqual(rows.map(r => r.baseQty), [500, 1500]);
    assert.deepEqual(rows.map(r => r.orderQty), [500, 1500]);   // the PO rows do not add up to the row: shared out too
});

test('a delivery too small for a whole piece joins its neighbour — no bar without quantity', () => {
    const row = { id : 'dbo-1', dbId : 1, qty : 3, poDetails : [d(1, 'A', 1, '2026-12-10'), d(2, 'B', 5000, '2026-12-25'), d(3, 'C', 5000, '2027-01-20'), d(4, 'D', 1, '2027-02-20')] };
    const rows = splitByDelivery(row, { toDate : at });
    assert.ok(rows.every(r => r.qty > 0));
    assert.equal(rows.reduce((a, r) => a + r.qty, 0), 3);
    assert.equal(new Set(rows.flatMap(r => r.idList)).size, 4);
    assert.equal(ymd(rows[0].ship), '2026-12-10');      // the first delivery's date is kept
});

test('dates as the server sends them (ISO instants / Date objects) fall on their own day', () => {
    const row = { id : 'dbo-5', dbId : 5, qty : 200, poDetails : [d(5, 'A', 100, at('2026-12-21')), d(6, 'B', 50, at('2026-12-21').toISOString()), d(7, 'C', 50, at('2027-01-13'))] };
    const rows = splitByDelivery(row);
    assert.equal(rows.length, 2);
    assert.deepEqual(rows.map(r => r.qty), [150, 50]);
    assert.deepEqual(rows[0].idList, [5, 6]);
});

test('mergeSameSource: the deliveries of one colour inside a group are ONE member on the first delivery\'s row', () => {
    const [a, b, c, e] = splitByDelivery(BES060(), { toDate : at });
    // group 1 = 21/12 + 28/12 (7 days apart)
    const g1 = mergeSameSource([a, b]);
    assert.equal(g1.length, 1);
    assert.equal(g1[0].qty, 325);
    assert.equal(g1[0].orderQty, 315);
    assert.equal(g1[0].id, 'dbo-66673443');
    assert.equal(g1[0].dbId, 66673443);
    assert.equal(ymd(g1[0].ship), '2026-12-21');
    assert.deepEqual(g1[0].idList, [66673443, 66646020, 66646220]);
    assert.deepEqual(g1[0].poList, ['CED4792688', 'CED4792698', 'CED4792699']);
    assert.equal(g1[0].poDetails.length, 3);
    // group 2 = 05/01 + 13/01 (8 days apart): 11,140 pcs — over 10,000, the split rule takes it from here
    const g2 = mergeSameSource([c, e]);
    assert.equal(g2.length, 1);
    assert.equal(g2[0].qty, 11140);
    assert.equal(ymd(g2[0].ship), '2027-01-05');
    assert.equal(g2[0].dbId, 66628862);
    // the input rows are not changed
    assert.equal(a.qty, 155);
    assert.deepEqual(a.idList, [66673443]);
});

test('mergeSameSource: other colours stay members of their own; rows that were never cut are untouched', () => {
    const black = { id : 'dbo-1', dbId : 1, color : 'BLACK', qty : 1000, ship : at('2026-12-21') };
    const navyA = { id : 'dbo-2', dbId : 2, color : 'NAVY', qty : 300, orderQty : 290, idList : [2], poList : ['N1'], ship : at('2026-12-22'), srcId : 'ck:X:NAVY' };
    const navyB = { id : 'dbo-3', dbId : 3, color : 'NAVY', qty : 200, orderQty : 195, idList : [3], poList : ['N2'], ship : at('2026-12-27'), srcId : 'ck:X:NAVY' };
    const white = { id : 'dbo-4', dbId : 4, color : 'WHITE', qty : 500, ship : at('2026-12-24') };
    const m = mergeSameSource([black, navyA, white, navyB]);
    assert.deepEqual(m.map(x => x.color), ['BLACK', 'NAVY', 'WHITE']);
    assert.deepEqual(m.map(x => x.qty), [1000, 500, 500]);
    assert.equal(m[1].id, 'dbo-2');
    assert.deepEqual(m[1].idList, [2, 3]);
    assert.deepEqual(mergeSameSource([]), []);
    assert.deepEqual(mergeSameSource(null), []);
});

test('every row the pool row stands for stays covered — an id without a PO row rides on the first delivery', () => {
    const row = { id : 'dbo-1', dbId : 1, qty : 2000, idList : [1, 2, 3, 99], poDetails : [d(1, 'A', 1000, '2026-12-10'), d(2, 'B', 500, '2027-01-20'), d(3, 'C', 500, null)] };
    const rows = splitByDelivery(row, { toDate : at });
    assert.equal(rows.length, 2);
    assert.deepEqual(rows[0].idList, [1, 3, 99]);
    assert.deepEqual(rows[1].idList, [2]);
    assert.deepEqual(rows.map(r => r.qty), [1333, 667]);
});
