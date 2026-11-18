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
// A LOT = the rows of one ERP order in one colour sewn in one unit. The ERP
// books a lot's sewing output to whichever PO the bundle was cut under, not
// PO by PO: 26H1LEV475 colour 00AFB-0006 — PO 1000659550 (4,309 pcs) booked
// 4,515, PO 2500076718 (54) booked 26, 2500076881 (50) booked 32; 6,437 pcs
// sewn on 5,945 and still two POs looked short, the colour's bar stayed at
// 96 % and 224 pcs "remaining" (planner, 2026-11-18: "sewing complete, the
// strip is not deducted properly"). So every PO's own output fills its own
// rows first; what a PO has booked BEYOND its rows' quantity fills the lot's
// other rows, earliest delivery first. Output booked under another colour or
// another order is still an issue, never moved.
//
// A colour ALIAS: the ERP's colour master holds one colour under several ids
// (26H1LEV596 — PO 1000652836 is colour 23203 "0057W-0014", its 552 pcs of
// sewing output are booked under 23904 "0057W-0014LOOSEOVERALLS…"; the order
// has ONE PO, the whole order was sewn and its bar still stood on the board
// with nothing made — planner, 2026-11-18). po_id is the PO identity (one PO
// in one colour); the colour on a production record is a second label. When
// NO PO of the order carries that colour, the pieces cannot belong to another
// PO of the order — they are the PO's own output and count. (In-house PO
// rows only; an OS colour row keeps the exact colour match.)
//
// Ambiguous → the row is reported and kept out of new allocations:
//   * the PO is no longer in mr_purchase_order;
//   * output of the PO is booked under the colour of ANOTHER PO of the same
//     order, or under another order than the PO's own (it cannot be
//     attributed to a colour row with certainty).
// --------------------------------------------------------------------------

// sewing output filter, for a daily_productions alias
export const SEW_OUT_SQL = (a = 'd') => `${a}.mr_operation_type_id = 2 AND ${a}.status = 'out'`;

// one grouped read per PO identity — before any join to planning rows
export const sewingOutputSql = (erpDb, n) => `
    SELECT d.po_id, d.clr_id, d.prod_unit_id, d.order_id, SUM(d.prod_qty) AS qty,
           COUNT(DISTINCT d.prod_date) AS days, MIN(d.prod_date) AS first_date, MAX(d.prod_date) AS last_date
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
        byPo.get(k).push({ clr : Number(o.clr_id) || 0, unit : Number(o.prod_unit_id) || 0, order : Number(o.order_id) || 0, qty : Number(o.qty) || 0,
            days : Number(o.days) || 0, last : o.last_date ? String(o.last_date).slice(0, 10) : null });
    }
    // the colours the POs of each ERP order carry (colour alias rule)
    const orderClrs = new Map();
    for (const p of poMaster?.values?.() || []) {
        const o = Number(p.order_id) || 0, c = Number(p.clr_id) || 0;
        if (!o || !c) continue;
        if (!orderClrs.has(o)) orderClrs.set(o, new Set());
        orderClrs.get(o).add(c);
    }
    const groups = new Map();   // identity → { rows, sewn, issue, lot }
    const lots   = new Map();   // lot (order : colour : unit) → { groups, rows }
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
            // an alias: a colour id no PO of the order carries (in-house PO rows)
            const sibling = orderClrs.get(Number(po.order_id) || 0);
            const alias = o => key.kind === 'mr' && !!sibling && !sibling.has(o.clr);
            const okClr = o => !clr || !o.clr || o.clr === clr || alias(o);
            const okOrd = o => !po.order_id || !o.order || o.order === Number(po.order_id);
            const good = mine.filter(o => okClr(o) && okOrd(o));
            const bad  = mine.filter(o => !(okClr(o) && okOrd(o)));
            const badQty = bad.reduce((t, o) => t + o.qty, 0);
            g = {
                rows : [], sewn : good.reduce((t, o) => t + o.qty, 0),
                // working days the PO has sewn on (the learning curve of a
                // bar planned for the remaining quantity continues after them)
                days : good.reduce((t, o) => Math.max(t, o.days), 0),
                last : good.reduce((t, o) => (o.last && (!t || o.last > t) ? o.last : t), null),
                issue : badQty > 0
                    ? `${badQty} pcs of sewing output of this PO are booked under another ${bad.some(o => !okClr(o)) ? 'colour' : 'order'} — cannot be reconciled`
                    : null
            };
            groups.set(id, g);
        }
        const row = { id : r.id, qty, ship : String(r.shipment_date || '9999'), n : Number(r.id) || 0, g, take : 0 };
        g.rows.push(row);
        // the row's lot: its ERP order + colour, sewn in its production unit
        const lotKey = `${Number(po.order_id) || 0}:${clr}:${unit || Number(r.prod_unit ?? r.unit_id) || 0}`;
        let lot = lots.get(lotKey);
        if (!lot) { lot = { groups : new Set(), rows : [] }; lots.set(lotKey, lot); }
        lot.groups.add(g);
        lot.rows.push(row);
    }
    const byDelivery = (a, b) => a.ship.localeCompare(b.ship) || (a.n - b.n);
    for (const lot of lots.values()) {
        // 1. one deduction per identity: its own rows, earliest delivery first, each up to its own quantity
        let pool = 0, poolDays = 0, poolLast = null;
        for (const g of lot.groups) {
            g.rows.sort(byDelivery);
            let rest = Math.max(0, g.sewn);
            for (const r of g.rows) {
                r.take = Math.min(r.qty, rest);
                rest -= r.take;
            }
            // 2. booked beyond the PO's own rows: the lot's pool
            if (rest > 0) {
                pool += rest;
                poolDays = Math.max(poolDays, g.days);
                if (g.last && (!poolLast || g.last > poolLast)) poolLast = g.last;
            }
        }
        // 3. the pool fills the lot's short rows, earliest delivery first
        const spilled = new Set();
        if (pool > 0) {
            for (const r of [...lot.rows].sort(byDelivery)) {
                if (!(pool > 0)) break;
                const add = Math.min(r.qty - r.take, pool);
                if (add > 0) { r.take += add; pool -= add; spilled.add(r); }
            }
        }
        for (const r of lot.rows) {
            const g = r.g;
            const own = g.sewn > 0;
            out.set(r.id, { sewn : r.take, remaining : Math.max(0, r.qty - r.take), issue : g.issue,
                days : Math.max(own ? g.days : 0, spilled.has(r) ? poolDays : 0),
                last : [own ? g.last : null, spilled.has(r) ? poolLast : null].filter(Boolean).sort().pop() || null });
        }
    }
    return out;
}
