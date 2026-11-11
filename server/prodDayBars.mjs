// Daily production update — the bars of boards that are NOT open in the
// browser. The dialog lists every line of every board the planner may write;
// the open board's bars come from the board itself (exact day plan), the
// other units' bars come from the saved plan through this module, with the
// day plan ESTIMATED by the same production model the board uses: line
// manpower × working minutes × efficiency ÷ SMV, the Build up (learning)
// curve over the first working days when the line changes product / style,
// and the part of the day the bar's saved window covers.
// Pure functions — no DB, no Express (tests in prodDayBars.test.mjs).
import { buyerDefaultEff, profileEfficiency, runKeyOf, ymdOf } from './planAllocation.mjs';

const DAY_MS = 86400000;
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

/** Unit calendar from planning_calendar_intervals rows (weekly + DATE_OVERRIDE rows) */
export function buildCalendar(calRows, ovRows, unitId) {
    const toMin = t => { const [h, m] = String(t || '08:00').split(':').map(Number); return (h || 0) * 60 + (m || 0); };
    const cal = { days : {}, overrides : {}, lineOverrides : {} };
    for (const r of calRows || []) {
        if (Number(r.unit_id) !== Number(unitId)) continue;
        const start = toMin(r.start_time);
        let hours = 0;
        if (r.interval_type === 'working' && r.end_time) {
            let diff = toMin(r.end_time) - start;
            if (diff <= 0) diff += 1440;
            hours = diff / 60;
        }
        cal.days[r.weekday_no] = { start, hours };
    }
    for (const r of ovRows || []) {
        if (Number(r.unit_id) !== Number(unitId)) continue;
        const h = Number(String(r.n || '').replace(/^HOURS=/, ''));
        if (!r.d || !Number.isFinite(h)) continue;
        if (r.resource_id) (cal.lineOverrides[r.resource_id] ||= {})[r.d] = h;
        else cal.overrides[r.d] = h;
    }
    return cal;
}

/** Working window of line L on day d: { start : ms, minutes } (minutes 0 = off) */
export function lineDay(cal, L, d) {
    const key = ymdOf(d);
    const cfg = cal.days?.[d.getDay()] || { start : 480, hours : 0 };
    const lo = cal.lineOverrides?.[L.id]?.[key] ?? cal.lineOverrides?.[String(L.id)]?.[key];
    const uo = cal.overrides?.[key];
    let hours;
    if (lo != null && lo !== '') hours = Number(lo) || 0;
    else if (uo != null && uo !== '') hours = Number(uo) || 0;
    else hours = Number(cfg.hours) > 0 ? (Number(L.hours) > 0 ? Number(L.hours) : Number(cfg.hours)) : 0;
    const day0 = new Date(d); day0.setHours(0, 0, 0, 0);
    return { start : day0.getTime() + (Number(cfg.start) || 480) * 60000, minutes : Math.max(0, hours) * 60 };
}

/**
 * Day-by-day plan of one saved bar.
 * @param {object} ctx  { cal, profiles : { lineName : { productType : eff } }, curve : { pct : [] } | null }
 * @param {object} L    { id, name, manpower, eff, hours }
 * @param {object} bar  { start, end, qty, made, smv, productType, buyer, style, prevKey }
 *                      prevKey = run key (product|style) of the run that ended on the line
 *                      right before this bar (null = line was idle) — decides the ramp
 * @param {string} untilYmd  last date to simulate (inclusive)
 * @returns {{ days : Map<ymd, qty>, eff : number, ramp : boolean }}
 */
export function simulateBar(ctx, L, bar, untilYmd) {
    const cal = ctx.cal || { days : {}, overrides : {}, lineOverrides : {} };
    const curve = ctx.curve && Array.isArray(ctx.curve.pct) && ctx.curve.pct.length ? ctx.curve : null;
    const manpower = Number(L.manpower) > 0 ? Number(L.manpower) : 50;
    const lineEff  = Number(L.eff) > 0 ? Number(L.eff) : 50;
    let eff = buyerDefaultEff(bar.buyer) ?? profileEfficiency(ctx.profiles?.[L.name], bar.productType, lineEff);
    if (!(eff > 0)) eff = lineEff;
    const smv = Math.max(0.1, Number(bar.smv) || 0.1);
    const rate = manpower * eff / 100 / smv;              // pieces per working minute at full speed
    const runKey = runKeyOf(bar.productType, bar.style);
    const ramp = !!(curve && bar.prevKey != null && bar.prevKey !== runKey);
    const period = curve ? curve.pct.length : 0;
    const t0 = new Date(bar.start), t1 = new Date(bar.end);
    let remaining = Math.max(0, (Number(bar.qty) || 0) - (Number(bar.made) || 0));
    const days = new Map();
    if (Number.isNaN(+t0) || Number.isNaN(+t1) || t1 <= t0) return { days, eff, ramp };
    const d = new Date(t0); d.setHours(0, 0, 0, 0);
    const until = untilYmd || ymdOf(t1);
    let workIdx = 0;
    for (let g = 0; g < 400 && ymdOf(d) <= until; g++, d.setDate(d.getDate() + 1)) {
        const w = lineDay(cal, L, d);
        if (w.minutes <= 0) continue;                      // off day: the bar runs on
        const we0 = w.start + w.minutes * 60000;
        const ws = Math.max(w.start, t0.getTime());
        const we = Math.min(we0, t1.getTime());
        const winF = Math.max(0, Math.min(1, (we - ws) / (we0 - w.start)));
        const factor = ramp && workIdx < period ? curve.pct[workIdx] / 100 : 1;
        const cap = winF > 0 ? Math.max(1, Math.floor(w.minutes * rate * factor * winF)) : 0;
        if (cap > 0 && remaining > 0) {
            const q = Math.min(cap, remaining);
            remaining -= q;
            days.set(ymdOf(d), q);
        }
        workIdx++;
        if (remaining <= 0) break;
    }
    return { days, eff, ramp };
}

/** The run key of the bar that ENDED last on the line before `start` (null = none) */
export function prevRunKey(lineBars, start, selfId = null) {
    const t = new Date(start).getTime();
    let best = null;
    for (const b of lineBars || []) {
        if (selfId != null && String(b.id) === String(selfId)) continue;
        const e = new Date(b.end).getTime();
        if (Number.isNaN(e) || e > t + DAY_MS) continue;   // must end by the end of the bar's start day
        if (!best || e > best.e) best = { e, key : runKeyOf(b.productType, b.style) };
    }
    return best ? best.key : null;
}

export { addDays };
