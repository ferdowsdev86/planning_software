// Confirmed-order grouping + delivery-feasibility service.
// Pure functions only — no DB access — so grouping is idempotent and unit-testable.

// Default working calendar mirrors src/planningData.js: Friday off, 10h/day.
export const DEFAULT_CALENDAR = {
    dailyMinutes : 600,
    offDays      : new Set([5]),   // JS getDay(): 5 = Friday
    holidays     : new Set()       // 'YYYY-MM-DD' strings
};

const DAY_MS = 86400000;

function toDate(v) {
    if (!v) return null;
    const d = v instanceof Date ? new Date(v) : new Date(String(v).slice(0, 10) + 'T00:00:00');
    return isNaN(d) ? null : d;
}

function isoDay(d) {
    const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
}
export { isoDay };

export function isWorkday(date, calendar = DEFAULT_CALENDAR) {
    if (calendar.offDays.has(date.getDay())) return false;
    if (calendar.holidays.has(isoDay(date))) return false;
    return true;
}

// Walk forward from startDate consuming `workDays` working days (fractional ok).
// Returns the completion date (the day work finishes).
export function addWorkingDays(startDate, workDays, calendar = DEFAULT_CALENDAR) {
    let d = new Date(startDate);
    let remaining = workDays;
    // move to first workday
    while (!isWorkday(d, calendar)) d = new Date(d.getTime() + DAY_MS);
    while (remaining > 1) {
        d = new Date(d.getTime() + DAY_MS);
        if (isWorkday(d, calendar)) remaining -= 1;
    }
    return d;
}

// Efficiency stored as 58 or 0.58 — normalise to fraction.
export function normaliseEfficiency(eff) {
    const n = Number(eff);
    if (!isFinite(n) || n <= 0) return null;
    return n > 1 ? n / 100 : n;
}

// Core capacity simulation. Uses the same duration concept as planningData.js:
//   workingDays = (qty × smv) / (manpower × dailyMinutes × efficiency)
export function simulateCompletion({ qty, smv, manpower, efficiency, startDate, calendar = DEFAULT_CALENDAR }) {
    const q   = Number(qty);
    const s   = Number(smv);
    const mp  = Number(manpower);
    const eff = normaliseEfficiency(efficiency);
    const start = toDate(startDate);

    const missing = [];
    if (!(q > 0))  missing.push('quantity');
    if (!(s > 0))  missing.push('SMV');
    if (!(mp > 0)) missing.push('manpower');
    if (!eff)      missing.push('efficiency');
    if (!start)    missing.push('start date');
    if (missing.length) return { ok : false, error : `Missing/invalid planning data: ${missing.join(', ')}` };

    const requiredMinutes = q * s;
    const availablePerDay = mp * calendar.dailyMinutes * eff;
    const requiredDays    = requiredMinutes / availablePerDay;
    const completeDate    = addWorkingDays(start, requiredDays, calendar);
    return { ok : true, requiredMinutes, requiredDays, startDate : start, completeDate };
}

// ---------------------------------------------------------------------------
// Grouping + conditional split
// ---------------------------------------------------------------------------
// pos: [{ po_number, qty, remaining_qty, delivery, planned, cancelled }]
// line: { name, manpower, efficiency, availableFrom } | null
// Returns array of group objects (1 group when feasible, >1 when split).
export function groupAndSplit({ orderCode, color, pos, smv, line, calendar = DEFAULT_CALENDAR }) {
    // sanitise: drop cancelled, zero/negative qty, dedupe by po_number
    const seen = new Set();
    const notes = [];
    const valid = [];
    for (const p of pos) {
        // ERP reuses one PO number across several rows (sizes/re-releases) —
        // dedupe by row id when the caller provides it, po_number otherwise
        const key = p.id != null ? `id:${p.id}` : `po:${p.po_number}`;
        if (seen.has(key)) { notes.push(`duplicate PO ${p.po_number} ignored`); continue; }
        seen.add(key);
        if (p.cancelled) { notes.push(`cancelled PO ${p.po_number} excluded`); continue; }
        if (!(Number(p.qty) > 0)) { notes.push(`PO ${p.po_number} has zero/negative quantity`); continue; }
        valid.push(p);
    }
    if (!valid.length) return [];

    valid.sort((a, b) => {
        const da = toDate(a.delivery), db = toDate(b.delivery);
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return da - db;
    });

    const groupKey = `${orderCode}::${color || 'NO-COLOR'}`;

    const mkGroup = (members, status, splitReason, feas) => ({
        // split suffix uses the member row id when available — po_number alone
        // is NOT unique (ERP reuses one PO number across rows)
        group_key        : groupKey + (status === 'split' ? `::${members[0].id ?? members[0].po_number}` : ''),
        parent_order_id  : orderCode,
        color            : color || null,
        pos              : members,
        group_quantity   : members.reduce((s, p) => s + Number(p.qty), 0),
        earliest_delivery: members.reduce((min, p) => {
            const d = toDate(p.delivery);
            return d && (!min || d < min) ? d : min;
        }, null),
        grouping_status  : status,
        split_reason     : splitReason || null,
        planned_start_at : feas?.ok ? feas.startDate    : null,
        planned_complete_at : feas?.ok ? feas.completeDate : null,
        validation_notes : notes.length ? notes.join('; ') : null
    });

    // No line selected/proposed → provisional single group per colour, no split simulation
    if (!line) {
        return [mkGroup(valid, 'provisional', null, null)];
    }

    // Feasibility inputs missing → pending, never a silent wrong group
    const probe = simulateCompletion({
        qty : 1, smv, manpower : line.manpower, efficiency : line.efficiency,
        startDate : line.availableFrom, calendar
    });
    if (!probe.ok) {
        const g = mkGroup(valid, 'provisional', null, null);
        g.validation_notes = [g.validation_notes, probe.error].filter(Boolean).join('; ');
        return [g];
    }

    // Greedy accumulation in delivery-date order; a member is only kept if the
    // combined completion still meets the earliest delivery among members.
    const groups = [];
    let cursor = toDate(line.availableFrom);
    let current = [];

    const simulate = (members, start) => simulateCompletion({
        qty : members.reduce((s, p) => s + Number(p.remaining_qty ?? p.qty), 0),
        smv, manpower : line.manpower, efficiency : line.efficiency,
        startDate : start, calendar
    });

    const flush = (wasSplit) => {
        if (!current.length) return;
        const feas = simulate(current, cursor);
        const earliest = current.reduce((min, p) => {
            const d = toDate(p.delivery);
            return d && (!min || d < min) ? d : min;
        }, null);
        const late = feas.ok && earliest && feas.completeDate > earliest;
        const g = mkGroup(
            current,
            wasSplit ? 'split' : 'grouped',
            wasSplit
                ? 'Same-colour POs were separated because the combined sewing completion date exceeded the earliest PO delivery date.'
                : null,
            feas
        );
        g.infeasible = !!late;
        groups.push(g);
        if (feas.ok) cursor = new Date(feas.completeDate.getTime() + DAY_MS); // next subgroup starts after
        current = [];
    };

    let didSplit = false;
    for (const p of valid) {
        const tentative = [...current, p];
        const feas = simulate(tentative, cursor);
        const earliest = tentative.reduce((min, x) => {
            const d = toDate(x.delivery);
            return d && (!min || d < min) ? d : min;
        }, null);
        const misses = feas.ok && earliest && feas.completeDate > earliest;
        if (misses && current.length) {
            didSplit = true;
            flush(true);
            current = [p];
        } else {
            current = tentative;
        }
    }
    flush(didSplit);

    // if never split, single group keeps status 'grouped'
    if (groups.length === 1 && groups[0].grouping_status === 'split') {
        groups[0].grouping_status = 'grouped';
        groups[0].split_reason = null;
        groups[0].group_key = groupKey;
    }
    return groups;
}

// Delivery status classification for UI
export function deliveryStatus(group) {
    if (group.grouping_status === 'provisional' || !group.planned_complete_at) return 'Pending Line Selection';
    if (!group.earliest_delivery) return 'Pending Line Selection';
    const slackMs = group.earliest_delivery - group.planned_complete_at;
    if (slackMs < 0) return 'Late';
    if (slackMs < 3 * DAY_MS) return 'At Risk';
    return 'On Time';
}
