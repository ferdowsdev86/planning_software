// --------------------------------------------------------------------------
// Daily sewing ACTUALS feed for the board (planner spec, 2026-11-18: daily
// progress + actual-based forecast). READ ONLY — nothing is written to
// day_production_update_plan (MBM / CEIL still report production by hand;
// AQL's ERP sync is a separate, opt-in process).
//
//   source   cuttingedgedb.daily_productions, status = 'out',
//            mr_operation_type_id = 2 (sewing out) — the same filter as
//            sewingOutput.mjs (PO-level totals of the Auto plan)
//   grain    one row per production date × PO × colour × ERP line, SUM(prod_qty)
//            (the ERP holds several entries per day for one PO / line; summing
//            at this grain is what prevents duplicate quantities)
//   line     hr_line.hr_line_name → board resource code (MBM 'M01' with the
//            paired lines 02→01 …, CEIL 'C08', AQL 'L01'); a non-numeric ERP
//            line name (CEIL 'S-27', 'P1', 'F/S2' …) cannot be mapped — the
//            row is served with lineCode null and the client shows it as
//            PO-level output ("line not attributed")
//   manpower pt_sewing_daily_line_targets (the ERP's line-day target row the
//            production entry points at): act_hour × act_worker × 60 =
//            actual manpower-minutes when both are recorded (often 0 — then
//            the client falls back to the output-based adjustment and says
//            so); hour × number_worker is the PLANNED manpower
// --------------------------------------------------------------------------

export const LINE_PREFIX = { MBM : 'M', CEIL : 'C', AQL : 'L' };
// MBM runs paired lines as one board row ("Line 01+02" = M01)
export const MBM_PAIR = { 2 : 1, 4 : 3, 7 : 6, 9 : 8, 12 : 11, 15 : 14, 17 : 16, 19 : 18 };

// ERP sewing lines are numbered: MBM / CEIL '1' … '45', AQL 'A01' … 'A09'. Any
// other name (CEIL 'Pilot Line', 'S-27', 'P1', MBM 'TC', 'ALL LINE') is not a
// board line — its output stays PO-level (never guessed onto a line).
export function boardLineCode(unitShort, lineName) {
    const u   = String(unitShort || '').toUpperCase();
    const pfx = LINE_PREFIX[u];
    const s   = String(lineName || '').trim();
    const num = u === 'AQL' ? /^A?0*(\d{1,2})$/i.exec(s) : /^0*(\d{1,2})$/.exec(s);
    if (!num || !pfx) return null;
    let k = Number(num[1]);
    if (u === 'MBM' && MBM_PAIR[k]) k = MBM_PAIR[k];
    return `${pfx}${String(k).padStart(2, '0')}`;
}

export const sewingActualsSql = erpDb => `
    SELECT DATE(d.prod_date) AS prod_date, d.po_id, d.clr_id, d.hr_line_id,
           hl.hr_line_name AS erp_line, u.hr_unit_short_name AS erp_unit,
           MAX(COALESCE(NULLIF(d.e_po_no, ''), po.po_no)) AS po_no,
           MAX(d.e_order_code) AS order_code, MAX(d.e_clr_name) AS color, MAX(d.e_stl_no) AS style,
           SUM(d.prod_qty) AS qty, SUM(COALESCE(d.defect_qty, 0)) AS defect, SUM(COALESCE(d.reject_qty, 0)) AS reject,
           COUNT(*) AS n, MAX(d.updated_at) AS last_update,
           MAX(t.act_hour) AS act_hour, MAX(t.act_worker) AS act_worker,
           MAX(t.hour) AS plan_hour, MAX(t.number_worker) AS plan_worker,
           MAX(t.line_Style_smv) AS line_smv, MAX(t.target_qty) AS line_target, MAX(t.remarks) AS remarks
      FROM \`${erpDb}\`.daily_productions d
      LEFT JOIN \`${erpDb}\`.hr_unit u ON u.hr_unit_id = d.prod_unit_id
      LEFT JOIN \`${erpDb}\`.hr_line hl ON hl.hr_line_id = d.hr_line_id
      LEFT JOIN \`${erpDb}\`.mr_purchase_order po ON po.po_id = d.po_id
      LEFT JOIN \`${erpDb}\`.pt_sewing_daily_line_targets t ON t.id = d.pt_daily_line_target_id
     WHERE d.mr_operation_type_id = 2 AND d.status = 'out'
       AND u.hr_unit_short_name = ?
       AND DATE(d.prod_date) BETWEEN ? AND ?
     GROUP BY DATE(d.prod_date), d.po_id, d.clr_id, d.hr_line_id, hl.hr_line_name, u.hr_unit_short_name
     ORDER BY prod_date, d.po_id, d.clr_id`;

// DB rows → the feed the client reads (dates as yyyy-mm-dd, numbers as numbers)
export function normalizeActualRows(rows, unitShort) {
    const ymd = v => {
        if (!v) return null;
        if (typeof v === 'string') return v.slice(0, 10);
        const x = new Date(v);
        return Number.isNaN(x.getTime()) ? null : `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
    };
    const n = v => (Number.isFinite(Number(v)) ? Number(v) : 0);
    return (rows || []).map(r => {
        const actHour = n(r.act_hour), actWorker = n(r.act_worker);
        const planHour = n(r.plan_hour), planWorker = n(r.plan_worker);
        return {
            date : ymd(r.prod_date), poId : r.po_id != null ? Number(r.po_id) : null, clrId : r.clr_id != null ? Number(r.clr_id) : null,
            poNo : r.po_no != null ? String(r.po_no).trim() : '', orderCode : r.order_code ? String(r.order_code).trim() : '',
            color : r.color || '', style : r.style || '',
            erpLine : r.erp_line || '', lineCode : boardLineCode(unitShort, r.erp_line),
            qty : n(r.qty), defect : n(r.defect), reject : n(r.reject), n : n(r.n),
            lastUpdate : r.last_update || null,
            // actual manpower-minutes only when the ERP recorded both figures
            manMin : actHour > 0 && actWorker > 0 ? Math.round(actHour * 60 * actWorker) : null,
            planManMin : planHour > 0 && planWorker > 0 ? Math.round(planHour * 60 * planWorker) : null,
            lineSmv : n(r.line_smv) > 0 ? n(r.line_smv) : null,
            lineTarget : n(r.line_target) || null,
            remarks : r.remarks ? String(r.remarks).slice(0, 200) : null
        };
    }).filter(r => r.date && r.qty > 0);
}
