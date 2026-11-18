// ---------------------------------------------------------------------------
// Auto Plan v2 — the planner's rule set of 2026-11-17 (replaces every earlier
// Auto plan rule: no clubbing, no parallel / serial affinity, no gap fill from
// the Holding Row, no "no late plan" parking, no settle / pull passes).
//
//   1. Earliest sewing start = PCD + 8 calendar days — hard, every allocation.
//      Target sewing end = delivery − 7 calendar days. A plan that finishes
//      after the target is LATE (shown in the late-plan colour, every bar of
//      a split), never dropped for that; a quantity with no feasible slot
//      inside the planning horizon stays unplanned ("Not Available Space").
//   2. Lines rank: product match (efficiency profile lists the product) →
//      earliest feasible start on / after PCD + 8 → higher product
//      efficiency → stable line id.
//   3. Confirm orders group-wise (planner, 2026-11-17 evening):
//      · up to 10,000 pcs (bigQty): ONE line when it finishes by the target;
//        only a late plan is split over several lines;
//      · over 10,000 pcs: always several lines — two, then three… — the
//        fewest that finish by the target (a single line only when no split
//        with whole 3,000-pc pieces exists and that line is on time);
//      · every piece of a split is at least 3,000 pcs (minPiece) — an order
//        under 6,000 is never split; a slower line is lifted to the minimum;
//      · every piece finishes at the same time — a spread of up to 2 days
//        (syncToleranceMs) is allowed, which is what lets a slow line carry
//        its 3,000; within a few hours the bars are cut to one common end;
//      whole pieces by each line's effective capacity from its own start;
//      the allocation is accepted only when every line really finishes by
//      the limit and the pieces sum exactly to the remaining quantity.
//      Nothing by the target → the earliest completion after it (single line
//      or split, same piece rules), marked late.
//   4. PRODUCT CONTINUITY (planner, 2026-11-18): priorities, in this order —
//      (a) the most orders finished by their target, (b) the least lateness
//      for the rest, (c) the fewest product changes: the same product runs
//      on after itself on a line, (d) the least avoidable idle working time
//      and the stronger product efficiency. A continuity gain never outranks
//      an on-time completion: among a planning unit's ON-TIME candidates the
//      line where the SAME product precedes (or follows) the slot wins — but
//      only while its start is at most continuityMaxDelayMs behind the
//      earliest on-time start (that slack is what the following orders lose);
//      a late plan still takes the earliest completion. After the greedy
//      pass, improveSchedule() tries adjacent swaps on a line and moves into
//      a same-product gap on another line, accepting a change only when no
//      order's completion gets worse (on time stays on time, lateness never
//      grows) and the product changes go down. Product = the verified
//      product id the glue hands over (ERP garment type / product family);
//      a locked / existing bar anchors the sequence through the window's
//      prevProduct / nextProduct. The style changeover and the learning
//      curve are the glue's business as before — the same product alone
//      removes neither.
//
// Pure: the board supplies the calendar / capacity model through callbacks,
// so the rules are node-tested without Bryntum.
//
//   lines   [{ id, name, windows : [{ from : Date, to : Date | null, prevProduct?, nextProduct? }] }]
//           windows = the line's free stretches from today on (a gap between
//           bars, then the open stretch after the last bar, to : null);
//           prevProduct / nextProduct = the product of the bar before / after
//   orders  [{ id, qty, product, floor : Date (PCD + 8), target : Date | null, ...anything }]
//   model   {
//     listed(line, order)  → bool    the line's profile lists the product
//     eff(line, order)     → number  the line's efficiency for the product
//     startOn(line, date)  → Date    first working moment on / after date on that line
//     finishOn(line, order, start, qty) → Date | null   real finish of qty from start
//     piecesBy(line, order, start, limit) → number      pieces made from start up to limit
//     workMinutes?(from, to) → number   working minutes between two moments (idle metric)
//   }
//   opts    { today : Date, horizonEnd : Date | null, maxLines : 6, topLines : 6,
//             bigQty : 10000, minPiece : 3000, syncToleranceMs : 2 days,
//             minGapMs : 4 h, precisionMs : 15 min,
//             continuityMaxDelayMs : 3 days, improvePasses : 2,
//             holdLate : false }   true = a late plan is returned (late : true) but
//                                   takes NO line time — the caller parks it on the
//                                   Holding Row with its suggested start
// → { placements : [{ order, pieces : [{ line, start, end, qty }], finish, late, split }],
//     unplaced   : [{ order, reason }],
//     improved   : { swaps, moves, changesBefore, changesAfter } }
// ---------------------------------------------------------------------------

export const AP2_NO_SPACE = 'Not Available Space';

const MIN = 60000;
const DAY = 24 * 60 * MIN;

const prodOf = v => String(v ?? '').trim().toUpperCase();
// the product changes a placement of `p` adds to a line's sequence when it
// takes the slot between `prev` and `next` (empty neighbours count nothing)
export function changeDelta(prev, next, p) {
    const a = prodOf(prev), b = prodOf(next), x = prodOf(p);
    let d = 0;
    if (a && a !== x) d++;
    if (b && b !== x) d++;
    if (a && b && a !== b) d--;
    return d;
}

export function planAutoV2({ orders, lines, model, opts = {} }) {
    const today      = opts.today ? new Date(opts.today) : new Date();
    const horizonEnd = opts.horizonEnd ? new Date(opts.horizonEnd) : null;
    const maxLines   = Math.max(1, Number(opts.maxLines) || 6);
    const topLines   = Math.max(2, Number(opts.topLines) || 6);
    const minGapMs   = Number(opts.minGapMs) > 0 ? Number(opts.minGapMs) : 4 * 60 * MIN;
    const precision  = Number(opts.precisionMs) > 0 ? Number(opts.precisionMs) : 15 * MIN;
    const holdLate   = !!opts.holdLate;
    // group-wise split rules: an order over bigQty always runs on several
    // lines; a piece is never under minPiece; the pieces' finishes may spread
    // up to syncTol (they are cut to one common end when within stretchMs)
    const bigQty     = Number(opts.bigQty) >= 0 ? Number(opts.bigQty) : 10000;
    const minPiece   = Number(opts.minPiece) >= 0 ? Number(opts.minPiece) : 3000;
    const syncTol    = Number(opts.syncToleranceMs) >= 0 ? Number(opts.syncToleranceMs) : 2 * DAY;
    const stretchMs  = Number(opts.stretchMs) >= 0 ? Number(opts.stretchMs) : 4 * 60 * MIN;
    // product continuity: how far behind the earliest on-time start a
    // same-product slot may lie and still win; improvement passes afterwards
    const contDelay  = Number(opts.continuityMaxDelayMs) >= 0 ? Number(opts.continuityMaxDelayMs) : 3 * DAY;
    const improvePasses = Number.isFinite(Number(opts.improvePasses)) ? Math.max(0, Number(opts.improvePasses)) : 2;
    const { listed, eff, startOn, finishOn, piecesBy } = model;

    // the module's own copy of the free windows — consumed as it places
    const windows = new Map(lines.map(l => [l.id, (l.windows || [{ from : new Date(today), to : null }])
        .map(w => ({ from : new Date(w.from), to : w.to ? new Date(w.to) : null, prevProduct : w.prevProduct ?? null, nextProduct : w.nextProduct ?? null }))]));

    const byTarget = (a, b) => {
        const ta = a.target ? +a.target : Infinity, tb = b.target ? +b.target : Infinity;
        return (ta - tb) || ((+a.floor || 0) - (+b.floor || 0)) || String(a.id).localeCompare(String(b.id));
    };
    const sorted = [...orders].filter(o => Number(o.qty) > 0).sort(byTarget);

    const placements = [], unplaced = [];

    // the earliest window of a line (on / after `from`) and the start in it
    const slotsOf = (line, from) => {
        const out = [];
        for (const w of windows.get(line.id) || []) {
            if (w.to && w.to <= from) continue;
            const st = startOn(line, w.from > from ? w.from : from);
            if (w.to && st >= w.to) continue;
            if (horizonEnd && st > horizonEnd) break;
            out.push({ window : w, start : st });
        }
        return out;
    };

    // single-line candidate: the first window whose stretch takes the whole run
    const singleOf = (line, o, floor) => {
        for (const sl of slotsOf(line, floor)) {
            const fin = finishOn(line, o, sl.start, o.qty);
            if (!fin || !(fin > sl.start)) continue;
            if (sl.window.to && fin > sl.window.to) continue;        // the gap is too short — the next stretch
            if (horizonEnd && fin > horizonEnd) return null;         // nothing later fits either
            return { line, window : sl.window, start : sl.start, finish : fin, listed : listed(line, o) ? 0 : 1, eff : Number(eff(line, o)) || 0,
                changes : changeDelta(sl.window.prevProduct, sl.window.nextProduct, o.product) };
        }
        return null;
    };
    const rank = (a, b) => (a.listed - b.listed) || (a.start - b.start) || (b.eff - a.eff) || String(a.line.id).localeCompare(String(b.line.id));
    // on-time candidates: continuity before start — within the allowed delay
    const rankOnTime = list => {
        if (!list.length) return list;
        const earliest = Math.min(...list.map(c => +c.start));
        const key = c => (+c.start - earliest <= contDelay ? c.changes : 9);
        return [...list].sort((a, b) => (a.listed - b.listed) || (key(a) - key(b)) || (a.start - b.start) || (b.eff - a.eff) || String(a.line.id).localeCompare(String(b.line.id)));
    };

    // a line's earliest usable stretch for a PIECE: start + the stretch's end
    const pieceSlotOf = (line, o, floor) => {
        const sl = slotsOf(line, floor)[0];
        return sl ? { line, start : sl.start, window : sl.window, listed : listed(line, o) ? 0 : 1, eff : Number(eff(line, o)) || 0 } : null;
    };
    const capTo = (ps, o, F) => {
        const lim = ps.window.to && ps.window.to < F ? ps.window.to : F;
        return lim > ps.start ? Math.max(0, Math.floor(Number(piecesBy(ps.line, o, ps.start, lim)) || 0)) : 0;
    };
    // whole pieces by capacity (largest remainder), total exact, every line ≥ 1
    // — and every piece at least minPiece: a piece under it is lifted to the
    // minimum, the largest pieces give (that line then finishes after the
    // others' common moment; syncSplit accepts the spread up to syncTol)
    const sharesBy = (qty, caps) => {
        const sum = caps.reduce((a, b) => a + b, 0);
        if (!(sum >= qty)) return null;
        if (qty < caps.length * minPiece) return null;
        const exact = caps.map(c => qty * c / sum);
        const q = exact.map(Math.floor);
        let rest = qty - q.reduce((a, b) => a + b, 0);
        const order = exact.map((v, i) => [v - Math.floor(v), i]).sort((a, b) => b[0] - a[0]).map(x => x[1]);
        for (let i = 0; rest > 0; i = (i + 1) % order.length) { q[order[i]]++; rest--; }
        // never more than the line's capacity, never 0 on a line of the split
        for (let i = 0; i < q.length; i++) if (q[i] > caps[i]) { const over = q[i] - caps[i]; q[i] = caps[i]; const j = q.findIndex((v, k) => k !== i && v + over <= caps[k]); if (j < 0) return null; q[j] += over; }
        if (q.some(v => v <= 0)) return null;
        if (minPiece > 0) {
            const lifted = new Set();
            for (let i = 0; i < q.length; i++) {
                if (q[i] >= minPiece) continue;
                let need = minPiece - q[i];
                q[i] = minPiece; lifted.add(i);
                while (need > 0) {
                    let j = -1;
                    for (let k = 0; k < q.length; k++) if (!lifted.has(k) && k !== i && q[k] > minPiece && (j < 0 || q[k] > q[j])) j = k;
                    if (j < 0) return null;
                    const give = Math.min(need, q[j] - minPiece);
                    q[j] -= give; need -= give;
                }
            }
        }
        return q;
    };
    // the synchronized split of `o` over `slots`: the earliest common finish
    // at which the lines' capacities take the quantity, then whole pieces that
    // every line really finishes by that time (re-balanced from the real
    // finishes). `limit` = the latest finish allowed (target, or the horizon)
    const syncSplit = (slots, o, limit) => {
        if (!limit) return null;
        const total = F => slots.reduce((a, ps) => a + capTo(ps, o, F), 0);
        if (total(limit) < o.qty) return null;
        // binary search the earliest F (precision = the board's snap)
        let lo = new Date(Math.max(...slots.map(ps => +ps.start))), hi = new Date(limit);
        if (total(lo) >= o.qty) hi = lo;
        while (hi - lo > precision) {
            const mid = new Date(Math.round((+lo + +hi) / 2 / MIN) * MIN);
            if (total(mid) >= o.qty) hi = mid; else lo = new Date(+mid + MIN);
        }
        let F = hi;
        for (let round = 0; round < 12; round++) {
            const caps = slots.map(ps => capTo(ps, o, F));
            const q = sharesBy(o.qty, caps);
            if (!q) return null;
            const fins = slots.map((ps, i) => finishOn(ps.line, o, ps.start, q[i]));
            if (fins.some(f => !f)) return null;
            const Fr = new Date(Math.max(...fins.map(f => +f)));
            if (Fr > limit) return null;
            // every line reaches its piece by the common finish: accept at the
            // real common finish (the fastest lines keep minutes of slack)
            if (Fr <= F || round === 11) {
                const first = new Date(Math.min(...fins.map(f => +f)));
                // "every piece finishes at the same time": a spread of a few
                // hours is cut to ONE common end; a slow line lifted to its
                // 3,000 may run up to syncTol behind the others — beyond that
                // the combination is no synchronized split
                if (Fr - first > syncTol) return null;
                const common = Fr - first <= stretchMs;
                const endOf = i => (common ? Fr : fins[i]);
                if (slots.some((ps, i) => ps.window.to && endOf(i) > ps.window.to)) return null;
                return { pieces : slots.map((ps, i) => ({ line : ps.line, window : ps.window, start : ps.start, end : new Date(endOf(i)), qty : q[i], ownFinish : fins[i] })), finish : new Date(Fr) };
            }
            F = Fr;   // a line was slower than its capacity estimate: re-cut at the real finish
        }
        return null;
    };
    const combos = (arr, k) => {
        const out = [];
        const rec = (start, acc) => { if (acc.length === k) { out.push([...acc]); return; } for (let i = start; i < arr.length; i++) { acc.push(arr[i]); rec(i + 1, acc); acc.pop(); } };
        rec(0, []);
        return out;
    };
    // the placed run takes its stretch out of the window; the parts left
    // before / after it remember the product now next to them
    const consume = (w, lineId, start, end, product = null) => {
        const list = windows.get(lineId) || [];
        const i = list.indexOf(w);
        if (i < 0) return;
        const before = (+start - +w.from) >= minGapMs ? { from : w.from, to : new Date(start), prevProduct : w.prevProduct ?? null, nextProduct : product ?? w.nextProduct ?? null } : null;
        const after  = w.to ? ((+w.to - +end) >= minGapMs ? { from : new Date(end), to : w.to, prevProduct : product ?? w.prevProduct ?? null, nextProduct : w.nextProduct ?? null } : null)
            : { from : new Date(end), to : null, prevProduct : product ?? w.prevProduct ?? null, nextProduct : null };
        list.splice(i, 1, ...[before, after].filter(Boolean));
    };

    for (const o of sorted) {
        const floor = new Date(Math.max(+today, o.floor ? +new Date(o.floor) : 0));
        const target = o.target ? new Date(o.target) : null;
        // the most lines a split of this order may use: whole pieces of at
        // least minPiece each (an order under 2 × minPiece is never split)
        const kMax = Math.min(maxLines, minPiece > 0 ? Math.floor(o.qty / minPiece) : maxLines);
        const big  = o.qty > bigQty;
        // 1. single lines, ranked — an order up to bigQty that one line
        //    finishes by the target runs on that line; among the on-time
        //    lines the one that continues the product (within the delay)
        const singles = lines.map(l => singleOf(l, o, floor)).filter(Boolean).sort(rank);
        const onTime = rankOnTime(target ? singles.filter(c => c.finish <= target) : singles);
        const placeSingle = c => {
            consume(c.window, c.line.id, c.start, c.finish, o.product);
            placements.push({ order : o, pieces : [{ line : c.line, start : c.start, end : c.finish, qty : o.qty, window : c.window }], finish : c.finish, late : false, split : 0, floor, target });
        };
        if (onTime.length && !big) { placeSingle(onTime[0]); continue; }
        // 2. synchronized splits by the target: two lines, then three… — the
        //    fewest lines over the best-ranked ones that have a stretch at all
        //    (an order over bigQty always comes here first)
        const slots = lines.map(l => pieceSlotOf(l, o, floor)).filter(Boolean).sort(rank).slice(0, topLines);
        let chosen = null;
        if (target && slots.length >= 2) {
            for (let k = 2; k <= Math.min(kMax, slots.length) && !chosen; k++) {
                for (const combo of combos(slots, k)) {
                    const sp = syncSplit(combo, o, target);
                    if (sp) { chosen = sp; break; }
                }
            }
        }
        if (chosen) {
            for (const p of chosen.pieces) consume(p.window, p.line.id, p.start, p.end, o.product);
            placements.push({ order : o, pieces : chosen.pieces.map(p => ({ line : p.line, start : p.start, end : p.end, qty : p.qty })), finish : chosen.finish, late : false, split : chosen.pieces.length, floor, target });
            continue;
        }
        // a big order no split (whole 3,000-pc pieces) takes by the target but
        // one line does: that line, on time, beats a late split
        if (onTime.length) { placeSingle(onTime[0]); continue; }
        // 3. late: the earliest completion after the target — a single line or
        //    a synchronized split (same piece rules) — inside the planning horizon
        //    (equal completions: the fewer product changes)
        const limit = horizonEnd;
        const byFinish = (a, b) => (a.finish - b.finish) || ((a.changes ?? 0) - (b.changes ?? 0));
        let best = singles.length ? { finish : singles[0].finish, single : [...singles].sort(byFinish)[0] } : null;
        if (best) best.finish = best.single.finish;
        if (slots.length >= 2 && limit) {
            for (let k = 2; k <= Math.min(kMax, slots.length); k++) {
                for (const combo of combos(slots, k)) {
                    const sp = syncSplit(combo, o, best ? new Date(Math.min(+best.finish - MIN, +limit)) : limit);
                    if (sp && (!best || sp.finish < best.finish)) best = { finish : sp.finish, split : sp };
                }
            }
        }
        if (!best) { unplaced.push({ order : o, reason : AP2_NO_SPACE, floor }); continue; }
        if (best.split) {
            if (!holdLate) for (const p of best.split.pieces) consume(p.window, p.line.id, p.start, p.end, o.product);
            placements.push({ order : o, pieces : best.split.pieces.map(p => ({ line : p.line, start : p.start, end : p.end, qty : p.qty })), finish : best.finish, late : true, split : best.split.pieces.length, floor, target });
        }
        else {
            const c = best.single;
            if (!holdLate) consume(c.window, c.line.id, c.start, c.finish, o.product);
            placements.push({ order : o, pieces : [{ line : c.line, start : c.start, end : c.finish, qty : o.qty, window : holdLate ? undefined : c.window }], finish : c.finish, late : true, split : 0, floor, target });
        }
    }

    const improved = improveSchedule({ placements, windows, lines, model, opts : { minGapMs, precision, passes : improvePasses, holdLate, maxDelayMs : contDelay } });
    return { placements, unplaced, improved };
}

// ---------------------------------------------------------------------------
// Improvement pass: fewer product changes at no cost to any order's completion.
// Works on the single-line placements the greedy pass made (flexible = not
// late-parked, not a split piece). Two moves:
//   · adjacent swap on a line: A then B (different products) → B then A when
//     the line's sequence has fewer changes, both still finish inside their
//     room, an on-time order stays on time and a late one never ends later;
//   · a move into a same-product gap on another line (the gap's prevProduct
//     is the order's product): the order leaves a slot where it broke the
//     sequence, finishes by its target there, and the old slot opens again.
// Each accepted change is re-measured with the real model (finishOn).
// ---------------------------------------------------------------------------
export function improveSchedule({ placements, windows, lines, model, opts = {} }) {
    const { startOn, finishOn } = model;
    const precision = Number(opts.precision) > 0 ? Number(opts.precision) : 15 * MIN;
    const minGapMs  = Number(opts.minGapMs) > 0 ? Number(opts.minGapMs) : 4 * 60 * MIN;
    const passes    = Number.isFinite(Number(opts.passes)) ? Number(opts.passes) : 2;
    // a move to another line may delay the start by at most this much (the
    // same slack the greedy pass grants continuity) — never a long idle gap
    const maxDelay  = Number(opts.maxDelayMs) >= 0 ? Number(opts.maxDelayMs) : 3 * DAY;
    const out = { swaps : 0, moves : 0, changesBefore : 0, changesAfter : 0 };
    if (!passes) return out;
    // only single-line, on-time placements of this run move; a late plan
    // (parked when holdLate) and the pieces of a synchronized split stay
    const flexible = p => !p.late && p.split === 0 && p.pieces.length === 1;
    // the line's sequence: fixed anchors (window prev / next products) + placements
    const seqOf = lineId => {
        const items = placements.filter(p => flexible(p) && p.pieces[0].line.id === lineId)
            .map(p => ({ p, start : p.pieces[0].start, end : p.pieces[0].end, product : p.order.product }));
        items.sort((a, b) => a.start - b.start);
        return items;
    };
    // FIXED anchors of a line: the existing / locked bars around the original
    // free windows (a window's prevProduct is the bar before the gap, its
    // nextProduct the bar after) — never a run this pass itself placed
    const fixed = new Map(lines.map(l => [l.id, (l.windows || []).flatMap(w => [
        w.prevProduct != null ? { at : +new Date(w.from), product : w.prevProduct, side : 'before' } : null,
        w.nextProduct != null && w.to ? { at : +new Date(w.to), product : w.nextProduct, side : 'after' } : null
    ]).filter(Boolean)]));
    // the nearest fixed product before / after a placement on its line
    const anchorsOf = (lineId, start, end) => {
        let prev = null, next = null;
        for (const a of fixed.get(lineId) || []) {
            if (a.at <= +start + precision && (!prev || a.at > prev.at)) prev = a;
            if (a.at >= +end - precision && (!next || a.at < next.at)) next = a;
        }
        return { prev, next };
    };
    const lineChanges = lineId => {
        const seq = seqOf(lineId);
        let n = 0;
        for (let i = 0; i < seq.length; i++) {
            const prevP = i > 0 ? seq[i - 1].product : anchorsOf(lineId, seq[i].start, seq[i].end).prev?.product;
            if (prevP != null && prodOf(prevP) !== prodOf(seq[i].product)) n++;
        }
        // the fixed bar after the last placement
        if (seq.length) { const nx = anchorsOf(lineId, seq[seq.length - 1].start, seq[seq.length - 1].end).next; if (nx && prodOf(nx.product) !== prodOf(seq[seq.length - 1].product)) n++; }
        return n;
    };
    const total = () => lines.reduce((a, l) => a + lineChanges(l.id), 0);
    out.changesBefore = total();
    const okFinish = (p, fin) => (p.target ? fin <= p.target : fin <= p.finish + precision);

    for (let pass = 0; pass < passes; pass++) {
        let changed = 0;
        // 1. adjacent swaps on every line
        for (const line of lines) {
            const seq = seqOf(line.id);
            for (let i = 0; i + 1 < seq.length; i++) {
                const A = seq[i], B = seq[i + 1];
                if (prodOf(A.product) === prodOf(B.product)) continue;
                const before = lineChanges(line.id);
                const room = { start : A.start, end : B.end };
                const bStart = startOn(line, room.start);
                const bFin = finishOn(line, B.p.order, bStart, B.p.order.qty);
                if (!bFin) continue;
                const aStart = startOn(line, bFin);
                const aFin = finishOn(line, A.p.order, aStart, A.p.order.qty);
                if (!aFin || aFin > +room.end + precision) continue;
                if (+bStart < +B.p.floor || +aStart < +A.p.floor) continue;
                if (!okFinish(A.p, aFin) || !okFinish(B.p, bFin)) continue;
                // try it
                const saveA = { ...A.p.pieces[0] }, saveB = { ...B.p.pieces[0] }, fA = A.p.finish, fB = B.p.finish;
                Object.assign(B.p.pieces[0], { start : bStart, end : bFin }); B.p.finish = bFin;
                Object.assign(A.p.pieces[0], { start : aStart, end : aFin }); A.p.finish = aFin;
                if (lineChanges(line.id) < before) { out.swaps++; changed++; i++; }
                else { Object.assign(A.p.pieces[0], saveA); Object.assign(B.p.pieces[0], saveB); A.p.finish = fA; B.p.finish = fB; }
            }
        }
        // 2. moves into a same-product gap on another line
        for (const p of placements) {
            if (!flexible(p)) continue;
            const pc = p.pieces[0];
            const here = pc.line.id;
            const seq = seqOf(here);
            const k = seq.findIndex(x => x.p === p);
            if (k < 0) continue;
            const prevP = k > 0 ? seq[k - 1].product : anchorsOf(here, pc.start, pc.end).prev?.product;
            const nextP = k + 1 < seq.length ? seq[k + 1].product : anchorsOf(here, pc.start, pc.end).next?.product;
            // it already continues a product here: leave it
            if ((prevP != null && prodOf(prevP) === prodOf(p.order.product)) || (nextP != null && prodOf(nextP) === prodOf(p.order.product))) continue;
            let best = null;
            for (const line of lines) {
                if (line.id === here) continue;
                if (model.listed && !model.listed(line, p.order)) continue;
                for (const w of windows.get(line.id) || []) {
                    if (prodOf(w.prevProduct) !== prodOf(p.order.product)) continue;
                    const st = startOn(line, new Date(Math.max(+w.from, +p.floor)));
                    if (w.to && st >= w.to) continue;
                    if (+st > +pc.start + maxDelay) continue;
                    const fin = finishOn(line, p.order, st, p.order.qty);
                    if (!fin || (w.to && fin > w.to) || !okFinish(p, fin)) continue;
                    if (!best || fin < best.fin) best = { line, w, st, fin };
                }
            }
            if (!best) continue;
            const before = total();
            const oldPiece = { ...pc }, oldFinish = p.finish;
            // apply the move: new slot taken, old slot opened
            consumeWindow(windows, best.w, best.line.id, best.st, best.fin, p.order.product, minGapMs);
            p.pieces[0] = { line : best.line, start : best.st, end : best.fin, qty : pc.qty, window : best.w };
            p.finish = best.fin;
            const opened = { from : new Date(oldPiece.start), to : new Date(oldPiece.end), prevProduct : prevP ?? null, nextProduct : nextP ?? null };
            (windows.get(here) || windows.set(here, []).get(here)).push(opened);
            if (total() < before) { out.moves++; changed++; }
            else {
                // undo
                const list = windows.get(here); const i = list.indexOf(opened); if (i >= 0) list.splice(i, 1);
                restoreWindow(windows, best.line.id, best.w, best.st, best.fin);
                p.pieces[0] = oldPiece; p.finish = oldFinish;
            }
        }
        if (!changed) break;
    }
    out.changesAfter = total();
    return out;
}
function consumeWindow(windows, w, lineId, start, end, product, minGapMs) {
    const list = windows.get(lineId) || [];
    const i = list.indexOf(w);
    if (i < 0) return;
    const before = (+start - +w.from) >= minGapMs ? { from : w.from, to : new Date(start), prevProduct : w.prevProduct ?? null, nextProduct : product } : null;
    const after  = w.to ? ((+w.to - +end) >= minGapMs ? { from : new Date(end), to : w.to, prevProduct : product, nextProduct : w.nextProduct ?? null } : null)
        : { from : new Date(end), to : null, prevProduct : product, nextProduct : null };
    list.splice(i, 1, ...[before, after].filter(Boolean));
}
function restoreWindow(windows, lineId, w, start, end) {
    // put the original window back in place of the parts cut from it
    const list = windows.get(lineId) || [];
    for (let i = list.length - 1; i >= 0; i--) {
        const x = list[i];
        if ((+x.from === +w.from && x.to && +x.to === +start) || (+x.from === +end && ((x.to == null && w.to == null) || (x.to && w.to && +x.to === +w.to)))) list.splice(i, 1);
    }
    list.push(w);
    list.sort((a, b) => a.from - b.from);
}

// ---------------------------------------------------------------------------
// Schedule metrics for the review: on time / late, lateness, product changes
// per line, avoidable idle working time between consecutive runs. Items:
// [{ order, line, start, end, product, target }] — every bar of the board
// in the horizon (new and existing alike). workMinutes(from, to) → working
// minutes (the glue's calendar), else calendar hours.
// ---------------------------------------------------------------------------
export function scheduleMetrics(items, { workMinutes = null, horizonEnd = null } = {}) {
    const byLine = new Map();
    const byOrder = new Map();
    for (const it of items || []) {
        if (!it || !it.line) continue;
        (byLine.get(it.line) || byLine.set(it.line, []).get(it.line)).push(it);
        const o = byOrder.get(it.order) || { order : it.order, finish : null, target : it.target || null };
        if (!o.finish || +it.end > +o.finish) o.finish = new Date(it.end);
        byOrder.set(it.order, o);
    }
    let onTime = 0, late = 0, lateDays = 0;
    for (const o of byOrder.values()) {
        if (o.target && o.finish > o.target) { late++; lateDays += (o.finish - o.target) / DAY; }
        else onTime++;
    }
    const changesByLine = {}, idleByLine = {};
    let changes = 0, idleMin = 0;
    for (const [line, list] of byLine) {
        list.sort((a, b) => a.start - b.start);
        let c = 0, idle = 0;
        for (let i = 1; i < list.length; i++) {
            if (prodOf(list[i - 1].product) !== prodOf(list[i].product)) c++;
            const from = list[i - 1].end, to = list[i].start;
            if (horizonEnd && +from > +horizonEnd) continue;
            if (+to - +from > 60 * MIN) idle += workMinutes ? Math.max(0, Number(workMinutes(from, horizonEnd && to > horizonEnd ? horizonEnd : to)) || 0) : (+to - +from) / MIN;
        }
        changesByLine[line] = c; idleByLine[line] = Math.round(idle);
        changes += c; idleMin += idle;
    }
    return { orders : byOrder.size, onTime, late, lateDays : Math.round(lateDays * 10) / 10, changes, changesByLine, idleHours : Math.round(idleMin / 60 * 10) / 10, idleByLine, finishes : byOrder };
}
