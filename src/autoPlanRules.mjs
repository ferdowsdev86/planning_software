// Auto Plan rules (planner spec 2026-11-14) — pure maths, no board, no DB.

export const AP_LOCK_DAYS = 10;
export const AP_HOLD_LOCK = '10-Day Plan Lock';

const day = (d, add = 0) => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() + add); return x; };

// 10-day lock: today … today + 9 (inclusive) are locked; the first editable
// day is today + 10. `today` is the board's local date.
export function lockWindow(today, days = AP_LOCK_DAYS) {
    const from = day(today);
    return { from, lastLocked : day(from, days - 1), firstEditable : day(from, days) };
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
    return e >= lock.from && e < lock.firstEditable ? AP_HOLD_LOCK : null;
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
