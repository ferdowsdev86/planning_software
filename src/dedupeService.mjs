// ---------------------------------------------------------------------------
// ONE PO ROW NEVER STANDS ON THE BOARD TWICE (planner, 2026-11-24,
// 26H1LEV701: a 5,080-pc order showed TWO strips on MBM Line 06+07 — 4,905
// for its four 19/12 POs and 5,232 for the whole order, the same PO rows on
// both bars; 10,137 planned for 5,080 — "why two strips, max qty, fix it").
// The live DB held 16 such orders: a whole-order bar beside the order's group
// bar, a second Auto plan run that parked an order already parked, the rest
// of an order that had meanwhile been restored in full.
//
// Rule (planner, 2026-11-25: "whatever order stands on the board, projected
// or confirm, the sum of its bars is never more than the order"): every PO
// row carries its plan quantity (+3 %) on the board at most once. A bar's
// quantity is shared out over its PO rows by their ERP quantities; a row
// whose bars together carry more than its plan quantity is over-planned —
// the same rows on two bars (26H1LEV701), a duplicate merged into the
// order's bar (26H1LEV975: one 7,573-pc bar for 5,121) — and the excess
// comes off the bars that hold it: the Holding Row bars first (the latest
// start first), then the line bars from the latest start backwards. A bar
// cut to nothing goes; a bar cut in part keeps its start, shrinks to what is
// left and keeps only the rows it still carries something of (26H1LEV701:
// the whole-order bar keeps the 318-pc 22/02 PO). A bar with production is
// cut down to what it made, never below; a completed bar is never cut — the
// excess it holds is reported instead. Synchronized split pieces share their rows and
// add up to the order — nothing to cut.
// Without the rows' quantities (a projection bar, a bar saved by an older
// version, rows gone) the ORDER's quantity decides: the bars together carry
// at most `need` plan pieces, the excess comes off in the same order. The
// board uses this for an order's PROJECTION bars with need = the order's
// plan quantity minus what its confirm bars already carry.
//
// Pure maths — the board supplies the bars and sizes / removes them;
// node-tested without Bryntum.
// ---------------------------------------------------------------------------

// rounding of the +3 % pieces across several split pieces is no duplicate
export const dupTol = need => Math.max(10, Math.round((Number(need) || 0) * 0.015));

// cut order: a LINE bar that ended in the past with less than its plan made
// first (the past cannot make it any more — 26H1LEV803: the order's old bar
// from 10/11 with 12 pcs made stood beside the rest the Auto plan planned
// again; the planner merged the two into 1,774 for 867), then the Holding Row
// bars, then the line bars from the latest start backwards
const byPriority = (a, b) => (Number(b.past) - Number(a.past)) || (Number(b.hold) - Number(a.hold)) || (b.start - a.start) || String(b.key).localeCompare(String(a.key));

/**
 * @param {number} need — plan quantity the whole order may have on the board
 *        (used only when the rows' quantities are not known)
 * @param {Array<{key, qty, hold?, fixed?, past?, min?, start?, rows?:Array<{id, qty}>}>} bars
 *        — the order's bars: qty = plan pieces, hold = on the Holding Row,
 *        fixed = may not be cut at all (completed), past = a line bar that
 *        ended before today (cut first), min = pieces made (the bar never
 *        goes below them), start = start time (ms), rows = its PO rows with
 *        their ERP quantity
 * @param {number} factor — plan pieces per ERP piece (1.03)
 * @returns {{mode:'rows'|'order'|'none', need, have, excess, tol,
 *            changes:Array<{key, qty, rows?:Array<number>}>, left}}
 *   changes — bars that take a new quantity (0 = the bar goes), in cut order;
 *             rows = the PO rows a cut-down bar still carries (rows mode)
 *   left    — excess that fixed bars keep on the board (the planner's call)
 */
export function planDedupe({ need, bars = [], factor = 1.03 } = {}) {
    const list = (bars || []).map(b => ({
        key : b.key, hold : !!b.hold, fixed : !!b.fixed, past : !!b.past && !b.hold,
        qty : Math.max(0, Math.round(Number(b.qty) || 0)),
        // made pieces: the bar never goes below them, and never away with them
        min : Math.min(Math.max(0, Math.round(Number(b.min) || 0)), Math.max(0, Math.round(Number(b.qty) || 0))),
        start : Number(b.start) || 0,
        rows : (Array.isArray(b.rows) ? b.rows : []).map(r => ({ id : Number(r?.id), qty : Number(r?.qty) }))
            .filter(r => r.id > 0 && Number.isFinite(r.qty) && r.qty >= 0)
    }));
    const have = list.reduce((t, b) => t + b.qty, 0);
    const out = { mode : 'none', need : Math.max(0, Math.round(Number(need) || 0)), have, excess : 0, tol : 0, changes : [], left : 0 };
    if (!list.length) return out;
    const f = Number(factor) > 0 ? Number(factor) : 1.03;

    if (list.every(b => b.rows.length)) {
        out.mode = 'rows';
        // the rows the bars hold, with their quantity
        const rowQty = new Map();
        for (const b of list) for (const r of b.rows) rowQty.set(r.id, Math.max(rowQty.get(r.id) || 0, r.qty));
        const shared = new Set(rowQty.keys());
        // a bar's quantity shared out over its rows by their ERP quantities
        const attr = new Map();
        for (const b of list) {
            const tot = b.rows.reduce((t, r) => t + r.qty, 0);
            const m = new Map();
            for (const r of b.rows) m.set(r.id, tot > 0 ? b.qty * r.qty / tot : b.qty / b.rows.length);
            attr.set(b.key, m);
        }
        const excess = new Map();
        let capSum = 0;
        for (const id of shared) {
            const cap = Math.round(rowQty.get(id) * f);
            capSum += cap;
            const sum = list.reduce((t, b) => t + (attr.get(b.key).get(id) || 0), 0);
            if (sum - cap > 0) excess.set(id, sum - cap);
        }
        const total = () => [...excess.values()].reduce((t, x) => t + x, 0);
        out.tol = dupTol(capSum);
        // never more than the ORDER is over by (need known): a bar that holds
        // more than its own rows while the order's other rows wait off the
        // board is the planner's distribution, not a duplicate (27H1LEV043:
        // a 9,119-pc bar on 5,270 pcs of rows, the order itself 1,495 short)
        let budget = out.need > 0 ? Math.max(0, have - out.need) : Infinity;
        if (Math.min(total(), budget) <= out.tol) return out;
        out.excess = Math.round(Math.min(total(), budget));
        for (const b of list.filter(x => !x.fixed).sort(byPriority)) {
            if (total() <= out.tol || budget <= out.tol) break;
            const a = attr.get(b.key);
            let cut = 0;
            for (const r of b.rows) cut += Math.min(a.get(r.id) || 0, excess.get(r.id) || 0);
            if (cut <= 0) continue;
            // only what the order is over by, never into what the bar has made
            const scale = Math.min(1, cut > budget ? budget / cut : 1, cut > b.qty - b.min ? (b.qty - b.min) / cut : 1);
            cut *= scale;
            if (!(cut > 0)) continue;
            const rest = b.qty - cut;
            if (rest <= out.tol && b.min === 0) {
                // a sliver left over is rounding, not a plan — the bar goes with it
                for (const r of b.rows) if (excess.has(r.id)) excess.set(r.id, Math.max(0, excess.get(r.id) - (a.get(r.id) || 0)));
                out.changes.push({ key : b.key, qty : 0 });
                budget -= b.qty;
                continue;
            }
            const rows = [];
            for (const r of b.rows) {
                const take = Math.min(a.get(r.id) || 0, excess.get(r.id) || 0) * scale;
                if (take > 0) excess.set(r.id, excess.get(r.id) - take);
                if ((a.get(r.id) || 0) - take > 0.5) rows.push(r.id);
            }
            out.changes.push({ key : b.key, qty : Math.max(b.min, Math.round(rest)), rows : rows.length ? rows : b.rows.map(r => r.id) });
            budget -= cut;
        }
        out.left = Math.min(total(), Math.max(0, budget)) > out.tol ? Math.round(Math.min(total(), budget)) : 0;
        return out;
    }

    // the rows' quantities are not known: the ORDER's quantity decides (need
    // 0 = nothing of the order is left for these bars — they all go)
    out.mode = 'order';
    const want = out.need;
    out.tol = dupTol(want);
    if (have - want <= out.tol) return out;
    out.excess = have - want;
    let cut = have - want;
    for (const b of list.filter(x => !x.fixed).sort(byPriority)) {
        if (cut <= out.tol) break;
        const take = Math.min(b.qty - b.min, cut);
        if (!(take > 0)) continue;
        const rest = b.qty - take;
        if (rest <= out.tol && b.min === 0) { out.changes.push({ key : b.key, qty : 0 }); cut -= b.qty; }
        else { out.changes.push({ key : b.key, qty : Math.max(b.min, rest) }); cut -= take; }
    }
    out.left = cut > out.tol ? cut : 0;
    return out;
}

/**
 * Order mode — the PO rows a cut-down bar keeps: those of its own rows that
 * no OTHER bar of the order carries. When the rows' quantities are known they
 * must add up to the bar's new base quantity (2 %) — otherwise the rows are
 * not the reason for the cut (a split piece sharing every row) and the bar
 * keeps its list.
 * @param {Array} idList — the bar's rows
 * @param {Iterable} others — row ids held by the order's other bars
 * @param {Map|Object|null} rowQty — row id → ERP quantity (null = unknown)
 * @param {number} base — the bar's new base (ERP) quantity
 * @returns {{ids:Array<number>, apply:boolean}}
 */
export function uncoveredRows({ idList = [], others = [], rowQty = null, base = 0 } = {}) {
    const taken = new Set([...others].map(String));
    const ids = (idList || []).map(Number).filter(i => i > 0 && !taken.has(String(i)));
    if (!ids.length || ids.length === (idList || []).length) return { ids, apply : false };
    const q = i => rowQty == null ? undefined : (rowQty instanceof Map ? rowQty.get(Number(i)) : rowQty[i]);
    const known = ids.every(i => Number.isFinite(Number(q(i))));
    if (!known) return { ids, apply : true };
    const sum = ids.reduce((t, i) => t + Number(q(i)), 0);
    const b = Math.max(0, Number(base) || 0);
    return { ids, apply : Math.abs(sum - b) <= Math.max(2, b * 0.02) };
}
