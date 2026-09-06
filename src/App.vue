<script setup>
import { ref, shallowRef, computed, watch, onMounted } from 'vue';
import { BryntumSchedulerPro } from '@bryntum/schedulerpro-vue-3';
import {
    schedulerProConfig, uiHooks, colorState, searchState, recalcCapacity, planOrderDrop,
    pushFollowers, packBoardGaps, enforceSequentialLines, computeInsertStart, tryMergeAdjacent, noteManualGap, lineIdOf, isHoldingRes, isSewingRes, removedDbEventIds, applyLearningCurves, deriveLcForPlacement, invalidateWorkDayCache,
    refreshGrandTotals, beginBoardInteraction, endBoardInteraction, isBoardInteracting,
    applyLineFormulaDuration
} from './AppConfig.js';
import {
    UNPLANNED_INIT, LINES, LINE_BY_ID, calendarState, hmToHours, hoursToHm, ymdOf, dayHoursOf, dayCfgOf, dayCapacityFactor, buildManpowerRanges,
    buildOffDayRanges, nextWorkingDay, addWorkDays, endOfWork, startOfWorkDay, endOfWorkDay,
    elapsedDays, isOffDay, calcRisk, fmtQty, fmtDate, fmtDateDdMonRr,
    addCalDays, randSmv, orderColor, mbmOrderNo, orderTypeOf, orderFamilyKey, VIEW_START, VIEW_END,
    nextStartAfter, WORK_MIN_PER_DAY, clampIntoWorkWindow, resolveProfileType, resolveProfileEfficiency,
    computeLineUtil, formulaWorkingDays, isLateVsDelivery
} from './planningData.js';
import {
    loadFromApi, syncToApi, pingApi, loadProdUpdatesDb, saveProdUpdatesDb, saveLineEfficiencyDb,
    saveEffProfilesDb, saveLearningCurvesDb, loadUnplannedDb, loadUnplannedDbPaged, API_BASE,
    resolveResourceDbId, poBaseEventCode, loadErpAllOrders, completeOrdersDb,
    acquireBoardLock, releaseBoardLock,
    authLogin, loadUsersDb, saveUsersDb,
    resolveApiBase, apiMode, setApiMode
} from './api.js';
import {
    PLANNING_MASTERS, classifyVolume, blockDuration, forwardPass,
    backwardPass, feasibility, sequenceOptions, autoPlanOrders
} from './planningEngine.js';

const schedRef = ref(null);
const order = ref(null);
const unplanned = ref([...UNPLANNED_INIT]);
const replacedOrders = ref([]);
const toasts = ref([]);
const colorMenuOpen = ref(false);
const colorMode = ref('risk');
const dataSource = ref('demo');
const apiModeSel = ref(apiMode());        // auto | local | aws — status-bar switch
const apiBaseLabel = ref('');             // the endpoint actually in use
function onApiModeChange() {
    setApiMode(apiModeSel.value);
    window.location.reload();             // re-resolve and re-hydrate cleanly
}
const planMeta = ref({ name : 'AQL August Sewing Plan', status : 'Draft', version : 3 });
const apiReady = ref(false);
const boardLoading = ref(false);
const boardLoadMsg = ref('');
const boardLoadPct = ref(0);
const boardPlanProgress = ref({ active : false, msg : '', pct : 0 });
let boardHydratePromise = null;
let planInFlight = null;
/** In-memory board session — avoids API reload wiping user edits */
const boardUnitCache = {}; // unitId -> { apiData, unplanned, ready }

function cloneData(o) {
    return JSON.parse(JSON.stringify(o));
}

function serializeBoardEvents(s) {
    if (!s) return [];
    const out = [];
    for (const ev of s.eventStore.records) {
        const raw = ev.data?.raw;
        if (!raw) continue;
        out.push({
            id         : ev.id,
            resourceId : lineIdOf(s, ev),
            startDate  : ev.startDate,
            endDate    : ev.endDate,
            duration   : ev.duration,
            durationUnit : ev.durationUnit || 'day',
            manuallyScheduled : !!ev.manuallyScheduled,
            name       : ev.name,
            percentDone : ev.percentDone ?? 0,
            draggable  : ev.draggable !== false,
            resizable  : ev.resizable !== false,
            raw        : { ...raw }
        });
    }
    return out;
}

function cacheHasLines(cache) {
    return (cache?.apiData?.resources || []).some(r => r.lineRow);
}

function markBoardDirty() {
    const uid = currentUnitId.value;
    if (uid && boardUnitCache[uid]) boardUnitCache[uid].dirty = true;
}

function markBoardSaved() {
    const uid = currentUnitId.value;
    if (uid && boardUnitCache[uid]) boardUnitCache[uid].dirty = false;
}

let boardBaseline = null;

function lineLabel(s, lid) {
    if (lid === 'hold') return 'Holding Row';
    return s.resourceStore.getById(lid)?.name || lid || '—';
}

function snapshotBoardState(s) {
    const out = {};
    if (!s) return out;
    for (const ev of s.eventStore.records) {
        const raw = ev.data.raw;
        if (!raw || raw.stage) continue;
        const lid = lineIdOf(s, ev);
        out[String(ev.id)] = {
            id       : ev.id,
            po       : raw.po || '',
            name     : ev.name,
            qty      : Number(raw.qty) || 0,
            line     : lid,
            lineName : lineLabel(s, lid),
            start    : ev.startDate?.getTime?.() ?? null,
            end      : ev.endDate?.getTime?.() ?? null,
            eff      : Number(raw.stripEff) || 100,
            peff     : Number(raw.planEff) || 0,
            lcm      : raw.lcManual?.name || ''
        };
    }
    return out;
}

function setBoardBaseline(s) {
    boardBaseline = snapshotBoardState(s);
}

// Events whose PROJECTION was replaced in place by a confirm order — the swap
// keeps line/start/end, so the baseline diff alone cannot see it (the baseline
// is snapshotted after the swap has already run on load)
const pendingSwapIds = new Set();
// Position repairs (overlap fixes > 1h) happen during load, BEFORE the
// baseline snapshot — force-include them in the next save or they never
// persist. Kept separate from swaps so the dialog labels them honestly.
const pendingRepairIds = new Set();
uiHooks.notePositionRepair = id => {
    if (String(id).startsWith('db-')) pendingRepairIds.add(String(id));
};

function collectPendingChanges(s) {
    if (!s) return [];
    const current = snapshotBoardState(s);
    const swapChanges = [];
    for (const id of pendingSwapIds) {
        const now = current[id];
        if (!now) continue;
        swapChanges.push({
            eventId  : id,
            type     : 'replaced',
            po       : now.po,
            name     : now.name,
            fromLine : now.lineName,
            toLine   : now.lineName
        });
    }
    for (const id of pendingRepairIds) {
        if (pendingSwapIds.has(id)) continue;
        const now = current[id];
        if (!now) continue;
        swapChanges.push({
            eventId  : id,
            type     : 'repaired',
            po       : now.po,
            name     : now.name,
            fromLine : now.lineName,
            toLine   : now.lineName
        });
    }
    if (!boardBaseline) {
        return Object.values(current).map(now => ({
            eventId  : now.id,
            type     : 'new',
            po       : now.po,
            name     : now.name,
            fromLine : '—',
            toLine   : now.lineName
        }));
    }
    const changes = [...swapChanges];
    const ids = new Set([...Object.keys(boardBaseline), ...Object.keys(current)]);
    for (const id of ids) {
        const was = boardBaseline[id];
        const now = current[id];
        if (!was && now) {
            changes.push({ eventId : id, type : 'new', po : now.po, name : now.name, fromLine : '—', toLine : now.lineName });
            continue;
        }
        if (was && !now) {
            changes.push({ eventId : id, type : 'removed', po : was.po, name : was.name, fromLine : was.lineName, toLine : '—' });
            continue;
        }
        if (!was || !now) continue;
        if (was.line !== now.line) {
            changes.push({
                eventId  : id,
                type     : 'moved',
                po       : now.po,
                name     : now.name,
                fromLine : was.lineName,
                toLine   : now.lineName
            });
        }
        else if (was.start !== now.start || was.end !== now.end) {
            changes.push({
                eventId  : id,
                type     : 'rescheduled',
                po       : now.po,
                name     : now.name,
                fromLine : now.lineName,
                toLine   : now.lineName
            });
        }
        else if (was.qty !== now.qty) {
            changes.push({
                eventId  : id,
                type     : 'split',
                po       : now.po,
                name     : now.name,
                fromLine : now.lineName,
                toLine   : now.lineName,
                qty      : now.qty
            });
        }
        else if (was.eff !== now.eff || was.peff !== now.peff || was.lcm !== now.lcm) {
            // Efficiency edit that didn't move the snapped end — still a save
            changes.push({
                eventId  : id,
                type     : 'retuned',
                po       : now.po,
                name     : now.name,
                fromLine : now.lineName,
                toLine   : now.lineName
            });
        }
    }
    return changes;
}

function formatSaveConfirm(changes) {
    // A huge change list makes the native dialog slow to paint — cap it
    const MAX_LINES = 12;
    const shown = changes.slice(0, MAX_LINES);
    const rest  = changes.length - shown.length;
    const lines = shown.map(ch => {
        const label = ch.po || ch.name || 'Order';
        if (ch.type === 'removed') return `• ${label}: removed from ${ch.fromLine}`;
        if (ch.type === 'new') return `• ${label}: placed on ${ch.toLine}`;
        if (ch.type === 'rescheduled') return `• ${label}: rescheduled on ${ch.toLine}`;
        if (ch.type === 'replaced') return `• ${label}: confirm order replaced its projection on ${ch.toLine}`;
        if (ch.type === 'repaired') return `• ${label}: position adjusted (overlap repair) on ${ch.toLine}`;
        if (ch.type === 'retuned') return `• ${label}: efficiency changed on ${ch.toLine}`;
        if (ch.type === 'split') return `• ${label}: qty split (${fmtQty(ch.qty)} pcs on ${ch.toLine})`;
        return `• ${label}: ${ch.fromLine} → ${ch.toLine}`;
    });
    if (rest > 0) lines.push(`… and ${rest} more change(s)`);
    const head = changes.length === 1
        ? 'Save this change to the planning board?'
        : `Save ${changes.length} changes to the planning board?`;
    return `${head}\n\n${lines.join('\n')}`;
}

function orderBoardKeys(raw, evId) {
    const keys = new Set();
    if (raw?.id) keys.add(String(raw.id));
    if (raw?.dbId) keys.add(`dbo-${raw.dbId}`);
    if (raw?.po) keys.add(`po:${String(raw.po)}`);
    // Composite key for consolidated bars
    if (raw?.mbmOrder && raw?.color) keys.add(`ck:${raw.mbmOrder}:${raw.color}`);
    // All POs in the consolidated group
    if (Array.isArray(raw?.poList)) raw.poList.forEach(p => keys.add(`po:${String(p)}`));
    keys.add(String(evId));
    return keys;
}

function orderKeysOf(u) {
    const keys = [];
    if (u.id) keys.push(String(u.id));
    if (u.dbId) keys.push(`dbo-${u.dbId}`);
    if (u.po) keys.push(`po:${String(u.po)}`);
    // Composite key for consolidated bars
    if (u.mbmOrder && u.color) keys.push(`ck:${u.mbmOrder}:${u.color}`);
    // All POs in group
    if (Array.isArray(u.poList)) u.poList.forEach(p => keys.push(`po:${String(p)}`));
    return keys;
}

function touchBoardCache(s) {
    const uid = currentUnitId.value;
    if (!uid || !boardUnitCache[uid] || !s) return;
    if (!boardUnitCache[uid].dirty) return;
    boardUnitCache[uid].apiData.events = serializeBoardEvents(s);
    boardUnitCache[uid].apiData.assignments = serializeBoardAssignments(s);
    boardUnitCache[uid].unplanned = cloneData(unplanned.value);
}

function serializeBoardAssignments(s) {
    if (!s?.assignmentStore) return [];
    return s.assignmentStore.records.map(a => ({
        id         : a.id,
        eventId    : a.eventId ?? a.data?.eventId ?? a.data?.event,
        resourceId : a.resourceId ?? a.data?.resourceId
    }));
}

function countSewingEvents(data) {
    return (data?.events || []).filter(e => e.raw && !e.raw.stage).length;
}

// Initial projection-planning stage: on board load, auto-plan runs phase by
// phase (chunks) over PROJECTED orders only. Replacement stage: synced confirm
// orders automatically take their projection's slot on the board and the
// projection is flagged replaced; projections whose confirm POs have not
// arrived yet stay planned as projections.
const AUTO_PLAN_ON_LOAD = true;
const AUTO_REPLACE_WITH_CONFIRMS = true;

function finishBoardLoad(uid, data, s) {
    if (countSewingEvents(data) > 0) {
        boardUnitCache[uid].ready = true;
        boardUnitCache[uid].dirty = false;
        setBoardBaseline(s);
    }
    if (AUTO_PLAN_ON_LOAD) scheduleBackgroundPlan(s);
}

function storeUnitCache(unitId, apiData) {
    boardUnitCache[unitId] = {
        apiData : cloneData(apiData),
        unplanned : cloneData(apiData.unplanned || []),
        ready   : false,
        dirty   : false
    };
}

// ---------------------------------------------------------------------------
// FastReact-style shell: main menu, multiple planning boards, permissions
// ---------------------------------------------------------------------------
const view         = ref('home');   // 'home' | 'board'
const currentBoard = ref(null);
const boardMin     = ref(false);    // board minimized to the taskbar
const openMenu     = ref(null);
const settingsOpen = ref(false);
const rolesOpen    = ref(false);
const newRoleName  = ref('');

// Board view survives a reload until the user closes or minimizes it
function saveBoardView() {
    localStorage.setItem('mbm-board-view', JSON.stringify({
        boardId : currentBoard.value?.id || null,
        view    : view.value,
        min     : boardMin.value
    }));
}

// ---------------------------------------------------------------------------
// Window taskbar: every open dialog shows as an icon on the bottom line -
// click restores it to the top, ✕ on the icon closes it
// ---------------------------------------------------------------------------
const ordersMin   = ref(false);
const settingsMin = ref(false);
const rolesMin    = ref(false);
const effMin      = ref(false);
const calMin      = ref(false);

const openWindows = computed(() => [
    { id : 'board',    icon : '🗓', title : currentBoard.value?.name || 'Planning board',
        open : !!currentBoard.value && (view.value === 'board' || boardMin.value), min : boardMin.value },
    { id : 'orders',   icon : '🔴', title : 'Orders',              open : ordersOpen.value,   min : ordersMin.value },
    { id : 'dayplan',  icon : '📄', title : 'Day Plan Report',     open : dpOpen.value,       min : dpMin.value },
    { id : 'produpd',  icon : '🏭', title : 'Production update',   open : puOpen.value,       min : puMin.value },
    { id : 'settings', icon : '⚙️', title : 'Settings',            open : settingsOpen.value, min : settingsMin.value },
    { id : 'roles',    icon : '👤', title : 'Planning roles',      open : rolesOpen.value,    min : rolesMin.value },
    { id : 'eff',      icon : '📊', title : 'Efficiency profiles', open : effOpen.value,      min : effMin.value },
    { id : 'cal',      icon : '📅', title : 'Calendars',           open : calOpen.value,      min : calMin.value },
    { id : 'bc',       icon : '📈', title : 'Build up curves',     open : bcOpen.value,       min : bcMin.value },
    { id : 'props',    icon : '🧭', title : 'Strip properties',    open : propsOpen.value,    min : propsMin.value },
    { id : 'plan',     icon : '🗓', title : 'Planned schedule',    open : plOpen.value,       min : plMin.value },
    { id : 'pg',       icon : '🧮', title : 'Plan generator',      open : pgOpen.value,       min : pgMin.value }
].filter(w => w.open));

function restoreWin(id) {
    if (id === 'board' && currentBoard.value) openBoard(currentBoard.value);
    if (id === 'orders')   ordersMin.value = false;
    if (id === 'dayplan')  dpMin.value = false;
    if (id === 'produpd')  puMin.value = false;
    if (id === 'settings') settingsMin.value = false;
    if (id === 'roles')    rolesMin.value = false;
    if (id === 'eff')      effMin.value = false;
    if (id === 'cal')      calMin.value = false;
    if (id === 'bc')       bcMin.value = false;
    if (id === 'props')    propsMin.value = false;
    if (id === 'plan')     plMin.value = false;
    if (id === 'pg')       pgMin.value = false;
}

function closeWin(id) {
    if (id === 'board')    closeBoard();
    if (id === 'orders')   ordersOpen.value = false;
    if (id === 'dayplan')  dpOpen.value = false;
    if (id === 'produpd')  puOpen.value = false;
    if (id === 'settings') settingsOpen.value = false;
    if (id === 'roles')    rolesOpen.value = false;
    if (id === 'eff')      effOpen.value = false;
    if (id === 'cal')      calOpen.value = false;
    if (id === 'bc')       bcOpen.value = false;
    if (id === 'props')    propsOpen.value = false;
    if (id === 'plan')     plOpen.value = false;
    if (id === 'pg')       pgOpen.value = false;
}

// ---------------------------------------------------------------------------
// Plan Generator (SRS screen S2): volume class -> forward/backward pass ->
// buffer verdict -> sequence options A/B/C -> commit colour blocks to board
// ---------------------------------------------------------------------------
const pgOpen = ref(false);
const pgMin  = ref(false);

// Prefilled with the SRS section 11 worked example (the acceptance scenario)
const pgForm = ref({
    orderNo   : 'XYZ',
    category  : '5Pkt',
    styleType : 'new',
    smv       : 18,
    pcd       : '2026-08-01',
    lineFree  : '2026-08-08',
    pos : [
        { po : 'PO-1', delivery : '2026-08-21', colours : [
            { colour : 'Red',  qty : 3000, wash : 'W1' },
            { colour : 'Blue', qty : 3000, wash : 'W1' }
        ] },
        { po : 'PO-2', delivery : '2026-08-28', colours : [
            { colour : 'Red',  qty : 1000, wash : 'W1' },
            { colour : 'Blue', qty : 3000, wash : 'W1' }
        ] }
    ]
});

const pgResult = ref(null);

function openPlanGenerator() {
    openMenu.value = null;
    pgOpen.value = true;
    pgMin.value = false;
}

function pgGenerate() {
    try {
        const f = pgForm.value;
        const cat = PLANNING_MASTERS.productCategories[f.category];
        if (!cat) {
            toast(`V07: Configure the learning curve for ${f.category} before planning`, 'error');
            return;
        }
        if (!f.smv || f.smv <= 0) {
            toast('V04: IE must supply SMV before this order can be planned', 'error');
            return;
        }
        const totalQty = f.pos.reduce((a, p) => a + p.colours.reduce((x, c) => x + Number(c.qty || 0), 0), 0);
        // V01/V02-style reconciliation happens implicitly: blocks ARE the POs' colours
        const engineLine = { operators : 45, shiftMinutes : 480, absenteeismPct : PLANNING_MASTERS.absenteeismPct };
        // SRS worked-example calendar: every day working (board calendar off-days
        // are applied at commit time when the blocks land on the real board)
        const isWorking = () => true;
        const pcd = new Date(f.pcd);
        const lineFree = f.lineFree ? new Date(f.lineFree) : null;

        const volume = classifyVolume(totalQty);
        const fwd = forwardPass(pcd, lineFree, isWorking);

        const blocks = f.pos.flatMap(p => p.colours.map(c => ({
            po : p.po, colour : c.colour, wash : c.wash || 'W1',
            qty : Number(c.qty || 0), deliveryDate : new Date(p.delivery)
        })));

        // per-PO backward pass + feasibility
        const poRows = f.pos.map(p => {
            const qty = p.colours.reduce((a, c) => a + Number(c.qty || 0), 0);
            const durProbe = blockDuration(qty, engineLine, cat, f.styleType, Number(f.smv), fwd.actualSewStart, isWorking);
            const back = backwardPass(new Date(p.delivery), durProbe.workingDays, qty, isWorking);
            const feas = feasibility(back.latestSewStart, fwd.actualSewStart, isWorking);
            return { po : p.po, qty, delivery : p.delivery, sewDays : durProbe.workingDays, back, feas };
        });

        const options = sequenceOptions(blocks, {
            line : engineLine, category : cat, styleType : f.styleType,
            smv : Number(f.smv), startDate : fwd.actualSewStart, isWorking
        });

        pgResult.value = { totalQty, volume, fwd, poRows, options };
    }
    catch (e) {
        toast(`Plan generation failed: ${e.message}`, 'error');
    }
}

const pgVerdictCls = v => ({
    COMFORTABLE : 'pg-v-good', TIGHT : 'pg-v-amber',
    NO_BUFFER : 'pg-v-red', INFEASIBLE : 'pg-v-red'
}[v] || '');

function pgCommit(opt) {
    const s = getInstance();
    const r = pgResult.value;
    const f = pgForm.value;
    if (!s || !r || opt.rejected) return;
    const cat = PLANNING_MASTERS.productCategories[f.category];
    const lineRes = s.resourceStore.records.find(x => x.data.lineRow);
    if (!lineRes) return;
    let cursor = startOfWorkDay(nextWorkingDay(new Date(r.fwd.actualSewStart)));
    let seqNo = 0;
    for (const label of opt.sequence) {
        // label format: "Colour 3,000 (PO-x)"
        const m = label.match(/^(\S+)\s([\d,]+)\s\((.+)\)$/);
        if (!m) continue;
        const [, colour, qtyS, po] = m;
        const qty = Number(qtyS.replace(/,/g, ''));
        const smv = Number(f.smv);
        const manpower = Number(lineRes.data?.manpower ?? LINE_BY_ID[lineRes.id]?.manpower) || 50;
        const lineEff  = Number(lineRes.data?.eff ?? LINE_BY_ID[lineRes.id]?.eff) || 50;
        const reqMin = Math.round(qty * smv);
        const dur = formulaWorkingDays(qty, smv, manpower, lineEff);
        const start = new Date(cursor);
        const end   = endOfWork(start, dur);
        const raw = {
            po : `${po}`, buyer : f.orderNo, style : `${f.category} ${colour}`,
            productType : cat.name || f.category,
            qty, smv : Number(f.smv), reqMin, dur,
            pcd : new Date(f.pcd),
            ship : new Date(f.pos.find(p => po.includes(p.po))?.delivery || f.pos[0].delivery),
            matReady : new Date(f.pcd), progress : 0, status : 'draft',
            start, end, colour, curve : cat.learningCurve[f.styleType],
            risk : { score : 0, level : 'draft', label : 'Draft', reasons : ['Committed from Plan Generator'] }
        };
        const [rec] = s.eventStore.add({
            id : `pg-${Date.now()}-${seqNo++}`,
            resourceId : lineRes.id,
            startDate : start, endDate : end,
            manuallyScheduled : true,
            name : `${f.orderNo} | ${colour} ${fmtQty(qty)} (${po})`,
            percentDone : 0,
            raw
        });
        if (rec) pushFollowers(s, lineRes.id, rec);
        cursor = nextStartAfter(end);
    }
    recalcCapacity(s);
    toast(`Sequence "${opt.name}" committed to ${lineRes.name} — ${opt.blocks} block(s)`, 'ok');
    pgOpen.value = false;
    s.refreshWithTransition?.();
}

function lineEfficiencyOf(lineId, productType) {
    const profile = profileOfLine(lineId);
    return resolveProfileEfficiency(profile?.values, productType, LINE_BY_ID[lineId]?.eff) || 50;
}

function snapToWorkStart(d) {
    return clampIntoWorkWindow(new Date(d));
}

// Re-plan the live order list onto sewing lines using PCD, delivery date
// and the critical-path (forward + backward) rules from planningEngine.js
async function runLiveOrderPlan(s, {
    showToasts = true,
    onProgress = null,
    mode = 'incremental',
    orderTypes = null
} = {}) {
    const typeFilter = orderTypes?.length ? new Set(orderTypes) : null;
    if (!s) return { planned : 0, late : 0, tight : 0, skipped : true };
    if (uiHooks.boardUserActive || isBoardInteracting()) {
        return { planned : 0, late : 0, tight : 0, skipped : true };
    }

    // Bars already on the board are NEVER recycled or moved by auto-plan.
    // 'full' mode now only means "plan all order types" (not just projections).
    // New orders are always appended after the last bar on each line.

    const onBoard = new Set();
    for (const ev of s.eventStore.records) {
        const raw = ev.data.raw;
        if (!raw || raw.stage) continue;
        for (const k of orderBoardKeys(raw, ev.id)) onBoard.add(k);
    }

    const today = snapToWorkStart(new Date());
    const lineStates = s.resourceStore.records
        .filter(r => r.data.lineRow)
        .map(r => {
            const base = LINE_BY_ID[r.id] || {};
            return {
                id       : r.id,
                name     : r.name,
                manpower : Number(r.data.manpower) || base.manpower || 50,
                eff      : Number(r.data.eff) || base.eff || 50,
                hours    : Number(r.data.hours) || base.hours || 0,
                freeFrom : new Date(today)
            };
        });
    if (!lineStates.length) {
        if (showToasts) toast('No sewing lines on this board', 'error');
        return { planned : 0, late : 0, tight : 0, skipped : true };
    }

    for (const ev of s.eventStore.records) {
        const raw = ev.data.raw;
        if (!raw || raw.stage) continue;
        const lid = lineIdOf(s, ev);
        if (!LINE_BY_ID[lid]) continue;
        const line = lineStates.find(l => l.id === lid);
        if (!line) continue;
        const nxt = nextStartAfter(ev.endDate);
        if (nxt > line.freeFrom) line.freeFrom = nxt;
    }

    const source = [...unplanned.value];
    const seen = new Set(onBoard);
    const orders = [];
    let noPcdCount = 0;
    for (const u of source) {
        const keys = orderKeysOf(u);
        if (keys.some(k => seen.has(k))) continue;
        const key = keys[0] || String(u.id || `${u.mbmOrder || ''}:${u.po || ''}:${u.style || ''}`);
        if (seen.has(key)) continue;
        seen.add(key);
        for (const k of keys) seen.add(k);
        if (u.status === 'completed') continue;
        if (currentUnitId.value && u.unitId && u.unitId !== currentUnitId.value) continue;
        if (!String(u.buyer || '').trim()) continue;
        if (u.replaced || u.status === 'replaced') continue;
        if (typeFilter && !typeFilter.has(orderTypeOf(u.po, u.orderType))) continue;
        // No invented dates: an order without a valid effective PCD stays
        // visible in the unplanned data but is never auto-planned.
        if (u.pcdStatus === 'missing' || u.planWarning) { noPcdCount++; continue; }
        const qty = Number(u.qty ?? u.orderQty) || 0;
        if (qty <= 0) continue;
        const lidHint = u.suitable?.[0] || lineStates[0].id;
        orders.push({
            ...u,
            productType : u.productType || productTypeFromProfile(u.po, lidHint),
            color       : u.color || orderColor(u.po),
            mbmOrder    : u.mbmOrder || mbmOrderNo(u.po, u.mbmOrder)
        });
    }

    if (noPcdCount && showToasts) {
        toast(`${noPcdCount} order(s) skipped — cannot auto-plan (missing PCD or zero order quantity)`, 'warn');
    }

    if (!orders.length) {
        if (showToasts && mode === 'full') toast('No live orders left to plan', 'warn');
        touchBoardCache(s);
        return { planned : 0, late : 0, tight : 0, skipped : true };
    }

    onProgress?.({
        phase   : 'calc',
        done    : 0,
        total   : orders.length,
        message : `Calculating plan for ${orders.length} order(s)…`
    });
    await yieldUi();

    const isWorking = d => !isOffDay(d);
    const planCtx = {
        isWorking,
        today,
        efficiencyOf : lineEfficiencyOf,
        lineHasProductType : (lineId, productType) => {
            const profile = profileOfLine(lineId);
            return Number(profile?.values?.[productType]) > 0;
        },
        workMinPerDay : WORK_MIN_PER_DAY,
        snapStart : snapToWorkStart
    };

    // Calculate in small slices so the main thread stays responsive
    const placements = [];
    const CALC_CHUNK = 25;
    for (let i = 0; i < orders.length; i += CALC_CHUNK) {
        const chunk = orders.slice(i, i + CALC_CHUNK);
        const done  = Math.min(i + CALC_CHUNK, orders.length);
        onProgress?.({
            phase   : 'calc',
            done,
            total   : orders.length,
            message : `Calculating plan… ${done} / ${orders.length}`
        });
        await yieldUi();
        const { placements : part } = autoPlanOrders(chunk, lineStates, planCtx);
        placements.push(...part);
    }

    const events = [];
    let late = 0, tight = 0;
    for (const p of placements) {
        const o = p.order;
        const start = startOfWorkDay(p.start);
        const end   = endOfWork(start, p.dur);
        const reqMin = Math.round(o.qty * o.smv);
        const verdict = p.feas?.verdict;
        // No slot met the criteria, so the order was appended after the line's
        // last bar — flag it so the strip renders yellow
        const latePlan = startOfWorkDay(start) > startOfWorkDay(o.pcd || start)
            || verdict === 'INFEASIBLE' || p.lateness > 0;
        if (latePlan) late++;
        else if (verdict === 'TIGHT' || verdict === 'NO_BUFFER') tight++;

        const raw = {
            ...o,
            reqMin, dur : p.dur, start, end,
            orderQty : o.orderQty ?? o.qty,
            progress : 0,
            status   : 'draft',
            latePlan,
            userPinned : false,
            manualGap  : false,
            smv      : o.smv,
            pcd      : o.pcd,
            ship     : o.ship,
            matReady : o.matReady || o.pcd,
            mbmOrder : o.mbmOrder,
            productType : o.productType,
            color    : o.color,
            planEff  : p.planEff,
            bufferDays : p.feas?.bufferDays,
            verdict,
            criticalPath : {
                pcd            : o.pcd,
                earliestSew    : p.fwd?.earliestSewStart,
                latestSewStart : p.back?.latestSewStart,
                latestSewEnd   : p.back?.latestSewEnd,
                washEnd        : p.back?.washEnd,
                finishingEnd   : p.back?.finishingEnd,
                exFactory      : p.back?.exFactory,
                bufferDays     : p.feas?.bufferDays,
                verdict
            },
            risk : calcRisk({
                start, end, ship : o.ship, matReady : o.matReady || o.pcd,
                lineUtil : 0, status : 'draft'
            })
        };

        events.push({
            id         : `ev-${o.id}`,
            resourceId : p.line.id,
            startDate  : start,
            endDate    : end,
            duration   : elapsedDays(start, end),
            durationUnit : 'day',
            manuallyScheduled : true,
            name       : `${o.buyer} | ${o.mbmOrder || o.po}`,
            percentDone : 0,
            draggable  : true,
            resizable  : true,
            raw
        });
    }

    if (events.length) {
        if (showToasts) toast(`Planning ${events.length} order(s)...`, 'ok');
        const CHUNK = 40;
        s.eventStore.suspendEvents?.();
        s.suspendRefresh?.();
        try {
            for (let i = 0; i < events.length; i += CHUNK) {
                s.eventStore.add(events.slice(i, i + CHUNK));
                const done = Math.min(i + CHUNK, events.length);
                onProgress?.({
                    phase   : 'add',
                    done,
                    total   : events.length,
                    message : `Placing orders on board… ${done} / ${events.length}`
                });
                if (i + CHUNK < events.length) await yieldUi();
            }
        }
        finally {
            s.eventStore.resumeEvents?.();
            s.resumeRefresh?.(true);
        }

        const minS = events.reduce((a, e) => e.startDate < a ? e.startDate : a, events[0].startDate);
        const maxE = events.reduce((a, e) => e.endDate > a ? e.endDate : a, events[0].endDate);
        const from = new Date(minS.getFullYear(), minS.getMonth(), 1);
        const to   = new Date(maxE.getFullYear(), maxE.getMonth() + 2, 1);
        if (from < s.startDate) s.startDate = from;
        if (to > s.endDate) s.endDate = to;
    }

    const plannedIds = new Set(placements.map(p => String(p.order.id)));
    unplanned.value = unplanned.value.filter(u => !plannedIds.has(String(u.id)));

    onProgress?.({
        phase   : 'finish',
        done    : events.length,
        total   : events.length,
        message : 'Refreshing board…'
    });
    beginBoardInteraction(s, 'batch');
    try {
        replaceProjectionsWithConfirms(s);
        packBoardGaps(s);
    }
    finally { endBoardInteraction(s); }
    // Engine-settled pass: bars must sit strictly one after another
    await enforceSequentialLines(s);
    recalcCapacity(s);
    refreshGrandTotals(s);
    s.refreshRows?.();
    disableStmIfLarge(s);
    scrollBoardToToday(s);
    touchBoardCache(s);

    return { planned : placements.length, late, tight, skipped : false };
}

function disableStmIfLarge(s) {
    if (!s?.eventStore || s.eventStore.count <= 80) return;
    try { s.project.stm.disabled = true; }
    catch { /* STM optional */ }
}

function setBoardLoad(on, msg = '', pct = 0) {
    boardLoading.value = on;
    boardLoadMsg.value = msg;
    boardLoadPct.value = pct;
}

function planProgress({ message, done, total }) {
    boardLoadMsg.value = message;
    boardLoadPct.value = total ? Math.round((done / total) * 100) : 0;
}

// Projection orders are planned by the board itself: every new one that shows
// up in the order list is placed automatically, confirm orders are left alone
async function ensureBoardPlanned(s) {
    if (!s || dataSource.value !== 'db') return;
    const unitId = currentUnitId.value;
    if (uiHooks.boardUserActive || isBoardInteracting()) return;
    replaceProjectionsWithConfirms(s);
    const onBoard = new Set();
    for (const ev of s.eventStore.records) {
        const raw = ev.data.raw;
        if (!raw || raw.stage) continue;
        for (const k of orderBoardKeys(raw, ev.id)) onBoard.add(k);
    }
    const liveCount = unplanned.value.filter(u =>
        u.status !== 'completed'
        && String(u.buyer || '').trim()
        && (Number(u.qty ?? u.orderQty) || 0) > 0
        && (!unitId || !u.unitId || u.unitId === unitId)
        && !u.replaced && u.status !== 'replaced'
        && orderTypeOf(u.po, u.orderType) === 'projection'
        && !orderKeysOf(u).some(k => onBoard.has(k))
    ).length;
    if (!liveCount) return;
    if (planInFlight) return planInFlight;

    planInFlight = (async () => {
        boardPlanProgress.value = { active : true, msg : `Planning ${liveCount} projection order(s)…`, pct : 0 };
        try {
            const r = await runLiveOrderPlan(s, {
                showToasts : false,
                mode       : 'incremental',
                orderTypes : ['projection'],
                onProgress : ({ message, done, total }) => {
                    boardPlanProgress.value = {
                        active : true,
                        msg    : message,
                        pct    : total ? Math.round((done / total) * 100) : 0
                    };
                }
            });
            if (r.planned > 0) {
                toast(
                    `${currentBoard.value?.unitName || 'Unit'} board — ${r.planned} projection order(s) planned (${r.tight} tight, ${r.late} late)`,
                    r.late ? 'warn' : 'ok'
                );
            }
        }
        finally {
            boardPlanProgress.value = { active : false, msg : '', pct : 0 };
            planInFlight = null;
            if (unitId && s.resourceStore.records.some(r => r.data?.lineRow)) {
                boardUnitCache[unitId] = boardUnitCache[unitId] || {};
                boardUnitCache[unitId].ready = true;
            }
        }
    })();
    return planInFlight;
}

// Compact every line: bars sit flush one after another — no gaps. Pins and
// manual gaps are cleared (completed bars stay anchored; followers attach
// after them). The user invokes this deliberately from the Planning menu.
function compactBoardNoGaps() {
    openMenu.value = null;
    const s = getInstance();
    if (!s) {
        toast('Open a planning board first', 'warn');
        return;
    }
    for (const ev of s.eventStore.records) {
        const raw = ev.data?.raw;
        if (!raw || raw.stage || raw.status === 'completed') continue;
        raw.userPinned = false;
        raw.dbPinned   = false;
        raw.manualGap  = false;
    }
    beginBoardInteraction(s, 'batch');
    let moved = 0;
    try { moved = packBoardGaps(s); }
    finally { endBoardInteraction(s); }
    recalcCapacity(s);
    s.refreshWithTransition?.();
    markBoardDirty();
    touchBoardCache(s);
    toast(moved
        ? `Board compacted — ${moved} bar(s) pulled flush, no gaps left`
        : 'Board already compact — no gaps found', 'ok');
}

async function planLiveOrders() {
    const s = getInstance();
    if (!s) {
        toast('Open a planning board first', 'warn');
        return;
    }
    openMenu.value = null;
    setBoardLoad(true, 'Planning live orders…', 0);
    try {
        const r = await runLiveOrderPlan(s, { showToasts : true, mode : 'full', onProgress : planProgress });
        if (!r.skipped) {
            toast(
                `Planned ${r.planned} order(s) from the live list — ${r.tight} tight, ${r.late} past critical path`,
                r.late ? 'warn' : 'ok'
            );
        }
    }
    finally {
        setBoardLoad(false);
    }
    if (view.value !== 'board') {
        const b = currentBoard.value || permittedBoards.value[0];
        if (b) openBoard(b);
    }
}

function tuneBoardPerformance(s) {
    if (!s) return;
    // The per-day Grand-totals footer stays ON: its data comes from a 5s
    // cache (frozen during drags), so even a large board renders it cheaply.
    if (s.features?.summary) s.features.summary.disabled = false;
    disableStmIfLarge(s);
}

// Saved orders can be scheduled years ahead of the default Jul 2026 - Feb 2027
// window. Bars outside the time axis are never drawn, so widen it to whatever
// the loaded data actually spans.
function expandTimeAxisForEvents(s) {
    if (!s?.eventStore?.count) return;
    let minStart = null, maxEnd = null;
    for (const ev of s.eventStore.records) {
        const st = ev.startDate;
        const en = ev.endDate;
        if (st && (!minStart || st < minStart)) minStart = st;
        if (en && (!maxEnd || en > maxEnd)) maxEnd = en;
    }
    if (!minStart || !maxEnd) return;
    const from = new Date(minStart.getFullYear(), minStart.getMonth(), 1);
    const to   = new Date(maxEnd.getFullYear(), maxEnd.getMonth() + 2, 1);
    if (from < s.startDate) s.startDate = from;
    if (to > s.endDate) s.endDate = to;
}

let boardLoadedUnitId = null;

function applyApiBoardData(s, data) {
    boardLoadedUnitId = data.unitId || null;
    clearDayPlanChips();
    withBoardBatch(s, () => {
        s.project.loadInlineData({
            resources          : data.resources,
            events             : data.events,
            assignments        : data.assignments || [],
            dependencies       : data.dependencies,
            resourceTimeRanges : data.resourceTimeRanges
        });
    });
    unplanned.value = (data.unplanned || []).filter(u => String(u.buyer || '').trim());
    currentUnitId.value = data.unitId || currentBoard.value?.unitId || null;
    syncProfileDefaultsFromLines(data.resources);
    planMeta.value = {
        name    : data.project.name,
        status  : data.project.status,
        version : data.project.version
    };
    dataSource.value = 'db';
    if (data.calendarDays) {
        Object.assign(calendarState.days, data.calendarDays);
        if (data.calendarName) calendarState.name = data.calendarName;
        applyCalendarToBoard();
    }
    removeOrdersWithoutBuyer(s);
    expandTimeAxisForEvents(s);
    beginBoardInteraction(s, 'batch');
    try {
        replaceProjectionsWithConfirms(s);
        packBoardGaps(s);
    }
    finally { endBoardInteraction(s); }
    // Engine-settled pass (async): bars must sit strictly one after another
    enforceSequentialLines(s);
    if (ordersOpen.value) ordersRows.value = collectOrders();
    applyProdUpdates(s);
    recalcCapacity(s);
    scrollBoardToToday(s);
    installFrVScroll(s);
    tuneBoardPerformance(s);
    // Load-time engine work can flip readOnly on its own — re-assert the
    // intended mode once the dust settles (sandbox users stay interactive)
    setTimeout(() => applyBoardFilter(), 1500);
}

// _Default in each line's efficiency profile IS the line efficiency.
// On every board load, sync it from the DB line efficiency so the profile,
// the tooltip, the report and the planner all read the same number.
function syncProfileDefaultsFromLines(resources) {
    let changed = false;
    for (const r of resources || []) {
        if (!r.lineRow) continue;
        const eff = Number(r.eff);
        if (!(eff > 0)) continue;
        if (LINE_BY_ID[r.id]) LINE_BY_ID[r.id].eff = eff;
        const pid = lineProfileMap.value[r.id];
        const p = pid && effList.value.find(x => x.id === pid);
        if (p && Number(p.values?._Default) !== eff) {
            ensureProfileValues(p);
            p.values._Default = eff;
            changed = true;
        }
    }
    if (changed) {
        localStorage.setItem('mbm-eff-list', JSON.stringify(effList.value));
    }
}

function scheduleBackgroundPlan(s) {
    requestAnimationFrame(() => ensureBoardPlanned(s));
}

async function reloadBoardForUnit(b, { force = false } = {}) {
    const s = getInstance();
    if (!s || !b) return;
    const uid = b.unitId ?? 3;

    // This unit's board is ALREADY live — re-opening it from the menu must
    // not reapply cached data: that repacks the board and throws away pinned
    // positions and any unsaved in-memory changes for no gain.
    if (!force && boardLoadedUnitId === uid
        && s.eventStore.records.some(e => e.data?.raw && !e.data.raw.stage)) {
        applyBoardFilter();
        return;
    }

    if (!force && boardUnitCache[uid]?.ready && !boardUnitCache[uid]?.dirty && cacheHasLines(boardUnitCache[uid])) {
        applyApiBoardData(s, boardUnitCache[uid].apiData);
        unplanned.value = cloneData(boardUnitCache[uid].unplanned);
        setBoardBaseline(s);
        applyBoardFilter();
        return;
    }
    if (boardUnitCache[uid] && !cacheHasLines(boardUnitCache[uid])) {
        boardUnitCache[uid].ready = false;
    }

    setBoardLoad(true, `Loading ${b.unitName || 'unit'} orders…`, 15);
    try {
        const data = await loadFromApi(uid);
        storeUnitCache(uid, {
            resources          : data.resources,
            events             : data.events,
            assignments        : data.assignments,
            dependencies       : data.dependencies,
            resourceTimeRanges : data.resourceTimeRanges,
            unplanned          : data.unplanned,
            project            : data.project,
            calendarDays       : data.calendarDays,
            calendarName       : data.calendarName,
            unitId             : data.unitId,
            unitName           : data.unitName
        });
        applyApiBoardData(s, boardUnitCache[uid].apiData);
        apiReady.value = true;
        applyBoardFilter();
        finishBoardLoad(uid, data, s);
    }
    catch (err) {
        toast(`Unit load failed (${err.message})`, 'error');
    }
    finally {
        setBoardLoad(false);
    }
}

async function hydrateBoardFromApi() {
    if (boardHydratePromise) return boardHydratePromise;

    boardHydratePromise = (async () => {
        const s = getInstance();
        const unitId = currentBoard.value?.unitId || 3;
        setBoardLoad(true, 'Connecting to planning database…', 0);
        try {
            // pick the live endpoint (Auto probes local + AWS; pinned modes
            // keep their endpoint) before the first data request
            const picked = await resolveApiBase();
            apiBaseLabel.value = picked.base;
            const data = await loadFromApi(unitId);
            if (!s) return;
            setBoardLoad(true, 'Loading board layout…', 20);
            storeUnitCache(unitId, {
                resources          : data.resources,
                events             : data.events,
                assignments        : data.assignments,
                dependencies       : data.dependencies,
                resourceTimeRanges : data.resourceTimeRanges,
                unplanned          : data.unplanned,
                project            : data.project,
                calendarDays       : data.calendarDays,
                calendarName       : data.calendarName,
                unitId             : data.unitId,
                unitName           : data.unitName
            });
            applyApiBoardData(s, boardUnitCache[unitId].apiData);
            apiReady.value = true;
            setBoardLoad(false);
            finishBoardLoad(unitId, data, s);
            setTimeout(() => syncMasterData(s), 3000);
            toast(`Connected: ${data.unitName || 'AQL'} board`, 'ok');

            loadProdUpdatesDb().then(rows => {
                const store = loadProdStore();
                for (const r of rows) {
                    const key  = String(r.event_ref);
                    const date = String(r.save_date).slice(0, 10);
                    if (!store[key]) store[key] = {};
                    store[key][date] = Number(r.prod_qty) || 0;
                }
                localStorage.setItem('mbm-prod-updates', JSON.stringify(store));
                applyProdUpdates(s);
                recalcCapacity(s);
            }).catch(() => { /* endpoint offline - local data stays */ });
        }
        catch (err) {
            dataSource.value = 'demo';
            apiReady.value = true;
            toast(`Planning API/DB offline (${err.message}) — showing local demo data`, 'warn');
        }
        finally {
            if (!planInFlight) setBoardLoad(false);
        }
    })();
    return boardHydratePromise;
}

function eventRawOf(rec) {
    if (!rec) return null;
    return rec.data?.raw || rec.raw || rec.get?.('raw') || null;
}

function asViewDate(d) {
    if (!d) return null;
    const x = d instanceof Date ? d : new Date(d);
    return Number.isNaN(x.getTime()) ? null : x;
}

// ---------------------------------------------------------------------------
// Strip / Order properties (right-click -> Properties, FastReact style)
// ---------------------------------------------------------------------------
const propsOpen = ref(false);
const propsMin  = ref(false);
const propsRec  = shallowRef(null);
const propsForm = ref({ stripEff : 100, keepSeparate : false, profileEff : 55 });

const propsRaw = computed(() => eventRawOf(propsRec.value));

const propsLine = computed(() => {
    const s = getInstance();
    const rec = propsRec.value;
    if (!s || !rec) return null;
    const lid = lineIdOf(s, rec);
    const res = s.resourceStore.getById(lid);
    return {
        id   : lid,
        name : res?.name || lid,
        line : LINES.find(l => l.id === lid) || res?.data || null
    };
});

const propsProfile = computed(() => {
    const lid = propsLine.value?.id;
    const pid = lid ? lineProfileMap.value[lid] : null;
    return (pid && effList.value.find(p => p.id === pid)) || effList.value[0] || null;
});

function profileOfLine(lid) {
    const pid = lid ? lineProfileMap.value[lid] : null;
    return (pid && effList.value.find(p => p.id === pid)) || effList.value[0] || null;
}

function stripProfileType(raw, lid) {
    const profile = profileOfLine(lid);
    return resolveProfileType(raw?.po, profile?.values, raw?.productType);
}

function readProfileEff(raw, lid) {
    const profile = profileOfLine(lid);
    const pType = stripProfileType(raw, lid);
    return resolveProfileEfficiency(profile?.values, pType, LINE_BY_ID[lid]?.eff) || 55;
}

const propsRouteName = computed(() => {
    const raw = propsRaw.value;
    const lid = propsLine.value?.id;
    if (!raw) return '_Default';
    return stripProfileType(raw, lid);
});

const propsKeyDates = computed(() => {
    const r = propsRaw.value;
    if (!r) return [];
    const end = asViewDate(r.end);
    const despatch = end ? new Date(end.getTime() + 2 * 86400000) : null;
    return [
        ['Preparation start',         asViewDate(r.matReady)],
        ['Load into production',      asViewDate(r.start)],
        ['Production start',          asViewDate(r.start)],
        ['First complete in section', end],
        ['First despatch from Factory', despatch],
        ['First arrive at customer',  asViewDate(r.ship)]
    ];
});

const propsQtyWeek = computed(() => {
    const r = propsRaw.value;
    return r && r.dur ? fmtQty(Math.round(r.qty * 6 / r.dur)) : '—';
});

function openStripProps(rec) {
    const raw = eventRawOf(rec);
    if (!raw) {
        toast('Could not open properties for this strip', 'error');
        return;
    }
    propsRec.value = rec;
    propsForm.value = {
        stripEff     : raw.stripEff || 100,
        keepSeparate : !!raw.keepSeparate,
        profileEff   : readProfileEff(raw, lineIdOf(getInstance(), rec))
    };
    propsOpen.value = true;
    propsMin.value = false;
}

function openPlannedSchedule(rec) {
    if (!eventRawOf(rec)) {
        toast('Could not open planned schedule for this strip', 'error');
        return;
    }
    plRec.value = rec;
    plPeriod.value = 'daily';
    plOpen.value = true;
    plMin.value = false;
}

uiHooks.onOpenProps = openStripProps;
uiHooks.onOpenSchedule = openPlannedSchedule;

// ---------------------------------------------------------------------------
// Change working hours (FastReact dialog, right-click → Change working
// hours): date-specific hour overrides on the factory calendar — reset to
// normal, zero out (extra holiday), set new hours or add overtime, over a
// picked period and day filter. Overrides drive EVERY calendar rule (off-day
// hatch, bar stretching, capacity, learning-curve day counting).
// ---------------------------------------------------------------------------
const chOpen   = ref(false);
const chDays   = ref({ 1 : false, 2 : false, 3 : false, 4 : false, 5 : false, 6 : false, 0 : false });
const chDayMode = ref('selected');   // selected | normalOnly | all | workingOnly
const chAction  = ref('setNew');     // resetNormal | zero | setNew | addTime
const chTime    = ref('');
const chFrom    = ref(isoInputDate(new Date()));
const chTo      = ref(isoInputDate(addCalDays(new Date(), 6)));

const CH_DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday-first like FastReact
const chNormalHours = wd => calendarState.days[wd]?.hours || '0:00';

function openWorkHours(rec) {
    // Prefill the period with the clicked bar's span when opened from a bar
    const raw = eventRawOf(rec);
    if (rec?.startDate) chFrom.value = isoInputDate(rec.startDate);
    if (rec?.endDate)   chTo.value   = isoInputDate(rec.endDate);
    if (!raw) {
        chFrom.value = isoInputDate(new Date());
        chTo.value   = isoInputDate(addCalDays(new Date(), 6));
    }
    chOpen.value = true;
}
uiHooks.onOpenWorkHours = openWorkHours;

function chApply() {
    const from = new Date(chFrom.value + 'T00:00:00');
    const to   = new Date(chTo.value + 'T00:00:00');
    if (Number.isNaN(+from) || Number.isNaN(+to) || from > to) {
        toast('সঠিক date period দিন (from ≤ to)', 'warn');
        return;
    }
    const needsTime = chAction.value === 'setNew' || chAction.value === 'addTime';
    // Accept 11:30, 11.30 and 11,30 alike — all mean 11 hours 30 minutes
    const timeH = hmToHours(String(chTime.value).trim().replace(/[.,]/g, ':'));
    if (needsTime && !(timeH > 0)) {
        toast('Specify time (hh:mm) ঘরে সময় দিন — যেমন 11:00', 'warn');
        return;
    }
    if (chDayMode.value === 'selected' && !Object.values(chDays.value).some(Boolean)) {
        toast('কোন কোন দিন বদলাবে — অন্তত একটা দিন select করুন', 'warn');
        return;
    }
    let changed = 0;
    const d = new Date(from);
    for (let guard = 0; d <= to && guard < 400; guard++) {
        const wd = d.getDay();
        const weeklyWorks = hmToHours(chNormalHours(wd)) > 0;
        const include =
            chDayMode.value === 'selected'    ? !!chDays.value[wd]
            : chDayMode.value === 'normalOnly' ? weeklyWorks
            : chDayMode.value === 'all'        ? true
            : /* workingOnly */                  dayHoursOf(d) > 0;
        if (include) {
            const k = ymdOf(d);
            if (chAction.value === 'resetNormal')  delete calendarState.overrides[k];
            else if (chAction.value === 'zero')    calendarState.overrides[k] = 0;
            else if (chAction.value === 'setNew')  calendarState.overrides[k] = timeH;
            else /* addTime */                     calendarState.overrides[k] = dayHoursOf(d) + timeH;
            changed++;
        }
        d.setDate(d.getDate() + 1);
    }
    localStorage.setItem('mbm-cal-overrides', JSON.stringify(calendarState.overrides));
    applyCalendarToBoard();
    const s = getInstance();
    if (s) {
        recalcCapacity(s);
        refreshGrandTotals(s);
        s.refreshRows?.();
    }
    toast(`${changed} day(s) updated on calendar "${calendarState.name}" — বিদ্যমান bar গুলো move/re-plan করলে নতুন hours ধরবে`, 'ok');
    chOpen.value = false;
}

// ---------------------------------------------------------------------------
// Build up curve on ONE bar (right-click → Build up curve): pick any curve
// from the configured Build up profiles and apply it to just this bar —
// it ramps from Day 1 regardless of the automatic product-change rule.
// ---------------------------------------------------------------------------
const lcDlgOpen = ref(false);
const lcDlgRec  = shallowRef(null);
const lcDlgSel  = ref('');

const lcDlgRaw = computed(() => eventRawOf(lcDlgRec.value));

function openCurveDialog(rec) {
    const raw = eventRawOf(rec);
    if (!raw) {
        toast('Could not open Build up curve for this strip', 'error');
        return;
    }
    lcDlgRec.value = rec;
    lcDlgSel.value = raw.lcManual
        ? (bcList.value.find(c => c.name === raw.lcManual.name)?.id || '')
        : '';
    lcDlgOpen.value = true;
}
uiHooks.onOpenCurve = openCurveDialog;

function applyCurveDialog() {
    const rec = lcDlgRec.value;
    const raw = eventRawOf(rec);
    const s   = getInstance();
    if (!rec || !raw || !s) return;
    const lid = lineIdOf(s, rec);
    if (!lid || lid === 'hold') {
        toast('Bar is on the Holding Row — plan it on a line first', 'warn');
        lcDlgOpen.value = false;
        return;
    }
    const sel = lcDlgSel.value;
    if (!sel) {
        delete raw.lcManual;
        delete raw.lc;
    }
    else {
        const c = bcList.value.find(x => x.id === sel);
        if (!c) return;
        // Snapshot the percentages: the bar keeps THIS curve even if the
        // Build up profile is edited later
        raw.lcManual = { name : c.name, period : c.period, pct : c.pct.map(Number) };
    }
    // Re-derive the ramp + curve-aware duration for THIS bar only
    deriveLcForPlacement(s, raw, lid, new Date(rec.startDate));
    applyLineFormulaDuration(s, raw, lid);
    const start = new Date(rec.startDate);
    const end   = endOfWork(start, raw.dur);
    rec.set({ endDate : end, duration : elapsedDays(start, end) });
    raw.start = start;
    raw.end   = end;
    const pushed = pushFollowers(s, lid, rec);
    if (pushed) toast(`${pushed} following order(s) shifted later`, 'warn');
    recalcCapacity(s);
    markBoardDirty();
    touchBoardCache(s);
    s.refreshRows?.();
    toast(sel
        ? `${mbmOrderNo(raw.po, raw.mbmOrder)}: "${raw.lcManual.name}" curve applied — Save to keep it`
        : `${mbmOrderNo(raw.po, raw.mbmOrder)}: manual curve removed (automatic rule again) — Save to keep it`, 'ok');
    lcDlgOpen.value = false;
}

// ---------------------------------------------------------------------------
// Planned schedule (right-click -> Planned schedule): day-wise quantity,
// cumulative, efficiency and hours - FastReact "Planned quantity" window
// ---------------------------------------------------------------------------
const plOpen   = ref(false);
const plMin    = ref(false);
const plRec    = shallowRef(null);
const plPeriod = ref('daily');   // daily | weekly | monthly

const plRaw = computed(() => eventRawOf(plRec.value));

const plLine = computed(() => {
    const s = getInstance();
    const rec = plRec.value;
    if (!s || !rec) return null;
    const lid = lineIdOf(s, rec);
    const res = s.resourceStore.getById(lid);
    return {
        id   : lid,
        name : res?.name || lid,
        line : LINES.find(l => l.id === lid) || res?.data || null
    };
});

// All strips of the same PO currently on the board
const plAllStrips = computed(() => {
    const s = getInstance();
    const raw = plRaw.value;
    if (!s || !raw) return { qty : 0, count : 0 };
    // Same PO AND same order code — projection bars have empty po, so po
    // alone would lump every projection order together
    const strips = s.eventStore.records.filter(e => e.data.raw && !e.data.raw.stage
        && String(e.data.raw.po || '') === String(raw.po || '')
        && String(e.data.raw.mbmOrder || '') === String(raw.mbmOrder || ''));
    return {
        qty   : strips.reduce((a, e) => a + e.data.raw.qty, 0),
        count : strips.length
    };
});

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Daily rows: quantity distributed over working days (off days show 0).
// Learning-curve days produce at the curve percentage of the day's target —
// the schedule shows the reduced quantity and the applied efficiency.
const plDailyRows = computed(() => {
    const rec = plRec.value;
    const raw = plRaw.value;
    if (!rec || !raw) return [];
    const line = plLine.value?.line;
    const availMin = (line?.availMin || 12000) * (raw.stripEff || 100) / 100;
    const dailyTarget = Math.max(1, Math.floor(availMin / Math.max(0.1, raw.smv)));
    const baseEff = Math.round((line?.eff || 0) * (raw.stripEff || 100) / 100);
    // Learning-curve ramp for this bar (annotated by applyLearningCurves)
    const lc     = raw.lc?.applied && Array.isArray(raw.lc.pct) ? raw.lc : null;
    const period = lc ? lc.pct.length : 0;
    const rows = [];
    let remaining = raw.qty;
    let workIdx   = 0;   // working days elapsed inside this bar
    const d = new Date(rec.startDate);
    d.setHours(0, 0, 0, 0);
    const end = new Date(rec.endDate);
    let guard = 0;
    while (d < end && guard++ < 120) {
        const off = isOffDay(d);
        const cfg = dayCfgOf(d); // date-specific hour overrides included
        // Ramp factor for this working day (holidays don't advance the count)
        const rampIdx = lc ? (lc.dayOffset || 0) + workIdx : period;
        const ramping = lc && !off && rampIdx < period;
        const factor  = ramping ? lc.pct[rampIdx] / 100 : 1;
        // Changed-hours dates scale the day's capacity by the new hours
        const hrsF = dayCapacityFactor(d, line?.hours);
        const dayTarget = Math.max(1, Math.floor(dailyTarget * factor * hrsF));
        let q = 0;
        if (!off && remaining > 0) {
            q = Math.min(dayTarget, remaining);
            remaining -= q;
        }
        let hours = off || !q ? '0:00' : (cfg.hours || '10:00');
        if (!off && q > 0 && q < dayTarget) {
            const clock = Math.max(1, Math.round((q / dayTarget) * WORK_MIN_PER_DAY));
            hours = `${Math.floor(clock / 60)}:${String(clock % 60).padStart(2, '0')}`;
        }
        rows.push({
            day   : DAY_ABBR[d.getDay()],
            date  : fmtDate(new Date(d)),
            mKey  : `${d.getFullYear()}-${d.getMonth()}`,
            mName : d.toLocaleString('en-US', { month : 'short' }) + ' ' + d.getFullYear(),
            qty   : q,
            eff   : off || !q ? 0 : Math.round(baseEff * factor),
            lcDay : ramping && q > 0 ? rampIdx + 1 : 0,
            hours,
            off
        });
        if (!off) workIdx++;
        d.setDate(d.getDate() + 1);
    }
    // Any remainder lands on the last working day
    if (remaining > 0) {
        const lastW = [...rows].reverse().find(r => !r.off);
        if (lastW) lastW.qty += remaining;
    }
    let cum = 0;
    for (const r of rows) {
        cum += r.qty;
        r.cum = cum;
    }
    return rows;
});

// Aggregated view for Weekly / Monthly periods
const plRows = computed(() => {
    const daily = plDailyRows.value;
    if (plPeriod.value === 'daily') return daily;
    const groups = [];
    let cur = null;
    let weekIdx = 0;
    for (const r of daily) {
        const key = plPeriod.value === 'monthly'
            ? r.mKey
            : (r.day === 'Sun' || !cur ? `w${++weekIdx}` : cur.key);
        if (!cur || cur.key !== key) {
            cur = {
                key,
                day   : plPeriod.value === 'monthly' ? 'Mo' : `Wk ${weekIdx}`,
                date  : plPeriod.value === 'monthly' ? r.mName : r.date,
                qty   : 0, cum : 0, effSum : 0, effN : 0, hoursMin : 0
            };
            groups.push(cur);
        }
        cur.qty += r.qty;
        cur.cum = r.cum;
        if (r.eff > 0) {
            cur.effSum += r.eff;
            cur.effN++;
        }
        cur.hoursMin += Math.round(hmToHours(r.hours) * 60);
    }
    return groups.map(g => ({
        day   : g.day,
        date  : g.date,
        qty   : g.qty,
        cum   : g.cum,
        eff   : g.effN ? Math.round(g.effSum / g.effN) : 0,
        hours : `${Math.floor(g.hoursMin / 60)}:${String(g.hoursMin % 60).padStart(2, '0')}`
    }));
});

function propsUpdate() {
    const rec = propsRec.value;
    const raw = propsRaw.value;
    const s   = getInstance();
    if (!rec || !raw || !s) return;
    const se = Math.max(1, Math.min(500, Number(propsForm.value.stripEff) || 100));
    const pe = Math.max(1, Math.min(200, Number(propsForm.value.profileEff) || 0));
    raw.stripEff     = se;
    raw.keepSeparate = !!propsForm.value.keepSeparate;
    raw.planEff      = pe;

    const lid = propsLine.value?.id;
    const pType = stripProfileType(raw, lid);
    const key = pType && pType !== '_Default' ? pType : '_Default';
    let profile = propsProfile.value;
    if (!profile && lid) {
        const mapped = lineProfileMap.value[lid];
        profile = effList.value.find(p => p.id === mapped) || effList.value[0];
    }
    if (profile) {
        if (!profile.values) profile.values = {};
        profile.values[key] = pe;
        raw.productType = pType || key;
        saveEffState();
    }

    if (lid && lid !== 'hold' && raw.status !== 'completed') {
        applyLineFormulaDuration(s, raw, lid);
        const start = new Date(rec.startDate);
        const end   = endOfWork(start, raw.dur);
        rec.set({ endDate : end, duration : elapsedDays(start, end) });
        raw.start = start;
        raw.end   = end;
        const pushed = pushFollowers(s, lid, rec);
        if (pushed) toast(`${pushed} following order(s) shifted later`, 'warn');
        recalcCapacity(s);
        s.refreshWithTransition?.();
    }
    toast(`${mbmOrderNo(raw.po, raw.mbmOrder)}: profile efficiency ${pe}% · strip ${se}%`, 'ok');
}

// Users & permissions is Planning Manager-only — everyone else neither sees
// the menu item nor can open the dialog
const canManageUsers = computed(() =>
    (authUser.value?.role || currentUser.value?.role) === 'Planning Manager');

function openSettings() {
    openMenu.value = null;
    if (!canManageUsers.value) {
        toast('Users & permissions শুধু Planning Manager-এর জন্য', 'warn');
        return;
    }
    settingsOpen.value = true;
    settingsMin.value = false;
}

function openPlanningRoles() {
    rolesOpen.value = true;
    rolesMin.value = false;
    openMenu.value = null;
}

function savePlanningRoles() {
    localStorage.setItem('mbm-planning-roles', JSON.stringify(planningRoles.value));
}

function addPlanningRole() {
    const name = newRoleName.value.trim();
    if (!name) {
        toast('Enter a planning role name', 'warn');
        return;
    }
    if (planningRoles.value.some(r => r.toLowerCase() === name.toLowerCase())) {
        toast(`Role "${name}" already exists`, 'warn');
        return;
    }
    planningRoles.value.push(name);
    newRoleName.value = '';
    savePlanningRoles();
    toast(`Role "${name}" added`, 'ok');
}

function removePlanningRole(name) {
    if (users.value.some(u => u.role === name)) {
        toast(`"${name}" is assigned to a user — change their role first`, 'warn');
        return;
    }
    if (planningRoles.value.length <= 1) {
        toast('At least one planning role is required', 'warn');
        return;
    }
    planningRoles.value = planningRoles.value.filter(r => r !== name);
    savePlanningRoles();
}

const DEFAULT_BOARDS = [
    { id : 'b1', name : 'AQL Sewing Board — All Floors', floors : ['F1', 'F2'], stages : true, unitId : 3, unitName : 'AQL' },
    { id : 'b2', name : 'AQL Floor 1 Board',             floors : ['F1'],       stages : false, unitId : 3, unitName : 'AQL' },
    { id : 'b3', name : 'AQL Floor 2 Board',             floors : ['F2'],       stages : false, unitId : 3, unitName : 'AQL' }
];
const DEFAULT_USERS = [
    { id : 'u1', name : 'Ferdows',           role : 'Planner',    boards : ['b1', 'b2', 'b3'] },
    { id : 'u2', name : 'Unit Head — F1',    role : 'Unit Head',  boards : ['b2'] },
    { id : 'u3', name : 'Management Viewer', role : 'Management', boards : ['b1'] }
];
const DEFAULT_ROLES = ['Planner', 'Planning Manager', 'Unit Head', 'Management'];
const PLAN_CRITERIA = [
    'Only projection orders from the order list are auto-planned. When a confirm exists for the same MBM order / style, it replaces that projection on the board and the projection is flagged Replaced.',
    'Only the open board’s unit is planned (AQL orders stay on the AQL board).',
    'Orders without a buyer, with quantity 0, or marked completed are skipped.',
    'Orders are sorted by PCD first, then delivery date, product type, style and colour.',
    'A line that already has the same PCD (and the same product type) is preferred, so those orders stay together.',
    'A line whose efficiency profile lists that product type is preferred. If no line matches, the order still goes on the best available line.',
    'Sewing cannot start before PCD + 5 pre-production working days, or before the material-ready date, or before today.',
    'Duration is qty × SMV ÷ (manpower × shift minutes × line / product-type efficiency).',
    'If no line can finish before delivery, the order is still placed — immediately after the last bar on the chosen line.',
    'On the same line, bars sit flush: one ends, the next starts on the following working day. Off days (e.g. Friday) are skipped.',
    'Blue bar = started on or before PCD (on time). Yellow bar = started after PCD or misses delivery (late plan). Completed bars stay grey and never move.'
];

const loadLS = (k, d) => {
    try {
        const v = JSON.parse(localStorage.getItem(k));
        return Array.isArray(v) && v.length ? v : d;
    }
    catch {
        return d;
    }
};

const planningRoles = ref(loadLS('mbm-planning-roles', DEFAULT_ROLES));

const boards = ref(loadLS('mbm-boards', DEFAULT_BOARDS).map(b => ({
    ...b,
    unitId   : b.unitId ?? 3,
    unitName : b.unitName ?? 'AQL'
})));
const users         = ref(loadLS('mbm-users', DEFAULT_USERS));
const currentUserId = ref(localStorage.getItem('mbm-current-user') || 'u1');

const currentUser     = computed(() => users.value.find(u => u.id === currentUserId.value) || users.value[0]);
const permittedBoards = computed(() => boards.value.filter(b => currentUser.value?.boards.includes(b.id)));

function savePerms() {
    localStorage.setItem('mbm-boards', JSON.stringify(boards.value));
    localStorage.setItem('mbm-users', JSON.stringify(users.value));
    localStorage.setItem('mbm-current-user', currentUserId.value);
}

// ---------------------------------------------------------------------------
// Authentication: planning_users table in the DB (scrypt, verified server-
// side). The whole app sits behind the login overlay until authUser is set;
// Exit in the menubar signs out. The session survives reload (localStorage).
// ---------------------------------------------------------------------------
const authUser = ref((() => {
    try { return JSON.parse(localStorage.getItem('mbm-auth') || 'null'); }
    catch { return null; }
})());
const loginU    = ref(localStorage.getItem('mbm-last-user') || '');
const loginP    = ref('');
const loginShowPw = ref(false);
const loginBusy = ref(false);
const loginErr  = ref('');
const loginPwRef = ref(null);

// Browser-tab title follows the signed-in user: "MbmPlan (Ferdows)"
watch(authUser, u => {
    document.title = u ? `MbmPlan (${u.name || u.username})` : 'MbmPlan';
}, { immediate : true });

// Time-of-day greeting for the login card
const loginGreeting = computed(() => {
    const h = new Date().getHours();
    if (h < 5)  return 'শুভ রাত্রি 🌙';
    if (h < 12) return 'Good morning ☀️';
    if (h < 17) return 'Good afternoon 🌤';
    if (h < 21) return 'Good evening 🌆';
    return 'Working late 🌙';
});

// Users come from planning_users when the API is up — localStorage fallback
async function refreshUsersFromDb() {
    try {
        const dbUsers = await loadUsersDb();
        if (dbUsers.length) {
            users.value = dbUsers.map(u => ({ ...u, boards : u.boards || [] }));
            localStorage.setItem('mbm-users', JSON.stringify(users.value));
        }
    }
    catch { /* API offline — keep the local list */ }
}
refreshUsersFromDb();

async function doLogin() {
    const u = loginU.value.trim().toLowerCase();
    if (!u || !loginP.value) {
        loginErr.value = 'Username এবং password দুটোই দিন';
        return;
    }
    loginBusy.value = true;
    loginErr.value = '';
    try {
        const res = await authLogin(u, loginP.value);
        authUser.value = res;
        localStorage.setItem('mbm-auth', JSON.stringify(res));
        localStorage.setItem('mbm-last-user', res.username);
        // Board permissions follow the logged-in DB user
        await refreshUsersFromDb();
        const match = users.value.find(x => x.id === res.id || x.username === res.username);
        if (match) {
            currentUserId.value = match.id;
            localStorage.setItem('mbm-current-user', match.id);
        }
        loginP.value = '';
        loginShowPw.value = false;
        toast(`Welcome, ${res.name || res.username}`, 'ok');
        // Board already open behind the gate: take/check the edit lock as
        // the newly signed-in user
        if (view.value === 'board' && currentUnitId.value) startLockHeartbeat();
    }
    catch (e) {
        loginErr.value = /fetch|network/i.test(e.message)
            ? 'Server unreachable — API (port 4000) চালু আছে কিনা দেখুন'
            : (e.message || 'Login failed');
        loginP.value = '';
    }
    finally {
        loginBusy.value = false;
    }
}

function doLogout() {
    // Free the board's edit lock so the next user can take over immediately
    stopLockHeartbeat(true);
    authUser.value = null;
    localStorage.removeItem('mbm-auth');
    loginP.value = '';
    loginErr.value = '';
    openMenu.value = null;
    // freshest user list for the login chips
    refreshUsersFromDb();
}

// Per-user password rotation from Settings ('' = leave unchanged)
const stPasswords = ref({});

function removeOrdersWithoutBuyer(s) {
    if (!s) return;
    const drop = s.eventStore.records.filter(ev => {
        const raw = ev.data.raw;
        if (!raw || raw.stage) return false;
        return !String(raw.buyer || '').trim();
    });
    if (drop.length) s.eventStore.remove(drop);
}

function applyBoardFilter() {
    const s = getInstance();
    const b = currentBoard.value;
    if (!s || !b || !s.resourceStore) return;
    s.resourceStore.clearFilters();
    s.resourceStore.filter({
        id       : 'boardFilter',
        filterBy : r => {
            const d = r.data || {};
            if (d.holdingRow || d.subtotalRow || r.id === 'hold' || r.id === 'subtot') return true;
            if (d.lineRow || LINE_BY_ID[r.id]) {
                if (!b.floors?.length || !d.floor) return true;
                return b.floors.includes(d.floor);
            }
            return b.stages !== false;
        }
    });
    // Management role gets a read-only board (document 17). A user without
    // the edit lock keeps FULL interaction (move bars, efficiency, learning
    // curve — a what-if sandbox); only SAVING is blocked for them.
    s.readOnly = currentUser.value?.role === 'Management';
    s.refreshRows?.();
}

// ---------------------------------------------------------------------------
// Board edit lock: only ONE user edits a board at a time. The first user to
// open it takes the server-side lock (heartbeat keeps it alive); everyone
// else gets a read-only board + orders list until the holder leaves.
// ---------------------------------------------------------------------------
const boardReadOnly   = ref(false);
const boardLockHolder = ref(null);   // { username, name } when someone ELSE holds it
let   lockTimer       = null;

async function syncBoardLock() {
    const unitId = currentUnitId.value;
    const me = authUser.value;
    if (!unitId || !me?.username) return;
    try {
        const r = await acquireBoardLock(unitId, me.username, me.name);
        const wasReadOnly = boardReadOnly.value;
        if (r.ok) {
            boardReadOnly.value   = false;
            boardLockHolder.value = null;
            if (wasReadOnly) {
                toast('Edit access granted — board reloading from the saved plan (test changes discarded)', 'ok');
                // The sandbox experiments must never be saved by accident:
                // start editing from the DB truth, not the what-if state
                if (currentBoard.value) {
                    reloadBoardForUnit(currentBoard.value, { force : true });
                }
            }
        }
        else {
            boardReadOnly.value   = true;
            boardLockHolder.value = r.holder;
            if (!wasReadOnly) {
                toast(`🔒 ${r.holder?.name || r.holder?.username} is editing this board — try anything freely, but SAVE is disabled`, 'warn');
            }
        }
        // Re-assert the interaction mode every heartbeat: something in the
        // engine can flip readOnly during load, and the sandbox must stay
        // fully interactive (only saving is gated)
        const s = getInstance();
        if (s) s.readOnly = currentUser.value?.role === 'Management';
    }
    catch { /* API offline — keep current mode */ }
}

function startLockHeartbeat() {
    stopLockHeartbeat();
    syncBoardLock();
    // Holder: keeps the lock alive · viewer: takes over when the holder leaves
    lockTimer = setInterval(syncBoardLock, 30000);
}

function stopLockHeartbeat(release = false) {
    if (lockTimer) { clearInterval(lockTimer); lockTimer = null; }
    if (release && !boardReadOnly.value && currentUnitId.value && authUser.value?.username) {
        releaseBoardLock(currentUnitId.value, authUser.value.username);
    }
    boardReadOnly.value   = false;
    boardLockHolder.value = null;
}

// Tab closed / refreshed: free the lock immediately so the next user can edit
window.addEventListener('beforeunload', () => {
    if (!boardReadOnly.value && currentUnitId.value && authUser.value?.username) {
        releaseBoardLock(currentUnitId.value, authUser.value.username);
    }
});

function openBoard(b) {
    currentBoard.value = b;
    currentUnitId.value = b.unitId ?? 3;
    view.value = 'board';
    boardMin.value = false;
    openMenu.value = null;
    saveBoardView();
    startLockHeartbeat();
    if (dataSource.value === 'db') {
        reloadBoardForUnit(b); // uses cache when ready — no API wipe
    }
    else if (!apiReady.value) {
        setBoardLoad(true, 'Loading planning board…', 0);
        hydrateBoardFromApi();
    }
    requestAnimationFrame(() => {
        const s = getInstance();
        if (!s) return;
        if (s.subGrids?.locked && (s.subGrids.locked.width || 0) < 100) {
            s.subGrids.locked.width = 248;
        }
        setClock(CLOCK_DEFAULT());
        window.dispatchEvent(new Event('resize'));
        applyBoardFilter();
        removeOrdersWithoutBuyer(s);
        installFrVScroll(s);
    });
}

function closeBoard() {
    stopLockHeartbeat(true);
    view.value = 'home';
    currentBoard.value = null;
    boardMin.value = false;
    cancelCarry();
    saveBoardView();
}

function minimizeBoard() {
    view.value = 'home';
    boardMin.value = true;
    cancelCarry();
    saveBoardView();
}

function addBoard() {
    openMenu.value = null;
    const name = window.prompt('New planning board name:');
    if (!name) return;
    const floors = (window.prompt('Floors for this board (comma separated):', 'F1,F2') || 'F1,F2')
        .split(',').map(x => x.trim()).filter(Boolean);
    const b = { id : `b${Date.now()}`, name, floors, stages : floors.length > 1 };
    boards.value.push(b);
    currentUser.value.boards.push(b.id);
    savePerms();
    toast(`Planning board "${name}" added — access granted to ${currentUser.value.name}`, 'ok');
}

function addUser() {
    const name = window.prompt('New user name (display):');
    if (!name) return;
    const username = window.prompt('Login username:', name.toLowerCase().replace(/\s+/g, ''));
    if (!username) return;
    const password = window.prompt('Password (blank = 1234):') || '1234';
    users.value.push({
        id : `new-${Date.now()}`, name,
        username : username.trim().toLowerCase(),
        password, role : 'Planner', boards : []
    });
    savePerms();
}

function toggleBoardPerm(u, boardId) {
    const i = u.boards.indexOf(boardId);
    if (i >= 0) u.boards.splice(i, 1);
    else u.boards.push(boardId);
}

async function saveSettings() {
    savePerms();
    // Persist users (and any typed passwords) to planning_users in the DB
    try {
        const payload = users.value.map(u => ({
            ...u,
            password : stPasswords.value[u.id] || u.password || undefined
        }));
        const saved = await saveUsersDb(payload);
        if (saved.length) {
            users.value = saved.map(u => ({ ...u, boards : u.boards || [] }));
            localStorage.setItem('mbm-users', JSON.stringify(users.value));
        }
        stPasswords.value = {};
    }
    catch (e) {
        toast(`DB save failed (${e.message}) — saved locally only`, 'warn');
    }
    if (currentBoard.value && !currentUser.value.boards.includes(currentBoard.value.id)) {
        closeBoard();
        toast('Access to the open board was removed — view closed', 'warn');
    }
    else if (view.value === 'board') {
        applyBoardFilter();
    }
    settingsOpen.value = false;
    toast('Permissions saved', 'ok');
}

// ---------------------------------------------------------------------------
// Efficiency profiles (Setup menu): per line, per product type efficiency
// ---------------------------------------------------------------------------
const PRODUCT_TYPES = [
    { name : '_Default',             color : '#e53935' },
    { name : '5 Pkt Pant',           color : '#1b3f8f' },
    { name : '5 Pkt Shorts',         color : '#7c6ce8' },
    { name : '5 Pocket',             color : '#b23434' },
    { name : '5 Pocket Long',        color : '#ffffff' },
    { name : '5 Pocket Short',       color : '#ffffff' },
    { name : 'Accessories',          color : '#8a8a2e' },
    { name : 'Adaptive Long Sleeve', color : '#ffffff' },
    { name : 'Bag',                  color : '#8a8a2e' },
    { name : 'Basic Shirt',          color : '#ffffff' },
    { name : 'Blazer',               color : '#ee82ee' },
    { name : 'Blouse',               color : '#2e9e3f' },
    { name : 'BLOUSON',              color : '#ffffff' },
    { name : 'Bottom',               color : '#bdbdbd' },
    { name : 'Boys Pant',            color : '#e8317f' }
];

// FastReact-style defaults: pocket family runs hotter, several types unset (0)
function defaultEffFor(name, base) {
    if (name === '_Default') return base;
    if (['5 Pocket', '5 Pocket Long', '5 Pocket Short'].includes(name)) return Math.min(200, base + 8);
    if (['Adaptive Long Sleeve', 'Basic Shirt', 'Blouse', 'Bottom'].includes(name)) return base;
    if (name === 'BLOUSON') return Math.max(0, base - 15);
    return 0;
}

const effOpen     = ref(false);
const effTab      = ref('define');   // 'define' | 'types'
const effSearch   = ref('');
const effSelected = ref(0);
const effNameInput = ref('');

function seedEffProfiles() {
    return LINES.map(l => ({
        id     : `p-${l.id}`,
        name   : `AQL ${l.name}`,
        values : Object.fromEntries(PRODUCT_TYPES.map(p => [p.name, defaultEffFor(p.name, l.eff)]))
    }));
}

const loadEffList = () => {
    try {
        const v = JSON.parse(localStorage.getItem('mbm-eff-list'));
        return Array.isArray(v) && v.length ? v : null;
    }
    catch {
        return null;
    }
};

const effList = ref(loadEffList() || seedEffProfiles());
const effSelectedProfileId = ref(effList.value[0]?.id || null);

const lineProfileMap = ref((() => {
    try {
        return JSON.parse(localStorage.getItem('mbm-line-prof')) ||
               Object.fromEntries(LINES.map(l => [l.id, `p-${l.id}`]));
    }
    catch {
        return Object.fromEntries(LINES.map(l => [l.id, `p-${l.id}`]));
    }
})());

// Bar tooltips (AppConfig) read profiles from localStorage — persist the
// seeded profiles right away so both sides always see the same values
if (!localStorage.getItem('mbm-eff-list') || !localStorage.getItem('mbm-line-prof')) {
    localStorage.setItem('mbm-eff-list', JSON.stringify(effList.value));
    localStorage.setItem('mbm-line-prof', JSON.stringify(lineProfileMap.value));
}

const selProfile = computed(() =>
    effList.value.find(p => p.id === effSelectedProfileId.value) || effList.value[0]);

function ensureProfileValues(p) {
    if (!p.values) p.values = {};
    for (const t of PRODUCT_TYPES) {
        if (p.values[t.name] === undefined) p.values[t.name] = defaultEffFor(t.name, 50);
    }
    return p;
}

// Product types that this line's efficiency profile actually has data for
// (efficiency > 0, excluding _Default)
function availableProductTypes(lineId) {
    const pid = lineId ? lineProfileMap.value[lineId] : null;
    const profile = (pid && effList.value.find(p => p.id === pid))
        || effList.value[0];
    const values = profile?.values || {};
    const named = Object.entries(values)
        .filter(([name, eff]) => name !== '_Default' && Number(eff) > 0)
        .map(([name]) => name);
    if (named.length) return named;
    return PRODUCT_TYPES.filter(t => t.name !== '_Default').map(t => t.name);
}

function productTypeFromProfile(po, lineId) {
    return stripProfileType({ po }, lineId);
}

const effRows = computed(() => {
    const p = selProfile.value;
    if (!p) return [];
    ensureProfileValues(p);
    const q = effSearch.value.trim().toLowerCase();
    return PRODUCT_TYPES
        .filter(t => !q || q === '*' || t.name.toLowerCase().includes(q))
        .map((t, i) => ({ ...t, idx : i, eff : p.values[t.name] ?? 0 }));
});

// Products actually PLANNED on each line (from the live board): product type →
// total planned qty, ranked by qty. Refreshed when the dialog / Lines tab opens.
const lineBoardTop = ref({});

function refreshLineBoardTop() {
    const s = getInstance();
    const out = {};
    if (s) {
        for (const ev of s.eventStore.records) {
            const raw = ev.data?.raw;
            if (!raw || raw.stage) continue;
            const lid = lineIdOf(s, ev);
            if (lid === 'hold' || !LINE_BY_ID[lid]) continue;
            const pType = raw.productType || productTypeFromProfile(raw.po, lid);
            if (!pType) continue;
            if (!out[lid]) out[lid] = {};
            out[lid][pType] = (out[lid][pType] || 0) + (Number(raw.qty) || 0);
        }
    }
    lineBoardTop.value = out;
}

// Line-wise summary: top-3 product types PLANNED on the line (from the plan
// board, ranked by planned qty, with the line's effective efficiency for each);
// falls back to the profile's own ranking when nothing is planned yet.
const lineEffSummary = computed(() => {
    return LINES.map(l => {
        const pid     = lineProfileMap.value[l.id];
        const profile = effList.value.find(p => p.id === pid) || effList.value[0];
        ensureProfileValues(profile);
        const ranked = Object.entries(profile?.values || {})
            .filter(([name, eff]) => name !== '_Default' && Number(eff) > 0)
            .sort((a, b) => Number(b[1]) - Number(a[1]));
        const planned = Object.entries(lineBoardTop.value[l.id] || {})
            .sort((a, b) => b[1] - a[1]);
        const top3 = planned.length
            ? planned.slice(0, 3).map(([name, qty]) => ({
                name,
                qty,
                eff   : Math.round(lineEfficiencyOf(l.id, name)),
                color : PRODUCT_TYPES.find(t => t.name === name)?.color || '#888'
            }))
            : ranked.slice(0, 3).map(([name, eff]) => ({
                name,
                qty   : 0,
                eff   : Number(eff),
                color : PRODUCT_TYPES.find(t => t.name === name)?.color || '#888'
            }));
        const canDo = ranked.length;
        return { line : l, profileName : profile?.name || '—', top3, canDo, fromBoard : planned.length > 0 };
    });
});

watch(effTab, v => { if (v === 'lines') refreshLineBoardTop(); });

function saveEffState() {
    localStorage.setItem('mbm-eff-list', JSON.stringify(effList.value));
    localStorage.setItem('mbm-line-prof', JSON.stringify(lineProfileMap.value));
    // Sandbox session (no edit lock): efficiency tests stay LOCAL only
    if (boardReadOnly.value) return;
    // Mirror to the efficiency_profile table (line / product / eff% / smv)
    saveEffProfilesDb(buildEffProfileRows(getInstance()))
        .catch(() => { /* API offline - localStorage stays the source */ });
}

function openEffProfiles() {
    openMenu.value = null;
    refreshLineBoardTop();
    effTab.value = 'define';
    if (!effSelectedProfileId.value && effList.value[0]) {
        effSelectedProfileId.value = effList.value[0].id;
    }
    effOpen.value = true;
    effMin.value = false;
}

function selectEffProfile(p) {
    effSelectedProfileId.value = p.id;
    effNameInput.value = p.name;
}

function effInsert() {
    const name = effNameInput.value.trim();
    if (!name) return;
    if (effList.value.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        toast(`"${name}" নামের profile আগে থেকেই আছে`, 'warn');
        return;
    }
    const p = ensureProfileValues({ id : `p${Date.now()}`, name, values : {} });
    effList.value.push(p);
    effSelectedProfileId.value = p.id;
    saveEffState();
    toast(`Profile "${name}" inserted — Product types tab-এ efficiency দিন`, 'ok');
}

function effDelete() {
    const p = selProfile.value;
    if (!p) return;
    effList.value = effList.value.filter(x => x.id !== p.id);
    for (const [lid, pid] of Object.entries(lineProfileMap.value)) {
        if (pid === p.id) delete lineProfileMap.value[lid];
    }
    effSelectedProfileId.value = effList.value[0]?.id || null;
    effNameInput.value = '';
    saveEffState();
    toast(`Profile "${p.name}" deleted`, 'ok');
}

function toggleLineAssign(lineId) {
    const p = selProfile.value;
    if (!p) return;
    if (lineProfileMap.value[lineId] === p.id) delete lineProfileMap.value[lineId];
    else lineProfileMap.value[lineId] = p.id;
}

function effCopyDown() {
    const p = selProfile.value;
    if (!p) return;
    const rows = effRows.value;
    const from = rows[effSelected.value] ?? rows[0];
    if (!from) return;
    let hit = false;
    for (const t of PRODUCT_TYPES) {
        if (t.name === from.name) {
            hit = true;
            continue;
        }
        if (hit) p.values[t.name] = p.values[from.name];
    }
    toast(`"${from.name}" এর efficiency (${p.values[from.name]}%) নিচের সব product type-এ কপি হলো`, 'ok');
}

function effUpdate() {
    const p = selProfile.value;
    if (!p) return;
    for (const k of Object.keys(p.values)) {
        p.values[k] = Math.max(0, Math.min(200, Number(p.values[k]) || 0));
    }
    // Product-type efficiencies only. _Default is a READ-ONLY mirror of the
    // line efficiency (planning_resources.default_efficiency): line capacity
    // NEVER takes its efficiency from the profile — change line efficiency in
    // Setup → Line eff & hours instead.
    const s = getInstance();
    for (const r of s?.resourceStore.records || []) {
        if (!r.data?.lineRow) continue;
        if (lineProfileMap.value[r.id] !== p.id) continue;
        if (Number(r.data.eff) > 0) p.values._Default = Number(r.data.eff);
    }
    saveEffState();
    toast(`"${p.name}" saved — product efficiency update হলো (line efficiency আলাদা: Line eff & hours form)`, 'ok');
    if (s) {
        beginBoardInteraction(s, 'batch');
        try { packBoardGaps(s); }
        finally { endBoardInteraction(s); }
    }
}

// ---------------------------------------------------------------------------
// Line eff & hours (Setup menu): edit line efficiency + daily working hours,
// persisted to planning_resources (default_efficiency / working_hours_per_day)
// ---------------------------------------------------------------------------
const lineEffOpen   = ref(false);
const lineEffRows   = ref([]);
const lineEffSaving = ref(false);

function openLineEffForm() {
    openMenu.value = null;
    const s = getInstance();
    const rows = [];
    if (s) {
        for (const r of s.resourceStore.records) {
            if (!r.data?.lineRow || r.data?.dbId == null) continue;
            rows.push({
                dbId     : r.data.dbId,
                boardId  : r.id,
                name     : r.data.name || r.name,
                manpower : Number(r.data.manpower) || 0,
                eff      : Number(r.data.eff) || 0,
                hours    : Number(r.data.hours) || 10
            });
        }
    }
    if (!rows.length) {
        toast('Open a planning board first — lines load from the board', 'warn');
        return;
    }
    lineEffRows.value = rows;
    lineEffOpen.value = true;
}

async function saveLineEffForm() {
    const s = getInstance();
    const updates = [];
    for (const row of lineEffRows.value) {
        row.eff      = Math.max(1, Math.min(200, Number(row.eff) || 0));
        row.hours    = Math.max(1, Math.min(24, Number(row.hours) || 10));
        row.manpower = Math.max(1, Math.min(1000, Number(row.manpower) || 1));
        updates.push({ resourceId : row.dbId, eff : row.eff, hours : row.hours, manpower : row.manpower });
    }
    lineEffSaving.value = true;
    try {
        await saveLineEfficiencyDb(updates);
        // Apply to the live board, fallback line table and profile _Default
        for (const row of lineEffRows.value) {
            const availMin = Math.round(row.manpower * row.hours * 60 * row.eff / 100);
            const res = s?.resourceStore.getById(row.boardId);
            if (res) {
                res.set('eff', row.eff);
                res.set('hours', row.hours);
                res.set('manpower', row.manpower);
                res.set('availMin', availMin);
            }
            if (LINE_BY_ID[row.boardId]) {
                LINE_BY_ID[row.boardId].eff = row.eff;
                LINE_BY_ID[row.boardId].manpower = row.manpower;
                LINE_BY_ID[row.boardId].availMin = availMin;
            }
            const pid = lineProfileMap.value[row.boardId];
            const p = pid && effList.value.find(x => x.id === pid);
            if (p) {
                ensureProfileValues(p);
                p.values._Default = row.eff;
            }
        }
        localStorage.setItem('mbm-eff-list', JSON.stringify(effList.value));
        recalcCapacity(s);
        s?.refreshWithTransition?.();
        toast(`Line efficiency & hours saved for ${updates.length} line(s)`, 'ok');
        lineEffOpen.value = false;
    }
    catch (e) {
        toast(`Save failed: ${e.message}`, 'error');
    }
    finally {
        lineEffSaving.value = false;
    }
}

// ---------------------------------------------------------------------------
// Build up (learning) curves - Setup menu, FastReact style
// ---------------------------------------------------------------------------
function seedBuildUps() {
    return [
        { id : 'bc1', name : '1 Day',      period : 1, pct : [100] },
        { id : 'bc2', name : '2 Days',     period : 2, pct : [60, 100] },
        { id : 'bc3', name : '3 Days',     period : 3, pct : [40, 70, 100] },
        { id : 'bc4', name : '4 Days',     period : 4, pct : [30, 55, 80, 100] },
        { id : 'bc5', name : '5 Days',     period : 5, pct : [25, 45, 65, 85, 100] },
        { id : 'bc6', name : 'MBM 2 Days', period : 2, pct : [50, 100] },
        { id : 'bc7', name : 'MBM 3 Days', period : 3, pct : [35, 70, 100] },
        { id : 'bc8', name : 'MBM 5 Days', period : 5, pct : [20, 40, 60, 80, 100] }
    ];
}

const loadBuildUps = () => {
    try {
        const v = JSON.parse(localStorage.getItem('mbm-buildup'));
        return Array.isArray(v) && v.length ? v : null;
    }
    catch {
        return null;
    }
};

const bcList       = ref(loadBuildUps() || seedBuildUps());
// The learning-curve engine (AppConfig) reads the curves from localStorage —
// persist the seeded list right away so both sides see the same profiles
if (!localStorage.getItem('mbm-buildup')) {
    localStorage.setItem('mbm-buildup', JSON.stringify(bcList.value));
}

// Date-specific working-hour overrides survive reloads (Change working hours)
try {
    Object.assign(calendarState.overrides, JSON.parse(localStorage.getItem('mbm-cal-overrides') || '{}'));
}
catch { /* corrupt store — start clean */ }
const bcOpen       = ref(false);
const bcMin        = ref(false);
const bcTab        = ref('define');
const bcSelectedId = ref(null);
const bcName       = ref('');
const bcPeriod     = ref(1);
const bcPct        = ref([0]);
const bcRenameSelId = ref(null);
const bcRenameInput = ref('');

watch(bcPeriod, n => {
    const len = Math.max(1, Math.min(60, Number(n) || 1));
    const arr = bcPct.value.slice(0, len);
    while (arr.length < len) arr.push(0);
    bcPct.value = arr;
});

function saveBuildUps() {
    localStorage.setItem('mbm-buildup', JSON.stringify(bcList.value));
    // Sandbox session (no edit lock): learning-curve tests stay LOCAL only
    if (boardReadOnly.value) return;
    // Mirror to the learning_curve table (day number / efficiency %)
    saveLearningCurvesDb(buildLearningCurveRows())
        .catch(() => { /* API offline - localStorage stays the source */ });
}

function openBuildUps() {
    openMenu.value = null;
    bcTab.value = 'define';
    bcOpen.value = true;
    bcMin.value = false;
    if (!bcSelectedId.value && bcList.value[0]) selectBuildUp(bcList.value[0]);
}

function selectBuildUp(c) {
    bcSelectedId.value = c.id;
    bcName.value   = c.name;
    bcPeriod.value = c.period;
    bcPct.value    = [...c.pct];
}

function bcUpdate() {
    const name = bcName.value.trim();
    if (!name) {
        toast('Build up name দিন', 'warn');
        return;
    }
    const pct = bcPct.value.map(v => Math.max(0, Math.min(100, Number(v) || 0)));
    const existing = bcList.value.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existing) {
        existing.period = bcPeriod.value;
        existing.pct = pct;
        bcSelectedId.value = existing.id;
        toast(`Build up curve "${name}" updated`, 'ok');
    }
    else {
        const c = { id : `bc${Date.now()}`, name, period : bcPeriod.value, pct };
        bcList.value.push(c);
        bcSelectedId.value = c.id;
        toast(`Build up curve "${name}" added`, 'ok');
    }
    saveBuildUps();
}

function bcDelete() {
    const c = bcList.value.find(x => x.id === bcSelectedId.value);
    if (!c) return;
    bcList.value = bcList.value.filter(x => x.id !== c.id);
    bcSelectedId.value = bcList.value[0]?.id || null;
    if (bcList.value[0]) selectBuildUp(bcList.value[0]);
    else {
        bcName.value = '';
        bcPeriod.value = 1;
        bcPct.value = [0];
    }
    saveBuildUps();
    toast(`Build up curve "${c.name}" deleted`, 'ok');
}

const bcRenameCur = computed(() => bcList.value.find(c => c.id === bcRenameSelId.value) || null);

function bcRename() {
    const c = bcRenameCur.value;
    const name = bcRenameInput.value.trim();
    if (!c || !name) return;
    if (bcList.value.some(x => x.id !== c.id && x.name.toLowerCase() === name.toLowerCase())) {
        toast(`"${name}" নামে curve আগে থেকেই আছে`, 'warn');
        return;
    }
    const old = c.name;
    c.name = name;
    if (bcSelectedId.value === c.id) bcName.value = name;
    bcRenameInput.value = '';
    saveBuildUps();
    toast(`"${old}" renamed to "${name}"`, 'ok');
}

// ---------------------------------------------------------------------------
// Master data -> fastreact DB (efficiency_profile / learning_curve)
// Collected from the running software: efficiency profiles and build up
// curves. Synced on board load and whenever they are edited.
// (Line master data lives in planning_resources - no separate table.)
// ---------------------------------------------------------------------------
// Line + product type -> efficiency % from the assigned profile, with the
// average SMV of that product's strips currently planned on the line
function buildEffProfileRows(s) {
    const smvAgg = {};
    if (s) {
        for (const ev of s.eventStore.records) {
            const raw = ev.data.raw;
            if (!raw || raw.stage) continue;
            const lid = lineIdOf(s, ev);
            if (!LINE_BY_ID[lid]) continue;
            const pt = productTypeFromProfile(raw.po, lid);
            const smv = Number(raw.smv) || 0;
            if (smv > 0) (smvAgg[`${lid}|${pt}`] ||= []).push(smv);
        }
    }
    const rows = [];
    for (const l of LINES) {
        const pid = lineProfileMap.value[l.id];
        const profile = (pid && effList.value.find(p => p.id === pid)) || effList.value[0];
        if (!profile) continue;
        for (const [pt, eff] of Object.entries(profile.values || {})) {
            const arr = smvAgg[`${l.id}|${pt}`];
            rows.push({
                line        : l.name,
                profileName : profile.name,
                productType : pt,
                efficiency  : Number(eff) || 0,
                smv         : arr?.length
                    ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 100) / 100
                    : null
            });
        }
    }
    return rows;
}

// Build up curves flattened to one row per day: day number + efficiency %
function buildLearningCurveRows() {
    const rows = [];
    for (const c of bcList.value) {
        (c.pct || []).forEach((v, i) => rows.push({
            curveName  : c.name,
            periodDays : Number(c.period) || (c.pct?.length ?? 1),
            dayNumber  : i + 1,
            efficiency : Number(v) || 0
        }));
    }
    return rows;
}

function syncMasterData(s) {
    Promise.allSettled([
        saveEffProfilesDb(buildEffProfileRows(s)),
        saveLearningCurvesDb(buildLearningCurveRows())
    ]).then(results => {
        const failed = results.filter(r => r.status === 'rejected');
        if (failed.length) {
            console.warn('Master data sync failed:', failed.map(f => f.reason?.message));
        }
    });
}

// SVG polyline for the build up percentage chart
const bcChartPoints = computed(() => {
    const pct = bcPct.value.map(v => Math.max(0, Math.min(100, Number(v) || 0)));
    const n = pct.length;
    const W = 300, H = 180, PAD = 14;
    if (!n) return '';
    return pct.map((v, i) => {
        const x = PAD + (n === 1 ? (W - 2 * PAD) / 2 : (i * (W - 2 * PAD)) / (n - 1));
        const y = H - PAD - (v / 100) * (H - 2 * PAD);
        return `${Math.round(x)},${Math.round(y)}`;
    }).join(' ');
});

// Font Awesome icons (bundled with Bryntum) - SAP Fiori style shell
const shellMenus = [
    { label : 'Exit',     fa : 'fa-arrow-right-from-bracket', cls : 'fr-menu-exit' },
    { label : 'Orders',   fa : 'fa-clipboard-list' },
    { label : 'Reports',  fa : 'fa-chart-column' },
    { label : 'Planning', fa : 'fa-calendar-days' },
    { label : 'Setup',    fa : 'fa-sliders' },
    { label : 'Tools',    fa : 'fa-wrench' },
    { label : 'Repeat',   fa : 'fa-repeat' },
    { label : 'Help',     fa : 'fa-circle-question' }
];

function menuClick(m) {
    if (m.label === 'Planning' || m.label === 'Setup' || m.label === 'Reports') {
        openMenu.value = openMenu.value === m.label ? null : m.label;
        return;
    }
    openMenu.value = null;
    // Exit = sign out: back to the login screen (the board stays cached
    // behind the gate and continues after the next login)
    if (m.label === 'Exit') doLogout();
    if (m.label === 'Orders') openOrders();
}

// ---------------------------------------------------------------------------
// Orders list: every order on the board with its documents, status,
// planned line and start / end dates
// ---------------------------------------------------------------------------
const ordersOpen    = ref(false);
// ordersTab removed — single unified list
const ordersRows    = ref([]);
const ordersLoading = ref(false); // true while background pages are still loading
const ordersTotal   = ref(0);     // total rows in DB
const currentUnitId = ref(null);  // unit_id of the active planning board
const erpAllOrders  = ref([]);    // full ERP order book (projected + confirm)
const erpAllLoading = ref(false);
const ordersGlobalSearch = ref(''); // global search across all columns

// Per-column filters (case-insensitive substring match on displayed text)
const ORDER_COLS = [
    'done',
    'orderType', 'status', 'deliveryStatus',
    'unit', 'prodUnitName', 'buyer', 'style', 'productType', 'mbmOrder',
    'orderQty', 'pcd', 'pcdSource', 'orderDelivery',
    'po', 'color', 'qty', 'poDelivery', 'grouping',
    'line', 'start', 'end'
];
const ORDER_COL_LABELS = {
    done         : '✔',
    orderType    : 'Type',
    status       : 'Status',
    deliveryStatus : 'Delivery',
    unit         : 'Unit',
    prodUnitName : 'Prod Unit',
    buyer        : 'Buyer',
    style        : 'Style',
    productType  : 'Product',
    mbmOrder     : 'MBM Order',
    orderQty     : 'Order Qty',
    pcd          : 'PCD',
    pcdSource    : 'PCD Src',
    orderDelivery: 'Order Delivery',
    po           : 'PO',
    color        : 'Color',
    qty          : 'PO Qty',
    poDelivery   : 'PO Delivery',
    grouping     : 'Grouping',
    line         : 'Line',
    start        : 'Start',
    end          : 'End',
};
const orderFilters = ref(Object.fromEntries(ORDER_COLS.map(k => [k, ''])));

function orderCellText(r, key) {
    const hidePoFields = r.orderType === 'projection' || r.orderType === 'projected';
    switch (key) {
        case 'po'            : return hidePoFields ? '' : (r.poCount > 1 ? `[${r.poCount} POs] ${r.po ?? ''}` : String(r.po ?? ''));
        case 'color'         : return hidePoFields ? '' : String(r.garmentColor ?? '');
        case 'qty'           : return fmtQty(r.qty);
        case 'orderQty'      : return fmtQty(r.orderQty);
        case 'reqMin'        : return fmtQty(r.reqMin);
        case 'pcd'           : return r.pcd ? fmtDateDdMonRr(r.pcd) : '—';
        case 'poDelivery'    : return hidePoFields ? '' : (r.poDelivery ? fmtDateDdMonRr(r.poDelivery) : '—');
        case 'orderDelivery' : return r.orderDelivery ? fmtDateDdMonRr(r.orderDelivery) : '—';
        case 'start'         : return r.start ? fmtDate(r.start) : '—';
        case 'end'           : return r.end ? fmtDate(r.end) : '—';
        case 'progress'      : return `${r.progress}%`;
        case 'done'          : return '';
        case 'prodUnitName'  : return String(r.prodUnitName ?? '—');
        case 'pcdSource'     : return r.pcdSource === 'order_pcd' ? 'ERP PCD'
                                    : r.pcdSource === 'delivery_minus_30' ? 'Delivery-30'
                                    : (r.pcdStatus === 'missing' ? 'missing' : '');
        case 'deliveryStatus': return hidePoFields
            ? (projPartialInfo(r) ? 'Partial' : '')
            : String(r.deliveryStatus ?? '');
        case 'grouping'      : return hidePoFields ? '' : String(r.groupingStatus === 'not_applicable' ? '' : (r.groupingStatus ?? ''));
        default              : return String(r[key] ?? '');
    }
}

// Expanded confirm groups (show underlying POs)
const expandedGroups = ref(new Set());
function toggleGroupExpand(row) {
    const s = new Set(expandedGroups.value);
    if (s.has(row.id)) s.delete(row.id); else s.add(row.id);
    expandedGroups.value = s;
}

// Column filter queries: quantity columns accept >N <N >=N <=N =N;
// date columns accept the same operators with a date (2026-09-01, 01-09-26,
// 15-SEP-26, 01/09/2026 …). Anything else falls back to text contains.
const QTY_FILTER_COLS  = new Set(['orderQty', 'qty']);
const DATE_FILTER_COLS = new Set(['pcd', 'orderDelivery', 'poDelivery', 'start', 'end']);
const MONTHS3 = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

function parseQueryDate(sv) {
    const s = String(sv).trim().replace(/\//g, '-');
    let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);                    // 2026-09-01
    if (m) return new Date(+m[1], m[2] - 1, +m[3]);
    m = /^(\d{1,2})-(\d{1,2})-(\d{2,4})$/.exec(s);                      // 01-09-26 / 01-09-2026
    if (m) { let y = +m[3]; if (y < 100) y += 2000; return new Date(y, m[2] - 1, +m[1]); }
    m = /^(\d{1,2})-([a-z]{3,})-?(\d{2,4})?$/i.exec(s);                 // 15-SEP-26 / 15-sep
    if (m) {
        const mi = MONTHS3.indexOf(m[2].slice(0, 3).toLowerCase());
        if (mi >= 0) { let y = m[3] ? +m[3] : new Date().getFullYear(); if (y < 100) y += 2000; return new Date(y, mi, +m[1]); }
    }
    return null;
}

function cmpApply(op, a, b) {
    switch (op) {
        case '>'  : return a > b;
        case '<'  : return a < b;
        case '>=' : return a >= b;
        case '<=' : return a <= b;
        default   : return a === b;   // '='
    }
}

function matchColFilter(r, k, q) {
    const m = /^(>=|<=|=|>|<)\s*(.+)$/.exec(q.trim());
    if (m) {
        const [, op, rawVal] = m;
        if (QTY_FILTER_COLS.has(k)) {
            const val = Number(String(rawVal).replace(/,/g, ''));
            if (Number.isFinite(val)) {
                const cell = k === 'orderQty' ? (Number(r.orderQty) || 0) : (Number(r.qty) || 0);
                return cmpApply(op, cell, val);
            }
        }
        if (DATE_FILTER_COLS.has(k)) {
            const qd = parseQueryDate(rawVal);
            if (qd) {
                const cell = r[k];
                if (!(cell instanceof Date)) return false;
                const day = new Date(cell); day.setHours(0, 0, 0, 0);
                return cmpApply(op, day.getTime(), qd.getTime());
            }
        }
        // '=text' on any other column: EXACT match ("=planned" must not also
        // match "unplanned" the way a contains-filter would)
        if (op === '=') {
            return orderCellText(r, k).toLowerCase() === String(rawVal).toLowerCase();
        }
    }
    return orderCellText(r, k).toLowerCase().includes(q.toLowerCase());
}

// Column sorting: click a header to cycle ascending → descending → off
const orderSort = ref({ key : null, dir : 1 });

function toggleOrderSort(k) {
    if (k === 'done') return;
    if (orderSort.value.key !== k) orderSort.value = { key : k, dir : 1 };
    else if (orderSort.value.dir === 1) orderSort.value = { key : k, dir : -1 };
    else orderSort.value = { key : null, dir : 1 };
}

function orderSortVal(r, k) {
    if (k === 'orderQty') return Number(r.orderQty) || 0;
    if (k === 'qty') return Number(r.qty) || 0;
    if (DATE_FILTER_COLS.has(k)) return r[k] instanceof Date ? r[k].getTime() : 0;
    return orderCellText(r, k).toLowerCase();
}

// Recent-arrival filter: '' = off, 'today' = orders created today,
// 'last3' = orders created within the last 3 calendar days (incl. today)
const ordersRecentFilter = ref('');

function recentCutoff(mode) {
    const t = new Date();
    const startToday = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    return mode === 'today' ? startToday : new Date(+startToday - 2 * 86400000);
}

// Summary tiles are quick actions: type/status tiles filter, qty tiles sort
function tileAction(what) {
    if (what === 'today') { ordersRecentFilter.value = ordersRecentFilter.value === 'today' ? '' : 'today'; return; }
    if (what === 'last3') { ordersRecentFilter.value = ordersRecentFilter.value === 'last3' ? '' : 'last3'; return; }
    if (what === 'projected') { orderFilters.value.orderType = orderFilters.value.orderType === 'projected' ? '' : 'projected'; return; }
    if (what === 'confirm')   { orderFilters.value.orderType = orderFilters.value.orderType === 'confirm' ? '' : 'confirm'; return; }
    if (what === 'planned')   { orderFilters.value.status = orderFilters.value.status === '=planned' ? '' : '=planned'; return; }
    if (what === 'unplanned') { orderFilters.value.status = orderFilters.value.status === '=unplanned' ? '' : '=unplanned'; return; }
    if (what === 'orderQty')  { toggleOrderSort('orderQty'); return; }
    if (what === 'poQty')     { toggleOrderSort('qty'); return; }
}

const filteredErpOrders = computed(() => {
    // Comma-separated search: "26DROTT080, 26SUBOR150" shows rows matching ANY term
    const terms = (ordersGlobalSearch.value || '').split(',')
        .map(t => t.trim().toLowerCase()).filter(Boolean);
    const hasQuery = terms.length > 0
        || ORDER_COLS.some(k => String(orderFilters.value[k] || '').trim());
    const recentCut = ordersRecentFilter.value ? recentCutoff(ordersRecentFilter.value) : null;
    return erpAllOrders.value.filter(r => {
        // Completed orders stay OUT of the default list — they only surface
        // when the user actively searches / filters (and the row matches)
        if (r.status === 'completed' && !hasQuery) return false;
        // Recent-arrival tiles: only orders created today / in the last 3 days
        if (recentCut && !(r.createdAt && r.createdAt >= recentCut)) return false;
        // global search: any term matches any column
        if (terms.length && !terms.some(t =>
            ORDER_COLS.some(k => orderCellText(r, k).toLowerCase().includes(t)))) return false;
        // per-column filters (with >, <, >=, <=, = on qty and date columns)
        return ORDER_COLS.every(k => {
            const q = (orderFilters.value[k] || '').trim();
            return !q || matchColFilter(r, k, q);
        });
    }).sort((a, b) => {
        const { key, dir } = orderSort.value;
        if (!key) return 0;
        const av = orderSortVal(a, key), bv = orderSortVal(b, key);
        if (av < bv) return -dir;
        if (av > bv) return dir;
        return 0;
    });
});


function clearOrderFilters() {
    ordersGlobalSearch.value = '';
    ordersRecentFilter.value = '';
    orderFilters.value = Object.fromEntries(ORDER_COLS.map(k => [k, '']));
}

// ⟳ button beside Excel: reset every filter/sort AND re-download the order
// book from the DB in one click
function reloadOrdersList() {
    clearOrderFilters();
    orderSort.value = { key : null, dir : 1 };
    markedComplete.value = new Set();
    erpAllLoading.value = true;
    loadErpAllOrders(currentUnitId.value || null).then(rows => {
        erpAllOrders.value  = overlayBoardPlacements(rows);
        erpAllLoading.value = false;
        toast(`Order list refreshed — ${rows.length} row(s)`, 'ok');
    }).catch(e => {
        erpAllLoading.value = false;
        toast(`Refresh failed: ${e.message}`, 'error');
    });
}

// True while the user has text selected in the list — a select-drag must not
// fire the row's board-navigation click, so copying works naturally
function windowSelectionActive() {
    return !!(window.getSelection && String(window.getSelection()).length);
}

// Instant hover tooltip over the orders table: data cells show their FULL
// value; badge cells (Type/Status/…) show the row's note
const odTip = ref({ show : false, text : '', x : 0, y : 0 });

function odBodyOver(e) {
    const td = e.target?.closest?.('td');
    if (!td || !td.closest('.od-table')) {
        if (odTip.value.show) odTip.value = { ...odTip.value, show : false };
        return;
    }
    const full = td.dataset.full;
    const note = td.parentElement?.dataset?.note;
    const text = (full && full.trim() && full !== '—') ? full : (note || '');
    if (!text) {
        if (odTip.value.show) odTip.value = { ...odTip.value, show : false };
        return;
    }
    odTip.value = { show : true, text, x : e.clientX + 12, y : e.clientY + 18 };
}

function odBodyMove(e) {
    if (odTip.value.show) {
        odTip.value = { ...odTip.value, x : e.clientX + 12, y : e.clientY + 18 };
    }
}

function odBodyLeave() {
    odTip.value = { ...odTip.value, show : false };
}

// Projection ↔ confirm quantity reconciliation: sum each order's confirm PO
// qty — a projected row whose confirms don't add up to the order qty is a
// PARTIAL order (some POs not issued yet / short-shipped)
const confirmQtyByOrder = computed(() => {
    const m = new Map();
    for (const r of erpAllOrders.value) {
        if (r.orderType !== 'confirm' || !r.mbmOrder) continue;
        m.set(r.mbmOrder, (m.get(r.mbmOrder) || 0) + (Number(r.qty) || 0));
    }
    return m;
});

function projPartialInfo(r) {
    if (r.orderType !== 'projected') return null;
    if (!r.mbmOrder || !confirmQtyByOrder.value.has(r.mbmOrder)) return null;
    const confQty  = confirmQtyByOrder.value.get(r.mbmOrder);
    const orderQty = Number(r.orderQty) || 0;
    if (!orderQty || confQty === orderQty) return null;
    return { confQty, orderQty, diff : orderQty - confQty };
}

// Live summary over the FILTERED rows (shown above the table + qty headers)
const ordersSummary = computed(() => {
    let proj = 0, conf = 0, orderQty = 0, poQty = 0;
    let plannedQty = 0, unplannedQty = 0, todayQty = 0, last3Qty = 0;
    const cutToday = recentCutoff('today');
    const cut3     = recentCutoff('last3');
    const rowQty = r => Number(r.orderType === 'confirm' ? r.qty : r.orderQty) || 0;
    for (const r of filteredErpOrders.value) {
        if (r.orderType === 'confirm') {
            conf++;
            poQty += Number(r.qty) || 0;
        }
        else {
            proj++;
            orderQty += Number(r.orderQty) || 0;
        }
        if (r.planned || r.status === 'planned') plannedQty += rowQty(r);
        else if (r.status === 'unplanned') unplannedQty += rowQty(r);
        if (r.createdAt) {
            if (r.createdAt >= cutToday) todayQty += rowQty(r);
            if (r.createdAt >= cut3)     last3Qty += rowQty(r);
        }
    }
    return { rows : filteredErpOrders.value.length, proj, conf, orderQty, poQty, plannedQty, unplannedQty, todayQty, last3Qty };
});

// ---------------------------------------------------------------------------
// Mark complete: checkbox on PROJECTED rows. Saving removes every bar of the
// order (projection, confirm, split pieces) from the board — the slot stays
// EMPTY (no repacking) — and flags the order completed in the DB.
// ---------------------------------------------------------------------------
const markedComplete = ref(new Set());
const markSaving     = ref(false);

function toggleMarkComplete(row) {
    const s = new Set(markedComplete.value);
    const code = row.mbmOrder;
    if (!code) return;
    if (s.has(code)) s.delete(code); else s.add(code);
    markedComplete.value = s;
}

// Header "check all": marks every checkable row in the CURRENT filter
// (projected, not yet completed)
const checkableFilteredOrders = computed(() =>
    filteredErpOrders.value.filter(r =>
        r.orderType === 'projected' && r.status !== 'completed' && r.mbmOrder));

const allComplChecked = computed(() =>
    checkableFilteredOrders.value.length > 0 &&
    checkableFilteredOrders.value.every(r => markedComplete.value.has(r.mbmOrder)));

function toggleMarkAll() {
    const s = new Set(markedComplete.value);
    if (allComplChecked.value) {
        for (const r of checkableFilteredOrders.value) s.delete(r.mbmOrder);
    }
    else {
        for (const r of checkableFilteredOrders.value) s.add(r.mbmOrder);
    }
    markedComplete.value = s;
}

async function saveMarkedComplete() {
    // Completing orders writes to the DB — blocked without the edit lock
    if (boardReadOnly.value) {
        const h = boardLockHolder.value;
        toast(`🔒 Save disabled — ${h?.name || h?.username || 'another user'} is editing this board`, 'warn');
        return;
    }
    const codes = [...markedComplete.value];
    if (!codes.length) return;
    const s = getInstance();
    markSaving.value = true;
    try {
        await completeOrdersDb(codes);
        // Remove every bar of these orders — slot stays empty, nothing repacks
        if (s) {
            const codeSet = new Set(codes);
            const drop = s.eventStore.records.filter(ev => {
                const raw = ev.data?.raw;
                return raw && !raw.stage && codeSet.has(String(raw.mbmOrder || ''));
            });
            for (const ev of drop) {
                const sid = String(ev.id);
                if (sid.startsWith('db-') && !sid.includes('-sp')) {
                    const dbId = Number(sid.slice(3).split('-')[0]);
                    if (dbId) removedDbEventIds.add(dbId);
                }
            }
            if (drop.length) {
                // Plain (un-batched) removal: the batch wrapper suspends store
                // events, so Bryntum's UI never hears the removal and the bars
                // stay visible until reload. A direct remove repaints INSTANTLY.
                for (const ev of drop) {
                    const asgn = s.assignmentStore?.records?.filter(a =>
                        String(a.eventId ?? a.event?.id) === String(ev.id)) || [];
                    if (asgn.length) s.assignmentStore.remove(asgn);
                }
                s.eventStore.remove(drop);
                s.features?.eventTooltip?.hide?.();
                s.refreshRows?.();
            }
            // Persist the removals (cancels the events server-side)
            await syncToApi(s, { eventIds : [] });
            setBoardBaseline(s);
            recalcCapacity(s);
            touchBoardCache(s);
        }
        // Drop them from the unplanned pool too so nothing replans them
        unplanned.value = unplanned.value.filter(u => !codes.includes(String(u.mbmOrder || '')));
        toast(`${codes.length} order(s) marked complete — removed from the board`, 'ok');
        markedComplete.value = new Set();
        // INSTANT list update — the server already confirmed, so flip the
        // rows locally instead of re-downloading the whole order book
        const codeSet2 = new Set(codes);
        for (const r of erpAllOrders.value) {
            if (codeSet2.has(String(r.mbmOrder || ''))) {
                r.status   = 'completed';
                r.planned  = false;
                r.replaced = false;
            }
        }
        erpAllOrders.value = [...erpAllOrders.value];
    }
    catch (e) {
        toast(`Mark complete failed: ${e.message}`, 'error');
    }
    finally {
        markSaving.value = false;
    }
}

// Export the filtered rows to Excel (same .xls HTML approach as Day Plan)
function exportOrdersExcel() {
    const rows = filteredErpOrders.value;
    if (!rows.length) {
        toast('No rows to export — adjust the filters first', 'warn');
        return;
    }
    const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const th = ORDER_COLS.map(k => `<th>${esc(ORDER_COL_LABELS[k])}</th>`).join('');
    const body = rows.map(r => ORDER_COLS.map(k => {
        let v;
        if (k === 'orderType')  v = r.orderType === 'confirm' ? 'Confirm' : 'Projected';
        else if (k === 'status') v = r.replaced || r.status === 'replaced' ? 'replaced' : r.status;
        else v = orderCellText(r, k);
        const num = k === 'qty' || k === 'orderQty';
        return `<td${num ? ' style="text-align:right"' : ''}>${esc(v)}</td>`;
    }).join('')).map(cells => `<tr>${cells}</tr>`).join('');
    const s = ordersSummary.value;
    const summary = `<div style="margin:4px 0 8px;font-size:9pt">
        Rows: <b>${s.rows}</b> · Projected: <b>${s.proj}</b> · Confirm: <b>${s.conf}</b> ·
        Orders: <b>${s.orders}</b> · Order Qty: <b>${fmtQty(s.orderQty)}</b> · PO Qty: <b>${fmtQty(s.poQty)}</b></div>`;
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head><meta charset="UTF-8">
<style>
  table { border-collapse: collapse; font-family: Calibri, Arial, sans-serif; font-size: 9pt; }
  th, td { border: 1px solid #000; white-space: nowrap; padding: 2px 6px; }
  th { background: #17356b; color: #fff; font-weight: bold; }
</style>
</head>
<body>
<h2 style="margin:0">All Orders</h2>
${summary}
<table><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table>
</body></html>`;
    const blob = new Blob(['﻿' + html], { type : 'application/vnd.ms-excel' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `AllOrders_${new Date().toISOString().slice(0, 10)}.xls`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast(`Exported ${rows.length} row(s) to Excel`, 'ok');
}

function listStatus(raw, planned) {
    if (raw?.replaced || raw?.status === 'replaced') return 'replaced';
    if (!planned || raw?.status === 'unplanned') return 'unplanned';
    if (raw?.status === 'completed') return 'completed';
    return 'planned';
}

function rememberReplaced(raw, confirm) {
    const id = String(raw.id || raw.dbId || raw.po || '');
    if (!id || replacedOrders.value.some(r => String(r.id) === id)) return;
    replacedOrders.value.push({
        id,
        dbId       : raw.dbId,
        buyer      : raw.buyer,
        style      : raw.style,
        po         : raw.po,
        mbmOrder   : raw.mbmOrder || mbmOrderNo(raw.po, raw.mbmOrder),
        productType : raw.productType,
        color      : raw.color,
        qty        : raw.qty,
        orderQty   : raw.orderQty ?? raw.qty,
        smv        : raw.smv,
        pcd        : raw.pcd,
        ship       : raw.ship,
        unitId     : raw.unitId,
        unitName   : raw.unitName,
        orderType  : 'projection',
        status     : 'replaced',
        replaced   : true,
        replacedBy : confirm?.po || confirm?.mbmOrder || '',
        planned    : false
    });
}

// FastReact: when a confirm exists for the same MBM order / style, it takes
// the projection's slot on the board and the projection is flagged replaced
function replaceProjectionsWithConfirms(s) {
    if (!AUTO_REPLACE_WITH_CONFIRMS) return 0;
    if (!s) return 0;
    // Match projection ↔ confirm by ORDER CODE — it is unique per order and
    // survives bars loaded from the DB that carry no style/buyer (family key
    // would never match those)
    const reconKey = o => {
        const m = String(o.mbmOrder || o.order_code || '').trim().toLowerCase();
        return m && m !== 'mbm-0' ? m : orderFamilyKey(o);
    };
    // Every confirm colour-group of an order gets planned — the first group
    // replaces the projection bar in place, the remaining groups are inserted
    // flush after it on the same line.
    const confirmEvents  = new Map();   // key -> confirm bars already on board
    const confirmGroups  = new Map();   // key -> unplanned confirm colour groups

    for (const ev of s.eventStore.records) {
        const raw = ev.data?.raw;
        if (!raw || raw.stage) continue;
        raw.orderType = orderTypeOf(raw.po, raw.orderType);
        if (raw.orderType === 'confirm') {
            const k = reconKey(raw);
            if (!confirmEvents.has(k)) confirmEvents.set(k, []);
            confirmEvents.get(k).push(ev);
        }
    }
    for (const u of unplanned.value) {
        if (u.replaced || u.status === 'replaced') continue;
        u.orderType = orderTypeOf(u.po, u.orderType);
        if (u.orderType === 'confirm') {
            const k = reconKey(u);
            if (!confirmGroups.has(k)) confirmGroups.set(k, []);
            confirmGroups.get(k).push(u);
        }
    }

    if (!confirmEvents.size && !confirmGroups.size) return 0;

    const confirms = new Map();
    for (const [k, evs] of confirmEvents) confirms.set(k, { kind : 'event', ev : evs[0], raw : evs[0].data.raw });
    for (const [k, us] of confirmGroups) {
        if (!confirms.has(k)) confirms.set(k, { kind : 'unplanned', u : us[0] });
    }

    // Insert one unplanned confirm group as a NEW bar right after anchorEv
    const insertGroupAfter = (anchorEv, u) => {
        const lid = lineIdOf(s, anchorEv);
        if (!lid || lid === 'hold') return null;
        const evId = `ev-${u.id}`;
        if (s.eventStore.getById(evId)) return null;
        const aRaw = anchorEv.data.raw;
        const raw2 = {
            id : u.id, dbId : u.dbId,
            buyer : u.buyer, style : u.style, po : u.po,
            mbmOrder : u.mbmOrder, orderType : 'confirm',
            productType : u.productType || aRaw.productType,
            qty : Number(u.qty ?? u.orderQty) || 0,
            orderQty : Number(u.orderQty ?? u.qty) || 0,
            smv : Number(u.smv) > 0 ? Number(u.smv) : aRaw.smv,
            ship : u.ship, pcd : u.pcd, matReady : u.matReady,
            color : u.color,
            poList : Array.isArray(u.poList) && u.poList.length ? u.poList : (u.po ? [u.po] : []),
            idList : Array.isArray(u.idList) && u.idList.length ? u.idList : (u.dbId ? [u.dbId] : []),
            poCount : u.poCount || 1,
            poDetails : Array.isArray(u.poDetails) ? u.poDetails : [],
            progress : 0, status : 'draft',
            eventCode : `EV-C${u.dbId}-SEW`,
            viaReplacement : true,
            risk : { score : 0, level : 'low', label : 'On track', reasons : [] }
        };
        applyLineFormulaDuration(s, raw2, lid);
        const start = nextStartAfter(anchorEv.endDate);
        const end   = endOfWork(start, raw2.dur || 1);
        raw2.start = start;
        raw2.end   = end;
        s.eventStore.add({
            id : evId, resourceId : lid,
            startDate : start, endDate : end,
            duration : elapsedDays(start, end), durationUnit : 'day',
            manuallyScheduled : true,
            name : `${raw2.buyer || ''} | ${raw2.mbmOrder || raw2.po}`,
            percentDone : 0,
            raw : raw2
        });
        // Inserted before the baseline snapshot — must be force-included in
        // the next save's change list or it silently never persists
        pendingSwapIds.add(evId);
        return s.eventStore.getById(evId);
    };

    const dropEvents = [];
    const dropUnplanned = new Set();
    let n = 0;

    // Split projection strips of one order share the full orderQty — partial
    // shrinking can only be apportioned safely when the order has ONE strip
    const projStrips = new Map();
    for (const ev of s.eventStore.records) {
        const raw = ev.data?.raw;
        if (!raw || raw.stage || raw.orderType !== 'projection') continue;
        const k = reconKey(raw);
        projStrips.set(k, (projStrips.get(k) || 0) + 1);
    }

    for (const ev of s.eventStore.records) {
        const raw = ev.data?.raw;
        if (!raw || raw.stage || raw.orderType !== 'projection') continue;
        const key = reconKey(raw);
        const hit = confirms.get(key);
        if (!hit) continue;
        // PARTIAL REPLACEMENT: confirm POs cover LESS than the full order qty —
        // only the confirmed portion is swapped in. The projection bar shrinks
        // to the unconfirmed remainder and STAYS on the board as a projection;
        // later confirm arrivals shrink it further until it is fully replaced.
        const grpList = (confirmGroups.get(key) || []).filter(g => !dropUnplanned.has(String(g.id)));
        const evQty   = (confirmEvents.get(key) || []).reduce((t, e2) => t + (Number(e2.data?.raw?.qty) || 0), 0);
        const grpQty  = grpList.reduce((t, g) => t + (Number(g.qty ?? g.orderQty) || 0), 0);
        const fullQty = Number(raw.orderQty || raw.qty) || 0;
        const remaining = fullQty - evQty - grpQty;
        if (remaining >= 1 && (evQty + grpQty) > 0 && projStrips.get(key) === 1) {
            const lid = lineIdOf(s, ev);
            if (Math.abs(Number(raw.qty) - remaining) >= 1) {
                raw.qty    = remaining;
                raw.reqMin = Math.round(remaining * (Number(raw.smv) || 0));
                if (lid && lid !== 'hold') {
                    applyLineFormulaDuration(s, raw, lid);
                    const end = endOfWork(ev.startDate, raw.dur || 1);
                    raw.end = end;
                    ev.set({ endDate : end, duration : elapsedDays(ev.startDate, end) });
                }
                pendingSwapIds.add(String(ev.id));
                n++;
            }
            let anchor = ev;
            for (const g of grpList) {
                const added = insertGroupAfter(anchor, g);
                if (added) {
                    dropUnplanned.add(String(g.id));
                    anchor = added;
                    n++;
                }
            }
            if (anchor !== ev && lid) pushFollowers(s, lid, anchor);
            continue;
        }
        rememberReplaced(raw, hit.raw || hit.u);
        if (hit.kind === 'event' && hit.ev !== ev) {
            dropEvents.push(ev);
        }
        else if (hit.kind === 'unplanned') {
            const c = hit.u;
            raw.orderType = 'confirm';
            raw.replaced  = false;
            raw.po        = c.po || raw.po;
            raw.mbmOrder  = c.mbmOrder || raw.mbmOrder;
            raw.qty       = Number(c.qty ?? c.orderQty ?? raw.qty);
            raw.orderQty  = Number(c.orderQty ?? c.qty ?? raw.orderQty);
            raw.ship      = c.ship || raw.ship;
            raw.pcd       = c.pcd || raw.pcd;
            raw.smv       = Number(c.smv) > 0 ? Number(c.smv) : raw.smv;
            raw.dbId      = c.dbId ?? raw.dbId;
            raw.id        = c.id || raw.id;
            raw.color     = c.color || orderColor(raw.po);
            // Consolidated confirm bar: carry the whole PO group so the sync
            // marks every planning_orders row of the group as planned
            raw.poList    = Array.isArray(c.poList) && c.poList.length ? c.poList : (raw.po ? [raw.po] : []);
            raw.idList    = Array.isArray(c.idList) && c.idList.length ? c.idList : (raw.dbId ? [raw.dbId] : []);
            raw.poCount   = c.poCount || raw.poList.length || 1;
            raw.poDetails = Array.isArray(c.poDetails) ? c.poDetails : (raw.poDetails || []);
            // The event keeps its stable 'ev-proj:' code (PO-based codes can
            // collide when one PO number spans several orders/colours) — the
            // confirm link is carried by planning_order_id via raw.dbId.
            ev.set('name', `${raw.buyer} | ${raw.mbmOrder || raw.po}`);
            dropUnplanned.add(String(c.id));
            pendingSwapIds.add(String(ev.id));
            // Remaining colour groups of the SAME order: insert flush after
            // the swapped bar so the whole order is planned, not one colour
            const rest = (confirmGroups.get(reconKey(raw)) || []).filter(g => g !== c);
            let anchor = ev;
            for (const g of rest) {
                const added = insertGroupAfter(anchor, g);
                if (added) {
                    dropUnplanned.add(String(g.id));
                    anchor = added;
                }
            }
            if (anchor !== ev) pushFollowers(s, lineIdOf(s, ev), anchor);
        }
        n++;
    }

    // Second pass: orders whose confirm bar is ALREADY on the board (e.g.
    // after a save/reload the projection is gone) but still have unplanned
    // colour groups — insert those after the order's last bar on its line.
    for (const [k, groups] of confirmGroups) {
        const evs = confirmEvents.get(k);
        if (!evs || !evs.length) continue;
        let anchor = evs.reduce((a, b) => (b.endDate > a.endDate ? b : a));
        const startAnchor = anchor;
        for (const g of groups) {
            if (dropUnplanned.has(String(g.id))) continue;
            const added = insertGroupAfter(anchor, g);
            if (added) {
                dropUnplanned.add(String(g.id));
                anchor = added;
                n++;
            }
        }
        if (anchor !== startAnchor) pushFollowers(s, lineIdOf(s, startAnchor), anchor);
    }

    // Unplanned projections that merely have a linked Confirm Order are NOT
    // flagged or purged: the projection remains the capacity-planning record
    // until an approved replacement executes (the in-place bar swap above,
    // which only applies to projection bars already planned on the board).
    if (dropEvents.length) {
        s.eventStore.remove(dropEvents);
    }
    if (dropUnplanned.size) {
        unplanned.value = unplanned.value.filter(u => !dropUnplanned.has(String(u.id)));
    }
    return n;
}

function collectOrders() {
    const s = getInstance();
    const rows = [];
    const onBoardPos = new Set();
    if (s) {
        for (const ev of s.eventStore.records) {
            const raw = ev.data.raw;
            if (!raw || raw.stage) continue;
            if (!String(raw.buyer || '').trim()) continue;
            const lid = lineIdOf(s, ev);
            const onHold = lid === 'hold' || !LINE_BY_ID[lid];
            const poDelivery = raw.ship ? new Date(raw.ship) : null;
            const smv  = Number(raw.smv) > 0 ? Number(raw.smv) : randSmv(raw.po);
            if (raw.po) onBoardPos.add(String(raw.po));
            rows.push({
                id : ev.id, planned : !onHold,
                unit : raw.unitName || currentBoard.value?.unitName || 'AQL',
                po : raw.po, mbmOrder : mbmOrderNo(raw.po, raw.mbmOrder),
                buyer : raw.buyer, style : raw.style,
                productType : productTypeFromProfile(raw.po, onHold ? null : lid),
                color : orderColor(raw.po),
                garmentColor : raw.color || '',
                orderQty : raw.orderQty ?? raw.qty,
                qty : raw.qty, smv, reqMin : Math.round(raw.qty * smv),
                pcd : raw.pcd ? new Date(raw.pcd) : (poDelivery ? addCalDays(poDelivery, -30) : null),
                poDelivery : onHold ? null : poDelivery,
                orderDelivery : poDelivery,
                orderType : orderTypeOf(raw.po, raw.orderType),
                status : onHold ? 'unplanned' : listStatus(raw, true),
                replaced : !!raw.replaced,
                line : onHold ? '—' : (s.resourceStore?.getById(lid)?.name || lid),
                start : onHold ? null : ev.startDate,
                end : onHold ? null : ev.endDate,
                progress : raw.progress,
                poCount : raw.poCount || 1,
                poList  : raw.poList  || []
            });
        }
    }
    for (const u of unplanned.value) {
        if (currentUnitId.value && u.unitId && u.unitId !== currentUnitId.value) continue;
        if (u.po && onBoardPos.has(String(u.po))) continue;
        if (!String(u.buyer || '').trim()) continue;
        const smv = Number(u.smv) > 0 ? Number(u.smv) : randSmv(u.po);
        const details = u.poDetails?.length > 0 ? u.poDetails : null;
        if (details && u.poCount > 1) {
            // Expand grouped confirm order into individual PO rows for the All Orders list
            for (const d of details) {
                const dShip = d.ship ? new Date(d.ship) : (u.ship ? new Date(u.ship) : null);
                const dQty  = Number(d.remaining ?? d.qty ?? 0);
                const dOrdQty = Number(d.qty ?? 0);
                rows.push({
                    id : `${u.id}-${d.id}`, planned : false,
                    unit : u.unitName || unitLabel(u.unitId) || '—',
                    po : d.po, mbmOrder : mbmOrderNo(d.po, u.mbmOrder),
                    buyer : u.buyer, style : u.style,
                    productType : productTypeFromProfile(d.po, u.suitable?.[0]),
                    color : orderColor(d.po),
                    garmentColor : u.color || '',
                    orderQty : dOrdQty,
                    qty : dQty, smv, reqMin : Math.round(dQty * smv),
                    pcd : u.pcd ? new Date(u.pcd) : (dShip ? addCalDays(dShip, -30) : null),
                    poDelivery : dShip,
                    orderDelivery : dShip,
                    orderType : orderTypeOf(d.po, u.orderType),
                    status : 'unplanned', replaced : false,
                    line : '—', start : null, end : null, progress : 0,
                    poCount : 1, poList : [d.po]
                });
            }
        } else {
            const poDelivery = u.ship ? new Date(u.ship) : null;
            rows.push({
                id : u.id, planned : false,
                unit : u.unitName || unitLabel(u.unitId) || '—',
                po : u.po, mbmOrder : mbmOrderNo(u.po, u.mbmOrder),
                buyer : u.buyer, style : u.style,
                productType : productTypeFromProfile(u.po, u.suitable?.[0]),
                color : orderColor(u.po),
                garmentColor : u.color || '',
                orderQty : u.orderQty ?? u.qty,
                qty : u.qty, smv, reqMin : Math.round(u.qty * smv),
                pcd : u.pcd ? new Date(u.pcd) : (poDelivery ? addCalDays(poDelivery, -30) : null),
                poDelivery,
                orderDelivery : poDelivery,
                orderType : orderTypeOf(u.po, u.orderType),
                status : u.replaced ? 'replaced' : 'unplanned',
                replaced : !!u.replaced,
                line : '—', start : null, end : null, progress : 0,
                poCount : u.poCount || 1,
                poList  : u.poList  || []
            });
        }
    }
    const listed = new Set(rows.map(r => String(r.id)));
    for (const u of replacedOrders.value) {
        if (listed.has(String(u.id))) continue;
        if (currentUnitId.value && u.unitId && u.unitId !== currentUnitId.value) continue;
        listed.add(String(u.id));
        rows.push({
            id : u.id, planned : false,
            unit : u.unitName || currentBoard.value?.unitName || 'AQL',
            po : u.po, mbmOrder : u.mbmOrder || mbmOrderNo(u.po, u.mbmOrder),
            buyer : u.buyer, style : u.style,
            productType : u.productType,
            color : u.color,
            orderQty : u.orderQty ?? u.qty,
            qty : u.qty, smv : u.smv, reqMin : Math.round((u.qty || 0) * (u.smv || 0)),
            pcd : u.pcd ? new Date(u.pcd) : null,
            poDelivery : u.ship ? new Date(u.ship) : null,
            orderDelivery : u.ship ? new Date(u.ship) : null,
            orderType : 'projection',
            status : 'replaced',
            replaced : true,
            line : '—', start : null, end : null, progress : 0
        });
    }
    rows.sort((a, b) => String(a.po).localeCompare(String(b.po)));
    return rows;
}

function unitLabel(id) {
    const m = { 1 : 'AQL', 2 : 'MBM', 3 : 'AQL', 4 : 'Cutting', 5 : 'Finishing' };
    return m[Number(id)] || (id ? `Unit ${id}` : '—');
}

// Projected rows planned on the LIVE board (not yet saved to DB) still show
// their line / start / end in the Orders list — overlay from the scheduler.
function overlayBoardPlacements(rows) {
    const s = getInstance();
    if (!s) return rows;
    const byProj = new Map();
    for (const ev of s.eventStore.records) {
        const raw = ev.data?.raw;
        if (!raw || raw.stage) continue;
        const pid = String(raw.id || '');
        if (pid.startsWith('proj:')) byProj.set(pid.slice(5), ev);
    }
    if (!byProj.size) return rows;
    for (const r of rows) {
        if (r.orderType !== 'projected' || !r.mbmOrder) continue;
        const ev = byProj.get(r.mbmOrder);
        if (!ev) continue;
        const lid = lineIdOf(s, ev);
        const res = lid ? s.resourceStore.getById(lid) : null;
        r.line  = res?.data?.name || res?.name || r.line;
        r.start = ev.startDate ? new Date(ev.startDate) : r.start;
        r.end   = ev.endDate   ? new Date(ev.endDate)   : r.end;
        // The projection's own bar is live on the board — it is PLANNED, not
        // replaced (replaced = bar gone, a planned confirm took its slot)
        if (r.status === 'unplanned' || r.status === 'replaced' || r.replaced) {
            r.status   = 'planned';
            r.planned  = true;
            r.replaced = false;
        }
    }
    return rows;
}

function openOrders() {
    ordersOpen.value  = true;
    ordersMin.value   = false;
    // Load ERP all-orders (projected + confirm) for the All Orders tab
    erpAllLoading.value = true;
    erpAllOrders.value  = [];
    loadErpAllOrders(currentUnitId.value || null).then(rows => {
        erpAllOrders.value  = overlayBoardPlacements(rows);
        erpAllLoading.value = false;
    }).catch(() => { erpAllLoading.value = false; });
    // Also refresh confirm groups from board + unplanned (for Confirm Orders tab)
    ordersRows.value    = collectOrders();
    ordersLoading.value = true;
    const FIRST  = 100;
    const unitId = currentUnitId.value;
    loadUnplannedDbPaged(FIRST, (chunk, total, offset) => {
        ordersTotal.value = total;
        if (offset === 0) {
            unplanned.value = chunk;
        } else {
            const existingIds = new Set(unplanned.value.map(u => u.id));
            const fresh = chunk.filter(u => !existingIds.has(u.id));
            unplanned.value = [...unplanned.value, ...fresh];
        }
        ordersRows.value = collectOrders();
        if (unplanned.value.length >= total) ordersLoading.value = false;
    }, unitId).catch(() => { ordersLoading.value = false; });
}

function isoInputDate(d) {
    const x = new Date(d);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}

function fmtDdMmYy(d) {
    if (!d) return '—';
    const x = new Date(d);
    return `${String(x.getDate()).padStart(2, '0')}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getFullYear()).slice(-2)}`;
}

function dpEsc(v) {
    return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function dpCmPerPc(po) {
    let h = 0;
    for (const c of String(po || '') + ':cm') h = ((h << 5) - h) + c.charCodeAt(0);
    return Math.round(50 + Math.abs(h) % 180) / 100;
}

function dpLineCode(res) {
    const m = String(res?.id || '').match(/^l(\d+)$/);
    const unit = res?.data?.unit || res?.unit || 'AQL';
    if (m) return `${unit}-A${Number(m[1])}`;
    return res?.name || '—';
}

function dpDayKey(d) {
    const x = new Date(d);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}

function dpEachDay(from, to) {
    const out = [];
    const d = new Date(from);
    d.setHours(0, 0, 0, 0);
    const end = new Date(to);
    end.setHours(0, 0, 0, 0);
    let guard = 0;
    while (d <= end && guard++ < 400) {
        out.push(new Date(d));
        d.setDate(d.getDate() + 1);
    }
    return out;
}

// Long ranges use one column per month instead of per day
function dpEachMonth(from, to) {
    const out = [];
    const d = new Date(from.getFullYear(), from.getMonth(), 1);
    const end = new Date(to.getFullYear(), to.getMonth(), 1);
    let guard = 0;
    while (d <= end && guard++ < 80) {
        out.push(new Date(d));
        d.setMonth(d.getMonth() + 1);
    }
    return out;
}

function dpMonthKey(d) {
    const x = new Date(d);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`;
}

function dpColKey(d) {
    return dpMode.value === 'month' ? dpMonthKey(d) : dpDayKey(d);
}

const DP_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function dpColLabel(d) {
    if (dpMode.value !== 'month') return fmtDdMmYy(d);
    const x = new Date(d);
    return `${DP_MONTHS[x.getMonth()]}-${String(x.getFullYear()).slice(-2)}`;
}

// Collapse a daily {YYYY-MM-DD: qty} map into monthly {YYYY-MM: qty}
function dpCollapseMonths(days) {
    const out = {};
    for (const [k, v] of Object.entries(days)) {
        const mk = k.slice(0, 7);
        out[mk] = (out[mk] || 0) + v;
    }
    return out;
}

function dpStripDaily(ev, line, planEff = 0) {
    const raw = ev.data.raw;
    const map = {}, effMap = {};
    const availMin = (line?.availMin || Number(line?.data?.availMin) || 12000) * (raw.stripEff || 100) / 100;
    const smv = Math.max(0.1, Number(raw.smv) || randSmv(raw.po));
    const dailyTarget = Math.max(1, Math.floor(availMin / smv));
    // Learning-curve ramp + changed-hours dates shape the per-day capacity
    // and the day's APPLIED efficiency (FastReact's Eff % row)
    const lc     = raw.lc?.applied && Array.isArray(raw.lc.pct) ? raw.lc : null;
    const period = lc ? lc.pct.length : 0;
    let remaining = Number(raw.qty) || 0;
    let workIdx = 0;
    const d = new Date(ev.startDate);
    d.setHours(0, 0, 0, 0);
    const end = new Date(ev.endDate);
    const days = [];
    let guard = 0;
    while (d < end && guard++ < 200) {
        const off = isOffDay(d);
        const rampIdx = lc ? (lc.dayOffset || 0) + workIdx : period;
        const ramping = lc && !off && rampIdx < period;
        const lcF  = ramping ? lc.pct[rampIdx] / 100 : 1;
        const hrsF = dayCapacityFactor(d, line?.hours);
        const dayTarget = Math.max(1, Math.floor(dailyTarget * lcF * hrsF));
        let q = 0;
        if (!off && remaining > 0) {
            q = Math.min(dayTarget, remaining);
            remaining -= q;
        }
        days.push({ key : dpDayKey(d), q, off, eff : Math.round((Number(planEff) || 0) * lcF) });
        if (!off) workIdx++;
        d.setDate(d.getDate() + 1);
    }
    if (remaining > 0) {
        const lastW = [...days].reverse().find(x => !x.off);
        if (lastW) lastW.q += remaining;
    }
    for (const x of days) {
        if (x.q) {
            map[x.key]    = x.q;
            effMap[x.key] = x.eff;
        }
    }
    return { map, effMap };
}

const DP_META = [
    { k : 'floor',      label : 'Floor' },
    { k : 'line',       label : 'Line' },
    { k : 'buyer',      label : 'Buyer' },
    { k : 'mbm',        label : 'MBM No.' },
    { k : 'pcd',        label : 'PCD' },
    { k : 'groupQty',   label : 'Group Qty', num : true },
    { k : 'style',      label : 'Style' },
    { k : 'itemName',   label : 'Item Name' },
    { k : 'code',       label : 'code' },
    { k : 'smv',        label : 'SMV', num : true },
    { k : 'description', label : 'Description' },
    { k : 'po',         label : 'PO' },
    { k : 'color',      label : 'Color' },
    { k : 'status',     label : 'Status' },
    { k : 'exFty',      label : 'Ex-fty' },
    { k : 'poQty',      label : 'PO Qty', num : true },
    { k : 'planQty',    label : 'Plan Qty', num : true },
    { k : 'allocQty',   label : 'Allocated Qty', num : true },
    { k : 'cmPc',       label : 'CM/Pc', num : true },
    { k : 'totalCm',    label : 'Total CM', num : true },
    { k : 'inputDate',  label : 'Input date' },
    { k : 'sewStart',   label : 'Sew Start' },
    { k : 'sewEnd',     label : 'Sew End' },
    { k : 'manpower',   label : 'Manpower', num : true },
    { k : 'planEff',    label : 'Plan Eff %', num : true },
    { k : 'metric',     label : 'Plan Qty' }
];

const dpOpen        = ref(false);
const dpMin         = ref(false);
const dpGenerated   = ref(false);
const dpFrom        = ref(isoInputDate(new Date()));
const dpTo          = ref(isoInputDate(addCalDays(new Date(), 13)));
const dpDates       = ref([]);
const dpMode        = ref('day');   // 'day' (≤ 3 months) or 'month' (longer ranges)
const dpScope       = ref('range'); // 'range' = Day Plan (date-filtered) · 'board' = whole board incl. Holding Row
const dpReportTitle = computed(() => dpScope.value === 'board' ? 'Board Plan Report' : 'Day Plan Report');
const dpGroups      = ref([]);
const dpGeneratedAt = ref('');

const dpUnitName = computed(() => dpGroups.value[0]?.floor || 'AQL');

const dpRangeLabel = computed(() =>
    `${fmtDdMmYy(new Date(dpFrom.value + 'T00:00:00'))} — ${fmtDdMmYy(new Date(dpTo.value + 'T00:00:00'))}`);

// Grand summary across every line: order counts, quantities, CM, manpower,
// plan-qty-weighted average efficiency and the day-wise grand totals
const dpGrand = computed(() => {
    const g = {
        orders : 0, lines : dpGroups.value.length,
        poQty : 0, planQty : 0, allocQty : 0, totalCm : 0,
        manpower : 0, avgEff : 0, rangeQty : 0, days : {}
    };
    let effSum = 0, effW = 0;
    for (const grp of dpGroups.value) {
        g.orders   += grp.rows.length;
        g.poQty    += grp.totals.poQty;
        g.planQty  += grp.totals.planQty;
        g.allocQty += grp.totals.allocQty;
        g.totalCm  += grp.totals.totalCm;
        g.manpower += grp.totals.manpower;
        for (const r of grp.rows) {
            effSum += r.planEff * r.planQty;
            effW   += r.planQty;
        }
        for (const [k, v] of Object.entries(grp.totals.days)) {
            g.days[k] = (g.days[k] || 0) + v;
        }
    }
    g.avgEff = effW ? Math.round(effSum / effW) : 0;
    g.rangeQty = Object.values(g.days).reduce((a, v) => a + v, 0);
    return g;
});

// ---- Summary & Floor Target views (mirror of the factory Excel reports) ----
const dpView = ref('report');   // 'report' | 'summary' | 'floors'

const dpSummary = computed(() => {
    const lineGroups = dpGroups.value.filter(g => g.lineId !== 'hold');
    const rows = lineGroups.flatMap(g => g.rows);
    const planQty = rows.reduce((a, r) => a + r.planQty, 0);
    const sah     = rows.reduce((a, r) => a + r.planQty * (Number(r.smv) || 0), 0) / 60;
    const effW    = rows.reduce((a, r) => a + r.planEff * r.planQty, 0);
    const buyers  = new Map();
    for (const r of rows) buyers.set(r.buyer || '—', (buyers.get(r.buyer || '—') || 0) + r.planQty);
    // Working days = date columns that actually carry planned quantity
    const dayKeys = new Set();
    for (const g of lineGroups) {
        for (const [k, v] of Object.entries(g.totals.days)) if (v > 0) dayKeys.add(k);
    }
    const s = getInstance();
    let hrsSum = 0, hrsN = 0;
    for (const g of lineGroups) {
        const h = Number(s?.resourceStore?.getById(g.lineId)?.data?.hours);
        if (h > 0) { hrsSum += h; hrsN++; }
    }
    const floors = new Map();
    for (const g of lineGroups) {
        const key = g.floor || '—';
        if (!floors.has(key)) floors.set(key, { floor : key, planQty : 0, sah : 0, effW : 0, manpower : 0, lines : 0, cm : 0 });
        const f = floors.get(key);
        f.lines++;
        f.manpower += g.totals.manpower;
        f.cm       += g.totals.totalCm;
        for (const r of g.rows) {
            f.planQty += r.planQty;
            f.sah     += r.planQty * (Number(r.smv) || 0) / 60;
            f.effW    += r.planEff * r.planQty;
        }
    }
    const floorRows = [...floors.values()].map(f => ({
        ...f,
        sah    : Math.round(f.sah),
        avgSmv : f.planQty ? Math.round(f.sah * 60 * 100 / f.planQty) / 100 : 0,
        eff    : f.planQty ? Math.round(f.effW / f.planQty) : 0
    }));
    return {
        planQty,
        sah      : Math.round(sah),
        avgSmv   : planQty ? Math.round(sah * 60 * 100 / planQty) / 100 : 0,
        eff      : planQty ? Math.round(effW / planQty) : 0,
        workHrs  : hrsN ? Math.round(hrsSum * 100 / hrsN) / 100 : 0,
        days     : dayKeys.size,
        lines    : lineGroups.length,
        manpower : lineGroups.reduce((a, g) => a + g.totals.manpower, 0),
        cm       : lineGroups.reduce((a, g) => a + g.totals.totalCm, 0),
        buyers   : [...buyers.entries()].map(([buyer, qty]) => ({ buyer, qty })).sort((a, b) => b.qty - a.qty),
        floors   : floorRows
    };
});

const dpFloorMatrix = computed(() => {
    const floors = new Map();
    for (const g of dpGroups.value) {
        if (g.lineId === 'hold') continue;
        const key = g.floor || '—';
        if (!floors.has(key)) floors.set(key, { floor : key, days : {}, total : 0 });
        const f = floors.get(key);
        for (const [k, v] of Object.entries(g.totals.days)) {
            f.days[k] = (f.days[k] || 0) + v;
            f.total  += v;
        }
    }
    const grand = { days : {}, total : 0 };
    for (const f of floors.values()) {
        for (const [k, v] of Object.entries(f.days)) grand.days[k] = (grand.days[k] || 0) + v;
        grand.total += f.total;
    }
    return { rows : [...floors.values()], grand };
});

// Plan Hours matrix: every sewing line × date with the line's working hours
// (blank on calendar off-days), plus manpower and a column-average row
const dpHoursMatrix = computed(() => {
    const s = getInstance();
    if (!s) return { rows : [], avg : {}, manpower : 0 };
    const lines = s.resourceStore.records.filter(r => /^l\d+$/.test(String(r.id)));
    const rows = lines.map(r => {
        const hours = Number(r.data?.hours) || 11;
        const days = {};
        for (const d of dpDates.value) {
            days[dpColKey(d)] = (dpMode.value !== 'month' && isOffDay(d)) ? null : hours;
        }
        return {
            floor    : r.data?.unit || 'AQL',
            line     : dpLineCode(r),
            manpower : Number(r.data?.manpower) || 0,
            days
        };
    });
    const avg = {};
    for (const d of dpDates.value) {
        const k = dpColKey(d);
        const vals = rows.map(x => x.days[k]).filter(v => v != null);
        avg[k] = vals.length ? Math.round(vals.reduce((a, v) => a + v, 0) * 100 / vals.length) / 100 : null;
    }
    return { rows, avg, manpower : rows.reduce((a, x) => a + x.manpower, 0) };
});

// Click a day column (Floor Target view) → single-day Day Plan report
function dpPickDay(d) {
    if (dpMode.value === 'month') return;
    dpScope.value = 'range';
    dpFrom.value  = dpDayKey(d);
    dpTo.value    = dpDayKey(d);
    dpView.value  = 'report';
    generateDayPlan();
}

function openDayPlanReport() {
    openMenu.value = null;
    dpScope.value = 'range';
    dpView.value = 'report';
    dpOpen.value = true;
    dpMin.value = false;
}

// Board Plan Report: everything currently ON the board, exactly as placed —
// every line plus the Holding Row, no date-range filter
function openBoardPlanReport() {
    openMenu.value = null;
    const s = getInstance();
    if (!s) {
        toast('Open a planning board first', 'warn');
        return;
    }
    dpScope.value = 'board';
    dpView.value = 'report';
    dpOpen.value = true;
    dpMin.value = false;
    generateDayPlan();
}

function generateDayPlan() {
    const s = getInstance();
    if (!s) {
        toast('Open a planning board first, then generate the report', 'warn');
        return;
    }
    let from, to;
    if (dpScope.value === 'board') {
        // Whole board: span = earliest start … latest end of every bar
        let min = null, max = null;
        for (const ev of s.eventStore.records) {
            if (!ev.data.raw || ev.data.raw.stage) continue;
            if (!min || ev.startDate < min) min = ev.startDate;
            if (!max || ev.endDate > max) max = ev.endDate;
        }
        if (!min) {
            toast('The board is empty — nothing to report', 'warn');
            return;
        }
        from = new Date(min); from.setHours(0, 0, 0, 0);
        to   = new Date(max); to.setHours(23, 59, 59, 0);
        dpFrom.value = dpDayKey(from);
        dpTo.value   = dpDayKey(to);
    }
    else {
        from = new Date(dpFrom.value + 'T00:00:00');
        to   = new Date(dpTo.value + 'T23:59:59');
        if (!(from instanceof Date) || Number.isNaN(+from) || Number.isNaN(+to) || from > to) {
            toast('Select a valid date range', 'warn');
            return;
        }
    }
    const dayCount = Math.round((+to - +from) / 86400000) + 1;
    if (dayCount > 1830 && dpScope.value !== 'board') {
        toast('Date range is too long — keep it within 5 years', 'warn');
        return;
    }
    // ≤ 3 months: one column per day; longer ranges: one column per month
    dpMode.value = dayCount > 92 ? 'month' : 'day';
    const dates = dpMode.value === 'month' ? dpEachMonth(from, to) : dpEachDay(from, to);

    const byLine = new Map();
    for (const ev of s.eventStore.records) {
        const raw = ev.data.raw;
        if (!raw || raw.stage) continue;
        if (!String(raw.buyer || '').trim()) continue;
        const lid = lineIdOf(s, ev);
        const isHold = lid === 'hold';
        // Range report: planned line bars only. Board report: everything on
        // the board exactly as placed — Holding Row included.
        if (dpScope.value === 'board') {
            if (!isHold && !LINE_BY_ID[lid] && !s.resourceStore.getById(lid)?.data?.lineRow) continue;
        }
        else {
            if (isHold || !LINE_BY_ID[lid]) continue;
        }
        const start = new Date(ev.startDate);
        const end   = new Date(ev.endDate);
        if (dpScope.value !== 'board' && (end < from || start > to)) continue;

        const res  = s.resourceStore.getById(lid);
        const line = LINE_BY_ID[lid] || res?.data || {};
        const smv  = Number(raw.smv) || randSmv(raw.po);
        const qty  = Number(raw.qty) || 0;
        // Orders-list parity: a confirm bar's PO Qty is its colour-group total
        // (the bar's own qty — raw.orderQty may hold only the anchor row's
        // qty on consolidated bars); a projection shows the source order qty
        const poQty = orderTypeOf(raw.po, raw.orderType) === 'confirm'
            ? qty
            : (Number(raw.orderQty ?? raw.qty) || 0);
        const cmPc = dpCmPerPc(raw.po);
        const pType = productTypeFromProfile(raw.po, lid);
        const orderType = orderTypeOf(raw.po, raw.orderType);
        const status = raw.status === 'completed' ? 'Completed'
            : orderType === 'confirm' ? 'Confirmed' : 'Provisional';
        const pid = lineProfileMap.value[lid];
        const profile = (pid && effList.value.find(p => p.id === pid)) || effList.value[0];
        // Same rule as the board: line efficiency is the floor — a product
        // (profile) efficiency applies only when it is higher than the line's
        const typeEff = Number(profile?.values?.[pType]);
        const defEff  = Number(profile?.values?._Default);
        const productEff = typeEff > 0 ? typeEff : (defEff > 0 ? defEff : 0);
        const baseEff = Math.max(productEff, Number(line.eff) || 0);
        const planEff = Math.round(baseEff * (raw.stripEff || 100) / 100);

        // Only the quantity actually planned INSIDE the range counts as
        // Plan Qty for the range report; Allocated Qty stays the full bar
        const { map : dailyMap, effMap : dailyEff } = dpStripDaily(ev, line, planEff);
        let inRangeQty = 0;
        if (dpScope.value !== 'board') {
            const fromKey = dpDayKey(from), toKey = dpDayKey(to);
            for (const [k, v] of Object.entries(dailyMap)) {
                if (k >= fromKey && k <= toKey) inRangeQty += v;
            }
        }

        const row = {
            _start      : +start,   // board plan sequence within the line
            floor       : res?.data?.unit || line.unit || 'AQL',
            line        : isHold ? 'Holding Row' : dpLineCode(res),
            buyer       : raw.buyer,
            mbm         : raw.mbmOrder || mbmOrderNo(raw.po),
            pcd         : raw.pcd ? fmtDdMmYy(raw.pcd) : '—',
            groupQty    : poQty,
            style       : raw.style || '—',
            itemName    : pType,
            code        : String(raw.po || '').replace(/\D/g, '').slice(-6) || '—',
            smv,
            description : pType,
            po          : raw.poCount > 1 ? `[${raw.poCount} POs] ${raw.po}` : (raw.po || '—'),
            color       : raw.color || orderColor(raw.po),
            status,
            exFty       : fmtDdMmYy(raw.ship),
            poQty,
            planQty     : dpScope.value === 'board' ? qty : inRangeQty,
            allocQty    : qty,
            cmPc,
            totalCm     : Math.round(qty * cmPc * 100) / 100,
            inputDate   : fmtDdMmYy(raw.matReady || start),
            sewStart    : fmtDdMmYy(start),
            sewEnd      : fmtDdMmYy(end),
            manpower    : Number(res?.data?.manpower ?? line.manpower) || 0,
            planEff,
            metric      : 'Plan Qty',
            days        : dpMode.value === 'month' ? dpCollapseMonths(dailyMap) : dailyMap,
            dayEff      : dailyEff
        };

        if (!byLine.has(lid)) {
            byLine.set(lid, {
                lineId    : lid,
                floor     : row.floor,
                line      : row.line,
                lineHours : Number(res?.data?.hours) || Number(line.hours) || 0,
                sort      : isHold ? Number.MAX_SAFE_INTEGER : (LINES.findIndex(l => l.id === lid) + 1 || 999),
                rows      : [],
                totals    : {
                    poQty : 0, planQty : 0, allocQty : 0, totalCm : 0,
                    manpower : row.manpower, avgEff : 0, effSum : 0, effW : 0,
                    days : {}, dayEffW : {}, dayEffQ : {}
                }
            });
        }
        const g = byLine.get(lid);
        g.rows.push(row);
        g.totals.poQty += row.poQty;
        g.totals.planQty += row.planQty;
        g.totals.allocQty += row.allocQty;
        g.totals.totalCm += row.totalCm;
        g.totals.effSum += row.planEff * row.planQty;
        g.totals.effW   += row.planQty;
        g.totals.avgEff = g.totals.effW ? Math.round(g.totals.effSum / g.totals.effW) : 0;
        for (const [k, v] of Object.entries(row.days)) {
            g.totals.days[k] = (g.totals.days[k] || 0) + v;
        }
        // Day-wise applied efficiency, plan-qty weighted (Eff % summary row)
        for (const [k, e] of Object.entries(dailyEff)) {
            const q = dailyMap[k] || 0;
            if (!q) continue;
            g.totals.dayEffW[k] = (g.totals.dayEffW[k] || 0) + q * e;
            g.totals.dayEffQ[k] = (g.totals.dayEffQ[k] || 0) + q;
        }
    }

    dpDates.value = dates;
    // Within each line, list orders in the same sequence they are planned on
    // the board (by sewing start date/time)
    for (const g of byLine.values()) g.rows.sort((a, b) => a._start - b._start);
    dpGroups.value = [...byLine.values()].sort((a, b) => a.sort - b.sort);
    dpGenerated.value = true;
    dpGeneratedAt.value = fmtClock(new Date());
    const n = dpGroups.value.reduce((a, g) => a + g.rows.length, 0);
    toast(n ? `${dpReportTitle.value} — ${n} order(s)` : 'No planned orders found', n ? 'ok' : 'warn');
}

function dpCell(row, col) {
    const v = row[col.k];
    if (col.num) {
        if (col.k === 'cmPc' || col.k === 'totalCm') return Number(v).toFixed(2);
        return fmtQty(v);
    }
    return v ?? '—';
}

function dpDayVal(days, d) {
    const v = days?.[dpColKey(d)];
    return v ? fmtQty(v) : '-';
}

function dpDayRaw(days, d) {
    return days?.[dpColKey(d)] || 0;
}

// Line-summary Eff % row: plan-qty-weighted applied efficiency of the day
// (learning-curve days show the reduced ramp eff, FastReact style)
function dpLineDayEff(g, d) {
    const k = dpColKey(d);
    const q = g.totals.dayEffQ?.[k];
    return q ? `${Math.round((g.totals.dayEffW[k] || 0) / q)}` : '-';
}

// Line-summary Hour row: that line's working hours on the date —
// date override → line hours → weekly calendar; off day shows '-'
function dpLineDayHour(g, d) {
    if (isOffDay(d)) return '-';
    return lineHoursLabel({ hours : g.lineHours }, d);
}

// Combined 'Eff / Hour' cell: '63 / 14:00' (off day → '-')
function dpLineDayEffHour(g, d) {
    const h = dpLineDayHour(g, d);
    if (h === '-') return '-';
    return `${dpLineDayEff(g, d)} / ${h}`;
}

function dpBuildTableHtml() {
    const totalsFor = (t, lineLabel, floorLabel) => DP_META.map(c => {
        let v = '';
        if (c.k === 'floor') v = floorLabel;
        else if (c.k === 'line') v = lineLabel;
        else if (c.k === 'poQty') v = fmtQty(t.poQty);
        else if (c.k === 'planQty') v = fmtQty(t.planQty);
        else if (c.k === 'allocQty') v = fmtQty(t.allocQty);
        else if (c.k === 'totalCm') v = t.totalCm.toFixed(2);
        else if (c.k === 'manpower') v = fmtQty(t.manpower);
        else if (c.k === 'planEff') v = String(t.avgEff);
        else if (c.k === 'metric' && t.dayLabel) v = t.dayLabel;
        return `<td${c.num ? ' style="text-align:right;font-weight:bold"' : ' style="font-weight:bold"'}>${dpEsc(v)}</td>`;
    }).join('');
    const daysFor = (days, cls) => dpDates.value.map(d => {
        const v = days[dpColKey(d)];
        return `<td style="text-align:right;font-weight:bold${cls || ''}">${v ? fmtQty(v) : '-'}</td>`;
    }).join('');

    const th = [...DP_META.map(c => `<th>${dpEsc(c.label)}</th>`),
        ...dpDates.value.map(d => `<th>${dpColLabel(d)}</th>`)].join('');
    const body = dpGroups.value.map(g => {
        const data = g.rows.map(r => {
            const meta = DP_META.map(c => `<td${c.num ? ' style="text-align:right"' : ''}>${dpEsc(dpCell(r, c))}</td>`).join('');
            const days = dpDates.value.map(d => `<td style="text-align:right">${dpEsc(dpDayVal(r.days, d))}</td>`).join('');
            return `<tr>${meta}${days}</tr>`;
        }).join('');
        let out = data + `<tr class="dp-total">${totalsFor(g.totals, `${g.line} Total`, g.floor)}${daysFor(g.totals.days)}</tr>`;
        // Date-wise 'Eff / Hour' summary row (day columns only)
        if (dpMode.value === 'day') {
            out += `<tr class="dp-effhour"><td></td><td style="font-weight:bold">Eff / Hour :</td><td colspan="${DP_META.length - 2}"></td>`
                + dpDates.value.map(d => `<td style="text-align:right;white-space:nowrap">${dpEsc(dpLineDayEffHour(g, d))}</td>`).join('')
                + '</tr>';
        }
        return out;
    }).join('');
    const grand = dpGrand.value;
    const grandRow = dpGroups.value.length
        ? `<tr class="dp-grand">${totalsFor({ ...grand, dayLabel : 'Day total' }, 'All lines', dpUnitName.value)}${daysFor(grand.days)}</tr>`
        : '';
    const range = dpRangeLabel.value;
    const summary = `<div style="margin:4px 0 8px;font-size:9pt">
        Orders: <b>${grand.orders}</b> · Lines: <b>${grand.lines}</b> ·
        Plan Qty: <b>${fmtQty(grand.planQty)}</b> · Qty in range: <b>${fmtQty(grand.rangeQty)}</b> ·
        Total CM: <b>${grand.totalCm.toFixed(2)}</b> · Avg Eff: <b>${grand.avgEff}%</b></div>`;
    return {
        unit  : dpUnitName.value,
        range,
        summary,
        table : `<table border="1" cellspacing="0" cellpadding="3"><thead><tr>${th}</tr></thead><tbody>${body}${grandRow}</tbody></table>`
    };
}

// ---- Per-view export builders: Excel/PDF export whatever view is on screen
function dpBuildSummaryHtml() {
    const s = dpSummary.value;
    const kv = `<table border="1" cellspacing="0" cellpadding="3">
<thead><tr><th colspan="2">Summary — ${dpEsc(dpRangeLabel.value)}</th></tr></thead><tbody>
<tr><td>Plan Qty in pcs</td><td style="text-align:right"><b>${fmtQty(s.planQty)}</b></td></tr>
<tr><td>Plan SAH</td><td style="text-align:right"><b>${fmtQty(s.sah)}</b></td></tr>
<tr><td>Avg. SMV</td><td style="text-align:right">${s.avgSmv}</td></tr>
<tr><td>Plan Efficiency</td><td style="text-align:right">${s.eff}%</td></tr>
<tr><td>Plan Working Hrs</td><td style="text-align:right">${s.workHrs}</td></tr>
<tr><td>No of ${dpMode.value === 'month' ? 'Months' : 'Days'}</td><td style="text-align:right">${s.days}</td></tr>
<tr><td>No of lines planned</td><td style="text-align:right">${s.lines}</td></tr>
<tr><td>Man power</td><td style="text-align:right">${fmtQty(s.manpower)}</td></tr>
<tr><td>CM Plan (Pre-costing)</td><td style="text-align:right">$ ${fmtQty(Math.round(s.cm))}</td></tr>
</tbody></table>`;
    const buyers = `<table border="1" cellspacing="0" cellpadding="3">
<thead><tr><th colspan="2">BUYER WISE PLAN QTY</th></tr><tr><th>Buyer</th><th>Plan Qty</th></tr></thead><tbody>
${s.buyers.map(b => `<tr><td>${dpEsc(b.buyer)}</td><td style="text-align:right">${fmtQty(b.qty)}</td></tr>`).join('')}
<tr class="dp-grand"><td>Total</td><td style="text-align:right">${fmtQty(s.planQty)}</td></tr>
</tbody></table>`;
    const fl = s.floors;
    const frow = (label, fn) =>
        `<tr><td style="font-weight:bold">${label}</td>${fl.map(f => `<td style="text-align:right">${fn(f)}</td>`).join('')}<td style="text-align:right"><b>${fn(null)}</b></td></tr>`;
    const floors = fl.length ? `<table border="1" cellspacing="0" cellpadding="3">
<thead><tr><th></th>${fl.map(f => `<th>${dpEsc(f.floor)}</th>`).join('')}<th>Total</th></tr></thead><tbody>
${frow('Plan Qty.', f => fmtQty(f ? f.planQty : s.planQty))}
${frow('Plan SAH', f => fmtQty(f ? f.sah : s.sah))}
${frow('Plan Efficiency', f => (f ? f.eff : s.eff) + '%')}
${frow('Avg SMV/Floor', f => f ? f.avgSmv : s.avgSmv)}
${frow('Plan Lines', f => f ? f.lines : s.lines)}
${frow('Manpower', f => fmtQty(f ? f.manpower : s.manpower))}
${frow('CM Plan (Pre-costing)', f => '$ ' + fmtQty(Math.round(f ? f.cm : s.cm)))}
</tbody></table>` : '';
    return `${kv}<br>${buyers}<br>${floors}`;
}

function dpBuildFloorsHtml() {
    const m = dpFloorMatrix.value;
    const th = `<tr><th>Factory</th>${dpDates.value.map(d => `<th>${dpColLabel(d)}</th>`).join('')}<th>Total</th></tr>`;
    const rows = m.rows.map(f =>
        `<tr><td>${dpEsc(f.floor)}</td>${dpDates.value.map(d => `<td style="text-align:right">${dpEsc(dpDayVal(f.days, d))}</td>`).join('')}<td style="text-align:right"><b>${fmtQty(f.total)}</b></td></tr>`).join('');
    const grand = `<tr class="dp-grand"><td>Total</td>${dpDates.value.map(d => `<td style="text-align:right">${dpEsc(dpDayVal(m.grand.days, d))}</td>`).join('')}<td style="text-align:right">${fmtQty(m.grand.total)}</td></tr>`;
    return `<table border="1" cellspacing="0" cellpadding="3"><thead>${th}</thead><tbody>${rows}${grand}</tbody></table>`;
}

function dpBuildHoursHtml() {
    const m = dpHoursMatrix.value;
    const th = `<tr><th>Factory</th><th>Line</th><th>Man Power</th>${dpDates.value.map(d => `<th>${dpColLabel(d)}</th>`).join('')}</tr>`;
    const rows = m.rows.map(r =>
        `<tr><td>${dpEsc(r.floor)}</td><td>${dpEsc(r.line)}</td><td style="text-align:right">${r.manpower}</td>${dpDates.value.map(d => `<td style="text-align:right">${r.days[dpColKey(d)] ?? '-'}</td>`).join('')}</tr>`).join('');
    const avg = `<tr class="dp-grand"><td>Avg</td><td></td><td style="text-align:right">${fmtQty(m.manpower)}</td>${dpDates.value.map(d => `<td style="text-align:right">${m.avg[dpColKey(d)] ?? '-'}</td>`).join('')}</tr>`;
    return `<table border="1" cellspacing="0" cellpadding="3"><thead>${th}</thead><tbody>${rows}${avg}</tbody></table>`;
}

const DP_VIEW_NAMES = { report : '', summary : 'Summary', floors : 'Floor Target', hours : 'Plan Hours' };

function dpBuildViewHtml() {
    const base = dpBuildTableHtml();
    const viewName = DP_VIEW_NAMES[dpView.value] || '';
    if (dpView.value === 'summary') return { ...base, table : dpBuildSummaryHtml(), viewName };
    if (dpView.value === 'floors')  return { ...base, table : dpBuildFloorsHtml(),  viewName };
    if (dpView.value === 'hours')   return { ...base, table : dpBuildHoursHtml(),   viewName };
    return { ...base, viewName };
}

function exportDayPlanExcel() {
    if (!dpGenerated.value) {
        toast('Generate the report first', 'warn');
        return;
    }
    const { unit, range, summary, table, viewName } = dpBuildViewHtml();
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head><meta charset="UTF-8">
<style>
  table { border-collapse: collapse; font-family: Calibri, Arial, sans-serif; font-size: 9pt; }
  th, td { border: 1px solid #000; white-space: nowrap; }
  th { background: #17356b; color: #fff; font-weight: bold; }
  .dp-total td { font-weight: bold; background: #f2f2f2; border-top: 2px solid #000; border-bottom: 2px solid #000; }
  .dp-grand td { font-weight: bold; background: #dbe5f1; border-top: 3px double #000; border-bottom: 3px double #000; }
</style>
</head>
<body>
<h2 style="margin:0">${dpEsc(unit)}</h2>
<h3 style="margin:2px 0">${dpEsc(dpReportTitle.value)}${viewName ? ' — ' + dpEsc(viewName) : ''} — ${dpEsc(range)}</h3>
${summary}
${table}
</body></html>`;
    const blob = new Blob(['\uFEFF' + html], { type : 'application/vnd.ms-excel' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${dpReportTitle.value.replace(/\s+/g, '')}${viewName ? '_' + viewName.replace(/\s+/g, '') : ''}_${dpFrom.value}_${dpTo.value}.xls`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
    toast('Excel file downloaded', 'ok');
}

function exportDayPlanPdf() {
    if (!dpGenerated.value) {
        toast('Generate the report first', 'warn');
        return;
    }
    const { unit, range, summary, table, viewName } = dpBuildViewHtml();
    const w = window.open('', '_blank');
    if (!w) {
        toast('Allow pop-ups to export PDF', 'warn');
        return;
    }
    w.document.write(`<!doctype html><html><head><meta charset="UTF-8"><title>${dpEsc(dpReportTitle.value)}${viewName ? ' — ' + dpEsc(viewName) : ''} — ${dpEsc(unit)}</title>
<style>
  @page { size: A3 landscape; margin: 8mm; }
  body { font-family: Arial, sans-serif; font-size: 8pt; color: #000; }
  .rep-head { text-align: center; border-bottom: 2px solid #17356b; margin-bottom: 6px; padding-bottom: 4px; }
  .rep-head h2 { margin: 0; font-size: 14pt; color: #17356b; }
  .rep-head h3 { margin: 2px 0; font-size: 11pt; }
  .rep-head .rng { font-size: 9pt; color: #333; }
  table { border-collapse: collapse; width: max-content; }
  th, td { border: 1px solid #000; padding: 2px 4px; white-space: nowrap; }
  th { background: #17356b; color: #fff; }
  .dp-total td { font-weight: bold; background: #f2f2f2; border-top: 2px solid #000; border-bottom: 2px solid #000; }
  .dp-grand td { font-weight: bold; background: #dbe5f1; border-top: 3px double #000; border-bottom: 3px double #000; }
</style></head><body>
<div class="rep-head">
  <h2>${dpEsc(unit)}</h2>
  <h3>${dpEsc(dpReportTitle.value)}${viewName ? ' — ' + dpEsc(viewName) : ''}</h3>
  <div class="rng">Date range: ${dpEsc(range)}</div>
</div>
${summary}
${table}
<script>window.onload = function () { window.print(); }<\/script>
</body></html>`);
    w.document.close();
}

// ---------------------------------------------------------------------------
// Daily production update: line-wise actual output per day. Saved quantities
// are subtracted on the board - the strip shows the remaining pieces.
// ---------------------------------------------------------------------------
const puOpen = ref(false);
const puMin  = ref(false);
const puDate = ref(isoInputDate(new Date()));
const puRows = ref([]);

const loadProdStore = () => {
    try { return JSON.parse(localStorage.getItem('mbm-prod-updates') || '{}'); }
    catch { return {}; }
};

const madeOf = (store, evId) =>
    Object.values(store[evId] || {}).reduce((a, v) => a + (Number(v) || 0), 0);

// Push saved production totals into the strips: progress % and remaining.
// FastReact behaviour: the produced part is CUT OFF the front of the bar -
// the bar gets shorter from the left while the future days stay unchanged.
function applyProdUpdates(s) {
    if (!s) return;
    const store = loadProdStore();
    s.eventStore.suspendEvents?.();
    try {
        for (const ev of s.eventStore.records) {
            const raw = ev.data.raw;
            if (!raw || raw.stage) continue;
            const made = madeOf(store, String(ev.id));
            if (!made && !raw.made) continue;
            raw.made = made;
            raw.progress = raw.qty ? Math.min(100, Math.round(made / raw.qty * 100)) : 0;
            ev.set?.('percentDone', raw.progress);

            const lid  = lineIdOf(s, ev);
            const line = LINE_BY_ID[lid];
            if (!line || made <= 0) continue;

            if (!raw.origStart) raw.origStart = new Date(ev.startDate);

            const availMin = (line.availMin || 12000) * (raw.stripEff || 100) / 100;
            const smv      = Math.max(0.1, Number(raw.smv) || randSmv(raw.po));
            const target   = Math.max(1, Math.floor(availMin / smv));

            const end = new Date(ev.endDate);
            let rem = made;
            let newStart = null;
            const d = new Date(raw.origStart);
            let guard = 0;
            while (rem > 0 && guard++ < 200) {
                if (!isOffDay(d)) {
                    if (rem >= target) {
                        rem -= target;
                    }
                    else {
                        const sw = startOfWorkDay(d);
                        const ew = endOfWorkDay(d);
                        newStart = new Date(sw.getTime() + (rem / target) * (ew.getTime() - sw.getTime()));
                        rem = 0;
                        break;
                    }
                }
                d.setDate(d.getDate() + 1);
                if (d >= end) break;
            }
            if (!newStart) newStart = startOfWorkDay(nextWorkingDay(d));
            if (newStart >= end) newStart = new Date(end.getTime() - 3600000);

            if (Math.abs(newStart - ev.startDate) > 60000) {
                ev.set({
                    startDate : newStart,
                    endDate   : end,
                    duration  : elapsedDays(newStart, end)
                });
                raw.start = newStart;
            }
        }
    }
    finally {
        s.eventStore.resumeEvents?.();
    }
    refreshGrandTotals(s);
}

function openProdUpdate() {
    openMenu.value = null;
    buildPuRows();
    puOpen.value = true;
    puMin.value = false;
}

// Strips running on the selected date, one row per line/strip
function buildPuRows() {
    const s = getInstance();
    const store = loadProdStore();
    const rows = [];
    if (s) {
        const day = new Date(puDate.value + 'T12:00:00');
        for (const ev of s.eventStore.records) {
            const raw = ev.data.raw;
            if (!raw || raw.stage) continue;
            if (!String(raw.buyer || '').trim()) continue;
            const lid = lineIdOf(s, ev);
            if (!LINE_BY_ID[lid]) continue;
            const dayStart = new Date(ev.startDate);
            dayStart.setHours(0, 0, 0, 0);
            if (day < dayStart || day > ev.endDate) continue;
            const res  = s.resourceStore.getById(lid);
            const line = LINE_BY_ID[lid];
            const made = madeOf(store, String(ev.id));
            rows.push({
                evId     : String(ev.id),
                dbId     : ev.data.dbId ?? null,
                unit     : res?.data?.unit || line.unit || 'AQL',
                floor    : res?.data?.floor || line.floor || '—',
                line     : res?.name || lid,
                opType   : 'Sewing',
                style    : raw.style || '—',
                order    : mbmOrderNo(raw.po),
                po       : raw.po || '—',
                color    : orderColor(raw.po),
                orderQty : raw.qty,
                planQty  : dpStripDaily(ev, line)[dpDayKey(day)] || 0,
                made,
                rest     : Math.max(0, (Number(raw.qty) || 0) - made),
                prodQty  : store[String(ev.id)]?.[puDate.value] ?? ''
            });
        }
    }
    rows.sort((a, b) => String(a.line).localeCompare(String(b.line)) || String(a.po).localeCompare(String(b.po)));
    puRows.value = rows;
}

function saveProdUpdate() {
    // Daily production writes to the DB — needs the board's edit lock
    if (boardReadOnly.value) {
        const h = boardLockHolder.value;
        toast(`🔒 Save disabled — ${h?.name || h?.username || 'another user'} is editing this board`, 'warn');
        return;
    }
    const s = getInstance();
    if (!s) return;
    const store = loadProdStore();
    const entries = puRows.value.filter(r => r.prodQty !== '' && r.prodQty != null);
    if (!entries.length) {
        toast('Prod Qty ঘরে actual production দিন — তারপর Save', 'warn');
        return;
    }
    for (const r of entries) {
        if (!store[r.evId]) store[r.evId] = {};
        store[r.evId][puDate.value] = Math.max(0, Number(r.prodQty) || 0);
    }
    localStorage.setItem('mbm-prod-updates', JSON.stringify(store));
    applyProdUpdates(s);
    buildPuRows();

    // Persist to the fastreact DB (day_production_update_plan)
    const payload = entries.map(r => ({
        eventId       : r.dbId,
        eventRef      : r.evId,
        unit          : r.unit,
        floor         : r.floor,
        line          : r.line,
        operationType : r.opType,
        style         : r.style,
        orderNo       : r.order,
        po            : r.po,
        color         : r.color,
        orderQty      : r.orderQty,
        dayPlanQty    : r.planQty,
        prodQty       : Math.max(0, Number(r.prodQty) || 0),
        saveDate      : puDate.value
    }));
    saveProdUpdatesDb(payload)
        .then(res => toast(`Production saved to fastreact DB (day_production_update_plan) — ${res.saved} row(s), strips updated`, 'ok'))
        .catch(e => toast(`DB save failed (${e.message}) — saved locally only`, 'warn'));
}

watch(puDate, () => {
    if (puOpen.value) buildPuRows();
});

function showOrderOnBoard(row) {
    if (row.replaced || row.status === 'replaced') {
        const code = row.mbmOrder || '';
        ordersOpen.value = false;
        if (view.value !== 'board') {
            openBoard(currentBoard.value || permittedBoards.value[0] || boards.value[0]);
        }
        if (code) boardSearch.value = code;
        toast(`${code} projected replaced — its POs are highlighted in the Unplanned panel`, 'ok');
        return;
    }
    if (!row.planned) {
        if (row.orderType === 'projected') {
            // Projected unplanned: no POs yet — cannot be planned directly
            toast(`${row.mbmOrder} is a projected order with no POs yet — plan will be available once POs are confirmed`, 'warn');
            return;
        }
        // Unplanned confirm PO: close orders panel, go to board, pre-filter unplanned panel to this order's POs
        const code = row.mbmOrder || row.po || '';
        ordersOpen.value = false;
        if (view.value !== 'board') {
            openBoard(currentBoard.value || permittedBoards.value[0] || boards.value[0]);
        }
        if (code) boardSearch.value = code;
        toast(`${code} — POs highlighted in Unplanned panel, drag to board to plan`, 'warn');
        return;
    }
    ordersOpen.value = false;
    if (view.value !== 'board') {
        openBoard(currentBoard.value || permittedBoards.value[0] || boards.value[0]);
    }
    setTimeout(() => {
        const s   = getInstance();
        const rec = s?.eventStore.getById(row.id);
        if (rec) {
            s.selectEvent?.(rec);
            s.scrollEventIntoView?.(rec, { animate : true, block : 'center' });
            uiHooks.onOrderSelect?.(rec);
        }
    }, 500);
}

// ---------------------------------------------------------------------------
// FastReact pick & place: click a bar -> it follows the cursor; click a line
// to re-establish it there. The header cell live-indicates the hover time.
// ---------------------------------------------------------------------------
// shallowRef: a deep ref would wrap the Bryntum record in a reactive Proxy
// and break identity comparisons against store records
const carried  = shallowRef(null);
const carryPreview = ref({ valid : false, barBox : null });
const carryOrigin  = ref({ valid : false, left : 0, top : 0, width : 0, height : 0 });
/** Imperative carry overlay — avoids Teleport/ref timing races on pick-up */
let carryDom = null;
let carriedPrevCls = '';
let pickStamp      = 0;
let ignorePickUntil = 0;
const PLACE_GUARD_MS = 150;
const lastMouse    = { x : 400, y : 300 };
let clockRaf       = 0;

const RISK_COLORS = {
    green : '#43a047', yellow : '#f9a825', orange : '#fb8c00',
    red : '#e53935', grey : '#9e9e9e', blue : '#1e88e5', late : '#d40000'
};

const colorKeyOf = raw =>
    raw.status === 'completed' ? 'grey'
  : isLateVsDelivery(raw.end, raw.ship) ? 'late'
  : raw.latePlan ? 'yellow'
  : raw.risk?.level === 'draft' || raw.status === 'draft' ? 'blue'
  : ({ low : 'green', moderate : 'yellow', high : 'orange', critical : 'red' }[raw.risk?.level] || 'green');

const fmtClock = d => {
    const W = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
    let h = d.getHours();
    const am = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const p2 = n => String(n).padStart(2, '0');
    return `${W} ${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${h}:${p2(d.getMinutes())}:${p2(d.getSeconds())} ${am}`;
};

const idleFormula = '0.0 x 0:00 x 0 = 0.000';
const CLOCK_DEFAULT = () => `${fmtClock(new Date())}<br>${idleFormula}`;

function setClock(html) {
    const el = document.getElementById('mb-hover-clock');
    if (el) el.innerHTML = html;
}

function onSchedMouseMove(e) {
    lastMouse.x = e.clientX;
    lastMouse.y = e.clientY;
    if (carried.value) updateCarryPreview(e.clientX, e.clientY);
    if (clockRaf) return;
    clockRaf = requestAnimationFrame(() => {
        clockRaf = 0;
        updateHoverClock(lastMouse.x, lastMouse.y);
    });
}

// Planned pieces of ONE bar's order on the given calendar day — the same
// day-wise distribution the Planned-schedule dialog shows (learning-curve
// aware: ramp days produce at the curve percentage of the day target)
function barDayQty(s, rec, day) {
    const raw = rec?.data?.raw;
    if (!raw || raw.stage) return null;
    const lid  = lineIdOf(s, rec);
    const res  = lid ? s.resourceStore.getById(lid) : null;
    const line = LINE_BY_ID[lid] || res?.data || {};
    const availMin    = (Number(line.availMin) || 12000) * (Number(raw.stripEff) || 100) / 100;
    const dailyTarget = Math.max(1, Math.floor(availMin / Math.max(0.1, Number(raw.smv) || 1)));
    const lc     = raw.lc?.applied && Array.isArray(raw.lc.pct) ? raw.lc : null;
    const period = lc ? lc.pct.length : 0;
    const target = new Date(day);
    target.setHours(0, 0, 0, 0);
    const d = new Date(rec.startDate);
    d.setHours(0, 0, 0, 0);
    const end = new Date(rec.endDate);
    if (target < d || target >= end && target.getTime() !== new Date(end).setHours(0, 0, 0, 0)) return null;
    let remaining = Number(raw.qty) || 0;
    let workIdx = 0;
    for (let guard = 0; d < end && guard < 200; guard++) {
        const off = isOffDay(d);
        const rampIdx = lc ? (lc.dayOffset || 0) + workIdx : period;
        const ramping = lc && !off && rampIdx < period;
        const factor  = ramping ? lc.pct[rampIdx] / 100 : 1;
        // Changed-hours dates scale the day's capacity by the new hours
        const hrsF = dayCapacityFactor(d, line?.hours);
        const dayTarget = Math.max(1, Math.floor(dailyTarget * factor * hrsF));
        let q = 0;
        if (!off && remaining > 0) {
            q = Math.min(dayTarget, remaining);
            remaining -= q;
        }
        // Any remainder lands on the bar's last working day
        const next = new Date(d);
        next.setDate(next.getDate() + 1);
        if (next >= end && remaining > 0 && !off) {
            q += remaining;
            remaining = 0;
        }
        if (d.getTime() === target.getTime()) {
            return { qty : q, off, lcDay : ramping && q > 0 ? rampIdx + 1 : 0 };
        }
        if (!off) workIdx++;
        d.setDate(d.getDate() + 1);
    }
    return null;
}

function updateHoverClock(clientX, clientY) {
    if (carried.value) return;
    const s = getInstance();
    if (!s) return;
    const date = pointerDate(s, clientX);
    const res  = date ? resourceFromY(s, clientY, clientX) : null;
    if (!date) {
        setClock(CLOCK_DEFAULT());
        return;
    }
    let line2 = idleFormula;
    if (res?.data?.lineRow) {
        const r   = res.data;
        const hrs = lineHoursLabel(r, date);
        line2 = `${Number(r.manpower).toFixed(1)} x ${hrs} x ${r.eff} = ${lineDayAvailMin(r, date).toFixed(3)}`;
    }
    setClock(`${fmtClock(date)}<br>${line2}`);
}

// ---------------------------------------------------------------------------
// Day-wise plan chips: CLICK a bar → every day of its plan shows that day's
// quantity on the Holding Row band, right under the date headers. Cleared
// when the selection clears, a bar is picked up, or the board reloads.
// ---------------------------------------------------------------------------
function clearDayPlanChips(s = getInstance()) {
    const st = s?.resourceTimeRangeStore;
    if (!st) return;
    const olds = st.records.filter(r => String(r.id).startsWith('dq-'));
    if (olds.length) st.remove(olds);
}

function showDayPlanChips(s, rec) {
    clearDayPlanChips(s);
    const raw = rec?.data?.raw;
    if (!s?.resourceTimeRangeStore || !raw || raw.stage) return;
    const d = new Date(rec.startDate);
    d.setHours(0, 0, 0, 0);
    const end = new Date(rec.endDate);
    const ranges = [];
    for (let guard = 0; d < end && guard < 200; guard++) {
        const info = barDayQty(s, rec, d);
        const next = new Date(d);
        next.setDate(next.getDate() + 1);
        if (info) {
            ranges.push({
                id         : `dq-${guard}`,
                resourceId : 'hold',
                startDate  : new Date(d),
                endDate    : next,
                name       : info.off
                    ? 'off'
                    : `${fmtQty(info.qty)}${info.lcDay ? ` · LC D${info.lcDay}` : ''}`,
                cls        : 'mb-dayqty-range'
                    + (info.off ? ' mb-dayqty-off' : '')
                    + (!info.off && info.lcDay ? ' mb-dayqty-lc' : '')
            });
        }
        d.setDate(d.getDate() + 1);
    }
    if (ranges.length) s.resourceTimeRangeStore.add(ranges);
}

// Working hours for a line on a specific DATE. Priority: the date's
// Change-working-hours override → the line's own hours
// (planning_resources.working_hours_per_day) → the weekday calendar
function lineHoursLabel(r, day) {
    const ov = calendarState.overrides[ymdOf(day)];
    if (ov != null && ov !== '') return hoursToHm(ov);
    const h = Number(r.hours);
    if (h > 0) {
        return `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;
    }
    return dayCfgOf(day).hours ?? '10:00';
}

// Available minutes of a line for a DATE — the hover formula's right side
// (manpower × date hours × eff), override-aware
function lineDayAvailMin(r, day) {
    const mp  = Number(r.manpower) || 0;
    const eff = Number(r.eff) || 0;
    const lh  = hmToHours(lineHoursLabel(r, day));
    return mp * lh * 60 * eff / 100;
}

function updateCarryClock(snap) {
    // The bar always lands on the day's first working hour, so the header
    // reports that time rather than the raw pointer position
    const at = snap?.start;
    if (!snap?.valid || !at) {
        setClock(CLOCK_DEFAULT());
        return;
    }
    const res = snap.resource;
    let line2 = idleFormula;
    if (res?.data?.lineRow) {
        const r   = res.data;
        const hrs = lineHoursLabel(r, at);
        line2 = `${Number(r.manpower).toFixed(1)} x ${hrs} x ${r.eff} = ${lineDayAvailMin(r, at).toFixed(3)}`;
    }
    setClock(`${fmtClock(at)}<br>${line2}`);
}

function onSchedMouseLeave() {
    setClock(CLOCK_DEFAULT());
}

let ghostRaf = 0;
let carryScrollDetach = null;
let carryPending = null;

function ensureCarryDom() {
    if (carryDom) return carryDom;
    const layer = document.createElement('div');
    layer.id = 'mb-carry-layer';
    layer.className = 'mb-carry-layer';
    layer.style.display = 'none';
    const vacancy = document.createElement('div');
    vacancy.className = 'mb-carry-vacancy';
    const bar = document.createElement('div');
    bar.className = 'mb-carry-bar';
    const label = document.createElement('div');
    label.className = 'mb-carry-bar-label';
    bar.appendChild(label);
    layer.append(vacancy, bar);
    document.body.appendChild(layer);
    carryDom = { layer, vacancy, bar, label };
    return carryDom;
}

// Painting through transform keeps the carried bar on the compositor, so it
// tracks the pointer without a layout pass per mouse move
function paintCarryBox(el, box) {
    if (!el) return;
    if (!box?.valid) {
        if (el.style.display !== 'none') el.style.display = 'none';
        return;
    }
    if (el.style.display !== 'block') el.style.display = 'block';
    el.style.transform = `translate3d(${Math.round(box.left)}px, ${Math.round(box.top)}px, 0)`;
    el.style.width = `${Math.round(box.width)}px`;
    el.style.height = `${Math.round(box.height)}px`;
}

function flushCarryPreview() {
    ghostRaf = 0;
    const p = carryPending;
    if (!p || !carried.value) return;
    const s = getInstance();
    const rec = carried.value;
    if (!s || !rec) return;

    const els = ensureCarryDom();
    carryOrigin.value = computeCarryOrigin(s, rec);
    const snap = computeCarryPreview(s, rec, p.clientX, p.clientY);
    carryPreview.value = snap;

    // No trace at the old spot while carrying — the bar exists only under
    // the mouse pointer until it is placed
    paintCarryBox(els.vacancy, null);
    paintCarryBox(els.bar, snap.barBox);

    const raw = rec.data.raw;
    const color = RISK_COLORS[colorKeyOf(raw)];
    if (els.bar.style.background !== color) els.bar.style.background = color;
    els.bar.style.color = colorKeyOf(raw) === 'late' ? '#ffe600' : '#fff';
    if (els.label.textContent !== rec.name) els.label.textContent = rec.name || '';
    els.bar.classList.toggle('mb-carry-bar-invalid', !snap.valid);

    if (snap.valid) updateCarryClock(snap);
    else setClock(CLOCK_DEFAULT());
}

function pointerDateOnTimeline(s, clientX, rounding = null) {
    const el = timeAxisEl(s);
    if (!el) return pointerDate(s, clientX, rounding);
    const rect = el.getBoundingClientRect();
    const cx = Math.max(rect.left + 4, Math.min(rect.right - 4, clientX));
    return pointerDate(s, cx, rounding);
}

// Mirrors the first stage of computeInsertStart, so the ghost sits exactly
// where the bar will land: any hour inside the working window is honoured,
// only off days and the closed night window are pulled forward
function clampToWorkWindow(date) {
    return clampIntoWorkWindow(date);
}

// A pixel is roughly ten minutes on the day axis — quarter-hour steps keep the
// header clock readable while still allowing any hour of the day
// 5-minute snap grid — lets a bar land on points like 10:20, not just :00/:15
const CARRY_STEP_MIN = 5;

function snapToStep(date) {
    const d = new Date(date);
    const step = CARRY_STEP_MIN * 60000;
    return new Date(Math.round(d.getTime() / step) * step);
}

function previewSpanAtPointer(date, dur) {
    const start = clampToWorkWindow(snapToStep(date));
    return { start, end : endOfWork(start, dur) };
}

function isPlannableResource(res) {
    if (!res || res.data?.subtotalRow || res.id === 'subtot') return false;
    return isHoldingRes(res) || isSewingRes(res) || !!res.data?.lineRow;
}

function timeAxisEl(s) {
    return s?.timeAxisSubGridElement || s?.element?.querySelector('.b-grid-sub-grid-normal') || null;
}

// getDateFromDomEvent needs a real DOM Event, so a synthetic {clientX, clientY}
// silently yields null. The time-axis view model maps a pixel offset directly.
// Without a rounding method the result carries the exact hour under the pointer.
function pointerDate(s, clientX, rounding = null) {
    const el = timeAxisEl(s);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, clientX - rect.left) + (s.scrollLeft || 0);
    try {
        const d = s.timeAxisViewModel?.getDateFromPosition?.(x, rounding, true);
        if (d) return d;
    }
    catch { /* fall through */ }
    try {
        return s.getDateFromCoordinate?.(x, rounding, true, true) || null;
    }
    catch { return null; }
}

function rowElementForResource(s, res, clientX, clientY) {
    try {
        const row = s.rowManager?.getRowFor?.(res);
        if (row?.element) return row.element;
    }
    catch { /* fall through */ }
    try {
        const el = hitElementIgnoringCarry(clientX, clientY);
        const rowEl = el?.closest?.('.b-grid-sub-grid-normal .b-grid-row');
        if (rowEl) {
            const hit = s.getRecordFromElement?.(rowEl);
            if (hit?.id === res.id) return rowEl;
        }
    }
    catch { /* fall through */ }
    const idx = s.resourceStore.indexOf(res);
    if (idx >= 0) {
        return s.element?.querySelectorAll('.b-grid-sub-grid-normal .b-grid-row')?.[idx] || null;
    }
    return null;
}

function dateToClientX(s, date) {
    const el = timeAxisEl(s);
    if (!el || !date) return null;
    const rect = el.getBoundingClientRect();
    let pos = null;
    try { pos = s.timeAxisViewModel?.getPositionFromDate?.(date); }
    catch { pos = null; }
    if (pos == null || pos < 0) {
        try { pos = s.getCoordinateFromDate?.(date, true); }
        catch { pos = null; }
    }
    if (pos == null || pos < 0 || Number.isNaN(pos)) return null;
    return rect.left + pos - (s.scrollLeft || 0);
}

const EMPTY_BOX = { valid : false, left : 0, top : 0, width : 0, height : 0 };
const emptyCarrySnap = () => ({ valid : false, barBox : EMPTY_BOX });
// Last good bar size, so the ghost keeps following the pointer over rows where
// the bar cannot land instead of blinking out of existence
const lastCarrySize = { width : 120, height : 40 };

// The ghost trails the pointer but cannot be dropped here
function floatingCarrySnap(clientX, clientY) {
    const { width, height } = lastCarrySize;
    return {
        valid  : false,
        barBox : {
            valid  : true,
            left   : clientX - width / 2,
            top    : clientY - height / 2,
            width,
            height
        }
    };
}

// The carried bar sits exactly where it would land: the hovered line, starting
// at that day's first working hour, so days line up edge to edge
function computeCarryPreview(s, rec, clientX, clientY) {
    const raw = rec.data.raw;
    if (!raw) return emptyCarrySnap();

    const res = resourceFromY(s, clientY, clientX);
    if (!isPlannableResource(res)) return floatingCarrySnap(clientX, clientY);

    const pointerAt = pointerDateOnTimeline(s, clientX);
    if (!pointerAt) return floatingCarrySnap(clientX, clientY);

    const lineId = isHoldingRes(res) ? 'hold' : res.id;
    const dur = raw.dur || 1;
    const { start, end } = previewSpanAtPointer(pointerAt, dur);

    const rowEl = rowElementForResource(s, res, clientX, clientY);
    if (!rowEl) return floatingCarrySnap(clientX, clientY);
    const rowRect = rowEl.getBoundingClientRect();
    const leftX  = dateToClientX(s, start);
    const rightX = dateToClientX(s, end);
    if (leftX == null || rightX == null) return floatingCarrySnap(clientX, clientY);

    const height = Math.max(20, (s.rowHeight || 48) - 8);
    const width = Math.max(32, rightX - leftX);
    lastCarrySize.width = width;
    lastCarrySize.height = height;

    return {
        valid       : true,
        barBox      : { valid : true, left : leftX, top : rowRect.top + 3, width, height },
        line        : res.name || lineId,
        start,
        end,
        pointerDate : pointerAt,
        resource    : res,
        resourceId  : lineId
    };
}

function computeCarryOrigin(s, rec) {
    const empty = { valid : false, left : 0, top : 0, width : 0, height : 0 };
    if (!rec?.startDate) return empty;
    const lineId = lineIdOf(s, rec);
    const res = s.resourceStore.getById(lineId);
    if (!res) return empty;
    let rowEl = null;
    try {
        rowEl = s.rowManager?.getRowFor?.(res)?.element || null;
    }
    catch { /* fall through */ }
    if (!rowEl) {
        const idx = s.resourceStore.indexOf(res);
        rowEl = s.element?.querySelectorAll('.b-grid-sub-grid-normal .b-grid-row')?.[idx] || null;
    }
    if (!rowEl) return empty;
    const rowRect = rowEl.getBoundingClientRect();
    const leftX  = dateToClientX(s, rec.startDate);
    const rightX = dateToClientX(s, rec.endDate);
    if (leftX == null || rightX == null) return empty;
    const height = Math.max(20, (s.rowHeight || 48) - 8);
    return {
        valid  : true,
        left   : leftX,
        top    : rowRect.top + 3,
        width  : Math.max(32, rightX - leftX),
        height
    };
}

function updateCarryPreview(clientX, clientY) {
    lastMouse.x = clientX;
    lastMouse.y = clientY;
    if (!carried.value) return;
    carryPending = { clientX, clientY };
    if (ghostRaf) return;
    ghostRaf = requestAnimationFrame(flushCarryPreview);
}

function syncCarryPreviewNow(clientX, clientY) {
    carryPending = { clientX, clientY };
    if (ghostRaf) {
        cancelAnimationFrame(ghostRaf);
        ghostRaf = 0;
    }
    flushCarryPreview();
}

function attachCarryScroll(s) {
    detachCarryScroll();
    if (!s?.scrollable?.on) return;
    const fn = () => updateCarryPreview(lastMouse.x, lastMouse.y);
    s.scrollable.on('scroll', fn);
    carryScrollDetach = () => s.scrollable?.un?.('scroll', fn);
}

function detachCarryScroll() {
    carryScrollDetach?.();
    carryScrollDetach = null;
}

function trackGhost(e) {
    updateCarryPreview(e.clientX, e.clientY);
}

function attachCarryListeners() {
    detachCarryListeners();
    document.addEventListener('mousemove', trackGhost, true);
    document.addEventListener('pointermove', trackGhost, true);
    document.addEventListener('pointerup', onCarryPointerUp, true);
    document.addEventListener('keydown', escCancel, true);
}

function detachCarryListeners() {
    document.removeEventListener('mousemove', trackGhost, true);
    document.removeEventListener('pointermove', trackGhost, true);
    document.removeEventListener('pointerup', onCarryPointerUp, true);
    document.removeEventListener('keydown', escCancel, true);
}

function escCancel(e) {
    if (e.key === 'Escape') cancelCarry();
}

function pickUp(rec, domEvent) {
    if (carried.value) return;
    const raw = rec?.data?.raw;
    if (!raw || raw.stage || raw.status === 'completed') return;
    const s = getInstance();
    if (!s) return;

    const els = ensureCarryDom();
    els.layer.style.display = 'block';
    els.label.textContent = rec.name || '';

    carried.value = rec;
    pickStamp     = performance.now();
    uiHooks.boardUserActive = true;
    clearDayPlanChips();
    document.body.classList.add('mb-carry-active');
    // The bar leaves its old place entirely while carried — it exists only
    // under the mouse pointer. Plain set() so Bryntum repaints the event and
    // the original really disappears (a suppressed refresh left it visible).
    carriedPrevCls = String(rec.data.cls || '');
    rec.set('cls', `${carriedPrevCls} mb-carried-away`.trim());
    carryPreview.value = emptyCarrySnap();
    carryOrigin.value  = computeCarryOrigin(s, rec);
    const cx = domEvent?.clientX ?? lastMouse.x;
    const cy = domEvent?.clientY ?? lastMouse.y;
    lastMouse.x = cx;
    lastMouse.y = cy;
    attachCarryScroll(s);
    attachCarryListeners();
    syncCarryPreviewNow(cx, cy);
    requestAnimationFrame(() => syncCarryPreviewNow(lastMouse.x, lastMouse.y));
}

function restoreCarriedCls() {
    const rec = carried.value;
    if (!rec) return;
    rec.set('cls', carriedPrevCls);
}

function cancelCarry() {
    restoreCarriedCls();
    carried.value = null;
    carryPreview.value = emptyCarrySnap();
    carryOrigin.value  = { valid : false, left : 0, top : 0, width : 0, height : 0 };
    carryPending = null;
    if (carryDom) {
        paintCarryBox(carryDom.vacancy, null);
        paintCarryBox(carryDom.bar, null);
        carryDom.layer.style.display = 'none';
    }
    setClock(CLOCK_DEFAULT());
    document.body.classList.remove('mb-carry-active');
    uiHooks.boardUserActive = false;
    detachCarryScroll();
    detachCarryListeners();
}

// Fallback row resolution from the pointer Y position - guarantees the bar
// lands on the row the cursor is over even when the click target is a range
// or canvas element that Bryntum cannot map to a row
function canPlaceCarry() {
    return carried.value && (performance.now() - pickStamp) > PLACE_GUARD_MS;
}

function hitElementIgnoringCarry(clientX, clientY) {
    const stack = document.elementsFromPoint(clientX, clientY);
    for (const el of stack) {
        if (el.closest?.('.mb-carry-layer')) continue;
        return el;
    }
    return null;
}
function asResourceRecord(s, rec) {
    if (!rec || !s) return null;
    if (rec.isResourceModel || rec.data?.lineRow || rec.data?.holdingRow || rec.data?.subtotalRow) {
        return rec;
    }
    if (s.resourceStore.getById(rec.id) === rec) return rec;
    return rec.resource || s.resourceStore.getById(lineIdOf(s, rec)) || null;
}

function rowResourceAt(s, clientX, clientY) {
    const el = hitElementIgnoringCarry(clientX, clientY);
    const rowEl = el?.closest?.('.b-grid-row');
    if (!rowEl) return null;
    try {
        const rec = s.getRecordFromElement?.(rowEl) || s.resourceStore.getById(rowEl.dataset.id);
        return asResourceRecord(s, rec);
    }
    catch { return null; }
}

function resourceFromY(s, clientY, clientX) {
    if (!s) return null;
    const x = clientX ?? lastMouse.x;
    const hit = rowResourceAt(s, x, clientY);
    if (hit) return hit;

    // Pointer over a range/canvas element: match the row by its screen bounds
    const rows = s.rowManager?.rows || [];
    for (const row of rows) {
        const el = row.element;
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (clientY >= r.top && clientY < r.bottom) {
            const rec = s.resourceStore.getById(row.id);
            if (rec) return rec;
        }
    }
    const body = s.element?.querySelector('.b-grid-sub-grid-normal');
    if (!body) return null;
    const rect = body.getBoundingClientRect();
    const yInBody = clientY - rect.top + (s.scrollable?.y ?? s.scrollTop ?? 0);
    const idx = Math.floor(yInBody / (s.rowHeight || 48));
    return idx >= 0 ? s.resourceStore.getAt(idx) : null;
}

function isSchedPlaceTarget(el) {
    if (!el?.closest) return false;
    if (el.closest('.fr-toolbar, .fr-banner, .fr-orderbar, .fr-colormenu, .fr-board-loader, .fr-toasts, .b-popup, .b-menu, .b-float-root')) {
        return false;
    }
    return !!el.closest('.mb-sched-wrap');
}

// Bryntum event/schedule click, the wrapper click and the document pointerup can
// all describe the same gesture — collapse them into a single placement
let placeGestureAt = 0;

function requestPlace(clientX, clientY, hint = {}) {
    if (!canPlaceCarry()) return;
    const now = performance.now();
    if (now - placeGestureAt < 300) return;
    placeGestureAt = now;

    const s = getInstance();
    if (!s) return;
    lastMouse.x = clientX;
    lastMouse.y = clientY;
    syncCarryPreviewNow(clientX, clientY);

    const snap = carryPreview.value;
    const resource = hint.resource || snap.resource || resourceFromY(s, clientY, clientX);
    // snap.start is the previewed hour, so the bar lands exactly where it showed
    const raw = snap.start || hint.date || pointerDateOnTimeline(s, clientX);

    if (!resource || !raw) {
        toast('Click on a sewing line in the timeline to place the bar', 'warn');
        return;
    }
    placeCarried(clampToWorkWindow(raw), resource)
        .catch(err => toast(`Placement failed: ${err.message}`, 'error'));
}

function onCarryPointerUp(e) {
    if (e.button !== 0 || !canPlaceCarry()) return;
    if (!isSchedPlaceTarget(e.target)) return;
    requestPlace(e.clientX, e.clientY);
}

function onSchedClick(e) {
    requestPlace(e.clientX, e.clientY);
}

function domFromBryntum(ev) {
    return ev?.domEvent || ev?.event || ev?.source?.currentEvent || null;
}

function handleBarClick(ev) {
    if (performance.now() < ignorePickUntil) return;
    const dom = domFromBryntum(ev);
    if (dom?.button === 2 || dom?.which === 3) return;
    if (dom?.target?.closest?.('.b-menu, .b-popup, .b-float-root')) return;
    if (carried.value) {
        requestPlace(
            dom?.clientX ?? lastMouse.x,
            dom?.clientY ?? lastMouse.y,
            { resource : ev.resourceRecord, date : ev.date }
        );
        return;
    }
    pickUp(ev.eventRecord, dom);
}

function handleScheduleClick(ev) {
    const dom = domFromBryntum(ev);
    requestPlace(
        dom?.clientX ?? lastMouse.x,
        dom?.clientY ?? lastMouse.y,
        { resource : ev.resourceRecord, date : ev.date }
    );
}

async function placeCarried(date, resourceRecord) {
    const s   = getInstance();
    const rec = carried.value;
    if (!s || !rec) return;
    if (!date) {
        toast('Could not read a date at that position — click inside the timeline', 'warn');
        return;
    }
    const raw = rec.data.raw;

    if (resourceRecord?.data?.subtotalRow || resourceRecord?.id === 'subtot') {
        toast('Cannot place orders on the Subtotal row', 'error');
        return;
    }
    const parkHold = isHoldingRes(resourceRecord);
    if (!parkHold && !isSewingRes(resourceRecord) && !resourceRecord?.data?.lineRow) {
        toast('Place the bar on a sewing line or the Holding Row', 'error');
        return;
    }
    if (!parkHold && raw.suitable?.length && !raw.suitable.includes(resourceRecord.id)) {
        toast(`${resourceRecord.name} is not the usual line for ${raw.po} — placed anyway`, 'warn');
    }

    const targetId = parkHold ? 'hold' : resourceRecord.id;
    // Line the bar is leaving — its ramp re-derives after the move (rule: a
    // moved bar compares against the previous order on the NEW line)
    const sourceLid = lineIdOf(s, rec);

    if (!parkHold) {
        // Changeover check at the drop point: ONLY this bar takes a
        // curve-aware duration; no other bar is resized by the curve
        deriveLcForPlacement(s, raw, targetId, date);
        applyLineFormulaDuration(s, raw, targetId);
    }

    let start, end, note = null;
    if (parkHold) {
        start = startOfWorkDay(date);
        end   = endOfWork(start, raw.dur || 1);
        raw.status = 'unplanned';
        raw.parked = true;
    }
    else {
        raw.parked = false;
        const inserted = computeInsertStart(s, targetId, date, raw.dur, rec.id);
        start = inserted.start;
        end   = inserted.end;
        noteManualGap(s, targetId, rec, start);
        if (inserted.snapped)   note = 'off day — starts at the next working day\'s first hour';
        if (inserted.blockedBy) note = `${inserted.blockedBy} occupies that point — attached right after it`;
    if (raw.matReady && start < raw.matReady) {
        toast(`Material for ${raw.po} is not ready before ${fmtDate(raw.matReady)}`, 'error');
        return;
    }
        if (raw.status === 'unplanned') raw.status = 'draft';
        raw.userPinned = true;
    }
    raw.latePlan = !parkHold && !!raw.ship && end > new Date(raw.ship);

    restoreCarriedCls();
    assignEventToLine(s, rec, targetId);
    rec.set({
        startDate  : start,
        endDate    : end,
        duration   : elapsedDays(start, end),
        resourceId : targetId
    });
    rec.data.resourceId = targetId;
    raw.start = start;
    raw.end   = end;

    if (!parkHold) {
        beginBoardInteraction(s, 'light');
        try {
            pushFollowers(s, targetId, rec);
            tryMergeAdjacent(s, rec, targetId);
            // Refresh ramp badges/tooltips on both lines (annotation only —
            // never resizes other bars)
            const lcLines = [targetId];
            if (sourceLid && sourceLid !== targetId && sourceLid !== 'hold') lcLines.push(sourceLid);
            applyLearningCurves(s, { lineIds : lcLines });
        }
        finally {
            endBoardInteraction(s);
        }
    }

    const util = computeLineUtil(s.eventStore.records);
    raw.risk = calcRisk({
        start, end,
        ship     : raw.ship,
        matReady : raw.matReady,
        lineUtil : parkHold ? 0 : (util[targetId] ?? 0),
        status   : raw.status
    });
    ignorePickUntil = performance.now() + 450;
    cancelCarry();
    s.refresh?.();
    markBoardDirty();
    touchBoardCache(s);
}

function assignmentEventId(a) {
    const ev = a.eventId ?? a.event ?? a.data?.eventId ?? a.data?.event;
    return ev?.id ?? ev;
}

function findEventAssignments(s, rec) {
    const fromRec = rec.assignments;
    if (fromRec && typeof fromRec.forEach === 'function') {
        const arr = [];
        fromRec.forEach(a => arr.push(a));
        if (arr.length) return arr;
    }
    const id = rec.id;
    return s.assignmentStore.records.filter(a => {
        const evId = assignmentEventId(a);
        return evId === id || String(evId) === String(id);
    });
}

function assignEventToLine(s, rec, targetId) {
    const asns = findEventAssignments(s, rec);
    if (asns.length) {
        asns[0].set('resourceId', targetId);
        for (let i = 1; i < asns.length; i++) {
            s.assignmentStore.remove(asns[i]);
        }
    }
    else {
        s.assignmentStore.add({ eventId : rec.id, resourceId : targetId });
    }
}

// ---------------------------------------------------------------------------
// Calendars dialog (FastReact style): weekday working hours configuration
// ---------------------------------------------------------------------------
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const CAL_ORDER = [1, 2, 3, 4, 5, 6, 0]; // display Monday..Sunday

const calOpen = ref(false);
const calName = ref(calendarState.name);
const calRows = ref([]);

function openCalendars() {
    calName.value = calendarState.name;
    calRows.value = CAL_ORDER.map(d => ({
        d,
        label : DAY_NAMES[d],
        start : calendarState.days[d].start,
        hours : calendarState.days[d].hours,
        ot    : calendarState.days[d].ot
    }));
    calOpen.value = true;
    calMin.value = false;
}

const totalHours = () => {
    const mins = calRows.value.reduce((a, r) => a + Math.round(hmToHours(r.hours) * 60), 0);
    return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
};

// Push the configured calendar onto the board: off-day hatching, event
// rescheduling, line capacity and the day-wise manpower band
function applyCalendarToBoard() {
    calendarState.offDays = new Set(
        Object.keys(calendarState.days)
            .filter(d => hmToHours(calendarState.days[d].hours) <= 0)
            .map(Number)
    );
    invalidateWorkDayCache(); // learning-curve day counter follows the calendar
    const s = getInstance();
    if (!s) return;

    const intervals = [...calendarState.offDays].map(d => ({
        recurrentStartDate : `on ${DAY_NAMES[d]} at 0:00`,
        recurrentEndDate   : `on ${DAY_NAMES[(d + 1) % 7]} at 0:00`,
        isWorking          : false
    }));
    // Date-specific overrides (Change working hours): a zeroed date becomes
    // non-working, a positive override on a weekly-off date becomes working
    for (const [ymd, hrsOv] of Object.entries(calendarState.overrides || {})) {
        const d0 = new Date(`${ymd}T00:00:00`);
        if (Number.isNaN(d0.getTime())) continue;
        const d1 = new Date(d0);
        d1.setDate(d1.getDate() + 1);
        intervals.push({
            startDate : d0,
            endDate   : d1,
            priority  : 30,
            isWorking : Number(hrsOv) > 0
        });
    }
    s.project.calendarManagerStore.data = [{ id : 'factory', name : calendarState.name, intervals }];
    s.project.calendar = 'factory';

    // Visible day window on the axis = calendar start -> work hours + OT
    const workCfgs = Object.values(calendarState.days).filter(c => hmToHours(c.hours) > 0);
    if (workCfgs.length) {
        const fromHour = Math.floor(Math.min(...workCfgs.map(c => hmToHours(c.start))));
        const toHour   = Math.ceil(Math.max(...workCfgs.map(c =>
            hmToHours(c.start) + hmToHours(c.hours) + hmToHours(c.ot))));
        s.workingTime = { fromHour, toHour : Math.min(24, Math.max(fromHour + 1, toHour)) };
    }

    // Standard day = longest configured working day; a line's own hours
    // (planning_resources.working_hours_per_day) override the calendar.
    // Capacity always comes from the LIVE board resource values — never from
    // the stale demo LINES table.
    const hrs = Math.max(0, ...Object.values(calendarState.days).map(c => hmToHours(c.hours)));
    for (const res of s.resourceStore.records) {
        if (!res.data.lineRow) continue;
        const mp  = Number(res.data.manpower) || 0;
        const eff = Number(res.data.eff) || 0;
        const lh  = Number(res.data.hours) || hrs;
        const availMin = Math.round(mp * lh * 60 * eff / 100);
        res.set('availMin', availMin);
        let l = LINES.find(x => x.id === res.id);
        if (!l) {
            // A DB line beyond the demo master (e.g. Line 09): register it so
            // every LINE_BY_ID consumer — day-plan report, grand totals,
            // top-3 products, capacity — sees it like any other line
            l = {
                id       : res.id,
                name     : res.data.name || res.id,
                unit     : res.data.unit || 'AQL',
                floor    : res.data.floor || 'F1',
                machines : Number(res.data.machines) || 0,
                manpower : mp, eff, hours : lh, availMin
            };
            LINES.push(l);
            LINE_BY_ID[res.id] = l;
        }
        l.availMin = availMin;
        l.manpower = mp;
        l.eff      = eff;
        l.hours    = lh;
    }

    s.project.resourceTimeRangeStore.data = buildManpowerRanges(
        s.resourceStore.records
            .filter(r => r.data.lineRow)
            .map(r => ({ id : r.id, manpower : r.data.manpower }))
    );

    // Off-day column crosshatch (keep the current-time line record)
    const keep = s.project.timeRangeStore.records
        .filter(r => r.id === 'currentTime')
        .map(r => ({ ...r.data }));
    s.project.timeRangeStore.data = [...keep, ...buildOffDayRanges()];

    // Reflow every bar to the new calendar (FastReact rule): starts snap off
    // 0-hour days, ends stretch so off days are never counted as work
    let reflowed = 0;
    for (const rec of s.eventStore.records) {
        const raw = rec.data.raw;
        if (!raw || raw.stage || raw.userPinned || raw.manualGap) continue;
        if (!isOffDay(rec.startDate)) continue;
        const sd  = startOfWorkDay(nextWorkingDay(rec.startDate));
        const end = endOfWork(sd, raw.dur);
        if (sd.getTime() !== rec.startDate.getTime() || end.getTime() !== rec.endDate.getTime()) {
            rec.set({ startDate : sd, endDate : end, duration : elapsedDays(sd, end) });
            raw.start = sd;
            raw.end   = end;
            reflowed++;
        }
    }
    if (reflowed) {
        toast(`${reflowed} order bar(s) rescheduled around the off days`, 'ok');
    }

    beginBoardInteraction(s, 'batch');
    try { packBoardGaps(s); }
    finally { endBoardInteraction(s); }

    recalcCapacity(s);
    s.refreshWithTransition?.();
}

async function updateCalendar() {
    for (const r of calRows.value) {
        calendarState.days[r.d] = { start : r.start, hours : r.hours, ot : r.ot };
    }
    calendarState.name = calName.value;
    applyCalendarToBoard();

    const off = [...calendarState.offDays].map(d => DAY_NAMES[d]).join(', ') || 'none';
    toast(`Calendar "${calendarState.name}" applied — off days: ${off}`, 'ok');

    if (dataSource.value === 'db') {
        try {
            const res = await fetch(`${API_BASE}/calendars/1`, {
                method  : 'PUT',
                headers : { 'Content-Type' : 'application/json' },
                body    : JSON.stringify({ name : calendarState.name, days : calendarState.days })
            });
            const j = await res.json();
            if (j.success) toast('Calendar saved to fastreact DB (planning_calendar_intervals)', 'ok');
            else toast(`Calendar save failed: ${j.error}`, 'error');
        }
        catch (e) {
            toast(`Calendar save failed: ${e.message}`, 'error');
        }
    }
}

let toastId = 0;

const getInstance = () => {
    const i = schedRef.value?.instance;
    return i?.value ?? i ?? null;
};

// Bulk board writes (auto-plan, API load) suspend Bryntum refresh so the
// UI thread is not repainted once per strip — that was freezing the board.
function withBoardBatch(s, fn) {
    if (!s) return;
    const es = s.eventStore;
    es.suspendEvents?.();
    s.suspendRefresh?.();
    try {
        fn();
    }
    finally {
        es.resumeEvents?.();
        s.resumeRefresh?.(true);
    }
}

const yieldUi = () => new Promise(resolve => setTimeout(resolve, 0));

let capRecalcTimer = null;
function scheduleCapacityRefresh(s) {
    if (!s || isBoardInteracting()) return;
    clearTimeout(capRecalcTimer);
    capRecalcTimer = setTimeout(() => {
        if (isBoardInteracting()) return;
        recalcCapacity(s);
        updateFrVScroll(s);
    }, 250);
}

function toast(text, type = 'error') {
    const id = ++toastId;
    toasts.value.push({ id, text, type });
    setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id);
    }, 5000);
}

onMounted(() => {
    ensureCarryDom();
    uiHooks.onOrderSelect = eventRecord => {
        const raw = eventRecord?.data?.raw;
        if (raw) order.value = raw;
    };
    uiHooks.onSelectionClear = () => {
        order.value = null;
        clearDayPlanChips();
    };
    // Hover a bar (tooltip-style) → its day-wise quantities appear on the
    // Holding Row band; leaving the bar clears them
    uiHooks.onBarHover = eventRecord => {
        if (carried.value) return;
        showDayPlanChips(getInstance(), eventRecord);
    };
    uiHooks.onBarHoverOut = () => clearDayPlanChips();
    uiHooks.onToast = toast;

    // Right-click -> Planned schedule / Properties on a strip
    uiHooks.onOpenSchedule = openPlannedSchedule;
    uiHooks.onOpenProps = openStripProps;

    uiHooks.onBoardEdited = () => {
        markBoardDirty();
        touchBoardCache(getInstance());
    };

    // FastReact pick & place: click bar to pick up, click timeline to place.
    uiHooks.onBarClick = handleBarClick;
    uiHooks.onScheduleClick = handleScheduleClick;

    // After a split, the new (split-off) bar sticks to the cursor so the
    // user can point-and-place it anywhere (FastReact behaviour)
    uiHooks.onCarryNew = rec => pickUp(rec, null);

    // Dev-console access for diagnostics
    window.__mbm = { pickUp, placeCarried, cancelCarry, carried, uiHooks, barDayQty, showDayPlanChips, clearDayPlanChips };

    const s = getInstance();
    uiHooks.instance = s;
    if (s) {
        recalcCapacity(s);
        removeOrdersWithoutBuyer(s);
        applyProdUpdates(s);
        s.scrollToDate?.(currentBoardDate(), { block : 'start' });
        s.eventStore.on({
            change() {
                scheduleCapacityRefresh(s);
            }
        });
        installFrVScroll(s);
        s.on?.({
            paint() { installFrVScroll(s); },
            resize() { updateFrVScroll(s); }
        });
    }

    // Try the MySQL-backed API (172.16.101.70 / fastreact); fall back to demo
    hydrateBoardFromApi();

    // Reopen the board that was open before the reload (until the user
    // closes or minimizes it explicitly)
    try {
        const saved = JSON.parse(localStorage.getItem('mbm-board-view') || 'null');
        if (saved?.boardId) {
            const b = permittedBoards.value.find(x => x.id === saved.boardId);
            if (b && saved.min) {
                currentBoard.value = b;
                boardMin.value = true;
            }
            else if (b && saved.view === 'board') {
                openBoard(b);
            }
        }
    }
    catch { /* corrupt saved state - stay on home */ }
});

let saveInFlight = false;

async function saveToDb() {
    // Another user holds the board's edit lock: this session is a what-if
    // sandbox — every change stays local, saving is the one blocked action
    if (boardReadOnly.value) {
        const h = boardLockHolder.value;
        toast(`🔒 Save disabled — ${h?.name || h?.username || 'another user'} is editing this board. আপনার test change গুলো save হবে না`, 'warn');
        return;
    }
    // Repeated clicks while a save is preparing/running must not stack
    if (saveInFlight) {
        toast('Save already in progress — please wait…', 'warn');
        return;
    }
    const s = getInstance();
    if (!s) return;
    if (dataSource.value !== 'db') {
        toast('Not connected to the fastreact database — nothing saved', 'warn');
        return;
    }
    saveInFlight = true;
    try {
        await saveToDbInner(s);
    }
    finally {
        saveInFlight = false;
    }
}

async function saveToDbInner(s) {
    const changes = collectPendingChanges(s);
    if (!changes.length) {
        toast('No changes to save — move an order first, then click Save', 'warn');
        return;
    }
    // Connection pre-check: a dead API/DB is reported IMMEDIATELY instead of
    // the save silently doing nothing while the user keeps clicking
    try {
        await pingApi(4000);
    }
    catch {
        window.alert('⚠ CONNECTION ISSUE\n\nPlanning API/DB is not reachable (localhost:4000 → MySQL).\nNothing was saved. Start the API server / check the network, then try again.');
        return;
    }
    if (!window.confirm(formatSaveConfirm(changes))) return;
    toast(`Saving ${changes.length} change(s)…`, 'ok');
    const eventIds = changes.map(c => c.eventId).filter(Boolean);
    for (const id of eventIds) {
        const ev = s.eventStore.getById(id);
        const raw = ev?.data?.raw;
        if (raw && !raw.stage) raw.userPinned = true;
    }
    const missingLine = eventIds.filter(id => {
        const ev = s.eventStore.getById(id);
        if (!ev) return false;
        const rid = lineIdOf(s, ev);
        return rid !== 'hold' && !resolveResourceDbId(s, rid);
    });
    if (missingLine.length) {
        toast('Cannot save — sewing line is not linked to the database. Reload the board and try again.', 'error');
        return;
    }
    try {
        const res = await syncToApi(s, { eventIds });
        if (res.success) {
            if (res.mapped?.length) {
                for (const m of res.mapped) {
                    for (const ev of s.eventStore.records) {
                        if (eventIds.length && !eventIds.includes(String(ev.id))) continue;
                        const raw = ev.data.raw;
                        if (!raw || raw.stage) continue;
                        const code = raw.eventCode || poBaseEventCode(raw.po);
                        const matchCode = m.eventCode && m.eventCode === code;
                        if (!matchCode) continue;
                        ev.data.dbId = m.eventId;
                        ev.set?.('dbId', m.eventId);
                        raw.eventCode = m.eventCode || raw.eventCode;
                        if (!String(ev.id).startsWith('db-')) ev.id = `db-${m.eventId}`;
                    }
                }
            }
            const uid = currentUnitId.value;
            if (uid && boardUnitCache[uid]) {
                boardUnitCache[uid].apiData.events = serializeBoardEvents(s);
                boardUnitCache[uid].apiData.assignments = serializeBoardAssignments(s);
            }
            markBoardSaved();
            setBoardBaseline(s);
            pendingSwapIds.clear();
            pendingRepairIds.clear();
            toast(`Plan saved (${changes.length} change${changes.length === 1 ? '' : 's'})`, 'ok');
        }
        else toast(`Save failed: ${res.error}`, 'error');
    }
    catch (e) {
        const connIssue = e?.name === 'AbortError'
            || /failed to fetch|networkerror|load failed/i.test(String(e?.message || ''));
        if (connIssue) {
            window.alert('⚠ CONNECTION ISSUE\n\nThe save could not reach the planning API/DB.\nYour changes are still on the board (NOT saved). Check the server / network and press Save again.');
        }
        toast(`Save failed: ${e.message}`, 'error');
    }
}

// --------------------------------------------------------------------------
// Drag from the unplanned panel onto the board (documents 3.2 + 11)
// --------------------------------------------------------------------------
function onDragStart(e, o) {
    e.dataTransfer.setData('text/plain', o.id);
    e.dataTransfer.effectAllowed = 'copy';
}

function onSchedulerDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

function onSchedulerDrop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const o  = unplanned.value.find(u => u.id === id);
    const s  = getInstance();
    if (!o || !s) return;

    const resource = s.resolveResourceRecord(e);
    const date     = s.getDateFromDomEvent(e, 'floor');
    const result   = planOrderDrop(s, o, resource, date);

    result.errors.forEach(msg => toast(msg, 'error'));
    result.warnings.forEach(msg => toast(msg, 'warn'));

    if (result.ok) {
        unplanned.value = unplanned.value.filter(u => u.id !== id);
        toast(`${o.po} planned on ${resource.name}`, 'ok');
    }
}

// --------------------------------------------------------------------------
// Toolbar
// --------------------------------------------------------------------------
function currentBoardDate() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    if (d < VIEW_START) return VIEW_START;
    if (d >= VIEW_END) {
        const last = new Date(VIEW_END);
        last.setDate(last.getDate() - 1);
        return last;
    }
    return d;
}

function scrollBoardToToday(s) {
    s?.scrollToDate?.(currentBoardDate(), { block : 'start' });
}

const FR_VSCROLL_HTML = `
    <button type="button" class="fr-vscroll-btn fr-vscroll-up" aria-label="Scroll up"></button>
    <div class="fr-vscroll-track"><div class="fr-vscroll-thumb"></div></div>
    <button type="button" class="fr-vscroll-btn fr-vscroll-down" aria-label="Scroll down"></button>
`;

function vScrollMetrics(s) {
    const sc = s?.scrollable;
    const rm = s?.rowManager;
    const y = Number(sc?.y ?? s?.scrollTop ?? 0) || 0;
    const view = Number(
        sc?.clientHeight ?? rm?.viewHeight ?? s?.bodyHeight
    ) || 1;
    let max = Number(sc?.maxY);
    if (!Number.isFinite(max) || max < 0) {
        const total = Number(
            sc?.scrollHeight
            ?? rm?.totalFixedHeight
            ?? ((s?.resourceStore?.count || 0) * (s?.rowHeight || 48))
        );
        max = Math.max(0, total - view);
    }
    return { sc, y, max, view };
}

function setScrollY(s, next) {
    const { sc, max } = vScrollMetrics(s);
    const y = Math.max(0, Math.min(max, next));
    if (!sc) return;
    sc.y = y;
}

function updateFrVScroll(s) {
    const bar = s?.element?.querySelector('.fr-vscroll');
    if (!bar) return;
    const thumb = bar.querySelector('.fr-vscroll-thumb');
    const track = bar.querySelector('.fr-vscroll-track');
    if (!thumb || !track) return;
    const { y, max, view } = vScrollMetrics(s);
    const trackH = track.clientHeight || 1;
    const thumbH = max <= 0 ? trackH : Math.max(24, Math.round(trackH * view / (view + max)));
    const top = max <= 0 ? 0 : Math.round((y / max) * (trackH - thumbH));
    thumb.style.height = `${thumbH}px`;
    thumb.style.top = `${top}px`;
    bar.classList.toggle('fr-vscroll-idle', max <= 0);
}

function bindFrVScroll(s, bar) {
    if (bar.dataset.bound) return;
    bar.dataset.bound = '1';
    const up = bar.querySelector('.fr-vscroll-up');
    const down = bar.querySelector('.fr-vscroll-down');
    const track = bar.querySelector('.fr-vscroll-track');
    const thumb = bar.querySelector('.fr-vscroll-thumb');
    const step = () => s.rowHeight || 48;

    const hold = (dir) => {
        const tick = () => setScrollY(s, vScrollMetrics(s).y + dir * step());
        tick();
        const t = setTimeout(() => {
            const i = setInterval(tick, 40);
            const stop = () => {
                clearInterval(i);
                window.removeEventListener('mouseup', stop);
            };
            window.addEventListener('mouseup', stop);
        }, 280);
        const cancel = () => {
            clearTimeout(t);
            window.removeEventListener('mouseup', cancel);
        };
        window.addEventListener('mouseup', cancel);
    };
    up?.addEventListener('mousedown', e => { e.preventDefault(); hold(-1); });
    down?.addEventListener('mousedown', e => { e.preventDefault(); hold(1); });

    track?.addEventListener('mousedown', e => {
        if (e.target === thumb) return;
        e.preventDefault();
        const { y, view } = vScrollMetrics(s);
        const page = view * 0.9;
        const goingUp = e.clientY < thumb.getBoundingClientRect().top;
        setScrollY(s, goingUp ? y - page : y + page);
    });

    thumb?.addEventListener('mousedown', e => {
        e.preventDefault();
        e.stopPropagation();
        const startY = e.clientY;
        const startScroll = vScrollMetrics(s).y;
        const onMove = ev => {
            const { max } = vScrollMetrics(s);
            const range = (track.clientHeight - thumb.offsetHeight) || 1;
            setScrollY(s, startScroll + (ev.clientY - startY) / range * max);
        };
        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    });

    bar.addEventListener('wheel', e => {
        e.preventDefault();
        setScrollY(s, vScrollMetrics(s).y + e.deltaY);
    }, { passive : false });

    s.scrollable?.on?.({
        scroll() { updateFrVScroll(s); }
    });
}

function installFrVScroll(s) {
    if (!s?.element) return;
    s.element.classList.add('mb-fr-vscroll-on');
    s.element.querySelectorAll('.b-grid-splitter').forEach(split => {
        const parent = split.parentElement;
        if (!parent || parent.querySelector(':scope > .fr-vscroll, :scope > .fr-vscroll-pad')) return;
        const isBody = parent.classList.contains('b-grid-vertical-scroller');
        if (isBody) {
            const bar = document.createElement('div');
            bar.className = 'fr-vscroll';
            bar.innerHTML = FR_VSCROLL_HTML;
            split.before(bar);
            bindFrVScroll(s, bar);
        }
        else {
            const pad = document.createElement('div');
            pad.className = 'fr-vscroll-pad';
            split.before(pad);
        }
    });
    requestAnimationFrame(() => {
        updateFrVScroll(s);
        installFrHScroll(s);
    });
}

function installFrHScroll(s) {
    if (!s?.element) return;
    let bar = s.element.querySelector(':scope > .b-gridbase .fr-hscroll, .fr-hscroll');
    const body = s.element.querySelector('.b-grid-body-container');
    const foot = s.element.querySelector('.b-grid-footer-container');
    if (!body) return;
    if (!bar) {
        bar = document.createElement('div');
        bar.className = 'fr-hscroll';
        bar.innerHTML = `
            <button type="button" class="fr-hscroll-btn fr-hscroll-left" aria-label="Scroll left"></button>
            <div class="fr-hscroll-track"><div class="fr-hscroll-thumb"></div></div>
            <button type="button" class="fr-hscroll-btn fr-hscroll-right" aria-label="Scroll right"></button>
        `;
        if (foot) foot.before(bar);
        else body.after(bar);
        bindFrHScroll(s, bar);
    }
    requestAnimationFrame(() => updateFrHScroll(s));
}

function hScrollMetrics(s) {
    const sc = s?.scrollable;
    const x = Number(sc?.x ?? 0) || 0;
    const view = Number(sc?.clientWidth ?? s?.timeAxisSubGrid?.width) || 1;
    let max = Number(sc?.maxX);
    if (!Number.isFinite(max) || max < 0) {
        max = Math.max(0, Number(sc?.scrollWidth || 0) - view);
    }
    return { sc, x, max, view };
}

function setScrollX(s, next) {
    const { sc, max } = hScrollMetrics(s);
    if (!sc) return;
    sc.x = Math.max(0, Math.min(max, next));
}

function updateFrHScroll(s) {
    const bar = s?.element?.querySelector('.fr-hscroll');
    if (!bar) return;
    const thumb = bar.querySelector('.fr-hscroll-thumb');
    const track = bar.querySelector('.fr-hscroll-track');
    if (!thumb || !track) return;
    const { x, max, view } = hScrollMetrics(s);
    const trackW = track.clientWidth || 1;
    const thumbW = max <= 0 ? trackW : Math.max(32, Math.round(trackW * view / (view + max)));
    const left = max <= 0 ? 0 : Math.round((x / max) * (trackW - thumbW));
    thumb.style.width = `${thumbW}px`;
    thumb.style.left = `${left}px`;
}

function bindFrHScroll(s, bar) {
    if (bar.dataset.bound) return;
    bar.dataset.bound = '1';
    const left = bar.querySelector('.fr-hscroll-left');
    const right = bar.querySelector('.fr-hscroll-right');
    const track = bar.querySelector('.fr-hscroll-track');
    const thumb = bar.querySelector('.fr-hscroll-thumb');
    const step = () => s.tickSize || 72;

    const hold = (dir) => {
        const tick = () => setScrollX(s, hScrollMetrics(s).x + dir * step());
        tick();
        const t = setTimeout(() => {
            const i = setInterval(tick, 40);
            const stop = () => {
                clearInterval(i);
                window.removeEventListener('mouseup', stop);
            };
            window.addEventListener('mouseup', stop);
        }, 280);
        const cancel = () => {
            clearTimeout(t);
            window.removeEventListener('mouseup', cancel);
        };
        window.addEventListener('mouseup', cancel);
    };
    left?.addEventListener('mousedown', e => { e.preventDefault(); hold(-1); });
    right?.addEventListener('mousedown', e => { e.preventDefault(); hold(1); });

    track?.addEventListener('mousedown', e => {
        if (e.target === thumb) return;
        e.preventDefault();
        const { x, view } = hScrollMetrics(s);
        const goingLeft = e.clientX < thumb.getBoundingClientRect().left;
        setScrollX(s, goingLeft ? x - view * 0.9 : x + view * 0.9);
    });

    thumb?.addEventListener('mousedown', e => {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.clientX;
        const startScroll = hScrollMetrics(s).x;
        const onMove = ev => {
            const { max } = hScrollMetrics(s);
            const range = (track.clientWidth - thumb.offsetWidth) || 1;
            setScrollX(s, startScroll + (ev.clientX - startX) / range * max);
        };
        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    });

    bar.addEventListener('wheel', e => {
        if (Math.abs(e.deltaX) < Math.abs(e.deltaY) && !e.shiftKey) return;
        e.preventDefault();
        setScrollX(s, hScrollMetrics(s).x + (e.shiftKey ? e.deltaY : e.deltaX));
    }, { passive : false });

    s.scrollable?.on?.({
        scroll() {
            updateFrVScroll(s);
            updateFrHScroll(s);
        }
    });
}

function hZoom(delta) {
    const s = getInstance();
    if (!s) return;
    const keep = s.visibleDateRange?.startDate || currentBoardDate();
    const next = Math.max(40, Math.min(220, (s.tickSize || 96) + delta));
    s.tickSize = next;
    s.scrollToDate?.(keep, { block : 'start' });
    requestAnimationFrame(() => updateFrHScroll(s));
}

function vZoom(delta) {
    const s = getInstance();
    if (!s) return;
    s.rowHeight = Math.max(32, Math.min(110, (s.rowHeight || 56) + delta));
    requestAnimationFrame(() => updateFrVScroll(s));
}

const act = name => {
    if (name === 'colorMenu') {
        colorMenuOpen.value = !colorMenuOpen.value;
        return;
    }
    if (name === 'save') {
        saveToDb();
        return;
    }
    if (name === 'calendars') {
        openCalendars();
        return;
    }
    if (name === 'close') {
        closeBoard();
        return;
    }
    if (name === 'home') {
        scrollBoardToToday(getInstance());
        return;
    }
    const s = getInstance();
    if (!s) return;
    switch (name) {
        case 'hZoomOut' : hZoom(-20); break;
        case 'hZoomIn'  : hZoom(20); break;
        case 'vZoomIn'  : vZoom(8); break;
        case 'vZoomOut' : vZoom(-8); break;
        case 'print'    : window.print(); break;
        case 'undo'     : s.project.stm?.canUndo && s.project.stm.undo(); break;
        case 'redo'     : s.project.stm?.canRedo && s.project.stm.redo(); break;
        default         : break;
    }
};

const colorModes = [
    { icon : '⚠', label : 'Risk status', mode : 'risk' },
    { icon : '👕', label : 'Buyer',       mode : 'buyer' },
    { icon : '🏷', label : 'Plan status', mode : 'status' }
];

const pickColorMode = m => {
    colorMode.value = m;
    colorState.mode = m;
    colorMenuOpen.value = false;
    const s = getInstance();
    s?.refreshWithTransition?.() ?? s?.refreshRows?.();
};

const boardSearch = ref('');
watch(boardSearch, q => {
    searchState.query = q;
    const s = getInstance();
    s?.refreshWithTransition?.() ?? s?.refreshRows?.();
});

const toolbar = [
    { fa : 'fa-xmark', cls : 'fr-tb-red', title : 'Close view', action : 'close' },
    { fa : 'fa-house', title : 'Go to current date', action : 'home' },
    { sep : true },
    { fa : 'fa-magnifying-glass-minus', title : 'Horizontal zoom out — narrower days', action : 'hZoomOut' },
    { fa : 'fa-magnifying-glass-plus',  title : 'Horizontal zoom in — wider days', action : 'hZoomIn' },
    { fa : 'fa-angles-up',   title : 'Vertical zoom in — taller rows', action : 'vZoomIn' },
    { fa : 'fa-angles-down', title : 'Vertical zoom out — shorter rows', action : 'vZoomOut' },
    { sep : true },
    { fa : 'fa-palette', caret : true, title : 'Colour by', action : 'colorMenu', anchor : true },
    { fa : 'fa-print', title : 'Print', action : 'print' },
    { sep : true },
    { fa : 'fa-rotate-left',  title : 'Undo', action : 'undo' },
    { fa : 'fa-rotate-right', title : 'Redo', action : 'redo' },
    { sep : true },
    { fa : 'fa-floppy-disk', cls : 'fr-tb-save', title : 'Save plan to fastreact DB', action : 'save' },
    { fa : 'fa-calendar-days', title : 'Calendars (working days / hours)', action : 'calendars' }
];

const prioCls = p => p === 1 ? 'mb-prio-1' : p === 2 ? 'mb-prio-2' : 'mb-prio-3';
</script>

<template>
    <div class="fr-app">
        <!-- Login gate: everything stays behind this until a DB login succeeds -->
        <div v-if="!authUser" class="lg-overlay">
            <div class="lg-orbs"><i></i><i></i><i></i></div>
            <form class="lg-card" :class="{ 'lg-shake' : loginErr }" @submit.prevent="doLogin">
                <div class="lg-logo">📅</div>
                <div class="lg-brand">MbmPlan</div>
                <div class="lg-sub">{{ loginGreeting }} — sign in to continue</div>

                <label class="lg-label">Username</label>
                <input
                    v-model="loginU"
                    class="lg-in"
                    type="text"
                    autocomplete="username"
                    spellcheck="false"
                    placeholder="username"
                    @input="loginErr = ''"
                >
                <label class="lg-label">Password</label>
                <div class="lg-pwrow">
                    <input
                        ref="loginPwRef"
                        v-model="loginP"
                        class="lg-in lg-in-pw"
                        :type="loginShowPw ? 'text' : 'password'"
                        autocomplete="current-password"
                        placeholder="••••••"
                        @input="loginErr = ''"
                    >
                    <button
                        type="button"
                        class="lg-eye"
                        :title="loginShowPw ? 'Hide password' : 'Show password'"
                        @click="loginShowPw = !loginShowPw"
                    >{{ loginShowPw ? '🙈' : '👁' }}</button>
                </div>

                <div v-if="loginErr" class="lg-err">⚠ {{ loginErr }}</div>

                <button type="submit" class="lg-btn" :disabled="loginBusy">
                    <span v-if="loginBusy" class="lg-spin"></span>
                    {{ loginBusy ? 'Signing in…' : 'Sign in →' }}
                </button>

                <div class="lg-foot">🔒 planning_users · production planning</div>
            </form>
        </div>

        <!-- FastReact-style main menu (always visible) -->
        <div class="fr-menubar" @click.self="openMenu = null">
            <span v-for="m in shellMenus" :key="m.label" class="fr-menu-wrap">
                <span
                    class="fr-menu"
                    :class="[{ 'fr-menu-active' : openMenu === m.label }, m.cls]"
                    @click="menuClick(m)"
                >
                    <i class="fa-solid fr-menu-fa" :class="m.fa" aria-hidden="true"></i>{{ m.label }}
                </span>
                <div v-if="openMenu === m.label && m.label === 'Reports'" class="fr-dropdown">
                    <div class="fr-dd-item" @click="openDayPlanReport">
                        <i class="fa-solid fa-file-lines fr-dd-fa" aria-hidden="true"></i> Day Plan Report
                    </div>
                    <div class="fr-dd-item" @click="openBoardPlanReport">
                        <i class="fa-solid fa-table-cells fr-dd-fa" aria-hidden="true"></i> Board Plan Report — full board
                    </div>
                    <div class="fr-dd-item" @click="openProdUpdate">
                        <i class="fa-solid fa-industry fr-dd-fa" aria-hidden="true"></i> Daily production update
                    </div>
                </div>
                <div v-if="openMenu === m.label && m.label === 'Planning'" class="fr-dropdown">
                    <div class="fr-dd-item" @click="planLiveOrders">
                        <i class="fa-solid fa-route fr-dd-fa" aria-hidden="true"></i>
                        Plan live orders (PCD / delivery / critical path)
                    </div>
                    <div class="fr-dd-item" @click="openPlanGenerator">🧮 Plan generator (S2)</div>
                    <div class="fr-dd-item" @click="compactBoardNoGaps">🧹 Compact lines — remove gaps</div>
                    <div class="fr-dd-sep"></div>
                    <div
                        v-for="b in permittedBoards"
                        :key="b.id"
                        class="fr-dd-item"
                        @click="openBoard(b)"
                    >🗓 {{ b.name }}</div>
                    <div v-if="!permittedBoards.length" class="fr-dd-item fr-dd-dim">No boards permitted for {{ currentUser?.name }}</div>
                    <div class="fr-dd-sep"></div>
                    <div class="fr-dd-item" @click="addBoard">➕ Add planning board</div>
                </div>
                <div v-if="openMenu === m.label && m.label === 'Setup'" class="fr-dropdown">
                    <div v-if="canManageUsers" class="fr-dd-item" @click="openSettings">⚙️ Settings — users &amp; permissions</div>
                    <div class="fr-dd-item" @click="openPlanningRoles">👤 Planning roles &amp; plan criteria</div>
                    <div class="fr-dd-item" @click="openEffProfiles">📊 Efficiency profiles</div>
                    <div class="fr-dd-item" @click="openLineEffForm">🏭 Line eff &amp; hours</div>
                    <div class="fr-dd-item" @click="openBuildUps">📈 Build up / Learning curves</div>
                </div>
            </span>
        </div>

        <!-- Empty home workspace (FastReact shell) -->
        <div v-if="view === 'home'" class="fr-home">
            <div class="fr-home-empty" @click="openMenu = null"></div>
            <div class="fr-statusbar">
                <span class="fr-status-cell fr-status-ready">Ready</span>
                <span class="fr-status-cell fr-status-wide"></span>
                <span class="fr-status-cell">{{ authUser?.name || currentUser?.name }} · {{ authUser?.role || currentUser?.role }}</span>
                <span class="fr-status-cell fr-status-logout" title="Sign out" @click="doLogout">⎋ Logout</span>
                <span class="fr-status-cell">{{ permittedBoards.length }} board(s) permitted</span>
                <span class="fr-status-cell fr-status-wide"></span>
                <span class="fr-status-cell" :title="apiBaseLabel">{{ dataSource === 'db' ? ('API: ' + apiBaseLabel) : 'demo data' }}</span>
                <span class="fr-status-cell">
                    Server:
                    <select v-model="apiModeSel" @change="onApiModeChange"
                            style="background:transparent;border:1px solid #999;border-radius:3px;font:inherit">
                        <option value="auto">Auto</option>
                        <option value="local">Local</option>
                        <option value="aws">AWS</option>
                    </select>
                </span>
                <span v-if="boardPlanProgress.active" class="fr-status-cell fr-status-plan">
                    ⏳ {{ boardPlanProgress.msg }} {{ boardPlanProgress.pct ? `(${boardPlanProgress.pct}%)` : '' }}
                </span>
            </div>
        </div>

        <!-- Planning board view (parked off-screen when hidden so the
             scheduler keeps real dimensions and never collapses) -->
        <div class="fr-boardarea" :class="{ 'fr-board-hidden' : view !== 'board' }">
        <!-- Plan banner -->
        <div class="fr-banner">
            <span class="mb-banner-title" :class="{ 'mb-banner-ro' : boardReadOnly }">
                <template v-if="boardReadOnly">🔒 AQL (Test mode — {{ boardLockHolder?.name || boardLockHolder?.username || 'another user' }} is editing · your changes will NOT save)</template>
                <template v-else>AQL ({{ currentUser?.role === 'Management' ? 'Read only access' : 'Planning' }} — in use by {{ authUser?.name || currentUser?.name }})</template>
            </span>
            <span class="mb-banner-sub">{{ planMeta.name }} · {{ currentBoard?.unitName || 'Unit' }}</span>
            <span class="fr-banner-btns">
                <span v-if="boardPlanProgress.active" class="fr-banner-plan">
                    ⏳ {{ boardPlanProgress.msg }} {{ boardPlanProgress.pct ? `(${boardPlanProgress.pct}%)` : '' }}
                </span>
                <span class="fr-banner-btn" title="Minimize board" @click="minimizeBoard">—</span>
                <span class="fr-banner-btn fr-banner-x" title="Close board" @click="closeBoard">✕</span>
            </span>
        </div>

        <!-- Toolbar -->
        <div class="fr-toolbar">
            <template v-for="(b, i) in toolbar" :key="i">
                <span v-if="b.sep" class="fr-tb-sep"></span>
                <span v-else-if="b.anchor" class="fr-tb-anchor">
                    <button class="fr-tb-btn" :class="b.cls" :title="b.title" @click="act(b.action)">
                        <i class="fa-solid fr-tb-fa" :class="b.fa" aria-hidden="true"></i>
                        <span v-if="b.caret" class="fr-tb-caret">▾</span>
                    </button>
                    <div v-if="colorMenuOpen" class="fr-colormenu">
                        <div
                            v-for="c in colorModes"
                            :key="c.mode"
                            class="fr-colormenu-item"
                            :class="{ 'fr-colormenu-active' : c.mode === colorMode }"
                            @click="pickColorMode(c.mode)"
                        >
                            <span class="fr-colormenu-ico">{{ c.icon }}</span>{{ c.label }}
                        </div>
                    </div>
                </span>
                <button v-else class="fr-tb-btn" :class="b.cls" :title="b.title" @click="b.action && act(b.action)">
                    <i class="fa-solid fr-tb-fa" :class="b.fa" aria-hidden="true"></i>
                </button>
            </template>
            <label class="fr-tb-search">
                <i class="fa-solid fa-magnifying-glass fr-tb-search-ico" aria-hidden="true"></i>
                <input
                    v-model="boardSearch"
                    type="search"
                    placeholder="Search buyer, PO, style…"
                >
            </label>
        </div>

        <!-- Board -->
        <div class="mb-main">
            <div
                class="mb-sched-wrap"
                :class="{ 'mb-carrying' : carried, 'mb-sched-loading' : boardLoading }"
                @dragover="onSchedulerDragOver"
                @drop="onSchedulerDrop"
                @mousemove="onSchedMouseMove"
                @mouseleave="onSchedMouseLeave"
                @click="onSchedClick"
            >
                <bryntum-scheduler-pro ref="schedRef" v-bind="schedulerProConfig" class="fr-sched" />
                <div v-if="boardLoading" class="fr-board-loader" aria-live="polite" aria-busy="true">
                    <div class="fr-board-loader-box">
                        <div class="fr-board-spinner"></div>
                        <div class="fr-board-loader-title">Loading planning board</div>
                        <div class="fr-board-loader-msg">{{ boardLoadMsg || 'Please wait…' }}</div>
                        <div v-if="boardLoadPct > 0" class="fr-board-loader-bar">
                            <div class="fr-board-loader-fill" :style="{ width : boardLoadPct + '%' }"></div>
            </div>
                        <div v-if="boardLoadPct > 0" class="fr-board-loader-pct">{{ boardLoadPct }}%</div>
                </div>
                    </div>
            </div>
        </div>

        <!-- Order detail panel : values when a bar is selected, labels otherwise -->
        <div v-if="order" class="fr-orderbar">
            <div class="fr-order-row">
                <span class="fr-order-label"><span class="fr-order-ico">🧵</span><u>Order</u></span>
                <span class="fr-cell fr-plain"><b>{{ order.po }}</b></span>
                <span class="fr-cell fr-link">{{ order.buyer }} · {{ order.style }}</span>
                <span class="fr-cell fr-plain">{{ fmtQty(order.qty) }} pcs</span>
                <span class="fr-cell fr-plain">SMV {{ order.smv }}</span>
                <span class="fr-cell fr-link">{{ fmtQty(order.reqMin) }} min</span>
                <span class="fr-cell fr-plain">{{ order.dur }} day(s)</span>
                <span class="fr-cell fr-link fr-magenta">Ship {{ fmtDate(order.ship) }}</span>
            </div>
            <div class="fr-order-row">
                <span class="fr-order-label">-</span>
                <span class="fr-cell fr-plain">Progress {{ order.progress }}%</span>
                <span class="fr-cell fr-plain">Status: {{ order.status }}</span>
                <span class="fr-cell fr-plain">Material {{ fmtDate(order.matReady) }}</span>
                <span class="fr-cell fr-plain">Risk {{ order.risk.score }} ({{ order.risk.level }})</span>
                <span class="fr-cell fr-link fr-wide">{{ order.risk.reasons.join(' · ') }}</span>
            </div>
        </div>

        <div class="fr-legendbar">
            <div class="fr-leg-col"><i class="fr-leg-dot fr-leg-red"></i><b>Product/Order</b><span>Qty made, Started</span></div>
            <div class="fr-leg-col"><b>Order Quantity</b></div>
            <div class="fr-leg-col"><b>Product</b><span>Customer</span></div>
            <div class="fr-leg-col"><b>Earliest load</b><span>Delivery date</span></div>
            <div class="fr-leg-col"><b>Float</b><span>Float</span></div>
            <div class="fr-leg-col"><b>Load date</b><span>Production end date</span></div>
            <div class="fr-leg-col"><b>Order description</b><span>Transport details</span></div>
            <div class="fr-leg-col fr-leg-last">
                <b>Change mins, Work &amp; Cal days</b>
                <span>Eff% Plan, Strip, Order, Result</span>
            </div>
        </div>

        </div><!-- /fr-boardarea -->

        <!-- Orders list: single unified table — projected (mr_order_entry) + confirm (mr_purchase_order) -->
        <div v-if="ordersOpen && !ordersMin" class="cal-overlay" @click.self="ordersOpen = false">
            <div class="cal-dialog od-dialog">
                <div class="cal-title">
                    All Orders
                    <span style="font-size:12px;color:#888;font-weight:400;margin-left:10px;">
                        {{ filteredErpOrders.length }} / {{ erpAllOrders.length }}
                        <span v-if="erpAllLoading"> · ⏳ loading…</span>
                    </span>
                    <span class="cal-title-btns">
                        <span class="cal-x cal-minbtn" @click="ordersMin = true">—</span>
                        <span class="cal-x" @click="ordersOpen = false">✕</span>
                    </span>
                </div>

                <!-- Global search bar + actions -->
                <div class="od-gsearch-bar">
                    <input
                        v-model="ordersGlobalSearch"
                        class="od-gsearch"
                        type="text"
                        placeholder="🔍  Search orders — MBM order, buyer, style, PO, color…"
                        @keydown.escape="clearOrderFilters"
                    >
                    <span v-if="ordersGlobalSearch || ORDER_COLS.some(k => orderFilters[k])" class="od-gsearch-clear" @click="clearOrderFilters">✕</span>
                    <span v-if="boardReadOnly" class="od-readonly-tag" :title="`${boardLockHolder?.name || boardLockHolder?.username || ''} is editing — save disabled`">🔒 Save disabled</span>
                    <button v-if="markedComplete.size" class="od-done-btn" :disabled="markSaving"
                        @click="saveMarkedComplete"
                    >{{ markSaving ? '⏳ Saving…' : `✔ Complete (${markedComplete.size})` }}</button>
                    <button class="od-xls-btn" :disabled="!filteredErpOrders.length" @click="exportOrdersExcel">📊 Excel</button>
                    <button
                        class="od-reload-btn"
                        :disabled="erpAllLoading"
                        title="সব filter reset + list refresh"
                        @click="reloadOrdersList"
                    >{{ erpAllLoading ? '⏳' : '⟳' }}</button>
                </div>

                <!-- Summary of the filtered rows — tiles are quick actions -->
                <div class="od-sum-bar">
                    <span class="od-sum-tile"><b>{{ fmtQty(ordersSummary.rows) }}</b> rows</span>
                    <span class="od-sum-tile od-sum-proj od-sum-click" title="Show only projected orders"
                        @click="tileAction('projected')"><b>{{ fmtQty(ordersSummary.proj) }}</b> projected</span>
                    <span class="od-sum-tile od-sum-conf od-sum-click" title="Show only confirm orders"
                        @click="tileAction('confirm')"><b>{{ fmtQty(ordersSummary.conf) }}</b> confirm</span>
                    <span class="od-sum-tile od-sum-click" title="Planned quantity — click to show only planned rows"
                        @click="tileAction('planned')">Planned <b>{{ fmtQty(ordersSummary.plannedQty) }}</b></span>
                    <span class="od-sum-tile od-sum-unpl od-sum-click" title="Unplanned quantity — click to show only unplanned rows"
                        @click="tileAction('unplanned')">Unplanned <b>{{ fmtQty(ordersSummary.unplannedQty) }}</b></span>
                    <span class="od-sum-tile od-sum-qty od-sum-click" title="Sort by Order Qty"
                        @click="tileAction('orderQty')">Order Qty <b>{{ fmtQty(ordersSummary.orderQty) }}</b></span>
                    <span class="od-sum-tile od-sum-qty od-sum-click" title="Sort by PO Qty"
                        @click="tileAction('poQty')">PO Qty <b>{{ fmtQty(ordersSummary.poQty) }}</b></span>
                    <span class="od-sum-tile od-sum-recent od-sum-click" :class="{ 'od-sum-on' : ordersRecentFilter === 'today' }"
                        title="Orders created today — click to filter the list"
                        @click="tileAction('today')">Today <b>{{ fmtQty(ordersSummary.todayQty) }}</b></span>
                    <span class="od-sum-tile od-sum-recent od-sum-click" :class="{ 'od-sum-on' : ordersRecentFilter === 'last3' }"
                        title="Orders created in the last 3 days — click to filter the list"
                        @click="tileAction('last3')">Last 3d <b>{{ fmtQty(ordersSummary.last3Qty) }}</b></span>
                </div>

                <!-- Unified orders table -->
                <div class="st-body od-body" @mouseover="odBodyOver" @mousemove="odBodyMove" @mouseleave="odBodyLeave">
                    <table class="st-table od-table">
                        <thead>
                            <tr>
                                <th v-for="k in ORDER_COLS" :key="k"
                                    :class="['od-c-' + k, { 'od-num' : k === 'qty' || k === 'orderQty', 'od-sortable' : k !== 'done', 'od-sorted' : orderSort.key === k }]"
                                    :title="k === 'done' ? '' : 'Click to sort (asc → desc → off)'"
                                    @click="k !== 'done' && toggleOrderSort(k)"
                                >
                                    <input v-if="k === 'done'" type="checkbox" class="od-done-box"
                                        :checked="allComplChecked"
                                        :disabled="!checkableFilteredOrders.length"
                                        title="Check ALL projected orders in the current filter"
                                        @click.stop="toggleMarkAll"
                                    >
                                    <template v-else>
                                        {{ ORDER_COL_LABELS[k] }}
                                        <span class="od-sort-btns">
                                            <span class="od-sort-b" :class="{ 'od-sort-on' : orderSort.key === k && orderSort.dir === 1 }"
                                                title="Sort ascending"
                                                @click.stop="orderSort = { key : k, dir : 1 }">▲</span>
                                            <span class="od-sort-b" :class="{ 'od-sort-on' : orderSort.key === k && orderSort.dir === -1 }"
                                                title="Sort descending"
                                                @click.stop="orderSort = { key : k, dir : -1 }">▼</span>
                                        </span>
                                    </template>
                                    <div v-if="k === 'orderQty'" class="od-th-sum">Σ {{ fmtQty(ordersSummary.orderQty) }}</div>
                                    <div v-else-if="k === 'qty'" class="od-th-sum">Σ {{ fmtQty(ordersSummary.poQty) }}</div>
                                </th>
                            </tr>
                            <tr class="od-filterrow">
                                <th v-for="k in ORDER_COLS" :key="k" :class="'od-c-' + k">
                                    <input v-model="orderFilters[k]" class="od-filter" type="text" placeholder="🔍"
                                        :title="k === 'orderQty' || k === 'qty'
                                            ? 'Qty query: >1000  <500  >=1  <=1  =1500  (or plain text)'
                                            : (['pcd','orderDelivery','poDelivery','start','end'].includes(k)
                                                ? 'Date query: >01-09-26  <=15-SEP-26  =2026-09-01  (or plain text)'
                                                : '')"
                                    >
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="row in filteredErpOrders" :key="row.id">
                                <tr
                                    class="od-row"
                                    :class="{
                                        'od-row-projected' : row.orderType === 'projected',
                                        'od-row-planned'   : row.status === 'fully_planned' || row.planned,
                                        'od-row-noconfirm' : row.orderType === 'projected' && row.confirmArrived === false && !(row.replaced || row.status === 'replaced'),
                                        'od-row-replaced'  : row.replaced || row.status === 'replaced',
                                        'od-row-partial'   : !!projPartialInfo(row),
                                        'od-row-completed' : row.status === 'completed'
                                    }"
                                    :data-note="projPartialInfo(row)
                                        ? `Partial: confirm POs cover ${fmtQty(projPartialInfo(row).confQty)} of ${fmtQty(projPartialInfo(row).orderQty)} pcs (${fmtQty(projPartialInfo(row).diff)} not confirmed)`
                                        : (row.splitReason || row.validationNotes || row.boardNote || (row.planned ? 'Planned — click to highlight on board' : (row.orderType === 'projected' ? 'Projected - included in initial capacity planning.' : 'Confirm - visible for reconciliation but not included in the initial plan.')))"
                                    @click="!windowSelectionActive() && showOrderOnBoard(row)"
                                >
                                    <td v-for="k in ORDER_COLS" :key="k"
                                        :class="['od-c-' + k, { 'od-num' : k === 'qty' || k === 'orderQty', 'st-user' : k === 'po' }]"
                                        :data-full="['done','orderType','status','deliveryStatus','grouping'].includes(k) ? null : (orderCellText(row, k) || null)"
                                    >
                                        <input v-if="k === 'done' && row.orderType === 'projected' && row.status !== 'completed'"
                                            type="checkbox"
                                            class="od-done-box"
                                            :checked="markedComplete.has(row.mbmOrder)"
                                            @click.stop="toggleMarkComplete(row)"
                                        >
                                        <span v-else-if="k === 'done' && row.status === 'completed'" class="od-done-mark">✔</span>
                                        <span v-else-if="k === 'orderType'" class="od-status"
                                            :class="row.orderType === 'confirm' ? 'od-ord-confirm' : 'od-ord-proj'"
                                        >{{ row.orderType === 'confirm' ? 'confirm' : 'projected' }}</span>
                                        <span v-else-if="k === 'status'" class="od-status" :class="`od-${row.status}`"
                                        >{{ row.replaced || row.status === 'replaced' ? 'replaced' : row.status }}</span>
                                        <span v-else-if="k === 'deliveryStatus' && projPartialInfo(row)"
                                            class="od-status od-ds-partial"
                                        >Partial</span>
                                        <span v-else-if="k === 'deliveryStatus' && row.deliveryStatus" class="od-status"
                                            :class="'od-ds-' + row.deliveryStatus.toLowerCase().replace(/\s+/g,'-')"
                                        >{{ row.deliveryStatus }}</span>
                                        <span v-else-if="k === 'grouping' && row.orderType === 'confirm' && row.groupingStatus !== 'not_applicable'"
                                            class="od-status" :class="'od-gs-' + row.groupingStatus"
                                            :title="row.splitReason || ''"
                                        >{{ row.groupingStatus }}</span>
                                        <template v-else-if="k === 'po' && row.poCount > 1">
                                            <span class="od-expand" @click.stop="toggleGroupExpand(row)"
                                            >{{ expandedGroups.has(row.id) ? '▼' : '▶' }} [{{ row.poCount }} POs]</span>
                                            {{ row.po }}
                                        </template>
                                        <span v-else-if="k === 'color' && row.garmentColor" class="od-color"
                                            :class="'od-color-' + (row.garmentColor||'').toLowerCase().replace(/\s+/g,'-')"
                                        >{{ row.garmentColor }}</span>
                                        <template v-else>{{ orderCellText(row, k) || '—' }}</template>
                                    </td>
                                </tr>
                                <tr v-for="pd in (expandedGroups.has(row.id) ? row.poDetails : [])"
                                    :key="row.id + '::' + pd.po" class="od-subrow"
                                >
                                    <td :colspan="ORDER_COLS.indexOf('po')"></td>
                                    <td class="st-user">↳ {{ pd.po }}</td>
                                    <td></td>
                                    <td class="od-num">{{ fmtQty(pd.qty) }}</td>
                                    <td>{{ pd.delivery ? fmtDateDdMonRr(pd.delivery) : '—' }}</td>
                                    <td>{{ pd.planned ? 'planned' : 'unplanned' }}</td>
                                    <td>{{ pd.line || '—' }}</td>
                                    <td>{{ pd.start ? fmtDate(new Date(pd.start)) : '—' }}</td>
                                    <td>{{ pd.end ? fmtDate(new Date(pd.end)) : '—' }}</td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                    <div class="st-hint od-hintrow">
                        <span>Projected = mr_order_entry · Confirm = mr_purchase_order · Click any row to highlight on board</span>
                        <button class="cal-btn st-btn od-clear" @click="clearOrderFilters">✕ Clear filters</button>
                    </div>
                </div>
                <!-- Instant hover tooltip: full cell value / row note -->
                <div v-if="odTip.show" class="od-hovertip"
                    :style="{ left : odTip.x + 'px', top : odTip.y + 'px' }"
                >{{ odTip.text }}</div>
            </div>
        </div>

        <!-- Day Plan Report: board orders by line with daily planned qty -->
        <div v-if="dpOpen && !dpMin" class="cal-overlay" @click.self="dpOpen = false">
            <div class="cal-dialog od-dialog dp-dialog">
                <div class="cal-title">
                    {{ dpReportTitle }}
                    <span class="cal-title-btns">
                        <span class="cal-x cal-minbtn" @click="dpMin = true">—</span>
                        <span class="cal-x" @click="dpOpen = false">✕</span>
                    </span>
                </div>
                <div class="dp-toolbar">
                    <label v-if="dpScope !== 'board'" class="dp-range">From
                        <input v-model="dpFrom" class="cal-in dp-date" type="date">
                    </label>
                    <label v-if="dpScope !== 'board'" class="dp-range">To
                        <input v-model="dpTo" class="cal-in dp-date" type="date">
                    </label>
                    <span v-if="dpScope === 'board'" class="dp-range">Whole board — every line + Holding Row, as placed</span>
                    <button class="dp-act dp-act-gen" @click="generateDayPlan">⚙ Generate</button>
                    <button class="dp-act dp-act-xls" :disabled="!dpGenerated" @click="exportDayPlanExcel">📊 Excel</button>
                    <button class="dp-act dp-act-pdf" :disabled="!dpGenerated" @click="exportDayPlanPdf">📄 PDF</button>
                    <button class="dp-act dp-act-view" :disabled="!dpGenerated" :class="{ 'dp-act-on' : dpView === 'summary' }"
                        @click="dpView = dpView === 'summary' ? 'report' : 'summary'">Σ Summary</button>
                    <button class="dp-act dp-act-view" :disabled="!dpGenerated" :class="{ 'dp-act-on' : dpView === 'floors' }"
                        @click="dpView = dpView === 'floors' ? 'report' : 'floors'">🏭 Floor Target</button>
                    <button class="dp-act dp-act-view" :disabled="!dpGenerated" :class="{ 'dp-act-on' : dpView === 'hours' }"
                        @click="dpView = dpView === 'hours' ? 'report' : 'hours'">🕐 Plan Hours</button>
                    <span class="dp-flex"></span>
                    <button class="dp-act dp-act-close" @click="dpOpen = false">✕ Close</button>
                </div>
                <div class="st-body od-body dp-body">
                    <template v-if="dpGenerated">
                        <div class="dp-rephead">
                            <div class="dp-rep-unit">{{ dpUnitName }}</div>
                            <div class="dp-rep-title">{{ dpReportTitle }}</div>
                            <div class="dp-rep-range">{{ dpRangeLabel }} <span class="dp-rep-dim">· Generated {{ dpGeneratedAt }}</span></div>
                        </div>
                        <div class="dp-cards">
                            <div class="dp-card"><b>{{ dpGrand.orders }}</b><span>Orders</span></div>
                            <div class="dp-card"><b>{{ dpGrand.lines }}</b><span>Lines</span></div>
                            <div class="dp-card"><b>{{ fmtQty(dpGrand.planQty) }}</b><span>Plan Qty</span></div>
                            <div class="dp-card"><b>{{ fmtQty(dpGrand.rangeQty) }}</b><span>Qty in range</span></div>
                            <div class="dp-card"><b>{{ dpGrand.totalCm.toFixed(2) }}</b><span>Total CM</span></div>
                            <div class="dp-card dp-card-eff"><b>{{ dpGrand.avgEff }}%</b><span>Avg Eff</span></div>
                        </div>
                        <!-- Summary view: factory-style plan summary + buyer-wise + per-floor -->
                        <template v-if="dpView === 'summary'">
                            <div class="dps-wrap">
                                <table class="st-table dp-table dps-kv" style="width:340px;flex:0 0 auto">
                                    <thead><tr><th colspan="2">Summary — {{ dpRangeLabel }}</th></tr></thead>
                                    <tbody>
                                        <tr><td>Plan Qty in pcs</td><td class="od-num"><b>{{ fmtQty(dpSummary.planQty) }}</b></td></tr>
                                        <tr><td>Plan SAH</td><td class="od-num"><b>{{ fmtQty(dpSummary.sah) }}</b></td></tr>
                                        <tr><td>Avg. SMV</td><td class="od-num">{{ dpSummary.avgSmv }}</td></tr>
                                        <tr><td>Plan Efficiency</td><td class="od-num">{{ dpSummary.eff }}%</td></tr>
                                        <tr><td>Plan Working Hrs</td><td class="od-num">{{ dpSummary.workHrs }}</td></tr>
                                        <tr><td>No of {{ dpMode === 'month' ? 'Months' : 'Days' }}</td><td class="od-num">{{ dpSummary.days }}</td></tr>
                                        <tr><td>No of lines planned</td><td class="od-num">{{ dpSummary.lines }}</td></tr>
                                        <tr><td>Man power</td><td class="od-num">{{ fmtQty(dpSummary.manpower) }}</td></tr>
                                        <tr><td>CM Plan (Pre-costing)</td><td class="od-num">$ {{ fmtQty(Math.round(dpSummary.cm)) }}</td></tr>
                                    </tbody>
                                </table>
                                <table class="st-table dp-table dps-buyers" style="width:300px;flex:0 0 auto">
                                    <thead>
                                        <tr><th colspan="2">BUYER WISE PLAN QTY</th></tr>
                                        <tr><th>Buyer</th><th class="od-num">Plan Qty</th></tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="b in dpSummary.buyers" :key="b.buyer">
                                            <td>{{ b.buyer }}</td><td class="od-num">{{ fmtQty(b.qty) }}</td>
                                        </tr>
                                        <tr class="dp-grand"><td>Total</td><td class="od-num">{{ fmtQty(dpSummary.planQty) }}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <table v-if="dpSummary.floors.length" class="st-table dp-table dps-floors">
                                <thead>
                                    <tr><th></th><th v-for="f in dpSummary.floors" :key="f.floor" class="od-num">{{ f.floor }}</th><th class="od-num">Total</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>Plan Qty.</td><td v-for="f in dpSummary.floors" :key="'q'+f.floor" class="od-num">{{ fmtQty(f.planQty) }}</td><td class="od-num"><b>{{ fmtQty(dpSummary.planQty) }}</b></td></tr>
                                    <tr><td>Plan SAH</td><td v-for="f in dpSummary.floors" :key="'s'+f.floor" class="od-num">{{ fmtQty(f.sah) }}</td><td class="od-num"><b>{{ fmtQty(dpSummary.sah) }}</b></td></tr>
                                    <tr><td>Plan Efficiency</td><td v-for="f in dpSummary.floors" :key="'e'+f.floor" class="od-num">{{ f.eff }}%</td><td class="od-num">{{ dpSummary.eff }}%</td></tr>
                                    <tr><td>Avg SMV/Floor</td><td v-for="f in dpSummary.floors" :key="'m'+f.floor" class="od-num">{{ f.avgSmv }}</td><td class="od-num">{{ dpSummary.avgSmv }}</td></tr>
                                    <tr><td>Plan Lines</td><td v-for="f in dpSummary.floors" :key="'l'+f.floor" class="od-num">{{ f.lines }}</td><td class="od-num">{{ dpSummary.lines }}</td></tr>
                                    <tr><td>Manpower</td><td v-for="f in dpSummary.floors" :key="'p'+f.floor" class="od-num">{{ fmtQty(f.manpower) }}</td><td class="od-num">{{ fmtQty(dpSummary.manpower) }}</td></tr>
                                    <tr><td>CM Plan (Pre-costing)</td><td v-for="f in dpSummary.floors" :key="'c'+f.floor" class="od-num">$ {{ fmtQty(Math.round(f.cm)) }}</td><td class="od-num"><b>$ {{ fmtQty(Math.round(dpSummary.cm)) }}</b></td></tr>
                                </tbody>
                            </table>
                        </template>

                        <!-- Plan Hours view: line × day working-hours matrix -->
                        <table v-else-if="dpView === 'hours'" class="st-table dp-table">
                            <thead>
                                <tr>
                                    <th>Factory</th><th>Line</th><th class="od-num">Man Power</th>
                                    <th v-for="d in dpDates" :key="dpDayKey(d)" class="od-num dp-dayh dp-day-click"
                                        title="Click: Day Plan report for this day" @click="dpPickDay(d)">{{ dpColLabel(d) }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="r in dpHoursMatrix.rows" :key="r.line">
                                    <td>{{ r.floor }}</td>
                                    <td>{{ r.line }}</td>
                                    <td class="od-num">{{ r.manpower }}</td>
                                    <td v-for="d in dpDates" :key="r.line + dpDayKey(d)" class="od-num">{{ r.days[dpColKey(d)] ?? '-' }}</td>
                                </tr>
                                <tr class="dp-grand">
                                    <td>Avg</td><td></td>
                                    <td class="od-num">{{ fmtQty(dpHoursMatrix.manpower) }}</td>
                                    <td v-for="d in dpDates" :key="'ha'+dpDayKey(d)" class="od-num">{{ dpHoursMatrix.avg[dpColKey(d)] ?? '-' }}</td>
                                </tr>
                            </tbody>
                        </table>

                        <!-- Floor Target view: floor × day quantity matrix -->
                        <table v-else-if="dpView === 'floors'" class="st-table dp-table">
                            <thead>
                                <tr>
                                    <th>Factory</th>
                                    <th v-for="d in dpDates" :key="dpDayKey(d)" class="od-num dp-dayh dp-day-click"
                                        title="Click: Day Plan report for this day" @click="dpPickDay(d)">{{ dpColLabel(d) }}</th>
                                    <th class="od-num">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="f in dpFloorMatrix.rows" :key="f.floor">
                                    <td>{{ f.floor }}</td>
                                    <td v-for="d in dpDates" :key="f.floor + dpDayKey(d)" class="od-num">{{ dpDayVal(f.days, d) }}</td>
                                    <td class="od-num"><b>{{ fmtQty(f.total) }}</b></td>
                                </tr>
                                <tr class="dp-grand">
                                    <td>Total</td>
                                    <td v-for="d in dpDates" :key="'ft'+dpDayKey(d)" class="od-num">{{ dpDayVal(dpFloorMatrix.grand.days, d) }}</td>
                                    <td class="od-num">{{ fmtQty(dpFloorMatrix.grand.total) }}</td>
                                </tr>
                            </tbody>
                        </table>

                        <table v-else class="st-table dp-table">
                        <thead>
                            <tr>
                                <th v-for="c in DP_META" :key="c.k" :class="{ 'od-num' : c.num }">{{ c.label }}</th>
                                <th v-for="d in dpDates" :key="dpDayKey(d)" class="od-num dp-dayh">{{ dpColLabel(d) }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="g in dpGroups" :key="g.lineId">
                                <tr v-for="(r, i) in g.rows" :key="g.lineId + '-' + i">
                                    <td v-for="c in DP_META" :key="c.k" :class="{ 'od-num' : c.num }">{{ dpCell(r, c) }}</td>
                                    <td v-for="d in dpDates" :key="dpDayKey(d)" class="od-num">{{ dpDayVal(r.days, d) }}</td>
                                </tr>
                                <tr class="dp-total" :class="{ 'dp-total-open' : dpMode === 'day' }">
                                    <td>{{ g.floor }}</td>
                                    <td>{{ g.line }} Total</td>
                                    <td colspan="13"></td>
                                    <td class="od-num">{{ fmtQty(g.totals.poQty) }}</td>
                                    <td class="od-num">{{ fmtQty(g.totals.planQty) }}</td>
                                    <td class="od-num">{{ fmtQty(g.totals.allocQty) }}</td>
                                    <td></td>
                                    <td class="od-num">{{ g.totals.totalCm.toFixed(2) }}</td>
                                    <td colspan="3"></td>
                                    <td class="od-num">{{ fmtQty(g.totals.manpower) }}</td>
                                    <td class="od-num">{{ g.totals.avgEff }}</td>
                                    <td></td>
                                    <td v-for="d in dpDates" :key="'t-' + dpDayKey(d)" class="od-num">{{ dpDayVal(g.totals.days, d) }}</td>
                                </tr>
                                <!-- FastReact line summary: date-wise 'Eff / Hour' in ONE row,
                                     enclosed with the Total row inside the black band -->
                                <tr v-if="dpMode === 'day'" class="dp-effhour">
                                    <td></td>
                                    <td class="dp-subh">Eff / Hour :</td>
                                    <td :colspan="DP_META.length - 2"></td>
                                    <td v-for="d in dpDates" :key="'eh-' + dpDayKey(d)" class="od-num">{{ dpLineDayEffHour(g, d) }}</td>
                                </tr>
                            </template>
                            <tr v-if="dpGroups.length" class="dp-grand">
                                <td>{{ dpUnitName }}</td>
                                <td>All lines</td>
                                <td colspan="13"></td>
                                <td class="od-num">{{ fmtQty(dpGrand.poQty) }}</td>
                                <td class="od-num">{{ fmtQty(dpGrand.planQty) }}</td>
                                <td class="od-num">{{ fmtQty(dpGrand.allocQty) }}</td>
                                <td></td>
                                <td class="od-num">{{ dpGrand.totalCm.toFixed(2) }}</td>
                                <td colspan="3"></td>
                                <td class="od-num">{{ fmtQty(dpGrand.manpower) }}</td>
                                <td class="od-num">{{ dpGrand.avgEff }}</td>
                                <td>Day total</td>
                                <td v-for="d in dpDates" :key="'g-' + dpDayKey(d)" class="od-num">{{ dpDayVal(dpGrand.days, d) }}</td>
                            </tr>
                            <tr v-if="!dpGroups.length">
                                <td :colspan="DP_META.length + dpDates.length" class="dp-empty">No planned sewing orders in this date range</td>
                            </tr>
                        </tbody>
                        </table>
                    </template>
                    <div v-else class="st-hint dp-hint">Select a date range and click Generate — data comes from the planning board</div>
                </div>
            </div>
        </div>

        <!-- Daily production update: line-wise actual output for a date -->
        <div v-if="puOpen && !puMin" class="cal-overlay" @click.self="puOpen = false">
            <div class="cal-dialog od-dialog pu-dialog">
                <div class="cal-title">
                    Daily production update — day_production_update_plan
                    <span class="cal-title-btns">
                        <span class="cal-x cal-minbtn" @click="puMin = true">—</span>
                        <span class="cal-x" @click="puOpen = false">✕</span>
                    </span>
                </div>
                <div class="dp-toolbar">
                    <label class="dp-range">Save date
                        <input v-model="puDate" class="cal-in dp-date" type="date">
                    </label>
                    <button class="dp-act dp-act-gen" @click="buildPuRows">⟳ Load</button>
                    <button class="dp-act dp-act-xls" :disabled="!puRows.length" @click="saveProdUpdate">💾 Save</button>
                    <span class="dp-flex"></span>
                    <button class="dp-act dp-act-close" @click="puOpen = false">✕ Close</button>
                </div>
                <div class="st-body od-body dp-body">
                    <table v-if="puRows.length" class="st-table dp-table">
                        <thead>
                            <tr>
                                <th>Unit</th><th>Floor</th><th>Line</th><th>Operation type</th>
                                <th>Style</th><th>Order</th><th>PO</th><th>Color</th>
                                <th class="od-num">Order Qty</th>
                                <th class="od-num">Day Plan Qty</th>
                                <th class="od-num">Made so far</th>
                                <th class="od-num">Remaining</th>
                                <th class="od-num">Prod Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="r in puRows" :key="r.evId">
                                <td>{{ r.unit }}</td>
                                <td>{{ r.floor }}</td>
                                <td>{{ r.line }}</td>
                                <td>{{ r.opType }}</td>
                                <td>{{ r.style }}</td>
                                <td class="st-user">{{ r.order }}</td>
                                <td>{{ r.po }}</td>
                                <td>{{ r.color }}</td>
                                <td class="od-num">{{ fmtQty(r.orderQty) }}</td>
                                <td class="od-num">{{ fmtQty(r.planQty) }}</td>
                                <td class="od-num">{{ fmtQty(r.made) }}</td>
                                <td class="od-num pu-rest">{{ fmtQty(r.rest) }}</td>
                                <td class="od-num">
                                    <input v-model="r.prodQty" class="cal-in pu-in" type="number" min="0" placeholder="0">
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div v-else class="st-hint dp-hint">এই তারিখে কোনো strip planned নেই — Save date বদলে ⟳ Load চাপুন</div>
                </div>
            </div>
        </div>

        <!-- Efficiency profiles (Setup): line-wise product type efficiency -->
        <div v-if="effOpen && !effMin" class="cal-overlay" @click.self="effOpen = false">
            <div class="cal-dialog ef-dialog">
                <div class="cal-title">
                    Efficiency profiles
                    <span class="cal-title-btns">
                        <span class="cal-x cal-minbtn" @click="effMin = true">—</span>
                        <span class="cal-x" @click="effOpen = false">✕</span>
                    </span>
                </div>
                <div class="cal-tabs">
                    <span class="cal-tab" :class="{ 'cal-tab-active' : effTab === 'define' }" @click="effTab = 'define'">📊 Define</span>
                    <span class="cal-tab" :class="{ 'cal-tab-active' : effTab === 'types' }" @click="effTab = 'types'">▦ Product types</span>
                    <span class="cal-tab" :class="{ 'cal-tab-active' : effTab === 'lines' }" @click="effTab = 'lines'">🏭 Lines</span>
                    <span class="cal-tab" @click="effOpen = false">❌ Close</span>
                </div>

                <!-- Define tab: profile names, Insert / Delete (FastReact) -->
                <div v-if="effTab === 'define'" class="st-body">
                    <div class="cal-label">Efficiency profile name</div>
                    <input v-model="effNameInput" class="cal-name ef-name" placeholder="e.g. MBM Line 01+02">
                    <div class="cal-list ef-list">
                        <div
                            v-for="p in effList"
                            :key="p.id"
                            :class="{ 'cal-sel' : p.id === effSelectedProfileId }"
                            @click="selectEffProfile(p)"
                        >{{ p.name }}</div>
                        <div v-if="!effList.length" class="fr-dd-dim">No profiles — type a name and Insert</div>
                    </div>
                    <div class="st-actions">
                        <button class="cal-btn st-btn" :disabled="!effNameInput.trim()" @click="effInsert">💾 Insert</button>
                        <button class="cal-btn st-btn" :disabled="!selProfile" @click="effDelete">✖ Delete</button>
                    </div>
                    <div class="st-hint">নতুন profile: নাম লিখে Insert · list থেকে বেছে Delete · efficiency মান দিতে Product types tab-এ যান</div>
                </div>

                <!-- Product types tab: the selected profile's efficiency grid -->
                <div v-else-if="effTab === 'types'" class="st-body">
                    <div class="ef-row">
                        <label>Select efficiency profile</label>
                        <select v-model="effSelectedProfileId" class="cal-in st-select">
                            <option v-for="p in effList" :key="p.id" :value="p.id">{{ p.name }}</option>
                        </select>
                    </div>
                    <div class="ef-row">
                        <label>Search</label>
                        <input v-model="effSearch" class="cal-in ef-search" placeholder="*">
                    </div>
                    <table v-if="selProfile" class="st-table ef-table">
                        <thead>
                            <tr>
                                <th class="ef-mark"></th>
                                <th class="ef-chip-h"></th>
                                <th>Product type</th>
                                <th class="od-num">Efficiency</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="(r, i) in effRows"
                                :key="r.name"
                                :class="{ 'ef-sel' : i === effSelected }"
                                @click="effSelected = i"
                            >
                                <td class="ef-mark">{{ i === effSelected ? '▶' : '' }}</td>
                                <td class="ef-chip-cell"><span class="ef-chip" :style="{ background : r.color }"></span></td>
                                <td :class="{ 'st-user' : r.name === '_Default' }">{{ r.name }}</td>
                                <td class="od-num">
                                    <input
                                        v-model.number="selProfile.values[r.name]"
                                        class="cal-in ef-in"
                                        type="number"
                                        min="0"
                                        max="200"
                                        :readonly="r.name === '_Default'"
                                        :title="r.name === '_Default' ? 'Line efficiency (planning_resources) — change in Setup → Line eff & hours' : ''"
                                    >
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="st-actions">
                        <button class="cal-btn cal-btn-primary st-btn" :disabled="!selProfile" @click="effUpdate">💾 Update</button>
                        <button class="cal-btn st-btn" :disabled="!selProfile" @click="effCopyDown">📋 Copy down</button>
                    </div>
                    <div class="st-hint">_Default = line efficiency (planning_resources.default_efficiency, read-only) — line capacity সবসময় এটাই ব্যবহার করে · line efficiency বদলাতে Setup → Line eff &amp; hours · এখানে শুধু product type efficiency দিন</div>
                </div>

                <!-- Lines tab: per-line top-3 product capability summary -->
                <div v-if="effTab === 'lines'" class="st-body ls-body">
                    <table class="st-table ls-table">
                        <thead>
                            <tr>
                                <th class="ls-line">Line</th>
                                <th class="ls-profile">Profile</th>
                                <th class="ls-can">Can do</th>
                                <th class="ls-top">Top 3 products (from plan board — by planned qty)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in lineEffSummary" :key="row.line.id">
                                <td class="ls-line"><strong>{{ row.line.name }}</strong></td>
                                <td class="ls-profile ls-dim">{{ row.profileName }}</td>
                                <td class="ls-can">
                                    <span class="ls-badge" :class="row.canDo > 0 ? 'ls-badge-ok' : 'ls-badge-none'">
                                        {{ row.canDo }}
                                    </span>
                                </td>
                                <td class="ls-top">
                                    <span v-if="!row.top3.length" class="ls-dim">— no data —</span>
                                    <span
                                        v-for="(t, i) in row.top3"
                                        :key="t.name"
                                        class="ls-pill"
                                        :title="t.qty ? `${t.name}: ${fmtQty(t.qty)} pcs planned · eff ${t.eff}%` : `${t.name}: ${t.eff}%`"
                                    >
                                        <span class="ls-dot" :style="{ background: t.color }"></span>
                                        <span class="ls-pname">{{ t.name }}</span>
                                        <span class="ls-peff">{{ t.eff }}%</span>
                                        <span v-if="t.qty" class="ls-pqty">{{ fmtQty(t.qty) }}</span>
                                        <span v-if="i === 0" class="ls-crown" :title="row.fromBoard ? 'Most planned on this line' : 'Highest'">👑</span>
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Line eff & hours (Setup): planning_resources efficiency + daily hours -->
        <div v-if="lineEffOpen" class="cal-overlay" @click.self="lineEffOpen = false">
            <div class="cal-dialog ef-dialog">
                <div class="cal-title">
                    Line eff &amp; hours
                    <span class="cal-title-btns">
                        <span class="cal-x" @click="lineEffOpen = false">✕</span>
                    </span>
                </div>
                <div class="st-body">
                    <table class="st-table">
                        <thead>
                            <tr>
                                <th>Line</th>
                                <th class="od-num">Manpower</th>
                                <th class="od-num">Efficiency %</th>
                                <th class="od-num">Hours / day</th>
                                <th class="od-num">Capacity min/day</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in lineEffRows" :key="row.dbId">
                                <td>{{ row.name }}</td>
                                <td><input v-model.number="row.manpower" type="number" min="1" max="1000" class="cal-in ef-in"></td>
                                <td><input v-model.number="row.eff" type="number" min="1" max="200" class="cal-in ef-in"></td>
                                <td><input v-model.number="row.hours" type="number" min="1" max="24" step="0.5" class="cal-in ef-in"></td>
                                <td class="od-num">{{ Math.round(row.manpower * (row.hours || 0) * 60 * (row.eff || 0) / 100).toLocaleString() }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="st-actions">
                        <button class="cal-btn st-btn" :disabled="lineEffSaving" @click="saveLineEffForm">💾 Update</button>
                        <button class="cal-btn st-btn" @click="lineEffOpen = false">Close</button>
                    </div>
                    <div class="st-hint">Line efficiency = planning_resources.default_efficiency — save করলে DB, board আর profile _Default একসাথে update হয় · hours/day দিয়ে daily capacity হিসাব হয়</div>
                </div>
            </div>
        </div>

        <!-- Plan Generator (SRS S2): feasibility + sequence options -->
        <div v-if="pgOpen && !pgMin" class="cal-overlay" @click.self="pgOpen = false">
            <div class="cal-dialog pg-dialog">
                <div class="cal-title">
                    Plan generator — order feasibility &amp; sequencing
                    <span class="cal-title-btns">
                        <span class="cal-x cal-minbtn" @click="pgMin = true">—</span>
                        <span class="cal-x" @click="pgOpen = false">✕</span>
                    </span>
                </div>
                <div class="cal-tabs">
                    <span class="cal-tab cal-tab-active">🧮 Generate</span>
                    <span class="cal-tab" @click="pgOpen = false">❌ Close</span>
                </div>
                <div class="st-body">
                    <div class="pg-inputs">
                        <div class="ef-row"><label>Order</label><input v-model="pgForm.orderNo" class="cal-in pg-in"></div>
                        <div class="ef-row"><label>Category</label><input v-model="pgForm.category" class="cal-in pg-in"></div>
                        <div class="ef-row"><label>Style type</label>
                            <select v-model="pgForm.styleType" class="cal-in st-select pg-in">
                                <option value="new">new</option>
                                <option value="repeat">repeat</option>
                            </select>
                        </div>
                        <div class="ef-row"><label>SMV (IE)</label><input v-model.number="pgForm.smv" type="number" step="0.1" class="cal-in pg-in"></div>
                        <div class="ef-row"><label>PCD</label><input v-model="pgForm.pcd" type="date" class="cal-in pg-in"></div>
                        <div class="ef-row"><label>Line free from</label><input v-model="pgForm.lineFree" type="date" class="cal-in pg-in"></div>
                    </div>
                    <table class="st-table pg-potable">
                        <thead><tr><th>PO</th><th>Delivery</th><th>Colour</th><th class="od-num">Qty</th></tr></thead>
                        <tbody>
                            <template v-for="p in pgForm.pos" :key="p.po">
                                <tr v-for="(c, ci) in p.colours" :key="p.po + c.colour">
                                    <td class="st-user">{{ ci === 0 ? p.po : '' }}</td>
                                    <td>{{ ci === 0 ? p.delivery : '' }}</td>
                                    <td>{{ c.colour }}</td>
                                    <td class="od-num"><input v-model.number="c.qty" type="number" class="cal-in ef-in"></td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                    <div class="st-actions">
                        <button class="cal-btn cal-btn-primary st-btn" @click="pgGenerate">🧮 Generate</button>
                    </div>

                    <template v-if="pgResult">
                        <div class="pg-summary">
                            <span>Total <b>{{ fmtQty(pgResult.totalQty) }}</b> pcs · <b>{{ pgResult.volume.cls }}</b> ({{ pgResult.volume.strategy }})</span>
                            <span>Earliest sew start <b>{{ fmtDate(pgResult.fwd.earliestSewStart) }}</b> · Actual <b>{{ fmtDate(pgResult.fwd.actualSewStart) }}</b></span>
                        </div>
                        <table class="st-table pg-potable">
                            <thead><tr><th>PO</th><th class="od-num">Qty</th><th class="od-num">Sew days</th><th>Latest sew end</th><th>Latest sew start</th><th class="od-num">Buffer</th><th>Verdict</th></tr></thead>
                            <tbody>
                                <tr v-for="r in pgResult.poRows" :key="r.po">
                                    <td class="st-user">{{ r.po }}</td>
                                    <td class="od-num">{{ fmtQty(r.qty) }}</td>
                                    <td class="od-num">{{ r.sewDays }}</td>
                                    <td>{{ fmtDate(r.back.latestSewEnd) }}</td>
                                    <td>{{ fmtDate(r.back.latestSewStart) }}</td>
                                    <td class="od-num"><b>{{ r.feas.bufferDays }}</b></td>
                                    <td><span class="pg-verdict" :class="pgVerdictCls(r.feas.verdict)">{{ r.feas.verdict }}</span></td>
                                </tr>
                            </tbody>
                        </table>
                        <div class="pg-options">
                            <div v-for="o in pgResult.options" :key="o.name" class="pg-card" :class="{ 'pg-card-rej' : o.rejected }">
                                <div class="pg-card-h">{{ o.name }}
                                    <span v-if="o.rejected" class="pg-verdict pg-v-red">REJECTED</span>
                                    <span v-else class="pg-verdict pg-v-good">FEASIBLE</span>
                                </div>
                                <div class="pg-card-seq">{{ o.sequence.join('  →  ') }}</div>
                                <div class="pg-card-meta">{{ o.blocks }} block(s) · {{ o.changeovers }} changeover(s)</div>
                                <div v-for="pb in o.poBuffers" :key="pb.po" class="pg-card-buf">
                                    {{ pb.po }}: ends {{ fmtDate(pb.endDate) }} · buffer <b>{{ pb.bufferDays }}</b> day(s)
                                </div>
                                <div v-if="o.rejected" class="pg-card-rejr">⛔ {{ o.rejectReason }}</div>
                                <button v-else class="cal-btn st-btn pg-commit" @click="pgCommit(o)">✔ Commit this sequence</button>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>

        <!-- Planned schedule dialog (Planned quantity, order units) -->
        <Teleport to="body">
        <div v-if="plOpen && !plMin && plRaw" class="cal-overlay" @click.self="plOpen = false">
            <div class="cal-dialog pl-dialog">
                <div class="cal-title">
                    Planned quantity, order units
                    <span class="cal-title-btns">
                        <span class="cal-x cal-minbtn" @click="plMin = true">—</span>
                        <span class="cal-x" @click="plOpen = false">✕</span>
                    </span>
                </div>
                <div class="cal-tabs">
                    <span class="cal-tab cal-tab-active">🗓 Production schedule</span>
                    <span class="cal-tab" @click="() => window.print?.()">🖶 Print</span>
                    <span class="cal-tab" @click="plOpen = false">❌ Close</span>
                </div>
                <div class="st-body pl-body">
                    <div class="pl-grid pl-info">
                        <label>Order</label><input class="cal-in pr-ro" :value="`${plRaw.buyer} :: ${plRaw.po}`" readonly>
                        <label>Product</label><input class="cal-in pr-ro" :value="plRaw.style" readonly>
                        <label>Customer</label><input class="cal-in pr-ro" :value="plRaw.buyer" readonly>
                        <label>Line</label><input class="cal-in pr-ro" :value="plLine?.name" readonly>
                        <label>This strip</label><input class="cal-in pr-ro" :value="`${fmtQty(plRaw.qty)}   (${plRaw.end ? fmtDate(plRaw.end) : '—'})`" readonly>
                        <label>All strips</label><input class="cal-in pr-ro" :value="`${fmtQty(plAllStrips.qty)} in ${plAllStrips.count} strip(s)`" readonly>
                        <label>Starting</label><input class="cal-in pr-ro" :value="`${fmtDate(plRaw.start)}  =>  ${plRaw.end ? fmtDate(plRaw.end) : '—'}`" readonly>
                        <label>Made</label><input class="cal-in pr-ro" :value="fmtQty(Math.round(plRaw.qty * plRaw.progress / 100))" readonly>
                        <label>Send by</label><input class="cal-in pr-ro" value="_Ex-Factory -> _Ex-fty" readonly>
                    </div>
                    <div class="pl-cols">
                        <div class="pl-left">
                            <fieldset class="pr-box">
                                <legend>Period</legend>
                                <div class="pl-period">
                                    <label><input v-model="plPeriod" type="radio" value="daily"> Daily</label>
                                    <label><input v-model="plPeriod" type="radio" value="weekly"> Weekly</label>
                                    <label><input v-model="plPeriod" type="radio" value="monthly"> Monthly</label>
                                </div>
                            </fieldset>
                            <div class="cal-list pl-schedlist">
                                <div>Preparation schedule (first operation in section)</div>
                                <div>Load into production schedule</div>
                                <div class="cal-sel">Out of production (strip schedule)</div>
                                <div>Complete schedule (final operation in section)</div>
                                <div>Despatch schedule (accumulate to transport days)</div>
                                <div>Availability at customer</div>
                            </div>
                        </div>
                        <div class="pl-right">
                        <table class="st-table pl-table">
                            <thead>
                                <tr>
                                    <th>Day</th>
                                    <th>Date</th>
                                    <th class="od-num">Quantity</th>
                                    <th class="od-num">cumulative</th>
                                    <th class="od-num">Efficiency</th>
                                    <th class="od-num">Hours</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(r, i) in plRows" :key="i" :class="{ 'pl-off' : r.eff === 0, 'pl-lc' : r.lcDay > 0 }">
                                    <td class="st-user">{{ r.day }}</td>
                                    <td>{{ r.date }}</td>
                                    <td class="od-num">{{ fmtQty(r.qty) }}</td>
                                    <td class="od-num">{{ fmtQty(r.cum) }}</td>
                                    <td class="od-num">
                                        {{ r.eff }}%
                                        <span v-if="r.lcDay" class="pl-lc-tag" :title="`Learning curve — day ${r.lcDay} of ${plRaw?.lc?.period || 3}`">LC D{{ r.lcDay }}</span>
                                    </td>
                                    <td class="od-num">{{ r.hours }}</td>
                                </tr>
                            </tbody>
                        </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </Teleport>

        <!-- Change working hours (FastReact dialog) -->
        <Teleport to="body">
        <div v-if="chOpen" class="cal-overlay" @click.self="chOpen = false">
            <div class="cal-dialog ch-dialog">
                <div class="cal-title">
                    Change working hours
                    <span class="cal-title-btns">
                        <span class="cal-x" @click="chOpen = false">✕</span>
                    </span>
                </div>
                <div class="cal-tabs">
                    <span class="cal-tab cal-tab-active">🕐 Working Hours</span>
                    <span class="cal-tab" @click="chOpen = false">❌ Close</span>
                </div>
                <div class="st-body ch-body">
                    <div class="ch-cols">
                        <div class="ch-col">
                            <div class="ch-head">Which days do you want to change</div>
                            <fieldset class="pr-box">
                                <legend>Select days</legend>
                                <div class="ch-dayrow ch-dayrow-h"><span></span><span>Normal hours</span></div>
                                <div v-for="wd in CH_DAY_ORDER" :key="wd" class="ch-dayrow">
                                    <label><input v-model="chDays[wd]" type="checkbox"> {{ DAY_NAMES[wd] }}</label>
                                    <input class="cal-in ch-nh" :value="chNormalHours(wd)" readonly>
                                </div>
                                <div class="ch-modes">
                                    <label><input v-model="chDayMode" type="radio" value="selected"> Selected days only</label>
                                    <label><input v-model="chDayMode" type="radio" value="normalOnly"> Normal working days only</label>
                                    <label><input v-model="chDayMode" type="radio" value="all"> All days of the week</label>
                                    <label><input v-model="chDayMode" type="radio" value="workingOnly"> Working days only</label>
                                </div>
                            </fieldset>
                        </div>
                        <div class="ch-col">
                            <div class="ch-head">How do you want to change these days</div>
                            <fieldset class="pr-box">
                                <legend>Reset working hours</legend>
                                <label class="ch-opt"><input v-model="chAction" type="radio" value="resetNormal"> Reset to normal hours</label>
                                <label class="ch-opt"><input v-model="chAction" type="radio" value="zero"> Set to zero working hours</label>
                            </fieldset>
                            <div class="ch-or">---- or ----</div>
                            <fieldset class="pr-box">
                                <legend>Change working hours</legend>
                                <label class="ch-opt"><input v-model="chAction" type="radio" value="setNew"> Change to new working hours</label>
                                <label class="ch-opt"><input v-model="chAction" type="radio" value="addTime"> Add time to existing hours</label>
                                <div class="ch-timerow">
                                    <label>Specify time (hh:mm)</label>
                                    <input
                                        v-model="chTime"
                                        class="cal-in ch-time"
                                        type="text"
                                        placeholder="11:00"
                                        :disabled="chAction !== 'setNew' && chAction !== 'addTime'"
                                    >
                                </div>
                            </fieldset>
                        </div>
                    </div>
                    <div class="ch-cols">
                        <fieldset class="pr-box ch-period">
                            <legend>Period to change</legend>
                            <div class="ch-timerow">
                                <label>Apply changes from</label>
                                <input v-model="chFrom" class="cal-in ch-date" type="date">
                                <label>to</label>
                                <input v-model="chTo" class="cal-in ch-date" type="date">
                            </div>
                        </fieldset>
                        <fieldset class="pr-box ch-target">
                            <legend>Apply changes to</legend>
                            <label class="ch-opt"><input type="radio" checked> {{ calendarState.name }}</label>
                        </fieldset>
                    </div>
                    <div class="ch-actions">
                        <button class="cal-btn cal-btn-primary st-btn ch-apply" @click="chApply">✔ Apply</button>
                        <span class="ch-note">these changes to calendar ⇒ <b>{{ calendarState.name }}</b></span>
                    </div>
                    <div class="st-hint">Zero hours = ওই তারিখ ছুটি (bar গুলো টপকে যাবে) · Add time = overtime · Reset = আবার সাপ্তাহিক নিয়মে · বিদ্যমান bar move/re-plan করলে নতুন hours ধরবে · Save করলে position স্থায়ী হয়</div>
                </div>
            </div>
        </div>
        </Teleport>

        <!-- Build up curve on one bar (right-click → Build up curve) -->
        <Teleport to="body">
        <div v-if="lcDlgOpen && lcDlgRaw" class="cal-overlay" @click.self="lcDlgOpen = false">
            <div class="cal-dialog lcd-dialog">
                <div class="cal-title">
                    Build up curve — {{ mbmOrderNo(lcDlgRaw.po, lcDlgRaw.mbmOrder) }}
                    <span class="cal-title-btns">
                        <span class="cal-x" @click="lcDlgOpen = false">✕</span>
                    </span>
                </div>
                <div class="st-body">
                    <div class="cal-label">এই bar-এ কোন curve চলবে</div>
                    <div class="cal-list lcd-list">
                        <div :class="{ 'cal-sel' : lcDlgSel === '' }" @click="lcDlgSel = ''">
                            — No manual curve (automatic product-change rule) —
                        </div>
                        <div
                            v-for="c in bcList"
                            :key="c.id"
                            :class="{ 'cal-sel' : lcDlgSel === c.id }"
                            @click="lcDlgSel = c.id"
                        >
                            📈 {{ c.name }} <span class="lcd-pcts">{{ c.pct.join('% → ') }}%</span>
                        </div>
                    </div>
                    <div class="st-actions">
                        <button class="cal-btn cal-btn-primary st-btn" @click="applyCurveDialog">✔ Apply</button>
                        <button class="cal-btn st-btn" @click="lcDlgOpen = false">Cancel</button>
                    </div>
                    <div class="st-hint">Manual curve দিলে এই bar Day 1 থেকে ramp করবে (product change লাগবে না), bar লম্বা হবে সেই অনুযায়ী · automatic নিয়মে ফিরতে "No manual curve" বেছে Apply · তারপর Save</div>
                </div>
            </div>
        </div>
        </Teleport>

        <!-- Strip / Order properties dialog -->
        <Teleport to="body">
        <div v-if="propsOpen && !propsMin && propsRaw" class="cal-overlay" @click.self="propsOpen = false">
            <div class="cal-dialog pr-dialog">
                <div class="cal-title">
                    Strip / Order properties
                    <span class="cal-title-btns">
                        <span class="cal-x cal-minbtn" @click="propsMin = true">—</span>
                        <span class="cal-x" @click="propsOpen = false">✕</span>
                    </span>
                </div>
                <div class="cal-tabs">
                    <span class="cal-tab cal-tab-active">🧭 Information</span>
                    <span class="cal-tab">▦ Section information</span>
                    <span class="cal-tab" @click="propsOpen = false">❌ Close</span>
                </div>
                <div class="st-body">
                    <fieldset class="pr-box">
                        <legend>Details</legend>
                        <div class="pr-grid">
                            <label>Order</label><input class="cal-in pr-ro" :value="`${propsRaw.buyer} :: ${propsRaw.po}`" readonly>
                            <label>Row name</label><input class="cal-in pr-ro" :value="propsLine?.name" readonly>
                            <label>Product</label><input class="cal-in pr-ro" :value="propsRaw.style" readonly>
                            <label>Section</label><input class="cal-in pr-ro" value="SEW" readonly>
                            <label>Customer</label><input class="cal-in pr-ro" :value="propsRaw.buyer" readonly>
                            <label>Group</label><input class="cal-in pr-ro" value="AQL" readonly>
                        </div>
                    </fieldset>
                    <div class="pr-cols">
                        <div class="pr-col">
                            <fieldset class="pr-box">
                                <legend>Properties</legend>
                                <div class="ef-row">
                                    <label>Strip efficiency</label>
                                    <input v-model.number="propsForm.stripEff" class="cal-in ef-in" type="number" min="1" max="500">
                                    <span class="pr-dim">(1 - 500)</span>
                                </div>
                                <label class="ef-assign-item pr-keep">
                                    <input v-model="propsForm.keepSeparate" type="checkbox">
                                    Keep separate from other strips
                                </label>
                            </fieldset>
                            <fieldset class="pr-box">
                                <legend>Work content and efficiency</legend>
                                <div class="pr-grid pr-grid2">
                                    <label>Route name</label><input class="cal-in pr-ro" :value="propsRouteName" readonly>
                                    <label>Work content</label><input class="cal-in pr-ro" :value="Number(propsRaw.smv).toFixed(3)" readonly>
                                    <label>Efficiency profile</label><input class="cal-in pr-ro" :value="propsProfile?.name || '—'" readonly>
                                    <label>Profile efficiency %</label>
                                    <input v-model.number="propsForm.profileEff" class="cal-in ef-in" type="number" min="1" max="200">
                                </div>
                            </fieldset>
                            <fieldset class="pr-box">
                                <legend>Capacity</legend>
                                <div class="pr-grid pr-grid2">
                                    <label>Quantity</label><input class="cal-in pr-ro" :value="fmtQty(propsRaw.qty)" readonly>
                                    <label>Quantity per week</label><input class="cal-in pr-ro" :value="propsQtyWeek" readonly>
                                </div>
                            </fieldset>
                        </div>
                        <div class="pr-col">
                            <fieldset class="pr-box pr-dates">
                                <legend>Key dates</legend>
                                <table class="pr-datetable">
                                    <tr v-for="[label, d] in propsKeyDates" :key="label">
                                        <td>{{ label }}</td>
                                        <td class="od-num">{{ d ? fmtDate(d) : '—' }}</td>
                                    </tr>
                                </table>
                            </fieldset>
                        </div>
                    </div>
                    <div class="st-actions pr-actions">
                        <button class="cal-btn cal-btn-primary st-btn" @click="propsUpdate">✔ Update</button>
                    </div>
                </div>
            </div>
        </div>
        </Teleport>

        <!-- Build up (learning) curves dialog -->
        <div v-if="bcOpen && !bcMin" class="cal-overlay" @click.self="bcOpen = false">
            <div class="cal-dialog bc-dialog">
                <div class="cal-title">
                    Build up curves
                    <span class="cal-title-btns">
                        <span class="cal-x cal-minbtn" @click="bcMin = true">—</span>
                        <span class="cal-x" @click="bcOpen = false">✕</span>
                    </span>
                </div>
                <div class="cal-tabs">
                    <span class="cal-tab" :class="{ 'cal-tab-active' : bcTab === 'define' }" @click="bcTab = 'define'">📈 Define</span>
                    <span class="cal-tab" :class="{ 'cal-tab-active' : bcTab === 'rename' }" @click="bcTab = 'rename'">🔤 Rename</span>
                    <span class="cal-tab" @click="bcOpen = false">❌ Close</span>
                </div>

                <!-- Define: period, name + list, day grid, chart -->
                <div v-if="bcTab === 'define'" class="st-body bc-body">
                    <div class="bc-left">
                        <div class="ef-row">
                            <label>Period (days)</label>
                            <input v-model.number="bcPeriod" class="cal-in ef-in" type="number" min="1" max="60">
                        </div>
                        <div class="cal-label">Build up name</div>
                        <input v-model="bcName" class="cal-name ef-name" placeholder="e.g. MBM 3 Days">
                        <div class="cal-list bc-list">
                            <div
                                v-for="c in bcList"
                                :key="c.id"
                                :class="{ 'cal-sel' : c.id === bcSelectedId }"
                                @click="selectBuildUp(c)"
                            >{{ c.name }}</div>
                        </div>
                        <div class="st-actions">
                            <button class="cal-btn st-btn" :disabled="!bcName.trim()" @click="bcUpdate">💾 Update</button>
                            <button class="cal-btn st-btn" :disabled="!bcSelectedId" @click="bcDelete">✖ Delete</button>
                        </div>
                    </div>
                    <div class="bc-mid">
                        <table class="st-table ef-table">
                            <thead>
                                <tr><th>Days</th><th class="od-num">%</th></tr>
                            </thead>
                            <tbody>
                                <tr v-for="(v, i) in bcPct" :key="i">
                                    <td class="st-user">{{ i + 1 }}</td>
                                    <td class="od-num">
                                        <input v-model.number="bcPct[i]" class="cal-in ef-in" type="number" min="0" max="100">
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="bc-right">
                        <div class="bc-chart-title">Build up percentage</div>
                        <svg class="bc-chart" viewBox="0 0 300 180">
                            <rect x="14" y="14" width="272" height="152" fill="#fff" stroke="#c9c5b8"/>
                            <line x1="14" y1="90" x2="286" y2="90" stroke="#e0ddd4"/>
                            <line x1="150" y1="14" x2="150" y2="166" stroke="#e0ddd4"/>
                            <polyline :points="bcChartPoints" fill="none" stroke="#1b52ad" stroke-width="2"/>
                            <circle
                                v-for="(p, i) in bcChartPoints.split(' ').filter(Boolean)"
                                :key="i"
                                :cx="p.split(',')[0]"
                                :cy="p.split(',')[1]"
                                r="3"
                                fill="#d40000"
                            />
                            <text x="6" y="170" font-size="9" fill="#555">0</text>
                            <text x="4" y="20" font-size="9" fill="#555">100</text>
                        </svg>
                        <div class="st-hint">Day-wise % = নতুন style ওঠার সময় line-এর expected efficiency build up</div>
                    </div>
                </div>

                <!-- Rename: pick a curve, type the new name -->
                <div v-else class="st-body bc-body">
                    <div class="bc-left">
                        <div class="cal-label">Select a curve to rename</div>
                        <div class="cal-list bc-list">
                            <div
                                v-for="c in bcList"
                                :key="c.id"
                                :class="{ 'cal-sel' : c.id === bcRenameSelId }"
                                @click="bcRenameSelId = c.id; bcRenameInput = ''"
                            >{{ c.name }}</div>
                        </div>
                    </div>
                    <div class="bc-mid bc-renamecol">
                        <input class="cal-name ef-name bc-ro" :value="bcRenameCur?.name || ''" readonly>
                        <input v-model="bcRenameInput" class="cal-name ef-name" placeholder="নতুন নাম লিখুন">
                        <button
                            class="cal-btn st-btn"
                            :disabled="!bcRenameCur || !bcRenameInput.trim()"
                            @click="bcRename"
                        >🔤 Rename</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Settings dialog: users, roles & board permissions -->
        <div v-if="settingsOpen && !settingsMin" class="cal-overlay" @click.self="settingsOpen = false">
            <div class="cal-dialog st-dialog">
                <div class="cal-title">
                    Settings — Users &amp; Board Permissions
                    <span class="cal-title-btns">
                        <span class="cal-x cal-minbtn" @click="settingsMin = true">—</span>
                        <span class="cal-x" @click="settingsOpen = false">✕</span>
                    </span>
                </div>
                <div class="st-body">
                    <div class="st-row st-current">
                        <label>Signed in:</label>
                        <b>{{ authUser?.name }} ({{ authUser?.username }}) · {{ authUser?.role }}</b>
                    </div>
                    <table class="st-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Username</th>
                                <th>Set password</th>
                                <th>Role</th>
                                <th v-for="b in boards" :key="b.id" class="st-board-h">{{ b.name }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="u in users" :key="u.id">
                                <td class="st-user">{{ u.name }}</td>
                                <td>{{ u.username || '—' }}</td>
                                <td>
                                    <input
                                        v-model="stPasswords[u.id]"
                                        class="cal-in st-pw"
                                        type="password"
                                        placeholder="(unchanged)"
                                        autocomplete="new-password"
                                    >
                                </td>
                                <td>
                                    <select v-model="u.role" class="cal-in st-select">
                                        <option v-for="r in planningRoles" :key="r" :value="r">{{ r }}</option>
                                    </select>
                                </td>
                                <td v-for="b in boards" :key="b.id" class="st-check">
                                    <input
                                        type="checkbox"
                                        :checked="u.boards.includes(b.id)"
                                        @change="toggleBoardPerm(u, b.id)"
                                    >
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="st-hint">Users ও passwords DB-র planning_users table-এ sync হয় (scrypt hash) — password ঘরে কিছু লিখে Save করলে সেটাই নতুন password · Management read-only (§17)</div>
                    <div class="st-actions">
                        <button class="cal-btn st-btn" @click="addUser">➕ Add user</button>
                        <button class="cal-btn cal-btn-primary st-btn" @click="saveSettings">💾 Save permissions</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Setup: planning role names + the rules the board uses to auto-plan -->
        <div v-if="rolesOpen && !rolesMin" class="cal-overlay" @click.self="rolesOpen = false">
            <div class="cal-dialog st-dialog pr-dialog">
                <div class="cal-title">
                    Planning roles &amp; default plan criteria
                    <span class="cal-title-btns">
                        <span class="cal-x cal-minbtn" @click="rolesMin = true">—</span>
                        <span class="cal-x" @click="rolesOpen = false">✕</span>
                    </span>
                </div>
                <div class="st-body pr-body">
                    <div class="pr-col">
                        <div class="pr-h">Planning role names</div>
                        <form class="pr-form" @submit.prevent="addPlanningRole">
                            <input
                                v-model="newRoleName"
                                class="cal-in pr-in"
                                type="text"
                                maxlength="40"
                                placeholder="Role name (e.g. Senior Planner)"
                            >
                            <button type="submit" class="cal-btn cal-btn-primary st-btn">Add role</button>
                        </form>
                        <ul class="pr-roles">
                            <li v-for="r in planningRoles" :key="r" class="pr-role">
                                <span>{{ r }}</span>
                                <button
                                    type="button"
                                    class="pr-del"
                                    title="Remove role"
                                    @click="removePlanningRole(r)"
                                >✕</button>
                            </li>
                        </ul>
                        <div class="st-hint">These names appear on the user Role list in Settings. A role in use cannot be removed.</div>
                    </div>
                    <div class="pr-col pr-col-wide">
                        <div class="pr-h">Default criteria used to plan orders on the board</div>
                        <ol class="pr-points">
                            <li v-for="(c, i) in PLAN_CRITERIA" :key="i">{{ c }}</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>

        <!-- Calendars dialog (FastReact style) -->
        <div v-if="calOpen && !calMin" class="cal-overlay" @click.self="calOpen = false">
            <div class="cal-dialog">
                <div class="cal-title">
                    Calendars
                    <span class="cal-title-btns">
                        <span class="cal-x cal-minbtn" @click="calMin = true">—</span>
                        <span class="cal-x" @click="calOpen = false">✕</span>
                    </span>
                </div>
                <div class="cal-tabs">
                    <span class="cal-tab cal-tab-active">📅 Define</span>
                    <span class="cal-tab">🔤 Rename / Copy</span>
                    <span class="cal-tab">📆 Holidays</span>
                    <span class="cal-tab">📄 Report</span>
                    <span class="cal-tab">📅 Special</span>
                    <span class="cal-tab" @click="calOpen = false">❌ Close</span>
                </div>
                <div class="cal-body">
                    <div class="cal-left">
                        <div class="cal-label">Calendar name</div>
                        <input v-model="calName" class="cal-name">
                        <div class="cal-list">
                            <div>24/7</div>
                            <div>Sew_AQL</div>
                            <div>Sew_CEIL</div>
                            <div class="cal-sel">{{ calName }}</div>
                        </div>
                        <button class="cal-btn cal-btn-primary" @click="updateCalendar">💾 Update</button>
                        <button class="cal-btn">❌ Delete</button>
                    </div>
                    <div class="cal-right">
                        <div class="cal-wh-tab">Working hours</div>
                        <div class="cal-grid">
                            <div class="cal-ghead"></div>
                            <div class="cal-ghead">Start time</div>
                            <div class="cal-ghead">Work hours</div>
                            <div class="cal-ghead">Quick Fix: Max. Add. Overtime</div>
                            <template v-for="r in calRows" :key="r.d">
                                <div class="cal-day">{{ r.label }}</div>
                                <input v-model="r.start" class="cal-in">
                                <input v-model="r.hours" class="cal-in" :class="{ 'cal-off' : r.hours === '00:00' }">
                                <input v-model="r.ot" class="cal-in">
                            </template>
                            <div class="cal-day cal-total-label">Total hours</div>
                            <div></div>
                            <input class="cal-in cal-ro" :value="totalHours()" readonly>
                            <div></div>
                        </div>
                        <div class="cal-shifts">Total hours split into shifts <input class="cal-in cal-ro" value="1" readonly></div>
                        <div class="cal-hint">Enter both start time and working hours as hh:mm — 00:00 work hours = off day</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bottom window taskbar: one icon per open window -->
        <div v-if="openWindows.length" class="fr-taskbar">
            <div
                v-for="w in openWindows"
                :key="w.id"
                class="fr-task"
                :class="{ 'fr-task-min' : w.min }"
                :title="w.min ? 'Click to restore' : 'Window is open'"
                @click="restoreWin(w.id)"
            >
                <span class="fr-task-ico">{{ w.icon }}</span>
                <span class="fr-task-t">{{ w.title }}</span>
                <span class="fr-task-x" title="Close window" @click.stop="closeWin(w.id)">✕</span>
            </div>
        </div>

        <!-- Toasts -->
        <div class="mb-toasts">
            <div v-for="t in toasts" :key="t.id" class="mb-toast" :class="`mb-toast-${t.type}`">{{ t.text }}</div>
        </div>
    </div>
</template>

<style>
@import '@bryntum/schedulerpro/svalbard-light.css';
@import '@bryntum/schedulerpro/fontawesome/css/fontawesome.css';
@import '@bryntum/schedulerpro/fontawesome/css/solid.css';

/* ------------------------------------------------------------------ */
/* App shell                                                          */
/* ------------------------------------------------------------------ */
html,
body {
    margin : 0;
    width  : 100%;
    height : 100%;
}

#app {
    display        : flex;
    flex-direction : column;
    height         : 100vh;
    width          : 100vw;
}

.fr-app {
    display        : flex;
    flex-direction : column;
    height         : 100%;
    width          : 100%;
    font-family    : Tahoma, 'Segoe UI', Verdana, sans-serif;
    font-size      : 11px;
    background     : #d6d2c9;
    user-select    : none;
}

.mb-main {
    display    : flex;
    flex       : 1 1 auto;
    min-height : 0;
}

.mb-sched-wrap {
    flex       : 1 1 auto;
    min-width  : 0;
    display    : flex;
    position   : relative;
}

.fr-sched,
.mb-sched-wrap .b-vue-schedulerpro-container {
    flex       : 1 1 auto;
    min-height : 0;
    min-width  : 0;
    width      : auto;
    height     : auto;
    max-width  : 100%;
}

/* ------------------------------------------------------------------ */
/* FastReact shell: menubar, dropdowns, empty home, status bar        */
/* ------------------------------------------------------------------ */
/* SAP Fiori (Quartz Light) shell: white bar, #0a6ed1 brand blue accents */
.fr-menubar {
    display       : flex;
    align-items   : center;
    gap           : 2px;
    padding       : 4px 8px;
    background    : #fff;
    border-bottom : 1px solid #d9d9d9;
    flex          : none;
    position      : relative;
    z-index       : 500;
}

.fr-menu-wrap { position : relative; }

.fr-menu {
    display       : flex;
    align-items   : center;
    gap           : 7px;
    padding       : 5px 12px;
    cursor        : pointer;
    white-space   : nowrap;
    border-radius : 4px;
    font-size     : 13px;
    font-family   : '72', 'Segoe UI', Arial, sans-serif;
    color         : #32363a;
    transition    : background 0.1s, color 0.1s;
}

.fr-menu:hover,
.fr-menu-active { background : #eaf3fb; color : #0a6ed1; }

.fr-menu-exit .fr-menu-fa { color : #bb0000; }
.fr-menu-exit:hover { background : #fbeaea; color : #bb0000; }

.fr-menu-fa {
    font-size  : 13px;
    color      : #0a6ed1;
    width      : 15px;
    text-align : center;
}

.fr-dropdown {
    position      : absolute;
    top           : calc(100% + 3px);
    left          : 0;
    z-index       : 10000;
    min-width     : 260px;
    background    : #fff;
    border        : 1px solid #d9d9d9;
    border-radius : 4px;
    box-shadow    : 0 6px 16px rgba(0, 0, 0, 0.18);
    padding       : 4px;
}

.fr-dd-item {
    padding       : 8px 12px;
    font-size     : 13px;
    white-space   : nowrap;
    cursor        : pointer;
    border-radius : 4px;
    color         : #32363a;
}

.fr-dd-item:hover { background : #eaf3fb; color : #0a6ed1; }
.fr-dd-fa   { color : #0a6ed1; width : 16px; text-align : center; margin-right : 4px; }
.fr-dd-dim  { color : #6a6d70; }
.fr-dd-sep  { height : 1px; background : #e5e5e5; margin : 4px 8px; }

.fr-home {
    flex           : 1 1 auto;
    min-height     : 0;
    display        : flex;
    flex-direction : column;
}

.fr-home-empty {
    flex       : 1 1 auto;
    background : #f0f0f0;
    border     : 1px solid #c9c5b8;
    margin     : 2px;
}

.fr-statusbar {
    display     : flex;
    gap         : 2px;
    padding     : 2px;
    background  : #e9e6df;
    border-top  : 1px solid #a9a494;
    flex        : none;
    font-size   : 11px;
}

.fr-status-cell {
    padding    : 3px 10px;
    background : #f4f2ec;
    border     : 1px inset #d5d1c5;
    white-space : nowrap;
}

.fr-status-wide { flex : 1 1 auto; }

.fr-status-plan {
    color       : #1565c0;
    font-weight : 600;
    max-width   : 420px;
    overflow    : hidden;
    text-overflow : ellipsis;
}

.fr-boardarea {
    display        : flex;
    flex-direction : column;
    flex           : 1 1 auto;
    min-height     : 0;
}

/* Hidden board parks off-screen at FULL SIZE (never display:none) so the
   Bryntum scheduler always measures real widths - the locked Line/Cap/Eff
   panel stays intact */
.fr-board-hidden {
    position       : fixed;
    left           : 0;
    top            : 200vh;
    width          : 100vw;
    height         : calc(100vh - 34px);
    visibility     : hidden;
    pointer-events : none;
}

.mb-sched-loading {
    pointer-events : none;
}

.fr-board-loader {
    position        : absolute;
    inset           : 0;
    z-index         : 500;
    display         : flex;
    align-items     : center;
    justify-content : center;
    background      : rgba(255, 255, 255, 0.82);
    backdrop-filter : blur(2px);
}

.fr-board-loader-box {
    min-width     : 280px;
    max-width     : 420px;
    padding       : 28px 32px;
    background    : #fff;
    border        : 1px solid #c8c4b8;
    box-shadow    : 0 8px 32px rgba(0, 0, 0, 0.12);
    text-align    : center;
}

.fr-board-spinner {
    width         : 36px;
    height        : 36px;
    margin        : 0 auto 16px;
    border        : 3px solid #ddd8cc;
    border-top    : 3px solid #2e7d32;
    border-radius : 50%;
    animation     : fr-board-spin 0.9s linear infinite;
}

@keyframes fr-board-spin {
    to { transform : rotate(360deg); }
}

.fr-board-loader-title {
    font-size   : 15px;
    font-weight : 700;
    color       : #333;
    margin-bottom : 6px;
}

.fr-board-loader-msg {
    font-size   : 13px;
    color       : #666;
    margin-bottom : 14px;
}

.fr-board-loader-bar {
    height        : 6px;
    background    : #ece8df;
    border-radius : 3px;
    overflow      : hidden;
    margin-bottom : 6px;
}

.fr-board-loader-fill {
    height        : 100%;
    background    : linear-gradient(90deg, #2e7d32, #43a047);
    border-radius : 3px;
    transition    : width 0.2s ease;
}

.fr-board-loader-pct {
    font-size : 12px;
    color     : #888;
}

/* Orders list dialog: full-width — the compound selector out-ranks the base
   .cal-dialog width:700px that otherwise wins by stylesheet order */
.cal-dialog.od-dialog {
    width          : 90vw;
    min-width      : 960px;
    max-width      : 90vw;
    max-height     : 98vh;
    height         : 98vh;
    display        : flex;
    flex-direction : column;
}

/* Summary strip over the table (reacts to filters) */
.od-sum-bar {
    display     : flex;
    gap         : 8px;
    flex-wrap   : wrap;
    padding     : 4px 10px 6px;
    align-items : center;
}
.od-sum-tile {
    background    : #eef2f8;
    border        : 1px solid #d5dce8;
    border-radius : 5px;
    padding       : 3px 10px;
    font-size     : 12px;
    color         : #333;
}
.od-sum-tile b { color : #17356b; }
.od-sum-proj  { background : #fff3e0; border-color : #ffcc80; }
.od-sum-conf  { background : #e8f5e9; border-color : #a5d6a7; }
.od-sum-qty   { background : #e3f2fd; border-color : #90caf9; }
.od-sum-done  { background : #eceff1; border-color : #b0bec5; }
.od-sum-unpl  { background : #ffebee; border-color : #ef9a9a; }
.od-sum-recent { background : #e8f5e9; border-color : #81c784; }
.od-sum-on { outline : 2px solid #1e88e5; outline-offset : 1px; }
.od-sum-qty b { font-size : 13px; }

/* Column-header running totals — dark red so they stand out on the header */
.od-th-sum {
    font-size   : 10px;
    font-weight : 700;
    color       : #c62828;
}

/* Sortable headers: always-visible asc/desc buttons on every column */
.od-sortable { cursor : pointer; user-select : none; }
.od-sortable:hover { background : #dde6f2; }
.od-sorted { background : #dbe7f7; }
.od-sort-btns {
    display        : inline-flex;
    flex-direction : column;
    vertical-align : middle;
    margin-left    : 3px;
    line-height    : 0.85;
}
.od-sort-b {
    font-size : 7.5px;
    color     : #9fb0c8;
    cursor    : pointer;
}
.od-sort-b:hover { color : #17356b; }
.od-sort-b.od-sort-on { color : #c62828; }

/* Instant hover tooltip over table cells */
.od-hovertip {
    position       : fixed;
    z-index        : 100000;
    background     : #263238;
    color          : #fff;
    padding        : 4px 9px;
    border-radius  : 4px;
    font-size      : 11.5px;
    max-width      : 420px;
    white-space    : pre-wrap;
    pointer-events : none;
    box-shadow     : 0 2px 8px rgba(0, 0, 0, 0.35);
}

/* Clickable summary tiles */
.od-sum-click { cursor : pointer; }
.od-sum-click:hover { filter : brightness(0.93); box-shadow : 0 1px 3px rgba(0,0,0,0.2); }

/* Mark-complete checkbox + save button */
.od-done-box { width : 15px; height : 15px; cursor : pointer; accent-color : #2e7d32; }
.od-done-mark { color : #9e9e9e; font-weight : bold; }
.od-done-btn {
    border        : 1px solid #6d4c41;
    background    : #8d6e63;
    color         : #fff;
    border-radius : 6px;
    padding       : 7px 14px;
    font-size     : 13px;
    cursor        : pointer;
    white-space   : nowrap;
}
.od-done-btn:hover:not(:disabled) { background : #6d4c41; }
.od-done-btn:disabled { opacity : 0.6; cursor : default; }

/* Excel export button in the search bar */
.od-xls-btn {
    border        : 1px solid #2e7d32;
    background    : #43a047;
    color         : #fff;
    border-radius : 6px;
    padding       : 7px 14px;
    font-size     : 13px;
    cursor        : pointer;
    white-space   : nowrap;
}
.od-xls-btn:hover:not(:disabled) { background : #2e7d32; }
.od-xls-btn:disabled { opacity : 0.5; cursor : default; }

/* ⟳ reset + refresh beside Excel */
.od-reload-btn {
    padding       : 6px 12px;
    border        : 1px solid #9db3d6;
    border-radius : 4px;
    background    : #f4f7fc;
    color         : #17356b;
    font-size     : 15px;
    font-weight   : bold;
    cursor        : pointer;
    line-height   : 1;
}
.od-reload-btn:hover:not(:disabled) { background : #e4ecf8; }
.od-reload-btn:disabled { opacity : 0.5; cursor : default; }

/* Orders dialog tab bar */
.od-tabs {
    display        : flex;
    gap            : 2px;
    padding        : 4px 8px 0;
    background     : #e8edf4;
    border-bottom  : 1px solid #c8d2e0;
    flex-shrink    : 0;
}
.od-tabs .cal-tab { font-size : 12px; padding : 4px 12px; }
.od-tab-count {
    display       : inline-block;
    margin-left   : 5px;
    padding       : 1px 6px;
    border-radius : 10px;
    font-size     : 10px;
    font-weight   : bold;
    background    : #1565c0;
    color         : #fff;
    vertical-align: middle;
}

.od-body {
    overflow     : auto;
    flex         : 1 1 auto;
    min-height   : 0;
    max-height   : calc(98vh - 132px);
}

/* Confirm Orders consolidated table */
.od-cg-table th, .od-cg-table td { white-space : nowrap; }
.od-cg-row { cursor : pointer; }
.od-cg-row:hover { background : #eef4ff !important; }
.od-cg-po-cell { display : flex; align-items : center; gap : 6px; }
.od-expand-arrow { color : #888; font-size : 10px; }
.od-po-badge {
    display       : inline-block;
    padding       : 1px 7px;
    border-radius : 10px;
    font-size     : 10px;
    font-weight   : bold;
    background    : #1565c0;
    color         : #fff;
}
.od-cg-po-row { background : #f7f9fc; }
.od-cg-po-row td { border-top : none; border-bottom : 1px solid #e8edf4; }
.od-cg-indent { background : #f0f4fa; }
.od-cg-po-num { font-family : monospace; color : #333; font-size : 11px; }

.od-table {
    width     : max-content;
    min-width : 100%;
}

.od-filterrow th { padding : 2px 3px; background : #eef2f8; }

.od-filter {
    width      : 100%;
    box-sizing : border-box;
    padding    : 3px 5px;
    border     : 1px inset #999;
    font-size  : 11px;
    font-family : inherit;
}

.od-hintrow {
    display         : flex;
    align-items     : center;
    justify-content : space-between;
    gap             : 10px;
}

.od-clear { width : auto; margin : 0; padding : 4px 12px; }

.od-table { font-size : 10.5px; }
.od-table th, .od-table td { padding : 3px 4px; white-space : nowrap; }
/* Cell data is selectable so it can be copied straight from the list */
.od-table td { user-select : text; cursor : text; }
.od-table td .od-status, .od-table td .od-color, .od-table td .od-expand { cursor : pointer; }

/* Compact columns so 11+ columns fit at a glance: long text truncates with
   an ellipsis (the row tooltip still carries the full info) */
.od-table .od-c-buyer   { max-width : 108px; overflow : hidden; text-overflow : ellipsis; }
.od-table .od-c-style   { max-width : 120px; overflow : hidden; text-overflow : ellipsis; }
.od-table .od-c-productType { max-width : 62px; overflow : hidden; text-overflow : ellipsis; }
.od-table .od-c-color   { max-width : 100px; overflow : hidden; text-overflow : ellipsis; }
.od-table .od-c-po      { max-width : 104px; overflow : hidden; text-overflow : ellipsis; }
.od-table .od-c-line    { max-width : 76px;  overflow : hidden; text-overflow : ellipsis; }
.od-table .od-c-deliveryStatus { max-width : 88px; overflow : hidden; text-overflow : ellipsis; }
.od-table .od-c-done    { width : 24px; }
.od-filterrow .od-filter { min-width : 30px; }
.od-c-deliveryStatus .od-status,
.od-c-status .od-status { padding : 1px 5px; font-size : 9px; }
.od-num { text-align : right; }

.od-row { cursor : pointer; }
.od-row:hover td { background : #eaf1fb; }
.od-gsearch-bar {
    display      : flex;
    align-items  : center;
    gap          : 6px;
    padding      : 8px 12px 4px;
    border-bottom: 1px solid var(--border);
}
.od-gsearch {
    flex         : 1;
    padding      : 6px 12px;
    border       : 1px solid var(--border);
    border-radius: 6px;
    font-size    : 13px;
    background   : var(--surface);
    color        : var(--text);
    outline      : none;
}
.od-gsearch:focus { border-color: #1976d2; box-shadow: 0 0 0 2px rgba(25,118,210,.15); }
.od-gsearch-clear {
    cursor    : pointer;
    color     : #888;
    font-size : 14px;
    padding   : 2px 6px;
    border-radius: 4px;
}
.od-gsearch-clear:hover { background: var(--hover); color: #333; }

.od-row-projected td { background : #fffde7; }
.od-row-projected:hover td { background : #fff9c4; }

/* Completed orders: clearly highlighted, muted + struck order info.
   Declared with higher specificity so it wins over projected/planned tints */
.od-table tr.od-row-completed td {
    background : #eceff1;
    color      : #90a4ae;
}
.od-table tr.od-row-completed:hover td { background : #cfd8dc; }
.od-table tr.od-row-completed td:nth-child(n+4) { text-decoration : line-through; }
.od-table tr.od-row-completed .od-status,
.od-table tr.od-row-completed .od-color { text-decoration : none; }
.od-row-planned td { background : #e8f5e9; }
.od-row-planned:hover td { background : #c8e6c9; }
/* Projection whose confirm POs have NOT arrived yet — light blue row
   (wins over planned green so the planner spots waiting orders) */
.od-row-noconfirm td { background : #e3f2fd; }
.od-row-noconfirm:hover td { background : #bbdefb; }
/* Projection replaced by a planned confirm order — brown-tinted row */
.od-row-replaced td { background : #efebe9; color : #5d4037; }
.od-row-replaced:hover td { background : #d7ccc8; }
/* Projection whose confirm POs don't cover the full order qty — after
   od-row-replaced so the amber flag wins over the replaced tint */
.od-table tr.od-row-partial td { background : #fff3e0; color : #6d4c00; }
.od-table tr.od-row-partial:hover td { background : #ffe0b2; }

/* Day Plan Report — spreadsheet grid */
.dp-dialog {
    font-family : Arial, sans-serif;
    width       : 100vw;
    min-width   : 100vw;
    max-width   : 100vw;
    height      : 100vh;
    max-height  : 100vh;
}

/* Body fills the rest of the screen; anything bigger scrolls inside */
.dp-body {
    max-height : none;
    flex       : 1 1 auto;
    overflow   : auto;
}

/* One-line toolbar: date range + Generate / Excel / PDF ... Close */
.dp-toolbar {
    display       : flex;
    align-items   : center;
    flex-wrap     : wrap;
    gap           : 8px;
    padding       : 8px 12px;
    background    : linear-gradient(#fdfdfb, #ece9e0);
    border-bottom : 1px solid #c9c5b8;
}
.dp-range {
    display     : flex;
    align-items : center;
    gap         : 6px;
    font-size   : 12px;
    font-weight : bold;
    color       : #17356b;
}
.dp-date { width : 138px; }
.dp-flex { flex : 1 1 auto; }

.dp-act {
    padding       : 5px 16px;
    border        : 1px solid #8a8a8a;
    border-radius : 3px;
    background    : linear-gradient(#fff, #e4e1d8);
    font-family   : inherit;
    font-size     : 12px;
    font-weight   : bold;
    cursor        : pointer;
    white-space   : nowrap;
}
.dp-act:hover:not(:disabled) { filter : brightness(1.07); }
.dp-act:active:not(:disabled) { transform : translateY(1px); }
.dp-act-view { background : #6a1b9a; color : #fff; }
.dp-act-on   { outline : 2px solid #ffb300; outline-offset : 1px; }
.dps-wrap { display : flex; gap : 18px; align-items : flex-start; margin : 8px 0 14px; }
/* dp-table sets min-width:100% — the compact summary tables must undo it */
.dp-table.dps-kv     { min-width : 320px; width : 380px; }
.dp-table.dps-buyers { min-width : 260px; width : 320px; }
.dp-table.dps-floors { min-width : 0; width : auto; max-width : 860px; }
.dps-kv td:first-child { font-weight : 600; }
.dps-buyers { max-width : 300px; }
.dps-buyers thead th { background : #cfd8ea; }
.dps-floors { max-width : 720px; margin-bottom : 10px; }
.dps-floors thead th { background : #a5d6a7; }
.dp-day-click { cursor : pointer; }
.dp-day-click:hover { background : #ffe082; }
.dp-act:disabled { opacity : 0.45; cursor : default; }
.dp-act-gen   { background : #1b52ad; border-color : #143d82; color : #fff; }
.dp-act-xls   { background : #1e7e34; border-color : #145824; color : #fff; }
.dp-act-pdf   { background : #c62828; border-color : #8e1c1c; color : #fff; }
.dp-act-close { background : #f0efe8; color : #333; }

/* Report letterhead: unit name + title + date range */
.dp-rephead {
    text-align    : center;
    background    : #fff;
    padding       : 10px 8px 7px;
    border        : 1px solid #c9c5b8;
    border-bottom : 3px double #17356b;
    margin-bottom : 8px;
}
.dp-rep-unit  { font-size : 17px; font-weight : bold; color : #17356b; letter-spacing : 1px; }
.dp-rep-title { font-size : 13px; font-weight : bold; margin-top : 2px; }
.dp-rep-range { font-size : 11px; margin-top : 3px; color : #333; }
.dp-rep-dim   { color : #888; }

/* Summary cards: orders / lines / qty / CM / avg eff */
.dp-cards {
    display       : flex;
    flex-wrap     : wrap;
    gap           : 8px;
    margin-bottom : 8px;
}
.dp-card {
    display        : flex;
    flex-direction : column;
    align-items    : center;
    min-width      : 96px;
    padding        : 6px 14px;
    background     : #fff;
    border         : 1px solid #c9c5b8;
    border-top     : 3px solid #1b52ad;
    border-radius  : 2px;
}
.dp-card b    { font-size : 15px; color : #17356b; }
.dp-card span { font-size : 10px; color : #777; text-transform : uppercase; letter-spacing : 0.5px; }
.dp-card-eff  { border-top-color : #1e7e34; }
.dp-card-eff b { color : #1e7e34; }

.dp-table {
    width     : max-content;
    min-width : 100%;
    font-size : 11px;
    color     : #000;
}
.dp-table th,
.dp-table td {
    border     : 1px solid #999;
    padding    : 3px 5px;
    background : #fff;
    color      : #000;
    white-space : nowrap;
}
.dp-table th {
    background  : #17356b;
    color       : #fff;
    font-weight : bold;
    text-align  : center;
    vertical-align : bottom;
    position    : sticky;
    top         : 0;
    z-index     : 2;
}
.dp-table tbody tr:nth-child(even) td { background : #f7f9fc; }
.dp-dayh { min-width : 58px; }
.dp-total td,
.dp-table tbody tr.dp-total td {
    font-weight : bold;
    border-top  : 2px solid #000;
    border-bottom : 2px solid #000;
    background  : #f2f2f2;
}
.dp-grand td,
.dp-table tbody tr.dp-grand td {
    font-weight : bold;
    background  : #dbe5f1;
    color       : #17356b;
    border-top  : 3px double #000;
    border-bottom : 3px double #000;
}
.dp-empty { text-align : center; color : #666; padding : 18px !important; }
.dp-hint { padding : 18px 8px; }

/* Daily production update */
.pu-in {
    width      : 92px;
    text-align : right;
    padding    : 3px 6px;
}
.pu-rest { color : #c62828; font-weight : bold; }

.od-status {
    padding       : 1px 8px;
    border-radius : 3px;
    color         : #fff;
    font-size     : 10px;
    text-transform : capitalize;
}

.od-color {
    display       : inline-flex;
    align-items   : center;
    gap           : 5px;
    padding       : 1px 8px;
    border-radius : 3px;
    font-size     : 10px;
    border        : 1px solid #ccc;
}

.od-color::before {
    content       : '';
    width         : 9px;
    height        : 9px;
    border-radius : 2px;
    background    : currentColor;
    border        : 1px solid #888;
}

.od-color-red          { color : #c62828; background : #ffebee; }
.od-color-blue         { color : #1565c0; background : #e3f2fd; }
.od-color-yellow       { color : #f57f17; background : #fffde7; }
.od-color-black        { color : #212121; background : #f0f0f0; }
.od-color-navy         { color : #0d2b72; background : #e8eaf6; }
.od-color-white        { color : #555555; background : #fafafa; border-color : #ccc; }
.od-color-green        { color : #2e7d32; background : #e8f5e9; }
.od-color-grey,
.od-color-gray         { color : #424242; background : #f5f5f5; }
.od-color-brown        { color : #4e342e; background : #efebe9; }
.od-color-orange       { color : #e65100; background : #fff3e0; }
.od-color-purple       { color : #6a1b9a; background : #f3e5f5; }
.od-color-pink         { color : #ad1457; background : #fce4ec; }
.od-color-khaki        { color : #827717; background : #f9fbe7; }
.od-color-sand         { color : #795548; background : #efebe9; }
.od-color-bronze       { color : #6d4c41; background : #efebe9; }
.od-color-royal-blue   { color : #1a237e; background : #e8eaf6; }
.od-color-persian-blue { color : #1565c0; background : #e3f2fd; }

.od-planned   { background : #43a047; }
.od-confirmed { background : #7b1fa2; }
.od-draft     { background : #1e88e5; }
.od-completed { background : #9e9e9e; }
.od-unplanned { background : #d40000; }
.od-replaced  { background : #6d4c41; }
.od-ord-proj    { background : #ef6c00; }
.od-ord-confirm { background : #2e7d32; }

/* delivery status badges */
.od-ds-on-time                { background : #43a047; }
.od-ds-at-risk                { background : #f9a825; }
.od-ds-late                   { background : #d32f2f; }
.od-ds-partial                { background : #ef6c00; }
.od-ds-pending-line-selection { background : #90a4ae; }

/* grouping status badges */
.od-gs-grouped     { background : #00897b; }
.od-gs-split       { background : #e65100; }
.od-gs-provisional { background : #78909c; }

/* group expand + sub-rows */
.od-expand { cursor : pointer; color : #1e88e5; font-weight : 600; user-select : none; }
.od-expand:hover { text-decoration : underline; }
.od-subrow td { background : #f4f7fb; font-size : 10.5px; color : #37474f; border-top : 1px dashed #cfd8dc; padding : 3px 7px; }

/* Efficiency profiles dialog */
.ef-dialog { width : 520px; max-width : 95vw; }

.ef-row {
    display     : flex;
    align-items : center;
    gap         : 10px;
    margin-bottom : 8px;
}

.ef-row label { flex : 0 0 160px; font-weight : bold; }

.ef-search { flex : 1; text-align : left; width : auto; }

.ef-table { width : 100%; }
.ef-table td { padding : 3px 6px; }

.ef-mark   { width : 22px; text-align : center; color : #17356b; }
.ef-chip-h { width : 26px; }

.ef-chip-cell { text-align : center; }

.ef-chip {
    display : inline-block;
    width   : 16px;
    height  : 14px;
    border  : 1px solid #777;
    vertical-align : middle;
}

.ef-in { width : 70px; }

.ef-sel td { background : #dce9fb; }

.ef-name { margin-bottom : 6px; }

.ef-list { height : 300px; margin : 0 0 10px; }

.ef-assign {
    display   : flex;
    flex-wrap : wrap;
    gap       : 4px 10px;
}

.ef-assign-item {
    display     : flex;
    align-items : center;
    gap         : 3px;
    font-weight : normal;
    white-space : nowrap;
}

.st-btn:disabled {
    opacity : 0.5;
    cursor  : default;
}

/* Lines tab (line-wise efficiency summary) */
.ef-dialog { width : 740px; }   /* widen dialog for Lines tab */
.ls-body { padding : 0; }

.ls-table { width : 100%; border-collapse : collapse; }
.ls-table th,
.ls-table td { padding : 6px 10px; border-bottom : 1px solid #dde3ee; vertical-align : middle; }
.ls-table thead th { background : #17356b; color : #fff; font-size : 12px; white-space : nowrap; }
.ls-table tbody tr:hover td { background : #f0f5ff; }

.ls-line    { width : 90px; }
.ls-profile { width : 140px; font-size : 12px; color : #666; }
.ls-can     { width : 60px; text-align : center; }
.ls-top     { }

.ls-dim { color : #999; font-style : italic; font-size : 12px; }

.ls-badge {
    display       : inline-block;
    min-width     : 26px;
    padding       : 1px 5px;
    border-radius : 10px;
    font-size     : 12px;
    font-weight   : bold;
    text-align    : center;
}
.ls-badge-ok   { background : #d4edda; color : #155724; }
.ls-badge-none { background : #f8d7da; color : #721c24; }

.ls-pill {
    display        : inline-flex;
    align-items    : center;
    gap            : 4px;
    background     : #f0f4ff;
    border         : 1px solid #c5d0ea;
    border-radius  : 12px;
    padding        : 2px 8px 2px 5px;
    margin         : 2px 4px 2px 0;
    font-size      : 12px;
    white-space    : nowrap;
}
.ls-dot {
    width         : 10px;
    height        : 10px;
    border-radius : 50%;
    border        : 1px solid rgba(0,0,0,.25);
    flex-shrink   : 0;
}
.ls-pname { font-weight : 500; max-width : 140px; overflow : hidden; text-overflow : ellipsis; }
.ls-peff  { color : #17356b; font-weight : bold; }
.ls-pqty  { color : #2e7d32; font-weight : 600; }
.ls-crown { font-size : 11px; }

/* Plan generator dialog */
.pg-dialog { width : 960px; max-width : 97vw; max-height : 95vh; overflow-y : auto; }

.pg-inputs {
    display : grid;
    grid-template-columns : repeat(3, 1fr);
    gap : 4px 18px;
    margin-bottom : 10px;
}

.pg-in { width : 150px; text-align : left; }

.pg-potable { margin-bottom : 10px; }
.pg-potable th, .pg-potable td { padding : 4px 8px; }

.pg-summary {
    display : flex;
    justify-content : space-between;
    gap : 14px;
    background : #eef2f8;
    border : 1px solid #c9c5b8;
    padding : 7px 10px;
    margin : 8px 0;
    font-size : 11px;
}

.pg-verdict {
    padding : 1px 8px;
    border-radius : 3px;
    color : #fff;
    font-size : 10px;
    font-weight : bold;
}

.pg-v-good  { background : #0CA30C; }
.pg-v-amber { background : #FAB219; color : #222; }
.pg-v-red   { background : #D03B3B; }

.pg-options { display : flex; gap : 10px; align-items : stretch; flex-wrap : wrap; }

.pg-card {
    flex : 1 1 280px;
    border : 1px solid #c9c5b8;
    background : #fff;
    padding : 8px 10px;
    font-size : 11px;
    display : flex;
    flex-direction : column;
    gap : 5px;
}

.pg-card-rej { background : #faf0f0; }

.pg-card-h { font-weight : bold; display : flex; justify-content : space-between; align-items : center; }
.pg-card-seq { color : #17356b; }
.pg-card-meta { color : #555; }
.pg-card-buf { font-size : 10.5px; }
.pg-card-rejr { color : #D03B3B; font-size : 10.5px; }
.pg-commit { margin-top : auto; width : auto; }

/* Planned schedule dialog */
.pl-dialog { width : 980px; max-width : 97vw; }

.pl-body { display : block; }

/* Info fields: two label+value pairs per row, full dialog width, no clipping */
.pl-body .pl-grid {
    display : grid;
    grid-template-columns : 78px 1fr 78px 1fr;
    gap : 7px 14px;
    align-items : center;
    margin-bottom : 12px;
}

.pl-body .pl-grid label { font-weight : bold; white-space : nowrap; }

.pl-info .pr-ro {
    width      : 100%;
    min-width  : 0;
    box-sizing : border-box;
    padding    : 4px 8px;
    font-size  : 11px;
}

.pl-cols {
    display     : flex;
    gap         : 14px;
    align-items : flex-start;
}

.pl-left  { flex : 0 0 275px; }

.pl-right {
    flex       : 1;
    min-width  : 0;
    max-height : 420px;
    overflow-y : auto;
    overflow-x : auto;
    border     : 1px solid #c9c5b8;
}

.pl-table { width : 100%; }
.pl-table th, .pl-table td { padding : 4px 6px; }

.pl-period {
    display : flex;
    gap     : 18px;
}

.pl-period label {
    display     : flex;
    align-items : center;
    gap         : 5px;
    font-weight : normal;
}

.pl-schedlist { height : 130px; margin-top : 10px; font-size : 11px; }

.pl-table th, .pl-table td { padding : 4px 8px; white-space : nowrap; }
.pl-table .st-user { color : #17356b; }
.pl-off td { color : #999; }

/* Strip / Order properties dialog */
.pr-dialog { width : 820px; max-width : 96vw; }

.pr-box {
    border  : 1px solid #c9c5b8;
    padding : 8px 10px;
    margin  : 0 0 10px;
}

.pr-box legend {
    font-size : 11px;
    color     : #17356b;
    padding   : 0 6px;
}

.pr-grid {
    display : grid;
    grid-template-columns : 90px 1fr 110px 1fr;
    gap : 6px 10px;
    align-items : center;
}

.pr-grid2 { grid-template-columns : 140px 1fr; }

.pr-grid label { font-weight : bold; white-space : nowrap; }

.pr-ro {
    background : #f0efe8;
    text-align : left;
    width      : 100%;
    box-sizing : border-box;
    font-weight : bold;
}

.pr-cols { display : flex; gap : 12px; align-items : stretch; }
.pr-col  { flex : 1; display : flex; flex-direction : column; }

.pr-dim { color : #666; }

.pr-keep { margin-top : 8px; }

.pr-dates { flex : 1; }

.pr-datetable { width : 100%; border-collapse : collapse; font-size : 11px; }
.pr-datetable td { padding : 4px 6px; border-bottom : 1px solid #eeeae0; }

.pr-actions { justify-content : center; }

/* Build up curves dialog */
.bc-dialog { width : 860px; max-width : 96vw; }

.bc-body {
    display : flex;
    gap     : 16px;
    align-items : flex-start;
}

.bc-left  { flex : 0 0 230px; }
.bc-mid   { flex : 0 0 170px; max-height : 420px; overflow-y : auto; }
.bc-right { flex : 1; }

.bc-list { height : 280px; margin : 4px 0 10px; }

.bc-chart-title {
    color       : #1b3fde;
    font-weight : bold;
    text-align  : center;
    margin      : 4px 0 6px;
    font-size   : 12px;
}

.bc-chart {
    width      : 100%;
    background : #f7f5ef;
    border     : 1px solid #c9c5b8;
}

.bc-renamecol {
    flex : 0 0 260px;
    display : flex;
    flex-direction : column;
    gap : 24px;
    padding-top : 24px;
}

.bc-ro { background : #f0efe8; }

/* Settings dialog */
.st-dialog { width : 780px; max-width : 95vw; }

.st-body { padding : 12px; }

.st-current {
    display     : flex;
    align-items : center;
    gap         : 10px;
    margin-bottom : 10px;
    font-weight : bold;
}

.st-select { width : auto; min-width : 150px; text-align : left; }

.st-table {
    width           : 100%;
    border-collapse : collapse;
    background      : #fff;
    font-size       : 12px;
}

.st-table th,
.st-table td {
    border  : 1px solid #c9c5b8;
    padding : 6px 8px;
    text-align : left;
}

.st-table th { background : #f4f2ec; color : #17356b; }
.st-board-h  { font-size : 11px; max-width : 130px; }
.st-pw { width : 110px; padding : 3px 6px; font-size : 11px; }

/* ------------------------------------------------------------------ */
/* Login gate — smart sign-in screen                                  */
/* ------------------------------------------------------------------ */
.lg-overlay {
    position        : fixed;
    inset           : 0;
    z-index         : 20000;
    display         : flex;
    align-items     : center;
    justify-content : center;
    background      : linear-gradient(135deg, #0d224a 0%, #17356b 45%, #2a5aa8 100%);
    overflow        : hidden;
}

/* soft floating orbs behind the card */
.lg-orbs i {
    position      : absolute;
    border-radius : 50%;
    background    : radial-gradient(circle at 30% 30%, rgba(255,255,255,.22), rgba(255,255,255,.03));
    animation     : lg-float 14s ease-in-out infinite;
}
.lg-orbs i:nth-child(1) { width : 340px; height : 340px; top : -90px;  left : -70px; }
.lg-orbs i:nth-child(2) { width : 220px; height : 220px; bottom : -60px; right : 12%; animation-delay : -5s; }
.lg-orbs i:nth-child(3) { width : 140px; height : 140px; top : 18%; right : -40px; animation-delay : -9s; }

@keyframes lg-float {
    0%, 100% { transform : translateY(0) translateX(0); }
    50%      { transform : translateY(26px) translateX(-14px); }
}

.lg-card {
    position       : relative;
    display        : flex;
    flex-direction : column;
    gap            : 5px;
    width          : 340px;
    padding        : 28px 30px 20px;
    background     : rgba(255,255,255,.96);
    border-radius  : 14px;
    box-shadow     : 0 18px 60px rgba(0,0,0,.45);
    backdrop-filter : blur(6px);
    animation      : lg-in .35s ease;
}

@keyframes lg-in {
    from { opacity : 0; transform : translateY(14px) scale(.98); }
    to   { opacity : 1; transform : none; }
}

.lg-shake { animation : lg-shake .35s; }
@keyframes lg-shake {
    0%, 100% { transform : translateX(0); }
    20%      { transform : translateX(-8px); }
    40%      { transform : translateX(7px); }
    60%      { transform : translateX(-5px); }
    80%      { transform : translateX(4px); }
}

.lg-logo  { font-size : 34px; text-align : center; line-height : 1; }
.lg-brand { font-size : 23px; font-weight : bold; color : #17356b; text-align : center; letter-spacing : .5px; }
.lg-sub   { font-size : 12px; color : #777; text-align : center; margin-bottom : 10px; }

/* one-click user chips (from planning_users) */
.lg-chips {
    display        : flex;
    flex-direction : column;
    gap            : 6px;
    margin-bottom  : 10px;
}
.lg-chip {
    display       : flex;
    align-items   : center;
    gap           : 10px;
    padding       : 6px 10px;
    border        : 1px solid #d4dcea;
    border-radius : 9px;
    background    : #f7f9fd;
    cursor        : pointer;
    font-family   : inherit;
    text-align    : left;
    transition    : background .15s, border-color .15s;
}
.lg-chip:hover { background : #eaf1fb; border-color : #9db3d6; }
.lg-chip-on    { background : #e3edfc; border-color : #17356b; box-shadow : 0 0 0 1px #17356b inset; }
.lg-avatar {
    display         : flex;
    align-items     : center;
    justify-content : center;
    width           : 30px;
    height          : 30px;
    border-radius   : 50%;
    background      : linear-gradient(135deg, #2a5aa8, #17356b);
    color           : #fff;
    font-weight     : bold;
    font-size       : 14px;
    flex            : 0 0 auto;
}
.lg-chip-txt { display : flex; flex-direction : column; line-height : 1.15; }
.lg-chip-txt b     { font-size : 12.5px; color : #223; }
.lg-chip-txt small { font-size : 10.5px; color : #889; }

.lg-label { font-size : 11px; font-weight : bold; color : #445; margin-top : 4px; }
.lg-in {
    width         : 100%;
    box-sizing    : border-box;
    padding       : 9px 11px;
    font-size     : 13px;
    font-family   : inherit;
    border        : 1px solid #c3cede;
    border-radius : 7px;
    outline       : none;
    transition    : border-color .15s, box-shadow .15s;
}
.lg-in:focus { border-color : #2a5aa8; box-shadow : 0 0 0 3px rgba(42,90,168,.18); }

.lg-pwrow { position : relative; }
.lg-in-pw { padding-right : 38px; }
.lg-eye {
    position   : absolute;
    right      : 6px;
    top        : 50%;
    transform  : translateY(-50%);
    border     : none;
    background : none;
    font-size  : 15px;
    cursor     : pointer;
    padding    : 3px 5px;
    opacity    : .7;
}
.lg-eye:hover { opacity : 1; }

.lg-err {
    color         : #c62828;
    background    : #fdecec;
    border        : 1px solid #f2b8b8;
    border-radius : 6px;
    font-size     : 12px;
    padding       : 6px 10px;
    margin-top    : 6px;
}

.lg-btn {
    display         : flex;
    align-items     : center;
    justify-content : center;
    gap             : 8px;
    margin-top      : 12px;
    padding         : 10px 0;
    font-size       : 13.5px;
    font-weight     : bold;
    font-family     : inherit;
    color           : #fff;
    background      : linear-gradient(135deg, #2a5aa8, #17356b);
    border          : none;
    border-radius   : 8px;
    cursor          : pointer;
    transition      : filter .15s, transform .1s;
}
.lg-btn:hover:not(:disabled)  { filter : brightness(1.12); }
.lg-btn:active:not(:disabled) { transform : translateY(1px); }
.lg-btn:disabled { opacity : .65; cursor : default; }

.lg-spin {
    width         : 14px;
    height        : 14px;
    border        : 2px solid rgba(255,255,255,.4);
    border-top-color : #fff;
    border-radius : 50%;
    animation     : lg-rot .7s linear infinite;
}
@keyframes lg-rot { to { transform : rotate(360deg); } }

.lg-foot { font-size : 10.5px; color : #99a; text-align : center; margin-top : 12px; }

.fr-status-logout { cursor : pointer; color : #17356b; font-weight : bold; }
.fr-status-logout:hover { text-decoration : underline; }

/* Read-only lock indicators */
.mb-banner-ro { background : #b45f04; padding : 1px 10px; border-radius : 3px; }
.od-readonly-tag {
    padding       : 3px 10px;
    border-radius : 3px;
    background    : #b45f04;
    color         : #fff;
    font-size     : 11px;
    font-weight   : bold;
    white-space   : nowrap;
}
.st-user     { font-weight : bold; }
.st-check    { text-align : center; }
.st-check input { width : 15px; height : 15px; }

.st-hint { margin-top : 8px; color : #555; font-size : 11px; }

.st-actions {
    display : flex;
    gap     : 10px;
    margin-top : 12px;
}

.st-btn { width : auto; padding : 6px 16px; }

.pr-dialog { width : 920px; }

.pr-body {
    display : flex;
    gap     : 22px;
    align-items : flex-start;
}

.pr-col { flex : 0 0 260px; }
.pr-col-wide { flex : 1 1 auto; min-width : 0; }

.pr-h {
    font-weight   : bold;
    color         : #17356b;
    margin-bottom : 8px;
}

.pr-form {
    display : flex;
    gap     : 6px;
    margin-bottom : 8px;
}

.pr-in { flex : 1 1 auto; min-width : 0; }

.pr-roles {
    list-style  : none;
    margin      : 0;
    padding     : 0;
    background  : #fff;
    border      : 1px inset #999;
    max-height  : 220px;
    overflow-y  : auto;
}

.pr-role {
    display     : flex;
    align-items : center;
    justify-content : space-between;
    gap         : 8px;
    padding     : 5px 8px;
    border-bottom : 1px solid #ece8df;
}

.pr-del {
    border     : none;
    background : transparent;
    cursor     : pointer;
    color      : #888;
    padding    : 0 4px;
}

.pr-del:hover { color : #c62828; }

.pr-points {
    margin      : 0;
    padding-left : 22px;
    background  : #fff;
    border      : 1px inset #999;
    max-height  : 360px;
    overflow-y  : auto;
}

.pr-points li {
    padding     : 7px 10px 7px 4px;
    border-bottom : 1px solid #ece8df;
    line-height : 1.4;
}

.pr-points li:last-child { border-bottom : none; }

/* ------------------------------------------------------------------ */
/* Banner + toolbar                                                   */
/* ------------------------------------------------------------------ */
/* SAP Fiori shell header (#354a5f) */
.fr-banner {
    height          : 28px;
    display         : flex;
    align-items     : center;
    justify-content : flex-start;
    gap             : 12px;
    padding         : 0 12px;
    background      : #354a5f;
    color           : #fff;
    font-weight     : 600;
    font-size       : 12px;
    font-family     : '72', 'Segoe UI', Arial, sans-serif;
    border-bottom   : 1px solid #2b3d4f;
    flex            : none;
}

.mb-banner-sub { font-weight : normal; color : #bac8d3; }

.fr-banner-btns {
    margin-left : auto;
    display     : flex;
    gap         : 4px;
    align-items : center;
}

.fr-banner-plan {
    font-size     : 11px;
    color         : #fff;
    opacity       : 0.95;
    max-width     : 340px;
    overflow      : hidden;
    text-overflow : ellipsis;
    white-space   : nowrap;
    padding-right : 6px;
}

.fr-banner-btn {
    cursor        : pointer;
    padding       : 0 9px;
    line-height   : 18px;
    border        : none;
    border-radius : 4px;
    background    : rgba(255, 255, 255, 0.14);
    color         : #fff;
    font-size     : 11px;
    user-select   : none;
    transition    : background 0.12s;
}

.fr-banner-btn:hover { background : rgba(255, 255, 255, 0.28); }
.fr-banner-x:hover   { background : #e5484d; color : #fff; }

/* SAP Fiori toolbar: white bar, blue icon buttons */
.fr-toolbar {
    display     : flex;
    align-items : center;
    gap         : 2px;
    padding     : 3px 6px;
    min-height  : 32px;
    background  : #fff;
    border-bottom : 1px solid #d9d9d9;
    flex        : none;
    position    : relative;
    z-index     : 100;
}

.fr-tb-btn {
    width       : 28px;
    height      : 26px;
    padding     : 0;
    display     : inline-flex;
    align-items : center;
    justify-content : center;
    gap         : 2px;
    background  : transparent;
    color       : #0a6ed1;
    border      : 1px solid transparent;
    cursor      : pointer;
    font-family : inherit;
    border-radius : 4px;
    transition  : background 0.1s, border-color 0.1s;
}

.fr-tb-btn:hover  { background : #eaf3fb; border-color : #b3d4f0; }
.fr-tb-btn:active { background : #d4e8fa; border-color : #0a6ed1; }
.fr-tb-red  { color : #bb0000; }
.fr-tb-red:hover { background : #fbeaea; border-color : #e8b3b3; }
.fr-tb-save { color : #107e3e; }
.fr-tb-save:hover { background : #ebf5ef; border-color : #a8d5bb; }
.fr-tb-fa   { font-size : 13px; line-height : 1; }
.fr-tb-caret { font-size : 8px; line-height : 1; color : inherit; }
.fr-tb-anchor > .fr-tb-btn { width : auto; padding : 0 6px; }
.fr-tb-sep  { width : 1px; height : 18px; background : #d9d9d9; margin : 0 4px; }

.fr-tb-search {
    display       : flex;
    align-items   : center;
    gap           : 7px;
    margin-left   : 10px;
    padding       : 2px 10px;
    background    : #fff;
    border        : 1px solid #89919a;
    border-radius : 4px;
    min-width     : 220px;
    height        : 26px;
    transition    : border-color 0.1s, box-shadow 0.1s;
}

.fr-tb-search:focus-within {
    border-color : #0a6ed1;
    box-shadow   : 0 0 0 2px rgba(10, 110, 209, 0.18);
}

.fr-tb-search-ico {
    font-size : 12px;
    color     : #6a6d70;
    flex      : none;
}

.fr-tb-search input {
    border     : none;
    outline    : none;
    flex       : 1;
    min-width  : 0;
    font-size  : 12px;
    font-family : inherit;
    background : transparent;
}

.fr-tb-anchor { position : relative; display : inline-flex; }

.fr-colormenu {
    position      : absolute;
    top           : 32px;
    left          : 0;
    z-index       : 10000;
    min-width     : 200px;
    background    : #fff;
    border        : 1px solid #d9d9d9;
    border-radius : 4px;
    box-shadow    : 0 6px 16px rgba(0, 0, 0, 0.18);
    padding       : 4px;
}

.fr-colormenu-item {
    display       : flex;
    align-items   : center;
    gap           : 10px;
    padding       : 7px 10px;
    font-size     : 13px;
    white-space   : nowrap;
    cursor        : pointer;
    border-radius : 4px;
    color         : #32363a;
}

.fr-colormenu-item:hover { background : #eaf3fb; color : #0a6ed1; }
.fr-colormenu-active { background : #d4e8fa; }
.fr-colormenu-ico { width : 16px; text-align : center; }

/* Legend (document 10: never rely on colour alone) */
.mb-legend {
    margin-left : auto;
    display     : flex;
    gap         : 6px;
    align-items : center;
    padding-right : 6px;
}

.mb-lg {
    padding       : 1px 7px;
    border-radius : 3px;
    color         : #fff;
    font-size     : 10px;
}

.mb-lg-green  { background : #43a047; }
.mb-lg-yellow { background : #f9a825; color : #222; }
.mb-lg-orange { background : #fb8c00; }
.mb-lg-red    { background : #e53935; }
.mb-lg-grey   { background : #9e9e9e; }
.mb-lg-blue   { background : #1e88e5; }

/* ------------------------------------------------------------------ */
/* Locked grid                                                        */
/* ------------------------------------------------------------------ */
.b-grid-cell.mb-linecell { padding : 1px 4px 1px 3px; }

.fr-line {
    display     : flex;
    align-items : center;
    gap         : 5px;
    height      : 100%;
    min-height  : 42px;
    font-family : Tahoma, Arial, sans-serif;
}

.fr-line-chip {
    flex            : 0 0 auto;
    min-width       : 22px;
    height          : 38px;
    border          : 1px solid #a06060;
    display         : flex;
    align-items     : flex-start;
    justify-content : center;
    font-size       : 9px;
    padding         : 1px 3px;
    color           : #222;
    background      : #f5b7b1;
    box-sizing      : border-box;
}

.fr-line-chip-gray { background : #c4c4c4; }
.fr-line-chip-red  { background : #f5b7b1; }
.fr-line-chip-hold { background : #f5b7b1; color : #111; }

.fr-line-mid { flex : 1 1 auto; min-width : 0; overflow : hidden; }

.fr-line-name {
    font-weight   : bold;
    font-size     : 12px;
    display       : flex;
    align-items   : center;
    gap           : 4px;
    white-space   : nowrap;
}

.fr-line-ico {
    width        : 11px;
    height       : 11px;
    flex         : none;
    background   : #1b52ad;
    clip-path    : polygon(22% 0, 78% 0, 78% 42%, 100% 42%, 50% 100%, 0 42%, 22% 42%);
}

.fr-line-sub  { font-size : 10px; color : #333; padding-left : 15px; }

.fr-line-nums {
    flex        : 0 0 48px;
    text-align  : right;
    line-height : 1.2;
    font-size   : 11px;
    white-space : nowrap;
}

.fr-n-red   { color : #cc0000; font-weight : bold; }
.fr-n-blue  { color : #0033cc; }
.fr-n-black { color : #000; }

.mb-hold-row .b-grid-cell,
.b-grid-row.mb-hold-row .b-grid-cell,
.mb-subtotal-row .b-grid-cell,
.b-grid-row.mb-subtotal-row .b-grid-cell {
    background : #ffff00 !important;
}

.fr-line-foot {
    padding     : 2px 8px;
    font-size   : 11px;
    color       : #222;
    font-family : Tahoma, Arial, sans-serif;
}

.mb-cap { display : flex; flex-direction : column; align-items : flex-end; line-height : 1.2; }
.mb-cap span { font-size : 9px; }
.mb-cap-over  { color : #c62828; }
.mb-cap-tight { color : #ef6c00; }
.mb-cap-ok    { color : #2e7d32; }
.mb-cap-free  { color : #1565c0; }
.mb-dim       { color : #999; }

.mb-stage-row .b-grid-cell { background : #f2f0ea; }

.fr-clock {
    font-size   : 10px;
    font-weight : bold;
    line-height : 1.3;
    padding     : 1px 3px;
    white-space : nowrap;
    overflow    : hidden;
    font-family : Tahoma, Arial, sans-serif;
}

.mb-sched-wrap .b-grid-sub-grid-locked .b-grid-header {
    background : #f0f0f0;
}

.mb-sched-wrap .b-grid-sub-grid-locked .b-grid-header-text {
    white-space : normal;
}

/* ------------------------------------------------------------------ */
/* Order bars (document 10)                                           */
/* ------------------------------------------------------------------ */
/* FastReact-style bars: every bar identical height (top 75% of the row),
   square corners - colour never changes the geometry. The bottom 25% is a
   blank band showing day-wise manpower. */
.b-sch-event-wrap {
    /* Keep Bryntum's per-row `top` so bars stay on their assigned line.
       Bars sit at the TOP of the row (FastReact look). */
    height     : 32px !important;
    margin-top : 2px;
}

.b-sch-event {
    font-size     : 10px;
    box-sizing    : border-box;
    border-radius : 0;
    height        : 100%;
    align-items   : center;
    /* Persistent order-to-order separator (FastReact): a hard vertical
       edge so adjacent strips on a line stay clearly split */
    border-top    : 1px solid rgba(0, 0, 0, 0.45);
    border-bottom : 1px solid rgba(0, 0, 0, 0.45);
    border-left   : 2px solid #111;
    border-right  : 2px solid #111;
    box-shadow    : inset 1px 0 0 rgba(255, 255, 255, 0.55),
                    inset -1px 0 0 rgba(255, 255, 255, 0.35);
}

.mb-bar { width : 100%; }

/* Day-wise manpower figures in the bottom band */
.b-sch-resource-time-range.mb-mp {
    background      : transparent;
    color           : #222;
    font-size       : 9px;
    display         : flex;
    align-items     : flex-start;
    justify-content : center;
    padding-top     : 1px;
    border          : none;
    pointer-events  : none;
}

.mb-bar { padding : 2px 4px; overflow : hidden; line-height : 1.35; }
.mb-bar-l1 { font-weight : bold; white-space : nowrap; }

/* Learning-curve ramp: hatched shade over the bar's first working days —
   sits ON TOP of the status/risk colour without replacing it */
.mb-lc-seg {
    position       : absolute;
    left           : 0;
    top            : 0;
    bottom         : 0;
    pointer-events : none;
    background     : repeating-linear-gradient(
        -45deg,
        rgba(255,255,255,.32) 0 5px,
        rgba(0,0,0,.08)       5px 10px
    );
    border-right   : 2px dashed rgba(0,0,0,.55);
}

.mb-lc-badge {
    position       : absolute;
    top            : 1px;
    left           : 2px;
    z-index        : 2;
    padding        : 0 3px;
    border-radius  : 2px;
    background     : rgba(0,0,0,.55);
    color          : #ffe082;
    font-size      : 8px;
    font-weight    : bold;
    letter-spacing : .5px;
    pointer-events : none;
}

/* Learning-curve table inside the bar tooltip */
.tip4-lc-tbl { margin-top : 4px; }
.tip4-lc-tbl .t4num, .t4num { text-align : right; }

/* Day-wise plan chips on the Holding Row (hover a bar) — keep Bryntum's
   default light range look, ONLY the text is bold.
   NOTE: Bryntum's element class is b-sch-resource-time-range (dashed). */
.b-sch-resource-time-range.mb-dayqty-range {
    display         : flex;
    align-items     : center;
    justify-content : center;
    text-align      : center;
    overflow        : hidden;
    z-index         : 6;
}
/* Bryntum nests the label — push the bold through every inner node */
.b-sch-resource-time-range.mb-dayqty-range,
.b-sch-resource-time-range.mb-dayqty-range * {
    font-weight : bold !important;
    color       : #17356b !important;
}
.b-sch-resource-time-range.mb-dayqty-lc,
.b-sch-resource-time-range.mb-dayqty-lc * { color : #8a4a00 !important; }
.b-sch-resource-time-range.mb-dayqty-off,
.b-sch-resource-time-range.mb-dayqty-off * { opacity : .6; color : #888 !important; font-weight : normal !important; }

/* Day Plan report: 'Eff / Hour' summary row — the Total row and this row
   sit together inside ONE black band */
.dp-total.dp-total-open td { border-bottom : none; }
.dp-effhour td {
    background    : #fffde9;
    font-size     : 10.5px;
    color         : #444;
    border-bottom : 2px solid #000;
    white-space   : nowrap;
}
.dp-effhour td.od-num { color : #b45f04; font-weight : bold; }
.dp-subh { font-weight : bold; color : #333 !important; }

/* Change working hours dialog (FastReact) */
.ch-dialog { width : 720px; max-width : 96vw; }
.ch-body   { font-size : 12px; }
.ch-cols   { display : flex; gap : 14px; align-items : stretch; margin-bottom : 10px; }
.ch-col    { flex : 1 1 0; display : flex; flex-direction : column; }
.ch-col .pr-box { flex : 1 1 auto; }
.ch-head   {
    font-weight     : bold;
    color           : #1b3f8f;
    text-decoration : underline;
    margin          : 2px 0 6px;
}
.ch-dayrow {
    display         : flex;
    align-items     : center;
    justify-content : space-between;
    gap             : 10px;
    margin          : 2px 0;
}
.ch-dayrow label { display : flex; align-items : center; gap : 6px; }
.ch-dayrow-h { font-weight : bold; font-size : 11px; color : #444; }
.ch-nh { width : 70px; padding : 2px 6px; background : #f2f0ea; text-align : center; }
.ch-modes { display : flex; flex-direction : column; gap : 3px; margin-top : 10px; }
.ch-opt   { display : flex; align-items : center; gap : 6px; margin : 4px 0; }
.ch-or    { text-align : center; color : #666; margin : 8px 0; }
.ch-timerow {
    display     : flex;
    align-items : center;
    gap         : 8px;
    margin-top  : 8px;
    flex-wrap   : wrap;
}
.ch-time  { width : 90px; text-align : center; }
.ch-date  { width : 150px; }
.ch-period { flex : 2 1 0; }
.ch-target { flex : 1 1 0; }
.ch-actions {
    display     : flex;
    align-items : center;
    gap         : 14px;
    margin      : 10px 0 4px;
}
.ch-apply { width : auto; margin : 0; padding : 7px 26px; }
.ch-note  { color : #333; }

/* Build up curve dialog (per-bar) */
.lcd-dialog { width : 480px; max-width : 95vw; }
.lcd-list div { padding : 7px 10px; cursor : pointer; }
.lcd-list div:hover { background : #eaf1fb; }
.lcd-pcts { color : #777; font-size : 11px; margin-left : 8px; }

/* Planned-schedule rows on learning-curve days */
.pl-lc td { background : #fff8e8; }
.pl-lc-tag {
    display       : inline-block;
    margin-left   : 5px;
    padding       : 0 5px;
    border-radius : 2px;
    background    : #b45f04;
    color         : #fff;
    font-size     : 9px;
    font-weight   : bold;
}
.mb-bar-l2 { white-space : nowrap; font-size : 9.5px; }

/* Order bars: one line of buyer/order info, centred in the bar */
.mb-bar-center {
    height          : 100%;
    display         : flex;
    align-items     : center;
    justify-content : center;
    padding         : 0 4px;
}
.mb-bar-center .mb-bar-l1 { text-overflow : ellipsis; overflow : hidden; }

.b-sch-event.mb-risk-green  { background : #43a047; color : #fff; }
.b-sch-event.mb-risk-yellow { background : #f9a825; color : #222; }
/* orange -> blue */
.b-sch-event.mb-risk-orange { background : #1e88e5; color : #fff; }
/* red -> bright FastReact red */
.b-sch-event.mb-risk-red    { background : #ee2e24; color : #fff; }
.b-sch-event.mb-risk-late   { background : #ee2e24; color : #fff; }
.b-sch-event.mb-risk-grey   { background : #9e9e9e; color : #fff; }
/* blue (draft) -> grey */
.b-sch-event.mb-risk-blue   { background : #b8b8b8; color : #222; }

/* Confirm order — red top stripe */
.b-sch-event.mb-confirm-order {
    box-shadow : none;
    overflow   : visible;
}
.b-sch-event.mb-confirm-order::after {
    content      : '';
    position     : absolute;
    top          : 0;
    left         : 0;
    right        : 0;
    height       : 6px;
    background   : #ff1744;
    border-radius: 3px 3px 0 0;
    pointer-events : none;
    z-index      : 5;
}

/* Risk red/late bars — blue top stripe */
.b-sch-event.mb-risk-red,
.b-sch-event.mb-risk-late {
    box-shadow : none;
}
.b-sch-event.mb-risk-red::after,
.b-sch-event.mb-risk-late::after {
    content      : '';
    position     : absolute;
    top          : 0;
    left         : 0;
    right        : 0;
    height       : 6px;
    background   : #3d84d6;
    border-radius: 3px 3px 0 0;
    pointer-events : none;
    z-index      : 5;
}

.b-sch-event.mb-search-dim {
    opacity : 0.18;
    filter  : grayscale(0.45);
}

.b-sch-event.mb-search-hit {
    outline    : 2px solid #fff;
    box-shadow : 0 0 0 2px #1b52ad;
    z-index    : 4;
}

.b-sch-event.b-selected { outline : 2px solid #ff9800; }

/* keep percent bar subtle under the text */
.b-sch-event .b-task-percent-bar {
    opacity : 0.25;
}

.b-sch-current-time { border-color : #6a1b9a; border-width : 1px; }
.b-sch-current-time label { display : none; }

/* Highlighted horizontal separators between the lines (rows) */
.b-grid-sub-grid-normal .b-grid-row {
    border-bottom : 1px solid #c0c0c0;
}

.b-grid-sub-grid-locked .b-grid-row {
    border-bottom : 1px solid #c0c0c0;
}

.b-grid-sub-grid-locked .b-grid-row:nth-child(even):not(.mb-hold-row):not(.mb-subtotal-row) .b-grid-cell {
    background : #f7f7f7;
}

/* FastReact: thin dark-red divider after the line-list scrollbar */
.mb-fr-vscroll-on .b-grid-splitter {
    width          : 2px !important;
    min-width      : 2px !important;
    background     : #8b1515 !important;
    border         : none !important;
    cursor         : col-resize;
    z-index        : 6;
}

.mb-fr-vscroll-on .b-grid-splitter:hover {
    background : #a51c1c !important;
}

.b-grid-splitter-buttons,
.b-grid-splitter-button-collapse,
.b-grid-splitter-buttons .b-button {
    display : none !important;
}

/* FastReact vertical scrollbar between locked lines and the timeline */
.fr-vscroll,
.fr-vscroll-pad {
    flex       : 0 0 16px;
    width      : 16px;
    min-width  : 16px;
    align-self : stretch;
    box-sizing : border-box;
}

.fr-vscroll-pad {
    background  : #fff;
    border-left : 1px solid #b0b0b0;
}

.fr-vscroll {
    display        : flex;
    flex-direction : column;
    background     : #fff;
    border-left    : 1px solid #b0b0b0;
    z-index        : 5;
    user-select    : none;
}

.fr-vscroll-btn {
    flex       : 0 0 16px;
    width      : 16px;
    height     : 16px;
    padding    : 0;
    margin     : 0;
    background : #e6e6e6;
    border     : 1px solid #fff;
    border-right-color  : #808080;
    border-bottom-color : #808080;
    position   : relative;
    cursor     : pointer;
    box-sizing : border-box;
}

.fr-vscroll-btn:active {
    background          : #d0d0d0;
    border-color        : #808080;
    border-right-color  : #fff;
    border-bottom-color : #fff;
}

.fr-vscroll-up::before,
.fr-vscroll-down::before {
    content      : '';
    position     : absolute;
    left         : 50%;
    top          : 50%;
    border-style : solid;
}

.fr-vscroll-up::before {
    border-width : 0 3.5px 5px 3.5px;
    border-color : transparent transparent #222 transparent;
    transform    : translate(-50%, -60%);
}

.fr-vscroll-down::before {
    border-width : 5px 3.5px 0 3.5px;
    border-color : #222 transparent transparent transparent;
    transform    : translate(-50%, -40%);
}

.fr-vscroll-track {
    flex       : 1 1 auto;
    position   : relative;
    min-height : 0;
    background : #fff;
    cursor     : default;
}

.fr-vscroll-thumb {
    position   : absolute;
    left       : 0;
    right      : 0;
    top        : 0;
    height     : 40px;
    background : #d8d8d8;
    border     : 1px solid #c4c4c4;
    box-sizing : border-box;
    cursor     : default;
}

.fr-vscroll-idle .fr-vscroll-thumb {
    display : none;
}

.mb-fr-vscroll-on .b-yscroll-pad,
.mb-fr-vscroll-on .b-scroll-button {
    display : none !important;
}

.mb-fr-vscroll-on .b-grid-vertical-scroller {
    overflow : clip;
}

.mb-fr-vscroll-on .b-grid-sub-grid-locked::-webkit-scrollbar,
.mb-fr-vscroll-on .b-grid-vertical-scroller::-webkit-scrollbar {
    width  : 0;
    height : 0;
}

/* Date headers: FastReact YY-MM-DD + maroon day lines */
.b-sch-header-timeaxis-cell,
.b-lowest .b-sch-header-timeaxis-cell {
    font-family    : Tahoma, Arial, sans-serif;
    font-size      : 11px;
    font-weight    : normal;
    color          : #000;
    border-right   : 2px solid #800000 !important;
    padding        : 0 2px;
    background     : #d4d0c8;
}

.b-grid-header-container {
    background : #d4d0c8;
    border-bottom : 1px solid #808080;
}

.b-sch-timeaxis-cell,
.b-sch-day-header {
    border-right : 2px solid #800000 !important;
}

/* Day separators in the timeline body: the vertical day lines are drawn
   by .b-column-line elements (not cell borders), so style them to match
   the 2px maroon separators used in the date header exactly */
.b-column-line,
.b-column-line-major {
    border-left : 2px solid #800000 !important;
}

/* FastReact horizontal slider (above Grand totals) */
.fr-hscroll {
    flex           : none;
    height         : 16px;
    display        : flex;
    flex-direction : row;
    align-items    : stretch;
    background     : #fff;
    border-top     : 1px solid #b0b0b0;
    border-bottom  : 1px solid #808080;
    z-index        : 8;
    user-select    : none;
}

.fr-hscroll-btn {
    flex       : 0 0 16px;
    width      : 16px;
    height     : 16px;
    padding    : 0;
    margin     : 0;
    background : #e6e6e6;
    border     : 1px solid #fff;
    border-right-color  : #808080;
    border-bottom-color : #808080;
    position   : relative;
    cursor     : pointer;
    box-sizing : border-box;
}

.fr-hscroll-btn:active {
    background          : #d0d0d0;
    border-color        : #808080;
    border-right-color  : #fff;
    border-bottom-color : #fff;
}

.fr-hscroll-left::before,
.fr-hscroll-right::before {
    content      : '';
    position     : absolute;
    left         : 50%;
    top          : 50%;
    border-style : solid;
}

.fr-hscroll-left::before {
    border-width : 3.5px 5px 3.5px 0;
    border-color : transparent #222 transparent transparent;
    transform    : translate(-60%, -50%);
}

.fr-hscroll-right::before {
    border-width : 3.5px 0 3.5px 5px;
    border-color : transparent transparent transparent #222;
    transform    : translate(-40%, -50%);
}

.fr-hscroll-track {
    flex       : 1 1 auto;
    position   : relative;
    min-width  : 0;
    background : #fff;
}

.fr-hscroll-thumb {
    position   : absolute;
    top        : 0;
    bottom     : 0;
    left       : 0;
    width      : 80px;
    background : #d8d8d8;
    border     : 1px solid #c4c4c4;
    box-sizing : border-box;
}

/* Keep Bryntum's HORIZONTAL scrollbar row: a desktop mouse (no trackpad
   pan) needs a draggable bar to move through the dates. Only the vertical
   native scrollbar is replaced by the custom fr-vscroll. */
.mb-fr-vscroll-on .b-virtual-scrollers {
    height         : auto !important;
    min-height     : 0 !important;
    overflow       : visible !important;
    pointer-events : auto;
    border-top     : 1px solid #c4c4c4 !important;
    background     : #eceae6;
}

/* Always-visible, mouse-friendly horizontal scrollbar under the timeline */
.mb-fr-vscroll-on .b-virtual-scroller {
    overflow-x : scroll !important;
    overflow-y : hidden !important;
    height     : 16px;
    scrollbar-width : auto;           /* Firefox */
}
.mb-fr-vscroll-on .b-virtual-scroller::-webkit-scrollbar {
    height     : 14px;
    background : #eceae6;
}
.mb-fr-vscroll-on .b-virtual-scroller::-webkit-scrollbar-thumb {
    background    : #9aa7bd;
    border        : 3px solid #eceae6;
    border-radius : 7px;
}
.mb-fr-vscroll-on .b-virtual-scroller::-webkit-scrollbar-thumb:hover {
    background : #6f83a6;
}
/* The locked (line-name) side never scrolls — hide its stub */
.mb-fr-vscroll-on .b-virtual-scrollers > .b-virtual-scroller:first-child {
    overflow-x : hidden !important;
}

/* FastReact footer legend */
.fr-legendbar {
    flex           : none;
    display        : flex;
    align-items    : stretch;
    background     : #d4d0c8;
    border-top     : 1px solid #808080;
    font-family    : Tahoma, Arial, sans-serif;
    font-size      : 10px;
    color          : #000;
    min-height     : 32px;
}

.fr-leg-col {
    flex           : 1 1 0;
    padding        : 2px 8px;
    border-right   : 1px solid #a8a8a8;
    display        : flex;
    flex-direction : column;
    justify-content: center;
    gap            : 1px;
    white-space    : nowrap;
}

.fr-leg-col span { color : #333; }
.fr-leg-last { border-right : none; }

.fr-leg-dot {
    display       : inline-block;
    width         : 8px;
    height        : 8px;
    border-radius : 50%;
    margin-right  : 4px;
    vertical-align: middle;
}
.fr-leg-red { background : #cc0000; }

/* ------------------------------------------------------------------ */
/* Summary footer                                                     */
/* ------------------------------------------------------------------ */
.b-grid-footer-container {
    background : #eceae6;
    border-top : 1px solid #808080;
    min-height : 44px;
    max-height : 48px;
}

.b-grid-footer { padding : 1px 2px; }

.fr-gt {
    display        : flex;
    flex-direction : column;
    align-items    : center;
    font-size      : 11px;
    line-height    : 1.15;
    font-family    : Tahoma, Arial, sans-serif;
    color          : #000;
}
.fr-gt-pos { color : #0033cc; font-weight : bold; }
.fr-gt-neg { color : #cc0000; font-weight : bold; }

/* Grand totals rows: day plan (blue) / SAH / avg eff / production (green) / +/- */
.fr-gt-plan { color : #17356b; font-weight : bold; }
.fr-gt-sah  { color : #6a1b9a; font-weight : bold; }
.fr-gt-eff  { color : #b45f04; font-weight : bold; }
.fr-gt-act  { color : #0a8f3c; font-weight : bold; }

.fr-gt-legend {
    font-size   : 9px;
    font-weight : normal;
    color       : #555;
    line-height : 1.2;
}

/* Grand-totals head: title left, row labels stacked on the right — each
   label lines up horizontally with its data row in the day cells */
.fr-gt-head {
    display         : flex;
    justify-content : space-between;
    align-items     : center;
    gap             : 8px;
}
.fr-gt-title { font-weight : bold; }
.fr-gt-legend-col {
    display        : flex;
    flex-direction : column;
    align-items    : flex-end;
    font-size      : 11px;
    line-height    : 1.15;
}

.fr-grand-label { font-weight : normal; color : #000; padding-left : 4px; }

/* ------------------------------------------------------------------ */
/* Tooltip                                                            */
/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* Tooltip — 3-section compact card                                   */
/* ------------------------------------------------------------------ */
.b-tooltip.mb-fr-tip,
.b-sch-event-tooltip.mb-fr-tip {
    background    : #fff;
    border        : none;
    border-radius : 8px;
    box-shadow    : 0 4px 18px rgba(0,0,0,.22), 0 1px 4px rgba(0,0,0,.12);
    padding       : 0;
    color         : #222;
    max-width     : 440px;
    min-width     : 340px;
    z-index       : 9999 !important;
}

.b-tooltip.mb-fr-tip .b-tooltip-content,
.b-sch-event-tooltip.mb-fr-tip .b-tooltip-content {
    background : transparent;
    padding    : 0;
    color      : #222;
    min-height : 0;
}

.b-tooltip.mb-fr-tip .b-tooltip-arrow,
.b-sch-event-tooltip.mb-fr-tip .b-tooltip-arrow { display : none; }

/* ── Tooltip v4 ─────────────────────────────────────────── */
.mb-tip4 {
    font-size      : 12px;
    line-height    : 1.45;
    font-family    : 'Segoe UI', Tahoma, Arial, sans-serif;
    border-radius  : 10px;
    background     : #f4f6fb;
    min-height     : 0;
    overflow-y     : auto;
    overflow-x     : hidden;
    scrollbar-width: thin;
    scrollbar-color: #c5d4ea #f4f6fb;
}

/* Header strip */
.tip4-hdr {
    display         : flex;
    align-items     : center;
    justify-content : space-between;
    gap             : 8px;
    padding         : 7px 12px 6px;
    background      : linear-gradient(135deg, #0d2b72 0%, #1565c0 100%);
    color           : #fff;
}
.tip4-hdr-name {
    font-size   : 12px;
    font-weight : 700;
    letter-spacing : .3px;
    white-space : nowrap;
    overflow    : hidden;
    text-overflow : ellipsis;
    max-width   : 260px;
}
.tip4-hdr-badges { display : flex; gap : 5px; flex-shrink : 0; }

/* Cards */
.tip4-card {
    margin      : 6px 8px;
    border-radius : 7px;
    overflow    : hidden;
    background  : #fff;
    border      : 1px solid #e0e6f0;
    box-shadow  : 0 1px 3px rgba(0,0,0,.06);
}
.tip4-card:last-child { margin-bottom : 8px; }

.tip4-card-hd {
    font-size      : 10px;
    font-weight    : 700;
    text-transform : uppercase;
    letter-spacing : .5px;
    padding        : 4px 10px;
    background     : #f0f4fc;
    color          : #1565c0;
    border-bottom  : 1px solid #dde6f5;
}

.tip4-card-body {
    padding : 5px 9px 6px;
}
.tip4-has-img {
    display : flex;
    gap     : 8px;
    align-items : flex-start;
}

/* Style image */
.tip-img-wrap {
    flex          : none;
    width         : 54px;
    height        : 62px;
    overflow      : hidden;
    border        : 1px solid #d0d8ea;
    border-radius : 4px;
    background    : #f5f7fc;
}
.tip-img {
    width      : 100%;
    height     : 100%;
    object-fit : cover;
}

/* Row container */
.tip4-rows { display : flex; flex-direction : column; gap : 0; flex : 1; min-width : 0; }

/* 2-column sub-grid (2 label:value pairs per row) */
.tip4-2col {
    display               : grid;
    grid-template-columns : 1fr 1fr;
    gap                   : 0 6px;
}

/* Single label:value row */
.t4r {
    display     : flex;
    align-items : baseline;
    gap         : 4px;
    padding     : 2px 0;
    min-width   : 0;
    border-bottom : 1px solid #eef1f8;
}
.t4r:last-child { border-bottom : none; }
.t4-full  { grid-column : span 2; }

.t4l {
    flex        : 0 0 62px;
    font-size   : 10px;
    font-weight : 600;
    color       : #7a8faa;
    white-space : nowrap;
    line-height : 1.5;
}
.t4v {
    flex       : 1;
    font-size  : 11.5px;
    color      : #18284a;
    min-width  : 0;
    overflow   : hidden;
    text-overflow : ellipsis;
    white-space   : nowrap;
    line-height   : 1.5;
}
.t4v b  { font-weight : 700; color : #0d2b72; }
.t4dim  { color : #aab; font-style : italic; }
.t4-order-no { font-size : 12.5px; font-weight : 700; color : #0d2b72; }

/* Badges */
.tip4-badge {
    display       : inline-flex;
    align-items   : center;
    padding       : 1px 8px;
    border-radius : 10px;
    font-size     : 10px;
    font-weight   : 700;
    white-space   : nowrap;
}
.tip4-confirm { background : #e8f5e9; color : #2e7d32; border : 1px solid #a5d6a7; }
.tip4-proj    { background : #fff3e0; color : #bf6000; border : 1px solid #ffcc80; }
.tip4-consol  { background : #e3f2fd; color : #1565c0; border : 1px solid #90caf9; }

/* Wash / booking status pills */
.tip-badge {
    display       : inline-block;
    padding       : 1px 7px;
    border-radius : 10px;
    font-size     : 11px;
    font-weight   : bold;
}
.tip-ok   { background : #e8f5e9; color : #2e7d32; border : 1px solid #a5d6a7; }
.tip-pend { background : #fff3e0; color : #e65100; border : 1px solid #ffcc80; }

/* Techpack link */
.tip-link {
    color           : #1565c0;
    text-decoration : underline;
    font-size       : 11px;
}

/* Color swatch (inline) */
.tip4-swatch {
    display        : inline-block;
    width          : 10px;
    height         : 10px;
    border-radius  : 2px;
    vertical-align : middle;
    margin-right   : 4px;
    border         : 1px solid rgba(0,0,0,.15);
}

/* PO pills (when many POs shown inline) */
.tip4-po-pill {
    display       : inline-block;
    margin        : 1px 2px 1px 0;
    padding       : 1px 6px;
    border-radius : 8px;
    font-size     : 11px;
    font-weight   : 600;
    background    : #e8eef8;
    color         : #1a3a7a;
    border        : 1px solid #c5d4ea;
}

/* Confirm order PO breakdown table */
.tip4-po-block {
    margin-top    : 8px;
    border-top    : 1px solid #e0e6f0;
    padding-top   : 6px;
}
.tip4-po-hd {
    font-size      : 10px;
    font-weight    : 700;
    text-transform : uppercase;
    letter-spacing : .4px;
    color          : #8898b0;
    margin-bottom  : 5px;
}
.tip4-po-tbl {
    width           : 100%;
    border-collapse : collapse;
    font-size       : 11px;
}
.tip4-po-tbl thead tr {
    background : #f0f4fc;
}
.tip4-po-tbl th {
    padding    : 3px 7px;
    text-align : left;
    font-size  : 10px;
    font-weight: 700;
    color      : #5572a0;
    text-transform : uppercase;
    letter-spacing : .3px;
    border-bottom  : 1px solid #dde6f5;
}
.tip4-po-tbl td {
    padding       : 4px 7px;
    border-bottom : 1px solid #f0f4fc;
}
.tip4-po-tbl tr:last-child td { border-bottom : none; }
.tip4-po-tbl tr:nth-child(even) { background : #f8faff; }
.tip4-po-no  { font-family : monospace; font-weight : 600; color : #1a3a7a; font-size : 12px; }
.tip4-po-qty { font-weight : 700; color : #0d2b72; text-align : right; }
.tip4-po-del { color : #444; }

/* Legacy single-section tooltip still works */
.mb-tip {
    font-size   : 12px;
    line-height : 1.4;
    color       : #000;
    font-family : Tahoma, Arial, sans-serif;
    white-space : nowrap;
    padding     : 4px 8px;
}

.mb-tip-stage { text-decoration : underline; }
.mb-tip-order { font-weight : bold; }
.mb-tip-title { font-weight : bold; margin-bottom : 2px; }
.mb-tip ul    { margin : 4px 0 0; padding-left : 16px; }

/* ------------------------------------------------------------------ */
/* Unplanned order panel (document 3.2)                               */
/* ------------------------------------------------------------------ */
.mb-unplanned {
    width       : 232px;
    flex        : none;
    background  : #f7f5ef;
    border-left : 1px solid #a9a494;
    overflow-y  : auto;
    padding     : 6px;
}

.mb-unp-head {
    font-weight : bold;
    font-size   : 12px;
    display     : flex;
    align-items : center;
    gap         : 6px;
}

.mb-unp-count {
    background    : #d40000;
    color         : #fff;
    border-radius : 8px;
    padding       : 0 7px;
    font-size     : 10px;
}

.mb-unp-hint { color : #666; font-size : 10px; margin : 2px 0 8px; }

.mb-unp-card {
    background    : #fff;
    border        : 1px solid #b8b4a8;
    border-left   : 4px solid #1e88e5;
    border-radius : 3px;
    padding       : 5px 7px;
    margin-bottom : 6px;
    cursor        : grab;
    line-height   : 1.45;
}

.mb-unp-card:active { cursor : grabbing; }
.mb-unp-card:hover  { border-color : #1b52ad; box-shadow : 0 1px 4px rgba(0, 0, 0, 0.25); }

.mb-unp-row1 { display : flex; justify-content : space-between; align-items : center; font-size : 11px; }
.mb-unp-row2 { font-size : 10px; color : #333; }
.mb-unp-row3 { font-size : 10px; color : #555; }
.mb-unp-row4 { font-size : 10px; color : #1b52ad; }

.mb-prio { padding : 0 6px; border-radius : 7px; color : #fff; font-size : 9px; }
.mb-prio-1 { background : #e53935; }
.mb-prio-2 { background : #fb8c00; }
.mb-prio-3 { background : #9e9e9e; }

.mb-unp-empty { color : #2e7d32; font-weight : bold; text-align : center; padding : 12px 0; }

/* ------------------------------------------------------------------ */
/* Order detail panel                                                 */
/* ------------------------------------------------------------------ */
.fr-orderbar {
    flex           : none;
    background     : #d4d0c8;
    border-top     : 1px solid #808080;
    padding        : 1px 4px;
    display        : flex;
    flex-direction : column;
    gap            : 0;
    font-family    : Tahoma, Arial, sans-serif;
    font-size      : 11px;
}

.fr-order-row {
    display     : flex;
    align-items : center;
    gap         : 14px;
    height      : 18px;
    white-space : nowrap;
    overflow    : hidden;
}

.fr-order-label {
    flex        : 0 0 82px;
    display     : flex;
    align-items : center;
    gap         : 4px;
    font-weight : bold;
}

.fr-order-ico { font-size : 12px; }

.fr-cell { flex : 0 0 auto; }
.fr-wide { flex : 0 1 560px; overflow : hidden; text-overflow : ellipsis; }

.fr-plain { color : #000; }

.fr-link {
    color           : #17356b;
    text-decoration : underline;
    cursor          : pointer;
}

.fr-magenta { color : #b0189c; }

/* ------------------------------------------------------------------ */
/* Off-day columns: FastReact teal crosshatch                          */
/* ------------------------------------------------------------------ */
.b-time-ranges-canvas .b-sch-range.mb-off,
.b-grid-sub-grid-normal .b-sch-nonworkingtime,
.b-grid-sub-grid-normal .b-sch-non-working-time,
.b-grid-sub-grid-normal .b-sch-range.b-nonworkingtime {
    background :
        repeating-linear-gradient(45deg, #d8d8d8 0 1px, transparent 1px 6px),
        repeating-linear-gradient(-45deg, #d8d8d8 0 1px, transparent 1px 6px),
        #f4f4f4 !important;
}

/* Hours changed from the weekly default — FastReact's maroon crosshatch */
.b-time-ranges-canvas .b-sch-range.mb-hours-changed {
    background :
        repeating-linear-gradient(45deg, rgba(140,26,26,.55) 0 1px, transparent 1px 5px),
        repeating-linear-gradient(-45deg, rgba(140,26,26,.55) 0 1px, transparent 1px 5px),
        rgba(255,244,244,.6) !important;
}
.b-time-ranges-canvas .b-sch-range.mb-hours-changed label {
    font-size  : 9px;
    font-weight : bold;
    color      : #8c1a1a;
}

.b-sch-range.mb-today,
.b-time-ranges-canvas .b-sch-range.mb-today {
    background :
        repeating-linear-gradient(45deg, #f0e070 0 1px, transparent 1px 6px),
        repeating-linear-gradient(-45deg, #f0e070 0 1px, transparent 1px 6px),
        #fffde0 !important;
    z-index : 0;
}

/* ------------------------------------------------------------------ */
/* Calendars dialog (FastReact style)                                  */
/* ------------------------------------------------------------------ */
.cal-overlay {
    position   : fixed;
    inset      : 0;
    background : rgba(0, 0, 0, 0.25);
    z-index    : 30000;
    display    : flex;
    align-items : center;
    justify-content : center;
}

.cal-dialog {
    width      : 700px;
    background : #f0efe8;
    border     : 1px solid #7a7a7a;
    box-shadow : 3px 4px 12px rgba(0, 0, 0, 0.45);
    font-size  : 12px;
}

.cal-title {
    display     : flex;
    align-items : center;
    padding     : 6px 10px;
    font-weight : bold;
    font-size   : 13px;
    background  : #fff;
    border-bottom : 1px solid #c9c5b8;
}

.cal-title-btns { margin-left : auto; }

.cal-x {
    cursor  : pointer;
    padding : 0 6px;
    font-weight : normal;
}

.cal-x:hover { background : #d64541; color : #fff; }

.cal-tabs {
    display : flex;
    gap     : 2px;
    padding : 4px 6px;
    background : #f0efe8;
    border-bottom : 1px solid #c9c5b8;
}

.cal-tab {
    padding : 4px 10px;
    border  : 1px outset #fff;
    background : #e9e6df;
    cursor  : default;
    white-space : nowrap;
}

.cal-tab-active { background : #fff; border-style : inset; }
.cal-tab:hover  { background : #f4f2ec; }

.cal-body {
    display : flex;
    gap     : 14px;
    padding : 12px;
}

.cal-left { width : 190px; flex : none; }

.cal-label { margin-bottom : 3px; }

.cal-name {
    width   : 100%;
    padding : 3px 5px;
    border  : 1px inset #999;
    font-family : inherit;
    font-size : 12px;
    box-sizing : border-box;
}

.cal-list {
    height     : 240px;
    background : #fff;
    border     : 1px inset #999;
    margin     : 4px 0 10px;
    overflow-y : auto;
}

.cal-list div { padding : 3px 8px; cursor : default; }
.cal-list .cal-sel { background : #1b52ad; color : #fff; }

.cal-btn {
    display : block;
    width   : 100%;
    padding : 6px;
    margin-bottom : 6px;
    border  : 1px outset #fff;
    background : #e9e6df;
    cursor  : pointer;
    font-family : inherit;
    font-size : 12px;
}

.cal-btn:active { border-style : inset; }
.cal-btn-primary { border : 1px solid #1b52ad; }

.cal-right { flex : 1; }

.cal-wh-tab {
    display : inline-block;
    padding : 4px 12px;
    background : #fff;
    border  : 1px solid #c9c5b8;
    border-bottom : none;
    margin-bottom : 0;
}

.cal-grid {
    display : grid;
    grid-template-columns : 110px 90px 90px 170px;
    gap : 6px 12px;
    background : #fff;
    border : 1px solid #c9c5b8;
    padding : 12px;
    align-items : center;
}

.cal-ghead { font-weight : bold; color : #17356b; }
.cal-day   { text-align : left; }
.cal-total-label { font-weight : normal; }

.cal-in {
    width   : 70px;
    padding : 3px 6px;
    border  : 1px inset #999;
    font-family : inherit;
    font-size : 12px;
    text-align : center;
}

.cal-in.cal-off { background : #ffe9e9; color : #c62828; font-weight : bold; }
.cal-in.cal-ro  { background : #f0efe8; }

.cal-shifts { margin-top : 10px; display : flex; gap : 10px; align-items : center; }

.cal-hint { margin-top : 10px; color : #555; }

/* ------------------------------------------------------------------ */
/* Pick & place (FastReact: bar follows pointer)                       */
/* ------------------------------------------------------------------ */
.mb-carrying,
.mb-carrying * { cursor : grabbing !important; }

body.mb-carry-active,
body.mb-carry-active * { cursor : grabbing !important; }

.mb-carry-layer,
.mb-carry-layer * {
    pointer-events : none !important;
}

/* Picked-up bar leaves its old position while being carried */
.b-sch-event.mb-carried-away { display : none !important; }
.b-sch-event-wrap:has(.mb-carried-away) { display : none !important; }

.mb-carry-layer {
    position       : fixed;
    inset          : 0;
    pointer-events : none;
    z-index        : 99999;
}

.mb-carry-vacancy,
.mb-carry-bar {
    position    : fixed;
    left        : 0;
    top         : 0;
    box-sizing  : border-box;
    will-change : transform;
}

.mb-carry-vacancy {
    border     : 1px dashed rgba(80, 80, 80, 0.75);
    background : rgba(255, 255, 255, 0.65);
    z-index    : 1;
}

.mb-carry-bar {
    border     : 1px solid rgba(0, 0, 0, 0.55);
    color      : #fff;
    font-size  : 10px;
    line-height : 1.25;
    overflow   : hidden;
    opacity    : 0.97;
    z-index    : 3;
}

.mb-carry-bar-invalid {
    opacity : 0.5;
    filter  : grayscale(0.6);
}

.mb-carry-bar-label {
    background    : rgba(255, 255, 255, 0.92);
    color         : #000;
    font-weight   : bold;
    padding       : 1px 5px;
    white-space   : nowrap;
    overflow      : hidden;
    text-overflow : ellipsis;
    border-bottom : 1px solid rgba(0, 0, 0, 0.25);
}

/* ------------------------------------------------------------------ */
/* Bottom window taskbar                                               */
/* ------------------------------------------------------------------ */
.fr-taskbar {
    position   : relative;
    z-index    : 40000;   /* stays clickable above dialog overlays */
    display    : flex;
    gap        : 3px;
    padding    : 3px 4px;
    background : #e9e6df;
    border-top : 1px solid #a9a494;
    flex       : none;
}

.fr-task {
    display     : flex;
    align-items : center;
    gap         : 6px;
    padding     : 4px 10px;
    background  : #f4f2ec;
    border      : 1px outset #fff;
    cursor      : pointer;
    font-size   : 11px;
    max-width   : 220px;
}

.fr-task:hover { background : #cfe0f7; }

.fr-task-min {
    border-style : inset;
    background   : #e0ddd4;
    font-style   : italic;
}

.fr-task-t {
    white-space   : nowrap;
    overflow      : hidden;
    text-overflow : ellipsis;
}

.fr-task-x {
    padding   : 0 3px;
    color     : #7a1f1f;
    font-size : 10px;
}

.fr-task-x:hover { background : #d64541; color : #fff; }

.cal-minbtn { margin-right : 2px; }
.cal-minbtn:hover { background : #1b52ad; color : #fff; }

/* ------------------------------------------------------------------ */
/* Toasts                                                             */
/* ------------------------------------------------------------------ */
.mb-toasts {
    position : fixed;
    top      : 64px;
    right    : 246px;
    z-index  : 20000;
    display  : flex;
    flex-direction : column;
    gap      : 6px;
    max-width : 380px;
}

.mb-toast {
    padding       : 8px 12px;
    border-radius : 4px;
    color         : #fff;
    font-size     : 12px;
    box-shadow    : 0 2px 8px rgba(0, 0, 0, 0.35);
}

.mb-toast-error { background : #c62828; }
.mb-toast-warn  { background : #ef6c00; }
.mb-toast-ok    { background : #2e7d32; }
</style>
