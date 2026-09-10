// ---------------------------------------------------------------------------
// Planning API client - loads board data from the MySQL-backed API
// (server/index.mjs -> 172.16.101.70 / fastreact). Falls back to the bundled
// demo dataset when the API or database is unreachable.
// ---------------------------------------------------------------------------
import {
    calcRisk, computeLineUtil, WORK_MIN_PER_DAY, buildManpowerRanges,
    addWorkDays, nextWorkingDay, startOfWorkDay, endOfWork, elapsedDays,
    addCalDays, randSmv, productTypeFor, LINES, LINE_BY_ID, STAGE_RESOURCES, clampIntoWorkWindow
} from './planningData.js';
import { lineIdOf, removedDbEventIds } from './AppConfig.js';

// API base resolution with a Local / AWS switch.
//
// Two named endpoints come from build-time env:
//   VITE_API_URL_LOCAL — the API on this machine / LAN (default localhost:4000)
//   VITE_API_URL_AWS   — the API on the AWS deployment
// (legacy VITE_API_URL still counts as an extra candidate.)
//
// The visitor picks a mode in the status bar — persisted in localStorage:
//   auto  (default) — try the last base that worked, then local, then AWS,
//                     then same-origin; first whose /health answers wins
//   local / aws     — pin to that endpoint, no silent switching
const _strip = u => (u ? String(u).replace(/\/+$/, '') : '');
const ON_LOCALHOST = /^(localhost|127\.0\.0\.1|\[?::1\]?)$/.test(window.location.hostname);

export const LOCAL_BASE = _strip(import.meta.env.VITE_API_URL_LOCAL)
    || 'http://localhost:4000/api/v1/planning';
export const AWS_BASE = _strip(import.meta.env.VITE_API_URL_AWS);
const LEGACY_BASE = _strip(import.meta.env.VITE_API_URL);

export const apiMode = () => localStorage.getItem('planningApiMode') || 'auto';
export const setApiMode = m => localStorage.setItem('planningApiMode', m);

export let API_BASE = (() => {
    const mode = apiMode();
    if (mode === 'local') return LOCAL_BASE;
    if (mode === 'aws' && AWS_BASE) return AWS_BASE;
    const cached = _strip(localStorage.getItem('planningApiBase'));
    if (cached) return cached;
    if (LEGACY_BASE && (ON_LOCALHOST || !/\/\/(localhost|127\.0\.0\.1)/.test(LEGACY_BASE))) return LEGACY_BASE;
    return ON_LOCALHOST ? LOCAL_BASE : (AWS_BASE || '/api/v1/planning');
})();

async function _healthy(base, timeoutMs = 2500) {
    if (!base) return false;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        const res = await fetch(`${base}/health`, { signal : ctrl.signal });
        if (!res.ok) return false;
        // A web server's SPA fallback answers 200 with HTML — only a real
        // JSON body proves this base is actually the planning API
        const data = await res.json();
        return !!data && typeof data === 'object';
    } catch {
        return false;
    } finally {
        clearTimeout(t);
    }
}

// Probe the candidates for the current mode and point API_BASE at the first
// one that answers. A pinned mode keeps its endpoint even when unhealthy, so
// the failure is visible instead of silently masked by a fallback.
export async function resolveApiBase() {
    const mode = apiMode();
    const candidates = mode === 'local' ? [LOCAL_BASE]
        : mode === 'aws' ? [AWS_BASE].filter(Boolean)
        : [...new Set([
            _strip(localStorage.getItem('planningApiBase')),
            ON_LOCALHOST ? LOCAL_BASE : AWS_BASE,
            LEGACY_BASE, LOCAL_BASE, AWS_BASE,
            '/api/v1/planning',
        ].filter(Boolean))];

    for (const base of candidates) {
        if (await _healthy(base)) {
            API_BASE = base;
            localStorage.setItem('planningApiBase', base);
            return { base, mode, ok : true };
        }
    }
    if (candidates.length) API_BASE = candidates[0];
    return { base : API_BASE, mode, ok : false };
}

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
        // dbPinned = the pin as loaded from DB; keeps saved positions pinned
        // even when load-time processing has cleared the working flag
        userPinned : !!(raw.userPinned || raw.dbPinned),
        manualGap  : !!raw.manualGap
    };
    // Strip/profile efficiency edits from the properties dialog must survive
    // a reload — without them the duration formula re-runs on the old values
    // and the bar snaps back to its pre-edit length
    if (Number(raw.stripEff) > 0 && Number(raw.stripEff) !== 100) notes.stripEff = Number(raw.stripEff);
    if (Number(raw.planEff) > 0) notes.planEff = Number(raw.planEff);
    if (raw.keepSeparate) notes.keepSeparate = true;
    // Manually applied Build up curve (bar context menu) — snapshot the
    // percentages so the bar keeps ITS curve even if the profile is edited
    if (raw.lcManual && Array.isArray(raw.lcManual.pct) && raw.lcManual.pct.length) {
        notes.lcCurve = {
            name   : raw.lcManual.name,
            period : Number(raw.lcManual.period) || raw.lcManual.pct.length,
            pct    : raw.lcManual.pct.map(Number)
        };
    }
    // Multiple strip handling: linked build-up curve relationship (reference
    // bar, mode live/copy, version) must survive a reload
    if (raw.lcLink && raw.lcLink.refId != null) notes.lcLink = raw.lcLink;
    // Consolidated bar: persist the PO group, otherwise a reload degrades the
    // bar to a single PO while keeping the group quantity (5,090 shown on a
    // 1,344-pc PO)
    if (Array.isArray(raw.idList) && raw.idList.length > 1) {
        notes.idList = raw.idList;
        notes.poList = Array.isArray(raw.poList) ? raw.poList : [];
    }
    return JSON.stringify(notes);
}

function hasClockTime(d) {
    return !!(d && (d.getHours() || d.getMinutes() || d.getSeconds()));
}

function boardSpanFromDb(e) {
    const rawStart = asDate(e.start_date);
    const rawEnd   = asDate(e.end_date);
    const dur      = Number(e.duration) || 1;

    // RULE: any bar that has been saved to DB keeps its exact position.
    // Only clamp into the work window (handles off-day edge cases).
    // nextWorkingDay / startOfWorkDay snapping is for NEW unplanned bars only.
    let start;
    if (rawStart) {
        start = clampIntoWorkWindow(rawStart);
    }
    else {
        start = startOfWorkDay(nextWorkingDay(new Date()));
    }

    let end;
    if (rawEnd && rawEnd > start) {
        end = rawEnd;
    }
    else {
        end = endOfWork(start, dur);
    }

    return { start, end, dur, pinned : true };
}

function orderRowId(planningOrderId) {
    return planningOrderId ? `dbo-${planningOrderId}` : null;
}

function buildEventRaw(e, effUnitId, qty, orderQty, smv, dur, start, end, ship, status) {
    const orderId = e.planning_order_id || null;
    // Projection events persist with event_code 'ev-proj:<order_code>' and no
    // planning_order_id — recover their stable identity so auto-plan re-runs
    // recognise them on the board instead of planning a duplicate block.
    const projId = !orderId && String(e.event_code || '').startsWith('ev-proj:')
        ? String(e.event_code).slice(3) : null;
    // A single-PO confirm bar can never carry MORE than its PO's quantity —
    // clamp stale group quantities left over from before groups were persisted
    // (split strips keep their smaller planned quantity untouched)
    const noteGroup = parseEventNotes(e.notes);
    if (orderId && !(noteGroup.idList && noteGroup.idList.length > 1) && Number(e.order_quantity) > 0) {
        qty = Math.min(qty, Number(e.order_quantity));
    }
    // Projection events have no planning_orders join — recover the buyer from
    // the saved event name ("Buyer | 26XXXX"), otherwise the blank-buyer
    // cleanup would strip every saved projection bar right after load
    const projBuyer = projId && e.event_name && String(e.event_name).includes('|')
        ? String(e.event_name).split('|')[0].trim() : '';
    const rawOut = {
        id       : projId || orderRowId(orderId),
        buyer    : e.buyer_name || projBuyer || (projId ? 'Projection' : ''),
        style    : e.style_no || '',
        po       : e.po_number || '',
        // split strips carry a numeric suffix (proj:26XXX-2) — the order code
        // itself never does, so strip it back off
        mbmOrder : e.order_code || (projId ? projId.slice(5).replace(/-\d+$/, '') : ''),
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
        // Shadow copy of the DB pin: load-time processing (auto-plan,
        // reconciliation, repack) must never unpin a SAVED bar, whatever
        // happens to userPinned along the way. Only a deliberate board
        // compact clears this.
        dbPinned   : !!parseEventNotes(e.notes).userPinned,
        manualGap  : !!parseEventNotes(e.notes).manualGap,
        // Saved efficiency edits (Strip/Order properties dialog) come back so
        // the duration formula reproduces the edited bar after reload
        stripEff     : Number(noteGroup.stripEff) > 0 ? Number(noteGroup.stripEff) : 100,
        planEff      : Number(noteGroup.planEff) > 0 ? Number(noteGroup.planEff) : 0,
        keepSeparate : !!noteGroup.keepSeparate,
        lcManual     : noteGroup.lcCurve && Array.isArray(noteGroup.lcCurve.pct) && noteGroup.lcCurve.pct.length
            ? noteGroup.lcCurve : undefined,
        lcLink       : noteGroup.lcLink && noteGroup.lcLink.refId != null ? noteGroup.lcLink : undefined,
        dbId     : orderId,
        color     : e.color || '',
        orderType : projId ? 'projection' : (e.order_code ? 'confirm' : undefined),
        // Consolidated bars restore their full PO group from the saved notes
        poList   : noteGroup.poList?.length ? noteGroup.poList : (e.po_number ? [e.po_number] : []),
        idList   : noteGroup.idList?.length ? noteGroup.idList : (orderId ? [orderId] : []),
        poCount  : noteGroup.poList?.length || 1,
        unitId   : e.order_unit_id != null ? Number(e.order_unit_id) : effUnitId,
        unitName : unitLabel(e.order_unit_id ?? effUnitId),
        risk     : { score : 0, level : 'low', label : 'On track', reasons : [] }
    };
    return rawOut;
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

// ---------------------------------------------------------------------------
// Authentication — planning_users table (scrypt hashes verified server-side)
// ---------------------------------------------------------------------------
export async function authLogin(username, password) {
    // Login happens BEFORE any board load, so the cached endpoint may be
    // stale (e.g. cached while the API was restarting). Probe and repair the
    // base first — otherwise the POST lands on the web server, which answers
    // with an empty/HTML 404 and json() explodes.
    await resolveApiBase().catch(() => {});
    const res = await fetch(`${API_BASE}/auth/login`, {
        method  : 'POST',
        headers : { 'Content-Type' : 'application/json' },
        body    : JSON.stringify({ username, password })
    });
    let data;
    try {
        data = await res.json();
    }
    catch {
        // Non-JSON answer = wrong endpoint or API down; drop the bad cache
        localStorage.removeItem('planningApiBase');
        throw new Error('Server unreachable — API চালু আছে কিনা দেখুন, তারপর আবার চেষ্টা করুন');
    }
    if (!data.success) throw new Error(data.error || 'Login failed');
    return data.user; // { id, username, name, role, boards }
}

export async function loadUsersDb() {
    // Runs at app start (login chips) — repair a stale endpoint cache first
    await resolveApiBase().catch(() => {});
    const res = await fetch(`${API_BASE}/users`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'load failed');
    return data.users || [];
}

// Upsert users; entries carrying a `password` field rotate that user's hash
export async function saveUsersDb(users) {
    const res = await fetch(`${API_BASE}/users`, {
        method  : 'POST',
        headers : { 'Content-Type' : 'application/json' },
        body    : JSON.stringify({ users })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'save failed');
    return data.users || [];
}

// ---------------------------------------------------------------------------
// Board edit lock — one editor per board; later users get read-only
// ---------------------------------------------------------------------------
export async function acquireBoardLock(unitId, username, name) {
    const res = await fetch(`${API_BASE}/board-lock/acquire`, {
        method  : 'POST',
        headers : { 'Content-Type' : 'application/json' },
        body    : JSON.stringify({ unitId, username, name })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'lock failed');
    return data; // { ok, holder }
}

export function releaseBoardLock(unitId, username) {
    // sendBeacon survives tab close. The payload goes as text/plain — a
    // CORS-simple request needing no preflight; a JSON content-type beacon
    // silently FAILS cross-origin (beacons cannot preflight) even though
    // sendBeacon returns true, leaving a ghost lock for the TTL.
    const payload = JSON.stringify({ unitId, username });
    try {
        if (navigator.sendBeacon
            && navigator.sendBeacon(`${API_BASE}/board-lock/release`, payload)) {
            return Promise.resolve();
        }
    }
    catch { /* fall through */ }
    return fetch(`${API_BASE}/board-lock/release`, {
        method : 'POST', headers : { 'Content-Type' : 'application/json' },
        body : payload, keepalive : true
    }).catch(() => {});
}

// ---------------------------------------------------------------------------
// Login sessions — presence heartbeat + Tools → Login status (admin kill)
// ---------------------------------------------------------------------------
export async function sessionHeartbeat(payload) {
    const res = await fetch(`${API_BASE}/session/heartbeat`, {
        method  : 'POST',
        headers : { 'Content-Type' : 'application/json' },
        body    : JSON.stringify(payload)
    });
    return res.json(); // { ok, killed }
}

export function endSession(sid) {
    // Same beacon rules as releaseBoardLock: text/plain = CORS-simple
    const payload = JSON.stringify({ sid });
    try {
        if (navigator.sendBeacon
            && navigator.sendBeacon(`${API_BASE}/session/end`, payload)) {
            return Promise.resolve();
        }
    }
    catch { /* fall through */ }
    return fetch(`${API_BASE}/session/end`, {
        method : 'POST', headers : { 'Content-Type' : 'application/json' },
        body : payload, keepalive : true
    }).catch(() => {});
}

export async function loadSessions() {
    const res = await fetch(`${API_BASE}/sessions`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'load failed');
    return data; // { sessions, now }
}

export async function killSession(sid) {
    const res = await fetch(`${API_BASE}/session/kill`, {
        method  : 'POST',
        headers : { 'Content-Type' : 'application/json' },
        body    : JSON.stringify({ sid })
    });
    const data = await res.json();
    if (!data.success || data.ok === false) throw new Error(data.error || 'kill failed');
    return data;
}

// Multiple strip handling: audit trail for link / unlink / sync actions —
// fire-and-forget, the board must never block on it
export function linkAudit(entries) {
    if (!entries?.length) return Promise.resolve();
    return fetch(`${API_BASE}/link-audit`, {
        method  : 'POST',
        headers : { 'Content-Type' : 'application/json' },
        body    : JSON.stringify({ entries })
    }).catch(() => {});
}

// Mark orders complete — flags them completed server-side; the caller removes
// their bars from the board and syncs the removals
export async function completeOrdersDb(orderCodes) {
    const res = await fetch(`${API_BASE}/orders/complete`, {
        method  : 'POST',
        headers : { 'Content-Type' : 'application/json' },
        body    : JSON.stringify({ orderCodes })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'complete failed');
    return data;
}

// Persist line efficiency (profile _Default) to planning_resources
export async function saveLineEfficiencyDb(updates) {
    const res = await fetch(`${API_BASE}/resources/efficiency`, {
        method  : 'POST',
        headers : { 'Content-Type' : 'application/json' },
        body    : JSON.stringify({ updates })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'save failed');
    return data;
}

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

    // Consolidated bar: multiple POs with same order_code + color
    const poList   = Array.isArray(o.po_list)    ? o.po_list    : (o.po_list ? [o.po_number] : [o.po_number]);
    const idList   = Array.isArray(o.id_list)    ? o.id_list.map(Number) : [Number(o.id)];
    const poCount  = Number(o.po_count) || 1;
    const poDetails = Array.isArray(o.po_details) ? o.po_details : [];
    // Composite key used by board deduplication: order_code:color
    const ck = (o.order_code && o.color) ? `ck:${o.order_code}:${o.color}` : null;

    return {
        id       : ck ? ck : `dbo-${o.id}`,
        dbId     : o.id,
        buyer    : o.buyer_name,
        style    : o.style_no,
        po       : o.po_number,       // representative PO (earliest ship)
        poList,                        // all PO numbers in this color group
        idList,                        // all planning_orders.id values in group
        poCount,
        poDetails,                         // per-PO breakdown: [{po, qty, remaining, id, ship}]
        color     : o.color || '',
        // every planning_orders row is a synced ERP PO — always a confirm order
        // (never let orderTypeOf's hash fallback classify it as projection)
        orderType : 'confirm',
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

// Load all ERP orders (projected from mr_order_entry + confirm from planning_orders)
export async function loadErpAllOrders(prodUnit = null) {
    const q = prodUnit ? `?prod_unit=${prodUnit}` : '';
    const data = await get(`/all-orders${q}`, 15000);
    if (!data.success) throw new Error(data.error || 'load failed');
    return (data.rows || []).map(r => ({
        id           : r.order_type === 'confirm' ? `erp-c-${r.group_key || r.po_number}` : `erp-p-${r.order_code}`,
        unit         : r.unit_short_name || (r.unit_id ? `Unit ${r.unit_id}` : '—'),
        prodUnit     : r.prod_unit || null,
        prodUnitName : r.prod_unit_name || '—',
        buyer        : r.buyer_name || '',
        style        : r.style_no   || '',
        productType  : r.product_category || '',
        mbmOrder     : r.order_code || '',
        orderType    : r.order_type || 'projected',
        // false = projection still waiting for its confirm POs from ERP
        confirmArrived : r.order_type === 'confirm' ? true : !!r.has_confirm,
        orderQty     : Number(r.order_qty   ?? 0),
        qty          : Number(r.po_qty ?? r.order_qty ?? 0),
        po           : r.po_number || '',
        color        : r.color || '',
        garmentColor : r.color || '',
        orderDelivery : r.shipment_date ? new Date(r.shipment_date) : null,
        poDelivery    : r.order_type === 'confirm' && r.shipment_date ? new Date(r.shipment_date) : null,
        createdAt    : r.created_at ? new Date(r.created_at) : null,
        pcd          : r.effective_pcd ? new Date(r.effective_pcd) : null,
        pcdSource    : r.pcd_source || null,
        pcdStatus    : r.pcd_status || null,
        eligibleForInitialBoard : r.eligible_for_initial_board ?? (r.order_type !== 'confirm'),
        boardNote    : r.board_note || null,
        smv          : Math.round((Number(r.smv) || 0) * 100) / 100,
        reqMin       : Math.round(Number(r.po_qty ?? r.order_qty ?? 0) * Number(r.smv || 0)),
        status       : r.planning_status === 'completed' ? 'completed'
                     : r.planning_status === 'replaced' ? 'replaced'
                     : (r.planning_status === 'fully_planned' || r.planning_status === 'partially_planned') ? 'planned'
                     : 'unplanned',
        replaced     : r.planning_status === 'replaced',
        planned      : r.planning_status === 'fully_planned' || r.planning_status === 'partially_planned',
        line         : r.resource_name || '—',
        start        : r.start_date ? new Date(r.start_date) : null,
        end          : r.end_date   ? new Date(r.end_date)   : null,
        progress     : 0,
        poCount      : r.po_count ?? (r.po_number ? 1 : 0),
        poList       : Array.isArray(r.po_list) ? r.po_list : (r.po_number ? [r.po_number] : []),
        poDetails    : Array.isArray(r.po_details) ? r.po_details : [],
        groupKey     : r.group_key || null,
        groupingStatus : r.grouping_status || 'not_applicable',
        deliveryStatus : r.delivery_status || null,
        splitReason  : r.split_reason || null,
        validationNotes : r.validation_notes || null,
    }));
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
        // Any 'L<n>' sewing line maps to board id 'l<n>' — new lines (L09,
        // L10, …) work without touching the static CODE_TO_ID table
        const lm = /^L(\d+)$/.exec(String(r.resource_code || ''));
        const boardId = CODE_TO_ID[r.resource_code] || (lm ? `l${Number(lm[1])}` : `r${r.id}`);
        dbIdToBoardId[r.id] = boardId;
        const isLine = r.resource_type === 'sewing_line';
        return isLine
            ? {
                id : boardId, dbId : r.id, name : r.resource_name,
                unit : effUnitName, unitId : r.unit_id, floor : `F${r.floor_id}`,
                manpower : r.manpower, machines : r.machine_count,
                eff : Number(r.default_efficiency),
                hours : Number(r.working_hours_per_day) || 10,
                availMin : Number(r.capacity_minutes_per_day) ||
                    Math.round(r.manpower * ((Number(r.working_hours_per_day) || 10) * 60) * r.default_efficiency / 100),
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

    // Register DB lines the demo table doesn't know (e.g. a newly added
    // Line 09) so every LINE_BY_ID-gated feature — reports, auto-plan
    // seeding, capacity — treats them like any other line
    for (const l of sewing) {
        if (!LINE_BY_ID[l.id]) {
            const entry = {
                id : l.id, name : l.name, unit : l.unit, floor : l.floor,
                manpower : l.manpower, eff : l.eff, hours : l.hours,
                availMin : l.availMin
            };
            LINES.push(entry);
            LINE_BY_ID[l.id] = entry;
        }
    }
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
        // Saved projection events (event_code 'ev-proj:…') have no
        // planning_orders join, so buyer_name is NULL — their identity lives
        // in the event itself and they must NOT be dropped here
        const isProjEvent = !e.planning_order_id && String(e.event_code || '').startsWith('ev-proj:');
        const hasBuyer = String(e.buyer_name || '').trim()
            || (isProjEvent && String(e.event_name || '').trim());

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

    // Projected orders (mr_order_entry) — the initial Planning Board dataset.
    // Confirm POs below stay visible for reference but are never auto-planned.
    let projectedUnplanned = [];
    try {
        const pj = await get(`/projected-orders${effUnitId ? `?prod_unit=${effUnitId}` : ''}`, 20000);
        const onBoardIds = new Set(events.map(ev => ev.raw?.id).filter(Boolean).map(String));
        projectedUnplanned = (pj.rows || [])
            .filter(r => r.eligible_for_initial_board)
            .map(r => ({
                id          : `proj:${r.order_code}`,
                orderType   : 'projection',
                mbmOrder    : r.order_code,
                buyer       : r.buyer_name,
                style       : r.style_no,
                productType : productTypeFor(r.order_code, r.product_category),
                qty         : Number(r.order_qty) || 0,
                orderQty    : Number(r.order_qty) || 0,
                // round: ERP FLOAT smv arrives with float32 artifacts (23.600000381…)
                smv         : Number(r.smv) > 0 ? Math.round(Number(r.smv) * 100) / 100 : randSmv(r.order_code),
                ship        : asDate(r.shipment_date),
                pcd         : r.effective_pcd ? asDate(r.effective_pcd) : null,
                pcdSource   : r.pcd_source,
                pcdStatus   : r.pcd_status,
                planWarning : r.plan_warning,
                // Confirm POs already planned — projection is replaced and
                // must never be auto-planned again (duplicate block)
                replaced    : !!r.replaced,
                linkedPoCount : r.linked_po_count || 0,
                priority    : 2,
                suitable    : [],
                unitId      : effUnitId,
                unitName    : effUnitName
            }))
            .filter(r => !onBoardIds.has(r.id));

        // Enrich projection events LOADED from the DB (their planning_orders
        // join is empty) with live feed data: style / ship / pcd / buyer.
        // Without this, saved projection bars show '—' and can't be matched
        // for confirm replacement.
        const feedByCode = new Map((pj.rows || []).map(r => [r.order_code, r]));
        for (const ev of events) {
            const raw = ev.raw;
            if (!raw || raw.stage) continue;
            if (!String(raw.id || '').startsWith('proj:')) continue;
            const f = feedByCode.get(raw.mbmOrder);
            if (!f) continue;
            if (!raw.style) raw.style = f.style_no || '';
            if (!raw.buyer || raw.buyer === 'Projection') raw.buyer = f.buyer_name || raw.buyer;
            if (!raw.ship && f.shipment_date) raw.ship = asDate(f.shipment_date);
            if (!raw.pcd && f.effective_pcd) raw.pcd = asDate(f.effective_pcd);
            if (!(Number(raw.smv) > 0) && Number(f.smv) > 0) raw.smv = Math.round(Number(f.smv) * 100) / 100;
        }
    }
    catch { /* projected feed unavailable — board falls back to reference data only */ }

    const unplannedPos = new Set();
    const onBoardPo = new Set(events.map(ev => ev.raw?.po).filter(Boolean).map(String));
    // On-board identity by planning_orders row ids (dbId + every id in a
    // consolidated bar's idList) — NOT by po_number: one PO number can span
    // several colour groups, and a po-based filter would hide the still-
    // unplanned colours the moment one colour gets planned.
    const onBoardOrderIds = new Set(
        events.flatMap(ev => [ev.raw?.dbId, ...(ev.raw?.idList || [])])
            .filter(Boolean).map(Number));
    const unplanned = [
        ...projectedUnplanned,
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
            color    : o.color || '',
            orderType : 'confirm',   // planning_orders rows are always synced ERP POs
            // Full PO group of this colour — the save must mark EVERY member
            // PO planned, not just the group's representative row
            poList   : Array.isArray(o.po_list) ? o.po_list : (o.po_number ? [o.po_number] : []),
            idList   : Array.isArray(o.id_list) ? o.id_list.map(Number) : [Number(o.id)],
            poCount  : Number(o.po_count) || 1,
            poDetails : Array.isArray(o.po_details) ? o.po_details : [],
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
        .filter(u => {
            // DB-backed rows dedupe by row identity; demo rows (no dbId) by PO
            if (u.dbId != null) {
                if (onBoardOrderIds.has(Number(u.dbId))) return false;
                if ((u.idList || []).some(id => onBoardOrderIds.has(Number(id)))) return false;
                return true;
            }
            return !onBoardPo.has(String(u.po || ''));
        });

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
    // Projection bars (no PO) persist under their stable board id
    // 'ev-proj:<order_code>' — NEVER the po-based fallback, which would give
    // every projection the same 'EV-NEW-SEW' code and collapse them all into
    // one row via the UNIQUE event_code upsert.
    const bid = String(ev?.id ?? raw?.id ?? '');
    if (bid.startsWith('ev-proj:')) return bid;
    if (bid.startsWith('proj:')) return `ev-${bid}`;
    if (String(raw?.id || '').startsWith('proj:')) return `ev-${raw.id}`;
    if (!String(raw?.po || '').trim() && raw?.mbmOrder) return `ev-proj:${raw.mbmOrder}`;
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
// Quick reachability probe — used before a save so a dead API/DB is reported
// immediately instead of the save appearing to hang
export function pingApi(timeoutMs = 4000) {
    return get('/health', timeoutMs);
}

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
            startDate          : fmt(ev.startDate),
            endDate            : fmt(ev.endDate),
            duration           : ev.duration,
            percentDone        : ev.percentDone,
            plannedQuantity    : Number(raw.qty) || 0,
            resourceId         : resourceDbId,
            manuallyScheduled  : onHold ? false : true,
            onHold,
            orderId            : raw.dbId ?? null,
            // Consolidated bar: send all planning_orders.id values so server marks all as planned
            idList             : Array.isArray(raw.idList) && raw.idList.length > 1 ? raw.idList : undefined,
            eventCode,
            status,
            notes              : eventNotesPayload(raw, onHold)
        };

        if (eventDbId) {
            updated.push({ id : eventDbId, ...payload });
        }
        else {
            added.push({
                orderId         : raw.dbId,
                name            : ev.name,
                // Set by the approved projection→confirm replacement flow —
                // authorises this confirm bar past the initial-stage guard
                viaReplacement  : !!raw.viaReplacement,
                ...payload
            });
        }
    }
    // Strips merged back into their order (or otherwise dropped from the
    // board) must be cancelled in the DB or they resurrect on reload
    const removed = [...removedDbEventIds].map(id => ({ id }));
    // A dead connection must fail fast with a clear error, not hang the save
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 90000);
    const res = await fetch(`${API_BASE}/projects/1/scheduler-sync`, {
        method  : 'POST',
        signal  : ctrl.signal,
        headers : { 'Content-Type' : 'application/json' },
        body    : JSON.stringify({
            requestId : `plan-sync-${Math.random().toString(36).slice(2, 10)}`,
            // Replacement stage: confirm orders take their projection's slot
            // on the board, so confirm blocks are now authorized
            allowConfirmPlanning : true,
            events    : { updated, added, removed }
        })
    });
    clearTimeout(timer);
    const out = await res.json();
    if (out?.success) removedDbEventIds.clear();
    return out;
}
