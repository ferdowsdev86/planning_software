// ---------------------------------------------------------------------------
// MBM Production Planning Engine
// Implements docs/srs-planning.md sections 5, 6, 8.1, 8.2, 9.1, 9.2, 9.3, 10
// Pure functions - no UI imports, testable in plain Node.
// Every number is read from the masters object; no magic numbers in the code.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Masters (SRS section 6). In production these rows come from the database;
// values here are the SRS section 11 fixture used by the acceptance tests.
// ---------------------------------------------------------------------------
export const PLANNING_MASTERS = {
    // 6.5 Process lead time master (working days unless stated)
    preProductionDays    : 5,
    cuttingLeadDays      : 1,
    washDays             : 2,
    finishingBasis       : 'fixed_days',   // 'fixed_days' | 'day_capacity' (open decision #7)
    finishingDays        : 2,
    finishingDayCapacity : 2000,
    dispatchBufferDays   : 1,

    // 9.3 / 10.2 configuration
    minBufferDays          : 5,
    changeoverAllowanceMin : 60,           // open decision #4 - configurable

    // 6.1 defaults
    absenteeismPct : 0,

    // 5. Volume classification (configurable thresholds)
    volumeClasses : [
        { maxQty : 10000, cls : 'Small / Mid', strategy : 'single-line', typicalLine : '45 operators' },
        { maxQty : 80000, cls : 'Big',         strategy : 'multi-line',  typicalLine : '80 operators' }
    ],

    // 6.3 + 6.4 Product category & learning curve master
    productCategories : {
        '5Pkt' : {
            name       : 'Five Pocket Denim Pant',
            smvMin     : 18,
            smvMax     : 22,
            factoryEff : 68,
            learningCurve : {
                new    : [38, 50, 60],   // day 1..3, then steady factoryEff (4-day ramp variant)
                repeat : [55, 68]        // open decision #9 - placeholder
            }
        }
    }
};

// ---------------------------------------------------------------------------
// Date helpers (engine-local, calendar injected as isWorking(date) -> bool)
// ---------------------------------------------------------------------------
const DAY_MS = 86400000;

export const addDays = (d, n) => new Date(d.getTime() + n * DAY_MS);

export function addWorkingDays(start, n, isWorking) {
    // counts start itself as day 1 when it is a working day (SRS 9.1 convention)
    let d = new Date(start);
    let counted = isWorking(d) ? 1 : 0;
    let guard = 0;
    while (counted < n && guard++ < 400) {
        d = addDays(d, 1);
        if (isWorking(d)) counted++;
    }
    return d;
}

export function prevWorkingDay(date, isWorking) {
    let d = addDays(date, -1);
    let guard = 0;
    while (!isWorking(d) && guard++ < 60) d = addDays(d, -1);
    return d;
}

export function backWorkingDays(end, n, isWorking) {
    // end counts as day 1 going backwards
    let d = new Date(end);
    let counted = isWorking(d) ? 1 : 0;
    let guard = 0;
    while (counted < n && guard++ < 400) {
        d = addDays(d, -1);
        if (isWorking(d)) counted++;
    }
    return d;
}

export function workingDaysBetween(a, b, isWorking) {
    // inclusive difference in working days (a <= b); 0 when same day
    if (a.getTime() === b.getTime()) return 0;
    const sign = a < b ? 1 : -1;
    let [from, to] = a < b ? [a, b] : [b, a];
    let n = 0, d = new Date(from), guard = 0;
    while (d < to && guard++ < 800) {
        d = addDays(d, 1);
        if (isWorking(d)) n++;
    }
    return n * sign;
}

// ---------------------------------------------------------------------------
// 5. Volume classification
// ---------------------------------------------------------------------------
export function classifyVolume(totalQty, masters = PLANNING_MASTERS) {
    for (const vc of masters.volumeClasses) {
        if (totalQty <= vc.maxQty) return vc;
    }
    return { cls : 'Above classification', strategy : 'undefined (open decision #5)', typicalLine : '—' };
}

// ---------------------------------------------------------------------------
// 8.1 Daily output of a line
// available_minutes = operators x shift_minutes x (1 - absenteeism/100)
// efficiency = learning curve while ramping, factory efficiency after
// daily_output = floor(available_minutes x eff / SMV)
// ---------------------------------------------------------------------------
export function effectiveEfficiency(category, styleType, dayIndex) {
    const curve = category.learningCurve?.[styleType] || [];
    return dayIndex <= curve.length ? curve[dayIndex - 1] : category.factoryEff;
}

export function availableMinutes(line, masters = PLANNING_MASTERS) {
    const abs = line.absenteeismPct ?? masters.absenteeismPct ?? 0;
    return line.operators * line.shiftMinutes * (1 - abs / 100);
}

export function dailyOutput(line, category, styleType, dayIndex, smv, masters = PLANNING_MASTERS) {
    if (!smv || smv <= 0) throw new Error('V04: IE must supply SMV before this order can be planned');
    const mins = availableMinutes(line, masters);
    const eff  = effectiveEfficiency(category, styleType, dayIndex);
    return Math.floor((mins * (eff / 100)) / smv);
}

// ---------------------------------------------------------------------------
// 8.2 Duration of a plan block. dayIndex continues across colours of the same
// style (the reason colour clubbing has value) and resets on style change.
// ---------------------------------------------------------------------------
export function blockDuration(qty, line, category, styleType, smv, startDate, isWorking, startDayIndex = 1, masters = PLANNING_MASTERS) {
    let remaining = qty;
    let dayIndex  = startDayIndex;
    let date      = new Date(startDate);
    let guard     = 0;
    const dailyTargets = [];
    let endDate = new Date(startDate);
    while (remaining > 0 && guard++ < 400) {
        if (isWorking(date)) {
            const out = dailyOutput(line, category, styleType, dayIndex, smv, masters);
            const made = Math.min(out, remaining);
            dailyTargets.push({
                date : new Date(date), dayIndex,
                efficiencyPct : effectiveEfficiency(category, styleType, dayIndex),
                targetQty : made
            });
            remaining -= out;
            endDate = new Date(date);
            dayIndex++;
        }
        date = addDays(date, 1);
    }
    return {
        startDate    : new Date(startDate),
        endDate,
        workingDays  : dailyTargets.length,
        nextDayIndex : dayIndex,
        dailyTargets
    };
}

// ---------------------------------------------------------------------------
// 9.1 Forward pass
// ---------------------------------------------------------------------------
export function forwardPass(pcd, lineFreeFrom, isWorking, masters = PLANNING_MASTERS) {
    const earliest = addWorkingDays(pcd, masters.preProductionDays, isWorking);
    let actual = lineFreeFrom && lineFreeFrom > earliest ? new Date(lineFreeFrom) : new Date(earliest);
    let guard = 0;
    while (!isWorking(actual) && guard++ < 60) actual = addDays(actual, 1);
    return { earliestSewStart : earliest, actualSewStart : actual };
}

// ---------------------------------------------------------------------------
// 9.2 Backward pass from the PO delivery date
// ---------------------------------------------------------------------------
export function backwardPass(deliveryDate, sewingDays, qty, isWorking, masters = PLANNING_MASTERS) {
    const finishingDays = masters.finishingBasis === 'day_capacity'
        ? Math.max(1, Math.ceil(qty / masters.finishingDayCapacity))
        : masters.finishingDays;

    const exFactory      = new Date(deliveryDate);                       // dispatch day = delivery day
    const finishingEnd   = prevWorkingDay(exFactory, isWorking);
    const finishingStart = backWorkingDays(finishingEnd, finishingDays, isWorking);
    const washEnd        = prevWorkingDay(finishingStart, isWorking);
    const washStart      = backWorkingDays(washEnd, masters.washDays, isWorking);
    const latestSewEnd   = prevWorkingDay(washStart, isWorking);
    const latestSewStart = backWorkingDays(latestSewEnd, sewingDays, isWorking);
    const latestCutStart = backWorkingDays(prevWorkingDay(latestSewStart, isWorking), masters.cuttingLeadDays, isWorking);

    return { exFactory, finishingStart, finishingEnd, washStart, washEnd, latestSewEnd, latestSewStart, latestCutStart, finishingDays };
}

// ---------------------------------------------------------------------------
// 9.3 Feasibility verdict
// ---------------------------------------------------------------------------
export const VERDICT = {
    COMFORTABLE : 'COMFORTABLE',
    TIGHT       : 'TIGHT',
    NO_BUFFER   : 'NO_BUFFER',
    INFEASIBLE  : 'INFEASIBLE'
};

export function feasibility(latestSewStart, actualSewStart, isWorking, masters = PLANNING_MASTERS) {
    const bufferDays = workingDaysBetween(actualSewStart, latestSewStart, isWorking);
    let verdict;
    if (bufferDays >= masters.minBufferDays) verdict = VERDICT.COMFORTABLE;
    else if (bufferDays >= 1)                verdict = VERDICT.TIGHT;
    else if (bufferDays === 0)               verdict = VERDICT.NO_BUFFER;
    else                                     verdict = VERDICT.INFEASIBLE;

    const remedies = verdict === VERDICT.INFEASIBLE || verdict === VERDICT.NO_BUFFER
        ? [
            { code : 'ADD_LINE',     label : 'Add a second line' },
            { code : 'ADD_OVERTIME', label : 'Add overtime' },
            { code : 'SPLIT_PO',     label : 'Split the PO' },
            { code : 'EXTEND',       label : 'Request a delivery extension' }
        ]
        : [];
    return { bufferDays, verdict, remedies };
}

// ---------------------------------------------------------------------------
// 10. Sequencing and colour clubbing
// blocks: [{ po, colour, wash, qty, deliveryDate }]
// Returns ALL options (A / clubbed variants) ranked by changeover count;
// infeasible options carry rejected=true with the reason (never hidden).
// ---------------------------------------------------------------------------
function simulateSequence(seq, ctx) {
    // minute-level cursor over working days; dayIndex continues across blocks
    // of the same style (SRS 8.2); changeovers consume allowance minutes
    const { line, category, styleType, smv, startDate, isWorking, masters } = ctx;
    let date = new Date(startDate);
    let guard = 0;
    while (!isWorking(date) && guard++ < 60) date = addDays(date, 1);
    let dayIndex = 1;
    let minutesLeft = null;
    const dayMinutes = () => availableMinutes(line, masters) * (effectiveEfficiency(category, styleType, dayIndex) / 100);
    minutesLeft = dayMinutes();

    const advanceDay = () => {
        do {
            date = addDays(date, 1);
        } while (!isWorking(date) && guard++ < 500);
        dayIndex++;
        minutesLeft = dayMinutes();
    };

    const blockEnds = [];
    let prev = null;
    for (const b of seq) {
        if (prev && (prev.colour !== b.colour || prev.wash !== b.wash)) {
            let allowance = masters.changeoverAllowanceMin;
            while (allowance > 0 && guard++ < 500) {
                const used = Math.min(allowance, minutesLeft);
                allowance -= used;
                minutesLeft -= used;
                if (minutesLeft <= 0) advanceDay();
            }
        }
        // Within a club, the earlier-delivery PO's quantity is produced first,
        // so each member PO completes on its own date (SRS 10 - this is what
        // makes option B feasible while option C is not)
        const members = (b.members || [{ po : b.po, qty : b.qty }])
            .slice()
            .sort((x, y) => (x.deliveryDate || 0) - (y.deliveryDate || 0));
        for (const m of members) {
            let needed = m.qty * smv;
            while (needed > 0 && guard++ < 4000) {
                const used = Math.min(needed, minutesLeft);
                needed -= used;
                minutesLeft -= used;
                if (needed > 0 && minutesLeft <= 0) advanceDay();
            }
            blockEnds.push({ po : m.po, colour : b.colour, wash : b.wash, qty : m.qty, endDate : new Date(date) });
        }
        prev = b;
    }
    return blockEnds;
}

export function sequenceOptions(blocks, ctx) {
    const masters = ctx.masters || PLANNING_MASTERS;
    const { isWorking } = ctx;

    // per-PO latest sew end via backward pass (sewing days do not affect it)
    const poLatest = {};
    for (const b of blocks) {
        if (!poLatest[b.po]) {
            poLatest[b.po] = backwardPass(b.deliveryDate, 1, b.qty, isWorking, masters).latestSewEnd;
        }
    }

    const sorted = [...blocks].sort((a, b) => a.deliveryDate - b.deliveryDate);
    const changeovers = seq => {
        let n = 0;
        for (let i = 1; i < seq.length; i++) {
            if (seq[i].colour !== seq[i - 1].colour || seq[i].wash !== seq[i - 1].wash) n++;
        }
        return n;
    };

    const evaluate = (name, seq, note) => {
        const ends = simulateSequence(seq, { ...ctx, masters });
        // A club block carries a combined key (PO-1+PO-2): expand to member
        // POs so every PO is checked against ITS OWN latest sewing end
        const poEnd = {};
        for (const e of ends) {
            for (const po of String(e.po).split('+')) {
                if (!poEnd[po] || e.endDate > poEnd[po]) poEnd[po] = e.endDate;
            }
        }
        const poBuffers = Object.entries(poEnd).map(([po, end]) => ({
            po,
            endDate    : end,
            latest     : poLatest[po],
            bufferDays : workingDaysBetween(end, poLatest[po], isWorking)
        }));
        const violated = poBuffers.find(p => p.bufferDays < 0);
        return {
            name, note,
            sequence    : seq.map(b => `${b.colour} ${b.qty.toLocaleString('en-US')} (${b.po})`),
            blocks      : seq.length,
            changeovers : changeovers(seq),
            poBuffers,
            rejected    : !!violated,
            rejectReason : violated
                ? `${violated.po} ${seq.find(s => String(s.po).includes(violated.po))?.colour || ''} finishes after its latest sewing end (${violated.latest.toISOString().slice(0, 10)})`
                : null
        };
    };

    const options = [];

    // Option A - delivery order only
    options.push(evaluate('A — delivery only', sorted, 'No clubbing; most changeovers'));

    // Clubbed variants: merge same-colour blocks across adjacent POs
    const colours = [...new Set(sorted.map(b => b.colour))];
    for (const col of colours) {
        const clubQty = sorted.filter(b => b.colour === col).reduce((a, b) => a + b.qty, 0);
        const others  = sorted.filter(b => b.colour !== col);
        if (sorted.filter(b => b.colour === col).length < 2) continue;
        const clubBlock = {
            po    : sorted.filter(b => b.colour === col).map(b => b.po).join('+'),
            colour : col, wash : sorted.find(b => b.colour === col).wash,
            qty   : clubQty,
            deliveryDate : sorted.find(b => b.colour === col).deliveryDate,
            members : sorted.filter(b => b.colour === col)
                .map(b => ({ po : b.po, qty : b.qty, deliveryDate : b.deliveryDate }))
        };
        // notes' sequence: earliest-delivery other colour first, then club, then rest
        const seq = [others[0], clubBlock, ...others.slice(1)].filter(Boolean);
        options.push(evaluate(`B — club ${col}`, seq, `${col} of all POs runs as one block`));
    }

    // Option C - club everything by colour
    if (colours.length > 1) {
        const seqC = colours.map(col => ({
            po : sorted.filter(b => b.colour === col).map(b => b.po).join('+'),
            colour : col,
            wash : sorted.find(b => b.colour === col).wash,
            qty : sorted.filter(b => b.colour === col).reduce((a, b) => a + b.qty, 0),
            deliveryDate : sorted.find(b => b.colour === col).deliveryDate,
            members : sorted.filter(b => b.colour === col)
                .map(b => ({ po : b.po, qty : b.qty, deliveryDate : b.deliveryDate }))
        }));
        options.push(evaluate('C — club both', seqC, 'Every colour one block'));
    }

    // rank: feasible first, then fewest changeovers
    return options.sort((a, b) => (a.rejected - b.rejected) || (a.changeovers - b.changeovers));
}

// ---------------------------------------------------------------------------
// Board auto-plan: live order list → sewing lines
// Rules applied per order:
//   1. Earliest due date first (critical path / tightest delivery)
//   2. Same MBM order + colour stay together (clubbing)
//   3. Forward pass: sewing cannot start before PCD + pre-production
//   4. Backward pass: sewing must finish before wash + finishing + dispatch
//   5. Line daily output from manpower × shift × efficiency / SMV
//   6. No overlap — each line's cursor advances to the next free working day
// ---------------------------------------------------------------------------
export function sewingDurationDays(qty, smv, availMin) {
    const reqMin = Math.max(0, Number(qty) || 0) * Math.max(0.1, Number(smv) || 0);
    return Math.max(15 / 600, reqMin / Math.max(1, Number(availMin) || 1));
}

export function autoPlanOrders(orders, lineStates, ctx) {
    const {
        isWorking,
        today,
        masters = PLANNING_MASTERS,
        efficiencyOf = () => 0,
        workMinPerDay = 600,
        snapStart
    } = ctx;

    const todayStart = snapStart
        ? snapStart(today)
        : (() => {
            let d = new Date(today);
            let guard = 0;
            while (!isWorking(d) && guard++ < 60) d = addDays(d, 1);
            return d;
        })();

    const prepared = orders.map(o => {
        const ship = o.ship ? new Date(o.ship) : addDays(todayStart, 90);
        const pcd  = o.pcd ? new Date(o.pcd) : addDays(ship, -30);
        const smv  = Number(o.smv) > 0 ? Number(o.smv) : 18;
        const qty  = Number(o.qty ?? o.orderQty) || 0;
        return { ...o, ship, pcd, smv, qty };
    }).filter(o => o.qty > 0);

    // PCD first so same-PCD orders stay together, then delivery / style / colour
    prepared.sort((a, b) => {
        const dp = a.pcd - b.pcd;
        if (dp) return dp;
        const ds = a.ship - b.ship;
        if (ds) return ds;
        const pt = String(a.productType || '').localeCompare(String(b.productType || ''));
        if (pt) return pt;
        const mo = String(a.mbmOrder || '').localeCompare(String(b.mbmOrder || ''));
        if (mo) return mo;
        const st = String(a.style || '').localeCompare(String(b.style || ''));
        if (st) return st;
        const col = String(a.color || '').localeCompare(String(b.color || ''));
        if (col) return col;
        return String(a.po || '').localeCompare(String(b.po || ''));
    });

    const sameDay = (a, b) => a && b
        && a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();

    const placements = [];
    for (const o of prepared) {
        const candidates = lineStates.map(line => {
            const planEff = Number(efficiencyOf(line.id, o.productType)) || Number(line.eff) || 50;
            const availMin = Math.round(
                (Number(line.manpower) || 50) * workMinPerDay * planEff / 100
            );
            const dur = sewingDurationDays(o.qty, o.smv, availMin);
            const lineFree = line.freeFrom > todayStart ? new Date(line.freeFrom) : new Date(todayStart);
            const fwd = forwardPass(o.pcd, lineFree, isWorking, masters);
            let start = new Date(fwd.actualSewStart);
            if (o.matReady && new Date(o.matReady) > start) start = new Date(o.matReady);
            if (start < todayStart) start = new Date(todayStart);
            if (snapStart) start = snapStart(start);
            // Same PCD as the last bar on this line: sit flush after it
            if (line.lastEnd && sameDay(line.lastPcd, o.pcd) && start < line.freeFrom) {
                start = snapStart ? snapStart(line.freeFrom) : new Date(line.freeFrom);
            }

            const endDate = addWorkingDays(start, dur, isWorking);
            const back = backwardPass(o.ship, dur, o.qty, isWorking, masters);
            const feas = feasibility(back.latestSewStart, start, isWorking, masters);
            const lateness = workingDaysBetween(back.latestSewEnd, endDate, isWorking);
            const typeFit = ctx.lineHasProductType?.(line.id, o.productType) ? 0 : 1;
            const clubPcd = line.lastPcd && sameDay(line.lastPcd, o.pcd) ? 0 : 1;
            const clubType = line.lastProductType && line.lastProductType === o.productType ? 0 : 1;
            return {
                line, start, endDate, dur, availMin, planEff, fwd, back, feas, lateness,
                typeFit, clubPcd, clubType
            };
        });

        candidates.sort((a, b) => {
            if (a.clubPcd !== b.clubPcd) return a.clubPcd - b.clubPcd;
            if (a.clubType !== b.clubType) return a.clubType - b.clubType;
            if (a.typeFit !== b.typeFit) return a.typeFit - b.typeFit;
            const aOk = a.lateness <= 0 ? 0 : 1;
            const bOk = b.lateness <= 0 ? 0 : 1;
            if (aOk !== bOk) return aOk - bOk;
            if (a.lateness !== b.lateness) return a.lateness - b.lateness;
            if (a.endDate - b.endDate) return a.endDate - b.endDate;
            return String(a.line.id).localeCompare(String(b.line.id));
        });

        const best = candidates[0];
        if (!best) continue;

        best.line.freeFrom = best.endDate;
        best.line.lastEnd = best.endDate;
        best.line.lastPcd = o.pcd;
        best.line.lastProductType = o.productType;

        placements.push({ order : o, ...best });
    }

    return { placements };
}
