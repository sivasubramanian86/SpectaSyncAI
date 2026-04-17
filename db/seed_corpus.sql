-- ============================================================
-- SpectaSyncAI: Incident Registry Seed
-- Seeds the 18-incident global corpus into AlloyDB incident_registry.
-- Run AFTER schema.sql and AFTER embeddings are generated:
--   python scripts/embed_corpus.py   (generates embeddings via Vertex AI)
--   psql $DATABASE_URL -f db/seed_corpus.sql
--
-- embedding column is populated by embed_corpus.py — NULL here is intentional.
-- ============================================================

INSERT INTO incident_registry
    (incident_id, year, country_iso2, event_type, venue_type, deaths, injuries,
     failure_modes, primary_trigger, description_text)
VALUES
    ('INC-2025-IND-01', 2025, 'IN', 'political_rally', 'outdoor_ground', 41, 100,
     ARRAY['TEMPORAL_DISRUPT','INFRA_FAILURE','EXOGENOUS_SURGE'],
     'Political leader convoy arrived ~7 hours late; simultaneous crowd surge toward stage; power cut eliminated all PA and LED guidance.',
     'Political rally at outdoor ground. Approved capacity 10,000. Estimated attendance 40,000. Convoy 7 hours late. Power cut at peak surge. 41 deaths, 100 injuries. Failure modes: TEMPORAL_DISRUPT, INFRA_FAILURE, EXOGENOUS_SURGE.'),

    ('INC-2025-IND-02', 2025, 'IN', 'sports', 'stadium', 11, 56,
     ARRAY['EXOGENOUS_SURGE','INFO_CASCADE','TICKETING_CHAOS'],
     'Last-minute complimentary entry announcement caused 250,000 fans to converge on a 40,000-capacity stadium.',
     'Sports victory celebration at stadium. Capacity 40,000. Attendance 250,000. Free entry announcement went viral. 11 deaths, 56 injuries. Failure modes: EXOGENOUS_SURGE, INFO_CASCADE, TICKETING_CHAOS.'),

    ('INC-2022-KOR-01', 2022, 'KR', 'civic', 'street', 159, 197,
     ARRAY['NARROW_CORRIDOR','EXOGENOUS_SURGE','TEMPORAL_DISRUPT'],
     'Organizer-less public gathering in a narrow sloped alleyway. Crowd density reached >9 persons/m².',
     'Civic gathering in narrow sloped street. 100,000 attendees, capacity 5,000. 159 deaths, 197 injuries. Failure modes: NARROW_CORRIDOR, EXOGENOUS_SURGE.'),

    ('INC-2022-IDN-01', 2022, 'ID', 'sports', 'stadium', 131, 583,
     ARRAY['PANIC_TRIGGER','EGRESS_FAILURE','EXOGENOUS_SURGE'],
     'Tear gas deployed inside stadium; spectators rushed locked exits simultaneously.',
     'Sports stadium post-match. 42,000 attendees. Tear gas triggered panic. Exits locked. 131 deaths, 583 injuries. Failure modes: PANIC_TRIGGER, EGRESS_FAILURE.'),

    ('INC-2021-USA-01', 2021, 'US', 'concert', 'outdoor_ground', 10, 300,
     ARRAY['EXOGENOUS_SURGE','TEMPORAL_DISRUPT','INFO_CASCADE'],
     'Crowd pressed toward stage; event continued 37 minutes after stage-front crush reached life-threatening density.',
     'Music concert outdoor. 50,000 attendees. Stage-front crush. Event not stopped. 10 deaths, 300 injuries. Failure modes: EXOGENOUS_SURGE, INFO_CASCADE.'),

    ('INC-2015-SAU-01', 2015, 'SA', 'religious', 'street', 2411, 934,
     ARRAY['EXOGENOUS_SURGE','NARROW_CORRIDOR','TEMPORAL_DISRUPT'],
     'Two massive converging pilgrimage crowds met at a narrow street junction; no real-time routing available.',
     'Annual religious pilgrimage. 2.5 million attendees. Dual crowd convergence at street junction. 2,411 deaths, 934 injuries. Failure modes: EXOGENOUS_SURGE, NARROW_CORRIDOR.'),

    ('INC-2013-IND-01', 2013, 'IN', 'religious', 'bridge', 115, 1500,
     ARRAY['TEMPLE_SURGE','INFO_CASCADE','BRIDGE_BOTTLENECK'],
     'False rumor of bridge collapse triggered panic; two opposing crowd waves collided at bridge junction.',
     'Religious pilgrimage bridge stampede. 3 million attendees. Rumor of bridge collapse. 115 deaths, 1500 injuries. Failure modes: TEMPLE_SURGE, INFO_CASCADE, BRIDGE_BOTTLENECK.'),

    ('INC-2010-DEU-01', 2010, 'DE', 'festival', 'corridor', 21, 510,
     ARRAY['NARROW_CORRIDOR','EGRESS_FAILURE','EXOGENOUS_SURGE'],
     'Single access tunnel served ingress and egress simultaneously; bidirectional flow in 60-meter tunnel created fatal pressure wave.',
     'Music festival tunnel crush. 1.4 million attendees. Single bidirectional tunnel. 21 deaths, 510 injuries. Failure modes: NARROW_CORRIDOR, EGRESS_FAILURE.'),

    ('INC-2010-KHM-01', 2010, 'KH', 'civic', 'bridge', 347, 755,
     ARRAY['BRIDGE_BOTTLENECK','PANIC_TRIGGER','INFRA_FAILURE'],
     'Crowded suspension bridge as sole egress; electrical failure triggered panic; oscillation caused mass crush.',
     'Civic festival bridge crush. 2 million attendees. Single suspension bridge sole egress. Lighting failure. 347 deaths, 755 injuries. Failure modes: BRIDGE_BOTTLENECK, PANIC_TRIGGER, INFRA_FAILURE.'),

    ('INC-2017-IND-01', 2017, 'IN', 'civic', 'corridor', 22, 30,
     ARRAY['INFRA_FAILURE','EXOGENOUS_SURGE','EGRESS_FAILURE'],
     'Railway station footbridge crush during storm-induced surge; slippery conditions, stairway bottleneck, emergency lighting failure.',
     'Railway station stampede. 3,000 crowd, 400 capacity. Storm surge. Emergency lighting failed. 22 deaths, 30 injuries. Failure modes: INFRA_FAILURE, EXOGENOUS_SURGE, EGRESS_FAILURE.'),

    ('INC-2019-AGO-01', 2019, 'AO', 'concert', 'stadium', 17, 120,
     ARRAY['EXOGENOUS_SURGE','EGRESS_FAILURE','TICKETING_CHAOS'],
     'Over-capacity concert with counterfeit ticketing; mass gate rush when operators could not distinguish valid tickets.',
     'Concert gate crush. 15,000 attendees, 8,000 capacity. Counterfeit tickets. Gate rush. 17 deaths, 120 injuries. Failure modes: EXOGENOUS_SURGE, EGRESS_FAILURE, TICKETING_CHAOS.'),

    ('INC-2023-MAR-01', 2023, 'MA', 'sports', 'stadium', 8, 60,
     ARRAY['EGRESS_FAILURE','TICKETING_CHAOS','PANIC_TRIGGER'],
     'Post-match exit rush; vehicle backfiring misinterpreted as gunshot triggered panic counter-surge.',
     'Football stadium post-match egress. 45,000 attendees. Backfire sound triggered panic. 8 deaths, 60 injuries. Failure modes: EGRESS_FAILURE, TICKETING_CHAOS, PANIC_TRIGGER.'),

    ('INC-2003-IND-01', 2003, 'IN', 'religious', 'temple', 39, 150,
     ARRAY['TEMPLE_SURGE','GHAT_CRUSH','EXOGENOUS_SURGE'],
     'Annual temple fair drew 5x expected attendance to narrow riverside ghats; bathing platforms collapsed under crowd weight.',
     'Temple festival ghat crush. 170,000 attendees, 30,000 capacity. Ghat platform collapse. 39 deaths, 150 injuries. Failure modes: TEMPLE_SURGE, GHAT_CRUSH, EXOGENOUS_SURGE.'),

    ('INC-2008-IND-01', 2008, 'IN', 'religious', 'temple', 162, 115,
     ARRAY['TEMPLE_SURGE','PANIC_TRIGGER','STAIRWAY_COLLAPSE','INFO_CASCADE'],
     'False rumor of landslide triggered bidirectional panic surge on narrow mountain shrine stairway.',
     'Mountain shrine stampede. 60,000 attendees, 8,000 capacity. Landslide rumor. Stairway bidirectional panic. 162 deaths, 115 injuries. Failure modes: TEMPLE_SURGE, PANIC_TRIGGER, STAIRWAY_COLLAPSE, INFO_CASCADE.'),

    ('INC-2013-IND-02', 2013, 'IN', 'religious', 'bridge', 36, 39,
     ARRAY['BRIDGE_BOTTLENECK','STAIRWAY_COLLAPSE','EXOGENOUS_SURGE'],
     'Pilgrims surging toward trains on railway footbridge after sacred bathing ritual; footbridge collapsed under overload.',
     'Kumbh Mela railway footbridge collapse. 20 million attendees, 5 million capacity. Amavasya peak. Footbridge collapse. 36 deaths, 39 injuries. Failure modes: BRIDGE_BOTTLENECK, STAIRWAY_COLLAPSE, EXOGENOUS_SURGE.'),

    ('INC-2022-IND-01', 2022, 'IN', 'religious', 'temple', 12, 13,
     ARRAY['NARROW_CORRIDOR','STAIRWAY_COLLAPSE','EGRESS_FAILURE'],
     'New Year + auspicious date convergence drew 3x expected pilgrims to mountain shrine; stairway became fatal choke point in darkness.',
     'Himalayan shrine New Year stampede. 10,000 attendees, 3,000 capacity. Darkness. Stairway crush. 12 deaths, 13 injuries. Failure modes: NARROW_CORRIDOR, STAIRWAY_COLLAPSE, EGRESS_FAILURE.'),

    ('INC-2024-IND-01', 2024, 'IN', 'religious', 'temple', 6, 40,
     ARRAY['TICKETING_CHAOS','EXOGENOUS_SURGE','TEMPLE_SURGE'],
     'Temple token distribution system failure; misinformation about availability caused simultaneous queue rush.',
     'South India temple token crush. 65,000 attendees, 15,000 capacity. Token misinformation. Queue rush. 6 deaths, 40 injuries. Failure modes: TICKETING_CHAOS, EXOGENOUS_SURGE, TEMPLE_SURGE.'),

    ('INC-2025-IND-03', 2025, 'IN', 'religious', 'temple', 30, 60,
     ARRAY['GHAT_CRUSH','EXOGENOUS_SURGE','BRIDGE_BOTTLENECK','TEMPORAL_DISRUPT'],
     'Peak amavasya bathing at decennial pilgrimage festival; 30M pilgrims; ghat and bridge surge in pre-dawn darkness.',
     'Kumbh Mela amavasya bathing crush. 30 million attendees, 10 million capacity. Pre-dawn. Ghat and bridge overload. 30 deaths, 60 injuries. Failure modes: GHAT_CRUSH, EXOGENOUS_SURGE, BRIDGE_BOTTLENECK, TEMPORAL_DISRUPT.')

ON CONFLICT (incident_id) DO UPDATE SET
    description_text = EXCLUDED.description_text,
    failure_modes    = EXCLUDED.failure_modes;
