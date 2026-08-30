// ---------------------------------------------------------------------------
// MBM ERP Production Planning API (document section 6, minimal subset)
// Serves scheduler-data / scheduler-sync / unplanned-orders from MySQL
// ---------------------------------------------------------------------------
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

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
                   default_efficiency, manpower, machine_count, capacity_minutes_per_day, sort_order
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
                        default_efficiency, manpower, machine_count, capacity_minutes_per_day, sort_order
                 FROM planning_resources WHERE active = TRUE ORDER BY sort_order`
            );
        }

        let eventSql = `
            SELECT e.id, e.planning_order_id, e.event_code, e.event_name, e.production_stage, e.start_date, e.end_date,
                    e.duration, e.duration_unit, e.planned_quantity, e.percent_done,
                    e.manually_scheduled, e.event_status, e.notes,
                    o.buyer_name, o.style_no, o.po_number, o.order_code, o.order_quantity, o.smv,
                    o.product_category, o.pcd, o.shipment_date, o.material_ready_date, o.priority,
                    o.unit_id AS order_unit_id
             FROM planning_events e
             LEFT JOIN planning_orders o ON o.id = e.planning_order_id
             WHERE e.project_id = ? AND e.event_status != 'cancelled'`;
        const eventParams = [projectId];
        if (effUnit) {
            eventSql += `
               AND (
                   o.unit_id = ?
                   OR (o.id IS NULL AND EXISTS (
                       SELECT 1 FROM planning_assignments a
                       JOIN planning_resources r ON r.id = a.resource_id
                       WHERE a.event_id = e.id AND r.unit_id = ?
                   ))
               )`;
            eventParams.push(effUnit, effUnit);
        }
        const [events] = await pool.query(eventSql, eventParams);

        const [assignments] = await pool.query(
            `SELECT a.id, a.event_id, a.resource_id
             FROM planning_assignments a
             JOIN planning_events e ON e.id = a.event_id
             WHERE e.project_id = ?`,
            [projectId]
        );

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
app.get(`${BASE}/unplanned-orders`, async (req, res) => {
    try {
        const limit   = Math.min(Number(req.query.limit)   || 9999, 9999);
        const offset  = Number(req.query.offset) || 0;
        const unitId  = req.query.unit_id ? Number(req.query.unit_id) : null;

        const unitFilter = unitId ? 'AND unit_id = ?' : '';
        const baseParams = unitId ? [unitId] : [];

        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) AS total FROM planning_orders
             WHERE planning_status = 'unplanned'
               AND (shipment_date IS NULL OR shipment_date >= '${ERP_CUTOFF}')
               ${unitFilter}`,
            baseParams
        );

        const [rows] = await pool.query(
            `SELECT id, buyer_name, style_no, po_number, order_code, order_quantity, remaining_quantity, smv,
                    product_category, pcd, shipment_date, material_ready_date, unit_id, priority, suitable_lines
             FROM planning_orders
             WHERE planning_status = 'unplanned'
               AND (shipment_date IS NULL OR shipment_date >= '${ERP_CUTOFF}')
               ${unitFilter}
             ORDER BY priority, shipment_date
             LIMIT ? OFFSET ?`,
            [...baseParams, limit, offset]
        );
        const enriched = rows.map(r => ({
            ...r,
            unit_name : unitLabel(r.unit_id)
        }));
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
    if (ev.orderId) {
        await conn.query(
            "UPDATE planning_orders SET planning_status = 'fully_planned', updated_at = NOW() WHERE id = ?",
            [ev.orderId]
        );
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
    const { events = {}, requestId = null } = req.body || {};
    const conn = await pool.getConnection();
    const mapped = [];
    try {
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
                     updated_at = NOW()
                 WHERE id = ?`,
                [ev.startDate ?? null, ev.endDate ?? null, ev.duration ?? null,
                 ev.plannedQuantity ?? null, ev.status ?? null, ev.percentDone ?? null,
                 ev.notes ?? null,
                 ev.notes != null ? 1 : null, ev.notes != null ? 1 : 0,
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
        res.json({ success : true, requestId, revision : bumpRev(projectId), mapped });
    }
    catch (e) {
        try {
            await conn.rollback();
        }
        catch { /* connection already gone - nothing to roll back on */ }
        res.status(500).json({ success : false, error : e.message });
    }
    finally {
        conn.release();
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
        NULL                                              AS pcd,
        NULL                                              AS material_ready_date,
        mc.clr_name                                       AS color,
        oe.unit_id                                        AS unit_id,
        2                                                 AS priority
    FROM \`${ERP_DB}\`.mr_purchase_order   po
    JOIN \`${ERP_DB}\`.mr_order_entry      oe ON oe.order_id  = po.mr_order_entry_order_id
    JOIN \`${ERP_DB}\`.mr_buyer            b  ON b.b_id       = oe.mr_buyer_b_id
    JOIN \`${ERP_DB}\`.mr_style            s  ON s.stl_id     = oe.mr_style_stl_id
    LEFT JOIN \`${ERP_DB}\`.mr_product_type  pt ON pt.prd_type_id = s.prd_type_id
    LEFT JOIN \`${ERP_DB}\`.mr_material_color mc ON mc.clr_id  = po.clr_id
    WHERE COALESCE(po.po_ex_fty, oe.order_delivery_date) >= ?
      AND po.po_qty > 0
      AND oe.order_status NOT IN ('Closed','Inactive')
    ORDER BY COALESCE(po.po_ex_fty, oe.order_delivery_date)
`, [cutoff]];

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

app.post(`${BASE}/sync-erp-orders`, async (req, res) => {
    const since = req.body?.since || ERP_CUTOFF;
    const conn = await pool.getConnection();
    try {
        const [sql, params] = ERP_QUERY(since);
        const [rows] = await conn.query(sql, params);
        if (!rows.length) {
            conn.release();
            return res.json({ success : true, synced : 0, message : `No ERP orders found since ${since}` });
        }
        await conn.beginTransaction();
        let synced = 0;
        // Sanitize: replace fancy unicode chars (smart dashes, etc.) with ASCII equivalents
        const safeStr = s => String(s || '')
            .replace(/[‐-―−]/g, '-')  // various dashes → hyphen
            .replace(/[‘’]/g, "'")           // curly single quotes
            .replace(/[“”]/g, '"')           // curly double quotes
            .replace(/[^\x00-\xFF]/g, '?');            // strip remaining non-latin1 chars

        for (const r of rows) {
            await conn.query(`
                INSERT INTO planning_orders
                    (erp_po_id, erp_order_id, po_number, order_code,
                     buyer_name, style_no, color,
                     order_quantity, remaining_quantity,
                     smv, product_category,
                     shipment_date, order_delivery_date, pcd, material_ready_date,
                     unit_id, priority, planning_status, synced_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unplanned', NOW(), NOW(), NOW())
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
                    unit_id            = VALUES(unit_id),
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
                2
            ]);
            synced++;
        }
        await conn.commit();
        res.json({ success : true, synced, since });
    }
    catch (e) {
        try { await conn.rollback(); } catch { /* gone */ }
        res.status(500).json({ success : false, error : e.message });
    }
    finally {
        conn.release();
    }
});

// --------------------------------------------------------------------------
// Auto-sync: run ERP order sync on startup and every SYNC_INTERVAL_MS
// --------------------------------------------------------------------------
// Scheduled sync times (24h, local time): 10:00, 14:00, 17:00
// Scheduled sync times (24h, local time): 10:30, 14:00, 17:00
const SYNC_TIMES = [
    { h: 10, m: 30 },
    { h: 14, m: 0  },
    { h: 17, m: 0  }
];

async function runAutoSync() {
    const [sql, params] = ERP_QUERY(ERP_CUTOFF);
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.query(sql, params);
        if (!rows.length) {
            console.log(`[auto-sync] ${new Date().toISOString()} — no ERP orders found since ${ERP_CUTOFF}`);
            return;
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
                     unit_id, priority, planning_status, synced_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unplanned', NOW(), NOW(), NOW())
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
                    unit_id            = VALUES(unit_id),
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
                2
            ]);
            synced++;
        }
        await conn.commit();
        console.log(`[auto-sync] ${new Date().toISOString()} — synced ${synced} ERP orders (since ${ERP_CUTOFF})`);
    }
    catch (e) {
        try { await conn.rollback(); } catch { /* gone */ }
        console.error(`[auto-sync] ${new Date().toISOString()} — ERROR: ${e.message}`);
    }
    finally {
        conn.release();
    }
}

// Find ms until the next scheduled sync time
function msUntilNextSync() {
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const candidates = SYNC_TIMES.map(t => {
        const d = new Date(today);
        d.setHours(t.h, t.m, 0, 0);
        return d;
    });
    // Find next future slot (could be today or tomorrow's first slot)
    const future = candidates.filter(d => d > now);
    const next   = future.length
        ? future[0]
        : (() => { const d = new Date(candidates[0]); d.setDate(d.getDate() + 1); return d; })();
    return { ms: next - now, label: next.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
}

function scheduleNextSync() {
    const { ms, label } = msUntilNextSync();
    console.log(`[auto-sync] Next ERP sync scheduled at ${label} (in ${Math.round(ms / 60000)} min)`);
    setTimeout(async () => {
        await runAutoSync();
        scheduleNextSync(); // schedule the one after
    }, ms);
}

app.listen(PORT, () => {
    console.log(`Planning API listening on http://localhost:${PORT}${BASE} -> MySQL ${DB_HOST}/${DB_NAME}`);
    // Run once on startup so orders are fresh immediately
    runAutoSync();
    // Then schedule 10:00 / 14:00 / 17:00 daily
    scheduleNextSync();
    console.log(`[auto-sync] ERP sync scheduled at 10:00, 14:00, 17:00 daily (cutoff: ${ERP_CUTOFF})`);
});
