// ---------------------------------------------------------------------------
// High Level Planning Board — server side.
//
// A standalone simulation workspace: scenarios with their own units, lines,
// products, holidays, orders and reservations, stored ONLY in the hl_*
// tables below. The live plan (planning_* tables, ERP) is read here for the
// optional reference import and for nothing else — this module never issues
// an INSERT / UPDATE / DELETE against a planning_* table (guarded by
// server/highLevel.test.mjs).
// ---------------------------------------------------------------------------

import { autoBalance, mergeErpOrders } from '../src/hlBalance.js';

export function mountHighLevel(app, { pool, BASE, dbFail, ERP_DB, ERP_CUTOFF = '2026-10-09' }) {
    const HL = `${BASE}/hl`;

    async function ensureTables() {
        await pool.query(`CREATE TABLE IF NOT EXISTS hl_scenarios (
            id VARCHAR(40) PRIMARY KEY,
            name VARCHAR(120) NOT NULL,
            created_by VARCHAR(60) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            updated_by VARCHAR(60) NULL,
            version INT NOT NULL DEFAULT 1,
            plan_from DATE NULL,
            plan_to DATE NULL,
            thresholds TEXT NULL,
            source_note VARCHAR(200) NULL,
            source_at DATETIME NULL,
            deleted_at DATETIME NULL
        )`);
        await pool.query(`CREATE TABLE IF NOT EXISTS hl_units (
            scenario_id VARCHAR(40) NOT NULL,
            code VARCHAR(4) NOT NULL,
            name VARCHAR(40) NOT NULL,
            label VARCHAR(40) NULL,
            hours DECIMAL(5,2) NOT NULL DEFAULT 10,
            ot DECIMAL(5,2) NOT NULL DEFAULT 0,
            work_days VARCHAR(40) NOT NULL DEFAULT '[0,1,2,3,4,6]',
            note VARCHAR(200) NULL,
            PRIMARY KEY (scenario_id, code)
        )`);
        await pool.query(`CREATE TABLE IF NOT EXISTS hl_lines (
            id VARCHAR(40) PRIMARY KEY,
            scenario_id VARCHAR(40) NOT NULL,
            unit_code VARCHAR(4) NOT NULL,
            name VARCHAR(60) NOT NULL,
            active TINYINT(1) NOT NULL DEFAULT 1,
            manpower DECIMAL(7,2) NOT NULL DEFAULT 0,
            hours DECIMAL(5,2) NULL,
            ot DECIMAL(5,2) NULL,
            eff DECIMAL(6,2) NOT NULL DEFAULT 60,
            sort_order INT NOT NULL DEFAULT 0,
            KEY idx_hl_lines (scenario_id, unit_code)
        )`);
        await pool.query(`CREATE TABLE IF NOT EXISTS hl_line_products (
            line_id VARCHAR(40) NOT NULL,
            product VARCHAR(80) NOT NULL,
            smv DECIMAL(8,3) NOT NULL,
            PRIMARY KEY (line_id, product)
        )`);
        await pool.query(`CREATE TABLE IF NOT EXISTS hl_products (
            scenario_id VARCHAR(40) NOT NULL,
            name VARCHAR(80) NOT NULL,
            smv DECIMAL(8,3) NOT NULL DEFAULT 20,
            PRIMARY KEY (scenario_id, name)
        )`);
        await pool.query(`CREATE TABLE IF NOT EXISTS hl_holidays (
            id INT AUTO_INCREMENT PRIMARY KEY,
            scenario_id VARCHAR(40) NOT NULL,
            unit_code VARCHAR(4) NULL,
            hol_date DATE NOT NULL,
            label VARCHAR(80) NULL,
            kind VARCHAR(12) NOT NULL DEFAULT 'holiday',
            KEY idx_hl_hol (scenario_id, hol_date)
        )`);
        await pool.query(`CREATE TABLE IF NOT EXISTS hl_orders (
            id VARCHAR(40) PRIMARY KEY,
            scenario_id VARCHAR(40) NOT NULL,
            buyer VARCHAR(120) NULL,
            style VARCHAR(120) NULL,
            product VARCHAR(80) NULL,
            qty INT NOT NULL DEFAULT 0,
            pcd DATE NULL,
            delivery DATE NULL,
            unit_code VARCHAR(4) NULL,
            note VARCHAR(200) NULL,
            source VARCHAR(40) NULL,
            KEY idx_hl_orders (scenario_id)
        )`);
        await pool.query(`CREATE TABLE IF NOT EXISTS hl_reservations (
            id VARCHAR(40) PRIMARY KEY,
            scenario_id VARCHAR(40) NOT NULL,
            order_id VARCHAR(40) NULL,
            line_id VARCHAR(40) NOT NULL,
            product VARCHAR(80) NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            qty INT NOT NULL DEFAULT 0,
            locked TINYINT(1) NOT NULL DEFAULT 0,
            status VARCHAR(16) NOT NULL DEFAULT 'reserved',
            label VARCHAR(160) NULL,
            source VARCHAR(40) NULL,
            KEY idx_hl_res (scenario_id, line_id)
        )`);
    }
    ensureTables()
        .then(async () => {
            // additive column (MariaDB: IF NOT EXISTS) — month-wise / day-wise unit hours
            await pool.query('ALTER TABLE hl_units ADD COLUMN IF NOT EXISTS day_hours TEXT NULL');
            await pool.query('ALTER TABLE hl_units ADD COLUMN IF NOT EXISTS avg_smv DECIMAL(8,3) NULL');
            // Central Auto Balance (additive, simulation tables only)
            await pool.query('ALTER TABLE hl_scenarios ADD COLUMN IF NOT EXISTS balance TEXT NULL');
            await pool.query('ALTER TABLE hl_lines ADD COLUMN IF NOT EXISTS pool TINYINT(1) NOT NULL DEFAULT 0');
            await pool.query('ALTER TABLE hl_orders ADD COLUMN IF NOT EXISTS garment VARCHAR(80) NULL');
            await pool.query('ALTER TABLE hl_orders ADD COLUMN IF NOT EXISTS smv DECIMAL(8,3) NULL');
            await pool.query('ALTER TABLE hl_orders ADD COLUMN IF NOT EXISTS outstanding INT NULL');
            await pool.query('ALTER TABLE hl_orders ADD COLUMN IF NOT EXISTS priority TINYINT(1) NOT NULL DEFAULT 0');
            await pool.query('ALTER TABLE hl_orders ADD COLUMN IF NOT EXISTS po VARCHAR(400) NULL');
            await pool.query('ALTER TABLE hl_reservations ADD COLUMN IF NOT EXISTS kind VARCHAR(12) NULL');
            await pool.query('ALTER TABLE hl_reservations ADD COLUMN IF NOT EXISTS from_unit VARCHAR(4) NULL');
            await pool.query('ALTER TABLE hl_reservations ADD COLUMN IF NOT EXISTS reason VARCHAR(400) NULL');
            await pool.query('ALTER TABLE hl_reservations ADD COLUMN IF NOT EXISTS ext_status VARCHAR(16) NULL');
            await pool.query('ALTER TABLE hl_reservations ADD COLUMN IF NOT EXISTS smv DECIMAL(8,3) NULL');
            await pool.query('ALTER TABLE hl_reservations ADD COLUMN IF NOT EXISTS plan_status VARCHAR(12) NULL');
            await pool.query('ALTER TABLE hl_reservations ADD COLUMN IF NOT EXISTS lc_days INT NULL');
            await pool.query('ALTER TABLE hl_reservations ADD COLUMN IF NOT EXISTS day_pcs TEXT NULL');   // the planned bar's own day spread
            await pool.query('ALTER TABLE hl_orders ADD COLUMN IF NOT EXISTS is_repeat TINYINT(1) NOT NULL DEFAULT 0');
            await pool.query('ALTER TABLE hl_orders ADD COLUMN IF NOT EXISTS repeat_of VARCHAR(60) NULL');
            // ERP orders grouped by buyer + production unit + style + colour + PCD + delivery (one bar per group)
            await pool.query('ALTER TABLE hl_orders ADD COLUMN IF NOT EXISTS color VARCHAR(120) NULL');
            await pool.query('ALTER TABLE hl_orders ADD COLUMN IF NOT EXISTS codes VARCHAR(400) NULL');
            await pool.query('ALTER TABLE hl_orders ADD COLUMN IF NOT EXISTS pos INT NULL');
            await pool.query('ALTER TABLE hl_orders MODIFY source VARCHAR(200) NULL');
            console.log('[hl] High Level Planning tables ready');
        })
        .catch(e => console.error('[hl] tables:', e.message));

    const ymd = d => d instanceof Date
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        : (d ? String(d).slice(0, 10) : null);
    const fmtDt = d => d instanceof Date
        ? `${ymd(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
        : (d ? String(d).slice(0, 16) : null);
    const uid = (p = 'hl') => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    const who = req => String(req.query?.by || req.body?.by || '').trim();

    // Access to the High Level board lives in planning_users.boards like a
    // board's: 'hl' = write (simulate and save), 'hl:read' = look only.
    // A Planning Manager always has write.
    async function user(req) {
        const u = who(req);
        if (!u) return null;
        const [[row]] = await pool.query('SELECT username, role, display_name, boards FROM planning_users WHERE username = ? AND active = 1', [u]);
        if (!row) return null;
        let b = [];
        try { b = typeof row.boards === 'string' ? JSON.parse(row.boards) : (row.boards || []); } catch { b = []; }
        const write = row.role === 'Planning Manager' || b.includes('hl');
        return { ...row, hlAccess : write ? 'write' : (b.includes('hl:read') ? 'read' : null) };
    }
    const deny = (res, u, need) => res.status(403).json({ success : false, error : !u ? 'Sign in first' : `No ${need} access to the High Level Planning Board (Setup → Settings — users & permissions)` });
    async function needRead(req, res)  { const u = await user(req); if (!u?.hlAccess) { deny(res, u, 'read'); return null; } return u; }
    async function needWrite(req, res) { const u = await user(req); if (u?.hlAccess !== 'write') { deny(res, u, 'write'); return null; } return u; }

    // ---- list / create / rename / delete ----------------------------------
    app.get(`${HL}/scenarios`, async (req, res) => {
        try {
            if (!(await needRead(req, res))) return;
            const [rows] = await pool.query(
                `SELECT s.*, (SELECT COUNT(*) FROM hl_orders o WHERE o.scenario_id = s.id) AS orders,
                        (SELECT COUNT(*) FROM hl_reservations r WHERE r.scenario_id = s.id AND r.status <> 'cancelled') AS reservations
                   FROM hl_scenarios s WHERE s.deleted_at IS NULL ORDER BY s.updated_at DESC`);
            res.json({ success : true, rows : rows.map(r => ({
                id : r.id, name : r.name, createdBy : r.created_by, createdAt : fmtDt(r.created_at), updatedAt : fmtDt(r.updated_at), updatedBy : r.updated_by,
                version : r.version, from : ymd(r.plan_from), to : ymd(r.plan_to), orders : r.orders, reservations : r.reservations,
                source : r.source_note ? { note : r.source_note, at : fmtDt(r.source_at) } : null
            })) });
        }
        catch (e) { dbFail(res, e); }
    });

    async function readBundle(id) {
        const [[s]] = await pool.query('SELECT * FROM hl_scenarios WHERE id = ? AND deleted_at IS NULL', [id]);
        if (!s) return null;
        const [units] = await pool.query('SELECT * FROM hl_units WHERE scenario_id = ? ORDER BY FIELD(code, "M","C","A","G"), code', [id]);
        const [lines] = await pool.query('SELECT * FROM hl_lines WHERE scenario_id = ? ORDER BY unit_code, sort_order, name', [id]);
        const lineIds = lines.map(l => l.id);
        const [lp] = lineIds.length ? await pool.query(`SELECT * FROM hl_line_products WHERE line_id IN (${lineIds.map(() => '?').join(',')})`, lineIds) : [[]];
        const [products] = await pool.query('SELECT * FROM hl_products WHERE scenario_id = ? ORDER BY name', [id]);
        const [holidays] = await pool.query('SELECT * FROM hl_holidays WHERE scenario_id = ? ORDER BY hol_date', [id]);
        const [orders] = await pool.query('SELECT * FROM hl_orders WHERE scenario_id = ? ORDER BY delivery, buyer', [id]);
        const [reservations] = await pool.query('SELECT * FROM hl_reservations WHERE scenario_id = ? ORDER BY start_date', [id]);
        const prodByLine = new Map();
        for (const x of lp) { if (!prodByLine.has(x.line_id)) prodByLine.set(x.line_id, {}); prodByLine.get(x.line_id)[x.product] = Number(x.smv); }
        let thresholds = null, balance = null;
        try { thresholds = JSON.parse(s.thresholds || 'null'); } catch { thresholds = null; }
        try { balance = JSON.parse(s.balance || 'null'); } catch { balance = null; }
        return {
            id : s.id, name : s.name, version : s.version, createdBy : s.created_by, updatedAt : fmtDt(s.updated_at), updatedBy : s.updated_by,
            from : ymd(s.plan_from), to : ymd(s.plan_to), thresholds : thresholds || { partial : 0.4, full : 0.9 }, balance : balance || null,
            source : s.source_note ? { note : s.source_note, at : fmtDt(s.source_at) } : null,
            units : units.map(u => { let wd = [0, 1, 2, 3, 4, 6], dh = {}; try { wd = JSON.parse(u.work_days); } catch { /* default */ } try { dh = JSON.parse(u.day_hours || '{}') || {}; } catch { dh = {}; }
                return { code : u.code, name : u.name, label : u.label, hours : Number(u.hours), ot : Number(u.ot), workDays : wd, dayHours : dh, avgSmv : u.avg_smv == null ? null : Number(u.avg_smv), note : u.note || '' }; }),
            lines : lines.map(l => ({ id : l.id, unitCode : l.unit_code, name : l.name, active : !!l.active, manpower : Number(l.manpower), pool : !!l.pool,
                hours : l.hours == null ? null : Number(l.hours), ot : l.ot == null ? null : Number(l.ot), eff : Number(l.eff), products : prodByLine.get(l.id) || {} })),
            products : products.map(p => ({ name : p.name, smv : Number(p.smv) })),
            holidays : holidays.map(h => ({ date : ymd(h.hol_date), unitCode : h.unit_code || null, label : h.label || '', kind : h.kind || 'holiday' })),
            orders : orders.map(o => ({ id : o.id, buyer : o.buyer || '', style : o.style || '', product : o.product || '', qty : Number(o.qty), pcd : ymd(o.pcd), delivery : ymd(o.delivery), unitCode : o.unit_code || '', note : o.note || '', source : o.source || null,
                garment : o.garment || '', smv : o.smv == null ? null : Number(o.smv), outstanding : o.outstanding == null ? null : Number(o.outstanding), priority : !!o.priority, po : o.po || '',
                repeat : !!o.is_repeat, repeatOf : o.repeat_of || null, color : o.color || '', codes : o.codes || '', pos : o.pos == null ? null : Number(o.pos) })),
            reservations : reservations.map(r => ({ id : r.id, orderId : r.order_id, lineId : r.line_id, product : r.product || null, start : ymd(r.start_date), end : ymd(r.end_date), qty : Number(r.qty), locked : !!r.locked, status : r.status, label : r.label || '', source : r.source || null,
                kind : r.kind || null, fromUnit : r.from_unit || null, reason : r.reason || null, extStatus : r.ext_status || null, smv : r.smv == null ? null : Number(r.smv),
                planStatus : r.plan_status || null, lcDays : r.lc_days == null ? 0 : Number(r.lc_days), dayPcs : (() => { try { const v = JSON.parse(r.day_pcs || 'null'); return Array.isArray(v) ? v : null; } catch { return null; } })() }))
        };
    }

    // write every child row of a scenario inside one transaction (delete + insert:
    // ids are client-stable strings, so references survive)
    async function writeBundle(conn, id, sc, by) {
        await conn.query('DELETE FROM hl_units WHERE scenario_id = ?', [id]);
        await conn.query('DELETE FROM hl_line_products WHERE line_id IN (SELECT id FROM hl_lines WHERE scenario_id = ?)', [id]);
        await conn.query('DELETE FROM hl_lines WHERE scenario_id = ?', [id]);
        await conn.query('DELETE FROM hl_products WHERE scenario_id = ?', [id]);
        await conn.query('DELETE FROM hl_holidays WHERE scenario_id = ?', [id]);
        await conn.query('DELETE FROM hl_orders WHERE scenario_id = ?', [id]);
        await conn.query('DELETE FROM hl_reservations WHERE scenario_id = ?', [id]);
        // multi-row inserts: the DB sits behind a WAN hop, one round trip per
        // row made a scenario with a few hundred reservations slow to save
        const bulk = async (sql, cols, rows) => {
            for (let i = 0; i < rows.length; i += 200) {
                const chunk = rows.slice(i, i + 200);
                const ph = chunk.map(() => `(${cols.map(() => '?').join(',')})`).join(',');
                await conn.query(`${sql} VALUES ${ph}`, chunk.flat());
            }
        };
        await bulk('INSERT INTO hl_units (scenario_id, code, name, label, hours, ot, work_days, note, day_hours, avg_smv)', Array(10).fill(0),
            (sc.units || []).map(u => [id, u.code, u.name, u.label || null, Number(u.hours) || 0, Number(u.ot) || 0, JSON.stringify(u.workDays || [0, 1, 2, 3, 4, 6]), u.note || null, JSON.stringify(u.dayHours || {}),
                u.avgSmv == null || u.avgSmv === '' ? null : Number(u.avgSmv)]));
        const lines = sc.lines || [];
        await bulk('INSERT INTO hl_lines (id, scenario_id, unit_code, name, active, manpower, hours, ot, eff, sort_order, pool)', Array(11).fill(0),
            lines.map((l, i) => [l.id, id, l.unitCode, l.name, l.active ? 1 : 0, Number(l.manpower) || 0, l.hours == null || l.hours === '' ? null : Number(l.hours), l.ot == null || l.ot === '' ? null : Number(l.ot), Number(l.eff) || 0, i, l.pool ? 1 : 0]));
        const lp = [];
        for (const l of lines) for (const [p, smv] of Object.entries(l.products || {})) if (smv != null && smv !== '' && Number(smv) > 0) lp.push([l.id, p, Number(smv)]);
        await bulk('INSERT INTO hl_line_products (line_id, product, smv)', Array(3).fill(0), lp);
        await bulk('INSERT IGNORE INTO hl_products (scenario_id, name, smv)', Array(3).fill(0), (sc.products || []).map(p => [id, p.name, Number(p.smv) || 20]));
        await bulk('INSERT INTO hl_holidays (scenario_id, unit_code, hol_date, label, kind)', Array(5).fill(0), (sc.holidays || []).map(h => [id, h.unitCode || null, h.date, h.label || null, h.kind || 'holiday']));
        await bulk('INSERT INTO hl_orders (id, scenario_id, buyer, style, product, qty, pcd, delivery, unit_code, note, source, garment, smv, outstanding, priority, po, is_repeat, repeat_of, color, codes, pos)', Array(21).fill(0),
            (sc.orders || []).map(o => [o.id, id, o.buyer || null, o.style || null, o.product || null, Number(o.qty) || 0, o.pcd || null, o.delivery || null, o.unitCode || null, o.note || null, o.source ? String(o.source).slice(0, 200) : null,
                o.garment || null, o.smv == null || o.smv === '' ? null : Number(o.smv), o.outstanding == null ? null : Number(o.outstanding), o.priority ? 1 : 0, o.po ? String(o.po).slice(0, 400) : null,
                o.repeat ? 1 : 0, o.repeatOf ? String(o.repeatOf).slice(0, 60) : null, o.color ? String(o.color).slice(0, 120) : null, o.codes ? String(o.codes).slice(0, 400) : null, o.pos == null ? null : Number(o.pos)]));
        await bulk('INSERT INTO hl_reservations (id, scenario_id, order_id, line_id, product, start_date, end_date, qty, locked, status, label, source, kind, from_unit, reason, ext_status, smv, plan_status, lc_days, day_pcs)', Array(20).fill(0),
            (sc.reservations || []).map(r => [r.id, id, r.orderId || null, r.lineId, r.product || null, r.start, r.end, Number(r.qty) || 0, r.locked ? 1 : 0, r.status || 'reserved', r.label || null, r.source || null,
                r.kind || null, r.fromUnit || null, r.reason ? String(r.reason).slice(0, 400) : null, r.extStatus || null, r.smv == null ? null : Number(r.smv),
                r.planStatus || null, r.lcDays ? Number(r.lcDays) : null, Array.isArray(r.dayPcs) && r.dayPcs.length ? JSON.stringify(r.dayPcs.map(x => Number(x) || 0)).slice(0, 4000) : null]));
        await conn.query('UPDATE hl_scenarios SET plan_from = ?, plan_to = ?, thresholds = ?, balance = ?, source_note = ?, source_at = ?, updated_by = ?, version = version + 1 WHERE id = ?',
            [sc.from || null, sc.to || null, JSON.stringify(sc.thresholds || null), sc.balance ? JSON.stringify(sc.balance) : null, sc.source?.note || null, sc.source?.at ? String(sc.source.at).slice(0, 19) : null, by, id]);
    }

    app.post(`${HL}/scenarios`, async (req, res) => {
        try {
            const u = await needWrite(req, res);
            if (!u) return;
            const name = String(req.body?.name || '').trim().slice(0, 120) || 'Scenario';
            const id = uid('sc');
            const conn = await pool.getConnection();
            try {
                await conn.beginTransaction();
                await conn.query('INSERT INTO hl_scenarios (id, name, created_by, updated_by, version) VALUES (?,?,?,?,0)', [id, name, u.username, u.username]);
                // duplicate: copy another scenario's rows; blank: the client's default bundle
                const src = req.body?.fromId ? await readBundle(String(req.body.fromId)) : (req.body?.bundle || null);
                if (src) {
                    // fresh ids for lines / orders / reservations so the copy is independent
                    const lineMap = new Map(), orderMap = new Map();
                    const lines = (src.lines || []).map(l => { const nid = uid('ln'); lineMap.set(l.id, nid); return { ...l, id : nid }; });
                    const orders = (src.orders || []).map(o => { const nid = uid('or'); orderMap.set(o.id, nid); return { ...o, id : nid }; });
                    const reservations = (src.reservations || []).filter(r => lineMap.has(r.lineId)).map(r => ({ ...r, id : uid('rs'), lineId : lineMap.get(r.lineId), orderId : orderMap.get(r.orderId) || null }));
                    await writeBundle(conn, id, { ...src, lines, orders, reservations }, u.username);
                }
                await conn.commit();
                conn.release();
            }
            catch (e) { try { await conn.rollback(); } catch { /* gone */ } conn.release(); throw e; }
            console.log(`[hl] scenario "${name}" (${id}) created by ${u.username}${req.body?.fromId ? ` from ${req.body.fromId}` : ''}`);
            res.json({ success : true, id });
        }
        catch (e) { dbFail(res, e); }
    });

    app.get(`${HL}/scenarios/:id`, async (req, res) => {
        try {
            if (!(await needRead(req, res))) return;
            const b = await readBundle(String(req.params.id));
            if (!b) return res.status(404).json({ success : false, error : 'Scenario not found' });
            res.json({ success : true, scenario : b });
        }
        catch (e) { dbFail(res, e); }
    });

    // whole-scenario save with optimistic concurrency: the client sends the
    // version it loaded; a newer version on the server means someone else
    // saved meanwhile → 409, nothing written
    app.put(`${HL}/scenarios/:id`, async (req, res) => {
        try {
            const u = await needWrite(req, res);
            if (!u) return;
            const id = String(req.params.id);
            const sc = req.body?.scenario;
            if (!sc) return res.status(400).json({ success : false, error : 'No scenario data' });
            const [[cur]] = await pool.query('SELECT version, name FROM hl_scenarios WHERE id = ? AND deleted_at IS NULL', [id]);
            if (!cur) return res.status(404).json({ success : false, error : 'Scenario not found' });
            if (Number(sc.version) !== Number(cur.version)) {
                return res.status(409).json({ success : false, conflict : true, version : cur.version, error : `Scenario was saved by someone else meanwhile (version ${cur.version}) — reload it before saving` });
            }
            const conn = await pool.getConnection();
            try {
                await conn.beginTransaction();
                if (sc.name && sc.name !== cur.name) await conn.query('UPDATE hl_scenarios SET name = ? WHERE id = ?', [String(sc.name).slice(0, 120), id]);
                await writeBundle(conn, id, sc, u.username);
                await conn.commit();
                conn.release();
            }
            catch (e) { try { await conn.rollback(); } catch { /* gone */ } conn.release(); throw e; }
            res.json({ success : true, version : Number(cur.version) + 1 });
        }
        catch (e) { dbFail(res, e); }
    });

    app.put(`${HL}/scenarios/:id/rename`, async (req, res) => {
        try {
            const u = await needWrite(req, res);
            if (!u) return;
            const name = String(req.body?.name || '').trim().slice(0, 120);
            if (!name) return res.status(400).json({ success : false, error : 'Name missing' });
            await pool.query('UPDATE hl_scenarios SET name = ?, updated_by = ? WHERE id = ? AND deleted_at IS NULL', [name, u.username, String(req.params.id)]);
            res.json({ success : true });
        }
        catch (e) { dbFail(res, e); }
    });

    // soft delete — simulation data only
    app.delete(`${HL}/scenarios/:id`, async (req, res) => {
        try {
            const u = await needWrite(req, res);
            if (!u) return;
            await pool.query('UPDATE hl_scenarios SET deleted_at = NOW(), updated_by = ? WHERE id = ?', [u.username, String(req.params.id)]);
            console.log(`[hl] scenario ${req.params.id} deleted by ${u.username}`);
            res.json({ success : true });
        }
        catch (e) { dbFail(res, e); }
    });

    // ---- ERP order load (READ ONLY): active orders delivered from the
    // plan cut-off on, by production unit and product type — the demand the
    // units face, shown on the unit cards next to the simulated capacity
    app.get(`${HL}/erp-load`, async (req, res) => {
        try {
            if (!(await needRead(req, res))) return;
            const from = /^\d{4}-\d{2}-\d{2}$/.test(String(req.query.from || '')) ? String(req.query.from) : ERP_CUTOFF;
            const [rows] = await pool.query(
                `SELECT oe.prod_unit AS unit_id,
                        COALESCE(pt.prd_type_name, NULLIF(s.stl_type, ''), 'Other') AS product,
                        COUNT(*) AS orders, SUM(oe.order_qty) AS qty
                   FROM \`${ERP_DB}\`.mr_order_entry oe
                   JOIN \`${ERP_DB}\`.mr_style s ON s.stl_id = oe.mr_style_stl_id
                   LEFT JOIN \`${ERP_DB}\`.mr_product_type pt ON pt.prd_type_id = s.prd_type_id
                  WHERE oe.order_status = 'Active' AND oe.order_delivery_date >= ?
                  GROUP BY oe.prod_unit, product
                  ORDER BY oe.prod_unit, qty DESC`, [from]);
            res.json({ success : true, from, takenAt : fmtDt(new Date()),
                rows : rows.map(r => ({ unitId : r.unit_id == null ? null : Number(r.unit_id), product : r.product, orders : Number(r.orders), qty : Number(r.qty) || 0 })) });
        }
        catch (e) { dbFail(res, e); }
    });

    // ---- ERP SMV by production unit and product type (READ ONLY) ---------
    // Active production orders from the plan cut-off on: order count, order
    // quantity and the quantity-weighted average SMV of the styles
    // (mr_style.stl_smv, production_smv fallback) — the unit-wise "order
    // average SMV" the Lines tab shows, with the product-wise detail
    const ERP_ACTIVE = `oe.order_status = 'Active' AND oe.order_qty > 0 AND COALESCE(oe.order_type, 1) NOT IN (2,5,6,7)`;
    app.get(`${HL}/erp-smv`, async (req, res) => {
        try {
            if (!(await needRead(req, res))) return;
            const [rows] = await pool.query(
                `SELECT COALESCE(oe.prod_unit, -1) AS unit_id,
                        COALESCE(pt.prd_type_name, NULLIF(s.stl_type, ''), 'Other') AS product,
                        COUNT(*) AS orders, SUM(oe.order_qty) AS qty,
                        SUM(oe.order_qty * COALESCE(NULLIF(s.stl_smv, 0), NULLIF(s.production_smv, 0), 0)) AS smv_qty,
                        SUM(CASE WHEN COALESCE(NULLIF(s.stl_smv, 0), NULLIF(s.production_smv, 0), 0) > 0 THEN oe.order_qty ELSE 0 END) AS qty_with_smv
                   FROM \`${ERP_DB}\`.mr_order_entry oe
                   JOIN \`${ERP_DB}\`.mr_style s ON s.stl_id = oe.mr_style_stl_id
                   LEFT JOIN \`${ERP_DB}\`.mr_product_type pt ON pt.prd_type_id = s.prd_type_id
                  WHERE ${ERP_ACTIVE} AND oe.order_delivery_date >= ?
                  GROUP BY unit_id, product ORDER BY unit_id, qty DESC`, [ERP_CUTOFF]);
            res.json({ success : true, from : ERP_CUTOFF, takenAt : fmtDt(new Date()),
                rows : rows.map(r => ({ unitId : Number(r.unit_id), product : r.product, orders : Number(r.orders), qty : Number(r.qty) || 0,
                    avgSmv : Number(r.qty_with_smv) > 0 ? Math.round(Number(r.smv_qty) / Number(r.qty_with_smv) * 100) / 100 : null,
                    qtyWithSmv : Number(r.qty_with_smv) || 0 })) });
        }
        catch (e) { dbFail(res, e); }
    });
    // the orders behind one unit × product type, each with its own SMV
    app.get(`${HL}/erp-smv-orders`, async (req, res) => {
        try {
            if (!(await needRead(req, res))) return;
            const unitId = Number(req.query.unit);
            const product = String(req.query.product || '');
            if (!Number.isFinite(unitId)) return res.status(400).json({ success : false, error : 'unit missing' });
            const [rows] = await pool.query(
                `SELECT oe.order_code, b.b_name AS buyer, s.stl_no AS style, gt.gmt_name AS garment,
                        oe.order_qty AS qty, oe.order_delivery_date AS delivery, CASE WHEN oe.pcd >= '2020-01-01' THEN oe.pcd END AS pcd,
                        COALESCE(NULLIF(s.stl_smv, 0), NULLIF(s.production_smv, 0), 0) AS smv
                   FROM \`${ERP_DB}\`.mr_order_entry oe
                   JOIN \`${ERP_DB}\`.mr_style s ON s.stl_id = oe.mr_style_stl_id
                   LEFT JOIN \`${ERP_DB}\`.mr_buyer b ON b.b_id = oe.mr_buyer_b_id
                   LEFT JOIN \`${ERP_DB}\`.mr_product_type pt ON pt.prd_type_id = s.prd_type_id
                   LEFT JOIN \`${ERP_DB}\`.mr_garment_type gt ON gt.gmt_id = s.gmt_id
                  WHERE ${ERP_ACTIVE} AND oe.order_delivery_date >= ? AND COALESCE(oe.prod_unit, -1) = ?
                    AND COALESCE(pt.prd_type_name, NULLIF(s.stl_type, ''), 'Other') = ?
                  ORDER BY oe.order_delivery_date, oe.order_code LIMIT 1000`, [ERP_CUTOFF, unitId, product]);
            res.json({ success : true, rows : rows.map(r => ({ order : r.order_code, buyer : r.buyer || '', style : r.style || '', garment : r.garment || '',
                qty : Number(r.qty) || 0, delivery : ymd(r.delivery), pcd : ymd(r.pcd), smv : Number(r.smv) || 0 })) });
        }
        catch (e) { dbFail(res, e); }
    });

    // ---- ERP monthly active orders by delivery date (READ ONLY) -----------
    // Every Active order grouped by the delivery month of its POs
    // (mr_purchase_order.po_ex_fty, falling back to the order's
    // order_delivery_date) — an order whose POs deliver in different months
    // is allocated to each month by PO quantity. Only deliveries from the
    // plan cut-off (ERP_CUTOFF — "after 08/10/26") are counted, same window
    // as the boards; the stale pre-cut-off ERP tail stays out.
    // Outstanding = PO qty − exported qty (mr_purchase_order.export_qty).
    // Same "production order" filter as the ERP sync (server/index.mjs):
    // order_status Active, order_qty > 0, order_type not sample / SMS /
    // sample courier / 2nd quality; POs not cancelled with po_qty > 0.
    const ERP_PO_OK  = `po.po_qty > 0 AND (po.status IS NULL OR po.status != 3) AND (po.po_status IS NULL OR po.po_status != 3)`;
    // PO rows carry the real per-PO delivery month; active orders without a
    // single valid PO still count once at order level (order date / qty).
    // unit_id / product are COALESCEd in here so a NULL in the grouped result
    // can only be a ROLLUP total row (MariaDB has no GROUPING() function).
    const ERP_MONTH_ROWS = `
        SELECT oe.order_id, COALESCE(oe.prod_unit, -1) AS unit_id,
               DATE_FORMAT(COALESCE(po.po_ex_fty, oe.order_delivery_date), '%Y-%m') AS ym,
               COALESCE(pt.prd_type_name, NULLIF(s.stl_type, ''), 'Other') AS product,
               po.po_qty AS qty,
               GREATEST(po.po_qty - COALESCE(po.export_qty, 0), 0) AS outstanding
          FROM \`${ERP_DB}\`.mr_purchase_order po
          JOIN \`${ERP_DB}\`.mr_order_entry oe ON oe.order_id = po.mr_order_entry_order_id
          JOIN \`${ERP_DB}\`.mr_style s ON s.stl_id = oe.mr_style_stl_id
          LEFT JOIN \`${ERP_DB}\`.mr_product_type pt ON pt.prd_type_id = s.prd_type_id
         WHERE ${ERP_ACTIVE} AND ${ERP_PO_OK}
           AND COALESCE(po.po_ex_fty, oe.order_delivery_date) >= ?
        UNION ALL
        SELECT oe.order_id, COALESCE(oe.prod_unit, -1),
               DATE_FORMAT(oe.order_delivery_date, '%Y-%m'),
               COALESCE(pt.prd_type_name, NULLIF(s.stl_type, ''), 'Other'),
               oe.order_qty, oe.order_qty
          FROM \`${ERP_DB}\`.mr_order_entry oe
          JOIN \`${ERP_DB}\`.mr_style s ON s.stl_id = oe.mr_style_stl_id
          LEFT JOIN \`${ERP_DB}\`.mr_product_type pt ON pt.prd_type_id = s.prd_type_id
         WHERE ${ERP_ACTIVE} AND oe.order_delivery_date >= ?
           AND NOT EXISTS (SELECT 1 FROM \`${ERP_DB}\`.mr_purchase_order po
                            WHERE po.mr_order_entry_order_id = oe.order_id AND ${ERP_PO_OK})`;

    // ---- ERP SMV by production unit and product type (READ ONLY) ---------
    // Active production orders from the plan cut-off on: order count, order
    // quantity and the quantity-weighted average SMV of the styles
    // (mr_style.stl_smv, production_smv fallback) — the "average SMV" the
    // configuration turns a unit's capacity into pieces with
    app.get(`${HL}/erp-smv`, async (req, res) => {
        try {
            if (!(await needRead(req, res))) return;
            const [rows] = await pool.query(
                `SELECT COALESCE(oe.prod_unit, -1) AS unit_id,
                        COALESCE(pt.prd_type_name, NULLIF(s.stl_type, ''), 'Other') AS product,
                        COUNT(*) AS orders, SUM(oe.order_qty) AS qty,
                        SUM(oe.order_qty * COALESCE(NULLIF(s.stl_smv, 0), NULLIF(s.production_smv, 0), 0)) AS smv_qty,
                        SUM(CASE WHEN COALESCE(NULLIF(s.stl_smv, 0), NULLIF(s.production_smv, 0), 0) > 0 THEN oe.order_qty ELSE 0 END) AS qty_with_smv
                   FROM \`${ERP_DB}\`.mr_order_entry oe
                   JOIN \`${ERP_DB}\`.mr_style s ON s.stl_id = oe.mr_style_stl_id
                   LEFT JOIN \`${ERP_DB}\`.mr_product_type pt ON pt.prd_type_id = s.prd_type_id
                  WHERE ${ERP_ACTIVE} AND oe.order_delivery_date >= ?
                  GROUP BY unit_id, product ORDER BY unit_id, qty DESC`, [ERP_CUTOFF]);
            res.json({ success : true, from : ERP_CUTOFF, takenAt : fmtDt(new Date()),
                rows : rows.map(r => ({ unitId : Number(r.unit_id), product : r.product, orders : Number(r.orders), qty : Number(r.qty) || 0,
                    avgSmv : Number(r.qty_with_smv) > 0 ? Math.round(Number(r.smv_qty) / Number(r.qty_with_smv) * 100) / 100 : null,
                    qtyWithSmv : Number(r.qty_with_smv) || 0 })) });
        }
        catch (e) { dbFail(res, e); }
    });
    // the orders behind one unit × product cell, each with its own SMV
    app.get(`${HL}/erp-smv-orders`, async (req, res) => {
        try {
            if (!(await needRead(req, res))) return;
            const unitId = Number(req.query.unit);
            const product = String(req.query.product || '');
            if (!Number.isFinite(unitId)) return res.status(400).json({ success : false, error : 'unit missing' });
            const [rows] = await pool.query(
                `SELECT oe.order_code, b.b_name AS buyer, s.stl_no AS style, gt.gmt_name AS garment,
                        oe.order_qty AS qty, oe.order_delivery_date AS delivery, CASE WHEN oe.pcd >= '2020-01-01' THEN oe.pcd END AS pcd,
                        COALESCE(NULLIF(s.stl_smv, 0), NULLIF(s.production_smv, 0), 0) AS smv
                   FROM \`${ERP_DB}\`.mr_order_entry oe
                   JOIN \`${ERP_DB}\`.mr_style s ON s.stl_id = oe.mr_style_stl_id
                   LEFT JOIN \`${ERP_DB}\`.mr_buyer b ON b.b_id = oe.mr_buyer_b_id
                   LEFT JOIN \`${ERP_DB}\`.mr_product_type pt ON pt.prd_type_id = s.prd_type_id
                   LEFT JOIN \`${ERP_DB}\`.mr_garment_type gt ON gt.gmt_id = s.gmt_id
                  WHERE ${ERP_ACTIVE} AND oe.order_delivery_date >= ? AND COALESCE(oe.prod_unit, -1) = ?
                    AND COALESCE(pt.prd_type_name, NULLIF(s.stl_type, ''), 'Other') = ?
                  ORDER BY oe.order_delivery_date, oe.order_code LIMIT 1000`, [ERP_CUTOFF, unitId, product]);
            res.json({ success : true, rows : rows.map(r => ({ order : r.order_code, buyer : r.buyer || '', style : r.style || '', garment : r.garment || '',
                qty : Number(r.qty) || 0, delivery : ymd(r.delivery), pcd : ymd(r.pcd), smv : Number(r.smv) || 0 })) });
        }
        catch (e) { dbFail(res, e); }
    });

    app.get(`${HL}/erp-monthly`, async (req, res) => {
        try {
            if (!(await needRead(req, res))) return;
            const [rows] = await pool.query(
                `SELECT unit_id, ym, product, COUNT(DISTINCT order_id) AS orders, SUM(qty) AS qty, SUM(outstanding) AS outstanding
                   FROM (${ERP_MONTH_ROWS}) t
                  GROUP BY unit_id, ym, product WITH ROLLUP`, [ERP_CUTOFF, ERP_CUTOFF]);
            const months = [], products = [], unitTotals = {};
            let grand = { orders : 0, qty : 0, outstanding : 0 };
            for (const r of rows) {
                const v = { orders : Number(r.orders), qty : Number(r.qty) || 0, outstanding : Number(r.outstanding) || 0 };
                if (r.unit_id == null) { grand = v; continue; }                      // ROLLUP grand total
                const unitId = Number(r.unit_id);
                if (r.ym == null) { unitTotals[unitId] = v; continue; }              // ROLLUP per-unit total (distinct orders)
                if (r.product == null) { months.push({ unitId, ym : r.ym, ...v }); continue; }   // ROLLUP month total
                products.push({ unitId, ym : r.ym, product : r.product, ...v });     // product of the month
            }
            months.sort((a, b) => a.unitId - b.unitId || a.ym.localeCompare(b.ym));
            res.json({ success : true, takenAt : fmtDt(new Date()), from : ERP_CUTOFF, months, products, unitTotals, grand });
        }
        catch (e) { dbFail(res, e); }
    });

    // detailed active orders of one production unit and delivery month —
    // one row per ERP order (its POs of that month summed, so a PO number
    // or colour repeating never double-counts)
    app.get(`${HL}/erp-month-orders`, async (req, res) => {
        try {
            if (!(await needRead(req, res))) return;
            const unitId = Number(req.query.unit);
            const month  = String(req.query.month || '');
            if (!Number.isFinite(unitId)) return res.status(400).json({ success : false, error : 'unit missing' });
            if (!/^\d{4}-\d{2}$/.test(month)) return res.status(400).json({ success : false, error : 'month must be YYYY-MM' });
            const poDate = `COALESCE(po.po_ex_fty, oe.order_delivery_date)`;
            const match  = d => `${d} >= ? AND DATE_FORMAT(${d}, '%Y-%m') = ?`;   // plan cut-off window, like the summary
            const args   = [unitId, ERP_CUTOFF, month, unitId, ERP_CUTOFF, month];
            const [rows] = await pool.query(
                `SELECT order_code, MIN(buyer) AS buyer, MIN(style) AS style, MIN(product) AS product, MIN(garment) AS garment,
                        COUNT(DISTINCT po_no) AS pos, SUBSTRING(GROUP_CONCAT(DISTINCT po_no ORDER BY po_no SEPARATOR ', '), 1, 400) AS po_list,
                        SUM(qty) AS qty, SUM(outstanding) AS outstanding,
                        MIN(pcd) AS pcd, MIN(ddate) AS delivery, MAX(ddate) AS delivery_max
                   FROM (
                        SELECT oe.order_id, oe.order_code, b.b_name AS buyer, s.stl_no AS style,
                               pt.prd_type_name AS product, gt.gmt_name AS garment,
                               po.po_no, po.po_qty AS qty,
                               GREATEST(po.po_qty - COALESCE(po.export_qty, 0), 0) AS outstanding,
                               CASE WHEN oe.pcd >= '2020-01-01' THEN oe.pcd END AS pcd, ${poDate} AS ddate
                          FROM \`${ERP_DB}\`.mr_purchase_order po
                          JOIN \`${ERP_DB}\`.mr_order_entry oe ON oe.order_id = po.mr_order_entry_order_id
                          JOIN \`${ERP_DB}\`.mr_buyer b  ON b.b_id   = oe.mr_buyer_b_id
                          JOIN \`${ERP_DB}\`.mr_style s  ON s.stl_id = oe.mr_style_stl_id
                          LEFT JOIN \`${ERP_DB}\`.mr_product_type pt ON pt.prd_type_id = s.prd_type_id
                          LEFT JOIN \`${ERP_DB}\`.mr_garment_type gt ON gt.gmt_id = s.gmt_id
                         WHERE ${ERP_ACTIVE} AND ${ERP_PO_OK} AND oe.prod_unit = ? AND ${match(poDate)}
                        UNION ALL
                        SELECT oe.order_id, oe.order_code, b.b_name, s.stl_no, pt.prd_type_name, gt.gmt_name,
                               NULL, oe.order_qty, oe.order_qty,
                               CASE WHEN oe.pcd >= '2020-01-01' THEN oe.pcd END, oe.order_delivery_date
                          FROM \`${ERP_DB}\`.mr_order_entry oe
                          JOIN \`${ERP_DB}\`.mr_buyer b  ON b.b_id   = oe.mr_buyer_b_id
                          JOIN \`${ERP_DB}\`.mr_style s  ON s.stl_id = oe.mr_style_stl_id
                          LEFT JOIN \`${ERP_DB}\`.mr_product_type pt ON pt.prd_type_id = s.prd_type_id
                          LEFT JOIN \`${ERP_DB}\`.mr_garment_type gt ON gt.gmt_id = s.gmt_id
                         WHERE ${ERP_ACTIVE} AND oe.prod_unit = ? AND ${match('oe.order_delivery_date')}
                           AND NOT EXISTS (SELECT 1 FROM \`${ERP_DB}\`.mr_purchase_order po
                                            WHERE po.mr_order_entry_order_id = oe.order_id AND ${ERP_PO_OK})
                   ) t
                  GROUP BY order_id, order_code
                  ORDER BY delivery, order_code
                  LIMIT 2000`, args);
            res.json({ success : true, takenAt : fmtDt(new Date()), unitId, month,
                rows : rows.map(r => ({
                    order : r.order_code, buyer : r.buyer || '', style : r.style || '',
                    product : r.product || '', garment : r.garment || '',
                    pos : Number(r.pos) || 0, poList : r.po_list || '',
                    qty : Number(r.qty) || 0, outstanding : Number(r.outstanding) || 0,
                    pcd : ymd(r.pcd), delivery : ymd(r.delivery), deliveryMax : ymd(r.delivery_max)
                })) });
        }
        catch (e) { dbFail(res, e); }
    });

    // ---- ERP active orders for the High Level board (READ ONLY) -----------
    // The planning unit of the board is the GROUP buyer + production unit +
    // style + colour + PCD + delivery date: every valid PO (mr_purchase_order,
    // colour = its clr_id, delivery = its ex-factory date, the order delivery
    // date when none) of an active order from the plan cut-off on is summed
    // into that group — one scenario order, one bar. An order with no valid
    // PO is its own group (no colour, the order delivery date). Each group
    // carries its ERP order codes and PO numbers, the style product / garment
    // / SMV, the outstanding quantity (PO qty − exported) and the repeat flag
    // (the style was ordered before with an earlier delivery).
    const GROUP_FIELDS = `b.b_name AS buyer, s.stl_no AS style,
                    COALESCE(pt.prd_type_name, NULLIF(s.stl_type, ''), 'Other') AS product, gt.gmt_name AS garment,
                    CASE WHEN oe.pcd >= '2020-01-01' THEN oe.pcd END AS pcd,
                    COALESCE(NULLIF(s.stl_smv, 0), NULLIF(s.production_smv, 0), 0) AS smv,
                    COALESCE(oe.prod_unit, -1) AS unit_id, oe.high_priority AS hp, oe.mr_season_se_id AS season, oe.order_code,
                    /* repeat order: the same style was ordered before (earlier delivery) — PCD + 3 and no learning curve */
                    (SELECT COUNT(*) FROM \`${ERP_DB}\`.mr_order_entry x WHERE x.mr_style_stl_id = oe.mr_style_stl_id AND x.order_id <> oe.order_id AND x.order_delivery_date < oe.order_delivery_date) AS prev_orders,
                    (SELECT x.order_code FROM \`${ERP_DB}\`.mr_order_entry x WHERE x.mr_style_stl_id = oe.mr_style_stl_id AND x.order_id <> oe.order_id AND x.order_delivery_date < oe.order_delivery_date ORDER BY x.order_delivery_date DESC LIMIT 1) AS prev_code`;
    const GROUP_JOINS = `JOIN \`${ERP_DB}\`.mr_style s ON s.stl_id = oe.mr_style_stl_id
               LEFT JOIN \`${ERP_DB}\`.mr_buyer b ON b.b_id = oe.mr_buyer_b_id
               LEFT JOIN \`${ERP_DB}\`.mr_product_type pt ON pt.prd_type_id = s.prd_type_id
               LEFT JOIN \`${ERP_DB}\`.mr_garment_type gt ON gt.gmt_id = s.gmt_id`;
    async function erpOrders() {
        const [poRows] = await pool.query(
            `SELECT buyer, style, color, product, garment, pcd, delivery, smv, unit_id,
                    MAX(hp = 'Y') AS priority, MIN(season) AS season,
                    SUM(qty) AS qty, SUM(outstanding) AS outstanding, COUNT(*) AS pos,
                    GROUP_CONCAT(DISTINCT order_code ORDER BY order_code SEPARATOR ', ') AS codes,
                    SUBSTRING(GROUP_CONCAT(DISTINCT po_no ORDER BY po_no SEPARATOR ', '), 1, 400) AS po_list,
                    MAX(prev_orders > 0) AS repeat_, MAX(prev_code) AS prev_code
               FROM (
                    SELECT ${GROUP_FIELDS}, COALESCE(mc.clr_name, '') AS color,
                           COALESCE(po.po_ex_fty, oe.order_delivery_date) AS delivery, po.po_no, po.po_qty AS qty,
                           GREATEST(po.po_qty - COALESCE(po.export_qty, 0), 0) AS outstanding
                      FROM \`${ERP_DB}\`.mr_purchase_order po
                      JOIN \`${ERP_DB}\`.mr_order_entry oe ON oe.order_id = po.mr_order_entry_order_id
                      ${GROUP_JOINS}
                      LEFT JOIN \`${ERP_DB}\`.mr_material_color mc ON mc.clr_id = po.clr_id
                     WHERE ${ERP_ACTIVE} AND ${ERP_PO_OK} AND COALESCE(po.po_ex_fty, oe.order_delivery_date) >= ?
               ) t
              GROUP BY buyer, unit_id, style, color, pcd, delivery
              ORDER BY delivery, style LIMIT 8000`, [ERP_CUTOFF]);
        // orders without a valid PO: one group each (no colour, order delivery date)
        const [oeRows] = await pool.query(
            `SELECT ${GROUP_FIELDS}, '' AS color, oe.order_delivery_date AS delivery, oe.order_qty AS qty, oe.order_qty AS outstanding
               FROM \`${ERP_DB}\`.mr_order_entry oe
               ${GROUP_JOINS}
              WHERE ${ERP_ACTIVE} AND oe.order_delivery_date >= ?
                AND NOT EXISTS (SELECT 1 FROM \`${ERP_DB}\`.mr_purchase_order po WHERE po.mr_order_entry_order_id = oe.order_id AND ${ERP_PO_OK})
              ORDER BY oe.order_delivery_date, oe.order_code LIMIT 5000`, [ERP_CUTOFF]);
        const keyOf = r => [Number(r.unit_id), r.buyer || '', r.style || '', r.color || '', ymd(r.pcd) || '', ymd(r.delivery) || ''].join('|');
        const out = new Map();
        const add = (r, codes, pos, po) => {
            const key = keyOf(r);
            const ex = out.get(key);
            if (ex) {   // a no-PO order falling into an existing group
                ex.qty += Number(r.qty) || 0; ex.outstanding += Number(r.outstanding) || 0; ex.pos += pos;
                ex.codes = [...new Set([...ex.codes.split(', '), ...codes.split(', ')].filter(Boolean))].sort().join(', ');
                ex.code = ex.codes; ex.repeat = ex.repeat || Number(r.repeat_ ?? r.prev_orders) > 0; ex.priority = ex.priority || r.priority === 'Y' || Number(r.priority) > 0;
                return;
            }
            out.set(key, {
                key, code : codes, codes, pos, buyer : r.buyer || '', style : r.style || '', color : r.color || '', product : r.product || 'Other', garment : r.garment || '',
                qty : Number(r.qty) || 0, outstanding : r.outstanding == null ? Number(r.qty) || 0 : Number(r.outstanding) || 0,
                smv : Number(r.smv) || 0, pcd : ymd(r.pcd), delivery : ymd(r.delivery), unitId : Number(r.unit_id),
                priority : r.priority === 'Y' || Number(r.priority) > 0, po : po || '',
                season : r.season == null ? null : Number(r.season), repeat : Number(r.repeat_ ?? r.prev_orders) > 0, repeatOf : r.prev_code || null
            });
        };
        for (const r of poRows) add(r, r.codes || '', Number(r.pos) || 0, r.po_list || '');
        for (const r of oeRows) add({ ...r, priority : r.hp }, r.order_code || '', 0, '');
        return [...out.values()];
    }
    app.get(`${HL}/erp-orders`, async (req, res) => {
        try {
            if (!(await needRead(req, res))) return;
            const rows = await erpOrders();
            res.json({ success : true, from : ERP_CUTOFF, takenAt : fmtDt(new Date()), rows });
        }
        catch (e) { dbFail(res, e); }
    });

    // ---- Central Auto Balance service ------------------------------------
    // Runs the allocation engine (src/hlBalance.js) on the scenario the client
    // sends — optionally merging the ERP active orders in first — and returns
    // the proposal: the orders, the lines (the GSL pool row may be added), the
    // proposed reservations, the ids of the previous proposals they replace,
    // the per-order results and a summary. NOTHING is written: the client
    // applies the proposal to its scenario and saves it with the usual
    // optimistic-version save.
    app.post(`${HL}/auto-balance`, async (req, res) => {
        try {
            if (!(await needWrite(req, res))) return;
            const sc = req.body?.scenario;
            const opts = req.body?.options || {};
            if (!sc || !Array.isArray(sc.lines) || !Array.isArray(sc.orders)) return res.status(400).json({ success : false, error : 'No scenario data' });
            let imported = null, takenAt = null;
            if (opts.importOrders !== false) { imported = mergeErpOrders(sc, await erpOrders()); takenAt = fmtDt(new Date()); }
            const t0 = Date.now();
            const out = autoBalance(sc, opts);
            console.log(`[hl] auto balance for ${sc.id || 'new'}: ${out.summary.orders} orders, ${out.reservations.length} proposals, ${Date.now() - t0} ms`);
            res.json({ success : true, imported, takenAt, orders : sc.orders, lines : sc.lines, products : sc.products, ...out, ms : Date.now() - t0 });
        }
        catch (e) { dbFail(res, e); }
    });

    // ---- reference snapshot from the live board (READ ONLY) ---------------
    // Units, sewing lines (manpower / efficiency / hours), product types,
    // orders in the plan window and the live load per line — returned as a
    // one-way snapshot the client merges into a scenario. Nothing is written.
    app.get(`${HL}/reference`, async (req, res) => {
        try {
            if (!(await needWrite(req, res))) return;
            const from = /^\d{4}-\d{2}-\d{2}$/.test(String(req.query.from || '')) ? String(req.query.from) : ymd(new Date());
            const to   = /^\d{4}-\d{2}-\d{2}$/.test(String(req.query.to || '')) ? String(req.query.to) : null;
            const [lines] = await pool.query(
                `SELECT id, resource_code, resource_name, unit_id, manpower, default_efficiency, working_hours_per_day, active
                   FROM planning_resources WHERE resource_type = 'sewing_line' ORDER BY unit_id, sort_order`);
            const [prods] = await pool.query(
                `SELECT product_category AS name, COUNT(*) AS n, AVG(NULLIF(smv, 0)) AS smv
                   FROM planning_orders WHERE product_category IS NOT NULL AND product_category <> ''
                    AND (shipment_date IS NULL OR shipment_date >= ?) GROUP BY product_category ORDER BY n DESC LIMIT 40`, [from]);
            const [orders] = await pool.query(
                `SELECT order_code, MIN(buyer_name) AS buyer, MIN(style_no) AS style, MIN(product_category) AS product,
                        SUM(order_quantity) AS qty, MIN(pcd) AS pcd, MIN(shipment_date) AS delivery,
                        MIN(COALESCE(prod_unit, unit_id)) AS unit_id, MIN(planning_status) AS status,
                        MAX(erp_po_id LIKE 'proj-%') AS is_proj
                   FROM planning_orders
                  WHERE order_code IS NOT NULL AND order_code <> '' AND order_quantity > 0
                    AND shipment_date >= ? ${to ? 'AND shipment_date <= ?' : ''}
                  GROUP BY order_code ORDER BY delivery, order_code LIMIT 1500`, to ? [from, to] : [from]);
            const [load] = await pool.query(
                `SELECT pe.id, pa.resource_id, pe.start_date, pe.end_date, pe.planned_quantity,
                        COALESCE(o.order_code, p.order_code) AS order_code, COALESCE(o.buyer_name, p.buyer_name) AS buyer,
                        COALESCE(o.style_no, p.style_no) AS style, COALESCE(o.product_category, p.product_category) AS product
                   FROM planning_events pe
                   JOIN planning_assignments pa ON pa.event_id = pe.id
                   JOIN planning_resources pr ON pr.id = pa.resource_id AND pr.resource_type = 'sewing_line'
                   LEFT JOIN planning_orders o ON o.id = pe.planning_order_id
                   LEFT JOIN planning_orders p ON pe.planning_order_id IS NULL AND pe.event_code LIKE 'ev-proj:%'
                        AND p.id = (SELECT x.id FROM planning_orders x WHERE x.order_code = REGEXP_REPLACE(SUBSTRING(pe.event_code, 9), '-[0-9]{1,2}$', '') ORDER BY (x.erp_po_id LIKE 'proj-%') DESC, x.id LIMIT 1)
                  WHERE pe.event_status <> 'cancelled' AND (pe.production_stage IS NULL OR pe.production_stage = 'sewing')
                    AND pe.end_date >= ? ${to ? 'AND pe.start_date <= ?' : ''}`, to ? [from, to] : [from]);
            let unitNames = {};
            try {
                const [hu] = await pool.query(`SELECT hr_unit_id, hr_unit_short_name FROM \`${ERP_DB}\`.hr_unit`);
                unitNames = Object.fromEntries(hu.map(r => [r.hr_unit_id, r.hr_unit_short_name]));
            }
            catch { /* ERP unreachable — codes only */ }
            res.json({
                success : true,
                takenAt : fmtDt(new Date()),
                from, to,
                unitNames,
                lines : lines.map(l => ({ liveId : l.id, code : l.resource_code, name : l.resource_name, unitId : l.unit_id, manpower : Number(l.manpower) || 0, eff : Number(l.default_efficiency) || 0, hours : Number(l.working_hours_per_day) || 0, active : !!l.active })),
                products : prods.map(p => ({ name : p.name, n : p.n, smv : p.smv ? Math.round(Number(p.smv) * 100) / 100 : null })),
                orders : orders.map(o => ({ code : o.order_code, buyer : o.buyer, style : o.style, product : o.product, qty : Number(o.qty), pcd : ymd(o.pcd), delivery : ymd(o.delivery), unitId : o.unit_id, status : o.status, projection : !!Number(o.is_proj) })),
                load : load.map(e => ({ liveEventId : e.id, lineLiveId : e.resource_id, start : ymd(e.start_date), end : ymd(e.end_date), qty : Number(e.planned_quantity) || 0, order : e.order_code, buyer : e.buyer, style : e.style, product : e.product }))
            });
        }
        catch (e) { dbFail(res, e); }
    });
}
