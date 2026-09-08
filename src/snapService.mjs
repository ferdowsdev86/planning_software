// ---------------------------------------------------------------------------
// Snap & no-overlap rules for DROPPING a bar next to existing bars on a line.
//
// Rules (drag-drop spec):
//  1. Dropped near the previous bar's end (within snapTolerance working days)
//     → the dropped bar snaps flush: start = previous bar's end.
//  2. Dropped slightly OVER the previous bar's tail → same: flush after it.
//  3. Existing bars NEVER move — only the dragged/new bar adjusts.
//  4. A clearly intentional gap (beyond the tolerance) is kept as dropped.
//  5. Tolerance is configurable (working days, default 1).
//  6. The bar's duration never changes here: end is recomputed from start.
//  7. If the final span still collides with any bar (e.g. the gap is too
//     small), the dragged bar hops forward to the nearest free spot AFTER
//     the colliding bar — again, nothing else moves.
//
// Pure module: bars are read-only inputs; calendar math comes in via
// `helpers` so tests can run with a plain 24h calendar.
// ---------------------------------------------------------------------------

export const DEFAULT_SNAP_TOLERANCE_DAYS = 1;

// Configurable: localStorage 'mbm-snap-tolerance-days' (working days)
export function snapToleranceDays() {
    try {
        const v = Number(globalThis.localStorage?.getItem('mbm-snap-tolerance-days'));
        if (Number.isFinite(v) && v > 0) return v;
    }
    catch { /* no storage (tests / SSR) */ }
    return DEFAULT_SNAP_TOLERANCE_DAYS;
}

// desired : Date — where the user dropped (already clamped into the work window)
// dur     : working days the bar needs (raw.dur)
// bars    : [{ id, name, start:Date, end:Date }] other bars on the SAME line
//           (the dragged bar itself must already be excluded) — never mutated
// tol     : snap tolerance in working days
// helpers : { nextStartAfter(date), endOfWork(start, workDays) }
// →       { start, end, snappedAfter, bumpedOver }
export function resolveDropPosition({ desired, dur, bars, tol = DEFAULT_SNAP_TOLERANCE_DAYS, helpers }) {
    const H = helpers;
    let start        = new Date(desired);
    let snappedAfter = null;
    let bumpedOver   = null;
    const others = [...bars].sort((a, b) => a.start - b.start);

    // The bar this drop "belongs after": the latest-ending bar that starts at
    // or before the drop point (covers both "just after" and "dropped inside")
    let prev = null;
    for (const b of others) {
        if (b.start <= start && (!prev || b.end > prev.end)) prev = b;
    }
    if (prev) {
        const flush = H.nextStartAfter(new Date(prev.end));
        if (start < prev.end) {
            // Overlapping the previous bar's tail → flush right after it
            start        = flush;
            snappedAfter = prev;
        }
        else if (start > flush && start <= H.endOfWork(flush, tol)) {
            // Near the previous bar's end → close the unintended gap
            start        = flush;
            snappedAfter = prev;
        }
        // exactly flush, or beyond the tolerance (intentional gap): keep
    }

    // No-overlap sweep: ONLY the dragged bar hops forward past collisions
    for (let guard = 0; guard < 20; guard++) {
        const end = H.endOfWork(start, dur);
        const hit = others.find(b => b.start < end && b.end > start);
        if (!hit) return { start, end, snappedAfter, bumpedOver };
        bumpedOver   = hit;
        snappedAfter = null;
        start        = H.nextStartAfter(new Date(hit.end));
    }
    return { start, end : H.endOfWork(start, dur), snappedAfter, bumpedOver };
}

// Validation helper: overlapping pairs on one line (ignores touching bars and
// sub-minute rounding noise). bars: [{ id, start:Date|ms, end:Date|ms }]
export function findLineOverlaps(bars, minMs = 60000) {
    const sorted = [...bars].sort((a, b) => a.start - b.start);
    const pairs = [];
    for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
            const a = sorted[i], b = sorted[j];
            if (b.start >= a.end) break; // sorted: nothing later overlaps a
            if (Math.min(a.end, b.end) - Math.max(a.start, b.start) > minMs) {
                pairs.push([a, b]);
            }
        }
    }
    return pairs;
}
