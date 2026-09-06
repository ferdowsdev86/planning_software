import { DateHelper, StringHelper } from '@bryntum/schedulerpro';
import {
    LINES, LINE_BY_ID, STAGE_RESOURCES, ORDERS, STAGE_EVENTS, DEPENDENCIES,
    PLAN_START, PLAN_END, VIEW_START, VIEW_END, TOTAL_AVAIL_MIN,
    computeLineUtil, calcRisk, addWorkDays, isFriday, isOffDay, fmtQty, fmtDate,
    buildManpowerRanges, buildOffDayRanges, nextWorkingDay,
    startOfWorkDay, endOfWork, endOfWorkDay, workEndOfDay, nextStartAfter, workDaysBetween,
    clampIntoWorkWindow,
    elapsedDays, orderTypeOf, barDisplayLine, addCalDays, randSmv, productTypeFor,
    mbmOrderNo, orderDeliveryOf, fmtDateDdMonRr, resolveProfileType, resolveProfileEfficiency,
    formulaWorkingDays, applyFormulaToRaw, snapWorkMinutes, WORK_MIN_PER_DAY, isLateVsDelivery
} from './planningData.js';
import { pickLearningCurve, buildLineLearning, learningDuration } from './learningCurveService.mjs';

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

function tooltipEfficiency(lineId, productType, fallbackEff) {
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
function lineCalcParams(scheduler, raw, lineId) {
    const res = scheduler?.resourceStore?.getById(lineId);
    const manpower = Number(res?.data?.manpower ?? LINE_BY_ID[lineId]?.manpower) || 50;
    const lineEff  = Number(res?.data?.eff ?? LINE_BY_ID[lineId]?.eff) || 50;
    const profileEff = tooltipEfficiency(lineId, raw.productType, lineEff);
    const baseEff = Number(raw.planEff) > 0
        ? Number(raw.planEff)
        : (Number(profileEff) > 0 ? Number(profileEff) : lineEff);
    const strip = Math.max(1, Number(raw.stripEff) || 100);
    const mins  = Number(res?.data?.hours) > 0 ? Number(res.data.hours) * 60 : WORK_MIN_PER_DAY;
    return { manpower, effPct : baseEff * strip / 100, mins };
}

// (Quantity × SMV) ÷ (Manpower × 10h minutes × Efficiency). Writes raw.dur / reqMin.
export function applyLineFormulaDuration(scheduler, raw, lineId) {
    if (!raw || !lineId || lineId === 'hold') return raw?.dur || 1;
    const { manpower, effPct, mins } = lineCalcParams(scheduler, raw, lineId);
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
    return raw.dur;
}

function setBarTooltipEnabled(scheduler, on) {
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

const STATUS_COLORS = {
    draft : '#1e88e5', planned : '#5e7c8a', confirmed : '#7b1fa2',
    running : '#0a8f3c', completed : '#9e9e9e', delayed : '#e53935'
};

export const colorState = { mode : 'risk' };
export const searchState = { query : '' };

// Bridge between the scheduler config and App.vue
export const uiHooks = {
    instance         : null,
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

const events = [...ORDERS, ...STAGE_EVENTS];

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
    const list = byLine[lineId] || [];
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
            scheduler.eventStore.suspendEvents?.();
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
        scheduler.eventStore.resumeEvents?.();
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
                    let dayCap = target;
                    // A production cut can leave the bar starting mid-shift:
                    // that first day only holds the fraction of the shift left
                    const sw = startOfWorkDay(d), ew = endOfWorkDay(d);
                    if (start > sw) {
                        dayCap = start >= ew
                            ? 0
                            : Math.round(target * (ew.getTime() - start.getTime()) / (ew.getTime() - sw.getTime()));
                    }
                    if (dayCap > 0) {
                        const q = Math.min(dayCap, remaining);
                        remaining -= q;
                        const key = ymdKeyOf(d);
                        plan[key] = (plan[key] || 0) + q;
                        sah[key]  = (sah[key]  || 0) + q * smv / 60;
                        effW[key] = (effW[key] || 0) + q * (Number(raw.planEff) > 0
                            ? Number(raw.planEff)
                            : (tooltipEfficiency(lid, raw.productType, line.eff) || line.eff || 0));
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
                    : (tooltipEfficiency(lid, raw.productType, line.eff) || line.eff || 0));
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
// Resolve where an inserted bar may start (no-overlap rule):
// - an off day start jumps to the FIRST WORKING HOUR of the next working day
// - a bar already running across the point, or a completed (fixed) bar inside
//   the span, cannot move: the inserted bar attaches exactly at its end
// ---------------------------------------------------------------------------
export function computeInsertStart(scheduler, lineId, desired, dur, excludeId) {
    // Only locked/completed bars block a drop — pinned followers get pushed
    const isFixed = lockedBar;
    const bars = barsOnLine(scheduler, lineId, excludeId);
    let start = new Date(desired);
    let snapped = false, blockedBy = null;
    if (isOffDay(start)) {
        start   = startOfWorkDay(nextWorkingDay(start));
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
        // Only LOCKED/completed bars are obstacles: the placed bar sits at the
        // exact pointed spot and every conflicting bar shifts later instead
        // ("jekhane point kora hoy okhanei boshbe, porer bar pichabe")
        const obst = bars.find(ev => isFixed(ev) && ev.startDate < end && ev.endDate > start);
        if (!obst) return { start, end, snapped, blockedBy };
        blockedBy = obst.name;
        start = nextStartAfter(obst.endDate);
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
export function lineIdOf(scheduler, ev) {
    const a = scheduler.assignmentStore?.records.find(x =>
        (x.eventId ?? x.data.eventId ?? x.data.event) === ev.id);
    return a
        ? (a.data.resourceId ?? a.resourceId)
        : (ev.resourceId ?? ev.data.resourceId);
}

export function isHoldingRes(res) {
    return !!(res && (res.id === 'hold' || res.data?.holdingRow));
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
        applyLineFormulaDuration(scheduler, ev.data.raw, lineId);
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
        const ne = endOfWork(ns, ev.data.raw.dur);
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

function configuredLearningCurve() {
    try {
        return pickLearningCurve(JSON.parse(localStorage.getItem('mbm-buildup') || '[]'), 3);
    }
    catch { return null; }
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
            typeKey      : lcTypeKey(ev.data.raw.po, res.id, ev.data.raw.productType) || '_Default',
            workDayIndex : workDayIndexOf(ev.startDate)
        }));
        const typeKeyById = new Map(seq.map(x => [x.id, x.typeKey]));
        const plan = curve ? buildLineLearning(seq, curve) : new Map();
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
            raw.lc = {
                applied     : info.applied,
                reason      : info.reason,
                dayOffset   : info.dayOffset,
                typeKey     : info.typeKey,
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
    if (!scheduler || !raw || !lineId || lineId === 'hold' || !startDate) return;
    lcProfCache = null;
    // A manually applied Build up curve travels with the bar — moving it
    // never clears or re-derives the manual ramp
    if (raw.lcManual && Array.isArray(raw.lcManual.pct) && raw.lcManual.pct.length) {
        raw.lc = {
            applied : true, reason : 'manual', dayOffset : 0,
            typeKey : lcTypeKey(raw.po, lineId, raw.productType) || '_Default',
            profileName : raw.lcManual.name,
            period : Number(raw.lcManual.period) || raw.lcManual.pct.length,
            pct : raw.lcManual.pct,
            learnFrac : 0, dayPlan : [], viaPlacement : true
        };
        return;
    }
    const curve = configuredLearningCurve();
    if (!curve) { delete raw.lc; return; }
    const myKey = lcTypeKey(raw.po, lineId, raw.productType) || '_Default';
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
    const prevKey = lcTypeKey(prevBars[0].data.raw.po, lineId, prevBars[0].data.raw.productType) || '_Default';
    if (prevKey !== myKey) {
        raw.lc = { ...base, applied : true, reason : 'product-change', dayOffset : 0 };
        return;
    }
    // Same type: walk back to the start of the run and continue its ramp
    let runStart = prevBars[0];
    let hasChangeoverBefore = false;
    for (let i = 1; i < prevBars.length; i++) {
        const k = lcTypeKey(prevBars[i].data.raw.po, lineId, prevBars[i].data.raw.productType) || '_Default';
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

    // Immovable bars keep their START, but the span must still reflect the
    // CURRENT line parameters (manpower / eff / hours); completed bars stay.
    for (const ev of fixed) {
        const raw = ev.data.raw;
        if (raw.status === 'completed') continue;
        applyLineFormulaDuration(scheduler, raw, lineId);
        const fixedEnd = endOfWork(new Date(ev.startDate), raw.dur || 1);
        if (ev.endDate?.getTime() !== fixedEnd.getTime()) {
            ev.set({ endDate : fixedEnd, duration : elapsedDays(ev.startDate, fixedEnd) });
            raw.start = new Date(ev.startDate);
            raw.end   = fixedEnd;
            moved++;
        }
    }

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
    const base = String(parentCode || poBaseEventCode(po)).replace(/-\d+$/, '');
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
    const line = LINE_BY_ID[rid] || (res?.data?.lineRow ? { id : rid, ...res.data } : null);
    if (!raw || raw.stage) return { ok : false, msg : 'Only production bars can be split' };
    if (raw.status === 'completed') return { ok : false, msg : 'Completed orders cannot be split' };
    if (!line) return { ok : false, msg : 'Only sewing-line bars can be split' };

    const orig = { ...raw };
    const manpower = Number(res?.data?.manpower ?? line.manpower) || 50;
    const lineEff  = Number(res?.data?.eff ?? line.eff) || 50;
    const profileEff = tooltipEfficiency(rid, orig.productType, lineEff);
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
        d1 = formulaWorkingDays(q1, orig.smv, manpower, usedEff);
        d2 = formulaWorkingDays(q2, orig.smv, manpower, usedEff);
    }
    else {
        if (orig.dur < 2) return { ok : false, msg : 'Bar is only one working day — nothing to split' };
        d1 = Math.max(1, Math.min(orig.dur - 1, dur1 ?? 1));
        d2 = orig.dur - d1;
        q1 = Math.round(orig.qty * d1 / orig.dur);
        q2 = orig.qty - q1;
    }

    const start1 = new Date(rec.startDate);
    const end1   = endOfWork(start1, d1);
    const start2 = nextStartAfter(end1);
    const end2   = endOfWork(start2, d2);

    // Part 1: the original record shrinks
    raw.qty    = q1;
    raw.reqMin = Math.round(q1 * orig.smv);
    raw.dur    = d1;
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
        start : start2, end : end2, progress : 0, status : 'draft',
        eventCode : strip2Code,
        // The piece needs its OWN board identity — copying the parent's id
        // (e.g. 'proj:26XXX') would make the two parts indistinguishable
        id : strip2Code.startsWith('ev-') ? strip2Code.slice(3) : strip2Code,
        dbId : orig.dbId,
        keepSeparate : !!orig.keepSeparate
    };
    const id = `${rec.id}-sp${++splitSeq}`;
    scheduler.eventStore.add({
        id,
        resourceId : line.id,
        startDate  : start2,
        endDate    : end2,
        duration   : elapsedDays(start2, end2),
        manuallyScheduled : true,
        name        : rec.name,
        percentDone : 0,
        raw         : raw2
    });
    const rec2 = scheduler.eventStore.getById(id);

    const pushed = rec2 ? pushFollowers(scheduler, line.id, rec2) : 0;
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
    const sameOrder = o =>
        String(o.po || '') === String(raw.po || '')
        && String(o.mbmOrder || '') === String(raw.mbmOrder || '')
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
    const profileEff = tooltipEfficiency(resourceRecord.id, order.productType, lineEff);
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

    const targetId = parkHold ? 'hold' : line.id;
    scheduler.eventStore.add({
        id : `ev-${order.id}`,
        resourceId : targetId,
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
    zoomOnMouseWheel    : false,
    zoomOnTimeAxisDoubleClick : false,
    createEventOnDblClick     : false,

    viewPreset : {
        base              : 'dayAndWeek',
        tickWidth         : 72,
        displayDateFormat : 'YY-MM-DD',
        headers           : [
            { unit : 'day', dateFormat : 'YY-MM-DD' }
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
            sum        : () => 0,
            summaryRenderer : () => `<div class="fr-line-foot fr-gt-head">
                <span class="fr-gt-title">Grand totals</span>
                <div class="fr-gt-legend fr-gt-legend-col">
                    <span class="fr-gt-plan">Day plan</span>
                    <span class="fr-gt-act">Production</span>
                    <span>+/-</span>
                </div>
            </div>`,
            headerRenderer  : () =>
                '<div class="fr-clock" id="mb-hover-clock">Fri 2026-08-28 8:00:00 AM<br>0.0 x 0:00 x 0 = 0.000</div>',
            renderer : ({ record : r }) => {
                const enc  = StringHelper.encodeHtml;
                const d    = r.data || r;
                const floorN = String(d.floor || '1').replace(/\D/g, '') || '1';
                const code = `${d.unit || 'AQL'}-${floorN.padStart(2, '0')}`;
                const ico = '<span class="fr-line-ico"></span>';
                const nums = (red, blue, black) =>
                    `<div class="fr-line-nums">
                        <div><span class="fr-n-red">${red}</span> <span class="fr-n-blue">${blue}</span></div>
                        <div class="fr-n-black">${black}</div>
                    </div>`;
                if (d.holdingRow || d.subtotalRow) {
                    const s = uiHooks.instance;
                    const lines = s
                        ? s.resourceStore.records.filter(x => x.data?.lineRow)
                        : LINES;
                    const mp = lines.reduce((a, x) => a + Number(x.manpower ?? x.data?.manpower ?? 0), 0);
                    const mc = lines.reduce((a, x) => a + Number(x.machines ?? x.data?.machines ?? 0), 0);
                    const id = d.holdingRow ? String(50000 + mc) : String(mc);
                    return `<div class="fr-line">
                        <span class="fr-line-chip fr-line-chip-red">${enc(id)}</span>
                        <div class="fr-line-mid">
                            <div class="fr-line-name">${enc(d.name)}</div>
                            <div class="fr-line-sub">${enc(code)}</div>
                        </div>
                        ${nums(mp, 0, mc)}
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
                    const d1  = Math.max(1, Math.min(raw.dur - 1, workDaysBetween(rec.startDate, date)));
                    const res = splitBar(uiHooks.instance, rec, { dur1 : d1 });
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
            const items = context.items || context;
            const rec = context.eventRecord;
            const raw = rec?.data?.raw || rec?.raw;
            const s   = uiHooks.instance;
            if (!raw || raw.stage) {
                items.splitAtCursor = false;
                items.splitQtyItem  = false;
                items.stripProps    = false;
                items.planSchedule  = false;
                items.buildUpCurve  = false;
                return;
            }
            if (raw.status === 'completed' && items.buildUpCurve) {
                items.buildUpCurve = false;
            }
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
            if (raw.dur < 2) {
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
        hoverDelay           : 400,
        hideOnDelegateChange : true,
        hideOnScroll         : true,
        allowOver            : true,
        async template({ eventRecord : e }) {
            const r = e.data.raw;
            if (!r) return StringHelper.encodeHtml(e.name);

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
            // Show the efficiency the plan actually used when available
            const eff   = Number(r.planEff) > 0 ? Number(r.planEff) : tooltipEfficiency(lid, ptype);
            const order = mbmOrderNo(r.po, r.mbmOrder);
            const deliv = r.ship ? new Date(r.ship) : orderDeliveryOf(r.ship);
            const pcd   = r.pcd ? new Date(r.pcd) : (r.ship ? addCalDays(new Date(r.ship), -30) : null);
            const stage = r.stage || 'Sew';

            // Fetch ERP detail (cached per PO)
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1/planning';
            const cacheKey = `tip-${r.po}`;
            let detail = null;
            if (r.po) {
                try {
                    const cached = sessionStorage.getItem(cacheKey);
                    if (cached) {
                        detail = JSON.parse(cached);
                    } else {
                        const res = await fetch(`${API_BASE}/order-details?po=${encodeURIComponent(r.po)}`);
                        const json = await res.json();
                        if (json.success) {
                            detail = json.data;
                            sessionStorage.setItem(cacheKey, JSON.stringify(detail));
                        }
                    }
                } catch { /* API offline */ }
            }

            const s  = detail?.style  || {};
            const bk = detail?.bookings?.[0] || {};

            // Wash status label
            const washLbl = s.wash_recipe_status ? '<span class="tip-badge tip-ok">✓ Done</span>' : '<span class="tip-badge tip-pend">Pending</span>';

            // Image
            const ERP_HOST = 'https://erp.mbm.group';
            const imgHtml  = s.stl_img_link
                ? `<div class="tip-img-wrap"><img class="tip-img" src="${ERP_HOST}${enc(s.stl_img_link)}" onerror="this.style.display='none'"></div>`
                : '';

            // Techpack
            const tpHtml = s.techpack
                ? `<a class="tip-link" href="${ERP_HOST}${enc(s.techpack)}" target="_blank">📎 View techpack</a>`
                : '<span class="tip-dim">—</span>';

            // Booking status
            const bkStatus = bk.booking_no
                ? (bk.is_store_sent ? '<span class="tip-badge tip-ok">✓ Store received</span>' : '<span class="tip-badge tip-pend">Not received</span>')
                : '<span class="tip-dim">No booking</span>';

            // Fetch per-PO breakdown for confirm orders
            const isConfirm  = orderTypeOf(r.po, r.orderType) === 'confirm';
            const allPos     = Array.isArray(r.poList) && r.poList.length > 0 ? r.poList : (r.po ? [String(r.po)] : []);
            let   poSummary  = [];
            if (isConfirm && allPos.length > 0) {
                try {
                    // Query by planning_orders row IDs when the bar knows them —
                    // a PO number can span several colours; ids give the exact
                    // colour rows this bar covers
                    const ids = Array.isArray(r.idList) ? r.idList.filter(n => Number(n) > 0) : [];
                    const qs  = ids.length
                        ? `ids=${encodeURIComponent(ids.join(','))}`
                        : `pos=${encodeURIComponent(allPos.join(','))}`;
                    const cacheKeyPos = `pos-sum-${qs}`;
                    const cachedPos   = sessionStorage.getItem(cacheKeyPos);
                    if (cachedPos) {
                        poSummary = JSON.parse(cachedPos);
                    } else {
                        const resPo = await fetch(`${API_BASE}/pos-summary?${qs}`);
                        const jsPo  = await resPo.json();
                        if (jsPo.success) {
                            poSummary = jsPo.rows;
                            sessionStorage.setItem(cacheKeyPos, JSON.stringify(poSummary));
                        }
                    }
                } catch { /* offline */ }
            }

            const colorHtml  = r.color
                ? `<span class="tip4-swatch" style="background:${hashColor(r.color)}"></span>${enc(r.color)}`
                : '<span class="tip4-dim">—</span>';

            const consolidatedBadge = r.poCount > 1
                ? `<span class="tip4-badge tip4-consol">${r.poCount} POs</span>`
                : '';

            const orderTypeBadge = isConfirm
                ? '<span class="tip4-badge tip4-confirm">✔ Confirm</span>'
                : r.orderType === 'projection'
                    ? '<span class="tip4-badge tip4-proj">Projection</span>'
                    : '';

            const poCell = allPos.length > 1
                ? allPos.map(p => `<span class="tip4-po-pill">${enc(String(p))}</span>`).join('')
                : enc(String(r.po || '—'));

            const poBreakdownHtml = isConfirm && poSummary.length > 0 ? `
<div class="tip4-po-block">
  <div class="tip4-po-hd">Purchase Orders</div>
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
<div class="mb-tip4">

  <!-- HEADER -->
  <div class="tip4-hdr">
    <span class="tip4-hdr-name">${enc(e.name || r.buyer || '—')}</span>
    <span class="tip4-hdr-badges">${orderTypeBadge}${consolidatedBadge}</span>
  </div>

  <!-- STYLE CARD -->
  <div class="tip4-card">
    <div class="tip4-card-hd">🎨 Style</div>
    <div class="tip4-card-body${imgHtml ? ' tip4-has-img' : ''}">
      ${imgHtml}
      <div class="tip4-rows">
        <div class="tip4-2col">
          ${R('Style No', `<b>${enc(s.stl_no || r.style || '—')}</b>`)}
          ${R('Type', enc(ptype || s.stl_type || '—'))}
          ${R('Product', enc(s.stl_product_name || ptype || '—'))}
          ${R('Wash', washLbl)}
        </div>
        ${(s.stl_description || s.stl_garment_description) ? R('Desc', `<i class="t4dim">${enc(s.stl_description || s.stl_garment_description)}</i>`, 't4-full') : ''}
        ${R('Techpack', tpHtml, 't4-full')}
      </div>
    </div>
  </div>

  <!-- ORDER CARD -->
  <div class="tip4-card">
    <div class="tip4-card-hd">📦 Order</div>
    <div class="tip4-card-body">
      <div class="tip4-rows">
        ${R('Order No', `<b class="t4-order-no">${enc(r.mbmOrder || s.order_code || order || '—')}</b>`, 't4-full')}
        ${R('Buyer', enc(r.buyer || '—'), 't4-full')}
        <div class="tip4-2col">
          ${R('Color', colorHtml)}
          ${R('PO', `<b>${poCell}</b>`)}
          ${R('Total Qty', `<b>${enc(fmtQty(r.qty))}</b>${Number(r.made) > 0 ? ` <span class="t4dim">(${fmtQty(r.made)} done)</span>` : ''}`)}
          ${R('Ship date', enc(ddMon(deliv)))}
          ${R('PCD', enc(ddMon(pcd)))}
          ${R('Status', enc(s.order_status || orderTypeOf(r.po, r.orderType) || '—'))}
          ${R('SMV / Eff', `${enc(String(smv))} / ${enc(String(eff ?? '—'))}%`)}
          ${R('Stage', enc(stage))}
        </div>
        ${R('Scheduled', `<span class="t4dim">${ymdHm(e.startDate || r.start)} → ${ymdHm(e.endDate || r.end)}</span>`, 't4-full')}
      </div>
      ${poBreakdownHtml}
    </div>
  </div>

  <!-- LEARNING CURVE CARD -->
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
              ? `${lc.baseEffPct ?? eff}% (${eff}% × strip ${Number(r.stripEff)}%)`
              : `${lc.baseEffPct ?? eff}%`))}
        </div>
        ${dayRows ? `<table class="tip4-po-tbl tip4-lc-tbl">
          <thead><tr><th>Ramp</th><th>Applied eff</th><th>Daily capacity</th></tr></thead>
          <tbody>${dayRows}</tbody></table>` : ''}
      </div>
    </div>
  </div>`;
    })()}

  <!-- RAW MATERIAL CARD -->
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

</div>`;
        }
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
    summaryFeature : {
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

        const q = (searchState.query || '').trim().toLowerCase();
        if (q) {
            const hay = [
                r.buyer, r.po, r.style, r.status, r.productType,
                orderTypeOf(r.po, r.orderType), barDisplayLine(r), e.name
            ].join(' ').toLowerCase();
            renderData.cls.add(hay.includes(q) ? 'mb-search-hit' : 'mb-search-dim');
        }

        if (pastDelivery) {
            renderData.style = 'background-color:#ee2e24;border-color:#7a0000;color:#fff';
        }
        else if (colorState.mode === 'buyer') {
            renderData.style = `background-color:${hashColor(r.buyer)};border-color:#222;color:#fff`;
        }
        else if (colorState.mode === 'status') {
            renderData.style = `background-color:${STATUS_COLORS[r.status] || '#5e7c8a'};border-color:#222;color:#fff`;
        }

        if (r.stage) {
            return `<div class="mb-bar"><div class="mb-bar-l1">${StringHelper.encodeHtml(e.name)}</div><div class="mb-bar-l2">${StringHelper.encodeHtml(r.stage)}</div></div>`;
        }
        // Single line, vertically centred — no confirm/projection label
        // (the bar colour/border already distinguishes confirm orders)
        const full = barDisplayLine(r);
        const w = renderData.width || 0;
        const compact = w > 0 && w < full.length * 6.8 + 12;
        const text = compact ? barDisplayLine(r, true) : full;
        // Learning-curve ramp: hatched overlay on the bar's head — a shade on
        // top of (never replacing) the status/risk colour
        const lcFrac = r.lc?.applied ? Math.min(1, Number(r.lc.learnFrac) || 0) : 0;
        const lcHtml = lcFrac > 0.005
            ? `<div class="mb-lc-seg" style="width:${(lcFrac * 100).toFixed(1)}%"></div><span class="mb-lc-badge" title="Learning curve — ${StringHelper.encodeHtml(r.lc.profileName || '')}">LC</span>`
            : '';
        return `
            ${lcHtml}<div class="mb-bar mb-bar-center">
                <div class="mb-bar-l1">${StringHelper.encodeHtml(text)}</div>
            </div>`;
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
                if (rid === 'hold' || !LINE_BY_ID[rid]) {
                    const targetId = rid === 'hold' ? 'hold' : rid;
                    const start = startOfWorkDay(DateHelper.clearTime(rec.startDate));
                    const end   = endOfWork(start, raw.dur || elapsedDays(rec.startDate, rec.endDate) || 1);
                    const a = s.assignmentStore.records.find(x =>
                        (x.eventId ?? x.data?.eventId ?? x.data?.event) === rec.id);
                    if (a) a.set('resourceId', targetId);
                    else s.assignmentStore.add({ eventId : rec.id, resourceId : targetId });
                    rec.data.resourceId = targetId;
                    rec.set({
                        resourceId : targetId,
                        startDate  : start,
                        endDate    : end,
                        duration   : elapsedDays(start, end)
                    });
                    raw.start = start;
                    raw.end   = end;
                    if (rid === 'hold' && (raw.status === 'planned' || raw.status === 'draft')) {
                        raw.status = 'unplanned';
                    }
                    continue;
                }
                if (raw.status === 'unplanned') raw.status = 'draft';
                const { start : sd, end, snapped, blockedBy } =
                    computeInsertStart(s, rid, origStart, raw.dur, rec.id);
                const moved = snapped || !!blockedBy || sd.getTime() !== origStart.getTime();
                rec.set({ startDate : sd, endDate : end, duration : elapsedDays(sd, end) });
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
        events,
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
        stm : {
            autoRecord : true,
            disabled   : false
        }
    }
};
