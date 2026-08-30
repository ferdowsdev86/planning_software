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
    formulaWorkingDays, applyFormulaToRaw, WORK_MIN_PER_DAY, isLateVsDelivery
} from './planningData.js';

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

// (Quantity × SMV) ÷ (Manpower × 10h minutes × Efficiency). Writes raw.dur / reqMin.
export function applyLineFormulaDuration(scheduler, raw, lineId) {
    if (!raw || !lineId || lineId === 'hold') return raw?.dur || 1;
    const res = scheduler?.resourceStore?.getById(lineId);
    const manpower = Number(res?.data?.manpower ?? LINE_BY_ID[lineId]?.manpower) || 50;
    const lineEff  = Number(res?.data?.eff ?? LINE_BY_ID[lineId]?.eff) || 50;
    const profileEff = tooltipEfficiency(lineId, raw.productType, lineEff);
    const baseEff = Number(raw.planEff) > 0
        ? Number(raw.planEff)
        : (Number(profileEff) > 0 ? Number(profileEff) : lineEff);
    const strip = Math.max(1, Number(raw.stripEff) || 100);
    applyFormulaToRaw(raw, manpower, baseEff * strip / 100, WORK_MIN_PER_DAY);
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

let gtCache = { at : 0, plan : {}, made : {} };
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
    return !!(raw?.userPinned || raw?.manualGap);
}

function isFixedBar(ev) {
    return ev.draggable === false || ev.data?.raw?.status === 'completed' || isPinnedBar(ev);
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
    const plan = {}, made = {};
    let prodStore = {};
    try { prodStore = JSON.parse(localStorage.getItem('mbm-prod-updates') || '{}'); }
    catch { prodStore = {}; }
    if (s) {
        for (const ev of s.eventStore.records) {
            const raw = ev.data.raw;
            if (!raw || raw.stage) continue;
            const lid  = ev.resourceId ?? ev.data.resourceId;
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
                        lastKey = key;
                    }
                }
                d.setDate(d.getDate() + 1);
            }
            if (remaining > 0 && lastKey) plan[lastKey] += remaining;
        }
    }
    for (const days of Object.values(prodStore)) {
        for (const [date, q] of Object.entries(days)) {
            made[date] = (made[date] || 0) + (Number(q) || 0);
        }
    }
    gtCache = { at : now, plan, made };
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
    const isFixed = isFixedBar;
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
        const obst = bars.find(ev =>
            (ev.startDate < start && ev.endDate > start) ||
            (isFixed(ev) && ev.startDate < end && ev.endDate > start));
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
    const isFixed = isFixedBar;
    const bars = barsOnLine(scheduler, lineId, placed.id);
    const followers = bars
        .filter(ev => ev.startDate >= placed.startDate)
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
        if (ev.data.raw.manualGap && ev.startDate > ns) {
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

// Close empty time between sewing bars on every line. The next order starts
// at the previous end (same shift if minutes remain). Completed bars stay put.
export function packBoardGaps(scheduler) {
    if (!scheduler) return 0;
    invalidateBarsCache();
    rebuildBarsCache(scheduler);
    let moved = 0;
    for (const res of scheduler.resourceStore.records) {
        if (!res.data?.lineRow && !LINE_BY_ID[res.id]) continue;
        moved += packLineNoGaps(scheduler, res.id);
    }
    invalidateBarsCache();
    return moved;
}

function packLineNoGaps(scheduler, lineId) {
    const isFixed = isFixedBar;
    const bars = barsOnLine(scheduler, lineId)
        .filter(ev => ev.data?.raw && !ev.data.raw.stage)
        .sort((a, b) => {
            const ds = a.startDate - b.startDate;
            if (ds) return ds;
            return String(a.id).localeCompare(String(b.id));
        });
    let prevEnd = null;
    let moved = 0;
    for (const ev of bars) {
        const raw = ev.data.raw;
        if (isFixed(ev)) {
            if (!prevEnd || ev.endDate > prevEnd) prevEnd = new Date(ev.endDate);
            continue;
        }
        applyLineFormulaDuration(scheduler, raw, lineId);
        const dur = raw.dur || 1;
        const flush = prevEnd ? nextStartAfter(prevEnd) : clampIntoWorkWindow(ev.startDate);
        let start = flush;
        const wall = bars.find(b => isPinnedBar(b) && b.startDate > (prevEnd || ev.startDate));
        if (wall && flush < wall.startDate) {
            const trial = endOfWork(flush, dur);
            if (trial > wall.startDate) {
                start = clampIntoWorkWindow(ev.startDate);
            }
        }
        const end = endOfWork(start, dur);
        if (wall && start < wall.startDate && end > wall.startDate) {
            prevEnd = ev.endDate > prevEnd ? new Date(ev.endDate) : prevEnd;
            continue;
        }
        if (ev.startDate?.getTime() !== start.getTime() || ev.endDate?.getTime() !== end.getTime()) {
            ev.set({ startDate : start, endDate : end, duration : elapsedDays(start, end) });
            raw.start = start;
            raw.end   = end;
            moved++;
        }
        raw.latePlan = !!(raw.pcd && startOfWorkDay(start) > startOfWorkDay(new Date(raw.pcd)));
        prevEnd = end;
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

function nextStripEventCode(scheduler, po) {
    const base = poBaseEventCode(po);
    let maxSuffix = 1;
    for (const ev of scheduler.eventStore.records) {
        const r = ev.data?.raw;
        if (!r || r.po !== po) continue;
        const code = r.eventCode || poBaseEventCode(po);
        if (code === base) {
            maxSuffix = Math.max(maxSuffix, 1);
            continue;
        }
        const m = code.match(/-SEW-(\d+)$/);
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
    if (!raw.eventCode) raw.eventCode = poBaseEventCode(raw.po);
    const raw2 = {
        ...orig,
        qty : q2, reqMin : Math.round(q2 * orig.smv), dur : d2,
        start : start2, end : end2, progress : 0, status : 'draft',
        eventCode : nextStripEventCode(scheduler, raw.po),
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
    // Strictly same line (assignment-based, never stale) AND same order/PO
    const lineId = targetLineId ?? lineIdOf(scheduler, rec);
    const same = barsOnLine(scheduler, lineId, rec.id).filter(ev =>
        ev.data.raw.po === raw.po);
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
        scheduler.eventStore.remove(next);
        merged = { po : rp.po, qty, rec : prev };
        rec = prev;
        raw = rp;
    }
    return merged;
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
    const reqMin = Math.round(order.qty * order.smv);
    const dur    = parkHold
        ? Math.max(1, order.dur || formulaWorkingDays(order.qty, order.smv, manpower, profileEff || lineEff))
        : formulaWorkingDays(order.qty, order.smv, manpower, profileEff || lineEff);

    const dropped = startOfWorkDay(DateHelper.clearTime(date));
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
            summaryRenderer : () => `<div class="fr-line-foot">Grand totals
                <div class="fr-gt-legend">
                    <span class="fr-gt-plan">Day plan</span> ·
                    <span class="fr-gt-act">Production</span> ·
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
                return;
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
        hoverDelay           : 500,
        hideOnDelegateChange : true,
        hideOnScroll         : true,
        allowOver            : false,
        template({ eventRecord : e }) {
            const r = e.data.raw;
            if (!r) return StringHelper.encodeHtml(e.name);
            const ymd = d => {
                if (!d) return '';
                const x = new Date(d);
                if (Number.isNaN(x.getTime())) return '';
                const p = n => String(n).padStart(2, '0');
                return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}`;
            };
            const ymdHm = d => {
                const day = ymd(d);
                if (!day || !d) return day;
                const x = new Date(d);
                const p = n => String(n).padStart(2, '0');
                return `${day} ${p(x.getHours())}:${p(x.getMinutes())}`;
            };
            const lid   = e.resourceId ?? e.data.resourceId;
            const ptype = tooltipProductType(r.po, lid, r.productType);
            const start = e.startDate || r.start;
            const end   = e.endDate || r.end;
            const smv   = r.smv || randSmv(r.po);
            const order = mbmOrderNo(r.po, r.mbmOrder);
            const deliv = r.ship ? new Date(r.ship) : orderDeliveryOf(r.ship);
            const pcd   = r.pcd ? new Date(r.pcd) : (r.ship ? addCalDays(new Date(r.ship), -30) : null);
            const stage = r.stage || 'Sew';
            const enc   = StringHelper.encodeHtml;
            const row   = (label, value, cls = '') =>
                `<div class="${cls}">${enc(label)} : ${enc(value ?? '')}</div>`;
            return `
                <div class="mb-tip">
                    ${row('Stage', stage, 'mb-tip-stage')}
                    ${row('Order', order, 'mb-tip-order')}
                    ${row('Product', r.style || '')}
                    ${row('Description', '')}
                    ${row('Type', ptype)}
                    ${row('Customer', r.buyer || '')}
                    ${row('Quantity', fmtQty(r.qty))}
                    ${Number(r.made) > 0
                        ? row('Produced', fmtQty(r.made)) + row('Remaining', fmtQty(Math.max(0, r.qty - r.made)))
                        : ''}
                    ${row('SMV', String(smv))}
                    ${row('Efficiency', `${tooltipEfficiency(lid, ptype) ?? '—'}%`)}
                    ${row('Order type', orderTypeOf(r.po, r.orderType))}
                    ${row('PCD', fmtDateDdMonRr(pcd) || ymd(pcd))}
                    ${row('Start date', ymdHm(start))}
                    ${row('End date', ymdHm(end))}
                    ${row('Delivery', fmtDateDdMonRr(deliv) || ymd(deliv))}
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

        const q = (searchState.query || '').trim().toLowerCase();
        if (q) {
            const hay = [
                r.buyer, r.po, r.style, r.status, r.productType,
                orderTypeOf(r.po, r.orderType), barDisplayLine(r), e.name
            ].join(' ').toLowerCase();
            renderData.cls.add(hay.includes(q) ? 'mb-search-hit' : 'mb-search-dim');
        }

        if (pastDelivery) {
            renderData.style = 'background-color:#d40000;border-color:#7a0000;color:#ffe600';
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
        const full = barDisplayLine(r);
        const w = renderData.width || 0;
        const compact = w > 0 && w < full.length * 6.8 + 12;
        const text = compact ? barDisplayLine(r, true) : full;
        return `
            <div class="mb-bar">
                <div class="mb-bar-l1">${StringHelper.encodeHtml(text)}</div>
                ${compact ? '' : `<div class="mb-bar-l2">${orderTypeOf(r.po, r.orderType)}${Number(r.made) > 0 ? ` · ${fmtQty(Math.max(0, r.qty - r.made))} left` : ''}</div>`}
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
