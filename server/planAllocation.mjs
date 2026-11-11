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
//                   working days at the unit's Build up curve percentages —
//                   a changeover = the run that ENDS right before the new run
//                   on that line's timeline (saved bar or planned run) is
//                   another product / style; a ramping run that cannot finish
//                   the order must outlive the ramp (curve days + 1), a 1-day
//                   scrap of a changed style is never booked
//   planning order  PCD, then delivery (the board's auto-plan order); an
//                   order takes the line that finishes it earliest inside its
//                   window, spills over to further lines when one cannot hold
//                   it, and what no line can make in the window is `left`
//   late orders     window already closed (delivery − 7 before today) → the
//                   order is planned from today up to its delivery date and
//                   flagged `late`; a delivery already past places nothing.
//                   unit.lateFill (off by default): an open window that is
//                   full may run on into the delivery buffer (pieces after
//                   delivery − 7 are `latePcs`)
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
        busy : [], runs : [], days : new Map(), effs : new Map()
    }));
    const lineById = new Map(lines.map(l => [String(l.id), l]));
    const lateFill = !!unit.lateFill;   // window open but full → may run on into the delivery buffer (late)

    // Saved bars → busy intervals + the runs (product|style, when they end)
    // on the line's timeline — a new run ramps when the run that ENDS right
    // before it on the line is another product / style
    for (const b of unit.busy || []) {
        const L = lineById.get(String(b.lineId));
        if (!L) continue;
        const s = new Date(b.start), e = new Date(b.end);
        if (Number.isNaN(+s) || Number.isNaN(+e) || e <= s) continue;
        L.busy.push([s.getTime(), e.getTime()]);
        L.runs.push({ s : s.getTime(), e : e.getTime(), key : runKeyOf(b.productType, b.style) });
    }
    for (const L of lines) L.busy = mergeIntervals(L.busy);
    // the run the line finished last by the end of day d (null = idle before)
    function prevKeyAt(L, d) {
        const limit = d.getTime() + DAY_MS;
        let best = null;
        for (const r of L.runs) if (r.e <= limit && (!best || r.e > best.e)) best = r;
        return best ? best.key : null;
    }

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
    // wEnd. Like a bar on the board the order runs as ONE CONTIGUOUS RUN of
    // working days (an off day does not break it, a day the line has no free
    // time left does): the earliest run that finishes the order wins, else
    // the run that fits the most. Returns its days, pieces fitted, finish day.
    // A run that ramps but cannot finish the order must at least outlive the
    // ramp (curve days + 1 full-speed day) — a 1-day scrap of a changed style
    // costs more line time in Build up than it makes, no planner books it
    const minRampDays = curve ? curve.pct.length + 1 : 1;
    function trial(L, o, rem0, wStart, wEnd) {
        const eff = effFor(L, o);
        const rate = L.manpower * eff / 100 / o.smv;        // pieces per free line minute at 100 % curve
        let best = null, run = null;
        const close = () => {
            if (run && run.days.length && (run.finish || !run.ramp || run.days.length >= minRampDays)) {
                const cand = { L, eff, ramp : run.ramp, days : run.days, fitted : rem0 - run.rem, finish : run.finish };
                if (!best) best = cand;
                else if (cand.finish && (!best.finish || cand.finish < best.finish)) best = cand;
                else if (!cand.finish && !best.finish && cand.fitted > best.fitted) best = cand;
            }
            run = null;
        };
        for (let d = new Date(wStart), g = 0; d <= wEnd && g < MAX_WIN; d = addDays(d, 1), g++) {
            const info = dayOf(L, d);
            if (info.off) continue;
            if (!run) {
                const prev = prevKeyAt(L, d);
                run = { days : [], rem : rem0, k : 0, finish : null, ramp : !!(curve && prev != null && prev !== o.runKey) };
            }
            const { ramp } = run;
            const factor = ramp && run.k < curve.pct.length ? curve.pct[run.k] / 100 : 1;
            const cap = Math.floor(info.freeMin * rate * factor);
            if (cap <= 0) { close(); continue; }            // a full day ends the run
            const q = Math.min(cap, run.rem);
            // min = line minutes the pieces take; loss = the part of them the
            // Build up ramp costs against full-speed running
            run.days.push({ d : new Date(d), q, min : q / (rate * factor), loss : q / (rate * factor) * (1 - factor) });
            run.rem -= q;
            run.k++;
            if (run.rem <= 0) { run.finish = new Date(d); close(); break; }   // scanning forward: the first finish is the earliest
        }
        close();
        return best || { L, eff, ramp : false, days : [], fitted : 0, finish : null };
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

    // Capacity per calendar month, from the 1st of this month to the last
    // window end: the lines' minutes (× manpower), what is already gone
    // (before today), what the saved bars hold, what is free for new plan —
    // and, after the run, what this plan used. Pieces at the unit's order-mix
    // SMV and the lines' mean efficiency, so the figures compare with Plan Qty
    const capacity = {};
    {
        const horizon = orders.reduce((m, o) => (o.ship && o.ship > m ? o.ship : m), addDays(t0, 30));
        const hEnd = new Date(Math.min(horizon.getTime(), addDays(t0, 240).getTime()));
        const hStart = new Date(t0.getFullYear(), t0.getMonth(), 1);
        for (const L of lines) {
            for (let d = new Date(hStart), g = 0; d <= hEnd && g < MAX_WIN; d = addDays(d, 1), g++) {
                const info = dayOf(L, d);
                if (info.off) continue;
                const ym = ymdOf(d).slice(0, 7);
                const c = capacity[ym] ||= { manMin : 0, pastManMin : 0, busyManMin : 0, freeManMin : 0, usedManMin : 0, curveManMin : 0 };
                c.manMin += info.minutes * L.manpower;
                if (d < t0) { c.pastManMin += info.minutes * L.manpower; continue; }
                c.busyManMin += (info.minutes - info.freeMin) * L.manpower;
                c.freeManMin += info.freeMin * L.manpower;
            }
        }
    }

    const out = [];
    for (const o of orders) {
        const res = { key : o.key, qty : o.qty, planQty : o.planQty, placed : 0, left : o.qty, late : false, latePcs : 0, past : false,
            noSmv : !(o.smv > 0), noDates : !o.ship || !o.pcd, days : {}, lines : [], start : null, end : null };
        out.push(res);
        if (res.noSmv || res.noDates) continue;
        let wStart = addDays(o.pcd, -SEW_START_BEFORE_PCD);
        let wEnd   = addDays(o.ship, -SEW_END_BEFORE_SHIP);
        if (wStart < t0) wStart = new Date(t0);
        let closed = false;
        if (wEnd < wStart) {
            // window closed: plan late, up to the delivery day itself
            closed = true;
            wEnd = new Date(o.ship);
            if (wEnd < wStart) { res.past = true; continue; }
        }
        let rem = o.planQty;
        const used = new Set();
        const planDays = new Map();   // ymd → plan pieces
        // Place `rem` between wS and wE: wholeOnly = only a line that finishes
        // the order (one run, one ramp); else the line that fits the most,
        // again and again (spill-over). Returns true when something was placed
        const fill = (wS, wE, wholeOnly) => {
            let any = false;
            while (rem > 0) {
                let best = null;
                for (const L of lines) {
                    if (used.has(L.id)) continue;
                    const t = trial(L, o, rem, wS, wE);
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
                if (!best || (wholeOnly && best.fitted < rem)) break;
                // commit: consume the free minutes, the run joins the line's timeline
                const L = best.L;
                let lineQty = 0;
                for (const x of best.days) {
                    const info = dayOf(L, x.d);
                    info.freeMin = Math.max(0, info.freeMin - x.min);
                    const key = ymdOf(x.d);
                    planDays.set(key, (planDays.get(key) || 0) + x.q);
                    lineQty += x.q;
                    const c = capacity[key.slice(0, 7)];
                    if (c) c.curveManMin += x.loss * L.manpower;
                }
                const first = best.days[0].d, last = best.days[best.days.length - 1].d;
                L.runs.push({ s : first.getTime(), e : last.getTime() + DAY_MS, key : o.runKey });
                used.add(L.id);
                res.lines.push({ id : L.id, name : L.name, planQty : lineQty, eff : best.eff, ramp : best.ramp });
                rem -= best.fitted;
                any = true;
            }
            return any;
        };
        // 1. one line that finishes the order inside the window
        // 2. (lateFill) one line that finishes it by the delivery day — one
        //    run on into the buffer rather than shreds over many lines
        // 3. spill-over inside the window   4. (lateFill) spill-over up to the delivery
        fill(wStart, wEnd, true);
        if (rem > 0 && lateFill && !closed) fill(wStart, o.ship, true);
        if (rem > 0) fill(wStart, wEnd, false);
        if (rem > 0 && lateFill && !closed) fill(wStart, o.ship, false);
        // plan pieces → order pieces (the +3 % comes off again): whole numbers
        // by cumulative rounding, so the days add up to round(total × scale)
        const scale = o.qty / o.planQty;
        const keys = [...planDays.keys()].sort();
        const lateFrom = closed ? null : ymdOf(addDays(o.ship, -SEW_END_BEFORE_SHIP + 1));
        let placed = 0, cum = 0;
        for (const k of keys) {
            cum += planDays.get(k);
            const q = Math.min(o.qty, Math.round(cum * scale)) - placed;
            if (q > 0) { res.days[k] = q; placed += q; if (lateFrom && k >= lateFrom) res.latePcs += q; }
        }
        for (const l of res.lines) l.qty = Math.round(l.planQty * scale);
        res.placed = placed;
        res.left   = o.qty - placed;
        if (closed) res.latePcs = placed;
        res.late   = closed || res.latePcs > 0;
        res.start  = keys[0] || null;
        res.end    = keys[keys.length - 1] || null;
    }
    // what the plan used per month = free before − free after (from today)
    for (const L of lines) {
        for (const [k, info] of L.days) {
            const c = capacity[k.slice(0, 7)];
            if (!c || k < ymdOf(t0)) continue;
            c.usedManMin += Math.max(0, (info.minutes - info.freeMin) * L.manpower);   // busy now (saved + plan)
        }
    }
    const effMean = lines.length ? lines.reduce((a, l) => a + l.eff, 0) / lines.length / 100 : 0;
    const wQty = orders.filter(o => o.smv > 0).reduce((a, o) => a + o.qty, 0);
    const smvMix = wQty ? orders.filter(o => o.smv > 0).reduce((a, o) => a + o.qty * o.smv, 0) / wQty : 0;
    const pcs = manMin => (smvMix > 0 ? Math.round(manMin * effMean / smvMix / (1 + PLAN_EXTRA)) : 0);
    for (const c of Object.values(capacity)) {
        c.usedManMin = Math.max(0, c.usedManMin - c.busyManMin);   // busy now minus the saved bars = this plan
        c.smv = Math.round(smvMix * 10) / 10;
        c.eff = Math.round(effMean * 100);
        c.pcs = pcs(c.manMin); c.pastPcs = pcs(c.pastManMin); c.busyPcs = pcs(c.busyManMin);
        c.freePcs = pcs(c.freeManMin); c.usedPcs = pcs(c.usedManMin); c.curvePcs = pcs(c.curveManMin);
    }

    const result = { orders : out, capacity };
    // diagnostics only (unit.debug): every line's day minutes and what is
    // still free after the simulation
    if (unit.debug) {
        result.lines = lines.map(L => ({ id : L.id, name : L.name, manpower : L.manpower, eff : L.eff,
            days : [...L.days.entries()].map(([k, v]) => [k, v.minutes, Math.round(v.freeMin)]) }));
    }
    return result;
}

export function simulateAllocation({ today = new Date(), units = [] } = {}) {
    const orders = [];
    const summary = [];
    const capacity = {};
    for (const u of units) {
        const r = simulateUnit(u, today);
        for (const o of r.orders) orders.push({ ...o, unit : u.unitId });
        summary.push({ unitId : u.unitId, lines : (u.lines || []).length, orders : r.orders.length, curve : u.curve?.name || null });
        capacity[u.unitId] = r.capacity;
    }
    return { today : ymdOf(toDay(today) || new Date()), orders, units : summary, capacity };
}
