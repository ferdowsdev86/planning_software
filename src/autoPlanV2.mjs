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
//   3. Split only when no single line finishes by the target: two lines,
//      then three; every bar of a split finishes at the SAME time; whole
//      pieces by each line's effective capacity from its own start; the
//      allocation is accepted only when every line really reaches the
//      shared finish and the pieces sum exactly to the remaining quantity.
//      No synchronized split by the target either → the earliest completion
//      after it (single line or split), marked late.
//
// Pure: the board supplies the calendar / capacity model through callbacks,
// so the rules are node-tested without Bryntum.
//
//   lines   [{ id, name, windows : [{ from : Date, to : Date | null }] }]
//           windows = the line's free stretches from today on (a gap between
//           bars, then the open stretch after the last bar, to : null)
//   orders  [{ id, qty, product, floor : Date (PCD + 8), target : Date | null, ...anything }]
//   model   {
//     listed(line, order)  → bool    the line's profile lists the product
//     eff(line, order)     → number  the line's efficiency for the product
//     startOn(line, date)  → Date    first working moment on / after date on that line
//     finishOn(line, order, start, qty) → Date | null   real finish of qty from start
//     piecesBy(line, order, start, limit) → number      pieces made from start up to limit
//   }
//   opts    { today : Date, horizonEnd : Date | null, maxLines : 3, topLines : 6,
//             minGapMs : 4 h, tolMs : 15 min, precisionMs : 15 min }
// → { placements : [{ order, pieces : [{ line, start, end, qty }], finish, late, split }],
//     unplaced   : [{ order, reason }] }
// ---------------------------------------------------------------------------

export const AP2_NO_SPACE = 'Not Available Space';

const MIN = 60000;

export function planAutoV2({ orders, lines, model, opts = {} }) {
    const today      = opts.today ? new Date(opts.today) : new Date();
    const horizonEnd = opts.horizonEnd ? new Date(opts.horizonEnd) : null;
    const maxLines   = Math.max(1, Number(opts.maxLines) || 3);
    const topLines   = Math.max(2, Number(opts.topLines) || 6);
    const minGapMs   = Number(opts.minGapMs) > 0 ? Number(opts.minGapMs) : 4 * 60 * MIN;
    const precision  = Number(opts.precisionMs) > 0 ? Number(opts.precisionMs) : 15 * MIN;
    const { listed, eff, startOn, finishOn, piecesBy } = model;

    // the module's own copy of the free windows — consumed as it places
    const windows = new Map(lines.map(l => [l.id, (l.windows || [{ from : new Date(today), to : null }])
        .map(w => ({ from : new Date(w.from), to : w.to ? new Date(w.to) : null }))]));

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
            return { line, window : sl.window, start : sl.start, finish : fin, listed : listed(line, o) ? 0 : 1, eff : Number(eff(line, o)) || 0 };
        }
        return null;
    };
    const rank = (a, b) => (a.listed - b.listed) || (a.start - b.start) || (b.eff - a.eff) || String(a.line.id).localeCompare(String(b.line.id));

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
    const sharesBy = (qty, caps) => {
        const sum = caps.reduce((a, b) => a + b, 0);
        if (!(sum >= qty)) return null;
        const exact = caps.map(c => qty * c / sum);
        const q = exact.map(Math.floor);
        let rest = qty - q.reduce((a, b) => a + b, 0);
        const order = exact.map((v, i) => [v - Math.floor(v), i]).sort((a, b) => b[0] - a[0]).map(x => x[1]);
        for (let i = 0; rest > 0; i = (i + 1) % order.length) { q[order[i]]++; rest--; }
        // never more than the line's capacity, never 0 on a line of the split
        for (let i = 0; i < q.length; i++) if (q[i] > caps[i]) { const over = q[i] - caps[i]; q[i] = caps[i]; const j = q.findIndex((v, k) => k !== i && v + over <= caps[k]); if (j < 0) return null; q[j] += over; }
        if (q.some(v => v <= 0)) return null;
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
                const end = Fr;
                if (slots.some((ps, i) => ps.window.to && end > ps.window.to)) return null;
                return { pieces : slots.map((ps, i) => ({ line : ps.line, window : ps.window, start : ps.start, end : new Date(end), qty : q[i], ownFinish : fins[i] })), finish : end };
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
    const consume = (w, lineId, start, end) => {
        const list = windows.get(lineId) || [];
        const i = list.indexOf(w);
        if (i < 0) return;
        const before = (+start - +w.from) >= minGapMs ? { from : w.from, to : new Date(start) } : null;
        const after  = w.to ? ((+w.to - +end) >= minGapMs ? { from : new Date(end), to : w.to } : null) : { from : new Date(end), to : null };
        list.splice(i, 1, ...[before, after].filter(Boolean));
    };

    for (const o of sorted) {
        const floor = new Date(Math.max(+today, o.floor ? +new Date(o.floor) : 0));
        const target = o.target ? new Date(o.target) : null;
        // 1. single lines, ranked
        const singles = lines.map(l => singleOf(l, o, floor)).filter(Boolean).sort(rank);
        const onTime = target ? singles.filter(c => c.finish <= target) : singles;
        if (onTime.length) {
            const c = onTime[0];
            consume(c.window, c.line.id, c.start, c.finish);
            placements.push({ order : o, pieces : [{ line : c.line, start : c.start, end : c.finish, qty : o.qty }], finish : c.finish, late : false, split : 0 });
            continue;
        }
        // 2. synchronized splits by the target: two lines, then three — over
        //    the best-ranked lines that have a stretch at all
        const slots = lines.map(l => pieceSlotOf(l, o, floor)).filter(Boolean).sort(rank).slice(0, topLines);
        let chosen = null;
        if (target && slots.length >= 2) {
            for (let k = 2; k <= Math.min(maxLines, slots.length) && !chosen; k++) {
                for (const combo of combos(slots, k)) {
                    const sp = syncSplit(combo, o, target);
                    if (sp) { chosen = sp; break; }
                }
            }
        }
        if (chosen) {
            for (const p of chosen.pieces) consume(p.window, p.line.id, p.start, p.end);
            placements.push({ order : o, pieces : chosen.pieces.map(p => ({ line : p.line, start : p.start, end : p.end, qty : p.qty })), finish : chosen.finish, late : false, split : chosen.pieces.length });
            continue;
        }
        // 3. late: the earliest completion after the target — a single line or
        //    a synchronized split — inside the planning horizon
        const limit = horizonEnd;
        let best = singles.length ? { finish : singles[0].finish, single : singles.sort((a, b) => a.finish - b.finish)[0] } : null;
        if (slots.length >= 2 && limit) {
            for (let k = 2; k <= Math.min(maxLines, slots.length); k++) {
                for (const combo of combos(slots, k)) {
                    const sp = syncSplit(combo, o, best ? new Date(Math.min(+best.finish - MIN, +limit)) : limit);
                    if (sp && (!best || sp.finish < best.finish)) best = { finish : sp.finish, split : sp };
                }
            }
        }
        if (!best) { unplaced.push({ order : o, reason : AP2_NO_SPACE }); continue; }
        if (best.split) {
            for (const p of best.split.pieces) consume(p.window, p.line.id, p.start, p.end);
            placements.push({ order : o, pieces : best.split.pieces.map(p => ({ line : p.line, start : p.start, end : p.end, qty : p.qty })), finish : best.finish, late : true, split : best.split.pieces.length });
        }
        else {
            const c = best.single;
            consume(c.window, c.line.id, c.start, c.finish);
            placements.push({ order : o, pieces : [{ line : c.line, start : c.start, end : c.finish, qty : o.qty }], finish : c.finish, late : true, split : 0 });
        }
    }
    return { placements, unplaced };
}
