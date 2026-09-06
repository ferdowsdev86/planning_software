// ---------------------------------------------------------------------------
// MBM ERP Production Planning API (document section 6, minimal subset)
// Serves scheduler-data / scheduler-sync / unplanned-orders from MySQL
// ---------------------------------------------------------------------------
import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import { groupAndSplit, deliveryStatus } from './groupingService.mjs';
import { resolveEffectivePcd, projectedEligibility } from './pcdService.mjs';

const {
    DB_HOST = '10.135.50.27',
    DB_PORT = '3336',
    DB_USER = 'dbadmin',
    DB_PASS = '',
    DB_NAME = 'fastreact',
    PORT    = 4000
} = process.env;

const pool = mysql.createPool({
    host            : DB_HOST,
    port            : Number(DB_PORT),
    user            : DB_USER,
    password        : DB_PASS,
    database        : DB_NAME,
    ssl             : false,
    waitForConnections : true,
    connectionLimit : 5,
    dateStrings     : true,
    enableKeepAlive : true,
    keepAliveInitialDelay : 10000
});

const app = express();
app.use(cors());
app.use(express.json({ limit : '2mb' }));

const BASE = '/api/v1/planning';

// ERP hr_unit_id -> display name (extend as more units are onboarded)
const UNIT_NAMES = {
    1 : 'AQL',
    2 : 'MBM',
    3 : 'AQL',
    4 : 'Cutting',
    5 : 'Finishing'
};
const unitLabel = id => UNIT_NAMES[Number(id)] || (id ? `Unit ${id}` : '—');

// Simple in-memory revision counter per project (document: revision conflict check)
const revisions = new Map();
const bumpRev = id => {
    const r = (revisions.get(id) || 1) + 1;
    revisions.set(id, r);
    return r;
};

app.get(`${BASE}/health`, async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ success : true, db : `${DB_HOST}/${DB_NAME}` });
    }
    catch (e) {
        res.status(500).json({ success : false, error : e.message });
    }
});

// --------------------------------------------------------------------------
// Scheduler load API (document 6)
// --------------------------------------------------------------------------
app.get(`${BASE}/projects/:id/scheduler-data`, async (req, res) => {
    try {
        const projectId = Number(req.params.id);
        const unitId    = req.query.unit_id ? Number(req.query.unit_id) : null;

        const [[project]] = await pool.query(
            `SELECT id, project_name, plan_status, version_no, plan_from, plan_to, unit_id
             FROM planning_projects WHERE id = ?`,
            [projectId]
        );
        if (!project) return res.status(404).json({ success : false, error : 'Project not found' });

        const effUnit = unitId || project.unit_id || null;

        let resourceSql = `
            SELECT id, resource_code, resource_name, resource_type, unit_id, floor_id,
                   default_efficiency, manpower, machine_count, capacity_minutes_per_day,
                   working_hours_per_day, sort_order
             FROM planning_resources WHERE active = TRUE`;
        const resourceParams = [];
        if (effUnit) {
            resourceSql += ' AND unit_id = ?';
            resourceParams.push(effUnit);
        }
        resourceSql += ' ORDER BY sort_order';
        let [resources] = await pool.query(resourceSql, resourceParams);
        // AQL board (unit 3) often shares lines stored under a legacy unit_id
        if (!resources.length && effUnit) {
            [resources] = await pool.query(
                `SELECT id, resource_code, resource_name, resource_type, unit_id, floor_id,
                        default_efficiency, manpower, machine_count, capacity_minutes_per_day,
                        working_hours_per_day, sort_order
                 FROM planning_resources WHERE active = TRUE ORDER BY sort_order`
            );
        }

        let eventSql = `
            SELECT e.id, e.planning_order_id, e.event_code, e.event_name, e.production_stage, e.start_date, e.end_date,
                    e.duration, e.duration_unit, e.planned_quantity, e.percent_done,
                    e.manually_scheduled, e.event_status, e.notes,
                    o.buyer_name, o.style_no, o.po_number, o.order_code, o.order_quantity, o.smv,
                    o.product_category, o.pcd, o.shipment_date, o.material_ready_date, o.priority,
                    o.unit_id AS order_unit_id, o.color
             FROM planning_events e
             LEFT JOIN planning_orders o ON o.id = e.planning_order_id
             WHERE e.project_id = ? AND e.event_status != 'cancelled'`;
        const eventParams = [projectId];
        if (effUnit) {
            // Order-linked events filter by the order's unit. Events with no
            // planning_orders row (saved PROJECTION bars, event_code
            // 'ev-proj:…') are kept when they are assigned to any resource of
            // THIS board — the resources themselves may live under a legacy
            // unit_id (see the resource fallback above), so filtering them by
            // r.unit_id = effUnit would silently drop every saved projection.
            eventSql += ' AND (COALESCE(o.prod_unit, o.unit_id) = ? OR o.id IS NULL)';
            eventParams.push(effUnit);
        }
        let [events] = await pool.query(eventSql, eventParams);

        // Board hygiene: a bar must never load for an order that is absent
        // from the Orders list — retired orders (planning_completed_orders)
        // and orders unknown to ERP (no mr_order_entry row AND no confirm PO
        // link) would be unmanageable ghosts on the board.
        const evOrderCode = e => e.order_code
            || (String(e.event_code || '').startsWith('ev-proj:')
                ? String(e.event_code).slice(8).replace(/-\d+$/, '') : null);
        const evCodes = [...new Set(events.map(evOrderCode).filter(Boolean))];
        if (evCodes.length) {
            const completedSet = await completedOrderCodes();
            const ph = evCodes.map(() => '?').join(',');
            const [erpRows] = await pool.query(
                `SELECT DISTINCT order_code FROM cuttingedgedb.mr_order_entry WHERE order_code IN (${ph})`,
                evCodes
            );
            const inErp = new Set(erpRows.map(r => r.order_code));
            events = events.filter(e => {
                const oc = evOrderCode(e);
                if (!oc) return true;
                if (completedSet.has(oc)) return false;
                if (!inErp.has(oc) && e.planning_order_id == null) return false;
                return true;
            });
        }

        const [assignments] = await pool.query(
            `SELECT a.id, a.event_id, a.resource_id
             FROM planning_assignments a
             JOIN planning_events e ON e.id = a.event_id
             WHERE e.project_id = ?`,
            [projectId]
        );

        if (effUnit) {
            const boardResIds = new Set(resources.map(r => r.id));
            const evResource = new Map();
            for (const a of assignments) {
                if (!evResource.has(a.event_id)) evResource.set(a.event_id, a.resource_id);
            }
            // Keep: order-linked events (unit-filtered in SQL), projection
            // events assigned to a resource of this board, and parked events
            // (Holding Row — their assignment is deleted on save, so having
            // NO assignment must not drop them)
            events = events.filter(e =>
                e.planning_order_id != null
                || !evResource.has(e.id)
                || boardResIds.has(evResource.get(e.id)));
        }

        const [dependencies] = await pool.query(
            'SELECT id, from_event_id, to_event_id, dependency_type, lag, lag_unit FROM planning_dependencies WHERE project_id = ? AND active = TRUE',
            [projectId]
        );

        const [calendars] = await pool.query(
            `SELECT c.id, c.calendar_code, c.calendar_name, i.interval_type, i.recurrent_rule,
                    i.weekday_no, i.start_time, i.end_time, i.interval_name
             FROM planning_calendars c
             LEFT JOIN planning_calendar_intervals i ON i.calendar_id = c.id
             WHERE c.active = TRUE`
        );

        res.json({
            success  : true,
            project  : {
                id      : project.id,
                name    : project.project_name,
                status  : project.plan_status,
                version : project.version_no,
                revision : revisions.get(projectId) || 1,
                unitId  : effUnit,
                unitName : unitLabel(effUnit)
            },
            resources    : { rows : resources },
            events       : { rows : events },
            assignments  : { rows : assignments },
            dependencies : { rows : dependencies },
            calendars    : { rows : calendars }
        });
    }
    catch (e) {
        res.status(500).json({ success : false, error : e.message });
    }
});

// --------------------------------------------------------------------------
// Unplanned order panel (document 3.2 / 6)
// --------------------------------------------------------------------------
// Build the consolidated unplanned-orders query.
// Confirm orders (have order_code + color) are grouped by order_code+color so that
// multiple POs of the same color appear as ONE bar. po_list / id_list carry the detail.
function unplannedQuery(unitId, limit, offset) {
    // A PO belongs to a board by its PRODUCTION unit (mr_order_entry.prod_unit)
    // — the order-entry unit_id is only a fallback for rows synced before the
    // prod_unit column existed. (e.g. 25SUBOR438: entered under unit 1 but
    // produced in AQL/prod_unit 3.)
    const uf   = unitId ? 'AND COALESCE(prod_unit, unit_id) = ?' : '';
    const base = unitId ? [unitId] : [];
    const cut  = ERP_CUTOFF;

    const sql = `
        SELECT * FROM (
            /* ---- GROUPED: confirm orders (order_code + color both set) ---- */
            SELECT
                MIN(id)                                            AS id,
                buyer_name, style_no, order_code, color,
                MIN(po_number)                                     AS po_number,
                CAST(SUM(order_quantity)   AS DECIMAL(14,2))       AS order_quantity,
                CAST(SUM(remaining_quantity) AS DECIMAL(14,2))     AS remaining_quantity,
                MAX(smv)                                           AS smv,
                product_category, MIN(pcd) AS pcd,
                MIN(shipment_date)                                 AS shipment_date,
                MIN(material_ready_date)                           AS material_ready_date,
                unit_id, priority, suitable_lines,
                JSON_ARRAYAGG(po_number ORDER BY shipment_date)    AS po_list,
                JSON_ARRAYAGG(id        ORDER BY shipment_date)    AS id_list,
                COUNT(*)                                           AS po_count,
                JSON_ARRAYAGG(JSON_OBJECT(
                    'po',        po_number,
                    'qty',       CAST(order_quantity AS DECIMAL(14,2)),
                    'remaining', CAST(remaining_quantity AS DECIMAL(14,2)),
                    'id',        id,
                    'ship',      shipment_date
                ) ORDER BY shipment_date)                          AS po_details
            FROM planning_orders
            WHERE planning_status = 'unplanned'
              AND order_code IS NOT NULL AND order_code != ''
              AND color      IS NOT NULL AND color      != ''
              AND (shipment_date IS NULL OR shipment_date >= '${cut}')
              ${uf}
            GROUP BY order_code, color, buyer_name, style_no, unit_id, priority, product_category

            UNION ALL

            /* ---- UNGROUPED: orders without order_code or color ---- */
            SELECT
                id, buyer_name, style_no, order_code, color,
                po_number, order_quantity, remaining_quantity, smv,
                product_category, pcd, shipment_date, material_ready_date,
                unit_id, priority, suitable_lines,
                JSON_ARRAY(po_number) AS po_list,
                JSON_ARRAY(id)        AS id_list,
                1                    AS po_count,
                JSON_ARRAY(JSON_OBJECT(
                    'po',        po_number,
                    'qty',       CAST(order_quantity AS DECIMAL(14,2)),
                    'remaining', CAST(remaining_quantity AS DECIMAL(14,2)),
                    'id',        id,
                    'ship',      shipment_date
                ))                   AS po_details
            FROM planning_orders
            WHERE planning_status = 'unplanned'
              AND (order_code IS NULL OR order_code = '' OR color IS NULL OR color = '')
              AND (shipment_date IS NULL OR shipment_date >= '${cut}')
              ${uf}
        ) combined
        ORDER BY priority, shipment_date
        LIMIT ? OFFSET ?`;

    const countSql = `
        SELECT (
            SELECT COUNT(*) FROM (
                SELECT 1 FROM planning_orders
                WHERE planning_status = 'unplanned'
                  AND order_code IS NOT NULL AND order_code != ''
                  AND color IS NOT NULL AND color != ''
                  AND (shipment_date IS NULL OR shipment_date >= '${cut}')
                  ${uf}
                GROUP BY order_code, color, unit_id
            ) g
        ) +
        (
            SELECT COUNT(*) FROM planning_orders
            WHERE planning_status = 'unplanned'
              AND (order_code IS NULL OR order_code = '' OR color IS NULL OR color = '')
              AND (shipment_date IS NULL OR shipment_date >= '${cut}')
              ${uf}
        ) AS total`;

    // `uf` appears twice in sql (grouped + ungrouped), so unitId must be passed twice
    return { sql, countSql, params : [...base, ...base, limit, offset], countParams : [...base, ...base] };
}

app.get(`${BASE}/unplanned-orders`, async (req, res) => {
    try {
        const limit  = Math.min(Number(req.query.limit)  || 9999, 9999);
        const offset = Number(req.query.offset) || 0;
        const unitId = req.query.unit_id ? Number(req.query.unit_id) : null;

        const { sql, countSql, params, countParams } = unplannedQuery(unitId, limit, offset);
        const [[{ total }]] = await pool.query(countSql, countParams);
        const [rows]        = await pool.query(sql, params);

        const enriched = rows.map(r => {
            const poRaw  = typeof r.po_list === 'string' ? JSON.parse(r.po_list) : (r.po_list || []);
            const idRaw  = typeof r.id_list === 'string' ? JSON.parse(r.id_list) : (r.id_list || []);
            const detRaw = typeof r.po_details === 'string' ? JSON.parse(r.po_details) : (r.po_details || []);
            // Deduplicate: planning_orders has one row per size/split so same PO appears N times
            const poList = [...new Set(poRaw.map(String))];
            const idList = [...new Set(idRaw.map(Number))];
            return { ...r, po_list : poList, id_list : idList, po_count : poList.length, po_details : detRaw, unit_name : unitLabel(r.unit_id) };
        });
        res.json({ success : true, rows : enriched, total, limit, offset, unitId });
    }
    catch (e) {
        res.status(500).json({ success : false, error : e.message });
    }
});

// --------------------------------------------------------------------------
// Scheduler sync API (document 6): transactional save + change logs
// Payload: { requestId, revision, events: { added, updated, removed } }
// --------------------------------------------------------------------------
async function upsertEventAssignment(conn, eventId, ev) {
    if (!ev.onHold) {
        await conn.query(
            `UPDATE planning_events SET notes = ?, updated_at = NOW() WHERE id = ?`,
            [ev.notes ?? null, eventId]
        );
    }
    if (ev.onHold) {
        await conn.query('DELETE FROM planning_assignments WHERE event_id = ?', [eventId]);
        await conn.query(
            `UPDATE planning_events SET notes = ?, updated_at = NOW() WHERE id = ?`,
            [JSON.stringify({ parked : true }), eventId]
        );
        if (ev.orderId) {
            await conn.query(
                "UPDATE planning_orders SET planning_status = 'unplanned', updated_at = NOW() WHERE id = ?",
                [ev.orderId]
            );
        }
        return;
    }
    if (!ev.resourceId) return;
    const [assignRows] = await conn.query(
        'SELECT id FROM planning_assignments WHERE event_id = ? LIMIT 1',
        [eventId]
    );
    if (assignRows[0]) {
        await conn.query(
            'UPDATE planning_assignments SET resource_id = ?, assigned_quantity = COALESCE(?, assigned_quantity), updated_at = NOW() WHERE event_id = ?',
            [ev.resourceId, ev.plannedQuantity ?? null, eventId]
        );
    }
    else {
        await conn.query(
            'INSERT INTO planning_assignments (event_id, resource_id, units, assigned_quantity, created_at) VALUES (?, ?, 100, ?, NOW())',
            [eventId, ev.resourceId, ev.plannedQuantity ?? 0]
        );
    }
    // Mark the primary order row as planned
    if (ev.orderId) {
        await conn.query(
            "UPDATE planning_orders SET planning_status = 'fully_planned', updated_at = NOW() WHERE id = ?",
            [ev.orderId]
        );
    }
    // For consolidated bars: mark all PO rows in the group as planned
    if (Array.isArray(ev.idList) && ev.idList.length > 1) {
        const ids = ev.idList.map(Number).filter(Boolean);
        if (ids.length) {
            await conn.query(
                `UPDATE planning_orders SET planning_status = 'fully_planned', updated_at = NOW() WHERE id IN (${ids.map(() => '?').join(',')})`,
                ids
            );
        }
    }
}

async function findExistingEvent(conn, projectId, ev) {
    const code = ev.eventCode ?? null;
    const orderId = ev.orderId ?? null;
    if (code) {
        const [rows] = await conn.query(
            `SELECT id FROM planning_events
             WHERE project_id = ? AND event_status != 'cancelled' AND event_code = ?
             LIMIT 1`,
            [projectId, code]
        );
        if (rows[0]?.id) return rows[0].id;
    }
    return null;
}

async function upsertPlanningEvent(conn, projectId, ev) {
    const eventCode = ev.eventCode ?? `EV-${Date.now()}`;
    const [result] = await conn.query(
        `INSERT INTO planning_events
            (project_id, planning_order_id, event_code, event_name, event_type, production_stage,
             start_date, end_date, duration, duration_unit, planned_quantity, percent_done,
             manually_scheduled, event_status, created_by, created_at)
         VALUES (?, ?, ?, ?, 'production', 'sewing', ?, ?, ?, 'day', ?, 0, TRUE, ?, 1, NOW())
         ON DUPLICATE KEY UPDATE
            id = LAST_INSERT_ID(id),
            planning_order_id = COALESCE(VALUES(planning_order_id), planning_order_id),
            start_date = COALESCE(VALUES(start_date), start_date),
            end_date = COALESCE(VALUES(end_date), end_date),
            duration = COALESCE(VALUES(duration), duration),
            event_status = COALESCE(VALUES(event_status), event_status),
            percent_done = COALESCE(VALUES(percent_done), percent_done),
            event_name = COALESCE(VALUES(event_name), event_name),
            planned_quantity = COALESCE(VALUES(planned_quantity), planned_quantity),
            updated_at = NOW()`,
        [projectId, ev.orderId ?? null, eventCode, ev.name ?? 'New event',
         ev.startDate, ev.endDate, ev.duration ?? null, ev.plannedQuantity ?? 0,
         ev.status ?? 'draft']
    );
    const eventId = result.insertId || await findExistingEvent(conn, projectId, { ...ev, eventCode });
    const action = result.affectedRows === 1 ? 'add' : 'update';
    return { eventId, action, eventCode };
}

app.post(`${BASE}/projects/:id/scheduler-sync`, async (req, res) => {
    const projectId = Number(req.params.id);
    const { events = {}, requestId = null, allowConfirmPlanning = false } = req.body || {};

    // Initial projection-planning stage: NEW board blocks for Confirm Orders
    // (rows carrying a planning_orders orderId) are rejected at backend level.
    // The approved replacement workflow updates existing events, which stays allowed;
    // an authorized confirm-planning workflow must send allowConfirmPlanning:true.
    if (!allowConfirmPlanning) {
        const confirmAdds = (events.added || []).filter(ev => ev.orderId != null);
        if (confirmAdds.length) {
            return res.status(403).json({
                success : false,
                error   : 'Confirm Order - not included in the initial projection plan. New confirm blocks are rejected; pass allowConfirmPlanning:true from an authorized workflow.',
                rejected : confirmAdds.map(ev => ({ orderId : ev.orderId, eventCode : ev.eventCode ?? null }))
            });
        }
    }

    const conn = await pool.getConnection();
    let mapped = [];
    // Lock collisions with the ERP auto-sync (deadlock / lock wait timeout)
    // are transient — retry the whole transaction instead of failing the save
    const RETRYABLE = new Set(['ER_LOCK_DEADLOCK', 'ER_LOCK_WAIT_TIMEOUT']);
    for (let attempt = 1; attempt <= 3; attempt++) {
    try {
        mapped = [];
        await conn.beginTransaction();

        for (const ev of events.updated || []) {
            const [oldRows] = await conn.query(
                'SELECT start_date, end_date, duration FROM planning_events WHERE id = ?',
                [ev.id]
            );
            const [upd] = await conn.query(
                `UPDATE planning_events
                 SET start_date = COALESCE(?, start_date),
                     end_date   = COALESCE(?, end_date),
                     duration   = COALESCE(?, duration),
                     planned_quantity = COALESCE(?, planned_quantity),
                     event_status = COALESCE(?, event_status),
                     percent_done = COALESCE(?, percent_done),
                     notes = COALESCE(?, notes),
                     manually_scheduled = IF(? IS NOT NULL, ?, manually_scheduled),
                     planning_order_id = COALESCE(?, planning_order_id),
                     event_code = COALESCE(?, event_code),
                     updated_at = NOW()
                 WHERE id = ?`,
                [ev.startDate ?? null, ev.endDate ?? null, ev.duration ?? null,
                 ev.plannedQuantity ?? null, ev.status ?? null, ev.percentDone ?? null,
                 ev.notes ?? null,
                 ev.manuallyScheduled != null ? (ev.manuallyScheduled ? 1 : 0) : null,
                 ev.manuallyScheduled != null ? (ev.manuallyScheduled ? 1 : 0) : null,
                 ev.orderId ?? null,
                 ev.eventCode ?? null,
                 ev.id]
            );
            let eventId = ev.id;
            let action = 'update';
            if (!upd.affectedRows && ev.eventCode) {
                const upserted = await upsertPlanningEvent(conn, projectId, ev);
                eventId = upserted.eventId;
                action = upserted.action;
            }
            await upsertEventAssignment(conn, eventId, ev);
            mapped.push({
                orderId   : ev.orderId ?? null,
                eventId,
                eventCode : ev.eventCode ?? null
            });
            await conn.query(
                `INSERT INTO planning_change_logs (project_id, event_id, action_type, old_data, new_data, changed_by, changed_at, ip_address)
                 VALUES (?, ?, ?, ?, ?, 1, NOW(), ?)`,
                [projectId, eventId, action, JSON.stringify(oldRows[0] || {}), JSON.stringify(ev), req.ip]
            );
        }

        for (const ev of events.added || []) {
            const { eventId, action, eventCode } = await upsertPlanningEvent(conn, projectId, ev);
            await upsertEventAssignment(conn, eventId, ev);
            mapped.push({
                orderId   : ev.orderId ?? null,
                eventId,
                eventCode
            });
            await conn.query(
                `INSERT INTO planning_change_logs (project_id, event_id, action_type, new_data, changed_by, changed_at, ip_address)
                 VALUES (?, ?, ?, ?, 1, NOW(), ?)`,
                [projectId, eventId, action, JSON.stringify(ev), req.ip]
            );
        }

        for (const ev of events.removed || []) {
            await conn.query("UPDATE planning_events SET event_status = 'cancelled', updated_at = NOW() WHERE id = ?", [ev.id]);
            await conn.query(
                `INSERT INTO planning_change_logs (project_id, event_id, action_type, changed_by, changed_at, ip_address)
                 VALUES (?, ?, 'remove', 1, NOW(), ?)`,
                [projectId, ev.id, req.ip]
            );
        }

        await conn.commit();
        conn.release();
        return res.json({ success : true, requestId, revision : bumpRev(projectId), mapped });
    }
    catch (e) {
        try {
            await conn.rollback();
        }
        catch { /* connection already gone - nothing to roll back on */ }
        if (RETRYABLE.has(e.code) && attempt < 3) {
            console.warn(`[scheduler-sync] ${e.code} — retrying save (attempt ${attempt + 1}/3)`);
            await new Promise(r => setTimeout(r, 1500 * attempt));
            continue;
        }
        conn.release();
        return res.status(500).json({ success : false, error : e.message });
    }
    }
});

// --------------------------------------------------------------------------
// Calendar configuration (document 4.7 / 4.8): one row per weekday
// Payload: { name, days : { 0..6 : { start:'08:00', hours:'10:00', ot:'02:00' } } }
// --------------------------------------------------------------------------
app.put(`${BASE}/calendars/:id`, async (req, res) => {
    const calId = Number(req.params.id);
    const { days = {}, name = null } = req.body || {};
    const toMin = t => {
        const [h, m] = String(t || '0').split(':').map(Number);
        return (h || 0) * 60 + (m || 0);
    };
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        await conn.query('DELETE FROM planning_calendar_intervals WHERE calendar_id = ?', [calId]);
        let workingDays = 0, maxHours = 0;
        for (const [d, c] of Object.entries(days)) {
            const hrs = toMin(c.hours) / 60;
            if (hrs > 0) {
                workingDays++;
                maxHours = Math.max(maxHours, hrs);
            }
            const endMin = (toMin(c.start) + toMin(c.hours)) % 1440;
            const fmt = mm => `${String(Math.floor(mm / 60)).padStart(2, '0')}:${String(mm % 60).padStart(2, '0')}:00`;
            await conn.query(
                `INSERT INTO planning_calendar_intervals
                    (calendar_id, interval_type, interval_name, weekday_no, start_time, end_time, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                [calId, hrs > 0 ? 'working' : 'non_working', `OT=${c.ot || '00:00'}`,
                 Number(d), fmt(toMin(c.start)), fmt(endMin)]
            );
        }
        await conn.query(
            'UPDATE planning_calendars SET calendar_name = COALESCE(?, calendar_name), hours_per_day = ?, days_per_week = ?, updated_at = NOW() WHERE id = ?',
            [name, maxHours, workingDays, calId]
        );
        await conn.commit();
        res.json({ success : true, workingDays, maxHours });
    }
    catch (e) {
        try {
            await conn.rollback();
        }
        catch { /* connection already gone */ }
        res.status(500).json({ success : false, error : e.message });
    }
    finally {
        conn.release();
    }
});

// --------------------------------------------------------------------------
// Daily production update (day_production_update_plan): line-wise actual
// output per strip per day. Upsert on (event_ref, save_date).
// --------------------------------------------------------------------------
app.get(`${BASE}/production-updates`, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT id, event_id, event_ref, unit, floor, line, operation_type,
                    style, order_no, po_number, color, order_qty, day_plan_qty,
                    prod_qty, save_date
             FROM day_production_update_plan
             ORDER BY save_date, line`
        );
        res.json({ success : true, rows });
    }
    catch (e) {
        res.status(500).json({ success : false, error : e.message });
    }
});

app.post(`${BASE}/production-updates`, async (req, res) => {
    const rows = req.body?.rows || [];
    if (!rows.length) return res.json({ success : true, saved : 0 });
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        for (const r of rows) {
            await conn.query(
                `INSERT INTO day_production_update_plan
                    (event_id, event_ref, unit, floor, line, operation_type, style,
                     order_no, po_number, color, order_qty, day_plan_qty, prod_qty,
                     save_date, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                 ON DUPLICATE KEY UPDATE
                    prod_qty = VALUES(prod_qty),
                    day_plan_qty = VALUES(day_plan_qty),
                    order_qty = VALUES(order_qty),
                    line = VALUES(line),
                    floor = VALUES(floor),
                    updated_at = NOW()`,
                [r.eventId ?? null, String(r.eventRef), r.unit ?? null, r.floor ?? null,
                 r.line ?? null, r.operationType ?? 'Sewing', r.style ?? null,
                 r.orderNo ?? null, r.po ?? null, r.color ?? null,
                 Number(r.orderQty) || 0, Number(r.dayPlanQty) || 0,
                 Number(r.prodQty) || 0, r.saveDate]
            );
        }
        await conn.commit();
        res.json({ success : true, saved : rows.length });
    }
    catch (e) {
        try {
            await conn.rollback();
        }
        catch { /* connection already gone */ }
        res.status(500).json({ success : false, error : e.message });
    }
    finally {
        conn.release();
    }
});

// --------------------------------------------------------------------------
// efficiency_profile: line + product type -> efficiency % (and avg SMV of
// planned strips of that product on the line). Upsert on (line, product_type).
// --------------------------------------------------------------------------
// Persist line efficiency and daily working hours to planning_resources so
// they survive reloads — profile _Default IS the line efficiency.
// capacity_minutes_per_day is recomputed as manpower × hours × 60 × eff%.
app.post(`${BASE}/resources/efficiency`, async (req, res) => {
    const updates = Array.isArray(req.body?.updates) ? req.body.updates : [];
    const valid = updates.filter(u =>
        Number.isFinite(Number(u.resourceId)) && Number(u.eff) > 0 && Number(u.eff) <= 200
        && (u.hours == null || (Number(u.hours) > 0 && Number(u.hours) <= 24))
        && (u.manpower == null || (Number(u.manpower) > 0 && Number(u.manpower) <= 1000)));
    if (!valid.length) return res.json({ success : true, saved : 0 });
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        for (const u of valid) {
            await conn.query(
                `UPDATE planning_resources SET
                     default_efficiency    = ?,
                     manpower              = COALESCE(?, manpower),
                     working_hours_per_day = COALESCE(?, working_hours_per_day),
                     capacity_minutes_per_day = ROUND(
                         COALESCE(?, manpower) * COALESCE(?, working_hours_per_day, 10) * 60 * ? / 100, 2),
                     updated_at = NOW()
                 WHERE id = ? AND resource_type = 'sewing_line'`,
                [Number(u.eff),
                 u.manpower != null ? Number(u.manpower) : null,
                 u.hours != null ? Number(u.hours) : null,
                 u.manpower != null ? Number(u.manpower) : null,
                 u.hours != null ? Number(u.hours) : null,
                 Number(u.eff),
                 Number(u.resourceId)]
            );
        }
        await conn.commit();
        res.json({ success : true, saved : valid.length });
    }
    catch (e) {
        await conn.rollback();
        res.status(500).json({ success : false, error : e.message });
    }
    finally { conn.release(); }
});

app.get(`${BASE}/efficiency-profiles`, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT id, line, profile_name, product_type, efficiency_pct, smv
             FROM efficiency_profile ORDER BY line, product_type`
        );
        res.json({ success : true, rows });
    }
    catch (e) {
        res.status(500).json({ success : false, error : e.message });
    }
});

app.post(`${BASE}/efficiency-profiles`, async (req, res) => {
    const rows = req.body?.rows || [];
    if (!rows.length) return res.json({ success : true, saved : 0 });
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        for (const r of rows) {
            await conn.query(
                `INSERT INTO efficiency_profile
                    (line, profile_name, product_type, efficiency_pct, smv,
                     created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, NOW(), NOW())
                 ON DUPLICATE KEY UPDATE
                    profile_name = VALUES(profile_name),
                    efficiency_pct = VALUES(efficiency_pct),
                    smv = VALUES(smv),
                    updated_at = NOW()`,
                [String(r.line), r.profileName ?? null, String(r.productType),
                 Number(r.efficiency) || 0, r.smv == null ? null : Number(r.smv)]
            );
        }
        await conn.commit();
        res.json({ success : true, saved : rows.length });
    }
    catch (e) {
        try {
            await conn.rollback();
        }
        catch { /* connection already gone */ }
        res.status(500).json({ success : false, error : e.message });
    }
    finally {
        conn.release();
    }
});

// --------------------------------------------------------------------------
// learning_curve: build up curves - one row per curve day with efficiency %.
// The whole set is replaced on save (curves can be renamed / deleted).
// --------------------------------------------------------------------------
app.get(`${BASE}/learning-curves`, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT id, curve_name, period_days, day_number, efficiency_pct
             FROM learning_curve ORDER BY curve_name, day_number`
        );
        res.json({ success : true, rows });
    }
    catch (e) {
        res.status(500).json({ success : false, error : e.message });
    }
});

app.post(`${BASE}/learning-curves`, async (req, res) => {
    const rows = req.body?.rows || [];
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        await conn.query('DELETE FROM learning_curve');
        for (const r of rows) {
            await conn.query(
                `INSERT INTO learning_curve
                    (curve_name, period_days, day_number, efficiency_pct,
                     created_at, updated_at)
                 VALUES (?, ?, ?, ?, NOW(), NOW())`,
                [String(r.curveName), Number(r.periodDays) || 1,
                 Number(r.dayNumber) || 1, Number(r.efficiency) || 0]
            );
        }
        await conn.commit();
        res.json({ success : true, saved : rows.length });
    }
    catch (e) {
        try {
            await conn.rollback();
        }
        catch { /* connection already gone */ }
        res.status(500).json({ success : false, error : e.message });
    }
    finally {
        conn.release();
    }
});

// --------------------------------------------------------------------------
// ERP order sync: pull from cuttingedgedb (mr_purchase_order + mr_order_entry
//   + mr_buyer + mr_style + mr_product_type + mr_material_color)
// Filter: order_delivery_date >= ERP_CUTOFF
// GET  /sync-erp-orders?since=YYYY-MM-DD  (preview, no write)
// POST /sync-erp-orders                   (upsert into planning_orders)
// --------------------------------------------------------------------------
const ERP_DB     = 'cuttingedgedb';
const ERP_CUTOFF = '2026-08-20';

const ERP_QUERY = (cutoff) => [`
    SELECT
        po.po_id                                          AS src_id,
        po.po_no                                          AS po_number,
        oe.order_code                                     AS order_code,
        b.b_name                                          AS buyer_name,
        s.stl_no                                          AS style_no,
        po.po_qty                                         AS order_quantity,
        po.po_qty                                         AS remaining_quantity,
        COALESCE(s.production_smv, s.stl_smv, 0)         AS smv,
        pt.prd_type_name                                  AS product_category,
        COALESCE(po.po_ex_fty, oe.order_delivery_date)   AS shipment_date,
        CASE WHEN oe.pcd >= '2020-01-01' THEN oe.pcd ELSE NULL END AS pcd,
        NULL                                              AS material_ready_date,
        mc.clr_name                                       AS color,
        oe.unit_id                                        AS unit_id,
        oe.prod_unit                                      AS prod_unit,
        2                                                 AS priority
    FROM \`${ERP_DB}\`.mr_purchase_order   po
    JOIN \`${ERP_DB}\`.mr_order_entry      oe ON oe.order_id  = po.mr_order_entry_order_id
    JOIN \`${ERP_DB}\`.mr_buyer            b  ON b.b_id       = oe.mr_buyer_b_id
    JOIN \`${ERP_DB}\`.mr_style            s  ON s.stl_id     = oe.mr_style_stl_id
    LEFT JOIN \`${ERP_DB}\`.mr_product_type  pt ON pt.prd_type_id = s.prd_type_id
    LEFT JOIN \`${ERP_DB}\`.mr_material_color mc ON mc.clr_id  = po.clr_id
    WHERE COALESCE(po.po_ex_fty, oe.order_delivery_date) >= ?
      AND po.po_qty > 0
      AND (po.status IS NULL OR po.status != 3)
      AND (po.po_status IS NULL OR po.po_status != 3)
      AND oe.order_status NOT IN ('Closed','Inactive')
    ORDER BY COALESCE(po.po_ex_fty, oe.order_delivery_date)
`, [cutoff]];

// Order details: style info + fabric booking for tooltip
app.get(`${BASE}/order-details`, async (req, res) => {
    const po = req.query.po;
    if (!po) return res.status(400).json({ success : false, error : 'Missing po' });
    try {
        const [[style]] = await pool.query(`
            SELECT
                po.po_id, po.po_no, po.po_qty,
                oe.order_code, oe.order_status,
                s.stl_no, s.stl_product_name, s.stl_description, s.stl_type,
                s.stl_img_link, s.techpack, s.wash_recipe_status,
                s.gender, s.stl_garment_description,
                oe.order_id AS entry_id,
                COALESCE(po.po_ex_fty, oe.order_delivery_date) AS shipment_date
            FROM \`${ERP_DB}\`.mr_purchase_order   po
            JOIN \`${ERP_DB}\`.mr_order_entry       oe ON oe.order_id = po.mr_order_entry_order_id
            JOIN \`${ERP_DB}\`.mr_style             s  ON s.stl_id    = oe.mr_style_stl_id
            WHERE po.po_no = ?
            LIMIT 1
        `, [String(po)]);

        if (!style) return res.json({ success : false, error : 'Not found' });

        const [bookings] = await pool.query(`
            SELECT
                bm.mr_booking_id    AS booking_no,
                bm.delivery_date    AS booking_eta,
                bm.tracking_status,
                bm.is_store_sent,
                bm.store_sent_at    AS store_receive_date,
                bm.status           AS booking_status
            FROM \`${ERP_DB}\`.mr_booking         bk
            JOIN \`${ERP_DB}\`.mr_booking_masters  bm ON bm.id = bk.mr_order_bom_costing_booking_id
            WHERE bk.order_id = ?
            ORDER BY bm.delivery_date ASC
            LIMIT 8
        `, [style.entry_id]);

        res.json({ success : true, data : { style, bookings } });
    }
    catch (e) {
        res.status(500).json({ success : false, error : e.message });
    }
});

// Return qty + delivery + colour for a bar's POs (tooltip PO breakdown).
// Prefer exact planning_orders row ids — one PO NUMBER can span several
// colours, so a number-based lookup can return the wrong colour's quantity.
app.get(`${BASE}/pos-summary`, async (req, res) => {
    const rawIds = req.query.ids;
    if (rawIds) {
        const ids = String(rawIds).split(',').map(s => Number(s.trim())).filter(n => Number.isFinite(n) && n > 0).slice(0, 50);
        if (!ids.length) return res.json({ success : true, rows : [] });
        try {
            const ph = ids.map(() => '?').join(',');
            const [rows] = await pool.query(
                `SELECT id, po_number, color, order_quantity, shipment_date
                 FROM planning_orders
                 WHERE id IN (${ph})
                 ORDER BY FIELD(id, ${ph})`,
                [...ids, ...ids]
            );
            return res.json({ success : true, rows });
        }
        catch (e) {
            return res.status(500).json({ success : false, error : e.message });
        }
    }
    const raw = req.query.pos;
    if (!raw) return res.json({ success : true, rows : [] });
    const pos = String(raw).split(',').map(s => s.trim()).filter(Boolean).slice(0, 50);
    if (!pos.length) return res.json({ success : true, rows : [] });
    try {
        const placeholders = pos.map(() => '?').join(',');
        const [rows] = await pool.query(
            `SELECT po_number, MIN(color) AS color, order_quantity, shipment_date
             FROM planning_orders
             WHERE po_number IN (${placeholders})
             GROUP BY po_number
             ORDER BY FIELD(po_number, ${placeholders})`,
            [...pos, ...pos]
        );
        res.json({ success : true, rows });
    } catch (e) {
        res.status(500).json({ success : false, error : e.message });
    }
});

// --------------------------------------------------------------------------
// Mark orders complete: the order disappears from the board (its events are
// cancelled by the client sync) and is flagged completed everywhere.
// --------------------------------------------------------------------------
app.post(`${BASE}/orders/complete`, async (req, res) => {
    const codes = (Array.isArray(req.body?.orderCodes) ? req.body.orderCodes : [])
        .map(c => String(c || '').trim()).filter(Boolean).slice(0, 500);
    if (!codes.length) return res.json({ success : true, completed : 0 });
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        for (const code of codes) {
            await conn.query(
                'INSERT IGNORE INTO planning_completed_orders (order_code) VALUES (?)', [code]);
        }
        await conn.query(
            `UPDATE planning_orders SET planning_status = 'completed', updated_at = NOW()
             WHERE order_code IN (${codes.map(() => '?').join(',')})`, codes);
        await conn.commit();
        res.json({ success : true, completed : codes.length });
    }
    catch (e) {
        await conn.rollback();
        res.status(500).json({ success : false, error : e.message });
    }
    finally { conn.release(); }
});

async function completedOrderCodes() {
    const [rows] = await pool.query('SELECT order_code FROM planning_completed_orders');
    return new Set(rows.map(r => r.order_code));
}

// --------------------------------------------------------------------------
// Projected orders for the initial Planning Board (projection-only stage).
// Confirm orders are excluded here at backend level — the board's initial
// dataset never contains them. Sorted by effective PCD ascending.
// --------------------------------------------------------------------------
app.get(`${BASE}/projected-orders`, async (req, res) => {
    const cutoff     = req.query.cutoff || ERP_CUTOFF;
    const prodUnitId = req.query.prod_unit ? Number(req.query.prod_unit) : null;
    const puf        = prodUnitId ? 'AND oe.prod_unit = ?' : '';
    const pbp        = prodUnitId ? [prodUnitId] : [];
    try {
        // Order codes that already have synced POs (projection→confirm link)
        const [ploRows] = await pool.query(
            `SELECT erp_order_id, COUNT(*) AS po_count FROM planning_orders
             WHERE erp_order_id IS NOT NULL AND erp_order_id != ''
             GROUP BY erp_order_id`
        );
        const linkedPoCount = new Map(ploRows.map(r => [r.erp_order_id, Number(r.po_count)]));

        // Order codes whose confirm POs are ACTUALLY planned on the board —
        // these projections are replaced and must never be auto-planned again
        const [cpRows] = await pool.query(
            `SELECT DISTINCT po.erp_order_id
             FROM planning_orders po
             JOIN planning_events pe ON pe.planning_order_id = po.id AND pe.event_status != 'cancelled'
             WHERE po.erp_order_id IS NOT NULL AND po.erp_order_id != ''`
        );
        const confirmPlanned = new Set(cpRows.map(r => r.erp_order_id));

        const [rows] = await pool.query(`
            SELECT
                oe.order_code,
                oe.order_status,
                b.b_name                                                AS buyer_name,
                s.stl_no                                                AS style_no,
                COALESCE(pt.prd_type_name, s.stl_type)                 AS product_category,
                COALESCE(NULLIF(oe.order_qty, 0), NULLIF(SUM(po.po_qty), 0), 0) AS order_qty,
                COALESCE(MIN(po.po_ex_fty), oe.order_delivery_date)    AS shipment_date,
                COALESCE(s.production_smv, s.stl_smv, 0)               AS smv,
                oe.unit_id, oe.prod_unit,
                oe.pcd                                                  AS source_pcd
            FROM \`${ERP_DB}\`.mr_order_entry oe
            JOIN \`${ERP_DB}\`.mr_buyer b ON b.b_id = oe.mr_buyer_b_id
            JOIN \`${ERP_DB}\`.mr_style s ON s.stl_id = oe.mr_style_stl_id
            LEFT JOIN \`${ERP_DB}\`.mr_product_type pt ON pt.prd_type_id = s.prd_type_id
            LEFT JOIN \`${ERP_DB}\`.mr_purchase_order po
                   ON po.mr_order_entry_order_id = oe.order_id AND po.po_qty > 0
            WHERE oe.order_status NOT IN ('Closed','Inactive')
              ${puf}
            GROUP BY oe.order_id, oe.order_code, oe.order_status, b.b_name, s.stl_no,
                     pt.prd_type_name, s.stl_type, oe.unit_id, oe.prod_unit, oe.order_qty,
                     oe.order_delivery_date, s.production_smv, s.stl_smv, oe.pcd
            HAVING COALESCE(MIN(po.po_ex_fty), oe.order_delivery_date) >= ?
        `, [...pbp, cutoff]);

        const completed = await completedOrderCodes();

        const out = rows.map(r => {
            const pcd  = resolveEffectivePcd(r.source_pcd, r.shipment_date);
            const done = completed.has(r.order_code);
            const elig = done
                ? { eligible : false, reason : 'Order marked complete - removed from the board.' }
                : projectedEligibility({ orderStatus : r.order_status });
            const linked = linkedPoCount.get(r.order_code) || 0;
            return {
                order_type       : 'projected',
                order_code       : r.order_code,
                buyer_name       : r.buyer_name,
                style_no         : r.style_no,
                product_category : r.product_category,
                order_qty        : Number(r.order_qty),
                shipment_date    : r.shipment_date,
                smv              : Number(r.smv) || 0,
                unit_id          : r.unit_id,
                prod_unit        : r.prod_unit,
                source_pcd       : r.source_pcd,
                effective_pcd    : pcd.effective_pcd,
                pcd_source       : pcd.pcd_source,
                pcd_status       : pcd.pcd_status,
                replaced         : confirmPlanned.has(r.order_code),   // confirm POs planned — projection replaced
                linked_po_count  : linked,
                eligible_for_initial_board : elig.eligible,
                eligibility_reason         : elig.reason,
                plan_warning     : pcd.pcd_status === 'missing' ? 'Cannot auto-plan: valid PCD is missing.'
                                 : !(Number(r.order_qty) > 0)   ? 'Cannot auto-plan: order quantity is 0 in ERP (mr_order_entry.order_qty).'
                                 : null
            };
        });
        // Effective PCD ascending; missing-PCD orders stay visible at the end
        out.sort((a, b) => {
            if (!a.effective_pcd && !b.effective_pcd) return String(a.order_code).localeCompare(String(b.order_code));
            if (!a.effective_pcd) return 1;
            if (!b.effective_pcd) return -1;
            return a.effective_pcd < b.effective_pcd ? -1 : a.effective_pcd > b.effective_pcd ? 1 : 0;
        });
        res.json({ success : true, rows : out, total : out.length });
    }
    catch (e) {
        res.status(500).json({ success : false, error : e.message });
    }
});

// --------------------------------------------------------------------------
// All Orders list: projected (mr_order_entry) + confirm (planning_orders + ERP)
// --------------------------------------------------------------------------
app.get(`${BASE}/all-orders`, async (req, res) => {
    const cutoff     = req.query.cutoff || ERP_CUTOFF;
    const prodUnitId = req.query.prod_unit ? Number(req.query.prod_unit) : null;
    const puf        = prodUnitId ? 'AND oe.prod_unit = ?' : '';
    const pbp        = prodUnitId ? [prodUnitId] : [];

    try {
        // Order codes whose confirm POs are ACTUALLY planned on the board
        // (have live planning events). Merely-synced POs do NOT replace the
        // projection — its status stays planned/unplanned until a confirm
        // order takes its slot.
        const [ploRows] = await pool.query(
            `SELECT DISTINCT po.erp_order_id
             FROM planning_orders po
             JOIN planning_events pe ON pe.planning_order_id = po.id AND pe.event_status != 'cancelled'
             WHERE po.erp_order_id IS NOT NULL AND po.erp_order_id != ''`
        );
        const plannedOrderCodes = new Set(ploRows.map(r => r.erp_order_id));
        const completedSet = await completedOrderCodes();

        // ALL order codes with synced confirm POs (planned or not) — a
        // projection with none is still waiting for its confirm to arrive
        const [syncRows] = await pool.query(
            `SELECT DISTINCT erp_order_id FROM planning_orders
             WHERE erp_order_id IS NOT NULL AND erp_order_id != ''`
        );
        const syncedOrderCodes = new Set(syncRows.map(r => r.erp_order_id));

        // Pre-fetch hr_unit short names for display (same DB as projected query — fast)
        const [huRows] = await pool.query(
            `SELECT hr_unit_id, hr_unit_short_name FROM \`${ERP_DB}\`.hr_unit`
        );
        const unitShortName = new Map(huRows.map(r => [r.hr_unit_id, r.hr_unit_short_name]));

        // Pre-fetch order_code → {prod_unit, unit_id, order_qty} from mr_order_entry (for confirm rows)
        const [puRows] = await pool.query(
            `SELECT order_code, prod_unit, unit_id, order_qty FROM \`${ERP_DB}\`.mr_order_entry
             WHERE order_code IS NOT NULL AND order_code != ''`
        );
        const erpOrderMap = new Map(puRows.map(r => [r.order_code, { prod_unit: r.prod_unit, unit_id: r.unit_id, order_qty: r.order_qty }]));

        // 1. Projected orders: one row per mr_order_entry (no cross-DB planning join)
        const [projRows] = await pool.query(`
            SELECT
                'projected'                                                AS order_type,
                oe.order_code,
                b.b_name                                                   AS buyer_name,
                s.stl_no                                                   AS style_no,
                COALESCE(pt.prd_type_name, s.stl_type)                    AS product_category,
                COALESCE(NULLIF(oe.order_qty, 0), NULLIF(SUM(po.po_qty), 0), 0) AS order_qty,
                NULL                                                       AS po_qty,
                NULL                                                       AS po_number,
                NULL                                                       AS color,
                COALESCE(MIN(po.po_ex_fty), oe.order_delivery_date)       AS shipment_date,
                COALESCE(s.production_smv, s.stl_smv, 0)                  AS smv,
                oe.unit_id,
                oe.prod_unit,
                oe.pcd                                                     AS source_pcd,
                MAX(oe.created_at)                                         AS created_at,
                NULL AS start_date, NULL AS end_date, NULL AS resource_name
            FROM \`${ERP_DB}\`.mr_order_entry oe
            JOIN \`${ERP_DB}\`.mr_buyer b ON b.b_id = oe.mr_buyer_b_id
            JOIN \`${ERP_DB}\`.mr_style s ON s.stl_id = oe.mr_style_stl_id
            LEFT JOIN \`${ERP_DB}\`.mr_product_type pt ON pt.prd_type_id = s.prd_type_id
            LEFT JOIN \`${ERP_DB}\`.mr_purchase_order po
                   ON po.mr_order_entry_order_id = oe.order_id AND po.po_qty > 0
            WHERE oe.order_status NOT IN ('Closed','Inactive')
              ${puf}
            GROUP BY oe.order_id, oe.order_code, b.b_name, s.stl_no,
                     pt.prd_type_name, s.stl_type, oe.unit_id, oe.prod_unit, oe.order_qty,
                     oe.order_delivery_date, s.production_smv, s.stl_smv, oe.pcd
            HAVING COALESCE(MIN(po.po_ex_fty), oe.order_delivery_date) >= ?
            ORDER BY shipment_date, order_code
        `, [...pbp, cutoff]);

        // Saved projection board events (event_code 'ev-proj:<order_code>') —
        // fill line / start / end for projected rows that are planned in DB
        const [projEvRows] = await pool.query(`
            SELECT pe.event_code, pe.start_date, pe.end_date, pr.resource_name
            FROM planning_events pe
            LEFT JOIN planning_assignments pa ON pa.event_id = pe.id AND pa.is_primary = 1
            LEFT JOIN planning_resources pr ON pr.id = pa.resource_id
            WHERE pe.event_code LIKE 'ev-proj:%' AND pe.event_status != 'cancelled'
        `);
        const projEvByCode = new Map(projEvRows.map(e => [String(e.event_code).slice(8), e]));

        // Enrich projected rows with planning_status and unit name lookups.
        // Status precedence: a projection whose OWN bar is live on the board
        // is PLANNED — 'replaced' only applies when the projection bar is
        // gone and a planned confirm order has taken its slot.
        projRows.forEach(r => {
            r.has_confirm      = syncedOrderCodes.has(r.order_code);
            r.prod_unit_name   = r.prod_unit ? (unitShortName.get(r.prod_unit) || null) : null;
            r.unit_short_name  = r.unit_id   ? (unitShortName.get(r.unit_id)   || null) : null;
            r.grouping_status  = 'not_applicable';   // projection orders never use PO grouping
            r.delivery_status  = null;
            r.po_count         = 0;
            r.po_details       = [];
            const pcd = resolveEffectivePcd(r.source_pcd, r.shipment_date);
            r.effective_pcd    = pcd.effective_pcd;
            r.pcd_source       = pcd.pcd_source;
            r.pcd_status       = pcd.pcd_status;
            r.eligible_for_initial_board = true;
            r.board_note       = !(Number(r.order_qty) > 0)
                ? 'Cannot auto-plan: order quantity is 0 in ERP (mr_order_entry.order_qty).'
                : 'Projected - included in initial capacity planning.';
            const ev = projEvByCode.get(r.order_code);
            if (ev) {
                r.start_date    = ev.start_date;
                r.end_date      = ev.end_date;
                r.resource_name = ev.resource_name;
            }
            // A planned confirm order replaces the projection — this wins even
            // when a stale ev-proj event is still lying around in the DB.
            // A completed order outranks everything.
            if (completedSet.has(r.order_code)) {
                r.planning_status = 'completed';
                r.board_note = 'Order marked complete - removed from the board.';
                r.start_date = null; r.end_date = null; r.resource_name = null;
            }
            else if (plannedOrderCodes.has(r.order_code)) {
                r.planning_status = 'replaced';
            }
            else {
                r.planning_status = ev ? 'fully_planned' : 'unplanned';
            }
        });

        // 2. Confirm orders: one row per PO from planning_orders
        //    planning_status is derived from actual planning_events (not stale planning_orders status)
        //    One row per PO with its planning event/resource; grouping happens in JS below.
        const [confRows] = await pool.query(`
            SELECT
                po.id                                                      AS plo_id,
                po.order_code,
                po.buyer_name,
                po.style_no,
                po.product_category,
                po.order_quantity                                          AS po_qty,
                po.remaining_quantity,
                po.po_number,
                po.color,
                po.shipment_date,
                po.smv,
                po.pcd                                                     AS source_pcd,
                po.unit_id,
                po.planning_status                                         AS raw_status,
                COALESCE(epo.created_at, po.created_at)                    AS created_at,
                pe.id                                                      AS event_id,
                pe.start_date,
                pe.end_date,
                pa.resource_id,
                pr.resource_name,
                pr.manpower,
                pr.default_efficiency
            FROM planning_orders po
            LEFT JOIN \`${ERP_DB}\`.mr_purchase_order epo ON epo.po_id = po.erp_po_id
            LEFT JOIN planning_events pe ON pe.planning_order_id = po.id AND pe.event_status != 'cancelled'
            LEFT JOIN planning_assignments pa ON pa.event_id = pe.id AND pa.is_primary = 1
            LEFT JOIN planning_resources pr ON pr.id = pa.resource_id
            WHERE (po.shipment_date IS NULL OR po.shipment_date >= ?)
              AND po.po_number IS NOT NULL AND po.po_number != ''
              AND po.planning_status != 'cancelled'
            ORDER BY po.order_code, po.color, po.shipment_date
        `, [cutoff]);

        // Consolidated bars carry their member PO row ids in notes.idList — a row
        // with no anchored event is still planned when another row's event lists it
        const [idlEvents] = await pool.query(`
            SELECT pe.id AS event_id, pe.notes, pe.start_date, pe.end_date,
                   pa.resource_id, pr.resource_name, pr.manpower, pr.default_efficiency
            FROM planning_events pe
            LEFT JOIN planning_assignments pa ON pa.event_id = pe.id AND pa.is_primary = 1
            LEFT JOIN planning_resources pr ON pr.id = pa.resource_id
            WHERE pe.notes LIKE '%idList%' AND pe.event_status != 'cancelled'
        `);
        const idListCover = new Map();
        for (const ev of idlEvents) {
            let ids = [];
            try { ids = JSON.parse(ev.notes || '{}').idList || []; }
            catch { /* malformed notes: skip */ }
            for (const id of ids) {
                const n = Number(id);
                if (n && !idListCover.has(n)) idListCover.set(n, ev);
            }
        }
        for (const r of confRows) {
            if (r.event_id) continue;
            const cov = idListCover.get(Number(r.plo_id));
            if (!cov) continue;
            r.event_id            = cov.event_id;
            r.start_date          = cov.start_date;
            r.end_date            = cov.end_date;
            r.resource_id         = cov.resource_id;
            r.resource_name       = cov.resource_name;
            r.manpower            = cov.manpower;
            r.default_efficiency  = cov.default_efficiency;
        }

        // Existing line workload: latest scheduled end per resource (for availableFrom)
        const [wlRows] = await pool.query(`
            SELECT pa.resource_id, MAX(pe.end_date) AS busy_until
            FROM planning_events pe
            JOIN planning_assignments pa ON pa.event_id = pe.id AND pa.is_primary = 1
            WHERE pe.event_status != 'cancelled'
            GROUP BY pa.resource_id
        `);
        const lineBusyUntil = new Map(wlRows.map(r => [r.resource_id, r.busy_until]));

        // Dedupe by planning_orders row id (NOT po_number — ERP reuses one PO
        // number across colours): the events LEFT JOIN can duplicate a row when
        // it has several events — keep the row with an event if any
        const byPo = new Map();
        for (const r of confRows) {
            const prev = byPo.get(r.plo_id);
            if (!prev || (!prev.event_id && r.event_id)) byPo.set(r.plo_id, r);
        }
        const poRows = [...byPo.values()];

        // Total order qty per order_code (across all POs of the order)
        const orderTotals = new Map();
        for (const r of poRows) {
            orderTotals.set(r.order_code, (orderTotals.get(r.order_code) || 0) + Number(r.po_qty || 0));
        }

        // Bucket POs by order_code + colour (stable colour key: name synced from ERP clr_id)
        const buckets = new Map();
        for (const r of poRows) {
            const key = `${r.order_code}::${r.color || 'NO-COLOR'}`;
            if (!buckets.has(key)) buckets.set(key, []);
            buckets.get(key).push(r);
        }

        const today = new Date().toISOString().slice(0, 10);
        const groupedConf = [];
        for (const [, members] of buckets) {
            const first = members[0];
            // Proposed line = primary resource of any already-planned member PO
            const plannedMember = members.find(m => m.resource_id);
            const line = plannedMember ? {
                name          : plannedMember.resource_name,
                manpower      : plannedMember.manpower,
                efficiency    : plannedMember.default_efficiency,
                availableFrom : lineBusyUntil.get(plannedMember.resource_id) || today
            } : null;

            const groups = groupAndSplit({
                orderCode : first.order_code,
                color     : first.color,
                smv       : Number(first.smv) || 0,
                line,
                pos       : members.map(m => ({
                    id            : m.plo_id,
                    po_number     : m.po_number,
                    qty           : Number(m.po_qty),
                    remaining_qty : Number(m.remaining_quantity ?? m.po_qty),
                    delivery      : m.shipment_date,
                    planned       : !!m.event_id
                }))
            });

            for (const g of groups) {
                const memberRows   = members.filter(m => g.pos.some(p =>
                    p.id != null ? p.id === m.plo_id : p.po_number === m.po_number));
                const plannedRows  = memberRows.filter(m => m.event_id);
                const allPlanned   = plannedRows.length === memberRows.length && memberRows.length > 0;
                const somePlanned  = plannedRows.length > 0;
                // Prefer actual event dates over simulation when POs are already planned
                const actualStart  = plannedRows.length ? plannedRows.reduce((min, m) => !min || m.start_date < min ? m.start_date : min, null) : null;
                const actualEnd    = plannedRows.length ? plannedRows.reduce((max, m) => !max || m.end_date > max ? m.end_date : max, null) : null;
                const plannedStart = actualStart ? new Date(actualStart) : g.planned_start_at;
                const plannedEnd   = actualEnd   ? new Date(actualEnd)   : g.planned_complete_at;

                const gForStatus = { ...g, planned_start_at : plannedStart, planned_complete_at : plannedEnd };
                const confPcd = resolveEffectivePcd(first.source_pcd, g.earliest_delivery);
                groupedConf.push({
                    effective_pcd    : confPcd.effective_pcd,
                    pcd_source       : confPcd.pcd_source,
                    pcd_status       : confPcd.pcd_status,
                    order_type       : 'confirm',
                    order_code       : first.order_code,
                    buyer_name       : first.buyer_name,
                    style_no         : first.style_no,
                    product_category : first.product_category,
                    order_qty        : orderTotals.get(first.order_code) || g.group_quantity,
                    po_qty           : g.group_quantity,
                    po_number        : g.pos[0]?.po_number || first.po_number,
                    po_count         : g.pos.length,
                    po_list          : g.pos.map(p => p.po_number),
                    po_details       : memberRows.map(m => ({
                        po       : m.po_number,
                        qty      : Number(m.po_qty),
                        delivery : m.shipment_date,
                        planned  : !!m.event_id,
                        line     : m.resource_name || null,
                        start    : m.start_date || null,
                        end      : m.end_date || null
                    })),
                    color            : first.color,
                    created_at       : memberRows.reduce((mx, m) =>
                        m.created_at && (!mx || m.created_at > mx) ? m.created_at : mx, null),
                    shipment_date    : g.earliest_delivery,
                    smv              : first.smv,
                    unit_id          : first.unit_id,
                    planning_status  : allPlanned ? 'fully_planned' : somePlanned ? 'partially_planned' : 'unplanned',
                    start_date       : plannedStart,
                    end_date         : plannedEnd,
                    resource_name    : line?.name || null,
                    group_key        : g.group_key,
                    grouping_status  : g.grouping_status,
                    split_reason     : g.split_reason,
                    delivery_status  : deliveryStatus(gForStatus),
                    validation_notes : g.validation_notes
                });
            }
        }

        // Enrich confirm groups with prod_unit from pre-fetched ERP map
        groupedConf.forEach(r => {
            const erpInfo      = erpOrderMap.get(r.order_code) || {};
            // Order Qty always mirrors the SOURCE (mr_order_entry.order_qty) —
            // the sum of synced PO rows is only a fallback
            if (Number(erpInfo.order_qty) > 0) r.order_qty = Number(erpInfo.order_qty);
            r.prod_unit        = erpInfo.prod_unit ?? null;
            r.prod_unit_name   = r.prod_unit ? (unitShortName.get(r.prod_unit) || null) : null;
            r.unit_short_name  = r.unit_id   ? (unitShortName.get(r.unit_id)   || null) : null;
            r.eligible_for_initial_board = false;
            r.board_note       = 'Confirm Order - not included in the initial projection plan.';
            if (completedSet.has(r.order_code)) {
                r.planning_status = 'completed';
                r.board_note = 'Order marked complete - removed from the board.';
                r.start_date = null; r.end_date = null; r.resource_name = null;
            }
        });

        // Filter by prod_unit in JS (planning_orders lacks this column)
        const filteredConf = prodUnitId
            ? groupedConf.filter(r => r.prod_unit === prodUnitId)
            : groupedConf;

        res.json({ success : true, rows : [...projRows, ...filteredConf], total : projRows.length + filteredConf.length });
    }
    catch (e) {
        res.status(500).json({ success : false, error : e.message });
    }
});

app.get(`${BASE}/sync-erp-orders`, async (req, res) => {
    try {
        const since = req.query.since || ERP_CUTOFF;
        const [sql, params] = ERP_QUERY(since);
        const [rows] = await pool.query(sql, params);
        res.json({ success : true, count : rows.length, rows });
    }
    catch (e) {
        res.status(500).json({ success : false, error : e.message });
    }
});

// Manual sync trigger: runs the SAME logic as the scheduled auto-sync,
// including the removal of POs deleted/status-3 in ERP — a manual sync must
// never leave stale rows behind that the scheduled one would have removed.
app.post(`${BASE}/sync-erp-orders`, async (req, res) => {
    try {
        const result = await runAutoSync();
        if (!result) return res.json({ success : true, skipped : true, message : 'A sync is already running' });
        res.json({ success : true, ...result });
    }
    catch (e) {
        res.status(500).json({ success : false, error : e.message });
    }
});

// --------------------------------------------------------------------------
// Users & authentication: planning_users table, scrypt password hashes
// (no plain-text passwords are ever stored)
// --------------------------------------------------------------------------
function hashPassword(pw) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(String(pw), salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(pw, stored) {
    const [salt, hash] = String(stored || '').split(':');
    if (!salt || !hash) return false;
    const test = crypto.scryptSync(String(pw), salt, 64).toString('hex');
    try { return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(test, 'hex')); }
    catch { return false; }
}

const userDto = u => ({
    id       : `u${u.id}`,
    username : u.username,
    name     : u.display_name,
    role     : u.role,
    boards   : (() => { try { return JSON.parse(u.boards || '[]'); } catch { return []; } })()
});

async function ensureUsersTable() {
    await pool.query(`CREATE TABLE IF NOT EXISTS planning_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        display_name VARCHAR(100) NOT NULL,
        role VARCHAR(40) NOT NULL DEFAULT 'Planner',
        boards TEXT,
        password_hash VARCHAR(200) NOT NULL,
        active TINYINT NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    const [[{ n }]] = await pool.query('SELECT COUNT(*) n FROM planning_users');
    if (!n) {
        const seed = [
            ['ferdows',    'Ferdows',           'Planner',    '["b1","b2","b3"]'],
            ['unithead1',  'Unit Head — F1',    'Unit Head',  '["b2"]'],
            ['management', 'Management Viewer', 'Management', '["b1"]']
        ];
        for (const [u, d, r, b] of seed) {
            await pool.query(
                'INSERT INTO planning_users (username, display_name, role, boards, password_hash) VALUES (?,?,?,?,?)',
                [u, d, r, b, hashPassword('1234')]
            );
        }
        console.log('[users] planning_users created and seeded — default password: 1234');
    }
}

app.post(`${BASE}/auth/login`, async (req, res) => {
    try {
        const { username, password } = req.body || {};
        const [rows] = await pool.query(
            'SELECT * FROM planning_users WHERE username = ? AND active = 1',
            [String(username || '').trim().toLowerCase()]
        );
        const u = rows[0];
        if (!u || !verifyPassword(password, u.password_hash)) {
            return res.status(401).json({ success : false, error : 'Wrong username or password' });
        }
        res.json({ success : true, user : userDto(u) });
    }
    catch (e) { res.status(500).json({ success : false, error : e.message }); }
});

// ---------------------------------------------------------------------------
// Board edit locks — one editor per board (unit) at a time. First user to
// open a board holds the lock; everyone else is read-only until the holder
// leaves or goes silent for LOCK_TTL_MS (browser crash / closed tab).
// In-memory: locks reset on API restart, clients re-acquire on heartbeat.
// ---------------------------------------------------------------------------
const boardLocks  = new Map();     // unitId -> { username, name, acquiredAt, lastSeen }
const LOCK_TTL_MS = 90 * 1000;

function liveLockHolder(unitId) {
    const l = boardLocks.get(String(unitId));
    if (!l) return null;
    if (Date.now() - l.lastSeen > LOCK_TTL_MS) {
        boardLocks.delete(String(unitId));
        return null;
    }
    return l;
}

// Acquire doubles as heartbeat: the holder calls it periodically to stay live
app.post(`${BASE}/board-lock/acquire`, (req, res) => {
    const { unitId, username, name } = req.body || {};
    if (!unitId || !username) {
        return res.json({ success : false, error : 'unitId and username required' });
    }
    const key = String(unitId);
    const cur = liveLockHolder(key);
    if (cur && cur.username !== username) {
        return res.json({
            success : true, ok : false,
            holder  : { username : cur.username, name : cur.name }
        });
    }
    boardLocks.set(key, {
        username,
        name       : name || username,
        acquiredAt : cur?.acquiredAt || Date.now(),
        lastSeen   : Date.now()
    });
    res.json({ success : true, ok : true, holder : { username, name : name || username } });
});

app.post(`${BASE}/board-lock/release`, (req, res) => {
    const { unitId, username } = req.body || {};
    const key = String(unitId);
    const cur = liveLockHolder(key);
    if (cur && cur.username === username) boardLocks.delete(key);
    res.json({ success : true });
});

app.get(`${BASE}/board-lock`, (req, res) => {
    const cur = liveLockHolder(String(req.query.unit_id || ''));
    res.json({ success : true, holder : cur ? { username : cur.username, name : cur.name } : null });
});

app.get(`${BASE}/users`, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, username, display_name, role, boards FROM planning_users WHERE active = 1 ORDER BY id');
        res.json({ success : true, users : rows.map(userDto) });
    }
    catch (e) { res.status(500).json({ success : false, error : e.message }); }
});

// Upsert the user list. Existing users are matched by id; `password` (when
// present) rotates the hash; new entries need a username (+ optional password,
// default 1234).
app.post(`${BASE}/users`, async (req, res) => {
    try {
        const list = Array.isArray(req.body?.users) ? req.body.users : [];
        for (const u of list) {
            const dbId   = String(u.id || '').replace(/^u/, '');
            const boards = JSON.stringify(Array.isArray(u.boards) ? u.boards : []);
            if (/^\d+$/.test(dbId)) {
                await pool.query(
                    `UPDATE planning_users SET display_name = ?, role = ?, boards = ?${u.password ? ', password_hash = ?' : ''}, updated_at = NOW() WHERE id = ?`,
                    u.password
                        ? [u.name, u.role, boards, hashPassword(u.password), dbId]
                        : [u.name, u.role, boards, dbId]
                );
            }
            else if (u.username) {
                await pool.query(
                    `INSERT INTO planning_users (username, display_name, role, boards, password_hash)
                     VALUES (?,?,?,?,?)
                     ON DUPLICATE KEY UPDATE display_name = VALUES(display_name), role = VALUES(role), boards = VALUES(boards)`,
                    [String(u.username).trim().toLowerCase(), u.name || u.username, u.role || 'Planner', boards, hashPassword(u.password || '1234')]
                );
            }
        }
        const [rows] = await pool.query(
            'SELECT id, username, display_name, role, boards FROM planning_users WHERE active = 1 ORDER BY id');
        res.json({ success : true, users : rows.map(userDto) });
    }
    catch (e) { res.status(500).json({ success : false, error : e.message }); }
});

// --------------------------------------------------------------------------
// Auto-sync: run ERP order sync on startup and every SYNC_INTERVAL_MS
// --------------------------------------------------------------------------
// Continuous auto-sync: the full ERP upsert is idempotent, so it simply runs
// every SYNC_INTERVAL_MS — new POs created in ERP surface in the Orders list
// within one interval instead of waiting for a fixed daily slot.
const SYNC_INTERVAL_MS = 15 * 60 * 1000;
let syncRunning = false;

async function runAutoSync() {
    if (syncRunning) {
        console.log(`[auto-sync] ${new Date().toISOString()} — previous sync still running, skipped`);
        return null;
    }
    syncRunning = true;
    const [sql, params] = ERP_QUERY(ERP_CUTOFF);
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.query(sql, params);
        if (!rows.length) {
            console.log(`[auto-sync] ${new Date().toISOString()} — no ERP orders found since ${ERP_CUTOFF}`);
            return { synced : 0, removed : 0 };
        }

        const safeStr = s => String(s || '')
            .replace(/[‐-―−]/g, '-')
            .replace(/['']/g, "'")
            .replace(/[""]/g, '"')
            .replace(/[^\x00-\xFF]/g, '?');

        await conn.beginTransaction();
        let synced = 0;
        for (const r of rows) {
            await conn.query(`
                INSERT INTO planning_orders
                    (erp_po_id, erp_order_id, po_number, order_code,
                     buyer_name, style_no, color,
                     order_quantity, remaining_quantity,
                     smv, product_category,
                     shipment_date, order_delivery_date, pcd, material_ready_date,
                     unit_id, prod_unit, priority, planning_status, synced_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unplanned', NOW(), NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                    erp_order_id       = VALUES(erp_order_id),
                    buyer_name         = VALUES(buyer_name),
                    style_no           = VALUES(style_no),
                    color              = VALUES(color),
                    order_quantity     = VALUES(order_quantity),
                    remaining_quantity = VALUES(remaining_quantity),
                    smv                = IF(VALUES(smv) > 0, VALUES(smv), smv),
                    product_category   = COALESCE(VALUES(product_category), product_category),
                    shipment_date      = VALUES(shipment_date),
                    order_delivery_date= VALUES(order_delivery_date),
                    pcd                = COALESCE(VALUES(pcd), pcd),
                    unit_id            = VALUES(unit_id),
                    prod_unit          = COALESCE(VALUES(prod_unit), prod_unit),
                    priority           = COALESCE(VALUES(priority), priority),
                    synced_at          = NOW(),
                    updated_at         = NOW()
            `, [
                String(r.src_id),
                r.order_code ? safeStr(r.order_code) : null,
                safeStr(r.po_number),
                r.order_code ? safeStr(r.order_code) : null,
                safeStr(r.buyer_name),
                safeStr(r.style_no),
                r.color ? safeStr(r.color) : null,
                Number(r.order_quantity) || 0,
                Number(r.order_quantity) || 0,
                Number(r.smv) || 0,
                r.product_category || null,
                r.shipment_date || null,
                r.shipment_date || null,
                r.pcd || null,
                r.material_ready_date || null,
                r.unit_id ?? null,
                r.prod_unit ?? null,
                2
            ]);
            synced++;
        }

        // Reconcile ERP-side deletions: a PO deleted from mr_purchase_order or
        // set to status 3 must leave the Orders list — and the board — on the
        // next sync tick, mirroring how creations flow IN automatically.
        const [liveRows] = await conn.query(
            `SELECT po_id FROM \`${ERP_DB}\`.mr_purchase_order
             WHERE (status IS NULL OR status != 3)
               AND (po_status IS NULL OR po_status != 3)`);
        const liveIds = new Set(liveRows.map(r => String(r.po_id)));
        const [ploRows] = await conn.query(
            `SELECT id, erp_po_id, order_code, po_number, order_quantity
             FROM planning_orders
             WHERE erp_po_id IS NOT NULL AND erp_po_id != ''
               AND (shipment_date IS NULL OR shipment_date >= ?)`,
            [ERP_CUTOFF]);
        const dead = ploRows.filter(r => !liveIds.has(String(r.erp_po_id)));
        let removed = 0;
        for (const row of dead) {
            const rowId = Number(row.id);
            // Events anchored to the dead row: single-PO bars are deleted
            // outright; consolidated bars lose this member and re-anchor to a
            // surviving one
            const [evs] = await conn.query(
                'SELECT id, notes FROM planning_events WHERE planning_order_id = ?', [rowId]);
            for (const ev of evs) {
                let ng = {};
                try { ng = JSON.parse(ev.notes || '{}'); } catch { /* keep {} */ }
                const ids = Array.isArray(ng.idList) ? ng.idList.map(Number) : [];
                const idx = ids.indexOf(rowId);
                if (ids.length > 1 && idx >= 0) {
                    if (Array.isArray(ng.poList) && ng.poList.length === ids.length) ng.poList.splice(idx, 1);
                    ids.splice(idx, 1);
                    ng.idList = ids;
                    await conn.query(
                        `UPDATE planning_events SET planning_order_id = ?, notes = ?,
                                planned_quantity = GREATEST(planned_quantity - ?, 0), updated_at = NOW()
                         WHERE id = ?`,
                        [ids[0], JSON.stringify(ng), Number(row.order_quantity) || 0, ev.id]);
                }
                else {
                    await conn.query('DELETE FROM planning_assignments WHERE event_id = ?', [ev.id]);
                    await conn.query('DELETE FROM planning_events WHERE id = ?', [ev.id]);
                }
            }
            // Consolidated bars anchored to ANOTHER row that list this row as
            // a group member: strip the member, keep the bar
            const [covers] = await conn.query(
                `SELECT id, notes FROM planning_events
                 WHERE notes LIKE ? AND (planning_order_id IS NULL OR planning_order_id != ?)`,
                [`%${rowId}%`, rowId]);
            for (const ev of covers) {
                let ng = {};
                try { ng = JSON.parse(ev.notes || '{}'); } catch { continue; }
                const ids = Array.isArray(ng.idList) ? ng.idList.map(Number) : [];
                const idx = ids.indexOf(rowId);
                if (idx < 0) continue;
                if (Array.isArray(ng.poList) && ng.poList.length === ids.length) ng.poList.splice(idx, 1);
                ids.splice(idx, 1);
                ng.idList = ids;
                await conn.query(
                    `UPDATE planning_events SET notes = ?,
                            planned_quantity = GREATEST(planned_quantity - ?, 0), updated_at = NOW()
                     WHERE id = ?`,
                    [JSON.stringify(ng), Number(row.order_quantity) || 0, ev.id]);
            }
            await conn.query('DELETE FROM planning_orders WHERE id = ?', [rowId]);
            removed++;
        }

        await conn.commit();
        console.log(`[auto-sync] ${new Date().toISOString()} — synced ${synced} ERP orders (since ${ERP_CUTOFF})`
            + (removed ? `, removed ${removed} PO(s) deleted/cancelled in ERP` : ''));
        return { synced, removed };
    }
    catch (e) {
        try { await conn.rollback(); } catch { /* gone */ }
        console.error(`[auto-sync] ${new Date().toISOString()} — ERROR: ${e.message}`);
        return { synced : 0, removed : 0, error : e.message };
    }
    finally {
        conn.release();
        syncRunning = false;
    }
}

app.listen(PORT, () => {
    console.log(`Planning API listening on http://localhost:${PORT}${BASE} -> MySQL ${DB_HOST}/${DB_NAME}`);
    ensureUsersTable().catch(e => console.error('[users] table init failed:', e.message));
    // Run once on startup so orders are fresh immediately
    runAutoSync();
    // Then continuously, every SYNC_INTERVAL_MS
    setInterval(runAutoSync, SYNC_INTERVAL_MS);
    console.log(`[auto-sync] ERP sync runs every ${SYNC_INTERVAL_MS / 60000} min (cutoff: ${ERP_CUTOFF})`);
});
