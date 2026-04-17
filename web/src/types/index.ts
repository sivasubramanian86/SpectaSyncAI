// Shared TypeScript interfaces for SpectaSyncAI Command Center

export type DensityLevel = 'NORMAL' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'EMERGENCY';
export type AgentName =
  | 'vision_agent'
  | 'core_orchestrator'
  | 'prediction_agent'
  | 'queue_agent'
  | 'safety_agent'
  | 'experience_agent'
  | 'perimeter_macro'
  | 'vip_sync'
  | 'rumor_control'
  | 'failsafe_mesh'
  | 'incident_rag'
  | 'pre_event_analyst';

export interface VenueZone {
  zone_id: string;
  density: number;
  level: DensityLevel;
  label: string;
  type: 'gate' | 'food' | 'restroom' | 'section' | 'merch';
}

export interface AgentEvent {
  id: string;
  timestamp: Date;
  agent: AgentName;
  event_type: 'tool_call' | 'reasoning' | 'intervention' | 'alert';
  message: string;
  metadata?: Record<string, unknown>;
}

export interface SurgeForecast {
  location_id: string;
  current_density: number;
  predicted_peak_time_mins: number;
  confidence_score: number;
  surge_level: DensityLevel;
  forecast: {
    'T+10_mins': { density: number; level: DensityLevel };
    'T+20_mins': { density: number; level: DensityLevel };
    'T+30_mins': { density: number; level: DensityLevel };
  };
  actionable_recommendations: string[];
}

export interface QueueStatus {
  zone_id: string;
  queue_length: number;
  estimated_wait_mins: number;
  priority: DensityLevel;
  recommendation: string;
}

export interface SafetyAlert {
  location_id: string;
  risk_level: DensityLevel;
  protocol: string;
  immediate_actions: string[];
  human_approval_required: boolean;
  summary?: string;
}

export interface Recommendation {
  priority: number;
  category: 'FOOD' | 'RESTROOM' | 'SEATING' | 'ENTRY_EXIT' | 'TIMING';
  message: string;
  timing: string;
}

export interface DashboardState {
  zones: VenueZone[];
  agentFeed: AgentEvent[];
  forecasts: SurgeForecast[];
  queues: QueueStatus[];
  safetyAlerts: SafetyAlert[];
  recommendations: Recommendation[];
  lastUpdated: Date;
  isLive: boolean;
}
