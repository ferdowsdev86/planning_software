// ---------------------------------------------------------------------------
// High Level Planning Board — Central Auto Balance engine.
//
// Pure functions over a SCENARIO (src/hlEngine.js): no DOM, no database, so
// the same module runs in the browser and in the API's /hl/auto-balance
// service. Nothing here touches the live plan or ERP.
//
// Allocation rule:   CONTRACT UNIT FIRST
//                  → OTHER COMPATIBLE INTERNAL UNITS (configurable transfers)
//                  → ALL REMAINING EXCESS TO GSL (unlimited overflow pool)
//
// Capacity is the board's own: per line per day, manpower × (hours + OT) ×
// 60 × efficiency%, minus what the scenario's reservations already take.
// A proposed reservation is checked with the SAME proportional day spread
// the board uses to draw load (reservationDays), so what the engine places
// never shows as an overloaded day afterwards. MBM / CEIL / AQL are never
// loaded past their capacity; the GSL pool has no ceiling and stays
// "Pending External Capacity Confirmation" until the planner reviews it.
// ---------------------------------------------------------------------------
import { HL_UNITS, uid, addDays, lineDayMinutes, lineSmv, productSmv, ensurePoolLine, reservationDays, buildLoad } from './hlEngine.js';

export const INTERNAL = ['M', 'C', 'A'];
export const EXT_STATUS = {
    pending   : 'Pending External Capacity Confirmation',
    confirmed : 'Confirmed Externally',
    rejected  : 'Rejected / Replanning Required'
};
export const KIND_LABEL = { contract : 'Contract unit', transfer : 'Cross-unit transfer', gsl : 'GSL overflow', manual : 'Manual', live : 'Live load' };

export const DEFAULT_BALANCE = {
    transfers     : { M : ['C', 'A'], C : ['M', 'A'], A : ['M', 'C'] },  // allowed targets of each contract unit, in priority order
    productUnits  : {},        // product → { M : false, … } : the unit does NOT make the product in the simulation
    allowTransfer : true,
    allowGsl      : true,
    includeLive   : true,      // imported live-load snapshot bars count as taken capacity
    useOutstanding: true,      // plan the outstanding quantity (PO qty − exported), else the order quantity
    deliveryLead  : 0,         // working days sewing must finish before the delivery date
    units         : [...INTERNAL, 'G'],   // contract units in scope (GSL's own orders go straight to the pool)
    lastRun       : null       // summary of the last Auto Balance (what / when / result)
};
export function balanceSettings(sc) {
    const b = sc?.balance || {};
    return { ...DEFAULT_BALANCE, ...b, transfers : { ...DEFAULT_BALANCE.transfers, ...(b.transfers || {}) }, productUnits : { ...(b.productUnits || {}) } };
}
export const unitMakes = (settings, product, code) => code === 'G' || settings.productUnits?.[product]?.[code] !== false;

// the quantity the simulation plans for an order
export function planQty(o, settings) {
    const q = settings?.useOutstanding !== false && Number(o.outstanding) > 0 ? Number(o.outstanding) : Number(o.qty) || 0;
    return Math.max(0, Math.round(q));
}
export const orderSmv = (sc, o) => (Number(o?.smv) > 0 ? Number(o.smv) : productSmv(sc, o?.product));
export const ymOf = d => (d ? String(d).slice(0, 7) : 'none');

// ---------------------------------------------------------------------------
// ERP orders → scenario orders (one order = one scenario order, matched by
// its ERP order code; re-importing updates, never duplicates)
// ---------------------------------------------------------------------------
export function mergeErpOrders(sc, rows) {
    let added = 0, updated = 0, skipped = 0;
    const byCode = new Map();
    for (const o of sc.orders) { if (o.note) byCode.set(o.note, o); const m = /^(?:live|erp):(.+)$/.exec(o.source || ''); if (m) byCode.set(m[1], o); }
    for (const r of rows) {
        if (!r.code || !(Number(r.qty) > 0)) { skipped++; continue; }
        const unitCode = HL_UNITS.find(u => u.liveUnitId === Number(r.unitId))?.code || '';
        const fields = { buyer : r.buyer || '', style : r.style || '', product : r.product || 'Other', garment : r.garment || '', qty : Number(r.qty) || 0,
            outstanding : Number(r.outstanding) || 0, smv : Number(r.smv) > 0 ? Math.round(Number(r.smv) * 100) / 100 : null, pcd : r.pcd || null, delivery : r.delivery || null,
            unitCode, priority : !!r.priority, note : r.code, po : r.po || '' };
        const ex = byCode.get(r.code);
        if (ex) { Object.assign(ex, fields, { source : ex.source || `erp:${r.code}` }); updated++; }
        else { const o = { id : uid('or'), ...fields, source : `erp:${r.code}` }; sc.orders.push(o); byCode.set(r.code, o); added++; }
        if (fields.product && !sc.products.some(p => p.name === fields.product)) {
            const smv = fields.smv || 20;
            sc.products.push({ name : fields.product, smv });
            for (const l of sc.lines) if (!l.pool && l.products[fields.product] == null) l.products[fields.product] = smv;
        }
    }
    return { added, updated, skipped };
}

// ---------------------------------------------------------------------------
// Date-wise capacity index: every line's available minutes per day of the
// window as a flat array (one calendar walk, not one per order × line)
// ---------------------------------------------------------------------------
export function buildCapIndex(sc, from, to, load = null) {
    const days = [];
    for (let d = from, g = 0; d <= to && g < 2000; d = addDays(d, 1), g++) days.push(d);
    const idx = new Map(days.map((d, i) => [d, i]));
    const cap = new Map(), used = new Map();
    for (const l of sc.lines) {
        const c = new Float64Array(days.length), u = new Float64Array(days.length);
        if (!l.pool) for (let i = 0; i < days.length; i++) c[i] = lineDayMinutes(sc, l, days[i]);
        const lm = load?.get(l.id);
        if (lm) for (const [d, cell] of lm) { const i = idx.get(d); if (i != null) u[i] += cell.min; }
        cap.set(l.id, c); used.set(l.id, u);
    }
    return { days, idx, cap, used, from, to };
}
const tol = cap => Math.max(30, cap * 0.01);

// Fit `qty` pieces on one line from day `fromI`, finishing by `untilI`: the
// days are filled in sequence with their free minutes to find the span, then
// the span is verified with the board's proportional spread (pieces ∝ the
// day's capacity) — if that would overload a shared boundary day the start
// moves to the next day. Returns the span and the minutes it takes per day.
export function fitIndexed(cap, used, smv, qty, fromI, untilI) {
    const n = cap.length;
    const last = Math.min(untilI, n - 1);
    for (let s = fromI; s <= last; s++) {
        if (cap[s] - used[s] <= 0) continue;
        let placed = 0, e = s;
        for (let i = s; i <= last && placed < qty; i++) {
            const free = cap[i] - used[i];
            if (free <= 0) continue;
            const left = qty - placed;
            // crumbs: a day with under 5% of its capacity free is skipped unless
            // the rest of the order fits in it — no 2-piece bars spanning weeks
            if (free < cap[i] * 0.05 && left * smv > free) continue;
            const pcs = Math.min(left, Math.floor(free / smv));
            if (pcs <= 0) continue;
            placed += pcs; e = i;
        }
        if (placed <= 0) continue;
        // verify with the board's EXACT day spread (reservationDays): pieces per
        // day = round(qty × cap ÷ Σcap), the last day takes the remainder
        let tot = 0;
        for (let i = s; i <= e; i++) tot += cap[i];
        if (tot <= 0) continue;
        let ok = true, acc = 0;
        const take = new Float64Array(e - s + 1);
        for (let i = s; i <= e; i++) {
            const pcs = i === e ? placed - acc : Math.round(placed * cap[i] / tot);
            acc += pcs;
            take[i - s] = pcs * smv;
            if (used[i] + take[i - s] > cap[i] + tol(cap[i])) { ok = false; break; }
        }
        if (!ok) continue;
        return { placed, startI : s, endI : e, take };
    }
    return null;
}
function commit(used, fit) { for (let i = 0; i < fit.take.length; i++) used[fit.startI + i] += fit.take[i]; }

// place `qty` of an order on the compatible lines of ONE unit, best line
// first (most pieces by the deadline, then the earliest finish), the rest on
// the next lines — returns the allocations and what stayed open
function fitInUnit(sc, ix, order, unitCode, qty, fromI, untilI, settings, kind) {
    const out = [];
    let remaining = qty;
    if (!unitMakes(settings, order.product, unitCode)) return { allocations : out, remaining, reason : `${unitCode}: does not make ${order.product}` };
    const lines = sc.lines.filter(l => l.unitCode === unitCode && l.active && !l.pool && lineSmv(sc, l, order.product) != null);
    if (!lines.length) return { allocations : out, remaining, reason : `${unitCode}: no compatible line` };
    const smv = orderSmv(sc, order);
    let guard = 0;
    while (remaining > 0 && guard++ < lines.length + 2) {
        let best = null;
        for (const l of lines) {
            const f = fitIndexed(ix.cap.get(l.id), ix.used.get(l.id), smv, remaining, fromI, untilI);
            if (!f || !f.placed) continue;
            if (!best || f.placed > best.f.placed || (f.placed === best.f.placed && f.endI < best.f.endI)) best = { l, f };
        }
        if (!best) break;
        commit(ix.used.get(best.l.id), best.f);
        out.push({
            id : uid('rs'), orderId : order.id, lineId : best.l.id, product : order.product, smv,
            start : ix.days[best.f.startI], end : ix.days[best.f.endI], qty : best.f.placed,
            locked : false, status : 'proposed', source : 'balance', kind, fromUnit : order.unitCode,
            label : `${order.buyer || ''} ${order.style || ''}`.trim()
        });
        remaining -= best.f.placed;
    }
    return { allocations : out, remaining, reason : remaining > 0 ? `${unitCode}: ${qty - remaining ? `${qty - remaining} pcs fit` : 'no free capacity'} by ${ix.days[untilI] || ix.to}` : null };
}

// place `qty` of one order in ONE unit by hand (Product-wise panel moves):
// same fit as Auto Balance, against the scenario's current load
export function placeInUnit(sc, order, unitCode, qty, { kind = 'manual', reason = '', load = null, settings = balanceSettings(sc) } = {}) {
    const ix = buildCapIndex(sc, sc.from, sc.to, load || buildLoad(sc));
    const lastI = ix.days.length - 1;
    const startD = [order.pcd, sc.from].filter(Boolean).sort().pop();
    const untilD = order.delivery ? addDays(order.delivery, -(Number(settings.deliveryLead) || 0)) : sc.to;
    const fromI = Math.max(0, ix.idx.get(startD) ?? (startD > sc.to ? lastI + 1 : 0));
    const untilI = Math.min(lastI, ix.idx.get(untilD) ?? (untilD > sc.to ? lastI : -1));
    if (fromI > untilI) return { allocations : [], remaining : qty, reason : `window closed: PCD ${startD} is after the deadline ${untilD}` };
    const r = fitInUnit(sc, ix, order, unitCode, qty, fromI, untilI, settings, kind);
    for (const a of r.allocations) a.reason = reason;
    return r;
}

// ---------------------------------------------------------------------------
// Auto Balance
// ---------------------------------------------------------------------------
// opts: { from, to, buyers, units, months, products, includeLive, allowTransfer,
//         allowGsl, deliveryLead, useOutstanding, transfers, productUnits, orderIds }
// Returns { removedIds, reservations, results, summary } — the caller applies
// them to the scenario (the engine mutates nothing but the scenario's lines
// when the GSL pool line is missing).
export function autoBalance(sc, opts = {}) {
    const settings = { ...balanceSettings(sc), ...opts, transfers : { ...balanceSettings(sc).transfers, ...(opts.transfers || {}) }, productUnits : { ...balanceSettings(sc).productUnits, ...(opts.productUnits || {}) } };
    const from = opts.from && opts.from > sc.from ? opts.from : sc.from;
    const to   = opts.to && opts.to < sc.to ? opts.to : sc.to;
    const pool = ensurePoolLine(sc);
    const scopeUnits = new Set(settings.units || [...INTERNAL, 'G']);
    const inScope = o => (!opts.orderIds || opts.orderIds.includes(o.id))
        && scopeUnits.has(o.unitCode)
        && (!opts.buyers?.length || opts.buyers.includes(o.buyer))
        && (!opts.months?.length || opts.months.includes(ymOf(o.delivery)))
        && (!opts.products?.length || opts.products.includes(o.product))
        && planQty(o, settings) > 0;
    const orders = sc.orders.filter(inScope);
    // the previous unlocked proposals of these orders go (re-running never duplicates)
    const ids = new Set(orders.map(o => o.id));
    const removedIds = sc.reservations.filter(r => ids.has(r.orderId) && r.status === 'proposed' && !r.locked && r.source === 'balance').map(r => r.id);
    const removed = new Set(removedIds);
    const kept = sc.reservations.filter(r => !removed.has(r.id) && r.status !== 'cancelled' && (settings.includeLive !== false || r.source !== 'live'));
    // base load: everything that stays (locked, manual, other orders, live)
    const load = new Map();
    for (const r of kept) {
        const { days } = reservationDays(sc, r);
        let m = load.get(r.lineId); if (!m) { m = new Map(); load.set(r.lineId, m); }
        for (const d of days) { const c = m.get(d.date) || { min : 0 }; c.min += d.min; m.set(d.date, c); }
    }
    const ix = buildCapIndex(sc, from, to, load);
    const lastI = ix.days.length - 1;
    // quantity still open per order after the kept reservations
    const keptQty = new Map();
    for (const r of kept) if (r.orderId) keptQty.set(r.orderId, (keptQty.get(r.orderId) || 0) + (Number(r.qty) || 0));
    // deterministic priority: delivery first, then ERP high priority, then contract unit, then code
    const unitRank = Object.fromEntries(INTERNAL.map((c, i) => [c, i]));
    orders.sort((a, b) => String(a.delivery || '9999').localeCompare(String(b.delivery || '9999'))
        || (b.priority ? 1 : 0) - (a.priority ? 1 : 0)
        || (unitRank[a.unitCode] ?? 9) - (unitRank[b.unitCode] ?? 9)
        || String(a.note || a.id).localeCompare(String(b.note || b.id)));
    const reservations = [], results = [];
    for (const o of orders) {
        const total = planQty(o, settings);
        let remaining = Math.max(0, total - (keptQty.get(o.id) || 0));
        const res = { orderId : o.id, code : o.note || '', buyer : o.buyer, style : o.style, product : o.product, garment : o.garment || '', contractUnit : o.unitCode,
            delivery : o.delivery, qty : total, kept : keptQty.get(o.id) || 0, contract : 0, transfers : [], gsl : 0, unallocated : 0, completion : null, risk : false, rule : '', notes : [] };
        if (remaining > 0) {
            const startD = [o.pcd, from].filter(Boolean).sort().pop();                      // never before PCD / window start
            const untilD = o.delivery ? addDays(o.delivery, -(Number(settings.deliveryLead) || 0)) : to;
            const fromI = Math.max(0, ix.idx.get(startD) ?? (startD > to ? lastI + 1 : 0));
            const untilI = Math.min(lastI, ix.idx.get(untilD) ?? (untilD > to ? lastI : -1));
            if (o.unitCode === 'G') {
                // GSL's own contract orders: outside production from the start — the pool, pending confirmation
                const s = fromI <= lastI ? ix.days[Math.min(fromI, lastI)] : from;
                const e = untilI >= 0 ? ix.days[Math.max(0, Math.min(untilI, lastI))] : s;
                reservations.push({ id : uid('rs'), orderId : o.id, lineId : pool.id, product : o.product, smv : orderSmv(sc, o), start : s, end : e < s ? s : e, qty : remaining,
                    locked : false, status : 'proposed', source : 'balance', kind : 'contract', fromUnit : 'G', extStatus : 'pending', reason : 'GSL contract order — outside production', label : `${o.buyer || ''} ${o.style || ''}`.trim() });
                res.contract = remaining; remaining = 0; res.rule = 'GSL contract order'; res.risk = true;
            }
            else if (fromI <= untilI) {
                // 1 — contract unit
                const c = fitInUnit(sc, ix, o, o.unitCode, remaining, fromI, untilI, settings, 'contract');
                for (const a of c.allocations) { a.reason = `Contract unit ${o.unitCode}`; reservations.push(a); res.contract += a.qty; }
                remaining = c.remaining;
                if (c.reason) res.notes.push(c.reason);
                res.rule = c.remaining ? 'contract unit full' : 'contract unit';
                // 2 — other internal units in the configured priority
                if (remaining > 0 && settings.allowTransfer !== false) {
                    for (const u of settings.transfers[o.unitCode] || []) {
                        if (!INTERNAL.includes(u) || u === o.unitCode) continue;
                        const t = fitInUnit(sc, ix, o, u, remaining, fromI, untilI, settings, 'transfer');
                        for (const a of t.allocations) { a.reason = `${o.unitCode} full by ${untilD} → transferred to ${u}`; reservations.push(a); }
                        if (t.allocations.length) res.transfers.push({ unit : u, qty : t.allocations.reduce((s, a) => s + a.qty, 0) });
                        remaining = t.remaining;
                        if (t.reason) res.notes.push(t.reason);
                        if (remaining <= 0) break;
                    }
                    if (res.transfers.length) res.rule = 'contract unit → internal transfer';
                }
            }
            else res.notes.push(`window closed: PCD ${startD} is after the deadline ${untilD}`);
            // 3 — the rest to GSL
            if (remaining > 0 && settings.allowGsl !== false) {
                const s = fromI <= lastI ? ix.days[Math.min(fromI, lastI)] : from;
                const e = untilI >= 0 ? ix.days[Math.max(0, Math.min(untilI, lastI))] : s;
                reservations.push({
                    id : uid('rs'), orderId : o.id, lineId : pool.id, product : o.product, smv : orderSmv(sc, o),
                    start : s, end : e < s ? s : e, qty : remaining, locked : false, status : 'proposed', source : 'balance', kind : 'gsl', fromUnit : o.unitCode,
                    extStatus : 'pending', reason : `${res.notes.join('; ') || 'internal capacity exhausted'} → GSL overflow`,
                    label : `${o.buyer || ''} ${o.style || ''}`.trim()
                });
                res.gsl = remaining; remaining = 0;
                res.rule += (res.rule ? ' → ' : '') + 'GSL overflow';
                res.risk = true;                                        // external capacity unconfirmed
            }
        }
        res.unallocated = remaining;
        const mine = reservations.filter(r => r.orderId === o.id && r.kind !== 'gsl');
        res.completion = mine.reduce((m, a) => (!m || a.end > m ? a.end : m), null);
        if (res.unallocated > 0) { res.risk = true; res.rule += (res.rule ? ' → ' : '') + 'UNALLOCATED'; }
        if (o.delivery && res.completion && res.completion > o.delivery) res.risk = true;
        results.push(res);
    }
    const sum = k => results.reduce((a, r) => a + (Number(r[k]) || 0), 0);
    const summary = {
        at : new Date().toISOString().slice(0, 16).replace('T', ' '), from, to, orders : results.length,
        qty : sum('qty'), kept : sum('kept'), contract : sum('contract'), transfer : results.reduce((a, r) => a + r.transfers.reduce((s, t) => s + t.qty, 0), 0),
        gsl : sum('gsl'), unallocated : sum('unallocated'), risk : results.filter(r => r.risk).length, removed : removedIds.length,
        options : { buyers : opts.buyers || [], units : [...scopeUnits], months : opts.months || [], products : opts.products || [], includeLive : settings.includeLive !== false, allowTransfer : settings.allowTransfer !== false, allowGsl : settings.allowGsl !== false, deliveryLead : settings.deliveryLead || 0, useOutstanding : settings.useOutstanding !== false }
    };
    return { removedIds, reservations, results, summary };
}

// ---------------------------------------------------------------------------
// Allocation report — computed from the scenario's RESERVATIONS, so manual
// moves, locks and cancellations on the board are always reflected
// ---------------------------------------------------------------------------
export function allocationReport(sc, { settings = balanceSettings(sc), capIndex = null, load = null } = {}) {
    const lineUnit = new Map(sc.lines.map(l => [l.id, l.unitCode]));
    const poolIds = new Set(sc.lines.filter(l => l.pool).map(l => l.id));
    const months = new Set();
    const orders = [];
    const byOrder = new Map();
    for (const r of sc.reservations) {
        if (r.status === 'cancelled' || !r.orderId) continue;
        if (!byOrder.has(r.orderId)) byOrder.set(r.orderId, []);
        byOrder.get(r.orderId).push(r);
    }
    const unitKey = (u, ym) => `${u}|${ym}`;
    const um = new Map();     // unit|deliveryMonth → metrics
    const umGet = (u, ym) => { const k = unitKey(u, ym); let v = um.get(k); if (!v) { v = { unit : u, ym, originalQty : 0, originalSah : 0, internalQty : 0, internalSah : 0, outQty : 0, outSah : 0, inQty : 0, inSah : 0, gslQty : 0, gslSah : 0, unallocated : 0, unallocatedSah : 0, orders : 0, keptQty : 0 }; um.set(k, v); } return v; };
    const pm = new Map();     // product|unit → { product, unit, original, proposed }
    const pmGet = (p, u) => { const k = `${p}|${u}`; let v = pm.get(k); if (!v) { v = { product : p, unit : u, originalQty : 0, proposedQty : 0, orders : 0 }; pm.set(k, v); } return v; };
    const bm = new Map();     // buyer → metrics
    const bmGet = b => { let v = bm.get(b); if (!v) { v = { buyer : b, originalQty : 0, internalQty : 0, transferQty : 0, gslQty : 0, unallocated : 0, orders : 0, risk : 0 }; bm.set(b, v); } return v; };
    for (const o of sc.orders) {
        if (!o.unitCode) continue;
        const total = planQty(o, settings);
        if (total <= 0) continue;
        const smv = orderSmv(sc, o);
        const ym = ymOf(o.delivery);
        months.add(ym);
        const rs = byOrder.get(o.id) || [];
        const row = { id : o.id, code : o.note || '', buyer : o.buyer, style : o.style, product : o.product, garment : o.garment || '', contractUnit : o.unitCode, delivery : o.delivery, pcd : o.pcd, ym,
            qty : total, smv, internal : 0, transfers : {}, gsl : 0, gslStatus : null, locked : 0, unallocated : 0, completion : null, risk : false, reasons : [], lines : rs.length };
        for (const r of rs) {
            const u = lineUnit.get(r.lineId);
            const q = Number(r.qty) || 0;
            if (r.locked) row.locked += q;
            if (o.unitCode === 'G' && (poolIds.has(r.lineId) || u === 'G')) { row.internal += q; row.gslStatus = r.extStatus || 'pending'; }
            else if (poolIds.has(r.lineId) || u === 'G') { row.gsl += q; row.gslStatus = r.extStatus || 'pending'; }
            else if (u === o.unitCode) row.internal += q;
            else if (u) row.transfers[u] = (row.transfers[u] || 0) + q;
            if (r.reason && !row.reasons.includes(r.reason)) row.reasons.push(r.reason);
            if (!poolIds.has(r.lineId) && u !== 'G') row.completion = !row.completion || r.end > row.completion ? r.end : row.completion;
            pmGet(o.product, u || '?').proposedQty += q;
        }
        const placed = row.internal + Object.values(row.transfers).reduce((a, b) => a + b, 0) + row.gsl;
        row.unallocated = Math.max(0, total - placed);
        row.over = Math.max(0, placed - total);
        row.risk = row.unallocated > 0 || ((row.gsl > 0 || o.unitCode === 'G') && row.gslStatus && row.gslStatus !== 'confirmed') || !!(o.delivery && row.completion && row.completion > o.delivery);
        orders.push(row);
        const m = umGet(o.unitCode, ym);
        m.orders++; m.originalQty += total; m.originalSah += total * smv / 60; m.internalQty += row.internal; m.internalSah += row.internal * smv / 60;
        m.gslQty += row.gsl; m.gslSah += row.gsl * smv / 60; m.unallocated += row.unallocated; m.unallocatedSah += row.unallocated * smv / 60; m.keptQty += row.locked;
        for (const [u, q] of Object.entries(row.transfers)) { m.outQty += q; m.outSah += q * smv / 60; const t = umGet(u, ym); t.inQty += q; t.inSah += q * smv / 60; }
        const p = pmGet(o.product, o.unitCode); p.originalQty += total; p.orders++;
        const b = bmGet(o.buyer || '—'); b.orders++; b.originalQty += total; b.internalQty += row.internal; b.transferQty += Object.values(row.transfers).reduce((a, c) => a + c, 0); b.gslQty += row.gsl; b.unallocated += row.unallocated; if (row.risk) b.risk++;
    }
    // capacity per unit × month (SAH) from the index when given, and the
    // PRODUCTION-month loading from the reservations' day pieces
    const prod = new Map();   // unit|productionMonth → { unit, ym, pcs, sah }
    for (const r of sc.reservations) {
        if (r.status === 'cancelled') continue;
        const u = lineUnit.get(r.lineId);
        if (!u || poolIds.has(r.lineId)) continue;
        const { days, smv } = reservationDays(sc, r);
        for (const d of days) { const k = unitKey(u, d.date.slice(0, 7)); let v = prod.get(k); if (!v) { v = { unit : u, ym : d.date.slice(0, 7), pcs : 0, sah : 0 }; prod.set(k, v); } v.pcs += d.pcs; v.sah += d.min / 60; }
    }
    const capSah = {};        // unit|month → SAH of the month inside the plan range
    if (capIndex) {
        for (const l of sc.lines) {
            if (l.pool) continue;
            const c = capIndex.cap.get(l.id);
            for (let i = 0; i < capIndex.days.length; i++) { if (!c[i]) continue; const k = unitKey(l.unitCode, capIndex.days[i].slice(0, 7)); capSah[k] = (capSah[k] || 0) + c[i] / 60; }
        }
    }
    const unitMonths = [...um.values()].map(m => {
        const cap = capSah[unitKey(m.unit, m.ym)] || 0;
        const finalSah = m.internalSah + m.inSah;
        return { ...m, capSah : cap, finalSah, shortageSah : Math.max(0, m.originalSah - cap), beforeLoad : cap > 0 ? m.originalSah / cap : null, finalQty : m.internalQty + m.inQty, finalLoad : cap > 0 ? finalSah / cap : null };
    }).sort((a, b) => a.unit.localeCompare(b.unit) || a.ym.localeCompare(b.ym));
    const production = [...prod.values()].map(p => ({ ...p, capSah : capSah[unitKey(p.unit, p.ym)] || 0, load : capSah[unitKey(p.unit, p.ym)] ? p.sah / capSah[unitKey(p.unit, p.ym)] : null }))
        .sort((a, b) => a.unit.localeCompare(b.unit) || a.ym.localeCompare(b.ym));
    const totals = { orders : orders.length, qty : 0, internal : 0, transfer : 0, gsl : 0, unallocated : 0, risk : 0, locked : 0 };
    for (const o of orders) { totals.qty += o.qty; totals.internal += o.internal; totals.transfer += Object.values(o.transfers).reduce((a, b) => a + b, 0); totals.gsl += o.gsl; totals.unallocated += o.unallocated; totals.locked += o.locked; if (o.risk) totals.risk++; }
    return { orders, unitMonths, production, products : [...pm.values()].sort((a, b) => a.product.localeCompare(b.product) || a.unit.localeCompare(b.unit)), buyers : [...bm.values()].sort((a, b) => b.originalQty - a.originalQty), totals, months : [...months].sort() };
}

// quantity check: original = internal + transfers + GSL + unallocated (per order and in total)
export function reconcileAllocation(report) {
    const bad = [];
    for (const o of report.orders) {
        const placed = o.internal + Object.values(o.transfers).reduce((a, b) => a + b, 0) + o.gsl;
        if (placed + o.unallocated !== o.qty && !(o.over > 0 && placed === o.qty + o.over)) bad.push({ id : o.id, code : o.code, qty : o.qty, placed, unallocated : o.unallocated });
    }
    return bad;
}
