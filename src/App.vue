<script setup>
import { ref, shallowRef, computed, watch, onMounted } from 'vue';
import { BryntumSchedulerPro } from '@bryntum/schedulerpro-vue-3';
import {
    schedulerProConfig, uiHooks, colorState, searchState, recalcCapacity, planOrderDrop,
    pushFollowers, computeInsertStart, tryMergeAdjacent, lineIdOf, isHoldingRes, isSewingRes,
    refreshGrandTotals
} from './AppConfig.js';
import {
    UNPLANNED_INIT, LINES, LINE_BY_ID, calendarState, hmToHours, buildManpowerRanges,
    buildOffDayRanges, nextWorkingDay, addWorkDays, endOfWork, startOfWorkDay, endOfWorkDay,
    elapsedDays, isOffDay, calcRisk, fmtQty, fmtDate, fmtDateDdMonRr,
    addCalDays, randSmv, orderColor, mbmOrderNo, orderTypeOf, VIEW_START, VIEW_END,
    nextStartAfter, WORK_MIN_PER_DAY, resolveProfileType, resolveProfileEfficiency
} from './planningData.js';
import {
    loadFromApi, syncToApi, loadProdUpdatesDb, saveProdUpdatesDb,
    saveEffProfilesDb, saveLearningCurvesDb, loadUnplannedDb, loadUnplannedDbPaged, API_BASE
} from './api.js';
import {
    PLANNING_MASTERS, classifyVolume, blockDuration, forwardPass,
    backwardPass, feasibility, sequenceOptions, autoPlanOrders
} from './planningEngine.js';

const schedRef = ref(null);
const order = ref(null);
const unplanned = ref([...UNPLANNED_INIT]);
const toasts = ref([]);
const colorMenuOpen = ref(false);
const colorMode = ref('risk');
const dataSource = ref('demo');
const planMeta = ref({ name : 'AQL August Sewing Plan', status : 'Draft', version : 3 });

// ---------------------------------------------------------------------------
// FastReact-style shell: main menu, multiple planning boards, permissions
// ---------------------------------------------------------------------------
const view         = ref('home');   // 'home' | 'board'
const currentBoard = ref(null);
const boardMin     = ref(false);    // board minimized to the taskbar
const openMenu     = ref(null);
const settingsOpen = ref(false);

// Board view survives a reload until the user closes or minimizes it
function saveBoardView() {
    localStorage.setItem('mbm-board-view', JSON.stringify({
        boardId : currentBoard.value?.id || null,
        view    : view.value,
        min     : boardMin.value
    }));
}

// ---------------------------------------------------------------------------
// Window taskbar: every open dialog shows as an icon on the bottom line -
// click restores it to the top, ✕ on the icon closes it
// ---------------------------------------------------------------------------
const ordersMin   = ref(false);
const settingsMin = ref(false);
const effMin      = ref(false);
const calMin      = ref(false);

const openWindows = computed(() => [
    { id : 'board',    icon : '🗓', title : currentBoard.value?.name || 'Planning board',
        open : !!currentBoard.value && (view.value === 'board' || boardMin.value), min : boardMin.value },
    { id : 'orders',   icon : '🔴', title : 'Orders',              open : ordersOpen.value,   min : ordersMin.value },
    { id : 'dayplan',  icon : '📄', title : 'Day Plan Report',     open : dpOpen.value,       min : dpMin.value },
    { id : 'produpd',  icon : '🏭', title : 'Production update',   open : puOpen.value,       min : puMin.value },
    { id : 'settings', icon : '⚙️', title : 'Settings',            open : settingsOpen.value, min : settingsMin.value },
    { id : 'eff',      icon : '📊', title : 'Efficiency profiles', open : effOpen.value,      min : effMin.value },
    { id : 'cal',      icon : '📅', title : 'Calendars',           open : calOpen.value,      min : calMin.value },
    { id : 'bc',       icon : '📈', title : 'Build up curves',     open : bcOpen.value,       min : bcMin.value },
    { id : 'props',    icon : '🧭', title : 'Strip properties',    open : propsOpen.value,    min : propsMin.value },
    { id : 'plan',     icon : '🗓', title : 'Planned schedule',    open : plOpen.value,       min : plMin.value },
    { id : 'pg',       icon : '🧮', title : 'Plan generator',      open : pgOpen.value,       min : pgMin.value }
].filter(w => w.open));

function restoreWin(id) {
    if (id === 'board' && currentBoard.value) openBoard(currentBoard.value);
    if (id === 'orders')   ordersMin.value = false;
    if (id === 'dayplan')  dpMin.value = false;
    if (id === 'produpd')  puMin.value = false;
    if (id === 'settings') settingsMin.value = false;
    if (id === 'eff')      effMin.value = false;
    if (id === 'cal')      calMin.value = false;
    if (id === 'bc')       bcMin.value = false;
    if (id === 'props')    propsMin.value = false;
    if (id === 'plan')     plMin.value = false;
    if (id === 'pg')       pgMin.value = false;
}

function closeWin(id) {
    if (id === 'board')    closeBoard();
    if (id === 'orders')   ordersOpen.value = false;
    if (id === 'dayplan')  dpOpen.value = false;
    if (id === 'produpd')  puOpen.value = false;
    if (id === 'settings') settingsOpen.value = false;
    if (id === 'eff')      effOpen.value = false;
    if (id === 'cal')      calOpen.value = false;
    if (id === 'bc')       bcOpen.value = false;
    if (id === 'props')    propsOpen.value = false;
    if (id === 'plan')     plOpen.value = false;
    if (id === 'pg')       pgOpen.value = false;
}

// ---------------------------------------------------------------------------
// Plan Generator (SRS screen S2): volume class -> forward/backward pass ->
// buffer verdict -> sequence options A/B/C -> commit colour blocks to board
// ---------------------------------------------------------------------------
const pgOpen = ref(false);
const pgMin  = ref(false);

// Prefilled with the SRS section 11 worked example (the acceptance scenario)
const pgForm = ref({
    orderNo   : 'XYZ',
    category  : '5Pkt',
    styleType : 'new',
    smv       : 18,
    pcd       : '2026-08-01',
    lineFree  : '2026-08-08',
    pos : [
        { po : 'PO-1', delivery : '2026-08-21', colours : [
            { colour : 'Red',  qty : 3000, wash : 'W1' },
            { colour : 'Blue', qty : 3000, wash : 'W1' }
        ] },
        { po : 'PO-2', delivery : '2026-08-28', colours : [
            { colour : 'Red',  qty : 1000, wash : 'W1' },
            { colour : 'Blue', qty : 3000, wash : 'W1' }
        ] }
    ]
});

const pgResult = ref(null);

function openPlanGenerator() {
    openMenu.value = null;
    pgOpen.value = true;
    pgMin.value = false;
}

function pgGenerate() {
    try {
        const f = pgForm.value;
        const cat = PLANNING_MASTERS.productCategories[f.category];
        if (!cat) {
            toast(`V07: Configure the learning curve for ${f.category} before planning`, 'error');
            return;
        }
        if (!f.smv || f.smv <= 0) {
            toast('V04: IE must supply SMV before this order can be planned', 'error');
            return;
        }
        const totalQty = f.pos.reduce((a, p) => a + p.colours.reduce((x, c) => x + Number(c.qty || 0), 0), 0);
        // V01/V02-style reconciliation happens implicitly: blocks ARE the POs' colours
        const engineLine = { operators : 45, shiftMinutes : 480, absenteeismPct : PLANNING_MASTERS.absenteeismPct };
        // SRS worked-example calendar: every day working (board calendar off-days
        // are applied at commit time when the blocks land on the real board)
        const isWorking = () => true;
        const pcd = new Date(f.pcd);
        const lineFree = f.lineFree ? new Date(f.lineFree) : null;

        const volume = classifyVolume(totalQty);
        const fwd = forwardPass(pcd, lineFree, isWorking);

        const blocks = f.pos.flatMap(p => p.colours.map(c => ({
            po : p.po, colour : c.colour, wash : c.wash || 'W1',
            qty : Number(c.qty || 0), deliveryDate : new Date(p.delivery)
        })));

        // per-PO backward pass + feasibility
        const poRows = f.pos.map(p => {
            const qty = p.colours.reduce((a, c) => a + Number(c.qty || 0), 0);
            const durProbe = blockDuration(qty, engineLine, cat, f.styleType, Number(f.smv), fwd.actualSewStart, isWorking);
            const back = backwardPass(new Date(p.delivery), durProbe.workingDays, qty, isWorking);
            const feas = feasibility(back.latestSewStart, fwd.actualSewStart, isWorking);
            return { po : p.po, qty, delivery : p.delivery, sewDays : durProbe.workingDays, back, feas };
        });

        const options = sequenceOptions(blocks, {
            line : engineLine, category : cat, styleType : f.styleType,
            smv : Number(f.smv), startDate : fwd.actualSewStart, isWorking
        });

        pgResult.value = { totalQty, volume, fwd, poRows, options };
    }
    catch (e) {
        toast(`Plan generation failed: ${e.message}`, 'error');
    }
}

const pgVerdictCls = v => ({
    COMFORTABLE : 'pg-v-good', TIGHT : 'pg-v-amber',
    NO_BUFFER : 'pg-v-red', INFEASIBLE : 'pg-v-red'
}[v] || '');

function pgCommit(opt) {
    const s = getInstance();
    const r = pgResult.value;
    const f = pgForm.value;
    if (!s || !r || opt.rejected) return;
    const cat = PLANNING_MASTERS.productCategories[f.category];
    const lineRes = s.resourceStore.records.find(x => x.data.lineRow);
    if (!lineRes) return;
    let cursor = startOfWorkDay(nextWorkingDay(new Date(r.fwd.actualSewStart)));
    let seqNo = 0;
    for (const label of opt.sequence) {
        // label format: "Colour 3,000 (PO-x)"
        const m = label.match(/^(\S+)\s([\d,]+)\s\((.+)\)$/);
        if (!m) continue;
        const [, colour, qtyS, po] = m;
        const qty = Number(qtyS.replace(/,/g, ''));
        const reqMin = Math.round(qty * Number(f.smv));
        const line = LINES.find(l => l.id === lineRes.id);
        const dur = Math.max(1, Math.ceil(reqMin / (line?.availMin || 12000)));
        const start = new Date(cursor);
        const end   = endOfWork(start, dur);
        const raw = {
            po : `${po}`, buyer : f.orderNo, style : `${f.category} ${colour}`,
            productType : cat.name || f.category,
            qty, smv : Number(f.smv), reqMin, dur,
            pcd : new Date(f.pcd),
            ship : new Date(f.pos.find(p => po.includes(p.po))?.delivery || f.pos[0].delivery),
            matReady : new Date(f.pcd), progress : 0, status : 'draft',
            start, end, colour, curve : cat.learningCurve[f.styleType],
            risk : { score : 0, level : 'draft', label : 'Draft', reasons : ['Committed from Plan Generator'] }
        };
        const [rec] = s.eventStore.add({
            id : `pg-${Date.now()}-${seqNo++}`,
            resourceId : lineRes.id,
            startDate : start, endDate : end,
            manuallyScheduled : true,
            name : `${f.orderNo} | ${colour} ${fmtQty(qty)} (${po})`,
            percentDone : 0,
            raw
        });
        if (rec) pushFollowers(s, lineRes.id, rec);
        cursor = nextStartAfter(end);
    }
    recalcCapacity(s);
    toast(`Sequence "${opt.name}" committed to ${lineRes.name} — ${opt.blocks} block(s)`, 'ok');
    pgOpen.value = false;
    s.refreshWithTransition?.();
}

function lineEfficiencyOf(lineId, productType) {
    const profile = profileOfLine(lineId);
    return resolveProfileEfficiency(profile?.values, productType, LINE_BY_ID[lineId]?.eff) || 50;
}

function snapToWorkStart(d) {
    return startOfWorkDay(nextWorkingDay(new Date(d)));
}

// Re-plan the live order list onto sewing lines using PCD, delivery date
// and the critical-path (forward + backward) rules from planningEngine.js
function planLiveOrders() {
    const s = getInstance();
    if (!s) {
        toast('Open a planning board first', 'warn');
        return;
    }
    openMenu.value = null;

    const keep = [];
    const drop = [];
    for (const ev of s.eventStore.records) {
        const raw = ev.data.raw;
        if (!raw || raw.stage) continue;
        if (raw.status === 'completed' || Number(raw.made) > 0) keep.push(ev);
        else drop.push(ev);
    }
    const recycled = drop.map(ev => ev.data.raw).filter(Boolean);
    if (drop.length) s.eventStore.remove(drop);

    const onBoard = new Set(keep.map(ev => String(ev.data.raw?.id || ev.id)));

    const today = snapToWorkStart(new Date());
    const lineStates = s.resourceStore.records
        .filter(r => r.data.lineRow)
        .map(r => {
            const base = LINE_BY_ID[r.id] || {};
            return {
                id       : r.id,
                name     : r.name,
                manpower : Number(r.data.manpower) || base.manpower || 50,
                eff      : Number(r.data.eff) || base.eff || 50,
                freeFrom : new Date(today)
            };
        });
    if (!lineStates.length) {
        toast('No sewing lines on this board', 'error');
        return;
    }

    for (const ev of keep) {
        const lid = lineIdOf(s, ev);
        const line = lineStates.find(l => l.id === lid);
        if (!line) continue;
        const nxt = nextStartAfter(ev.endDate);
        if (nxt > line.freeFrom) line.freeFrom = nxt;
    }

    const source = [...unplanned.value, ...recycled];
    const seen = new Set(onBoard);
    const orders = [];
    for (const u of source) {
        const key = String(u.id || `${u.mbmOrder || ''}:${u.po || ''}:${u.style || ''}`);
        if (seen.has(key)) continue;
        seen.add(key);
        if (!String(u.buyer || '').trim()) continue;
        const qty = Number(u.qty ?? u.orderQty) || 0;
        if (qty <= 0) continue;
        const lidHint = u.suitable?.[0] || lineStates[0].id;
        orders.push({
            ...u,
            productType : u.productType || productTypeFromProfile(u.po, lidHint),
            color       : u.color || orderColor(u.po),
            mbmOrder    : u.mbmOrder || mbmOrderNo(u.po, u.mbmOrder)
        });
    }

    if (!orders.length) {
        toast('No live orders left to plan', 'warn');
        return;
    }

    const isWorking = d => !isOffDay(d);
    const { placements } = autoPlanOrders(orders, lineStates, {
        isWorking,
        today,
        efficiencyOf : lineEfficiencyOf,
        workMinPerDay : WORK_MIN_PER_DAY,
        snapStart : snapToWorkStart
    });

    const events = [];
    let late = 0, tight = 0;
    for (const p of placements) {
        const o = p.order;
        const start = startOfWorkDay(p.start);
        const end   = endOfWork(start, p.dur);
        const reqMin = Math.round(o.qty * o.smv);
        const verdict = p.feas?.verdict;
        if (verdict === 'INFEASIBLE' || p.lateness > 0) late++;
        else if (verdict === 'TIGHT' || verdict === 'NO_BUFFER') tight++;

        const raw = {
            ...o,
            reqMin, dur : p.dur, start, end,
            orderQty : o.orderQty ?? o.qty,
            progress : 0,
            status   : 'draft',
            smv      : o.smv,
            pcd      : o.pcd,
            ship     : o.ship,
            matReady : o.matReady || o.pcd,
            mbmOrder : o.mbmOrder,
            productType : o.productType,
            color    : o.color,
            planEff  : p.planEff,
            bufferDays : p.feas?.bufferDays,
            verdict,
            criticalPath : {
                pcd            : o.pcd,
                earliestSew    : p.fwd?.earliestSewStart,
                latestSewStart : p.back?.latestSewStart,
                latestSewEnd   : p.back?.latestSewEnd,
                washEnd        : p.back?.washEnd,
                finishingEnd   : p.back?.finishingEnd,
                exFactory      : p.back?.exFactory,
                bufferDays     : p.feas?.bufferDays,
                verdict
            },
            risk : calcRisk({
                start, end, ship : o.ship, matReady : o.matReady || o.pcd,
                lineUtil : 0, status : 'draft'
            })
        };

        events.push({
            id         : `ev-${o.id}`,
            resourceId : p.line.id,
            startDate  : start,
            endDate    : end,
            duration   : elapsedDays(start, end),
            durationUnit : 'day',
            manuallyScheduled : true,
            name       : `${o.buyer} | ${o.mbmOrder || o.po}`,
            percentDone : 0,
            draggable  : true,
            resizable  : true,
            raw
        });
    }

    if (events.length) {
        s.eventStore.add(events);
        const minS = events.reduce((a, e) => e.startDate < a ? e.startDate : a, events[0].startDate);
        const maxE = events.reduce((a, e) => e.endDate > a ? e.endDate : a, events[0].endDate);
        const from = new Date(minS.getFullYear(), minS.getMonth(), 1);
        const to   = new Date(maxE.getFullYear(), maxE.getMonth() + 2, 1);
        if (from < s.startDate) s.startDate = from;
        if (to > s.endDate) s.endDate = to;
    }

    const plannedIds = new Set(placements.map(p => String(p.order.id)));
    unplanned.value = unplanned.value.filter(u => !plannedIds.has(String(u.id)));

    recalcCapacity(s);
    refreshGrandTotals(s);
    s.refreshWithTransition?.();
    scrollBoardToToday(s);

    toast(
        `Planned ${placements.length} order(s) from the live list — ${tight} tight, ${late} past critical path`,
        late ? 'warn' : 'ok'
    );
    if (view.value !== 'board') {
        const b = currentBoard.value || permittedBoards.value[0];
        if (b) openBoard(b);
    }
}

// ---------------------------------------------------------------------------
// Strip / Order properties (right-click -> Properties, FastReact style)
// ---------------------------------------------------------------------------
const propsOpen = ref(false);
const propsMin  = ref(false);
const propsRec  = shallowRef(null);
const propsForm = ref({ stripEff : 100, keepSeparate : false, profileEff : 55 });

const propsRaw = computed(() => propsRec.value?.data?.raw || null);

const propsLine = computed(() => {
    const s = getInstance();
    const rec = propsRec.value;
    if (!s || !rec) return null;
    const lid = lineIdOf(s, rec);
    return {
        id   : lid,
        name : s.resourceStore.getById(lid)?.name || lid,
        line : LINES.find(l => l.id === lid) || null
    };
});

const propsProfile = computed(() => {
    const lid = propsLine.value?.id;
    const pid = lid ? lineProfileMap.value[lid] : null;
    return (pid && effList.value.find(p => p.id === pid)) || effList.value[0] || null;
});

function profileOfLine(lid) {
    const pid = lid ? lineProfileMap.value[lid] : null;
    return (pid && effList.value.find(p => p.id === pid)) || effList.value[0] || null;
}

function stripProfileType(raw, lid) {
    const profile = profileOfLine(lid);
    return resolveProfileType(raw?.po, profile?.values, raw?.productType);
}

function readProfileEff(raw, lid) {
    const profile = profileOfLine(lid);
    const pType = stripProfileType(raw, lid);
    return resolveProfileEfficiency(profile?.values, pType, LINE_BY_ID[lid]?.eff) || 55;
}

const propsRouteName = computed(() => {
    const raw = propsRaw.value;
    const lid = propsLine.value?.id;
    if (!raw) return '_Default';
    return stripProfileType(raw, lid);
});

const propsKeyDates = computed(() => {
    const r = propsRaw.value;
    if (!r) return [];
    const despatch = r.end ? new Date(r.end.getTime() + 2 * 86400000) : null;
    return [
        ['Preparation start',         r.matReady],
        ['Load into production',      r.start],
        ['Production start',          r.start],
        ['First complete in section', r.end],
        ['First despatch from Factory', despatch],
        ['First arrive at customer',  r.ship]
    ];
});

const propsQtyWeek = computed(() => {
    const r = propsRaw.value;
    return r && r.dur ? fmtQty(Math.round(r.qty * 6 / r.dur)) : '—';
});

// ---------------------------------------------------------------------------
// Planned schedule (right-click -> Planned schedule): day-wise quantity,
// cumulative, efficiency and hours - FastReact "Planned quantity" window
// ---------------------------------------------------------------------------
const plOpen   = ref(false);
const plMin    = ref(false);
const plRec    = shallowRef(null);
const plPeriod = ref('daily');   // daily | weekly | monthly

const plRaw = computed(() => plRec.value?.data?.raw || null);

const plLine = computed(() => {
    const s = getInstance();
    const rec = plRec.value;
    if (!s || !rec) return null;
    const lid = lineIdOf(s, rec);
    return {
        id   : lid,
        name : s.resourceStore.getById(lid)?.name || lid,
        line : LINES.find(l => l.id === lid) || null
    };
});

// All strips of the same PO currently on the board
const plAllStrips = computed(() => {
    const s = getInstance();
    const raw = plRaw.value;
    if (!s || !raw) return { qty : 0, count : 0 };
    const strips = s.eventStore.records.filter(e => e.data.raw && !e.data.raw.stage && e.data.raw.po === raw.po);
    return {
        qty   : strips.reduce((a, e) => a + e.data.raw.qty, 0),
        count : strips.length
    };
});

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Daily rows: quantity distributed over working days (off days show 0)
const plDailyRows = computed(() => {
    const rec = plRec.value;
    const raw = plRaw.value;
    if (!rec || !raw) return [];
    const line = plLine.value?.line;
    const availMin = (line?.availMin || 12000) * (raw.stripEff || 100) / 100;
    const dailyTarget = Math.max(1, Math.floor(availMin / Math.max(0.1, raw.smv)));
    const rows = [];
    let remaining = raw.qty;
    const d = new Date(rec.startDate);
    d.setHours(0, 0, 0, 0);
    const end = new Date(rec.endDate);
    let guard = 0;
    while (d < end && guard++ < 120) {
        const off = isOffDay(d);
        const cfg = calendarState.days[d.getDay()] || {};
        let q = 0;
        if (!off && remaining > 0) {
            q = Math.min(dailyTarget, remaining);
            remaining -= q;
        }
        rows.push({
            day   : DAY_ABBR[d.getDay()],
            date  : fmtDate(new Date(d)),
            mKey  : `${d.getFullYear()}-${d.getMonth()}`,
            mName : d.toLocaleString('en-US', { month : 'short' }) + ' ' + d.getFullYear(),
            qty   : q,
            eff   : off || !q ? 0 : Math.round((line?.eff || 0) * (raw.stripEff || 100) / 100),
            hours : off ? '0:00' : (cfg.hours || '10:00'),
            off
        });
        d.setDate(d.getDate() + 1);
    }
    // Any remainder lands on the last working day
    if (remaining > 0) {
        const lastW = [...rows].reverse().find(r => !r.off);
        if (lastW) lastW.qty += remaining;
    }
    let cum = 0;
    for (const r of rows) {
        cum += r.qty;
        r.cum = cum;
    }
    return rows;
});

// Aggregated view for Weekly / Monthly periods
const plRows = computed(() => {
    const daily = plDailyRows.value;
    if (plPeriod.value === 'daily') return daily;
    const groups = [];
    let cur = null;
    let weekIdx = 0;
    for (const r of daily) {
        const key = plPeriod.value === 'monthly'
            ? r.mKey
            : (r.day === 'Sun' || !cur ? `w${++weekIdx}` : cur.key);
        if (!cur || cur.key !== key) {
            cur = {
                key,
                day   : plPeriod.value === 'monthly' ? 'Mo' : `Wk ${weekIdx}`,
                date  : plPeriod.value === 'monthly' ? r.mName : r.date,
                qty   : 0, cum : 0, effSum : 0, effN : 0, hoursMin : 0
            };
            groups.push(cur);
        }
        cur.qty += r.qty;
        cur.cum = r.cum;
        if (r.eff > 0) {
            cur.effSum += r.eff;
            cur.effN++;
        }
        cur.hoursMin += Math.round(hmToHours(r.hours) * 60);
    }
    return groups.map(g => ({
        day   : g.day,
        date  : g.date,
        qty   : g.qty,
        cum   : g.cum,
        eff   : g.effN ? Math.round(g.effSum / g.effN) : 0,
        hours : `${Math.floor(g.hoursMin / 60)}:${String(g.hoursMin % 60).padStart(2, '0')}`
    }));
});

function propsUpdate() {
    const rec = propsRec.value;
    const raw = propsRaw.value;
    const s   = getInstance();
    if (!rec || !raw || !s) return;
    const se = Math.max(1, Math.min(500, Number(propsForm.value.stripEff) || 100));
    const pe = Math.max(1, Math.min(200, Number(propsForm.value.profileEff) || 0));
    raw.stripEff     = se;
    raw.keepSeparate = !!propsForm.value.keepSeparate;
    raw.planEff      = pe;

    const lid = propsLine.value?.id;
    const pType = stripProfileType(raw, lid);
    const key = pType && pType !== '_Default' ? pType : '_Default';
    let profile = propsProfile.value;
    if (!profile && lid) {
        const mapped = lineProfileMap.value[lid];
        profile = effList.value.find(p => p.id === mapped) || effList.value[0];
    }
    if (profile) {
        if (!profile.values) profile.values = {};
        profile.values[key] = pe;
        raw.productType = pType || key;
        saveEffState();
    }

    const line = propsLine.value?.line || LINE_BY_ID[lid];
    if (line && raw.status !== 'completed') {
        const manpower = Number(line.manpower) || 50;
        const availMin = Math.round(manpower * WORK_MIN_PER_DAY * pe / 100) * se / 100;
        const smv = Math.max(0.1, Number(raw.smv) || randSmv(raw.po));
        const reqMin = Math.round((Number(raw.qty) || 0) * smv);
        raw.smv = smv;
        raw.reqMin = reqMin;
        raw.dur = Math.max(1, Math.ceil(reqMin / Math.max(1, availMin)));
        const start = new Date(rec.startDate);
        const end   = endOfWork(start, raw.dur);
        rec.set({ endDate : end, duration : elapsedDays(start, end) });
        raw.start = start;
        raw.end   = end;
        const pushed = pushFollowers(s, lid, rec);
        if (pushed) toast(`${pushed} following order(s) shifted later`, 'warn');
        recalcCapacity(s);
        s.refreshWithTransition?.();
    }
    toast(`${mbmOrderNo(raw.po, raw.mbmOrder)}: profile efficiency ${pe}% · strip ${se}%`, 'ok');
}

function openSettings() {
    settingsOpen.value = true;
    settingsMin.value = false;
    openMenu.value = null;
}

const DEFAULT_BOARDS = [
    { id : 'b1', name : 'AQL Sewing Board — All Floors', floors : ['F1', 'F2'], stages : true },
    { id : 'b2', name : 'AQL Floor 1 Board',             floors : ['F1'],       stages : false },
    { id : 'b3', name : 'AQL Floor 2 Board',             floors : ['F2'],       stages : false }
];
const DEFAULT_USERS = [
    { id : 'u1', name : 'Ferdows',           role : 'Planner',    boards : ['b1', 'b2', 'b3'] },
    { id : 'u2', name : 'Unit Head — F1',    role : 'Unit Head',  boards : ['b2'] },
    { id : 'u3', name : 'Management Viewer', role : 'Management', boards : ['b1'] }
];
const ROLES = ['Planner', 'Planning Manager', 'Unit Head', 'Management'];

const loadLS = (k, d) => {
    try {
        const v = JSON.parse(localStorage.getItem(k));
        return Array.isArray(v) && v.length ? v : d;
    }
    catch {
        return d;
    }
};

const boards        = ref(loadLS('mbm-boards', DEFAULT_BOARDS));
const users         = ref(loadLS('mbm-users', DEFAULT_USERS));
const currentUserId = ref(localStorage.getItem('mbm-current-user') || 'u1');

const currentUser     = computed(() => users.value.find(u => u.id === currentUserId.value) || users.value[0]);
const permittedBoards = computed(() => boards.value.filter(b => currentUser.value?.boards.includes(b.id)));

function savePerms() {
    localStorage.setItem('mbm-boards', JSON.stringify(boards.value));
    localStorage.setItem('mbm-users', JSON.stringify(users.value));
    localStorage.setItem('mbm-current-user', currentUserId.value);
}

function removeOrdersWithoutBuyer(s) {
    if (!s) return;
    const drop = s.eventStore.records.filter(ev => {
        const raw = ev.data.raw;
        if (!raw || raw.stage) return false;
        return !String(raw.buyer || '').trim();
    });
    if (drop.length) s.eventStore.remove(drop);
}

function applyBoardFilter() {
    const s = getInstance();
    const b = currentBoard.value;
    if (!s || !b) return;
    s.resourceStore.clearFilters();
    s.resourceStore.filter({
        id       : 'boardFilter',
        filterBy : r => {
            const d = r.data || {};
            if (d.holdingRow || d.subtotalRow || r.id === 'hold' || r.id === 'subtot') return true;
            if (d.lineRow || LINE_BY_ID[r.id]) {
                if (!b.floors?.length || !d.floor) return true;
                return b.floors.includes(d.floor);
            }
            return b.stages !== false;
        }
    });
    // Management role gets a read-only board (document 17)
    s.readOnly = currentUser.value?.role === 'Management';
    s.refreshRows?.();
}

function openBoard(b) {
    currentBoard.value = b;
    view.value = 'board';
    boardMin.value = false;
    openMenu.value = null;
    saveBoardView();
    setTimeout(() => {
        const s = getInstance();
        // Restore the locked grid if a hidden mount ever collapsed it
        if (s?.subGrids?.locked && (s.subGrids.locked.width || 0) < 100) {
            s.subGrids.locked.width = 248;
        }
        setClock(CLOCK_DEFAULT());
        window.dispatchEvent(new Event('resize'));
        applyBoardFilter();
        removeOrdersWithoutBuyer(s);
        installFrVScroll(s);
    }, 150);
}

function closeBoard() {
    view.value = 'home';
    currentBoard.value = null;
    boardMin.value = false;
    cancelCarry();
    saveBoardView();
}

function minimizeBoard() {
    view.value = 'home';
    boardMin.value = true;
    cancelCarry();
    saveBoardView();
}

function addBoard() {
    openMenu.value = null;
    const name = window.prompt('New planning board name:');
    if (!name) return;
    const floors = (window.prompt('Floors for this board (comma separated):', 'F1,F2') || 'F1,F2')
        .split(',').map(x => x.trim()).filter(Boolean);
    const b = { id : `b${Date.now()}`, name, floors, stages : floors.length > 1 };
    boards.value.push(b);
    currentUser.value.boards.push(b.id);
    savePerms();
    toast(`Planning board "${name}" added — access granted to ${currentUser.value.name}`, 'ok');
}

function addUser() {
    const name = window.prompt('New user name:');
    if (!name) return;
    users.value.push({ id : `u${Date.now()}`, name, role : 'Planner', boards : [] });
    savePerms();
}

function toggleBoardPerm(u, boardId) {
    const i = u.boards.indexOf(boardId);
    if (i >= 0) u.boards.splice(i, 1);
    else u.boards.push(boardId);
}

function saveSettings() {
    savePerms();
    if (currentBoard.value && !currentUser.value.boards.includes(currentBoard.value.id)) {
        closeBoard();
        toast('Access to the open board was removed — view closed', 'warn');
    }
    else if (view.value === 'board') {
        applyBoardFilter();
    }
    settingsOpen.value = false;
    toast('Permissions saved', 'ok');
}

// ---------------------------------------------------------------------------
// Efficiency profiles (Setup menu): per line, per product type efficiency
// ---------------------------------------------------------------------------
const PRODUCT_TYPES = [
    { name : '_Default',             color : '#e53935' },
    { name : '5 Pkt Pant',           color : '#1b3f8f' },
    { name : '5 Pkt Shorts',         color : '#7c6ce8' },
    { name : '5 Pocket',             color : '#b23434' },
    { name : '5 Pocket Long',        color : '#ffffff' },
    { name : '5 Pocket Short',       color : '#ffffff' },
    { name : 'Accessories',          color : '#8a8a2e' },
    { name : 'Adaptive Long Sleeve', color : '#ffffff' },
    { name : 'Bag',                  color : '#8a8a2e' },
    { name : 'Basic Shirt',          color : '#ffffff' },
    { name : 'Blazer',               color : '#ee82ee' },
    { name : 'Blouse',               color : '#2e9e3f' },
    { name : 'BLOUSON',              color : '#ffffff' },
    { name : 'Bottom',               color : '#bdbdbd' },
    { name : 'Boys Pant',            color : '#e8317f' }
];

// FastReact-style defaults: pocket family runs hotter, several types unset (0)
function defaultEffFor(name, base) {
    if (name === '_Default') return base;
    if (['5 Pocket', '5 Pocket Long', '5 Pocket Short'].includes(name)) return Math.min(200, base + 8);
    if (['Adaptive Long Sleeve', 'Basic Shirt', 'Blouse', 'Bottom'].includes(name)) return base;
    if (name === 'BLOUSON') return Math.max(0, base - 15);
    return 0;
}

const effOpen     = ref(false);
const effTab      = ref('define');   // 'define' | 'types'
const effSearch   = ref('');
const effSelected = ref(0);
const effNameInput = ref('');

function seedEffProfiles() {
    return LINES.map(l => ({
        id     : `p-${l.id}`,
        name   : `AQL ${l.name}`,
        values : Object.fromEntries(PRODUCT_TYPES.map(p => [p.name, defaultEffFor(p.name, l.eff)]))
    }));
}

const loadEffList = () => {
    try {
        const v = JSON.parse(localStorage.getItem('mbm-eff-list'));
        return Array.isArray(v) && v.length ? v : null;
    }
    catch {
        return null;
    }
};

const effList = ref(loadEffList() || seedEffProfiles());
const effSelectedProfileId = ref(effList.value[0]?.id || null);

const lineProfileMap = ref((() => {
    try {
        return JSON.parse(localStorage.getItem('mbm-line-prof')) ||
               Object.fromEntries(LINES.map(l => [l.id, `p-${l.id}`]));
    }
    catch {
        return Object.fromEntries(LINES.map(l => [l.id, `p-${l.id}`]));
    }
})());

// Bar tooltips (AppConfig) read profiles from localStorage — persist the
// seeded profiles right away so both sides always see the same values
if (!localStorage.getItem('mbm-eff-list') || !localStorage.getItem('mbm-line-prof')) {
    localStorage.setItem('mbm-eff-list', JSON.stringify(effList.value));
    localStorage.setItem('mbm-line-prof', JSON.stringify(lineProfileMap.value));
}

const selProfile = computed(() =>
    effList.value.find(p => p.id === effSelectedProfileId.value) || effList.value[0]);

function ensureProfileValues(p) {
    if (!p.values) p.values = {};
    for (const t of PRODUCT_TYPES) {
        if (p.values[t.name] === undefined) p.values[t.name] = defaultEffFor(t.name, 50);
    }
    return p;
}

// Product types that this line's efficiency profile actually has data for
// (efficiency > 0, excluding _Default)
function availableProductTypes(lineId) {
    const pid = lineId ? lineProfileMap.value[lineId] : null;
    const profile = (pid && effList.value.find(p => p.id === pid))
        || effList.value[0];
    const values = profile?.values || {};
    const named = Object.entries(values)
        .filter(([name, eff]) => name !== '_Default' && Number(eff) > 0)
        .map(([name]) => name);
    if (named.length) return named;
    return PRODUCT_TYPES.filter(t => t.name !== '_Default').map(t => t.name);
}

function productTypeFromProfile(po, lineId) {
    return stripProfileType({ po }, lineId);
}

const effRows = computed(() => {
    const p = selProfile.value;
    if (!p) return [];
    ensureProfileValues(p);
    const q = effSearch.value.trim().toLowerCase();
    return PRODUCT_TYPES
        .filter(t => !q || q === '*' || t.name.toLowerCase().includes(q))
        .map((t, i) => ({ ...t, idx : i, eff : p.values[t.name] ?? 0 }));
});

function saveEffState() {
    localStorage.setItem('mbm-eff-list', JSON.stringify(effList.value));
    localStorage.setItem('mbm-line-prof', JSON.stringify(lineProfileMap.value));
    // Mirror to the efficiency_profile table (line / product / eff% / smv)
    saveEffProfilesDb(buildEffProfileRows(getInstance()))
        .catch(() => { /* API offline - localStorage stays the source */ });
}

function openEffProfiles() {
    openMenu.value = null;
    effTab.value = 'define';
    if (!effSelectedProfileId.value && effList.value[0]) {
        effSelectedProfileId.value = effList.value[0].id;
    }
    effOpen.value = true;
    effMin.value = false;
}

function selectEffProfile(p) {
    effSelectedProfileId.value = p.id;
    effNameInput.value = p.name;
}

function effInsert() {
    const name = effNameInput.value.trim();
    if (!name) return;
    if (effList.value.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        toast(`"${name}" নামের profile আগে থেকেই আছে`, 'warn');
        return;
    }
    const p = ensureProfileValues({ id : `p${Date.now()}`, name, values : {} });
    effList.value.push(p);
    effSelectedProfileId.value = p.id;
    saveEffState();
    toast(`Profile "${name}" inserted — Product types tab-এ efficiency দিন`, 'ok');
}

function effDelete() {
    const p = selProfile.value;
    if (!p) return;
    effList.value = effList.value.filter(x => x.id !== p.id);
    for (const [lid, pid] of Object.entries(lineProfileMap.value)) {
        if (pid === p.id) delete lineProfileMap.value[lid];
    }
    effSelectedProfileId.value = effList.value[0]?.id || null;
    effNameInput.value = '';
    saveEffState();
    toast(`Profile "${p.name}" deleted`, 'ok');
}

function toggleLineAssign(lineId) {
    const p = selProfile.value;
    if (!p) return;
    if (lineProfileMap.value[lineId] === p.id) delete lineProfileMap.value[lineId];
    else lineProfileMap.value[lineId] = p.id;
}

function effCopyDown() {
    const p = selProfile.value;
    if (!p) return;
    const rows = effRows.value;
    const from = rows[effSelected.value] ?? rows[0];
    if (!from) return;
    let hit = false;
    for (const t of PRODUCT_TYPES) {
        if (t.name === from.name) {
            hit = true;
            continue;
        }
        if (hit) p.values[t.name] = p.values[from.name];
    }
    toast(`"${from.name}" এর efficiency (${p.values[from.name]}%) নিচের সব product type-এ কপি হলো`, 'ok');
}

function effUpdate() {
    const p = selProfile.value;
    if (!p) return;
    for (const k of Object.keys(p.values)) {
        p.values[k] = Math.max(0, Math.min(200, Number(p.values[k]) || 0));
    }
    saveEffState();

    // Apply: every line assigned to this profile takes its _Default as base
    const s = getInstance();
    const hrs = Math.max(0, ...Object.values(calendarState.days).map(c => hmToHours(c.hours)));
    const applied = [];
    for (const line of LINES) {
        if (lineProfileMap.value[line.id] !== p.id) continue;
        line.eff = p.values['_Default'];
        line.availMin = Math.round(line.manpower * hrs * 60 * line.eff / 100);
        const res = s?.resourceStore.getById(line.id);
        if (res) {
            res.set('eff', line.eff);
            res.set('availMin', line.availMin);
        }
        applied.push(line.name);
    }
    recalcCapacity(s);
    toast(applied.length
        ? `"${p.name}" saved — applied to ${applied.join(', ')} (default ${p.values['_Default']}%)`
        : `"${p.name}" saved — কোনো line-এ assign করা নেই`, 'ok');
}

// ---------------------------------------------------------------------------
// Build up (learning) curves - Setup menu, FastReact style
// ---------------------------------------------------------------------------
function seedBuildUps() {
    return [
        { id : 'bc1', name : '1 Day',      period : 1, pct : [100] },
        { id : 'bc2', name : '2 Days',     period : 2, pct : [60, 100] },
        { id : 'bc3', name : '3 Days',     period : 3, pct : [40, 70, 100] },
        { id : 'bc4', name : '4 Days',     period : 4, pct : [30, 55, 80, 100] },
        { id : 'bc5', name : '5 Days',     period : 5, pct : [25, 45, 65, 85, 100] },
        { id : 'bc6', name : 'MBM 2 Days', period : 2, pct : [50, 100] },
        { id : 'bc7', name : 'MBM 3 Days', period : 3, pct : [35, 70, 100] },
        { id : 'bc8', name : 'MBM 5 Days', period : 5, pct : [20, 40, 60, 80, 100] }
    ];
}

const loadBuildUps = () => {
    try {
        const v = JSON.parse(localStorage.getItem('mbm-buildup'));
        return Array.isArray(v) && v.length ? v : null;
    }
    catch {
        return null;
    }
};

const bcList       = ref(loadBuildUps() || seedBuildUps());
const bcOpen       = ref(false);
const bcMin        = ref(false);
const bcTab        = ref('define');
const bcSelectedId = ref(null);
const bcName       = ref('');
const bcPeriod     = ref(1);
const bcPct        = ref([0]);
const bcRenameSelId = ref(null);
const bcRenameInput = ref('');

watch(bcPeriod, n => {
    const len = Math.max(1, Math.min(60, Number(n) || 1));
    const arr = bcPct.value.slice(0, len);
    while (arr.length < len) arr.push(0);
    bcPct.value = arr;
});

function saveBuildUps() {
    localStorage.setItem('mbm-buildup', JSON.stringify(bcList.value));
    // Mirror to the learning_curve table (day number / efficiency %)
    saveLearningCurvesDb(buildLearningCurveRows())
        .catch(() => { /* API offline - localStorage stays the source */ });
}

function openBuildUps() {
    openMenu.value = null;
    bcTab.value = 'define';
    bcOpen.value = true;
    bcMin.value = false;
    if (!bcSelectedId.value && bcList.value[0]) selectBuildUp(bcList.value[0]);
}

function selectBuildUp(c) {
    bcSelectedId.value = c.id;
    bcName.value   = c.name;
    bcPeriod.value = c.period;
    bcPct.value    = [...c.pct];
}

function bcUpdate() {
    const name = bcName.value.trim();
    if (!name) {
        toast('Build up name দিন', 'warn');
        return;
    }
    const pct = bcPct.value.map(v => Math.max(0, Math.min(100, Number(v) || 0)));
    const existing = bcList.value.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existing) {
        existing.period = bcPeriod.value;
        existing.pct = pct;
        bcSelectedId.value = existing.id;
        toast(`Build up curve "${name}" updated`, 'ok');
    }
    else {
        const c = { id : `bc${Date.now()}`, name, period : bcPeriod.value, pct };
        bcList.value.push(c);
        bcSelectedId.value = c.id;
        toast(`Build up curve "${name}" added`, 'ok');
    }
    saveBuildUps();
}

function bcDelete() {
    const c = bcList.value.find(x => x.id === bcSelectedId.value);
    if (!c) return;
    bcList.value = bcList.value.filter(x => x.id !== c.id);
    bcSelectedId.value = bcList.value[0]?.id || null;
    if (bcList.value[0]) selectBuildUp(bcList.value[0]);
    else {
        bcName.value = '';
        bcPeriod.value = 1;
        bcPct.value = [0];
    }
    saveBuildUps();
    toast(`Build up curve "${c.name}" deleted`, 'ok');
}

const bcRenameCur = computed(() => bcList.value.find(c => c.id === bcRenameSelId.value) || null);

function bcRename() {
    const c = bcRenameCur.value;
    const name = bcRenameInput.value.trim();
    if (!c || !name) return;
    if (bcList.value.some(x => x.id !== c.id && x.name.toLowerCase() === name.toLowerCase())) {
        toast(`"${name}" নামে curve আগে থেকেই আছে`, 'warn');
        return;
    }
    const old = c.name;
    c.name = name;
    if (bcSelectedId.value === c.id) bcName.value = name;
    bcRenameInput.value = '';
    saveBuildUps();
    toast(`"${old}" renamed to "${name}"`, 'ok');
}

// ---------------------------------------------------------------------------
// Master data -> fastreact DB (efficiency_profile / learning_curve)
// Collected from the running software: efficiency profiles and build up
// curves. Synced on board load and whenever they are edited.
// (Line master data lives in planning_resources - no separate table.)
// ---------------------------------------------------------------------------
// Line + product type -> efficiency % from the assigned profile, with the
// average SMV of that product's strips currently planned on the line
function buildEffProfileRows(s) {
    const smvAgg = {};
    if (s) {
        for (const ev of s.eventStore.records) {
            const raw = ev.data.raw;
            if (!raw || raw.stage) continue;
            const lid = lineIdOf(s, ev);
            if (!LINE_BY_ID[lid]) continue;
            const pt = productTypeFromProfile(raw.po, lid);
            const smv = Number(raw.smv) || 0;
            if (smv > 0) (smvAgg[`${lid}|${pt}`] ||= []).push(smv);
        }
    }
    const rows = [];
    for (const l of LINES) {
        const pid = lineProfileMap.value[l.id];
        const profile = (pid && effList.value.find(p => p.id === pid)) || effList.value[0];
        if (!profile) continue;
        for (const [pt, eff] of Object.entries(profile.values || {})) {
            const arr = smvAgg[`${l.id}|${pt}`];
            rows.push({
                line        : l.name,
                profileName : profile.name,
                productType : pt,
                efficiency  : Number(eff) || 0,
                smv         : arr?.length
                    ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 100) / 100
                    : null
            });
        }
    }
    return rows;
}

// Build up curves flattened to one row per day: day number + efficiency %
function buildLearningCurveRows() {
    const rows = [];
    for (const c of bcList.value) {
        (c.pct || []).forEach((v, i) => rows.push({
            curveName  : c.name,
            periodDays : Number(c.period) || (c.pct?.length ?? 1),
            dayNumber  : i + 1,
            efficiency : Number(v) || 0
        }));
    }
    return rows;
}

function syncMasterData(s) {
    Promise.allSettled([
        saveEffProfilesDb(buildEffProfileRows(s)),
        saveLearningCurvesDb(buildLearningCurveRows())
    ]).then(results => {
        const failed = results.filter(r => r.status === 'rejected');
        if (failed.length) {
            console.warn('Master data sync failed:', failed.map(f => f.reason?.message));
        }
    });
}

// SVG polyline for the build up percentage chart
const bcChartPoints = computed(() => {
    const pct = bcPct.value.map(v => Math.max(0, Math.min(100, Number(v) || 0)));
    const n = pct.length;
    const W = 300, H = 180, PAD = 14;
    if (!n) return '';
    return pct.map((v, i) => {
        const x = PAD + (n === 1 ? (W - 2 * PAD) / 2 : (i * (W - 2 * PAD)) / (n - 1));
        const y = H - PAD - (v / 100) * (H - 2 * PAD);
        return `${Math.round(x)},${Math.round(y)}`;
    }).join(' ');
});

// Font Awesome icons (bundled with Bryntum) - SAP Fiori style shell
const shellMenus = [
    { label : 'Exit',     fa : 'fa-arrow-right-from-bracket', cls : 'fr-menu-exit' },
    { label : 'Orders',   fa : 'fa-clipboard-list' },
    { label : 'Reports',  fa : 'fa-chart-column' },
    { label : 'Planning', fa : 'fa-calendar-days' },
    { label : 'Setup',    fa : 'fa-sliders' },
    { label : 'Tools',    fa : 'fa-wrench' },
    { label : 'Repeat',   fa : 'fa-repeat' },
    { label : 'Help',     fa : 'fa-circle-question' }
];

function menuClick(m) {
    if (m.label === 'Planning' || m.label === 'Setup' || m.label === 'Reports') {
        openMenu.value = openMenu.value === m.label ? null : m.label;
        return;
    }
    openMenu.value = null;
    if (m.label === 'Exit') closeBoard();
    if (m.label === 'Orders') openOrders();
}

// ---------------------------------------------------------------------------
// Orders list: every order on the board with its documents, status,
// planned line and start / end dates
// ---------------------------------------------------------------------------
const ordersOpen    = ref(false);
const ordersRows    = ref([]);
const ordersLoading = ref(false); // true while background pages are still loading
const ordersTotal   = ref(0);     // total rows in DB
const currentUnitId = ref(null);  // unit_id of the active planning board

// Per-column filters (case-insensitive substring match on displayed text)
const ORDER_COLS = [
    'buyer', 'style', 'productType', 'mbmOrder', 'orderDelivery', 'orderQty',
    'po', 'color', 'pcd', 'poDelivery', 'orderType', 'status',
    'qty', 'smv', 'reqMin', 'line', 'start', 'end', 'progress'
];
const ORDER_COL_LABELS = {
    buyer : 'Buyer', style : 'Style', productType : 'Product',
    mbmOrder : 'MBM order', orderDelivery : 'Order delivery',
    orderQty : 'Order qty',
    po : 'PO', color : 'Color', pcd : 'PCD', poDelivery : 'PO delivery',
    orderType : 'Order type', status : 'Status',
    qty : 'Qty', smv : 'SMV', reqMin : 'Req. min',
    line : 'Line', start : 'Start', end : 'End', progress : 'Prog.'
};
const orderFilters = ref(Object.fromEntries(ORDER_COLS.map(k => [k, ''])));

function orderCellText(r, key) {
    const hidePoFields = r.orderType === 'projection';
    switch (key) {
        case 'po'            : return hidePoFields ? '' : String(r.po ?? '');
        case 'color'         : return hidePoFields ? '' : String(r.color ?? '');
        case 'qty'           : return fmtQty(r.qty);
        case 'orderQty'      : return fmtQty(r.orderQty);
        case 'reqMin'        : return fmtQty(r.reqMin);
        case 'pcd'           : return r.pcd ? fmtDateDdMonRr(r.pcd) : '—';
        case 'poDelivery'    : return hidePoFields ? '' : (r.poDelivery ? fmtDateDdMonRr(r.poDelivery) : '—');
        case 'orderDelivery' : return r.orderDelivery ? fmtDateDdMonRr(r.orderDelivery) : '—';
        case 'start'         : return r.start ? fmtDate(r.start) : '—';
        case 'end'           : return r.end ? fmtDate(r.end) : '—';
        case 'progress'      : return `${r.progress}%`;
        default              : return String(r[key] ?? '');
    }
}

const filteredOrders = computed(() =>
    ordersRows.value.filter(r => ORDER_COLS.every(k => {
        const q = (orderFilters.value[k] || '').trim().toLowerCase();
        return !q || orderCellText(r, k).toLowerCase().includes(q);
    }))
);

function clearOrderFilters() {
    orderFilters.value = Object.fromEntries(ORDER_COLS.map(k => [k, '']));
}

function listStatus(raw, planned) {
    if (!planned || raw?.status === 'unplanned') return 'unplanned';
    if (raw?.status === 'completed') return 'completed';
    return 'planned';
}

function collectOrders() {
    const s = getInstance();
    const rows = [];
    const onBoardPos = new Set();
    if (s) {
        for (const ev of s.eventStore.records) {
            const raw = ev.data.raw;
            if (!raw || raw.stage) continue;
            if (!String(raw.buyer || '').trim()) continue;
            const lid = lineIdOf(s, ev);
            const onHold = lid === 'hold' || !LINE_BY_ID[lid];
            const poDelivery = raw.ship ? new Date(raw.ship) : null;
            const smv  = Number(raw.smv) > 0 ? Number(raw.smv) : randSmv(raw.po);
            if (raw.po) onBoardPos.add(String(raw.po));
            rows.push({
                id : ev.id, planned : !onHold,
                po : raw.po, mbmOrder : mbmOrderNo(raw.po, raw.mbmOrder),
                buyer : raw.buyer, style : raw.style,
                productType : productTypeFromProfile(raw.po, onHold ? null : lid),
                color : orderColor(raw.po),
                orderQty : raw.orderQty ?? raw.qty,
                qty : raw.qty, smv, reqMin : Math.round(raw.qty * smv),
                pcd : raw.pcd ? new Date(raw.pcd) : (poDelivery ? addCalDays(poDelivery, -30) : null),
                poDelivery : onHold ? null : poDelivery,
                orderDelivery : poDelivery,
                orderType : orderTypeOf(raw.po),
                status : onHold ? 'unplanned' : listStatus(raw, true),
                line : onHold ? '—' : (s.resourceStore.getById(lid)?.name || lid),
                start : onHold ? null : ev.startDate,
                end : onHold ? null : ev.endDate,
                progress : raw.progress
            });
        }
    }
    for (const u of unplanned.value) {
        if (u.po && onBoardPos.has(String(u.po))) continue;
        if (!String(u.buyer || '').trim()) continue;
        const poDelivery = u.ship ? new Date(u.ship) : null;
        // Real SMV from planning_orders when present, demo fallback otherwise
        const smv  = Number(u.smv) > 0 ? Number(u.smv) : randSmv(u.po);
        rows.push({
            id : u.id, planned : false,
            po : u.po, mbmOrder : mbmOrderNo(u.po, u.mbmOrder),
            buyer : u.buyer, style : u.style,
            productType : productTypeFromProfile(u.po, u.suitable?.[0]),
            color : orderColor(u.po),
            orderQty : u.orderQty ?? u.qty,
            qty : u.qty, smv, reqMin : Math.round(u.qty * smv),
            pcd : u.pcd ? new Date(u.pcd) : (poDelivery ? addCalDays(poDelivery, -30) : null),
            poDelivery,
            orderDelivery : poDelivery,
            orderType : orderTypeOf(u.po),
            status : 'unplanned',
            line : '—', start : null, end : null, progress : 0
        });
    }
    rows.sort((a, b) => String(a.po).localeCompare(String(b.po)));
    return rows;
}

function openOrders() {
    // Show dialog immediately with whatever is already in memory
    ordersRows.value  = collectOrders();
    ordersOpen.value  = true;
    ordersMin.value   = false;
    ordersLoading.value = true;

    const FIRST = 100; // rows to show instantly
    const unitId = currentUnitId.value;
    loadUnplannedDbPaged(FIRST, (chunk, total, offset) => {
        ordersTotal.value = total;
        if (offset === 0) {
            // Replace with the fast first batch — instant display
            unplanned.value  = chunk;
        }
        else {
            // Append background chunks without replacing planned bars already on board
            const existingIds = new Set(unplanned.value.map(u => u.id));
            const fresh = chunk.filter(u => !existingIds.has(u.id));
            unplanned.value = [...unplanned.value, ...fresh];
        }
        ordersRows.value = collectOrders();
        // Hide spinner once all pages have arrived
        if (unplanned.value.length >= total) ordersLoading.value = false;
    }, unitId).catch(() => {
        ordersLoading.value = false;
    });
}

function isoInputDate(d) {
    const x = new Date(d);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}

function fmtDdMmYy(d) {
    if (!d) return '—';
    const x = new Date(d);
    return `${String(x.getDate()).padStart(2, '0')}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getFullYear()).slice(-2)}`;
}

function dpEsc(v) {
    return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function dpCmPerPc(po) {
    let h = 0;
    for (const c of String(po || '') + ':cm') h = ((h << 5) - h) + c.charCodeAt(0);
    return Math.round(50 + Math.abs(h) % 180) / 100;
}

function dpLineCode(res) {
    const m = String(res?.id || '').match(/^l(\d+)$/);
    const unit = res?.data?.unit || res?.unit || 'AQL';
    if (m) return `${unit}-A${Number(m[1])}`;
    return res?.name || '—';
}

function dpDayKey(d) {
    const x = new Date(d);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}

function dpEachDay(from, to) {
    const out = [];
    const d = new Date(from);
    d.setHours(0, 0, 0, 0);
    const end = new Date(to);
    end.setHours(0, 0, 0, 0);
    let guard = 0;
    while (d <= end && guard++ < 400) {
        out.push(new Date(d));
        d.setDate(d.getDate() + 1);
    }
    return out;
}

function dpStripDaily(ev, line) {
    const raw = ev.data.raw;
    const map = {};
    const availMin = (line?.availMin || Number(line?.data?.availMin) || 12000) * (raw.stripEff || 100) / 100;
    const smv = Math.max(0.1, Number(raw.smv) || randSmv(raw.po));
    const dailyTarget = Math.max(1, Math.floor(availMin / smv));
    let remaining = Number(raw.qty) || 0;
    const d = new Date(ev.startDate);
    d.setHours(0, 0, 0, 0);
    const end = new Date(ev.endDate);
    const days = [];
    let guard = 0;
    while (d < end && guard++ < 200) {
        const off = isOffDay(d);
        let q = 0;
        if (!off && remaining > 0) {
            q = Math.min(dailyTarget, remaining);
            remaining -= q;
        }
        days.push({ key : dpDayKey(d), q, off });
        d.setDate(d.getDate() + 1);
    }
    if (remaining > 0) {
        const lastW = [...days].reverse().find(x => !x.off);
        if (lastW) lastW.q += remaining;
    }
    for (const x of days) {
        if (x.q) map[x.key] = x.q;
    }
    return map;
}

const DP_META = [
    { k : 'floor',      label : 'Floor' },
    { k : 'line',       label : 'Line' },
    { k : 'buyer',      label : 'Buyer' },
    { k : 'mbm',        label : 'MBM No.' },
    { k : 'groupQty',   label : 'Group Qty', num : true },
    { k : 'style',      label : 'Style' },
    { k : 'itemName',   label : 'Item Name' },
    { k : 'code',       label : 'code' },
    { k : 'smv',        label : 'SMV', num : true },
    { k : 'description', label : 'Description' },
    { k : 'po',         label : 'PO' },
    { k : 'color',      label : 'Color' },
    { k : 'status',     label : 'Status' },
    { k : 'exFty',      label : 'Ex-fty' },
    { k : 'poQty',      label : 'PO Qty', num : true },
    { k : 'planQty',    label : 'Plan Qty', num : true },
    { k : 'allocQty',   label : 'Allocated Qty', num : true },
    { k : 'cmPc',       label : 'CM/Pc', num : true },
    { k : 'totalCm',    label : 'Total CM', num : true },
    { k : 'inputDate',  label : 'Input date' },
    { k : 'sewStart',   label : 'Sew Start' },
    { k : 'sewEnd',     label : 'Sew End' },
    { k : 'manpower',   label : 'Manpower', num : true },
    { k : 'planEff',    label : 'Plan Eff %', num : true },
    { k : 'metric',     label : 'Plan Qty' }
];

const dpOpen        = ref(false);
const dpMin         = ref(false);
const dpGenerated   = ref(false);
const dpFrom        = ref(isoInputDate(new Date()));
const dpTo          = ref(isoInputDate(addCalDays(new Date(), 13)));
const dpDates       = ref([]);
const dpGroups      = ref([]);
const dpGeneratedAt = ref('');

const dpUnitName = computed(() => dpGroups.value[0]?.floor || 'AQL');

const dpRangeLabel = computed(() =>
    `${fmtDdMmYy(new Date(dpFrom.value + 'T00:00:00'))} — ${fmtDdMmYy(new Date(dpTo.value + 'T00:00:00'))}`);

// Grand summary across every line: order counts, quantities, CM, manpower,
// plan-qty-weighted average efficiency and the day-wise grand totals
const dpGrand = computed(() => {
    const g = {
        orders : 0, lines : dpGroups.value.length,
        poQty : 0, planQty : 0, allocQty : 0, totalCm : 0,
        manpower : 0, avgEff : 0, rangeQty : 0, days : {}
    };
    let effSum = 0, effW = 0;
    for (const grp of dpGroups.value) {
        g.orders   += grp.rows.length;
        g.poQty    += grp.totals.poQty;
        g.planQty  += grp.totals.planQty;
        g.allocQty += grp.totals.allocQty;
        g.totalCm  += grp.totals.totalCm;
        g.manpower += grp.totals.manpower;
        for (const r of grp.rows) {
            effSum += r.planEff * r.planQty;
            effW   += r.planQty;
        }
        for (const [k, v] of Object.entries(grp.totals.days)) {
            g.days[k] = (g.days[k] || 0) + v;
        }
    }
    g.avgEff = effW ? Math.round(effSum / effW) : 0;
    g.rangeQty = Object.values(g.days).reduce((a, v) => a + v, 0);
    return g;
});

function openDayPlanReport() {
    openMenu.value = null;
    dpOpen.value = true;
    dpMin.value = false;
}

function generateDayPlan() {
    const s = getInstance();
    if (!s) {
        toast('Open a planning board first, then generate the report', 'warn');
        return;
    }
    const from = new Date(dpFrom.value + 'T00:00:00');
    const to   = new Date(dpTo.value + 'T23:59:59');
    if (!(from instanceof Date) || Number.isNaN(+from) || Number.isNaN(+to) || from > to) {
        toast('Select a valid date range', 'warn');
        return;
    }
    const dates = dpEachDay(from, to);
    if (dates.length > 92) {
        toast('Date range is too long — keep it within 3 months', 'warn');
        return;
    }

    const byLine = new Map();
    for (const ev of s.eventStore.records) {
        const raw = ev.data.raw;
        if (!raw || raw.stage) continue;
        if (!String(raw.buyer || '').trim()) continue;
        const lid = lineIdOf(s, ev);
        if (lid === 'hold' || !LINE_BY_ID[lid]) continue;
        const start = new Date(ev.startDate);
        const end   = new Date(ev.endDate);
        if (end < from || start > to) continue;

        const res  = s.resourceStore.getById(lid);
        const line = LINE_BY_ID[lid] || res?.data || {};
        const smv  = Number(raw.smv) || randSmv(raw.po);
        const qty  = Number(raw.qty) || 0;
        const poQty = Number(raw.orderQty ?? raw.qty) || 0;
        const cmPc = dpCmPerPc(raw.po);
        const pType = productTypeFromProfile(raw.po, lid);
        const orderType = orderTypeOf(raw.po);
        const status = raw.status === 'completed' ? 'Completed'
            : orderType === 'confirm' ? 'Confirmed' : 'Provisional';
        const pid = lineProfileMap.value[lid];
        const profile = (pid && effList.value.find(p => p.id === pid)) || effList.value[0];
        // Product type value from the profile when present (> 0), else _Default
        const typeEff = Number(profile?.values?.[pType]);
        const baseEff = typeEff > 0
            ? typeEff
            : Number(profile?.values?._Default) || Number(line.eff) || 0;
        const planEff = Math.round(baseEff * (raw.stripEff || 100) / 100);

        const row = {
            floor       : res?.data?.unit || line.unit || 'AQL',
            line        : dpLineCode(res),
            buyer       : raw.buyer,
            mbm         : mbmOrderNo(raw.po),
            groupQty    : poQty,
            style       : raw.style || '—',
            itemName    : pType,
            code        : String(raw.po || '').replace(/\D/g, '').slice(-6) || '—',
            smv,
            description : pType,
            po          : raw.po || '—',
            color       : orderColor(raw.po),
            status,
            exFty       : fmtDdMmYy(raw.ship),
            poQty,
            planQty     : qty,
            allocQty    : qty,
            cmPc,
            totalCm     : Math.round(qty * cmPc * 100) / 100,
            inputDate   : fmtDdMmYy(raw.matReady || start),
            sewStart    : fmtDdMmYy(start),
            sewEnd      : fmtDdMmYy(end),
            manpower    : Number(res?.data?.manpower ?? line.manpower) || 0,
            planEff,
            metric      : 'Plan Qty',
            days        : dpStripDaily(ev, line)
        };

        if (!byLine.has(lid)) {
            byLine.set(lid, {
                lineId   : lid,
                floor    : row.floor,
                line     : row.line,
                sort     : LINES.findIndex(l => l.id === lid),
                rows     : [],
                totals   : {
                    poQty : 0, planQty : 0, allocQty : 0, totalCm : 0,
                    manpower : row.manpower, avgEff : 0, effSum : 0, effW : 0, days : {}
                }
            });
        }
        const g = byLine.get(lid);
        g.rows.push(row);
        g.totals.poQty += row.poQty;
        g.totals.planQty += row.planQty;
        g.totals.allocQty += row.allocQty;
        g.totals.totalCm += row.totalCm;
        g.totals.effSum += row.planEff * row.planQty;
        g.totals.effW   += row.planQty;
        g.totals.avgEff = g.totals.effW ? Math.round(g.totals.effSum / g.totals.effW) : 0;
        for (const [k, v] of Object.entries(row.days)) {
            g.totals.days[k] = (g.totals.days[k] || 0) + v;
        }
    }

    dpDates.value = dates;
    dpGroups.value = [...byLine.values()].sort((a, b) => a.sort - b.sort);
    dpGenerated.value = true;
    dpGeneratedAt.value = fmtClock(new Date());
    const n = dpGroups.value.reduce((a, g) => a + g.rows.length, 0);
    toast(n ? `Day Plan Report — ${n} order(s) in range` : 'No planned orders in this date range', n ? 'ok' : 'warn');
}

function dpCell(row, col) {
    const v = row[col.k];
    if (col.num) {
        if (col.k === 'cmPc' || col.k === 'totalCm') return Number(v).toFixed(2);
        return fmtQty(v);
    }
    return v ?? '—';
}

function dpDayVal(days, d) {
    const v = days?.[dpDayKey(d)];
    return v ? fmtQty(v) : '-';
}

function dpDayRaw(days, d) {
    return days?.[dpDayKey(d)] || 0;
}

function dpBuildTableHtml() {
    const totalsFor = (t, lineLabel, floorLabel) => DP_META.map(c => {
        let v = '';
        if (c.k === 'floor') v = floorLabel;
        else if (c.k === 'line') v = lineLabel;
        else if (c.k === 'poQty') v = fmtQty(t.poQty);
        else if (c.k === 'planQty') v = fmtQty(t.planQty);
        else if (c.k === 'allocQty') v = fmtQty(t.allocQty);
        else if (c.k === 'totalCm') v = t.totalCm.toFixed(2);
        else if (c.k === 'manpower') v = fmtQty(t.manpower);
        else if (c.k === 'planEff') v = String(t.avgEff);
        else if (c.k === 'metric' && t.dayLabel) v = t.dayLabel;
        return `<td${c.num ? ' style="text-align:right;font-weight:bold"' : ' style="font-weight:bold"'}>${dpEsc(v)}</td>`;
    }).join('');
    const daysFor = (days, cls) => dpDates.value.map(d => {
        const v = days[dpDayKey(d)];
        return `<td style="text-align:right;font-weight:bold${cls || ''}">${v ? fmtQty(v) : '-'}</td>`;
    }).join('');

    const th = [...DP_META.map(c => `<th>${dpEsc(c.label)}</th>`),
        ...dpDates.value.map(d => `<th>${fmtDdMmYy(d)}</th>`)].join('');
    const body = dpGroups.value.map(g => {
        const data = g.rows.map(r => {
            const meta = DP_META.map(c => `<td${c.num ? ' style="text-align:right"' : ''}>${dpEsc(dpCell(r, c))}</td>`).join('');
            const days = dpDates.value.map(d => `<td style="text-align:right">${dpEsc(dpDayVal(r.days, d))}</td>`).join('');
            return `<tr>${meta}${days}</tr>`;
        }).join('');
        return data + `<tr class="dp-total">${totalsFor(g.totals, `${g.line} Total`, g.floor)}${daysFor(g.totals.days)}</tr>`;
    }).join('');
    const grand = dpGrand.value;
    const grandRow = dpGroups.value.length
        ? `<tr class="dp-grand">${totalsFor({ ...grand, dayLabel : 'Day total' }, 'All lines', dpUnitName.value)}${daysFor(grand.days)}</tr>`
        : '';
    const range = dpRangeLabel.value;
    const summary = `<div style="margin:4px 0 8px;font-size:9pt">
        Orders: <b>${grand.orders}</b> · Lines: <b>${grand.lines}</b> ·
        Plan Qty: <b>${fmtQty(grand.planQty)}</b> · Qty in range: <b>${fmtQty(grand.rangeQty)}</b> ·
        Total CM: <b>${grand.totalCm.toFixed(2)}</b> · Avg Eff: <b>${grand.avgEff}%</b></div>`;
    return {
        unit  : dpUnitName.value,
        range,
        summary,
        table : `<table border="1" cellspacing="0" cellpadding="3"><thead><tr>${th}</tr></thead><tbody>${body}${grandRow}</tbody></table>`
    };
}

function exportDayPlanExcel() {
    if (!dpGenerated.value) {
        toast('Generate the report first', 'warn');
        return;
    }
    const { unit, range, summary, table } = dpBuildTableHtml();
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head><meta charset="UTF-8">
<style>
  table { border-collapse: collapse; font-family: Calibri, Arial, sans-serif; font-size: 9pt; }
  th, td { border: 1px solid #000; white-space: nowrap; }
  th { background: #17356b; color: #fff; font-weight: bold; }
  .dp-total td { font-weight: bold; background: #f2f2f2; border-top: 2px solid #000; border-bottom: 2px solid #000; }
  .dp-grand td { font-weight: bold; background: #dbe5f1; border-top: 3px double #000; border-bottom: 3px double #000; }
</style>
</head>
<body>
<h2 style="margin:0">${dpEsc(unit)}</h2>
<h3 style="margin:2px 0">Day Plan Report — ${dpEsc(range)}</h3>
${summary}
${table}
</body></html>`;
    const blob = new Blob(['\uFEFF' + html], { type : 'application/vnd.ms-excel' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `DayPlanReport_${dpFrom.value}_${dpTo.value}.xls`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
    toast('Excel file downloaded', 'ok');
}

function exportDayPlanPdf() {
    if (!dpGenerated.value) {
        toast('Generate the report first', 'warn');
        return;
    }
    const { unit, range, summary, table } = dpBuildTableHtml();
    const w = window.open('', '_blank');
    if (!w) {
        toast('Allow pop-ups to export PDF', 'warn');
        return;
    }
    w.document.write(`<!doctype html><html><head><meta charset="UTF-8"><title>Day Plan Report — ${dpEsc(unit)}</title>
<style>
  @page { size: A3 landscape; margin: 8mm; }
  body { font-family: Arial, sans-serif; font-size: 8pt; color: #000; }
  .rep-head { text-align: center; border-bottom: 2px solid #17356b; margin-bottom: 6px; padding-bottom: 4px; }
  .rep-head h2 { margin: 0; font-size: 14pt; color: #17356b; }
  .rep-head h3 { margin: 2px 0; font-size: 11pt; }
  .rep-head .rng { font-size: 9pt; color: #333; }
  table { border-collapse: collapse; width: max-content; }
  th, td { border: 1px solid #000; padding: 2px 4px; white-space: nowrap; }
  th { background: #17356b; color: #fff; }
  .dp-total td { font-weight: bold; background: #f2f2f2; border-top: 2px solid #000; border-bottom: 2px solid #000; }
  .dp-grand td { font-weight: bold; background: #dbe5f1; border-top: 3px double #000; border-bottom: 3px double #000; }
</style></head><body>
<div class="rep-head">
  <h2>${dpEsc(unit)}</h2>
  <h3>Day Plan Report</h3>
  <div class="rng">Date range: ${dpEsc(range)}</div>
</div>
${summary}
${table}
<script>window.onload = function () { window.print(); }<\/script>
</body></html>`);
    w.document.close();
}

// ---------------------------------------------------------------------------
// Daily production update: line-wise actual output per day. Saved quantities
// are subtracted on the board - the strip shows the remaining pieces.
// ---------------------------------------------------------------------------
const puOpen = ref(false);
const puMin  = ref(false);
const puDate = ref(isoInputDate(new Date()));
const puRows = ref([]);

const loadProdStore = () => {
    try { return JSON.parse(localStorage.getItem('mbm-prod-updates') || '{}'); }
    catch { return {}; }
};

const madeOf = (store, evId) =>
    Object.values(store[evId] || {}).reduce((a, v) => a + (Number(v) || 0), 0);

// Push saved production totals into the strips: progress % and remaining.
// FastReact behaviour: the produced part is CUT OFF the front of the bar -
// the bar gets shorter from the left while the future days stay unchanged.
function applyProdUpdates(s) {
    if (!s) return;
    const store = loadProdStore();
    for (const ev of s.eventStore.records) {
        const raw = ev.data.raw;
        if (!raw || raw.stage) continue;
        const made = madeOf(store, String(ev.id));
        if (!made && !raw.made) continue;
        raw.made = made;
        raw.progress = raw.qty ? Math.min(100, Math.round(made / raw.qty * 100)) : 0;
        ev.set?.('percentDone', raw.progress);

        const lid  = lineIdOf(s, ev);
        const line = LINE_BY_ID[lid];
        if (!line || made <= 0) continue;

        // The original planned start stays as the base - every apply
        // recomputes the cut from it (never shrinks twice)
        if (!raw.origStart) raw.origStart = new Date(ev.startDate);

        // Day target: same distribution the Day Plan Report uses
        const availMin = (line.availMin || 12000) * (raw.stripEff || 100) / 100;
        const smv      = Math.max(0.1, Number(raw.smv) || randSmv(raw.po));
        const target   = Math.max(1, Math.floor(availMin / smv));

        const end = new Date(ev.endDate);
        let rem = made;
        let newStart = null;
        const d = new Date(raw.origStart);
        let guard = 0;
        while (rem > 0 && guard++ < 200) {
            if (!isOffDay(d)) {
                if (rem >= target) {
                    rem -= target;      // whole day produced - cut the full day
                }
                else {
                    // Partial day: cut the produced fraction of the work window
                    const sw = startOfWorkDay(d);
                    const ew = endOfWorkDay(d);
                    newStart = new Date(sw.getTime() + (rem / target) * (ew.getTime() - sw.getTime()));
                    rem = 0;
                    break;
                }
            }
            d.setDate(d.getDate() + 1);
            if (d >= end) break;
        }
        if (!newStart) newStart = startOfWorkDay(nextWorkingDay(d));
        if (newStart >= end) newStart = new Date(end.getTime() - 3600000);

        if (Math.abs(newStart - ev.startDate) > 60000) {
            ev.set({
                startDate : newStart,
                endDate   : end,
                duration  : elapsedDays(newStart, end)
            });
            raw.start = newStart;
        }
    }
    s.refreshRows?.();
    // Repaint the Grand totals footer with the freshly loaded data - the
    // renderer caches its maps and would otherwise keep pre-load numbers
    refreshGrandTotals(s);
}

function openProdUpdate() {
    openMenu.value = null;
    buildPuRows();
    puOpen.value = true;
    puMin.value = false;
}

// Strips running on the selected date, one row per line/strip
function buildPuRows() {
    const s = getInstance();
    const store = loadProdStore();
    const rows = [];
    if (s) {
        const day = new Date(puDate.value + 'T12:00:00');
        for (const ev of s.eventStore.records) {
            const raw = ev.data.raw;
            if (!raw || raw.stage) continue;
            if (!String(raw.buyer || '').trim()) continue;
            const lid = lineIdOf(s, ev);
            if (!LINE_BY_ID[lid]) continue;
            const dayStart = new Date(ev.startDate);
            dayStart.setHours(0, 0, 0, 0);
            if (day < dayStart || day > ev.endDate) continue;
            const res  = s.resourceStore.getById(lid);
            const line = LINE_BY_ID[lid];
            const made = madeOf(store, String(ev.id));
            rows.push({
                evId     : String(ev.id),
                dbId     : ev.data.dbId ?? null,
                unit     : res?.data?.unit || line.unit || 'AQL',
                floor    : res?.data?.floor || line.floor || '—',
                line     : res?.name || lid,
                opType   : 'Sewing',
                style    : raw.style || '—',
                order    : mbmOrderNo(raw.po),
                po       : raw.po || '—',
                color    : orderColor(raw.po),
                orderQty : raw.qty,
                planQty  : dpStripDaily(ev, line)[dpDayKey(day)] || 0,
                made,
                rest     : Math.max(0, (Number(raw.qty) || 0) - made),
                prodQty  : store[String(ev.id)]?.[puDate.value] ?? ''
            });
        }
    }
    rows.sort((a, b) => String(a.line).localeCompare(String(b.line)) || String(a.po).localeCompare(String(b.po)));
    puRows.value = rows;
}

function saveProdUpdate() {
    const s = getInstance();
    if (!s) return;
    const store = loadProdStore();
    const entries = puRows.value.filter(r => r.prodQty !== '' && r.prodQty != null);
    if (!entries.length) {
        toast('Prod Qty ঘরে actual production দিন — তারপর Save', 'warn');
        return;
    }
    for (const r of entries) {
        if (!store[r.evId]) store[r.evId] = {};
        store[r.evId][puDate.value] = Math.max(0, Number(r.prodQty) || 0);
    }
    localStorage.setItem('mbm-prod-updates', JSON.stringify(store));
    applyProdUpdates(s);
    buildPuRows();

    // Persist to the fastreact DB (day_production_update_plan)
    const payload = entries.map(r => ({
        eventId       : r.dbId,
        eventRef      : r.evId,
        unit          : r.unit,
        floor         : r.floor,
        line          : r.line,
        operationType : r.opType,
        style         : r.style,
        orderNo       : r.order,
        po            : r.po,
        color         : r.color,
        orderQty      : r.orderQty,
        dayPlanQty    : r.planQty,
        prodQty       : Math.max(0, Number(r.prodQty) || 0),
        saveDate      : puDate.value
    }));
    saveProdUpdatesDb(payload)
        .then(res => toast(`Production saved to fastreact DB (day_production_update_plan) — ${res.saved} row(s), strips updated`, 'ok'))
        .catch(e => toast(`DB save failed (${e.message}) — saved locally only`, 'warn'));
}

watch(puDate, () => {
    if (puOpen.value) buildPuRows();
});

function showOrderOnBoard(row) {
    if (!row.planned) {
        toast(`${row.po} is unplanned — open a board and drag it from the Unplanned panel`, 'warn');
        return;
    }
    ordersOpen.value = false;
    if (view.value !== 'board') {
        openBoard(currentBoard.value || permittedBoards.value[0] || boards.value[0]);
    }
    setTimeout(() => {
        const s   = getInstance();
        const rec = s?.eventStore.getById(row.id);
        if (rec) {
            s.selectEvent?.(rec);
            s.scrollEventIntoView?.(rec, { animate : true, block : 'center' });
            uiHooks.onOrderSelect?.(rec);
        }
    }, 500);
}

// ---------------------------------------------------------------------------
// FastReact pick & place: click a bar -> it follows the cursor; click a line
// to re-establish it there. The header cell live-indicates the hover time.
// ---------------------------------------------------------------------------
// shallowRef: a deep ref would wrap the Bryntum record in a reactive Proxy
// and break identity comparisons against store records
const carried  = shallowRef(null);
const ghostPos = ref({ x : 0, y : 0 });
let carriedPrevCls = '';
let pickStamp      = 0;
const lastMouse    = { x : 400, y : 300 };

const RISK_COLORS = {
    green : '#43a047', yellow : '#f9a825', orange : '#fb8c00',
    red : '#e53935', grey : '#9e9e9e', blue : '#1e88e5'
};

const colorKeyOf = raw =>
    raw.status === 'completed' ? 'grey'
  : raw.risk?.level === 'draft' || raw.status === 'draft' ? 'blue'
  : ({ low : 'green', moderate : 'yellow', high : 'orange', critical : 'red' }[raw.risk?.level] || 'green');

const fmtClock = d => {
    const W = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
    let h = d.getHours();
    const am = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const p2 = n => String(n).padStart(2, '0');
    return `${W} ${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${h}:${p2(d.getMinutes())}:${p2(d.getSeconds())} ${am}`;
};

const idleFormula = '0.0 x 0:00 x 0 = 0.000';
const CLOCK_DEFAULT = () => `${fmtClock(new Date())}<br>${idleFormula}`;

function setClock(html) {
    const el = document.getElementById('mb-hover-clock');
    if (el) el.innerHTML = html;
}

function onSchedMouseMove(e) {
    lastMouse.x = e.clientX;
    lastMouse.y = e.clientY;
    const s = getInstance();
    if (!s) return;
    let date = null, res = null;
    try {
        date = s.getDateFromDomEvent(e);
        res  = s.resolveResourceRecord(e);
    }
    catch { /* pointer outside the time axis */ }
    if (!date) {
        setClock(CLOCK_DEFAULT());
        return;
    }
    let line2 = idleFormula;
    if (res?.data?.lineRow) {
        const r   = res.data;
        const hrs = calendarState.days[date.getDay()]?.hours ?? '10:00';
        line2 = `${Number(r.manpower).toFixed(1)} x ${hrs} x ${r.eff} = ${Number(r.availMin).toFixed(3)}`;
    }
    setClock(`${fmtClock(date)}<br>${line2}`);
}

function onSchedMouseLeave() {
    setClock(CLOCK_DEFAULT());
}

function trackGhost(e) {
    ghostPos.value = { x : e.clientX, y : e.clientY };
}

function escCancel(e) {
    if (e.key === 'Escape') cancelCarry();
}

function pickUp(rec, domEvent) {
    const raw = rec.data.raw;
    if (!raw || raw.stage || raw.status === 'completed') return;
    carried.value = rec;
    pickStamp     = performance.now();
    // The bar leaves its old place while carried - only the ghost remains
    carriedPrevCls = String(rec.data.cls || '');
    rec.set('cls', `${carriedPrevCls} mb-carried-away`.trim());
    ghostPos.value = domEvent
        ? { x : domEvent.clientX, y : domEvent.clientY }
        : { x : lastMouse.x, y : lastMouse.y };
    window.addEventListener('mousemove', trackGhost);
    window.addEventListener('keydown', escCancel);
    toast(`${rec.name} picked up — click any line/time to place it (Esc cancels)`, 'ok');
}

function restoreCarriedCls() {
    const rec = carried.value;
    if (rec) rec.set('cls', carriedPrevCls);
}

function cancelCarry() {
    restoreCarriedCls();
    carried.value = null;
    window.removeEventListener('mousemove', trackGhost);
    window.removeEventListener('keydown', escCancel);
}

// Fallback row resolution from the pointer Y position - guarantees the bar
// lands on the row the cursor is over even when the click target is a range
// or canvas element that Bryntum cannot map to a row
function resourceFromY(s, clientY, clientX) {
    const x = clientX ?? lastMouse.x;
    try {
        const el = document.elementFromPoint(x, clientY);
        const rowEl = el?.closest?.('.b-grid-row');
        if (rowEl) {
            const rec = s.getRecordFromElement?.(rowEl)
                || s.resourceStore.getById(rowEl.dataset.id);
            if (rec) return rec;
        }
    }
    catch { /* fall through */ }
    const body = s.element?.querySelector('.b-grid-sub-grid-normal');
    if (!body) return null;
    const rect = body.getBoundingClientRect();
    const yInBody = clientY - rect.top + (s.scrollable?.y ?? s.scrollTop ?? 0);
    const idx = Math.floor(yInBody / (s.rowHeight || 48));
    return idx >= 0 ? s.resourceStore.getAt(idx) : null;
}

// Placement handled directly on the board wrapper so a click anywhere in the
// timeline places the carried bar (Bryntum's own scheduleClick never fires on
// manpower-band or hatched-range elements)
function onSchedClick(e) {
    if (!carried.value) return;
    if (performance.now() - pickStamp < 250) return; // ignore the pick-up click itself
    const s = getInstance();
    if (!s) return;
    let date = null, res = null;
    try {
        date = s.getDateFromDomEvent(e);
        res  = s.resolveResourceRecord(e);
    }
    catch { /* outside the time axis */ }
    const fromY = resourceFromY(s, e.clientY, e.clientX);
    if (fromY) res = fromY;
    placeCarried(date, res).catch(err => toast(`Placement failed: ${err.message}`, 'error'));
}

async function placeCarried(date, resourceRecord) {
    const s   = getInstance();
    const rec = carried.value;
    if (!s || !rec) return;
    if (!date) {
        toast('Could not read a date at that position — click inside the timeline', 'warn');
        return;
    }
    const raw = rec.data.raw;

    if (resourceRecord?.data?.subtotalRow || resourceRecord?.id === 'subtot') {
        toast('Cannot place orders on the Subtotal row', 'error');
        return;
    }
    const parkHold = isHoldingRes(resourceRecord);
    if (!parkHold && !isSewingRes(resourceRecord) && !resourceRecord?.data?.lineRow) {
        toast('Place the bar on a sewing line or the Holding Row', 'error');
        return;
    }
    if (!parkHold && raw.suitable?.length && !raw.suitable.includes(resourceRecord.id)) {
        toast(`${resourceRecord.name} is not the usual line for ${raw.po} — placed anyway`, 'warn');
    }

    const targetId = parkHold ? 'hold' : resourceRecord.id;

    let start, end, note = null;
    if (parkHold) {
        start = startOfWorkDay(date);
        end   = endOfWork(start, raw.dur || 1);
        raw.status = 'unplanned';
    }
    else {
        const inserted = computeInsertStart(s, targetId, date, raw.dur, rec.id);
        start = inserted.start;
        end   = inserted.end;
        if (inserted.snapped)   note = 'off day — starts at the next working day\'s first hour';
        if (inserted.blockedBy) note = `${inserted.blockedBy} occupies that point — attached right after it`;
        if (raw.matReady && start < raw.matReady) {
            toast(`Material for ${raw.po} is not ready before ${fmtDate(raw.matReady)}`, 'error');
            return;
        }
        if (raw.status === 'unplanned') raw.status = 'draft';
    }

    const assignment = s.assignmentStore.records.find(a =>
        (a.eventId ?? a.data.eventId ?? a.data.event) === rec.id);
    if (assignment) {
        assignment.set('resourceId', targetId);
    }
    else {
        s.assignmentStore.add({ eventId : rec.id, resourceId : targetId });
    }
    rec.data.resourceId = targetId;
    rec.set({ startDate : start, endDate : end, duration : elapsedDays(start, end), resourceId : targetId });
    restoreCarriedCls();
    raw.start = start;
    raw.end   = end;
    if (!parkHold) {
        const pushedCnt = pushFollowers(s, targetId, rec);
        if (pushedCnt) {
            toast(`${pushedCnt} following order(s) shifted later to make room`, 'warn');
        }
        const mergedInfo = tryMergeAdjacent(s, rec, targetId);
        if (mergedInfo) {
            toast(`${mergedInfo.po}: adjacent strips joined into one (${fmtQty(mergedInfo.qty)} pcs)`, 'ok');
        }
    }
    const util = recalcCapacity(s) || {};
    raw.risk = calcRisk({
        start, end,
        ship     : raw.ship,
        matReady : raw.matReady,
        lineUtil : parkHold ? 0 : (util[targetId] ?? 0),
        status   : raw.status
    });
    cancelCarry();
    toast(`${rec.name} placed on ${resourceRecord.name} at ${fmtClock(start)}${note ? ' (' + note + ')' : ''}`, 'ok');
    s.refreshWithTransition?.();
}

// ---------------------------------------------------------------------------
// Calendars dialog (FastReact style): weekday working hours configuration
// ---------------------------------------------------------------------------
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const CAL_ORDER = [1, 2, 3, 4, 5, 6, 0]; // display Monday..Sunday

const calOpen = ref(false);
const calName = ref(calendarState.name);
const calRows = ref([]);

function openCalendars() {
    calName.value = calendarState.name;
    calRows.value = CAL_ORDER.map(d => ({
        d,
        label : DAY_NAMES[d],
        start : calendarState.days[d].start,
        hours : calendarState.days[d].hours,
        ot    : calendarState.days[d].ot
    }));
    calOpen.value = true;
    calMin.value = false;
}

const totalHours = () => {
    const mins = calRows.value.reduce((a, r) => a + Math.round(hmToHours(r.hours) * 60), 0);
    return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
};

// Push the configured calendar onto the board: off-day hatching, event
// rescheduling, line capacity and the day-wise manpower band
function applyCalendarToBoard() {
    calendarState.offDays = new Set(
        Object.keys(calendarState.days)
            .filter(d => hmToHours(calendarState.days[d].hours) <= 0)
            .map(Number)
    );
    const s = getInstance();
    if (!s) return;

    const intervals = [...calendarState.offDays].map(d => ({
        recurrentStartDate : `on ${DAY_NAMES[d]} at 0:00`,
        recurrentEndDate   : `on ${DAY_NAMES[(d + 1) % 7]} at 0:00`,
        isWorking          : false
    }));
    s.project.calendarManagerStore.data = [{ id : 'factory', name : calendarState.name, intervals }];
    s.project.calendar = 'factory';

    // Visible day window on the axis = calendar start -> work hours + OT
    const workCfgs = Object.values(calendarState.days).filter(c => hmToHours(c.hours) > 0);
    if (workCfgs.length) {
        const fromHour = Math.floor(Math.min(...workCfgs.map(c => hmToHours(c.start))));
        const toHour   = Math.ceil(Math.max(...workCfgs.map(c =>
            hmToHours(c.start) + hmToHours(c.hours) + hmToHours(c.ot))));
        s.workingTime = { fromHour, toHour : Math.min(24, Math.max(fromHour + 1, toHour)) };
    }

    // Standard day = longest configured working day
    const hrs = Math.max(0, ...Object.values(calendarState.days).map(c => hmToHours(c.hours)));
    for (const l of LINES) {
        l.availMin = Math.round(l.manpower * hrs * 60 * l.eff / 100);
    }
    for (const res of s.resourceStore.records) {
        const l = LINES.find(x => x.id === res.id);
        if (l && res.data.lineRow) res.set('availMin', l.availMin);
    }

    s.project.resourceTimeRangeStore.data = buildManpowerRanges(
        s.resourceStore.records
            .filter(r => r.data.lineRow)
            .map(r => ({ id : r.id, manpower : r.data.manpower }))
    );

    // Off-day column crosshatch (keep the current-time line record)
    const keep = s.project.timeRangeStore.records
        .filter(r => r.id === 'currentTime')
        .map(r => ({ ...r.data }));
    s.project.timeRangeStore.data = [...keep, ...buildOffDayRanges()];

    // Reflow every bar to the new calendar (FastReact rule): starts snap off
    // 0-hour days, ends stretch so off days are never counted as work
    let reflowed = 0;
    for (const rec of s.eventStore.records) {
        const raw = rec.data.raw;
        if (!raw || raw.stage) continue;
        const sd  = startOfWorkDay(nextWorkingDay(rec.startDate));
        const end = endOfWork(sd, raw.dur);
        if (sd.getTime() !== rec.startDate.getTime() || end.getTime() !== rec.endDate.getTime()) {
            rec.set({ startDate : sd, endDate : end, duration : elapsedDays(sd, end) });
            raw.start = sd;
            raw.end   = end;
            reflowed++;
        }
    }
    if (reflowed) {
        toast(`${reflowed} order bar(s) rescheduled around the off days`, 'ok');
    }

    recalcCapacity(s);
    s.refreshWithTransition?.();
}

async function updateCalendar() {
    for (const r of calRows.value) {
        calendarState.days[r.d] = { start : r.start, hours : r.hours, ot : r.ot };
    }
    calendarState.name = calName.value;
    applyCalendarToBoard();

    const off = [...calendarState.offDays].map(d => DAY_NAMES[d]).join(', ') || 'none';
    toast(`Calendar "${calendarState.name}" applied — off days: ${off}`, 'ok');

    if (dataSource.value === 'db') {
        try {
            const res = await fetch(`${API_BASE}/calendars/1`, {
                method  : 'PUT',
                headers : { 'Content-Type' : 'application/json' },
                body    : JSON.stringify({ name : calendarState.name, days : calendarState.days })
            });
            const j = await res.json();
            if (j.success) toast('Calendar saved to fastreact DB (planning_calendar_intervals)', 'ok');
            else toast(`Calendar save failed: ${j.error}`, 'error');
        }
        catch (e) {
            toast(`Calendar save failed: ${e.message}`, 'error');
        }
    }
}

let toastId = 0;

const getInstance = () => {
    const i = schedRef.value?.instance;
    return i?.value ?? i ?? null;
};

function toast(text, type = 'error') {
    const id = ++toastId;
    toasts.value.push({ id, text, type });
    setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id);
    }, 5000);
}

onMounted(() => {
    uiHooks.onOrderSelect = eventRecord => {
        const raw = eventRecord?.data?.raw;
        if (raw) order.value = raw;
    };
    uiHooks.onSelectionClear = () => { order.value = null; };
    uiHooks.onToast = toast;

    // Right-click -> Planned schedule on a strip
    uiHooks.onOpenSchedule = rec => {
        plRec.value = rec;
        plPeriod.value = 'daily';
        plOpen.value = true;
        plMin.value = false;
    };

    // Right-click -> Properties on a strip
    uiHooks.onOpenProps = rec => {
        propsRec.value = rec;
        const raw = rec.data.raw;
        propsForm.value = {
            stripEff     : raw.stripEff || 100,
            keepSeparate : !!raw.keepSeparate,
            profileEff   : readProfileEff(raw, lineIdOf(getInstance(), rec))
        };
        propsOpen.value = true;
        propsMin.value = false;
    };

    // FastReact pick & place wiring
    uiHooks.onBarClick = ev => {
        const dom = ev.event || ev.domEvent;
        if (carried.value) {
            const s = getInstance();
            let date = null, res = null;
            try {
                date = s.getDateFromDomEvent(dom);
                res  = s.resolveResourceRecord(dom);
            }
            catch { /* outside axis */ }
            placeCarried(date, res).catch(e => toast(`Placement failed: ${e.message}`, 'error'));
        }
        else {
            pickUp(ev.eventRecord, dom);
        }
    };
    uiHooks.onScheduleClick = ev => {
        if (carried.value) {
            placeCarried(ev.date, ev.resourceRecord).catch(e => toast(`Placement failed: ${e.message}`, 'error'));
        }
    };

    // After a split, the new (split-off) bar sticks to the cursor so the
    // user can point-and-place it anywhere (FastReact behaviour)
    uiHooks.onCarryNew = rec => pickUp(rec, null);

    // Dev-console access for diagnostics
    window.__mbm = { pickUp, placeCarried, cancelCarry, carried, uiHooks };

    const s = getInstance();
    uiHooks.instance = s;
    if (s) {
        recalcCapacity(s);
        removeOrdersWithoutBuyer(s);
        applyProdUpdates(s);
        s.scrollToDate?.(currentBoardDate(), { block : 'start' });
        s.eventStore.on({
            change() {
                recalcCapacity(s);
                updateFrVScroll(s);
            }
        });
        installFrVScroll(s);
        s.on?.({
            paint() { installFrVScroll(s); },
            resize() { updateFrVScroll(s); }
        });
    }

    // Try the MySQL-backed API (172.16.101.70 / fastreact); fall back to demo
    loadFromApi().then(data => {
        if (!s) return;
        s.project.loadInlineData({
            resources          : data.resources,
            events             : data.events,
            dependencies       : data.dependencies,
            resourceTimeRanges : data.resourceTimeRanges
        });
        unplanned.value = (data.unplanned || []).filter(u => String(u.buyer || '').trim());
        currentUnitId.value = data.unitId || null;
        planMeta.value = {
            name    : data.project.name,
            status  : data.project.status,
            version : data.project.version
        };
        dataSource.value = 'db';
        if (data.calendarDays) {
            Object.assign(calendarState.days, data.calendarDays);
            if (data.calendarName) calendarState.name = data.calendarName;
            applyCalendarToBoard();
        }
        recalcCapacity(s);
        removeOrdersWithoutBuyer(s);
        applyProdUpdates(s);
        scrollBoardToToday(s);
        installFrVScroll(s);
        // Push today's line snapshot + efficiency profiles + learning curves
        // into their fastreact tables (collected from the running board)
        syncMasterData(s);
        toast(`Connected: ${data.project.name} from fastreact DB @ 172.16.101.70`, 'ok');

        const liveOnBoard = s.eventStore.records.some(ev => ev.data.raw?.mbmOrder);
        if (!liveOnBoard && unplanned.value.length) {
            planLiveOrders();
        }

        // Pull saved daily production from day_production_update_plan and
        // apply it to the strips (DB is the source of truth across users)
        loadProdUpdatesDb().then(rows => {
            const store = loadProdStore();
            for (const r of rows) {
                const key  = String(r.event_ref);
                const date = String(r.save_date).slice(0, 10);
                if (!store[key]) store[key] = {};
                store[key][date] = Number(r.prod_qty) || 0;
            }
            localStorage.setItem('mbm-prod-updates', JSON.stringify(store));
            applyProdUpdates(s);
        }).catch(() => { /* endpoint offline - local data stays */ });
    }).catch(err => {
        dataSource.value = 'demo';
        toast(`Planning API/DB offline (${err.message}) — showing local demo data`, 'warn');
    });

    // Reopen the board that was open before the reload (until the user
    // closes or minimizes it explicitly)
    try {
        const saved = JSON.parse(localStorage.getItem('mbm-board-view') || 'null');
        if (saved?.boardId) {
            const b = permittedBoards.value.find(x => x.id === saved.boardId);
            if (b && saved.min) {
                currentBoard.value = b;
                boardMin.value = true;
            }
            else if (b && saved.view === 'board') {
                openBoard(b);
            }
        }
    }
    catch { /* corrupt saved state - stay on home */ }
});

async function saveToDb() {
    const s = getInstance();
    if (!s) return;
    if (dataSource.value !== 'db') {
        toast('Not connected to the fastreact database — nothing saved', 'warn');
        return;
    }
    try {
        const res = await syncToApi(s);
        if (res.success) toast(`Plan saved to fastreact DB (revision ${res.revision})`, 'ok');
        else toast(`Save failed: ${res.error}`, 'error');
    }
    catch (e) {
        toast(`Save failed: ${e.message}`, 'error');
    }
}

// --------------------------------------------------------------------------
// Drag from the unplanned panel onto the board (documents 3.2 + 11)
// --------------------------------------------------------------------------
function onDragStart(e, o) {
    e.dataTransfer.setData('text/plain', o.id);
    e.dataTransfer.effectAllowed = 'copy';
}

function onSchedulerDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

function onSchedulerDrop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const o  = unplanned.value.find(u => u.id === id);
    const s  = getInstance();
    if (!o || !s) return;

    const resource = s.resolveResourceRecord(e);
    const date     = s.getDateFromDomEvent(e, 'floor');
    const result   = planOrderDrop(s, o, resource, date);

    result.errors.forEach(msg => toast(msg, 'error'));
    result.warnings.forEach(msg => toast(msg, 'warn'));

    if (result.ok) {
        unplanned.value = unplanned.value.filter(u => u.id !== id);
        toast(`${o.po} planned on ${resource.name}`, 'ok');
    }
}

// --------------------------------------------------------------------------
// Toolbar
// --------------------------------------------------------------------------
function currentBoardDate() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    if (d < VIEW_START) return VIEW_START;
    if (d >= VIEW_END) {
        const last = new Date(VIEW_END);
        last.setDate(last.getDate() - 1);
        return last;
    }
    return d;
}

function scrollBoardToToday(s) {
    s?.scrollToDate?.(currentBoardDate(), { block : 'start' });
}

const FR_VSCROLL_HTML = `
    <button type="button" class="fr-vscroll-btn fr-vscroll-up" aria-label="Scroll up"></button>
    <div class="fr-vscroll-track"><div class="fr-vscroll-thumb"></div></div>
    <button type="button" class="fr-vscroll-btn fr-vscroll-down" aria-label="Scroll down"></button>
`;

function vScrollMetrics(s) {
    const sc = s?.scrollable;
    const rm = s?.rowManager;
    const y = Number(sc?.y ?? s?.scrollTop ?? 0) || 0;
    const view = Number(
        sc?.clientHeight ?? rm?.viewHeight ?? s?.bodyHeight
    ) || 1;
    let max = Number(sc?.maxY);
    if (!Number.isFinite(max) || max < 0) {
        const total = Number(
            sc?.scrollHeight
            ?? rm?.totalFixedHeight
            ?? ((s?.resourceStore?.count || 0) * (s?.rowHeight || 48))
        );
        max = Math.max(0, total - view);
    }
    return { sc, y, max, view };
}

function setScrollY(s, next) {
    const { sc, max } = vScrollMetrics(s);
    const y = Math.max(0, Math.min(max, next));
    if (!sc) return;
    sc.y = y;
}

function updateFrVScroll(s) {
    const bar = s?.element?.querySelector('.fr-vscroll');
    if (!bar) return;
    const thumb = bar.querySelector('.fr-vscroll-thumb');
    const track = bar.querySelector('.fr-vscroll-track');
    if (!thumb || !track) return;
    const { y, max, view } = vScrollMetrics(s);
    const trackH = track.clientHeight || 1;
    const thumbH = max <= 0 ? trackH : Math.max(24, Math.round(trackH * view / (view + max)));
    const top = max <= 0 ? 0 : Math.round((y / max) * (trackH - thumbH));
    thumb.style.height = `${thumbH}px`;
    thumb.style.top = `${top}px`;
    bar.classList.toggle('fr-vscroll-idle', max <= 0);
}

function bindFrVScroll(s, bar) {
    if (bar.dataset.bound) return;
    bar.dataset.bound = '1';
    const up = bar.querySelector('.fr-vscroll-up');
    const down = bar.querySelector('.fr-vscroll-down');
    const track = bar.querySelector('.fr-vscroll-track');
    const thumb = bar.querySelector('.fr-vscroll-thumb');
    const step = () => s.rowHeight || 48;

    const hold = (dir) => {
        const tick = () => setScrollY(s, vScrollMetrics(s).y + dir * step());
        tick();
        const t = setTimeout(() => {
            const i = setInterval(tick, 40);
            const stop = () => {
                clearInterval(i);
                window.removeEventListener('mouseup', stop);
            };
            window.addEventListener('mouseup', stop);
        }, 280);
        const cancel = () => {
            clearTimeout(t);
            window.removeEventListener('mouseup', cancel);
        };
        window.addEventListener('mouseup', cancel);
    };
    up?.addEventListener('mousedown', e => { e.preventDefault(); hold(-1); });
    down?.addEventListener('mousedown', e => { e.preventDefault(); hold(1); });

    track?.addEventListener('mousedown', e => {
        if (e.target === thumb) return;
        e.preventDefault();
        const { y, view } = vScrollMetrics(s);
        const page = view * 0.9;
        const goingUp = e.clientY < thumb.getBoundingClientRect().top;
        setScrollY(s, goingUp ? y - page : y + page);
    });

    thumb?.addEventListener('mousedown', e => {
        e.preventDefault();
        e.stopPropagation();
        const startY = e.clientY;
        const startScroll = vScrollMetrics(s).y;
        const onMove = ev => {
            const { max } = vScrollMetrics(s);
            const range = (track.clientHeight - thumb.offsetHeight) || 1;
            setScrollY(s, startScroll + (ev.clientY - startY) / range * max);
        };
        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    });

    bar.addEventListener('wheel', e => {
        e.preventDefault();
        setScrollY(s, vScrollMetrics(s).y + e.deltaY);
    }, { passive : false });

    s.scrollable?.on?.({
        scroll() { updateFrVScroll(s); }
    });
}

function installFrVScroll(s) {
    if (!s?.element) return;
    s.element.classList.add('mb-fr-vscroll-on');
    s.element.querySelectorAll('.b-grid-splitter').forEach(split => {
        const parent = split.parentElement;
        if (!parent || parent.querySelector(':scope > .fr-vscroll, :scope > .fr-vscroll-pad')) return;
        const isBody = parent.classList.contains('b-grid-vertical-scroller');
        if (isBody) {
            const bar = document.createElement('div');
            bar.className = 'fr-vscroll';
            bar.innerHTML = FR_VSCROLL_HTML;
            split.before(bar);
            bindFrVScroll(s, bar);
        }
        else {
            const pad = document.createElement('div');
            pad.className = 'fr-vscroll-pad';
            split.before(pad);
        }
    });
    requestAnimationFrame(() => {
        updateFrVScroll(s);
        installFrHScroll(s);
    });
}

function installFrHScroll(s) {
    if (!s?.element) return;
    let bar = s.element.querySelector(':scope > .b-gridbase .fr-hscroll, .fr-hscroll');
    const body = s.element.querySelector('.b-grid-body-container');
    const foot = s.element.querySelector('.b-grid-footer-container');
    if (!body) return;
    if (!bar) {
        bar = document.createElement('div');
        bar.className = 'fr-hscroll';
        bar.innerHTML = `
            <button type="button" class="fr-hscroll-btn fr-hscroll-left" aria-label="Scroll left"></button>
            <div class="fr-hscroll-track"><div class="fr-hscroll-thumb"></div></div>
            <button type="button" class="fr-hscroll-btn fr-hscroll-right" aria-label="Scroll right"></button>
        `;
        if (foot) foot.before(bar);
        else body.after(bar);
        bindFrHScroll(s, bar);
    }
    requestAnimationFrame(() => updateFrHScroll(s));
}

function hScrollMetrics(s) {
    const sc = s?.scrollable;
    const x = Number(sc?.x ?? 0) || 0;
    const view = Number(sc?.clientWidth ?? s?.timeAxisSubGrid?.width) || 1;
    let max = Number(sc?.maxX);
    if (!Number.isFinite(max) || max < 0) {
        max = Math.max(0, Number(sc?.scrollWidth || 0) - view);
    }
    return { sc, x, max, view };
}

function setScrollX(s, next) {
    const { sc, max } = hScrollMetrics(s);
    if (!sc) return;
    sc.x = Math.max(0, Math.min(max, next));
}

function updateFrHScroll(s) {
    const bar = s?.element?.querySelector('.fr-hscroll');
    if (!bar) return;
    const thumb = bar.querySelector('.fr-hscroll-thumb');
    const track = bar.querySelector('.fr-hscroll-track');
    if (!thumb || !track) return;
    const { x, max, view } = hScrollMetrics(s);
    const trackW = track.clientWidth || 1;
    const thumbW = max <= 0 ? trackW : Math.max(32, Math.round(trackW * view / (view + max)));
    const left = max <= 0 ? 0 : Math.round((x / max) * (trackW - thumbW));
    thumb.style.width = `${thumbW}px`;
    thumb.style.left = `${left}px`;
}

function bindFrHScroll(s, bar) {
    if (bar.dataset.bound) return;
    bar.dataset.bound = '1';
    const left = bar.querySelector('.fr-hscroll-left');
    const right = bar.querySelector('.fr-hscroll-right');
    const track = bar.querySelector('.fr-hscroll-track');
    const thumb = bar.querySelector('.fr-hscroll-thumb');
    const step = () => s.tickSize || 72;

    const hold = (dir) => {
        const tick = () => setScrollX(s, hScrollMetrics(s).x + dir * step());
        tick();
        const t = setTimeout(() => {
            const i = setInterval(tick, 40);
            const stop = () => {
                clearInterval(i);
                window.removeEventListener('mouseup', stop);
            };
            window.addEventListener('mouseup', stop);
        }, 280);
        const cancel = () => {
            clearTimeout(t);
            window.removeEventListener('mouseup', cancel);
        };
        window.addEventListener('mouseup', cancel);
    };
    left?.addEventListener('mousedown', e => { e.preventDefault(); hold(-1); });
    right?.addEventListener('mousedown', e => { e.preventDefault(); hold(1); });

    track?.addEventListener('mousedown', e => {
        if (e.target === thumb) return;
        e.preventDefault();
        const { x, view } = hScrollMetrics(s);
        const goingLeft = e.clientX < thumb.getBoundingClientRect().left;
        setScrollX(s, goingLeft ? x - view * 0.9 : x + view * 0.9);
    });

    thumb?.addEventListener('mousedown', e => {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.clientX;
        const startScroll = hScrollMetrics(s).x;
        const onMove = ev => {
            const { max } = hScrollMetrics(s);
            const range = (track.clientWidth - thumb.offsetWidth) || 1;
            setScrollX(s, startScroll + (ev.clientX - startX) / range * max);
        };
        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    });

    bar.addEventListener('wheel', e => {
        if (Math.abs(e.deltaX) < Math.abs(e.deltaY) && !e.shiftKey) return;
        e.preventDefault();
        setScrollX(s, hScrollMetrics(s).x + (e.shiftKey ? e.deltaY : e.deltaX));
    }, { passive : false });

    s.scrollable?.on?.({
        scroll() {
            updateFrVScroll(s);
            updateFrHScroll(s);
        }
    });
}

function hZoom(delta) {
    const s = getInstance();
    if (!s) return;
    const keep = s.visibleDateRange?.startDate || currentBoardDate();
    const next = Math.max(40, Math.min(220, (s.tickSize || 96) + delta));
    s.tickSize = next;
    s.scrollToDate?.(keep, { block : 'start' });
    requestAnimationFrame(() => updateFrHScroll(s));
}

function vZoom(delta) {
    const s = getInstance();
    if (!s) return;
    s.rowHeight = Math.max(32, Math.min(110, (s.rowHeight || 56) + delta));
    requestAnimationFrame(() => updateFrVScroll(s));
}

const act = name => {
    if (name === 'colorMenu') {
        colorMenuOpen.value = !colorMenuOpen.value;
        return;
    }
    if (name === 'save') {
        saveToDb();
        return;
    }
    if (name === 'calendars') {
        openCalendars();
        return;
    }
    if (name === 'close') {
        closeBoard();
        return;
    }
    if (name === 'home') {
        scrollBoardToToday(getInstance());
        return;
    }
    const s = getInstance();
    if (!s) return;
    switch (name) {
        case 'hZoomOut' : hZoom(-20); break;
        case 'hZoomIn'  : hZoom(20); break;
        case 'vZoomIn'  : vZoom(8); break;
        case 'vZoomOut' : vZoom(-8); break;
        case 'print'    : window.print(); break;
        case 'undo'     : s.project.stm?.canUndo && s.project.stm.undo(); break;
        case 'redo'     : s.project.stm?.canRedo && s.project.stm.redo(); break;
        default         : break;
    }
};

const colorModes = [
    { icon : '⚠', label : 'Risk status', mode : 'risk' },
    { icon : '👕', label : 'Buyer',       mode : 'buyer' },
    { icon : '🏷', label : 'Plan status', mode : 'status' }
];

const pickColorMode = m => {
    colorMode.value = m;
    colorState.mode = m;
    colorMenuOpen.value = false;
    const s = getInstance();
    s?.refreshWithTransition?.() ?? s?.refreshRows?.();
};

const boardSearch = ref('');
watch(boardSearch, q => {
    searchState.query = q;
    const s = getInstance();
    s?.refreshWithTransition?.() ?? s?.refreshRows?.();
});

const toolbar = [
    { fa : 'fa-xmark', cls : 'fr-tb-red', title : 'Close view', action : 'close' },
    { fa : 'fa-house', title : 'Go to current date', action : 'home' },
    { sep : true },
    { fa : 'fa-magnifying-glass-minus', title : 'Horizontal zoom out — narrower days', action : 'hZoomOut' },
    { fa : 'fa-magnifying-glass-plus',  title : 'Horizontal zoom in — wider days', action : 'hZoomIn' },
    { fa : 'fa-angles-up',   title : 'Vertical zoom in — taller rows', action : 'vZoomIn' },
    { fa : 'fa-angles-down', title : 'Vertical zoom out — shorter rows', action : 'vZoomOut' },
    { sep : true },
    { fa : 'fa-palette', caret : true, title : 'Colour by', action : 'colorMenu', anchor : true },
    { fa : 'fa-print', title : 'Print', action : 'print' },
    { sep : true },
    { fa : 'fa-rotate-left',  title : 'Undo', action : 'undo' },
    { fa : 'fa-rotate-right', title : 'Redo', action : 'redo' },
    { sep : true },
    { fa : 'fa-floppy-disk', cls : 'fr-tb-save', title : 'Save plan to fastreact DB', action : 'save' },
    { fa : 'fa-calendar-days', title : 'Calendars (working days / hours)', action : 'calendars' }
];

const prioCls = p => p === 1 ? 'mb-prio-1' : p === 2 ? 'mb-prio-2' : 'mb-prio-3';
</script>

<template>
    <div class="fr-app">
        <!-- FastReact-style main menu (always visible) -->
        <div class="fr-menubar" @click.self="openMenu = null">
            <span v-for="m in shellMenus" :key="m.label" class="fr-menu-wrap">
                <span
                    class="fr-menu"
                    :class="[{ 'fr-menu-active' : openMenu === m.label }, m.cls]"
                    @click="menuClick(m)"
                >
                    <i class="fa-solid fr-menu-fa" :class="m.fa" aria-hidden="true"></i>{{ m.label }}
                </span>
                <div v-if="openMenu === m.label && m.label === 'Reports'" class="fr-dropdown">
                    <div class="fr-dd-item" @click="openDayPlanReport">
                        <i class="fa-solid fa-file-lines fr-dd-fa" aria-hidden="true"></i> Day Plan Report
                    </div>
                    <div class="fr-dd-item" @click="openProdUpdate">
                        <i class="fa-solid fa-industry fr-dd-fa" aria-hidden="true"></i> Daily production update
                    </div>
                </div>
                <div v-if="openMenu === m.label && m.label === 'Planning'" class="fr-dropdown">
                    <div class="fr-dd-item" @click="planLiveOrders">
                        <i class="fa-solid fa-route fr-dd-fa" aria-hidden="true"></i>
                        Plan live orders (PCD / delivery / critical path)
                    </div>
                    <div class="fr-dd-item" @click="openPlanGenerator">🧮 Plan generator (S2)</div>
                    <div class="fr-dd-sep"></div>
                    <div
                        v-for="b in permittedBoards"
                        :key="b.id"
                        class="fr-dd-item"
                        @click="openBoard(b)"
                    >🗓 {{ b.name }}</div>
                    <div v-if="!permittedBoards.length" class="fr-dd-item fr-dd-dim">No boards permitted for {{ currentUser?.name }}</div>
                    <div class="fr-dd-sep"></div>
                    <div class="fr-dd-item" @click="addBoard">➕ Add planning board</div>
                </div>
                <div v-if="openMenu === m.label && m.label === 'Setup'" class="fr-dropdown">
                    <div class="fr-dd-item" @click="openSettings">⚙️ Settings — users &amp; permissions</div>
                    <div class="fr-dd-item" @click="openEffProfiles">📊 Efficiency profiles</div>
                    <div class="fr-dd-item" @click="openBuildUps">📈 Build up / Learning curves</div>
                </div>
            </span>
        </div>

        <!-- Empty home workspace (FastReact shell) -->
        <div v-if="view === 'home'" class="fr-home">
            <div class="fr-home-empty" @click="openMenu = null"></div>
            <div class="fr-statusbar">
                <span class="fr-status-cell fr-status-ready">Ready</span>
                <span class="fr-status-cell fr-status-wide"></span>
                <span class="fr-status-cell">{{ currentUser?.name }} · {{ currentUser?.role }}</span>
                <span class="fr-status-cell">{{ permittedBoards.length }} board(s) permitted</span>
                <span class="fr-status-cell fr-status-wide"></span>
                <span class="fr-status-cell">{{ dataSource === 'db' ? 'DB: 172.16.101.70/fastreact' : 'demo data' }}</span>
            </div>
        </div>

        <!-- Planning board view (parked off-screen when hidden so the
             scheduler keeps real dimensions and never collapses) -->
        <div class="fr-boardarea" :class="{ 'fr-board-hidden' : view !== 'board' }">
        <!-- Plan banner -->
        <div class="fr-banner">
            <span class="mb-banner-title">AQL ({{ currentUser?.role === 'Management' ? 'Read only access' : 'Planning' }} — in use by {{ currentUser?.name }})</span>
            <span class="mb-banner-sub">{{ planMeta.name }}</span>
            <span class="fr-banner-btns">
                <span class="fr-banner-btn" title="Minimize board" @click="minimizeBoard">—</span>
                <span class="fr-banner-btn fr-banner-x" title="Close board" @click="closeBoard">✕</span>
            </span>
        </div>

        <!-- Toolbar -->
        <div class="fr-toolbar">
            <template v-for="(b, i) in toolbar" :key="i">
                <span v-if="b.sep" class="fr-tb-sep"></span>
                <span v-else-if="b.anchor" class="fr-tb-anchor">
                    <button class="fr-tb-btn" :class="b.cls" :title="b.title" @click="act(b.action)">
                        <i class="fa-solid fr-tb-fa" :class="b.fa" aria-hidden="true"></i>
                        <span v-if="b.caret" class="fr-tb-caret">▾</span>
                    </button>
                    <div v-if="colorMenuOpen" class="fr-colormenu">
                        <div
                            v-for="c in colorModes"
                            :key="c.mode"
                            class="fr-colormenu-item"
                            :class="{ 'fr-colormenu-active' : c.mode === colorMode }"
                            @click="pickColorMode(c.mode)"
                        >
                            <span class="fr-colormenu-ico">{{ c.icon }}</span>{{ c.label }}
                        </div>
                    </div>
                </span>
                <button v-else class="fr-tb-btn" :class="b.cls" :title="b.title" @click="b.action && act(b.action)">
                    <i class="fa-solid fr-tb-fa" :class="b.fa" aria-hidden="true"></i>
                </button>
            </template>
            <label class="fr-tb-search">
                <i class="fa-solid fa-magnifying-glass fr-tb-search-ico" aria-hidden="true"></i>
                <input
                    v-model="boardSearch"
                    type="search"
                    placeholder="Search buyer, PO, style…"
                >
            </label>
        </div>

        <!-- Board -->
        <div class="mb-main">
            <div
                class="mb-sched-wrap"
                :class="{ 'mb-carrying' : carried }"
                @dragover="onSchedulerDragOver"
                @drop="onSchedulerDrop"
                @mousemove="onSchedMouseMove"
                @mouseleave="onSchedMouseLeave"
                @click="onSchedClick"
            >
                <bryntum-scheduler-pro ref="schedRef" v-bind="schedulerProConfig" class="fr-sched" />
            </div>
        </div>

        <!-- Order detail panel : values when a bar is selected, labels otherwise -->
        <div v-if="order" class="fr-orderbar">
            <div class="fr-order-row">
                <span class="fr-order-label"><span class="fr-order-ico">🧵</span><u>Order</u></span>
                <span class="fr-cell fr-plain"><b>{{ order.po }}</b></span>
                <span class="fr-cell fr-link">{{ order.buyer }} · {{ order.style }}</span>
                <span class="fr-cell fr-plain">{{ fmtQty(order.qty) }} pcs</span>
                <span class="fr-cell fr-plain">SMV {{ order.smv }}</span>
                <span class="fr-cell fr-link">{{ fmtQty(order.reqMin) }} min</span>
                <span class="fr-cell fr-plain">{{ order.dur }} day(s)</span>
                <span class="fr-cell fr-link fr-magenta">Ship {{ fmtDate(order.ship) }}</span>
            </div>
            <div class="fr-order-row">
                <span class="fr-order-label">-</span>
                <span class="fr-cell fr-plain">Progress {{ order.progress }}%</span>
                <span class="fr-cell fr-plain">Status: {{ order.status }}</span>
                <span class="fr-cell fr-plain">Material {{ fmtDate(order.matReady) }}</span>
                <span class="fr-cell fr-plain">Risk {{ order.risk.score }} ({{ order.risk.level }})</span>
                <span class="fr-cell fr-link fr-wide">{{ order.risk.reasons.join(' · ') }}</span>
            </div>
        </div>
        <div v-else class="fr-orderbar">
            <div class="fr-order-row">
                <span class="fr-order-label"><span class="fr-order-ico">🧵</span><span class="fr-link">Order</span></span>
                <span class="fr-cell fr-plain">PO</span>
                <span class="fr-cell fr-link">Buyer · Style</span>
                <span class="fr-cell fr-plain">Quantity</span>
                <span class="fr-cell fr-plain">SMV</span>
                <span class="fr-cell fr-link">Required minutes</span>
                <span class="fr-cell fr-plain">Production days</span>
                <span class="fr-cell fr-link fr-magenta">Shipment date</span>
            </div>
            <div class="fr-order-row">
                <span class="fr-order-label">Select a bar</span>
                <span class="fr-cell fr-plain">Progress</span>
                <span class="fr-cell fr-plain">Plan status</span>
                <span class="fr-cell fr-plain">Material ready</span>
                <span class="fr-cell fr-plain">Risk score</span>
                <span class="fr-cell fr-link fr-wide">Risk reasons</span>
            </div>
        </div>

        <div class="fr-legendbar">
            <div class="fr-leg-col"><i class="fr-leg-dot fr-leg-red"></i><b>Product/Order</b><span>Qty made, Started</span></div>
            <div class="fr-leg-col"><b>Order Quantity</b></div>
            <div class="fr-leg-col"><b>Product</b><span>Customer</span></div>
            <div class="fr-leg-col"><b>Earliest load</b><span>Delivery date</span></div>
            <div class="fr-leg-col"><b>Float</b><span>Float</span></div>
            <div class="fr-leg-col"><b>Load date</b><span>Production end date</span></div>
            <div class="fr-leg-col"><b>Order description</b><span>Transport details</span></div>
            <div class="fr-leg-col fr-leg-last">
                <b>Change mins, Work &amp; Cal days</b>
                <span>Eff% Plan, Strip, Order, Result</span>
            </div>
        </div>

        </div><!-- /fr-boardarea -->

        <!-- Orders list: all orders with documents, status, line, dates -->
        <div v-if="ordersOpen && !ordersMin" class="cal-overlay" @click.self="ordersOpen = false">
            <div class="cal-dialog od-dialog">
                <div class="cal-title">
                    Orders — {{ filteredOrders.length }} / {{ ordersRows.length }} order(s)
                    <span v-if="ordersLoading" style="font-size:12px;color:#888;margin-left:10px;">
                        ⏳ loading {{ ordersTotal > 0 ? ordersTotal : '…' }} total…
                    </span>
                    <span class="cal-title-btns">
                        <span class="cal-x cal-minbtn" @click="ordersMin = true">—</span>
                        <span class="cal-x" @click="ordersOpen = false">✕</span>
                    </span>
                </div>
                <div class="st-body od-body">
                    <table class="st-table od-table">
                        <thead>
                            <tr>
                                <th
                                    v-for="k in ORDER_COLS"
                                    :key="k"
                                    :class="{ 'od-num' : k === 'qty' || k === 'orderQty' || k === 'smv' || k === 'reqMin' || k === 'progress' }"
                                >{{ ORDER_COL_LABELS[k] }}</th>
                            </tr>
                            <tr class="od-filterrow">
                                <th v-for="k in ORDER_COLS" :key="k">
                                    <input
                                        v-model="orderFilters[k]"
                                        class="od-filter"
                                        type="text"
                                        placeholder="🔍"
                                    >
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="row in filteredOrders"
                                :key="row.id"
                                class="od-row"
                                :title="row.planned ? 'Click to show this order on the board' : 'Unplanned order'"
                                @click="showOrderOnBoard(row)"
                            >
                                <td
                                    v-for="k in ORDER_COLS"
                                    :key="k"
                                    :class="{ 'od-num' : k === 'qty' || k === 'orderQty' || k === 'smv' || k === 'reqMin' || k === 'progress', 'st-user' : k === 'po' }"
                                >
                                    <span
                                        v-if="k === 'color' && row.orderType !== 'projection' && row.color"
                                        class="od-color"
                                        :class="'od-color-' + (row.color || '').toLowerCase()"
                                    >{{ row.color }}</span>
                                    <span
                                        v-else-if="k === 'orderType'"
                                        class="od-status"
                                        :class="row.orderType === 'confirm' ? 'od-ord-confirm' : 'od-ord-proj'"
                                    >{{ row.orderType }}</span>
                                    <span
                                        v-else-if="k === 'status'"
                                        class="od-status"
                                        :class="`od-${row.status}`"
                                    >{{ row.status }}</span>
                                    <template v-else>{{ orderCellText(row, k) || '—' }}</template>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="st-hint od-hintrow">
                        <span>Planned order-এ click করলে board-এ সেই bar টা দেখাবে · unplanned order গুলো Unplanned panel থেকে drag করুন</span>
                        <button class="cal-btn st-btn od-clear" @click="clearOrderFilters">✕ Clear filters</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Day Plan Report: board orders by line with daily planned qty -->
        <div v-if="dpOpen && !dpMin" class="cal-overlay" @click.self="dpOpen = false">
            <div class="cal-dialog od-dialog dp-dialog">
                <div class="cal-title">
                    Day Plan Report
                    <span class="cal-title-btns">
                        <span class="cal-x cal-minbtn" @click="dpMin = true">—</span>
                        <span class="cal-x" @click="dpOpen = false">✕</span>
                    </span>
                </div>
                <div class="dp-toolbar">
                    <label class="dp-range">From
                        <input v-model="dpFrom" class="cal-in dp-date" type="date">
                    </label>
                    <label class="dp-range">To
                        <input v-model="dpTo" class="cal-in dp-date" type="date">
                    </label>
                    <button class="dp-act dp-act-gen" @click="generateDayPlan">⚙ Generate</button>
                    <button class="dp-act dp-act-xls" :disabled="!dpGenerated" @click="exportDayPlanExcel">📊 Excel</button>
                    <button class="dp-act dp-act-pdf" :disabled="!dpGenerated" @click="exportDayPlanPdf">📄 PDF</button>
                    <span class="dp-flex"></span>
                    <button class="dp-act dp-act-close" @click="dpOpen = false">✕ Close</button>
                </div>
                <div class="st-body od-body dp-body">
                    <template v-if="dpGenerated">
                        <div class="dp-rephead">
                            <div class="dp-rep-unit">{{ dpUnitName }}</div>
                            <div class="dp-rep-title">Day Plan Report</div>
                            <div class="dp-rep-range">{{ dpRangeLabel }} <span class="dp-rep-dim">· Generated {{ dpGeneratedAt }}</span></div>
                        </div>
                        <div class="dp-cards">
                            <div class="dp-card"><b>{{ dpGrand.orders }}</b><span>Orders</span></div>
                            <div class="dp-card"><b>{{ dpGrand.lines }}</b><span>Lines</span></div>
                            <div class="dp-card"><b>{{ fmtQty(dpGrand.planQty) }}</b><span>Plan Qty</span></div>
                            <div class="dp-card"><b>{{ fmtQty(dpGrand.rangeQty) }}</b><span>Qty in range</span></div>
                            <div class="dp-card"><b>{{ dpGrand.totalCm.toFixed(2) }}</b><span>Total CM</span></div>
                            <div class="dp-card dp-card-eff"><b>{{ dpGrand.avgEff }}%</b><span>Avg Eff</span></div>
                        </div>
                        <table class="st-table dp-table">
                        <thead>
                            <tr>
                                <th v-for="c in DP_META" :key="c.k" :class="{ 'od-num' : c.num }">{{ c.label }}</th>
                                <th v-for="d in dpDates" :key="dpDayKey(d)" class="od-num dp-dayh">{{ fmtDdMmYy(d) }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="g in dpGroups" :key="g.lineId">
                                <tr v-for="(r, i) in g.rows" :key="g.lineId + '-' + i">
                                    <td v-for="c in DP_META" :key="c.k" :class="{ 'od-num' : c.num }">{{ dpCell(r, c) }}</td>
                                    <td v-for="d in dpDates" :key="dpDayKey(d)" class="od-num">{{ dpDayVal(r.days, d) }}</td>
                                </tr>
                                <tr class="dp-total">
                                    <td>{{ g.floor }}</td>
                                    <td>{{ g.line }} Total</td>
                                    <td colspan="12"></td>
                                    <td class="od-num">{{ fmtQty(g.totals.poQty) }}</td>
                                    <td class="od-num">{{ fmtQty(g.totals.planQty) }}</td>
                                    <td class="od-num">{{ fmtQty(g.totals.allocQty) }}</td>
                                    <td></td>
                                    <td class="od-num">{{ g.totals.totalCm.toFixed(2) }}</td>
                                    <td colspan="3"></td>
                                    <td class="od-num">{{ fmtQty(g.totals.manpower) }}</td>
                                    <td class="od-num">{{ g.totals.avgEff }}</td>
                                    <td></td>
                                    <td v-for="d in dpDates" :key="'t-' + dpDayKey(d)" class="od-num">{{ dpDayVal(g.totals.days, d) }}</td>
                                </tr>
                            </template>
                            <tr v-if="dpGroups.length" class="dp-grand">
                                <td>{{ dpUnitName }}</td>
                                <td>All lines</td>
                                <td colspan="12"></td>
                                <td class="od-num">{{ fmtQty(dpGrand.poQty) }}</td>
                                <td class="od-num">{{ fmtQty(dpGrand.planQty) }}</td>
                                <td class="od-num">{{ fmtQty(dpGrand.allocQty) }}</td>
                                <td></td>
                                <td class="od-num">{{ dpGrand.totalCm.toFixed(2) }}</td>
                                <td colspan="3"></td>
                                <td class="od-num">{{ fmtQty(dpGrand.manpower) }}</td>
                                <td class="od-num">{{ dpGrand.avgEff }}</td>
                                <td>Day total</td>
                                <td v-for="d in dpDates" :key="'g-' + dpDayKey(d)" class="od-num">{{ dpDayVal(dpGrand.days, d) }}</td>
                            </tr>
                            <tr v-if="!dpGroups.length">
                                <td :colspan="DP_META.length + dpDates.length" class="dp-empty">No planned sewing orders in this date range</td>
                            </tr>
                        </tbody>
                        </table>
                    </template>
                    <div v-else class="st-hint dp-hint">Select a date range and click Generate — data comes from the planning board</div>
                </div>
            </div>
        </div>

        <!-- Daily production update: line-wise actual output for a date -->
        <div v-if="puOpen && !puMin" class="cal-overlay" @click.self="puOpen = false">
            <div class="cal-dialog od-dialog pu-dialog">
                <div class="cal-title">
                    Daily production update — day_production_update_plan
                    <span class="cal-title-btns">
                        <span class="cal-x cal-minbtn" @click="puMin = true">—</span>
                        <span class="cal-x" @click="puOpen = false">✕</span>
                    </span>
                </div>
                <div class="dp-toolbar">
                    <label class="dp-range">Save date
                        <input v-model="puDate" class="cal-in dp-date" type="date">
                    </label>
                    <button class="dp-act dp-act-gen" @click="buildPuRows">⟳ Load</button>
                    <button class="dp-act dp-act-xls" :disabled="!puRows.length" @click="saveProdUpdate">💾 Save</button>
                    <span class="dp-flex"></span>
                    <button class="dp-act dp-act-close" @click="puOpen = false">✕ Close</button>
                </div>
                <div class="st-body od-body dp-body">
                    <table v-if="puRows.length" class="st-table dp-table">
                        <thead>
                            <tr>
                                <th>Unit</th><th>Floor</th><th>Line</th><th>Operation type</th>
                                <th>Style</th><th>Order</th><th>PO</th><th>Color</th>
                                <th class="od-num">Order Qty</th>
                                <th class="od-num">Day Plan Qty</th>
                                <th class="od-num">Made so far</th>
                                <th class="od-num">Remaining</th>
                                <th class="od-num">Prod Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="r in puRows" :key="r.evId">
                                <td>{{ r.unit }}</td>
                                <td>{{ r.floor }}</td>
                                <td>{{ r.line }}</td>
                                <td>{{ r.opType }}</td>
                                <td>{{ r.style }}</td>
                                <td class="st-user">{{ r.order }}</td>
                                <td>{{ r.po }}</td>
                                <td>{{ r.color }}</td>
                                <td class="od-num">{{ fmtQty(r.orderQty) }}</td>
                                <td class="od-num">{{ fmtQty(r.planQty) }}</td>
                                <td class="od-num">{{ fmtQty(r.made) }}</td>
                                <td class="od-num pu-rest">{{ fmtQty(r.rest) }}</td>
                                <td class="od-num">
                                    <input v-model="r.prodQty" class="cal-in pu-in" type="number" min="0" placeholder="0">
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div v-else class="st-hint dp-hint">এই তারিখে কোনো strip planned নেই — Save date বদলে ⟳ Load চাপুন</div>
                </div>
            </div>
        </div>

        <!-- Efficiency profiles (Setup): line-wise product type efficiency -->
        <div v-if="effOpen && !effMin" class="cal-overlay" @click.self="effOpen = false">
            <div class="cal-dialog ef-dialog">
                <div class="cal-title">
                    Efficiency profiles
                    <span class="cal-title-btns">
                        <span class="cal-x cal-minbtn" @click="effMin = true">—</span>
                        <span class="cal-x" @click="effOpen = false">✕</span>
                    </span>
                </div>
                <div class="cal-tabs">
                    <span class="cal-tab" :class="{ 'cal-tab-active' : effTab === 'define' }" @click="effTab = 'define'">📊 Define</span>
                    <span class="cal-tab" :class="{ 'cal-tab-active' : effTab === 'types' }" @click="effTab = 'types'">▦ Product types</span>
                    <span class="cal-tab" @click="effOpen = false">❌ Close</span>
                </div>

                <!-- Define tab: profile names, Insert / Delete (FastReact) -->
                <div v-if="effTab === 'define'" class="st-body">
                    <div class="cal-label">Efficiency profile name</div>
                    <input v-model="effNameInput" class="cal-name ef-name" placeholder="e.g. MBM Line 01+02">
                    <div class="cal-list ef-list">
                        <div
                            v-for="p in effList"
                            :key="p.id"
                            :class="{ 'cal-sel' : p.id === effSelectedProfileId }"
                            @click="selectEffProfile(p)"
                        >{{ p.name }}</div>
                        <div v-if="!effList.length" class="fr-dd-dim">No profiles — type a name and Insert</div>
                    </div>
                    <div class="st-actions">
                        <button class="cal-btn st-btn" :disabled="!effNameInput.trim()" @click="effInsert">💾 Insert</button>
                        <button class="cal-btn st-btn" :disabled="!selProfile" @click="effDelete">✖ Delete</button>
                    </div>
                    <div class="st-hint">নতুন profile: নাম লিখে Insert · list থেকে বেছে Delete · efficiency মান দিতে Product types tab-এ যান</div>
                </div>

                <!-- Product types tab: the selected profile's efficiency grid -->
                <div v-else class="st-body">
                    <div class="ef-row">
                        <label>Select efficiency profile</label>
                        <select v-model="effSelectedProfileId" class="cal-in st-select">
                            <option v-for="p in effList" :key="p.id" :value="p.id">{{ p.name }}</option>
                        </select>
                    </div>
                    <div class="ef-row">
                        <label>Search</label>
                        <input v-model="effSearch" class="cal-in ef-search" placeholder="*">
                    </div>
                    <table v-if="selProfile" class="st-table ef-table">
                        <thead>
                            <tr>
                                <th class="ef-mark"></th>
                                <th class="ef-chip-h"></th>
                                <th>Product type</th>
                                <th class="od-num">Efficiency</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="(r, i) in effRows"
                                :key="r.name"
                                :class="{ 'ef-sel' : i === effSelected }"
                                @click="effSelected = i"
                            >
                                <td class="ef-mark">{{ i === effSelected ? '▶' : '' }}</td>
                                <td class="ef-chip-cell"><span class="ef-chip" :style="{ background : r.color }"></span></td>
                                <td :class="{ 'st-user' : r.name === '_Default' }">{{ r.name }}</td>
                                <td class="od-num">
                                    <input
                                        v-model.number="selProfile.values[r.name]"
                                        class="cal-in ef-in"
                                        type="number"
                                        min="0"
                                        max="200"
                                    >
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="st-actions">
                        <button class="cal-btn cal-btn-primary st-btn" :disabled="!selProfile" @click="effUpdate">💾 Update</button>
                        <button class="cal-btn st-btn" :disabled="!selProfile" @click="effCopyDown">📋 Copy down</button>
                    </div>
                    <div class="st-hint">_Default efficiency-ই assign করা line-গুলোর base capacity চালায় — Update চাপলে board recalculate হয়</div>
                </div>
            </div>
        </div>

        <!-- Plan Generator (SRS S2): feasibility + sequence options -->
        <div v-if="pgOpen && !pgMin" class="cal-overlay" @click.self="pgOpen = false">
            <div class="cal-dialog pg-dialog">
                <div class="cal-title">
                    Plan generator — order feasibility &amp; sequencing
                    <span class="cal-title-btns">
                        <span class="cal-x cal-minbtn" @click="pgMin = true">—</span>
                        <span class="cal-x" @click="pgOpen = false">✕</span>
                    </span>
                </div>
                <div class="cal-tabs">
                    <span class="cal-tab cal-tab-active">🧮 Generate</span>
                    <span class="cal-tab" @click="pgOpen = false">❌ Close</span>
                </div>
                <div class="st-body">
                    <div class="pg-inputs">
                        <div class="ef-row"><label>Order</label><input v-model="pgForm.orderNo" class="cal-in pg-in"></div>
                        <div class="ef-row"><label>Category</label><input v-model="pgForm.category" class="cal-in pg-in"></div>
                        <div class="ef-row"><label>Style type</label>
                            <select v-model="pgForm.styleType" class="cal-in st-select pg-in">
                                <option value="new">new</option>
                                <option value="repeat">repeat</option>
                            </select>
                        </div>
                        <div class="ef-row"><label>SMV (IE)</label><input v-model.number="pgForm.smv" type="number" step="0.1" class="cal-in pg-in"></div>
                        <div class="ef-row"><label>PCD</label><input v-model="pgForm.pcd" type="date" class="cal-in pg-in"></div>
                        <div class="ef-row"><label>Line free from</label><input v-model="pgForm.lineFree" type="date" class="cal-in pg-in"></div>
                    </div>
                    <table class="st-table pg-potable">
                        <thead><tr><th>PO</th><th>Delivery</th><th>Colour</th><th class="od-num">Qty</th></tr></thead>
                        <tbody>
                            <template v-for="p in pgForm.pos" :key="p.po">
                                <tr v-for="(c, ci) in p.colours" :key="p.po + c.colour">
                                    <td class="st-user">{{ ci === 0 ? p.po : '' }}</td>
                                    <td>{{ ci === 0 ? p.delivery : '' }}</td>
                                    <td>{{ c.colour }}</td>
                                    <td class="od-num"><input v-model.number="c.qty" type="number" class="cal-in ef-in"></td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                    <div class="st-actions">
                        <button class="cal-btn cal-btn-primary st-btn" @click="pgGenerate">🧮 Generate</button>
                    </div>

                    <template v-if="pgResult">
                        <div class="pg-summary">
                            <span>Total <b>{{ fmtQty(pgResult.totalQty) }}</b> pcs · <b>{{ pgResult.volume.cls }}</b> ({{ pgResult.volume.strategy }})</span>
                            <span>Earliest sew start <b>{{ fmtDate(pgResult.fwd.earliestSewStart) }}</b> · Actual <b>{{ fmtDate(pgResult.fwd.actualSewStart) }}</b></span>
                        </div>
                        <table class="st-table pg-potable">
                            <thead><tr><th>PO</th><th class="od-num">Qty</th><th class="od-num">Sew days</th><th>Latest sew end</th><th>Latest sew start</th><th class="od-num">Buffer</th><th>Verdict</th></tr></thead>
                            <tbody>
                                <tr v-for="r in pgResult.poRows" :key="r.po">
                                    <td class="st-user">{{ r.po }}</td>
                                    <td class="od-num">{{ fmtQty(r.qty) }}</td>
                                    <td class="od-num">{{ r.sewDays }}</td>
                                    <td>{{ fmtDate(r.back.latestSewEnd) }}</td>
                                    <td>{{ fmtDate(r.back.latestSewStart) }}</td>
                                    <td class="od-num"><b>{{ r.feas.bufferDays }}</b></td>
                                    <td><span class="pg-verdict" :class="pgVerdictCls(r.feas.verdict)">{{ r.feas.verdict }}</span></td>
                                </tr>
                            </tbody>
                        </table>
                        <div class="pg-options">
                            <div v-for="o in pgResult.options" :key="o.name" class="pg-card" :class="{ 'pg-card-rej' : o.rejected }">
                                <div class="pg-card-h">{{ o.name }}
                                    <span v-if="o.rejected" class="pg-verdict pg-v-red">REJECTED</span>
                                    <span v-else class="pg-verdict pg-v-good">FEASIBLE</span>
                                </div>
                                <div class="pg-card-seq">{{ o.sequence.join('  →  ') }}</div>
                                <div class="pg-card-meta">{{ o.blocks }} block(s) · {{ o.changeovers }} changeover(s)</div>
                                <div v-for="pb in o.poBuffers" :key="pb.po" class="pg-card-buf">
                                    {{ pb.po }}: ends {{ fmtDate(pb.endDate) }} · buffer <b>{{ pb.bufferDays }}</b> day(s)
                                </div>
                                <div v-if="o.rejected" class="pg-card-rejr">⛔ {{ o.rejectReason }}</div>
                                <button v-else class="cal-btn st-btn pg-commit" @click="pgCommit(o)">✔ Commit this sequence</button>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>

        <!-- Planned schedule dialog (Planned quantity, order units) -->
        <div v-if="plOpen && !plMin && plRaw" class="cal-overlay" @click.self="plOpen = false">
            <div class="cal-dialog pl-dialog">
                <div class="cal-title">
                    Planned quantity, order units
                    <span class="cal-title-btns">
                        <span class="cal-x cal-minbtn" @click="plMin = true">—</span>
                        <span class="cal-x" @click="plOpen = false">✕</span>
                    </span>
                </div>
                <div class="cal-tabs">
                    <span class="cal-tab cal-tab-active">🗓 Production schedule</span>
                    <span class="cal-tab" @click="() => window.print?.()">🖶 Print</span>
                    <span class="cal-tab" @click="plOpen = false">❌ Close</span>
                </div>
                <div class="st-body pl-body">
                    <div class="pl-grid pl-info">
                        <label>Order</label><input class="cal-in pr-ro" :value="`${plRaw.buyer} :: ${plRaw.po}`" readonly>
                        <label>Product</label><input class="cal-in pr-ro" :value="plRaw.style" readonly>
                        <label>Customer</label><input class="cal-in pr-ro" :value="plRaw.buyer" readonly>
                        <label>Line</label><input class="cal-in pr-ro" :value="plLine?.name" readonly>
                        <label>This strip</label><input class="cal-in pr-ro" :value="`${fmtQty(plRaw.qty)}   (${plRaw.end ? fmtDate(plRaw.end) : '—'})`" readonly>
                        <label>All strips</label><input class="cal-in pr-ro" :value="`${fmtQty(plAllStrips.qty)} in ${plAllStrips.count} strip(s)`" readonly>
                        <label>Starting</label><input class="cal-in pr-ro" :value="`${fmtDate(plRaw.start)}  =>  ${plRaw.end ? fmtDate(plRaw.end) : '—'}`" readonly>
                        <label>Made</label><input class="cal-in pr-ro" :value="fmtQty(Math.round(plRaw.qty * plRaw.progress / 100))" readonly>
                        <label>Send by</label><input class="cal-in pr-ro" value="_Ex-Factory -> _Ex-fty" readonly>
                    </div>
                    <div class="pl-cols">
                        <div class="pl-left">
                            <fieldset class="pr-box">
                                <legend>Period</legend>
                                <div class="pl-period">
                                    <label><input v-model="plPeriod" type="radio" value="daily"> Daily</label>
                                    <label><input v-model="plPeriod" type="radio" value="weekly"> Weekly</label>
                                    <label><input v-model="plPeriod" type="radio" value="monthly"> Monthly</label>
                                </div>
                            </fieldset>
                            <div class="cal-list pl-schedlist">
                                <div>Preparation schedule (first operation in section)</div>
                                <div>Load into production schedule</div>
                                <div class="cal-sel">Out of production (strip schedule)</div>
                                <div>Complete schedule (final operation in section)</div>
                                <div>Despatch schedule (accumulate to transport days)</div>
                                <div>Availability at customer</div>
                            </div>
                        </div>
                        <div class="pl-right">
                        <table class="st-table pl-table">
                            <thead>
                                <tr>
                                    <th>Day</th>
                                    <th>Date</th>
                                    <th class="od-num">Quantity</th>
                                    <th class="od-num">cumulative</th>
                                    <th class="od-num">Efficiency</th>
                                    <th class="od-num">Hours</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(r, i) in plRows" :key="i" :class="{ 'pl-off' : r.eff === 0 }">
                                    <td class="st-user">{{ r.day }}</td>
                                    <td>{{ r.date }}</td>
                                    <td class="od-num">{{ fmtQty(r.qty) }}</td>
                                    <td class="od-num">{{ fmtQty(r.cum) }}</td>
                                    <td class="od-num">{{ r.eff }}%</td>
                                    <td class="od-num">{{ r.hours }}</td>
                                </tr>
                            </tbody>
                        </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Strip / Order properties dialog -->
        <div v-if="propsOpen && !propsMin && propsRaw" class="cal-overlay" @click.self="propsOpen = false">
            <div class="cal-dialog pr-dialog">
                <div class="cal-title">
                    Strip / Order properties
                    <span class="cal-title-btns">
                        <span class="cal-x cal-minbtn" @click="propsMin = true">—</span>
                        <span class="cal-x" @click="propsOpen = false">✕</span>
                    </span>
                </div>
                <div class="cal-tabs">
                    <span class="cal-tab cal-tab-active">🧭 Information</span>
                    <span class="cal-tab">▦ Section information</span>
                    <span class="cal-tab" @click="propsOpen = false">❌ Close</span>
                </div>
                <div class="st-body">
                    <fieldset class="pr-box">
                        <legend>Details</legend>
                        <div class="pr-grid">
                            <label>Order</label><input class="cal-in pr-ro" :value="`${propsRaw.buyer} :: ${propsRaw.po}`" readonly>
                            <label>Row name</label><input class="cal-in pr-ro" :value="propsLine?.name" readonly>
                            <label>Product</label><input class="cal-in pr-ro" :value="propsRaw.style" readonly>
                            <label>Section</label><input class="cal-in pr-ro" value="SEW" readonly>
                            <label>Customer</label><input class="cal-in pr-ro" :value="propsRaw.buyer" readonly>
                            <label>Group</label><input class="cal-in pr-ro" value="AQL" readonly>
                        </div>
                    </fieldset>
                    <div class="pr-cols">
                        <div class="pr-col">
                            <fieldset class="pr-box">
                                <legend>Properties</legend>
                                <div class="ef-row">
                                    <label>Strip efficiency</label>
                                    <input v-model.number="propsForm.stripEff" class="cal-in ef-in" type="number" min="1" max="500">
                                    <span class="pr-dim">(1 - 500)</span>
                                </div>
                                <label class="ef-assign-item pr-keep">
                                    <input v-model="propsForm.keepSeparate" type="checkbox">
                                    Keep separate from other strips
                                </label>
                            </fieldset>
                            <fieldset class="pr-box">
                                <legend>Work content and efficiency</legend>
                                <div class="pr-grid pr-grid2">
                                    <label>Route name</label><input class="cal-in pr-ro" :value="propsRouteName" readonly>
                                    <label>Work content</label><input class="cal-in pr-ro" :value="Number(propsRaw.smv).toFixed(3)" readonly>
                                    <label>Efficiency profile</label><input class="cal-in pr-ro" :value="propsProfile?.name || '—'" readonly>
                                    <label>Profile efficiency %</label>
                                    <input v-model.number="propsForm.profileEff" class="cal-in ef-in" type="number" min="1" max="200">
                                </div>
                            </fieldset>
                            <fieldset class="pr-box">
                                <legend>Capacity</legend>
                                <div class="pr-grid pr-grid2">
                                    <label>Quantity</label><input class="cal-in pr-ro" :value="fmtQty(propsRaw.qty)" readonly>
                                    <label>Quantity per week</label><input class="cal-in pr-ro" :value="propsQtyWeek" readonly>
                                </div>
                            </fieldset>
                        </div>
                        <div class="pr-col">
                            <fieldset class="pr-box pr-dates">
                                <legend>Key dates</legend>
                                <table class="pr-datetable">
                                    <tr v-for="[label, d] in propsKeyDates" :key="label">
                                        <td>{{ label }}</td>
                                        <td class="od-num">{{ d ? fmtDate(d) : '—' }}</td>
                                    </tr>
                                </table>
                            </fieldset>
                        </div>
                    </div>
                    <div class="st-actions pr-actions">
                        <button class="cal-btn cal-btn-primary st-btn" @click="propsUpdate">✔ Update</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Build up (learning) curves dialog -->
        <div v-if="bcOpen && !bcMin" class="cal-overlay" @click.self="bcOpen = false">
            <div class="cal-dialog bc-dialog">
                <div class="cal-title">
                    Build up curves
                    <span class="cal-title-btns">
                        <span class="cal-x cal-minbtn" @click="bcMin = true">—</span>
                        <span class="cal-x" @click="bcOpen = false">✕</span>
                    </span>
                </div>
                <div class="cal-tabs">
                    <span class="cal-tab" :class="{ 'cal-tab-active' : bcTab === 'define' }" @click="bcTab = 'define'">📈 Define</span>
                    <span class="cal-tab" :class="{ 'cal-tab-active' : bcTab === 'rename' }" @click="bcTab = 'rename'">🔤 Rename</span>
                    <span class="cal-tab" @click="bcOpen = false">❌ Close</span>
                </div>

                <!-- Define: period, name + list, day grid, chart -->
                <div v-if="bcTab === 'define'" class="st-body bc-body">
                    <div class="bc-left">
                        <div class="ef-row">
                            <label>Period (days)</label>
                            <input v-model.number="bcPeriod" class="cal-in ef-in" type="number" min="1" max="60">
                        </div>
                        <div class="cal-label">Build up name</div>
                        <input v-model="bcName" class="cal-name ef-name" placeholder="e.g. MBM 3 Days">
                        <div class="cal-list bc-list">
                            <div
                                v-for="c in bcList"
                                :key="c.id"
                                :class="{ 'cal-sel' : c.id === bcSelectedId }"
                                @click="selectBuildUp(c)"
                            >{{ c.name }}</div>
                        </div>
                        <div class="st-actions">
                            <button class="cal-btn st-btn" :disabled="!bcName.trim()" @click="bcUpdate">💾 Update</button>
                            <button class="cal-btn st-btn" :disabled="!bcSelectedId" @click="bcDelete">✖ Delete</button>
                        </div>
                    </div>
                    <div class="bc-mid">
                        <table class="st-table ef-table">
                            <thead>
                                <tr><th>Days</th><th class="od-num">%</th></tr>
                            </thead>
                            <tbody>
                                <tr v-for="(v, i) in bcPct" :key="i">
                                    <td class="st-user">{{ i + 1 }}</td>
                                    <td class="od-num">
                                        <input v-model.number="bcPct[i]" class="cal-in ef-in" type="number" min="0" max="100">
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="bc-right">
                        <div class="bc-chart-title">Build up percentage</div>
                        <svg class="bc-chart" viewBox="0 0 300 180">
                            <rect x="14" y="14" width="272" height="152" fill="#fff" stroke="#c9c5b8"/>
                            <line x1="14" y1="90" x2="286" y2="90" stroke="#e0ddd4"/>
                            <line x1="150" y1="14" x2="150" y2="166" stroke="#e0ddd4"/>
                            <polyline :points="bcChartPoints" fill="none" stroke="#1b52ad" stroke-width="2"/>
                            <circle
                                v-for="(p, i) in bcChartPoints.split(' ').filter(Boolean)"
                                :key="i"
                                :cx="p.split(',')[0]"
                                :cy="p.split(',')[1]"
                                r="3"
                                fill="#d40000"
                            />
                            <text x="6" y="170" font-size="9" fill="#555">0</text>
                            <text x="4" y="20" font-size="9" fill="#555">100</text>
                        </svg>
                        <div class="st-hint">Day-wise % = নতুন style ওঠার সময় line-এর expected efficiency build up</div>
                    </div>
                </div>

                <!-- Rename: pick a curve, type the new name -->
                <div v-else class="st-body bc-body">
                    <div class="bc-left">
                        <div class="cal-label">Select a curve to rename</div>
                        <div class="cal-list bc-list">
                            <div
                                v-for="c in bcList"
                                :key="c.id"
                                :class="{ 'cal-sel' : c.id === bcRenameSelId }"
                                @click="bcRenameSelId = c.id; bcRenameInput = ''"
                            >{{ c.name }}</div>
                        </div>
                    </div>
                    <div class="bc-mid bc-renamecol">
                        <input class="cal-name ef-name bc-ro" :value="bcRenameCur?.name || ''" readonly>
                        <input v-model="bcRenameInput" class="cal-name ef-name" placeholder="নতুন নাম লিখুন">
                        <button
                            class="cal-btn st-btn"
                            :disabled="!bcRenameCur || !bcRenameInput.trim()"
                            @click="bcRename"
                        >🔤 Rename</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Settings dialog: users, roles & board permissions -->
        <div v-if="settingsOpen && !settingsMin" class="cal-overlay" @click.self="settingsOpen = false">
            <div class="cal-dialog st-dialog">
                <div class="cal-title">
                    Settings — Users &amp; Board Permissions
                    <span class="cal-title-btns">
                        <span class="cal-x cal-minbtn" @click="settingsMin = true">—</span>
                        <span class="cal-x" @click="settingsOpen = false">✕</span>
                    </span>
                </div>
                <div class="st-body">
                    <div class="st-row st-current">
                        <label>Active user (login demo):</label>
                        <select v-model="currentUserId" class="cal-in st-select">
                            <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
                        </select>
                    </div>
                    <table class="st-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th v-for="b in boards" :key="b.id" class="st-board-h">{{ b.name }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="u in users" :key="u.id">
                                <td class="st-user">{{ u.name }}</td>
                                <td>
                                    <select v-model="u.role" class="cal-in st-select">
                                        <option v-for="r in ROLES" :key="r" :value="r">{{ r }}</option>
                                    </select>
                                </td>
                                <td v-for="b in boards" :key="b.id" class="st-check">
                                    <input
                                        type="checkbox"
                                        :checked="u.boards.includes(b.id)"
                                        @change="toggleBoardPerm(u, b.id)"
                                    >
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="st-hint">Planner / Planning Manager / Unit Head can edit their boards; Management sees them read-only (document §17).</div>
                    <div class="st-actions">
                        <button class="cal-btn st-btn" @click="addUser">➕ Add user</button>
                        <button class="cal-btn cal-btn-primary st-btn" @click="saveSettings">💾 Save permissions</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Calendars dialog (FastReact style) -->
        <div v-if="calOpen && !calMin" class="cal-overlay" @click.self="calOpen = false">
            <div class="cal-dialog">
                <div class="cal-title">
                    Calendars
                    <span class="cal-title-btns">
                        <span class="cal-x cal-minbtn" @click="calMin = true">—</span>
                        <span class="cal-x" @click="calOpen = false">✕</span>
                    </span>
                </div>
                <div class="cal-tabs">
                    <span class="cal-tab cal-tab-active">📅 Define</span>
                    <span class="cal-tab">🔤 Rename / Copy</span>
                    <span class="cal-tab">📆 Holidays</span>
                    <span class="cal-tab">📄 Report</span>
                    <span class="cal-tab">📅 Special</span>
                    <span class="cal-tab" @click="calOpen = false">❌ Close</span>
                </div>
                <div class="cal-body">
                    <div class="cal-left">
                        <div class="cal-label">Calendar name</div>
                        <input v-model="calName" class="cal-name">
                        <div class="cal-list">
                            <div>24/7</div>
                            <div>Sew_AQL</div>
                            <div>Sew_CEIL</div>
                            <div class="cal-sel">{{ calName }}</div>
                        </div>
                        <button class="cal-btn cal-btn-primary" @click="updateCalendar">💾 Update</button>
                        <button class="cal-btn">❌ Delete</button>
                    </div>
                    <div class="cal-right">
                        <div class="cal-wh-tab">Working hours</div>
                        <div class="cal-grid">
                            <div class="cal-ghead"></div>
                            <div class="cal-ghead">Start time</div>
                            <div class="cal-ghead">Work hours</div>
                            <div class="cal-ghead">Quick Fix: Max. Add. Overtime</div>
                            <template v-for="r in calRows" :key="r.d">
                                <div class="cal-day">{{ r.label }}</div>
                                <input v-model="r.start" class="cal-in">
                                <input v-model="r.hours" class="cal-in" :class="{ 'cal-off' : r.hours === '00:00' }">
                                <input v-model="r.ot" class="cal-in">
                            </template>
                            <div class="cal-day cal-total-label">Total hours</div>
                            <div></div>
                            <input class="cal-in cal-ro" :value="totalHours()" readonly>
                            <div></div>
                        </div>
                        <div class="cal-shifts">Total hours split into shifts <input class="cal-in cal-ro" value="1" readonly></div>
                        <div class="cal-hint">Enter both start time and working hours as hh:mm — 00:00 work hours = off day</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Carried bar ghost (FastReact pick & place) -->
        <div
            v-if="carried"
            class="mb-ghost"
            :style="{
                left : ghostPos.x + 'px',
                top : ghostPos.y + 'px',
                background : RISK_COLORS[colorKeyOf(carried.data.raw)]
            }"
        >
            <div class="mb-ghost-l1">{{ carried.name }}</div>
            <div class="mb-ghost-l2">{{ fmtQty(carried.data.raw.qty) }} pcs · {{ carried.data.raw.dur }} working day(s)</div>
        </div>

        <!-- Bottom window taskbar: one icon per open window -->
        <div v-if="openWindows.length" class="fr-taskbar">
            <div
                v-for="w in openWindows"
                :key="w.id"
                class="fr-task"
                :class="{ 'fr-task-min' : w.min }"
                :title="w.min ? 'Click to restore' : 'Window is open'"
                @click="restoreWin(w.id)"
            >
                <span class="fr-task-ico">{{ w.icon }}</span>
                <span class="fr-task-t">{{ w.title }}</span>
                <span class="fr-task-x" title="Close window" @click.stop="closeWin(w.id)">✕</span>
            </div>
        </div>

        <!-- Toasts -->
        <div class="mb-toasts">
            <div v-for="t in toasts" :key="t.id" class="mb-toast" :class="`mb-toast-${t.type}`">{{ t.text }}</div>
        </div>
    </div>
</template>

<style>
@import '@bryntum/schedulerpro/svalbard-light.css';
@import '@bryntum/schedulerpro/fontawesome/css/fontawesome.css';
@import '@bryntum/schedulerpro/fontawesome/css/solid.css';

/* ------------------------------------------------------------------ */
/* App shell                                                          */
/* ------------------------------------------------------------------ */
html,
body {
    margin : 0;
    width  : 100%;
    height : 100%;
}

#app {
    display        : flex;
    flex-direction : column;
    height         : 100vh;
    width          : 100vw;
}

.fr-app {
    display        : flex;
    flex-direction : column;
    height         : 100%;
    width          : 100%;
    font-family    : Tahoma, 'Segoe UI', Verdana, sans-serif;
    font-size      : 11px;
    background     : #d6d2c9;
    user-select    : none;
}

.mb-main {
    display    : flex;
    flex       : 1 1 auto;
    min-height : 0;
}

.mb-sched-wrap {
    flex       : 1 1 auto;
    min-width  : 0;
    display    : flex;
}

.fr-sched,
.mb-sched-wrap .b-vue-schedulerpro-container {
    flex       : 1 1 auto;
    min-height : 0;
    min-width  : 0;
    width      : auto;
    height     : auto;
    max-width  : 100%;
}

/* ------------------------------------------------------------------ */
/* FastReact shell: menubar, dropdowns, empty home, status bar        */
/* ------------------------------------------------------------------ */
/* SAP Fiori (Quartz Light) shell: white bar, #0a6ed1 brand blue accents */
.fr-menubar {
    display       : flex;
    align-items   : center;
    gap           : 2px;
    padding       : 4px 8px;
    background    : #fff;
    border-bottom : 1px solid #d9d9d9;
    flex          : none;
    position      : relative;
    z-index       : 500;
}

.fr-menu-wrap { position : relative; }

.fr-menu {
    display       : flex;
    align-items   : center;
    gap           : 7px;
    padding       : 5px 12px;
    cursor        : pointer;
    white-space   : nowrap;
    border-radius : 4px;
    font-size     : 13px;
    font-family   : '72', 'Segoe UI', Arial, sans-serif;
    color         : #32363a;
    transition    : background 0.1s, color 0.1s;
}

.fr-menu:hover,
.fr-menu-active { background : #eaf3fb; color : #0a6ed1; }

.fr-menu-exit .fr-menu-fa { color : #bb0000; }
.fr-menu-exit:hover { background : #fbeaea; color : #bb0000; }

.fr-menu-fa {
    font-size  : 13px;
    color      : #0a6ed1;
    width      : 15px;
    text-align : center;
}

.fr-dropdown {
    position      : absolute;
    top           : calc(100% + 3px);
    left          : 0;
    z-index       : 10000;
    min-width     : 260px;
    background    : #fff;
    border        : 1px solid #d9d9d9;
    border-radius : 4px;
    box-shadow    : 0 6px 16px rgba(0, 0, 0, 0.18);
    padding       : 4px;
}

.fr-dd-item {
    padding       : 8px 12px;
    font-size     : 13px;
    white-space   : nowrap;
    cursor        : pointer;
    border-radius : 4px;
    color         : #32363a;
}

.fr-dd-item:hover { background : #eaf3fb; color : #0a6ed1; }
.fr-dd-fa   { color : #0a6ed1; width : 16px; text-align : center; margin-right : 4px; }
.fr-dd-dim  { color : #6a6d70; }
.fr-dd-sep  { height : 1px; background : #e5e5e5; margin : 4px 8px; }

.fr-home {
    flex           : 1 1 auto;
    min-height     : 0;
    display        : flex;
    flex-direction : column;
}

.fr-home-empty {
    flex       : 1 1 auto;
    background : #f0f0f0;
    border     : 1px solid #c9c5b8;
    margin     : 2px;
}

.fr-statusbar {
    display     : flex;
    gap         : 2px;
    padding     : 2px;
    background  : #e9e6df;
    border-top  : 1px solid #a9a494;
    flex        : none;
    font-size   : 11px;
}

.fr-status-cell {
    padding    : 3px 10px;
    background : #f4f2ec;
    border     : 1px inset #d5d1c5;
    white-space : nowrap;
}

.fr-status-wide { flex : 1 1 auto; }

.fr-boardarea {
    display        : flex;
    flex-direction : column;
    flex           : 1 1 auto;
    min-height     : 0;
}

/* Hidden board parks off-screen at FULL SIZE (never display:none) so the
   Bryntum scheduler always measures real widths - the locked Line/Cap/Eff
   panel stays intact */
.fr-board-hidden {
    position       : fixed;
    left           : 0;
    top            : 200vh;
    width          : 100vw;
    height         : calc(100vh - 34px);
    visibility     : hidden;
    pointer-events : none;
}

/* Orders list dialog: dialog hugs the full table - no scrolling, no overflow */
.od-dialog {
    width          : 98vw;
    min-width      : 960px;
    max-width      : 98vw;
    max-height     : 94vh;
    height         : 94vh;
    display        : flex;
    flex-direction : column;
}

.od-body {
    overflow     : auto;
    flex         : 1 1 auto;
    min-height   : 0;
    max-height   : calc(94vh - 72px);
}

.od-table {
    width     : max-content;
    min-width : 100%;
}

.od-filterrow th { padding : 2px 3px; background : #eef2f8; }

.od-filter {
    width      : 100%;
    box-sizing : border-box;
    padding    : 3px 5px;
    border     : 1px inset #999;
    font-size  : 11px;
    font-family : inherit;
}

.od-hintrow {
    display         : flex;
    align-items     : center;
    justify-content : space-between;
    gap             : 10px;
}

.od-clear { width : auto; margin : 0; padding : 4px 12px; }

.od-table { font-size : 11px; }
.od-table th, .od-table td { padding : 5px 7px; white-space : nowrap; }
.od-num { text-align : right; }

.od-row { cursor : pointer; }
.od-row:hover td { background : #eaf1fb; }

/* Day Plan Report — spreadsheet grid */
.dp-dialog {
    font-family : Arial, sans-serif;
    width       : 100vw;
    min-width   : 100vw;
    max-width   : 100vw;
    height      : 100vh;
    max-height  : 100vh;
}

/* Body fills the rest of the screen; anything bigger scrolls inside */
.dp-body {
    max-height : none;
    flex       : 1 1 auto;
    overflow   : auto;
}

/* One-line toolbar: date range + Generate / Excel / PDF ... Close */
.dp-toolbar {
    display       : flex;
    align-items   : center;
    flex-wrap     : wrap;
    gap           : 8px;
    padding       : 8px 12px;
    background    : linear-gradient(#fdfdfb, #ece9e0);
    border-bottom : 1px solid #c9c5b8;
}
.dp-range {
    display     : flex;
    align-items : center;
    gap         : 6px;
    font-size   : 12px;
    font-weight : bold;
    color       : #17356b;
}
.dp-date { width : 138px; }
.dp-flex { flex : 1 1 auto; }

.dp-act {
    padding       : 5px 16px;
    border        : 1px solid #8a8a8a;
    border-radius : 3px;
    background    : linear-gradient(#fff, #e4e1d8);
    font-family   : inherit;
    font-size     : 12px;
    font-weight   : bold;
    cursor        : pointer;
    white-space   : nowrap;
}
.dp-act:hover:not(:disabled) { filter : brightness(1.07); }
.dp-act:active:not(:disabled) { transform : translateY(1px); }
.dp-act:disabled { opacity : 0.45; cursor : default; }
.dp-act-gen   { background : #1b52ad; border-color : #143d82; color : #fff; }
.dp-act-xls   { background : #1e7e34; border-color : #145824; color : #fff; }
.dp-act-pdf   { background : #c62828; border-color : #8e1c1c; color : #fff; }
.dp-act-close { background : #f0efe8; color : #333; }

/* Report letterhead: unit name + title + date range */
.dp-rephead {
    text-align    : center;
    background    : #fff;
    padding       : 10px 8px 7px;
    border        : 1px solid #c9c5b8;
    border-bottom : 3px double #17356b;
    margin-bottom : 8px;
}
.dp-rep-unit  { font-size : 17px; font-weight : bold; color : #17356b; letter-spacing : 1px; }
.dp-rep-title { font-size : 13px; font-weight : bold; margin-top : 2px; }
.dp-rep-range { font-size : 11px; margin-top : 3px; color : #333; }
.dp-rep-dim   { color : #888; }

/* Summary cards: orders / lines / qty / CM / avg eff */
.dp-cards {
    display       : flex;
    flex-wrap     : wrap;
    gap           : 8px;
    margin-bottom : 8px;
}
.dp-card {
    display        : flex;
    flex-direction : column;
    align-items    : center;
    min-width      : 96px;
    padding        : 6px 14px;
    background     : #fff;
    border         : 1px solid #c9c5b8;
    border-top     : 3px solid #1b52ad;
    border-radius  : 2px;
}
.dp-card b    { font-size : 15px; color : #17356b; }
.dp-card span { font-size : 10px; color : #777; text-transform : uppercase; letter-spacing : 0.5px; }
.dp-card-eff  { border-top-color : #1e7e34; }
.dp-card-eff b { color : #1e7e34; }

.dp-table {
    width     : max-content;
    min-width : 100%;
    font-size : 11px;
    color     : #000;
}
.dp-table th,
.dp-table td {
    border     : 1px solid #999;
    padding    : 3px 5px;
    background : #fff;
    color      : #000;
    white-space : nowrap;
}
.dp-table th {
    background  : #17356b;
    color       : #fff;
    font-weight : bold;
    text-align  : center;
    vertical-align : bottom;
    position    : sticky;
    top         : 0;
    z-index     : 2;
}
.dp-table tbody tr:nth-child(even) td { background : #f7f9fc; }
.dp-dayh { min-width : 58px; }
.dp-total td,
.dp-table tbody tr.dp-total td {
    font-weight : bold;
    border-top  : 2px solid #000;
    border-bottom : 2px solid #000;
    background  : #f2f2f2;
}
.dp-grand td,
.dp-table tbody tr.dp-grand td {
    font-weight : bold;
    background  : #dbe5f1;
    color       : #17356b;
    border-top  : 3px double #000;
    border-bottom : 3px double #000;
}
.dp-empty { text-align : center; color : #666; padding : 18px !important; }
.dp-hint { padding : 18px 8px; }

/* Daily production update */
.pu-in {
    width      : 92px;
    text-align : right;
    padding    : 3px 6px;
}
.pu-rest { color : #c62828; font-weight : bold; }

.od-status {
    padding       : 1px 8px;
    border-radius : 3px;
    color         : #fff;
    font-size     : 10px;
    text-transform : capitalize;
}

.od-color {
    display       : inline-flex;
    align-items   : center;
    gap           : 5px;
    padding       : 1px 8px;
    border-radius : 3px;
    font-size     : 10px;
    border        : 1px solid #ccc;
}

.od-color::before {
    content       : '';
    width         : 9px;
    height        : 9px;
    border-radius : 2px;
    background    : currentColor;
    border        : 1px solid #888;
}

.od-color-red    { color : #c62828; background : #ffebee; }
.od-color-blue   { color : #1565c0; background : #e3f2fd; }
.od-color-yellow { color : #f9a825; background : #fffde7; }
.od-color-black  { color : #212121; background : #f5f5f5; }

.od-planned   { background : #43a047; }
.od-confirmed { background : #7b1fa2; }
.od-draft     { background : #1e88e5; }
.od-completed { background : #9e9e9e; }
.od-unplanned { background : #d40000; }
.od-ord-proj    { background : #ef6c00; }
.od-ord-confirm { background : #2e7d32; }

/* Efficiency profiles dialog */
.ef-dialog { width : 520px; max-width : 95vw; }

.ef-row {
    display     : flex;
    align-items : center;
    gap         : 10px;
    margin-bottom : 8px;
}

.ef-row label { flex : 0 0 160px; font-weight : bold; }

.ef-search { flex : 1; text-align : left; width : auto; }

.ef-table { width : 100%; }
.ef-table td { padding : 3px 6px; }

.ef-mark   { width : 22px; text-align : center; color : #17356b; }
.ef-chip-h { width : 26px; }

.ef-chip-cell { text-align : center; }

.ef-chip {
    display : inline-block;
    width   : 16px;
    height  : 14px;
    border  : 1px solid #777;
    vertical-align : middle;
}

.ef-in { width : 70px; }

.ef-sel td { background : #dce9fb; }

.ef-name { margin-bottom : 6px; }

.ef-list { height : 300px; margin : 0 0 10px; }

.ef-assign {
    display   : flex;
    flex-wrap : wrap;
    gap       : 4px 10px;
}

.ef-assign-item {
    display     : flex;
    align-items : center;
    gap         : 3px;
    font-weight : normal;
    white-space : nowrap;
}

.st-btn:disabled {
    opacity : 0.5;
    cursor  : default;
}

/* Plan generator dialog */
.pg-dialog { width : 960px; max-width : 97vw; max-height : 95vh; overflow-y : auto; }

.pg-inputs {
    display : grid;
    grid-template-columns : repeat(3, 1fr);
    gap : 4px 18px;
    margin-bottom : 10px;
}

.pg-in { width : 150px; text-align : left; }

.pg-potable { margin-bottom : 10px; }
.pg-potable th, .pg-potable td { padding : 4px 8px; }

.pg-summary {
    display : flex;
    justify-content : space-between;
    gap : 14px;
    background : #eef2f8;
    border : 1px solid #c9c5b8;
    padding : 7px 10px;
    margin : 8px 0;
    font-size : 11px;
}

.pg-verdict {
    padding : 1px 8px;
    border-radius : 3px;
    color : #fff;
    font-size : 10px;
    font-weight : bold;
}

.pg-v-good  { background : #0CA30C; }
.pg-v-amber { background : #FAB219; color : #222; }
.pg-v-red   { background : #D03B3B; }

.pg-options { display : flex; gap : 10px; align-items : stretch; flex-wrap : wrap; }

.pg-card {
    flex : 1 1 280px;
    border : 1px solid #c9c5b8;
    background : #fff;
    padding : 8px 10px;
    font-size : 11px;
    display : flex;
    flex-direction : column;
    gap : 5px;
}

.pg-card-rej { background : #faf0f0; }

.pg-card-h { font-weight : bold; display : flex; justify-content : space-between; align-items : center; }
.pg-card-seq { color : #17356b; }
.pg-card-meta { color : #555; }
.pg-card-buf { font-size : 10.5px; }
.pg-card-rejr { color : #D03B3B; font-size : 10.5px; }
.pg-commit { margin-top : auto; width : auto; }

/* Planned schedule dialog */
.pl-dialog { width : 980px; max-width : 97vw; }

.pl-body { display : block; }

/* Info fields: two label+value pairs per row, full dialog width, no clipping */
.pl-body .pl-grid {
    display : grid;
    grid-template-columns : 78px 1fr 78px 1fr;
    gap : 7px 14px;
    align-items : center;
    margin-bottom : 12px;
}

.pl-body .pl-grid label { font-weight : bold; white-space : nowrap; }

.pl-info .pr-ro {
    width      : 100%;
    min-width  : 0;
    box-sizing : border-box;
    padding    : 4px 8px;
    font-size  : 11px;
}

.pl-cols {
    display     : flex;
    gap         : 14px;
    align-items : flex-start;
}

.pl-left  { flex : 0 0 275px; }

.pl-right {
    flex       : 1;
    min-width  : 0;
    max-height : 420px;
    overflow-y : auto;
    overflow-x : auto;
    border     : 1px solid #c9c5b8;
}

.pl-table { width : 100%; }
.pl-table th, .pl-table td { padding : 4px 6px; }

.pl-period {
    display : flex;
    gap     : 18px;
}

.pl-period label {
    display     : flex;
    align-items : center;
    gap         : 5px;
    font-weight : normal;
}

.pl-schedlist { height : 130px; margin-top : 10px; font-size : 11px; }

.pl-table th, .pl-table td { padding : 4px 8px; white-space : nowrap; }
.pl-table .st-user { color : #17356b; }
.pl-off td { color : #999; }

/* Strip / Order properties dialog */
.pr-dialog { width : 820px; max-width : 96vw; }

.pr-box {
    border  : 1px solid #c9c5b8;
    padding : 8px 10px;
    margin  : 0 0 10px;
}

.pr-box legend {
    font-size : 11px;
    color     : #17356b;
    padding   : 0 6px;
}

.pr-grid {
    display : grid;
    grid-template-columns : 90px 1fr 110px 1fr;
    gap : 6px 10px;
    align-items : center;
}

.pr-grid2 { grid-template-columns : 140px 1fr; }

.pr-grid label { font-weight : bold; white-space : nowrap; }

.pr-ro {
    background : #f0efe8;
    text-align : left;
    width      : 100%;
    box-sizing : border-box;
    font-weight : bold;
}

.pr-cols { display : flex; gap : 12px; align-items : stretch; }
.pr-col  { flex : 1; display : flex; flex-direction : column; }

.pr-dim { color : #666; }

.pr-keep { margin-top : 8px; }

.pr-dates { flex : 1; }

.pr-datetable { width : 100%; border-collapse : collapse; font-size : 11px; }
.pr-datetable td { padding : 4px 6px; border-bottom : 1px solid #eeeae0; }

.pr-actions { justify-content : center; }

/* Build up curves dialog */
.bc-dialog { width : 860px; max-width : 96vw; }

.bc-body {
    display : flex;
    gap     : 16px;
    align-items : flex-start;
}

.bc-left  { flex : 0 0 230px; }
.bc-mid   { flex : 0 0 170px; max-height : 420px; overflow-y : auto; }
.bc-right { flex : 1; }

.bc-list { height : 280px; margin : 4px 0 10px; }

.bc-chart-title {
    color       : #1b3fde;
    font-weight : bold;
    text-align  : center;
    margin      : 4px 0 6px;
    font-size   : 12px;
}

.bc-chart {
    width      : 100%;
    background : #f7f5ef;
    border     : 1px solid #c9c5b8;
}

.bc-renamecol {
    flex : 0 0 260px;
    display : flex;
    flex-direction : column;
    gap : 24px;
    padding-top : 24px;
}

.bc-ro { background : #f0efe8; }

/* Settings dialog */
.st-dialog { width : 780px; max-width : 95vw; }

.st-body { padding : 12px; }

.st-current {
    display     : flex;
    align-items : center;
    gap         : 10px;
    margin-bottom : 10px;
    font-weight : bold;
}

.st-select { width : auto; min-width : 150px; text-align : left; }

.st-table {
    width           : 100%;
    border-collapse : collapse;
    background      : #fff;
    font-size       : 12px;
}

.st-table th,
.st-table td {
    border  : 1px solid #c9c5b8;
    padding : 6px 8px;
    text-align : left;
}

.st-table th { background : #f4f2ec; color : #17356b; }
.st-board-h  { font-size : 11px; max-width : 130px; }
.st-user     { font-weight : bold; }
.st-check    { text-align : center; }
.st-check input { width : 15px; height : 15px; }

.st-hint { margin-top : 8px; color : #555; font-size : 11px; }

.st-actions {
    display : flex;
    gap     : 10px;
    margin-top : 12px;
}

.st-btn { width : auto; padding : 6px 16px; }

/* ------------------------------------------------------------------ */
/* Banner + toolbar                                                   */
/* ------------------------------------------------------------------ */
/* SAP Fiori shell header (#354a5f) */
.fr-banner {
    height          : 28px;
    display         : flex;
    align-items     : center;
    justify-content : flex-start;
    gap             : 12px;
    padding         : 0 12px;
    background      : #354a5f;
    color           : #fff;
    font-weight     : 600;
    font-size       : 12px;
    font-family     : '72', 'Segoe UI', Arial, sans-serif;
    border-bottom   : 1px solid #2b3d4f;
    flex            : none;
}

.mb-banner-sub { font-weight : normal; color : #bac8d3; }

.fr-banner-btns {
    margin-left : auto;
    display     : flex;
    gap         : 4px;
    align-items : center;
}

.fr-banner-btn {
    cursor        : pointer;
    padding       : 0 9px;
    line-height   : 18px;
    border        : none;
    border-radius : 4px;
    background    : rgba(255, 255, 255, 0.14);
    color         : #fff;
    font-size     : 11px;
    user-select   : none;
    transition    : background 0.12s;
}

.fr-banner-btn:hover { background : rgba(255, 255, 255, 0.28); }
.fr-banner-x:hover   { background : #e5484d; color : #fff; }

/* SAP Fiori toolbar: white bar, blue icon buttons */
.fr-toolbar {
    display     : flex;
    align-items : center;
    gap         : 2px;
    padding     : 3px 6px;
    min-height  : 32px;
    background  : #fff;
    border-bottom : 1px solid #d9d9d9;
    flex        : none;
    position    : relative;
    z-index     : 100;
}

.fr-tb-btn {
    width       : 28px;
    height      : 26px;
    padding     : 0;
    display     : inline-flex;
    align-items : center;
    justify-content : center;
    gap         : 2px;
    background  : transparent;
    color       : #0a6ed1;
    border      : 1px solid transparent;
    cursor      : pointer;
    font-family : inherit;
    border-radius : 4px;
    transition  : background 0.1s, border-color 0.1s;
}

.fr-tb-btn:hover  { background : #eaf3fb; border-color : #b3d4f0; }
.fr-tb-btn:active { background : #d4e8fa; border-color : #0a6ed1; }
.fr-tb-red  { color : #bb0000; }
.fr-tb-red:hover { background : #fbeaea; border-color : #e8b3b3; }
.fr-tb-save { color : #107e3e; }
.fr-tb-save:hover { background : #ebf5ef; border-color : #a8d5bb; }
.fr-tb-fa   { font-size : 13px; line-height : 1; }
.fr-tb-caret { font-size : 8px; line-height : 1; color : inherit; }
.fr-tb-anchor > .fr-tb-btn { width : auto; padding : 0 6px; }
.fr-tb-sep  { width : 1px; height : 18px; background : #d9d9d9; margin : 0 4px; }

.fr-tb-search {
    display       : flex;
    align-items   : center;
    gap           : 7px;
    margin-left   : 10px;
    padding       : 2px 10px;
    background    : #fff;
    border        : 1px solid #89919a;
    border-radius : 4px;
    min-width     : 220px;
    height        : 26px;
    transition    : border-color 0.1s, box-shadow 0.1s;
}

.fr-tb-search:focus-within {
    border-color : #0a6ed1;
    box-shadow   : 0 0 0 2px rgba(10, 110, 209, 0.18);
}

.fr-tb-search-ico {
    font-size : 12px;
    color     : #6a6d70;
    flex      : none;
}

.fr-tb-search input {
    border     : none;
    outline    : none;
    flex       : 1;
    min-width  : 0;
    font-size  : 12px;
    font-family : inherit;
    background : transparent;
}

.fr-tb-anchor { position : relative; display : inline-flex; }

.fr-colormenu {
    position      : absolute;
    top           : 32px;
    left          : 0;
    z-index       : 10000;
    min-width     : 200px;
    background    : #fff;
    border        : 1px solid #d9d9d9;
    border-radius : 4px;
    box-shadow    : 0 6px 16px rgba(0, 0, 0, 0.18);
    padding       : 4px;
}

.fr-colormenu-item {
    display       : flex;
    align-items   : center;
    gap           : 10px;
    padding       : 7px 10px;
    font-size     : 13px;
    white-space   : nowrap;
    cursor        : pointer;
    border-radius : 4px;
    color         : #32363a;
}

.fr-colormenu-item:hover { background : #eaf3fb; color : #0a6ed1; }
.fr-colormenu-active { background : #d4e8fa; }
.fr-colormenu-ico { width : 16px; text-align : center; }

/* Legend (document 10: never rely on colour alone) */
.mb-legend {
    margin-left : auto;
    display     : flex;
    gap         : 6px;
    align-items : center;
    padding-right : 6px;
}

.mb-lg {
    padding       : 1px 7px;
    border-radius : 3px;
    color         : #fff;
    font-size     : 10px;
}

.mb-lg-green  { background : #43a047; }
.mb-lg-yellow { background : #f9a825; color : #222; }
.mb-lg-orange { background : #fb8c00; }
.mb-lg-red    { background : #e53935; }
.mb-lg-grey   { background : #9e9e9e; }
.mb-lg-blue   { background : #1e88e5; }

/* ------------------------------------------------------------------ */
/* Locked grid                                                        */
/* ------------------------------------------------------------------ */
.b-grid-cell.mb-linecell { padding : 1px 4px 1px 3px; }

.fr-line {
    display     : flex;
    align-items : center;
    gap         : 5px;
    height      : 100%;
    min-height  : 42px;
    font-family : Tahoma, Arial, sans-serif;
}

.fr-line-chip {
    flex            : 0 0 auto;
    min-width       : 22px;
    height          : 38px;
    border          : 1px solid #a06060;
    display         : flex;
    align-items     : flex-start;
    justify-content : center;
    font-size       : 9px;
    padding         : 1px 3px;
    color           : #222;
    background      : #f5b7b1;
    box-sizing      : border-box;
}

.fr-line-chip-gray { background : #c4c4c4; }
.fr-line-chip-red  { background : #f5b7b1; }
.fr-line-chip-hold { background : #f5b7b1; color : #111; }

.fr-line-mid { flex : 1 1 auto; min-width : 0; overflow : hidden; }

.fr-line-name {
    font-weight   : bold;
    font-size     : 12px;
    display       : flex;
    align-items   : center;
    gap           : 4px;
    white-space   : nowrap;
}

.fr-line-ico {
    width        : 11px;
    height       : 11px;
    flex         : none;
    background   : #1b52ad;
    clip-path    : polygon(22% 0, 78% 0, 78% 42%, 100% 42%, 50% 100%, 0 42%, 22% 42%);
}

.fr-line-sub  { font-size : 10px; color : #333; padding-left : 15px; }

.fr-line-nums {
    flex        : 0 0 48px;
    text-align  : right;
    line-height : 1.2;
    font-size   : 11px;
    white-space : nowrap;
}

.fr-n-red   { color : #cc0000; font-weight : bold; }
.fr-n-blue  { color : #0033cc; }
.fr-n-black { color : #000; }

.mb-hold-row .b-grid-cell,
.b-grid-row.mb-hold-row .b-grid-cell,
.mb-subtotal-row .b-grid-cell,
.b-grid-row.mb-subtotal-row .b-grid-cell {
    background : #ffff00 !important;
}

.fr-line-foot {
    padding     : 2px 8px;
    font-size   : 11px;
    color       : #222;
    font-family : Tahoma, Arial, sans-serif;
}

.mb-cap { display : flex; flex-direction : column; align-items : flex-end; line-height : 1.2; }
.mb-cap span { font-size : 9px; }
.mb-cap-over  { color : #c62828; }
.mb-cap-tight { color : #ef6c00; }
.mb-cap-ok    { color : #2e7d32; }
.mb-cap-free  { color : #1565c0; }
.mb-dim       { color : #999; }

.mb-stage-row .b-grid-cell { background : #f2f0ea; }

.fr-clock {
    font-size   : 10px;
    font-weight : bold;
    line-height : 1.3;
    padding     : 1px 3px;
    white-space : nowrap;
    overflow    : hidden;
    font-family : Tahoma, Arial, sans-serif;
}

.mb-sched-wrap .b-grid-sub-grid-locked .b-grid-header {
    background : #f0f0f0;
}

.mb-sched-wrap .b-grid-sub-grid-locked .b-grid-header-text {
    white-space : normal;
}

/* ------------------------------------------------------------------ */
/* Order bars (document 10)                                           */
/* ------------------------------------------------------------------ */
/* FastReact-style bars: every bar identical height (top 75% of the row),
   square corners - colour never changes the geometry. The bottom 25% is a
   blank band showing day-wise manpower. */
.b-sch-event-wrap {
    /* Keep Bryntum's per-row `top` so bars stay on their assigned line.
       Bars sit at the TOP of the row (FastReact look). */
    height     : 32px !important;
    margin-top : 2px;
}

.b-sch-event {
    font-size     : 10px;
    box-sizing    : border-box;
    border-radius : 0;
    height        : 100%;
    align-items   : center;
    /* Persistent order-to-order separator (FastReact): a hard vertical
       edge so adjacent strips on a line stay clearly split */
    border-top    : 1px solid rgba(0, 0, 0, 0.45);
    border-bottom : 1px solid rgba(0, 0, 0, 0.45);
    border-left   : 2px solid #111;
    border-right  : 2px solid #111;
    box-shadow    : inset 1px 0 0 rgba(255, 255, 255, 0.55),
                    inset -1px 0 0 rgba(255, 255, 255, 0.35);
}

.mb-bar { width : 100%; }

/* Day-wise manpower figures in the bottom band */
.b-sch-resource-time-range.mb-mp {
    background      : transparent;
    color           : #222;
    font-size       : 9px;
    display         : flex;
    align-items     : flex-start;
    justify-content : center;
    padding-top     : 1px;
    border          : none;
    pointer-events  : none;
}

.mb-bar { padding : 2px 4px; overflow : hidden; line-height : 1.35; }
.mb-bar-l1 { font-weight : bold; white-space : nowrap; }
.mb-bar-l2 { white-space : nowrap; font-size : 9.5px; }

.b-sch-event.mb-risk-green  { background : #43a047; color : #fff; }
.b-sch-event.mb-risk-yellow { background : #f9a825; color : #222; }
.b-sch-event.mb-risk-orange { background : #fb8c00; color : #fff; }
.b-sch-event.mb-risk-red    { background : #e53935; color : #fff; }
.b-sch-event.mb-risk-grey   { background : #9e9e9e; color : #fff; }
.b-sch-event.mb-risk-blue   { background : #1e88e5; color : #fff; }

.b-sch-event.mb-search-dim {
    opacity : 0.18;
    filter  : grayscale(0.45);
}

.b-sch-event.mb-search-hit {
    outline    : 2px solid #fff;
    box-shadow : 0 0 0 2px #1b52ad;
    z-index    : 4;
}

.b-sch-event.b-selected { outline : 2px solid #ff9800; }

/* keep percent bar subtle under the text */
.b-sch-event .b-task-percent-bar {
    opacity : 0.25;
}

.b-sch-current-time { border-color : #6a1b9a; border-width : 1px; }
.b-sch-current-time label { display : none; }

/* Highlighted horizontal separators between the lines (rows) */
.b-grid-sub-grid-normal .b-grid-row {
    border-bottom : 1px solid #c0c0c0;
}

.b-grid-sub-grid-locked .b-grid-row {
    border-bottom : 1px solid #c0c0c0;
}

.b-grid-sub-grid-locked .b-grid-row:nth-child(even):not(.mb-hold-row):not(.mb-subtotal-row) .b-grid-cell {
    background : #f7f7f7;
}

/* FastReact: thin dark-red divider after the line-list scrollbar */
.mb-fr-vscroll-on .b-grid-splitter {
    width          : 2px !important;
    min-width      : 2px !important;
    background     : #8b1515 !important;
    border         : none !important;
    cursor         : col-resize;
    z-index        : 6;
}

.mb-fr-vscroll-on .b-grid-splitter:hover {
    background : #a51c1c !important;
}

.b-grid-splitter-buttons,
.b-grid-splitter-button-collapse,
.b-grid-splitter-buttons .b-button {
    display : none !important;
}

/* FastReact vertical scrollbar between locked lines and the timeline */
.fr-vscroll,
.fr-vscroll-pad {
    flex       : 0 0 16px;
    width      : 16px;
    min-width  : 16px;
    align-self : stretch;
    box-sizing : border-box;
}

.fr-vscroll-pad {
    background  : #fff;
    border-left : 1px solid #b0b0b0;
}

.fr-vscroll {
    display        : flex;
    flex-direction : column;
    background     : #fff;
    border-left    : 1px solid #b0b0b0;
    z-index        : 5;
    user-select    : none;
}

.fr-vscroll-btn {
    flex       : 0 0 16px;
    width      : 16px;
    height     : 16px;
    padding    : 0;
    margin     : 0;
    background : #e6e6e6;
    border     : 1px solid #fff;
    border-right-color  : #808080;
    border-bottom-color : #808080;
    position   : relative;
    cursor     : pointer;
    box-sizing : border-box;
}

.fr-vscroll-btn:active {
    background          : #d0d0d0;
    border-color        : #808080;
    border-right-color  : #fff;
    border-bottom-color : #fff;
}

.fr-vscroll-up::before,
.fr-vscroll-down::before {
    content      : '';
    position     : absolute;
    left         : 50%;
    top          : 50%;
    border-style : solid;
}

.fr-vscroll-up::before {
    border-width : 0 3.5px 5px 3.5px;
    border-color : transparent transparent #222 transparent;
    transform    : translate(-50%, -60%);
}

.fr-vscroll-down::before {
    border-width : 5px 3.5px 0 3.5px;
    border-color : #222 transparent transparent transparent;
    transform    : translate(-50%, -40%);
}

.fr-vscroll-track {
    flex       : 1 1 auto;
    position   : relative;
    min-height : 0;
    background : #fff;
    cursor     : default;
}

.fr-vscroll-thumb {
    position   : absolute;
    left       : 0;
    right      : 0;
    top        : 0;
    height     : 40px;
    background : #d8d8d8;
    border     : 1px solid #c4c4c4;
    box-sizing : border-box;
    cursor     : default;
}

.fr-vscroll-idle .fr-vscroll-thumb {
    display : none;
}

.mb-fr-vscroll-on .b-yscroll-pad,
.mb-fr-vscroll-on .b-scroll-button {
    display : none !important;
}

.mb-fr-vscroll-on .b-grid-vertical-scroller {
    overflow : clip;
}

.mb-fr-vscroll-on .b-grid-sub-grid-locked::-webkit-scrollbar,
.mb-fr-vscroll-on .b-grid-vertical-scroller::-webkit-scrollbar {
    width  : 0;
    height : 0;
}

/* Date headers: FastReact YY-MM-DD + maroon day lines */
.b-sch-header-timeaxis-cell,
.b-lowest .b-sch-header-timeaxis-cell {
    font-family    : Tahoma, Arial, sans-serif;
    font-size      : 11px;
    font-weight    : normal;
    color          : #000;
    border-right   : 2px solid #800000 !important;
    padding        : 0 2px;
    background     : #d4d0c8;
}

.b-grid-header-container {
    background : #d4d0c8;
    border-bottom : 1px solid #808080;
}

.b-sch-timeaxis-cell,
.b-sch-day-header {
    border-right : 2px solid #800000 !important;
}

/* Day separators in the timeline body: the vertical day lines are drawn
   by .b-column-line elements (not cell borders), so style them to match
   the 2px maroon separators used in the date header exactly */
.b-column-line,
.b-column-line-major {
    border-left : 2px solid #800000 !important;
}

/* FastReact horizontal slider (above Grand totals) */
.fr-hscroll {
    flex           : none;
    height         : 16px;
    display        : flex;
    flex-direction : row;
    align-items    : stretch;
    background     : #fff;
    border-top     : 1px solid #b0b0b0;
    border-bottom  : 1px solid #808080;
    z-index        : 8;
    user-select    : none;
}

.fr-hscroll-btn {
    flex       : 0 0 16px;
    width      : 16px;
    height     : 16px;
    padding    : 0;
    margin     : 0;
    background : #e6e6e6;
    border     : 1px solid #fff;
    border-right-color  : #808080;
    border-bottom-color : #808080;
    position   : relative;
    cursor     : pointer;
    box-sizing : border-box;
}

.fr-hscroll-btn:active {
    background          : #d0d0d0;
    border-color        : #808080;
    border-right-color  : #fff;
    border-bottom-color : #fff;
}

.fr-hscroll-left::before,
.fr-hscroll-right::before {
    content      : '';
    position     : absolute;
    left         : 50%;
    top          : 50%;
    border-style : solid;
}

.fr-hscroll-left::before {
    border-width : 3.5px 5px 3.5px 0;
    border-color : transparent #222 transparent transparent;
    transform    : translate(-60%, -50%);
}

.fr-hscroll-right::before {
    border-width : 3.5px 0 3.5px 5px;
    border-color : transparent transparent transparent #222;
    transform    : translate(-40%, -50%);
}

.fr-hscroll-track {
    flex       : 1 1 auto;
    position   : relative;
    min-width  : 0;
    background : #fff;
}

.fr-hscroll-thumb {
    position   : absolute;
    top        : 0;
    bottom     : 0;
    left       : 0;
    width      : 80px;
    background : #d8d8d8;
    border     : 1px solid #c4c4c4;
    box-sizing : border-box;
}

.mb-fr-vscroll-on .b-virtual-scrollers {
    height         : 0 !important;
    min-height     : 0 !important;
    overflow       : hidden !important;
    pointer-events : none;
    border         : none !important;
}

/* FastReact footer legend */
.fr-legendbar {
    flex           : none;
    display        : flex;
    align-items    : stretch;
    background     : #d4d0c8;
    border-top     : 1px solid #808080;
    font-family    : Tahoma, Arial, sans-serif;
    font-size      : 10px;
    color          : #000;
    min-height     : 32px;
}

.fr-leg-col {
    flex           : 1 1 0;
    padding        : 2px 8px;
    border-right   : 1px solid #a8a8a8;
    display        : flex;
    flex-direction : column;
    justify-content: center;
    gap            : 1px;
    white-space    : nowrap;
}

.fr-leg-col span { color : #333; }
.fr-leg-last { border-right : none; }

.fr-leg-dot {
    display       : inline-block;
    width         : 8px;
    height        : 8px;
    border-radius : 50%;
    margin-right  : 4px;
    vertical-align: middle;
}
.fr-leg-red { background : #cc0000; }

/* ------------------------------------------------------------------ */
/* Summary footer                                                     */
/* ------------------------------------------------------------------ */
.b-grid-footer-container {
    background : #d4d0c8;
    border-top : 1px solid #808080;
    min-height : 42px;
}

.b-grid-footer { padding : 1px 2px; }

.fr-gt {
    display        : flex;
    flex-direction : column;
    align-items    : flex-end;
    font-size      : 10px;
    line-height    : 1.25;
    font-family    : Tahoma, Arial, sans-serif;
    color          : #000;
}
.fr-gt-pos { color : #0033cc; font-weight : bold; }
.fr-gt-neg { color : #cc0000; font-weight : bold; }

/* Grand totals rows: day plan (blue) / actual production (green) / +/- */
.fr-gt-plan { color : #17356b; font-weight : bold; }
.fr-gt-act  { color : #0a8f3c; font-weight : bold; }

.fr-gt-legend {
    font-size   : 9px;
    font-weight : normal;
    color       : #555;
    line-height : 1.2;
}

.fr-grand-label { font-weight : normal; color : #000; padding-left : 4px; }

/* ------------------------------------------------------------------ */
/* Tooltip                                                            */
/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* Tooltip — FastReact pale-yellow Label : Value box                  */
/* ------------------------------------------------------------------ */
.b-tooltip.mb-fr-tip,
.b-sch-event-tooltip.mb-fr-tip {
    background    : #ffffc8;
    border        : 1px solid #000;
    border-radius : 0;
    box-shadow    : none;
    padding       : 3px 8px 5px;
    color         : #000;
}

.b-tooltip.mb-fr-tip .b-tooltip-content,
.b-sch-event-tooltip.mb-fr-tip .b-tooltip-content {
    background : transparent;
    padding    : 0;
    color      : #000;
}

.b-tooltip.mb-fr-tip .b-tooltip-arrow,
.b-sch-event-tooltip.mb-fr-tip .b-tooltip-arrow { display : none; }

.mb-tip {
    font-size   : 12px;
    line-height : 1.4;
    color       : #000;
    font-family : Tahoma, Arial, sans-serif;
    white-space : nowrap;
}

.mb-tip-stage { text-decoration : underline; }
.mb-tip-order { font-weight : bold; }

.mb-tip-title { font-weight : bold; margin-bottom : 2px; }
.mb-tip ul { margin : 4px 0 0; padding-left : 16px; }

/* ------------------------------------------------------------------ */
/* Unplanned order panel (document 3.2)                               */
/* ------------------------------------------------------------------ */
.mb-unplanned {
    width       : 232px;
    flex        : none;
    background  : #f7f5ef;
    border-left : 1px solid #a9a494;
    overflow-y  : auto;
    padding     : 6px;
}

.mb-unp-head {
    font-weight : bold;
    font-size   : 12px;
    display     : flex;
    align-items : center;
    gap         : 6px;
}

.mb-unp-count {
    background    : #d40000;
    color         : #fff;
    border-radius : 8px;
    padding       : 0 7px;
    font-size     : 10px;
}

.mb-unp-hint { color : #666; font-size : 10px; margin : 2px 0 8px; }

.mb-unp-card {
    background    : #fff;
    border        : 1px solid #b8b4a8;
    border-left   : 4px solid #1e88e5;
    border-radius : 3px;
    padding       : 5px 7px;
    margin-bottom : 6px;
    cursor        : grab;
    line-height   : 1.45;
}

.mb-unp-card:active { cursor : grabbing; }
.mb-unp-card:hover  { border-color : #1b52ad; box-shadow : 0 1px 4px rgba(0, 0, 0, 0.25); }

.mb-unp-row1 { display : flex; justify-content : space-between; align-items : center; font-size : 11px; }
.mb-unp-row2 { font-size : 10px; color : #333; }
.mb-unp-row3 { font-size : 10px; color : #555; }
.mb-unp-row4 { font-size : 10px; color : #1b52ad; }

.mb-prio { padding : 0 6px; border-radius : 7px; color : #fff; font-size : 9px; }
.mb-prio-1 { background : #e53935; }
.mb-prio-2 { background : #fb8c00; }
.mb-prio-3 { background : #9e9e9e; }

.mb-unp-empty { color : #2e7d32; font-weight : bold; text-align : center; padding : 12px 0; }

/* ------------------------------------------------------------------ */
/* Order detail panel                                                 */
/* ------------------------------------------------------------------ */
.fr-orderbar {
    flex           : none;
    background     : #d4d0c8;
    border-top     : 1px solid #808080;
    padding        : 1px 4px;
    display        : flex;
    flex-direction : column;
    gap            : 0;
    font-family    : Tahoma, Arial, sans-serif;
    font-size      : 11px;
}

.fr-order-row {
    display     : flex;
    align-items : center;
    gap         : 14px;
    height      : 18px;
    white-space : nowrap;
    overflow    : hidden;
}

.fr-order-label {
    flex        : 0 0 82px;
    display     : flex;
    align-items : center;
    gap         : 4px;
    font-weight : bold;
}

.fr-order-ico { font-size : 12px; }

.fr-cell { flex : 0 0 auto; }
.fr-wide { flex : 0 1 560px; overflow : hidden; text-overflow : ellipsis; }

.fr-plain { color : #000; }

.fr-link {
    color           : #17356b;
    text-decoration : underline;
    cursor          : pointer;
}

.fr-magenta { color : #b0189c; }

/* ------------------------------------------------------------------ */
/* Off-day columns: FastReact teal crosshatch                          */
/* ------------------------------------------------------------------ */
.b-time-ranges-canvas .b-sch-range.mb-off,
.b-grid-sub-grid-normal .b-sch-nonworkingtime,
.b-grid-sub-grid-normal .b-sch-non-working-time,
.b-grid-sub-grid-normal .b-sch-range.b-nonworkingtime {
    background :
        repeating-linear-gradient(45deg, #d8d8d8 0 1px, transparent 1px 6px),
        repeating-linear-gradient(-45deg, #d8d8d8 0 1px, transparent 1px 6px),
        #f4f4f4 !important;
}

.b-sch-range.mb-today,
.b-time-ranges-canvas .b-sch-range.mb-today {
    background :
        repeating-linear-gradient(45deg, #f0e070 0 1px, transparent 1px 6px),
        repeating-linear-gradient(-45deg, #f0e070 0 1px, transparent 1px 6px),
        #fffde0 !important;
    z-index : 0;
}

/* ------------------------------------------------------------------ */
/* Calendars dialog (FastReact style)                                  */
/* ------------------------------------------------------------------ */
.cal-overlay {
    position   : fixed;
    inset      : 0;
    background : rgba(0, 0, 0, 0.25);
    z-index    : 30000;
    display    : flex;
    align-items : center;
    justify-content : center;
}

.cal-dialog {
    width      : 700px;
    background : #f0efe8;
    border     : 1px solid #7a7a7a;
    box-shadow : 3px 4px 12px rgba(0, 0, 0, 0.45);
    font-size  : 12px;
}

.cal-title {
    display     : flex;
    align-items : center;
    padding     : 6px 10px;
    font-weight : bold;
    font-size   : 13px;
    background  : #fff;
    border-bottom : 1px solid #c9c5b8;
}

.cal-title-btns { margin-left : auto; }

.cal-x {
    cursor  : pointer;
    padding : 0 6px;
    font-weight : normal;
}

.cal-x:hover { background : #d64541; color : #fff; }

.cal-tabs {
    display : flex;
    gap     : 2px;
    padding : 4px 6px;
    background : #f0efe8;
    border-bottom : 1px solid #c9c5b8;
}

.cal-tab {
    padding : 4px 10px;
    border  : 1px outset #fff;
    background : #e9e6df;
    cursor  : default;
    white-space : nowrap;
}

.cal-tab-active { background : #fff; border-style : inset; }
.cal-tab:hover  { background : #f4f2ec; }

.cal-body {
    display : flex;
    gap     : 14px;
    padding : 12px;
}

.cal-left { width : 190px; flex : none; }

.cal-label { margin-bottom : 3px; }

.cal-name {
    width   : 100%;
    padding : 3px 5px;
    border  : 1px inset #999;
    font-family : inherit;
    font-size : 12px;
    box-sizing : border-box;
}

.cal-list {
    height     : 240px;
    background : #fff;
    border     : 1px inset #999;
    margin     : 4px 0 10px;
    overflow-y : auto;
}

.cal-list div { padding : 3px 8px; cursor : default; }
.cal-list .cal-sel { background : #1b52ad; color : #fff; }

.cal-btn {
    display : block;
    width   : 100%;
    padding : 6px;
    margin-bottom : 6px;
    border  : 1px outset #fff;
    background : #e9e6df;
    cursor  : pointer;
    font-family : inherit;
    font-size : 12px;
}

.cal-btn:active { border-style : inset; }
.cal-btn-primary { border : 1px solid #1b52ad; }

.cal-right { flex : 1; }

.cal-wh-tab {
    display : inline-block;
    padding : 4px 12px;
    background : #fff;
    border  : 1px solid #c9c5b8;
    border-bottom : none;
    margin-bottom : 0;
}

.cal-grid {
    display : grid;
    grid-template-columns : 110px 90px 90px 170px;
    gap : 6px 12px;
    background : #fff;
    border : 1px solid #c9c5b8;
    padding : 12px;
    align-items : center;
}

.cal-ghead { font-weight : bold; color : #17356b; }
.cal-day   { text-align : left; }
.cal-total-label { font-weight : normal; }

.cal-in {
    width   : 70px;
    padding : 3px 6px;
    border  : 1px inset #999;
    font-family : inherit;
    font-size : 12px;
    text-align : center;
}

.cal-in.cal-off { background : #ffe9e9; color : #c62828; font-weight : bold; }
.cal-in.cal-ro  { background : #f0efe8; }

.cal-shifts { margin-top : 10px; display : flex; gap : 10px; align-items : center; }

.cal-hint { margin-top : 10px; color : #555; }

/* ------------------------------------------------------------------ */
/* Pick & place ghost                                                  */
/* ------------------------------------------------------------------ */
.mb-carrying,
.mb-carrying * { cursor : grabbing !important; }

/* Picked-up bar leaves its old position while being carried */
.b-sch-event.mb-carried-away { display : none !important; }
.b-sch-event-wrap:has(.mb-carried-away) { display : none !important; }

.mb-ghost {
    position       : fixed;
    z-index        : 25000;
    pointer-events : none;
    transform      : translateY(-50%); /* cursor sits at the bar's start, mid-height */
    min-width      : 170px;
    max-width      : 300px;
    color          : #fff;
    border         : 1px solid rgba(0, 0, 0, 0.5);
    box-shadow     : 3px 4px 10px rgba(0, 0, 0, 0.45);
    padding        : 4px 8px;
    font-size      : 10px;
    line-height    : 1.4;
    opacity        : 0.92;
}

.mb-ghost-l1 { font-weight : bold; white-space : nowrap; overflow : hidden; }
.mb-ghost-l2 { white-space : nowrap; }

/* ------------------------------------------------------------------ */
/* Bottom window taskbar                                               */
/* ------------------------------------------------------------------ */
.fr-taskbar {
    position   : relative;
    z-index    : 40000;   /* stays clickable above dialog overlays */
    display    : flex;
    gap        : 3px;
    padding    : 3px 4px;
    background : #e9e6df;
    border-top : 1px solid #a9a494;
    flex       : none;
}

.fr-task {
    display     : flex;
    align-items : center;
    gap         : 6px;
    padding     : 4px 10px;
    background  : #f4f2ec;
    border      : 1px outset #fff;
    cursor      : pointer;
    font-size   : 11px;
    max-width   : 220px;
}

.fr-task:hover { background : #cfe0f7; }

.fr-task-min {
    border-style : inset;
    background   : #e0ddd4;
    font-style   : italic;
}

.fr-task-t {
    white-space   : nowrap;
    overflow      : hidden;
    text-overflow : ellipsis;
}

.fr-task-x {
    padding   : 0 3px;
    color     : #7a1f1f;
    font-size : 10px;
}

.fr-task-x:hover { background : #d64541; color : #fff; }

.cal-minbtn { margin-right : 2px; }
.cal-minbtn:hover { background : #1b52ad; color : #fff; }

/* ------------------------------------------------------------------ */
/* Toasts                                                             */
/* ------------------------------------------------------------------ */
.mb-toasts {
    position : fixed;
    top      : 64px;
    right    : 246px;
    z-index  : 20000;
    display  : flex;
    flex-direction : column;
    gap      : 6px;
    max-width : 380px;
}

.mb-toast {
    padding       : 8px 12px;
    border-radius : 4px;
    color         : #fff;
    font-size     : 12px;
    box-shadow    : 0 2px 8px rgba(0, 0, 0, 0.35);
}

.mb-toast-error { background : #c62828; }
.mb-toast-warn  { background : #ef6c00; }
.mb-toast-ok    { background : #2e7d32; }
</style>
