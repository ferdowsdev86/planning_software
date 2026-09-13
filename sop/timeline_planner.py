"""
SOP-PLN-01 — Order Timeline Planning (v2.0)
Backward production-timeline planner — pure, dependency-free logic.

Every public rule of the SOP is enforced here and referenced by section number
in the docstrings so the code can be reviewed against the SOP text side by side.
No UI, no database, no I/O: the module can be ported to any language 1:1
(a JavaScript port lives in src/sopTimeline.mjs of the planning app).

Sections
    1. Inputs / order classification ............ OrderInput, classify_wash()
    2. PP (pre-production) block duration ....... pp_duration()
    3. Production run (capacity-derived) ........ production_run()
    4. Fixed blocks ............................. THROUGHPUT_DAYS, EX_FACTORY_DAYS
    5. Backward calculation + holiday handling .. compute_milestones()
    6. Entry gates .............................. entry_gates()
    7. Control-rule validation & escalation ..... validate()
    8. Versioning ............................... plan(), recalculate()
    9. Self-test (SOP worked example) ........... __main__
"""
from __future__ import annotations

import math
from dataclasses import dataclass, field
from datetime import date, timedelta
from typing import Dict, List, Optional

# --------------------------------------------------------------------------
# Section 1 — inputs & classification
# --------------------------------------------------------------------------

#: SOP §1: wash types that are ALWAYS critical (any of these, or any wash
#: needing more than one trial cycle).
CRITICAL_WASH_KEYWORDS = (
    "acid", "heavy stone", "heavy enzyme", "stone/enzyme", "bleach", "spray",
    "over-dye", "overdye", "over dye", "tint", "multi-process", "multi process",
    "multiprocess",
)

#: SOP §2: SMV threshold — above this the SMV is "high".
HIGH_SMV_THRESHOLD = 25.0

#: SOP §3: defaults / limits for the production run.
DEFAULT_PRODUCTION_DAYS_UNCONFIRMED = 10
MIN_PRODUCTION_DAYS = 5
CAPACITY_REVIEW_DAYS = 20

#: SOP §4: fixed blocks (calendar days).
THROUGHPUT_DAYS = 2      # line feeding through first output
EX_FACTORY_DAYS = 6      # production complete → ex-factory (finish, QC, pack, docs)

#: SOP §5: responsible party per milestone (fixed mapping).
RESPONSIBLE = {
    "ex_factory": "Merchandising",
    "production_complete": "Planning",
    "production_start": "Planning",
    "throughput_start": "Planning",
    "pp_start": "Planning",
}


def classify_wash(wash_type: Optional[str], trial_cycles: int = 1) -> str:
    """SOP §1 — classify a wash as ``"critical"`` or ``"normal"``.

    Critical = any wash needing more than one trial cycle, OR any of: acid,
    heavy stone/enzyme, bleach/spray, over-dye, tint, multi-process.
    Anything else (including an explicit ``"normal"``) is normal.
    """
    if trial_cycles > 1:
        return "critical"
    text = (wash_type or "").strip().lower()
    if text == "critical":
        return "critical"
    if any(k in text for k in CRITICAL_WASH_KEYWORDS):
        return "critical"
    return "normal"


@dataclass
class OrderInput:
    """SOP §1 — everything the planner needs about one order.

    ``ex_factory_date`` is locked from the buyer PO and is the ONLY anchor of the
    whole timeline (§5). Quantity / SMV may be ``None`` while unconfirmed (§3).
    """
    ex_factory_date: date
    lines: int
    operators_per_line: int
    working_minutes_per_day: int
    efficiency: float                      # 0.55 == 55 %
    wash_type: str = "normal"              # free text or "critical"/"normal"
    order_quantity: Optional[int] = None
    smv: Optional[float] = None            # minutes
    wash_confirmed: bool = True
    smv_confirmed: bool = True
    quantity_confirmed: bool = True
    wash_trial_cycles: int = 1
    holiday_dates: List[date] = field(default_factory=list)
    today_date: date = field(default_factory=date.today)
    version: int = 1
    superseded_from: Optional["PlanResult"] = None

    @property
    def wash_class(self) -> str:
        """Classified wash per §1 (``critical`` / ``normal``)."""
        return classify_wash(self.wash_type, self.wash_trial_cycles)


# --------------------------------------------------------------------------
# Section 2 — PP block duration
# --------------------------------------------------------------------------

@dataclass
class PPBlock:
    days: int
    basis: str                  # "matrix" | "provisional_conservative"
    note: str = ""


def pp_duration(order: OrderInput) -> PPBlock:
    """SOP §2 — pre-production block length.

    Matrix: 5 days ONLY when wash is normal AND SMV is normal (<= 25.0 min);
    either condition alone (critical wash OR high SMV) → 7 days.

    Provisional inputs: if wash OR SMV is not confirmed, ALWAYS 7 days
    (``basis = "provisional_conservative"``). A provisional 7-day block must
    never be reduced back to 5 without confirmation — re-issue the plan once
    wash/SMV are confirmed.
    """
    if not order.wash_confirmed or not order.smv_confirmed:
        return PPBlock(
            days=7,
            basis="provisional_conservative",
            note=("re-issue once wash/SMV confirmed — never reduce a provisional "
                  "7-day PP block back down without confirmation."),
        )
    high_smv = order.smv is not None and order.smv > HIGH_SMV_THRESHOLD
    if order.wash_class == "normal" and not high_smv:
        return PPBlock(days=5, basis="matrix", note="normal wash + normal SMV")
    return PPBlock(days=7, basis="matrix",
                   note="critical wash and/or high SMV (> 25.0 min)")


# --------------------------------------------------------------------------
# Section 3 — production run
# --------------------------------------------------------------------------

@dataclass
class ProductionRun:
    days: int
    daily_output: Optional[float]       # pcs/day, None when unconfirmed
    basis: str                          # "capacity" | "default_unconfirmed"
    clamped: bool = False               # raised to the 5-day minimum
    needs_capacity_review: bool = False # > 20 days
    message: str = ""


def production_run(order: OrderInput) -> ProductionRun:
    """SOP §3 — capacity-derived production run.

    daily_output   = lines × operators_per_line × working_minutes_per_day × efficiency ÷ SMV
    production_days = ceil(order_quantity ÷ daily_output)

    * quantity or SMV unconfirmed / missing → 10 days (``default_unconfirmed``)
    * always rounded UP to whole days
    * never below 5 days (clamped, flagged)
    * over 20 days → ``needs_capacity_review`` warning (not a hard block)
    """
    unconfirmed = (order.order_quantity is None or order.smv is None
                   or not order.quantity_confirmed or not order.smv_confirmed)
    if unconfirmed:
        return ProductionRun(days=DEFAULT_PRODUCTION_DAYS_UNCONFIRMED, daily_output=None,
                             basis="default_unconfirmed",
                             message="quantity/SMV not confirmed — default 10-day run")
    if order.smv <= 0:
        raise ValueError("SMV must be > 0")
    daily_output = (order.lines * order.operators_per_line
                    * order.working_minutes_per_day * order.efficiency) / order.smv
    if daily_output <= 0:
        raise ValueError("daily_output must be > 0 — check lines/operators/minutes/efficiency")
    days = math.ceil(order.order_quantity / daily_output)
    run = ProductionRun(days=days, daily_output=daily_output, basis="capacity")
    if days < MIN_PRODUCTION_DAYS:
        run.days = MIN_PRODUCTION_DAYS
        run.clamped = True
        run.message = f"formula gave {days} day(s) — clamped to the 5-day minimum"
    if run.days > CAPACITY_REVIEW_DAYS:
        run.needs_capacity_review = True
        run.message = ("Over 20 production days — review with Merchandising: likely "
                       "needs more lines or staged shipments.")
    return run


# --------------------------------------------------------------------------
# Section 5 — backward calculation
# --------------------------------------------------------------------------

@dataclass
class Milestone:
    name: str
    date: date
    day_of_week: str
    responsible: str


@dataclass
class Adjustment:
    block: str
    holiday_days_added: int
    shifted_from: date
    shifted_to: date


@dataclass
class Block:
    """One calendar block of the backward chain (start inclusive, end exclusive)."""
    name: str
    days: int
    end: date          # exclusive end == the next milestone's date
    start: date

    def spans(self, d: date) -> bool:
        return self.start <= d < self.end


def _weekday(d: date) -> str:
    return d.strftime("%A")


def _place_block(name: str, end: date, days: int, holidays: List[date],
                 adjustments: List[Adjustment]) -> Block:
    """Place one block ending at ``end`` and extend it for holidays inside it.

    SOP §5: a holiday/closure inside a block extends that block by the number of
    overlapping holiday days (start pushed earlier); repeated until the extended
    span contains no further un-counted holidays.
    """
    start = end - timedelta(days=days)
    counted: set = set()
    while True:
        inside = {h for h in holidays if start <= h < end and h not in counted}
        if not inside:
            break
        counted |= inside
        new_start = start - timedelta(days=len(inside))
        adjustments.append(Adjustment(block=name, holiday_days_added=len(inside),
                                      shifted_from=start, shifted_to=new_start))
        start = new_start
    return Block(name=name, days=(end - start).days, end=end, start=start)


def compute_milestones(order: OrderInput, pp: PPBlock, run: ProductionRun
                       ) -> tuple[Dict[str, Milestone], List[Adjustment], Dict[str, int]]:
    """SOP §5 — backward chain from the locked ex-factory date (calendar days).

        ex_factory          = input
        production_complete = ex_factory − 6
        production_start    = production_complete − production_days
        throughput_start    = production_start − 2
        pp_start            = throughput_start − pp_duration

    Holidays inside a block extend that block and the shift propagates to every
    earlier block automatically because each block ends where the next starts.
    Returns (milestones, adjustments, effective_block_days).
    """
    adjustments: List[Adjustment] = []
    hol = sorted(set(order.holiday_dates))
    ex = order.ex_factory_date
    b_ship = _place_block("ex_factory_block", ex, EX_FACTORY_DAYS, hol, adjustments)
    b_prod = _place_block("production", b_ship.start, run.days, hol, adjustments)
    b_thru = _place_block("throughput", b_prod.start, THROUGHPUT_DAYS, hol, adjustments)
    b_pp = _place_block("pp", b_thru.start, pp.days, hol, adjustments)

    def ms(name: str, d: date) -> Milestone:
        return Milestone(name=name, date=d, day_of_week=_weekday(d), responsible=RESPONSIBLE[name])

    milestones = {
        "ex_factory": ms("ex_factory", ex),
        "production_complete": ms("production_complete", b_ship.start),
        "production_start": ms("production_start", b_prod.start),
        "throughput_start": ms("throughput_start", b_thru.start),
        "pp_start": ms("pp_start", b_pp.start),
    }
    block_days = {"pp": b_pp.days, "throughput": b_thru.days,
                  "production": b_prod.days, "ex_factory": b_ship.days}
    return milestones, adjustments, block_days


# --------------------------------------------------------------------------
# Section 6 — entry gates
# --------------------------------------------------------------------------

@dataclass
class Gate:
    name: str
    owner: str
    required_by: date


def entry_gates(order: OrderInput, milestones: Dict[str, Milestone]) -> List[Gate]:
    """SOP §6 — validation checklist with computed required-by dates."""
    pp_start = milestones["pp_start"].date
    thru = milestones["throughput_start"].date
    wash_by = pp_start - timedelta(days=2) if order.wash_class == "critical" else pp_start
    return [
        Gate("Buyer PO confirmed with ex-factory date", "Merchandising", pp_start - timedelta(days=7)),
        Gate("Fabric in-house and inspected (4-point); trims in-house", "Store/QA", pp_start),
        Gate("Approved SMV and line layout issued", "IE", pp_start),
        Gate("Wash standard approved by buyer", "Washing/Merchandising", wash_by),
        Gate("PP sample approved, PP meeting held, size set approved", "QA/Merchandising", thru),
    ]


# --------------------------------------------------------------------------
# Result + Section 7 validation + Section 8 versioning
# --------------------------------------------------------------------------

@dataclass
class PlanResult:
    version: int
    ex_factory_date: date
    wash_class: str
    pp: PPBlock
    production: ProductionRun
    milestones: Dict[str, Milestone]
    pp_start_critical_or_high: date        # 7-day scenario (SOP example row 5a)
    pp_start_normal: date                  # 5-day scenario (SOP example row 5)
    adjustments: List[Adjustment]
    gates: List[Gate]
    total_cycle_days: int                  # DISPLAY ONLY — never derives a date (§7.4)
    total_cycle_days_normal: int
    total_cycle_days_critical: int
    breached: bool = False
    breach_days: int = 0
    escalation: str = ""
    resolutions: List[str] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    superseded: bool = False
    superseded_from_version: Optional[int] = None


def _build(order: OrderInput) -> PlanResult:
    pp = pp_duration(order)
    run = production_run(order)
    milestones, adjustments, block_days = compute_milestones(order, pp, run)
    thru = milestones["throughput_start"].date
    total = block_days["pp"] + block_days["throughput"] + block_days["production"] + block_days["ex_factory"]
    base = THROUGHPUT_DAYS + run.days + EX_FACTORY_DAYS
    return PlanResult(
        version=order.version,
        ex_factory_date=order.ex_factory_date,
        wash_class=order.wash_class,
        pp=pp,
        production=run,
        milestones=milestones,
        pp_start_critical_or_high=thru - timedelta(days=7),
        pp_start_normal=thru - timedelta(days=5),
        adjustments=adjustments,
        gates=entry_gates(order, milestones),
        total_cycle_days=total,
        total_cycle_days_normal=5 + base,
        total_cycle_days_critical=7 + base,
    )


def validate(result: PlanResult, order: OrderInput, treat_as_final: bool = False) -> PlanResult:
    """SOP §7 — control rules & escalation (mutates and returns ``result``).

    1. A timeline can only be treated as FINAL once wash and SMV are confirmed;
       asking for a final timeline with provisional inputs is an error.
    2. pp_start before today → ``breached`` + escalation message with N days.
    3. When breached, exactly two resolutions are offered — never compress a block.
    4. ``total_cycle_days`` is display-only (computed in ``_build``); no
       milestone is ever derived from a fixed total.
    """
    if treat_as_final and (not order.wash_confirmed or not order.smv_confirmed):
        result.errors.append(
            "Cannot finalize: wash type and/or SMV are still provisional — "
            "classify (confirm) them before treating this timeline as authoritative.")
    pp_start = result.milestones["pp_start"].date
    if pp_start < order.today_date:
        n = (order.today_date - pp_start).days
        result.breached = True
        result.breach_days = n
        result.escalation = (f"PP start date has passed by {n} days — escalate to Merchandising "
                             "and Planning heads today. Do not shorten the production run to compensate.")
        result.resolutions = [
            f"Move ex-factory date later by at least {n} days and recalculate the full timeline.",
            ("Add production capacity (more lines/operators) so Section 3's formula returns a "
             "production run short enough to still hit the original ex-factory date — "
             "recalculate production_days with new capacity inputs."),
        ]
    return result


def plan(order: OrderInput, treat_as_final: bool = False) -> PlanResult:
    """Public API — full backward plan for one order (all sections)."""
    result = _build(order)
    if order.superseded_from is not None:
        order.superseded_from.superseded = True
        result.superseded_from_version = order.superseded_from.version
    return validate(result, order, treat_as_final)


def recalculate(prior: PlanResult, order: OrderInput, new_ex_factory_date: date,
                treat_as_final: bool = False) -> PlanResult:
    """SOP §8 — a new ex-factory date recomputes EVERY milestone from scratch.

    Returns a fresh result with ``version + 1``; the prior result is marked
    ``superseded``. There is deliberately no API to patch a single milestone.
    """
    order.ex_factory_date = new_ex_factory_date
    order.version = prior.version + 1
    order.superseded_from = prior
    return plan(order, treat_as_final)


# --------------------------------------------------------------------------
# Section 9 — self-test with the SOP's worked example
# --------------------------------------------------------------------------

def _example_order(**overrides) -> OrderInput:
    base = dict(
        ex_factory_date=date(2026, 10, 20), order_quantity=24000, smv=22.0,
        lines=4, operators_per_line=40, working_minutes_per_day=600, efficiency=0.55,
        wash_type="normal", wash_confirmed=True, smv_confirmed=True, quantity_confirmed=True,
        holiday_dates=[], today_date=date(2026, 9, 1),
    )
    base.update(overrides)
    return OrderInput(**base)


def _self_test() -> None:
    # --- SOP worked example -------------------------------------------------
    r = plan(_example_order())
    assert abs(r.production.daily_output - 2400) < 1e-9, r.production.daily_output
    assert r.production.days == 10
    ms = r.milestones
    assert ms["production_complete"].date == date(2026, 10, 14) and ms["production_complete"].day_of_week == "Wednesday"
    assert ms["production_start"].date == date(2026, 10, 4) and ms["production_start"].day_of_week == "Sunday"
    assert ms["throughput_start"].date == date(2026, 10, 2) and ms["throughput_start"].day_of_week == "Friday"
    assert r.pp_start_critical_or_high == date(2026, 9, 25) and _weekday(r.pp_start_critical_or_high) == "Friday"
    assert r.pp_start_normal == date(2026, 9, 27) and _weekday(r.pp_start_normal) == "Sunday"
    assert ms["pp_start"].date == date(2026, 9, 27)           # normal+normal → 5-day block
    assert r.total_cycle_days_critical == 25 and r.total_cycle_days_normal == 23
    assert r.total_cycle_days == 23
    assert ms["ex_factory"].responsible == "Merchandising" and ms["pp_start"].responsible == "Planning"
    assert not r.breached and not r.errors

    # (a) SMV 30.0, 24,000 pcs → 14 production days (and 7-day PP: high SMV)
    ra = plan(_example_order(smv=30.0))
    assert ra.production.days == 14, ra.production.days
    assert ra.pp.days == 7 and ra.pp.basis == "matrix"

    # (b) 36,000 pcs at SMV 22.0 → 15 production days
    rb = plan(_example_order(order_quantity=36000))
    assert rb.production.days == 15, rb.production.days

    # (c) 12,000 pcs at SMV 18.0 → formula 4.09 → ceil 5 (also the 5-day floor)
    rc = plan(_example_order(order_quantity=12000, smv=18.0))
    assert rc.production.days == 5, rc.production.days

    # (d) quantity / SMV unconfirmed → 10-day default run + 7-day conservative PP
    rd = plan(_example_order(order_quantity=None, smv=None, quantity_confirmed=False, smv_confirmed=False))
    assert rd.production.days == 10 and rd.production.basis == "default_unconfirmed"
    assert rd.pp.days == 7 and rd.pp.basis == "provisional_conservative"
    assert "never reduce" in rd.pp.note
    # treating a provisional timeline as final is an error (§7.1)
    assert plan(_example_order(smv_confirmed=False), treat_as_final=True).errors

    # 5-day floor clamp flag: tiny order
    rf = plan(_example_order(order_quantity=2000))
    assert rf.production.days == 5 and rf.production.clamped

    # > 20 days → capacity review warning (not a block)
    rg = plan(_example_order(order_quantity=60000))
    assert rg.production.days == 25 and rg.production.needs_capacity_review

    # Holiday inside the production block extends it and shifts earlier blocks
    rh = plan(_example_order(holiday_dates=[date(2026, 10, 6), date(2026, 10, 7)]))
    assert rh.milestones["production_start"].date == date(2026, 10, 2)
    assert rh.milestones["throughput_start"].date == date(2026, 9, 30)
    assert rh.milestones["pp_start"].date == date(2026, 9, 25)
    assert rh.adjustments and rh.adjustments[0].block == "production" and rh.adjustments[0].holiday_days_added == 2
    assert rh.total_cycle_days == 25   # display-only total reflects the 2 extra days

    # Breach + escalation: today already past pp_start
    rbz = plan(_example_order(today_date=date(2026, 10, 1)))
    assert rbz.breached and rbz.breach_days == 4 and len(rbz.resolutions) == 2
    assert "passed by 4 days" in rbz.escalation

    # Versioning: new ex-factory → full recalculation, version+1, prior superseded
    o = _example_order()
    v1 = plan(o)
    v2 = recalculate(v1, o, date(2026, 10, 27))
    assert v2.version == 2 and v1.superseded and v2.superseded_from_version == 1
    assert v2.milestones["production_start"].date == date(2026, 10, 11)

    # Entry gates
    g = {x.name: x for x in r.gates}
    assert g["Buyer PO confirmed with ex-factory date"].required_by == date(2026, 9, 20)
    assert g["PP sample approved, PP meeting held, size set approved"].required_by == date(2026, 10, 2)
    crit = plan(_example_order(wash_type="acid wash"))
    assert crit.wash_class == "critical" and crit.pp.days == 7
    assert {x.name: x for x in crit.gates}["Wash standard approved by buyer"].required_by == crit.milestones["pp_start"].date - timedelta(days=2)

    print("SOP-PLN-01 self-test: all assertions passed")
    print(f"  worked example: daily_output={r.production.daily_output:.0f} pcs/day, "
          f"production_days={r.production.days}, "
          f"prod_complete={ms['production_complete'].date} ({ms['production_complete'].day_of_week}), "
          f"prod_start={ms['production_start'].date} ({ms['production_start'].day_of_week}), "
          f"throughput_start={ms['throughput_start'].date} ({ms['throughput_start'].day_of_week}), "
          f"pp_start critical/high={r.pp_start_critical_or_high} ({_weekday(r.pp_start_critical_or_high)}), "
          f"pp_start normal={r.pp_start_normal} ({_weekday(r.pp_start_normal)}), "
          f"total critical={r.total_cycle_days_critical} normal={r.total_cycle_days_normal}")


if __name__ == "__main__":
    _self_test()
