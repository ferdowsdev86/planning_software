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
    HL_UNITS, newScenario, newLine, uid, ymd, addDays, daysBetween, fromYmd, orderLabel,
    lineById, orderById, unitOf, buildLoad, usedMinutes, lineDayMinutes, lineSummary, unitSummary, isWorkDay, holidayOn,
    unitDayStatus, lineDayStatus, planOrder, autoPlan, endForQty, conflicts, reconcile, lineCompatible, reservationDays, isOver, lineSmv, ensurePoolLine
} from './hlEngine.js';
import {
    autoBalance, allocationReport, reconcileAllocation, balanceSettings, unitMakes, orderSmv, ymOf, buildCapIndex, mergeErpOrders, placeInUnit, EXT_STATUS, KIND_LABEL,
    autoPlanUnits, planRules, PLAN_STATUS, inputDateFor
} from './hlBalance.js';
import {
    hlListScenarios, hlCreateScenario, hlLoadScenario, hlSaveScenario, hlRenameScenario, hlDeleteScenario, hlReference, hlErpMonthly, hlErpMonthOrders, hlErpSmv, hlErpSmvOrders,
    hlErpOrders, hlAutoBalance
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
    cls           : 'hl-sched',   // the wrapper drops the class attribute — Bryntum's own cls lands on its element
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
            : record.data.pool
                ? `<span class="hl-line-name hl-line-pool">🌐 ${StringHelper.encodeHtml(value)}</span><span class="hl-line-sub">${record.data.hoursLbl}</span>`
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
        if (r.kind) renderData.cls.add(`hl-res-k-${r.kind}`);
        if (r.planStatus) renderData.cls.add(`hl-res-ps-${r.planStatus}`);
        if (r.extStatus) renderData.cls.add(`hl-res-ext-${r.extStatus}`);
        if (r.risk) renderData.cls.add('hl-res-risk');
        const pre = `${r.locked ? '🔒 ' : ''}${r.kind === 'transfer' ? `⇄${r.fromUnit || ''} ` : r.kind === 'gsl' ? `🌐${r.fromUnit || ''} ` : ''}${r.extStatus === 'pending' ? '⏳ ' : ''}`;
        return `<span class="hl-res-txt">${pre}${StringHelper.encodeHtml(r.name || '')} · ${fmtQty(r.qty)}</span>`;
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
        ...(o?.color ? [['Colour', o.color]] : []),
        ...(o?.codes || o?.pos ? [['ERP group', `${o.codes || o.note || ''}${o.pos ? ` · ${o.pos} PO` : ''}${o.po ? ` (${o.po})` : ''}`]] : []),
        ['Product', r.product || o?.product || '—'], ['Quantity', `${fmtQty(r.qty)} pcs`],
        ['PCD', dmy(o?.pcd)], ['Delivery', dmy(o?.delivery)],
        ['Line', line ? `${unitOf(s, line.unitCode)?.name} · ${line.name}` : '—'],
        ['Span', `${dmy(res?.start)} → ${dmy(res?.end)} (${rd ? rd.days.length : 0} working days)`],
        ['Status', `${r.status}${r.locked ? ' · locked' : ''}${r.conflict ? ' · ⚠ overloaded day(s)' : ''}${r.late ? ' · after delivery' : ''}`]
    ];
    if (r.kind) rows.push(['Allocation', `${KIND_LABEL[r.kind] || r.kind}${r.fromUnit && line && r.fromUnit !== line.unitCode ? ` · contract ${unitName(r.fromUnit)} → ${unitName(line.unitCode)}` : ''}`]);
    if (r.planStatus) { const lateD = r.planStatus === 'late' && o?.delivery && res?.end > o.delivery ? daysBetween(o.delivery, res.end) : 0; rows.push(['Plan', `${PLAN_STATUS[r.planStatus] || r.planStatus}${lateD ? ` · ${lateD} d after delivery` : ''}${r.lcDays ? ` · learning curve ${r.lcDays} days` : ''}${o?.repeat ? ' · repeat order' : ''}`]); }
    if (res?.reason) rows.push(['Reason', res.reason]);
    if (r.extStatus) rows.push(['External capacity', EXT_STATUS[r.extStatus] || r.extStatus]);
    if (o?.garment) rows.splice(3, 0, ['Garment', o.garment]);
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
                // UNIT-G with an overflow pool shows exactly ONE row: the pool
                children : scn.lines.filter(l => l.unitCode === u.code && (u.code !== 'G' || !scn.lines.some(x => x.pool) || l.pool)).map(l => {
                    const t = ls[l.id] || {};
                    const unit = unitOf(scn, l.unitCode);
                    if (l.pool) return { id : l.id, name : l.name, isUnit : false, active : true, pool : true, manpower : '∞', eff : '—', hoursLbl : 'unlimited overflow pool',
                        capLbl : '∞', resLbl : fmtMin(t.usedMin), availLbl : '∞', utilLbl : '—', utilCls : 'ok' };
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
                id : r.id, resourceId : r.lineId, name : r.label || orderLabel(o) || r.product || 'reservation',
                startDate : fromYmd(r.start), endDate : fromYmd(addDays(r.end, 1)),
                qty : r.qty, product : r.product || o?.product || '', status : r.status, locked : !!r.locked, orderId : r.orderId, lineId : r.lineId,
                conflict : conflictRes.has(r.id), late : !!(o?.delivery && r.end > o.delivery), source : r.source || null,
                kind : r.kind || null, fromUnit : r.fromUnit || null, extStatus : r.kind === 'gsl' ? (r.extStatus || 'pending') : null,
                planStatus : r.planStatus || null, lcDays : r.lcDays || 0,
                risk : !!(r.kind === 'gsl' && (r.extStatus || 'pending') !== 'confirmed'),
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
                // off days / holidays are hatched on every line row too, so a no-production day is seen at once
                if (st === 'overloaded' || st === 'holiday' || st === 'off' || st === 'inactive') ranges.push({ id : `l-${l.id}-${d}`, resourceId : l.id, startDate : fromYmd(d), endDate : fromYmd(addDays(d, 1)), cls : `hl-day hl-day-${st}`, name : '' });
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
        // an allocation keeps its meaning when the planner moves it between units
        if (x.kind && x.kind !== 'live') {
            const contract = x.fromUnit || o?.unitCode;
            if (line.pool || line.unitCode === 'G') { x.kind = 'gsl'; x.extStatus = x.extStatus || 'pending'; }
            else { x.kind = line.unitCode === contract ? 'contract' : 'transfer'; x.extStatus = null; }
            x.reason = `moved by the planner to ${line.name}`;
        }
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
        const tl = lineById(s, splitLine.value);
        const contract = x.fromUnit || o?.unitCode;
        s.reservations.push({ id : uid('rs'), orderId : x.orderId, lineId : splitLine.value, product : x.product, start : x.start, end, qty : q, locked : false, status : x.status || 'reserved', label : x.label, smv : x.smv || null,
            kind : x.kind ? (tl?.pool ? 'gsl' : tl?.unitCode === contract ? 'contract' : 'transfer') : null, fromUnit : x.fromUnit || null, extStatus : tl?.pool ? 'pending' : null, reason : x.kind ? `split by the planner onto ${tl?.name}` : null });
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
        const contract = r.fromUnit || o?.unitCode;
        for (const a of res.allocations) s.reservations.push({ ...a, status : r.status === 'proposed' ? 'proposed' : 'reserved', label : r.label, locked : false, smv : r.smv || null,
            kind : r.kind ? (moveUnit.value === contract ? 'contract' : 'transfer') : null, fromUnit : r.fromUnit || null, reason : r.kind ? `moved to ${unitName(moveUnit.value)} by the planner` : null });
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
function cfgLines() { return (sc.value?.lines || []).filter(l => l.unitCode === cfgUnit.value && !l.pool); }
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
function blankOrder() { return { id : null, buyer : '', style : '', color : '', product : '', qty : 0, pcd : ymd(new Date()), delivery : addDays(ymd(new Date()), 30), unitCode : 'M', note : '' }; }
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
        for (const a of t.allocations) s.reservations.push({ ...a, orderId : oid, status : 'reserved', label : orderLabel(ordForm.value) });
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
// Orders & capacity test → unit-wise auto plan by the planning rules:
// input date = PCD + 7 (new style) / + 3 (repeat / carry-over), learning
// curve by SMV (none for repeats, buyer overrides), delivery must be met —
// grey = on time, orange = PCD not met, red = delivery not met.
// ---------------------------------------------------------------------------
const APU_UNITS = ['M', 'C', 'A'];
function apuDefaults(s) {
    const r = planRules(s);
    return { newLead : r.newLead, repeatLead : r.repeatLead, lcSmvLow : r.lcSmvLow, lcDaysLow : r.lcDaysLow, lcSmvHigh : r.lcSmvHigh, lcDaysMid : r.lcDaysMid, lcDaysHigh : r.lcDaysHigh,
        gstar : r.buyerLc?.['G-STAR'] ?? 4, noLc : (r.noLcBuyers || []).join(', '), repeatNoLc : r.repeatNoLc !== false, minFillPct : Math.round((r.minFill ?? 0.5) * 100) };
}
const apuRules = ref(apuDefaults(null));
const apuUnits = ref([...APU_UNITS]);
const apuResult = shallowRef(null);
const apuBusy = ref(false);
const apuFilter = ref('');
watch(ordOpen, v => { if (v && sc.value) apuRules.value = apuDefaults(sc.value); });
function apuRulesObj() {
    const r = apuRules.value;
    return { newLead : Number(r.newLead) || 0, repeatLead : Number(r.repeatLead) || 0, lcSmvLow : Number(r.lcSmvLow) || 30, lcDaysLow : Number(r.lcDaysLow) || 0,
        lcSmvHigh : Number(r.lcSmvHigh) || 50, lcDaysMid : Number(r.lcDaysMid) || 0, lcDaysHigh : Number(r.lcDaysHigh) || 0,
        buyerLc : { 'G-STAR' : Number(r.gstar) || 0 }, noLcBuyers : String(r.noLc || '').split(',').map(x => x.trim()).filter(Boolean), repeatNoLc : !!r.repeatNoLc,
        minFill : Math.min(1, Math.max(0.05, (Number(r.minFillPct) || 50) / 100)) };
}
async function apuImport() {
    if (!sc.value) return;
    if (!canWrite.value) return denied();
    apuBusy.value = true;
    try {
        const erp = await hlErpOrders(by());
        let m = null;
        mutate('import ERP orders', s => { m = mergeErpOrders(s, erp.rows || []); });
        props.toast(`ERP orders imported as groups (buyer + production unit + style + colour + PCD + delivery): ${m.added} new, ${m.updated} updated${m.removed ? `, ${m.removed} old order row(s) removed` : ''} — one bar per group`, 'ok');
    }
    catch (e) { props.toast(`ERP orders failed: ${e.message}`, 'error'); }
    finally { apuBusy.value = false; }
}
function apuRun() {
    if (!sc.value) return;
    if (!apuUnits.value.length) { props.toast('Pick at least one unit', 'warn'); return; }
    const n = sc.value.orders.filter(o => apuUnits.value.includes(o.unitCode)).length;
    if (!n) { props.toast('No orders for the chosen unit(s) in this scenario — import the ERP orders first', 'warn'); return; }
    apuResult.value = autoPlanUnits(sc.value, { units : apuUnits.value, rules : apuRulesObj() });
}
function apuApply() {
    const out = apuResult.value; if (!out || !sc.value) return;
    const rules = apuRulesObj();
    mutate('auto plan (unit-wise)', s => {
        const rm = new Set(out.removedIds);
        s.reservations = s.reservations.filter(r => !rm.has(r.id)).concat(out.reservations);
        s.balance = { ...balanceSettings(s), planRules : rules, lastAutoPlan : out.summary };
    });
    for (const u of out.summary.units) expandedUnits.add(u);
    const sm = out.summary;
    props.toast(`Auto plan applied: ${sm.ontime} on time · ${sm.pcd} PCD not met · ${sm.late} delivery not met · ${sm.unplaced} without capacity${sm.critical ? ` — ${sm.critical} critical (${sm.maxLate ? `up to ${sm.maxLate} d late` : ''}${sm.maxLate && sm.shortQty ? ', ' : ''}${sm.shortQty ? `${fmtQty(sm.shortQty)} pcs without capacity` : ''})` : ''} — review the bars (grey / orange / red), then Save`, sm.critical ? 'warn' : 'ok');
    apuResult.value = null;
    ordOpen.value = false;
}
const apuRows = computed(() => {
    const q = apuFilter.value.trim().toLowerCase();
    const rows = apuResult.value?.results || [];
    const order = { late : 0, unplaced : 1, pcd : 2, ontime : 3 };
    return rows.filter(r => !q || `${r.code} ${r.buyer} ${r.style} ${r.product}`.toLowerCase().includes(q))
        .slice().sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9) || String(a.delivery || '').localeCompare(String(b.delivery || '')));
});

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
// Central Auto Balance — contract unit first → other compatible internal
// units → all remaining excess to the GSL overflow pool. The engine lives in
// src/hlBalance.js and runs in the API's /hl/auto-balance service (the same
// module runs here when the service is unreachable). The result is a
// PROPOSAL: the planner reviews it, applies it to the scenario, then moves /
// locks / cancels bars on the board — every change recomputes capacity.
// ---------------------------------------------------------------------------
const abOpen = ref(false);
const abBusy = ref(false);
const abResOpen = ref(false);
const abResult = shallowRef(null);        // { imported, orders, lines, products, removedIds, reservations, results, summary, local? }
const abErp = shallowRef(null);           // ERP active orders (for the filter choices)
let abCtl = null;
const ALL_UNITS = ['M', 'C', 'A'];
const SCOPE_UNITS = ['M', 'C', 'A', 'G'];
function defaultAbOpt(s) {
    const b = balanceSettings(s);
    return { importOrders : true, from : s?.from || '', to : s?.to || '', buyers : [], units : [...(b.units || SCOPE_UNITS)], months : [], products : [],
        includeLive : b.includeLive !== false, allowTransfer : b.allowTransfer !== false, allowGsl : b.allowGsl !== false, deliveryLead : b.deliveryLead || 0, useOutstanding : b.useOutstanding !== false,
        transfers : { M : (b.transfers.M || []).join(','), C : (b.transfers.C || []).join(','), A : (b.transfers.A || []).join(',') } };
}
const abOpt = ref(defaultAbOpt(null));
async function openAutoBalance() {
    if (!sc.value) return;
    if (!canWrite.value) return denied();
    abOpt.value = defaultAbOpt(sc.value);
    abOpen.value = true;
    if (!abErp.value) { try { abErp.value = await hlErpOrders(by()); } catch (e) { abErp.value = { error : e.message, rows : [] }; } }
}
const abChoices = computed(() => {
    const rows = [...(abErp.value?.rows || []), ...(sc.value?.orders || []).map(o => ({ buyer : o.buyer, product : o.product, delivery : o.delivery }))];
    const uniq = k => [...new Set(rows.map(r => r[k]).filter(Boolean))].sort();
    return { buyers : uniq('buyer'), products : uniq('product'), months : [...new Set(rows.map(r => ymOf(r.delivery)).filter(m => m !== 'none'))].sort() };
});
const parseUnits = s => String(s || '').split(/[,\s]+/).map(x => x.trim().toUpperCase()).filter(x => ALL_UNITS.includes(x));
function abOptions() {
    const o = abOpt.value;
    return { importOrders : !!o.importOrders, from : o.from || undefined, to : o.to || undefined, buyers : o.buyers, units : o.units, months : o.months, products : o.products,
        includeLive : !!o.includeLive, allowTransfer : !!o.allowTransfer, allowGsl : !!o.allowGsl, deliveryLead : Number(o.deliveryLead) || 0, useOutstanding : !!o.useOutstanding,
        transfers : { M : parseUnits(o.transfers.M), C : parseUnits(o.transfers.C), A : parseUnits(o.transfers.A) }, productUnits : balanceSettings(sc.value).productUnits };
}
async function runAutoBalance() {
    if (!sc.value || abBusy.value) return;
    const options = abOptions();
    if (!options.units.length) { props.toast('Pick at least one contract unit', 'warn'); return; }
    abBusy.value = true;
    abCtl = new AbortController();
    const t0 = Date.now();
    try {
        let j;
        try { j = await hlAutoBalance(by(), JSON.parse(snapshot()), options, abCtl.signal); }
        catch (e) {
            if (e.name === 'AbortError') throw e;
            // service unreachable → the same engine runs here
            const clone = JSON.parse(snapshot());
            let imported = null;
            if (options.importOrders) { const erp = abErp.value?.rows?.length ? abErp.value : await hlErpOrders(by()); imported = mergeErpOrders(clone, erp.rows || []); }
            j = { imported, orders : clone.orders, lines : clone.lines, products : clone.products, ...autoBalance(clone, options), local : true, ms : Date.now() - t0 };
        }
        abResult.value = j;
        abResOpen.value = true;
    }
    catch (e) { props.toast(e.name === 'AbortError' ? 'Auto Balance cancelled' : `Auto Balance failed: ${e.message}`, e.name === 'AbortError' ? 'warn' : 'error'); }
    finally { abBusy.value = false; abCtl = null; }
}
function cancelAutoBalance() { abCtl?.abort(); }
function abApply() {
    const j = abResult.value; if (!j || !sc.value) return;
    const options = abOptions();
    mutate('auto balance', s => {
        s.orders = j.orders; s.lines = j.lines; s.products = j.products;
        const rm = new Set(j.removedIds);
        s.reservations = s.reservations.filter(r => !rm.has(r.id)).concat(j.reservations);
        s.balance = { ...balanceSettings(s), units : options.units, includeLive : options.includeLive, allowTransfer : options.allowTransfer, allowGsl : options.allowGsl,
            deliveryLead : options.deliveryLead, useOutstanding : options.useOutstanding, transfers : options.transfers, lastRun : j.summary };
    });
    expandedUnits.add('G');
    abResOpen.value = false; abOpen.value = false;
    const s = j.summary;
    props.toast(`Auto Balance applied (proposal): ${fmtQty(s.contract)} in contract units · ${fmtQty(s.transfer)} transferred · ${fmtQty(s.gsl)} to GSL · ${fmtQty(s.unallocated)} unallocated — review on the board, then Save`, s.unallocated ? 'warn' : 'ok');
}
const abResultRows = computed(() => (abResult.value?.results || []).slice().sort((a, b) => (b.risk ? 1 : 0) - (a.risk ? 1 : 0) || String(a.delivery || '').localeCompare(String(b.delivery || ''))));
function resetProposed() {
    if (!sc.value) return;
    const n = sc.value.reservations.filter(r => r.status === 'proposed' && !r.locked).length;
    if (!n) { props.toast('No unlocked proposed allocation to reset', 'warn'); return; }
    if (!window.confirm(`Remove the ${n} unlocked proposed allocation(s)? Locked ones and manual reservations stay.`)) return;
    mutate('reset proposed allocation', s => { s.reservations = s.reservations.filter(r => !(r.status === 'proposed' && !r.locked)); });
    props.toast(`${n} proposed allocation(s) removed — Save to keep`, 'ok');
}

// live allocation report from the scenario's reservations (manual edits included)
const capIndex = computed(() => { void tick.value; return sc.value ? buildCapIndex(sc.value, sc.value.from, sc.value.to) : null; });
const allocRep = computed(() => { void tick.value; return sc.value ? allocationReport(sc.value, { capIndex : capIndex.value }) : null; });
const allocBad = computed(() => (allocRep.value ? reconcileAllocation(allocRep.value) : []));
const unitName = c => (c === 'G' ? 'GSL' : unitOf(sc.value, c)?.label || c);
// quantity WITHOUT capacity per unit × delivery month (orders of the unit
// the auto plan / balance could not place, fully or partly) — shown on the
// unit card's month table; a click lists the orders
const noCapByUnit = computed(() => {
    const out = {};
    for (const o of allocRep.value?.orders || []) {
        if (!(o.unallocated > 0)) continue;
        const u = out[o.contractUnit] || (out[o.contractUnit] = { total : 0, orders : 0, months : {} });
        u.total += o.unallocated; u.orders++;
        const m = u.months[o.ym] || (u.months[o.ym] = { qty : 0, orders : 0 });
        m.qty += o.unallocated; m.orders++;
    }
    return out;
});
const ncOpen = ref(false);
const ncUnit = ref('');
const ncMonth = ref('');
function openNoCap(u, ym) { ncUnit.value = u.code; ncMonth.value = ym; ncOpen.value = true; }
const ncRows = computed(() => {
    void tick.value;
    const s = sc.value; if (!s) return [];
    const rows = (allocRep.value?.orders || []).filter(o => o.contractUnit === ncUnit.value && (ncMonth.value === 'total' || o.ym === ncMonth.value) && o.unallocated > 0);
    return rows.map(o => {
        const rs = s.reservations.filter(r => r.orderId === o.id && r.status !== 'cancelled');
        const ps = rs.find(r => r.planStatus)?.planStatus || null;
        const reason = rs.find(r => r.reason)?.reason || '';
        const ord = orderById(s, o.id) || {};
        return { ...o, planStatus : ps, reason, placed : o.qty - o.unallocated, repeat : !!ord.repeat, inputDate : inputDateFor(ord, planRules(s)) };
    }).sort((a, b) => String(a.delivery || '').localeCompare(String(b.delivery || '')));
});
const ncTotal = computed(() => ncRows.value.reduce((a, r) => ({ qty : a.qty + r.qty, open : a.open + r.unallocated }), { qty : 0, open : 0 }));

// ---- Product-Wise Allocation panel ----------------------------------------
const pwOpen = ref(false);
const pwF = ref({ buyer : '', unit : '', product : '', garment : '', month : '', order : '' });
const pwMoveQty = ref({});          // orderId → qty
const pwMoveTo = ref({});           // orderId → unit code
const pwOrders = computed(() => {
    const f = pwF.value, rows = allocRep.value?.orders || [];
    const q = f.order.trim().toLowerCase();
    return rows.filter(o => (!f.buyer || o.buyer === f.buyer) && (!f.unit || o.contractUnit === f.unit) && (!f.product || o.product === f.product)
        && (!f.garment || o.garment === f.garment) && (!f.month || o.ym === f.month)
        && (!q || `${o.code} ${o.style} ${o.buyer}`.toLowerCase().includes(q)));
});
const pwChoices = computed(() => {
    const rows = allocRep.value?.orders || [];
    const uniq = k => [...new Set(rows.map(r => r[k]).filter(Boolean))].sort();
    return { buyers : uniq('buyer'), products : uniq('product'), garments : uniq('garment'), months : uniq('ym') };
});
// product × unit: capacity of the unit for the product over the plan range
// (free minutes of the lines that make it ÷ product SMV), what the filtered
// orders propose there and the balance
const pwProducts = computed(() => {
    void tick.value;
    const s = sc.value, ix = capIndex.value; if (!s || !ix) return [];
    const settings = balanceSettings(s);
    const load = loadMap.value;
    const prods = [...new Set(pwOrders.value.map(o => o.product))].sort();
    // minutes taken per line by reservations of OTHER products (the product's own proposals are what we compare)
    const resById = new Map(s.reservations.map(r => [r.id, r]));
    return prods.map(p => {
        const smv = smvOf(p, pwF.value.unit || 'M');
        const row = { product : p, smv, units : {} };
        for (const u of [...ALL_UNITS, 'G']) {
            const proposed = pwOrders.value.filter(o => o.product === p).reduce((a, o) => a + (u === 'G' ? o.gsl : u === o.contractUnit ? o.internal : (o.transfers[u] || 0)), 0);
            if (u === 'G') { row.units.G = { pool : true, proposed, makes : true }; continue; }
            const makes = unitMakes(settings, p, u);
            let capMin = 0, otherMin = 0;
            for (const l of s.lines) {
                if (l.unitCode !== u || l.pool || !l.active || lineSmv(s, l, p) == null) continue;
                const c = ix.cap.get(l.id); for (let i = 0; i < c.length; i++) capMin += c[i];
                const m = load.get(l.id);
                if (m) for (const [, cell] of m) for (const it of cell.items) { const r = resById.get(it.resId); if (r && (r.product || orderById(s, r.orderId)?.product) !== p) otherMin += it.min; }
            }
            const available = makes && smv > 0 ? Math.round(Math.max(0, capMin - otherMin) / smv) : 0;
            row.units[u] = { makes, available, proposed, balance : available - proposed, lines : s.lines.filter(l => l.unitCode === u && !l.pool && l.active && lineSmv(s, l, p) != null).length };
        }
        return row;
    });
});
function pwToggleMakes(product, u) {
    mutate(`${unitName(u)} ${product}`, s => {
        const b = balanceSettings(s);
        const pu = { ...(b.productUnits[product] || {}) };
        if (pu[u] === false) delete pu[u]; else pu[u] = false;
        b.productUnits[product] = pu;
        s.balance = b;
    });
}
function pwLock(o, on) { pwLockAll([o], on); }
function pwLockAll(rows, on) { const ids = new Set(rows.map(o => o.id)); if (!ids.size) return; mutate(on ? `lock ${ids.size} order(s)` : `unlock ${ids.size} order(s)`, s => { for (const r of s.reservations) if (ids.has(r.orderId) && r.status !== 'cancelled') r.locked = on; }); }
// move pieces of an order from one unit's proposals to another unit (GSL = pool)
function pwMove(o) {
    const q = Math.floor(Number(pwMoveQty.value[o.id]) || 0), to = pwMoveTo.value[o.id];
    if (!(q > 0) || !to) { props.toast('Give the quantity and the unit to move to', 'warn'); return; }
    const s = sc.value, order = orderById(s, o.id); if (!order) return;
    const lineUnit = new Map(s.lines.map(l => [l.id, l.unitCode]));
    // take from the unlocked proposals NOT already in the target unit, latest first
    const src = s.reservations.filter(r => r.orderId === o.id && !r.locked && r.status !== 'cancelled' && lineUnit.get(r.lineId) !== to).sort((a, b) => b.start.localeCompare(a.start));
    const avail = src.reduce((a, r) => a + r.qty, 0) + o.unallocated;
    if (q > avail) { props.toast(`Only ${fmtQty(avail)} pcs are movable (unlocked, not yet in ${unitName(to)})`, 'warn'); return; }
    mutate(`move ${fmtQty(q)} → ${unitName(to)}`, scn => {
        let need = Math.max(0, q - o.unallocated);           // unallocated pieces move first, no reservation to shrink
        for (const r of src) {
            if (need <= 0) break;
            const x = scn.reservations.find(y => y.id === r.id);
            const take = Math.min(need, x.qty);
            x.qty -= take; need -= take;
            if (x.qty <= 0) scn.reservations = scn.reservations.filter(y => y.id !== x.id);
        }
        const smv = orderSmv(scn, order);
        const label = `${order.buyer || ''} ${order.style || ''}`.trim();
        const start = [order.pcd, scn.from].filter(Boolean).sort().pop();
        if (to === 'G') {
            const pool = ensurePoolLine(scn);
            scn.reservations.push({ id : uid('rs'), orderId : order.id, lineId : pool.id, product : order.product, smv, start, end : order.delivery && order.delivery > start ? order.delivery : start, qty : q, locked : false, status : 'proposed', source : 'balance', kind : 'gsl', fromUnit : order.unitCode, extStatus : 'pending', reason : 'moved to GSL by the planner', label });
            return;
        }
        const placed = placeInUnit(scn, order, to, q, { kind : to === order.unitCode ? 'contract' : 'transfer', reason : `moved to ${unitName(to)} by the planner` });
        for (const a of placed.allocations) scn.reservations.push({ ...a, start : a.start < start ? start : a.start });
        if (placed.remaining > 0) props.toast(`${unitName(to)} had free compatible capacity for ${fmtQty(q - placed.remaining)} of ${fmtQty(q)} pcs — the rest is unallocated (${placed.reason || ''})`, 'warn');
    });
    pwMoveQty.value[o.id] = 0;
}
function pwRerun() {
    const ids = pwOrders.value.filter(o => o.unallocated > 0).map(o => o.id);
    if (!ids.length) { props.toast('No unallocated quantity in the filtered orders', 'warn'); return; }
    let out = null;
    mutate(`re-run ${ids.length} order(s)`, s => {
        out = autoBalance(s, { orderIds : ids, importOrders : false });
        const rm = new Set(out.removedIds);
        s.reservations = s.reservations.filter(r => !rm.has(r.id)).concat(out.reservations);
    });
    if (out) props.toast(`${ids.length} order(s) re-balanced: ${fmtQty(out.summary.contract)} contract · ${fmtQty(out.summary.transfer)} transfer · ${fmtQty(out.summary.gsl)} GSL · ${fmtQty(out.summary.unallocated)} unallocated`, 'ok');
}

// ---- Excess / GSL pool ---------------------------------------------------
const gpOpen = ref(false);
const gpStatus = ref('');
const gpRows = computed(() => {
    void tick.value;
    const s = sc.value; if (!s) return [];
    const poolIds = new Set(s.lines.filter(l => l.pool).map(l => l.id));
    return s.reservations.filter(r => poolIds.has(r.lineId) && r.status !== 'cancelled' && (!gpStatus.value || (r.extStatus || 'pending') === gpStatus.value)).map(r => {
        const o = orderById(s, r.orderId) || {};
        return { ...r, buyer : o.buyer, style : o.style, code : o.note || '', garment : o.garment || '', delivery : o.delivery, po : o.po || '', sah : r.qty * (Number(r.smv) > 0 ? r.smv : orderSmv(s, o)) / 60 };
    }).sort((a, b) => String(a.delivery || '').localeCompare(String(b.delivery || '')));
});
const gpTotal = computed(() => gpRows.value.reduce((a, r) => ({ qty : a.qty + r.qty, sah : a.sah + r.sah }), { qty : 0, sah : 0 }));
function gpSetStatus(r, v) { mutate(`GSL ${v}`, s => { const x = s.reservations.find(y => y.id === r.id); if (x) x.extStatus = v; }); }
function gpRemove(r) { if (!window.confirm('Remove this GSL overflow allocation? The quantity becomes unallocated.')) return; mutate('remove GSL allocation', s => { s.reservations = s.reservations.filter(y => y.id !== r.id); }); }
function gpLock(r) { mutate(r.locked ? 'unlock' : 'lock', s => { const x = s.reservations.find(y => y.id === r.id); if (x) x.locked = !x.locked; }); }

// ---- Available capacity by date / week / month ------------------------------
// From the line setup (manpower × hours × OT × efficiency per working day,
// the unit's month calendar and holidays) minus the scenario's reservations:
// capacity, reserved and available per line and per period, in SAH or in
// pieces at the unit average SMV (as the Lines tab shows the line).
const capOpen = ref(false);
const capPeriod = ref(localStorage.getItem('hl-cap-period') || 'week');   // day | week | month
const capShow = ref(localStorage.getItem('hl-cap-show') || 'pcs');        // pcs | sah
const capWhat = ref('avail');                                             // avail | cap | used
const capUnit = ref('');
const capFrom = ref(''); const capTo = ref('');
watch(capOpen, v => { if (v && sc.value) { capFrom.value = capFrom.value || sc.value.from; capTo.value = capTo.value || sc.value.to; if (!['day', 'week', 'month'].includes(capPeriod.value)) capPeriod.value = 'week'; } });
watch(capPeriod, v => localStorage.setItem('hl-cap-period', v));
watch(capShow, v => localStorage.setItem('hl-cap-show', v));
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function capKeyOf(d, period) {
    if (period === 'day') return d;
    if (period === 'month') return d.slice(0, 7);
    return addDays(d, -fromYmd(d).getDay());          // week from Sunday, like the board header
}
function capLabelOf(key, period) {
    if (period === 'day') return `${DOW[fromYmd(key).getDay()]} ${dmy(key)}`;
    if (period === 'month') { const [y, m] = key.split('-').map(Number); return `${MON[m - 1]} ${y}`; }
    return `w/c ${dmy(key)}`;
}
const capTable = computed(() => {
    void tick.value;
    const s = sc.value; if (!s || !capOpen.value) return null;
    const from = capFrom.value || s.from, to = capTo.value || s.to;
    const period = capPeriod.value;
    const load = loadMap.value;
    const keys = [];
    const days = [];
    for (let d = from, g = 0; d <= to && g < 2000; d = addDays(d, 1), g++) { days.push(d); const k = capKeyOf(d, period); if (keys[keys.length - 1] !== k) keys.push(k); }
    const cols = keys.map(k => ({ key : k, label : capLabelOf(k, period) }));
    const units = s.units.filter(u => !capUnit.value || u.code === capUnit.value);
    const rows = [];
    for (const u of units) {
        const smv = unitAvgSmv(u.code);
        const lines = s.lines.filter(l => l.unitCode === u.code && !l.pool);
        const uCells = Object.fromEntries(keys.map(k => [k, { cap : 0, used : 0, wd : 0 }]));
        const uTot = { cap : 0, used : 0, wd : 0 };
        const lineRows = [];
        for (const l of lines) {
            const cells = Object.fromEntries(keys.map(k => [k, { cap : 0, used : 0, wd : 0 }]));
            const tot = { cap : 0, used : 0, wd : 0 };
            for (const d of days) {
                const c = lineDayMinutes(s, l, d), x = usedMinutes(load, l.id, d);
                const cell = cells[capKeyOf(d, period)];
                cell.cap += c; cell.used += x; if (c > 0) cell.wd++;
                tot.cap += c; tot.used += x; if (c > 0) tot.wd++;
            }
            for (const k of keys) { uCells[k].cap += cells[k].cap; uCells[k].used += cells[k].used; uCells[k].wd = Math.max(uCells[k].wd, cells[k].wd); }
            uTot.cap += tot.cap; uTot.used += tot.used; uTot.wd = Math.max(uTot.wd, tot.wd);
            lineRows.push({ id : l.id, name : l.name, unit : u.code, smv, active : l.active, setup : `${l.manpower} mp · ${l.hours ?? 'unit'} h${l.ot ? ` + ${l.ot} OT` : ''} · ${l.eff}%`, cells, tot });
        }
        rows.push({ id : `U-${u.code}`, name : u.name, unit : u.code, smv, isUnit : true, setup : `${lines.filter(l => l.active).length}/${lines.length} lines · avg SMV ${smv}`, cells : uCells, tot : uTot });
        rows.push(...lineRows);
    }
    return { cols, rows, from, to, period };
});
const capVal = (cell, smv) => {
    const min = capWhat.value === 'cap' ? cell.cap : capWhat.value === 'used' ? cell.used : Math.max(0, cell.cap - cell.used);
    return capShow.value === 'sah' ? min / 60 : (smv > 0 ? min / smv : 0);
};
const capFmt = v => (capShow.value === 'sah' ? `${fmtQty(Math.round(v))} h` : fmtQty(Math.round(v)));
const capCls = cell => {
    if (cell.cap <= 0) return 'hl-day-holiday';
    const u = cell.used / cell.cap;
    const t = sc.value?.thresholds || { partial : 0.4, full : 0.9 };
    return u > 1 ? 'hl-day-overloaded' : u >= (t.full ?? 0.9) ? 'hl-day-full' : u >= (t.partial ?? 0.4) ? 'hl-day-partial' : u > 0 ? 'hl-day-available' : 'hl-day-idle';
};
const capTip = (cell, smv) => {
    const pcs = m => (smv > 0 ? fmtQty(Math.round(m / smv)) : '—');
    return `capacity ${fmtQty(Math.round(cell.cap / 60))} h / ${pcs(cell.cap)} pcs · reserved ${fmtQty(Math.round(cell.used / 60))} h / ${pcs(cell.used)} pcs · available ${fmtQty(Math.round(Math.max(0, cell.cap - cell.used) / 60))} h / ${pcs(Math.max(0, cell.cap - cell.used))} pcs · ${cell.wd} working day(s) · load ${cell.cap > 0 ? Math.round(cell.used / cell.cap * 100) : 0} %`;
};
function capCsv() {
    const t = capTable.value; if (!t) return;
    const what = { avail : 'available', cap : 'capacity', used : 'reserved' }[capWhat.value];
    const head = ['Unit', 'Line', 'Setup', ...t.cols.map(c => c.label), 'Total'];
    const lines = [head.join(',')];
    for (const r of t.rows) lines.push([unitName(r.unit), r.isUnit ? 'TOTAL' : r.name, `"${r.setup}"`, ...t.cols.map(c => Math.round(capVal(r.cells[c.key], r.smv))), Math.round(capVal(r.tot, r.smv))].join(','));
    const blob = new Blob([lines.join('\n')], { type : 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `available-capacity-${what}-${capPeriod.value}-${t.from}_${t.to}.csv`; a.click(); URL.revokeObjectURL(a.href);
}

// ---- Before & After balancing report ---------------------------------------
const baOpen = ref(false);
const baTab = ref('monthly');
const baUnitRows = computed(() => {
    const rep = allocRep.value; if (!rep) return [];
    const by = {};
    for (const m of rep.unitMonths) {
        const u = by[m.unit] || (by[m.unit] = { unit : m.unit, originalQty : 0, originalSah : 0, capSah : 0, internalQty : 0, inQty : 0, outQty : 0, gslQty : 0, unallocated : 0, finalSah : 0, overMonths : 0 });
        u.originalQty += m.originalQty; u.originalSah += m.originalSah; u.capSah += m.capSah; u.internalQty += m.internalQty; u.inQty += m.inQty; u.outQty += m.outQty; u.gslQty += m.gslQty; u.unallocated += m.unallocated; u.finalSah += m.finalSah;
        if (m.capSah && m.originalSah > m.capSah) u.overMonths++;
    }
    return Object.values(by).sort((a, b) => a.unit.localeCompare(b.unit));
});
const baRisk = computed(() => (allocRep.value?.orders || []).filter(o => o.risk).sort((a, b) => String(a.delivery || '').localeCompare(String(b.delivery || ''))));
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

// ERP monthly active orders by delivery date (read only): every Active order
// grouped by the delivery month of its POs (po_ex_fty, order date fallback)
// per production unit — months before the current one are overdue, orders
// without a delivery date show as their own row. Clicking a month opens the
// detailed order list for that unit and month.
// ---------------------------------------------------------------------------
const erpMonthly = shallowRef(null);     // { takenAt, months, unitTotals, grand } | { error }
async function loadErpMonthly() {
    try { erpMonthly.value = await hlErpMonthly(by()); }
    catch (e) { erpMonthly.value = { error : e.message, months : [], unitTotals : {}, grand : { orders : 0, qty : 0, outstanding : 0 } }; }
}
const thisYm = ymd(new Date()).slice(0, 7);
const ymLabel = ym => {
    if (!ym || ym === 'none') return 'No delivery date';
    const d = new Date(Number(ym.slice(0, 4)), Number(ym.slice(5, 7)) - 1, 1);
    return d.toLocaleDateString('en-US', { month : 'long', year : 'numeric' });
};
const erpMonthByUnit = computed(() => {
    const m = erpMonthly.value;
    const out = {};
    for (const u of HL_UNITS) out[u.code] = { months : [], total : { orders : 0, qty : 0, outstanding : 0 } };
    out.other = { months : [], total : { orders : 0, qty : 0, outstanding : 0 } };
    if (!m) return out;
    for (const r of m.months || []) {
        const code = HL_UNITS.find(u => u.liveUnitId === Number(r.unitId))?.code || 'other';
        const products = (m.products || []).filter(p => Number(p.unitId) === Number(r.unitId) && p.ym === r.ym)
            .sort((a, b) => b.qty - a.qty);
        out[code].months.push({ ...r, products, label : ymLabel(r.ym), overdue : r.ym !== 'none' && r.ym < thisYm });
    }
    for (const [uid, t] of Object.entries(m.unitTotals || {})) {
        const code = HL_UNITS.find(u => u.liveUnitId === Number(uid))?.code || 'other';
        out[code].total.orders += t.orders; out[code].total.qty += t.qty; out[code].total.outstanding += t.outstanding;
    }
    // other: several units share the bucket — months of the same ym merge
    const merged = new Map();
    for (const r of out.other.months) {
        const g = merged.get(r.ym) || { ym : r.ym, label : r.label, overdue : r.overdue, orders : 0, qty : 0, outstanding : 0 };
        g.orders += r.orders; g.qty += r.qty; g.outstanding += r.outstanding;
        merged.set(r.ym, g);
    }
    out.other.months = [...merged.values()].sort((a, b) => a.ym.localeCompare(b.ym));
    return out;
});

// month-wise capacity of each unit against the ERP order load. Capacity of a
// month = the SUM of the unit's lines for that month, exactly as the Lines tab
// shows them: Line SAH (manpower × (hours + OT) × efficiency over the month's
// working days inside the plan range) and Capacity pcs (line SAH × 60 ÷ the
// unit average SMV). Order SAH = Σ qty × ERP product SMV ÷ 60.
// SMV of an ERP product type on a unit: the ERP quantity-weighted average of
// its styles, else the scenario product, else the unit average
function smvOf(product, code) {
    const e = erpSmvByUnit.value[code]?.products.find(x => String(x.product || '').toLowerCase() === String(product || '').toLowerCase());
    if (e?.avgSmv > 0) return e.avgSmv;
    const p = (sc.value?.products || []).find(x => x.name.toLowerCase() === String(product || '').toLowerCase());
    if (p && Number(p.smv) > 0) return Number(p.smv);
    return unitAvgSmv(code);
}
const monthCapRes = computed(() => {
    void tick.value;
    const s = sc.value;
    const out = {};
    if (!s) return out;
    const load = loadMap.value;
    for (const u of HL_UNITS) {
        const per = {};
        const total = { cap : 0, used : 0, capPcs : 0, qty : 0, reqMin : 0 };
        const smv = unitAvgSmv(u.code);
        const lines = s.lines.filter(l => l.unitCode === u.code);
        for (const row of erpMonthByUnit.value[u.code]?.months || []) {
            const [y, m] = row.ym.split('-').map(Number);
            const first = `${row.ym}-01`;
            const last  = `${row.ym}-${String(new Date(y, m, 0).getDate()).padStart(2, '0')}`;
            const mFrom = first > s.from ? first : s.from;
            const mTo   = last  < s.to   ? last  : s.to;
            // Σ lines: SAH of the month and the pieces of each line (rounded per line, like the Lines tab)
            let capMin = 0, usedMin = 0, capPcs = 0;
            if (mFrom <= mTo) for (const l of lines) {
                const ls = lineSummary(s, l, mFrom, mTo, load);
                capMin += ls.capMin; usedMin += ls.usedMin;
                capPcs += smv > 0 ? Math.round(ls.capMin / smv) : 0;
            }
            const reqMin = row.products.reduce((a, p) => a + p.qty * smvOf(p.product, u.code), 0);
            per[row.ym] = { cap : capMin, used : usedMin, capPcs, capSah : capMin / 60, reqSah : reqMin / 60,
                gapQty : capPcs - row.qty, pct : capPcs > 0 ? row.qty / capPcs : null };
            total.cap += capMin; total.used += usedMin; total.capPcs += capPcs; total.qty += row.qty; total.reqMin += reqMin;
        }
        per.total = { ...total, capSah : total.cap / 60, reqSah : total.reqMin / 60,
            gapQty : total.capPcs - total.qty, pct : total.capPcs > 0 ? total.qty / total.capPcs : null };
        out[u.code] = per;
    }
    return out;
});

// detailed order list of one unit + delivery month
const emOpen   = ref(false);
const emBusy   = ref(false);
const emUnit   = ref(null);              // HL_UNITS entry
const emMonth  = ref('');                // 'YYYY-MM' | 'none'
const emData   = shallowRef(null);       // { takenAt, rows } | { error }
const emBuyer  = ref('');
const emProd   = ref('');
const emGarment = ref('');
async function openErpMonth(u, ym) {
    const unit = HL_UNITS.find(x => x.code === u.code);
    if (!unit) return;
    emUnit.value = unit; emMonth.value = ym;
    emBuyer.value = ''; emProd.value = ''; emGarment.value = '';
    emData.value = null; emOpen.value = true; emBusy.value = true;
    try { emData.value = await hlErpMonthOrders(by(), unit.liveUnitId, ym); }
    catch (e) { emData.value = { error : e.message, rows : [] }; }
    finally { emBusy.value = false; }
}
const emOptions = computed(() => {
    const rows = emData.value?.rows || [];
    const uniq = k => [...new Set(rows.map(r => r[k]).filter(Boolean))].sort();
    return { buyers : uniq('buyer'), products : uniq('product'), garments : uniq('garment') };
});
const emRows = computed(() => (emData.value?.rows || []).filter(r =>
    (!emBuyer.value || r.buyer === emBuyer.value) &&
    (!emProd.value || r.product === emProd.value) &&
    (!emGarment.value || r.garment === emGarment.value)));
const emTotal = computed(() => emRows.value.reduce((a, r) => ({ qty : a.qty + r.qty, outstanding : a.outstanding + r.outstanding }), { qty : 0, outstanding : 0 }));
// product-wise view of the clicked month: order load per product type against
// the month's capacity (scenario SMV; capacity pcs = month minutes / SMV)
const emProducts = computed(() => {
    void tick.value;
    const u = emUnit.value;
    if (!u) return [];
    const month = erpMonthByUnit.value[u.code]?.months.find(m => m.ym === emMonth.value);
    const capMin = monthCapRes.value[u.code]?.[emMonth.value]?.cap || 0;
    return (month?.products || []).map(p => {
        const smv = smvOf(p.product, u.code);
        const reqMin = p.qty * smv;
        return { ...p, smv : Math.round(smv * 10) / 10, reqH : reqMin / 60,
            capAlone : smv > 0 ? Math.round(capMin / smv) : 0,
            share : capMin > 0 ? reqMin / capMin : null };
    });
});
// reservation status in the OPEN scenario: the ERP order matched by code
// (reference import stores it as source 'live:CODE' / note CODE)
function emResStatus(r) {
    void tick.value;
    const s = sc.value;
    if (!s) return '—';
    const o = s.orders.find(x => x.source === `live:${r.order}` || x.note === r.order);
    if (!o) return '—';
    const rs = s.reservations.filter(x => x.orderId === o.id && x.status !== 'cancelled');
    if (!rs.length) return 'in scenario · not reserved';
    const q = rs.reduce((a, x) => a + (Number(x.qty) || 0), 0);
    return `reserved ${fmtQty(q)} pcs · ${rs.length} line(s)${rs.some(x => x.locked) ? ' · 🔒' : ''}`;
}
const emOverdueToday = ymd(new Date());

// ---------------------------------------------------------------------------

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
    loadErpMonthly();
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
            <button class="cal-btn st-btn hl-btn" :disabled="!sc" @click="runAutoPlan">🤖 Test Auto Planning</button>
            <span class="hl-sep"></span>
            <button class="cal-btn st-btn hl-btn hl-primary" :disabled="!sc || abBusy" title="Contract unit first → other compatible internal units → all remaining excess to GSL (proposal in this scenario)" @click="openAutoBalance">⚖️ Auto Balance All Orders</button>
            <button class="cal-btn st-btn hl-btn" :disabled="!sc" title="Product × unit capacity, proposals, exclusions, manual moves and locks" @click="pwOpen = true">🧩 Product-Wise Allocation</button>
            <button class="cal-btn st-btn hl-btn" :disabled="!sc" title="Every quantity sent to the GSL overflow pool, with its external confirmation status" @click="gpOpen = true">🌐 Excess / GSL Pool</button>
            <button class="cal-btn st-btn hl-btn" :disabled="!sc" title="Original demand vs proposed allocation — monthly, unit, buyer and product views" @click="baOpen = true">📊 Before &amp; After</button>
            <button class="cal-btn st-btn hl-btn" :disabled="!sc" title="Remove the unlocked proposed allocations (locked ones and manual reservations stay)" @click="resetProposed">↩ Reset Proposed</button>
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
            <button class="cal-btn st-btn hl-btn" :disabled="!sc" title="Available capacity of every line by date / week / month from the line setup (manpower × hours × efficiency, unit calendar) minus the reservations — pieces at the unit average SMV or SAH" @click="capPeriod = viewMode; capOpen = true">📈 Available capacity</button>
            <label class="hl-lbl">Buyer <select v-model="fBuyer" class="cal-in hl-sel-s"><option value="">all</option><option v-for="b in buyers" :key="b" :value="b">{{ b }}</option></select></label>
            <label class="hl-lbl">Product <select v-model="fProduct" class="cal-in hl-sel-s"><option value="">all</option><option v-for="p in (sc?.products || [])" :key="p.name" :value="p.name">{{ p.name }}</option></select></label>
            <template v-if="sc">
                <label class="hl-lbl">Range <input type="date" class="cal-in hl-date" :value="sc.from" @change="mutate('range', s => { s.from = $event.target.value; })"> → <input type="date" class="cal-in hl-date" :value="sc.to" @change="mutate('range', s => { s.to = $event.target.value; })"></label>
            </template>
            <span class="hl-legend">
                <i class="hl-lg hl-day-idle"></i>idle <i class="hl-lg hl-day-available"></i>available <i class="hl-lg hl-day-partial"></i>partial <i class="hl-lg hl-day-full"></i>full <i class="hl-lg hl-day-overloaded"></i>overloaded <i class="hl-lg hl-day-holiday"></i>holiday <i class="hl-lg hl-day-off"></i>off day <i class="hl-lg hl-day-inactive"></i>inactive
                <i class="hl-lg hl-lg-res"></i>reservation <i class="hl-lg hl-lg-contract"></i>contract unit <i class="hl-lg hl-lg-transfer"></i>cross-unit transfer <i class="hl-lg hl-lg-gsl"></i>GSL overflow <i class="hl-lg hl-lg-pend"></i>pending ext. confirmation <i class="hl-lg hl-lg-ontime"></i>auto plan on time <i class="hl-lg hl-lg-pcd"></i>PCD not met <i class="hl-lg hl-lg-late2"></i>delivery not met <i class="hl-lg hl-lg-live"></i>live load (snapshot) <i class="hl-lg hl-lg-lock"></i>locked <i class="hl-lg hl-lg-conf"></i>conflict <i class="hl-lg hl-lg-late"></i>after delivery
            </span>
            <span v-if="conflictList.length" class="hl-warn">⚠ {{ conflictList.length }} overloaded line-day(s)</span>
            <span v-if="reconcileIssues.length" class="hl-warn">⚠ {{ reconcileIssues.length }} reservation(s) do not reconcile</span>
        </div>

        <div v-if="sc" class="hl-units">
            <div v-for="u in sc.units" :key="u.code" class="hl-unit-card" :class="`hl-uc-${(unitStats[u.code]?.util || 0) > 1 ? 'over' : (unitStats[u.code]?.util || 0) >= (sc.thresholds.full || 0.9) ? 'full' : (unitStats[u.code]?.util || 0) >= (sc.thresholds.partial || 0.4) ? 'partial' : 'ok'}`">
                <div class="hl-uc-head"><b>{{ u.name }}</b> <span class="hl-dim">{{ u.label }} · {{ unitStats[u.code]?.activeLines }}/{{ unitStats[u.code]?.lines }} lines · {{ u.hours }}h{{ u.ot ? `+${u.ot}` : '' }}</span>
                    <span v-if="erpMonthByUnit[u.code]?.total.orders" class="hl-uc-oq" :title="`Total active ERP order quantity of production unit ${u.label} (all delivery months) · ${fmtQty(erpMonthByUnit[u.code].total.orders)} orders · outstanding ${fmtQty(erpMonthByUnit[u.code].total.outstanding)} pcs`">Order qty <b>{{ fmtQty(erpMonthByUnit[u.code].total.qty) }}</b> pcs <i class="hl-dim">· {{ fmtQty(erpMonthByUnit[u.code].total.orders) }} orders</i></span>
                </div>
                <div v-if="erpMonthly" class="hl-uc-erp" :title="`ERP active production orders (mr_order_entry, status Active) with delivery from ${dmy(erpMonthly.from)} on, by PO delivery month, production unit ${u.label}. Capacity = the sum of the unit's lines for the month (Lines tab: Line SAH and Capacity pcs at the unit average SMV ${unitAvgSmv(u.code)}). Click a month for the product-wise breakdown (snapshot ${erpMonthly.takenAt || ''})`">
                    <span class="hl-uc-erp-t">Month wise capacity vs active orders <i class="hl-dim">· delivery after {{ dmy(addDays(erpMonthly.from || '', -1)) }} · avg SMV {{ unitAvgSmv(u.code) }}</i></span>
                    <div class="hl-em-scroll">
                        <table class="hl-em-tbl">
                            <thead><tr><th>Delivery month</th><th :title="`Σ of the lines' Capacity pcs for the month (Lines tab) — each line's SAH × 60 ÷ unit average SMV ${unitAvgSmv(u.code)}`">Capacity (pcs)</th><th title="Σ of the lines' Line SAH for the month (Lines tab) — manpower × (hours + OT) × efficiency, standard hours">Cap SAH</th><th title="Active ERP order quantity of the month (mr_order_entry, status Active, production unit of the order)">Order qty</th><th title="Order SAH — Σ order qty × ERP product SMV ÷ 60, standard hours required by the month's orders">Order SAH</th><th title="Capacity − order quantity (free pieces of the month)">Free qty</th><th title="Order quantity as % of capacity">Load %</th><th title="Quantity of this month's orders the auto plan could not place on the unit's lines (no capacity) — click for the orders">No capacity</th></tr></thead>
                            <tbody>
                                <tr v-for="m in erpMonthByUnit[u.code].months" :key="m.ym" :class="{ 'hl-em-over' : m.overdue, 'hl-em-cur' : m.ym === thisYm }"
                                    :title="m.overdue ? 'Overdue — delivery month already past, order still Active in ERP' : `${m.orders} order(s), outstanding ${fmtQty(m.outstanding)} pcs — click for the product-wise breakdown`"
                                    @click="openErpMonth(u, m.ym)">
                                    <td>{{ m.overdue ? '⚠ ' : '' }}{{ m.label }}</td>
                                    <td class="hl-r">{{ fmtQty(monthCapRes[u.code]?.[m.ym]?.capPcs) }}</td>
                                    <td class="hl-r">{{ fmtQty(Math.round(monthCapRes[u.code]?.[m.ym]?.capSah || 0)) }}</td>
                                    <td class="hl-r">{{ fmtQty(m.qty) }}</td>
                                    <td class="hl-r" :class="{ 'hl-em-neg' : (monthCapRes[u.code]?.[m.ym]?.reqSah || 0) > (monthCapRes[u.code]?.[m.ym]?.capSah || 0) }">{{ fmtQty(Math.round(monthCapRes[u.code]?.[m.ym]?.reqSah || 0)) }}</td>
                                    <td class="hl-r" :class="{ 'hl-em-neg' : (monthCapRes[u.code]?.[m.ym]?.gapQty || 0) < 0 }">{{ fmtQty(monthCapRes[u.code]?.[m.ym]?.gapQty) }}</td>
                                    <td class="hl-r" :class="{ 'hl-em-neg' : (monthCapRes[u.code]?.[m.ym]?.pct || 0) > 1 }">{{ monthCapRes[u.code]?.[m.ym]?.pct != null ? fmtPct(monthCapRes[u.code][m.ym].pct) : '—' }}</td>
                                    <td class="hl-r hl-nc" :class="{ 'hl-em-neg' : noCapByUnit[u.code]?.months[m.ym]?.qty }" :title="noCapByUnit[u.code]?.months[m.ym] ? `${noCapByUnit[u.code].months[m.ym].orders} order(s) without capacity — click for the list` : 'nothing without capacity'" @click.stop="noCapByUnit[u.code]?.months[m.ym] && openNoCap(u, m.ym)">{{ noCapByUnit[u.code]?.months[m.ym] ? fmtQty(noCapByUnit[u.code].months[m.ym].qty) : '—' }}</td>
                                </tr>
                                <tr v-if="!erpMonthByUnit[u.code].months.length"><td colspan="8" class="hl-dim">No active ERP orders for this unit.</td></tr>
                            </tbody>
                            <tfoot v-if="erpMonthByUnit[u.code].months.length">
                                <tr><td><b>Total</b></td>
                                    <td class="hl-r"><b>{{ fmtQty(monthCapRes[u.code]?.total?.capPcs) }}</b></td>
                                    <td class="hl-r"><b>{{ fmtQty(Math.round(monthCapRes[u.code]?.total?.capSah || 0)) }}</b></td>
                                    <td class="hl-r"><b>{{ fmtQty(erpMonthByUnit[u.code].total.qty) }}</b></td>
                                    <td class="hl-r" :class="{ 'hl-em-neg' : (monthCapRes[u.code]?.total?.reqSah || 0) > (monthCapRes[u.code]?.total?.capSah || 0) }"><b>{{ fmtQty(Math.round(monthCapRes[u.code]?.total?.reqSah || 0)) }}</b></td>
                                    <td class="hl-r" :class="{ 'hl-em-neg' : (monthCapRes[u.code]?.total?.gapQty || 0) < 0 }"><b>{{ fmtQty(monthCapRes[u.code]?.total?.gapQty) }}</b></td>
                                    <td class="hl-r" :class="{ 'hl-em-neg' : (monthCapRes[u.code]?.total?.pct || 0) > 1 }"><b>{{ monthCapRes[u.code]?.total?.pct != null ? fmtPct(monthCapRes[u.code].total.pct) : '—' }}</b></td>
                                    <td class="hl-r hl-nc" :class="{ 'hl-em-neg' : noCapByUnit[u.code]?.total }" :title="noCapByUnit[u.code] ? `${noCapByUnit[u.code].orders} order(s) without capacity — click for the list` : ''" @click.stop="noCapByUnit[u.code] && openNoCap(u, 'total')"><b>{{ noCapByUnit[u.code] ? fmtQty(noCapByUnit[u.code].total) : '—' }}</b></td></tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="erpMonthly && (erpMonthByUnit.other.total.qty || erpMonthly.error)" class="hl-erp-other">
            <template v-if="erpMonthly.error">ERP order load not available: {{ erpMonthly.error }}</template>
            <template v-else>Other production units (not on this board): <b>{{ fmtQty(erpMonthByUnit.other.total.qty) }}</b> pcs / {{ fmtQty(erpMonthByUnit.other.total.orders) }} active orders · all units together <b>{{ fmtQty(erpMonthly.grand.qty) }}</b> pcs / {{ fmtQty(erpMonthly.grand.orders) }} active orders · outstanding <b>{{ fmtQty(erpMonthly.grand.outstanding) }}</b> pcs</template>
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
                        <tr><td>Span</td><td>{{ dmy(resRow.start) }} → {{ dmy(resRow.end) }} · {{ resDays?.days.length }} working day(s) · SMV {{ Math.round((resDays?.smv || 0) * 100) / 100 }}</td></tr>
                        <tr><td>Status</td><td>{{ resRow.status }}{{ resRow.locked ? ' · 🔒 locked' : '' }}{{ resRow.source === 'live' ? ' · live load snapshot' : '' }}</td></tr>
                        <tr v-if="resRow.kind"><td>Allocation</td><td><span :class="`hl-k-${resRow.kind}`">{{ KIND_LABEL[resRow.kind] || resRow.kind }}</span>{{ resRow.fromUnit && resLine && resRow.fromUnit !== resLine.unitCode ? ` · contract ${unitName(resRow.fromUnit)} → ${unitName(resLine.unitCode)}` : '' }}{{ resOrder?.garment ? ` · ${resOrder.garment}` : '' }}</td></tr>
                        <tr v-if="resRow.reason"><td>Reason</td><td>{{ resRow.reason }}</td></tr>
                        <tr v-if="resRow.kind === 'gsl' || resLine?.pool"><td>External capacity</td><td><select :value="resRow.extStatus || 'pending'" class="cal-in hl-sel-s" @change="gpSetStatus(resRow, $event.target.value)"><option v-for="(l, k) in EXT_STATUS" :key="k" :value="k">{{ l }}</option></select> <i class="hl-dim">GSL is an unlimited pool — this window is the required production window, not confirmed capacity</i></td></tr>
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
                <div class="st-body hl-apu">
                    <div class="hl-apu-head"><b>▶ Auto plan — unit-wise, by the planning rules</b> <span class="hl-dim">every order of the unit on the unit's own lines · delivery must be met</span>
                        <span class="hl-gap"></span>
                        <label v-for="u in APU_UNITS" :key="u" class="hl-dow"><input type="checkbox" :checked="apuUnits.includes(u)" @change="apuUnits = $event.target.checked ? [...apuUnits, u] : apuUnits.filter(x => x !== u)">{{ unitName(u) }}</label>
                        <button class="cal-btn st-btn hl-btn" :disabled="apuBusy" title="Import / refresh the ERP active orders into this scenario, grouped by buyer + production unit + style + colour + PCD + delivery date (one bar per group; repeat orders are detected from the style's earlier orders)" @click="apuImport">⬇ Import ERP orders</button>
                        <button class="cal-btn cal-btn-primary st-btn hl-btn" :disabled="apuBusy" @click="apuRun">▶ Auto plan</button>
                        <button class="cal-btn st-btn hl-btn hl-primary" :disabled="!apuResult" title="Put the proposal on the board (grey / orange / red bars) — Save to keep" @click="apuApply">📌 Apply to board</button>
                    </div>
                    <div class="hl-apu-rules">
                        <label class="hl-lbl">Input date: new style PCD + <input v-model.number="apuRules.newLead" type="number" min="0" class="cal-in hl-num hl-num-s"> d</label>
                        <label class="hl-lbl">repeat / carry-over PCD + <input v-model.number="apuRules.repeatLead" type="number" min="0" class="cal-in hl-num hl-num-s"> d</label>
                        <span class="hl-sep"></span>
                        <label class="hl-lbl">Learning curve: SMV &lt; <input v-model.number="apuRules.lcSmvLow" type="number" class="cal-in hl-num hl-num-s"> → <input v-model.number="apuRules.lcDaysLow" type="number" min="0" class="cal-in hl-num hl-num-s"> d</label>
                        <label class="hl-lbl">to <input v-model.number="apuRules.lcSmvHigh" type="number" class="cal-in hl-num hl-num-s"> → <input v-model.number="apuRules.lcDaysMid" type="number" min="0" class="cal-in hl-num hl-num-s"> d</label>
                        <label class="hl-lbl">above → <input v-model.number="apuRules.lcDaysHigh" type="number" min="0" class="cal-in hl-num hl-num-s"> d</label>
                        <label class="hl-lbl">G-STAR <input v-model.number="apuRules.gstar" type="number" min="0" class="cal-in hl-num hl-num-s"> d</label>
                        <label class="hl-lbl">no curve for <input v-model="apuRules.noLc" class="cal-in hl-txt" placeholder="buyers, comma separated"></label>
                        <label class="hl-chk"><input v-model="apuRules.repeatNoLc" type="checkbox"> repeat order: no learning curve</label>
                        <span class="hl-sep"></span>
                        <label class="hl-lbl" title="Day capacity rule: every day of a bar must give the order at least this share of the line's day capacity (the last day, which takes the remainder, excepted) — a busy line never gets a small order spread over many days of crumbs; the bar waits for a day it can really run on">Day capacity: bar day fills ≥ <input v-model.number="apuRules.minFillPct" type="number" min="5" max="100" class="cal-in hl-num hl-num-s"> % of line capacity</label>
                    </div>
                    <div v-if="apuResult" class="hl-apu-result">
                        <div class="hl-ab-sum">
                            <span><b>{{ fmtQty(apuResult.summary.orders) }}</b> orders · <b>{{ fmtQty(apuResult.summary.qty) }}</b> pcs · placed <b>{{ fmtQty(apuResult.summary.placed) }}</b></span>
                            <span class="hl-ps-chip hl-ps-ontime">on time {{ apuResult.summary.ontime }}</span>
                            <span class="hl-ps-chip hl-ps-pcd">PCD not met {{ apuResult.summary.pcd }}</span>
                            <span class="hl-ps-chip hl-ps-late">delivery not met {{ apuResult.summary.late }}</span>
                            <span class="hl-ps-chip hl-ps-unplaced">no capacity {{ apuResult.summary.unplaced }}</span>
                            <span class="hl-ps-chip hl-ps-crit" :class="{ 'hl-ps-none' : !apuResult.summary.critical }" title="orders whose delivery is not met or whose quantity has no capacity — the real problems of this plan">⚠ critical {{ apuResult.summary.critical }}<template v-if="apuResult.summary.maxLate"> · up to {{ apuResult.summary.maxLate }} d late</template><template v-if="apuResult.summary.shortQty"> · {{ fmtQty(apuResult.summary.shortQty) }} pcs short</template></span>
                            <span v-if="apuResult.summary.stretched" class="hl-dim" title="bars running well under the line's day capacity (more bar days than the work needs)">{{ apuResult.summary.stretched }} stretched</span>
                            <span class="hl-dim">{{ apuResult.summary.removed }} previous proposal(s) replaced on apply</span>
                            <span class="hl-gap"></span>
                            <input v-model="apuFilter" class="cal-in hl-txt" placeholder="filter order / buyer / style">
                        </div>
                        <div class="hl-scroll hl-apu-scroll">
                            <table class="hl-table hl-table-s hl-apu-tbl">
                                <thead><tr><th>Status</th><th>Unit</th><th>Order</th><th>Buyer</th><th>Style · product</th><th>Qty</th><th>PCD</th><th>Input date</th><th>Delivery</th><th>Start</th><th>Finish</th><th>LC</th><th>Lines</th><th title="bar days on the board / working days the quantity needs at the lines' full day capacity">Days</th><th title="share of the bar days' line capacity the order fills">Fill</th><th>Critical</th><th>How</th></tr></thead>
                                <tbody>
                                    <tr v-for="r in apuRows" :key="r.orderId">
                                        <td><span class="hl-ps-chip" :class="`hl-ps-${r.status}`">{{ PLAN_STATUS[r.status] }}</span></td>
                                        <td>{{ unitName(r.unit) }}</td><td><b>{{ r.code || r.style }}</b></td><td>{{ r.buyer }}</td><td>{{ r.style }}<span v-if="r.color"> · {{ r.color }}</span><span class="hl-dim"> · {{ r.product }}</span></td>
                                        <td class="hl-r">{{ fmtQty(r.qty) }}<span v-if="r.open !== r.qty" class="hl-dim"> ({{ fmtQty(r.open) }} open)</span></td>
                                        <td>{{ dmy(r.pcd) }}</td><td :title="r.repeat ? `repeat order${r.repeatOf ? ' of ' + r.repeatOf : ''}: PCD + ${apuRules.repeatLead} d` : `new style: PCD + ${apuRules.newLead} d`">{{ dmy(r.inputDate) }}<span class="hl-dim"> {{ r.repeat ? '↻' : '✦' }}</span></td>
                                        <td>{{ dmy(r.delivery) }}</td>
                                        <td :class="{ 'hl-late' : r.inputDate && r.start && r.start < r.inputDate }">{{ dmy(r.start) }}</td>
                                        <td :class="{ 'hl-late' : r.finish && r.deadline && r.finish > r.deadline }">{{ dmy(r.finish) }}</td>
                                        <td class="hl-r">{{ r.lcDays ? r.lcDays + ' d' : '—' }}</td><td class="hl-r">{{ r.lines || '—' }}</td>
                                        <td class="hl-r" :class="{ 'hl-warn' : r.stretched }">{{ r.barDays ? `${r.barDays} / ${r.needDays}` : '—' }}</td>
                                        <td class="hl-r" :class="{ 'hl-warn' : r.stretched }">{{ r.fill != null ? Math.round(r.fill * 100) + ' %' : '—' }}</td>
                                        <td class="hl-crit" :class="{ 'hl-late' : r.lateDays || r.status === 'unplaced' || r.shortQty > 0, 'hl-warn' : !(r.lateDays || r.status === 'unplaced' || r.shortQty > 0) && r.critical.length }" :title="r.critical.join(' · ')">{{ r.critical.length ? r.critical.join(' · ') : '—' }}</td>
                                        <td class="hl-dim hl-reason" :title="r.attempt + (r.note ? ' · ' + r.note : '')">{{ r.attempt }}{{ r.note ? ' · ' + r.note : '' }}</td>
                                    </tr>
                                    <tr v-if="!apuRows.length"><td colspan="17" class="hl-dim">No order in the chosen unit(s).</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="st-hint">↻ repeat order (PCD + {{ apuRules.repeatLead }} d, no learning curve) · ✦ new style (PCD + {{ apuRules.newLead }} d, learning curve by SMV / buyer). Grey = starts on the input date and finishes by delivery; orange = delivery met only by starting before the input date; red = delivery cannot be met (planned from the input date anyway so the overrun shows). Day capacity: a bar runs at the line's day capacity (every bar day fills at least the set share), so <b>Days</b> = bar days / days the work needs and <b>Fill</b> = how full those days are; <b>Critical</b> names what really fails — days late, pieces without capacity, a start before the input date, or a stretched bar. Applying replaces this scenario's earlier auto-plan proposals of these orders (locked ones stay).</div>
                    </div>
                </div>
                <div class="st-body hl-ord-body">
                    <div class="hl-ord-left">
                        <div class="hl-scroll hl-ord-scroll">
                            <table class="hl-table hl-table-s">
                                <thead><tr><th>Buyer</th><th>Style / order</th><th>Colour</th><th>Product</th><th>Qty</th><th>PCD</th><th>Delivery</th><th>Unit</th><th>Reserved</th><th>Finish</th><th></th></tr></thead>
                                <tbody>
                                    <tr v-for="o in orderRows" :key="o.id" :class="{ 'hl-sel' : o.id === ordSel }" @click="ordEdit(o)">
                                        <td>{{ o.buyer }}</td><td>{{ o.style }}<span v-if="o.note" class="hl-dim" :title="o.pos ? `${o.pos} PO: ${o.po}` : ''"> {{ o.note }}</span></td><td>{{ o.color || '—' }}</td><td>{{ o.product }}</td><td class="hl-r">{{ fmtQty(o.qty) }}</td><td>{{ dmy(o.pcd) }}</td><td>{{ dmy(o.delivery) }}</td><td>{{ o.unitCode || '—' }}</td>
                                        <td class="hl-r" :class="{ 'hl-short' : o.open > 0 && o.reserved > 0, 'hl-ok' : o.open === 0 }">{{ fmtQty(o.reserved) }}<span v-if="o.lines"> / {{ o.lines }} ln</span></td>
                                        <td :class="{ 'hl-late' : o.finish && o.finish > o.delivery }">{{ dmy(o.finish) }}</td>
                                        <td><span class="hl-x-small" @click.stop="ordRemove(o)">✖</span></td>
                                    </tr>
                                    <tr v-if="!orderRows.length"><td colspan="11" class="hl-dim">No orders in this scenario — add one on the right, or import reference data.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="hl-ord-right">
                        <div class="hl-form">
                            <label>Buyer <input v-model="ordForm.buyer" class="cal-in" list="hl-buyers"><datalist id="hl-buyers"><option v-for="b in buyers" :key="b" :value="b"></option></datalist></label>
                            <label>Style / order <input v-model="ordForm.style" class="cal-in"></label>
                            <label>Colour <input v-model="ordForm.color" class="cal-in" placeholder="optional"></label>
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

        <!-- ERP monthly order details (read only) -->
        <div v-if="emOpen" class="cal-overlay" @click.self="emOpen = false">
            <div class="cal-dialog pf-dialog hl-dialog hl-em-dialog">
                <div class="cal-title">📅 {{ emUnit?.name }} · {{ emUnit?.label }} — active orders, delivery {{ ymLabel(emMonth) }}
                    <span class="cal-title-btns"><span class="cal-x" @click="emOpen = false">✕</span></span></div>
                <div class="st-body">
                    <table v-if="emProducts.length" class="hl-table hl-table-s hl-em-prods">
                        <thead><tr><th>Product wise</th><th>Orders</th><th>Order qty</th><th>Outstanding</th><th title="ERP average SMV of the product type on this unit (quantity-weighted over its styles); the scenario product or the unit average when ERP has none">SMV</th><th title="Hours this quantity needs (qty × SMV)">Required</th><th title="Month capacity if the unit made only this product">Capacity (pcs)</th><th title="Required hours as % of the month's capacity">Load %</th></tr></thead>
                        <tbody>
                            <tr v-for="p in emProducts" :key="p.product" :class="{ 'hl-sel' : emProd === p.product }" title="Click to filter the order list below by this product" @click="emProd = emProd === p.product ? '' : p.product">
                                <td><b>{{ p.product }}</b></td>
                                <td class="hl-r">{{ fmtQty(p.orders) }}</td>
                                <td class="hl-r">{{ fmtQty(p.qty) }}</td>
                                <td class="hl-r">{{ fmtQty(p.outstanding) }}</td>
                                <td class="hl-r">{{ p.smv }}</td>
                                <td class="hl-r">{{ fmtQty(Math.round(p.reqH)) }} h</td>
                                <td class="hl-r">{{ fmtQty(p.capAlone) }}</td>
                                <td class="hl-r" :class="{ 'hl-em-neg' : (p.share || 0) > 1 }">{{ p.share != null ? fmtPct(p.share) : '—' }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="hl-actions">
                        <label class="hl-lbl">Buyer <select v-model="emBuyer" class="cal-in hl-sel-s"><option value="">all</option><option v-for="b in emOptions.buyers" :key="b" :value="b">{{ b }}</option></select></label>
                        <label class="hl-lbl">Product <select v-model="emProd" class="cal-in hl-sel-s"><option value="">all</option><option v-for="p in emOptions.products" :key="p" :value="p">{{ p }}</option></select></label>
                        <label class="hl-lbl">Garment type <select v-model="emGarment" class="cal-in hl-sel-s"><option value="">all</option><option v-for="g in emOptions.garments" :key="g" :value="g">{{ g }}</option></select></label>
                        <span class="hl-gap"></span>
                        <span class="hl-dim">{{ fmtQty(emRows.length) }} order(s) · {{ fmtQty(emTotal.qty) }} pcs · outstanding {{ fmtQty(emTotal.outstanding) }} pcs · ERP read only{{ emData?.takenAt ? ` · snapshot ${emData.takenAt}` : '' }}</span>
                    </div>
                    <div v-if="emBusy" class="hl-dim">Loading the ERP order list…</div>
                    <div v-else-if="emData?.error" class="hl-warn">ERP order list not available: {{ emData.error }}</div>
                    <div v-else class="hl-scroll">
                        <table class="hl-table hl-table-s hl-em-list">
                            <thead><tr><th>Buyer</th><th>Order / PO</th><th>Style</th><th>Product type</th><th>Garment type</th><th>Order qty</th><th>Outstanding</th><th>PCD</th><th>Delivery</th><th>Reservation status</th></tr></thead>
                            <tbody>
                                <tr v-for="r in emRows" :key="r.order" :class="{ 'hl-em-over' : r.deliveryMax && r.deliveryMax < emOverdueToday }">
                                    <td>{{ r.buyer }}</td>
                                    <td><b>{{ r.order }}</b><span v-if="r.pos" class="hl-dim" :title="r.poList"> · {{ r.pos }} PO{{ r.pos > 1 ? 's' : '' }}</span></td>
                                    <td>{{ r.style }}</td><td>{{ r.product || '—' }}</td><td>{{ r.garment || '—' }}</td>
                                    <td class="hl-r">{{ fmtQty(r.qty) }}</td><td class="hl-r">{{ fmtQty(r.outstanding) }}</td>
                                    <td>{{ dmy(r.pcd) }}</td>
                                    <td :title="r.deliveryMax && r.deliveryMax !== r.delivery ? `POs of this month deliver ${dmy(r.delivery)} → ${dmy(r.deliveryMax)}` : ''">{{ dmy(r.delivery) }}{{ r.deliveryMax && r.deliveryMax !== r.delivery ? ` → ${dmy(r.deliveryMax)}` : '' }}{{ r.deliveryMax && r.deliveryMax < emOverdueToday ? ' ⚠' : '' }}</td>
                                    <td class="hl-dim">{{ emResStatus(r) }}</td>
                                </tr>
                                <tr v-if="!emRows.length"><td colspan="10" class="hl-dim">No active orders match the filters.</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="st-hint">Quantities are PO quantities of this delivery month (an order whose POs deliver in other months shows there too, without double counting). Outstanding = PO quantity − exported quantity from ERP. ⚠ = delivery date already past while the order is still Active. Nothing here changes ERP or the live plan.</div>
                </div>
            </div>
        </div>

        <!-- Auto Balance — options -->
        <div v-if="abOpen && sc" class="cal-overlay" @click.self="!abBusy && (abOpen = false)">
            <div class="cal-dialog pf-dialog hl-dialog hl-ab-dialog">
                <div class="cal-title">⚖️ Auto Balance All Orders — {{ sc.name }} <span class="cal-title-btns"><span class="cal-x" @click="!abBusy && (abOpen = false)">✕</span></span></div>
                <div class="st-body">
                    <div class="hl-result-row"><b>Rule:</b> contract unit first → other compatible internal units → all remaining excess to the GSL overflow pool (unlimited, pending external confirmation). MBM / CEIL / AQL are never loaded past their simulated capacity. The result is a <b>proposal</b> in this scenario only — the live ERP and the factory boards are never changed.</div>
                    <div class="hl-ab-grid">
                        <div class="hl-ab-box">
                            <div class="hl-ab-h">Orders</div>
                            <label class="hl-chk"><input v-model="abOpt.importOrders" type="checkbox"> Import / refresh the ERP active orders first <i class="hl-dim">(mr_order_entry Active, delivery after the cut-off, contract unit = production unit; {{ abErp?.rows ? fmtQty(abErp.rows.length) + ' orders' : abErp?.error ? 'ERP not available' : 'loading…' }})</i></label>
                            <label class="hl-chk"><input v-model="abOpt.useOutstanding" type="checkbox"> Plan the outstanding quantity (PO qty − exported) instead of the order quantity</label>
                            <div class="hl-ab-row">
                                <label class="hl-lbl">Contract units <label v-for="u in SCOPE_UNITS" :key="u" class="hl-dow" :title="u === 'G' ? 'Orders whose ERP production unit is GSL go straight to the pool (outside production)' : ''"><input type="checkbox" :checked="abOpt.units.includes(u)" @change="abOpt.units = $event.target.checked ? [...abOpt.units, u] : abOpt.units.filter(x => x !== u)">{{ unitName(u) }}</label></label>
                            </div>
                            <div class="hl-ab-row hl-ab-sel">
                                <label class="hl-lbl">Buyers <select v-model="abOpt.buyers" multiple class="cal-in hl-multi"><option v-for="b in abChoices.buyers" :key="b" :value="b">{{ b }}</option></select></label>
                                <label class="hl-lbl">Delivery months <select v-model="abOpt.months" multiple class="cal-in hl-multi"><option v-for="m in abChoices.months" :key="m" :value="m">{{ ymLabel(m) }}</option></select></label>
                                <label class="hl-lbl">Product types <select v-model="abOpt.products" multiple class="cal-in hl-multi"><option v-for="p in abChoices.products" :key="p" :value="p">{{ p }}</option></select></label>
                            </div>
                            <div class="hl-dim">Nothing selected = all. Ctrl / Cmd-click to pick several.</div>
                        </div>
                        <div class="hl-ab-box">
                            <div class="hl-ab-h">Capacity &amp; rules</div>
                            <div class="hl-ab-row"><label class="hl-lbl">Planning window <input v-model="abOpt.from" type="date" class="cal-in hl-date"> → <input v-model="abOpt.to" type="date" class="cal-in hl-date"></label> <i class="hl-dim">inside the scenario range {{ dmy(sc.from) }} → {{ dmy(sc.to) }}</i></div>
                            <label class="hl-chk"><input v-model="abOpt.includeLive" type="checkbox"> Imported live-load snapshot bars count as taken capacity</label>
                            <label class="hl-chk"><input v-model="abOpt.allowTransfer" type="checkbox"> Allow cross-unit transfer to other internal units</label>
                            <div class="hl-ab-row hl-ab-tr"><span class="hl-dim">Transfer priority:</span>
                                <label class="hl-lbl">MBM → <input v-model="abOpt.transfers.M" class="cal-in hl-tr-in" placeholder="C,A"></label>
                                <label class="hl-lbl">CEIL → <input v-model="abOpt.transfers.C" class="cal-in hl-tr-in" placeholder="M,A"></label>
                                <label class="hl-lbl">AQL → <input v-model="abOpt.transfers.A" class="cal-in hl-tr-in" placeholder="M,C"></label>
                                <i class="hl-dim">unit codes in order (M = MBM, C = CEIL, A = AQL); empty = no transfer out of that unit</i>
                            </div>
                            <label class="hl-chk"><input v-model="abOpt.allowGsl" type="checkbox"> Allow GSL overflow (all remaining excess → GSL — Outside Production Pool, unlimited)</label>
                            <div class="hl-ab-row"><label class="hl-lbl">Delivery lead <input v-model.number="abOpt.deliveryLead" type="number" min="0" max="60" class="cal-in hl-num"> days</label> <i class="hl-dim">sewing must finish this many days before the delivery date</i></div>
                            <div class="hl-dim">Product ↔ unit capability (which unit makes which product) is set on the <b>Product-Wise Allocation</b> panel. Locked reservations are never touched; previous unlocked proposals of the orders in scope are replaced, so re-running never duplicates.</div>
                        </div>
                    </div>
                    <div class="hl-actions hl-right">
                        <span v-if="sc.balance?.lastRun" class="hl-dim hl-gap">Last run {{ sc.balance.lastRun.at }}: {{ fmtQty(sc.balance.lastRun.orders) }} orders · contract {{ fmtQty(sc.balance.lastRun.contract) }} · transfer {{ fmtQty(sc.balance.lastRun.transfer) }} · GSL {{ fmtQty(sc.balance.lastRun.gsl) }} · unallocated {{ fmtQty(sc.balance.lastRun.unallocated) }}</span>
                        <button v-if="abBusy" class="cal-btn st-btn hl-btn hl-danger" @click="cancelAutoBalance">✖ Cancel</button>
                        <button class="cal-btn st-btn hl-btn" :disabled="abBusy" @click="abOpen = false">Close</button>
                        <button class="cal-btn cal-btn-primary st-btn hl-btn" :disabled="abBusy" @click="runAutoBalance">{{ abBusy ? '⏳ Balancing…' : '⚖️ Run Auto Balance' }}</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Auto Balance — proposal -->
        <div v-if="abResOpen && abResult && sc" class="cal-overlay" @click.self="abResOpen = false">
            <div class="cal-dialog pf-dialog hl-dialog hl-abr-dialog">
                <div class="cal-title">⚖️ Auto Balance — proposal (not applied yet) <span class="cal-title-btns"><span class="cal-x" @click="abResOpen = false">✕</span></span></div>
                <div class="st-body">
                    <div class="hl-ab-sum">
                        <span><b>{{ fmtQty(abResult.summary.orders) }}</b> orders · <b>{{ fmtQty(abResult.summary.qty) }}</b> pcs</span>
                        <span class="hl-k-contract">Contract units <b>{{ fmtQty(abResult.summary.contract) }}</b></span>
                        <span class="hl-k-transfer">Transferred <b>{{ fmtQty(abResult.summary.transfer) }}</b></span>
                        <span class="hl-k-gsl">GSL overflow <b>{{ fmtQty(abResult.summary.gsl) }}</b></span>
                        <span :class="{ 'hl-warn' : abResult.summary.unallocated }">Unallocated <b>{{ fmtQty(abResult.summary.unallocated) }}</b></span>
                        <span v-if="abResult.summary.kept">already reserved (kept / locked) <b>{{ fmtQty(abResult.summary.kept) }}</b></span>
                        <span :class="{ 'hl-warn' : abResult.summary.risk }">⚠ delivery-risk orders <b>{{ fmtQty(abResult.summary.risk) }}</b></span>
                        <span class="hl-dim">{{ abResult.imported ? `ERP: ${abResult.imported.added} new, ${abResult.imported.updated} updated order(s) · ` : '' }}{{ abResult.summary.removed }} previous proposal(s) replaced · {{ abResult.local ? 'computed in the browser' : 'computed by the API service' }} in {{ abResult.ms }} ms</span>
                    </div>
                    <div class="hl-scroll hl-abr-scroll">
                        <table class="hl-table hl-table-s hl-abr-tbl">
                            <thead><tr><th>Order</th><th>Buyer</th><th>Product · garment</th><th>Contract</th><th>Delivery</th><th>Qty</th><th>Contract unit</th><th>Transfers</th><th>GSL</th><th>Unallocated</th><th>Completion</th><th>Rule / reason</th></tr></thead>
                            <tbody>
                                <tr v-for="r in abResultRows" :key="r.orderId" :class="{ 'hl-short' : r.risk }">
                                    <td><b>{{ r.code || r.style }}</b></td><td>{{ r.buyer }}</td><td>{{ r.product }}<span v-if="r.garment" class="hl-dim"> · {{ r.garment }}</span></td><td>{{ unitName(r.contractUnit) }}</td><td>{{ dmy(r.delivery) }}</td>
                                    <td class="hl-r">{{ fmtQty(r.qty) }}<span v-if="r.kept" class="hl-dim"> ({{ fmtQty(r.kept) }} kept)</span></td>
                                    <td class="hl-r">{{ r.contract ? fmtQty(r.contract) : '—' }}</td>
                                    <td class="hl-r">{{ r.transfers.length ? r.transfers.map(t => `${unitName(t.unit)} ${fmtQty(t.qty)}`).join(', ') : '—' }}</td>
                                    <td class="hl-r hl-k-gsl">{{ r.gsl ? fmtQty(r.gsl) : '—' }}</td>
                                    <td class="hl-r" :class="{ 'hl-warn' : r.unallocated }">{{ r.unallocated ? fmtQty(r.unallocated) : '—' }}</td>
                                    <td :class="{ 'hl-late' : r.completion && r.delivery && r.completion > r.delivery }">{{ dmy(r.completion) }}</td>
                                    <td class="hl-dim hl-reason">{{ r.rule }}<span v-if="r.notes.length"> · {{ r.notes.join('; ') }}</span></td>
                                </tr>
                                <tr v-if="!abResultRows.length"><td colspan="12" class="hl-dim">No order in scope — check the filters (buyers / months / products / contract units) or import the ERP orders.</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="st-hint">Priority: delivery date, then ERP high priority, then contract unit. Each order is tested on its contract unit's compatible lines first, then on the other allowed units, and whatever is left goes to GSL as <b>Pending External Capacity Confirmation</b>. Applying puts the proposal on the board (teal = contract, purple = transfer, orange = GSL); move, split, lock or cancel bars there — capacity and the reports follow every change. Save the scenario to keep it.</div>
                    <div class="hl-actions hl-right">
                        <button class="cal-btn st-btn hl-btn" @click="abResOpen = false">Discard</button>
                        <button class="cal-btn cal-btn-primary st-btn hl-btn" @click="abApply">📌 Apply proposal to the scenario</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Product-Wise Allocation -->
        <div v-if="pwOpen && sc && allocRep" class="cal-overlay" @click.self="pwOpen = false">
            <div class="cal-dialog pf-dialog hl-dialog hl-pw-dialog">
                <div class="cal-title">🧩 Product-Wise Allocation — {{ sc.name }} <span class="cal-title-btns"><span class="cal-x" @click="pwOpen = false">✕</span></span></div>
                <div class="st-body">
                    <div class="hl-actions">
                        <label class="hl-lbl">Buyer <select v-model="pwF.buyer" class="cal-in hl-sel-s"><option value="">all</option><option v-for="b in pwChoices.buyers" :key="b" :value="b">{{ b }}</option></select></label>
                        <label class="hl-lbl">Contract unit <select v-model="pwF.unit" class="cal-in hl-sel-s"><option value="">all</option><option v-for="u in SCOPE_UNITS" :key="u" :value="u">{{ unitName(u) }}</option></select></label>
                        <label class="hl-lbl">Product <select v-model="pwF.product" class="cal-in hl-sel-s"><option value="">all</option><option v-for="p in pwChoices.products" :key="p" :value="p">{{ p }}</option></select></label>
                        <label class="hl-lbl">Garment <select v-model="pwF.garment" class="cal-in hl-sel-s"><option value="">all</option><option v-for="g in pwChoices.garments" :key="g" :value="g">{{ g }}</option></select></label>
                        <label class="hl-lbl">Delivery month <select v-model="pwF.month" class="cal-in hl-sel-s"><option value="">all</option><option v-for="m in pwChoices.months" :key="m" :value="m">{{ ymLabel(m) }}</option></select></label>
                        <label class="hl-lbl">Order <input v-model="pwF.order" class="cal-in hl-txt" placeholder="code / style / buyer"></label>
                        <span class="hl-gap"></span>
                        <span class="hl-dim">range {{ dmy(sc.from) }} → {{ dmy(sc.to) }} · {{ fmtQty(pwOrders.length) }} order(s)</span>
                    </div>
                    <table class="hl-table hl-table-s hl-pw-prod">
                        <thead><tr><th>Product</th><th>SMV</th><th v-for="u in [...ALL_UNITS, 'G']" :key="u" colspan="3" class="hl-c">{{ unitName(u) }}</th></tr>
                            <tr><th></th><th></th><template v-for="u in [...ALL_UNITS, 'G']" :key="u"><th title="Capacity of the unit's lines that make the product over the plan range, minus what other products already take, in pieces at the product SMV">Available</th><th title="Proposed / reserved quantity of the filtered orders in this unit">Proposed</th><th title="Available − proposed">Balance</th></template></tr></thead>
                        <tbody>
                            <tr v-for="p in pwProducts" :key="p.product" :class="{ 'hl-sel' : pwF.product === p.product }">
                                <td><b>{{ p.product }}</b></td><td class="hl-r">{{ Math.round(p.smv * 10) / 10 }}</td>
                                <template v-for="u in [...ALL_UNITS, 'G']" :key="u">
                                    <td v-if="p.units[u].pool" class="hl-r hl-k-gsl">Unlimited pool</td>
                                    <td v-else class="hl-r" :class="{ 'hl-dim' : !p.units[u].makes }">
                                        <label class="hl-chk-s" :title="p.units[u].makes ? `${unitName(u)} makes ${p.product} (${p.units[u].lines} line(s)) — untick to exclude it from Auto Balance` : `${unitName(u)} excluded for ${p.product}`"><input type="checkbox" :checked="p.units[u].makes" @change="pwToggleMakes(p.product, u)"></label>
                                        {{ p.units[u].makes ? (p.units[u].lines ? fmtQty(p.units[u].available) : 'no line') : 'excluded' }}
                                    </td>
                                    <td class="hl-r" :class="{ 'hl-k-gsl' : u === 'G' && p.units[u].proposed }">{{ p.units[u].proposed ? fmtQty(p.units[u].proposed) : '—' }}</td>
                                    <td v-if="p.units[u].pool" class="hl-r hl-dim">{{ p.units[u].proposed ? 'pending' : '—' }}</td>
                                    <td v-else class="hl-r" :class="{ 'hl-em-neg' : p.units[u].balance < 0 }">{{ p.units[u].makes ? fmtQty(p.units[u].balance) : '—' }}</td>
                                </template>
                            </tr>
                            <tr v-if="!pwProducts.length"><td colspan="14" class="hl-dim">No orders match the filters.</td></tr>
                        </tbody>
                    </table>
                    <div class="hl-actions">
                        <button class="cal-btn st-btn hl-btn" title="Auto Balance again only the filtered orders that still have unallocated quantity (locked allocations untouched)" @click="pwRerun">🔁 Re-run balancing for the remaining quantity</button>
                        <button class="cal-btn st-btn hl-btn" title="Lock every allocation of the filtered orders — Auto Balance leaves them unchanged" @click="pwLockAll(pwOrders, true)">🔒 Lock filtered allocations</button>
                        <button class="cal-btn st-btn hl-btn" @click="pwLockAll(pwOrders, false)">🔓 Unlock filtered</button>
                        <span class="hl-gap"></span>
                        <span v-if="allocBad.length" class="hl-warn">⚠ {{ allocBad.length }} order(s) do not reconcile</span>
                    </div>
                    <div class="hl-scroll hl-pw-scroll">
                        <table class="hl-table hl-table-s hl-pw-orders">
                            <thead><tr><th>Order</th><th>Buyer</th><th>Product · garment</th><th>Contract</th><th>Delivery</th><th>Qty</th><th v-for="u in [...ALL_UNITS, 'G']" :key="u" class="hl-r">{{ unitName(u) }}</th><th>Unallocated</th><th>Completion</th><th>Why</th><th>Move</th></tr></thead>
                            <tbody>
                                <tr v-for="o in pwOrders" :key="o.id" :class="{ 'hl-short' : o.risk }">
                                    <td><b>{{ o.code || o.style }}</b>{{ o.locked ? ' 🔒' : '' }}</td><td>{{ o.buyer }}</td><td>{{ o.product }}<span v-if="o.garment" class="hl-dim"> · {{ o.garment }}</span></td><td>{{ unitName(o.contractUnit) }}</td><td>{{ dmy(o.delivery) }}</td>
                                    <td class="hl-r">{{ fmtQty(o.qty) }}</td>
                                    <td v-for="u in [...ALL_UNITS, 'G']" :key="u" class="hl-r" :class="{ 'hl-k-contract' : u === o.contractUnit, 'hl-k-transfer' : u !== o.contractUnit && u !== 'G', 'hl-k-gsl' : u === 'G' }">{{ (u === 'G' ? o.gsl : u === o.contractUnit ? o.internal : o.transfers[u]) ? fmtQty(u === 'G' ? o.gsl : u === o.contractUnit ? o.internal : o.transfers[u]) : '—' }}<span v-if="u === 'G' && o.gsl" class="hl-dim"> {{ o.gslStatus }}</span></td>
                                    <td class="hl-r" :class="{ 'hl-warn' : o.unallocated }">{{ o.unallocated ? fmtQty(o.unallocated) : '—' }}</td>
                                    <td :class="{ 'hl-late' : o.completion && o.delivery && o.completion > o.delivery }">{{ dmy(o.completion) }}</td>
                                    <td class="hl-dim hl-reason" :title="o.reasons.join('\n')">{{ o.reasons[0] || '' }}</td>
                                    <td class="hl-nowrap"><input v-model.number="pwMoveQty[o.id]" type="number" min="1" class="cal-in hl-num" placeholder="pcs"> → <select v-model="pwMoveTo[o.id]" class="cal-in hl-sel-xs"><option value="">unit…</option><option v-for="u in [...ALL_UNITS, 'G']" :key="u" :value="u">{{ unitName(u) }}</option></select> <button class="cal-btn st-btn hl-btn" title="Move this quantity from the order's unlocked allocations (and its unallocated quantity) to the chosen unit" @click="pwMove(o)">➡</button> <button class="cal-btn st-btn hl-btn" :title="o.locked ? 'Unlock the allocations of this order' : 'Lock the allocations of this order'" @click="pwLock(o, !o.locked)">{{ o.locked ? '🔓' : '🔒' }}</button></td>
                                </tr>
                                <tr v-if="!pwOrders.length"><td colspan="16" class="hl-dim">No orders match the filters — run Auto Balance or import orders first.</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="st-hint">Untick a unit for a product to exclude it from automatic allocation (lines are not changed). Move takes pieces out of the order's unlocked allocations (unallocated pieces first) and fits them on the chosen unit's free compatible capacity — GSL takes any quantity. Locked allocations survive Auto Balance and re-runs.</div>
                </div>
            </div>
        </div>

        <!-- Orders without capacity (unit × delivery month) -->
        <div v-if="ncOpen && sc" class="cal-overlay" @click.self="ncOpen = false">
            <div class="cal-dialog pf-dialog hl-dialog hl-gp-dialog">
                <div class="cal-title">⛔ {{ unitName(ncUnit) }} — orders without capacity · {{ ncMonth === 'total' ? 'all delivery months' : ymLabel(ncMonth) }} <span class="cal-title-btns"><span class="cal-x" @click="ncOpen = false">✕</span></span></div>
                <div class="st-body">
                    <div class="hl-ab-sum"><span><b>{{ fmtQty(ncRows.length) }}</b> order(s) · order qty <b>{{ fmtQty(ncTotal.qty) }}</b> · without capacity <b class="hl-warn">{{ fmtQty(ncTotal.open) }}</b> pcs</span><span class="hl-dim">the quantity the auto plan could not place on the unit's own lines inside the plan range — give the unit more capacity (lines / hours), move it to another unit (Product-Wise Allocation) or send it to GSL (Auto Balance)</span></div>
                    <div class="hl-scroll hl-gp-scroll">
                        <table class="hl-table hl-table-s hl-gp-tbl">
                            <thead><tr><th>Order</th><th>Buyer</th><th>Style · product</th><th>Garment</th><th>Qty</th><th>Placed</th><th>No capacity</th><th>PCD</th><th>Input date</th><th>Delivery</th><th>Status</th><th>Why</th></tr></thead>
                            <tbody>
                                <tr v-for="r in ncRows" :key="r.id">
                                    <td><b>{{ r.code || r.style }}</b></td><td>{{ r.buyer }}</td><td>{{ r.style }}<span class="hl-dim"> · {{ r.product }}</span></td><td>{{ r.garment }}</td>
                                    <td class="hl-r">{{ fmtQty(r.qty) }}</td><td class="hl-r">{{ r.placed ? fmtQty(r.placed) : '—' }}</td><td class="hl-r hl-warn">{{ fmtQty(r.unallocated) }}</td>
                                    <td>{{ dmy(r.pcd) }}</td><td>{{ dmy(r.inputDate) }}<span class="hl-dim"> {{ r.repeat ? '↻' : '✦' }}</span></td><td>{{ dmy(r.delivery) }}</td>
                                    <td><span class="hl-ps-chip" :class="`hl-ps-${r.planStatus || 'unplaced'}`">{{ r.planStatus ? PLAN_STATUS[r.planStatus] : 'No capacity' }}</span></td>
                                    <td class="hl-dim hl-reason" :title="r.reason">{{ r.reason || 'no free compatible line capacity in the plan range' }}</td>
                                </tr>
                                <tr v-if="!ncRows.length"><td colspan="12" class="hl-dim">Nothing without capacity here.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Excess / GSL pool -->
        <div v-if="gpOpen && sc" class="cal-overlay" @click.self="gpOpen = false">
            <div class="cal-dialog pf-dialog hl-dialog hl-gp-dialog">
                <div class="cal-title">🌐 Excess / GSL Pool — GSL — Outside Production Pool <span class="cal-title-btns"><span class="cal-x" @click="gpOpen = false">✕</span></span></div>
                <div class="st-body">
                    <div class="hl-actions">
                        <label class="hl-lbl">Status <select v-model="gpStatus" class="cal-in hl-sel-s"><option value="">all</option><option v-for="(l, k) in EXT_STATUS" :key="k" :value="k">{{ l }}</option></select></label>
                        <span class="hl-gap"></span>
                        <span><b>{{ fmtQty(gpRows.length) }}</b> overflow allocation(s) · <b>{{ fmtQty(gpTotal.qty) }}</b> pcs · <b>{{ fmtQty(Math.round(gpTotal.sah)) }}</b> SAH required</span>
                    </div>
                    <div class="hl-scroll hl-gp-scroll">
                        <table class="hl-table hl-table-s hl-gp-tbl">
                            <thead><tr><th>Contract unit</th><th>Buyer</th><th>Order</th><th>PO</th><th>Style</th><th>Product</th><th>Garment</th><th>Delivery</th><th>Window</th><th>Overflow qty</th><th>Req. SAH</th><th>Reason</th><th>Status</th><th></th></tr></thead>
                            <tbody>
                                <tr v-for="r in gpRows" :key="r.id" :class="`hl-ext-row-${r.extStatus || 'pending'}`">
                                    <td>{{ unitName(r.fromUnit) }}</td><td>{{ r.buyer }}</td><td><b>{{ r.code || r.label }}</b></td><td class="hl-dim hl-po" :title="r.po">{{ r.po }}</td><td>{{ r.style }}</td><td>{{ r.product }}</td><td>{{ r.garment }}</td><td>{{ dmy(r.delivery) }}</td><td>{{ dmy(r.start) }} → {{ dmy(r.end) }}</td>
                                    <td class="hl-r"><b>{{ fmtQty(r.qty) }}</b></td><td class="hl-r">{{ fmtQty(Math.round(r.sah)) }}</td>
                                    <td class="hl-dim hl-reason" :title="r.reason">{{ r.reason }}</td>
                                    <td><select :value="r.extStatus || 'pending'" class="cal-in hl-sel-s" @change="gpSetStatus(r, $event.target.value)"><option v-for="(l, k) in EXT_STATUS" :key="k" :value="k">{{ l }}</option></select></td>
                                    <td class="hl-nowrap"><button class="cal-btn st-btn hl-btn" @click="gpLock(r)">{{ r.locked ? '🔓' : '🔒' }}</button> <span class="hl-x-small" title="Remove — the quantity becomes unallocated" @click="gpRemove(r)">✖</span></td>
                                </tr>
                                <tr v-if="!gpRows.length"><td colspan="14" class="hl-dim">No GSL overflow allocation{{ gpStatus ? ' with this status' : '' }} — run Auto Balance, or move quantities to GSL on the Product-Wise panel.</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="st-hint">GSL is an unlimited overflow pool, not a capacity-constrained factory: its bars claim no MBM / CEIL / AQL capacity and the window shown is the required production window (PCD → delivery), not a confirmed production date. Every automatic allocation starts as <b>Pending External Capacity Confirmation</b>; set it to Confirmed once the external capacity is agreed, or Rejected to replan it.</div>
                </div>
            </div>
        </div>

        <!-- Available capacity by date / week / month -->
        <div v-if="capOpen && sc && capTable" class="cal-overlay" @click.self="capOpen = false">
            <div class="cal-dialog pf-dialog hl-dialog hl-cap-dialog">
                <div class="cal-title">📈 Available capacity — {{ sc.name }} <span class="cal-title-btns"><span class="cal-x" @click="capOpen = false">✕</span></span></div>
                <div class="st-body">
                    <div class="hl-ab-sum">
                        <span class="hl-views">
                            <button v-for="p in [['day','Date'],['week','Week'],['month','Month']]" :key="p[0]" class="cal-btn st-btn hl-btn" :class="{ 'hl-on' : capPeriod === p[0] }" @click="capPeriod = p[0]">{{ p[1] }}</button>
                        </span>
                        <span class="hl-views">
                            <button v-for="w in [['avail','Available'],['cap','Capacity'],['used','Reserved']]" :key="w[0]" class="cal-btn st-btn hl-btn" :class="{ 'hl-on' : capWhat === w[0] }" @click="capWhat = w[0]">{{ w[1] }}</button>
                        </span>
                        <span class="hl-views">
                            <button class="cal-btn st-btn hl-btn" :class="{ 'hl-on' : capShow === 'pcs' }" title="pieces at the unit average SMV (Lines tab: Capacity pcs)" @click="capShow = 'pcs'">pcs</button>
                            <button class="cal-btn st-btn hl-btn" :class="{ 'hl-on' : capShow === 'sah' }" title="standard hours (Lines tab: Line SAH)" @click="capShow = 'sah'">SAH</button>
                        </span>
                        <label class="hl-lbl">Unit <select v-model="capUnit" class="cal-in hl-sel-s"><option value="">all</option><option v-for="u in sc.units" :key="u.code" :value="u.code">{{ u.name }}</option></select></label>
                        <label class="hl-lbl">From <input v-model="capFrom" type="date" class="cal-in hl-date"> to <input v-model="capTo" type="date" class="cal-in hl-date"></label>
                        <span class="hl-gap"></span>
                        <span class="hl-legend"><i class="hl-lg hl-day-idle"></i>idle <i class="hl-lg hl-day-available"></i>available <i class="hl-lg hl-day-partial"></i>partial <i class="hl-lg hl-day-full"></i>full <i class="hl-lg hl-day-overloaded"></i>overloaded <i class="hl-lg hl-day-holiday"></i>no working day</span>
                        <button class="cal-btn st-btn hl-btn" @click="capCsv">⬇ CSV</button>
                    </div>
                    <div class="hl-scroll hl-cap-scroll">
                        <table class="hl-table hl-table-s hl-cap-tbl">
                            <thead><tr><th class="hl-cap-sticky">Unit / line</th><th class="hl-cap-sticky2">Setup</th><th v-for="c in capTable.cols" :key="c.key">{{ c.label }}</th><th>Total</th></tr></thead>
                            <tbody>
                                <tr v-for="r in capTable.rows" :key="r.id" :class="{ 'hl-cap-unit' : r.isUnit, 'hl-cap-off' : !r.isUnit && !r.active }">
                                    <td class="hl-cap-sticky" :class="{ 'hl-cap-line' : !r.isUnit }"><b v-if="r.isUnit">{{ r.name }}</b><template v-else>{{ r.name }}</template></td>
                                    <td class="hl-cap-sticky2 hl-dim">{{ r.setup }}</td>
                                    <td v-for="c in capTable.cols" :key="c.key" class="hl-r hl-cap-cell" :class="capCls(r.cells[c.key])" :title="capTip(r.cells[c.key], r.smv)">{{ r.cells[c.key].cap > 0 ? capFmt(capVal(r.cells[c.key], r.smv)) : '—' }}</td>
                                    <td class="hl-r"><b>{{ capFmt(capVal(r.tot, r.smv)) }}</b></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="st-hint">Capacity of a line per working day = manpower × (hours + OT) × 60 × efficiency % (Configure units &amp; lines → Lines; hours follow the unit's month calendar unless the line has its own figure, holidays and off days give none). Reserved = the scenario's bars on the line (live load snapshot, proposals, manual reservations). Available = capacity − reserved. Pieces are at the unit average SMV ({{ sc.units.map(u => `${u.name} ${unitAvgSmv(u.code)}`).join(' · ') }}); SAH = standard hours. Hover a cell for capacity / reserved / available / working days.</div>
                </div>
            </div>
        </div>

        <!-- Before & After balancing -->
        <div v-if="baOpen && sc && allocRep" class="cal-overlay" @click.self="baOpen = false">
            <div class="cal-dialog pf-dialog hl-dialog hl-ba-dialog">
                <div class="cal-title">📊 Before &amp; After balancing — {{ sc.name }} <span class="cal-title-btns"><span class="cal-x" @click="baOpen = false">✕</span></span></div>
                <div class="st-body">
                    <div class="hl-ab-sum">
                        <span><b>{{ fmtQty(allocRep.totals.orders) }}</b> orders · <b>{{ fmtQty(allocRep.totals.qty) }}</b> pcs</span>
                        <span class="hl-k-contract">contract units <b>{{ fmtQty(allocRep.totals.internal) }}</b></span>
                        <span class="hl-k-transfer">transferred <b>{{ fmtQty(allocRep.totals.transfer) }}</b></span>
                        <span class="hl-k-gsl">GSL <b>{{ fmtQty(allocRep.totals.gsl) }}</b></span>
                        <span :class="{ 'hl-warn' : allocRep.totals.unallocated }">unallocated <b>{{ fmtQty(allocRep.totals.unallocated) }}</b></span>
                        <span>locked <b>{{ fmtQty(allocRep.totals.locked) }}</b></span>
                        <span :class="{ 'hl-warn' : allocRep.totals.risk }">⚠ delivery risk <b>{{ fmtQty(allocRep.totals.risk) }}</b> order(s)</span>
                        <span v-if="sc.balance?.lastRun" class="hl-dim">last Auto Balance {{ sc.balance.lastRun.at }}</span>
                        <span v-if="allocBad.length" class="hl-warn">⚠ {{ allocBad.length }} order(s) do not reconcile</span>
                    </div>
                    <div class="hl-tabs">
                        <button v-for="t in [['monthly','Monthly (delivery month)'],['production','Production months'],['units','Unit-wise'],['buyers','Buyer-wise'],['products','Product-wise'],['risk','Delivery-risk orders']]" :key="t[0]" class="cal-btn st-btn hl-btn" :class="{ 'hl-on' : baTab === t[0] }" @click="baTab = t[0]">{{ t[1] }}</button>
                    </div>
                    <div class="hl-scroll hl-ba-scroll">
                        <table v-if="baTab === 'monthly'" class="hl-table hl-table-s">
                            <thead><tr><th rowspan="2">Unit</th><th rowspan="2">Delivery month</th><th colspan="5" class="hl-c hl-ba-before">Before — original demand</th><th colspan="7" class="hl-c hl-ba-after">After — proposed allocation</th></tr>
                                <tr><th>Orders</th><th>Original qty</th><th>Original SAH</th><th>Available cap SAH</th><th>Shortage SAH</th><th>Internal qty</th><th>Transferred out</th><th>Transferred in</th><th>GSL overflow</th><th>Unallocated</th><th>Final SAH</th><th>Final load</th></tr></thead>
                            <tbody>
                                <tr v-for="m in allocRep.unitMonths" :key="m.unit + m.ym" :class="{ 'hl-short' : m.unallocated }">
                                    <td><b>{{ unitName(m.unit) }}</b></td><td>{{ ymLabel(m.ym) }}</td>
                                    <td class="hl-r">{{ fmtQty(m.orders) }}</td><td class="hl-r">{{ fmtQty(m.originalQty) }}</td><td class="hl-r">{{ fmtQty(Math.round(m.originalSah)) }}</td><td class="hl-r">{{ fmtQty(Math.round(m.capSah)) }}</td>
                                    <td class="hl-r" :class="{ 'hl-em-neg' : m.shortageSah > 0 }">{{ m.shortageSah > 0 ? fmtQty(Math.round(m.shortageSah)) : '—' }}</td>
                                    <td class="hl-r hl-k-contract">{{ fmtQty(m.internalQty) }}</td><td class="hl-r hl-k-transfer">{{ m.outQty ? fmtQty(m.outQty) : '—' }}</td><td class="hl-r hl-k-transfer">{{ m.inQty ? fmtQty(m.inQty) : '—' }}</td>
                                    <td class="hl-r hl-k-gsl">{{ m.gslQty ? fmtQty(m.gslQty) : '—' }}</td><td class="hl-r" :class="{ 'hl-warn' : m.unallocated }">{{ m.unallocated ? fmtQty(m.unallocated) : '—' }}</td>
                                    <td class="hl-r">{{ fmtQty(Math.round(m.finalSah)) }}</td><td class="hl-r" :class="{ 'hl-em-neg' : (m.finalLoad || 0) > 1 }">{{ m.finalLoad != null ? fmtPct(m.finalLoad) : '—' }}</td>
                                </tr>
                                <tr v-if="!allocRep.unitMonths.length"><td colspan="14" class="hl-dim">No orders with a contract unit in the scenario.</td></tr>
                            </tbody>
                        </table>
                        <table v-else-if="baTab === 'production'" class="hl-table hl-table-s">
                            <thead><tr><th>Unit</th><th>Production month</th><th>Planned pcs</th><th>Planned SAH</th><th>Capacity SAH</th><th>Load</th></tr></thead>
                            <tbody>
                                <tr v-for="p in allocRep.production" :key="p.unit + p.ym"><td><b>{{ unitName(p.unit) }}</b></td><td>{{ ymLabel(p.ym) }}</td><td class="hl-r">{{ fmtQty(Math.round(p.pcs)) }}</td><td class="hl-r">{{ fmtQty(Math.round(p.sah)) }}</td><td class="hl-r">{{ fmtQty(Math.round(p.capSah)) }}</td><td class="hl-r" :class="{ 'hl-em-neg' : (p.load || 0) > 1 }">{{ p.load != null ? fmtPct(p.load) : '—' }}</td></tr>
                                <tr v-if="!allocRep.production.length"><td colspan="6" class="hl-dim">No internal reservation yet.</td></tr>
                            </tbody>
                            <tfoot><tr><td colspan="6" class="hl-dim">Loading by the dates the reservations actually sew (a December delivery may load November) — the delivery-month view keeps the demand by delivery date.</td></tr></tfoot>
                        </table>
                        <table v-else-if="baTab === 'units'" class="hl-table hl-table-s">
                            <thead><tr><th rowspan="2">Unit</th><th colspan="4" class="hl-c hl-ba-before">Before</th><th colspan="7" class="hl-c hl-ba-after">After</th></tr>
                                <tr><th>Demand qty</th><th>Demand SAH</th><th>Capacity SAH</th><th>Overloaded months</th><th>Contract allocation</th><th>Transferred out</th><th>Transferred in</th><th>GSL overflow</th><th>Unallocated</th><th>Utilisation</th><th>Remaining capacity SAH</th></tr></thead>
                            <tbody>
                                <tr v-for="u in baUnitRows" :key="u.unit">
                                    <td><b>{{ unitName(u.unit) }}</b></td>
                                    <td class="hl-r">{{ fmtQty(u.originalQty) }}</td><td class="hl-r">{{ fmtQty(Math.round(u.originalSah)) }}</td><td class="hl-r">{{ fmtQty(Math.round(u.capSah)) }}</td><td class="hl-r" :class="{ 'hl-em-neg' : u.overMonths }">{{ u.overMonths || '—' }}</td>
                                    <td class="hl-r hl-k-contract">{{ fmtQty(u.internalQty) }}</td><td class="hl-r hl-k-transfer">{{ u.outQty ? fmtQty(u.outQty) : '—' }}</td><td class="hl-r hl-k-transfer">{{ u.inQty ? fmtQty(u.inQty) : '—' }}</td><td class="hl-r hl-k-gsl">{{ u.gslQty ? fmtQty(u.gslQty) : '—' }}</td><td class="hl-r" :class="{ 'hl-warn' : u.unallocated }">{{ u.unallocated ? fmtQty(u.unallocated) : '—' }}</td>
                                    <td class="hl-r">{{ u.capSah ? fmtPct(u.finalSah / u.capSah) : '—' }}</td><td class="hl-r">{{ fmtQty(Math.round(u.capSah - u.finalSah)) }}</td>
                                </tr>
                            </tbody>
                        </table>
                        <table v-else-if="baTab === 'buyers'" class="hl-table hl-table-s">
                            <thead><tr><th>Buyer</th><th>Orders</th><th>Original qty</th><th>Contract units</th><th>Transferred</th><th>GSL overflow</th><th>Unallocated</th><th>Risk orders</th></tr></thead>
                            <tbody><tr v-for="b in allocRep.buyers" :key="b.buyer"><td><b>{{ b.buyer }}</b></td><td class="hl-r">{{ fmtQty(b.orders) }}</td><td class="hl-r">{{ fmtQty(b.originalQty) }}</td><td class="hl-r hl-k-contract">{{ fmtQty(b.internalQty) }}</td><td class="hl-r hl-k-transfer">{{ b.transferQty ? fmtQty(b.transferQty) : '—' }}</td><td class="hl-r hl-k-gsl">{{ b.gslQty ? fmtQty(b.gslQty) : '—' }}</td><td class="hl-r" :class="{ 'hl-warn' : b.unallocated }">{{ b.unallocated ? fmtQty(b.unallocated) : '—' }}</td><td class="hl-r" :class="{ 'hl-warn' : b.risk }">{{ b.risk || '—' }}</td></tr></tbody>
                        </table>
                        <table v-else-if="baTab === 'products'" class="hl-table hl-table-s">
                            <thead><tr><th>Product</th><th>Unit</th><th>Original (contract) qty</th><th>Proposed in the unit</th><th>Orders</th></tr></thead>
                            <tbody><tr v-for="p in allocRep.products" :key="p.product + p.unit"><td><b>{{ p.product }}</b></td><td>{{ unitName(p.unit) }}</td><td class="hl-r">{{ p.originalQty ? fmtQty(p.originalQty) : '—' }}</td><td class="hl-r" :class="{ 'hl-k-gsl' : p.unit === 'G' }">{{ p.proposedQty ? fmtQty(p.proposedQty) : '—' }}</td><td class="hl-r">{{ p.orders || '—' }}</td></tr></tbody>
                        </table>
                        <table v-else class="hl-table hl-table-s">
                            <thead><tr><th>Order</th><th>Buyer</th><th>Product</th><th>Contract</th><th>Delivery</th><th>Qty</th><th>Internal</th><th>Transfers</th><th>GSL</th><th>Unallocated</th><th>Completion</th><th>Why at risk</th></tr></thead>
                            <tbody>
                                <tr v-for="o in baRisk" :key="o.id" class="hl-short"><td><b>{{ o.code || o.style }}</b></td><td>{{ o.buyer }}</td><td>{{ o.product }}</td><td>{{ unitName(o.contractUnit) }}</td><td>{{ dmy(o.delivery) }}</td><td class="hl-r">{{ fmtQty(o.qty) }}</td><td class="hl-r">{{ fmtQty(o.internal) }}</td><td class="hl-r">{{ Object.entries(o.transfers).map(([u, q]) => `${unitName(u)} ${fmtQty(q)}`).join(', ') || '—' }}</td><td class="hl-r hl-k-gsl">{{ o.gsl ? fmtQty(o.gsl) : '—' }}</td><td class="hl-r" :class="{ 'hl-warn' : o.unallocated }">{{ o.unallocated ? fmtQty(o.unallocated) : '—' }}</td><td :class="{ 'hl-late' : o.completion && o.delivery && o.completion > o.delivery }">{{ dmy(o.completion) }}</td>
                                    <td class="hl-dim">{{ [o.unallocated ? 'unallocated quantity' : '', o.gsl && o.gslStatus !== 'confirmed' ? `GSL ${EXT_STATUS[o.gslStatus] || o.gslStatus}` : '', o.completion && o.delivery && o.completion > o.delivery ? 'finishes after delivery' : ''].filter(Boolean).join(' · ') }}</td></tr>
                                <tr v-if="!baRisk.length"><td colspan="12" class="hl-dim">No delivery-risk order.</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="st-hint">Everything here is computed from this scenario's reservations, so moves, locks and cancellations on the board are reflected at once. Before = the orders' original demand (contract unit, delivery month) against the simulated capacity; After = where the pieces are now. Internal capacity is never exceeded; GSL quantities stay unconfirmed until reviewed.</div>
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
.hl-uc-head { font-size : 13px; margin-bottom : 4px; display : flex; align-items : baseline; gap : 6px; flex-wrap : wrap; }
.hl-uc-oq { margin-left : auto; font-size : 11.5px; background : #e8f0fe; border : 1px solid #c3d4f0; border-radius : 3px; padding : 1px 6px; white-space : nowrap; }
.hl-uc-oq b { color : #1646a0; }
.hl-uc-erp { margin-top : 6px; padding-top : 5px; border-top : 1px dashed #d5dbe3; font-size : 11px; color : #333; }
.hl-uc-erp-t { display : block; font-weight : 700; color : #1f3a5f; margin-bottom : 3px; }
.hl-em-scroll { max-height : 150px; overflow : auto; border : 1px solid #e3e6ea; border-radius : 3px; }
.hl-em-tbl { border-collapse : collapse; width : 100%; font-size : 10.5px; }
.hl-em-tbl th, .hl-em-tbl td { padding : 1px 6px; text-align : right; border-bottom : 1px solid #eef1f4; white-space : nowrap; }
.hl-em-tbl th:first-child, .hl-em-tbl td:first-child { text-align : left; }
.hl-em-tbl thead th { position : sticky; top : 0; background : #eef2f6; font-weight : 700; z-index : 1; }
.hl-em-tbl tfoot td { position : sticky; bottom : 0; background : #f6f7f9; border-top : 1px solid #c9d2dc; }
.hl-em-tbl tbody tr { cursor : pointer; }
.hl-em-tbl tbody tr:hover td { background : #e9f1fd; }
.hl-em-tbl tbody tr.hl-em-cur td { background : #fff8e1; font-weight : 700; }
.hl-em-over td, tr.hl-em-over td { color : #b00020; }
.hl-em-neg { color : #b00020; font-weight : 700; }
.cal-overlay .cal-dialog.hl-em-dialog { width : 1200px; }
.hl-em-list td { white-space : nowrap; }
.hl-em-prods { margin-bottom : 8px; }
.hl-em-prods tbody tr { cursor : pointer; }
.hl-erp-other { padding : 0 10px 8px; font-size : 11px; color : #444; }
.hl-sched-wrap { flex : 1 1 auto; min-height : 300px; position : relative; display : flex; flex-direction : column; }
.hl-sched { flex : 1 1 auto; height : 100%; min-height : 300px; }
.hl-busy { opacity : .6; pointer-events : none; }
.hl-empty { position : absolute; inset : 0; display : flex; align-items : center; justify-content : center; font-size : 15px; color : #555; background : rgba(255,255,255,.7); }
.hl-unit-name { font-size : 13px; } .hl-unit-sub, .hl-line-sub { display : block; font-size : 10.5px; color : #666; font-weight : 400; }
.hl-line-off { text-decoration : line-through; color : #999; }
.hl-util { font-weight : 700; padding : 1px 6px; border-radius : 10px; }
.hl-util-ok { background : #e8f5e9; color : #2e7d32; } .hl-util-partial { background : #fff8e1; color : #b26a00; } .hl-util-full { background : #ffe0d6; color : #c43c00; } .hl-util-over { background : #ffcdd2; color : #b00020; }
.hl-root .b-sch-resource-time-range.hl-day { border : none; opacity : 1; pointer-events : none; }
.hl-day-idle { background : #f4f6f8 !important; } .hl-day-available { background : #dcedc8 !important; } .hl-day-partial { background : #ffe082 !important; }
/* no-production days: light red cross-hatch (off day), darker red cross-hatch (holiday), grey hatch (factory shutdown) */
.hl-day-full { background : #ffab91 !important; } .hl-day-overloaded { background : #ef9a9a !important; }
.hl-day-off { background-color : #fff1f1 !important; background-image : repeating-linear-gradient(45deg, rgba(229,115,115,.5) 0 1.5px, transparent 1.5px 9px), repeating-linear-gradient(-45deg, rgba(229,115,115,.5) 0 1.5px, transparent 1.5px 9px) !important; }
.hl-day-holiday { background-color : #ffe3e3 !important; background-image : repeating-linear-gradient(45deg, rgba(211,47,47,.6) 0 1.5px, transparent 1.5px 8px), repeating-linear-gradient(-45deg, rgba(211,47,47,.6) 0 1.5px, transparent 1.5px 8px) !important; }
.hl-day-shutdown { background : repeating-linear-gradient(45deg, #bdbdbd 0 4px, #eeeeee 4px 8px) !important; } .hl-day-inactive { background : #e0e0e0 !important; }
.hl-root .b-sch-event.hl-res { background : #4f7fcf; border : 1px solid #2d5aa3; color : #fff; font-size : 11px; border-radius : 3px; }
.hl-root .b-sch-event.hl-res-live { background : #7a7a7a; border-color : #555; }
.hl-root .b-sch-event.hl-res-proposed { background : #26a69a; }
.hl-root .b-sch-event.hl-res-conflict { background : #d32f2f; border-color : #8e0000; }
.hl-root .b-sch-event.hl-res-late { box-shadow : inset 0 -4px 0 #ff9800; }
.hl-root .b-sch-event.hl-res-locked { opacity : .9; border-style : dashed; }
.hl-res-txt { white-space : nowrap; overflow : hidden; text-overflow : ellipsis; padding : 0 4px; }
.hl-tip table td { padding : 1px 6px; font-size : 11.5px; } .hl-tip table td:first-child { color : #666; }
/* the global .cal-dialog / .pf-dialog widths (700 / 760px) must not win over the board's dialogs */
.cal-overlay .cal-dialog.hl-dialog { width : 900px; max-width : 96vw; }
.cal-overlay .cal-dialog.hl-cfg-dialog { width : 1100px; }
.cal-overlay .cal-dialog.hl-ord-dialog { width : 1300px; }
.cal-overlay .cal-dialog.hl-res-dialog { width : 720px; }
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
/* Central Auto Balance */
.hl-lg-contract { background : #26a69a; } .hl-lg-transfer { background : #7e57c2; } .hl-lg-gsl { background : repeating-linear-gradient(45deg, #ff9800 0 4px, #ffcc80 4px 8px); } .hl-lg-pend { background : #fff; border : 2px dashed #e65100; } .hl-lg-lock { background : #4f7fcf; border-style : dashed; }
.hl-root .b-sch-event.hl-res-k-contract { background : #26a69a; border-color : #00796b; }
.hl-root .b-sch-event.hl-res-k-transfer { background : #7e57c2; border-color : #512da8; }
.hl-root .b-sch-event.hl-res-k-gsl { background : repeating-linear-gradient(45deg, #fb8c00 0 6px, #ffb74d 6px 12px); border-color : #e65100; color : #3e2723; }
.hl-root .b-sch-event.hl-res-ext-pending { border : 2px dashed #bf360c; }
.hl-root .b-sch-event.hl-res-ext-confirmed { background : #ef6c00; color : #fff; }
.hl-root .b-sch-event.hl-res-ext-rejected { background : repeating-linear-gradient(45deg, #9e9e9e 0 6px, #e0e0e0 6px 12px); color : #b00020; text-decoration : line-through; }
.hl-root .b-sch-event.hl-res-conflict { background : #d32f2f; border-color : #8e0000; }
.hl-line-pool { color : #e65100; }
.hl-day-pool { background : #ffe0b2 !important; }
.hl-root .b-sch-event.hl-res-ps-ontime { background : #9e9e9e; border-color : #616161; color : #fff; }
.hl-root .b-sch-event.hl-res-ps-pcd { background : #fb8c00; border-color : #e65100; color : #fff; }
.hl-root .b-sch-event.hl-res-ps-late { background : #d32f2f; border-color : #8e0000; color : #fff; }
.hl-lg-ontime { background : #9e9e9e; } .hl-lg-pcd { background : #fb8c00; } .hl-lg-late2 { background : #d32f2f; }
.hl-apu { border-bottom : 1px solid #d5dbe3; padding-bottom : 6px; }
.hl-apu-head { display : flex; align-items : center; gap : 8px; flex-wrap : wrap; font-size : 12.5px; }
.hl-apu-rules { display : flex; align-items : center; gap : 10px; flex-wrap : wrap; margin : 6px 0; font-size : 11.5px; }
.hl-num-s { width : 48px; }
.hl-apu-scroll { max-height : 40vh; }
.hl-apu-tbl td { white-space : nowrap; }
.hl-ps-chip { display : inline-block; padding : 0 7px; border-radius : 10px; font-size : 11px; font-weight : 700; color : #fff; }
.hl-nc { cursor : pointer; }
.hl-ps-ontime { background : #757575; } .hl-ps-pcd { background : #fb8c00; } .hl-ps-late { background : #d32f2f; } .hl-ps-unplaced { background : #455a64; }
.hl-ps-crit { background : #b71c1c; } .hl-ps-crit.hl-ps-none { background : #2e7d32; }
.hl-crit { max-width : 320px; white-space : normal !important; font-size : 11px; line-height : 1.25; }
.hl-warn { color : #e65100; font-weight : 600; }
.hl-k-contract { color : #00796b; } .hl-k-transfer { color : #512da8; } .hl-k-gsl { color : #e65100; } .hl-k-manual { color : #1b52ad; } .hl-k-live { color : #555; }
.cal-overlay .cal-dialog.hl-cap-dialog { width : 1500px; max-width : 96vw; }
.hl-cap-scroll { max-height : 68vh; overflow : auto; }
.hl-cap-tbl th, .hl-cap-tbl td { white-space : nowrap; }
.hl-cap-tbl thead th { position : sticky; top : 0; background : #f2f4f7; z-index : 2; }
.hl-cap-sticky { position : sticky; left : 0; background : #fff; z-index : 1; min-width : 130px; } .hl-cap-sticky2 { position : sticky; left : 130px; background : #fff; z-index : 1; font-size : 10.5px; }
.hl-cap-tbl thead .hl-cap-sticky, .hl-cap-tbl thead .hl-cap-sticky2 { z-index : 3; background : #f2f4f7; }
.hl-cap-unit td { background : #e8eef6; font-weight : 700; } .hl-cap-unit .hl-cap-sticky, .hl-cap-unit .hl-cap-sticky2 { background : #e8eef6; }
.hl-cap-line { padding-left : 16px !important; } .hl-cap-off td { color : #999; font-style : italic; }
.hl-cap-cell { min-width : 64px; }
.cal-overlay .cal-dialog.hl-ab-dialog { width : 1180px; } .cal-overlay .cal-dialog.hl-abr-dialog { width : 1400px; } .cal-overlay .cal-dialog.hl-pw-dialog { width : 1500px; } .cal-overlay .cal-dialog.hl-gp-dialog { width : 1450px; } .cal-overlay .cal-dialog.hl-ba-dialog { width : 1450px; }
.hl-ab-grid { display : grid; grid-template-columns : 1fr 1fr; gap : 12px; }
.hl-ab-box { border : 1px solid #c9d2dc; border-radius : 4px; background : #f7f9fc; padding : 8px 12px; font-size : 12px; }
.hl-ab-h { font-weight : 700; color : #1f3a5f; margin-bottom : 6px; }
.hl-chk { display : flex; align-items : center; gap : 6px; margin : 4px 0; }
.hl-chk-s { display : inline-flex; vertical-align : middle; margin-right : 2px; }
.hl-ab-row { display : flex; align-items : center; gap : 10px; flex-wrap : wrap; margin : 6px 0; }
.hl-ab-sel .hl-lbl { align-items : flex-start; flex-direction : column; }
.hl-multi { min-width : 170px; height : 96px; }
.hl-tr-in { width : 60px; }
.hl-ab-sum { display : flex; align-items : center; gap : 14px; flex-wrap : wrap; font-size : 12.5px; margin-bottom : 8px; }
.hl-ab-sum b { font-size : 13.5px; }
.hl-abr-scroll, .hl-pw-scroll, .hl-gp-scroll, .hl-ba-scroll { max-height : 58vh; }
.hl-abr-tbl td, .hl-pw-orders td, .hl-gp-tbl td { white-space : nowrap; }
.hl-reason { max-width : 320px; overflow : hidden; text-overflow : ellipsis; white-space : nowrap !important; }
.hl-po { max-width : 160px; overflow : hidden; text-overflow : ellipsis; }
.hl-pw-prod { margin-bottom : 6px; width : 100%; }
.hl-pw-prod th.hl-c, .hl-ba-dialog th.hl-c { text-align : center; }
.hl-ba-before { background : #fff3e0 !important; } .hl-ba-after { background : #e0f2f1 !important; }
.hl-sel-xs { min-width : 70px; }
.hl-nowrap { white-space : nowrap; }
tr.hl-ext-row-confirmed td { background : #fff3e0; } tr.hl-ext-row-rejected td { background : #fbe9e7; color : #b00020; }
</style>
