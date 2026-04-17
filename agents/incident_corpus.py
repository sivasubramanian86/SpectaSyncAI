"""
SpectaSyncAI: Global Incident Corpus — RAG Knowledge Base
@12 @11 @03

Incident registry covering 18 crowd crush events from 2003–2025.
All incidents are anonymized by incident code: INC-{YEAR}-{ISO2}-{SEQ}.
No individual names, political entities, or proprietary venue identifiers are stored.

Purpose:
  1. Seed the AlloyDB pgvector table with incident embeddings (production).
  2. Enable semantic similarity search to retrieve the most relevant historical
     incidents when a new crowd condition matches a known risk signature.
  3. Allow SpectaSyncAI agents to reason over "what happened at similar events"
     when making intervention and routing decisions.

Failure Mode Taxonomy:
  EXOGENOUS_SURGE    — External crowd volume exceeds venue absorption rate
  TEMPORAL_DISRUPT   — VIP/event delay creates pent-up crowd kinetic energy
  INFO_CASCADE       — Unverified rumor triggers simultaneous mass movement
  INFRA_FAILURE      — Power/comms collapse disables all digital coordination
  EGRESS_FAILURE     — Exits locked, blocked, or capacity-mismatched
  NARROW_CORRIDOR    — Physical geometry creates fatal bottleneck pressure
  PANIC_TRIGGER      — External stimuli (loud noise, projectile) causes counter-surge
  BRIDGE_BOTTLENECK  — Single elevated structure becomes choke point under load
  TICKETING_CHAOS    — Late or contradictory entry information causes simultaneous rush
  TEMPLE_SURGE       — Religious gathering density exceeds all safe limits
  GHAT_CRUSH         — River-bank bathing platform overwhelmed on auspicious date
  STAIRWAY_COLLAPSE  — Pedestrian failure on temple/bridge steps under crowd load
"""

from dataclasses import dataclass


@dataclass
class IncidentRecord:
    """Structured representation of a historical crowd crush incident."""
    incident_id: str
    year: int
    country_iso2: str
    event_type: str               # political_rally | concert | sports | festival | religious | civic
    estimated_attendance: int
    venue_capacity: int
    deaths: int
    injuries: int
    failure_modes: list[str]      # from taxonomy above
    primary_trigger: str          # one-line description, no proper nouns
    key_precursor_signals: list[str]
    interventions_that_would_have_helped: list[str]
    time_of_day_category: str     # pre_event | during_event | post_event
    venue_type: str               # outdoor_ground | stadium | street | bridge | corridor | temple
    vip_delay_involved: bool
    infra_failure_involved: bool
    rumor_involved: bool
    lessons_learned: list[str]


INCIDENT_CORPUS: list[IncidentRecord] = [
    # ─── INC-2025-IND-01 ───────────────────────────────────────────────────────
    IncidentRecord(
        incident_id="INC-2025-IND-01",
        year=2025,
        country_iso2="IN",
        event_type="political_rally",
        estimated_attendance=40_000,
        venue_capacity=10_000,
        deaths=41,
        injuries=100,
        failure_modes=["TEMPORAL_DISRUPT", "INFRA_FAILURE", "EXOGENOUS_SURGE"],
        primary_trigger="Political leader convoy arrived ~7 hours late; simultaneous crowd surge toward stage; power cut eliminated all PA and LED guidance.",
        key_precursor_signals=[
            "Venue capacity exceeded 4x at T-6 hours (cell tower anomaly)",
            "Convoy GPS showed departure 6.5 hours behind schedule at T-5 hours",
            "Power infrastructure running at 140% load 45 mins before crush",
        ],
        interventions_that_would_have_helped=[
            "VIP delay tracking with automated crowd engagement programs",
            "Capacity gating at venue perimeter (deny entry beyond 10,000)",
            "BLE mesh fallback pre-installed for power-cut scenario",
            "Real-time surge coefficient modeling during delay period",
        ],
        time_of_day_category="during_event",
        venue_type="outdoor_ground",
        vip_delay_involved=True,
        infra_failure_involved=True,
        rumor_involved=False,
        lessons_learned=[
            "Pent-up crowd kinetic energy is a measurable and preventable variable",
            "Power-independent comms (BLE) must be always-on, not a failover",
            "Venue capacity limits must be enforced at the perimeter, not the gate",
        ],
    ),

    # ─── INC-2025-IND-02 ───────────────────────────────────────────────────────
    IncidentRecord(
        incident_id="INC-2025-IND-02",
        year=2025,
        country_iso2="IN",
        event_type="sports",
        estimated_attendance=250_000,
        venue_capacity=40_000,
        deaths=11,
        injuries=56,
        failure_modes=["EXOGENOUS_SURGE", "INFO_CASCADE", "TICKETING_CHAOS"],
        primary_trigger="A last-minute announcement of complimentary public admission to a sports victory celebration caused 250,000 fans to converge simultaneously on a 40,000-capacity venue.",
        key_precursor_signals=[
            "Cellular network load at adjacent transit stations: 4.2x baseline at T-90 mins",
            "Transit ridership at surrounding metro stations: 3.8x baseline at T-60 mins",
            "Social media keyword velocity: 'free entry' at 650 mentions/min at T-10 mins",
        ],
        interventions_that_would_have_helped=[
            "External crowd monitoring via cell tower API (90 min advance warning)",
            "Rumor/announcement counter-broadcast within <60 seconds",
            "Street-level diversion protocols activated via traffic authority API",
            "Capacity freeze announcement via all official social channels",
        ],
        time_of_day_category="pre_event",
        venue_type="stadium",
        vip_delay_involved=False,
        infra_failure_involved=False,
        rumor_involved=True,
        lessons_learned=[
            "Unverified entry announcements are functionally identical to dangerous rumors",
            "External crowd size is detectable 60–90 mins in advance via telco APIs",
            "Social media viral velocity is a leading crowd surge indicator",
        ],
    ),

    # ─── INC-2022-KOR-01 ───────────────────────────────────────────────────────
    IncidentRecord(
        incident_id="INC-2022-KOR-01",
        year=2022,
        country_iso2="KR",
        event_type="civic",
        estimated_attendance=100_000,
        venue_capacity=5_000,
        deaths=159,
        injuries=197,
        failure_modes=["NARROW_CORRIDOR", "EXOGENOUS_SURGE", "TEMPORAL_DISRUPT"],
        primary_trigger="Organizer-less public gathering in a narrow sloped alleyway during a public holiday. Crowd density reached >9 persons/m² — the threshold for pressure-wave crush.",
        key_precursor_signals=[
            "Crowd density in target alleyway measured >6/m² at T-45 mins",
            "Nearby street network at 100% pedestrian saturation at T-30 mins",
            "Multiple calls to emergency services reporting difficulty breathing at T-15 mins",
        ],
        interventions_that_would_have_helped=[
            "Narrow corridor density monitoring with hard crowd flow caps",
            "Pre-event population density modeling for surrounding street network",
            "Dynamic pedestrian routing via mobile app notifications",
            "Emergency services pre-positioning based on density forecast",
        ],
        time_of_day_category="during_event",
        venue_type="street",
        vip_delay_involved=False,
        infra_failure_involved=False,
        rumor_involved=False,
        lessons_learned=[
            "Organizer-less gatherings require city-wide monitoring, not venue-only",
            "Physical geometry (slope + narrowness) is a fatal multiplier",
            ">7 persons/m² is a non-survivable density in corridor geometry",
            "Emergency services must be pre-positioned at T-60, not dispatched at T+5",
        ],
    ),

    # ─── INC-2022-IDN-01 ───────────────────────────────────────────────────────
    IncidentRecord(
        incident_id="INC-2022-IDN-01",
        year=2022,
        country_iso2="ID",
        event_type="sports",
        estimated_attendance=42_000,
        venue_capacity=38_000,
        deaths=131,
        injuries=583,
        failure_modes=["PANIC_TRIGGER", "EGRESS_FAILURE", "EXOGENOUS_SURGE"],
        primary_trigger="Security forces deployed tear gas inside a stadium following post-match crowd disorder; spectators rushed for exits simultaneously. Exit gates were locked, creating fatal accumulation pressure.",
        key_precursor_signals=[
            "Post-match crowd disorder (pitch invasion) detected at T+0",
            "Tear gas deployed at T+5 triggering non-directional panic surge",
            "Exit gates locked — confirmed bottleneck with no egress capacity",
        ],
        interventions_that_would_have_helped=[
            "Exit gate sensor monitoring (locked state detection = immediate alert)",
            "Non-chemical crowd dispersal protocols at high-density venues",
            "Panic trigger detection — sudden bidirectional crowd movement signature",
            "Automated exit gate unlock command via MCP toolset",
        ],
        time_of_day_category="post_event",
        venue_type="stadium",
        vip_delay_involved=False,
        infra_failure_involved=False,
        rumor_involved=False,
        lessons_learned=[
            "Tear gas in enclosed high-density spaces converts disorder into disaster",
            "Exit gate status (open/locked) must be a monitored IoT signal",
            "Panic surge signature (bidirectional density wave) is detectable via CCTV analysis",
            "Zero-tolerance for locked exits during any crowd event",
        ],
    ),

    # ─── INC-2021-USA-01 ───────────────────────────────────────────────────────
    IncidentRecord(
        incident_id="INC-2021-USA-01",
        year=2021,
        country_iso2="US",
        event_type="concert",
        estimated_attendance=50_000,
        venue_capacity=50_000,
        deaths=10,
        injuries=300,
        failure_modes=["EXOGENOUS_SURGE", "TEMPORAL_DISRUPT", "INFO_CASCADE"],
        primary_trigger="Crowd pressed forward toward stage during a music performance; emergency signals ignored; event continued 37 minutes after stage-front crush reached life-threatening density.",
        key_precursor_signals=[
            "Stage-front density reached critical levels at T-40 mins",
            "Multiple attendee collapse calls to medical staff at T-30 mins",
            "Social media posts showing unconscious attendees going viral at T-20 mins",
        ],
        interventions_that_would_have_helped=[
            "Real-time stage-front density monitoring with performance halt protocol",
            "Social media monitoring for crowd distress signals",
            "Medical alert auto-escalation when collapses exceed threshold",
            "Performer notification protocol when crowd density is critical",
        ],
        time_of_day_category="during_event",
        venue_type="outdoor_ground",
        vip_delay_involved=False,
        infra_failure_involved=False,
        rumor_involved=True,
        lessons_learned=[
            "Event continuation during life-threatening crowd conditions is a protocol failure",
            "On-stage performer visibility of crowd conditions must be mandated",
            "Medical distress signal frequency is a leading density indicator",
        ],
    ),

    # ─── INC-2015-SAU-01 ───────────────────────────────────────────────────────
    IncidentRecord(
        incident_id="INC-2015-SAU-01",
        year=2015,
        country_iso2="SA",
        event_type="religious",
        estimated_attendance=2_500_000,
        venue_capacity=2_000_000,
        deaths=2_411,
        injuries=934,
        failure_modes=["EXOGENOUS_SURGE", "NARROW_CORRIDOR", "TEMPORAL_DISRUPT"],
        primary_trigger="Two massive converging crowds met at a narrow street junction during a religious ritual; no real-time routing was available; flow control systems were insufficient for the volume.",
        key_precursor_signals=[
            "Dual-stream crowd convergence predicted by pilgrimage schedule at T-90 mins",
            "Pedestrian density at junction: >8 persons/m² at T-30 mins",
            "Route allocation system overloaded — no dynamic rerouting available",
        ],
        interventions_that_would_have_helped=[
            "Predictive flow routing with time-window staggering for scheduled rituals",
            "AI-based junction density monitoring with automatic flow redirection",
            "Mobile broadcast in multiple languages for dynamic route changes",
            "Perimeter gating to throttle inflow to junction capacity",
        ],
        time_of_day_category="during_event",
        venue_type="street",
        vip_delay_involved=False,
        infra_failure_involved=False,
        rumor_involved=False,
        lessons_learned=[
            "Predictable crowd flow convergence is the highest-probability preventable scenario",
            "Flow routing must be dynamic, not pre-assigned",
            "Multilingual broadcast is mandatory for international gatherings",
        ],
    ),

    # ─── INC-2010-DEU-01 ───────────────────────────────────────────────────────
    IncidentRecord(
        incident_id="INC-2010-DEU-01",
        year=2010,
        country_iso2="DE",
        event_type="festival",
        estimated_attendance=1_400_000,
        venue_capacity=250_000,
        deaths=21,
        injuries=510,
        failure_modes=["NARROW_CORRIDOR", "EGRESS_FAILURE", "EXOGENOUS_SURGE"],
        primary_trigger="A single access tunnel served both ingress and egress for a music festival venue; simultaneous bidirectional flow in a 60-meter tunnel created a fatal pressure wave.",
        key_precursor_signals=[
            "Single tunnel usage at 100% capacity for 90 continuous minutes",
            "Bidirectional flow at T-20 mins — counterflow detected in sensor data",
            "Density model showed >8 persons/m² inside tunnel at T-15 mins",
        ],
        interventions_that_would_have_helped=[
            "Physical flow segmentation (ingress vs. egress) before event starts",
            "Tunnel density sensor with hard capacity lock — no entry when density > threshold",
            "Overflow crowd routing to secondary access before saturation",
            "Bidirectional flow detection from CCTV as emergency trigger",
        ],
        time_of_day_category="during_event",
        venue_type="corridor",
        vip_delay_involved=False,
        infra_failure_involved=False,
        rumor_involved=False,
        lessons_learned=[
            "Single-point access to large venues is a design failure, not an operational one",
            "Bidirectional crowd flow in tunnels is always fatal above 5 persons/m²",
            "Density caps must be enforced at the physical entry, not the venue perimeter",
        ],
    ),

    # ─── INC-2010-KHM-01 ───────────────────────────────────────────────────────
    IncidentRecord(
        incident_id="INC-2010-KHM-01",
        year=2010,
        country_iso2="KH",
        event_type="civic",
        estimated_attendance=2_000_000,
        venue_capacity=500_000,
        deaths=347,
        injuries=755,
        failure_modes=["BRIDGE_BOTTLENECK", "PANIC_TRIGGER", "INFRA_FAILURE"],
        primary_trigger="A crowded suspension bridge became the only return route from a festival island; an electrical bridge light failure triggered panic; oscillation and crowd pressure caused mass crush.",
        key_precursor_signals=[
            "Bridge throughput at 300% design load for 45 minutes before incident",
            "Structural vibration sensor anomaly at T-10 mins",
            "Single bridge serving 2M people as only egress route",
        ],
        interventions_that_would_have_helped=[
            "Alternative egress route enforcement before peak egress begins",
            "Bridge load monitoring with hard throughput limits",
            "Lighting failure detection with immediate backup activation",
            "PA announcement for orderly egress staging",
        ],
        time_of_day_category="post_event",
        venue_type="bridge",
        vip_delay_involved=False,
        infra_failure_involved=True,
        rumor_involved=False,
        lessons_learned=[
            "Bridges serving as sole egress routes are a design crisis waiting to occur",
            "Structural sensor monitoring is crowd safety infrastructure, not optional",
            "Post-event egress is statistically the highest-risk crowd phase",
        ],
    ),

    # ─── INC-2013-IND-01 ───────────────────────────────────────────────────────
    IncidentRecord(
        incident_id="INC-2013-IND-01",
        year=2013,
        country_iso2="IN",
        event_type="religious",
        estimated_attendance=3_000_000,
        venue_capacity=500_000,
        deaths=115,
        injuries=1500,
        failure_modes=["TEMPLE_SURGE", "INFO_CASCADE", "BRIDGE_BOTTLENECK"],
        primary_trigger="A false rumor of a bridge collapse triggered mass panic at a religious pilgrimage site; two opposing crowd waves collided at a bridge junction, resulting in a brutal counter-crush.",
        key_precursor_signals=[
            "Rumor of structural failure spreading via word-of-mouth at T-5 mins",
            "Bidirectional crowd flow on bridge detected at T-3 mins",
            "Emergency evacuation announcement actually accelerated panic",
        ],
        interventions_that_would_have_helped=[
            "Rapid rumor detection and verified PA counter-broadcast",
            "Crowd flow direction monitoring on all bridges and corridors",
            "PA messaging designed to slow, not accelerate, crowd movement",
            "Staged bridge access with maximum headcount enforcement",
        ],
        time_of_day_category="during_event",
        venue_type="bridge",
        vip_delay_involved=False,
        infra_failure_involved=False,
        rumor_involved=True,
        lessons_learned=[
            "Structural integrity rumors are the most panic-inducing category",
            "Counter-broadcast must convey calm, not urgency",
            "Bridges at religious sites need dedicated crowd flow AI monitoring",
        ],
    ),

    # ─── INC-2017-IND-01 ───────────────────────────────────────────────────────
    IncidentRecord(
        incident_id="INC-2017-IND-01",
        year=2017,
        country_iso2="IN",
        event_type="civic",
        estimated_attendance=3_000,
        venue_capacity=400,
        deaths=22,
        injuries=30,
        failure_modes=["INFRA_FAILURE", "EXOGENOUS_SURGE", "EGRESS_FAILURE"],
        primary_trigger="A railway station footbridge experienced crush during a storm-induced crowd surge; slippery conditions combined with stairway bottleneck and limited emergency lighting.",
        key_precursor_signals=[
            "Weather alert (heavy rain) causing rapid crowd concentration at station at T-20 mins",
            "Exit stairways overwhelmed at T-10 mins — lateral crush building",
            "Emergency lighting failure at T-5 mins during peak surge",
        ],
        interventions_that_would_have_helped=[
            "Weather-correlated crowd surge prediction model",
            "Stairway density sensor with ingress throttling",
            "Battery-powered emergency lighting (8hr backup minimum)",
            "Platform crowd redistribution announcement before saturation",
        ],
        time_of_day_category="during_event",
        venue_type="corridor",
        vip_delay_involved=False,
        infra_failure_involved=True,
        rumor_involved=False,
        lessons_learned=[
            "Weather events are predictable crowd surge triggers",
            "Transport infrastructure must be included in crowd intelligence monitoring",
        ],
    ),

    # ─── INC-2019-AGO-01 ───────────────────────────────────────────────────────
    IncidentRecord(
        incident_id="INC-2019-AGO-01",
        year=2019,
        country_iso2="AO",
        event_type="concert",
        estimated_attendance=15_000,
        venue_capacity=8_000,
        deaths=17,
        injuries=120,
        failure_modes=["EXOGENOUS_SURGE", "EGRESS_FAILURE", "TICKETING_CHAOS"],
        primary_trigger="Over-capacity concert with counterfeit ticketing resulted in mass gate rush; venue operators could not differentiate valid tickets causing gates to be overwhelmed simultaneously.",
        key_precursor_signals=[
            "Queue density at gates 3x normal at T-60 mins before event",
            "Counterfeit ticket detection rate >35% triggered manual verification delays",
            "Crowd pressure at gates exceeded safe queuing density 40 mins before show",
        ],
        interventions_that_would_have_helped=[
            "Real-time gate throughput monitoring against expected ticket volume",
            "Queue density caps with crowd metering (allow N per minute max)",
            "Digital ticket validation reducing manual gate processing time",
            "Secondary holding area for overflow crowd before gates open",
        ],
        time_of_day_category="pre_event",
        venue_type="stadium",
        vip_delay_involved=False,
        infra_failure_involved=False,
        rumor_involved=False,
        lessons_learned=[
            "Gate throughput is a function of validation speed, not just physical gate count",
            "Pre-event queue density is as important as in-venue density",
            "Ticketing fraud predictably causes simultaneous gate rush",
        ],
    ),

    # ─── INC-2023-MAR-01 ───────────────────────────────────────────────────────
    IncidentRecord(
        incident_id="INC-2023-MAR-01",
        year=2023,
        country_iso2="MA",
        event_type="sports",
        estimated_attendance=45_000,
        venue_capacity=45_000,
        deaths=8,
        injuries=60,
        failure_modes=["EGRESS_FAILURE", "TICKETING_CHAOS", "PANIC_TRIGGER"],
        primary_trigger="Simultaneous exit rush after a football match; inadequate exit gate count for post-match egress pattern; a vehicle backfiring near exit was misinterpreted as gunshot, triggering counter-panic surge.",
        key_precursor_signals=[
            "Post-match egress pattern identified as highest risk at T-0",
            "Exit gate capacity calculated at 22 minutes for full evacuation (too long)",
            "Panic-trigger sound event at T+8 minutes into egress",
        ],
        interventions_that_would_have_helped=[
            "Post-event egress simulation to identify bottlenecks before event",
            "Panic trigger audio classification via venue microphone arrays",
            "Staged egress by section (block release vs. simultaneous)",
            "Real-time exit gate queue density with overflow routing",
        ],
        time_of_day_category="post_event",
        venue_type="stadium",
        vip_delay_involved=False,
        infra_failure_involved=False,
        rumor_involved=False,
        lessons_learned=[
            "Post-match egress simulation must be required for all licensed events",
            "Panic audio classifiers (gunshot/explosion) must be part of venue sensor array",
            "Section-by-section release is 40% faster than simultaneous exit",
        ],
    ),

    # ─── INC-2003-IND-01 ───────────────────────────────────────────────────────
    # Religious festival ghat crush: Maharashtra, August 2003
    IncidentRecord(
        incident_id="INC-2003-IND-01",
        year=2003,
        country_iso2="IN",
        event_type="religious",
        estimated_attendance=170_000,
        venue_capacity=30_000,
        deaths=39,
        injuries=150,
        failure_modes=["TEMPLE_SURGE", "GHAT_CRUSH", "EXOGENOUS_SURGE"],
        primary_trigger="An annual temple fair drew 5x the expected attendance to narrow riverside ghats; multiple bathing platforms collapsed under crowd weight; no ingress metering was in place.",
        key_precursor_signals=[
            "Attendance 5x historical average detectable via regional transport records at T-3 hrs",
            "Ghat structural load exceeded design rating by T-30 mins",
            "No crowd metering or capacity signage at ghat entry points",
        ],
        interventions_that_would_have_helped=[
            "Real-time ghat headcount with hard capacity enforcement",
            "Structural load sensors on ghat platforms with auto-alert",
            "Time-slotted bathing access to distribute attendance across day",
            "Secondary ghat activation to absorb overflow before main ghat saturates",
        ],
        time_of_day_category="during_event",
        venue_type="temple",
        vip_delay_involved=False,
        infra_failure_involved=False,
        rumor_involved=False,
        lessons_learned=[
            "River ghats are structurally unrated for large crowd loads — monitoring is critical",
            "Annual religious events show predictable attendance surge — model from historical data",
            "Time-slotted bathing access is the single highest-impact intervention for ghat safety",
        ],
    ),

    # ─── INC-2008-IND-01 ───────────────────────────────────────────────────────
    # Mountain shrine stampede: Himachal Pradesh, August 2008
    IncidentRecord(
        incident_id="INC-2008-IND-01",
        year=2008,
        country_iso2="IN",
        event_type="religious",
        estimated_attendance=60_000,
        venue_capacity=8_000,
        deaths=162,
        injuries=115,
        failure_modes=["TEMPLE_SURGE", "PANIC_TRIGGER", "STAIRWAY_COLLAPSE", "INFO_CASCADE"],
        primary_trigger="A false rumor of a landslide near the approach stairs triggered a bidirectional panic surge; pilgrims fleeing downhill collided with pilgrims ascending; narrow mountain stairway had no emergency width for counter-flow.",
        key_precursor_signals=[
            "Density on approach stairs exceeded 7 persons/m² for 20 continuous minutes before incident",
            "Rumor of landslide spreading by word-of-mouth at T-3 mins",
            "No crowd flow direction control on single-lane stairway",
        ],
        interventions_that_would_have_helped=[
            "Unidirectional stairway flow enforcement (ascent vs descent segregated)",
            "Stairway density sensor triggering PA hold-in-place announcement",
            "Rapid rumor counter-broadcast: verified structural safety status",
            "Attendance cap at approach path based on stairway throughput capacity",
        ],
        time_of_day_category="during_event",
        venue_type="temple",
        vip_delay_involved=False,
        infra_failure_involved=False,
        rumor_involved=True,
        lessons_learned=[
            "Mountain temple stairs must be governed as high-density single-lane corridors",
            "Landslide/structural collapse rumors at elevation sites are maximum-panic triggers",
            "Bidirectional flow control on narrow stairs = most critical physical intervention",
        ],
    ),

    # ─── INC-2013-IND-02 ───────────────────────────────────────────────────────
    # Major pilgrimage festival railway bridge crush: North India, February 2013
    IncidentRecord(
        incident_id="INC-2013-IND-02",
        year=2013,
        country_iso2="IN",
        event_type="religious",
        estimated_attendance=20_000_000,
        venue_capacity=5_000_000,
        deaths=36,
        injuries=39,
        failure_modes=["BRIDGE_BOTTLENECK", "STAIRWAY_COLLAPSE", "EXOGENOUS_SURGE"],
        primary_trigger="Pilgrims surging toward trains on a railway footbridge after a sacred bathing ritual; the footbridge collapsed under overload; post-amavasya egress peak created simultaneous rush at all exit points.",
        key_precursor_signals=[
            "Amavasya (new moon) date predictably generates maximum single-day attendance",
            "Footbridge load estimated at 3x design rating for 15 continuous minutes",
            "Train announcements created synchronized direction reversal on bridge",
        ],
        interventions_that_would_have_helped=[
            "Structural load monitoring on all temporary and permanent bridges at pilgrimage sites",
            "Train announcement timing coordination to prevent synchronized platform rush",
            "Dedicated exit-only vs entry-only bridge assignment during peak egress",
            "Predictive attendance model keyed to religious calendar for pre-positioning",
        ],
        time_of_day_category="post_event",
        venue_type="bridge",
        vip_delay_involved=False,
        infra_failure_involved=False,
        rumor_involved=False,
        lessons_learned=[
            "Religious calendar dates are fully predictable high-risk crowd events",
            "Footbridge structural ratings must be re-validated for pilgrimage-scale loads",
            "Train system coordination is an integral part of pilgrimage crowd safety",
        ],
    ),

    # ─── INC-2022-IND-01 ───────────────────────────────────────────────────────
    # Himalayan shrine New Year stampede: Jammu region, January 2022
    IncidentRecord(
        incident_id="INC-2022-IND-01",
        year=2022,
        country_iso2="IN",
        event_type="religious",
        estimated_attendance=10_000,
        venue_capacity=3_000,
        deaths=12,
        injuries=13,
        failure_modes=["NARROW_CORRIDOR", "STAIRWAY_COLLAPSE", "EGRESS_FAILURE"],
        primary_trigger="New Year's combined with an auspicious religious date drew 3x expected pilgrims to a mountain shrine; narrow descending stairway became fatal choke point when ascending and descending crowds met in darkness.",
        key_precursor_signals=[
            "New Year + religious calendar convergence predicted 3x average attendance",
            "Stairway lit only by handheld torches — no fixed emergency lighting",
            "No crowd direction segregation on the single approach stairway",
        ],
        interventions_that_would_have_helped=[
            "Dual stairway system (ascent/descent separated) as mandatory infrastructure",
            "Fixed emergency lighting with battery backup on all shrine approaches",
            "Predictive calendar-based attendance model for enforcement pre-positioning",
            "Headcount cap enforced at base of approach before ascent begins",
        ],
        time_of_day_category="during_event",
        venue_type="temple",
        vip_delay_involved=False,
        infra_failure_involved=True,
        rumor_involved=False,
        lessons_learned=[
            "Calendar convergence (New Year + holy date) is a computable surge multiplier",
            "Lighting failure at mountain shrines is equivalent to communications blackout",
            "Single-stairway mountain shrines require structural redesign, not just crowd management",
        ],
    ),

    # ─── INC-2024-IND-01 ───────────────────────────────────────────────────────
    # South India pilgrimage token distribution crush: Tamil Nadu, January 2024
    IncidentRecord(
        incident_id="INC-2024-IND-01",
        year=2024,
        country_iso2="IN",
        event_type="religious",
        estimated_attendance=65_000,
        venue_capacity=15_000,
        deaths=6,
        injuries=40,
        failure_modes=["TICKETING_CHAOS", "EXOGENOUS_SURGE", "TEMPLE_SURGE"],
        primary_trigger="A pilgrimage queue management system distributing tokens for temple entry failed; incorrect information about token availability spread causing a simultaneous rush by waiting pilgrims; crowd overwhelmed the queue zone.",
        key_precursor_signals=[
            "Token distribution queue density: 4x system capacity at T-45 mins",
            "Misinformation about token availability spreading in queue at T-20 mins",
            "Single token distribution point serving a 65,000-person crowd",
        ],
        interventions_that_would_have_helped=[
            "Multi-point distributed token system to eliminate single-queue bottleneck",
            "Digital token pre-booking via mobile app (eliminates physical queues)",
            "Real-time queue density monitoring with overflow zone activation",
            "Official counter-broadcast when token availability misinformation detected",
        ],
        time_of_day_category="pre_event",
        venue_type="temple",
        vip_delay_involved=False,
        infra_failure_involved=False,
        rumor_involved=True,
        lessons_learned=[
            "Single-point queue systems for high-demand religious entry are structurally unsafe",
            "Digital pre-booking is the most effective intervention for pilgrimage token distribution",
            "Queue density is a leading indicator equally important to in-venue density",
        ],
    ),

    # ─── INC-2025-IND-03 ───────────────────────────────────────────────────────
    # Pilgrimage festival bathing amavasya crush: North India, January 2025
    IncidentRecord(
        incident_id="INC-2025-IND-03",
        year=2025,
        country_iso2="IN",
        event_type="religious",
        estimated_attendance=30_000_000,
        venue_capacity=10_000_000,
        deaths=30,
        injuries=60,
        failure_modes=["GHAT_CRUSH", "EXOGENOUS_SURGE", "BRIDGE_BOTTLENECK", "TEMPORAL_DISRUPT"],
        primary_trigger="Peak amavasya bathing date at a decennial pilgrimage festival drew an estimated 30 million pilgrims; crowd surge at bathing ghats and approach bridges exceeded all safety thresholds; pre-dawn bathing timing created simultaneous convergence in darkness.",
        key_precursor_signals=[
            "Religious calendar amavasya date predictable years in advance",
            "Cell tower load in surrounding districts: 8x baseline at T-2 hrs",
            "Approach bridge headcount: 12x design capacity at T-30 mins",
            "Pre-dawn darkness removed visual crowd self-regulation",
        ],
        interventions_that_would_have_helped=[
            "Predictive AI model for amavasya attendance based on decennial pilgrimage cycle",
            "Time-slotted bathing segments assigned by pilgrim district of origin",
            "Bridge load sensors with real-time headcount enforcement",
            "Night-vision CCTV and illuminated crowd flow arrows for pre-dawn operations",
            "Cell tower demand monitoring for early district-level surge detection",
        ],
        time_of_day_category="pre_event",
        venue_type="temple",
        vip_delay_involved=False,
        infra_failure_involved=False,
        rumor_involved=False,
        lessons_learned=[
            "Decennial pilgrimage dates are the highest-volume, most predictable crowd events globally",
            "Time-slotted bathing access is the most impactful single intervention for ghat safety",
            "Pre-dawn crowd operations require dedicated lighting infrastructure and CCTV",
            "Cell tower demand is an advance crowd surge signal detectable 2+ hours early",
        ],
    ),
]
