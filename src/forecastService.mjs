// ---------------------------------------------------------------------------
// Daily progress + actual-based sewing forecast (planner spec, 2026-11-18).
//
// Pure functions — the board supplies the day model (simulateStrip days), the
// actual output (ERP daily_productions feed + hand-entered rows) and the
// calendar; node-tested without Bryntum.
//
//   attributeActualsToBars(rows, bars)
//       ERP rows (one per date × PO × colour × ERP line) → per bar per date.
//       The ERP LINE decides: a row lands on the bar of its PO on that line
//       (attributed = true). A PO sewn on a line where it has no bar goes to
//       its single bar, else to the bar running on that date (nearest start)
//       — attributed = false ("line not attributed"), shown as PO-level.
//   buildProgressRows({ baseline, actuals, savedPlan, cutoffYmd, todayYmd })
//       one row per day: original target (saved day_plan_qty when it exists,
//       else the baseline day model), actual, achievement, variance,
//       cumulative variance (through the cutoff, over days WITH a record —
//       a missing record is never counted as zero output), status.
//   performanceAdjustment({ rows, window, smv, expectedEffPct })
//       the last `window` FINALIZED production working days with a record:
//       efficiency basis when every sampled day has actual manpower-minutes
//       and a valid SMV (actual eff / expected eff, working-time weighted),
//       else output basis (Σ actual / Σ original target) — provisional, not
//       normalized for working time or manpower. Fewer days → the sample
//       size is reported; none → ratio 1 (baseline curve).
//   forecastRemaining({ remaining, capacityDays, ratio, todayYmd, todayFrac })
//       the remaining quantity allocated EXACTLY ONCE over the coming working
//       days: baseline day capacity × ratio, capped at the day's configured
//       peak capacity (the learning curve keeps advancing by production
//       working day — a weak day never repeats a stage); today takes only
//       the share of the shift still ahead (todayFrac).
// ---------------------------------------------------------------------------

export const FORECAST_WINDOW_DAYS = 3;        // configurable forecasting assumption
export const RATIO_MIN = 0.1, RATIO_MAX = 3;  // sanity clamp of the adjustment

const num = v => (Number.isFinite(Number(v)) ? Number(v) : 0);

// ERP rows → per-bar day maps.
//   rows: [{ date:'yyyy-mm-dd', poNo, orderCode, lineCode, qty, manMin, lineSmv, n }]
//   bars: [{ id, lineCode, pos:[poNo…], orderCodes:[code…], startYmd, endYmd }]
// → { byBar: Map(id → { days: { ymd: { qty, attributed, manMin, smv, n, erp:true } } }),
//     unattributed: [{ date, poNo, lineCode, qty, reason }] }
export function attributeActualsToBars(rows, bars) {
    const byBar = new Map();
    const unattributed = [];
    const list = Array.isArray(bars) ? bars : [];
    const norm = v => String(v ?? '').trim().toUpperCase();
    const byPo = new Map(), byCode = new Map();
    for (const b of list) {
        for (const p of b.pos || []) { const k = norm(p); if (!k) continue; if (!byPo.has(k)) byPo.set(k, []); byPo.get(k).push(b); }
        for (const c of b.orderCodes || []) { const k = norm(c); if (!k) continue; if (!byCode.has(k)) byCode.set(k, []); byCode.get(k).push(b); }
    }
    const put = (b, r, attributed) => {
        if (!byBar.has(b.id)) byBar.set(b.id, { days : {} });
        const days = byBar.get(b.id).days;
        const d = days[r.date] || (days[r.date] = { qty : 0, attributed : true, manMin : 0, smv : 0, n : 0, erp : true, lines : [] });
        d.qty += num(r.qty);
        d.n += num(r.n) || 1;
        if (!attributed) d.attributed = false;
        if (num(r.manMin) > 0) d.manMin += num(r.manMin);
        if (num(r.lineSmv) > 0 && !d.smv) d.smv = num(r.lineSmv);
        if (r.lineCode && !d.lines.includes(r.lineCode)) d.lines.push(r.lineCode);
    };
    for (const r of rows || []) {
        if (!(num(r.qty) > 0) || !r.date) continue;
        const cands = byPo.get(norm(r.poNo)) || byCode.get(norm(r.orderCode)) || [];
        if (!cands.length) { unattributed.push({ ...r, reason : 'no bar of this PO / order on the board' }); continue; }
        const onLine = r.lineCode ? cands.filter(b => norm(b.lineCode) === norm(r.lineCode)) : [];
        if (onLine.length) {
            // the bar running on that date on that line, else the nearest start
            const run = onLine.find(b => b.startYmd && b.endYmd && b.startYmd <= r.date && r.date <= b.endYmd)
                || [...onLine].sort((a, b) => Math.abs(cmpYmd(a.startYmd, r.date)) - Math.abs(cmpYmd(b.startYmd, r.date)))[0];
            put(run, r, true);
            continue;
        }
        // The ERP names a line that has NO bar of this PO: the output is real
        // but belongs to no bar on the board — it stays PO-level (reported,
        // never pushed into another line's bar and its daily figures)
        if (r.lineCode) { unattributed.push({ ...r, reason : `booked on ${r.lineCode}, no bar of the PO there` }); continue; }
        // No line on the ERP row: PO-level output on the PO's single bar, else
        // on the bar running that date (nearest start) — marked not attributed
        const target = cands.length === 1 ? cands[0]
            : (cands.find(b => b.startYmd && b.endYmd && b.startYmd <= r.date && r.date <= b.endYmd)
                || [...cands].sort((a, b) => Math.abs(cmpYmd(a.startYmd, r.date)) - Math.abs(cmpYmd(b.startYmd, r.date)))[0]);
        put(target, r, false);
        unattributed.push({ ...r, barId : target.id, reason : 'no line on the ERP row — PO-level on the bar' });
    }
    return { byBar, unattributed };
}
function cmpYmd(a, b) {
    if (!a || !b) return 0;
    return Math.round((new Date(`${a}T00:00:00`) - new Date(`${b}T00:00:00`)) / 86400000);
}

// baseline: [{ ymd, off, target, fullTarget, factor, lcDay, peak }]  (the day
//           model from the bar's ORIGINAL start with the full quantity)
// actuals:  { ymd: { qty, manMin, smv, attributed, manual, erp } }  (null qty = no record)
// savedPlan: { ymd: qty } — day_plan_qty rows saved with production entries
export function buildProgressRows({ baseline = [], actuals = {}, savedPlan = {}, cutoffYmd = null, todayYmd }) {
    const byYmd = new Map(baseline.map(d => [d.ymd, d]));
    const dates = [...new Set([...baseline.map(d => d.ymd), ...Object.keys(actuals || {})])].sort();
    const rows = [];
    let cumT = 0, cumA = 0;
    for (const ymd of dates) {
        const b = byYmd.get(ymd) || null;
        const a = actuals?.[ymd] || null;
        const hasRec = !!a && a.qty != null;
        const target = savedPlan && savedPlan[ymd] != null ? num(savedPlan[ymd]) : num(b?.target);
        const actual = hasRec ? num(a.qty) : null;
        let status;
        if (ymd > todayYmd) status = 'future';
        else if (ymd === todayYmd) status = hasRec ? 'provisional' : 'open';
        else if (hasRec) status = actual > 0 ? 'final' : 'zero';
        else status = b?.off ? 'off' : (target > 0 ? 'missing' : 'none');
        const counts = status === 'final' || status === 'zero' || status === 'provisional';
        if (counts && (!cutoffYmd || ymd <= cutoffYmd || status === 'provisional')) { cumT += target; cumA += actual; }
        rows.push({
            ymd, off : !!b?.off, lcDay : num(b?.lcDay), factor : b ? num(b.factor) : 1, peak : num(b?.peak),
            // a full production day of the plan (not the sliver of a start / end
            // day) — only such days are a fair sample for the adjustment
            full : !!b && !b.off && num(b.fullTarget) > 0 && target >= 0.25 * num(b.fullTarget),
            target, savedTarget : savedPlan && savedPlan[ymd] != null, actual,
            achievement : hasRec && target > 0 ? Math.round(actual / target * 1000) / 10 : null,   // % (N/A when the target is 0)
            variance : hasRec ? actual - target : null,
            cumTarget : counts ? cumT : null, cumActual : counts ? cumA : null, cumVariance : counts ? cumA - cumT : null,
            status, attributed : a ? a.attributed !== false : true, manMin : num(a?.manMin), smv : num(a?.smv) || 0,
            manual : !!a?.manual, erp : !!a?.erp
        });
    }
    return rows;
}

// The run's tail: when the day began, less than a full day's work was left
// (remaining < the day's full capacity) or ≥ 90 % was made — a low output
// there says "little left", not "slow sewing"
export function isTailDay(r, qty) {
    if (!(num(qty) > 0) || r.cumActual == null) return false;
    const begun = r.cumActual - num(r.actual);
    if (begun >= 0.9 * num(qty)) return true;
    const peak = num(r.peak) > 0 ? num(r.peak) : num(r.target);
    return peak > 0 && (num(qty) - begun) < peak;
}

// rows: buildProgressRows output; expectedEffPct: the plan efficiency the day
// model used (the curve factor of each row is applied on top)
export function performanceAdjustment({ rows = [], window = FORECAST_WINDOW_DAYS, smv = 0, expectedEffPct = 0, qty = 0, peakOnly = false } = {}) {
    // finalized full production days; a day that began with 90 % of the
    // quantity already made is the run's tail (little left to sew — its low
    // output says nothing about the pace) and is no sample; peakOnly = the
    // ramp days are judged by the adaptive curve instead (adaptCurve)
    const finalized = rows.filter(r => (r.status === 'final' || r.status === 'zero') && r.target > 0 && r.full !== false
        && !(peakOnly && (r.factor || 1) < 1)
        && !isTailDay(r, qty));
    const sample = finalized.slice(-Math.max(1, window));
    if (!sample.length) return { ratio : 1, sample : 0, window, basis : 'none', days : [], note : 'no finalized production day with a record — baseline curve' };
    const effOk = num(smv) > 0 && num(expectedEffPct) > 0 && sample.every(r => r.manMin > 0);
    let ratio;
    if (effOk) {
        // actual eff = actual × SMV / manpower-minutes; expected = plan eff × curve factor;
        // Σ over the days = working-time weighted ratio
        const act = sample.reduce((a, r) => a + r.actual * num(smv), 0);
        const exp = sample.reduce((a, r) => a + r.manMin * (num(expectedEffPct) / 100) * (r.factor || 1), 0);
        ratio = exp > 0 ? act / exp : 1;
    }
    else {
        const act = sample.reduce((a, r) => a + r.actual, 0);
        const tgt = sample.reduce((a, r) => a + r.target, 0);
        ratio = tgt > 0 ? act / tgt : 1;
    }
    ratio = Math.min(RATIO_MAX, Math.max(RATIO_MIN, ratio));
    return {
        ratio : Math.round(ratio * 1000) / 1000, sample : sample.length, window,
        basis : effOk ? 'efficiency' : 'output', days : sample.map(r => r.ymd),
        note : effOk
            ? `actual / expected efficiency over the last ${sample.length} finalized day(s), working-time weighted`
            : `actual / original target output over the last ${sample.length} finalized day(s) — provisional: working time and manpower not normalized`
    };
}

// ADAPTIVE LEARNING CURVE (planner, 2026-11-18): the configured curve
// (e.g. 20 / 40 / 70 / 100 %) is the plan; from the first production day on,
// the NEXT day's curve stage is set by the output achieved — the day's actual
// against the line's full-day (100 %) capacity names the stage it reached;
// the next day expects the step after that stage. Less than the plan → the
// curve stays at (or falls back to) the stage the output supports; more →
// it moves on faster. Days without a record carry no information.
//   pct: curve steps, rows: buildProgressRows output (needs peak)
// → { stage (0-based index of the step the next day expects), steps,
//     nextPct, done (ramp finished), history : [{ ymd, expectedPct, achievedPct, reached, nextStage }] }
export function adaptCurve({ pct = [], rows = [], qty = 0 } = {}) {
    const steps = (pct || []).map(Number).filter(v => Number.isFinite(v) && v > 0);
    const N = steps.length;
    if (!N) return { stage : 0, steps, nextPct : 100, done : true, history : [] };
    let stage = 0;
    const history = [];
    for (const r of rows) {
        if (!(r.status === 'final' || r.status === 'zero')) continue;
        if (!(num(r.peak) > 0) || r.full === false) continue;
        // the run's tail: the day began with less than a full day's work left
        // (or ≥ 90 % made) — its output cannot show the pace, no information
        if (isTailDay(r, qty)) continue;
        const achieved = Math.round(num(r.actual) / num(r.peak) * 1000) / 10;   // % of the full-day capacity
        const expected = steps[Math.min(stage, N - 1)];
        let reached = -1;
        for (let k = 0; k < N; k++) if (achieved >= steps[k] - 1e-9) reached = k;
        const next = Math.max(0, Math.min(N, reached + 1));
        history.push({ ymd : r.ymd, expectedPct : expected, achievedPct : achieved, reached, nextStage : next });
        stage = next;
    }
    return { stage, steps, nextPct : stage >= N ? 100 : steps[stage], done : stage >= N, history };
}
// the curve factor of the i-th coming working day when the next day expects `stage`
export function curveFactorAt(steps, stage, i) {
    const N = (steps || []).length;
    if (!N) return 1;
    const k = stage + i;
    return k >= N ? 1 : steps[k] / 100;
}

// capacityDays: [{ ymd, off, fullTarget, peak, winF, span, ws }] from the day
// model started at the cutoff (a large quantity, so the list is long enough)
// → { days : [{ ymd, qty, cap }], finishYmd, finishFrac, exhausted, allocated }
export function forecastRemaining({ remaining = 0, capacityDays = [], ratio = 1, todayYmd = null, todayFrac = 1 } = {}) {
    let left = Math.max(0, Math.round(num(remaining)));
    const out = [];
    let finishYmd = null, finishFrac = 0;
    for (const d of capacityDays) {
        if (left <= 0) break;
        if (d.off) continue;
        const peak = num(d.peak) > 0 ? num(d.peak) : num(d.fullTarget);
        let cap = Math.min(Math.round(num(d.fullTarget) * num(ratio || 1)), peak);
        cap = Math.max(0, Math.floor(cap * (num(d.winF) > 0 ? num(d.winF) : 1)));
        if (d.ymd === todayYmd) cap = Math.floor(cap * Math.max(0, Math.min(1, num(todayFrac))));
        if (cap <= 0) continue;
        const q = Math.min(cap, left);
        left -= q;
        out.push({ ymd : d.ymd, qty : q, cap });
        if (left <= 0) { finishYmd = d.ymd; finishFrac = q / cap; }
    }
    return { days : out, finishYmd, finishFrac, exhausted : left <= 0, allocated : out.reduce((a, x) => a + x.qty, 0), left };
}
