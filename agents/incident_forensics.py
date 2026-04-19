"""SpectaSyncAI: Incident Forensics - Failure Mode Analysis
Maps crowd crush failure modes to the 4 Tier-2 Crisis Prevention Agents.
All incident data is referenced via the INC-YYYY-ISO2-NN corpus identifier only.
See agents/incident_corpus.py for the full anonymized 12-incident global corpus.

Root Cause Taxonomy:
  A. EXOGENOUS_SURGE      External crowd volume exceeds venue absorption rate
  B. TEMPORAL_DISRUPT     VIP/headliner delay creates pent-up crowd kinetic energy
  C. INFO_CASCADE         Unverified announcement or rumor triggers simultaneous mass movement
  D. INFRA_FAILURE        Power/comms collapse disables all digital crowd coordination

Extended Failure Modes (corpus INC-2010-2023):
  E. EGRESS_FAILURE       Exits locked, blocked, or capacity-mismatched at peak
  F. NARROW_CORRIDOR      Physical geometry creates fatal bidirectional pressure
  G. PANIC_TRIGGER        External stimulus causes non-directional counter-surge
  H. BRIDGE_BOTTLENECK    Single elevated structure becomes sole egress choke point
  I. TICKETING_CHAOS      Late/contradictory entry information causes gate rush
  J. TEMPLE_SURGE         Ultra-high-density religious gathering exceeds containment

Preventive Agent Coverage:
  A → PerimeterMacroAgent    (cell tower + transit telemetry, pre-breach interception)
  B → VIPSyncAgent           (convoy GPS delay tracking, surge coefficient modeling)
  C → RumorControlAgent      (NLP keyword scan, 12-second multilingual counter-broadcast)
  D → FailsafeMeshAgent      (BLE 5.0 mesh, offline routing, glow-in-dark signage)
  ALL → IncidentRAGAgent     (semantic similarity search; corpus INC-2010-DEU-01 → INC-2025-IND-02)
"""
