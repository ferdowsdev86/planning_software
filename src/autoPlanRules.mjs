// Auto Plan rules (planner spec 2026-11-14) — pure maths, no board, no DB.

export const AP_LOCK_DAYS = 10;
// the lock lengths the planner can choose (Auto plan dialog, 2026-11-19:
// "add option Apply the 30-day lock") — 10 is the default
export const AP_LOCK_CHOICES = [10, 30];
export const AP_HOLD_LOCK = '10-Day Plan Lock';
// hold reason of a lock window of any length ('10-Day Plan Lock', '30-Day Plan Lock')
export const lockHoldReason = days => `${Number(days) || AP_LOCK_DAYS}-Day Plan Lock`;
export const isLockHold = reason => /^\d+-Day Plan Lock$/.test(String(reason || ''));
// no line finishes the order by its target sewing end (delivery − 7): no late
// plan on a line — the order is parked on the Holding Row for the planner
export const AP_HOLD_SPACE = 'Capacity — no line finishes it by delivery − 7';

const day = (d, add = 0) => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() + add); return x; };

// ---------------------------------------------------------------------------
// WHICH CONFIRM ORDER ROWS ARE PLANNED TOGETHER (planner, 2026-11-22,
// GSL-251164 / 26SPJCP081: 17 colour rows, 30,397 pcs due 08/12 + 2,259 due
// 15/12, were ONE group — two strips of 15,630 cut through every colour and
// both deliveries: "not like that — the rows of the SAME delivery are planned
// together; over 10,000 pcs it may go on another line, 3,000 at least"):
//   · rows of one order with the SAME delivery date are always one group
//     (every colour of that delivery together — one run or one synchronized
//     split, strips per colour);
//   · a row of a LATER delivery joins the group only while the group stays
//     SMALL — together at most `smallQty` (the engine's one-line limit,
//     10,000) — and within `windowDays` of the group's first delivery (the
//     planner's 2026-11-19 rule: "small quantity, deliveries within 7–10 days
//     → planned together, the first delivery counts"); a big order is one
//     group per delivery date, each with its own target;
//   · the quantity rule is unchanged: over 10,000 pcs the group is split over
//     several lines, 3,000 pcs a piece at least (autoPlanV2 bigQty / minPiece).
// ---------------------------------------------------------------------------
export const AP_GROUP_DELIVERY_WINDOW_DAYS = 10;
export const AP_GROUP_SMALL_QTY = 10000;
export function joinsDeliveryGroup({ groupShip, groupQty, rowShip, rowQty, windowDays = AP_GROUP_DELIVERY_WINDOW_DAYS, smallQty = AP_GROUP_SMALL_QTY }) {
    if (!groupShip || !rowShip) return false;
    const g = day(groupShip), r = day(rowShip);
    if (+g === +r) return true;                                   // the same delivery: always together
    const diffDays = Math.round((+r - +g) / 86400000);
    if (diffDays < 0 || diffDays > windowDays) return false;      // a later wave: its own group
    return (Number(groupQty) || 0) + (Number(rowQty) || 0) <= smallQty;   // close deliveries, only while small
}

// plan lock: today … today + days − 1 (inclusive) are locked; the first
// editable day is today + days (10-day lock: today … today + 9, first
// editable today + 10). `today` is the board's local date.
export function lockWindow(today, days = AP_LOCK_DAYS) {
    const n = Math.max(1, Math.round(Number(days)) || AP_LOCK_DAYS);
    const from = day(today);
    return { from, lastLocked : day(from, n - 1), firstEditable : day(from, n), days : n };
}

// a bar overlaps the lock window (it started before the first editable day
// and has not ended before today)
export const overlapsLock = (start, end, lock) => !!lock && new Date(start) < lock.firstEditable && new Date(end) > lock.from;

// A row WITHOUT a bar whose earliest sewing start falls inside the lock is
// held: no line, no bar. Before the lock (already past) → not held: it is
// searched from the first editable day. On / after the first editable day →
// not held: it can be scheduled from its own date.
export function holdReason(earliestStart, lock) {
    if (!earliestStart || !lock) return null;
    const e = day(earliestStart);
    return e >= lock.from && e < lock.firstEditable ? lockHoldReason(lock.days) : null;
}

// where the search for a slot starts: never inside the lock, never before
// the earliest sewing start
export function searchFrom(earliestStart, lock) {
    const e = earliestStart ? day(earliestStart) : null;
    return e && e > lock.firstEditable ? e : new Date(lock.firstEditable);
}

// Remaining sewing quantity of one PO group, and what Auto Plan may still
// allocate for it (all in ERP pieces):
//
//   remaining = MAX(0, rowsQty − actual sewing output)
//   to plan   = MAX(0, remaining − unfinished quantity the staying bars cover)
//
// rowsQty      the PO rows' order quantity
// erpSewn      actual sewing output (ERP daily_productions), already capped
//              at the rows' quantity per row
// doneRemoved  quantity of strips that left the board finished (board records)
// now          the moment of the run
// bars         the group's bars on the board BEFORE the run:
//              { base, made, completed, kept, start, end }
//                base      the bar's quantity in ERP pieces
//                made      production the board holds for the bar
//                completed the bar is finished
//                kept      the bar stays (10-day lock / in production / completed)
//
// Actual output = the larger of the ERP figure and the board's own
// (hand-entered production, finished strips). The unfinished quantity of a
// staying bar = its quantity − what was made on it: the board's figure, plus
// — when the ERP shows MORE output than the board knows — the share of that
// extra a bar can have made so far: only a bar that has already started, in
// planned order, at most its quantity × the part of its span that has passed.
// Output no bar on the board can account for was sewn on bars that are gone;
// it lowers the remaining quantity and nothing else. A bar that starts in
// the future never counts as sewn, so its whole quantity stays covered — and
// a second run on the same inputs allocates the same quantity again.
export function remainingToPlan({ rowsQty, erpSewn = 0, doneRemoved = 0, bars = [], now = new Date() }) {
    const rows = Math.max(0, Number(rowsQty) || 0);
    const t = +new Date(now);
    const list = bars.map(b => ({ ...b, base : Math.max(0, Number(b.base) || 0), made : Math.max(0, Number(b.made) || 0) }))
        .sort((a, b) => new Date(a.start) - new Date(b.start));
    const boardMade = b => (b.completed ? b.base : Math.min(b.base, b.made));
    const boardDone = Math.max(0, Number(doneRemoved) || 0) + list.reduce((t0, b) => t0 + boardMade(b), 0);
    const erp = Math.max(0, Number(erpSewn) || 0);
    const sewn = Math.min(rows, Math.max(erp, boardDone));
    let extra = Math.max(0, erp - boardDone);       // ERP output the board does not hold yet
    let cover = 0;
    for (const b of list) {
        let made = boardMade(b);
        if (extra > 0 && !b.completed) {
            const st = +new Date(b.start), en = +new Date(b.end ?? b.start);
            const passed = !(t > st) ? 0 : !(en > st) || t >= en ? 1 : (t - st) / (en - st);
            const take = Math.min(extra, Math.max(0, Math.floor(b.base * passed) - made));
            made += take;
            extra -= take;
        }
        if (b.kept && !b.completed) cover += Math.max(0, b.base - made);
    }
    const remaining = Math.max(0, rows - sewn);
    return { remaining, sewn, cover, toPlan : Math.max(0, remaining - cover) };
}

// ERP sewing output shown on the bars of one PO group (board display).
// The board holds production per bar (entered by hand); the ERP holds the
// actual sewing output per PO. What the ERP has MORE than the board is put on
// the group's bars in their planned order — a bar that has started, each up
// to what it still has to make (never beyond its ERP quantity). A bar that
// starts in the future gets nothing; output no bar can take was sewn on bars
// that are gone and is shown on none.
// bars: [{ id, base, hand, completed, start }]  →  Map(id → pieces from the ERP)
export function attributeErpOutput({ erpSewn = 0, doneRemoved = 0, bars = [], now = new Date() }) {
    const out = new Map();
    const t = +new Date(now);
    const list = bars.map(b => ({ ...b, base : Math.max(0, Number(b.base) || 0), hand : Math.max(0, Number(b.hand) || 0) }))
        .sort((a, b) => new Date(a.start) - new Date(b.start));
    let extra = Math.max(0, Number(erpSewn) || 0) - Math.max(0, Number(doneRemoved) || 0)
        - list.reduce((a, b) => a + (b.completed ? b.base : Math.min(b.base, b.hand)), 0);
    for (const b of list) {
        if (!(extra > 0)) break;
        if (b.completed || !(+new Date(b.start) <= t)) continue;
        const take = Math.min(extra, Math.max(0, b.base - b.hand));
        if (take > 0) { out.set(b.id, take); extra -= take; }
    }
    return out;
}
