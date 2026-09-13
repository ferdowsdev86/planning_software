// ---------------------------------------------------------------------------
// SOP-PLN-01 — Order Timeline Planning (v2.0) — JavaScript port of
// sop/timeline_planner.py. Pure logic, no UI/DB/I-O. Section numbers match
// the SOP and the Python module so both can be reviewed side by side.
//   §1 inputs/classification  §2 PP block  §3 production run  §4 fixed blocks
//   §5 backward calculation (+holidays)  §6 entry gates  §7 validation
//   §8 versioning
// Dates are plain JS Dates handled as CALENDAR days at local midnight.
// ---------------------------------------------------------------------------

export const CRITICAL_WASH_KEYWORDS = [
    'acid', 'heavy stone', 'heavy enzyme', 'stone/enzyme', 'bleach', 'spray',
    'over-dye', 'overdye', 'over dye', 'tint', 'multi-process', 'multi process', 'multiprocess'
];
export const HIGH_SMV_THRESHOLD = 25.0;                 // §2
export const DEFAULT_PRODUCTION_DAYS_UNCONFIRMED = 10;  // §3
export const MIN_PRODUCTION_DAYS = 5;                   // §3
export const CAPACITY_REVIEW_DAYS = 20;                 // §3
export const THROUGHPUT_DAYS = 2;                       // §4
export const EX_FACTORY_DAYS = 6;                       // §4
export const RESPONSIBLE = {                            // §5
    ex_factory : 'Merchandising', production_complete : 'Planning',
    production_start : 'Planning', throughput_start : 'Planning', pp_start : 'Planning'
};
const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function dayOnly(d) {
    const x = d instanceof Date ? d : new Date(d);
    return new Date(x.getFullYear(), x.getMonth(), x.getDate());
}
export function addDays(d, n) {
    const x = dayOnly(d);
    x.setDate(x.getDate() + n);
    return x;
}
export function diffDays(a, b) {                        // a − b in whole days
    return Math.round((dayOnly(a) - dayOnly(b)) / 864e5);
}
const key = d => dayOnly(d).getTime();

/** §1 — classify a wash as 'critical' | 'normal'. */
export function classifyWash(washType, trialCycles = 1) {
    if (trialCycles > 1) return 'critical';
    const t = String(washType || '').trim().toLowerCase();
    if (t === 'critical') return 'critical';
    return CRITICAL_WASH_KEYWORDS.some(k => t.includes(k)) ? 'critical' : 'normal';
}

/** §2 — PP block: 5 days only for normal wash AND normal SMV; provisional → 7. */
export function ppDuration(o) {
    if (!o.washConfirmed || !o.smvConfirmed) {
        return { days : 7, basis : 'provisional_conservative',
            note : 're-issue once wash/SMV confirmed — never reduce a provisional 7-day PP block back down without confirmation.' };
    }
    const highSmv = o.smv != null && o.smv > HIGH_SMV_THRESHOLD;
    if (classifyWash(o.washType, o.washTrialCycles) === 'normal' && !highSmv) {
        return { days : 5, basis : 'matrix', note : 'normal wash + normal SMV' };
    }
    return { days : 7, basis : 'matrix', note : 'critical wash and/or high SMV (> 25.0 min)' };
}

/** §3 — capacity-derived production run (ceil, ≥5, >20 review, unconfirmed → 10). */
export function productionRun(o) {
    const unconfirmed = o.orderQuantity == null || o.smv == null || !o.quantityConfirmed || !o.smvConfirmed;
    if (unconfirmed) {
        return { days : DEFAULT_PRODUCTION_DAYS_UNCONFIRMED, dailyOutput : null, basis : 'default_unconfirmed',
            clamped : false, needsCapacityReview : false, message : 'quantity/SMV not confirmed — default 10-day run' };
    }
    if (!(o.smv > 0)) throw new Error('SMV must be > 0');
    const dailyOutput = (o.lines * o.operatorsPerLine * o.workingMinutesPerDay * o.efficiency) / o.smv;
    if (!(dailyOutput > 0)) throw new Error('daily_output must be > 0 — check lines/operators/minutes/efficiency');
    const rawDays = Math.ceil(o.orderQuantity / dailyOutput);
    const run = { days : rawDays, rawDays, dailyOutput, basis : 'capacity', clamped : false, needsCapacityReview : false, message : '' };
    if (rawDays < MIN_PRODUCTION_DAYS) {
        run.days = MIN_PRODUCTION_DAYS;
        run.clamped = true;
        run.message = `formula gave ${rawDays} day(s) — clamped to the 5-day minimum`;
    }
    if (run.days > CAPACITY_REVIEW_DAYS) {
        run.needsCapacityReview = true;
        run.message = 'Over 20 production days — review with Merchandising: likely needs more lines or staged shipments.';
    }
    return run;
}

// §5 — one block ending at `end`, extended for holidays that fall inside it
function placeBlock(name, end, days, holidays, adjustments) {
    let start = addDays(end, -days);
    const counted = new Set();
    for (;;) {
        const inside = holidays.filter(h => key(h) >= key(start) && key(h) < key(end) && !counted.has(key(h)));
        if (!inside.length) break;
        inside.forEach(h => counted.add(key(h)));
        const newStart = addDays(start, -inside.length);
        adjustments.push({ block : name, holidayDaysAdded : inside.length, shiftedFrom : start, shiftedTo : newStart });
        start = newStart;
    }
    return { name, days : diffDays(end, start), end, start };
}

/** §5 — backward chain from the locked ex-factory date. */
export function computeMilestones(o, pp, run) {
    const adjustments = [];
    const hol = [...new Set((o.holidayDates || []).map(key))].map(t => new Date(t));
    const ex = dayOnly(o.exFactoryDate);
    const bShip = placeBlock('ex_factory_block', ex, EX_FACTORY_DAYS, hol, adjustments);
    const bProd = placeBlock('production', bShip.start, run.days, hol, adjustments);
    const bThru = placeBlock('throughput', bProd.start, THROUGHPUT_DAYS, hol, adjustments);
    const bPp   = placeBlock('pp', bThru.start, pp.days, hol, adjustments);
    const ms = (name, d) => ({ name, date : d, dayOfWeek : DOW[d.getDay()], responsible : RESPONSIBLE[name] });
    return {
        milestones : {
            ex_factory          : ms('ex_factory', ex),
            production_complete : ms('production_complete', bShip.start),
            production_start    : ms('production_start', bProd.start),
            throughput_start    : ms('throughput_start', bThru.start),
            pp_start            : ms('pp_start', bPp.start)
        },
        adjustments,
        blockDays : { pp : bPp.days, throughput : bThru.days, production : bProd.days, ex_factory : bShip.days }
    };
}

/** §6 — entry gates with required-by dates. */
export function entryGates(o, milestones) {
    const pp = milestones.pp_start.date, thru = milestones.throughput_start.date;
    const critical = classifyWash(o.washType, o.washTrialCycles) === 'critical';
    return [
        { name : 'Buyer PO confirmed with ex-factory date', owner : 'Merchandising', requiredBy : addDays(pp, -7) },
        { name : 'Fabric in-house and inspected (4-point); trims in-house', owner : 'Store/QA', requiredBy : pp },
        { name : 'Approved SMV and line layout issued', owner : 'IE', requiredBy : pp },
        { name : 'Wash standard approved by buyer', owner : 'Washing/Merchandising', requiredBy : critical ? addDays(pp, -2) : pp },
        { name : 'PP sample approved, PP meeting held, size set approved', owner : 'QA/Merchandising', requiredBy : thru }
    ];
}

function build(o) {
    const pp  = ppDuration(o);
    const run = productionRun(o);
    const { milestones, adjustments, blockDays } = computeMilestones(o, pp, run);
    const thru = milestones.throughput_start.date;
    const base = THROUGHPUT_DAYS + run.days + EX_FACTORY_DAYS;
    return {
        version : o.version || 1,
        exFactoryDate : dayOnly(o.exFactoryDate),
        washClass : classifyWash(o.washType, o.washTrialCycles),
        pp, production : run, milestones,
        ppStartCriticalOrHigh : addDays(thru, -7),
        ppStartNormal : addDays(thru, -5),
        adjustments,
        gates : entryGates(o, milestones),
        // §7.4 — DISPLAY ONLY, never used to derive a date
        totalCycleDays : blockDays.pp + blockDays.throughput + blockDays.production + blockDays.ex_factory,
        totalCycleDaysNormal : 5 + base,
        totalCycleDaysCritical : 7 + base,
        breached : false, breachDays : 0, escalation : '', resolutions : [], errors : [],
        superseded : false, supersededFromVersion : null
    };
}

/** §7 — control rules & escalation. */
export function validate(result, o, treatAsFinal = false) {
    if (treatAsFinal && (!o.washConfirmed || !o.smvConfirmed)) {
        result.errors.push('Cannot finalize: wash type and/or SMV are still provisional — classify (confirm) them before treating this timeline as authoritative.');
    }
    const today = dayOnly(o.todayDate || new Date());
    const ppStart = result.milestones.pp_start.date;
    if (key(ppStart) < key(today)) {
        const n = diffDays(today, ppStart);
        result.breached = true;
        result.breachDays = n;
        result.escalation = `PP start date has passed by ${n} days — escalate to Merchandising and Planning heads today. Do not shorten the production run to compensate.`;
        result.resolutions = [
            `Move ex-factory date later by at least ${n} days and recalculate the full timeline.`,
            "Add production capacity (more lines/operators) so Section 3's formula returns a production run short enough to still hit the original ex-factory date — recalculate production_days with new capacity inputs."
        ];
    }
    return result;
}

/** Public API — full backward plan for one order. */
export function plan(o, treatAsFinal = false) {
    const result = build(o);
    if (o.supersededFrom) {
        o.supersededFrom.superseded = true;
        result.supersededFromVersion = o.supersededFrom.version;
    }
    return validate(result, o, treatAsFinal);
}

/** §8 — new ex-factory date ⇒ full recalculation, version+1, prior superseded. */
export function recalculate(prior, o, newExFactoryDate, treatAsFinal = false) {
    o.exFactoryDate = newExFactoryDate;
    o.version = (prior.version || 1) + 1;
    o.supersededFrom = prior;
    return plan(o, treatAsFinal);
}
