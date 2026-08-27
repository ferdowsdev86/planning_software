// ---------------------------------------------------------------------------
// Planning API client - loads board data from the MySQL-backed API
// (server/index.mjs -> 172.16.101.70 / fastreact). Falls back to the bundled
// demo dataset when the API or database is unreachable.
// ---------------------------------------------------------------------------
import {
    calcRisk, computeLineUtil, WORK_MIN_PER_DAY, buildManpowerRanges,
    addWorkDays, nextWorkingDay, startOfWorkDay, endOfWork, elapsedDays,
    addCalDays, randSmv, productTypeFor
} from './planningData.js';

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

const asDate = v => (v ? new Date(String(v).replace(' ', 'T')) : null);

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
        suitable
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
export async function loadFromApi() {
    // First load project to get unit_id, then load unplanned filtered by that unit
    const data = await get('/projects/1/scheduler-data');
    if (!data.success) throw new Error(data.error || 'load failed');

    const unitId = data.project?.unitId || null;
    const unitQ  = unitId ? `?unit_id=${unitId}` : '';
    const unp    = await get(`/unplanned-orders${unitQ}`);

    const dbIdToBoardId = {};
    const mapped = data.resources.rows.map(r => {
        const boardId = CODE_TO_ID[r.resource_code] || `r${r.id}`;
        dbIdToBoardId[r.id] = boardId;
        const isLine = r.resource_type === 'sewing_line';
        return isLine
            ? {
                id : boardId, dbId : r.id, name : r.resource_name,
                unit : 'AQL', floor : `F${r.floor_id}`,
                manpower : r.manpower, machines : r.machine_count,
                eff : Number(r.default_efficiency),
                availMin : Number(r.capacity_minutes_per_day) ||
                    Math.round(r.manpower * WORK_MIN_PER_DAY * r.default_efficiency / 100),
                utilization : 0, lineRow : true
            }
            : {
                id : boardId, dbId : r.id, name : r.resource_name,
                unit : 'AQL', floor : `F${r.floor_id}`,
                stageRow : true, cls : 'mb-stage-row'
            };
    });

    const firstLine = mapped.find(r => r.lineRow);
    const sewing = mapped.filter(r => r.lineRow);
    const stages = mapped.filter(r => !r.lineRow);
    const resources = [
        {
            id : 'hold', name : 'Holding Row',
            unit : firstLine?.unit || 'AQL', floor : firstLine?.floor || 'F1',
            manpower : 0, machines : 0, eff : 0, availMin : 0,
            holdingRow : true, cls : 'mb-hold-row'
        },
        ...sewing,
        {
            id : 'subtot', name : 'Subtotal Row',
            unit : firstLine?.unit || 'AQL', floor : firstLine?.floor || 'F1',
            manpower : sewing.reduce((a, l) => a + Number(l.manpower || 0), 0),
            machines : sewing.reduce((a, l) => a + Number(l.machines || 0), 0),
            eff : 0, availMin : 0,
            subtotalRow : true, cls : 'mb-subtotal-row'
        },
        ...stages
    ];

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
        const smv   = randSmv(e.po_number);
        const dur   = Number(e.duration) || 1;
        const status = e.event_status === 'completed' ? 'completed' : e.event_status;
        const start = startOfWorkDay(nextWorkingDay(asDate(e.start_date)));
        const end   = endOfWork(start, dur);
        const ship  = asDate(e.shipment_date);
        const hasBuyer = String(e.buyer_name || '').trim();

        // Sewing orders with no buyer stay off the list and off the board
        if (!isStage && !hasBuyer) continue;

        // Unassigned sewing stays off the board (unplanned). Holding Row is
        // only for bars the planner parks there on purpose.
        if (!isStage && !known) {
            extraUnplanned.push({
                id       : `dbo-ev-${e.id}`,
                dbId     : e.id,
                buyer    : e.buyer_name || '',
                style    : e.style_no || '',
                po       : e.po_number || '',
                mbmOrder : e.order_code || '',
                productType : productTypeFor(e.po_number, e.product_category),
                qty, orderQty, smv,
                pcd      : asDate(e.pcd) || (ship ? addCalDays(ship, -30) : null),
                matReady : asDate(e.material_ready_date),
                ship,
                priority : 2,
                suitable : []
            });
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
            raw : {
                buyer    : e.buyer_name || '',
                style    : e.style_no || '',
                po       : e.po_number || '',
                mbmOrder : e.order_code || '',
                productType : productTypeFor(e.po_number, e.product_category),
                qty, orderQty : orderQty || qty, smv,
                reqMin   : Math.round(qty * smv),
                dur, start, end,
                pcd      : asDate(e.pcd) || (ship ? addCalDays(ship, -30) : null),
                ship,
                matReady : asDate(e.material_ready_date),
                progress : Number(e.percent_done) || 0,
                status,
                stage    : isStage ? STAGE_NAME[e.production_stage] : undefined,
                risk     : { score : 0, level : 'low', label : 'On track', reasons : [] }
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
                .map(code => CODE_TO_ID[code] || code)
        };
    }),
        ...extraUnplanned.filter(u => !unplannedPos.has(String(u.po || '')))
    ].filter(u => String(u.buyer || '').trim());

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
        project : data.project, resources, events, dependencies, resourceTimeRanges,
        unplanned, lineById,
        calendarDays : Object.keys(calendarDays).length ? calendarDays : null,
        calendarName,
        unitId
    };
}

// Persist current board state (dates / line moves / new events)
export async function syncToApi(scheduler) {
    const updated = [];
    const added   = [];
    for (const ev of scheduler.eventStore.records) {
        const d = ev.data;
        const pad = n => String(n).padStart(2, '0');
        const fmt = x => x
            ? `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())} 00:00:00`
            : null;
        const resourceDbId = ev.resource?.data?.dbId;
        if (d.dbId) {
            updated.push({
                id         : d.dbId,
                startDate  : fmt(ev.startDate),
                endDate    : fmt(ev.endDate),
                duration   : ev.duration,
                percentDone : ev.percentDone,
                resourceId : resourceDbId
            });
        }
        else if (d.raw && !d.raw.stage) {
            added.push({
                orderId        : d.raw.dbId,
                eventCode      : `EV-${(d.raw.po || 'NEW').replace(/[^A-Za-z0-9]/g, '')}-SEW`,
                name           : ev.name,
                startDate      : fmt(ev.startDate),
                endDate        : fmt(ev.endDate),
                duration       : ev.duration,
                plannedQuantity : d.raw.qty,
                resourceId     : resourceDbId
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
