// ---------------------------------------------------------------------------
// THE ORDER QUANTITY CHANGED IN THE ERP AFTER THE ORDER WAS PLANNED
// (planner, 2026-11-19, 27H1LEV193: planned 11/11 for 1,301 pcs on MBM Line
// 22, the ERP order grew to 2,700 on 17/11 — the list said "Unplanned ·
// 1,340 on MBM Line 22" and nothing put the rest anywhere).
//
// Rule:
//   · the order's bar is under the plan lock, or the board cannot be changed
//     → nothing moves; what is missing is UNPLANNED (the only unplanned there is)
//   · no lock → the new quantity replaces the old one on the board: the
//     order's last bar on a line grows into the free time behind it (no bar
//     is pushed); what does not fit goes to the Holding Row
//   · fewer pieces than the board holds → the Holding Row gives first, then
//     the last bar on a line shrinks
//
// Pure maths — the board supplies the pieces, the room behind the last bar
// and the lock; node-tested without Bryntum.
// ---------------------------------------------------------------------------

// a difference this small is rounding (the +3 % plan quantity), not a change
export const qtyTol = need => Math.max(10, Math.round((Number(need) || 0) * 0.01));

/**
 * @param {number} need — plan quantity the order needs on the board NOW
 * @param {Array<{key, qty, hold?, locked?, min?, room?}>} pieces — the order's
 *        bars in start order: qty = plan pieces on the bar, hold = on the
 *        Holding Row, locked = under the plan lock, min = pieces it cannot go
 *        below (already made), room = extra pieces that fit behind it before
 *        the next bar on its line (omitted = no limit)
 * @param {boolean} boardLocked — nothing on the board may change
 * @returns {{kind:'same'|'locked'|'apply', need, have, diff,
 *            changes:Array<{key, qty}>, toHold:number, blocked:number}}
 *   changes — the bars that take a new quantity (0 = the bar goes)
 *   toHold  — pieces for a NEW bar on the Holding Row
 *   blocked — pieces missing that the lock keeps off the board (unplanned)
 */
export function planQtyChange({ need, pieces = [], boardLocked = false } = {}) {
    const list = (pieces || []).map(p => ({
        key : p.key, hold : !!p.hold, locked : !!p.locked,
        qty : Math.max(0, Math.round(Number(p.qty) || 0)),
        min : Math.max(0, Math.round(Number(p.min) || 0)),
        room : p.room == null ? Infinity : Math.max(0, Math.floor(Number(p.room) || 0))
    }));
    const want = Math.max(0, Math.round(Number(need) || 0));
    const have = list.reduce((t, p) => t + p.qty, 0);
    const diff = want - have;
    const res = (kind, extra = {}) => ({ kind, need : want, have, diff, changes : [], toHold : 0, blocked : 0, ...extra });
    if (!list.length || Math.abs(diff) <= qtyTol(want)) return res('same');
    if (boardLocked) return res('locked', { blocked : Math.max(0, diff) });

    const lines = list.filter(p => !p.hold), holds = list.filter(p => p.hold);
    const last = lines[lines.length - 1] || null;
    const changed = new Map();
    const set = (p, q) => { p.qty = q; changed.set(p.key, q); };
    const done = extra => res('apply', { changes : [...changed].map(([key, qty]) => ({ key, qty })), ...extra });

    if (diff > 0) {
        // the bar that would take the pieces is under the lock: nothing moves
        if (last && last.locked) return res('locked', { blocked : diff });
        let left = diff;
        if (last) {
            const grow = Math.min(left, last.room);
            if (grow > 0) { set(last, last.qty + grow); left -= grow; }
        }
        let toHold = 0;
        if (left > 0) {
            if (holds.length) set(holds[0], holds[0].qty + left);
            else toHold = left;
        }
        return done({ toHold });
    }

    let cut = -diff;
    for (let i = holds.length - 1; i >= 0 && cut > 0; i--) {
        const p = holds[i], take = Math.min(cut, Math.max(0, p.qty - p.min));
        if (take > 0) { set(p, p.qty - take); cut -= take; }
    }
    for (let i = lines.length - 1; i >= 0 && cut > 0; i--) {
        const p = lines[i];
        if (p.locked) break;                      // a locked bar keeps its quantity
        const take = Math.min(cut, Math.max(0, p.qty - p.min));
        if (take > 0) { set(p, p.qty - take); cut -= take; }
    }
    return changed.size ? done({ surplus : cut }) : res('locked', { surplus : cut });
}

/**
 * An order's quantity by where it stands: on a line, on the Holding Row, the
 * rest (ERP pieces). The board holds PLAN pieces (+3 %): they are brought
 * back to ERP pieces first. A rest within the 10 % the list has always
 * allowed for (≥ 90 % on the board = planned) is no rest.
 * @returns {{line:number, hold:number, rest:number}}
 */
export function orderShares({ qty, onLine = 0, onHold = 0, factor = 1.03 } = {}) {
    const q = Math.max(0, Math.round(Number(qty) || 0));
    const f = Number(factor) > 0 ? Number(factor) : 1;
    const erp = v => Math.round((Number(v) || 0) / f);
    let line = Math.min(q, erp(onLine));
    let hold = Math.min(q - line, erp(onHold));
    let rest = q - line - hold;
    if (rest > 0 && line + hold > 0 && rest <= q * 0.1) {
        if (hold > line) hold += rest; else line += rest;
        rest = 0;
    }
    return { line, hold, rest };
}
