// ---------------------------------------------------------------------------
// Learning-curve domain service (pure — no UI / Bryntum / DOM dependencies).
//
// Business rule: when a sewing line changes from one garment/product type to
// another, the first N working days of the new product run at the reduced
// efficiencies of the configured learning-curve profile (Setup → Build up /
// Learning curves). The curve counts WORKING days only and never restarts
// while the same product type keeps running on the line — not across orders,
// POs, colours, holidays, bar splits or reloads.
//
// The caller supplies:
//   - the configured curve list (from the existing Build up profile store)
//   - each bar's stable product-type key (from the efficiency-profile master)
//   - each bar's working-day index (calendar-aware, holidays excluded)
// so this module stays calendar- and storage-agnostic and node-testable.
// ---------------------------------------------------------------------------

/**
 * Pick the standard learning curve from the configured profile list.
 * @param {Array<{id,name,period,pct:number[]}>} curves — bcList (mbm-buildup)
 * @param {number} period — required ramp length in working days (default 3)
 * @returns the first configured curve whose period matches, or null
 */
export function pickLearningCurve(curves, period = 3) {
    if (!Array.isArray(curves)) return null;
    const c = curves.find(x => Number(x?.period) === period && Array.isArray(x?.pct) && x.pct.length === period);
    if (!c) return null;
    return { id : c.id, name : c.name, period : Number(c.period), pct : c.pct.map(Number) };
}

/**
 * Walk one line's bars in start order and decide, for every bar, whether the
 * learning curve applies and at which ramp day it enters.
 *
 * A "run" is a consecutive stretch of bars sharing the same typeKey. The
 * curve applies to a run that FOLLOWS a different-type run (genuine product
 * changeover). Later bars of the same run continue the day count (offset =
 * working days elapsed since the run started) — never restart. The first run
 * on a line has no previous product, so no curve is applied to it.
 *
 * @param {Array<{id, typeKey, workDayIndex, completed?:boolean}>} bars —
 *        sorted by planned start; workDayIndex counts working days from any
 *        fixed epoch (holidays/off-days excluded by the caller's calendar)
 * @param {{name,period,pct}} curve — from pickLearningCurve
 * @returns {Map<id, {applied, reason, dayOffset, typeKey}>}
 *   reason: 'product-change' | 'continuation' | 'same-product' | 'first-on-line'
 *   dayOffset: 0-based ramp day the bar STARTS at (only meaningful when applied)
 */
export function buildLineLearning(bars, curve) {
    const out = new Map();
    if (!Array.isArray(bars) || !bars.length) return out;
    const period = Number(curve?.period) || 0;

    let runType     = null;   // typeKey of the current run
    let runStartIdx = 0;      // workDayIndex where the current run began
    let runApplied  = false;  // does the curve apply to the current run?
    let firstRun    = true;

    for (const b of bars) {
        const key = String(b.typeKey ?? '');
        if (runType === null || key !== runType) {
            // New run starts here
            const isChangeover = runType !== null && key !== runType;
            runType     = key;
            runStartIdx = Number(b.workDayIndex) || 0;
            runApplied  = isChangeover && period > 0;
            const reason = isChangeover ? 'product-change' : 'first-on-line';
            firstRun = firstRun && !isChangeover;
            out.set(b.id, {
                applied   : runApplied,
                reason    : runApplied ? 'product-change' : reason,
                dayOffset : 0,
                typeKey   : key
            });
            continue;
        }
        // Same run continues (same type; order/PO/colour/qty may differ)
        const offset = Math.max(0, (Number(b.workDayIndex) || 0) - runStartIdx);
        const stillRamping = runApplied && offset < period;
        out.set(b.id, {
            applied   : stillRamping,
            reason    : stillRamping ? 'continuation' : 'same-product',
            dayOffset : Math.min(offset, period),
            typeKey   : key
        });
    }
    return out;
}

/**
 * An order already IN PRODUCTION enters the ramp where its output left it
 * (planner's rule, 2026-11-16): when a bar is planned for the REMAINING
 * quantity of an order that has sewn on `producedDays` working days, the
 * curve does not start again at day 1 — those days are consumed. Inside the
 * period the bar continues at day producedDays + 1; from the period on there
 * is no ramp left ('in-production'). A bar that was not going to ramp at all
 * (first on the line, same product) stays as it is; a manual curve is never
 * touched by the caller.
 * @param {{applied, reason, dayOffset}} info — the line-sequence decision
 * @param {number} producedDays — working days the order has already sewn
 * @param {number} period — the curve length in working days
 */
export function afterProduction(info, producedDays, period) {
    const done = Math.max(0, Math.floor(Number(producedDays) || 0));
    const per  = Math.max(0, Number(period) || 0);
    if (!info || !done || !per) return info;
    const dayOffset = Math.min(per, Math.max(Number(info.dayOffset) || 0, done));
    const applied = !!info.applied && dayOffset < per;
    return { ...info, applied, dayOffset,
        reason : applied ? 'continuation' : (info.applied ? 'in-production' : info.reason),
        producedDays : done };
}

/**
 * Capacity-based duration for a bar whose head runs on the learning curve.
 * Day i (0-based ramp index = dayOffset + day-within-bar) below the curve
 * period uses baseEff × pct[i]/100; every later day uses the normal baseEff.
 * The planned quantity is NEVER changed — only the time to produce it.
 *
 * @returns {{dur:number, workMin:number, reqMin:number,
 *            learnMin:number, dayPlan:Array<{day,effPct,capacity,minutes}>}}
 *   dur      — working days (fractional last day)
 *   learnMin — clock minutes of the bar spent inside the learning ramp
 *   dayPlan  — per-day applied eff% and piece capacity (ramp days + 1 normal)
 */
export function learningDuration({ qty, smv, manpower, baseEffPct, dailyMinutes, dayPcts, dayOffset = 0 }) {
    const q      = Math.max(0, Number(qty) || 0);
    const sm     = Math.max(0.1, Number(smv) || 0);
    const mp     = Math.max(1, Number(manpower) || 1);
    const base   = Math.max(0.01, Number(baseEffPct) || 0);
    const mins   = Number(dailyMinutes) > 0 ? Number(dailyMinutes) : 600;
    const pcts   = Array.isArray(dayPcts) ? dayPcts.map(Number) : [];
    const period = pcts.length;
    const off    = Math.max(0, Number(dayOffset) || 0);

    const reqMin  = q * sm;
    let remaining = reqMin;
    let dur       = 0;
    let learnMin  = 0;
    const dayPlan = [];

    for (let day = 0; remaining > 0 && day < 3650; day++) {
        const rampIdx = off + day;
        const ramping = rampIdx < period;
        const effPct  = ramping ? base * (pcts[rampIdx] / 100) : base;
        const avail   = Math.max(1, mp * mins * (Math.max(0.01, effPct) / 100));
        const used    = Math.min(remaining, avail);
        const frac    = used / avail;           // fraction of this working day
        dur += frac;
        if (ramping) learnMin += frac * mins;
        if (dayPlan.length < period - off + 1) {
            dayPlan.push({
                day      : rampIdx + 1,
                effPct   : Math.round(effPct * 10) / 10,
                capacity : Math.floor(avail / sm),
                minutes  : Math.round(avail)
            });
        }
        remaining -= used;
    }
    return {
        dur      : Math.max(0.01, dur),
        workMin  : Math.ceil(dur * mins),
        reqMin   : Math.round(reqMin),
        learnMin : Math.round(learnMin),
        dayPlan
    };
}

// ---------------------------------------------------------------------------
// THE CURVE FALLS BEHIND WITH THE OUTPUT (planner, 2026-11-18).
//
// A ramp day that makes less than its target has not finished that day of the
// curve: the curve is behind by  shortfall ÷ the day's target  of a day
// (day 1: target 189, made 150 → 39 ÷ 189 = 0.20635 day). Every following
// ramp day then stands that much earlier on the curve — its target is taken
// between the previous day's target and its own:
//
//     revised(n) = target(n) − (target(n) − target(n−1)) × lag
//     378 → 339,  661 → 603,  945 → 886,  then the full 945
//
// The lag adds up over the ramp days (each against ITS OWN target of the
// day), a day above its target wins time back (never below 0), and a day at
// the full target (the ramp is over) adds nothing — a slow day at peak is
// pace, not learning.
// ---------------------------------------------------------------------------

/**
 * The target of the curve at the fractional ramp day `x` (1 = the first ramp
 * day; x ≤ 1 → the first day's target, x ≥ period + 1 → the full target).
 * @param {number[]} pct — the curve steps (e.g. [20, 40, 70])
 * @param {number} x — ramp day, 1-based, fractional (ramp day − lag)
 * @param {(k:number)=>number} tOf — the plain target of ramp day k (1-based;
 *        k > period → the full-day target)
 */
export function lagTarget(pct, x, tOf) {
    const N = Array.isArray(pct) ? pct.length : 0;
    if (!N) return tOf(1);
    if (!(x > 1)) return tOf(1);
    if (x >= N + 1) return tOf(N + 1);
    const k  = Math.floor(x + 1e-9);
    const fr = Math.max(0, x - k);
    if (fr < 1e-9) return tOf(k);
    const a = tOf(k), b = tOf(k + 1);
    return Math.round(a + (b - a) * fr);
}

/**
 * How far the curve is behind after the recorded ramp days.
 * @param {Array<{ymd, target, actual}>} days — the ramp days WITH a record,
 *        each with the target that day was planned with
 * @returns {{lag:number, history:Array<{ymd,target,actual,part,lag}>}}
 */
export function curveLag(days) {
    let lag = 0;
    const history = [];
    const list = [...(days || [])].filter(d => d && d.ymd).sort((a, b) => (a.ymd < b.ymd ? -1 : a.ymd > b.ymd ? 1 : 0));
    for (const d of list) {
        const t = Number(d.target), a = Number(d.actual);
        if (!(t > 0) || d.actual == null || !Number.isFinite(a)) continue;
        const part = Math.max(-1, Math.min(1, (t - a) / t));
        lag = Math.max(0, lag + part);
        history.push({ ymd : d.ymd, target : t, actual : a, part : Math.round(part * 1e5) / 1e5, lag : Math.round(lag * 1e5) / 1e5 });
    }
    return { lag : Math.round(lag * 1e5) / 1e5, history };
}

/**
 * The production made so far laid over the plan days from the bar's start:
 * which day the output ends in, what that day still owes, and how many plan
 * days are done in full.
 * @param {number[]} plan — pieces planned per working day, from the start
 * @param {number} made — pieces made since that start
 * @returns {{idx:number, rest:number, fullDays:number, over:number}}
 *   idx  — index of the day the output ends in (plan.length when all is made)
 *   rest — what that day's plan still owes
 *   over — pieces beyond the whole plan
 */
export function consumePlan(plan, made) {
    let left = Math.max(0, Number(made) || 0);
    const list = Array.isArray(plan) ? plan : [];
    for (let i = 0; i < list.length; i++) {
        const q = Math.max(0, Number(list[i]) || 0);
        if (left < q) return { idx : i, rest : q - left, fullDays : i, over : 0 };
        left -= q;
    }
    return { idx : list.length, rest : 0, fullDays : list.length, over : left };
}
