// --------------------------------------------------------------------------
// Bar history (tooltip → Notes tab): everything that happened to a bar, in
// the order it happened — FastReact's Notes window for a strip.
//
// Sources (all existing data, nothing new is stored):
//   planning_orders            the PO rows behind the bar: received from the
//                              ERP (created_at) with customer / style /
//                              product / quantity / SMV / dates
//   planning_change_logs       every save of the bar since 2026-07-25: add /
//                              update / remove / pull-forward / strip-eff /
//                              link … — the changes are worked out here by
//                              comparing each saved state with the one before
//   day_production_update_plan production entered on the board, per day
//   daily_productions (ERP)    actual sewing output to date
//   planning_strip_notes       the planners' own notes
// --------------------------------------------------------------------------

const pad = n => String(n).padStart(2, '0');
const BOARD_TZ = 'Asia/Dhaka';

// 'YYYY-MM-DD HH:MM[:SS]' (board time) or an ISO instant → { d : 'dd/mm/yy', t : 'HH:MM', ms }
export function boardStamp(v) {
    if (v == null || v === '') return null;
    const s = String(v);
    let y, m, d, hh = 0, mm = 0;
    if (/T.*(Z|[+-]\d\d:?\d\d)$/.test(s)) {
        const x = new Date(s);
        if (Number.isNaN(+x)) return null;
        const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone : BOARD_TZ, year : 'numeric', month : '2-digit', day : '2-digit', hour : '2-digit', minute : '2-digit', hour12 : false })
            .formatToParts(x).map(q => [q.type, q.value]));
        y = +p.year; m = +p.month; d = +p.day; hh = +p.hour % 24; mm = +p.minute;
    }
    else {
        const q = /^(\d{4})-(\d\d)-(\d\d)(?:[ T](\d\d):(\d\d))?/.exec(s);
        if (!q) return null;
        y = +q[1]; m = +q[2]; d = +q[3]; hh = +(q[4] || 0); mm = +(q[5] || 0);
    }
    return { d : `${pad(d)}/${pad(m)}/${String(y).slice(2)}`, t : `${pad(hh)}:${pad(mm)}`, ms : Date.UTC(y, m - 1, d, hh, mm), iso : `${y}-${pad(m)}-${pad(d)} ${pad(hh)}:${pad(mm)}` };
}
const dt = v => { const s = boardStamp(v); return s ? `${s.d} ${s.t}` : '—'; };
const day = v => { const s = boardStamp(v); return s ? s.d : '—'; };
const qty = n => Number(n || 0).toLocaleString('en-US');
const parse = v => { if (!v) return null; if (typeof v === 'object') return v; try { return JSON.parse(v); } catch { return null; } };

// a start / end shift smaller than this is the board re-fitting the bar to
// its production schedule (minutes) — not a planning change
export const SHIFT_MIN_MS = 30 * 60000;

// logs → history rows. One log = one saved state of the bar; the text says
// what differs from the state saved before it. A save that changed nothing
// worth telling (a whole-board save, a re-fit of a few minutes) gives no row.
//   logs     planning_change_logs rows of ONE event, oldest first
//   lineName resource id → line name
export function historyFromLogs(logs, lineName = () => null) {
    const rows = [];
    let st = null;      // last known state { line, start, end, qty, hold, status, live }
    const ln = id => (id == null ? null : (lineName(id) || `line ${id}`));
    for (const log of logs || []) {
        const nd = parse(log.new_data) || {};
        const od = parse(log.old_data) || {};
        const by = nd._by || nd.user || null;
        const at = log.changed_at;
        const act = String(log.action_type || '');
        const push = (text, kind = 'plan') => rows.push({ at, by, text, kind });
        if (act === 'remove') {
            const why = String(log.reason || '').trim();
            const where = st?.line != null ? ` from ${ln(st.line)}` : (od.line ? ` from ${od.line}` : '');
            push(`Bar removed${where}${why ? ` — ${why}` : ''}`, 'remove');
            if (st) st.live = false; else st = { live : false };
            continue;
        }
        if (act === 'pull-forward') {
            push(`Plan pull forward${nd.line ? ` on ${nd.line}` : ''}: start ${dt(nd.oldStart)} → ${dt(nd.newStart)}`);
            if (st) { st.start = boardStamp(nd.newStart)?.iso || st.start; st.end = boardStamp(nd.newEnd)?.iso || st.end; }
            continue;
        }
        if (act === 'strip-eff') { push(`Strip efficiency ${nd.from ?? '—'}% → ${nd.to ?? '—'}%`); continue; }
        if (act === 'link' || act === 'link-sync' || act === 'link-test') {
            push(`Build up curve ${act === 'link' ? 'linked' : 'synced'}${nd.curve ? ` (${nd.curve})` : ''}${nd.refOrder ? ` with ${nd.refOrder}` : ''}${nd.mode ? ` — ${nd.mode}` : ''}`);
            continue;
        }
        if (act === 'unlink') { push('Build up curve link removed'); continue; }
        if (nd.startDate == null && nd.endDate == null && nd.plannedQuantity == null && nd.resourceId == null) continue;   // nothing about the bar
        const cur = {
            line : nd.onHold ? null : (nd.resourceId ?? st?.line ?? null), hold : !!nd.onHold,
            start : nd.startDate ?? st?.start ?? null, end : nd.endDate ?? st?.end ?? null,
            qty : nd.plannedQuantity != null ? Number(nd.plannedQuantity) : (st?.qty ?? null),
            status : nd.status ?? st?.status ?? null, live : true
        };
        const where = cur.hold ? 'the Holding Row' : (ln(cur.line) || 'the board');
        if (!st || st.live === false) {
            // the first state we know of — unless the log says it only CHANGED an older bar
            if (!st && act === 'update' && (od.start_date || od.end_date)) {
                st = { line : cur.line, hold : cur.hold, start : od.start_date, end : od.end_date, qty : cur.qty, status : cur.status, live : true };
            }
            else {
                push(`${st ? 'Planned again' : 'Bar created'} on ${where}: ${dt(cur.start)} → ${dt(cur.end)} · qty ${qty(cur.qty)}`, 'create');
                st = cur;
                continue;
            }
        }
        const parts = [];
        if (cur.hold !== st.hold) parts.push(cur.hold ? `Parked on the Holding Row${st.line != null ? ` (from ${ln(st.line)})` : ''}` : `Placed on ${where} from the Holding Row`);
        else if (!cur.hold && cur.line != null && st.line != null && String(cur.line) !== String(st.line)) parts.push(`Moved ${ln(st.line)} → ${ln(cur.line)}`);
        const s0 = boardStamp(st.start), s1 = boardStamp(cur.start), e0 = boardStamp(st.end), e1 = boardStamp(cur.end);
        const sMoved = s0 && s1 && Math.abs(s1.ms - s0.ms) >= SHIFT_MIN_MS;
        const eMoved = e0 && e1 && Math.abs(e1.ms - e0.ms) >= SHIFT_MIN_MS;
        if (sMoved) parts.push(`Start ${dt(st.start)} → ${dt(cur.start)}`);
        if (eMoved) parts.push(`End ${dt(st.end)} → ${dt(cur.end)}`);
        if (cur.qty != null && st.qty != null && Math.abs(cur.qty - st.qty) >= 1) parts.push(`Qty ${qty(st.qty)} → ${qty(cur.qty)}`);
        if (cur.status && st.status && cur.status !== st.status && (cur.status === 'completed' || st.status === 'completed')) parts.push(`Status ${st.status} → ${cur.status}`);
        if (parts.length) push(parts.join(' · '));
        st = cur;
    }
    return rows;
}

// Everything about one bar, oldest first.
//   event      planning_events row (id, event_code, created_at, …)
//   orders     its PO rows (planning_orders): [{ po_number, order_code, buyer_name,
//              style_no, product_category, color, order_quantity, smv, pcd,
//              shipment_date, created_at }]
//   production [{ save_date, qty, line, created_at }]  (board production per day)
//   notes      [{ note, created_by, created_at }]
//   sewn       { qty, of } actual sewing output (ERP) to date, or null
export function buildBarHistory({ event, orders = [], logs = [], lineName, production = [], notes = [], sewn = null, now = null }) {
    const rows = [];
    // --- the PO rows as they came from the ERP (FastReact: "created via import")
    const byDay = new Map();
    for (const o of orders) {
        const k = String(o.created_at || '').slice(0, 16);
        if (!byDay.has(k)) byDay.set(k, []);
        byDay.get(k).push(o);
    }
    for (const [, list] of byDay) {
        const o = list[0];
        const at = o.created_at;
        const total = list.reduce((a, x) => a + (Number(x.order_quantity) || 0), 0);
        const pos = [...new Set(list.map(x => x.po_number).filter(Boolean))];
        rows.push({ at, by : 'ERP', kind : 'import', text : pos.length
            ? `${pos.length > 1 ? `${pos.length} POs` : 'PO'} ${pos.slice(0, 4).join(', ')}${pos.length > 4 ? ' …' : ''} of order ${o.order_code || '—'} received from the ERP`
            : `Order ${o.order_code || '—'} received from the ERP (projection)` });
        if (o.buyer_name) rows.push({ at, by : 'ERP', kind : 'import', text : `Customer has been set to "${o.buyer_name}"` });
        if (o.product_category) rows.push({ at, by : 'ERP', kind : 'import', text : `Product type has been set to ${o.product_category}` });
        if (o.style_no || o.color) rows.push({ at, by : 'ERP', kind : 'import', text : `Style ${o.style_no || '—'}${o.color ? ` · colour ${o.color}` : ''}` });
        rows.push({ at, by : 'ERP', kind : 'import', text : `Order qty ${qty(total)}${Number(o.smv) > 0 ? ` · Sew work content (SMV) ${Number(o.smv).toFixed(3)}` : ''}` });
        if (o.pcd || o.shipment_date) rows.push({ at, by : 'ERP', kind : 'import', text : `PCD ${day(o.pcd)} · delivery ${day(o.shipment_date)}` });
    }
    // --- the saves of the bar
    const fromLogs = historyFromLogs(logs, lineName);
    // a bar older than the log (or saved by a path that does not log): its creation is still a fact
    // (a log that begins with a removal / "Planned again" does not tell it either)
    if (event?.created_at && !fromLogs.some(r => r.kind === 'create' && r.text.startsWith('Bar created'))) {
        rows.push({ at : event.created_at, by : null, kind : 'create', text : `Bar created on the board${event.event_code ? ` (${event.event_code})` : ''}` });
    }
    rows.push(...fromLogs);
    // --- production entered on the board, one row per day
    const prodByDay = new Map();
    for (const p of production) {
        const k = String(p.save_date || '').slice(0, 10);
        const g = prodByDay.get(k) || { qty : 0, line : p.line || null, at : p.created_at || `${k} 00:00:00` };
        g.qty += Number(p.qty) || 0;
        prodByDay.set(k, g);
    }
    for (const [k, g] of prodByDay) {
        if (g.qty > 0) rows.push({ at : `${k} 23:59:00`, by : null, kind : 'prod', text : `Production ${day(k)}: ${qty(g.qty)} pcs${g.line ? ` on ${g.line}` : ''}` });
    }
    // --- the planners' notes
    for (const n of notes) rows.push({ at : n.created_at, by : n.created_by || null, kind : 'note', text : String(n.note || '') });
    // --- where sewing stands today (ERP)
    if (sewn && Number(sewn.qty) > 0 && now) {
        rows.push({ at : now, by : 'ERP', kind : 'erp', text : `Actual sewing output to date: ${qty(sewn.qty)} of ${qty(sewn.of)} pcs — remaining ${qty(Math.max(0, sewn.of - sewn.qty))}` });
    }
    // oldest first; rows of one moment keep the order they were built in
    return rows
        .map((r, i) => ({ ...r, _i : i, _ms : boardStamp(r.at)?.ms ?? 0 }))
        .sort((a, b) => (a._ms - b._ms) || (a._i - b._i))
        .map(({ _i, _ms, ...r }) => ({ ...r, date : boardStamp(r.at)?.iso || null }));
}
