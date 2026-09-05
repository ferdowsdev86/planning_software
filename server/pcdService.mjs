// Effective-PCD resolver — the single source of truth for planning PCD.
// Priority (as established in the existing codebase, see api.js / planningEngine.js):
//   1. Order PCD from ERP (mr_order_entry.pcd / planning_orders.pcd) when valid
//   2. Approved fallback already used everywhere in the app: delivery date − 30 days
//   3. Nothing → effective PCD is missing; the order must NOT be auto-planned
//      with an invented date (it stays visible with a warning instead).
// Pure functions, no DB access.

const MIN_SANE_PCD = '2020-01-01';   // guards corrupt ERP dates like 0001-05-31

function toDate(v) {
    if (!v) return null;
    const d = v instanceof Date ? new Date(v) : new Date(String(v).slice(0, 10) + 'T00:00:00');
    return isNaN(d) ? null : d;
}

export function isoDay(d) {
    if (!d) return null;
    const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
}

// Returns { effective_pcd, pcd_source, pcd_status }
//   pcd_source : 'order_pcd' | 'delivery_minus_30' | null
//   pcd_status : 'valid' | 'fallback' | 'invalid' | 'missing'
export function resolveEffectivePcd(rawPcd, deliveryDate) {
    const pcd = toDate(rawPcd);
    const sane = pcd && isoDay(pcd) >= MIN_SANE_PCD;

    if (sane) {
        return { effective_pcd : isoDay(pcd), pcd_source : 'order_pcd', pcd_status : 'valid' };
    }

    const delivery = toDate(deliveryDate);
    if (delivery && isoDay(delivery) >= MIN_SANE_PCD) {
        const fb = new Date(delivery.getTime() - 30 * 86400000);
        return {
            effective_pcd : isoDay(fb),
            pcd_source    : 'delivery_minus_30',
            pcd_status    : pcd ? 'invalid' : 'fallback'   // 'invalid' = source pcd exists but corrupt
        };
    }

    return { effective_pcd : null, pcd_source : null, pcd_status : 'missing' };
}

// Initial-board eligibility for a projected order.
// eligible_for_initial_board = projected AND not cancelled/closed/deleted.
// PCD validity does NOT affect eligibility — a missing PCD keeps the order
// visible in the Unplanned panel with a warning instead of hiding it.
export function projectedEligibility({ orderStatus, orderType = 'projected' }) {
    if (orderType !== 'projected') {
        return { eligible : false, reason : 'Confirm Order - not included in the initial projection plan.' };
    }
    const st = String(orderStatus || '').toLowerCase();
    if (st === 'closed' || st === 'inactive' || st === 'cancelled') {
        return { eligible : false, reason : `Order status is ${orderStatus} - not eligible for initial planning.` };
    }
    return { eligible : true, reason : null };
}
