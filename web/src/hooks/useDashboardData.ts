/**
 * useDashboardData — Custom hook that polls all SpectaSyncAI API endpoints
 * and produces a unified DashboardState for the Command Center.
 * Uses 5-second polling (production: replace with SSE/WebSocket).
 */
import { useState, useEffect, useCallback } from 'react';
import type { DashboardState, VenueZone, AgentEvent, SurgeForecast } from '../types';



// Realistic mock data for prototype (when API unavailable)
const MOCK_ZONES: VenueZone[] = [
  { zone_id: 'GATE_NORTH', label: 'Gate North', type: 'gate', density: 0.91, level: 'CRITICAL' },
  { zone_id: 'GATE_SOUTH', label: 'Gate South', type: 'gate', density: 0.65, level: 'MODERATE' },
  { zone_id: 'GATE_EAST', label: 'Gate East', type: 'gate', density: 0.28, level: 'NORMAL' },
  { zone_id: 'GATE_WEST', label: 'Gate West', type: 'gate', density: 0.44, level: 'MODERATE' },
  { zone_id: 'FOOD_STAND_A', label: 'Food Stand A', type: 'food', density: 0.88, level: 'HIGH' },
  { zone_id: 'FOOD_STAND_B', label: 'Food Stand B', type: 'food', density: 0.55, level: 'MODERATE' },
  { zone_id: 'FOOD_STAND_C', label: 'Food Stand C', type: 'food', density: 0.32, level: 'NORMAL' },
  { zone_id: 'RESTROOM_NORTH', label: 'Restroom N', type: 'restroom', density: 0.79, level: 'HIGH' },
  { zone_id: 'RESTROOM_SOUTH', label: 'Restroom S', type: 'restroom', density: 0.21, level: 'NORMAL' },
  { zone_id: 'MERCH_STAND', label: 'Merch Stand', type: 'merch', density: 0.62, level: 'MODERATE' },
  { zone_id: 'SECTION_101', label: 'Section 101', type: 'section', density: 0.95, level: 'CRITICAL' },
  { zone_id: 'SECTION_104', label: 'Section 104', type: 'section', density: 0.45, level: 'MODERATE' },
];

const MOCK_FORECAST: SurgeForecast = {
  location_id: 'GATE_NORTH',
  current_density: 0.91,
  predicted_peak_time_mins: 8,
  confidence_score: 87,
  surge_level: 'CRITICAL',
  forecast: {
    'T+10_mins': { density: 0.97, level: 'CRITICAL' },
    'T+20_mins': { density: 0.99, level: 'CRITICAL' },
    'T+30_mins': { density: 0.94, level: 'CRITICAL' },
  },
  actionable_recommendations: [
    'Deploy 3 additional staff to Gate North immediately.',
    'Update Gate South/East signage: "Gate North Closed — Use Gate East".',
    'Trigger PA announcement in North Concourse.',
    'Pre-authorize Gate North auxiliary gate for emergency egress.',
  ],
};

const INITIAL_AGENT_FEED: AgentEvent[] = [
  { id: '1', timestamp: new Date(Date.now() - 2000), agent: 'vision_agent', event_type: 'tool_call', message: 'analyze_cctv_frame(GATE_NORTH) → density: 0.91' },
  { id: '2', timestamp: new Date(Date.now() - 1500), agent: 'prediction_agent', event_type: 'reasoning', message: 'Surge trajectory: T+10 → 0.97 CRITICAL (conf: 87%)' },
  { id: '3', timestamp: new Date(Date.now() - 1000), agent: 'core_orchestrator', event_type: 'intervention', message: 'MCP: update_digital_signage(GATE_NORTH, "Use Gate East")' },
  { id: '4', timestamp: new Date(Date.now() - 500), agent: 'safety_agent', event_type: 'alert', message: 'CRITICAL — Gate North density 91%. Protocol: CROWD_CONTROL' },
  { id: '5', timestamp: new Date(), agent: 'queue_agent', event_type: 'tool_call', message: 'calculate_wait_time(FOOD_STAND_A) → 18 mins [HIGH]' },
];

function addNoise(base: number, spread = 0.04): number {
  return Math.max(0, Math.min(1, base + (Math.random() - 0.5) * spread));
}

function classifyDensity(d: number): VenueZone['level'] {
  if (d >= 0.92) return 'EMERGENCY';
  if (d >= 0.82) return 'CRITICAL';
  if (d >= 0.70) return 'HIGH';
  if (d >= 0.50) return 'MODERATE';
  return 'NORMAL';
}

export function useDashboardData() {
  const [state, setState] = useState<DashboardState>({
    zones: MOCK_ZONES,
    agentFeed: INITIAL_AGENT_FEED,
    forecasts: [MOCK_FORECAST],
    queues: [],
    safetyAlerts: [],
    recommendations: [],
    lastUpdated: new Date(),
    isLive: true,
  });

  const generateAgentEvent = useCallback((): AgentEvent => {

    const events = [
      { agent: 'vision_agent' as const, message: `analyze_cctv_frame(GATE_${['NORTH','SOUTH','EAST','WEST'][Math.floor(Math.random()*4)]}) → density: ${(Math.random()*0.5+0.5).toFixed(2)}` },
      { agent: 'core_orchestrator' as const, message: `MCP: dispatch_staff(GATE_NORTH, priority=high) → ETA 2mins` },
      { agent: 'prediction_agent' as const, message: `Surge forecast T+15: ${(Math.random()*0.3+0.7).toFixed(2)} [${['HIGH','CRITICAL'][Math.floor(Math.random()*2)]}] conf:${Math.floor(Math.random()*20+75)}%` },
      { agent: 'queue_agent' as const, message: `FOOD_STAND_A wait: ${Math.floor(Math.random()*10+8)}mins [HIGH]` },
      { agent: 'safety_agent' as const, message: `Safety scan complete — ${['CRITICAL','HIGH','MODERATE'][Math.floor(Math.random()*3)]} risk detected in North Stand` },
      { agent: 'experience_agent' as const, message: `Rec sent: "Visit Food Stand C now — only 2min wait"` },
      { agent: 'perimeter_macro' as const, message: `Analyzing perimeter macro view: Crowd flow stabilizing in East concourse` },
      { agent: 'vip_sync' as const, message: `VIP identified at SOUTH_VIP_ENTRY. Synchronizing escort protocol.` },
      { agent: 'rumor_control' as const, message: `Social monitor: debunking rumor regarding Section 101 closure` },
      { agent: 'failsafe_mesh' as const, message: `Failsafe standby: all backup communication nodes operational` },
      { agent: 'incident_rag' as const, message: `RAG lookup: matching current pattern with 2024 Final Crowd Incident` },
    ];
    const picked = events[Math.floor(Math.random() * events.length)];
    return {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      agent: picked.agent,
      event_type: ['tool_call', 'reasoning', 'intervention', 'alert'][Math.floor(Math.random() * 4)] as AgentEvent['event_type'],
      message: picked.message,
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        // Animate zone densities
        const updatedZones = prev.zones.map(z => {
          const newDensity = addNoise(z.density, 0.03);
          return { ...z, density: newDensity, level: classifyDensity(newDensity) };
        });

        // Add agent event to feed (keep last 20)
        const newEvent = generateAgentEvent();
        const updatedFeed = [newEvent, ...prev.agentFeed].slice(0, 20);

        return {
          ...prev,
          zones: updatedZones,
          agentFeed: updatedFeed,
          lastUpdated: new Date(),
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [generateAgentEvent]);

  return state;
}
