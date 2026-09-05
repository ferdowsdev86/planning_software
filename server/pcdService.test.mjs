import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveEffectivePcd, projectedEligibility } from './pcdService.mjs';

test('valid order pcd wins with source order_pcd', () => {
    const r = resolveEffectivePcd('2026-09-21', '2026-10-30');
    assert.deepEqual(r, { effective_pcd : '2026-09-21', pcd_source : 'order_pcd', pcd_status : 'valid' });
});

test('missing pcd falls back to delivery - 30 (existing approved rule), labelled fallback', () => {
    const r = resolveEffectivePcd(null, '2026-10-31');
    assert.equal(r.effective_pcd, '2026-10-01');
    assert.equal(r.pcd_source, 'delivery_minus_30');
    assert.equal(r.pcd_status, 'fallback');
});

test('corrupt pcd (year 0001) is rejected, fallback used, status invalid', () => {
    const r = resolveEffectivePcd('0001-05-31', '2026-10-31');
    assert.equal(r.pcd_source, 'delivery_minus_30');
    assert.equal(r.pcd_status, 'invalid');
});

test('no pcd and no delivery -> missing, no invented date', () => {
    const r = resolveEffectivePcd(null, null);
    assert.deepEqual(r, { effective_pcd : null, pcd_source : null, pcd_status : 'missing' });
});

test('confirm orders are never eligible for the initial board', () => {
    const r = projectedEligibility({ orderStatus : 'Active', orderType : 'confirm' });
    assert.equal(r.eligible, false);
    assert.match(r.reason, /not included in the initial projection plan/);
});

test('cancelled/closed projected orders are not eligible', () => {
    assert.equal(projectedEligibility({ orderStatus : 'Closed' }).eligible, false);
    assert.equal(projectedEligibility({ orderStatus : 'Cancelled' }).eligible, false);
    assert.equal(projectedEligibility({ orderStatus : 'Inactive' }).eligible, false);
});

test('active projected order is eligible; missing PCD does not affect eligibility', () => {
    const r = projectedEligibility({ orderStatus : 'Active' });
    assert.equal(r.eligible, true);
    // eligibility function takes no pcd input at all — by design
});
