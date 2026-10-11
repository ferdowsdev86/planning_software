// ---------------------------------------------------------------------------
// Projection → confirm replacement, piece by piece (pure, node-tested).
//
// A projection order planned in several pieces (a line and the Holding Row,
// two lines, two spots on one line) keeps every piece where it is: each
// piece takes its share of the confirmed quantity by its own quantity, and
// the confirm groups (colour / PO groups) flow through the pieces in order.
// A group that straddles two pieces is split between them.
// ---------------------------------------------------------------------------

// Whole-piece shares of `total` by each piece's quantity: SUM = total, every
// piece ≥ 1 while total allows it
export function allotByPieces(pieceQtys, total) {
    const n = pieceQtys.length;
    if (!n || !(total > 0)) return pieceQtys.map(() => 0);
    const Q = pieceQtys.reduce((t, q) => t + (Number(q) || 0), 0) || 1;
    const allot = pieceQtys.map(q => Math.max(total >= n ? 1 : 0, Math.round(total * (Number(q) || 0) / Q)));
    let diff = total - allot.reduce((t, v) => t + v, 0);
    for (let i = n - 1; diff !== 0 && i >= 0; i--) {
        const step = diff > 0 ? 1 : -1;
        while (diff !== 0 && allot[i] + step >= (total >= n ? 1 : 0)) { allot[i] += step; diff -= step; }
    }
    return allot;
}

// groups: [{ g, qty }] in order; allot: per-piece quantities.
// → per piece: [{ g, qty }] items (a group may appear in two pieces)
export function queueGroupsIntoPieces(groups, allot) {
    const queue = groups.map(x => ({ g : x.g, left : Number(x.qty) || 0 })).filter(x => x.left > 0);
    return allot.map(need => {
        const items = [];
        let n = need;
        while (n > 0 && queue.length) {
            const q = queue[0];
            const take = Math.min(q.left, n);
            if (take > 0) items.push({ g : q.g, qty : take });
            q.left -= take;
            n -= take;
            if (q.left <= 0) queue.shift();
        }
        return items;
    });
}
