// ---------------------------------------------------------------------------
// MBM ERP Production Planning - demo dataset & calculations
// Implements document sections 3 (screens), 5 (calculations), 12 (risk)
// ---------------------------------------------------------------------------

export const WORK_MIN_PER_DAY = 600; // 10 working hours
export const WORK_SNAP_MIN = 15;

// Working days = (Quantity × SMV) ÷ (Manpower × Daily minutes × Efficiency)
// Fractional — leftover pcs only occupy that many minutes, not a full day.
export function formulaWorkingDays(qty, smv, manpower, efficiencyPct, dailyMinutes = WORK_MIN_PER_DAY) {
    const reqMin = Math.max(0, Number(qty) || 0) * Math.max(0.1, Number(smv) || 0);
    const mins   = Number(dailyMinutes) > 0 ? Number(dailyMinutes) : WORK_MIN_PER_DAY;
    const avail  = Math.max(1,
        (Number(manpower) || 0) * mins * (Math.max(0.01, Number(efficiencyPct) || 0) / 100)
    );
    const days = reqMin / avail;
    return Math.max(WORK_SNAP_MIN / mins, days);
}

export function snapWorkMinutes(clockMin, dailyMinutes = WORK_MIN_PER_DAY) {
    const mins = Number(dailyMinutes) > 0 ? Number(dailyMinutes) : WORK_MIN_PER_DAY;
    const raw  = Math.max(WORK_SNAP_MIN, Number(clockMin) || 0);
    return Math.ceil(raw / WORK_SNAP_MIN) * WORK_SNAP_MIN;
}

export function applyFormulaToRaw(raw, manpower, efficiencyPct, dailyMinutes = WORK_MIN_PER_DAY) {
    if (!raw) return WORK_SNAP_MIN / WORK_MIN_PER_DAY;
    const qty  = Number(raw.qty ?? raw.orderQty) || 0;
    const smv  = Math.max(0.1, Number(raw.smv) || 0);
    const mins = Number(dailyMinutes) > 0 ? Number(dailyMinutes) : WORK_MIN_PER_DAY;
    raw.smv     = smv;
    raw.reqMin  = Math.round(qty * smv);
    const clock = snapWorkMinutes(formulaWorkingDays(qty, smv, manpower, efficiencyPct, mins) * mins, mins);
    raw.workMin = clock;
    raw.dur     = clock / mins;
    return raw.dur;
}

const AUG = n => new Date(2026, 7, n);
export const PLAN_START = AUG(1);
export const PLAN_END   = AUG(31);

// Timeline window: previous month + 6 months ahead (FastReact-style day scroll)
export const VIEW_START = new Date(2026, 6, 1);  // 1 Jul 2026
export const VIEW_END   = new Date(2027, 1, 1);  // 1 Feb 2027

// Capacity utilisation window (first two weeks of the plan)
const UTIL_FROM = AUG(1);
const UTIL_TO   = AUG(15);

// ---------------------------------------------------------------------------
// Working calendar (FastReact-style, configurable via the Calendars dialog)
// days keyed by JS getDay(): 0=Sunday .. 6=Saturday; hours '00:00' = off day
// ---------------------------------------------------------------------------
export const calendarState = {
    name : 'Sew_MBM',
    days : {
        1 : { start : '08:00', hours : '10:00', ot : '02:00' },
        2 : { start : '08:00', hours : '10:00', ot : '02:00' },
        3 : { start : '08:00', hours : '10:00', ot : '02:00' },
        4 : { start : '08:00', hours : '10:00', ot : '02:00' },
        5 : { start : '08:00', hours : '00:00', ot : '02:00' },
        6 : { start : '08:00', hours : '10:00', ot : '02:00' },
        0 : { start : '08:00', hours : '10:00', ot : '02:00' }
    },
    offDays : new Set([5]),
    // Date-specific working-hour overrides (Change working hours dialog):
    // 'YYYY-MM-DD' -> hours as a number (0 = that date becomes an off day,
    // 11.5 = 11:30). Overrides beat the weekly pattern for that date only.
    overrides : {}
};

export const hmToHours = s => {
    const [h, m] = String(s || '0').split(':').map(Number);
    return (h || 0) + (m || 0) / 60;
};

export const hoursToHm = h => {
    const mins = Math.max(0, Math.round(Number(h || 0) * 60));
    return `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`;
};

export const ymdOf = d =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Effective working hours of a specific DATE: the override when one exists,
// otherwise the weekly pattern
export function dayHoursOf(date) {
    const ov = calendarState.overrides[ymdOf(date)];
    if (ov != null && ov !== '') return Number(ov) || 0;
    return hmToHours(calendarState.days[date.getDay()]?.hours || '0');
}

// Effective day config: an overridden date keeps its weekday start time but
// takes the override hours (overtime folds into the override)
export function dayCfgOf(date) {
    const cfg = calendarState.days[date.getDay()] || {};
    const ov = calendarState.overrides[ymdOf(date)];
    if (ov == null || ov === '') return cfg;
    return { ...cfg, hours : hoursToHm(ov), ot : '00:00' };
}

export const isOffDay = d => dayHoursOf(d) <= 0;

// Ratio of a DATE's effective hours to the line's own base hours. When the
// Change-working-hours dialog overrides a date, that override takes PRIORITY
// over the line's normal hours — the day's available minutes and piece
// capacity scale by this factor (1 on untouched dates).
export function dayCapacityFactor(date, lineBaseHours) {
    const ov = calendarState.overrides[ymdOf(date)];
    if (ov == null || ov === '') return 1;
    const base = Number(lineBaseHours) > 0
        ? Number(lineBaseHours)
        : hmToHours(calendarState.days[date.getDay()]?.hours || '10:00');
    return base > 0 ? (Number(ov) || 0) / base : 1;
}

// Legacy alias - all internal date maths follows the configured calendar
export const isFriday = isOffDay;

export function addWorkDays(start, days) {
    const d = new Date(start);
    let added = 0, guard = 0;
    while (added < days && ++guard < 1000) {
        d.setDate(d.getDate() + 1);
        if (!isOffDay(d)) added++;
    }
    return d;
}

// Elapsed calendar days between two dates, fractional (the engine treats
// day-durations as 24h blocks, so bars store this while raw.dur keeps
// working days; fractional because days end at work-end, e.g. 20:00)
export const elapsedDays = (start, end) => Math.max(1 / 1440, (end - start) / 86400000);

// First working hour of a day per the configured calendar (e.g. 08:00)
export function startOfWorkDay(date) {
    const d   = new Date(date);
    const cfg = calendarState.days[d.getDay()];
    const [h, m] = String(cfg?.start || '08:00').split(':').map(Number);
    d.setHours(h || 8, m || 0, 0, 0);
    return d;
}

// Next day with working hours > 0 (start days snap forward, FastReact rule)
export function nextWorkingDay(date) {
    const d = new Date(date);
    let guard = 0;
    while (isOffDay(d) && ++guard < 14) {
        d.setDate(d.getDate() + 1);
    }
    return d;
}

// End of a day's working window: start + working hours + overtime
// (08:00 + 10:00 + 02:00 -> 20:00; with 03:00 OT -> 21:00)
export function endOfWorkDay(date) {
    const d    = new Date(date);
    const cfg  = dayCfgOf(d);
    const mins = Math.round((hmToHours(cfg.start || '08:00') +
                             hmToHours(cfg.hours || '10:00') +
                             hmToHours(cfg.ot || '00:00')) * 60);
    d.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
    return d;
}

// Paid shift end (10h) — leftover capacity for the next order sits after this
export function workEndOfDay(date) {
    const d   = new Date(date);
    const cfg = dayCfgOf(d);
    const mins = Math.round((hmToHours(cfg.start || '08:00') +
                             hmToHours(cfg.hours || '10:00')) * 60);
    d.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
    return d;
}

function startOfNextWorkDay(date) {
    const n = new Date(date);
    n.setDate(n.getDate() + 1);
    n.setHours(0, 0, 0, 0);
    return startOfWorkDay(nextWorkingDay(n));
}

export function clampIntoWorkWindow(date) {
    const t = new Date(date);
    if (isOffDay(t)) return startOfWorkDay(nextWorkingDay(t));
    const ws = startOfWorkDay(t);
    const we = endOfWorkDay(t);
    if (t < ws) return ws;
    if (t >= we) return startOfNextWorkDay(t);
    return t;
}

export function addWorkingMinutes(start, clockMinutes) {
    let remaining = Math.max(1, Number(clockMinutes) || 0);
    let t = clampIntoWorkWindow(start);
    let guard = 0;
    while (remaining > 0 && guard++ < 4000) {
        const avail = Math.max(0, (workEndOfDay(t) - t) / 60000);
        if (avail <= 0) {
            t = startOfNextWorkDay(t);
            continue;
        }
        if (remaining <= avail) return new Date(t.getTime() + remaining * 60000);
        remaining -= avail;
        t = startOfNextWorkDay(t);
    }
    return t;
}

// Bar end from exact working days (fractional last day = leftover minutes)
export function endOfWork(start, dur) {
    return addWorkingMinutes(start, Math.max(1, Number(dur) * WORK_MIN_PER_DAY));
}

// Next bar starts at this end if the shift still has time; otherwise next day
export function nextStartAfter(end) {
    return clampIntoWorkWindow(end);
}

export function workDaysBetween(a, b) {
    let n = 0;
    const d = new Date(a);
    while (d < b) {
        if (!isFriday(d)) n++;
        d.setDate(d.getDate() + 1);
    }
    return n;
}

export const fmtQty  = n => Number(n).toLocaleString('en-US');

/** Production end is after the delivery / shipment date (calendar day). */
export function isLateVsDelivery(end, ship) {
    if (!end || !ship) return false;
    const e = new Date(end);
    const s = new Date(ship);
    if (Number.isNaN(e.getTime()) || Number.isNaN(s.getTime())) return false;
    e.setHours(0, 0, 0, 0);
    s.setHours(0, 0, 0, 0);
    return e > s;
}
export const fmtDate = d => {
    if (!d) return '';
    const x = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(x.getTime())) return '';
    return `${String(x.getDate()).padStart(2, '0')}-${x.toLocaleString('en-US', { month : 'short' })}`;
};

const MON_RR = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function fmtDateDdMonRr(d) {
    if (!d) return '';
    const x = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(x.getTime())) return '';
    return `${String(x.getDate()).padStart(2, '0')}-${MON_RR[x.getMonth()]}-${String(x.getFullYear()).slice(-2)}`;
}

// ---------------------------------------------------------------------------
// Sewing lines (document 3.1 left panel: unit, floor, capacity, manpower,
// machines, efficiency). Available minutes = manpower x working minutes x eff
// ---------------------------------------------------------------------------
export const LINES = [
    { id : 'l1', name : 'Line 01', unit : 'AQL', floor : 'F1', manpower : 60, machines : 62, eff : 55 },
    { id : 'l2', name : 'Line 02', unit : 'AQL', floor : 'F1', manpower : 55, machines : 58, eff : 50 },
    { id : 'l3', name : 'Line 03', unit : 'AQL', floor : 'F1', manpower : 60, machines : 64, eff : 60 },
    { id : 'l4', name : 'Line 04', unit : 'AQL', floor : 'F1', manpower : 48, machines : 50, eff : 45 },
    { id : 'l5', name : 'Line 05', unit : 'AQL', floor : 'F2', manpower : 70, machines : 72, eff : 58 },
    { id : 'l6', name : 'Line 06', unit : 'AQL', floor : 'F2', manpower : 52, machines : 55, eff : 52 },
    { id : 'l7', name : 'Line 07', unit : 'AQL', floor : 'F2', manpower : 65, machines : 68, eff : 55 },
    { id : 'l8', name : 'Line 08', unit : 'AQL', floor : 'F2', manpower : 45, machines : 47, eff : 48 }
];

for (const l of LINES) {
    l.availMin = Math.round(l.manpower * WORK_MIN_PER_DAY * l.eff / 100);
}

export const TOTAL_AVAIL_MIN = LINES.reduce((a, l) => a + l.availMin, 0);
export const LINE_BY_ID = Object.fromEntries(LINES.map(l => [l.id, l]));

// Other production stages (document 3.5 multi-stage planning)
export const STAGE_RESOURCES = [
    { id : 'cut1',  name : 'Cutting Table 1', unit : 'AQL', floor : 'F0', stageRow : true },
    { id : 'wash1', name : 'Wash Line 1',     unit : 'AQL', floor : 'F0', stageRow : true },
    { id : 'fin1',  name : 'Finishing 1',     unit : 'AQL', floor : 'F3', stageRow : true },
    { id : 'pack1', name : 'Packing 1',       unit : 'AQL', floor : 'F3', stageRow : true }
];

// ---------------------------------------------------------------------------
// Risk score (document 12) - simplified frontend version with reasons
// ---------------------------------------------------------------------------
export function calcRisk({ start, end, ship, matReady, lineUtil, status }) {
    if (status === 'completed') {
        return { score : 0, level : 'completed', label : 'Done ✓', reasons : ['Order completed'] };
    }
    let score = 0;
    const reasons = [];
    if (ship && end) {
        const gap = Math.round((ship - end) / 86400000);
        if (gap < 0) {
            score += 35;
            reasons.push(`Forecast finish is ${-gap} day(s) after the shipment date`);
        }
        else if (gap <= 1) {
            score += 28;
            reasons.push('Forecast completion is only one day before shipment');
        }
        else if (gap <= 3) {
            score += 16;
            reasons.push('Forecast completion is close to the shipment date');
        }
    }
    if (matReady && start && start < matReady) {
        score += 20;
        reasons.push(`Material-ready date (${fmtDate(matReady)}) is after the planned start`);
    }
    if (lineUtil > 110) {
        score += 18;
        reasons.push(`Assigned sewing line is loaded at ${lineUtil}%`);
    }
    else if (lineUtil > 100) {
        score += 10;
        reasons.push(`Assigned sewing line is loaded at ${lineUtil}%`);
    }
    if (!reasons.length) reasons.push('On schedule');

    const level =
        status === 'draft' && score <= 20 ? 'draft'
      : score <= 20 ? 'low'
      : score <= 40 ? 'moderate'
      : score <= 60 ? 'high'
      : 'critical';

    const label = { draft : 'Draft', low : 'On track', moderate : 'Watch', high : 'High ⚠', critical : 'Critical ⚠' }[level];
    return { score, level, label, reasons };
}

// ---------------------------------------------------------------------------
// Planned production orders (document 5: duration from quantity x SMV)
// ---------------------------------------------------------------------------
let oid = 0;

export const addCalDays = (d, n) => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
};

function hashKey(key) {
    let h = 0;
    for (const c of String(key || '')) h = ((h << 5) - h) + c.charCodeAt(0);
    return Math.abs(h);
}

// Stable per-PO SMV in 18..35 so bar lengths do not jump on refresh
export function randSmv(key) {
    return 18 + (hashKey(key) % 18);
}

export const ORDER_COLORS = ['Red', 'Blue', 'Yellow', 'Black'];

export function orderColor(po) {
    return ORDER_COLORS[hashKey(String(po) + ':color') % ORDER_COLORS.length];
}

export function mbmOrderNo(po, orderCode) {
    const code = String(orderCode || '').trim();
    if (code) return code;
    const digits = String(po || '').replace(/\D/g, '') || '0';
    return `MBM-${digits}`;
}

export function orderTypeOf(po, explicit) {
    if (explicit === 'projection' || explicit === 'confirm') return explicit;
    if (po && typeof po === 'object') {
        if (po.orderType === 'projection' || po.orderType === 'confirm') return po.orderType;
        po = po.po;
    }
    return hashKey(String(po) + ':type') % 2 === 0 ? 'projection' : 'confirm';
}

// Same buyer + style + MBM order: the projection and its later confirm.
// Unicode dashes are normalised — ERP strings arrive raw while synced
// planning_orders strings are sanitised, so 'WSCE‐2702' must equal 'WSCE-2702'
export function orderFamilyKey(o) {
    if (!o) return '';
    const norm = s => String(s || '').trim().toLowerCase().replace(/[‐-―−]/g, '-');
    const mbm = norm(o.mbmOrder || o.order_code);
    const style = norm(o.style || o.style_no);
    const buyer = norm(o.buyer || o.buyer_name);
    if (mbm && mbm !== 'mbm-0') return `${buyer}|${style}|${mbm}`;
    return `${buyer}|${style}|${norm(o.po || o.po_number)}`;
}

export function poDeliveryOf(ship) {
    return ship ? new Date(ship) : null;
}

export function orderDeliveryOf(ship) {
    const po = poDeliveryOf(ship);
    return po ? addCalDays(po, 7) : null;
}

// Plan-board bar + tooltip line
// compact: Buyer:projection | Buyer:confirm
// full projection: Buyer : Style : order : order_delivery
// full confirm:    Buyer : Style : PO : color : po_delivery
export function barDisplayLine(raw, compact = false) {
    if (!raw) return '';
    const mbm   = mbmOrderNo(raw.po, raw.mbmOrder);
    const buyer = raw.buyer || '—';
    if (compact) return `${buyer}:${mbm}`;
    const type = orderTypeOf(raw.po, raw.orderType);
    if (type === 'projection') {
        return `${buyer} : ${raw.style || '—'} : ${mbm} : ${fmtDateDdMonRr(orderDeliveryOf(raw.ship))}`;
    }
    const colorStr = raw.color || orderColor(raw.po);
    const poStr = raw.poCount > 1 ? `[${raw.poCount} POs]` : (raw.po || '—');
    return `${buyer} : ${raw.style || '—'} : ${mbm} : ${poStr} : ${colorStr} : ${fmtDateDdMonRr(poDeliveryOf(raw.ship))}`;
}

const PRODUCT_TYPE_BY_PO = {
    'PO-20115' : 'Basic Shirt',
    'PO-33445' : 'Blouse',
    'PO-61001' : '5 Pkt Shorts',
    'PO-10321' : '5 Pocket',
    'PO-10390' : '5 Pocket Long',
    'PO-44120' : '5 Pocket Long',
    'PO-347936': '5 Pkt Pant',
    'PO-88110' : 'Basic Shirt',
    'PO-91002' : '5 Pocket Short',
    'PO-55021' : 'Bottom',
    'PO-20200' : 'Basic Shirt',
    'PO-10555' : '5 Pocket',
    'PO-20300' : 'Basic Shirt',
    'PO-70012' : 'Basic Shirt',
    'PO-88200' : 'Basic Shirt',
    'PO-33500' : 'Blouse',
    'PO-55100' : 'Bottom'
};

const PRODUCT_TYPE_FALLBACK = [
    '5 Pocket', 'Basic Shirt', '5 Pkt Pant', 'Blouse',
    '5 Pkt Shorts', 'Bottom', '5 Pocket Long', '5 Pocket Short'
];

export function productTypeFor(po, existing = '') {
    if (existing) return existing;
    if (PRODUCT_TYPE_BY_PO[po]) return PRODUCT_TYPE_BY_PO[po];
    let h = 0;
    for (const c of String(po || '')) h = ((h << 5) - h) + c.charCodeAt(0);
    return PRODUCT_TYPE_FALLBACK[Math.abs(h) % PRODUCT_TYPE_FALLBACK.length];
}

// Pick the profile product type the same way the bar tooltip does:
// use preferred name only when that type has efficiency > 0, otherwise
// hash the PO among types that actually have a value in the profile.
export function resolveProfileType(po, profileValues, preferred) {
    const values = profileValues || {};
    const typed = Object.entries(values)
        .filter(([name, eff]) => name !== '_Default' && Number(eff) > 0)
        .map(([name]) => name);
    if (preferred) {
        const want = String(preferred).trim().toLowerCase();
        const exact = typed.find(t => t.toLowerCase() === want);
        if (exact) return exact;
        const fuzzy = typed.find(t => want.includes(t.toLowerCase()) || t.toLowerCase().includes(want));
        if (fuzzy) return fuzzy;
    }
    if (!typed.length) return preferred || productTypeFor(po);
    let h = 0;
    for (const c of String(po || '')) h = ((h << 5) - h) + c.charCodeAt(0);
    return typed[Math.abs(h) % typed.length];
}

// Planning rule: line efficiency is the floor. If the product (profile)
// efficiency is lower than or equal to the line's own efficiency, the line
// efficiency applies; only a HIGHER product efficiency overrides it.
// The product type is matched against profile keys the same way the tooltip
// does (exact, then case-insensitive, then fuzzy) so an ERP category like
// "Pant" finds a profile row named "5 Pkt Pant".
export function resolveProfileEfficiency(profileValues, productType, fallback) {
    const lineEff = Number(fallback) || 0;
    let tv = Number(profileValues?.[productType]);
    if (!(tv > 0) && productType && profileValues) {
        const want = String(productType).trim().toLowerCase();
        const typed = Object.keys(profileValues)
            .filter(k => k !== '_Default' && Number(profileValues[k]) > 0);
        const hit = typed.find(k => k.toLowerCase() === want)
            || typed.find(k => want.includes(k.toLowerCase()) || k.toLowerCase().includes(want));
        if (hit) tv = Number(profileValues[hit]);
    }
    const dv = Number(profileValues?._Default);
    const productEff = tv > 0 ? tv : (dv > 0 ? dv : 0);
    return Math.max(productEff, lineEff) || 0;
}

function mkOrder(o) {
    const line   = LINE_BY_ID[o.line];
    const smv    = randSmv(o.po);
    const pcd    = addCalDays(o.ship, -30);
    const reqMin = Math.round(o.qty * smv);
    const dur    = formulaWorkingDays(o.qty, smv, line.manpower, line.eff);
    const start  = startOfWorkDay(AUG(o.startDay));
    const end    = endOfWork(start, dur);
    return {
        id        : `o${++oid}`,
        resourceId : o.line,
        startDate : start,
        endDate   : end,
        duration  : elapsedDays(start, end),
        durationUnit : 'day',
        manuallyScheduled : true,
        name      : `${o.buyer} | ${o.po}`,
        percentDone : o.progress,
        draggable : o.status !== 'completed',
        resizable : o.status !== 'completed',
        raw       : { ...o, smv, pcd, reqMin, dur, start, end, orderQty : o.qty }
    };
}

const ORDER_DEFS = [
    { line : 'l1', startDay : 1,  buyer : 'H&M',     style : 'STY-2210', po : 'PO-20115',  qty : 8000,  productType : 'Basic Shirt',    ship : AUG(20), matReady : AUG(1),  progress : 30,  status : 'planned' },
    { line : 'l2', startDay : 1,  buyer : 'C&A',     style : 'STY-1108', po : 'PO-33445',  qty : 6000,  productType : 'Blouse',         ship : new Date(2026, 8, 1), matReady : AUG(1), progress : 80, status : 'planned' },
    { line : 'l2', startDay : 9,  buyer : 'MANGO',   style : 'STY-5501', po : 'PO-61001',  qty : 7000,  productType : '5 Pkt Shorts',   ship : AUG(25), matReady : AUG(5),  progress : 0,   status : 'draft' },
    { line : 'l3', startDay : 3,  buyer : 'ZARA',    style : 'STY-4410', po : 'PO-10321',  qty : 12000, productType : '5 Pocket',       ship : AUG(18), matReady : AUG(2),  progress : 62,  status : 'confirmed', chain : true },
    { line : 'l4', startDay : 1,  buyer : 'ZARA',    style : 'STY-4415', po : 'PO-10390',  qty : 5000,  productType : '5 Pocket Long',  ship : new Date(2026, 8, 5), matReady : AUG(1), progress : 100, status : 'completed' },
    { line : 'l4', startDay : 12, buyer : 'NEXT',    style : 'STY-3302', po : 'PO-44120',  qty : 4000,  productType : '5 Pocket Long',  ship : AUG(30), matReady : AUG(6),  progress : 0,   status : 'draft' },
    { line : 'l5', startDay : 1,  buyer : 'JCP',     style : '26FAJCP013', po : 'PO-347936', qty : 20480, productType : '5 Pkt Pant',   ship : AUG(25), matReady : AUG(1), progress : 10, status : 'planned' },
    { line : 'l6', startDay : 4,  buyer : 'UNIQLO',  style : 'STY-7702', po : 'PO-88110',  qty : 9000,  productType : 'Basic Shirt',    ship : AUG(14), matReady : AUG(3),  progress : 5,   status : 'planned' },
    { line : 'l6', startDay : 13, buyer : 'BERSHKA', style : 'STY-6604', po : 'PO-91002',  qty : 4000,  productType : '5 Pocket Short', ship : AUG(20), matReady : AUG(4),  progress : 0,   status : 'planned' },
    { line : 'l7', startDay : 3,  buyer : 'WALMART', style : 'STY-8801', po : 'PO-55021',  qty : 25000, productType : 'Bottom',         ship : AUG(22), matReady : AUG(2),  progress : 15,  status : 'planned' },
    { line : 'l8', startDay : 1,  buyer : 'H&M',     style : 'STY-2299', po : 'PO-20200',  qty : 15000, productType : 'Basic Shirt',    ship : AUG(28), matReady : AUG(1),  progress : 8,   status : 'planned' }
];

export const ORDERS = ORDER_DEFS.map(mkOrder);

// ---------------------------------------------------------------------------
// Line utilisation over the window (document 3.3 capacity view)
// ---------------------------------------------------------------------------
export function computeLineUtil(events) {
    const windowDays = workDaysBetween(UTIL_FROM, UTIL_TO);
    const util = {};
    for (const l of LINES) util[l.id] = 0;
    for (const ev of events) {
        const raw = ev.raw ?? ev.data?.raw;
        const rid = ev.resourceId ?? ev.data?.resourceId;
        if (!raw || !util.hasOwnProperty(rid)) continue;
        const start = ev.startDate instanceof Date ? ev.startDate : raw.start;
        const end   = ev.endDate instanceof Date && ev.endDate > start ? ev.endDate : raw.end;
        const oStart = start < UTIL_FROM ? UTIL_FROM : start;
        const oEnd   = end > UTIL_TO ? UTIL_TO : end;
        if (oEnd <= oStart) continue;
        const overlap  = workDaysBetween(oStart, oEnd);
        const dailyReq = raw.reqMin / Math.max(1, raw.dur);
        util[rid] += overlap * dailyReq;
    }
    for (const l of LINES) {
        util[l.id] = Math.round(util[l.id] / (l.availMin * windowDays) * 100);
    }
    return util;
}

// Attach risk meta to planned orders (second pass, needs utilisation)
const initialUtil = computeLineUtil(ORDERS);

for (const ev of ORDERS) {
    const r = ev.raw;
    r.risk = calcRisk({
        start    : r.start,
        end      : r.end,
        ship     : r.ship,
        matReady : r.matReady,
        lineUtil : initialUtil[ev.resourceId],
        status   : r.status
    });
}

// ---------------------------------------------------------------------------
// Multi-stage chain for PO-10321 (document 3.5) - FS dependencies
// ---------------------------------------------------------------------------
const zara = ORDERS.find(e => e.raw.po === 'PO-10321');

const mkStage = (id, resourceId, name, duration, opts = {}) => ({
    id,
    resourceId,
    name,
    duration,
    durationUnit : 'day',
    percentDone  : opts.progress ?? 0,
    raw : {
        buyer : 'ZARA', style : 'STY-4410', po : 'PO-10321',
        productType : '5 Pocket',
        qty : 12000, smv : zara.raw.smv, reqMin : 0, dur : duration,
        pcd : zara.raw.pcd, ship : AUG(18), matReady : AUG(2), progress : opts.progress ?? 0,
        status : 'planned', stage : name.replace('ZARA ', ''),
        risk : { score : 0, level : 'low', label : 'Stage', reasons : ['Linked stage of PO-10321'] }
    },
    ...opts.config
});

export const STAGE_EVENTS = [
    mkStage('st-cut',  'cut1',  'ZARA Cutting',   2, { progress : 100, config : { startDate : startOfWorkDay(AUG(1)), manuallyScheduled : true } }),
    mkStage('st-wash', 'wash1', 'ZARA Wash',      1),
    mkStage('st-fin',  'fin1',  'ZARA Finishing', 1),
    mkStage('st-pack', 'pack1', 'ZARA Packing',   1)
];

export const DEPENDENCIES = [
    { id : 'd1', fromEvent : 'st-cut',  toEvent : zara.id,   type : 2 },
    { id : 'd2', fromEvent : zara.id,   toEvent : 'st-wash', type : 2 },
    { id : 'd3', fromEvent : 'st-wash', toEvent : 'st-fin',  type : 2 },
    { id : 'd4', fromEvent : 'st-fin',  toEvent : 'st-pack', type : 2 }
];

// ---------------------------------------------------------------------------
// Unplanned order panel data (document 3.2)
// ---------------------------------------------------------------------------
export const UNPLANNED_INIT = [
    { id : 'u1', buyer : 'ZARA',    style : 'STY-4501', po : 'PO-10555', qty : 10000, productType : '5 Pocket',    matReady : AUG(5),  ship : AUG(28), priority : 1, suitable : ['l3', 'l5', 'l7'] },
    { id : 'u2', buyer : 'H&M',     style : 'STY-2350', po : 'PO-20300', qty : 12000, productType : 'Basic Shirt', matReady : AUG(3),  ship : new Date(2026, 8, 2),  priority : 2, suitable : ['l1', 'l2', 'l6'] },
    { id : 'u3', buyer : 'GAP',     style : 'STY-9910', po : 'PO-70012', qty : 6000,  productType : 'Basic Shirt', matReady : AUG(8),  ship : new Date(2026, 8, 6),  priority : 3, suitable : ['l2', 'l4', 'l8'] },
    { id : 'u4', buyer : 'UNIQLO',  style : 'STY-7750', po : 'PO-88200', qty : 18000, productType : 'Basic Shirt', matReady : AUG(4),  ship : new Date(2026, 8, 8),  priority : 2, suitable : ['l5', 'l7'] },
    { id : 'u5', buyer : 'C&A',     style : 'STY-1150', po : 'PO-33500', qty : 5000,  productType : 'Blouse',      matReady : AUG(10), ship : new Date(2026, 8, 10), priority : 3, suitable : ['l4', 'l6', 'l8'] },
    { id : 'u6', buyer : 'WALMART', style : 'STY-8850', po : 'PO-55100', qty : 22000, productType : 'Bottom',      matReady : AUG(6),  ship : new Date(2026, 8, 4),  priority : 1, suitable : ['l5', 'l7'] }
].map(o => ({ ...o, smv : randSmv(o.po), pcd : addCalDays(o.ship, -30), orderQty : o.qty }));

// ---------------------------------------------------------------------------
// Day-wise manpower band: one figure per working day under each line's bars
// (bottom 25% of the row, FastReact style)
// ---------------------------------------------------------------------------
export function buildManpowerRanges(lines, from = VIEW_START, to = VIEW_END) {
    const ranges = [];
    let i = 0;
    for (const l of lines) {
        const d = new Date(from);
        while (d < to) {
            if (!isFriday(d)) {
                const end = new Date(d);
                end.setDate(end.getDate() + 1);
                ranges.push({
                    id         : `mp-${++i}`,
                    resourceId : l.id,
                    startDate  : new Date(d),
                    endDate    : end,
                    name       : String(l.manpower),
                    cls        : 'mb-mp'
                });
            }
            d.setDate(d.getDate() + 1);
        }
    }
    return ranges;
}

// Highlighted 8 AM day-start separator lines (one per working day)
export function buildDayStartLines() {
    const lines = [];
    let i = 0;
    const d = new Date(VIEW_START);
    while (d < VIEW_END) {
        if (!isOffDay(d)) {
            lines.push({
                id        : `ds-${++i}`,
                startDate : startOfWorkDay(d),
                cls       : 'mb-daystart'
            });
        }
        d.setDate(d.getDate() + 1);
    }
    return lines;
}

// Off-day columns for the whole plan window (teal crosshatch on the board)
export function buildOffDayRanges() {
    const ranges = [];
    let i = 0, j = 0;
    const d = new Date(VIEW_START);
    while (d < VIEW_END) {
        const end = new Date(d);
        end.setDate(end.getDate() + 1);
        if (isOffDay(d)) {
            ranges.push({
                id        : `off-${++i}`,
                startDate : new Date(d),
                endDate   : end,
                cls       : 'mb-off'
            });
        }
        else if (calendarState.overrides[ymdOf(d)] != null) {
            // Hours changed from the weekly default (FastReact-style):
            // mark the whole day column with the red crosshatch
            ranges.push({
                id        : `chg-${++j}`,
                startDate : new Date(d),
                endDate   : end,
                cls       : 'mb-hours-changed',
                name      : `${hoursToHm(calendarState.overrides[ymdOf(d)])} hrs`
            });
        }
        d.setDate(d.getDate() + 1);
    }
    return ranges;
}
