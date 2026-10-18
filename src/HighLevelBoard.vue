<script setup>
// ---------------------------------------------------------------------------
// High Level Planning Board — a standalone capacity & reservation simulation.
// Four fixed unit rows (UNIT-M / UNIT-C / UNIT-A / UNIT-G) with their lines
// underneath, a day / week / month timeline, reservation bars that can be
// dragged, resized, split, locked and cancelled, product-wise capacity,
// order capacity tests, auto planning and multiple scenarios.
//
// Everything here works on a SCENARIO object (src/hlEngine.js) that the
// server keeps in the hl_* tables. The live MBM / CEIL / AQL plan is only
// read for the optional reference import — never written.
// ---------------------------------------------------------------------------
import { ref, shallowRef, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { BryntumSchedulerPro } from '@bryntum/schedulerpro-vue-3';
import { StringHelper } from '@bryntum/schedulerpro';
import {
    HL_UNITS, newScenario, newLine, uid, ymd, addDays, daysBetween, fromYmd,
    lineById, orderById, unitOf, buildLoad, usedMinutes, lineDayMinutes, lineSummary, unitSummary, isWorkDay, holidayOn,
    unitDayStatus, lineDayStatus, planOrder, autoPlan, endForQty, conflicts, reconcile, lineCompatible, reservationDays, isOver
} from './hlEngine.js';
import {
    hlListScenarios, hlCreateScenario, hlLoadScenario, hlSaveScenario, hlRenameScenario, hlDeleteScenario, hlReference, hlErpLoad, hlErpSmv, hlErpSmvOrders
} from './api.js';

const props = defineProps({
    user   : { type : Object, default : null },     // { username, name, role }
    access : { type : String, default : 'write' },  // 'write' | 'read' (Settings → High Level Board)
    toast  : { type : Function, default : () => {} }
});
const canWrite = computed(() => props.access === 'write');
const denied = () => { props.toast('🔒 Read-only access to the High Level Planning Board — ask a Planning Manager for Write (Setup → Settings)', 'warn'); return false; };
const emit = defineEmits(['close']);

const by = () => props.user?.username || '';
const fmtQty = n => (Number(n) || 0).toLocaleString('en-US');
const fmtMin = n => `${Math.round((Number(n) || 0) / 60).toLocaleString('en-US')} h`;
const fmtPct = f => `${Math.round((Number(f) || 0) * 100)}%`;
const dmy = s => (s ? `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(2, 4)}` : '—');

// ---------------------------------------------------------------------------
// Scenario state
// ---------------------------------------------------------------------------
const scenarios  = ref([]);
const sc         = shallowRef(null);        // the open scenario (plain object)
const dirty      = ref(false);
const busy       = ref(false);
const tick       = ref(0);                   // bump after every scenario mutation → recompute
const undoStack  = [];
const redoStack  = [];
const undoDepth  = ref(0);
const redoDepth  = ref(0);
const loadMap    = shallowRef(new Map());

function snapshot() { return JSON.stringify(sc.value); }
function mutate(label, fn) {
    if (!sc.value) return;
    if (!canWrite.value) { denied(); return; }
    undoStack.push({ label, snap : snapshot() });
    if (undoStack.length > 60) undoStack.shift();
    redoStack.length = 0;
    fn(sc.value);
    afterChange();
}
function afterChange() {
    dirty.value = true;
    undoDepth.value = undoStack.length;
    redoDepth.value = redoStack.length;
    tick.value++;
}
function undo() {
    const e = undoStack.pop();
    if (!e) return;
    redoStack.push({ label : e.label, snap : snapshot() });
    sc.value = JSON.parse(e.snap);
    afterChange();
    props.toast(`Undo: ${e.label}`, 'ok');
}
function redo() {
    const e = redoStack.pop();
    if (!e) return;
    undoStack.push({ label : e.label, snap : snapshot() });
    sc.value = JSON.parse(e.snap);
    afterChange();
    props.toast(`Redo: ${e.label}`, 'ok');
}

async function refreshScenarios() {
    try { scenarios.value = (await hlListScenarios(by())).rows || []; }
    catch (e) { props.toast(`Scenario list failed: ${e.message}`, 'error'); }
}
async function openScenario(id) {
    if (!id) return;
    if (dirty.value && !window.confirm('Unsaved simulation changes will be lost — open the other scenario anyway?')) return;
    busy.value = true;
    try {
        const j = await hlLoadScenario(id, by());
        sc.value = j.scenario;
        undoStack.length = 0; redoStack.length = 0;
        dirty.value = false;
        afterChange(); dirty.value = false;
        localStorage.setItem('hl-scenario', id);
    }
    catch (e) { props.toast(`Could not open the scenario: ${e.message}`, 'error'); }
    finally { busy.value = false; }
}
async function createScenario(fromId = null) {
    if (!canWrite.value) return denied();
    const name = window.prompt(fromId ? 'Name of the copy:' : 'Name of the new scenario:', fromId ? `${sc.value?.name || 'Scenario'} (copy)` : `Scenario ${String.fromCharCode(65 + (scenarios.value.length % 26))}`);
    if (!name) return;
    busy.value = true;
    try {
        const j = await hlCreateScenario(by(), name, fromId ? { fromId } : { bundle : newScenario(name, by()) });
        await refreshScenarios();
        dirty.value = false;
        await openScenario(j.id);
        props.toast(fromId ? `Scenario duplicated as "${name}"` : `Scenario "${name}" created`, 'ok');
    }
    catch (e) { props.toast(`Create failed: ${e.message}`, 'error'); }
    finally { busy.value = false; }
}
async function renameScenario() {
    if (!sc.value || !canWrite.value) { if (sc.value) denied(); return; }
    const name = window.prompt('Scenario name:', sc.value.name);
    if (!name || name === sc.value.name) return;
    try { await hlRenameScenario(sc.value.id, by(), name); sc.value.name = name; tick.value++; await refreshScenarios(); }
    catch (e) { props.toast(`Rename failed: ${e.message}`, 'error'); }
}
async function deleteScenario() {
    if (!sc.value || !canWrite.value) { if (sc.value) denied(); return; }
    if (!window.confirm(`Delete the scenario "${sc.value.name}"?\n\nOnly this simulation workspace goes — the live plan is not involved.`)) return;
    try {
        await hlDeleteScenario(sc.value.id, by());
        props.toast(`Scenario "${sc.value.name}" deleted`, 'ok');
        sc.value = null; dirty.value = false;
        await refreshScenarios();
        if (scenarios.value.length) await openScenario(scenarios.value[0].id);
    }
    catch (e) { props.toast(`Delete failed: ${e.message}`, 'error'); }
}
async function saveScenario() {
    if (!sc.value || !canWrite.value) { if (sc.value) denied(); return; }
    busy.value = true;
    try {
        const j = await hlSaveScenario(sc.value.id, by(), sc.value);
        sc.value.version = j.version;
        dirty.value = false;
        props.toast(`Scenario "${sc.value.name}" saved (v${j.version}) — simulation data only`, 'ok');
        await refreshScenarios();
    }
    catch (e) {
        if (e.conflict) {
            if (window.confirm(`${e.message}\n\nReload the scenario now? (your unsaved simulation changes are lost)`)) { dirty.value = false; await openScenario(sc.value.id); }
        }
        else props.toast(`Save failed: ${e.message}`, 'error');
    }
    finally { busy.value = false; }
}
function resetSimulation() {
    if (!sc.value) return;
    if (!window.confirm('Reset this scenario\'s simulation: every reservation goes, orders and configuration stay. Continue?')) return;
    mutate('reset reservations', s => { s.reservations = s.reservations.filter(r => r.locked); });
    props.toast('Simulation reset — locked reservations kept', 'ok');
}

// ---------------------------------------------------------------------------
// Derived data
// ---------------------------------------------------------------------------
const range = computed(() => { void tick.value; return sc.value ? { from : sc.value.from, to : sc.value.to } : null; });
watch(tick, () => { loadMap.value = sc.value ? buildLoad(sc.value) : new Map(); });

const unitStats = computed(() => {
    void tick.value;
    const s = sc.value; if (!s) return {};
    const out = {};
    for (const u of s.units) out[u.code] = unitSummary(s, u.code, s.from, s.to, loadMap.value);
    return out;
});
const lineStats = computed(() => {
    void tick.value;
    const s = sc.value; if (!s) return {};
    const out = {};
    for (const l of s.lines) out[l.id] = lineSummary(s, l, s.from, s.to, loadMap.value);
    return out;
});
const conflictList = computed(() => { void tick.value; return sc.value ? conflicts(sc.value, loadMap.value) : []; });
const reconcileIssues = computed(() => { void tick.value; return sc.value ? reconcile(sc.value) : []; });

// filters
const fBuyer = ref('');
const fProduct = ref('');
const buyers = computed(() => { void tick.value; return [...new Set((sc.value?.orders || []).map(o => o.buyer).filter(Boolean))].sort(); });

// ---------------------------------------------------------------------------
// Bryntum scheduler
// ---------------------------------------------------------------------------
const schedRef = ref(null);
const getS = () => schedRef.value?.instance?.value || schedRef.value?.instance || null;
const viewMode = ref(localStorage.getItem('hl-view') || 'day');
const PRESETS = {
    day   : { base : 'dayAndWeek', tickWidth : 44, headers : [{ unit : 'week', dateFormat : 'DD/MM/YY' }, { unit : 'day', dateFormat : 'dd DD' }] },
    week  : { base : 'weekAndMonth', tickWidth : 110, headers : [{ unit : 'month', dateFormat : 'MMM YYYY' }, { unit : 'week', dateFormat : 'DD/MM' }] },
    month : { base : 'monthAndYear', tickWidth : 160, headers : [{ unit : 'year', dateFormat : 'YYYY' }, { unit : 'month', dateFormat : 'MMM YYYY' }] }
};
function setView(m) {
    viewMode.value = m;
    localStorage.setItem('hl-view', m);
    const s = getS();
    if (s) s.viewPreset = PRESETS[m];
}

const config = {
    minHeight     : 380,
    rowHeight     : 40,
    barMargin     : 5,
    eventStyle    : 'plain',
    viewPreset    : PRESETS[viewMode.value],
    startDate     : fromYmd(ymd(new Date())),
    endDate       : fromYmd(addDays(ymd(new Date()), 120)),
    workingTime   : null,
    zoomOnMouseWheel : false,
    createEventOnDblClick : false,
    enableEventAnimations : false,
    // Bryntum's Vue wrapper takes feature configs as <name>Feature props
    // (the plain features map too, for the first render before props apply)
    features                  : { tree : true },
    treeFeature               : true,
    eventDragFeature          : { showTooltip : true, constrainDragToResource : false },
    eventResizeFeature        : true,
    eventTooltipFeature       : { template : ({ eventRecord }) => tipHtml(eventRecord) },
    resourceTimeRangesFeature : true,
    eventMenuFeature          : false,
    scheduleMenuFeature       : false,
    cellMenuFeature           : false,
    headerMenuFeature         : false,
    timeAxisHeaderMenuFeature : false,
    eventEditFeature          : false,
    taskEditFeature           : false,
    dependenciesFeature       : false,
    percentBarFeature         : false,
    nonWorkingTimeFeature     : false,
    scheduleTooltipFeature    : false,
    timeRangesFeature         : { showCurrentTimeLine : true },
    columns : [
        { type : 'tree', field : 'name', text : 'Unit / Line', width : 210, htmlEncode : false, renderer : ({ record, value }) => record.data.isUnit
            ? `<b class="hl-unit-name">${StringHelper.encodeHtml(value)}</b><span class="hl-unit-sub">${StringHelper.encodeHtml(record.data.label || '')} · ${record.data.activeLines}/${record.data.lineCount} lines</span>`
            : `<span class="hl-line-name${record.data.active ? '' : ' hl-line-off'}">${StringHelper.encodeHtml(value)}</span><span class="hl-line-sub">${record.data.manpower} mp · ${record.data.eff}% · ${record.data.hoursLbl}</span>` },
        { field : 'capLbl',   text : 'Capacity', width : 78, align : 'right', tooltip : 'Available production hours in the planning range' },
        { field : 'resLbl',   text : 'Reserved', width : 78, align : 'right' },
        { field : 'availLbl', text : 'Available', width : 80, align : 'right' },
        { field : 'utilLbl',  text : 'Util', width : 60, align : 'right', htmlEncode : false, renderer : ({ record, value }) => `<span class="hl-util hl-util-${record.data.utilCls}">${value}</span>` }
    ],
    project : { resourceStore : { tree : true }, resources : [], events : [], resourceTimeRanges : [] },
    listeners : {
        beforeEventDrag({ eventRecord }) { return canWrite.value && !eventRecord.data.locked; },
        beforeEventResize({ eventRecord }) { return canWrite.value && !eventRecord.data.locked; },
        eventDrop({ eventRecords, context }) {
            if (!context?.valid) return;
            for (const ev of eventRecords) {
                const res = ev.resource;
                if (!res || res.data.isUnit) continue;
                onBarMoved(ev.id, res.id, ev.startDate, ev.endDate);
            }
        },
        eventResizeEnd({ eventRecord, changed }) { if (changed) onBarMoved(eventRecord.id, eventRecord.resourceId, eventRecord.startDate, eventRecord.endDate); },
        eventClick({ eventRecord }) { openReservation(eventRecord.id); }
    },
    eventRenderer({ eventRecord, renderData }) {
        const r = eventRecord.data;
        renderData.cls.add(`hl-res hl-res-${r.status || 'reserved'}`);
        if (r.locked) renderData.cls.add('hl-res-locked');
        if (r.conflict) renderData.cls.add('hl-res-conflict');
        if (r.late) renderData.cls.add('hl-res-late');
        if (r.source === 'live') renderData.cls.add('hl-res-live');
        return `<span class="hl-res-txt">${r.locked ? '🔒 ' : ''}${StringHelper.encodeHtml(r.name || '')} · ${fmtQty(r.qty)}</span>`;
    }
};

function tipHtml(ev) {
    const r = ev.data;
    const s = sc.value; if (!s) return '';
    const o = orderById(s, r.orderId);
    const line = lineById(s, r.lineId);
    const res = s.reservations.find(x => x.id === r.id);
    const rd = res ? reservationDays(s, res) : null;
    const rows = [
        ['Buyer', o?.buyer || '—'], ['Order / style', o ? `${o.style || ''}${o.note ? ` (${o.note})` : ''}` : (r.name || '—')],
        ['Product', r.product || o?.product || '—'], ['Quantity', `${fmtQty(r.qty)} pcs`],
        ['PCD', dmy(o?.pcd)], ['Delivery', dmy(o?.delivery)],
        ['Line', line ? `${unitOf(s, line.unitCode)?.name} · ${line.name}` : '—'],
        ['Span', `${dmy(res?.start)} → ${dmy(res?.end)} (${rd ? rd.days.length : 0} working days)`],
        ['Status', `${r.status}${r.locked ? ' · locked' : ''}${r.conflict ? ' · ⚠ overloaded day(s)' : ''}${r.late ? ' · after delivery' : ''}`]
    ];
    return `<div class="hl-tip"><b>${StringHelper.encodeHtml(r.name || '')}</b><table>${rows.map(([k, v]) => `<tr><td>${k}</td><td>${StringHelper.encodeHtml(String(v))}</td></tr>`).join('')}</table></div>`;
}

// scenario → scheduler stores
let syncing = false;
function syncScheduler() {
    const s = getS();
    const scn = sc.value;
    if (!s || !scn || syncing) return;
    syncing = true;
    try {
        const load = loadMap.value;
        const us = unitStats.value, ls = lineStats.value;
        const utilCls = u => (u > 1 ? 'over' : u >= (scn.thresholds?.full ?? 0.9) ? 'full' : u >= (scn.thresholds?.partial ?? 0.4) ? 'partial' : 'ok');
        const resources = scn.units.map(u => {
            const st = us[u.code] || {};
            return {
                id : `U-${u.code}`, name : u.name, label : u.label, isUnit : true, expanded : expandedUnits.has(u.code),
                activeLines : st.activeLines || 0, lineCount : st.lines || 0,
                capLbl : fmtMin(st.capMin), resLbl : fmtMin(st.usedMin), availLbl : fmtMin(st.availMin), utilLbl : fmtPct(st.util), utilCls : utilCls(st.util || 0),
                children : scn.lines.filter(l => l.unitCode === u.code).map(l => {
                    const t = ls[l.id] || {};
                    const unit = unitOf(scn, l.unitCode);
                    return {
                        id : l.id, name : l.name, isUnit : false, active : l.active, manpower : l.manpower, eff : l.eff,
                        hoursLbl : `${(l.hours ?? unit.hours)}h${(l.ot ?? unit.ot) ? `+${l.ot ?? unit.ot}` : ''}`,
                        capLbl : fmtMin(t.capMin), resLbl : fmtMin(t.usedMin), availLbl : fmtMin(t.availMin), utilLbl : fmtPct(t.util), utilCls : utilCls(t.util || 0)
                    };
                })
            };
        });
        const conflictRes = new Set(conflictList.value.flatMap(c => c.reservations));
        const events = scn.reservations.filter(r => r.status !== 'cancelled').filter(r => {
            const o = orderById(scn, r.orderId);
            if (fBuyer.value && (o?.buyer || '') !== fBuyer.value) return false;
            if (fProduct.value && (r.product || o?.product || '') !== fProduct.value) return false;
            return true;
        }).map(r => {
            const o = orderById(scn, r.orderId);
            return {
                id : r.id, resourceId : r.lineId, name : r.label || `${o?.buyer || ''} ${o?.style || ''}`.trim() || r.product || 'reservation',
                startDate : fromYmd(r.start), endDate : fromYmd(addDays(r.end, 1)),
                qty : r.qty, product : r.product || o?.product || '', status : r.status, locked : !!r.locked, orderId : r.orderId, lineId : r.lineId,
                conflict : conflictRes.has(r.id), late : !!(o?.delivery && r.end > o.delivery), source : r.source || null,
                draggable : !r.locked, resizable : !r.locked
            };
        });
        // per-day load heat on the unit rows (and overloaded days on lines)
        const ranges = [];
        for (let d = scn.from, g = 0; d <= scn.to && g < 400; d = addDays(d, 1), g++) {
            for (const u of scn.units) {
                const st = unitDayStatus(scn, u.code, d, load);
                ranges.push({ id : `d-${u.code}-${d}`, resourceId : `U-${u.code}`, startDate : fromYmd(d), endDate : fromYmd(addDays(d, 1)), cls : `hl-day hl-day-${st}`, name : '' });
            }
        }
        for (const l of scn.lines) {
            for (let d = scn.from, g = 0; d <= scn.to && g < 400; d = addDays(d, 1), g++) {
                const st = lineDayStatus(scn, l, d, load);
                if (st === 'overloaded' || st === 'holiday' || st === 'inactive') ranges.push({ id : `l-${l.id}-${d}`, resourceId : l.id, startDate : fromYmd(d), endDate : fromYmd(addDays(d, 1)), cls : `hl-day hl-day-${st}`, name : '' });
            }
        }
        s.suspendRefresh?.();
        s.resourceStore.data = resources;
        s.eventStore.data = events;
        s.resourceTimeRangeStore.data = ranges;
        s.resumeRefresh?.(true);
        // the axis covers the planning range
        const from = fromYmd(scn.from), to = fromYmd(addDays(scn.to, 1));
        if (+s.startDate !== +from || +s.endDate !== +to) s.setTimeSpan(from, to);
    }
    finally { syncing = false; }
}
const expandedUnits = new Set(JSON.parse(localStorage.getItem('hl-expanded') || '["M"]'));
watch([tick, fBuyer, fProduct], () => nextTick(syncScheduler));

function onBarMoved(resId, lineId, startDate, endDate) {
    const s = sc.value; if (!s) return;
    const r = s.reservations.find(x => x.id === resId);
    if (!r || r.locked) return;
    const line = lineById(s, lineId);
    if (!line) { tick.value++; return; }
    const o = orderById(s, r.orderId);
    const product = r.product || o?.product;
    if (!lineCompatible(s, line, product)) {
        props.toast(`${line.name} cannot make ${product || 'this product'} — reservation put back`, 'warn');
        tick.value++;
        return;
    }
    const start = ymd(startDate), end = addDays(ymd(endDate), -1);
    mutate(`move ${r.label || product}`, scn => {
        const x = scn.reservations.find(y => y.id === resId);
        x.lineId = lineId; x.start = start; x.end = end < start ? start : end;
    });
}

// ---------------------------------------------------------------------------
// Reservation popup
// ---------------------------------------------------------------------------
const resOpen = ref(false);
const resSel = ref(null);
const resRow = computed(() => { void tick.value; return sc.value?.reservations.find(r => r.id === resSel.value) || null; });
const resOrder = computed(() => resRow.value ? orderById(sc.value, resRow.value.orderId) : null);
const resLine = computed(() => resRow.value ? lineById(sc.value, resRow.value.lineId) : null);
const resDays = computed(() => resRow.value ? reservationDays(sc.value, resRow.value) : null);
const splitQty = ref(0);
const splitLine = ref('');
const moveUnit = ref('');
function openReservation(id) { resSel.value = id; splitQty.value = 0; splitLine.value = ''; moveUnit.value = ''; resOpen.value = true; }
function resToggleLock() { const r = resRow.value; if (!r) return; mutate(r.locked ? 'unlock' : 'lock', s => { const x = s.reservations.find(y => y.id === r.id); x.locked = !x.locked; }); }
function resCancel() {
    const r = resRow.value; if (!r) return;
    if (!window.confirm('Cancel this simulated reservation?')) return;
    mutate('cancel reservation', s => { s.reservations = s.reservations.filter(y => y.id !== r.id); });
    resOpen.value = false;
}
function resRefit() {
    const r = resRow.value; if (!r) return;
    const o = orderById(sc.value, r.orderId);
    const others = buildLoad({ ...sc.value, reservations : sc.value.reservations.filter(y => y.id !== r.id) });
    const end = endForQty(sc.value, r.lineId, r.product || o?.product, r.qty, r.start, others);
    mutate('re-fit end to capacity', s => { s.reservations.find(y => y.id === r.id).end = end; });
}
const splitTargets = computed(() => {
    const r = resRow.value; if (!r || !sc.value) return [];
    const o = orderById(sc.value, r.orderId);
    return sc.value.lines.filter(l => l.id !== r.lineId && l.active && lineCompatible(sc.value, l, r.product || o?.product))
        .map(l => ({ id : l.id, name : `${unitOf(sc.value, l.unitCode)?.name} · ${l.name}` }));
});
function resSplit() {
    const r = resRow.value; if (!r) return;
    const q = Math.floor(Number(splitQty.value) || 0);
    if (q <= 0 || q >= r.qty) { props.toast('Split quantity must be between 1 and the reservation quantity − 1', 'warn'); return; }
    if (!splitLine.value) { props.toast('Pick the line that takes the split quantity', 'warn'); return; }
    const o = orderById(sc.value, r.orderId);
    mutate(`split ${q}`, s => {
        const x = s.reservations.find(y => y.id === r.id);
        x.qty -= q;
        const load = buildLoad(s);
        const end = endForQty(s, splitLine.value, x.product || o?.product, q, x.start, load);
        s.reservations.push({ id : uid('rs'), orderId : x.orderId, lineId : splitLine.value, product : x.product, start : x.start, end, qty : q, locked : false, status : 'reserved', label : x.label });
    });
    props.toast(`${fmtQty(q)} pcs split onto another line`, 'ok');
}
function resMoveUnit() {
    const r = resRow.value; if (!r || !moveUnit.value) return;
    const o = orderById(sc.value, r.orderId);
    const product = r.product || o?.product;
    const others = buildLoad({ ...sc.value, reservations : sc.value.reservations.filter(y => y.id !== r.id) });
    const res = planOrder({ ...sc.value, reservations : sc.value.reservations.filter(y => y.id !== r.id) }, { id : r.orderId, product, qty : r.qty, pcd : r.start, delivery : o?.delivery, unitCode : moveUnit.value }, { unitCode : moveUnit.value, load : others, _noAlt : true });
    if (!res.allocations.length) { props.toast(`${unitOf(sc.value, moveUnit.value)?.name} has no compatible free capacity for this reservation`, 'warn'); return; }
    mutate(`move to ${moveUnit.value}`, s => {
        s.reservations = s.reservations.filter(y => y.id !== r.id);
        for (const a of res.allocations) s.reservations.push({ ...a, status : 'reserved', label : r.label, locked : false });
    });
    props.toast(`Moved to ${unitOf(sc.value, moveUnit.value)?.name}: ${fmtQty(res.feasible)} of ${fmtQty(r.qty)} pcs${res.shortage ? ` — ${fmtQty(res.shortage)} could not be placed` : ''}`, res.shortage ? 'warn' : 'ok');
    resOpen.value = false;
}

// ---------------------------------------------------------------------------
// Configuration dialog (units / lines / products / holidays / thresholds)
// ---------------------------------------------------------------------------
const cfgOpen = ref(false);
const cfgTab = ref('units');
const cfgUnit = ref('M');
const newProduct = ref({ name : '', smv : 20 });
const newHoliday = ref({ date : '', unitCode : '', label : '', kind : 'holiday' });
const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
function cfgLines() { return (sc.value?.lines || []).filter(l => l.unitCode === cfgUnit.value); }
function cfgChange(label = 'configuration') { mutate(label, () => { /* edited in place by v-model */ }); }
function toggleWorkDay(u, d) { mutate('working days', s => { const x = s.units.find(y => y.code === u.code); x.workDays = x.workDays.includes(d) ? x.workDays.filter(v => v !== d) : [...x.workDays, d].sort(); }); }

// ---- Units & calendar → Details: month-wise working days and hours -------
// The weekly pattern (Su…Sa) is only the template. Inside Details a month
// is set up day by day: which days work and how many hours each — stored
// in unit.dayHours (date → hours, 0 = off). A date with a figure beats the
// weekly pattern and the holidays; a month without figures follows them.
const mdUnit = ref('');                 // unit whose Details are open
const mdMonth = ref(ymd(new Date()).slice(0, 7));   // 'YYYY-MM'
const mdDays = ref(0);                  // "working days" input of the month
const mdHours = ref(null);              // "hours" input for every working day of the month
function mdToggle(code) {
    if (mdUnit.value === code) { mdUnit.value = ''; return; }
    mdUnit.value = code;
    const from = sc.value?.from || ymd(new Date());
    const today = ymd(new Date());
    mdMonth.value = (today > from ? today : from).slice(0, 7);
    mdSyncInputs();
}
const mdUnitObj = computed(() => { void tick.value; return unitOf(sc.value, mdUnit.value); });
const DOW_FULL = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const mdLabel = computed(() => { const [y, m] = mdMonth.value.split('-').map(Number); return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month : 'long', year : 'numeric' }); });
function mdShift(n) { const [y, m] = mdMonth.value.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); mdMonth.value = ymd(d).slice(0, 7); mdSyncInputs(); }
// every day of the month with its effective state (explicit figure or the
// pattern / holiday) so the grid shows what the simulation will use
const mdGrid = computed(() => {
    void tick.value;
    const s = sc.value, u = mdUnitObj.value;
    if (!s || !u) return [];
    const [y, m] = mdMonth.value.split('-').map(Number);
    const days = new Date(y, m, 0).getDate();
    const out = [];
    for (let i = 1; i <= days; i++) {
        const date = `${mdMonth.value}-${String(i).padStart(2, '0')}`;
        const dow = new Date(y, m - 1, i).getDay();
        const explicit = u.dayHours?.[date];
        const hasExplicit = explicit != null && explicit !== '';
        const hol = holidayOn(s, u.code, date);
        const working = isWorkDay(s, u.code, date);
        const hours = hasExplicit ? Number(explicit) : (working ? Number(u.hours) || 0 : 0);
        out.push({ date, day : i, dow, dowLbl : DOW_FULL[dow], working, hours, explicit : hasExplicit, holiday : hol?.label || null, inRange : date >= s.from && date <= s.to });
    }
    return out;
});
const mdWorkingCount = computed(() => mdGrid.value.filter(d => d.working).length);
const mdMonthHours = computed(() => mdGrid.value.reduce((a, d) => a + (d.working ? d.hours : 0), 0));
function mdSyncInputs() { mdDays.value = mdWorkingCount.value; mdHours.value = null; }
function mdSetDay(date, working, hours) {
    mutate(`month setup ${date}`, s => {
        const u = s.units.find(x => x.code === mdUnit.value);
        u.dayHours = { ...(u.dayHours || {}), [date] : working ? (Number(hours) > 0 ? Number(hours) : Number(u.hours) || 0) : 0 };
    });
}
function mdToggleDay(d) { mdSetDay(d.date, !d.working, d.hours || mdUnitObj.value?.hours); }
function mdDayHours(d, v) { const h = Number(v); if (!(h >= 0)) return; mdSetDay(d.date, h > 0, h); }
// "Working days" input: the first N days of the month by the weekly pattern
// work (the holidays are skipped first), the rest are off — every day of the
// month gets an explicit figure so the month is fully defined
function mdApplyDays() {
    const n = Math.max(0, Math.min(31, Math.round(Number(mdDays.value) || 0)));
    const u = mdUnitObj.value; if (!u) return;
    const s = sc.value;
    const grid = mdGrid.value;
    const hours = Number(mdHours.value) > 0 ? Number(mdHours.value) : null;
    // candidates: pattern days first (not holiday), then the other days
    const pattern = grid.filter(d => u.workDays.includes(d.dow) && !holidayOn(s, u.code, d.date));
    const rest = grid.filter(d => !pattern.includes(d));
    const chosen = new Set([...pattern, ...rest].slice(0, n).map(d => d.date));
    mutate(`month ${mdMonth.value}: ${n} working days`, scn => {
        const x = scn.units.find(y => y.code === mdUnit.value);
        const o = { ...(x.dayHours || {}) };
        for (const d of grid) o[d.date] = chosen.has(d.date) ? (hours || (d.explicit && d.hours > 0 ? d.hours : Number(x.hours) || 0)) : 0;
        x.dayHours = o;
    });
}
// "Hours" input: every working day of the month gets these hours
function mdApplyHours() {
    const h = Number(mdHours.value);
    if (!(h > 0)) { props.toast('Give the hours per working day', 'warn'); return; }
    mutate(`month ${mdMonth.value}: ${h} h`, scn => {
        const x = scn.units.find(y => y.code === mdUnit.value);
        const o = { ...(x.dayHours || {}) };
        for (const d of mdGrid.value) o[d.date] = d.working ? h : 0;
        x.dayHours = o;
    });
}
// back to the weekly pattern for this month (explicit figures removed)
function mdClearMonth() {
    mutate(`month ${mdMonth.value}: pattern`, scn => {
        const x = scn.units.find(y => y.code === mdUnit.value);
        const o = { ...(x.dayHours || {}) };
        for (const k of Object.keys(o)) if (k.startsWith(mdMonth.value)) delete o[k];
        x.dayHours = o;
    });
    mdSyncInputs();
}
const mdMonthsSet = computed(() => { void tick.value; const u = mdUnitObj.value; const set = new Set(); for (const k of Object.keys(u?.dayHours || {})) set.add(k.slice(0, 7)); return [...set].sort(); });

function addLine() { mutate('add line', s => { const n = s.lines.filter(l => l.unitCode === cfgUnit.value).length + 1; s.lines.push(newLine(s, cfgUnit.value, `Line ${String(n).padStart(2, '0')}`)); }); }
function addLines(n) { mutate(`add ${n} lines`, s => { let k = s.lines.filter(l => l.unitCode === cfgUnit.value).length; for (let i = 0; i < n; i++) s.lines.push(newLine(s, cfgUnit.value, `Line ${String(++k).padStart(2, '0')}`)); }); }
function removeLine(id) {
    if (sc.value.reservations.some(r => r.lineId === id) && !window.confirm('This line carries reservations — remove them too?')) return;
    mutate('remove line', s => { s.lines = s.lines.filter(l => l.id !== id); s.reservations = s.reservations.filter(r => r.lineId !== id); });
}
function addProduct() {
    const n = newProduct.value.name.trim();
    if (!n) return;
    if (sc.value.products.some(p => p.name.toLowerCase() === n.toLowerCase())) { props.toast('That product exists already', 'warn'); return; }
    mutate('add product', s => { s.products.push({ name : n, smv : Number(newProduct.value.smv) || 20 }); for (const l of s.lines) if (l.products[n] == null) l.products[n] = Number(newProduct.value.smv) || 20; });
    newProduct.value = { name : '', smv : 20 };
}
function removeProduct(name) { mutate('remove product', s => { s.products = s.products.filter(p => p.name !== name); for (const l of s.lines) delete l.products[name]; }); }

// ---- Lines tab: hours follow the unit's month setup, SMV follows the ERP ---
// A line without its own hours uses the unit's figure of each day (month
// setup) — the Lines tab shows the unit's average hours per working day as
// the value the line follows. The unit's order-average SMV (ERP active
// orders, quantity-weighted) is the line's SMV; the product-wise detail
// shows (and lets you edit) the SMV per product type that the lines use.
const erpSmv = shallowRef(null);          // { from, takenAt, rows } | { error }
async function loadErpSmv() {
    try { erpSmv.value = await hlErpSmv(by()); }
    catch (e) { erpSmv.value = { error : e.message, rows : [] }; }
}
const erpSmvByUnit = computed(() => {
    const out = {};
    for (const u of HL_UNITS) out[u.code] = { products : [], qty : 0, orders : 0, smvQty : 0, qtyWithSmv : 0, avgSmv : null };
    for (const r of erpSmv.value?.rows || []) {
        const code = HL_UNITS.find(u => u.liveUnitId === Number(r.unitId))?.code;
        if (!code) continue;
        const g = out[code];
        g.products.push(r);
        g.qty += r.qty; g.orders += r.orders;
        if (r.avgSmv != null) { g.smvQty += r.avgSmv * r.qtyWithSmv; g.qtyWithSmv += r.qtyWithSmv; }
    }
    for (const g of Object.values(out)) { g.avgSmv = g.qtyWithSmv > 0 ? Math.round(g.smvQty / g.qtyWithSmv * 100) / 100 : null; g.products.sort((a, b) => b.qty - a.qty); }
    return out;
});
// the unit's average SMV: the planner's own figure → the ERP order mix → the scenario products
function unitAvgSmv(code) {
    void tick.value;
    const u = unitOf(sc.value, code);
    if (u && Number(u.avgSmv) > 0) return Number(u.avgSmv);
    const e = erpSmvByUnit.value[code]?.avgSmv;
    if (e > 0) return e;
    const list = sc.value?.products || [];
    const avg = list.reduce((a, x) => a + (Number(x.smv) || 0), 0) / (list.length || 1);
    return avg > 0 ? Math.round(avg * 100) / 100 : 20;
}
const unitSmvSource = code => (Number(unitOf(sc.value, code)?.avgSmv) > 0 ? 'own' : (erpSmvByUnit.value[code]?.avgSmv > 0 ? 'ERP order mix' : 'products'));
function setUnitAvgSmv(code, v) { mutate('unit average SMV', s => { s.units.find(x => x.code === code).avgSmv = v === '' || v == null ? null : Number(v); }); }
// capacity of a line in pieces at the unit's average SMV
const lineCapPcs = l => { void tick.value; const st = lineStats.value[l.id]; const smv = unitAvgSmv(l.unitCode); return st && smv > 0 ? Math.round(st.capMin / smv) : 0; };

// product-wise detail of the unit on the Lines tab
const lpOpen = ref(false);
const lpProd = ref('');
const lpOrders = shallowRef(null);
const lpBusy = ref(false);
const lpRows = computed(() => {
    void tick.value;
    const code = cfgUnit.value;
    if (!code || !sc.value) return [];
    const lines = sc.value.lines.filter(l => l.unitCode === code && l.active);
    const erpRows = erpSmvByUnit.value[code]?.products || [];
    const names = new Set([...erpRows.map(r => r.product), ...sc.value.products.map(p => p.name)]);
    return [...names].map(name => {
        const e = erpRows.find(r => r.product === name);
        const p = sc.value.products.find(x => x.name.toLowerCase() === name.toLowerCase());
        const lineSmvs = lines.map(l => Number(l.products?.[p?.name || name])).filter(v => v > 0);
        const simSmv = lineSmvs.length ? Math.round(lineSmvs.reduce((a, b) => a + b, 0) / lineSmvs.length * 100) / 100 : null;
        return { name, inScenario : !!p, orders : e?.orders || 0, qty : e?.qty || 0, erpSmv : e?.avgSmv ?? null, simSmv, lines : lineSmvs.length, total : lines.length };
    }).sort((a, b) => b.qty - a.qty);
});
// SMV of a product on this unit's lines (a product new to the scenario is added to every line)
function setUnitProductSmv(code, name, v) {
    const smv = Number(v);
    if (!(smv > 0)) return;
    mutate(`SMV ${name}`, s => {
        let p = s.products.find(x => x.name.toLowerCase() === name.toLowerCase());
        if (!p) { p = { name, smv }; s.products.push(p); for (const l of s.lines) if (l.products[name] == null) l.products[name] = smv; }
        for (const l of s.lines) if (l.unitCode === code) l.products[p.name] = smv;
    });
}
function lpToggleMake(code, name, on) {
    mutate(`${name} on ${code}`, s => {
        let p = s.products.find(x => x.name.toLowerCase() === name.toLowerCase());
        if (!p) { p = { name, smv : 20 }; s.products.push(p); }
        for (const l of s.lines) if (l.unitCode === code) { if (on) l.products[p.name] = l.products[p.name] || (erpSmvByUnit.value[code]?.products.find(r => r.product === name)?.avgSmv) || p.smv || 20; else delete l.products[p.name]; }
    });
}
function useErpSmvAll(code) { for (const r of lpRows.value) if (r.erpSmv > 0 && r.lines) setUnitProductSmv(code, r.name, r.erpSmv); }
async function lpShowOrders(code, name) {
    const unit = HL_UNITS.find(u => u.code === code);
    lpProd.value = name; lpOrders.value = null; lpBusy.value = true;
    try { lpOrders.value = await hlErpSmvOrders(by(), unit.liveUnitId, name); }
    catch (e) { lpOrders.value = { error : e.message, rows : [] }; }
    finally { lpBusy.value = false; }
}
function setLineProduct(line, product, on) { mutate('line product', s => { const l = s.lines.find(x => x.id === line.id); if (on) l.products[product] = l.products[product] || s.products.find(p => p.name === product)?.smv || 20; else delete l.products[product]; }); }
function addHoliday() {
    const h = newHoliday.value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(h.date || '')) { props.toast('Pick a date', 'warn'); return; }
    mutate('holiday', s => { s.holidays.push({ date : h.date, unitCode : h.unitCode || null, label : h.label || (h.kind === 'shutdown' ? 'Factory shutdown' : 'Holiday'), kind : h.kind }); s.holidays.sort((a, b) => a.date.localeCompare(b.date)); });
    newHoliday.value = { date : '', unitCode : '', label : '', kind : 'holiday' };
}
function removeHoliday(i) { mutate('remove holiday', s => { s.holidays.splice(i, 1); }); }

// ---------------------------------------------------------------------------
// Orders & capacity test
// ---------------------------------------------------------------------------
const ordOpen = ref(false);
const ordForm = ref(blankOrder());
const testResult = shallowRef(null);
const ordSel = ref(null);
function blankOrder() { return { id : null, buyer : '', style : '', product : '', qty : 0, pcd : ymd(new Date()), delivery : addDays(ymd(new Date()), 30), unitCode : 'M', note : '' }; }
function ordEdit(o) { ordForm.value = { ...o }; testResult.value = null; ordSel.value = o.id; }
function ordNew() { ordForm.value = blankOrder(); testResult.value = null; ordSel.value = null; }
function ordValid() {
    const f = ordForm.value;
    if (!f.product) { props.toast('Pick a product', 'warn'); return false; }
    if (!(Number(f.qty) > 0)) { props.toast('Order quantity must be above 0', 'warn'); return false; }
    if (!f.pcd || !f.delivery) { props.toast('PCD and delivery date are needed', 'warn'); return false; }
    if (f.delivery < f.pcd) { props.toast('Delivery is before PCD', 'warn'); return false; }
    return true;
}
function ordSave() {
    if (!ordValid()) return;
    const f = { ...ordForm.value, qty : Math.round(Number(ordForm.value.qty)) };
    mutate(f.id ? 'edit order' : 'add order', s => {
        if (f.id) { const i = s.orders.findIndex(o => o.id === f.id); if (i >= 0) s.orders[i] = f; }
        else { f.id = uid('or'); s.orders.push(f); }
    });
    ordForm.value = { ...f }; ordSel.value = f.id;
    props.toast(`Order ${f.buyer} ${f.style} saved to the scenario`, 'ok');
}
function ordRemove(o) {
    if (!window.confirm(`Remove order ${o.buyer} ${o.style} and its reservations from the scenario?`)) return;
    mutate('remove order', s => { s.orders = s.orders.filter(x => x.id !== o.id); s.reservations = s.reservations.filter(r => r.orderId !== o.id); });
    if (ordSel.value === o.id) ordNew();
}
function ordTest() {
    if (!ordValid()) return;
    const f = { ...ordForm.value, id : ordForm.value.id || 'test', qty : Math.round(Number(ordForm.value.qty)) };
    const others = buildLoad({ ...sc.value, reservations : sc.value.reservations.filter(r => r.orderId !== f.id) });
    testResult.value = { ...planOrder(sc.value, f, { unitCode : f.unitCode, load : others }), order : f };
}
function ordReserve() {
    const t = testResult.value;
    if (!t || !t.allocations.length) { props.toast('Nothing to reserve — test the capacity first', 'warn'); return; }
    if (!ordForm.value.id) ordSave();
    const oid = ordForm.value.id;
    mutate('reserve capacity', s => {
        s.reservations = s.reservations.filter(r => r.orderId !== oid);
        for (const a of t.allocations) s.reservations.push({ ...a, orderId : oid, status : 'reserved', label : `${ordForm.value.buyer} ${ordForm.value.style}`.trim() });
    });
    props.toast(`${fmtQty(t.feasible)} pcs reserved on ${t.allocations.length} line(s)${t.shortage ? ` — ${fmtQty(t.shortage)} pcs short` : ''} (simulation only)`, t.shortage ? 'warn' : 'ok');
    testResult.value = null;
}
const orderRows = computed(() => { void tick.value; return (sc.value?.orders || []).map(o => {
    const rs = sc.value.reservations.filter(r => r.orderId === o.id && r.status !== 'cancelled');
    const reserved = rs.reduce((a, r) => a + (Number(r.qty) || 0), 0);
    return { ...o, reserved, open : Math.max(0, o.qty - reserved), lines : rs.length, finish : rs.reduce((m, r) => (!m || r.end > m ? r.end : m), null) };
}); });

// ---------------------------------------------------------------------------
// Auto planning
// ---------------------------------------------------------------------------
const apOpen = ref(false);
const apResults = shallowRef([]);
function runAutoPlan() {
    if (!sc.value) return;
    const open = orderRows.value.filter(o => o.open > 0);
    if (!open.length) { props.toast('Every order in the scenario is already reserved — add orders first', 'warn'); return; }
    apResults.value = autoPlan(sc.value, open.map(o => o.id));
    apOpen.value = true;
}
function apApply() {
    const rs = apResults.value;
    if (!rs.length) return;
    mutate('auto planning', s => {
        for (const r of rs) {
            s.reservations = s.reservations.filter(x => x.orderId !== r.order.id);
            for (const a of r.allocations) s.reservations.push({ ...a, status : 'reserved', label : `${r.order.buyer} ${r.order.style}`.trim() });
        }
    });
    const placed = rs.reduce((a, r) => a + r.feasible, 0), short = rs.reduce((a, r) => a + r.shortage, 0);
    props.toast(`Auto planning applied to the scenario: ${fmtQty(placed)} pcs reserved${short ? `, ${fmtQty(short)} pcs short` : ''} — Save to keep`, short ? 'warn' : 'ok');
    apOpen.value = false;
}

// ---------------------------------------------------------------------------
// Import reference data (one way: live board → this scenario)
// ---------------------------------------------------------------------------
const impOpen = ref(false);
const impData = shallowRef(null);
const impOpt = ref({ lines : true, products : true, orders : true, load : true });
async function impFetch() {
    if (!canWrite.value) return denied();
    busy.value = true;
    try { impData.value = await hlReference(sc.value.from, sc.value.to, by()); impOpen.value = true; }
    catch (e) { props.toast(`Reference snapshot failed: ${e.message}`, 'error'); }
    finally { busy.value = false; }
}
function impApply() {
    const d = impData.value; if (!d || !sc.value) return;
    const o = impOpt.value;
    mutate('import reference data', s => {
        const lineByLive = new Map();
        if (o.lines) {
            for (const u of s.units) {
                const unitInfo = HL_UNITS.find(x => x.code === u.code);
                const live = d.lines.filter(l => Number(l.unitId) === unitInfo.liveUnitId);
                if (!live.length) continue;
                s.reservations = s.reservations.filter(r => !s.lines.some(l => l.id === r.lineId && l.unitCode === u.code));
                s.lines = s.lines.filter(l => l.unitCode !== u.code);
                for (const l of live) {
                    const nl = newLine(s, u.code, l.name || l.code, { manpower : l.manpower || 40, eff : l.eff || 60, hours : l.hours || null, active : !!l.active });
                    s.lines.push(nl);
                    lineByLive.set(l.liveId, nl.id);
                }
            }
        }
        if (o.products) {
            for (const p of d.products) {
                if (!s.products.some(x => x.name === p.name)) {
                    s.products.push({ name : p.name, smv : p.smv || 20 });
                    for (const l of s.lines) l.products[p.name] = p.smv || 20;
                }
            }
        }
        const orderByCode = new Map();
        if (o.orders) {
            for (const r of d.orders) {
                let ex = s.orders.find(x => x.source === `live:${r.code}`);
                const unitCode = HL_UNITS.find(x => x.liveUnitId === Number(r.unitId))?.code || '';
                if (ex) Object.assign(ex, { buyer : r.buyer, style : r.style, product : r.product, qty : r.qty, pcd : r.pcd, delivery : r.delivery, unitCode });
                else { ex = { id : uid('or'), buyer : r.buyer || '', style : r.style || '', product : r.product || '', qty : r.qty, pcd : r.pcd, delivery : r.delivery, unitCode, note : r.code, source : `live:${r.code}` }; s.orders.push(ex); }
                orderByCode.set(r.code, ex.id);
                if (ex.product && !s.products.some(p => p.name === ex.product)) { s.products.push({ name : ex.product, smv : 20 }); for (const l of s.lines) l.products[ex.product] = 20; }
            }
        }
        if (o.load && o.lines) {
            s.reservations = s.reservations.filter(r => r.source !== 'live');
            for (const e of d.load) {
                const lid = lineByLive.get(e.lineLiveId);
                if (!lid || !e.start || !e.end) continue;
                s.reservations.push({ id : uid('rs'), orderId : orderByCode.get(e.order) || null, lineId : lid, product : e.product || null, start : e.start, end : e.end < e.start ? e.start : e.end, qty : e.qty, locked : true, status : 'reserved', label : `${e.buyer || ''} ${e.style || e.order || ''}`.trim(), source : 'live' });
            }
        }
        s.source = { note : `Live board snapshot (${d.from} → ${d.to || 'open'}) by ${by()}`, at : d.takenAt };
    });
    impOpen.value = false;
    props.toast(`Reference snapshot ${impData.value.takenAt} imported into "${sc.value.name}" — simulation only, nothing flows back`, 'ok');
}

// ---------------------------------------------------------------------------
// ERP order load (read only): active mr_order_entry orders delivered from
// the plan cut-off on, by production unit and product type — the demand each
// unit faces, next to the simulated capacity on its card
// ---------------------------------------------------------------------------
const erpLoad = shallowRef(null);     // { from, takenAt, rows }
async function loadErpLoad() {
    try { erpLoad.value = await hlErpLoad(by()); }
    catch (e) { erpLoad.value = { error : e.message, rows : [] }; }
}
const erpByUnit = computed(() => {
    const out = {};
    const rows = erpLoad.value?.rows || [];
    for (const u of HL_UNITS) out[u.code] = { products : [], qty : 0, orders : 0 };
    out.other = { products : [], qty : 0, orders : 0, name : 'Other units' };
    for (const r of rows) {
        const code = HL_UNITS.find(u => u.liveUnitId === Number(r.unitId))?.code || 'other';
        const g = out[code];
        g.products.push({ product : r.product, qty : r.qty, orders : r.orders });
        g.qty += r.qty; g.orders += r.orders;
    }
    for (const g of Object.values(out)) g.products.sort((a, b) => b.qty - a.qty);
    return out;
});
const erpGrand = computed(() => (erpLoad.value?.rows || []).reduce((a, r) => ({ qty : a.qty + r.qty, orders : a.orders + r.orders }), { qty : 0, orders : 0 }));

// ---------------------------------------------------------------------------
// Scenario compare
// ---------------------------------------------------------------------------
const cmpOpen = ref(false);
const cmpId = ref('');
const cmpData = shallowRef(null);
async function cmpRun() {
    if (!cmpId.value) return;
    try {
        const other = (await hlLoadScenario(cmpId.value, by())).scenario;
        const load = buildLoad(other);
        const rows = other.units.map(u => ({ code : u.code, name : u.name, a : unitStats.value[u.code], b : unitSummary(other, u.code, other.from, other.to, load) }));
        cmpData.value = { other, rows };
    }
    catch (e) { props.toast(`Compare failed: ${e.message}`, 'error'); }
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------
function onKey(e) {
    if (e.target?.matches?.('input, textarea, select')) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
}
onMounted(async () => {
    document.addEventListener('keydown', onKey);
    await refreshScenarios();
    loadErpLoad();
    loadErpSmv();
    const remembered = localStorage.getItem('hl-scenario');
    const first = scenarios.value.find(s => s.id === remembered)?.id || scenarios.value[0]?.id;
    if (first) await openScenario(first);
    nextTick(() => {
        const s = getS();
        if (s) {
            s.resourceStore.on('toggleNode', ({ record, collapse }) => { const code = String(record.id).replace('U-', ''); if (collapse) expandedUnits.delete(code); else expandedUnits.add(code); localStorage.setItem('hl-expanded', JSON.stringify([...expandedUnits])); });
            syncScheduler();
        }
    });
});
onBeforeUnmount(() => document.removeEventListener('keydown', onKey));
function close() {
    if (dirty.value && !window.confirm('Unsaved simulation changes will be lost — close the board anyway?')) return;
    emit('close');
}
</script>

<template>
    <div class="hl-root">
        <div class="hl-banner">
            <span class="hl-banner-title">📐 High Level Planning Board <span class="hl-banner-sub">— standalone simulation · the live MBM / CEIL / AQL plans are never changed</span></span>
            <span v-if="!canWrite" class="hl-banner-ro">🔒 read only</span>
            <span v-if="sc" class="hl-banner-sc">Scenario: <b>{{ sc.name }}</b> <span class="hl-dim">v{{ sc.version }}{{ dirty ? ' · unsaved' : '' }}{{ sc.source ? ` · ${sc.source.note} @ ${sc.source.at}` : '' }}</span></span>
            <span class="hl-banner-btns"><span class="hl-x" title="Close the High Level Planning Board" @click="close">✕</span></span>
        </div>

        <div class="hl-toolbar">
            <label class="hl-lbl">Scenario
                <select class="cal-in hl-sel" :value="sc?.id || ''" :disabled="busy" @change="openScenario($event.target.value)">
                    <option v-for="s in scenarios" :key="s.id" :value="s.id">{{ s.name }} · {{ s.orders }} orders · {{ s.reservations }} res · {{ s.updatedAt }}</option>
                </select>
            </label>
            <button class="cal-btn st-btn hl-btn" :disabled="busy" title="New blank scenario" @click="createScenario()">➕ New</button>
            <button class="cal-btn st-btn hl-btn" :disabled="busy || !sc" title="Duplicate the open scenario" @click="createScenario(sc.id)">📄 Duplicate</button>
            <button class="cal-btn st-btn hl-btn" :disabled="!sc" @click="renameScenario">✏️ Rename</button>
            <button class="cal-btn st-btn hl-btn" :disabled="!sc" @click="cmpOpen = true">⚖ Compare</button>
            <button class="cal-btn st-btn hl-btn hl-danger" :disabled="!sc" @click="deleteScenario">🗑 Delete</button>
            <span class="hl-sep"></span>
            <button class="cal-btn st-btn hl-btn" :disabled="!sc" @click="cfgOpen = true">⚙️ Configure units &amp; lines</button>
            <button class="cal-btn st-btn hl-btn" :disabled="!sc" @click="ordOpen = true">📦 Orders &amp; capacity test</button>
            <button class="cal-btn st-btn hl-btn hl-primary" :disabled="!sc" @click="runAutoPlan">🤖 Test Auto Planning</button>
            <button class="cal-btn st-btn hl-btn" :disabled="!sc || busy" @click="impFetch">⬇ Import Planning Reference Data</button>
            <button class="cal-btn st-btn hl-btn" :disabled="!sc" @click="resetSimulation">♻ Reset simulation</button>
            <span class="hl-sep"></span>
            <button class="cal-btn st-btn hl-btn" :disabled="!undoDepth" title="Undo (Ctrl+Z)" @click="undo">↶</button>
            <button class="cal-btn st-btn hl-btn" :disabled="!redoDepth" title="Redo (Ctrl+Y)" @click="redo">↷</button>
            <button class="cal-btn cal-btn-primary st-btn hl-btn" :disabled="!sc || !dirty || busy" @click="saveScenario">💾 Save scenario</button>
        </div>

        <div class="hl-toolbar hl-toolbar2">
            <span class="hl-views">
                <button class="cal-btn st-btn hl-btn" :class="{ 'hl-on' : viewMode === 'day' }" @click="setView('day')">Daily</button>
                <button class="cal-btn st-btn hl-btn" :class="{ 'hl-on' : viewMode === 'week' }" @click="setView('week')">Weekly</button>
                <button class="cal-btn st-btn hl-btn" :class="{ 'hl-on' : viewMode === 'month' }" @click="setView('month')">Monthly</button>
            </span>
            <label class="hl-lbl">Buyer <select v-model="fBuyer" class="cal-in hl-sel-s"><option value="">all</option><option v-for="b in buyers" :key="b" :value="b">{{ b }}</option></select></label>
            <label class="hl-lbl">Product <select v-model="fProduct" class="cal-in hl-sel-s"><option value="">all</option><option v-for="p in (sc?.products || [])" :key="p.name" :value="p.name">{{ p.name }}</option></select></label>
            <template v-if="sc">
                <label class="hl-lbl">Range <input type="date" class="cal-in hl-date" :value="sc.from" @change="mutate('range', s => { s.from = $event.target.value; })"> → <input type="date" class="cal-in hl-date" :value="sc.to" @change="mutate('range', s => { s.to = $event.target.value; })"></label>
            </template>
            <span class="hl-legend">
                <i class="hl-lg hl-day-idle"></i>idle <i class="hl-lg hl-day-available"></i>available <i class="hl-lg hl-day-partial"></i>partial <i class="hl-lg hl-day-full"></i>full <i class="hl-lg hl-day-overloaded"></i>overloaded <i class="hl-lg hl-day-holiday"></i>holiday <i class="hl-lg hl-day-off"></i>off day <i class="hl-lg hl-day-inactive"></i>inactive
                <i class="hl-lg hl-lg-res"></i>reservation <i class="hl-lg hl-lg-live"></i>live load (snapshot) <i class="hl-lg hl-lg-conf"></i>conflict <i class="hl-lg hl-lg-late"></i>after delivery
            </span>
            <span v-if="conflictList.length" class="hl-warn">⚠ {{ conflictList.length }} overloaded line-day(s)</span>
            <span v-if="reconcileIssues.length" class="hl-warn">⚠ {{ reconcileIssues.length }} reservation(s) do not reconcile</span>
        </div>

        <div v-if="sc" class="hl-units">
            <div v-for="u in sc.units" :key="u.code" class="hl-unit-card" :class="`hl-uc-${(unitStats[u.code]?.util || 0) > 1 ? 'over' : (unitStats[u.code]?.util || 0) >= (sc.thresholds.full || 0.9) ? 'full' : (unitStats[u.code]?.util || 0) >= (sc.thresholds.partial || 0.4) ? 'partial' : 'ok'}`">
                <div class="hl-uc-head"><b>{{ u.name }}</b> <span class="hl-dim">{{ u.label }} · {{ unitStats[u.code]?.activeLines }}/{{ unitStats[u.code]?.lines }} lines · {{ u.hours }}h{{ u.ot ? `+${u.ot}` : '' }}</span></div>
                <div class="hl-uc-row"><span>Capacity</span><b>{{ fmtMin(unitStats[u.code]?.capMin) }}</b><span>Reserved</span><b>{{ fmtMin(unitStats[u.code]?.usedMin) }}</b><span>Available</span><b>{{ fmtMin(unitStats[u.code]?.availMin) }}</b><span>Util</span><b>{{ fmtPct(unitStats[u.code]?.util) }}</b><span>Overloaded days</span><b>{{ unitStats[u.code]?.overDays }}</b><span>Idle</span><b>{{ fmtMin(unitStats[u.code]?.idleMin) }}</b></div>
                <div class="hl-uc-prod"><span v-for="(v, p) in unitStats[u.code]?.products || {}" :key="p" :title="`${v.lines} line(s) can make it`">{{ p }}: <b>{{ fmtQty(v.pcsPerDay) }}</b>/day</span></div>
                <div v-if="erpLoad" class="hl-uc-erp" :title="`ERP mr_order_entry: order_status Active, delivery from ${dmy(erpLoad.from)} on, production unit ${u.label} — order quantity by product type (snapshot ${erpLoad.takenAt || ''})`">
                    <span class="hl-uc-erp-t">ERP active orders · delivery after {{ dmy(addDays(erpLoad.from || '', -1)) }}:</span>
                    <span v-for="p in erpByUnit[u.code].products" :key="p.product">{{ p.product }} <b>{{ fmtQty(p.qty) }}</b> <i class="hl-dim">({{ p.orders }})</i></span>
                    <span class="hl-uc-erp-total">Unit total <b>{{ fmtQty(erpByUnit[u.code].qty) }}</b> pcs · {{ erpByUnit[u.code].orders }} orders</span>
                </div>
            </div>
        </div>
        <div v-if="erpLoad && (erpByUnit.other.qty || erpLoad.error)" class="hl-erp-other">
            <template v-if="erpLoad.error">ERP order load not available: {{ erpLoad.error }}</template>
            <template v-else>Other production units (not on this board): <span v-for="p in erpByUnit.other.products" :key="p.product">{{ p.product }} <b>{{ fmtQty(p.qty) }}</b> </span> · total <b>{{ fmtQty(erpByUnit.other.qty) }}</b> pcs · all units together <b>{{ fmtQty(erpGrand.qty) }}</b> pcs / {{ erpGrand.orders }} active orders</template>
        </div>

        <div class="hl-sched-wrap" :class="{ 'hl-busy' : busy }">
            <bryntum-scheduler-pro ref="schedRef" v-bind="config" class="hl-sched" />
            <div v-if="!sc && !busy" class="hl-empty">No scenario yet — click <b>➕ New</b> to start a simulation.</div>
        </div>

        <!-- Reservation detail -->
        <div v-if="resOpen && resRow" class="cal-overlay" @click.self="resOpen = false">
            <div class="cal-dialog pf-dialog hl-dialog hl-res-dialog">
                <div class="cal-title">📌 Simulated reservation <span class="cal-title-btns"><span class="cal-x" @click="resOpen = false">✕</span></span></div>
                <div class="st-body">
                    <table class="hl-kv">
                        <tr><td>Buyer / order</td><td>{{ resOrder?.buyer || '—' }} · {{ resOrder?.style || resRow.label || '—' }} {{ resOrder?.note ? `(${resOrder.note})` : '' }}</td></tr>
                        <tr><td>Product</td><td>{{ resRow.product || resOrder?.product || '—' }}</td></tr>
                        <tr><td>Quantity</td><td>{{ fmtQty(resRow.qty) }} pcs</td></tr>
                        <tr><td>PCD / delivery</td><td>{{ dmy(resOrder?.pcd) }} / {{ dmy(resOrder?.delivery) }}</td></tr>
                        <tr><td>Line</td><td>{{ unitOf(sc, resLine?.unitCode)?.name }} · {{ resLine?.name }}</td></tr>
                        <tr><td>Span</td><td>{{ dmy(resRow.start) }} → {{ dmy(resRow.end) }} · {{ resDays?.days.length }} working day(s) · SMV {{ resDays?.smv }}</td></tr>
                        <tr><td>Status</td><td>{{ resRow.status }}{{ resRow.locked ? ' · 🔒 locked' : '' }}{{ resRow.source === 'live' ? ' · live load snapshot' : '' }}</td></tr>
                    </table>
                    <div class="hl-daytable"><span v-for="d in resDays?.days || []" :key="d.date" :class="{ 'hl-dover' : isOver(usedMinutes(loadMap, resRow.lineId, d.date), lineDayMinutes(sc, resLine, d.date)) }">{{ dmy(d.date) }}: <b>{{ fmtQty(d.pcs) }}</b></span></div>
                    <div class="hl-actions">
                        <button class="cal-btn st-btn hl-btn" @click="resToggleLock">{{ resRow.locked ? '🔓 Unlock' : '🔒 Lock' }}</button>
                        <button class="cal-btn st-btn hl-btn" :disabled="resRow.locked" title="End = when the line's free capacity finishes the quantity from the start" @click="resRefit">📏 Re-fit end to capacity</button>
                        <button class="cal-btn st-btn hl-btn hl-danger" :disabled="resRow.locked" @click="resCancel">✖ Cancel reservation</button>
                    </div>
                    <div class="hl-actions hl-split">
                        <span>Split</span><input v-model="splitQty" type="number" class="cal-in hl-num" min="1"><span>pcs to</span>
                        <select v-model="splitLine" class="cal-in hl-sel-s"><option value="">line…</option><option v-for="l in splitTargets" :key="l.id" :value="l.id">{{ l.name }}</option></select>
                        <button class="cal-btn st-btn hl-btn" :disabled="resRow.locked" @click="resSplit">✂ Split</button>
                        <span class="hl-gap"></span>
                        <span>Move to</span><select v-model="moveUnit" class="cal-in hl-sel-s"><option value="">unit…</option><option v-for="u in sc.units.filter(x => x.code !== resLine?.unitCode)" :key="u.code" :value="u.code">{{ u.name }}</option></select>
                        <button class="cal-btn st-btn hl-btn" :disabled="resRow.locked || !moveUnit" @click="resMoveUnit">➡ Move</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Configuration -->
        <div v-if="cfgOpen && sc" class="cal-overlay" @click.self="cfgOpen = false">
            <div class="cal-dialog pf-dialog hl-dialog hl-cfg-dialog">
                <div class="cal-title">⚙️ Simulation configuration — {{ sc.name }} <span class="cal-title-btns"><span class="cal-x" @click="cfgOpen = false">✕</span></span></div>
                <div class="st-body">
                    <div class="hl-tabs">
                        <button v-for="t in [['units','Units & calendar'],['lines','Lines'],['products','Products'],['holidays','Holidays & shutdowns'],['thresholds','Thresholds']]" :key="t[0]" class="cal-btn st-btn hl-btn" :class="{ 'hl-on' : cfgTab === t[0] }" @click="cfgTab = t[0]">{{ t[1] }}</button>
                    </div>
                    <div v-if="cfgTab === 'units'" class="hl-cfg-units">
                        <table class="hl-table">
                            <thead><tr><th>Unit</th><th>Label</th><th>Hours / day</th><th>OT / day</th><th title="Working days of the unit inside the plan range — month setups, holidays and the weekly pattern together">Working days<br><i class="hl-dim">{{ dmy(sc.from) }} → {{ dmy(sc.to) }}</i></th><th>Lines (active)</th><th></th></tr></thead>
                            <tbody>
                                <template v-for="u in sc.units" :key="u.code">
                                <tr :class="{ 'hl-sel' : mdUnit === u.code }">
                                    <td><b>{{ u.name }}</b></td><td>{{ u.label }}</td>
                                    <td><input v-model.number="u.hours" type="number" step="0.5" min="0" max="24" class="cal-in hl-num" @change="cfgChange('unit hours')"></td>
                                    <td><input v-model.number="u.ot" type="number" step="0.5" min="0" max="12" class="cal-in hl-num" @change="cfgChange('unit OT')"></td>
                                    <td class="hl-r"><b>{{ unitStats[u.code]?.workDays }}</b> <i class="hl-dim">days · {{ Object.keys(u.dayHours || {}).length ? `${[...new Set(Object.keys(u.dayHours).map(k => k.slice(0, 7)))].length} month(s) set up` : 'weekly pattern' }}</i></td>
                                    <td>{{ unitStats[u.code]?.lines }} ({{ unitStats[u.code]?.activeLines }})</td>
                                    <td><button class="cal-btn st-btn hl-btn" :class="{ 'hl-on' : mdUnit === u.code }" title="Month-wise working days and hours of this unit" @click="mdToggle(u.code)">📅 Details</button></td>
                                </tr>
                                <tr v-if="mdUnit === u.code" class="hl-detail-row"><td colspan="7">
                                    <div class="hl-md-head">
                                        <span class="hl-md-nav"><button class="cal-btn st-btn hl-btn" @click="mdShift(-1)">‹</button><b>{{ mdLabel }}</b><button class="cal-btn st-btn hl-btn" @click="mdShift(1)">›</button></span>
                                        <label class="hl-lbl">Working days <input v-model.number="mdDays" type="number" min="0" max="31" class="cal-in hl-num"> <button class="cal-btn st-btn hl-btn" title="The first N days by the weekly pattern work (holidays skipped), the rest are off" @click="mdApplyDays">Apply</button></label>
                                        <label class="hl-lbl">Hours / day <input v-model.number="mdHours" type="number" step="0.5" min="0" max="24" class="cal-in hl-num" :placeholder="String(u.hours)"> <button class="cal-btn st-btn hl-btn" title="Every working day of this month gets these hours" @click="mdApplyHours">Apply</button></label>
                                        <span class="hl-dim">this month: <b>{{ mdWorkingCount }}</b> working days · <b>{{ fmtQty(Math.round(mdMonthHours)) }}</b> h per line</span>
                                        <button class="cal-btn st-btn hl-btn" title="Remove this month's figures — the weekly pattern and holidays apply again" @click="mdClearMonth">↺ Weekly pattern</button>
                                    </div>
                                    <div class="hl-md-grid">
                                        <div v-for="d in DOW_FULL" :key="d" class="hl-md-dow">{{ d }}</div>
                                        <div v-for="i in ((mdGrid[0]?.dow) || 0)" :key="'pad' + i" class="hl-md-pad"></div>
                                        <div v-for="d in mdGrid" :key="d.date" class="hl-md-day" :class="{ 'hl-md-on' : d.working, 'hl-md-off' : !d.working, 'hl-md-explicit' : d.explicit, 'hl-md-out' : !d.inRange, 'hl-md-hol' : d.holiday }" :title="`${dmy(d.date)} ${d.dowLbl} · ${d.working ? d.hours + ' h' : 'off'}${d.holiday ? ' · ' + d.holiday : ''}${d.explicit ? ' · set for this date' : ' · weekly pattern'}${d.inRange ? '' : ' · outside the plan range'}`">
                                            <span class="hl-md-num" @click="mdToggleDay(d)">{{ d.day }}</span>
                                            <input v-if="d.working" :value="d.hours" type="number" step="0.5" min="0" max="24" class="hl-md-hrs" @change="mdDayHours(d, $event.target.value)">
                                            <span v-else class="hl-md-offlbl" @click="mdToggleDay(d)">off</span>
                                        </div>
                                    </div>
                                    <div class="hl-md-foot">
                                        <span class="hl-dim">Click a day number to switch it on / off · type the hours of a working day · <i class="hl-md-key hl-md-on"></i> working · <i class="hl-md-key hl-md-off"></i> off · a thick border = set for that date (beats the weekly pattern Su–Sa and the holidays)</span>
                                        <span v-if="mdMonthsSet.length" class="hl-dim">Months set up: {{ mdMonthsSet.map(m => m.slice(5) + '/' + m.slice(2, 4)).join(', ') }}</span>
                                        <label class="hl-lbl hl-md-pattern">Weekly pattern <label v-for="(dw, i) in DOW" :key="i" class="hl-dow"><input type="checkbox" :checked="u.workDays.includes(i)" @change="toggleWorkDay(u, i)">{{ dw }}</label></label>
                                    </div>
                                </td></tr>
                                </template>
                            </tbody>
                        </table>
                        <div class="st-hint">Hours / OT of the unit are the default for every working day (a line can have its own figure on the Lines tab). <b>📅 Details</b> = month-wise setup: type the working days of the month and the hours per day, or click the days one by one — those figures beat the weekly pattern, the holidays and the line hours for that date. A month without figures follows the weekly pattern and the Holidays tab. A holiday without a unit applies to all four.</div>
                    </div>
                    <div v-else-if="cfgTab === 'lines'">
                        <div class="hl-actions">
                            <label class="hl-lbl">Unit <select v-model="cfgUnit" class="cal-in hl-sel-s"><option v-for="u in sc.units" :key="u.code" :value="u.code">{{ u.name }}</option></select></label>
                            <button class="cal-btn st-btn hl-btn" @click="addLine">➕ Add line</button>
                            <button class="cal-btn st-btn hl-btn" @click="addLines(5)">➕ Add 5 lines</button>
                        </div>
                        <div class="hl-scroll">
                            <div class="hl-lines-unit">
                                <span>Unit hours: <b>{{ unitStats[cfgUnit]?.avgHours }}</b> h/day avg over <b>{{ unitStats[cfgUnit]?.workDays }}</b> working days <i class="hl-dim">(Units & calendar month setup — a line follows it unless it has its own figure)</i></span>
                                <span class="hl-gap"></span>
                                <label class="hl-lbl">Unit avg SMV <input :value="unitOf(sc, cfgUnit)?.avgSmv ?? ''" type="number" step="0.01" min="0.1" class="cal-in hl-num" :placeholder="String(unitAvgSmv(cfgUnit))" :title="unitSmvSource(cfgUnit) === 'own' ? 'Your own figure — clear it to follow the ERP order mix' : 'ERP order-mix average (active orders, delivery after the cut-off) — type a figure to override'" @change="setUnitAvgSmv(cfgUnit, $event.target.value)"> <i class="hl-dim">{{ unitSmvSource(cfgUnit) }}</i></label>
                                <button class="cal-btn st-btn hl-btn" :class="{ 'hl-on' : lpOpen }" title="Product-wise average SMV of this unit's orders and the SMV the lines use" @click="lpOpen = !lpOpen">📋 Product-wise SMV</button>
                            </div>
                            <div v-if="lpOpen" class="hl-lp-box">
                                <div class="hl-detail-head"><b>{{ unitOf(sc, cfgUnit)?.name }} · {{ unitOf(sc, cfgUnit)?.label }}</b> — ERP active orders (delivery after {{ dmy(addDays(erpSmv?.from || sc.from, -1)) }}) by product type · unit average <b>{{ unitAvgSmv(cfgUnit) }}</b>
                                    <button class="cal-btn st-btn hl-btn" title="Copy every ERP product average SMV into this unit's lines" @click="useErpSmvAll(cfgUnit)">⬇ Use ERP SMVs on the lines</button>
                                    <span v-if="erpSmv?.error" class="hl-warn">ERP not available: {{ erpSmv.error }}</span>
                                </div>
                                <table class="hl-table hl-table-s">
                                    <thead><tr><th>Product type</th><th>Orders</th><th>Order qty</th><th title="Quantity-weighted average SMV of the styles in ERP">ERP avg SMV</th><th title="SMV this unit's lines use for the product — edit to set every line of the unit">Line SMV</th><th title="Can this unit's lines make it?">Lines make it</th><th></th></tr></thead>
                                    <tbody>
                                        <tr v-for="r in lpRows" :key="r.name" :class="{ 'hl-sel' : lpProd === r.name }">
                                            <td><a class="hl-link" @click="lpShowOrders(cfgUnit, r.name)">{{ r.name }}</a></td>
                                            <td class="hl-r">{{ r.orders ? fmtQty(r.orders) : '—' }}</td>
                                            <td class="hl-r">{{ r.qty ? fmtQty(r.qty) : '—' }}</td>
                                            <td class="hl-r">{{ r.erpSmv ?? '—' }}</td>
                                            <td><input :value="r.simSmv ?? ''" :disabled="!r.lines" type="number" step="0.1" min="0.1" class="cal-in hl-num" @change="setUnitProductSmv(cfgUnit, r.name, $event.target.value)"></td>
                                            <td><label><input type="checkbox" :checked="r.lines > 0" @change="lpToggleMake(cfgUnit, r.name, $event.target.checked)"> {{ r.lines }}/{{ r.total }}</label></td>
                                            <td><button v-if="r.erpSmv > 0 && r.lines && r.erpSmv !== r.simSmv" class="cal-btn st-btn hl-btn" title="Use the ERP average SMV on this unit's lines" @click="setUnitProductSmv(cfgUnit, r.name, r.erpSmv)">⬇ ERP</button></td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div v-if="lpProd" class="hl-orders-box">
                                    <div class="hl-detail-head"><b>{{ lpProd }}</b> — orders with their own SMV {{ lpBusy ? '· loading…' : '' }} <span class="hl-x-small" @click="lpProd = ''">✖</span></div>
                                    <div v-if="lpOrders?.error" class="hl-warn">{{ lpOrders.error }}</div>
                                    <div v-else-if="lpOrders" class="hl-scroll hl-orders-scroll">
                                        <table class="hl-table hl-table-s">
                                            <thead><tr><th>Order</th><th>Buyer</th><th>Style</th><th>Garment</th><th>Qty</th><th>PCD</th><th>Delivery</th><th>SMV</th></tr></thead>
                                            <tbody>
                                                <tr v-for="o in lpOrders.rows" :key="o.order"><td>{{ o.order }}</td><td>{{ o.buyer }}</td><td>{{ o.style }}</td><td>{{ o.garment }}</td><td class="hl-r">{{ fmtQty(o.qty) }}</td><td>{{ dmy(o.pcd) }}</td><td>{{ dmy(o.delivery) }}</td><td class="hl-r" :class="{ 'hl-warn' : !(o.smv > 0) }">{{ o.smv > 0 ? o.smv : 'no SMV' }}</td></tr>
                                                <tr v-if="!lpOrders.rows.length"><td colspan="8" class="hl-dim">No active orders</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <table class="hl-table">
                                <thead><tr><th>Line</th><th>Active</th><th>Manpower</th><th title="Hours per working day — follows the unit's month setup unless the line has its own figure">Hours</th><th>OT</th><th>Eff %</th><th title="The unit's order-average SMV (ERP) — click Product-wise SMV for the detail">Avg SMV</th><th title="Line SAH in the plan range = Σ working days manpower × hours × efficiency (standard hours) · per working day in the tooltip of the cell">Line SAH</th><th title="Line SAH × 60 ÷ average SMV = pieces the line can make in the plan range">Capacity pcs</th><th></th></tr></thead>
                                <tbody>
                                    <tr v-for="l in cfgLines()" :key="l.id">
                                        <td><input v-model="l.name" class="cal-in hl-txt" @change="cfgChange('line name')"></td>
                                        <td><input v-model="l.active" type="checkbox" @change="cfgChange('line active')"></td>
                                        <td><input v-model.number="l.manpower" type="number" min="0" class="cal-in hl-num" @change="cfgChange('manpower')"></td>
                                        <td><input v-model="l.hours" type="number" step="0.5" min="0" class="cal-in hl-num" :placeholder="String(unitStats[cfgUnit]?.avgHours ?? '')" :title="l.hours == null || l.hours === '' ? `Follows the unit: ${unitStats[cfgUnit]?.avgHours} h/day average (month setup) — type a figure for this line only` : 'This line\'s own hours — clear to follow the unit'" @change="cfgChange('line hours')"></td>
                                        <td><input v-model="l.ot" type="number" step="0.5" min="0" class="cal-in hl-num" placeholder="unit" @change="cfgChange('line OT')"></td>
                                        <td><input v-model.number="l.eff" type="number" min="0" max="150" class="cal-in hl-num" @change="cfgChange('efficiency')"></td>
                                        <td class="hl-r"><a class="hl-link" :title="`Unit average SMV (${unitSmvSource(l.unitCode)}) — click for the product-wise detail`" @click="lpOpen = true">{{ unitAvgSmv(l.unitCode) }}</a></td>
                                        <td class="hl-r" :title="`${fmtQty(Math.round((lineStats[l.id]?.capMin || 0) / 60))} SAH over ${lineStats[l.id]?.workDays || 0} working days · ${lineStats[l.id]?.workDays ? fmtQty(Math.round((lineStats[l.id].capMin / 60) / lineStats[l.id].workDays * 10) / 10) : 0} SAH per day`"><b>{{ fmtQty(Math.round((lineStats[l.id]?.capMin || 0) / 60)) }}</b> <i class="hl-dim">({{ lineStats[l.id]?.workDays ? fmtQty(Math.round((lineStats[l.id].capMin / 60) / lineStats[l.id].workDays * 10) / 10) : 0 }}/day)</i></td>
                                        <td class="hl-r" :title="`${fmtQty(lineCapPcs(l))} pcs over the range · ${lineStats[l.id]?.workDays ? fmtQty(Math.round(lineCapPcs(l) / lineStats[l.id].workDays)) : 0} pcs per day at SMV ${unitAvgSmv(l.unitCode)}`"><b>{{ fmtQty(lineCapPcs(l)) }}</b> <i class="hl-dim">({{ lineStats[l.id]?.workDays ? fmtQty(Math.round(lineCapPcs(l) / lineStats[l.id].workDays)) : 0 }}/day)</i></td>
                                        <td><span class="hl-x-small" title="Remove line" @click="removeLine(l.id)">✖</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="st-hint">Hours: a line follows the unit's month setup (Units & calendar → Details) day by day; the figure shown is the unit's average per working day. Type hours on a line only when that line differs. Avg SMV: the unit's ERP order-average SMV (or your own figure above) — product-wise SMVs and which products the unit's lines make are under <b>📋 Product-wise SMV</b>; the simulation plans each order with the SMV of its product type on the line.</div>
                    </div>
                    <div v-else-if="cfgTab === 'products'">
                        <table class="hl-table hl-table-s">
                            <thead><tr><th>Product</th><th>Default SMV</th><th>Lines that can make it</th><th></th></tr></thead>
                            <tbody>
                                <tr v-for="p in sc.products" :key="p.name">
                                    <td>{{ p.name }}</td>
                                    <td><input v-model.number="p.smv" type="number" step="0.1" min="0.1" class="cal-in hl-num" @change="cfgChange('product SMV')"></td>
                                    <td>{{ sc.lines.filter(l => l.products[p.name] != null).length }} / {{ sc.lines.length }}</td>
                                    <td><span class="hl-x-small" @click="removeProduct(p.name)">✖</span></td>
                                </tr>
                                <tr><td><input v-model="newProduct.name" class="cal-in hl-txt" placeholder="new product"></td><td><input v-model.number="newProduct.smv" type="number" step="0.1" class="cal-in hl-num"></td><td colspan="2"><button class="cal-btn st-btn hl-btn" @click="addProduct">➕ Add product</button></td></tr>
                            </tbody>
                        </table>
                        <div class="st-hint">A new product is added to every line with its default SMV — untick it on the Lines tab where a line cannot make it.</div>
                    </div>
                    <div v-else-if="cfgTab === 'holidays'">
                        <div class="hl-actions">
                            <input v-model="newHoliday.date" type="date" class="cal-in hl-date">
                            <select v-model="newHoliday.unitCode" class="cal-in hl-sel-s"><option value="">all units</option><option v-for="u in sc.units" :key="u.code" :value="u.code">{{ u.name }}</option></select>
                            <select v-model="newHoliday.kind" class="cal-in hl-sel-s"><option value="holiday">Holiday</option><option value="shutdown">Factory shutdown</option></select>
                            <input v-model="newHoliday.label" class="cal-in hl-txt" placeholder="label">
                            <button class="cal-btn st-btn hl-btn" @click="addHoliday">➕ Add</button>
                        </div>
                        <table class="hl-table hl-table-s">
                            <thead><tr><th>Date</th><th>Unit</th><th>Kind</th><th>Label</th><th></th></tr></thead>
                            <tbody>
                                <tr v-for="(h, i) in sc.holidays" :key="i"><td>{{ dmy(h.date) }}</td><td>{{ h.unitCode ? unitOf(sc, h.unitCode)?.name : 'all units' }}</td><td>{{ h.kind }}</td><td>{{ h.label }}</td><td><span class="hl-x-small" @click="removeHoliday(i)">✖</span></td></tr>
                                <tr v-if="!sc.holidays.length"><td colspan="5" class="hl-dim">No special holidays — only the weekly off days apply.</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-else-if="cfgTab === 'thresholds'">
                        <table class="hl-table hl-table-s">
                            <tr><td>Partially loaded from</td><td><input v-model.number="sc.thresholds.partial" type="number" step="0.05" min="0" max="1" class="cal-in hl-num" @change="cfgChange('thresholds')"> (fraction of available minutes)</td></tr>
                            <tr><td>Fully loaded from</td><td><input v-model.number="sc.thresholds.full" type="number" step="0.05" min="0" max="1" class="cal-in hl-num" @change="cfgChange('thresholds')"></td></tr>
                            <tr><td>Overloaded</td><td>reserved minutes above the available minutes of the day</td></tr>
                        </table>
                    </div>
                    <div class="hl-actions hl-right"><button class="cal-btn st-btn hl-btn" @click="cfgOpen = false">Close</button></div>
                </div>
            </div>
        </div>

        <!-- Orders & capacity test -->
        <div v-if="ordOpen && sc" class="cal-overlay" @click.self="ordOpen = false">
            <div class="cal-dialog pf-dialog hl-dialog hl-ord-dialog">
                <div class="cal-title">📦 Orders &amp; capacity test — {{ sc.name }} <span class="cal-title-btns"><span class="cal-x" @click="ordOpen = false">✕</span></span></div>
                <div class="st-body hl-ord-body">
                    <div class="hl-ord-left">
                        <div class="hl-scroll hl-ord-scroll">
                            <table class="hl-table hl-table-s">
                                <thead><tr><th>Buyer</th><th>Style / order</th><th>Product</th><th>Qty</th><th>PCD</th><th>Delivery</th><th>Unit</th><th>Reserved</th><th>Finish</th><th></th></tr></thead>
                                <tbody>
                                    <tr v-for="o in orderRows" :key="o.id" :class="{ 'hl-sel' : o.id === ordSel }" @click="ordEdit(o)">
                                        <td>{{ o.buyer }}</td><td>{{ o.style }}<span v-if="o.note" class="hl-dim"> {{ o.note }}</span></td><td>{{ o.product }}</td><td class="hl-r">{{ fmtQty(o.qty) }}</td><td>{{ dmy(o.pcd) }}</td><td>{{ dmy(o.delivery) }}</td><td>{{ o.unitCode || '—' }}</td>
                                        <td class="hl-r" :class="{ 'hl-short' : o.open > 0 && o.reserved > 0, 'hl-ok' : o.open === 0 }">{{ fmtQty(o.reserved) }}<span v-if="o.lines"> / {{ o.lines }} ln</span></td>
                                        <td :class="{ 'hl-late' : o.finish && o.finish > o.delivery }">{{ dmy(o.finish) }}</td>
                                        <td><span class="hl-x-small" @click.stop="ordRemove(o)">✖</span></td>
                                    </tr>
                                    <tr v-if="!orderRows.length"><td colspan="10" class="hl-dim">No orders in this scenario — add one on the right, or import reference data.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="hl-ord-right">
                        <div class="hl-form">
                            <label>Buyer <input v-model="ordForm.buyer" class="cal-in" list="hl-buyers"><datalist id="hl-buyers"><option v-for="b in buyers" :key="b" :value="b"></option></datalist></label>
                            <label>Style / order <input v-model="ordForm.style" class="cal-in"></label>
                            <label>Product <select v-model="ordForm.product" class="cal-in"><option value="">—</option><option v-for="p in sc.products" :key="p.name" :value="p.name">{{ p.name }}</option></select></label>
                            <label>Quantity <input v-model.number="ordForm.qty" type="number" min="1" class="cal-in"></label>
                            <label>PCD <input v-model="ordForm.pcd" type="date" class="cal-in"></label>
                            <label>Delivery <input v-model="ordForm.delivery" type="date" class="cal-in"></label>
                            <label>Target unit <select v-model="ordForm.unitCode" class="cal-in"><option v-for="u in sc.units" :key="u.code" :value="u.code">{{ u.name }}</option></select></label>
                            <label>Note <input v-model="ordForm.note" class="cal-in"></label>
                        </div>
                        <div class="hl-actions">
                            <button class="cal-btn st-btn hl-btn" @click="ordNew">➕ New order</button>
                            <button class="cal-btn st-btn hl-btn" @click="ordSave">💾 {{ ordForm.id ? 'Update order' : 'Add to scenario' }}</button>
                            <button class="cal-btn cal-btn-primary st-btn hl-btn" @click="ordTest">🔍 Check capacity</button>
                            <button class="cal-btn st-btn hl-btn hl-primary" :disabled="!testResult || !testResult.allocations.length" @click="ordReserve">📌 Reserve simulated capacity</button>
                        </div>
                        <div v-if="testResult" class="hl-result" :class="testResult.shortage ? 'hl-result-short' : 'hl-result-ok'">
                            <div class="hl-result-head">{{ unitOf(sc, testResult.unitCode)?.name }}: <b>{{ fmtQty(testResult.feasible) }}</b> of {{ fmtQty(testResult.qty) }} pcs feasible by {{ dmy(testResult.order.delivery) }}
                                <span v-if="testResult.shortage"> · shortage <b>{{ fmtQty(testResult.shortage) }}</b></span></div>
                            <div class="hl-result-row">Required production days: <b>{{ testResult.requiredDays }}</b> · expected completion: <b>{{ dmy(testResult.completion) }}</b> · lines used: <b>{{ testResult.allocations.length }}</b> of {{ testResult.linesConsidered }} compatible{{ testResult.lateBy ? ` · ${testResult.lateBy} day(s) after delivery` : '' }}</div>
                            <table class="hl-table hl-table-s"><thead><tr><th>Line</th><th>From</th><th>To</th><th>Qty</th></tr></thead><tbody>
                                <tr v-for="a in testResult.allocations" :key="a.id"><td>{{ lineById(sc, a.lineId)?.name }}</td><td>{{ dmy(a.start) }}</td><td>{{ dmy(a.end) }}</td><td class="hl-r">{{ fmtQty(a.qty) }}</td></tr>
                            </tbody></table>
                            <div class="hl-result-row">Other units with the same order:
                                <span v-for="(alt, code) in testResult.alternatives" :key="code" class="hl-alt" :class="{ 'hl-alt-ok' : alt.feasible >= testResult.qty }">{{ unitOf(sc, code)?.name }}: {{ fmtQty(alt.feasible) }} pcs{{ alt.completion ? ` by ${dmy(alt.completion)}` : '' }}</span>
                            </div>
                        </div>
                        <div class="st-hint">Capacity = manpower × (hours + OT) × 60 × efficiency ÷ product SMV of the line, per working day, minus what the scenario's reservations already take. Only lines ticked for the product are considered. Nothing here touches the live plan.</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Auto planning result -->
        <div v-if="apOpen && sc" class="cal-overlay" @click.self="apOpen = false">
            <div class="cal-dialog pf-dialog hl-dialog">
                <div class="cal-title">🤖 Test Auto Planning — proposal (not saved yet) <span class="cal-title-btns"><span class="cal-x" @click="apOpen = false">✕</span></span></div>
                <div class="st-body">
                    <table class="hl-table hl-table-s">
                        <thead><tr><th>Order</th><th>Product</th><th>Qty</th><th>Delivery</th><th>Unit</th><th>Feasible</th><th>Shortage</th><th>Lines</th><th>Completion</th><th>Alternatives</th></tr></thead>
                        <tbody>
                            <tr v-for="r in apResults" :key="r.order.id" :class="{ 'hl-short' : r.shortage }">
                                <td>{{ r.order.buyer }} {{ r.order.style }}</td><td>{{ r.order.product }}</td><td class="hl-r">{{ fmtQty(r.qty) }}</td><td>{{ dmy(r.order.delivery) }}</td><td>{{ unitOf(sc, r.unitCode)?.name }}</td>
                                <td class="hl-r">{{ fmtQty(r.feasible) }}</td><td class="hl-r">{{ r.shortage ? fmtQty(r.shortage) : '—' }}</td>
                                <td>{{ r.allocations.map(a => lineById(sc, a.lineId)?.name).join(', ') || '—' }}</td>
                                <td :class="{ 'hl-late' : r.lateBy }">{{ dmy(r.completion) }}{{ r.lateBy ? ` (+${r.lateBy}d)` : '' }}</td>
                                <td class="hl-dim">{{ Object.entries(r.alternatives || {}).map(([c, a]) => `${c}: ${fmtQty(a.feasible)}`).join(' · ') }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="hl-result-row">Total: <b>{{ fmtQty(apResults.reduce((a, r) => a + r.feasible, 0)) }}</b> pcs placeable · shortage <b>{{ fmtQty(apResults.reduce((a, r) => a + r.shortage, 0)) }}</b> pcs · existing simulated reservations were deducted first; holidays and off days excluded; only compatible lines used.</div>
                    <div class="hl-actions hl-right">
                        <button class="cal-btn st-btn hl-btn" @click="apOpen = false">Discard</button>
                        <button class="cal-btn cal-btn-primary st-btn hl-btn" @click="apApply">📌 Save proposal into the scenario</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Import reference data -->
        <div v-if="impOpen && impData" class="cal-overlay" @click.self="impOpen = false">
            <div class="cal-dialog pf-dialog hl-dialog">
                <div class="cal-title">⬇ Import Planning Reference Data — snapshot {{ impData.takenAt }} <span class="cal-title-btns"><span class="cal-x" @click="impOpen = false">✕</span></span></div>
                <div class="st-body">
                    <div class="hl-result-row">Source: live planning board (read only) · window {{ dmy(impData.from) }} → {{ impData.to ? dmy(impData.to) : 'open' }} · one way into <b>{{ sc.name }}</b>; nothing ever flows back.</div>
                    <table class="hl-table hl-table-s">
                        <tr><td><label><input v-model="impOpt.lines" type="checkbox"> Sewing lines</label></td><td>{{ impData.lines.length }} lines (manpower, efficiency, hours, active) — replaces this scenario's lines of each live unit</td></tr>
                        <tr><td><label><input v-model="impOpt.products" type="checkbox"> Product types</label></td><td>{{ impData.products.length }} types from the live order list (with their average SMV)</td></tr>
                        <tr><td><label><input v-model="impOpt.orders" type="checkbox"> Orders</label></td><td>{{ impData.orders.length }} orders in the window (code, buyer, style, product, qty, PCD, delivery, production unit)</td></tr>
                        <tr><td><label><input v-model="impOpt.load" type="checkbox"> Existing planning load</label></td><td>{{ impData.load.length }} live bars become LOCKED reservations (needs lines)</td></tr>
                    </table>
                    <div class="hl-actions hl-right">
                        <button class="cal-btn st-btn hl-btn" @click="impOpen = false">Cancel</button>
                        <button class="cal-btn cal-btn-primary st-btn hl-btn" @click="impApply">Import into scenario</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Compare scenarios -->
        <div v-if="cmpOpen && sc" class="cal-overlay" @click.self="cmpOpen = false">
            <div class="cal-dialog pf-dialog hl-dialog">
                <div class="cal-title">⚖ Compare scenarios <span class="cal-title-btns"><span class="cal-x" @click="cmpOpen = false">✕</span></span></div>
                <div class="st-body">
                    <div class="hl-actions"><b>{{ sc.name }}</b> vs <select v-model="cmpId" class="cal-in hl-sel"><option value="">scenario…</option><option v-for="s in scenarios.filter(x => x.id !== sc.id)" :key="s.id" :value="s.id">{{ s.name }}</option></select><button class="cal-btn st-btn hl-btn" :disabled="!cmpId" @click="cmpRun">Compare</button></div>
                    <table v-if="cmpData" class="hl-table hl-table-s">
                        <thead><tr><th>Unit</th><th>Capacity</th><th>Reserved</th><th>Available</th><th>Util</th><th>Overloaded days</th><th>Active lines</th></tr></thead>
                        <tbody>
                            <tr v-for="r in cmpData.rows" :key="r.code">
                                <td><b>{{ r.name }}</b></td>
                                <td>{{ fmtMin(r.a?.capMin) }} → {{ fmtMin(r.b.capMin) }}</td><td>{{ fmtMin(r.a?.usedMin) }} → {{ fmtMin(r.b.usedMin) }}</td><td>{{ fmtMin(r.a?.availMin) }} → {{ fmtMin(r.b.availMin) }}</td>
                                <td>{{ fmtPct(r.a?.util) }} → {{ fmtPct(r.b.util) }}</td><td>{{ r.a?.overDays }} → {{ r.b.overDays }}</td><td>{{ r.a?.activeLines }} → {{ r.b.activeLines }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.hl-root { display : flex; flex-direction : column; height : calc(100vh - 44px); background : #eceff3; font-family : Tahoma, Arial, sans-serif; font-size : 12.5px; }
.hl-banner { display : flex; align-items : center; gap : 14px; padding : 5px 12px; background : #1f3a5f; color : #fff; }
.hl-banner-title { font-weight : 700; }
.hl-banner-sub { font-weight : 400; opacity : .85; font-size : 12px; }
.hl-banner-sc { margin-left : auto; }
.hl-banner-ro { background : #ffe082; color : #5a3a00; padding : 1px 8px; border-radius : 10px; font-weight : 700; font-size : 11.5px; }
.hl-banner-btns .hl-x { cursor : pointer; font-weight : 700; padding : 0 6px; }
.hl-dim { opacity : .7; font-weight : 400; }
.hl-toolbar { display : flex; align-items : center; gap : 6px; flex-wrap : wrap; padding : 6px 10px; background : #f6f7f9; border-bottom : 1px solid #d5dbe3; }
.hl-toolbar2 { background : #fbfbfc; }
.hl-lbl { display : inline-flex; align-items : center; gap : 6px; font-weight : 600; }
.hl-sel { min-width : 320px; }
.hl-sel-s { min-width : 120px; }
.hl-date { width : 130px; }
.hl-root .hl-btn, .cal-overlay .hl-btn { width : auto; flex : 0 0 auto; display : inline-flex; align-items : center; gap : 4px; padding : 4px 10px; margin : 0; }
.hl-root .hl-btn.hl-on { background : #cfe0ff; box-shadow : inset 0 0 0 1px #1b52ad; color : #1b52ad; }
.hl-root .hl-btn.hl-primary, .cal-overlay .hl-btn.hl-primary { background : #1e5fb8; color : #fff; border-color : #174a90; }
.hl-root .hl-btn.hl-danger, .cal-overlay .hl-btn.hl-danger { color : #b00020; }
.hl-root .cal-in, .hl-root .hl-sel { width : auto; }
.hl-sep { width : 1px; height : 22px; background : #cfd6df; margin : 0 4px; }
.hl-views { display : inline-flex; gap : 2px; }
.hl-legend { display : inline-flex; align-items : center; gap : 4px; flex-wrap : wrap; margin-left : auto; font-size : 11.5px; color : #333; }
.hl-lg { display : inline-block; width : 14px; height : 10px; border : 1px solid #889; margin-left : 6px; border-radius : 2px; }
.hl-lg-res { background : #4f7fcf; } .hl-lg-live { background : #7a7a7a; } .hl-lg-conf { background : #d32f2f; } .hl-lg-late { background : #ff9800; }
.hl-warn { color : #b00020; font-weight : 700; margin-left : 8px; }
.hl-units { display : grid; grid-template-columns : repeat(4, 1fr); gap : 8px; padding : 8px 10px; background : #eceff3; }
.hl-unit-card { background : #fff; border : 1px solid #c9d2dc; border-left : 6px solid #8bc34a; border-radius : 4px; padding : 6px 10px; }
.hl-unit-card.hl-uc-partial { border-left-color : #ffb300; } .hl-unit-card.hl-uc-full { border-left-color : #f4511e; } .hl-unit-card.hl-uc-over { border-left-color : #c62828; }
.hl-uc-head { font-size : 13px; margin-bottom : 4px; }
.hl-uc-row { display : grid; grid-template-columns : auto 1fr auto 1fr auto 1fr; gap : 2px 8px; font-size : 11.5px; }
.hl-uc-row span { color : #555; } .hl-uc-row b { text-align : right; }
.hl-uc-prod { margin-top : 4px; font-size : 11px; color : #333; display : flex; flex-wrap : wrap; gap : 4px 10px; }
.hl-uc-erp { margin-top : 6px; padding-top : 5px; border-top : 1px dashed #d5dbe3; font-size : 11px; color : #333; display : flex; flex-wrap : wrap; gap : 3px 10px; align-items : baseline; }
.hl-uc-erp-t { flex : 0 0 100%; font-weight : 700; color : #1f3a5f; }
.hl-uc-erp-total { flex : 0 0 100%; color : #1f3a5f; }
.hl-erp-other { padding : 0 10px 8px; font-size : 11px; color : #444; }
.hl-sched-wrap { flex : 1 1 auto; min-height : 300px; position : relative; display : flex; flex-direction : column; }
.hl-sched { flex : 1 1 auto; height : 100%; min-height : 300px; }
.hl-busy { opacity : .6; pointer-events : none; }
.hl-empty { position : absolute; inset : 0; display : flex; align-items : center; justify-content : center; font-size : 15px; color : #555; background : rgba(255,255,255,.7); }
.hl-unit-name { font-size : 13px; } .hl-unit-sub, .hl-line-sub { display : block; font-size : 10.5px; color : #666; font-weight : 400; }
.hl-line-off { text-decoration : line-through; color : #999; }
.hl-util { font-weight : 700; padding : 1px 6px; border-radius : 10px; }
.hl-util-ok { background : #e8f5e9; color : #2e7d32; } .hl-util-partial { background : #fff8e1; color : #b26a00; } .hl-util-full { background : #ffe0d6; color : #c43c00; } .hl-util-over { background : #ffcdd2; color : #b00020; }
.hl-sched .b-sch-resource-time-range.hl-day { border : none; opacity : 1; pointer-events : none; }
.hl-day-idle { background : #f4f6f8 !important; } .hl-day-available { background : #dcedc8 !important; } .hl-day-partial { background : #ffe082 !important; }
.hl-day-full { background : #ffab91 !important; } .hl-day-overloaded { background : #ef9a9a !important; } .hl-day-holiday { background : repeating-linear-gradient(45deg, #e0e0e0 0 4px, #f5f5f5 4px 8px) !important; }
.hl-day-shutdown { background : repeating-linear-gradient(45deg, #bdbdbd 0 4px, #eeeeee 4px 8px) !important; } .hl-day-off { background : #ececec !important; } .hl-day-inactive { background : #e0e0e0 !important; }
.hl-sched .b-sch-event.hl-res { background : #4f7fcf; border : 1px solid #2d5aa3; color : #fff; font-size : 11px; border-radius : 3px; }
.hl-sched .b-sch-event.hl-res-live { background : #7a7a7a; border-color : #555; }
.hl-sched .b-sch-event.hl-res-proposed { background : #26a69a; }
.hl-sched .b-sch-event.hl-res-conflict { background : #d32f2f; border-color : #8e0000; }
.hl-sched .b-sch-event.hl-res-late { box-shadow : inset 0 -4px 0 #ff9800; }
.hl-sched .b-sch-event.hl-res-locked { opacity : .9; border-style : dashed; }
.hl-res-txt { white-space : nowrap; overflow : hidden; text-overflow : ellipsis; padding : 0 4px; }
.hl-tip table td { padding : 1px 6px; font-size : 11.5px; } .hl-tip table td:first-child { color : #666; }
.hl-dialog { width : 900px; max-width : 96vw; }
.hl-cfg-dialog { width : 1100px; }
.hl-ord-dialog { width : 1300px; }
.hl-res-dialog { width : 720px; }
.hl-kv td { padding : 2px 8px; } .hl-kv td:first-child { color : #666; font-weight : 600; }
.hl-daytable { display : flex; flex-wrap : wrap; gap : 4px 10px; margin : 8px 0; font-size : 11.5px; }
.hl-daytable .hl-dover { color : #b00020; font-weight : 700; }
.hl-actions { display : flex; align-items : center; gap : 8px; flex-wrap : wrap; margin : 8px 0; }
.hl-actions.hl-right { justify-content : flex-end; }
.hl-split { border-top : 1px solid #e3e6ea; padding-top : 8px; }
.hl-gap { flex : 1 1 auto; }
.hl-tabs { display : flex; gap : 4px; margin-bottom : 10px; }
.hl-table { border-collapse : collapse; width : 100%; font-size : 12px; }
.hl-table th, .hl-table td { border : 1px solid #dde2e8; padding : 3px 6px; text-align : left; vertical-align : middle; }
.hl-table th { background : #eef2f6; font-weight : 700; }
.hl-table-s { width : auto; min-width : 60%; }
.hl-table tr.hl-sel td { background : #e3efff; }
.hl-table tr.hl-short td { background : #fff3e0; }
.hl-r { text-align : right !important; }
.hl-short { color : #b26a00; font-weight : 700; } .hl-ok { color : #2e7d32; font-weight : 700; } .hl-late { color : #b00020; font-weight : 700; }
.hl-num { width : 64px; text-align : right; } .hl-smv { width : 56px; margin-left : 2px; } .hl-txt { width : 140px; }
.hl-pcell { white-space : nowrap; }
.hl-dow { margin-right : 6px; font-weight : 400; }
.hl-scroll { max-height : 55vh; overflow : auto; }
.hl-detail-row > td { background : #f7f9fc; padding : 8px 12px; }
.hl-lines-unit { display : flex; align-items : center; gap : 10px; flex-wrap : wrap; font-size : 12px; margin : 4px 0 8px; }
.hl-lp-box { border : 1px solid #c9d2dc; border-radius : 4px; background : #f7f9fc; padding : 8px 12px; margin-bottom : 10px; }
.hl-detail-head { display : flex; align-items : center; gap : 10px; flex-wrap : wrap; margin-bottom : 6px; font-size : 12px; }
.hl-link { color : #1b52ad; text-decoration : underline; cursor : pointer; }
.hl-orders-box { margin-top : 8px; }
.hl-orders-scroll { max-height : 260px; }
.hl-md-head { display : flex; align-items : center; gap : 14px; flex-wrap : wrap; margin-bottom : 8px; font-size : 12px; }
.hl-md-nav { display : inline-flex; align-items : center; gap : 6px; font-size : 13px; }
.hl-md-grid { display : grid; grid-template-columns : repeat(7, 1fr); gap : 4px; max-width : 760px; }
.hl-md-dow { text-align : center; font-weight : 700; font-size : 11px; color : #555; }
.hl-md-day { border : 1px solid #cfd6df; border-radius : 4px; padding : 3px 5px; min-height : 40px; background : #fff; display : flex; flex-direction : column; gap : 2px; font-size : 11.5px; }
.hl-md-day.hl-md-on { background : #e8f5e9; border-color : #a5d6a7; }
.hl-md-day.hl-md-off { background : #f3f3f3; color : #888; }
.hl-md-day.hl-md-hol { background : repeating-linear-gradient(45deg, #fdecea 0 4px, #fff 4px 8px); }
.hl-md-day.hl-md-explicit { border-width : 2px; border-color : #1b52ad; }
.hl-md-day.hl-md-out { opacity : .45; }
.hl-md-num { font-weight : 700; cursor : pointer; }
.hl-md-hrs { width : 100%; box-sizing : border-box; border : 1px solid #c9d2dc; border-radius : 3px; padding : 1px 4px; font-size : 11.5px; text-align : right; }
.hl-md-offlbl { cursor : pointer; font-style : italic; }
.hl-md-foot { display : flex; flex-wrap : wrap; align-items : center; gap : 8px 18px; margin-top : 8px; font-size : 11.5px; }
.hl-md-key { display : inline-block; width : 12px; height : 10px; border : 1px solid #889; border-radius : 2px; vertical-align : middle; }
.hl-md-pattern { margin-left : auto; }

.hl-x-small { cursor : pointer; color : #b00020; font-weight : 700; }
.hl-ord-body { display : flex; gap : 14px; }
.hl-ord-left { flex : 1 1 55%; min-width : 0; } .hl-ord-right { flex : 1 1 45%; min-width : 380px; }
.hl-ord-scroll { max-height : 70vh; }
.hl-ord-left tbody tr { cursor : pointer; }
.hl-form { display : grid; grid-template-columns : 1fr 1fr; gap : 6px 10px; }
.hl-form label { display : flex; flex-direction : column; font-weight : 600; font-size : 11.5px; gap : 2px; }
.hl-result { border : 1px solid #c9d2dc; border-radius : 4px; padding : 8px 10px; margin-top : 6px; background : #f7fbf7; }
.hl-result-short { background : #fff8f0; border-color : #f0c090; }
.hl-result-head { font-size : 13px; margin-bottom : 4px; }
.hl-result-row { margin : 6px 0; font-size : 12px; }
.hl-alt { display : inline-block; margin : 2px 8px 2px 0; padding : 1px 6px; border-radius : 10px; background : #eee; }
.hl-alt-ok { background : #e8f5e9; color : #2e7d32; }
</style>
