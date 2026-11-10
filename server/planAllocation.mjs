// ---------------------------------------------------------------------------
// Plan allocation simulation (pure — no DB / Express; node-tested) behind the
// "Plan allocation" tab of the Available Order report. It lays the AVAILABLE
// orders of a production unit on that unit's sewing lines by the planning
// board's own rules and reports, per order, the pieces made on each calendar
// day — the report then splits them into the plan window (1st → last day of
// the planning month) and the rest.
//
//   window          sewing start = PCD − 8 days (never before today),
//                   sewing end   = order delivery − 7 days
//   calendar        the unit's weekly pattern (Friday off …), its date
//                   overrides (Change working hours, 0 = off day) and the
//                   per-line overrides (a line's own figure beats the unit's)
//   capacity        manpower × line minutes × efficiency % ÷ SMV per day;
//                   efficiency = buyer rule (G-Star 40 %) → the line's
//                   efficiency profile (product type %, else _Default) → the
//                   line efficiency
//   occupied lines  saved bars keep their minutes of every day they cover;
//                   only the free rest of a day can take a new order
//   plan qty        +3 % (the board's planQtyOf) — capacity is consumed at
//                   the plan qty, the result is reported in order pieces
//   learning curve  a product / style changeover on a line runs its first N
//                   working days at the unit's Build up curve percentages
//   planning order  PCD, then delivery (the board's auto-plan order); an
//                   order takes the line that finishes it earliest inside its
//                   window, spills over to further lines when one cannot hold
//                   it, and what no line can make in the window is `left`
//   late orders     window already closed (delivery − 7 before today) → the
//                   order is planned from today up to its delivery date and
//                   flagged `late`; a delivery already past places nothing
// ---------------------------------------------------------------------------

export const SEW_START_BEFORE_PCD = 8;
export const SEW_END_BEFORE_SHIP  = 7;
export const PLAN_EXTRA           = 0.03;
export const BUYER_DEFAULT_EFF    = [{ match : /g[\s-]?star/i, eff : 40 }];
const DAY_MS  = 86400000;
const MAX_WIN = 400;   // days — guards the day loops

export function planQtyOf(q) {
    const n = Number(q) || 0;
    return n > 0 ? n + Math.round(n * PLAN_EXTRA) : 0;
}

const pad = n => String(n).padStart(2, '0');
export const ymdOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export function toDay(v) {
    if (!v) return null;
    const d = v instanceof Date ? new Date(v) : new Date(/^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? `${v}T00:00:00` : v);
    if (Number.isNaN(+d)) return null;
    d.setHours(0, 0, 0, 0);
    return d;
}
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

export function buyerDefaultEff(buyer) {
    const b = String(buyer || '');
    const hit = BUYER_DEFAULT_EFF.find(x => x.match.test(b));
    return hit ? hit.eff : null;
}

// Line profile (product type → efficiency %) resolution — the board's
// resolveProfileEfficiency: exact key, case-insensitive, then a substring
// match either way ("Pant" finds "5 Pkt Pant"); the type's figure is
// authoritative, else _Default, else the line efficiency
export function profileEfficiency(values, productType, lineEff) {
    let tv = Number(values?.[productType]);
    if (!(tv > 0) && productType && values) {
        const want = String(productType).trim().toLowerCase();
        const typed = Object.keys(values).filter(k => k !== '_Default' && Number(values[k]) > 0);
        const hit = typed.find(k => k.toLowerCase() === want)
            || typed.find(k => want.includes(k.toLowerCase()) || k.toLowerCase().includes(want));
        if (hit) tv = Number(values[hit]);
    }
    const dv = Number(values?._Default);
    if (tv > 0) return tv;
    if (dv > 0) return dv;
    return Number(lineEff) || 0;
}

// Style identity of the learning-curve run (the board's styleBaseKey)
export function styleBaseKey(style) {
    const t = String(style || '').trim().toLowerCase();
    if (!t) return '';
    const first = t.split(/[\s-]+/)[0];
    return first.length >= 5 ? first : t;
}
export const runKeyOf = (productType, style) => `${String(productType || '').trim().toLowerCase()}|${styleBaseKey(style)}`;

// The unit's 3-day Build up curve from learning_curve rows (one per curve
// day): the unit's own curve with a 3-step ramp, else the shared one — the
// board's configuredLearningCurve / pickLearningCurve(…, 3)
export function pickCurve(rows, unitId, period = 3) {
    const byName = new Map();
    for (const r of rows || []) {
        const name = String(r.curve_name || '').trim();
        if (!name) continue;
        if (!byName.has(name)) byName.set(name, { name, period : Number(r.period_days) || 1, unitId : Number(r.unit_id) > 0 ? Number(r.unit_id) : null, days : [] });
        byName.get(name).days.push({ n : Number(r.day_number) || 1, v : Number(r.efficiency_pct) || 0 });
    }
    const list = [...byName.values()].map(c => {
        c.days.sort((a, b) => a.n - b.n);
        const pct = c.days.map(d => d.v);
        return { name : c.name, period : Math.max(c.period, pct.length) || 1, pct, unitId : c.unitId };
    });
    const pick = arr => arr.find(c => c.period === period && c.pct.length === period) || null;
    const own = Number(unitId) > 0 ? pick(list.filter(c => c.unitId === Number(unitId))) : null;
    const c = own || pick(list.filter(c => !c.unitId));
    return c ? { name : c.name, period, pct : c.pct.map(Number) } : null;
}

// Merge [start, end] ms intervals
function mergeIntervals(list) {
    const arr = list.filter(x => x[1] > x[0]).sort((a, b) => a[0] - b[0]);
    const out = [];
    for (const iv of arr) {
        const last = out[out.length - 1];
        if (last && iv[0] <= last[1]) last[1] = Math.max(last[1], iv[1]);
        else out.push([iv[0], iv[1]]);
    }
    return out;
}

/**
 * Simulate one unit.
 * @param {object} unit
 *   lines     [{ id, name, manpower, eff, hours }]  (board order)
 *   calendar  { days : { 0..6 : { start : minutes-from-midnight, hours } },
 *               overrides : { 'YYYY-MM-DD' : hours }, lineOverrides : { lineId : { 'YYYY-MM-DD' : hours } } }
 *   busy      [{ lineId, start, end, productType, style }]  saved bars (any date type)
 *   profiles  { lineName : { productType : eff, _Default : eff } }
 *   curve     { period, pct : [..] } | null
 *   orders    [{ key, qty, smv, pcd, ship, productType, buyer, style }]
 * @param {Date|string} today
 * @returns { orders : [{ key, qty, planQty, placed, left, late, past, days : { ymd : qty }, lines : [{ id, name, qty }], start, end }] }
 */
export function simulateUnit(unit, today) {
    const t0 = toDay(today) || toDay(new Date());
    const cal = unit.calendar || { days : {}, overrides : {}, lineOverrides : {} };
    const calDays = cal.days || {};
    const overrides = cal.overrides || {};
    const lineOverrides = cal.lineOverrides || {};
    const profiles = unit.profiles || {};
    const curve = unit.curve && Array.isArray(unit.curve.pct) && unit.curve.pct.length ? unit.curve : null;

    const lines = (unit.lines || []).map((l, i) => ({
        id : l.id, name : l.name, idx : i,
        manpower : Number(l.manpower) > 0 ? Number(l.manpower) : 50,
        eff      : Number(l.eff) > 0 ? Number(l.eff) : 50,
        hours    : Number(l.hours) > 0 ? Number(l.hours) : 0,
        busy : [], runKey : null, lastEnd : 0, days : new Map(), effs : new Map()
    }));
    const lineById = new Map(lines.map(l => [String(l.id), l]));

    // Saved bars → busy intervals + the run (product|style) each line ends with
    for (const b of unit.busy || []) {
        const L = lineById.get(String(b.lineId));
        if (!L) continue;
        const s = new Date(b.start), e = new Date(b.end);
        if (Number.isNaN(+s) || Number.isNaN(+e) || e <= s) continue;
        L.busy.push([s.getTime(), e.getTime()]);
        if (e.getTime() > L.lastEnd) { L.lastEnd = e.getTime(); L.runKey = runKeyOf(b.productType, b.style); }
    }
    for (const L of lines) L.busy = mergeIntervals(L.busy);

    // One line's day: minutes the line works that date and the part of them
    // no saved bar covers (mutable — placements consume it)
    function dayOf(L, d) {
        const key = ymdOf(d);
        let info = L.days.get(key);
        if (info) return info;
        const cfg = calDays[d.getDay()] || { start : 480, hours : 0 };
        const lo = lineOverrides[L.id]?.[key] ?? lineOverrides[String(L.id)]?.[key];
        const uo = overrides[key];
        let hours;
        if (lo != null && lo !== '') hours = Number(lo) || 0;
        else if (uo != null && uo !== '') hours = Number(uo) || 0;
        else hours = Number(cfg.hours) > 0 ? (L.hours > 0 ? L.hours : Number(cfg.hours)) : 0;
        const minutes = Math.max(0, hours) * 60;
        let busyMs = 0;
        if (minutes > 0 && L.busy.length) {
            const ws = d.getTime() + (Number(cfg.start) || 480) * 60000, we = ws + minutes * 60000;
            for (const [s, e] of L.busy) {
                if (e <= ws) continue;
                if (s >= we) break;
                busyMs += Math.min(e, we) - Math.max(s, ws);
            }
        }
        info = { minutes, freeMin : Math.max(0, minutes - busyMs / 60000), off : minutes <= 0 };
        L.days.set(key, info);
        return info;
    }
    function effFor(L, o) {
        const k = `${o.productType || ''}|${o.buyer || ''}`;
        let v = L.effs.get(k);
        if (v == null) {
            v = buyerDefaultEff(o.buyer) ?? profileEfficiency(profiles[L.name], o.productType, L.eff);
            if (!(v > 0)) v = L.eff;
            L.effs.set(k, v);
        }
        return v;
    }
    // Dry run of `rem` plan pieces of order o on line L between wStart and
    // wEnd: the days it would produce on, the pieces fitted, the finish day
    function trial(L, o, rem0, wStart, wEnd) {
        const eff = effFor(L, o);
        const ramp = curve && L.runKey != null && L.runKey !== o.runKey;
        const rate = L.manpower * eff / 100 / o.smv;        // pieces per free minute at 100 % curve
        const days = [];
        let rem = rem0, k = 0, started = false, finish = null;
        for (let d = new Date(wStart), g = 0; d <= wEnd && g < MAX_WIN; d = addDays(d, 1), g++) {
            const info = dayOf(L, d);
            if (info.off) continue;
            const factor = ramp && k < curve.pct.length ? curve.pct[k] / 100 : 1;
            const cap = Math.floor(info.freeMin * rate * factor);
            if (cap > 0) {
                const q = Math.min(cap, rem);
                days.push({ d : new Date(d), q, min : q / (rate * factor) });
                rem -= q;
                started = true;
                if (rem <= 0) { finish = new Date(d); break; }
            }
            if (started) k++;
        }
        return { L, eff, ramp, days, fitted : rem0 - rem, finish };
    }

    const orders = (unit.orders || []).map(o => {
        const qty = Number(o.qty) || 0, smv = Number(o.smv) || 0;
        const pcd = toDay(o.pcd), ship = toDay(o.ship);
        return { ...o, qty, smv, pcd, ship, planQty : planQtyOf(qty), runKey : runKeyOf(o.productType, o.style) };
    }).filter(o => o.qty > 0);
    // the board's auto-plan order: PCD first, then delivery, product, key
    orders.sort((a, b) => ((a.pcd || a.ship || 0) - (b.pcd || b.ship || 0))
        || ((a.ship || 0) - (b.ship || 0))
        || String(a.productType || '').localeCompare(String(b.productType || ''))
        || String(a.key).localeCompare(String(b.key)));

    const out = [];
    for (const o of orders) {
        const res = { key : o.key, qty : o.qty, planQty : o.planQty, placed : 0, left : o.qty, late : false, past : false,
            noSmv : !(o.smv > 0), noDates : !o.ship || !o.pcd, days : {}, lines : [], start : null, end : null };
        out.push(res);
        if (res.noSmv || res.noDates) continue;
        let wStart = addDays(o.pcd, -SEW_START_BEFORE_PCD);
        let wEnd   = addDays(o.ship, -SEW_END_BEFORE_SHIP);
        if (wStart < t0) wStart = new Date(t0);
        if (wEnd < wStart) {
            // window closed: plan late, up to the delivery day itself
            res.late = true;
            wEnd = new Date(o.ship);
            if (wEnd < wStart) { res.past = true; continue; }
        }
        let rem = o.planQty;
        const used = new Set();
        const planDays = new Map();   // ymd → plan pieces
        while (rem > 0) {
            let best = null;
            for (const L of lines) {
                if (used.has(L.id)) continue;
                const t = trial(L, o, rem, wStart, wEnd);
                if (!t.fitted) continue;
                if (!best) { best = t; continue; }
                const bDone = best.fitted >= rem, tDone = t.fitted >= rem;
                if (tDone !== bDone) { if (tDone) best = t; continue; }
                if (tDone) {   // both finish: earliest finish, then no ramp, then line order
                    if (t.finish < best.finish || (+t.finish === +best.finish && (best.ramp && !t.ramp))) best = t;
                    continue;
                }
                if (t.fitted > best.fitted || (t.fitted === best.fitted && best.ramp && !t.ramp)) best = t;
            }
            if (!best) break;
            // commit: consume the free minutes, the line now runs this order
            const L = best.L;
            let lineQty = 0;
            for (const x of best.days) {
                const info = dayOf(L, x.d);
                info.freeMin = Math.max(0, info.freeMin - x.min);
                const key = ymdOf(x.d);
                planDays.set(key, (planDays.get(key) || 0) + x.q);
                lineQty += x.q;
            }
            L.runKey = o.runKey;
            used.add(L.id);
            res.lines.push({ id : L.id, name : L.name, planQty : lineQty, eff : best.eff, ramp : best.ramp });
            rem -= best.fitted;
        }
        // plan pieces → order pieces (the +3 % comes off again): whole numbers
        // by cumulative rounding, so the days add up to round(total × scale)
        const scale = o.qty / o.planQty;
        const keys = [...planDays.keys()].sort();
        let placed = 0, cum = 0;
        for (const k of keys) {
            cum += planDays.get(k);
            const q = Math.min(o.qty, Math.round(cum * scale)) - placed;
            if (q > 0) { res.days[k] = q; placed += q; }
        }
        for (const l of res.lines) l.qty = Math.round(l.planQty * scale);
        res.placed = placed;
        res.left   = o.qty - placed;
        res.start  = keys[0] || null;
        res.end    = keys[keys.length - 1] || null;
    }
    return { orders : out };
}

export function simulateAllocation({ today = new Date(), units = [] } = {}) {
    const orders = [];
    const summary = [];
    for (const u of units) {
        const r = simulateUnit(u, today);
        for (const o of r.orders) orders.push({ ...o, unit : u.unitId });
        summary.push({ unitId : u.unitId, lines : (u.lines || []).length, orders : r.orders.length, curve : u.curve?.name || null });
    }
    return { today : ymdOf(toDay(today) || new Date()), orders, units : summary };
}
