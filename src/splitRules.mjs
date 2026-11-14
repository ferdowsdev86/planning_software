// Split a strip at the cursor (right-click → "Split strip at …") — pure maths.
//
// The cut is the MOMENT the cursor points at, not the end of that day: part 1
// keeps what the bar's own day-by-day schedule has made from its start up to
// that moment, the new bar takes the rest.

// Pieces made by the moment `t`.
//   days  the bar's schedule, one entry per day: { ws, we, q }
//           ws / we  the part of that day's work window the bar covers (ms)
//           q        pieces planned on that day
// A day that ended before `t` counts in full; the day `t` falls in counts for
// the share of its window that has passed (output is even through the day);
// a cursor on an off day / after hours adds nothing beyond the days before.
export function qtyMadeBy(days, t) {
    const at = +new Date(t);
    let made = 0;
    for (const d of days || []) {
        const q = Number(d.q) || 0;
        if (!(q > 0)) continue;
        const ws = +d.ws, we = +d.we;
        if (at >= we) made += q;
        else if (at > ws && we > ws) made += q * (at - ws) / (we - ws);
    }
    return made;
}

// Quantities of the two parts for a cut at `t`.
//   qty      the bar's quantity
//   already  pieces of it already made (production cut off the bar's left) —
//            they stay with part 1
// → { q1, q2 }, or null when the cursor leaves nothing on one side (before the
// bar's first piece / after its last one — a short bar is drawn wider than its
// time): there is no cut to make there.
export function cursorSplit({ qty, already = 0, days, t }) {
    const total = Math.round(Number(qty) || 0);
    if (total < 2) return null;
    const q1 = Math.round(Math.max(0, Number(already) || 0) + qtyMadeBy(days, t));
    if (q1 < 1 || q1 > total - 1) return null;
    return { q1, q2 : total - q1 };
}
