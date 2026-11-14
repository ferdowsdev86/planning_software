// --------------------------------------------------------------------------
// Actual sewing output per planning row (Auto Plan spec 2026-11-14):
// "plan only the remaining sewing quantity".
//
//   source   cuttingedgedb.daily_productions, status = 'out',
//            mr_operation_type_id = 2 (sewing), SUM(prod_qty)
//   identity daily_productions.po_id = mr_purchase_order.po_id. A row of
//            mr_purchase_order is ONE PO in ONE colour (po_id carries clr_id),
//            so the PO identity is colour level already; the output is
//            aggregated per (po_id, clr_id, producing unit, order) BEFORE it
//            meets a planning row.
//
//   planning row              its output
//   ------------------------  --------------------------------------------
//   in-house PO               every unit's output of po_id in the PO's colour
//   (erp_po_id = po_id)
//   OS colour row             the output of the row's PO in its colour that
//   (os-c-<os_order_color.id>, was sewn in the row's OWN production unit
//    os-cs-<os>-<po>-<clr>)   (daily_productions.prod_unit_id) — the unit's
//                             share of a PO that several units sew
//   projection (proj-…)       none (no PO yet)
//
// Several planning rows can stand for the same identity (the same PO and
// colour in two OS orders of one unit): the output is deducted ONCE — it
// fills the rows in delivery order, each up to its own quantity (the rule the
// production sync uses for the bars of one PO) — never the whole output from
// every row.
//
// Ambiguous → the row is reported and kept out of new allocations:
//   * the PO is no longer in mr_purchase_order;
//   * output of the PO is booked under another colour or another order than
//     the PO's own (it cannot be attributed to a colour row with certainty).
// --------------------------------------------------------------------------

// sewing output filter, for a daily_productions alias
export const SEW_OUT_SQL = (a = 'd') => `${a}.mr_operation_type_id = 2 AND ${a}.status = 'out'`;

// one grouped read per PO identity — before any join to planning rows
export const sewingOutputSql = (erpDb, n) => `
    SELECT d.po_id, d.clr_id, d.prod_unit_id, d.order_id, SUM(d.prod_qty) AS qty
      FROM \`${erpDb}\`.daily_productions d
     WHERE ${SEW_OUT_SQL('d')} AND d.po_id IN (${Array(n).fill('?').join(',')})
     GROUP BY d.po_id, d.clr_id, d.prod_unit_id, d.order_id`;

// planning row → { kind, poId, ocId }   (ocId: os_order_color.id to resolve)
export function sewKeyOfRow(row) {
    const k = String(row?.erp_po_id ?? '');
    if (/^\d+$/.test(k)) return { kind : 'mr', poId : Number(k) };
    let m = /^os-c-(\d+)$/.exec(k);
    if (m) return { kind : 'os', ocId : Number(m[1]) };
    m = /^os-cs-(\d+)-(\d+)-(\d+)$/.exec(k);
    if (m) return { kind : 'os', poId : Number(m[2]), clrId : Number(m[3]) };
    return { kind : 'none' };
}

// rows     [{ id, erp_po_id, order_quantity, prod_unit, unit_id, shipment_date }]
// poMaster Map(po_id → { clr_id, order_id })
// osColor  Map(os_order_color.id → { po_id, clr_id })
// output   [{ po_id, clr_id, prod_unit_id, order_id, qty }]  (sewingOutputSql)
// → Map(row id → { sewn, remaining, issue })   sewn ≤ the row's quantity
export function reconcileSewingOutput(rows, poMaster, osColor, output) {
    const out = new Map();
    const byPo = new Map();
    for (const o of output || []) {
        const k = Number(o.po_id);
        if (!byPo.has(k)) byPo.set(k, []);
        byPo.get(k).push({ clr : Number(o.clr_id) || 0, unit : Number(o.prod_unit_id) || 0, order : Number(o.order_id) || 0, qty : Number(o.qty) || 0 });
    }
    const groups = new Map();   // identity → { rows, sewn, issue }
    for (const r of rows || []) {
        const qty = Math.max(0, Number(r.order_quantity) || 0);
        const key = sewKeyOfRow(r);
        if (key.kind === 'none') { out.set(r.id, { sewn : 0, remaining : qty, issue : null }); continue; }
        let poId = key.poId, clr = key.clrId || 0;
        if (key.ocId) {
            const oc = osColor.get(key.ocId);
            if (!oc) { out.set(r.id, { sewn : 0, remaining : qty, issue : 'OS colour row is no longer in os_order_color' }); continue; }
            poId = Number(oc.po_id); clr = Number(oc.clr_id) || 0;
        }
        const po = poMaster.get(poId);
        if (!po) { out.set(r.id, { sewn : 0, remaining : qty, issue : `PO id ${poId} is not in mr_purchase_order` }); continue; }
        const poClr = Number(po.clr_id) || 0;
        if (!clr) clr = poClr;
        const unit = key.kind === 'os' ? (Number(r.prod_unit ?? r.unit_id) || 0) : 0;
        const id = key.kind === 'os' ? `o:${poId}:${unit}:${clr}` : `m:${poId}`;
        let g = groups.get(id);
        if (!g) {
            const mine = (byPo.get(poId) || []).filter(o => !unit || o.unit === unit);
            const okClr = o => !clr || !o.clr || o.clr === clr;
            const okOrd = o => !po.order_id || !o.order || o.order === Number(po.order_id);
            const good = mine.filter(o => okClr(o) && okOrd(o));
            const bad  = mine.filter(o => !(okClr(o) && okOrd(o)));
            const badQty = bad.reduce((t, o) => t + o.qty, 0);
            g = {
                rows : [], sewn : good.reduce((t, o) => t + o.qty, 0),
                issue : badQty > 0
                    ? `${badQty} pcs of sewing output of this PO are booked under another ${bad.some(o => !okClr(o)) ? 'colour' : 'order'} — cannot be reconciled`
                    : null
            };
            groups.set(id, g);
        }
        g.rows.push({ id : r.id, qty, ship : String(r.shipment_date || '9999'), n : Number(r.id) || 0 });
    }
    for (const g of groups.values()) {
        // one deduction for the identity: earliest delivery first, each row up to its own quantity
        g.rows.sort((a, b) => a.ship.localeCompare(b.ship) || (a.n - b.n));
        let rest = Math.max(0, g.sewn);
        for (const r of g.rows) {
            const take = Math.min(r.qty, rest);
            rest -= take;
            out.set(r.id, { sewn : take, remaining : Math.max(0, r.qty - take), issue : g.issue });
        }
    }
    return out;
}
