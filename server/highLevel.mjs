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

export function mountHighLevel(app, { pool, BASE, dbFail, ERP_DB }) {
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
    ensureTables().then(() => console.log('[hl] High Level Planning tables ready')).catch(e => console.error('[hl] tables:', e.message));

    const ymd = d => d instanceof Date
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        : (d ? String(d).slice(0, 10) : null);
    const fmtDt = d => d instanceof Date
        ? `${ymd(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
        : (d ? String(d).slice(0, 16) : null);
    const uid = (p = 'hl') => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    const who = req => String(req.query?.by || req.body?.by || '').trim();

    async function user(req) {
        const u = who(req);
        if (!u) return null;
        const [[row]] = await pool.query('SELECT username, role, display_name FROM planning_users WHERE username = ? AND active = 1', [u]);
        return row || null;
    }

    // ---- list / create / rename / delete ----------------------------------
    app.get(`${HL}/scenarios`, async (req, res) => {
        try {
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
        let thresholds = null;
        try { thresholds = JSON.parse(s.thresholds || 'null'); } catch { thresholds = null; }
        return {
            id : s.id, name : s.name, version : s.version, createdBy : s.created_by, updatedAt : fmtDt(s.updated_at), updatedBy : s.updated_by,
            from : ymd(s.plan_from), to : ymd(s.plan_to), thresholds : thresholds || { partial : 0.4, full : 0.9 },
            source : s.source_note ? { note : s.source_note, at : fmtDt(s.source_at) } : null,
            units : units.map(u => { let wd = [0, 1, 2, 3, 4, 6]; try { wd = JSON.parse(u.work_days); } catch { /* default */ }
                return { code : u.code, name : u.name, label : u.label, hours : Number(u.hours), ot : Number(u.ot), workDays : wd, note : u.note || '' }; }),
            lines : lines.map(l => ({ id : l.id, unitCode : l.unit_code, name : l.name, active : !!l.active, manpower : Number(l.manpower),
                hours : l.hours == null ? null : Number(l.hours), ot : l.ot == null ? null : Number(l.ot), eff : Number(l.eff), products : prodByLine.get(l.id) || {} })),
            products : products.map(p => ({ name : p.name, smv : Number(p.smv) })),
            holidays : holidays.map(h => ({ date : ymd(h.hol_date), unitCode : h.unit_code || null, label : h.label || '', kind : h.kind || 'holiday' })),
            orders : orders.map(o => ({ id : o.id, buyer : o.buyer || '', style : o.style || '', product : o.product || '', qty : Number(o.qty), pcd : ymd(o.pcd), delivery : ymd(o.delivery), unitCode : o.unit_code || '', note : o.note || '', source : o.source || null })),
            reservations : reservations.map(r => ({ id : r.id, orderId : r.order_id, lineId : r.line_id, product : r.product || null, start : ymd(r.start_date), end : ymd(r.end_date), qty : Number(r.qty), locked : !!r.locked, status : r.status, label : r.label || '', source : r.source || null }))
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
        await bulk('INSERT INTO hl_units (scenario_id, code, name, label, hours, ot, work_days, note)', Array(8).fill(0),
            (sc.units || []).map(u => [id, u.code, u.name, u.label || null, Number(u.hours) || 0, Number(u.ot) || 0, JSON.stringify(u.workDays || [0, 1, 2, 3, 4, 6]), u.note || null]));
        const lines = sc.lines || [];
        await bulk('INSERT INTO hl_lines (id, scenario_id, unit_code, name, active, manpower, hours, ot, eff, sort_order)', Array(10).fill(0),
            lines.map((l, i) => [l.id, id, l.unitCode, l.name, l.active ? 1 : 0, Number(l.manpower) || 0, l.hours == null || l.hours === '' ? null : Number(l.hours), l.ot == null || l.ot === '' ? null : Number(l.ot), Number(l.eff) || 0, i]));
        const lp = [];
        for (const l of lines) for (const [p, smv] of Object.entries(l.products || {})) if (smv != null && smv !== '' && Number(smv) > 0) lp.push([l.id, p, Number(smv)]);
        await bulk('INSERT INTO hl_line_products (line_id, product, smv)', Array(3).fill(0), lp);
        await bulk('INSERT IGNORE INTO hl_products (scenario_id, name, smv)', Array(3).fill(0), (sc.products || []).map(p => [id, p.name, Number(p.smv) || 20]));
        await bulk('INSERT INTO hl_holidays (scenario_id, unit_code, hol_date, label, kind)', Array(5).fill(0), (sc.holidays || []).map(h => [id, h.unitCode || null, h.date, h.label || null, h.kind || 'holiday']));
        await bulk('INSERT INTO hl_orders (id, scenario_id, buyer, style, product, qty, pcd, delivery, unit_code, note, source)', Array(11).fill(0),
            (sc.orders || []).map(o => [o.id, id, o.buyer || null, o.style || null, o.product || null, Number(o.qty) || 0, o.pcd || null, o.delivery || null, o.unitCode || null, o.note || null, o.source || null]));
        await bulk('INSERT INTO hl_reservations (id, scenario_id, order_id, line_id, product, start_date, end_date, qty, locked, status, label, source)', Array(12).fill(0),
            (sc.reservations || []).map(r => [r.id, id, r.orderId || null, r.lineId, r.product || null, r.start, r.end, Number(r.qty) || 0, r.locked ? 1 : 0, r.status || 'reserved', r.label || null, r.source || null]));
        await conn.query('UPDATE hl_scenarios SET plan_from = ?, plan_to = ?, thresholds = ?, source_note = ?, source_at = ?, updated_by = ?, version = version + 1 WHERE id = ?',
            [sc.from || null, sc.to || null, JSON.stringify(sc.thresholds || null), sc.source?.note || null, sc.source?.at ? String(sc.source.at).slice(0, 19) : null, by, id]);
    }

    app.post(`${HL}/scenarios`, async (req, res) => {
        try {
            const u = await user(req);
            if (!u) return res.status(403).json({ success : false, error : 'Sign in first' });
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
            const u = await user(req);
            if (!u) return res.status(403).json({ success : false, error : 'Sign in first' });
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
            const u = await user(req);
            if (!u) return res.status(403).json({ success : false, error : 'Sign in first' });
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
            const u = await user(req);
            if (!u) return res.status(403).json({ success : false, error : 'Sign in first' });
            await pool.query('UPDATE hl_scenarios SET deleted_at = NOW(), updated_by = ? WHERE id = ?', [u.username, String(req.params.id)]);
            console.log(`[hl] scenario ${req.params.id} deleted by ${u.username}`);
            res.json({ success : true });
        }
        catch (e) { dbFail(res, e); }
    });

    // ---- reference snapshot from the live board (READ ONLY) ---------------
    // Units, sewing lines (manpower / efficiency / hours), product types,
    // orders in the plan window and the live load per line — returned as a
    // one-way snapshot the client merges into a scenario. Nothing is written.
    app.get(`${HL}/reference`, async (req, res) => {
        try {
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
