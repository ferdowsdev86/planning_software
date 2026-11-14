import test from 'node:test';
import assert from 'node:assert/strict';
import { historyFromLogs, buildBarHistory, boardStamp } from './barHistory.mjs';

const line = id => ({ 27 : 'MBM Line 16+17', 29 : 'MBM Line 21' }[id] || null);
const state = (o = {}) => JSON.stringify({ startDate : '2026-11-14 12:39:00', endDate : '2026-11-17 14:13:00', plannedQuantity : 4850, resourceId : 27, onHold : false, status : 'draft', ...o });
const log = (action_type, changed_at, new_data, extra = {}) => ({ action_type, changed_at, new_data, ...extra });

test('board time: plan strings are taken as they are, ISO instants are shown in Asia/Dhaka', () => {
    assert.deepEqual([boardStamp('2026-11-14 12:39:00').d, boardStamp('2026-11-14 12:39:00').t], ['14/11/26', '12:39']);
    assert.deepEqual([boardStamp('2027-01-30T07:55:12.000Z').d, boardStamp('2027-01-30T07:55:12.000Z').t], ['30/01/27', '13:55']);
    assert.equal(boardStamp(''), null);
});

test('first save = bar created; a later save tells only what changed', () => {
    const h = historyFromLogs([
        log('add', '2026-10-11 18:28:18', state()),
        log('update', '2026-10-19 18:36:47', state({ startDate : '2026-11-16 08:00:00', endDate : '2026-11-19 10:00:00' })),
        log('update', '2026-10-20 09:00:00', state({ startDate : '2026-11-16 08:00:00', endDate : '2026-11-19 10:00:00', resourceId : 29, plannedQuantity : 5836 }))
    ], line);
    assert.equal(h.length, 3);
    assert.match(h[0].text, /^Bar created on MBM Line 16\+17: 14\/11\/26 12:39 → 17\/11\/26 14:13 · qty 4,850$/);
    assert.equal(h[1].text, 'Start 14/11/26 12:39 → 16/11/26 08:00 · End 17/11/26 14:13 → 19/11/26 10:00');
    assert.equal(h[2].text, 'Moved MBM Line 16+17 → MBM Line 21 · Qty 4,850 → 5,836');
});

test('a save that changed nothing, or re-fitted the bar by minutes, gives no row', () => {
    const h = historyFromLogs([
        log('add', '2026-10-11 18:28:18', state()),
        log('update', '2026-10-12 10:00:00', state()),                                                       // whole-board save
        log('update', '2026-10-13 10:00:00', state({ startDate : '2026-11-14 12:41:00', endDate : '2026-11-17 14:15:00' }))   // 2-minute re-fit
    ], line);
    assert.equal(h.length, 1);
});

test('removed, then planned again; Holding Row; the reason of a retire is kept', () => {
    const h = historyFromLogs([
        log('add', '2026-10-11 18:28:18', state()),
        log('remove', '2026-11-11 18:45:18', null, { reason : 'hidden bar retired (sync): order unknown to ERP' }),
        log('update', '2026-11-12 10:01:22', state({ startDate : '2026-10-18 11:11:00', endDate : '2026-10-27 11:33:00', resourceId : 29, plannedQuantity : 5836 })),
        log('update', '2026-11-13 09:00:00', state({ startDate : '2026-10-18 11:11:00', endDate : '2026-10-27 11:33:00', resourceId : null, onHold : true, plannedQuantity : 5836 }))
    ], line);
    assert.equal(h[1].text, 'Bar removed from MBM Line 16+17 — hidden bar retired (sync): order unknown to ERP');
    assert.match(h[2].text, /^Planned again on MBM Line 21: 18\/10\/26 11:11 → 27\/10\/26 11:33 · qty 5,836$/);
    assert.equal(h[3].text, 'Parked on the Holding Row (from MBM Line 21)');
});

test('a log that starts with a CHANGE (bar older than the log) is compared with its old dates', () => {
    const h = historyFromLogs([
        log('update', '2026-10-19 18:36:47', state(), { old_data : JSON.stringify({ start_date : '2026-11-10 08:00:00', end_date : '2026-11-13 09:00:00' }) })
    ], line);
    assert.equal(h.length, 1);
    assert.equal(h[0].text, 'Start 10/11/26 08:00 → 14/11/26 12:39 · End 13/11/26 09:00 → 17/11/26 14:13');
});

test('pull forward, strip efficiency, curve link — with the user the action recorded', () => {
    const h = historyFromLogs([
        log('pull-forward', '2026-11-01 10:00:00', JSON.stringify({ line : 'MBM Line 01+02', oldStart : '2027-01-30T07:55:12.000Z', newStart : '2027-01-26T07:55:00.000Z' })),
        log('strip-eff', '2026-10-28 11:08:48', JSON.stringify({ from : 100, to : 125, user : 'naim' })),
        log('link', '2026-10-18 18:13:16', JSON.stringify({ curve : '1 Day', mode : 'live', user : 'kutub' })),
        log('update', '2026-11-14 12:00:00', state({ _by : 'ferdows' }))
    ], line);
    assert.equal(h[0].text, 'Plan pull forward on MBM Line 01+02: start 30/01/27 13:55 → 26/01/27 13:55');
    assert.deepEqual([h[1].text, h[1].by], ['Strip efficiency 100% → 125%', 'naim']);
    assert.deepEqual([h[2].text, h[2].by], ['Build up curve linked (1 Day) — live', 'kutub']);
    assert.equal(h[3].by, 'ferdows');
});

test('the whole history: ERP import facts, saves, production, notes, sewing output — oldest first', () => {
    const rows = buildBarHistory({
        event : { id : 3671, event_code : 'EV-C6122892-SEW', created_at : '2026-10-11 18:28:18' },
        orders : [{ po_number : '1000659509', order_code : '26H1LEV467', buyer_name : 'LEVI STRAUSS & CO', style_no : '00ADN', product_category : 'Shorts',
            color : '00ADN-0018', order_quantity : 5666, smv : 14.2, pcd : '2026-10-15', shipment_date : '2026-11-19', created_at : '2026-09-21 10:00:00' }],
        logs : [log('add', '2026-10-11 18:28:18', state())],
        lineName : line,
        production : [{ save_date : '2026-10-20', qty : 400, line : 'MBM Line 21' }, { save_date : '2026-10-20', qty : 150, line : 'MBM Line 21' }],
        notes : [{ note : 'fabric late by 2 days', created_by : 'kutub', created_at : '2026-10-16 09:30:00' }],
        sewn : { qty : 3801, of : 5666 }, now : '2026-11-14 18:00:00'
    });
    const texts = rows.map(r => r.text);
    assert.equal(texts[0], 'PO 1000659509 of order 26H1LEV467 received from the ERP');
    assert.ok(texts.includes('Customer has been set to "LEVI STRAUSS & CO"'));
    assert.ok(texts.includes('Product type has been set to Shorts'));
    assert.ok(texts.includes('Order qty 5,666 · Sew work content (SMV) 14.200'));
    assert.ok(texts.includes('PCD 15/10/26 · delivery 19/11/26'));
    assert.ok(texts.includes('Production 20/10/26: 550 pcs on MBM Line 21'));
    assert.ok(texts.includes('fabric late by 2 days'));
    assert.equal(texts.at(-1), 'Actual sewing output to date: 3,801 of 5,666 pcs — remaining 1,865');
    // oldest first
    const dates = rows.map(r => r.date);
    assert.deepEqual(dates, [...dates].sort());
    // exactly one creation row (from the log — not a second one from created_at)
    assert.equal(rows.filter(r => r.kind === 'create').length, 1);
});

test('a bar without any log still shows when it was created', () => {
    const rows = buildBarHistory({ event : { id : 9, event_code : 'EV-C1-SEW', created_at : '2026-10-01 08:00:00' }, logs : [] });
    assert.deepEqual(rows.map(r => r.text), ['Bar created on the board (EV-C1-SEW)']);
});

test('a log that only knows the bar from a later moment (pull forward, removed, planned again) still starts with its creation', () => {
    const rows = buildBarHistory({ event : { id : 4048, event_code : 'EV-C7-SEW', created_at : '2026-10-02 09:00:00' }, lineName : line, logs : [
        log('pull-forward', '2026-11-11 16:24:00', JSON.stringify({ line : 'Line 04', oldStart : '2026-11-18 19:02:00', newStart : '2026-11-18 15:04:00', user : 'unithead1' })),
        log('remove', '2026-11-12 01:08:00', null),
        log('update', '2026-11-14 15:44:00', state({ resourceId : 29 }))
    ] });
    assert.deepEqual(rows.map(r => r.text.split(':')[0]), ['Bar created on the board (EV-C7-SEW)', 'Plan pull forward on Line 04', 'Bar removed', 'Planned again on MBM Line 21']);
});
