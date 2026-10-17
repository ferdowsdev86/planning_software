// ---------------------------------------------------------------------------
// High Level Planning Board — simulation capacity engine.
//
// Pure functions over a SCENARIO object (units, lines, products, holidays,
// orders, reservations). Nothing here touches the live plan: the scenario is
// a self-contained copy that the board edits and the server stores in the
// hl_* tables only.
//
// Capacity model (the board's own, per line, per day, per product):
//   available minutes = manpower × (hours + OT) × 60 × efficiency%
//   pieces            = available minutes / product SMV on that line
// A reservation spreads its quantity over the working days of its span in
// proportion to each day's available minutes; the minutes it takes on a day
// are pieces × SMV. A day whose reserved minutes exceed the available
// minutes is OVERLOADED (conflict).
// ---------------------------------------------------------------------------

export const HL_UNITS = [
    { code : 'M', name : 'UNIT-M', liveUnitId : 1,  label : 'MBM' },
    { code : 'C', name : 'UNIT-C', liveUnitId : 2,  label : 'CEIL' },
    { code : 'A', name : 'UNIT-A', liveUnitId : 3,  label : 'AQL' },
    { code : 'G', name : 'UNIT-G', liveUnitId : 16, label : 'GSL' }
];

// utilisation thresholds (fraction of available minutes) — configurable per scenario
export const DEFAULT_THRESHOLDS = { partial : 0.4, full : 0.9 };

export const DEFAULT_PRODUCTS = [
    { name : 'Denim Pants', smv : 22 },
    { name : 'Woven Pants', smv : 20 },
    { name : 'Shirt',       smv : 18 },
    { name : 'Jacket',      smv : 35 },
    { name : 'Shorts',      smv : 16 },
    { name : 'Knit Top',    smv : 12 }
];

const DAY_MS = 86400000;
// overloaded = reserved minutes above the day's available minutes, beyond a
// small tolerance (the proportional spread rounds pieces per day; one piece
// of rounding must not flag a conflict): 1% of the day or 30 minutes
export const isOver = (used, cap) => used > cap + Math.max(30, cap * 0.01);
export const ymd = d => {
    const x = d instanceof Date ? d : new Date(d);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};
export const fromYmd = s => { const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (s, n) => { const d = fromYmd(s); d.setDate(d.getDate() + n); return ymd(d); };
export const daysBetween = (a, b) => Math.round((fromYmd(b) - fromYmd(a)) / DAY_MS);
export const uid = (p = 'hl') => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

// ---------------------------------------------------------------------------
// Scenario factory
// ---------------------------------------------------------------------------
export function newScenario(name = 'Scenario A', by = '') {
    const today = ymd(new Date());
    const sc = {
        id : null, name, version : 0, createdBy : by,
        from : today, to : addDays(today, 120),
        thresholds : { ...DEFAULT_THRESHOLDS },
        source : null,                       // { note, at } when imported from the live board
        units : HL_UNITS.map(u => ({
            code : u.code, name : u.name, label : u.label,
            hours : 10, ot : 0,
            workDays : [0, 1, 2, 3, 4, 6],   // Friday off (0 = Sunday)
            note : ''
        })),
        products : DEFAULT_PRODUCTS.map(p => ({ ...p })),
        lines : [],
        holidays : [],                       // { date, unitCode|null, label, kind : 'holiday'|'shutdown' }
        orders : [],                         // { id, buyer, style, product, qty, pcd, delivery, unitCode, note }
        reservations : []                    // { id, orderId, lineId, start, end, qty, locked, status, label, source }
    };
    // a default set of lines so the board is usable before configuration
    const counts = { M : 6, C : 6, A : 6, G : 4 };
    for (const u of sc.units) {
        for (let i = 1; i <= counts[u.code]; i++) sc.lines.push(newLine(sc, u.code, `Line ${String(i).padStart(2, '0')}`));
    }
    return sc;
}

export function newLine(sc, unitCode, name, extra = {}) {
    const products = {};
    for (const p of sc.products) products[p.name] = p.smv;
    return { id : uid('ln'), unitCode, name, active : true, manpower : 40, hours : null, ot : null, eff : 60, products, ...extra };
}

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------
export function unitOf(sc, code) { return sc.units.find(u => u.code === code) || null; }
export function lineById(sc, id) { return sc.lines.find(l => l.id === id) || null; }
export function orderById(sc, id) { return sc.orders.find(o => o.id === id) || null; }

export function holidayOn(sc, unitCode, day) {
    return sc.holidays.find(h => h.date === day && (!h.unitCode || h.unitCode === unitCode)) || null;
}
export function isWorkDay(sc, unitCode, day) {
    const u = unitOf(sc, unitCode);
    if (!u) return false;
    if (!u.workDays.includes(fromYmd(day).getDay())) return false;
    return !holidayOn(sc, unitCode, day);
}

// available minutes of a line on a day
export function lineDayMinutes(sc, line, day) {
    if (!line || !line.active) return 0;
    if (!isWorkDay(sc, line.unitCode, day)) return 0;
    const u = unitOf(sc, line.unitCode);
    const hours = Number(line.hours ?? u.hours) || 0;
    const ot    = Number(line.ot ?? u.ot) || 0;
    const mp    = Number(line.manpower) || 0;
    const eff   = Number(line.eff) || 0;
    return mp * (hours + ot) * 60 * eff / 100;
}

export function lineSmv(sc, line, product) {
    if (!line || !product) return null;
    const v = line.products?.[product];
    if (v == null || v === '') return null;          // not compatible
    const n = Number(v);
    return n > 0 ? n : null;
}
export function productSmv(sc, product) {
    const p = sc.products.find(x => x.name === product);
    return p && Number(p.smv) > 0 ? Number(p.smv) : 20;
}
export function lineCompatible(sc, line, product) { return lineSmv(sc, line, product) != null; }

// pieces a line can make of a product on a day
export function lineDayPieces(sc, line, product, day) {
    const smv = lineSmv(sc, line, product);
    if (!smv) return 0;
    return lineDayMinutes(sc, line, day) / smv;
}

// ---------------------------------------------------------------------------
// Load: what the reservations take, per line per day
// ---------------------------------------------------------------------------
export function workDaysIn(sc, unitCode, start, end) {
    const out = [];
    if (!start || !end || end < start) return out;
    for (let d = start, g = 0; d <= end && g < 2000; d = addDays(d, 1), g++) if (isWorkDay(sc, unitCode, d)) out.push(d);
    return out;
}

// per-day pieces of ONE reservation (spread over the span's working days in
// proportion to the line's available minutes; a span with no working day
// lands on its start day)
export function reservationDays(sc, r) {
    const line  = lineById(sc, r.lineId);
    const order = orderById(sc, r.orderId);
    const product = r.product || order?.product || null;
    const smv = (line && lineSmv(sc, line, product)) || productSmv(sc, product);
    const days = line ? workDaysIn(sc, line.unitCode, r.start, r.end) : [];
    const qty  = Number(r.qty) || 0;
    const out  = [];
    if (!line) return { smv, days : out, product };
    const caps = days.map(d => lineDayMinutes(sc, line, d));
    const tot  = caps.reduce((a, b) => a + b, 0);
    if (!days.length || tot <= 0) {
        out.push({ date : r.start, pcs : qty, min : qty * smv });
        return { smv, days : out, product };
    }
    let placed = 0;
    days.forEach((d, i) => {
        const pcs = i === days.length - 1 ? qty - placed : Math.round(qty * caps[i] / tot);
        placed += pcs;
        out.push({ date : d, pcs, min : pcs * smv });
    });
    return { smv, days : out, product };
}

export function buildLoad(sc, extraReservations = []) {
    const load = new Map();   // lineId → Map(day → { min, pcs, items : [{ resId, pcs, min }] })
    for (const r of [...sc.reservations, ...extraReservations]) {
        if (r.status === 'cancelled') continue;
        const { days } = reservationDays(sc, r);
        let m = load.get(r.lineId);
        if (!m) { m = new Map(); load.set(r.lineId, m); }
        for (const d of days) {
            let cell = m.get(d.date);
            if (!cell) { cell = { min : 0, pcs : 0, items : [] }; m.set(d.date, cell); }
            cell.min += d.min;
            cell.pcs += d.pcs;
            cell.items.push({ resId : r.id, pcs : d.pcs, min : d.min });
        }
    }
    return load;
}
export const usedMinutes = (load, lineId, day) => load.get(lineId)?.get(day)?.min || 0;

// ---------------------------------------------------------------------------
// Summaries
// ---------------------------------------------------------------------------
export function lineSummary(sc, line, from, to, load) {
    let cap = 0, used = 0, over = 0, days = 0;
    for (let d = from, g = 0; d <= to && g < 2000; d = addDays(d, 1), g++) {
        const c = lineDayMinutes(sc, line, d);
        const u = usedMinutes(load, line.id, d);
        cap += c; used += u;
        if (c > 0) days++;
        if (isOver(u, c)) over++;
    }
    return { capMin : cap, usedMin : used, availMin : Math.max(0, cap - used), util : cap ? used / cap : 0, overDays : over, workDays : days };
}

export function unitSummary(sc, unitCode, from, to, load) {
    const lines = sc.lines.filter(l => l.unitCode === unitCode);
    const s = { capMin : 0, usedMin : 0, availMin : 0, overDays : 0, activeLines : 0, lines : lines.length, idleMin : 0, util : 0, products : {} };
    const overSet = new Set();
    for (const l of lines) {
        if (l.active) s.activeLines++;
        const ls = lineSummary(sc, l, from, to, load);
        s.capMin += ls.capMin; s.usedMin += ls.usedMin;
        for (let d = from, g = 0; d <= to && g < 2000; d = addDays(d, 1), g++) {
            if (isOver(usedMinutes(load, l.id, d), lineDayMinutes(sc, l, d))) overSet.add(d);
        }
    }
    s.availMin = Math.max(0, s.capMin - s.usedMin);
    s.idleMin  = s.availMin;
    s.util     = s.capMin ? s.usedMin / s.capMin : 0;
    s.overDays = overSet.size;
    // product-wise daily capacity (pieces per working day, whole unit)
    const wd = workDaysIn(sc, unitCode, from, to);
    const sample = wd[0] || from;
    for (const p of sc.products) {
        let pcs = 0, n = 0;
        for (const l of lines) { const v = lineDayPieces(sc, l, p.name, sample); if (v > 0) { pcs += v; n++; } }
        s.products[p.name] = { pcsPerDay : Math.round(pcs), lines : n };
    }
    return s;
}

// one day of a unit: holiday | off | idle | available | partial | full | overloaded
export function unitDayStatus(sc, unitCode, day, load, thresholds = sc.thresholds || DEFAULT_THRESHOLDS) {
    if (holidayOn(sc, unitCode, day)) return holidayOn(sc, unitCode, day).kind === 'shutdown' ? 'shutdown' : 'holiday';
    if (!isWorkDay(sc, unitCode, day)) return 'off';
    let cap = 0, used = 0;
    for (const l of sc.lines) {
        if (l.unitCode !== unitCode) continue;
        cap += lineDayMinutes(sc, l, day);
        used += usedMinutes(load, l.id, day);
    }
    if (cap <= 0) return 'inactive';
    const u = used / cap;
    if (isOver(used, cap)) return 'overloaded';
    if (u >= (thresholds.full ?? 0.9)) return 'full';
    if (u >= (thresholds.partial ?? 0.4)) return 'partial';
    return used > 0 ? 'available' : 'idle';
}
export function lineDayStatus(sc, line, day, load, thresholds = sc.thresholds || DEFAULT_THRESHOLDS) {
    if (!line.active) return 'inactive';
    if (holidayOn(sc, line.unitCode, day)) return 'holiday';
    if (!isWorkDay(sc, line.unitCode, day)) return 'off';
    const cap = lineDayMinutes(sc, line, day), used = usedMinutes(load, line.id, day);
    if (cap <= 0) return 'inactive';
    if (isOver(used, cap)) return 'overloaded';
    const u = used / cap;
    if (u >= (thresholds.full ?? 0.9)) return 'full';
    if (u >= (thresholds.partial ?? 0.4)) return 'partial';
    return used > 0 ? 'available' : 'idle';
}

// ---------------------------------------------------------------------------
// Fitting an order on a line: walk the days from `from`, take the free
// minutes of each day until the quantity is made (or `until` is passed)
// ---------------------------------------------------------------------------
export function fitOnLine(sc, line, product, qty, from, until, load) {
    const smv = lineSmv(sc, line, product);
    if (!smv) return { compatible : false, placed : 0, end : null, days : [], start : null };
    const out = [];
    let placed = 0, start = null, end = null;
    for (let d = from, g = 0; placed < qty && g < 1500; d = addDays(d, 1), g++) {
        if (until && d > until) break;
        const free = lineDayMinutes(sc, line, d) - usedMinutes(load, line.id, d);
        if (free <= 0) continue;
        const pcs = Math.min(qty - placed, Math.floor(free / smv));
        if (pcs <= 0) continue;
        if (!start) start = d;
        end = d;
        placed += pcs;
        out.push({ date : d, pcs, min : pcs * smv });
    }
    return { compatible : true, placed, start, end, days : out, smv };
}

// Plan ONE order in one unit: best line first (most pieces by the delivery,
// then earliest finish), the rest split onto the next lines. Returns the
// allocations (reservation shapes), the feasible quantity, the shortage and
// what the other units could do with the same order.
export function planOrder(sc, order, { unitCode = order.unitCode, load = buildLoad(sc), split = true, deliveryLead = 0, _noAlt = false } = {}) {
    const qty = Number(order.qty) || 0;
    const from  = order.pcd && order.pcd > sc.from ? order.pcd : sc.from;
    const until = order.delivery ? addDays(order.delivery, -deliveryLead) : null;
    const tempLoad = cloneLoad(load);
    const allocations = [];
    let remaining = qty;
    const lines = sc.lines.filter(l => l.unitCode === unitCode && l.active && lineCompatible(sc, l, order.product));
    let guard = 0;
    while (remaining > 0 && guard++ < 12) {
        let best = null;
        for (const l of lines) {
            const f = fitOnLine(sc, l, order.product, remaining, from, until, tempLoad);
            if (!f.compatible || !f.placed) continue;
            if (!best || f.placed > best.fit.placed || (f.placed === best.fit.placed && f.end < best.fit.end)) best = { line : l, fit : f };
        }
        if (!best) break;
        const r = {
            id : uid('rs'), orderId : order.id, lineId : best.line.id, product : order.product,
            start : best.fit.start, end : best.fit.end, qty : best.fit.placed, locked : false, status : 'proposed',
            label : `${order.buyer || ''} ${order.style || ''}`.trim()
        };
        allocations.push(r);
        remaining -= best.fit.placed;
        addToLoad(sc, tempLoad, r);
        if (!split) break;
    }
    const feasible = qty - remaining;
    const completion = allocations.reduce((m, a) => (!m || a.end > m ? a.end : m), null);
    const requiredDays = allocations.length ? daysBetween(allocations.reduce((m, a) => (!m || a.start < m ? a.start : m), null), completion) + 1 : 0;
    const alternatives = {};
    for (const u of _noAlt ? [] : sc.units) {
        if (u.code === unitCode) continue;
        const alt = planOrder(sc, { ...order, unitCode : u.code }, { unitCode : u.code, load, split, deliveryLead, _noAlt : true });
        alternatives[u.code] = { feasible : alt.feasible, completion : alt.completion, lines : alt.allocations.length };
    }
    return { unitCode, qty, feasible, shortage : remaining, allocations, completion, requiredDays, lateBy : (completion && until && completion > until) ? daysBetween(until, completion) : 0, alternatives, linesConsidered : lines.length };
}

function cloneLoad(load) {
    const out = new Map();
    for (const [lid, m] of load) {
        const mm = new Map();
        for (const [d, c] of m) mm.set(d, { min : c.min, pcs : c.pcs, items : [...c.items] });
        out.set(lid, mm);
    }
    return out;
}
function addToLoad(sc, load, r) {
    const { days } = reservationDays(sc, r);
    let m = load.get(r.lineId);
    if (!m) { m = new Map(); load.set(r.lineId, m); }
    for (const d of days) {
        let cell = m.get(d.date);
        if (!cell) { cell = { min : 0, pcs : 0, items : [] }; m.set(d.date, cell); }
        cell.min += d.min; cell.pcs += d.pcs; cell.items.push({ resId : r.id, pcs : d.pcs, min : d.min });
    }
}

// Auto planning: every selected order, earliest delivery first, in its own
// unit (or, with no unit, the unit that makes the most of it)
export function autoPlan(sc, orderIds = null, opts = {}) {
    const load = buildLoad(sc);
    const orders = sc.orders
        .filter(o => (!orderIds || orderIds.includes(o.id)) && !sc.reservations.some(r => r.orderId === o.id && r.status !== 'cancelled'))
        .sort((a, b) => String(a.delivery || '').localeCompare(String(b.delivery || '')) || String(a.pcd || '').localeCompare(String(b.pcd || '')));
    const results = [];
    for (const o of orders) {
        let res;
        if (o.unitCode) res = planOrder(sc, o, { unitCode : o.unitCode, load, ...opts });
        else {
            let best = null;
            for (const u of sc.units) {
                const r = planOrder(sc, { ...o, unitCode : u.code }, { unitCode : u.code, load, ...opts });
                if (!best || r.feasible > best.feasible || (r.feasible === best.feasible && (r.completion || '') < (best.completion || ''))) best = r;
            }
            res = best;
        }
        for (const a of res.allocations) addToLoad(sc, load, a);
        results.push({ order : o, ...res });
    }
    return results;
}

// Where a reservation moved by hand would END if its quantity kept the
// line's free capacity from the new start (the board's "end follows the
// schedule" for the simulation)
export function endForQty(sc, lineId, product, qty, start, load) {
    const line = lineById(sc, lineId);
    if (!line) return start;
    const f = fitOnLine(sc, line, product, qty, start, null, load);
    return f.end || start;
}

// the reservations of a line that overlap a day with more minutes than exist
export function conflicts(sc, load) {
    const out = [];
    for (const l of sc.lines) {
        const m = load.get(l.id);
        if (!m) continue;
        for (const [d, cell] of m) {
            const cap = lineDayMinutes(sc, l, d);
            if (isOver(cell.min, cap)) out.push({ lineId : l.id, date : d, usedMin : cell.min, capMin : cap, reservations : cell.items.map(i => i.resId) });
        }
    }
    return out;
}

// exact reconciliation: every reservation's day pieces add up to its qty
export function reconcile(sc) {
    const issues = [];
    for (const r of sc.reservations) {
        if (r.status === 'cancelled') continue;
        const { days } = reservationDays(sc, r);
        const sum = days.reduce((a, d) => a + d.pcs, 0);
        if (sum !== (Number(r.qty) || 0)) issues.push({ resId : r.id, qty : r.qty, placed : sum });
    }
    return issues;
}
