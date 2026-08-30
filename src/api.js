// ---------------------------------------------------------------------------
// Planning API client - loads board data from the MySQL-backed API
// (server/index.mjs -> 172.16.101.70 / fastreact). Falls back to the bundled
// demo dataset when the API or database is unreachable.
// ---------------------------------------------------------------------------
import {
    calcRisk, computeLineUtil, WORK_MIN_PER_DAY, buildManpowerRanges,
    addWorkDays, nextWorkingDay, startOfWorkDay, endOfWork, elapsedDays,
    addCalDays, randSmv, productTypeFor, LINES, STAGE_RESOURCES, clampIntoWorkWindow
} from './planningData.js';
import { lineIdOf } from './AppConfig.js';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1/planning';

const CODE_TO_ID = {
    L01 : 'l1', L02 : 'l2', L03 : 'l3', L04 : 'l4',
    L05 : 'l5', L06 : 'l6', L07 : 'l7', L08 : 'l8',
    CUT1 : 'cut1', WSH1 : 'wash1', FIN1 : 'fin1', PCK1 : 'pack1'
};

const STAGE_NAME = {
    cutting : 'Cutting', wash : 'Wash', finishing : 'Finishing',
    packing : 'Packing', inspection : 'Inspection', shipment : 'Shipment'
};

const UNIT_NAMES = { 1 : 'AQL', 2 : 'MBM', 3 : 'AQL', 4 : 'Cutting', 5 : 'Finishing' };
const unitLabel = id => UNIT_NAMES[Number(id)] || (id ? `Unit ${id}` : 'AQL');

const asDate = v => (v ? new Date(String(v).replace(' ', 'T')) : null);

function buildBoardResources(sewing, stages, effUnitId, effUnitName) {
    const firstLine = sewing[0];
    const unit = firstLine?.unit || effUnitName || unitLabel(effUnitId) || 'AQL';
    const floor = firstLine?.floor || 'F1';
    return [
        {
            id : 'hold', name : 'Holding Row',
            unit, floor,
            manpower : 0, machines : 0, eff : 0, availMin : 0,
            holdingRow : true, cls : 'mb-hold-row'
        },
        ...sewing,
        {
            id : 'subtot', name : 'Subtotal Row',
            unit, floor : firstLine?.floor || floor,
            manpower : sewing.reduce((a, l) => a + Number(l.manpower || 0), 0),
            machines : sewing.reduce((a, l) => a + Number(l.machines || 0), 0),
            eff : 0, availMin : 0,
            subtotalRow : true, cls : 'mb-subtotal-row'
        },
        ...stages
    ];
}

function fallbackSewingLines(effUnitId, effUnitName) {
    const unit = effUnitName || unitLabel(effUnitId) || 'AQL';
    return LINES.map(l => ({
        id : l.id, dbId : null, name : l.name,
        unit : l.unit || unit, unitId : effUnitId, floor : l.floor,
        manpower : l.manpower, machines : l.machines, eff : l.eff,
        availMin : l.availMin, utilization : 0, lineRow : true
    }));
}

function parseEventNotes(notes) {
    if (!notes) return {};
    try {
        const n = typeof notes === 'string' ? JSON.parse(notes) : notes;
        return n && typeof n === 'object' ? n : {};
    }
    catch { return {}; }
}

function eventParked(notes) {
    return !!parseEventNotes(notes).parked;
}

function eventNotesPayload(raw, onHold) {
    const notes = {
        parked     : !!(onHold || raw.parked),
        userPinned : !!raw.userPinned,
        manualGap  : !!raw.manualGap
    };
    return JSON.stringify(notes);
}

function hasClockTime(d) {
    return !!(d && (d.getHours() || d.getMinutes() || d.getSeconds()));
}

function boardSpanFromDb(e) {
    const pinned = !!parseEventNotes(e.notes).userPinned || !!parseEventNotes(e.notes).manualGap;
    const rawStart = asDate(e.start_date);
    const rawEnd   = asDate(e.end_date);
    const dur      = Number(e.duration) || 1;
    let start;
    if (rawStart && (pinned || hasClockTime(rawStart))) {
        start = clampIntoWorkWindow(rawStart);
    }
    else {
        start = startOfWorkDay(nextWorkingDay(rawStart || new Date()));
    }
    let end;
    if (rawEnd && rawEnd > start && (pinned || hasClockTime(rawEnd))) {
        end = rawEnd;
    }
    else {
        end = endOfWork(start, dur);
    }
    return { start, end, dur, pinned };
}

function orderRowId(planningOrderId) {
    return planningOrderId ? `dbo-${planningOrderId}` : null;
}

function buildEventRaw(e, effUnitId, qty, orderQty, smv, dur, start, end, ship, status) {
    const orderId = e.planning_order_id || null;
    return {
        id       : orderRowId(orderId),
        buyer    : e.buyer_name || '',
        style    : e.style_no || '',
        po       : e.po_number || '',
        mbmOrder : e.order_code || '',
        eventCode : e.event_code || null,
        productType : productTypeFor(e.po_number, e.product_category),
        qty, orderQty : orderQty || qty, smv,
        reqMin   : Math.round(qty * smv),
        dur, start, end,
        pcd      : asDate(e.pcd) || (ship ? addCalDays(ship, -30) : null),
        ship,
        matReady : asDate(e.material_ready_date),
        progress : Number(e.percent_done) || 0,
        status,
        // Sewing that runs past the shipment date is a late plan (yellow strip)
        latePlan : !!(ship && end && end > ship),
        userPinned : !!parseEventNotes(e.notes).userPinned,
        manualGap  : !!parseEventNotes(e.notes).manualGap,
        dbId     : orderId,
        unitId   : e.order_unit_id != null ? Number(e.order_unit_id) : effUnitId,
        unitName : unitLabel(e.order_unit_id ?? effUnitId),
        risk     : { score : 0, level : 'low', label : 'On track', reasons : [] }
    };
}

function fallbackStageLines(effUnitId, effUnitName) {
    const unit = effUnitName || unitLabel(effUnitId) || 'AQL';
    return STAGE_RESOURCES.map(s => ({
        id : s.id, dbId : null, name : s.name,
        unit : s.unit || unit, unitId : effUnitId, floor : s.floor,
        stageRow : true, cls : 'mb-stage-row'
    }));
}

async function get(path, timeoutMs = 4000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        const res = await fetch(`${API_BASE}${path}`, { signal : ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    }
    finally {
        clearTimeout(t);
    }
}

// ---------------------------------------------------------------------------
// Daily production updates (day_production_update_plan table)
// ---------------------------------------------------------------------------
export async function loadProdUpdatesDb() {
    const data = await get('/production-updates');
    if (!data.success) throw new Error(data.error || 'load failed');
    return data.rows || [];
}

export async function saveProdUpdatesDb(rows) {
    const res = await fetch(`${API_BASE}/production-updates`, {
        method  : 'POST',
        headers : { 'Content-Type' : 'application/json' },
        body    : JSON.stringify({ rows })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'save failed');
    return data;
}

// ---------------------------------------------------------------------------
// efficiency_profile / learning_curve tables - data collected
// from the running board (see App.vue syncMasterData)
// ---------------------------------------------------------------------------
async function postRows(path, rows) {
    const res = await fetch(`${API_BASE}${path}`, {
        method  : 'POST',
        headers : { 'Content-Type' : 'application/json' },
        body    : JSON.stringify({ rows })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'save failed');
    return data;
}

export const saveEffProfilesDb     = rows => postRows('/efficiency-profiles', rows);
export const saveLearningCurvesDb  = rows => postRows('/learning-curves', rows);

// Fresh unplanned orders straight from the planning_orders table - used to
// keep the Orders window in sync with the DB (imported ERP orders included)
function mapUnplannedRow(o) {
    const ship = asDate(o.shipment_date);
    let suitable = [];
    try {
        const raw = typeof o.suitable_lines === 'string'
            ? JSON.parse(o.suitable_lines)
            : o.suitable_lines || [];
        suitable = raw.map(code => CODE_TO_ID[code] || code);
    }
    catch { /* bad JSON */ }
    return {
        id       : `dbo-${o.id}`,
        dbId     : o.id,
        buyer    : o.buyer_name,
        style    : o.style_no,
        po       : o.po_number,
        mbmOrder : o.order_code || '',
        productType : productTypeFor(o.po_number, o.product_category),
        qty      : Number(o.remaining_quantity ?? o.order_quantity),
        orderQty : Number(o.order_quantity ?? o.remaining_quantity),
        smv      : Number(o.smv) > 0 ? Number(o.smv) : randSmv(o.po_number),
        pcd      : asDate(o.pcd) || (ship ? addCalDays(ship, -30) : null),
        matReady : asDate(o.material_ready_date),
        ship,
        priority : o.priority,
        suitable,
        unitId   : o.unit_id != null ? Number(o.unit_id) : null,
        unitName : o.unit_name || unitLabel(o.unit_id)
    };
}

// Load first N rows immediately (fast), then stream the rest via callback
export async function loadUnplannedDb(limit = 9999) {
    const unp = await get(`/unplanned-orders?limit=${limit}&offset=0`);
    if (!unp.success) throw new Error(unp.error || 'load failed');
    return (unp.rows || []).map(mapUnplannedRow).filter(u => String(u.buyer || '').trim());
}

// Load page-by-page in background; calls onBatch(rows, total) for each chunk
// unitId — if provided, only orders for that unit are returned
export async function loadUnplannedDbPaged(firstLimit, onBatch, unitId = null) {
    const PAGE    = 500;
    const unitQ   = unitId ? `&unit_id=${unitId}` : '';

    // First page — fast
    const first = await get(`/unplanned-orders?limit=${firstLimit}&offset=0${unitQ}`);
    if (!first.success) throw new Error(first.error || 'load failed');
    const total = first.total || 0;
    const firstRows = (first.rows || []).map(mapUnplannedRow).filter(u => String(u.buyer || '').trim());
    onBatch(firstRows, total, 0);

    // Rest in background chunks
    let offset = firstLimit;
    while (offset < total) {
        const page = await get(`/unplanned-orders?limit=${PAGE}&offset=${offset}${unitQ}`);
        if (!page.success) break;
        const chunk = (page.rows || []).map(mapUnplannedRow).filter(u => String(u.buyer || '').trim());
        if (!chunk.length) break;
        onBatch(chunk, total, offset);
        offset += PAGE;
    }
}

// Load scheduler data + unplanned orders and map them to the shapes the
// board uses (see AppConfig.js / planningData.js)
// unitId — when set, only resources/events/orders for that unit are returned
export async function loadFromApi(unitId = null) {
    const unitQ = unitId ? `?unit_id=${unitId}` : '';
    const data = await get(`/projects/1/scheduler-data${unitQ}`);
    if (!data.success) throw new Error(data.error || 'load failed');

    const effUnitId = unitId || data.project?.unitId || null;
    const effUnitName = data.project?.unitName || unitLabel(effUnitId);
    const unpQ  = effUnitId ? `?unit_id=${effUnitId}` : '';
    const unp    = await get(`/unplanned-orders${unpQ}`);

    const dbIdToBoardId = {};
    const mapped = data.resources.rows.map(r => {
        const boardId = CODE_TO_ID[r.resource_code] || `r${r.id}`;
        dbIdToBoardId[r.id] = boardId;
        const isLine = r.resource_type === 'sewing_line';
        return isLine
            ? {
                id : boardId, dbId : r.id, name : r.resource_name,
                unit : effUnitName, unitId : r.unit_id, floor : `F${r.floor_id}`,
                manpower : r.manpower, machines : r.machine_count,
                eff : Number(r.default_efficiency),
                availMin : Number(r.capacity_minutes_per_day) ||
                    Math.round(r.manpower * WORK_MIN_PER_DAY * r.default_efficiency / 100),
                utilization : 0, lineRow : true
            }
            : {
                id : boardId, dbId : r.id, name : r.resource_name,
                unit : effUnitName, unitId : r.unit_id, floor : `F${r.floor_id}`,
                stageRow : true, cls : 'mb-stage-row'
            };
    });

    const firstLine = mapped.find(r => r.lineRow);
    let sewing = mapped.filter(r => r.lineRow);
    let stages = mapped.filter(r => !r.lineRow);
    if (!sewing.length) {
        sewing = fallbackSewingLines(effUnitId, effUnitName);
        if (!stages.length) stages = fallbackStageLines(effUnitId, effUnitName);
    }
    const resources = buildBoardResources(sewing, stages, effUnitId, effUnitName);

    setLineResourceDbMap(Object.fromEntries(
        sewing.filter(l => l.dbId != null).map(l => [l.id, l.dbId])
    ));

    const lineById = Object.fromEntries(resources.filter(r => r.lineRow).map(l => [l.id, l]));

    const resourceOfEvent = {};
    for (const a of data.assignments.rows) {
        resourceOfEvent[a.event_id] = dbIdToBoardId[a.resource_id];
    }

    const events = [];
    const extraUnplanned = [];
    for (const e of data.events.rows) {
        const isStage = e.production_stage && e.production_stage !== 'sewing';
        const mappedId = resourceOfEvent[e.id]
            || (e.resource_id != null ? dbIdToBoardId[e.resource_id] : null);
        const known = mappedId && resources.some(r => r.id === mappedId && r.id !== 'hold');
        const orderQty = Number(e.order_quantity) || Number(e.planned_quantity) || 0;
        const qty   = Number(e.planned_quantity ?? e.order_quantity) || 0;
        const smv   = Number(e.smv) > 0 ? Number(e.smv) : randSmv(e.po_number);
        const { start, end, dur } = boardSpanFromDb(e);
        const status = e.event_status === 'completed' ? 'completed' : e.event_status;
        const ship  = asDate(e.shipment_date);
        const hasBuyer = String(e.buyer_name || '').trim();

        // Sewing orders with no buyer stay off the list and off the board
        if (!isStage && !hasBuyer) continue;

        const parked = eventParked(e.notes);
        const unassigned = !known;

        // Parked (saved hold) or unassigned sewing events → Holding Row
        if (!isStage && (parked || unassigned)) {
            events.push({
                id         : `db-${e.id}`,
                dbId       : e.id,
                resourceId : 'hold',
                startDate  : start,
                endDate    : end,
                duration   : elapsedDays(start, end),
                durationUnit : 'day',
                manuallyScheduled : !!e.manually_scheduled,
                name       : e.event_name,
                percentDone : Number(e.percent_done) || 0,
                draggable  : status !== 'completed',
                resizable  : status !== 'completed',
                raw        : buildEventRaw(e, effUnitId, qty, orderQty, smv, dur, start, end, ship, parked ? 'unplanned' : status)
            });
            if (parked) events[events.length - 1].raw.parked = true;
            continue;
        }

        events.push({
            id         : `db-${e.id}`,
            dbId       : e.id,
            resourceId : known ? mappedId : mappedId,
            startDate  : start,
            endDate    : end,
            duration   : elapsedDays(start, end),
            durationUnit : 'day',
            manuallyScheduled : !!e.manually_scheduled,
            name       : e.event_name,
            percentDone : Number(e.percent_done) || 0,
            draggable  : status !== 'completed',
            resizable  : status !== 'completed',
            raw        : {
                ...buildEventRaw(e, effUnitId, qty, orderQty, smv, dur, start, end, ship, status),
                stage : isStage ? STAGE_NAME[e.production_stage] : undefined
            }
        });
    }

    // Risk pass (document 12) once utilisation is known
    const util = computeLineUtil(events);
    for (const ev of events) {
        const r = ev.raw;
        if (r.stage) {
            r.risk = { score : 0, level : 'low', label : 'Stage', reasons : [`Linked stage of ${r.po}`] };
            continue;
        }
        r.risk = calcRisk({
            start    : r.start,
            end      : r.end,
            ship     : r.ship,
            matReady : r.matReady,
            lineUtil : util[ev.resourceId] ?? 0,
            status   : r.status
        });
    }

    const dependencies = data.dependencies.rows.map(d => ({
        id        : `db-dep-${d.id}`,
        fromEvent : `db-${d.from_event_id}`,
        toEvent   : `db-${d.to_event_id}`,
        type      : 2
    }));

    const unplannedPos = new Set();
    const onBoardPo = new Set(events.map(ev => ev.raw?.po).filter(Boolean).map(String));
    const onBoardOrderIds = new Set(events.map(ev => ev.raw?.dbId).filter(Boolean));
    const unplanned = [
        ...(unp.rows || []).map(o => {
        const ship = asDate(o.shipment_date);
        unplannedPos.add(String(o.po_number || ''));
        return {
            id       : `dbo-${o.id}`,
            dbId     : o.id,
            buyer    : o.buyer_name,
            style    : o.style_no,
            po       : o.po_number,
            mbmOrder : o.order_code || '',
            productType : productTypeFor(o.po_number, o.product_category),
            qty      : Number(o.remaining_quantity ?? o.order_quantity),
            orderQty : Number(o.order_quantity ?? o.remaining_quantity),
            smv      : Number(o.smv) > 0 ? Number(o.smv) : randSmv(o.po_number),
            pcd      : asDate(o.pcd) || (ship ? addCalDays(ship, -30) : null),
            matReady : asDate(o.material_ready_date),
            ship,
            priority : o.priority,
            suitable : (typeof o.suitable_lines === 'string' ? JSON.parse(o.suitable_lines) : o.suitable_lines || [])
                .map(code => CODE_TO_ID[code] || code),
            unitId   : o.unit_id != null ? Number(o.unit_id) : null,
            unitName : o.unit_name || unitLabel(o.unit_id)
        };
    }),
        ...extraUnplanned.filter(u => !unplannedPos.has(String(u.po || '')))
    ].filter(u => String(u.buyer || '').trim())
        .filter(u => !onBoardPo.has(String(u.po || '')) && !onBoardOrderIds.has(Number(u.dbId)));

    const assignments = events
        .filter(ev => ev.resourceId)
        .map(ev => ({ id : `asgn-${ev.id}`, eventId : ev.id, resourceId : ev.resourceId }));

    const resourceTimeRanges = buildManpowerRanges(resources.filter(r => r.lineRow));

    // Weekday calendar rows (document 4.8) -> Calendars dialog config
    const toMin = t => {
        const [h, m] = String(t || '0').split(':').map(Number);
        return (h || 0) * 60 + (m || 0);
    };
    const fmtHM = mm => `${String(Math.floor(mm / 60)).padStart(2, '0')}:${String(mm % 60).padStart(2, '0')}`;
    const calendarDays = {};
    let calendarName = null;
    for (const row of data.calendars.rows) {
        if (row.weekday_no === null || row.weekday_no === undefined) continue;
        calendarName = row.calendar_name;
        const start = fmtHM(toMin((row.start_time || '08:00').slice(0, 5)));
        let hours = '00:00';
        if (row.interval_type === 'working' && row.end_time) {
            let diff = toMin(row.end_time.slice(0, 5)) - toMin((row.start_time || '08:00').slice(0, 5));
            if (diff <= 0) diff += 1440;
            hours = fmtHM(diff);
        }
        const ot = String(row.interval_name || '').startsWith('OT=') ? row.interval_name.slice(3) : '02:00';
        calendarDays[row.weekday_no] = { start, hours, ot };
    }

    return {
        project : data.project, resources, events, assignments, dependencies, resourceTimeRanges,
        unplanned, lineById,
        calendarDays : Object.keys(calendarDays).length ? calendarDays : null,
        calendarName,
        unitId   : effUnitId,
        unitName : effUnitName
    };
}

let lineResourceDbMap = {};

export function setLineResourceDbMap(map) {
    lineResourceDbMap = { ...map };
}

export function resolveResourceDbId(scheduler, boardLineId) {
    if (!boardLineId || boardLineId === 'hold') return null;
    const res = scheduler.resourceStore?.getById(boardLineId);
    const fromRec = res?.data?.dbId ?? res?.get?.('dbId');
    if (fromRec != null) return Number(fromRec);
    const mapped = lineResourceDbMap[boardLineId];
    return mapped != null ? Number(mapped) : null;
}

export function poBaseEventCode(po) {
    return `EV-${String(po || 'NEW').replace(/[^A-Za-z0-9]/g, '')}-SEW`;
}

function eventCodeOf(ev, raw) {
    if (raw?.eventCode) return raw.eventCode;
    return poBaseEventCode(raw?.po);
}

function resolveEventDbId(ev) {
    const d = ev.data || {};
    let id = ev.get?.('dbId') ?? d.dbId ?? null;
    if (!id) {
        const sid = String(ev.id ?? '');
        if (sid.startsWith('db-')) id = Number(sid.slice(3));
    }
    return id && !Number.isNaN(Number(id)) ? Number(id) : null;
}

// Persist current board state (dates / line moves / new events)
export async function syncToApi(scheduler, { eventIds = null } = {}) {
    const updated = [];
    const added   = [];
    const idFilter = eventIds ? new Set(eventIds.map(String)) : null;
    for (const ev of scheduler.eventStore.records) {
        if (idFilter && !idFilter.has(String(ev.id))) continue;
        const d = ev.data;
        const raw = d.raw;
        if (!raw || raw.stage) continue;

        const pad = n => String(n).padStart(2, '0');
        const fmt = x => {
            if (!x) return null;
            const d = x instanceof Date ? x : new Date(x);
            if (Number.isNaN(d.getTime())) return null;
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
        };

        const rid = lineIdOf(scheduler, ev);
        const onHold = rid === 'hold';
        if (!onHold) raw.parked = false;
        const resourceDbId = resolveResourceDbId(scheduler, rid);
        const eventCode = eventCodeOf(ev, raw);
        if (!raw.eventCode) raw.eventCode = eventCode;

        const eventDbId = resolveEventDbId(ev);

        const status = onHold
            ? 'draft'
            : raw.status === 'completed'
                ? 'completed'
                : raw.status === 'planned'
                    ? 'planned'
                    : 'draft';

        const payload = {
            startDate       : fmt(ev.startDate),
            endDate         : fmt(ev.endDate),
            duration        : ev.duration,
            percentDone     : ev.percentDone,
            plannedQuantity : Number(raw.qty) || 0,
            resourceId      : resourceDbId,
            onHold,
            orderId         : raw.dbId ?? null,
            eventCode,
            status,
            notes           : eventNotesPayload(raw, onHold)
        };

        if (eventDbId) {
            updated.push({ id : eventDbId, ...payload });
        }
        else {
            added.push({
                orderId         : raw.dbId,
                name            : ev.name,
                ...payload
            });
        }
    }
    const res = await fetch(`${API_BASE}/projects/1/scheduler-sync`, {
        method  : 'POST',
        headers : { 'Content-Type' : 'application/json' },
        body    : JSON.stringify({
            requestId : `plan-sync-${Math.random().toString(36).slice(2, 10)}`,
            events    : { updated, added, removed : [] }
        })
    });
    return res.json();
}
