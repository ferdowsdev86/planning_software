// ---------------------------------------------------------------------------
// AUTO PLAN PLANS AS PER CONFIRM ORDER ROW (planner, 2026-11-19, 2620BES060:
// one colour, 14 POs due 21/12 · 28/12 · 05/01 · 13/01 · 10/02 — the whole
// colour was ONE planning unit; it stood on a 13/01 PO row and was planned for
// 13/01 − 7; with its first delivery it would have had to finish all 14,569
// pcs by 14/12).
//
// Rule ("as per confirm order row … when the quantity is small and the
// deliveries are within 7 to 10 days they are planned together and the first
// delivery counts; over 10,000 pcs it is split, 3,000 at least, by the
// existing rule"):
//   · the planning row is the CONFIRM ORDER ROW of the Orders list — order +
//     colour + delivery date — not the colour with all its deliveries
//   · the rows of one order whose delivery lies within the window (10 days)
//     of the group's FIRST delivery are planned together, for that first
//     delivery (the board glue groups them); a later delivery is a group of
//     its own with its own target
//   · the quantity rule is the existing one (one line up to 10,000 pcs;
//     above it several lines, 3,000 pcs a piece at least)
//
// Pure — the board supplies the pool row with its PO rows (poDetails); node-
// tested without Bryntum.
// ---------------------------------------------------------------------------

const dayKey = v => {
    if (v == null || v === '') return null;
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    const d = new Date(v);
    if (Number.isNaN(+d)) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const num = v => (Number.isFinite(Number(v)) ? Number(v) : 0);
// what a PO row still has to sew (no sewing output known = its whole quantity)
const openOf = d => (d.remaining == null || !Number.isFinite(Number(d.remaining)) ? num(d.qty) : Math.max(0, Number(d.remaining)));
const uniq = list => [...new Set(list.filter(v => v != null && v !== ''))];

// `total` whole pieces over the weights, exact (largest remainder)
export function shareOut(total, weights) {
    const t = Math.max(0, Math.round(num(total)));
    const w = weights.map(x => Math.max(0, num(x)));
    const sum = w.reduce((a, b) => a + b, 0);
    if (!w.length) return [];
    if (!(sum > 0)) return w.map((_, i) => (i === 0 ? t : 0));
    const exact = w.map(x => t * x / sum);
    const out = exact.map(Math.floor);
    let rest = t - out.reduce((a, b) => a + b, 0);
    const order = exact.map((x, i) => ({ i, f : x - Math.floor(x) })).sort((a, b) => b.f - a.f || a.i - b.i);
    for (let k = 0; rest > 0 && order.length; k = (k + 1) % order.length) { out[order[k].i]++; rest--; }
    return out;
}

/**
 * A pool row (order + colour, every delivery) as its confirm order rows: one
 * row per DELIVERY DATE that still has pieces to sew, earliest first. The
 * row's plan quantity is shared out by what each delivery still has to sew
 * (exact total). PO rows sewn in full go with the first delivery — the bar
 * still stands for them, they just set no date.
 *
 * A row with one open delivery date, without PO rows, or a balance row (part
 * of an order whose other bars stay on the board) comes back as it is.
 *
 * @param {object} row — pool row: { id, dbId, qty, baseQty, orderQty, sewn,
 *        ship, idList, poList, poDetails : [{ id, po, qty, remaining, sewn, ship }] … }
 * @param {{toDate?:(v:any)=>Date}} opts — how a PO row's date becomes the
 *        row's `ship` (default: new Date)
 * @returns {object[]} rows; a cut row carries srcId (the pool row it came
 *        from) and srcParts
 */
export function splitByDelivery(row, { toDate = v => new Date(v) } = {}) {
    if (!row || row.balance) return [row];
    const seen = new Set();
    const details = (Array.isArray(row.poDetails) ? row.poDetails : []).filter(d => {
        if (!d || d.id == null || seen.has(Number(d.id))) return false;
        seen.add(Number(d.id));
        return true;
    });
    const byDay = new Map();
    const closed = [];
    for (const d of details) {
        const k = dayKey(d.ship);
        if (!k || !(openOf(d) > 0)) { closed.push(d); continue; }
        if (!byDay.has(k)) byDay.set(k, []);
        byDay.get(k).push(d);
    }
    if (byDay.size < 2) return [row];
    const days = [...byDay.keys()].sort();
    const open = days.map(k => byDay.get(k).reduce((a, d) => a + openOf(d), 0));
    const qty  = shareOut(row.qty, open);
    const base = row.baseQty != null ? shareOut(row.baseQty, open) : null;
    const allQty = details.reduce((a, d) => a + num(d.qty), 0);
    const ordByRows = Math.abs(allQty - num(row.orderQty)) <= 1;
    const ord = ordByRows ? null : (row.orderQty != null ? shareOut(row.orderQty, open) : null);
    const hasSewn = details.some(d => d.sewn != null);

    const parts = [];
    days.forEach((k, i) => {
        // a delivery too small for a whole piece of this row's quantity goes with the delivery before it
        if (!(qty[i] > 0) && parts.length) { parts[parts.length - 1].rows.push(...byDay.get(k)); return; }
        parts.push({ day : k, rows : [...byDay.get(k)], qty : qty[i], base : base ? base[i] : undefined, ord : ord ? ord[i] : undefined });
    });
    // …and a first delivery without a piece gives its rows — and its date — to the next
    while (parts.length > 1 && !(parts[0].qty > 0)) { parts[1].rows.unshift(...parts[0].rows); parts[1].day = parts[0].day; parts.shift(); }
    if (parts.length < 2) return [row];
    parts[0].rows.push(...closed);
    // rows the bar stands for that came without a PO row here (no date, an
    // older group) stay covered: they ride on the first row as well
    const extraIds = uniq([row.dbId, ...(Array.isArray(row.idList) ? row.idList : [])].map(Number).filter(i => i > 0 && !seen.has(i)));

    return parts.map((p, n) => {
        const own   = p.rows.filter(d => dayKey(d.ship) === p.day && openOf(d) > 0);
        const dbId  = Math.min(...(own.length ? own : p.rows).map(d => Number(d.id)));
        const first = (own.length ? own : p.rows).find(d => Number(d.id) === dbId) || p.rows[0];
        const ship  = toDate(first.ship);
        const pos   = uniq(p.rows.map(d => d.po));
        const out = {
            ...row,
            id        : `dbo-${dbId}`,
            dbId,
            po        : pos[0] ?? row.po,
            poList    : pos.length ? pos : row.poList,
            poCount   : pos.length || 1,
            idList    : uniq([...p.rows.map(d => Number(d.id)), ...(n === 0 ? extraIds : [])]),
            poDetails : p.rows,
            qty       : p.qty,
            orderQty  : ordByRows ? p.rows.reduce((a, d) => a + num(d.qty), 0) : (p.ord ?? row.orderQty),
            ship,
            srcId     : String(row.id),
            srcParts  : parts.length
        };
        if (p.base !== undefined) out.baseQty = p.base;
        if (hasSewn) out.sewn = p.rows.reduce((a, d) => a + num(d.sewn), 0);
        if (row.poDelivery !== undefined) out.poDelivery = ship;
        return out;
    });
}

/**
 * The members of ONE planning group: rows that came from the same pool row
 * (the same colour, deliveries inside the group's window) are one member —
 * planned together, ONE strip, standing on the row of the first delivery.
 * Rows of other pool rows (other colours) stay members of their own.
 * @param {object[]} members — in delivery order (earliest first)
 */
export function mergeSameSource(members) {
    const out = [];
    const bySrc = new Map();
    for (const m of members || []) {
        const k = m && m.srcId != null ? String(m.srcId) : null;
        const prev = k != null ? bySrc.get(k) : null;
        if (!prev) {
            const c = { ...m };
            if (k != null) bySrc.set(k, c);
            out.push(c);
            continue;
        }
        prev.qty      = num(prev.qty) + num(m.qty);
        prev.orderQty = num(prev.orderQty) + num(m.orderQty);
        if (prev.baseQty != null || m.baseQty != null) prev.baseQty = num(prev.baseQty) + num(m.baseQty);
        if (prev.sewn != null || m.sewn != null) prev.sewn = num(prev.sewn) + num(m.sewn);
        prev.idList    = uniq([...(prev.idList || []), ...(m.idList || [])]);
        prev.poList    = uniq([...(prev.poList || []), ...(m.poList || [])]);
        prev.poCount   = prev.poList.length || 1;
        prev.poDetails = [...(prev.poDetails || []), ...(m.poDetails || [])];
        // the earliest delivery stays the member's delivery and its anchor row
        if (m.ship && (!prev.ship || +new Date(m.ship) < +new Date(prev.ship))) {
            prev.ship = m.ship; prev.id = m.id; prev.dbId = m.dbId; prev.po = m.po;
            if (m.poDelivery !== undefined) prev.poDelivery = m.poDelivery;
        }
    }
    return out;
}
