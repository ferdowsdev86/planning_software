// --------------------------------------------------------------------------
// Planning order sources (planner spec 2026-11-14)
//
// A business order reaches the planning boards from ONE of two ERP sources:
//
//   A. mbm_os.os_orders       — sub-contract ("OS") orders of the three
//                               planning units: os_units 19 MBM, 48 CEIL,
//                               20 AQL (os_orders.os_unit_id → os_units.id).
//                               PO / colour / size quantities come from
//                               os_order_color_size.
//   B. cuttingedgedb.mr_order_entry — in-house orders: os_status = 0 only
//                               (1 / 2 = handed to the OS system) and a
//                               production unit of 1 MBM, 2 CEIL, 3 AQL
//                               (mr_order_entry.prod_unit → hr_unit.hr_unit_id).
//                               PO / colour rows come from mr_purchase_order.
//
// The same business order is linked across the sources by the explicit
// mapping os_orders.mr_order_id = mr_order_entry.order_id AND
// os_orders.mr_order_code = mr_order_entry.order_code (verified 1:1 on the
// live data). When an order is eligible in BOTH sources it is kept from one
// source only — its whole record set (projection, POs, colours, sizes) — and
// every record of it in the other source is dropped.
// --------------------------------------------------------------------------

// hr_unit ids of the planning boards (mr_order_entry.prod_unit)
export const MR_BOARD_UNITS = [1, 2, 3];

// Source B eligibility as SQL, for a mr_order_entry alias
export const mrSourceOkSql = (alias = 'oe') => {
    const a = alias ? `${alias}.` : '';
    return `COALESCE(${a}os_status, 0) = 0 AND ${a}prod_unit IN (${MR_BOARD_UNITS.join(',')})`;
};
// the same rule for a fetched row
export const mrSourceOkRow = o => Number(o?.os_status ?? 0) === 0
    && MR_BOARD_UNITS.includes(Number(o?.prod_unit));

// " AND <col> NOT IN (…)" for a list of numeric ids ('' when the list is empty)
export const sqlNotIn = (col, ids) => {
    const list = [...new Set((ids || []).map(Number).filter(Number.isFinite))];
    return list.length ? ` AND ${col} NOT IN (${list.join(',')})` : '';
};

// One source per business order. pairs: the orders ELIGIBLE IN BOTH sources,
//   [{ mrOrderId, mrOrderCode, osOrderId, osOrderCode, mrHasConfirm, osHasConfirm }]
// Precedence (no rule was documented before 2026-11-14):
//   1. the source that holds eligible Confirm data (PO / colour rows) beats a
//      Projection-only source;
//   2. otherwise (both or neither have Confirm data) os_orders wins — the
//      order was handed to the OS system, whose row carries the unit's own
//      share; this is the deterministic fallback.
// Returns the LOSING records of each source, to be excluded everywhere.
export function pickSourceWinners(pairs) {
    const mrLosers = new Set(), osLosers = new Set(), decisions = [];
    // an ERP order mapped to several OS orders: the ERP side is judged once
    const byMr = new Map();
    for (const p of pairs || []) {
        const k = Number(p.mrOrderId);
        if (!byMr.has(k)) byMr.set(k, []);
        byMr.get(k).push(p);
    }
    for (const [mrId, list] of byMr) {
        const mrHas = list.some(p => !!Number(p.mrHasConfirm));
        const osHas = list.some(p => !!Number(p.osHasConfirm));
        const winner = mrHas && !osHas ? 'mr' : 'os';
        const rule = mrHas !== osHas ? 'confirm data beats projection only' : 'tie — os_orders fallback';
        if (winner === 'mr') for (const p of list) osLosers.add(Number(p.osOrderId));
        else mrLosers.add(mrId);
        decisions.push({
            mrOrderId : mrId, mrOrderCode : list[0].mrOrderCode || null,
            osOrders : list.map(p => ({ id : Number(p.osOrderId), code : p.osOrderCode || null })),
            mrHasConfirm : mrHas, osHasConfirm : osHas, winner, rule
        });
    }
    return { mrLosers, osLosers, decisions };
}

// Source A PO–colour quantities: os_order_color_size summed EXACTLY ONCE.
// The size rows are first reduced to one row per (os_order_id, po_id, clr_id,
// mr_product_size_id) — before any join that could multiply them — and only
// then summed to the PO–colour total the board expects.
// An OS order with NO size rows at all (the size breakdown was never keyed
// in) falls back to its os_order_color.clr_qty rows — the same totals where
// both exist (verified) — so its confirm rows do not vanish.
export const osPoColorQtySql = osDb => `
    SELECT z.os_order_id, z.po_id, z.clr_id, SUM(z.size_qty) AS qty, COUNT(*) AS size_count, 'size' AS qty_src
      FROM (SELECT cs.os_order_id, cs.po_id, cs.clr_id, cs.mr_product_size_id, SUM(cs.qty) AS size_qty
              FROM \`${osDb}\`.os_order_color_size cs
             GROUP BY cs.os_order_id, cs.po_id, cs.clr_id, cs.mr_product_size_id) z
     GROUP BY z.os_order_id, z.po_id, z.clr_id
    UNION ALL
    SELECT c.os_order_id, c.po_id, c.clr_id, SUM(c.clr_qty) AS qty, 0 AS size_count, 'colour' AS qty_src
      FROM \`${osDb}\`.os_order_color c
     WHERE c.status = 1 AND c.clr_qty > 0
       AND NOT EXISTS (SELECT 1 FROM \`${osDb}\`.os_order_color_size x WHERE x.os_order_id = c.os_order_id)
     GROUP BY c.os_order_id, c.po_id, c.clr_id`;

// the colour row of a PO–colour key: carries the stable row id (the
// planning_orders key 'os-c-<id>'), the colour's delivery date and PO number
export const osColorKeySql = osDb => `
    SELECT c.os_order_id, c.po_id, c.clr_id, MIN(c.id) AS id,
           MIN(c.delivery_date) AS delivery_date, MAX(c.po_no) AS po_no
      FROM \`${osDb}\`.os_order_color c
     WHERE c.status = 1
     GROUP BY c.os_order_id, c.po_id, c.clr_id`;
