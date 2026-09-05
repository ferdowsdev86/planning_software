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

test('same order+colour feasible POs are grouped; qty summed; earliest delivery kept', () => {
    const groups = groupAndSplit({
        orderCode : 'ORD-1001', color : 'BLACK', smv : 20, line : LINE,
        pos : [po('PO-01', 500, '2026-11-10'), po('PO-02', 700, '2026-11-14')]
    });
    assert.equal(groups.length, 1);
    assert.equal(groups[0].grouping_status, 'grouped');
    assert.equal(groups[0].group_quantity, 1200);
    assert.equal(isoDay(groups[0].earliest_delivery), '2026-11-10');
    assert.deepEqual(groups[0].pos.map(p => p.po_number), ['PO-01', 'PO-02']);
});

test('split when combining misses earlier delivery date', () => {
    // huge second PO would push completion past PO-A delivery of Sep 4
    const groups = groupAndSplit({
        orderCode : 'ORD-2', color : 'NAVY', smv : 30, line : LINE,
        pos : [po('PO-A', 2000, '2026-09-04'), po('PO-B', 90000, '2026-12-20')]
    });
    assert.equal(groups.length, 2);
    assert.equal(groups[0].grouping_status, 'split');
    assert.match(groups[0].split_reason, /separated because the combined sewing completion date/);
    assert.deepEqual(groups[0].pos.map(p => p.po_number), ['PO-A']);
    assert.deepEqual(groups[1].pos.map(p => p.po_number), ['PO-B']);
    // second subgroup starts after the first completes
    assert.ok(groups[1].planned_start_at > groups[0].planned_complete_at);
});

test('no line -> single provisional group, Pending Line Selection', () => {
    const groups = groupAndSplit({
        orderCode : 'ORD-3', color : 'RED', smv : 20, line : null,
        pos : [po('P1', 100, '2026-10-01'), po('P2', 200, '2026-10-05')]
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
        pos : [po('P1', 500, '2026-11-10'), po('P2', 700, '2026-11-14')]
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
