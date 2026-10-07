// ---------------------------------------------------------------------------
// Equal Order — pure balancing of an order's splits (no DOM, no Bryntum).
//
// Input : caps = one capacity profile per split, { 'YYYY-MM-DD' : pieces }
//         (what that split's line can make on that day from the split's own
//         start, as the board's production model says), already cut at the
//         next fixed bar on its line; R = remaining pieces to distribute.
// Output: { D, alloc } — the common finish day and whole-piece allocations
//         (SUM(alloc) === R, every alloc ≥ 1) or { error }.
//
// Rule: D is the first day on which the splits together can hold R while
// every split has at least one piece to make. Each split takes everything it
// can make before D; the last day's pieces are shared by each line's
// capacity on D (at least one piece each, so all really end on D).
// ---------------------------------------------------------------------------
export function balanceSplits(caps, R) {
    const n = caps.length;
    if (!n) return { error : 'no splits' };
    if (!(R > 0)) return { error : 'nothing to balance' };
    if (R < n) return { error : 'too few' };   // fewer pieces than splits — one split would get nothing
    const dates = [...new Set(caps.flatMap(c => Object.keys(c)))].sort();
    if (!dates.length) return { error : 'no capacity' };
    const run = caps.map(() => 0);
    let D = null, prevCum = caps.map(() => 0);
    for (const k of dates) {
        const before = [...run];
        caps.forEach((c, i) => { run[i] += c[k] || 0; });
        if (run.every(v => v >= 1) && run.reduce((a, b) => a + b, 0) >= R) { D = k; prevCum = before; break; }
    }
    if (!D) return { error : 'infeasible' };
    const dayCap = caps.map(c => c[D] || 0);
    const base   = [...prevCum];
    const x      = dayCap.map(c => Math.min(1, c));
    let left = R - base.reduce((a, b) => a + b, 0) - x.reduce((a, b) => a + b, 0);
    if (left < 0) {
        // the days before D already over-shoot (a split that only got its
        // first piece on D): take the surplus off the largest bases
        let deficit = -left;
        while (deficit > 0) {
            let bi = -1;
            base.forEach((b, i) => { if (b > 0 && (bi < 0 || b > base[bi])) bi = i; });
            if (bi < 0) break;
            base[bi]--;
            deficit--;
        }
        left = 0;
    }
    const head = dayCap.map((c, i) => Math.max(0, c - x[i]));
    const totalHead = head.reduce((a, b) => a + b, 0);
    if (left > 0 && totalHead > 0) {
        const share = head.map(h => left * h / totalHead);
        const fl = share.map(Math.floor);
        fl.forEach((f, i) => { x[i] += f; });
        left -= fl.reduce((a, b) => a + b, 0);
        // largest remainder first, never beyond that line's day capacity
        const order = share.map((v, i) => ({ i, frac : v - Math.floor(v) })).sort((a, b) => b.frac - a.frac);
        for (let g = 0; left > 0 && g < 100000; g++) {
            const pick = order.find(o => x[o.i] < dayCap[o.i]);
            if (!pick) break;
            x[pick.i]++;
            left--;
        }
    }
    if (left > 0) {
        // beyond every line's day-D capacity (rounding edge): the biggest line takes it
        let bi = 0;
        dayCap.forEach((c, i) => { if (c > dayCap[bi]) bi = i; });
        x[bi] += left;
        left = 0;
    }
    const alloc = base.map((b, i) => b + x[i]);
    const sum = alloc.reduce((a, b) => a + b, 0);
    if (sum !== R || alloc.some(a => a < 1)) return { error : 'rounding' };
    return { D, alloc };
}
