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
// Grouping: one group per order + colour + delivery date
// ---------------------------------------------------------------------------
// Planner rule (2026-11-14): the POs of one order that share the SAME colour
// and the SAME delivery date are ONE group — always, whatever the line load;
// POs of another delivery date are a group of their own. (Before, the POs of a
// colour were joined across delivery dates and then cut apart again by a
// capacity simulation that started at the END of the line's whole plan — so a
// colour that was already planned fell apart into one row per PO, even its
// POs of one delivery date.)
// pos: [{ id, po_number, qty, remaining_qty, delivery, planned, cancelled }]
// line: { name, manpower, efficiency, availableFrom } | null
// Returns the groups in delivery order. The capacity simulation only dates
// the groups (planned_start_at / planned_complete_at / infeasible) — it never
// decides which POs belong together.
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

    // the delivery-date groups of this colour, earliest first (POs without a
    // delivery date form one group at the end)
    const byDay = new Map();
    for (const p of valid) {
        const d = toDate(p.delivery);
        const k = d ? isoDay(d) : 'no-date';
        if (!byDay.has(k)) byDay.set(k, []);
        byDay.get(k).push(p);
    }
    const dayGroups = [...byDay.values()];

    const mkGroup = (members, status, splitReason, feas) => ({
        // the key carries the delivery date, so it stays the same row when a PO
        // of another date joins the colour
        group_key        : `${groupKey}::${toDate(members[0].delivery) ? isoDay(toDate(members[0].delivery)) : 'no-date'}`,
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

    // No line selected/proposed → provisional groups, no capacity simulation
    if (!line) {
        return dayGroups.map(members => mkGroup(members, 'provisional', null, null));
    }

    // Feasibility inputs missing → pending, never a silently wrong date
    const probe = simulateCompletion({
        qty : 1, smv, manpower : line.manpower, efficiency : line.efficiency,
        startDate : line.availableFrom, calendar
    });
    if (!probe.ok) {
        return dayGroups.map(members => {
            const g = mkGroup(members, 'provisional', null, null);
            g.validation_notes = [g.validation_notes, probe.error].filter(Boolean).join('; ');
            return g;
        });
    }

    // The groups run one after another on the line, earliest delivery first;
    // a group whose completion passes its delivery date is flagged infeasible.
    // Every group is 'grouped' — a colour with several delivery dates is the
    // normal case, not a warning ('split' is no longer produced).
    const groups = [];
    let cursor = toDate(line.availableFrom);
    for (const members of dayGroups) {
        const feas = simulateCompletion({
            qty : members.reduce((s, p) => s + Number(p.remaining_qty ?? p.qty), 0),
            smv, manpower : line.manpower, efficiency : line.efficiency,
            startDate : cursor, calendar
        });
        const delivery = toDate(members[0].delivery);
        const g = mkGroup(members, 'grouped', null, feas);
        g.infeasible = !!(feas.ok && delivery && feas.completeDate > delivery);
        groups.push(g);
        if (feas.ok) cursor = new Date(feas.completeDate.getTime() + DAY_MS);   // the next group starts after
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
