import test from 'node:test';
import assert from 'node:assert/strict';
import {
    simulateCompletion, groupAndSplit, deliveryStatus, normaliseEfficiency, DEFAULT_CALENDAR, isoDay
} from './groupingService.mjs';

const LINE = { name : 'Line 01', manpower : 50, efficiency : 58, availableFrom : '2026-09-01' };
const po = (n, qty, delivery, extra = {}) => ({ po_number : n, qty, remaining_qty : qty, delivery, ...extra });

test('efficiency conversion: 58 -> 0.58, 0.58 stays', () => {
    assert.equal(normaliseEfficiency(58), 0.58);
    assert.equal(normaliseEfficiency(0.58), 0.58);
    assert.equal(normaliseEfficiency(0), null);
});

test('simulateCompletion uses qty*smv / (mp*min*eff)', () => {
    // 500*20=10000 min; 50*600*0.58=17400/day -> <1 day
    const r = simulateCompletion({ qty : 500, smv : 20, manpower : 50, efficiency : 58, startDate : '2026-09-01' });
    assert.ok(r.ok);
    assert.equal(r.requiredMinutes, 10000);
    assert.ok(r.requiredDays < 1);
});

test('missing SMV produces validation error, not a result', () => {
    const r = simulateCompletion({ qty : 500, smv : 0, manpower : 50, efficiency : 58, startDate : '2026-09-01' });
    assert.equal(r.ok, false);
    assert.match(r.error, /SMV/);
});

test('same order + colour + delivery date: the POs are ONE group; qty summed', () => {
    const groups = groupAndSplit({
        orderCode : 'ORD-1001', color : 'BLACK', smv : 20, line : LINE,
        pos : [po('PO-01', 500, '2026-11-10'), po('PO-02', 700, '2026-11-10'), po('PO-03', 300, '2026-11-10 00:00:00')]
    });
    assert.equal(groups.length, 1);
    assert.equal(groups[0].grouping_status, 'grouped');
    assert.equal(groups[0].group_quantity, 1500);
    assert.equal(isoDay(groups[0].earliest_delivery), '2026-11-10');
    assert.equal(groups[0].group_key, 'ORD-1001::BLACK::2026-11-10');
    assert.deepEqual(groups[0].pos.map(p => p.po_number), ['PO-01', 'PO-02', 'PO-03']);
});

test('POs of one delivery date are never separated — not even when the line cannot meet the date', () => {
    // the line is busy until long after the delivery (a colour that is already
    // planned: its line's plan ends months later) — before, every PO became a
    // row of its own
    const busy = { ...LINE, availableFrom : '2027-02-20' };
    const groups = groupAndSplit({
        orderCode : 'GSL-251176', color : 'CAFE STRIPE', smv : 22.5, line : busy,
        pos : [
            po('300137246396', 194, '2026-12-08', { id : 1 }), po('300137244718', 10304, '2026-12-08', { id : 2 }),
            po('300137237106', 414, '2026-12-08', { id : 3 }), po('300137244750', 1458, '2026-12-08', { id : 4 }),
            po('300137244737', 249, '2026-12-08', { id : 5 }), po('Liverpool-30000002', 652, '2026-12-15', { id : 6 }),
            po('300137244725', 1920, '2027-01-05', { id : 7 }), po('300137244727', 858, '2027-02-02', { id : 8 })
        ]
    });
    assert.deepEqual(groups.map(g => [isoDay(g.earliest_delivery), g.pos.length, g.group_quantity]), [
        ['2026-12-08', 5, 12619], ['2026-12-15', 1, 652], ['2027-01-05', 1, 1920], ['2027-02-02', 1, 858]
    ]);
    assert.ok(groups.every(g => g.infeasible));           // flagged late, not cut apart
    assert.equal(new Set(groups.map(g => g.group_key)).size, 4);
});

test('another delivery date is another group, with or without a line', () => {
    const pos = [po('PO-A', 2000, '2026-09-04'), po('PO-B', 900, '2026-12-20'), po('PO-C', 100, '2026-09-04')];
    const withLine = groupAndSplit({ orderCode : 'ORD-2', color : 'NAVY', smv : 30, line : LINE, pos });
    assert.equal(withLine.length, 2);
    assert.ok(withLine.every(g => g.grouping_status === 'grouped' && g.split_reason === null));
    assert.deepEqual(withLine[0].pos.map(p => p.po_number), ['PO-A', 'PO-C']);
    assert.deepEqual(withLine[1].pos.map(p => p.po_number), ['PO-B']);
    // the second group runs after the first on the line
    assert.ok(withLine[1].planned_start_at > withLine[0].planned_complete_at);
    const noLine = groupAndSplit({ orderCode : 'ORD-2', color : 'NAVY', smv : 30, line : null, pos });
    assert.deepEqual(noLine.map(g => g.pos.map(p => p.po_number)), [['PO-A', 'PO-C'], ['PO-B']]);
    assert.ok(noLine.every(g => g.grouping_status === 'provisional'));
});

test('one PO number on several rows of the same colour and date stays in the one group (row ids)', () => {
    const groups = groupAndSplit({
        orderCode : 'ORD-8', color : 'BEIGE', smv : 20, line : null,
        pos : [po('P1', 24, '2026-10-01', { id : 11 }), po('P1', 32, '2026-10-01', { id : 12 }), po('P1', 10, null, { id : 13 })]
    });
    assert.deepEqual(groups.map(g => [g.group_key, g.group_quantity]), [['ORD-8::BEIGE::2026-10-01', 56], ['ORD-8::BEIGE::no-date', 10]]);
});

test('no line -> provisional group, Pending Line Selection', () => {
    const groups = groupAndSplit({
        orderCode : 'ORD-3', color : 'RED', smv : 20, line : null,
        pos : [po('P1', 100, '2026-10-01'), po('P2', 200, '2026-10-01')]
    });
    assert.equal(groups.length, 1);
    assert.equal(groups[0].grouping_status, 'provisional');
    assert.equal(deliveryStatus(groups[0]), 'Pending Line Selection');
});

test('missing line capacity data -> provisional with validation note', () => {
    const groups = groupAndSplit({
        orderCode : 'ORD-4', color : 'RED', smv : 20,
        line : { name : 'L9', manpower : 0, efficiency : 58, availableFrom : '2026-09-01' },
        pos : [po('P1', 100, '2026-10-01')]
    });
    assert.equal(groups[0].grouping_status, 'provisional');
    assert.match(groups[0].validation_notes, /manpower/);
});

test('duplicate, cancelled, and zero-qty POs are excluded with notes', () => {
    const groups = groupAndSplit({
        orderCode : 'ORD-5', color : 'BLACK', smv : 20, line : LINE,
        pos : [
            po('P1', 100, '2026-10-01'),
            po('P1', 100, '2026-10-01'),                 // duplicate
            po('P2', 0, '2026-10-01'),                    // zero qty
            po('P3', 100, '2026-10-01', { cancelled : true })
        ]
    });
    assert.equal(groups.length, 1);
    assert.equal(groups[0].group_quantity, 100);
    assert.match(groups[0].validation_notes, /duplicate PO P1/);
    assert.match(groups[0].validation_notes, /zero\/negative/);
    assert.match(groups[0].validation_notes, /cancelled PO P3/);
});

test('all POs invalid -> no group at all', () => {
    const groups = groupAndSplit({
        orderCode : 'ORD-6', color : 'BLACK', smv : 20, line : LINE,
        pos : [po('P1', -5, '2026-10-01')]
    });
    assert.equal(groups.length, 0);
});

test('holiday between start and completion pushes completion date', () => {
    const cal = { ...DEFAULT_CALENDAR, holidays : new Set(['2026-09-02', '2026-09-03']) };
    const base = simulateCompletion({ qty : 40000, smv : 20, manpower : 50, efficiency : 58, startDate : '2026-09-01' });
    const withHol = simulateCompletion({ qty : 40000, smv : 20, manpower : 50, efficiency : 58, startDate : '2026-09-01', calendar : cal });
    assert.ok(withHol.completeDate > base.completeDate);
});

test('rerunning grouping is idempotent (pure function, same output)', () => {
    const input = {
        orderCode : 'ORD-7', color : 'BLACK', smv : 20, line : LINE,
        pos : [po('P1', 500, '2026-11-10'), po('P2', 700, '2026-11-14'), po('P3', 70, '2026-11-10')]
    };
    const a = JSON.stringify(groupAndSplit(input));
    const b = JSON.stringify(groupAndSplit(input));
    assert.equal(a, b);
});

test('delivery status: Late when completion after delivery', () => {
    const g = {
        grouping_status : 'grouped',
        earliest_delivery : new Date('2026-09-05'),
        planned_complete_at : new Date('2026-09-10')
    };
    assert.equal(deliveryStatus(g), 'Late');
});

test('delivery status: At Risk within 3 days, On Time beyond', () => {
    const mk = (complete) => ({
        grouping_status : 'grouped',
        earliest_delivery : new Date('2026-09-10'),
        planned_complete_at : new Date(complete)
    });
    assert.equal(deliveryStatus(mk('2026-09-09')), 'At Risk');
    assert.equal(deliveryStatus(mk('2026-09-01')), 'On Time');
});
