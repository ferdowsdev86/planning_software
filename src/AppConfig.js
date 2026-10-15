import { DateHelper, StringHelper } from '@bryntum/schedulerpro';
import {
    LINES, LINE_BY_ID, STAGE_RESOURCES, DEPENDENCIES,
    PLAN_START, PLAN_END, VIEW_START, VIEW_END, TOTAL_AVAIL_MIN,
    computeLineUtil, calcRisk, addWorkDays, isFriday, isOffDay, isLineOffDay, nextLineWorkingDay, lineOverrideOf, fmtQty, fmtDate,
    buildManpowerRanges, buildOffDayRanges, nextWorkingDay,
    startOfWorkDay, endOfWork, endOfWorkDay, workEndOfDay, nextStartAfter, workDaysBetween,
    clampIntoWorkWindow,
    elapsedDays, orderTypeOf, barDisplayLine, barStyleLine, barProductLine, addCalDays, randSmv, productTypeFor,
    mbmOrderNo, orderDeliveryOf, fmtDateDdMonRr, erpOrderInfo, buyerShortOf, garmentTypeOf, resolveProfileType, resolveProfileEfficiency,
    formulaWorkingDays, applyFormulaToRaw, snapWorkMinutes, WORK_MIN_PER_DAY, WORK_SNAP_MIN, isLateVsDelivery,
    dayCapacityFactor, hmToHours, calendarState,
    workDayUnits, planQtyOf, workingMinutesBetween,
    buyerDefaultEff, deliveryMonthColor
} from './planningData.js';

// ---------------------------------------------------------------------------
// Flush bars (FastReact): a bar that ends at its line's working-day end and
// is followed by a bar that starts the next working morning is DRAWN up to
// that bar's left edge — the overnight hours the axis still shows (longer
// lines, overtime slot) never open a hatch gap between two consecutive bars.
// Data stays exact: only the rendered width grows. The next-bar map is
// rebuilt once per render pass (bars render in one synchronous sweep).
// ---------------------------------------------------------------------------
let flushMap = null, flushMapAt = 0, flushMapCount = -1;
const lateQtyCache = new Map();   // Late strip qty mode: per bar position → qty after the desired finish
function flushNextOf(scheduler, ev) {
    const now = performance.now();
    const count = scheduler.eventStore?.count ?? 0;
    if (!flushMap || now - flushMapAt > 60 || count !== flushMapCount) {
        flushMap = new Map();
        flushMapAt = now;
        flushMapCount = count;
        for (const [lid, list] of Object.entries(rebuildBarsCache(scheduler))) {
            if (isHoldId(lid)) continue;
            const sorted = [...list].sort((a, b) => a.startDate - b.startDate);
            for (let i = 0; i + 1 < sorted.length; i++) flushMap.set(sorted[i].id, sorted[i + 1]);
        }
    }
    return flushMap.get(ev.id) || null;
}
// the line's working-day end for a date: start + the line's hours that day
function lineDayEnd(scheduler, lineId, date) {
    const res  = scheduler.resourceStore?.getById(lineId);
    const d    = new Date(date);
    const base = Number(res?.data?.hours) > 0 ? Number(res.data.hours) : hmToHours(calendarState.days[d.getDay()]?.hours || '0');
    const hours = base * dayCapacityFactor(d, base, lineId);
    const end = startOfWorkDay(d);
    end.setMinutes(end.getMinutes() + Math.round(hours * 60));
    return end;
}
function flushWidth(scheduler, ev, renderData) {
    const raw = ev.data?.raw;
    if (!raw || raw.stage || !(renderData.width > 0)) return;
    const next = flushNextOf(scheduler, ev);
    if (!next || !(next.startDate > ev.endDate)) return;
    const endDay = new Date(ev.endDate); endDay.setHours(0, 0, 0, 0);
    const nextDay = new Date(next.startDate); nextDay.setHours(0, 0, 0, 0);
    if (!(nextDay > endDay)) return;                       // same day: already touching or a real gap
    const lid = lineIdOf(scheduler, ev);
    if (!lid || isHoldId(lid)) return;
    // this bar must really run to its day's end (±20 min of snapping), and
    // the next must start at ITS day's first hour — then the only "gap" is
    // the night, which is not plannable time
    if (Math.abs(ev.endDate - lineDayEnd(scheduler, lid, ev.endDate)) > 20 * 60000) return;
    if (Math.abs(next.startDate - startOfWorkDay(next.startDate)) > 20 * 60000) return;
    let nextLeft;
    try { nextLeft = scheduler.getCoordinateFromDate(next.startDate, true); } catch { return; }
    if (!(nextLeft > renderData.left + renderData.width)) return;
    renderData.width = nextLeft - renderData.left;
}
import { pickLearningCurve, buildLineLearning, learningDuration } from './learningCurveService.mjs';
import { plan as sopPlan } from './sopTimeline.mjs';

// SOP-PLN-01 backward timeline for one bar, using ITS line's capacity params
// (1 line, this line's manpower / minutes / efficiency). Wash data is not in
// the planning DB → wash stays provisional (conservative 7-day PP, per §2).
export function sopForRaw(scheduler, raw, lineId, extra = {}) {
    if (!raw?.ship) return null;
    try {
        const { manpower, effPct, mins } = lineCalcParams(scheduler, raw, lineId || 'l1');
        // The BAR's quantity (a split strip / one PO), never the whole order
        const qty = Number(raw.qty ?? raw.orderQty) || null;
        // A placeholder SMV (ERP has none) is NOT a confirmed SMV — SOP §3
        // then plans the 10-day default run
        const smv = Number(raw.smv) > 0 && !raw.smvMissing ? Number(raw.smv) : null;
        return sopPlan({
            exFactoryDate : new Date(raw.ship), orderQuantity : qty, smv,
            lines : 1, operatorsPerLine : manpower, workingMinutesPerDay : mins,
            efficiency : Math.max(0.05, effPct / 100),
            washType : extra.washType || 'normal', washConfirmed : !!extra.washConfirmed,
            smvConfirmed : smv != null, quantityConfirmed : qty != null,
            holidayDates : [], todayDate : new Date()
        });
    }
    catch { return null; }
}
import { resolveDropPosition, snapToleranceDays } from './snapService.mjs';

// ---------------------------------------------------------------------------
// Colour-by state (toolbar dropdown): risk (default) | buyer | status
// ---------------------------------------------------------------------------
function tooltipProductType(po, lineId, preferred) {
    try {
        const map = JSON.parse(localStorage.getItem('mbm-line-prof') || '{}');
        const list = JSON.parse(localStorage.getItem('mbm-eff-list') || '[]');
        const pid = lineId ? map[lineId] : null;
        const profile = (pid && list.find(p => p.id === pid)) || list[0];
        return resolveProfileType(po, profile?.values, preferred);
    }
    catch { /* ignore */ }
    return productTypeFor(po, preferred);
}

export function tooltipEfficiency(lineId, productType, fallbackEff) {
    const fb = Number(fallbackEff) || LINE_BY_ID[lineId]?.eff || 50;
    try {
        const map = JSON.parse(localStorage.getItem('mbm-line-prof') || '{}');
        const list = JSON.parse(localStorage.getItem('mbm-eff-list') || '[]');
        const pid = lineId ? map[lineId] : null;
        const profile = (pid && list.find(p => p.id === pid)) || list[0];
        const v = resolveProfileEfficiency(profile?.values, productType, fb);
        if (v > 0) return v;
    }
    catch { /* ignore */ }
    return fb;
}

// Line + bar → the numbers the capacity formula runs on. Single source for
// both the plain duration formula and the learning-curve calculation.
export function lineCalcParams(scheduler, raw, lineId) {
    const res = scheduler?.resourceStore?.getById(lineId);
    // Holding Row with its own capacity (Setup → Line eff & hours): exactly
    // the manpower × hours × efficiency typed there — no product profile,
    // no plan / strip efficiency
    if (isHoldId(lineId) && res?.data?.capSet) {
        return {
            manpower : Math.max(1, Number(res.data.manpower) || 1),
            effPct   : Math.max(1, Number(res.data.eff) || 1),
            mins     : Math.max(60, (Number(res.data.hours) || 10) * 60)
        };
    }
    const manpower = Number(res?.data?.manpower ?? LINE_BY_ID[lineId]?.manpower) || 50;
    const lineEff  = Number(res?.data?.eff ?? LINE_BY_ID[lineId]?.eff) || 50;
    // buyer rule (G-Star 40%) sits between the planner's own figure and the profile
    const profileEff = buyerDefaultEff(raw.buyer) ?? tooltipEfficiency(lineId, raw.productType, lineEff);
    const baseEff = Number(raw.planEff) > 0
        ? Number(raw.planEff)
        : (Number(profileEff) > 0 ? Number(profileEff) : lineEff);
    const strip = Math.max(1, Number(raw.stripEff) || 100);
    const mins  = Number(res?.data?.hours) > 0 ? Number(res.data.hours) * 60 : WORK_MIN_PER_DAY;
    return { manpower, effPct : baseEff * strip / 100, mins };
}

// ---------------------------------------------------------------------------
// THE production model of one strip, day by day from its start: line capacity
// (manpower × line minutes × efficiency ÷ SMV), learning-curve ramp, changed-
// hours dates (Change working hours) and only the part of each day's work
// window the strip actually covers. Bar sizing takes the moment the plan qty
// is reached as the bar's END, and the Planned-schedule dialog / day chips
// print these same days — so the board and the schedule can never disagree.
//   limitEnd = null  → run until the qty is made (sizing)
//   limitEnd = Date  → only days up to the bar's end (display); anything not
//                      made by then lands on the last working day
// ---------------------------------------------------------------------------
export function simulateStrip(scheduler, raw, lineId, start, limitEnd = null) {
    const { manpower, effPct, mins } = lineCalcParams(scheduler, raw, lineId);
    const smv = Math.max(0.1, Number(raw.smv) || 0.1);
    const dailyTarget = Math.max(1, Math.floor(manpower * mins * effPct / 100 / smv));
    const res = scheduler?.resourceStore?.getById?.(lineId);
    const lineHours = Number(res?.data?.hours) || LINE_BY_ID[lineId]?.hours;
    const lc = !isHoldId(lineId) && raw.lc?.applied && Array.isArray(raw.lc.pct) ? raw.lc : null;
    const period = lc ? lc.pct.length : 0;
    // Production already made (Daily production update / ERP) has cut the bar
    // from the left — only the REMAINING qty is still to be sewn from `start`
    let remaining = Math.max(0, (Number(raw.qty ?? raw.orderQty) || 0) - (Number(raw.made) || 0));
    const t0 = new Date(start);
    const lim = limitEnd ? new Date(limitEnd) : null;
    const d = new Date(t0);
    d.setHours(0, 0, 0, 0);
    const days = [];
    let workIdx = 0, finish = null;
    for (let guard = 0; guard < 400; guard++) {
        if (lim ? d >= lim : remaining <= 0) break;
        // a line given 0 hours for the date (Selected lines) is off that day
        const hrsF    = dayCapacityFactor(d, lineHours, lineId);
        // a line's own figure for the date decides (Selected lines): 0 = off,
        // > 0 = it works even on a unit off day; else the unit calendar
        const lo  = lineOverrideOf(d, lineId);
        const off = lo !== undefined ? lo <= 0 : (isOffDay(d) || hrsF <= 0);
        const rampIdx = lc ? (lc.dayOffset || 0) + workIdx : period;
        const ramping = !!lc && !off && rampIdx < period;
        const factor  = ramping ? lc.pct[rampIdx] / 100 : 1;
        const fullTarget = Math.max(1, Math.floor(dailyTarget * factor * hrsF));
        const ws0  = startOfWorkDay(d), we0 = workEndOfDay(d);
        const span = Math.max(60000, we0 - ws0);
        const ws   = Math.max(ws0.getTime(), t0.getTime());
        const we   = lim ? Math.min(we0.getTime(), lim.getTime()) : we0.getTime();
        const winF = off ? 0 : Math.max(0, Math.min(1, (we - ws) / span));
        const cap  = winF > 0 ? Math.max(1, Math.floor(fullTarget * winF)) : 0;
        let q = 0;
        if (cap > 0 && remaining > 0) {
            q = Math.min(cap, remaining);
            remaining -= q;
            if (remaining <= 0) finish = new Date(ws + (q / fullTarget) * span);
        }
        days.push({ date : new Date(d), off, q, fullTarget, factor, winF, span, lcDay : ramping && q > 0 ? rampIdx + 1 : 0 });
        if (!off) workIdx++;
        d.setDate(d.getDate() + 1);
    }
    if (lim && remaining > 0) {
        const lastW = [...days].reverse().find(x => !x.off);
        if (lastW) { lastW.q += remaining; remaining = 0; }
    }
    return { days, finish, dailyTarget, effPct };
}

export const holdCapacitySet = scheduler => !!scheduler?.resourceStore?.records?.some(r => r.data?.holdingRow && r.data.capSet);

// Whole days a bar OCCUPIES on the board for an SOP-planned order: the
// capacity run (qty ÷ daily output, ceil) made curve-aware when the bar
// enters a 3-day learning ramp — NO 5-day floor (the floor belongs to the
// SOP milestone dates, not to line occupancy); SMV/qty unknown → SOP 10-day
// default. Returns { days, lcDays, basis }.
export function sopBoardDays(scheduler, raw, lineId) {
    const sp = sopForRaw(scheduler, raw, lineId);
    if (!sp) return null;
    const run = sp.production;
    if (run.basis !== 'capacity') return { days : run.days, lcDays : 0, basis : run.basis };
    const { manpower, effPct, mins } = lineCalcParams(scheduler, raw, lineId);
    const plainDays = Math.max(1, Number(run.rawDays) || 1);
    let days = plainDays;
    if (raw.lc?.applied && raw.lc.viaPlacement && (raw.lc.dayOffset || 0) === 0 && Array.isArray(raw.lc.pct)) {
        const r = learningDuration({
            qty : Number(raw.qty ?? raw.orderQty) || 0, smv : raw.smv,
            manpower, baseEffPct : effPct, dailyMinutes : mins,
            dayPcts : raw.lc.pct, dayOffset : 0
        });
        days = Math.max(plainDays, Math.ceil(r.dur - 1e-6));
    }
    return { days, lcDays : days - plainDays, basis : 'capacity' };
}

// (Quantity × SMV) ÷ (Manpower × 10h minutes × Efficiency). Writes raw.dur / reqMin.
export function applyLineFormulaDuration(scheduler, raw, lineId) {
    if (!raw || !lineId) return raw?.dur || 1;
    if (isHoldId(lineId)) {
        // A bar on the Holding Row is sized by the Holding Row's OWN capacity
        // once one is set (no learning ramp, no SOP whole-day run); without
        // it the bar keeps the length it arrived with
        if (!holdCapacitySet(scheduler)) return raw.dur || 1;
        const hp = lineCalcParams(scheduler, raw, lineId);
        applyFormulaToRaw(raw, hp.manpower, hp.effPct, hp.mins);
        fitDurToProduction(scheduler, raw, lineId, hp.mins);
        return raw.dur;
    }
    const { manpower, effPct, mins } = lineCalcParams(scheduler, raw, lineId);
    // SOP-PLN-01 §3: a bar planned by the SOP timeline keeps its capacity-
    // derived WHOLE-day production run (ceil, ≥5 days) — the fractional
    // formula/learning-curve sizing does not override it
    if (raw.sopMode && raw.ship) {
        // Being placed / recalculated: occupancy = curve-aware capacity days
        // (learning-curve days already inside sopDur)
        const bd = sopBoardDays(scheduler, raw, lineId);
        if (bd) {
            raw.sopDur = bd.days;
            raw.sop = { ...(raw.sop || {}), lcDays : bd.lcDays, lcInside : true, basis : bd.basis };
        }
    }
    if (Number(raw.sopDur) > 0) {
        // Saved SOP bars planned before the curve was folded into sopDur
        // still carry their ramp days separately
        const extra = raw.sop?.lcInside ? 0 : (Number(raw.sop?.lcDays) || 0);
        // Whole CALENDAR working days (10h or 12h day alike) — not 600-min units
        raw.dur     = workDayUnits(raw.start || new Date(), Number(raw.sopDur) + extra);
        raw.workMin = raw.dur * mins;
        raw.reqMin  = Math.round((Number(raw.qty ?? raw.orderQty) || 0) * (Number(raw.smv) || 0));
        // Capacity-sized run: the bar ends when the plan qty is actually made
        // (same model as the schedule dialog) — not at a whole-day boundary
        if (raw.sop?.basis !== 'unconfirmed') fitDurToProduction(scheduler, raw, lineId, mins);
        return raw.dur;
    }
    applyFormulaToRaw(raw, manpower, effPct, mins);
    // A bar entering the learning ramp is longer than the plain formula says.
    // ONLY a bar whose ramp came from an active placement (viaPlacement) is
    // sized by the curve — display-only annotations must never grow existing
    // bars when pushFollowers re-runs the formula, or one move cascades into
    // hundreds of phantom position changes across the line.
    if (raw.lc?.applied && raw.lc.viaPlacement && Array.isArray(raw.lc.pct)) {
        const r = learningDuration({
            qty : Number(raw.qty ?? raw.orderQty) || 0, smv : raw.smv,
            manpower, baseEffPct : effPct, dailyMinutes : mins,
            dayPcts : raw.lc.pct, dayOffset : raw.lc.dayOffset || 0
        });
        const clock = snapWorkMinutes(r.dur * mins, mins);
        raw.workMin = clock;
        raw.dur     = clock / mins;
        raw.lc.learnFrac = clock > 0 ? Math.min(1, r.learnMin / clock) : 0;
        raw.lc.dayPlan   = r.dayPlan;
    }
    fitDurToProduction(scheduler, raw, lineId, mins);
    return raw.dur;
}

// Bar length = working time from its start until simulateStrip() has made the
// plan qty (learning ramp, changed-hours dates and the part-day at the start
// included). endOfWork(start, raw.dur) then lands exactly on that moment.
// Needs a real SMV and a start; otherwise the formula length above stands.
function fitDurToProduction(scheduler, raw, lineId, mins) {
    if (!(Number(raw.smv) > 0) || (raw.smvMissing && !(Number(raw.smvManual) > 0))) return;
    if (!(Number(raw.qty ?? raw.orderQty) > 0)) return;
    const start = raw.start ? new Date(raw.start) : null;
    if (!start || Number.isNaN(start.getTime())) return;
    let sim;
    try { sim = simulateStrip(scheduler, raw, lineId, start); } catch { return; }
    if (!sim?.finish) return;
    const wm = Math.ceil(workingMinutesBetween(start, sim.finish));
    if (!(wm > 0)) return;
    raw.dur     = Math.max(1 / 60, wm / WORK_MIN_PER_DAY);
    raw.workMin = raw.dur * mins;
}

export function setBarTooltipEnabled(scheduler, on) {
    const tip = scheduler?.features?.eventTooltip;
    if (!tip) return;
    tip.disabled = !on;
    if (!on) tip.hide?.();
}

const PALETTE = [
    '#d40000', '#1f3fde', '#0a8f3c', '#c78a00', '#7b1fa2',
    '#00838f', '#e0457b', '#5d4037', '#37474f', '#f4511e'
];

const hashColor = s => PALETTE[
    [...String(s)].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length
];

export const colorState = { mode : 'delivery', buyerColors : {}, productColors : {} };

// Style colour: one deterministic colour per style number (hundreds of
// styles → a hue from the name, same everywhere, no table to keep)
const hslToHex = (h, s, l) => {
    const f = n => { const k = (n + h / 30) % 12; const a = s * Math.min(l, 1 - l); const v = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); return Math.round(v * 255).toString(16).padStart(2, '0'); };
    return `#${f(0)}${f(8)}${f(4)}`;
};
export function styleColorOf(style) {
    const k = String(style || '').trim().toUpperCase();
    if (!k) return '#9e9e9e';
    let h = 0;
    for (let i = 0; i < k.length; i++) h = (h * 33 + k.charCodeAt(i)) >>> 0;
    const hue = (h * 137.508) % 360;            // golden angle → neighbours differ
    const light = [0.36, 0.44, 0.52][h % 3];
    return hslToHex(hue, 0.62, light);
}
// Product (garment) type colour: the Efficiency profiles table's colour for
// the type (set by App.vue), else a stable automatic one
// "Product type" colour mode (FastReact plan-state colours): one of four
// states per bar — Projection order (red) · Delivery delay / late strip
// (blue) · Before PCD plan (yellow) · On-time delivery (grey)
export const PLAN_STATE_COLORS = {
    projection : { bg : '#ee2e24', fg : '#fff', label : 'Projection Order' },
    late       : { bg : '#1e88e5', fg : '#fff', label : 'Delivery Delay (Late Strip)' },
    beforePcd  : { bg : '#f9a825', fg : '#222', label : 'Before PCD Plan' },
    onTime     : { bg : '#9e9e9e', fg : '#fff', label : 'On-Time Delivery' }
};
export function planStateOf(raw, startDate, endDate) {
    if (!raw) return 'onTime';
    if (orderTypeOf(raw.po, raw.orderType) === 'projection') return 'projection';
    if (raw.status !== 'completed' && isLateVsDelivery(endDate || raw.end, raw.ship)) return 'late';
    const pcd = raw.pcd ? new Date(raw.pcd) : null;
    const st  = startDate || raw.start;
    if (pcd && !Number.isNaN(+pcd) && st && new Date(st) < pcd) return 'beforePcd';
    return 'onTime';
}

// Item mode label: the ERP garment type (5 Pocket, Chino, Cargo…) — from
// the board load, else from the tooltip's style detail when that is cached,
// else the planning product type
export function itemLabelOf(r) {
    if (!r) return '';
    let g = garmentTypeOf(r);
    if (!g) {
        const s = tipDataFromCache(r)?.detail?.style;
        if (s?.erp_garment_type) {
            const code = mbmOrderNo(r.po, r.mbmOrder);
            erpOrderInfo[code] = { ...(erpOrderInfo[code] || {}), gmt : s.erp_garment_type, ptype : s.erp_product_type || null };
            g = String(s.erp_garment_type).trim();
        }
    }
    return g || String(r.productType || productTypeFor(r.po, r.productType) || '').trim();
}

// What a bar says in each colour mode — one thing per mode:
//   Buyer → the ERP buyer short name · Item → the garment type ·
//   Product/Order → the style · Product delivery → the delivery date ·
//   Late strip qty → the usual buyer : style : order line
export function barModeLine(r, mode, compact = false) {
    if (!r) return '';
    switch (mode) {
        case 'buyer'    : return buyerShortOf(r.buyer) || 'N/A';
        case 'product'  : return itemLabelOf(r) || 'N/A';
        case 'ptype'    : return String(r.style || '').trim() || mbmOrderNo(r.po, r.mbmOrder) || 'N/A';
        case 'delivery' : return fmtDateDdMonRr(orderDeliveryOf(r.ship)) || 'N/A';
        default         : return barDisplayLine(r, compact);
    }
}

export function productTypeColor(name) {
    const k = String(name || '').trim();
    const own = colorState.productColors[k] || colorState.productColors[k.toUpperCase()];
    if (own) return /^#f{6}$/i.test(own) ? '#d9d9d9' : own;   // a white swatch would be an invisible bar
    return styleColorOf(`type:${k}`);
}

// ---------------------------------------------------------------------------
// Buyer colours: the planner's own colour per buyer (Setup → Buyer colours,
// DB-shared) — else a stable automatic one from a 24-hue palette, so every
// buyer gets a clearly different colour even before anyone sets one.
// ---------------------------------------------------------------------------
export const BUYER_PALETTE = [
    '#d32f2f', '#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#0097a7', '#c2185b', '#5d4037',
    '#455a64', '#e64a19', '#303f9f', '#689f38', '#fbc02d', '#512da8', '#00796b', '#afb42b',
    '#8e24aa', '#0288d1', '#f4511e', '#2e7d32', '#6d4c41', '#1e88e5', '#d81b60', '#3949ab'
];
export const buyerKey = b => String(b || '').trim().toUpperCase();
export function autoBuyerColor(buyer) {
    const k = buyerKey(buyer);
    let h = 0;
    for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0;
    return BUYER_PALETTE[h % BUYER_PALETTE.length];
}
export const buyerColorOf = buyer => colorState.buyerColors[buyerKey(buyer)] || autoBuyerColor(buyer);
// white or dark text, whichever reads on the colour
export function textOnColor(hex) {
    const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(hex || ''));
    if (!m) return '#fff';
    const [r, g, b] = [m[1], m[2], m[3]].map(x => parseInt(x, 16) / 255);
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return lum > 0.6 ? '#222' : '#fff';
}
// query = the toolbar quick search (text); ids = the Find panel's result set
// (multi-criteria) — when set it decides hit / dim, the text query is ignored
export const searchState = { query : '', ids : null };

// Strip notes (FastReact Notes): per PO, newest first — filled by App.vue
// from the API when a board opens and kept in step on add / delete. The bar
// renderer marks bars that carry notes; the tooltip lists them.
export const stripNotes = { byPo : new Map() };
export const stripNotesFor = po => (po ? stripNotes.byPo.get(String(po)) || [] : []);
export function setStripNotes(rows) {
    stripNotes.byPo = new Map();
    for (const n of rows || []) {
        const k = String(n.po || '');
        if (!k) continue;
        if (!stripNotes.byPo.has(k)) stripNotes.byPo.set(k, []);
        stripNotes.byPo.get(k).push(n);
    }
}

// Bridge between the scheduler config and App.vue
export const uiHooks = {
    instance         : null,
    unitId           : null,   // production unit of the open board (1 MBM / 2 CEIL / 3 AQL)
    onOpenStripProd  : null,   // right-click → Production update (one strip, day by day)
    onOpenStripNotes : null,   // right-click → Strip notes (FastReact Notes window)
    onEqualOrder     : null,   // right-click / toolbar → Equal Order (balance an order's splits)
    onBeforeEdit     : null,   // (label) → the board records an undo step before a menu edit
    modifierHeld     : false,  // Ctrl / ⌘ is down (multi-select): no tooltip, no bar menu
    multiSelCount    : 0,      // bars in the Ctrl+click selection (menu shows "Merge" from 2)
    onSplitPieces    : null,   // (rec, n) → split one bar into n equal pieces
    onMergeSelected  : null,   // (rec) → merge the Ctrl+click selection (+ rec) into one bar
    onOrderSelect    : null,
    onSelectionClear : null,
    onToast          : null,
    onBoardEdited    : null,
    onOpenProps      : null,
    onOpenSchedule   : null
};

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------
const resources = [
    {
        id : 'hold', name : 'Holding Row', unit : 'AQL', floor : 'F1',
        manpower : 0, machines : 0, eff : 0, availMin : 0,
        holdingRow : true, cls : 'mb-hold-row'
    },
    ...LINES.map(l => ({
        id : l.id, name : l.name, unit : l.unit, floor : l.floor,
        manpower : l.manpower, machines : l.machines, eff : l.eff,
        availMin : l.availMin, utilization : 0, lineRow : true
    })),
    {
        id : 'subtot', name : 'Subtotal Row', unit : 'AQL', floor : 'F1',
        manpower : LINES.reduce((a, l) => a + l.manpower, 0),
        machines : LINES.reduce((a, l) => a + l.machines, 0),
        eff : 0, availMin : 0,
        subtotalRow : true, cls : 'mb-subtotal-row'
    },
    ...STAGE_RESOURCES.map(s => ({
        id : s.id, name : s.name, unit : s.unit, floor : s.floor,
        stageRow : true, cls : 'mb-stage-row'
    }))
];


// ---------------------------------------------------------------------------
// Grand totals footer data: day-wise plan qty of every sewing strip and the
// actual production saved in day_production_update_plan (localStorage mirror)
// ---------------------------------------------------------------------------
const ymdKeyOf = d =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

let gtCache = { at : 0, plan : {}, made : {}, sah : {}, effW : {} };
let barsByLineCache = null;
let interactionDepth = 0;
let interactionMode = null;

export function isBoardInteracting() {
    return interactionDepth > 0;
}

function invalidateBarsCache() {
    barsByLineCache = null;
}

function rebuildBarsCache(scheduler) {
    const byLine = {};
    for (const ev of scheduler.eventStore.records) {
        const raw = ev.data.raw;
        if (!raw || raw.stage) continue;
        const lid = lineIdOf(scheduler, ev);
        (byLine[lid] ||= []).push(ev);
    }
    barsByLineCache = byLine;
    return byLine;
}

function barsOnLine(scheduler, lineId, excludeId = null) {
    const byLine = barsByLineCache || rebuildBarsCache(scheduler);
    // bars travelling with a carried bar (Consolidate orders) are not on any
    // line while the group is in the air — never an obstacle, never pushed
    const list = (byLine[lineId] || []).filter(ev => !ev.data?.raw?._carryGroup);
    return excludeId ? list.filter(ev => ev.id !== excludeId) : list;
}

function isPinnedBar(ev) {
    const raw = ev?.data?.raw;
    return !!(raw?.userPinned || raw?.manualGap || raw?.dbPinned);
}

// Bars NOTHING may displace: explicitly locked or completed. Pinned bars are
// protected from AUTO-repacking only — a deliberate user drop or an insert
// pushes them later like any other follower ("porer bar pichabe").
function lockedBar(ev) {
    return ev.draggable === false || ev.data?.raw?.status === 'completed';
}

// Suspend Bryntum refresh / STM while many strips move at once (drag-drop,
// push followers). Without this the main thread repaints once per bar.
// mode 'light' = single pick-and-place move — no full row/grand-total repaint.
let gtRefreshTimer = null;
function scheduleGrandTotalsRefresh(scheduler) {
    clearTimeout(gtRefreshTimer);
    gtRefreshTimer = setTimeout(() => {
        if (isBoardInteracting()) return;
        refreshGrandTotals(scheduler);
    }, 400);
}

export function beginBoardInteraction(scheduler, mode = 'batch') {
    if (!scheduler) return;
    if (interactionDepth === 0) {
        interactionMode = mode;
        scheduler.suspendRefresh?.();
        if (mode === 'batch' || mode === 'light') {
            rebuildBarsCache(scheduler);
            scheduler.eventStore?.suspendEvents?.();
        }
        if (mode === 'batch') {
            try { scheduler.project?.stm?.disable?.(); }
            catch { /* STM optional */ }
        }
    }
    interactionDepth++;
}

export function endBoardInteraction(scheduler) {
    if (!scheduler) return;
    interactionDepth = Math.max(0, interactionDepth - 1);
    if (interactionDepth > 0) return;

    const wasLight = interactionMode === 'light';
    if (interactionMode === 'batch' || interactionMode === 'light') {
        scheduler.eventStore?.resumeEvents?.();
        if (interactionMode === 'batch') {
            try { scheduler.project?.stm?.enable?.(); }
            catch { /* STM optional */ }
        }
    }
    interactionMode = null;
    invalidateBarsCache();
    if (!wasLight) gtCache.at = 0;
    scheduler.resumeRefresh?.(true);
    if (scheduler.eventStore.count > 80 && !wasLight) {
        try { scheduler.project.stm.disabled = true; }
        catch { /* STM optional */ }
    }
    recalcCapacity(scheduler);
    if (wasLight) {
        scheduleGrandTotalsRefresh(scheduler);
    }
    else {
        refreshGrandTotals(scheduler);
        scheduler.refreshRows?.();
    }
}

function grandTotalMaps() {
    const now = Date.now();
    if (isBoardInteracting() && gtCache.at) return gtCache;
    if (now - gtCache.at < 5000) return gtCache;
    const s = uiHooks.instance;
    const plan = {}, made = {}, sah = {}, effW = {};
    let prodStore = {};
    try { prodStore = JSON.parse(localStorage.getItem('mbm-prod-updates') || '{}'); }
    catch { prodStore = {}; }
    if (s) {
        for (const ev of s.eventStore.records) {
            const raw = ev.data.raw;
            if (!raw || raw.stage) continue;
            // DB-loaded bars carry their line in the ASSIGNMENT store — the
            // event's own resourceId is often unset there
            const lid  = lineIdOf(s, ev);
            const line = LINE_BY_ID[lid];
            if (!line) continue;
            // Same day-wise distribution the Day Plan Report uses, but on the
            // REMAINING qty (order qty minus saved production) so the footer
            // matches what is actually left on the board after prod updates
            const availMin = (line.availMin || 12000) * (raw.stripEff || 100) / 100;
            const smv      = Math.max(0.1, Number(raw.smv) || randSmv(raw.po));
            const target   = Math.max(1, Math.floor(availMin / smv));
            const evMade   = Object.values(prodStore[String(ev.id)] || {})
                .reduce((a, q) => a + (Number(q) || 0), 0);
            let remaining  = Math.max(0, (Number(raw.qty) || 0) - evMade);
            if (!remaining) continue;
            let lastKey    = null;
            const start = new Date(ev.startDate);
            const d = new Date(start);
            d.setHours(0, 0, 0, 0);
            const end = new Date(ev.endDate);
            let guard = 0;
            while (d < end && guard++ < 200) {
                if (!isOffDay(d) && remaining > 0) {
                    // Changed-hours dates take PRIORITY: the day capacity
                    // scales to the overridden hours
                    const hrsF = dayCapacityFactor(d, line.hours, line.id);
                    let dayCap = hrsF > 0 ? Math.max(1, Math.floor(target * hrsF)) : 0;
                    // A production cut can leave the bar starting mid-shift:
                    // that first day only holds the fraction of the shift left
                    const sw = startOfWorkDay(d), ew = endOfWorkDay(d);
                    if (start > sw) {
                        dayCap = start >= ew
                            ? 0
                            : Math.round(dayCap * (ew.getTime() - start.getTime()) / (ew.getTime() - sw.getTime()));
                    }
                    if (dayCap > 0) {
                        const q = Math.min(dayCap, remaining);
                        remaining -= q;
                        const key = ymdKeyOf(d);
                        plan[key] = (plan[key] || 0) + q;
                        sah[key]  = (sah[key]  || 0) + q * smv / 60;
                        effW[key] = (effW[key] || 0) + q * (Number(raw.planEff) > 0
                            ? Number(raw.planEff)
                            : (buyerDefaultEff(raw.buyer) ?? (tooltipEfficiency(lid, raw.productType, line.eff) || line.eff || 0)));
                        lastKey = key;
                    }
                }
                d.setDate(d.getDate() + 1);
            }
            if (remaining > 0 && lastKey) {
                plan[lastKey] += remaining;
                sah[lastKey]  = (sah[lastKey] || 0) + remaining * smv / 60;
                effW[lastKey] = (effW[lastKey] || 0) + remaining * (Number(raw.planEff) > 0
                    ? Number(raw.planEff)
                    : (buyerDefaultEff(raw.buyer) ?? (tooltipEfficiency(lid, raw.productType, line.eff) || line.eff || 0)));
            }
        }
    }
    for (const days of Object.values(prodStore)) {
        for (const [date, q] of Object.entries(days)) {
            made[date] = (made[date] || 0) + (Number(q) || 0);
        }
    }
    gtCache = { at : now, plan, made, sah, effW };
    return gtCache;
}

// Drop the cached totals and repaint the footer. Needed after the DB data
// replaces the demo dataset (loadInlineData) and after production updates:
// otherwise the footer keeps showing numbers computed from the demo events.
export function refreshGrandTotals(scheduler) {
    gtCache.at = 0;
    scheduler?.features?.summary?.refresh?.();
}

// ---------------------------------------------------------------------------
// Capacity recalculation (document 3.3) - refreshes the Cap % column
// ---------------------------------------------------------------------------
export function recalcCapacity(scheduler) {
    if (!scheduler) return;
    // Keep every bar's learning-curve state current (annotation only — no
    // geometry change): insert/move/delete of a predecessor re-derives the
    // ramp for the whole line, so badges and tooltips never go stale
    try { applyLearningCurves(scheduler); } catch { /* board mid-batch */ }
    const util = computeLineUtil(scheduler.eventStore.records);
    for (const res of scheduler.resourceStore.records) {
        if (util.hasOwnProperty(res.id) && res.data.utilization !== util[res.id]) {
            res.set('utilization', util[res.id]);
        }
    }
    return util;
}

// ---------------------------------------------------------------------------
// Resolve where an inserted bar may start (drop insertion rule):
// - an off day start jumps to the FIRST WORKING HOUR of the next working day
// - a bar ALREADY RUNNING across the drop point (its start is before the
//   point) never moves: the new bar attaches right at its end. Same when the
//   drop lands at/near that bar's end (within the work-snap resolution).
// - a locked/completed bar anywhere inside the span blocks the same way
// - bars STARTING at/after the drop point are NOT obstacles here — they are
//   the ones pushFollowers shifts later ("porer bar pichabe")
// ---------------------------------------------------------------------------
export function computeInsertStart(scheduler, lineId, desired, dur, excludeId) {
    const isFixed = lockedBar;
    const bars = barsOnLine(scheduler, lineId, excludeId);
    // "Near the end" tolerance = the board's smallest snap resolution
    const NEAR_MS = WORK_SNAP_MIN * 60 * 1000;
    let start = new Date(desired);
    let snapped = false, blockedBy = null;
    // an off day of the unit OR of this line (Selected lines → 0 hours)
    if (isLineOffDay(start, lineId)) {
        start   = startOfWorkDay(nextLineWorkingDay(start, lineId));
        snapped = true;
    }
    else if (start >= endOfWorkDay(start)) {
        start = nextStartAfter(endOfWorkDay(start));
    }
    else if (start < startOfWorkDay(start)) {
        // Before the day's first hour -> that day's first hour
        start = startOfWorkDay(start);
    }
    for (let guard = 0; guard < 20; guard++) {
        const end  = endOfWork(start, dur);
        const obst = bars.find(ev =>
            // started earlier and still covering (or ending within the snap
            // window of) the drop point → it stays put, we go after it
            (ev.startDate < start && ev.endDate.getTime() + NEAR_MS > start.getTime())
            // locked/completed bars block anywhere inside the span
            || (isFixed(ev) && ev.startDate < end && ev.endDate > start));
        if (!obst) return { start, end, snapped, blockedBy };
        blockedBy = obst.name;
        start = nextStartAfter(obst.endDate);
        if (isLineOffDay(start, lineId)) start = startOfWorkDay(nextLineWorkingDay(start, lineId));
    }
    return { start, end : endOfWork(start, dur), snapped, blockedBy };
}

const MANUAL_GAP_MS = 20 * 60 * 1000;

export function noteManualGap(scheduler, lineId, rec, start) {
    const raw = rec?.data?.raw;
    if (!raw) return false;
    const bars = barsOnLine(scheduler, lineId, rec.id)
        .filter(ev => ev.startDate < start)
        .sort((a, b) => a.endDate - b.endDate);
    const last = bars[bars.length - 1];
    if (!last) {
        raw.manualGap = false;
        return false;
    }
    const flush = nextStartAfter(last.endDate);
    raw.manualGap = start.getTime() - flush.getTime() > MANUAL_GAP_MS;
    return raw.manualGap;
}

// ---------------------------------------------------------------------------
// Actual line of an event. The assignment store is the source of truth:
// cross-line moves update the assignment, so data.resourceId can be stale.
// ---------------------------------------------------------------------------
// Put an event on ONE line through the assignment store (the board's source
// of truth). Never set resourceId on the event itself: that flips Bryntum's
// stores into single-assignment mode and the next board load throws.
export function assignEventLine(scheduler, rec, lineId) {
    const st = scheduler?.assignmentStore;
    if (!st || !rec || lineId == null) return;
    const mine = st.records.filter(x => (x.eventId ?? x.data?.eventId ?? x.data?.event) === rec.id);
    if (mine.length) {
        mine[0].set('resourceId', lineId);
        if (mine.length > 1) st.remove(mine.slice(1));
    }
    else st.add({ eventId : rec.id, resourceId : lineId });
    rec.data.resourceId = lineId;   // plain data mirror for the fallback readers
}

export function lineIdOf(scheduler, ev) {
    const a = scheduler.assignmentStore?.records.find(x =>
        (x.eventId ?? x.data.eventId ?? x.data.event) === ev.id);
    return a
        ? (a.data.resourceId ?? a.resourceId)
        : (ev.resourceId ?? ev.data.resourceId);
}

export function isHoldingRes(res) {
    return !!(res && (isHoldId(res.id) || res.data?.holdingRow));
}

// One Holding Row per floor: 'hold' (single-floor board) or 'hold-<floor>'
export const isHoldId = id => id === 'hold' || String(id || '').startsWith('hold-');
export const firstHoldId = scheduler =>
    scheduler?.resourceStore?.records.find(r => r.data?.holdingRow)?.id || 'hold';
// "Floor-02" (MBM's floors are its two sub-units: "Unit-1")
export function floorLabelOf(unit, floor) {
    const n = String(floor || '1').replace(/\D/g, '') || '1';
    return String(unit || '').toUpperCase() === 'MBM' ? `Unit-${Number(n)}` : `Floor-${n.padStart(2, '0')}`;
}

export function isSewingRes(res) {
    return !!(res && (res.data?.lineRow || LINE_BY_ID[res.id]));
}

// ---------------------------------------------------------------------------
// FastReact insertion rule: the placed bar keeps its exact spot, and every
// following bar on the line shifts later to make room ("porer bar shore jay").
// Completed bars never move - they act as fixed obstacles.
// Returns the number of bars that were shifted.
// ---------------------------------------------------------------------------
export function pushFollowers(scheduler, lineId, placed) {
    // Only locked/completed bars stay put — pinned followers shift later too
    const isFixed = lockedBar;
    const bars = barsOnLine(scheduler, lineId, placed.id);
    // Every bar that CONFLICTS with the placed spot shifts later — including
    // one that started earlier but still covers the drop point
    const followers = bars
        .filter(ev => ev.endDate > placed.startDate)
        .sort((a, b) => a.startDate - b.startDate);
    let prevEnd = new Date(placed.endDate);
    let pushed  = 0;
    for (const ev of followers) {
        if (isFixed(ev)) {
            if (ev.endDate > prevEnd) prevEnd = new Date(ev.endDate);
            continue;
        }
        let ns = nextStartAfter(prevEnd);
        // A bar NEVER advances earlier automatically ("plan agabe na") — it
        // keeps its own start and only shifts LATER when the placed bar (or a
        // pushed predecessor) actually collides with it. Gaps stay gaps.
        if (ev.startDate > ns) {
            ns = clampIntoWorkWindow(ev.startDate);
        }
        for (let guard = 0; guard < 10; guard++) {
            const ne   = endOfWork(ns, ev.data.raw.dur);
            const obst = bars.find(o => o !== ev && isFixed(o) && o.startDate < ne && o.endDate > ns);
            if (!obst) break;
            ns = nextStartAfter(obst.endDate);
        }
        // The pushed bar's END follows the production schedule at its new
        // start (hours / learning ramp differ by date) — bar = schedule, always
        const raw = ev.data.raw;
        if (ev.startDate?.getTime() !== ns.getTime()) {
            raw.start = ns;
            applyLineFormulaDuration(scheduler, raw, lineId);
            // (a strip in production re-anchors itself where it now stands on
            // the next production refresh — see applyProdUpdates)
        }
        const ne = endOfWork(ns, raw.dur);
        if (ev.startDate?.getTime() !== ns.getTime() || ev.endDate?.getTime() !== ne.getTime()) {
            ev.set({ startDate : ns, endDate : ne, duration : elapsedDays(ns, ne) });
            ev.data.raw.start = ns;
            ev.data.raw.end   = ne;
            pushed++;
        }
        prevEnd = ne;
    }
    return pushed;
}

// Re-sequence every line with zero gaps: bars are packed flush one after
// another starting at the plan start (today's first working hour), ordered
// by earliest PCD first (then delivery). Completed bars never move — they
// act as fixed obstacles and following bars attach right after them.
// Pins and manual gaps are cleared so no artificial gap survives.
// Post-commit overlap enforcement: the scheduling engine can re-normalize a
// bar's end AFTER the batched pack (calendar rounding on fresh events),
// re-creating a small overlap the sync sweep already fixed. This runs with
// the engine settled (commitAsync between passes) and pushes the later bar
// later until every line is strictly sequential. Never moves a bar earlier.
export async function enforceSequentialLines(scheduler) {
    if (!scheduler) return 0;
    let totalMoved = 0;
    for (let pass = 0; pass < 3; pass++) {
        try { await scheduler.project?.commitAsync?.(); } catch { /* engine busy */ }
        let moved = 0;
        for (const res of scheduler.resourceStore.records) {
            if (!res.data?.lineRow && !LINE_BY_ID[res.id]) continue;
            const bars = scheduler.eventStore.records
                .filter(ev => ev.data?.raw && !ev.data.raw.stage && lineIdOf(scheduler, ev) === res.id)
                .sort((a, b) => a.startDate - b.startDate);
            let prevEnd = null;
            for (const ev of bars) {
                const raw = ev.data.raw;
                let evEnd = new Date(ev.endDate);
                if (raw.status !== 'completed' && prevEnd && ev.startDate < prevEnd
                    && prevEnd - ev.startDate > 60000) {
                    const oldStart = new Date(ev.startDate);
                    const ns = nextStartAfter(prevEnd);
                    const ne = endOfWork(ns, raw.dur || elapsedDays(ev.startDate, ev.endDate) || 1);
                    ev.set({ startDate : ns, endDate : ne, duration : elapsedDays(ns, ne) });
                    raw.start = ns;
                    raw.end   = ne;
                    evEnd = ne;
                    // Only a REAL displacement is worth persisting — minute-level
                    // nudges from formula rounding must not spam the save dialog
                    if (ns - oldStart > 3600000) uiHooks.notePositionRepair?.(String(ev.id));
                    moved++;
                }
                if (!prevEnd || evEnd > prevEnd) prevEnd = evEnd;
            }
        }
        totalMoved += moved;
        if (!moved) break;
    }
    if (totalMoved) scheduler.refreshRows?.();
    return totalMoved;
}

// ---------------------------------------------------------------------------
// Learning curve (product-changeover ramp). Domain rules live in
// learningCurveService.mjs; this glue feeds it the board's sequences and the
// configured Build up profile, and annotates every bar with raw.lc for the
// renderer, the tooltip and the duration formula.
// ---------------------------------------------------------------------------
const LC_EPOCH = new Date(2026, 0, 1);
const workDayIdxCache = new Map();

// Working days between the epoch and a date — the calendar-aware day counter
// the curve runs on (off days / holidays are excluded, so a ramp interrupted
// by a holiday simply continues on the next working day)
function workDayIndexOf(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    const key = x.getTime();
    if (workDayIdxCache.has(key)) return workDayIdxCache.get(key);
    let n = 0;
    const t = new Date(LC_EPOCH);
    while (t < x && n < 4000) {
        if (!isOffDay(t)) n++;
        t.setDate(t.getDate() + 1);
    }
    workDayIdxCache.set(key, n);
    return n;
}

export function invalidateWorkDayCache() {
    workDayIdxCache.clear();
}

// The automatic product-change curve of the OPEN board: that unit's own
// 3-day Build up curve when one is defined, else a 3-day curve shared by
// every unit (unitId empty). Curves of another unit never apply here.
function configuredLearningCurve() {
    try {
        const list = JSON.parse(localStorage.getItem('mbm-buildup') || '[]');
        const uid  = Number(uiHooks.unitId) || 0;
        return (uid && pickLearningCurve(list.filter(c => Number(c?.unitId) === uid), 3))
            || pickLearningCurve(list.filter(c => !(Number(c?.unitId) > 0)), 3);
    }
    catch { return null; }
}

// Style identity for the learning-curve run rule: the leading style number
// (colour / size suffixes such as "13343941-maroon" vs "13343941-black" are
// the SAME style); short codes keep their full text
export function styleBaseKey(style) {
    const t = String(style || '').trim().toLowerCase();
    if (!t) return '';
    const first = t.split(/[\s-]+/)[0];
    return first.length >= 5 ? first : t;
}

// Learning-curve run identity = product type + style: a line that repeats
// the same style AND product does NOT ramp again (the strips are linked as a
// multiple-strip build-up instead); a new style — even of the same product —
// is a changeover and takes the 3-day curve
function lcRunKey(raw, lineId) {
    const type = lcTypeKey(raw?.po, lineId, raw?.productType) || '_Default';
    const st   = styleBaseKey(raw?.style);
    return st ? `${type}|${st}` : type;
}

// Per-invocation cached product-type resolver: the profile master is parsed
// once, not once per bar (tooltipProductType hits localStorage every call)
let lcProfCache = null;
function lcTypeKey(po, lineId, preferred) {
    if (!lcProfCache) {
        try {
            lcProfCache = {
                map  : JSON.parse(localStorage.getItem('mbm-line-prof') || '{}'),
                list : JSON.parse(localStorage.getItem('mbm-eff-list') || '[]')
            };
        }
        catch { lcProfCache = { map : {}, list : [] }; }
    }
    const pid = lineId ? lcProfCache.map[lineId] : null;
    const profile = (pid && lcProfCache.list.find(p => p.id === pid)) || lcProfCache.list[0];
    return resolveProfileType(po, profile?.values, preferred);
}

/**
 * Re-derive the learning-curve state of every bar on the given lines (all
 * sewing lines when omitted). ANNOTATION ONLY — raw.lc feeds the renderer,
 * the tooltip and the day-wise schedule, but existing bar geometry is never
 * touched here (mass-resizing cascades into hundreds of phantom position
 * repairs). A bar takes its curve-adjusted DURATION only at the moment it is
 * actively placed/dropped, via deriveLcForPlacement + applyLineFormulaDuration.
 * Deterministic from the bar sequence — a reload reproduces the same state.
 */
export function applyLearningCurves(scheduler, { lineIds = null } = {}) {
    if (!scheduler) return 0;
    lcProfCache = null; // fresh profile master per pass
    const curve = configuredLearningCurve();
    const wanted = lineIds ? new Set(lineIds) : null;
    let resized = 0;
    for (const res of scheduler.resourceStore.records) {
        if (!res.data?.lineRow && !LINE_BY_ID[res.id]) continue;
        if (wanted && !wanted.has(res.id)) continue;
        const bars = scheduler.eventStore.records
            .filter(ev => ev.data?.raw && !ev.data.raw.stage && lineIdOf(scheduler, ev) === res.id)
            .sort((a, b) => a.startDate - b.startDate);
        if (!bars.length) continue;
        const seq = bars.map(ev => ({
            id           : ev.id,
            typeKey      : lcRunKey(ev.data.raw, res.id),
            workDayIndex : workDayIndexOf(ev.startDate)
        }));
        const typeKeyById = new Map(seq.map(x => [x.id, x.typeKey]));
        const plan = curve ? buildLineLearning(seq, curve) : new Map();
        let runRef = null;
        for (const ev of bars) {
            const raw = ev.data.raw;
            // A manually applied Build up curve (context menu) overrides the
            // automatic changeover derivation and always ramps from day 1
            const manual = raw.lcManual && Array.isArray(raw.lcManual.pct) && raw.lcManual.pct.length
                ? raw.lcManual : null;
            const info = manual
                ? { applied : true, reason : 'manual', dayOffset : 0,
                    typeKey : typeKeyById.get(ev.id) || raw.productType || '_Default' }
                : plan.get(ev.id);
            if (!info) { delete raw.lc; continue; }
            const activeCurve = manual || curve;
            // Multiple strip rule: the first bar of a run is the reference;
            // every later strip of the same style + product on the line is
            // auto-linked to it (live) instead of ramping again. Links a
            // user made by hand are never touched.
            const isRunStart = info.reason === 'product-change' || info.reason === 'first-on-line' || manual;
            if (isRunStart) {
                runRef = { id : ev.id, order : mbmOrderNo(raw.po, raw.mbmOrder) };
                if (raw.lcLink?.auto) delete raw.lcLink;
            }
            else if (runRef && runRef.id !== ev.id && (!raw.lcLink || raw.lcLink.auto)) {
                const now = new Date().toISOString();
                raw.lcLink = {
                    group : `lg-${runRef.id}`, refId : runRef.id, refOrder : runRef.order,
                    curve : activeCurve?.name || null, version : 1, mode : 'live',
                    linkedBy : 'auto — repeated style', linkedAt : raw.lcLink?.linkedAt || now, lastSync : now, auto : true
                };
            }
            raw.lc = {
                applied     : info.applied,
                reason      : info.reason,
                dayOffset   : info.dayOffset,
                typeKey     : String(info.typeKey).split('|')[0],
                runKey      : info.typeKey,
                profileName : activeCurve.name,
                period      : Number(activeCurve.period) || activeCurve.pct.length,
                pct         : activeCurve.pct,
                learnFrac   : raw.lc?.learnFrac || 0,
                dayPlan     : raw.lc?.dayPlan || [],
                // keep the placement flag: a bar sized by the curve when it
                // was placed stays curve-sized on later pushes; a manual
                // curve is always geometry-authoritative
                viaPlacement : manual ? true : !!raw.lc?.viaPlacement
            };
            // Tooltip data even when geometry stays untouched. Base eff
            // (profile/plan eff × strip eff) shows for EVERY bar — with or
            // without a ramp — so a strip-efficiency edit is always visible
            const { manpower, effPct, mins } = lineCalcParams(scheduler, raw, res.id);
            raw.lc.baseEffPct = Math.round(effPct * 10) / 10;
            if (info.applied) {
                const r = learningDuration({
                    qty : Number(raw.qty ?? raw.orderQty) || 0, smv : raw.smv,
                    manpower, baseEffPct : effPct, dailyMinutes : mins,
                    dayPcts : activeCurve.pct, dayOffset : info.dayOffset
                });
                const total = Number(raw.workMin) > 0 ? Number(raw.workMin) : r.workMin;
                raw.lc.learnFrac = total > 0 ? Math.min(1, r.learnMin / total) : 0;
                raw.lc.dayPlan   = r.dayPlan;
            }
            else {
                raw.lc.learnFrac = 0;
                raw.lc.dayPlan   = [];
            }
        }
    }
    return resized;
}

/**
 * Ramp state for ONE bar about to be placed at `startDate` on `lineId` —
 * compares against the bars already on the line (run walk-back included) and
 * writes raw.lc so applyLineFormulaDuration computes a curve-aware duration
 * BEFORE the bar is inserted. Only the placed bar's geometry ever changes.
 */
export function deriveLcForPlacement(scheduler, raw, lineId, startDate) {
    if (!scheduler || !raw || !lineId || isHoldId(lineId) || !startDate) return;
    lcProfCache = null;
    // A manually applied Build up curve travels with the bar — moving it
    // never clears or re-derives the manual ramp
    if (raw.lcManual && Array.isArray(raw.lcManual.pct) && raw.lcManual.pct.length) {
        raw.lc = {
            applied : true, reason : 'manual', dayOffset : 0,
            typeKey : lcRunKey(raw, lineId),
            profileName : raw.lcManual.name,
            period : Number(raw.lcManual.period) || raw.lcManual.pct.length,
            pct : raw.lcManual.pct,
            learnFrac : 0, dayPlan : [], viaPlacement : true
        };
        return;
    }
    const curve = configuredLearningCurve();
    if (!curve) { delete raw.lc; return; }
    const myKey = lcRunKey(raw, lineId);
    const base = {
        typeKey : myKey, profileName : curve.name,
        period : curve.period, pct : curve.pct, learnFrac : 0, dayPlan : [],
        viaPlacement : true
    };
    // Bars already on the line that start BEFORE the placement point
    const prevBars = scheduler.eventStore.records
        .filter(ev => ev.data?.raw && !ev.data.raw.stage && ev.data.raw !== raw
            && lineIdOf(scheduler, ev) === lineId && ev.startDate < startDate)
        .sort((a, b) => b.startDate - a.startDate);
    if (!prevBars.length) {
        raw.lc = { ...base, applied : false, reason : 'first-on-line', dayOffset : 0 };
        return;
    }
    const prevKey = lcRunKey(prevBars[0].data.raw, lineId);
    if (prevKey !== myKey) {
        raw.lc = { ...base, applied : true, reason : 'product-change', dayOffset : 0 };
        return;
    }
    // Same type: walk back to the start of the run and continue its ramp
    let runStart = prevBars[0];
    let hasChangeoverBefore = false;
    for (let i = 1; i < prevBars.length; i++) {
        const k = lcRunKey(prevBars[i].data.raw, lineId);
        if (k !== myKey) { hasChangeoverBefore = true; break; }
        runStart = prevBars[i];
    }
    const offset  = Math.max(0, workDayIndexOf(startDate) - workDayIndexOf(runStart.startDate));
    const applied = hasChangeoverBefore && offset < curve.period;
    raw.lc = {
        ...base,
        applied,
        reason    : applied ? 'continuation' : 'same-product',
        dayOffset : Math.min(offset, curve.period)
    };
}

export function packBoardGaps(scheduler) {
    if (!scheduler) return 0;
    invalidateBarsCache();
    rebuildBarsCache(scheduler);
    const anchor = startOfWorkDay(nextWorkingDay(new Date()));
    let moved = 0;
    for (const res of scheduler.resourceStore.records) {
        if (!res.data?.lineRow && !LINE_BY_ID[res.id]) continue;
        moved += packLineNoGaps(scheduler, res.id, anchor);
    }
    invalidateBarsCache();
    return moved;
}

// Completed/locked bars AND user-pinned bars are immovable during packing —
// a bar the user moved and saved (userPinned in its DB notes) must keep its
// exact position across reloads; packing flows the rest around it.
function packImmovable(ev) {
    return ev.draggable === false
        || ev.data?.raw?.status === 'completed'
        || isPinnedBar(ev);
}

function packLineNoGaps(scheduler, lineId, anchor) {
    const bars = barsOnLine(scheduler, lineId)
        .filter(ev => ev.data?.raw && !ev.data.raw.stage);
    const fixed = bars.filter(packImmovable);
    let moved = 0;

    // Saved (pinned) and completed bars keep their SAVED span exactly as it
    // came from the DB — a reload must show what the user saved. The formula
    // re-sizes a bar only when the user changes it (move, properties edit,
    // pull forward, SOP plan), never on load.

    // Overlap repair among pinned bars: bad saved data (or a duration refresh
    // growing a bar) can leave two pinned bars on top of each other. Bars must
    // sit one after another — the LATER-starting bar shifts later (never
    // earlier) until the line is sequential. Completed bars stay anchored.
    const fixedSorted = [...fixed].sort((a, b) => a.startDate - b.startDate);
    let fPrevEnd = null;
    for (const ev of fixedSorted) {
        const raw = ev.data.raw;
        if (raw.status !== 'completed' && fPrevEnd && ev.startDate < fPrevEnd) {
            const oldStart = new Date(ev.startDate);
            const ns = nextStartAfter(fPrevEnd);
            const ne = endOfWork(ns, raw.dur || elapsedDays(ev.startDate, ev.endDate) || 1);
            ev.set({ startDate : ns, endDate : ne, duration : elapsedDays(ns, ne) });
            raw.start = ns;
            raw.end   = ne;
            if (ns - oldStart > 3600000) uiHooks.notePositionRepair?.(String(ev.id));
            moved++;
        }
        if (!fPrevEnd || ev.endDate > fPrevEnd) fPrevEnd = new Date(ev.endDate);
    }

    // Earliest PCD sews first; ties fall back to delivery, then current
    // position (keeps split strips of the same order in visual order)
    const tsOf = d => {
        const t = d ? new Date(d).getTime() : NaN;
        return Number.isNaN(t) ? Infinity : t;
    };
    const cmp = (x, y) => (x < y ? -1 : x > y ? 1 : 0);
    const movable = bars.filter(ev => !packImmovable(ev)).sort((a, b) =>
        cmp(tsOf(a.data.raw.pcd), tsOf(b.data.raw.pcd))
        || cmp(tsOf(a.data.raw.ship), tsOf(b.data.raw.ship))
        || (a.startDate - b.startDate)
        || String(a.id).localeCompare(String(b.id)));

    let cursor = new Date(anchor);
    for (const ev of movable) {
        const raw = ev.data.raw;
        applyLineFormulaDuration(scheduler, raw, lineId);
        const dur = raw.dur || 1;
        let start = clampIntoWorkWindow(cursor);
        for (let guard = 0; guard < 20; guard++) {
            const end  = endOfWork(start, dur);
            const obst = fixed.find(o => o.startDate < end && o.endDate > start);
            if (!obst) break;
            start = nextStartAfter(obst.endDate);
        }
        const end = endOfWork(start, dur);
        raw.userPinned = false;
        raw.manualGap  = false;
        if (ev.startDate?.getTime() !== start.getTime() || ev.endDate?.getTime() !== end.getTime()) {
            ev.set({ startDate : start, endDate : end, duration : elapsedDays(start, end) });
            raw.start = start;
            raw.end   = end;
            moved++;
        }
        raw.latePlan = !!(raw.pcd && startOfWorkDay(start) > startOfWorkDay(new Date(raw.pcd)));
        cursor = end;
    }

    // FINAL GUARANTEE: bars sit strictly one after another on the line.
    // Whatever produced an overlap (auto-planner gap-fill, a stale bar cache,
    // bad saved data), the LATER-starting bar shifts later — never earlier.
    // Scans the event store directly so freshly added bars are included even
    // when the line cache has not seen their assignment yet.
    const spanStart = ev => (ev.data.raw.start instanceof Date ? ev.data.raw.start : ev.startDate);
    const allOnLine = scheduler.eventStore.records
        .filter(ev => ev.data?.raw && !ev.data.raw.stage && lineIdOf(scheduler, ev) === lineId)
        .sort((a, b) => spanStart(a) - spanStart(b));
    // NOTE: inside a batched interaction, reading ev.startDate/endDate right
    // after ev.set() can return stale values — track the effective span
    // locally instead of reading it back from the record.
    let seqEnd = null;
    for (const ev of allOnLine) {
        const raw = ev.data.raw;
        let evStart = raw.start instanceof Date ? raw.start : new Date(ev.startDate);
        let evEnd   = raw.end   instanceof Date ? raw.end   : new Date(ev.endDate);
        if (raw.status !== 'completed' && seqEnd && evStart < seqEnd) {
            const ns = nextStartAfter(seqEnd);
            const ne = endOfWork(ns, raw.dur || elapsedDays(evStart, evEnd) || 1);
            ev.set({ startDate : ns, endDate : ne, duration : elapsedDays(ns, ne) });
            raw.start = ns;
            raw.end   = ne;
            if (ns - evStart > 3600000) uiHooks.notePositionRepair?.(String(ev.id));
            evEnd = ne;
            moved++;
        }
        if (!seqEnd || evEnd > seqEnd) seqEnd = new Date(evEnd);
    }
    return moved;
}

// ---------------------------------------------------------------------------
// FastReact strip split: cut a bar into two at a working-day boundary.
// Either dur1 (working days kept by part 1, from the cursor position) or
// qty2 (exact quantity for the NEW bar) drives the split.
// ---------------------------------------------------------------------------
let splitSeq = 0;

function poBaseEventCode(po) {
    return `EV-${String(po || 'NEW').replace(/[^A-Za-z0-9]/g, '')}-SEW`;
}

function nextStripEventCode(scheduler, po, parentCode = null) {
    // Base on the parent's own event code when it has one — projection bars
    // have an empty po, and poBaseEventCode('') would give every projection
    // the SAME 'EV-NEW-SEW' base, colliding across different orders
    const base = String(parentCode || poBaseEventCode(po)).replace(/-\d{1,2}$/, '');
    let maxSuffix = 1;
    for (const ev of scheduler.eventStore.records) {
        const r = ev.data?.raw;
        if (!r) continue;
        const code = String(r.eventCode || '');
        if (code !== base && !code.startsWith(`${base}-`)) continue;
        const m = code.match(/-(\d+)$/);
        if (m) maxSuffix = Math.max(maxSuffix, Number(m[1]));
    }
    return maxSuffix <= 1 ? `${base}-2` : `${base}-${maxSuffix + 1}`;
}

export function splitBar(scheduler, rec, { dur1 = null, qty2 = null }) {
    const raw  = rec.data.raw;
    const rid  = rec.resourceId ?? rec.data.resourceId;
    const res  = scheduler.resourceStore.getById(rid);
    // A bar on the Holding Row splits too (no capacity there: the parts
    // share the bar's own span by quantity)
    const onHold = isHoldId(rid);
    const line = LINE_BY_ID[rid] || (res?.data?.lineRow ? { id : rid, ...res.data } : (onHold && res ? { id : rid, ...res.data } : null));
    if (!raw || raw.stage) return { ok : false, msg : 'Only production bars can be split' };
    if (raw.status === 'completed') return { ok : false, msg : 'Completed orders cannot be split' };
    if (!line) return { ok : false, msg : 'Only sewing-line / Holding Row bars can be split' };

    const orig = { ...raw };
    const manpower = Number(res?.data?.manpower ?? line.manpower) || 50;
    const lineEff  = Number(res?.data?.eff ?? line.eff) || 50;
    const profileEff = buyerDefaultEff(orig.buyer) ?? tooltipEfficiency(rid, orig.productType, lineEff);
    const baseEff = Number(orig.planEff) > 0
        ? Number(orig.planEff)
        : (Number(profileEff) > 0 ? Number(profileEff) : lineEff);
    const usedEff = baseEff * (Math.max(1, Number(orig.stripEff) || 100) / 100);
    let q1, q2, d1, d2;

    if (qty2 !== null) {
        q2 = Math.round(qty2);
        if (!Number.isFinite(q2) || q2 <= 0 || q2 >= orig.qty) {
            return { ok : false, msg : `Quantity must be between 1 and ${fmtQty(orig.qty - 1)}` };
        }
        q1 = orig.qty - q2;
        if (onHold) {
            const span = Number(orig.dur) > 0 ? Number(orig.dur) : Math.max(1, elapsedDays(new Date(rec.startDate), new Date(rec.endDate)));
            d1 = Math.max(1 / 60, span * q1 / orig.qty);
            d2 = Math.max(1 / 60, span * q2 / orig.qty);
        }
        else {
            d1 = formulaWorkingDays(q1, orig.smv, manpower, usedEff);
            d2 = formulaWorkingDays(q2, orig.smv, manpower, usedEff);
        }
    }
    else {
        if (orig.dur < 2) return { ok : false, msg : 'Bar is only one working day — nothing to split' };
        d1 = Math.max(1, Math.min(orig.dur - 1, dur1 ?? 1));
        d2 = orig.dur - d1;
        q1 = Math.round(orig.qty * d1 / orig.dur);
        q2 = orig.qty - q1;
    }

    // SOP-planned bar: each part gets ITS OWN whole-day run from its own
    // quantity (the parent's run must not be inherited — later edits would
    // keep sizing both parts by the full order)
    let sop1 = null, sop2 = null;
    if (Number(orig.sopDur) > 0 && !onHold) {
        const t1 = { ...orig, qty : q1, orderQty : q1, sopMode : true, sop : { ...(orig.sop || {}) } };
        const t2 = { ...orig, qty : q2, orderQty : q2, sopMode : true, sop : { ...(orig.sop || {}), lcDays : 0 }, lc : orig.lc ? { ...orig.lc, applied : false } : undefined };
        applyLineFormulaDuration(scheduler, t1, line.id);
        applyLineFormulaDuration(scheduler, t2, line.id);
        d1 = t1.dur; d2 = t2.dur;
        sop1 = { sopDur : t1.sopDur, sop : t1.sop };
        sop2 = { sopDur : t2.sopDur, sop : t2.sop };
    }

    const start1 = new Date(rec.startDate);
    const end1   = endOfWork(start1, d1);
    const start2 = nextStartAfter(end1);
    const end2   = endOfWork(start2, d2);

    // Part 1: the original record shrinks (ERP base qty follows the same split)
    const base0  = Number(orig.baseQty) > 0 ? Number(orig.baseQty) : null;
    const order0 = Number(orig.orderQty) > 0 ? Number(orig.orderQty) : null;
    const share1 = q1 / Math.max(1, orig.qty);
    if (base0)  raw.baseQty  = Math.round(base0 * share1);
    if (order0) raw.orderQty = Math.round(order0 * share1);   // the piece's ERP qty = its share (plan qty = this + 3 %)
    raw.qty    = q1;
    raw.reqMin = Math.round(q1 * orig.smv);
    raw.dur    = d1;
    if (sop1) { raw.sopDur = sop1.sopDur; raw.sop = sop1.sop; }
    raw.start  = start1;
    raw.end    = end1;
    rec.set({ endDate : end1, duration : elapsedDays(start1, end1) });

    // Part 2: a new bar attached right after part 1
    if (!raw.eventCode) {
        raw.eventCode = String(orig.id || '').startsWith('proj:')
            ? `ev-${orig.id}` : poBaseEventCode(raw.po);
    }
    const strip2Code = nextStripEventCode(scheduler, raw.po, raw.eventCode);
    const raw2 = {
        ...orig,
        qty : q2, reqMin : Math.round(q2 * orig.smv), dur : d2,
        ...(base0  ? { baseQty  : base0 - raw.baseQty } : {}),
        ...(order0 ? { orderQty : order0 - raw.orderQty } : {}),
        start : start2, end : end2, progress : 0, status : 'draft',
        eventCode : strip2Code,
        // The piece needs its OWN board identity — copying the parent's id
        // (e.g. 'proj:26XXX') would make the two parts indistinguishable
        id : strip2Code.startsWith('ev-') ? strip2Code.slice(3) : strip2Code,
        dbId : orig.dbId,
        keepSeparate : !!orig.keepSeparate,
        ...(sop2 ? { sopDur : sop2.sopDur, sop : sop2.sop } : {})
    };
    const id = `${rec.id}-sp${++splitSeq}`;
    scheduler.eventStore.add({
        id,
        startDate  : start2,
        endDate    : end2,
        duration   : elapsedDays(start2, end2),
        manuallyScheduled : true,
        name        : rec.name,
        percentDone : 0,
        raw         : raw2
    });
    const rec2 = scheduler.eventStore.getById(id);
    if (rec2) assignEventLine(scheduler, rec2, line.id);

    const pushed = rec2 && !onHold ? pushFollowers(scheduler, line.id, rec2) : 0;
    const util   = recalcCapacity(scheduler) || {};
    const riskOf = (st, en, status) => calcRisk({
        start : st, end : en, ship : orig.ship, matReady : orig.matReady,
        lineUtil : util[line.id] ?? 0, status
    });
    raw.risk  = riskOf(start1, end1, raw.status);
    raw2.risk = riskOf(start2, end2, 'draft');

    uiHooks.onBoardEdited?.();
    return { ok : true, q1, q2, d1, d2, pushed, rec2 };
}

// One bar → n pieces of (nearly) equal quantity, laid flush one after the
// other on the same row (line or Holding Row); the last piece takes the
// rounding remainder. Each step is the ordinary split, so every piece keeps
// the order's identity and its own strip code.
export function splitBarIntoPieces(scheduler, rec, n) {
    const raw = rec?.data?.raw;
    n = Math.max(2, Math.min(12, Math.round(Number(n) || 2)));
    if (!raw || raw.stage) return { ok : false, msg : 'Only production bars can be split' };
    const total = Number(raw.qty) || 0;
    if (total < n) return { ok : false, msg : `${fmtQty(total)} pcs cannot be split into ${n} pieces` };
    const per = Math.floor(total / n);
    const pieces = [rec];
    let current = rec;
    let pushed = 0;
    for (let k = 1; k < n; k++) {
        // the current (last) piece keeps `per`, the new bar takes the rest
        const rest = total - k * per;
        const r = splitBar(scheduler, current, { qty2 : rest });
        if (!r.ok) return { ok : false, msg : r.msg, pieces };
        pushed += r.pushed || 0;
        current = r.rec2;
        pieces.push(current);
    }
    return { ok : true, n, per, last : total - (n - 1) * per, pushed, pieces };
}

// Several bars of ONE order (same PO / order / colour) on ONE row → one bar:
// the earliest keeps its place, quantities add up, the length follows the
// row's capacity, the other bars leave (cancelled in the DB on Save).
export function mergeBars(scheduler, recs) {
    const list = (recs || []).filter(r => r?.data?.raw && !r.data.raw.stage);
    if (list.length < 2) return { ok : false, msg : 'Select at least two bars of the same order (Ctrl+click)' };
    const first = [...list].sort((a, b) => a.startDate - b.startDate)[0];
    const r0 = first.data.raw;
    const lid = lineIdOf(scheduler, first);
    const same = o =>
        String(o.po || '') === String(r0.po || '')
        && String(o.mbmOrder || '') === String(r0.mbmOrder || '')
        && String(o.color || '').trim().toLowerCase() === String(r0.color || '').trim().toLowerCase();
    for (const r of list) {
        if (r.data.raw.status === 'completed') return { ok : false, msg : 'A completed bar cannot be merged' };
        if (!same(r.data.raw)) return { ok : false, msg : `${r.data.raw.mbmOrder || r.data.raw.po} is another order / colour — only one order's bars merge` };
        if (lineIdOf(scheduler, r) !== lid) return { ok : false, msg : 'The bars must sit on the same line / row' };
    }
    const others = list.filter(r => r !== first);
    let qty = Number(r0.qty) || 0, made = Number(r0.made) || 0, base = Number(r0.baseQty) || 0, order = Number(r0.orderQty) || 0, progW = (Number(r0.progress) || 0) * qty;
    let dur = Number(r0.dur) || elapsedDays(new Date(first.startDate), new Date(first.endDate));
    for (const r of others) {
        const x = r.data.raw;
        qty  += Number(x.qty) || 0;
        made += Number(x.made) || 0;
        base += Number(x.baseQty) || 0;
        order += Number(x.orderQty) || 0;
        progW += (Number(x.progress) || 0) * (Number(x.qty) || 0);
        dur  += Number(x.dur) || elapsedDays(new Date(r.startDate), new Date(r.endDate));
    }
    r0.qty = qty;
    if (base > 0) r0.baseQty = base;
    if (order > 0) r0.orderQty = order;
    if (made > 0) r0.made = made;
    r0.progress = qty ? Math.round(progW / qty) : 0;
    r0.reqMin = Math.round(qty * (Number(r0.smv) || 0));
    const start = new Date(first.startDate);
    r0.start = start;
    if (isHoldId(lid)) r0.dur = dur;
    else { r0.dur = dur; try { applyLineFormulaDuration(scheduler, r0, lid); } catch { /* keep the summed span */ } }
    const end = endOfWork(start, r0.dur || dur || 1);
    r0.end = end;
    first.set({ endDate : end, duration : elapsedDays(start, end), percentDone : r0.progress });
    for (const r of others) noteRemovedDbEvent(r);
    scheduler.eventStore.remove(others);
    const pushed = isHoldId(lid) ? 0 : pushFollowers(scheduler, lid, first);
    recalcCapacity(scheduler);
    uiHooks.onBoardEdited?.();
    return { ok : true, qty, merged : others.length, pushed, rec : first };
}

// ---------------------------------------------------------------------------
// FastReact re-join rule: two strips of the SAME order/PO on the same line
// that sit flush against each other (no gap) merge back into one strip.
// Quantities add up, progress is quantity-weighted. A gap keeps them apart.
// ---------------------------------------------------------------------------
export function tryMergeAdjacent(scheduler, rec, targetLineId = null) {
    let raw = rec?.data?.raw;
    if (!raw || raw.stage) return null;
    // Strictly same line (assignment-based, never stale) AND same order/PO.
    // Projection bars have an empty po — identity must also include the order
    // code, and at least one of po/order must be non-empty (otherwise two
    // DIFFERENT projection orders would merge into one corrupted bar).
    const lineId = targetLineId ?? lineIdOf(scheduler, rec);
    // One PO number can belong to several COLOUR groups of the same order —
    // strips join only within one colour group, never across colours
    const sameOrder = o =>
        String(o.po || '') === String(raw.po || '')
        && String(o.mbmOrder || '') === String(raw.mbmOrder || '')
        && String(o.color || '').trim().toLowerCase() === String(raw.color || '').trim().toLowerCase()
        && (String(raw.po || '') !== '' || String(raw.mbmOrder || '') !== '');
    const same = barsOnLine(scheduler, lineId, rec.id).filter(ev =>
        sameOrder(ev.data.raw));
    let merged = null;
    for (const other of same) {
        let prev, next;
        if (other.endDate <= rec.startDate) {
            prev = other;
            next = rec;
        }
        else if (rec.endDate <= other.startDate) {
            prev = rec;
            next = other;
        }
        else continue;
        // flush = next strip starts exactly at the previous strip's end, or
        // at the next working slot after it (20:00 -> next day 08:00)
        const flush =
            Math.abs(next.startDate - prev.endDate) < 60000 ||
            Math.abs(next.startDate - nextStartAfter(prev.endDate)) < 60000;
        if (!flush) continue;

        const rp = prev.data.raw, rn = next.data.raw;
        // "Keep separate from other strips" (strip properties) blocks re-join
        if (rp.keepSeparate || rn.keepSeparate) continue;
        const qty  = rp.qty + rn.qty;
        const prog = Math.round((rp.progress * rp.qty + rn.progress * rn.qty) / Math.max(1, qty));
        const dur  = rp.dur + rn.dur;
        const start = new Date(prev.startDate);
        const end   = endOfWork(start, dur);
        rp.qty      = qty;
        rp.reqMin   = Math.round(qty * rp.smv);
        rp.dur      = dur;
        rp.progress = prog;
        rp.start    = start;
        rp.end      = end;
        if (rp.status === 'draft' && rn.status !== 'draft') rp.status = rn.status;
        prev.set({ endDate : end, duration : elapsedDays(start, end), percentDone : prog });
        noteRemovedDbEvent(next);
        scheduler.eventStore.remove(next);
        merged = { po : rp.po, qty, rec : prev };
        rec = prev;
        raw = rp;
    }
    return merged;
}

// DB-persisted events removed from the board (e.g. a strip merged back into
// its order) must be cancelled server-side on the next save, otherwise they
// resurrect on reload and the quantity doubles.
export const removedDbEventIds = new Set();

function noteRemovedDbEvent(ev) {
    const sid = String(ev?.id ?? '');
    const dbId = ev?.data?.dbId ?? (sid.startsWith('db-') ? Number(sid.slice(3).split('-')[0]) : null);
    if (dbId && !Number.isNaN(Number(dbId)) && sid.startsWith('db-') && !sid.includes('-sp')) {
        removedDbEventIds.add(Number(dbId));
    }
}

// Context captured when the strip right-click menu opens
let menuSplitCtx = null;

// Holding Row bar: the cursor's position along the bar → quantity of the
// first part (at least 1 pc on each side)
function holdCursorQty(rec, raw, date) {
    const s0 = new Date(rec.startDate).getTime(), e0 = new Date(rec.endDate).getTime();
    const t  = date instanceof Date ? date.getTime() : new Date(date).getTime();
    const frac = e0 > s0 ? Math.min(0.95, Math.max(0.05, (t - s0) / (e0 - s0))) : 0.5;
    const qty = Number(raw.qty) || 0;
    return Math.max(1, Math.min(qty - 1, Math.round(qty * frac)));
}

// ---------------------------------------------------------------------------
// Drop of an unplanned order onto the board (documents 3.2 + 11)
// Returns { ok, errors, warnings }
// ---------------------------------------------------------------------------
export function planOrderDrop(scheduler, order, resourceRecord, date) {
    const errors = [], warnings = [];
    if (!resourceRecord || !date) {
        return { ok : false, errors : ['Drop the order on a sewing line or the Holding Row'], warnings };
    }
    if (resourceRecord.data?.subtotalRow || resourceRecord.id === 'subtot') {
        return { ok : false, errors : ['Cannot place orders on the Subtotal row'], warnings };
    }

    const parkHold = isHoldingRes(resourceRecord);
    const line = LINE_BY_ID[resourceRecord.id];
    if (!parkHold && !line) {
        errors.push('Only sewing lines or the Holding Row can receive sewing orders');
        return { ok : false, errors, warnings };
    }
    if (!parkHold && order.suitable?.length && !order.suitable.includes(resourceRecord.id)) {
        warnings.push(`${resourceRecord.name} is not the usual line for ${order.po} — placed anyway`);
    }
    const hint = line || LINE_BY_ID[order.suitable?.[0]] || LINES[0];
    const manpower = Number(resourceRecord.data?.manpower ?? hint?.manpower) || 50;
    const lineEff  = Number(resourceRecord.data?.eff ?? hint?.eff) || 50;
    const profileEff = buyerDefaultEff(order.buyer) ?? tooltipEfficiency(resourceRecord.id, order.productType, lineEff);
    const dropWorkMin = Number(resourceRecord.data?.hours) > 0
        ? Number(resourceRecord.data.hours) * 60 : WORK_MIN_PER_DAY;
    const reqMin = Math.round(order.qty * order.smv);
    const dropped = startOfWorkDay(DateHelper.clearTime(date));
    let dur = parkHold
        ? Math.max(1, order.dur || formulaWorkingDays(order.qty, order.smv, manpower, profileEff || lineEff, dropWorkMin))
        : formulaWorkingDays(order.qty, order.smv, manpower, profileEff || lineEff, dropWorkMin);
    // Product changeover at this drop point? The NEW bar takes its ramp
    // duration up front — no other bar is ever resized by the curve
    if (!parkHold) {
        deriveLcForPlacement(scheduler, order, line.id, dropped);
        if (order.lc?.applied) {
            const r = learningDuration({
                qty : order.qty, smv : order.smv, manpower,
                baseEffPct : profileEff || lineEff, dailyMinutes : dropWorkMin,
                dayPcts : order.lc.pct, dayOffset : order.lc.dayOffset
            });
            dur = r.dur;
            order.lc.learnFrac = r.workMin > 0 ? Math.min(1, r.learnMin / r.workMin) : 0;
            order.lc.dayPlan   = r.dayPlan;
        }
    }
    let startFinal, end, snapped, blockedBy;
    if (parkHold) {
        startFinal = dropped;
        end = endOfWork(dropped, dur);
        snapped = false;
        blockedBy = null;
    }
    else {
        ({ start : startFinal, end, snapped, blockedBy } =
            computeInsertStart(scheduler, line.id, dropped, dur, null));
    }
    if (snapped) {
        warnings.push(`${fmtDate(dropped)} has no working hours — ${order.po} starts ${fmtDate(startFinal)} at day start`);
    }
    if (blockedBy) {
        warnings.push(`${blockedBy} occupies that point — ${order.po} attached right after it`);
    }
    if (order.matReady && startFinal < order.matReady) {
        errors.push(`Material for ${order.po} is not ready before ${fmtDate(order.matReady)}`);
    }
    if (errors.length) return { ok : false, errors, warnings };

    const raw = {
        ...order, reqMin, dur, start : startFinal, end,
        orderQty : order.orderQty ?? order.qty,
        progress : 0, status : parkHold ? 'unplanned' : 'draft'
    };

    const targetId = parkHold ? firstHoldId(scheduler) : line.id;
    scheduler.eventStore.add({
        id : `ev-${order.id}`,
        startDate  : startFinal,
        endDate    : end,
        duration   : elapsedDays(startFinal, end),
        durationUnit : 'day',
        manuallyScheduled : true,
        name : `${order.buyer} | ${order.po}`,
        percentDone : 0,
        raw
    });

    const placedRec = scheduler.eventStore.getById(`ev-${order.id}`);
    if (placedRec) assignEventLine(scheduler, placedRec, targetId);
    if (!parkHold) {
        const pushedCnt = placedRec ? pushFollowers(scheduler, line.id, placedRec) : 0;
        if (pushedCnt) {
            warnings.push(`${pushedCnt} following order(s) shifted later to make room`);
        }
        const mergedInfo = placedRec ? tryMergeAdjacent(scheduler, placedRec, line.id) : null;
        if (mergedInfo) {
            warnings.push(`${mergedInfo.po}: adjacent strips joined into one (${fmtQty(mergedInfo.qty)} pcs)`);
        }
        // Refresh ramp badges/tooltips for the line (annotation only)
        applyLearningCurves(scheduler, { lineIds : [line.id] });
    }

    const util = recalcCapacity(scheduler);
    raw.risk = calcRisk({
        start    : startFinal,
        end,
        ship     : order.ship,
        matReady : order.matReady,
        lineUtil : parkHold ? 0 : (util[line.id] ?? 0),
        status   : raw.status
    });

    if (!parkHold && util[line.id] > 100) {
        warnings.push(`${line.name} capacity now at ${util[line.id]}% — overloaded`);
    }
    const shipGap = Math.round((order.ship - end) / 86400000);
    if (!parkHold && shipGap <= 2) {
        warnings.push(`Forecast completion is only ${Math.max(0, shipGap)} day(s) before shipment`);
    }
    return { ok : true, errors, warnings };
}

// Bar tooltip tabs (Info / Purchase Orders / Learning Curve / SOP / Raw
// Material): one delegated click handler for every tooltip instance
let tip4TabsInstalled = false;
function installTip4Tabs() {
    if (tip4TabsInstalled) return;
    tip4TabsInstalled = true;
    document.addEventListener('click', ev => {
        const btn = ev.target?.closest?.('.mb-tip4 .tip4-tab');
        if (!btn) return;
        ev.preventDefault();
        ev.stopPropagation();
        const root = btn.closest('.mb-tip4');
        const key  = btn.dataset.tab;
        root.querySelectorAll('.tip4-tab').forEach(b => b.classList.toggle('tip4-tab-on', b === btn));
        root.querySelectorAll('.tip4-panel').forEach(p => p.classList.toggle('tip4-panel-on', p.dataset.panel === key));
    }, true);
}

// ---------------------------------------------------------------------------
// Scheduler configuration (document 9)
// ---------------------------------------------------------------------------
export const schedulerProConfig = {
    startDate   : VIEW_START,
    endDate     : VIEW_END,
    visibleDate : new Date(),

    rowHeight    : 48,
    headerHeight : 46,
    barMargin   : 0,
    eventLayout : 'none',
    eventStyle  : null,
    eventColor  : null,

    // One style at a time per line: overlaps are resolved deterministically
    // after every gesture (insert at the pointed spot, push followers later),
    // so gestures themselves are not blocked.

    readOnly            : false,
    useInitialAnimation : false,
    // bars never slide into place (FastReact): no animated refresh
    transitionDuration  : 0,
    zoomOnMouseWheel    : false,
    zoomOnTimeAxisDoubleClick : false,
    createEventOnDblClick     : false,
    // Double-clicking a bar must NEVER open Bryntum's 'Task information'
    // editor — orders are edited through our own dialogs only
    taskEditFeature           : false,
    eventEditFeature          : false,

    // Weeks run Saturday→Friday (factory week; Friday = off day)
    weekStartDay : 6,

    // Responsive two-tier date header (native Bryntum headers + renderers —
    // no DOM overrides). Top: one week marker per week (its last day, like
    // FastReact). Bottom: per-day cell whose format follows the CURRENT
    // column width, so no zoom level ever overlaps text:
    //   ≥112px  Monday / 18-Sep-2026 (two lines)
    //   ≥72px   Mon 18
    //   ≥54px   Mo 18
    //   <54px   Mo
//   <22px   M
    // Renderers re-run on every tickSize change (the h-zoom buttons), which
    // makes the header adapt automatically. Only the header DISPLAY changes:
    // ticks, bar positions, durations and calculations stay untouched.
    viewPreset : {
        base              : 'dayAndWeek',
        tickWidth         : 72,
        displayDateFormat : 'DD/MM/YY',
        headers           : [
            {
                unit     : 'week',
                renderer : (start, end) => {
                    const last = new Date(end.getTime() - 864e5); // week's last visible day
                    return `<span class="mb-hdr-week">${DateHelper.format(last, 'DD/MM/YY')}</span>`;
                }
            },
            {
                unit     : 'day',
                renderer : start => {
                    const w    = uiHooks.instance?.tickSize || 72;
                    const dow2 = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][start.getDay()];
                    if (w < 22)  return dow2[0];
                    if (w < 54)  return dow2;
                    const dd = DateHelper.format(start, 'DD');
                    if (w < 72)  return `${dow2} ${dd}`;
                    if (w < 112) return `${DateHelper.format(start, 'ddd')} ${dd}`;
                    return `<div class="mb-hdr-day2"><div>${DateHelper.format(start, 'dddd')}</div><div>${DateHelper.format(start, 'DD/MM/YY')}</div></div>`;
                }
            }
        ]
    },

    // Show only the working window of each day on the axis:
    // calendar start time -> work hours + overtime (08:00 -> 20:00)
    workingTime : { fromHour : 8, toHour : 20 },

    // Custom FastReact scrollbar is injected between locked lines and timeline
    scrollButtons : false,

    subGridConfigs : {
        locked : {
            width    : 248,
            minWidth : 200,
            maxWidth : 420
        },
        normal : {
            minWidth : 240
        }
    },

    columns : [
        {
            text       : 'Line',
            field      : 'name',
            width      : 248,
            minWidth   : 200,
            htmlEncode : false,
            cellCls    : 'mb-linecell',
            headerRenderer  : () =>
                '<div class="fr-clock" id="mb-hover-clock">Fri 28/08/26 8:00:00 AM<br>0.0 x 0:00 x 0 = 0.000</div>',
            renderer : ({ record : r }) => {
                const enc  = StringHelper.encodeHtml;
                const d    = r.data || r;
                const code = floorLabelOf(d.unit, d.floor);
                const ico = '<span class="fr-line-ico"></span>';
                const nums = (red, blue, black) =>
                    `<div class="fr-line-nums">
                        <div><span class="fr-n-red">${red}</span> <span class="fr-n-blue">${blue}</span></div>
                        <div class="fr-n-black">${black}</div>
                    </div>`;
                if (d.holdingRow || d.subtotalRow) {
                    const s = uiHooks.instance;
                    // a floor's Holding Row sums that floor's lines only
                    const lines = (s
                        ? s.resourceStore.records.filter(x => x.data?.lineRow)
                        : LINES).filter(x => !d.holdFloor || (x.data?.floor ?? x.floor) === d.holdFloor);
                    let mp = lines.reduce((a, x) => a + Number(x.manpower ?? x.data?.manpower ?? 0), 0);
                    const mc = lines.reduce((a, x) => a + Number(x.machines ?? x.data?.machines ?? 0), 0);
                    // Holding Row with its own capacity (Setup → Line eff & hours):
                    // manpower / efficiency / capacity minutes instead of the line sums
                    let blue = 0, black = mc;
                    if (d.holdingRow && d.capSet) {
                        mp    = Number(d.manpower) || 0;
                        blue  = `${Number(d.eff) || 0}%`;
                        black = fmtQty(Number(d.availMin) || 0);
                    }
                    const id = d.holdingRow ? String(50000 + mc) : String(mc);
                    return `<div class="fr-line">
                        <span class="fr-line-chip fr-line-chip-red">${enc(id)}</span>
                        <div class="fr-line-mid">
                            <div class="fr-line-name">${enc(d.name)}</div>
                            <div class="fr-line-sub">${enc(code)}</div>
                        </div>
                        ${nums(mp, blue, black)}
                    </div>`;
                }
                const n = String(d.id || '').replace(/\D/g, '') || '0';
                return `<div class="fr-line">
                    <span class="fr-line-chip fr-line-chip-red">${enc(n)}</span>
                    <div class="fr-line-mid">
                        <div class="fr-line-name">${d.lineRow ? ico : ''}${enc(d.name)}</div>
                        <div class="fr-line-sub">${enc(code)}</div>
                    </div>
                    ${nums(d.manpower ?? 0, 0, d.machines ?? 0)}
                </div>`;
            }
        }
    ],

    // Features (document 9)
    dependenciesFeature       : { allowCreate : false },
    resourceTimeRangesFeature : true,
    timeRangesFeature         : { showCurrentTimeLine : true, showHeaderElements : false },
    nonWorkingTimeFeature     : true,
    percentBarFeature         : true,
    scheduleTooltipFeature    : false,
    eventDragCreateFeature    : false,
    // Drag-to-pan: press-and-drag on EMPTY schedule area moves the board
    // horizontally & vertically (mouse users get what touchpad two-finger
    // scroll already does). Presses on bars are excluded via onBeforePan.
    panFeature                : true,

    // A bar leaves the board only through the app's own flows (hold, merge,
    // mark complete, confirm replacement) — never by a stray Delete/Backspace
    // on a selected bar
    enableDeleteKey : false,

    // FastReact-style strip context menu (right-click on a bar)
    eventMenuFeature : {
        items : {
            editEvent     : false,
            deleteEvent   : false,
            unassignEvent : false,
            copyEvent     : false,
            cutEvent      : false,
            splitEvent    : false,
            splitAtCursor : {
                text   : 'Split strip',
                icon   : 'b-fa b-fa-scissors',
                weight : 100,
                onItem({ eventRecord }) {
                    const rec = eventRecord || menuSplitCtx?.rec;
                    const raw = rec?.data?.raw || rec?.raw || menuSplitCtx?.raw;
                    if (!rec || !raw) return;
                    const date = menuSplitCtx?.rec === rec ? menuSplitCtx.date : rec.startDate;
                    uiHooks.onBeforeEdit?.(`split ${raw.po || rec.name}`);
                    // Holding Row: split by the cursor's share of the bar's qty
                    const res = isHoldId(lineIdOf(uiHooks.instance, rec))
                        ? splitBar(uiHooks.instance, rec, { qty2 : raw.qty - holdCursorQty(rec, raw, date) })
                        : splitBar(uiHooks.instance, rec, { dur1 : Math.max(1, Math.min(raw.dur - 1, workDaysBetween(rec.startDate, date))) });
                    uiHooks.onToast?.(
                        res.ok
                            ? `${raw.po} split into ${fmtQty(res.q1)} + ${fmtQty(res.q2)} pcs — click where the new bar should go`
                            : res.msg,
                        res.ok ? 'ok' : 'error');
                    if (res.ok && res.rec2) uiHooks.onCarryNew?.(res.rec2);
                }
            },
            stripProps : {
                text   : 'Properties',
                icon   : 'b-fa b-fa-compass',
                weight : 200,
                onItem({ eventRecord }) {
                    const rec = eventRecord || menuSplitCtx?.rec;
                    if (rec) uiHooks.onOpenProps?.(rec);
                }
            },
            recalcDuration : {
                text   : 'Recalculate duration (SOP)',
                icon   : 'b-fa b-fa-rotate',
                weight : 205,
                onItem({ eventRecord }) {
                    const rec = eventRecord || menuSplitCtx?.rec;
                    if (rec) uiHooks.onRecalcDuration?.(rec);
                }
            },
            planSchedule : {
                text   : 'Planned schedule',
                icon   : 'b-fa b-fa-table-list',
                weight : 210,
                onItem({ eventRecord }) {
                    const rec = eventRecord || menuSplitCtx?.rec;
                    if (rec) uiHooks.onOpenSchedule?.(rec);
                }
            },
            buildUpCurve : {
                text   : 'Build up curve',
                icon   : 'b-fa b-fa-chart-line',
                weight : 220,
                onItem({ eventRecord }) {
                    const rec = eventRecord || menuSplitCtx?.rec;
                    if (rec) uiHooks.onOpenCurve?.(rec);
                }
            },
            changeHours : {
                text   : 'Change working hours',
                icon   : 'b-fa b-fa-clock',
                weight : 230,
                onItem({ eventRecord }) {
                    const rec = eventRecord || menuSplitCtx?.rec;
                    uiHooks.onOpenWorkHours?.(rec);
                }
            },
            splitPieces : {
                text   : 'Split into equal pieces',
                icon   : 'b-fa b-fa-scissors',
                weight : 115,
                menu   : [2, 3, 4, 5, 6].map(n => ({
                    text : `${n} pieces`,
                    onItem() {
                        const rec = menuSplitCtx?.rec;
                        if (rec) uiHooks.onSplitPieces?.(rec, n);
                    }
                }))
            },
            mergeSel : {
                text   : 'Merge selected bars into one',
                icon   : 'b-fa b-fa-object-group',
                weight : 118,
                onItem({ eventRecord }) {
                    const rec = eventRecord || menuSplitCtx?.rec;
                    if (rec) uiHooks.onMergeSelected?.(rec);
                }
            },
            equalOrder : {
                text   : 'Equal order (balance splits)',
                icon   : 'b-fa b-fa-scale-balanced',
                weight : 234,
                onItem({ eventRecord }) {
                    const rec = eventRecord || menuSplitCtx?.rec;
                    if (rec) uiHooks.onEqualOrder?.(rec);
                }
            },
            prodUpdate : {
                text   : 'Production update',
                icon   : 'b-fa b-fa-industry',
                weight : 235,
                onItem({ eventRecord }) {
                    const rec = eventRecord || menuSplitCtx?.rec;
                    if (rec) uiHooks.onOpenStripProd?.(rec);
                }
            },
            stripNotes : {
                text   : 'Strip notes',
                icon   : 'b-fa b-fa-note-sticky',
                weight : 236,
                onItem({ eventRecord }) {
                    const rec = eventRecord || menuSplitCtx?.rec;
                    if (rec) uiHooks.onOpenStripNotes?.(rec);
                }
            },
            multiStrip : {
                text   : 'Multiple strip handling',
                icon   : 'b-fa b-fa-layer-group',
                weight : 240,
                onItem({ eventRecord }) {
                    const rec = eventRecord || menuSplitCtx?.rec;
                    if (rec) uiHooks.onOpenMultiStrip?.(rec);
                }
            },
            splitQtyItem : {
                text   : 'Specify quantity to split',
                icon   : 'b-fa b-fa-scissors',
                weight : 110,
                onItem({ eventRecord }) {
                    const rec = eventRecord || menuSplitCtx?.rec;
                    const raw = rec?.data?.raw || rec?.raw || menuSplitCtx?.raw;
                    if (!rec || !raw) return;
                    const v = window.prompt(
                        `${raw.po}: quantity for the NEW bar (1 – ${fmtQty(raw.qty - 1)} pcs)`,
                        String(Math.round(raw.qty / 2)));
                    if (v === null) return;
                    uiHooks.onBeforeEdit?.(`split ${raw.po || rec.name}`);
                    const res = splitBar(uiHooks.instance, rec, { qty2 : Number(String(v).replace(/[^0-9]/g, '')) });
                    uiHooks.onToast?.(
                        res.ok
                            ? `${raw.po} split: ${fmtQty(res.q1)} pcs kept, new bar ${fmtQty(res.q2)} pcs — click where it should go`
                            : res.msg,
                        res.ok ? 'ok' : 'error');
                    if (res.ok && res.rec2) uiHooks.onCarryNew?.(res.rec2);
                }
            }
        },
        processItems(context) {
            // Ctrl / ⌘ + click is multi-select (on a Mac that click also
            // raises contextmenu): no menu while the modifier is held
            const de = context.domEvent || context.event;
            if (uiHooks.modifierHeld || de?.ctrlKey || de?.metaKey) return false;
            const items = context.items || context;
            // plan locked by another user: no editing entry at all — only the
            // look-only ones (Properties / Planned schedule / Strip notes)
            if (uiHooks.boardFrozen) {
                for (const k of Object.keys(items)) if (!['stripProps', 'planSchedule', 'stripNotes'].includes(k)) items[k] = false;
                return;
            }
            const rec = context.eventRecord;
            const raw = rec?.data?.raw || rec?.raw;
            const s   = uiHooks.instance;
            if (!raw || raw.stage) {
                items.splitAtCursor = false;
                items.splitQtyItem  = false;
                items.stripProps    = false;
                items.planSchedule  = false;
                items.buildUpCurve  = false;
                items.prodUpdate    = false;
                items.equalOrder    = false;
                items.splitPieces   = false;
                items.mergeSel      = false;
                items.multiStrip    = false;
                items.stripNotes    = false;
                return;
            }
            if (raw.status === 'completed' && items.buildUpCurve) {
                items.buildUpCurve = false;
            }
            if (raw.status === 'completed') { items.splitPieces = false; items.mergeSel = false; }
            // the merge item only when two or more bars are Ctrl+click selected
            if ((uiHooks.multiSelCount || 0) < 2) items.mergeSel = false;
            let date = null;
            try {
                date = s?.getDateFromDomEvent(context.domEvent || context.event);
            }
            catch { /* outside axis */ }
            if (!date) date = new Date(rec.startDate);
            menuSplitCtx = { rec, raw, date };

            if (raw.status === 'completed') {
                items.splitAtCursor = false;
                items.splitQtyItem  = false;
                return;
            }
            const onHold = isHoldId(lineIdOf(s, rec));
            if (onHold && items.splitAtCursor) {
                // Holding Row: no capacity, any span — the cursor's position
                // along the bar is the quantity split
                const q1 = holdCursorQty(rec, raw, date);
                items.splitAtCursor.text = `Split strip at ${fmtQty(q1)} + ${fmtQty(raw.qty - q1)}`;
            }
            else if (raw.dur < 2) {
                items.splitAtCursor = false;
            }
            else if (items.splitAtCursor) {
                const d1 = Math.max(1, Math.min(raw.dur - 1, workDaysBetween(rec.startDate, date)));
                const q1 = Math.round(raw.qty * d1 / raw.dur);
                const q2 = raw.qty - q1;
                items.splitAtCursor.text = `Split strip at ${fmtQty(q1)} + ${fmtQty(q2)}`;
            }
        }
    },

    eventTooltipFeature : {
        cls                  : 'mb-fr-tip',
        // The tooltip stays up while hovered (allowOver) — tab clicks inside
        // it switch panels without re-rendering the template
        // No tooltip while Ctrl / ⌘ is held (multi-selecting bars)
        onBeforeShow() {
            if (uiHooks.modifierHeld) return false;
            installTip4Tabs();
        },
        // the pointer has to rest on a bar for 1.5 s before the tooltip opens
        hoverDelay           : 1500,
        hideOnDelegateChange : true,
        hideOnScroll         : true,
        allowOver            : true,
        // Open BELOW the hovered bar so the Holding-Row day-qty chips at the
        // top stay visible while the tooltip is up
        align                : 't-b',
        // Content is built synchronously whenever the ERP detail is already
        // cached — prefetched while the pointer rests on the bar for the hover
        // delay — so the tooltip opens with its data, no "Loading…" flash. A
        // cold cache (first hover of a PO this session) fetches, then renders.
        template({ eventRecord : e }) {
            const r = e.data.raw;
            if (!r) return StringHelper.encodeHtml(e.name);
            const warm = tipDataFromCache(r);
            if (warm) return renderTip4(e, r, warm);
            // Cold cache: the tooltip opens NOW with the bar's own data (never
            // a Promise → Bryntum never shows "Loading…"); the ERP parts are
            // filled in place the moment they arrive
            fetchTipData(r).then(d => refreshTip4(e, r, d)).catch(() => {});
            return renderTip4(e, r, { detail : null, poSummary : [], pending : true });
        },
    },

    // Pick-and-place uses click, not native drag — drag caused blank flashes
    eventDragFeature : {
        disabled                : true,
        constrainDragToResource : false,
        showTooltip             : false,
        validatorFn(context) {
            const recs  = context.eventRecords || context.draggedRecords || [];
            const rec   = recs[0];
            const raw   = rec?.data?.raw;
            const newRes = context.newResource;
            const start  = context.startDate;
            if (!raw) return true;
            if (raw.stage) {
                if (newRes && !STAGE_RESOURCES.some(s => s.id === newRes.id)) {
                    return { valid : false, message : 'Stage tasks stay on stage resources' };
                }
                return true;
            }
            if (newRes?.data?.subtotalRow || newRes?.id === 'subtot') {
                return { valid : false, message : 'Cannot place orders on the Subtotal row' };
            }
            // FastReact: park on Holding Row, or plan on any sewing line
            if (newRes && !isHoldingRes(newRes) && !isSewingRes(newRes)) {
                return { valid : false, message : 'Place the bar on a sewing line or the Holding Row' };
            }
            if (!isHoldingRes(newRes) && raw.matReady && start && DateHelper.clearTime(start) < raw.matReady) {
                return { valid : false, message : `Material not ready before ${fmtDate(raw.matReady)}` };
            }
            return true;
        }
    },

    // Grand totals footer: per day, all lines - Day Plan qty, actual
    // Production (day_production_update_plan) and the +/- difference
    // Grand totals footer removed (the strip legend below the board is the
    // live order bar now) — grandTotalMaps() still serves the reports
    summaryFeature : false,
    summaryFeatureUnused : {
        renderer({ startDate }) {
            const { plan, made } = grandTotalMaps();
            const key = ymdKeyOf(startDate);
            const p = plan[key] || 0;
            const a = made[key] || 0;
            if (!p && !a) {
                return '<div class="fr-gt"><span class="fr-gt-plan">-</span><span class="fr-gt-act">-</span><span>-</span></div>';
            }
            const diff = a - p;
            const dCls = diff < 0 ? 'fr-gt-neg' : 'fr-gt-pos';
            return `<div class="fr-gt">
                <span class="fr-gt-plan">${fmtQty(p)}</span>
                <span class="fr-gt-act">${fmtQty(a)}</span>
                <span class="${dCls}">${diff > 0 ? '+' : ''}${fmtQty(diff)}</span>
            </div>`;
        }
    },

    // Order bar rendering (document 10) - colour plus text and icon
    eventRenderer({ eventRecord : e, renderData }) {
        const r = e.data.raw;
        if (!r) return StringHelper.encodeHtml(e.name || '');
        flushWidth(this, e, renderData);   // consecutive bars touch (FastReact)

        const pastDelivery = r.status !== 'completed'
            && isLateVsDelivery(e.endDate || r.end, r.ship);
        const colorKey =
            r.status === 'completed' ? 'grey'
          : pastDelivery ? 'late'
          : r.latePlan ? 'yellow'
          : r.risk.level === 'draft' || r.status === 'draft' ? 'blue'
          : { low : 'green', moderate : 'yellow', high : 'orange', critical : 'red' }[r.risk.level] || 'green';

        renderData.cls.add(`mb-risk-${colorKey}`);
        if (orderTypeOf(r.po, r.orderType) === 'confirm') renderData.cls.add('mb-confirm-order');
        if (r.confirmMismatch) renderData.cls.add('mb-qty-mismatch');
        if (stripNotesFor(r.po).length) renderData.cls.add('mb-has-note');

        const q = (searchState.query || '').trim().toLowerCase();
        if (searchState.ids) {
            renderData.cls.add(searchState.ids.has(String(e.id)) ? 'mb-search-hit' : 'mb-search-dim');
        }
        else if (q) {
            const hay = [
                r.buyer, r.po, r.style, r.status, r.productType, buyerShortOf(r.buyer), itemLabelOf(r),
                orderTypeOf(r.po, r.orderType), barDisplayLine(r), barStyleLine(r), e.name
            ].join(' ').toLowerCase();
            renderData.cls.add(hay.includes(q) ? 'mb-search-hit' : 'mb-search-dim');
        }

        // The fill is the chosen colour mode's colour and NOTHING else — one
        // colour means one thing (every Nautica bar the same blue, every
        // 5 Pocket the same red). Lateness stays visible as the red marker
        // along the bottom edge (mb-late), a qty mismatch as its outline.
        if (pastDelivery) renderData.cls.add('mb-late');
        const paint = bg => { renderData.style = `background-color:${bg};border-color:#222;color:${textOnColor(bg)}`; };
        if (colorState.mode === 'buyer')        paint(buyerColorOf(r.buyer));
        else if (colorState.mode === 'product') paint(productTypeColor(itemLabelOf(r)));
        else if (colorState.mode === 'style')   paint(styleColorOf(r.style || mbmOrderNo(r.po, r.mbmOrder)));
        else if (colorState.mode === 'ptype') {
            const c = PLAN_STATE_COLORS[planStateOf(r, e.startDate, e.endDate)];
            renderData.style = `background-color:${c.bg};border-color:#222;color:${c.fg}`;
        }
        else if (colorState.mode === 'latesplit') {
            // Late strip qty: the part planned up to the delivery date stays
            // grey, the part after it is blue (overlay below) — one bar, two parts
            renderData.style = 'background-color:#9e9e9e;border-color:#222;color:#fff';
        }
        else {
            // Product delivery: the bar wears its delivery month's colour
            const c = deliveryMonthColor(r.ship);
            if (c) renderData.style = `background-color:${c.bg};border-color:#222;color:${c.fg}`;
        }

        if (r.stage) {
            return `<div class="mb-bar"><div class="mb-bar-l1">${StringHelper.encodeHtml(e.name)}</div><div class="mb-bar-l2">${StringHelper.encodeHtml(r.stage)}</div></div>`;
        }
        // Bar height is handled purely in CSS (wrap height = 50% of the row
        // via --mb-row-h) so it stays identical in normal / selected /
        // hovered / dragging states — a renderData.height override here was
        // lost on selection repaints and made clicked bars jump to full row.
        // Single line, vertically centred — no confirm/projection label
        // (the bar colour/border already distinguishes confirm orders).
        // The colour mode decides the text too (barModeLine): position,
        // duration and colour coding stay exactly as-is.
        const line = (raw, c) => barModeLine(raw, colorState.mode, c);
        const full = line(r);
        const w = renderData.width || 0;
        const compact = w > 0 && w < full.length * 6.8 + 12;
        const text = compact ? line(r, true) : full;
        // Learning-curve ramp: hatched overlay on the bar's head — a shade on
        // top of (never replacing) the status/risk colour
        const lcFrac = r.lc?.applied ? Math.min(1, Number(r.lc.learnFrac) || 0) : 0;
        const lcHtml = lcFrac > 0.005
            ? `<div class="mb-lc-seg" style="width:${(lcFrac * 100).toFixed(1)}%"></div><span class="mb-lc-badge" title="Learning curve — ${StringHelper.encodeHtml(r.lc.profileName || '')}">LC</span>`
            : '';
        // Multiple strip handling: live-linked bars carry a small link badge
        const lk = r.lcLink;
        const linkHtml = lk
            ? `<span class="mb-linked-badge" title="${StringHelper.encodeHtml(
                `Linked Build-Up Curve\nReference: ${lk.refOrder || lk.refId}\nCurve: ${lk.curve || '—'} (v${lk.version || 1}, ${lk.mode || 'copy'})\nLast Updated: ${String(lk.lastSync || lk.linkedAt || '').slice(0, 10)}`)}">🔗</span>`
            : '';
        // Product mode: the type sits in the MIDDLE of the bar as a pill that
        // stays readable over the learning-curve hatch and its LC badge
        let inner = StringHelper.encodeHtml(text);
        if (colorState.mode === 'product') {
            inner = `<span class="mb-ptype">${StringHelper.encodeHtml(full)}</span>`;
        }
        // Late strip qty mode: blue overlay from the delivery date to the bar's
        // end, with the quantity that falls after the date
        let lateHtml = '';
        if (colorState.mode === 'latesplit' && r.ship && r.status !== 'completed' && renderData.width > 0) {
            // Desired sewing finish = delivery date minus the finishing lead:
            // 6 days with wash, 4 days without (wash from the ERP style
            // detail when the tooltip cache has it, else the bar's own flag)
            const det  = tipDataFromCache(r)?.detail?.style;
            const wash = det ? !!(det.wash_type || det.wash_name) : !!(r.wash || r.washType);
            const lead = wash ? 6 : 4;
            const shipEnd = new Date(r.ship); shipEnd.setDate(shipEnd.getDate() - lead); shipEnd.setHours(23, 59, 59, 999);
            if (e.endDate > shipEnd) {
                let x = renderData.left;
                try { x = this.getCoordinateFromDate(shipEnd, true); } catch { /* keep left */ }
                const frac = Math.max(0, Math.min(1, (x - renderData.left) / renderData.width));
                // the day-by-day model once per bar position (not on every repaint)
                const lid = lineIdOf(this, e);
                const key = `${e.id}|${+e.startDate}|${+e.endDate}|${+shipEnd}|${r.qty}|${r.made || 0}|${lid}`;
                let lateQty = lateQtyCache.get(key);
                if (lateQty === undefined) {
                    lateQty = 0;
                    try {
                        const sim = simulateStrip(this, r, lid, new Date(e.startDate), new Date(e.endDate));
                        for (const d of sim?.days || []) if (d.date > shipEnd) lateQty += Number(d.q) || 0;
                    }
                    catch { /* no simulation — the segment still shows */ }
                    if (lateQtyCache.size > 4000) lateQtyCache.clear();
                    lateQtyCache.set(key, lateQty);
                }
                if (e.startDate > shipEnd && !lateQty) lateQty = Number(r.qty) || 0;
                const wide = renderData.width * (1 - frac) > 46;
                lateHtml = `<div class="mb-late-part" style="left:${(frac * 100).toFixed(2)}%" title="after the desired sewing finish ${StringHelper.encodeHtml(fmtDate(shipEnd))} (delivery ${StringHelper.encodeHtml(fmtDate(r.ship))} − ${lead} days, ${wash ? 'wash' : 'non-wash'}): ${StringHelper.encodeHtml(fmtQty(lateQty))} pcs">${wide && lateQty ? `<span class="mb-late-qty">late ${StringHelper.encodeHtml(fmtQty(lateQty))}</span>` : ''}</div>`;
            }
        }
        return `
            ${lateHtml}${lcHtml}${linkHtml}<div class="mb-bar mb-bar-center${colorState.mode === 'product' ? ' mb-bar-product' : ''}">
                <div class="mb-bar-l1">${inner}</div>
            </div>`;
    },

    // Press-and-hold: the bar attaches to the pointer on mouse DOWN (the
    // board's own pick & place carry); release after a drag drops it there,
    // a plain click keeps it on the pointer until the next click
    onEventMouseDown(ev) {
        uiHooks.onBarMouseDown?.(ev);
    },

    onEventClick(ev) {
        const dom = ev?.domEvent || ev?.event;
        if (dom?.button === 2) return;
        if (dom?.target?.closest?.('.b-menu, .b-popup')) return;
        setBarTooltipEnabled(uiHooks.instance, false);
        uiHooks.onOrderSelect?.(ev.eventRecord);
        uiHooks.onBarClick?.(ev);
        setTimeout(() => setBarTooltipEnabled(uiHooks.instance, true), 300);
    },

    // Hovering a bar shows its day-wise plan quantities on the Holding Row
    // (same trigger feel as the tooltip)
    onEventMouseEnter({ eventRecord }) {
        // warm the tooltip's ERP data during the hover delay — it then opens
        // with its content instead of a "Loading…" placeholder
        // (not while a bar is carried — the pointer sweeps over many bars
        // then, and the tooltip is off anyway)
        const raw = eventRecord?.data?.raw;
        if (raw && !raw.stage && !uiHooks.boardUserActive && !tipOffline() && !tipDataFromCache(raw)) fetchTipData(raw).catch(() => {});
        uiHooks.onBarHover?.(eventRecord);
    },

    onEventMouseLeave() {
        uiHooks.onBarHoverOut?.();
    },

    onEventMenuItem({ item, eventRecord }) {
        const rec = eventRecord || menuSplitCtx?.rec;
        if (!rec) return;
        const key = item?.ref || item?.id || item;
        if (key === 'stripProps') uiHooks.onOpenProps?.(rec);
        else if (key === 'planSchedule') uiHooks.onOpenSchedule?.(rec);
    },

    onScheduleClick(ev) {
        setBarTooltipEnabled(uiHooks.instance, false);
        uiHooks.onScheduleClick?.(ev);
        setTimeout(() => setBarTooltipEnabled(uiHooks.instance, true), 300);
    },

    // Board pan never starts from a bar: with eventDrag disabled (pick &
    // place moves bars by click), Bryntum's Pan would otherwise also grab
    // drags that begin ON an event. Bar presses keep their own behavior
    // (click = pick up / select, right-click = menu, resize = handles).
    // NOTE: as a `listeners` entry — the Vue wrapper does not map an
    // onBeforePan prop, so a top-level handler would silently never attach.
    listeners : {
        beforePan({ event }) {
            if (event?.target?.closest?.('.b-sch-event, .b-sch-event-wrap')) return false;
        }
    },

    // After a drag-drop: snap the start off 0-hour days, keep the sequential
    // rule, and recompute the end so off days are never counted (FastReact)
    onEventDragStart() {
        const s = uiHooks.instance;
        setBarTooltipEnabled(s, false);
        uiHooks.boardUserActive = true;
        s?.suspendRefresh?.();
    },

    onEventDrag() {
        uiHooks.instance?.features?.eventTooltip?.hide?.();
    },

    onEventDragReset() {
        const s = uiHooks.instance;
        setBarTooltipEnabled(s, true);
        uiHooks.boardUserActive = false;
        s?.resumeRefresh?.(false);
    },

    onEventDrop({ eventRecords }) {
        const s = uiHooks.instance;
        setBarTooltipEnabled(s, false);
        if (!s) return;
        beginBoardInteraction(s);
        try {
            for (const rec of eventRecords) {
                const raw = rec.data.raw;
                if (!raw || raw.stage) continue;
                const origStart = startOfWorkDay(DateHelper.clearTime(rec.startDate));
                const rid = lineIdOf(s, rec);
                if (isHoldId(rid) || !LINE_BY_ID[rid]) {
                    const targetId = rid;
                    const start = startOfWorkDay(DateHelper.clearTime(rec.startDate));
                    const end   = endOfWork(start, raw.dur || elapsedDays(rec.startDate, rec.endDate) || 1);
                    const a = s.assignmentStore.records.find(x =>
                        (x.eventId ?? x.data?.eventId ?? x.data?.event) === rec.id);
                    if (a) a.set('resourceId', targetId);
                    else s.assignmentStore.add({ eventId : rec.id, resourceId : targetId });
                    rec.data.resourceId = targetId;
                    rec.set({
                        startDate  : start,
                        endDate    : end,
                        duration   : elapsedDays(start, end)
                    });
                    raw.start = start;
                    raw.end   = end;
                    if (isHoldId(rid) && (raw.status === 'planned' || raw.status === 'draft')) {
                        raw.status = 'unplanned';
                    }
                    continue;
                }
                if (raw.status === 'unplanned') raw.status = 'draft';
                // FastReact insertion rule (same as pick & place): the
                // dropped bar keeps the EXACT drop point (work-calendar
                // clamped; only a locked/completed bar blocks); overlapped
                // bars and their followers shift LATER only via pushFollowers
                const { start : sd, end, snapped, blockedBy } =
                    computeInsertStart(s, rid, origStart, raw.dur, rec.id);
                const moved = snapped || !!blockedBy || sd.getTime() !== origStart.getTime();
                rec.set({ startDate : sd, endDate : end, duration : elapsedDays(sd, end) });
                noteManualGap(s, rid, rec, sd);
                const pushedCnt = pushFollowers(s, rid, rec);
                if (pushedCnt) {
                    uiHooks.onToast?.(`${pushedCnt} following order(s) shifted later to make room`, 'warn');
                }
                const mergedInfo = tryMergeAdjacent(s, rec, rid);
                if (mergedInfo) {
                    uiHooks.onToast?.(`${mergedInfo.po}: adjacent strips joined into one (${fmtQty(mergedInfo.qty)} pcs)`, 'ok');
                }
                raw.start = sd;
                raw.end   = end;
                raw.risk = calcRisk({
                    start    : sd,
                    end,
                    ship     : raw.ship,
                    matReady : raw.matReady,
                    lineUtil : 0,
                    status   : raw.status
                });
                if (moved) {
                    uiHooks.onToast?.(`${rec.name}: adjusted to the next working day (starts ${fmtDate(sd)})`, 'warn');
                }
            }
        }
        finally {
            endBoardInteraction(s);
            const util = computeLineUtil(s.eventStore.records);
            for (const rec of eventRecords) {
                const raw = rec.data?.raw;
                if (!raw || raw.stage) continue;
                const rid = lineIdOf(s, rec);
                raw.risk = calcRisk({
                    start    : raw.start,
                    end      : raw.end,
                    ship     : raw.ship,
                    matReady : raw.matReady,
                    lineUtil : util[rid] ?? 0,
                    status   : raw.status
                });
            }
            setBarTooltipEnabled(s, true);
            uiHooks.boardUserActive = false;
            uiHooks.onBoardEdited?.();
        }
    },
    // following bars so the resized bar never overlaps the next one
    onEventResizeEnd({ eventRecord : rec }) {
        const raw = rec.data.raw;
        if (!raw || raw.stage) return;
        raw.dur   = Math.max(1, workDaysBetween(rec.startDate, rec.endDate));
        raw.start = rec.startDate;
        raw.end   = rec.endDate;
        const s = uiHooks.instance;
        if (!s) return;
        beginBoardInteraction(s);
        try {
            const pushedCnt = pushFollowers(s, rec.resourceId ?? rec.data.resourceId, rec);
            if (pushedCnt) {
                uiHooks.onToast?.(`${pushedCnt} following order(s) shifted later to make room`, 'warn');
            }
        }
        finally {
            endBoardInteraction(s);
        }
    },

    onEventSelectionChange({ selection }) {
        if (!selection.length) uiHooks.onSelectionClear?.();
    },

    project : {
        calendar  : 'factory',
        calendars : [{
            id        : 'factory',
            name      : 'Factory calendar',
            intervals : [{
                recurrentStartDate : 'on Fri at 0:00',
                recurrentEndDate   : 'on Sat at 0:00',
                isWorking          : false
            }]
        }],
        resources,
        // The board starts EMPTY, in multi-assignment mode: a row carrying a
        // resourceId (the old demo events) would lock the stores into single-
        // assignment mode, and every board load with assignments would throw
        // ("Data loading into AssignmentStore … cannot be combined …")
        events             : [],
        assignments        : [],
        dependencies       : DEPENDENCIES,
        resourceTimeRanges : buildManpowerRanges(LINES),
        timeRanges         : [
            ...buildOffDayRanges(),
            (() => {
                const t0 = new Date();
                t0.setHours(0, 0, 0, 0);
                const t1 = new Date(t0);
                t1.setDate(t1.getDate() + 1);
                return { id : 'today-col', startDate : t0, endDate : t1, cls : 'mb-today' };
            })()
        ],
        // Bryntum's STM is off: the board keeps its own undo history (App.vue
        // pushUndo / undoBoard) — it sees every custom edit, STM could not
        stm : {
            autoRecord : false,
            disabled   : true
        }
    }
};

// ---------------------------------------------------------------------------
// Tooltip ERP data: session-cached per PO so the tooltip can render at once.
// onEventMouseEnter prefetches during the hover delay; the template only
// awaits when the cache is still cold.
// ---------------------------------------------------------------------------
// the base the page resolved (api.js) — never a build-time URL of its own:
// on the live site that pointed every tooltip request at localhost:4000
const tipApiBase = () => globalThis.__mbmApiBase
    || (/^(localhost|127\.0\.0\.1|\[?::1\]?)$/.test(window.location.hostname)
        ? (import.meta.env.VITE_API_URL_LOCAL || 'http://localhost:4000/api/v1/planning')
        : '/api/v1/planning');
const tipAllPos  = r => (Array.isArray(r.poList) && r.poList.length > 0 ? r.poList : (r.po ? [String(r.po)] : []));
export function tipPoQuery(r) {
    if (orderTypeOf(r.po, r.orderType) !== 'confirm') return null;
    const allPos = tipAllPos(r);
    if (!allPos.length) return null;
    // planning_orders row ids when the bar knows them — a PO number can span
    // several colours; ids give the exact colour rows this bar covers
    const ids = Array.isArray(r.idList) ? r.idList.filter(n => Number(n) > 0) : [];
    return ids.length ? `ids=${encodeURIComponent(ids.join(','))}` : `pos=${encodeURIComponent(allPos.join(','))}`;
}
const ssGet = k => { try { const v = sessionStorage.getItem(k); return v ? JSON.parse(v) : undefined; } catch { return undefined; } };
const ssSet = (k, v) => { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch { /* quota */ } };

// Board open: the bulk answer lands in the same session cache the hover path
// reads — tooltips then open complete, with no request at all
// The ERP detail is keyed by PO + ORDER CODE: one PO number can sit on
// several orders / styles (G-STAR), the order code picks the right one
export const tipKeyOf = r => (r?.po ? `${String(r.po).trim()}|${String(r.mbmOrder || '').trim().toUpperCase()}` : '');
export function warmTipCache(key, detail, qs, rows) {
    if (key && detail !== undefined) ssSet(`tip-${key}`, detail);
    if (qs && Array.isArray(rows)) ssSet(`pos-sum-${qs}`, rows);
}

// { detail, poSummary } when everything the tooltip needs is cached, else null
export function tipDataFromCache(r) {
    const tk = tipKeyOf(r);
    const detail = tk ? ssGet(`tip-${tk}`) : null;
    if (tk && detail === undefined) return null;
    const qs = tipPoQuery(r);
    const poSummary = qs ? ssGet(`pos-sum-${qs}`) : [];
    if (qs && poSummary === undefined) return null;
    return { detail : detail || null, poSummary : Array.isArray(poSummary) ? poSummary : [] };
}

const tipInflight = new Map();
// API / DB unreachable: no tooltip request at all for TIP_OFFLINE_MS — the
// tooltip shows the bar's own data; hovering must never flood a dead link
const TIP_OFFLINE_MS = 60000;
let tipOfflineUntil = 0;
export const tipOffline = () => Date.now() < tipOfflineUntil;
function tipFailed(res) {
    // a 5xx (DB breaker → 503) or a network failure = the link is down
    if (!res || res.status >= 500) tipOfflineUntil = Date.now() + TIP_OFFLINE_MS;
}
export function fetchTipData(r) {
    const tk  = tipKeyOf(r);
    const key = `${tk}|${tipPoQuery(r) || ''}`;
    if (tipInflight.has(key)) return tipInflight.get(key);
    if (tipOffline()) return Promise.resolve({ detail : null, poSummary : [] });
    const p = (async () => {
        const API_BASE = tipApiBase();
        let detail = tk ? ssGet(`tip-${tk}`) : null;
        if (tk && detail === undefined) {
            detail = null;
            let res = null;
            try {
                res = await fetch(`${API_BASE}/order-details?po=${encodeURIComponent(r.po)}&order=${encodeURIComponent(String(r.mbmOrder || ''))}`);
                const json = await res.json();
                if (json.success) { detail = json.data; ssSet(`tip-${tk}`, detail); }
                // a clean "not found" is cached too — no re-ask on every hover
                else if (res.ok && !json.offline) ssSet(`tip-${tk}`, null);
                else tipFailed(res);
            }
            catch { tipFailed(res); }
        }
        const qs = tipPoQuery(r);
        let poSummary = qs ? ssGet(`pos-sum-${qs}`) : [];
        if (qs && poSummary === undefined && !tipOffline()) {
            poSummary = [];
            let resPo = null;
            try {
                resPo = await fetch(`${API_BASE}/pos-summary?${qs}`);
                const jsPo  = await resPo.json();
                if (jsPo.success) { poSummary = jsPo.rows; ssSet(`pos-sum-${qs}`, poSummary); }
                else tipFailed(resPo);
            }
            catch { tipFailed(resPo); }
        }
        return { detail : detail || null, poSummary : Array.isArray(poSummary) ? poSummary : [] };
    })().finally(() => tipInflight.delete(key));
    tipInflight.set(key, p);
    return p;
}

// The bar tooltip (4 tabs). `detail` = ERP order-details, `poSummary` =
// per-PO rows — both from fetchTipData / tipDataFromCache.
// ERP data arrived for a tooltip that opened cold: swap its content in place
// (same bar still shown), keeping the tab the planner is on
function refreshTip4(e, r, data) {
    const tip = uiHooks.instance?.features?.eventTooltip?.tooltip;
    if (!tip?.isVisible) return;
    const root = tip.element?.querySelector?.('.mb-tip4');
    if (!root || root.dataset.tipEv !== String(e.id)) return;
    const tab = root.querySelector('.tip4-tab.tip4-tab-on')?.dataset.tab;
    tip.html = renderTip4(e, r, data);
    if (tab) {
        const root2 = tip.element?.querySelector?.('.mb-tip4');
        root2?.querySelectorAll('.tip4-tab').forEach(b => b.classList.toggle('tip4-tab-on', b.dataset.tab === tab));
        root2?.querySelectorAll('.tip4-panel').forEach(pn => pn.classList.toggle('tip4-panel-on', pn.dataset.panel === tab));
    }
}

function renderTip4(e, r, { detail, poSummary, pending = false }) {
            const enc  = StringHelper.encodeHtml;
            const ymd  = d => {
                if (!d) return '';
                const x = new Date(d);
                if (Number.isNaN(x.getTime())) return '';
                const p = n => String(n).padStart(2, '0');
                return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}`;
            };
            const ymdHm = d => {
                const day = ymd(d);
                if (!day || !d) return day;
                const x = new Date(d); const p = n => String(n).padStart(2,'0');
                return `${day} ${p(x.getHours())}:${p(x.getMinutes())}`;
            };
            const ddMon = d => fmtDateDdMonRr(d ? new Date(d) : null) || ymd(d) || '—';
            const lid   = e.resourceId ?? e.data.resourceId;
            const ptype = tooltipProductType(r.po, lid, r.productType);
            // Round for display — ERP FLOAT columns arrive as long float32
            // artifacts (e.g. 132.83999633789062)
            const smv   = Math.round((Number(r.smv) || randSmv(r.po)) * 100) / 100;
            // The efficiency the bar is actually sized with: plan / product
            // profile efficiency × strip efficiency (same as the formula)
            const baseEffT = Number(r.planEff) > 0 ? Number(r.planEff) : (buyerDefaultEff(r.buyer) ?? tooltipEfficiency(lid, ptype));
            const stripT   = Number(r.stripEff) > 0 ? Number(r.stripEff) : 100;
            const eff      = stripT !== 100
                ? `${Math.round(baseEffT * stripT / 100)}% (${baseEffT}% × strip ${stripT}%)`
                : `${baseEffT}%`;
            const order = mbmOrderNo(r.po, r.mbmOrder);
            const deliv = r.ship ? new Date(r.ship) : orderDeliveryOf(r.ship);
            const pcd   = r.pcd ? new Date(r.pcd) : (r.ship ? addCalDays(new Date(r.ship), -30) : null);
            const stage = r.stage || 'Sew';

            // ERP detail / PO summary: fetched (and session-cached) by fetchTipData
            const s  = detail?.style  || {};
            const bk = detail?.bookings?.[0] || {};

            // Wash status label
            const erpWait = '<span class="tip-dim tip4-wait">⏳ ERP…</span>';
            const washLbl = pending ? erpWait : (s.wash_recipe_status ? '<span class="tip-badge tip-ok">✓ Done</span>' : '<span class="tip-badge tip-pend">Pending</span>');

            // Image
            const ERP_HOST = 'https://erp.mbm.group';
            const imgHtml  = s.stl_img_link
                ? `<div class="tip-img-wrap"><img class="tip-img" src="${ERP_HOST}${enc(s.stl_img_link)}" onerror="this.style.display='none'"></div>`
                : '';

            // Techpack
            const tpHtml = pending ? erpWait : s.techpack
                ? `<a class="tip-link" href="${ERP_HOST}${enc(s.techpack)}" target="_blank">📎 View techpack</a>`
                : '<span class="tip-dim">—</span>';

            // Booking status
            const bkStatus = pending ? erpWait : bk.booking_no
                ? (bk.is_store_sent ? '<span class="tip-badge tip-ok">✓ Store received</span>' : '<span class="tip-badge tip-pend">Not received</span>')
                : '<span class="tip-dim">No booking</span>';

            const isConfirm  = orderTypeOf(r.po, r.orderType) === 'confirm';
            const allPos     = tipAllPos(r);

            const colorHtml  = r.color
                ? `<span class="tip4-swatch" style="background:${hashColor(r.color)}"></span>${enc(r.color)}`
                : '<span class="tip4-dim">—</span>';

            const consolidatedBadge = r.poCount > 1
                ? `<span class="tip4-badge tip4-consol">${r.poCount} POs</span>`
                : '';

            const mismatchBadge = r.confirmMismatch
                ? `<span class="tip4-badge tip4-proj" title="Confirmed ${enc(fmtQty(r.confirmMismatch.confirmed))} of ${enc(fmtQty(r.confirmMismatch.full))} — the confirm quantity must equal the projection quantity before it replaces this bar">⚠ Confirm ${enc(fmtQty(r.confirmMismatch.confirmed))} / ${enc(fmtQty(r.confirmMismatch.full))}</span>`
                : '';
            const orderTypeBadge = (isConfirm
                ? '<span class="tip4-badge tip4-confirm">✔ Confirm</span>'
                : r.orderType === 'projection'
                    ? '<span class="tip4-badge tip4-proj">Projection</span>'
                    : '') + mismatchBadge;

            const poCell = allPos.length > 1
                ? allPos.map(p => `<span class="tip4-po-pill">${enc(String(p))}</span>`).join('')
                : enc(String(r.po || '—'));

            const poBreakdownHtml = isConfirm && poSummary.length > 0 ? `
<div class="tip4-po-block tip4-po-tab">
  <table class="tip4-po-tbl">
    <thead><tr><th>PO</th><th>Color</th><th>Qty</th><th>Delivery</th></tr></thead>
    <tbody>
      ${poSummary.map(p => `<tr>
        <td class="tip4-po-no">${enc(String(p.po_number || '—'))}</td>
        <td class="tip4-po-clr">${p.color ? `<span class="tip4-swatch" style="background:${hashColor(p.color)}"></span>${enc(p.color)}` : '—'}</td>
        <td class="tip4-po-qty">${enc(fmtQty(Number(p.order_quantity || 0)))}</td>
        <td class="tip4-po-del">${enc(p.shipment_date ? ddMon(new Date(p.shipment_date)) : '—')}</td>
      </tr>`).join('')}
    </tbody>
  </table>
</div>` : '';

            const R = (lbl, val, cls='') =>
                `<div class="t4r${cls ? ' '+cls : ''}"><span class="t4l">${lbl}</span><span class="t4v">${val}</span></div>`;

            return `
<div class="mb-tip4" data-tip-ev="${enc(String(e.id))}">

  <!-- HEADER -->
  <div class="tip4-hdr">
    <span class="tip4-hdr-name">${enc(e.name || r.buyer || '—')}</span>
    <span class="tip4-hdr-badges">${orderTypeBadge}${consolidatedBadge}</span>
  </div>

  <!-- TABS: first view = style + order only; the rest open on click -->
  <div class="tip4-tabs">
    <button type="button" class="tip4-tab tip4-tab-on" data-tab="info">ℹ️ Info</button>
    <button type="button" class="tip4-tab" data-tab="po" title="Purchase orders">🧾 POs${allPos.length > 1 ? ` <span class="tip4-tab-n">${allPos.length}</span>` : ''}</button>
    <button type="button" class="tip4-tab" data-tab="lc" title="Learning curve">📈 Curve</button>
    <button type="button" class="tip4-tab" data-tab="sop" title="SOP timeline">📐 SOP</button>
    <button type="button" class="tip4-tab" data-tab="rm" title="Raw material">🧵 Material</button>
  </div>

  <div class="tip4-panel tip4-panel-on" data-panel="info">
  <!-- STYLE CARD -->
  <div class="tip4-card">
    <div class="tip4-card-hd">🎨 Style</div>
    <div class="tip4-card-body${imgHtml ? ' tip4-has-img' : ''}">
      ${imgHtml}
      <div class="tip4-rows">
        <div class="tip4-2col">
          ${R('Style No', `<b>${enc(s.stl_no || r.style || '—')}</b>`)}
          ${R('Type', enc(s.erp_product_type || (ptype !== '_Default' && ptype) || s.stl_type || '—'))}
          ${R('Product', enc(s.erp_garment_type || s.stl_product_name || (ptype !== '_Default' && ptype) || '—'))}
          ${R('Wash', washLbl)}
        </div>
        ${(s.stl_description || s.stl_garment_description) ? R('Desc', `<i class="t4dim">${enc(s.stl_description || s.stl_garment_description)}</i>`, 't4-full') : ''}
        ${R('Techpack', tpHtml, 't4-full')}
      </div>
    </div>
  </div>

  ${(() => {
      const notes = stripNotesFor(r.po);
      if (!notes.length) return '';
      const when = d => { const x = new Date(d); return Number.isNaN(x.getTime()) ? '' : `${ddMon(x)} ${String(x.getHours()).padStart(2, '0')}:${String(x.getMinutes()).padStart(2, '0')}`; };
      return `<div class="tip4-card tip4-notes">
    <div class="tip4-card-hd">📝 Notes <span class="tip4-tab-n">${notes.length}</span></div>
    <div class="tip4-card-body">
      ${notes.slice(0, 4).map(n => `<div class="t4-note"><div class="t4-note-meta"><b>${enc(n.by || '—')}</b> · ${enc(when(n.at))}</div><div class="t4-note-txt">${enc(n.note)}</div></div>`).join('')}
      ${notes.length > 4 ? `<div class="t4dim">… ${notes.length - 4} more — right-click → Strip notes</div>` : ''}
    </div>
  </div>`;
  })()}

  <!-- ORDER CARD -->
  <div class="tip4-card">
    <div class="tip4-card-hd">📦 Order</div>
    <div class="tip4-card-body">
      <div class="tip4-rows">
        ${R('Order No', `<b class="t4-order-no">${enc(r.mbmOrder || s.order_code || order || '—')}</b>`, 't4-full')}
        ${R('Buyer', enc(r.buyer || '—'), 't4-full')}
        ${R('Color', colorHtml, 't4-full')}
        <div class="tip4-2col">
          ${(() => {
              // Order Qty = the ORDER's full ERP quantity; when this bar is a
              // piece of it, its own share follows ("strip N") — the Plan Qty
              // row is that share + 3 %
              const planQ = Number(r.qty) || 0;
              const strip = Math.round(planQ / 1.03);                       // this strip's ERP share
              const whole = Number(r.fullOrderQty) > 0 ? Number(r.fullOrderQty)
                  : Math.max(Number(r.orderQty) || 0, Number(r.baseQty) || 0, strip);
              const piece = whole > 0 && Math.abs(whole - strip) > Math.max(1, whole * 0.01);
              return R('Order Qty', `<b>${enc(fmtQty(whole))}</b>${piece ? ` <span class="t4dim" title="this strip's share of the order (its plan qty is this + 3 %)">· strip ${enc(fmtQty(strip))}</span>` : ''}`);
          })()}
          ${R('Plan Qty', `<b>${enc(fmtQty(r.qty))}</b> <span class="t4dim" title="qty + ROUND(qty × 3%)">(+3%)</span>`)}
          ${R('Ship date', enc(ddMon(deliv)))}
          ${R('PCD', enc(ddMon(pcd)))}
          ${R('Status', enc(s.order_status || orderTypeOf(r.po, r.orderType) || '—'))}
          ${R('SMV / Eff', `${enc(String(smv))}${r.smvMissing ? ' <span class="t4dim" title="ERP has no SMV for this style — placeholder; right-click → Recalculate duration to enter the real SMV">(est.)</span>' : (Number(r.smvManual) > 0 ? ' <span class="t4dim">(entered)</span>' : '')} / ${enc(String(eff ?? '—'))}`)}
          ${R('Stage', enc(stage))}
        </div>
        ${(() => {
            // Production update applied: what is DONE and, highlighted, what
            // is STILL TO MAKE (the qty the bar now stands for)
            const made = Number(r.made) || 0;
            if (!(made > 0)) return '';
            const plan = Number(r.qty) || 0;
            const left = Math.max(0, plan - made);
            const pct  = plan > 0 ? Math.min(100, Math.round(made / plan * 100)) : 0;
            return R('Production',
                `<span class="t4-prod">` +
                    `<span class="t4-done" title="quantity produced (production update / ERP)">✔ Done <b>${enc(fmtQty(made))}</b></span>` +
                    `<span class="t4-left${left <= 0 ? ' t4-left-zero' : ''}" title="quantity still to be sewn — the bar now stands for this">⏳ Remaining <b>${enc(fmtQty(left))}</b></span>` +
                    `<span class="t4-bar" title="${pct}% of plan qty made"><i style="width:${pct}%"></i></span><span class="t4-pct">${pct}%</span>` +
                `</span>`, 't4-full t4-prodrow');
        })()}
        ${R('Scheduled', `<span class="t4dim">${ymdHm(e.startDate || r.start)} → ${ymdHm(e.endDate || r.end)}</span>`, 't4-full')}
      </div>
    </div>
  </div>
  </div>

  <!-- PURCHASE ORDERS TAB -->
  <div class="tip4-panel" data-panel="po">
    <div class="tip4-card">
      <div class="tip4-card-hd">🧾 Purchase Orders</div>
      <div class="tip4-card-body">
        ${poBreakdownHtml || (allPos.length
            ? `<div class="tip4-rows">${R('PO', allPos.map(p => `<span class="tip4-po-pill">${enc(String(p))}</span>`).join(''), 't4-full')}${R('PO Qty', `<b>${enc(fmtQty(r.baseQty ?? r.orderQty ?? r.qty))}</b>`, 't4-full')}${R('Delivery', enc(ddMon(deliv)), 't4-full')}</div>`
            : '<div class="t4-empty">Projection — no purchase order yet</div>')}
      </div>
    </div>
  </div>

  <!-- LEARNING CURVE TAB -->
  <div class="tip4-panel" data-panel="lc">
  ${(() => {
        const lc = r.lc;
        if (!lc) return '';
        const applied = !!lc.applied;
        const reasonLbl = {
            'product-change' : 'Product Change',
            'continuation'   : 'Product Change (continuing ramp)',
            'same-product'   : 'Same Product Continuation',
            'first-on-line'  : 'First product on line',
            'manual'         : 'Applied manually (Build up curve)'
        }[lc.reason] || '—';
        const dayLbl = applied ? `Day ${Math.min((lc.dayOffset || 0) + 1, lc.period)} of ${lc.period}` : '—';
        const dayRows = applied && Array.isArray(lc.dayPlan)
            ? lc.dayPlan.filter(d => d.day <= lc.period).map(d =>
                `<tr><td>Day ${d.day}</td><td class="t4num">${d.effPct}%</td><td class="t4num">${fmtQty(d.capacity)} pcs</td></tr>`).join('')
            : '';
        return `<div class="tip4-card">
    <div class="tip4-card-hd">📈 Learning Curve</div>
    <div class="tip4-card-body">
      <div class="tip4-rows">
        <div class="tip4-2col">
          ${R('Applied', applied ? '<span class="tip-badge tip-ok">Yes</span>' : '<span class="tip-badge tip-pend">No</span>')}
          ${R('Reason', enc(reasonLbl))}
          ${R('Learning day', enc(dayLbl))}
          ${R('Profile', enc(applied ? (lc.profileName || '—') : '—'))}
          ${R('Product type', enc(lc.typeKey || ptype || '—'))}
          ${R('Base eff', enc(Number(r.stripEff) > 0 && Number(r.stripEff) !== 100
              ? `${lc.baseEffPct ?? Math.round(baseEffT * stripT / 100)}% (${baseEffT}% × strip ${Number(r.stripEff)}%)`
              : `${lc.baseEffPct ?? baseEffT}%`))}
        </div>
        ${dayRows ? `<table class="tip4-po-tbl tip4-lc-tbl">
          <thead><tr><th>Ramp</th><th>Applied eff</th><th>Daily capacity</th></tr></thead>
          <tbody>${dayRows}</tbody></table>` : ''}
      </div>
    </div>
  </div>`;
    })() || '<div class="tip4-card"><div class="tip4-card-hd">📈 Learning Curve</div><div class="tip4-card-body"><div class="t4-empty">No learning curve on this bar</div></div></div>'}
  </div>

  <!-- SOP TAB -->
  <div class="tip4-panel" data-panel="sop">
  ${(() => {
        const sp = sopForRaw(uiHooks.instance, r, lid, { washConfirmed : !!s.wash_recipe_status, washType : s.wash_type || s.wash_name || 'normal' });
        if (!sp) return '';
        const m = sp.milestones;
        const d = x => enc(ddMon(x));
        const flag = sp.breached
            ? `<span class="tip-badge tip-late">⚠ PP passed ${sp.breachDays}d</span>`
            : (sp.production.needsCapacityReview ? '<span class="tip-badge tip-pend">⚑ capacity review</span>' : '<span class="tip-badge tip-ok">on track</span>');
        return `<div class="tip4-card">
    <div class="tip4-card-hd">📐 SOP Timeline (backward from ex-factory) ${flag}</div>
    <div class="tip4-card-body">
      <div class="tip4-rows">
        <div class="tip4-2col">
          ${R('PP start', `${d(m.pp_start.date)} <span class="t4dim">(${enc(m.pp_start.dayOfWeek.slice(0, 3))}, ${sp.pp.days}d ${sp.pp.basis === 'provisional_conservative' ? 'provisional' : ''})</span>`)}
          ${R('Throughput', `${d(m.throughput_start.date)} <span class="t4dim">(2d)</span>`)}
          ${R('Prod start', `${d(m.production_start.date)} <span class="t4dim">(${sp.production.days}d${sp.production.clamped ? ', min 5' : ''})</span>`)}
          ${R('Prod complete', d(m.production_complete.date))}
          ${R('Ex-factory', `${d(m.ex_factory.date)} <span class="t4dim">(+6d)</span>`)}
          ${R('Cycle', `${sp.totalCycleDays} days <span class="t4dim">(display only)</span>`)}
        </div>
        ${sp.breached ? `<div class="t4note">${enc(sp.escalation)}</div>` : ''}
      </div>
    </div>
  </div>`;
    })() || '<div class="tip4-card"><div class="tip4-card-hd">📐 SOP Timeline</div><div class="tip4-card-body"><div class="t4-empty">No SOP timeline (missing ship date)</div></div></div>'}
  </div>

  <!-- RAW MATERIAL TAB -->
  <div class="tip4-panel" data-panel="rm">
  <div class="tip4-card">
    <div class="tip4-card-hd">🧵 Raw Material</div>
    <div class="tip4-card-body">
      <div class="tip4-rows">
        <div class="tip4-2col">
          ${R('Fabric booking', bk.booking_no ? enc(String(bk.booking_no)) : '<span class="t4dim">—</span>')}
          ${R('Booking ETA', enc(ddMon(bk.booking_eta)))}
          ${R('Store status', bkStatus)}
          ${R('Store date', enc(bk.store_receive_date ? ddMon(bk.store_receive_date) : '—'))}
        </div>
      </div>
    </div>
  </div>
  </div>

</div>`;
}
