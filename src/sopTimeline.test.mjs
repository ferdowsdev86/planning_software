import { test } from 'node:test';
import assert from 'node:assert/strict';
import { plan, recalculate, addDays } from './sopTimeline.mjs';

const D = (y, m, d) => new Date(y, m - 1, d);
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const order = (over = {}) => ({
    exFactoryDate : D(2026, 10, 20), orderQuantity : 24000, smv : 22.0,
    lines : 4, operatorsPerLine : 40, workingMinutesPerDay : 600, efficiency : 0.55,
    washType : 'normal', washConfirmed : true, smvConfirmed : true, quantityConfirmed : true,
    holidayDates : [], todayDate : D(2026, 9, 1), version : 1, ...over
});

test('SOP worked example (§9)', () => {
    const r = plan(order());
    assert.ok(Math.abs(r.production.dailyOutput - 2400) < 1e-6);
    assert.equal(r.production.days, 10);
    const m = r.milestones;
    assert.equal(iso(m.production_complete.date), '2026-10-14'); assert.equal(m.production_complete.dayOfWeek, 'Wednesday');
    assert.equal(iso(m.production_start.date), '2026-10-04');    assert.equal(m.production_start.dayOfWeek, 'Sunday');
    assert.equal(iso(m.throughput_start.date), '2026-10-02');    assert.equal(m.throughput_start.dayOfWeek, 'Friday');
    assert.equal(iso(r.ppStartCriticalOrHigh), '2026-09-25');
    assert.equal(iso(r.ppStartNormal), '2026-09-27');
    assert.equal(iso(m.pp_start.date), '2026-09-27');
    assert.equal(r.totalCycleDaysCritical, 25);
    assert.equal(r.totalCycleDaysNormal, 23);
    assert.equal(r.totalCycleDays, 23);
    assert.equal(m.ex_factory.responsible, 'Merchandising');
    assert.equal(r.breached, false);
});

test('(a) SMV 30 → 14 days + 7-day PP (high SMV)', () => {
    const r = plan(order({ smv : 30.0 }));
    assert.equal(r.production.days, 14);
    assert.equal(r.pp.days, 7);
});
test('(b) 36,000 pcs → 15 days', () => assert.equal(plan(order({ orderQuantity : 36000 })).production.days, 15));
test('(c) 12,000 pcs @ SMV 18 → 5 days', () => assert.equal(plan(order({ orderQuantity : 12000, smv : 18.0 })).production.days, 5));
test('(d) unconfirmed qty/SMV → 10-day default + provisional 7-day PP', () => {
    const r = plan(order({ orderQuantity : null, smv : null, quantityConfirmed : false, smvConfirmed : false }));
    assert.equal(r.production.days, 10); assert.equal(r.production.basis, 'default_unconfirmed');
    assert.equal(r.pp.days, 7);          assert.equal(r.pp.basis, 'provisional_conservative');
    assert.ok(plan(order({ smvConfirmed : false }), true).errors.length);
});
test('5-day floor clamp and >20-day capacity review', () => {
    const a = plan(order({ orderQuantity : 2000 }));
    assert.equal(a.production.days, 5); assert.equal(a.production.clamped, true);
    const b = plan(order({ orderQuantity : 60000 }));
    assert.equal(b.production.days, 25); assert.equal(b.production.needsCapacityReview, true);
});
test('holidays inside production extend the block and shift earlier blocks', () => {
    const r = plan(order({ holidayDates : [D(2026, 10, 6), D(2026, 10, 7)] }));
    assert.equal(iso(r.milestones.production_start.date), '2026-10-02');
    assert.equal(iso(r.milestones.throughput_start.date), '2026-09-30');
    assert.equal(iso(r.milestones.pp_start.date), '2026-09-25');
    assert.equal(r.adjustments[0].block, 'production'); assert.equal(r.adjustments[0].holidayDaysAdded, 2);
    assert.equal(r.totalCycleDays, 25);
});
test('breach: pp_start already passed → escalation + exactly two resolutions', () => {
    const r = plan(order({ todayDate : D(2026, 10, 1) }));
    assert.equal(r.breached, true); assert.equal(r.breachDays, 4);
    assert.equal(r.resolutions.length, 2);
    assert.match(r.escalation, /passed by 4 days/);
});
test('versioning: new ex-factory recalculates everything, prior superseded', () => {
    const o = order();
    const v1 = plan(o);
    const v2 = recalculate(v1, o, D(2026, 10, 27));
    assert.equal(v2.version, 2); assert.equal(v1.superseded, true); assert.equal(v2.supersededFromVersion, 1);
    assert.equal(iso(v2.milestones.production_start.date), '2026-10-11');
});
test('entry gates and critical wash', () => {
    const r = plan(order());
    const g = Object.fromEntries(r.gates.map(x => [x.name, x]));
    assert.equal(iso(g['Buyer PO confirmed with ex-factory date'].requiredBy), '2026-09-20');
    assert.equal(iso(g['PP sample approved, PP meeting held, size set approved'].requiredBy), '2026-10-02');
    const c = plan(order({ washType : 'acid wash' }));
    assert.equal(c.washClass, 'critical'); assert.equal(c.pp.days, 7);
    const gc = Object.fromEntries(c.gates.map(x => [x.name, x]));
    assert.equal(iso(gc['Wash standard approved by buyer'].requiredBy), iso(addDays(c.milestones.pp_start.date, -2)));
});
