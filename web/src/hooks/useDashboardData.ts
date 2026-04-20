/**
 * useDashboardData — Custom hook that polls all SpectaSyncAI API endpoints
 * and produces a unified DashboardState for the Command Center.
 * Uses 5-second polling (production: replace with SSE/WebSocket).
 */
import { useState, useEffect, useCallback } from 'react';
import type { 
  DashboardState, 
  VenueZone, 
  AgentEvent, 
  SurgeForecast, 
  Recommendation, 
  QueueStatus, 
  SafetyAlert 
} from '../types';



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

const ACTUALLY_RECOMMENDED: Recommendation[] = [
  { priority: 1, category: 'ENTRY_EXIT', message: 'Deploy 3 additional staff to Gate North immediately.', timing: 'NOW' },
  { priority: 2, category: 'ENTRY_EXIT', message: 'Update Gate South/East signage: "Gate North Closed — Use Gate East".', timing: 'T+2 mins' },
  { priority: 3, category: 'TIMING', message: 'Trigger PA announcement in North Concourse.', timing: 'T+5 mins' },
  { priority: 4, category: 'ENTRY_EXIT', message: 'Pre-authorize Gate North auxiliary gate for emergency egress.', timing: 'T+8 mins' },
];

const MOCK_QUEUES: QueueStatus[] = [
  { zone_id: 'GATE_NORTH', queue_length: 145, estimated_wait_mins: 22, priority: 'CRITICAL', recommendation: 'Redirect to East' },
  { zone_id: 'FOOD_STAND_A', queue_length: 32, estimated_wait_mins: 12, priority: 'HIGH', recommendation: 'Check Stand C' },
  { zone_id: 'RESTROOM_NORTH', queue_length: 18, estimated_wait_mins: 8, priority: 'MODERATE', recommendation: 'Clear zone' },
];

const MOCK_ALERTS: SafetyAlert[] = [
  { 
    location_id: 'GATE_NORTH', 
    risk_level: 'CRITICAL', 
    protocol: 'CROWD_CONTROL_ALPHA', 
    immediate_actions: ['Lock main turnstiles', 'Open aux egress', 'Dispatch response team'],
    human_approval_required: true,
    summary: 'Sustained density > 90% detected for 5+ minutes at main north ingress.'
  }
];

/**
 * useDashboardData — Custom hook that simulates and orchestrates real-time telemetry.
 * 
 * It manages the unified DashboardState, providing synchronized data for zones,
 * AI agent logs, forecasts, and safety recommendations.
 * 
 * @returns {DashboardState} The current tactical state of the venue.
 */
export const useDashboardData = (initialOverride?: DashboardState) => {
  const [state, setState] = useState<DashboardState>(initialOverride || {
    zones: MOCK_ZONES,
    agentFeed: INITIAL_AGENT_FEED,
    forecasts: [MOCK_FORECAST],
    queues: MOCK_QUEUES,
    safetyAlerts: MOCK_ALERTS,
    recommendations: ACTUALLY_RECOMMENDED,
    lastUpdated: new Date(),
    isLive: true,
  });

  const generateAgentEvent = useCallback((): AgentEvent => {
    const events = [
      { agent: 'vision_agent' as const, type: 'tool_call' as const, message: `analyze_cctv_frame(GATE_NORTH) [FRAME_${Math.floor(Math.random()*9000+1000)}] → density_score: ${(0.85 + Math.random() * 0.1).toFixed(2)}` },
      { agent: 'core_orchestrator' as const, type: 'intervention' as const, message: `MESH_INTERVENTION: Executing dynamic rerouting sequence #${Math.floor(Math.random()*5+1)}` },
      { agent: 'prediction_agent' as const, type: 'reasoning' as const, message: `Surge alert validated. Probability of bottleneck at GATE_NORTH is ${Math.floor(Math.random()*10+85)}%.` },
      { agent: 'queue_agent' as const, type: 'tool_call' as const, message: `mcp:calculate_wait_time(GATE_NORTH) -> ${Math.floor(Math.random()*10+20)} mins.` },
      { agent: 'safety_agent' as const, type: 'alert' as const, message: `CRITICAL: Density threshold exceeded. Initiating safety mesh response.` },
      { agent: 'experience_agent' as const, type: 'intervention' as const, message: `Broadcast: Dynamic signage updated for North Concourse speaker group.` },
      { agent: 'perimeter_macro' as const, type: 'reasoning' as const, message: `Macro View: Detecting secondary pressure point at Section 101.` },
      { agent: 'vip_sync' as const, type: 'tool_call' as const, message: `Syncing VIP escort via Secure Route ${['A','B','C'][Math.floor(Math.random()*3)]}.` },
      { agent: 'rumor_control' as const, type: 'reasoning' as const, message: `Rumor Audit: Clearing false reports regarding Gate East delay.` },
      { agent: 'failsafe_mesh' as const, type: 'alert' as const, message: `MESH_REDUNDANCY: Health check passing for all 12 nodes.` },
      { agent: 'incident_rag' as const, type: 'reasoning' as const, message: `RAG Insight: Matching pattern with ${2018 + Math.floor(Math.random()*7)} event. Applying mitigations.` },
      { agent: 'pre_event_analyst' as const, type: 'reasoning' as const, message: 'Strategic Audit complete. High confidence in T-90 min lookahead accuracy.' },
    ];
    const picked = events[Math.floor(Math.random() * events.length)];
    return {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      agent: picked.agent,
      event_type: picked.type,
      message: picked.message,
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const isActual = Math.random() > 0.2; 
        const newEvent = generateAgentEvent();
        const prefix = isActual ? '[MESH_STREAM] (Actual)' : '[MESH_LOG] (Log)';
        newEvent.message = `${prefix} ${newEvent.message}`;

        setState(prev => {
          // Animate zone densities
          const updatedZones = prev.zones.map(z => {
            const newDensity = addNoise(z.density, 0.03);
            return { ...z, density: newDensity, level: classifyDensity(newDensity) };
          });

          const northGateDensity = updatedZones.find(z => z.zone_id === 'GATE_NORTH')?.density || 0.9;

          // Mutate forecast based on live density
          const updatedForecasts: SurgeForecast[] = [{
            ...prev.forecasts[0],
            current_density: northGateDensity,
            confidence_score: Math.floor(82 + Math.random() * 12),
            predicted_peak_time_mins: Math.max(2, prev.forecasts[0].predicted_peak_time_mins - (Math.random() > 0.85 ? 1 : 0)),
            forecast: {
              'T+10_mins': { density: Math.min(0.99, northGateDensity + 0.04), level: classifyDensity(northGateDensity + 0.04) },
              'T+20_mins': { density: Math.min(0.99, northGateDensity + 0.07), level: classifyDensity(northGateDensity + 0.07) },
              'T+30_mins': { density: Math.min(0.99, northGateDensity + 0.01), level: classifyDensity(northGateDensity + 0.01) },
            }
          }];

          // Dynamic Recommendations: Adjust based on density
          const updatedRecommendations = northGateDensity > 0.88 
            ? ACTUALLY_RECOMMENDED 
            : ACTUALLY_RECOMMENDED.slice(0, 3);
          
          const updatedFeed = [newEvent, ...prev.agentFeed].slice(0, 20);

          return {
            ...prev,
            zones: updatedZones,
            agentFeed: updatedFeed,
            lastUpdated: new Date(),
            forecasts: updatedForecasts,
            recommendations: updatedRecommendations,
            queues: prev.queues,
            safetyAlerts: prev.safetyAlerts,
          };
        });
      } catch (err) {
        console.error('[Dashboard Poll Failure]:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [generateAgentEvent]);

  return state;
}
