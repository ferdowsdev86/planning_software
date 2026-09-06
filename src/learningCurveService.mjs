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
