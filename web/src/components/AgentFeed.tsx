import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bot, Eye, Brain, ShieldAlert, Clock, Sparkles, 
  Cpu, Globe, Crown, Megaphone, Network, Search 
} from 'lucide-react';
import type { AgentEvent } from '../types/index';

interface AgentFeedProps {
  events: AgentEvent[];
}

// Using a standard object first, then casting to Record to satisfy TS
const META_DATA = {
  vision_agent: { icon: <Eye size={13} />, color: 'text-blue-400 bg-blue-500/15 border-blue-500/25', label: 'Vision' },
  core_orchestrator: { icon: <Brain size={13} />, color: 'text-purple-400 bg-purple-500/15 border-purple-500/25', label: 'Orchestrator' },
  prediction_agent: { icon: <Sparkles size={13} />, color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/25', label: 'Prediction' },
  queue_agent: { icon: <Clock size={13} />, color: 'text-amber-400 bg-amber-500/15 border-amber-500/25', label: 'Queue' },
  safety_agent: { icon: <ShieldAlert size={13} />, color: 'text-red-400 bg-red-500/15 border-red-500/25', label: 'Safety' },
  experience_agent: { icon: <Cpu size={13} />, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25', label: 'Experience' },
  perimeter_macro: { icon: <Globe size={13} />, color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/25', label: 'Perimeter' },
  vip_sync: { icon: <Crown size={13} />, color: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/25', label: 'VIP Sync' },
  rumor_control: { icon: <Megaphone size={13} />, color: 'text-orange-400 bg-orange-500/15 border-orange-500/25', label: 'Rumor' },
  failsafe_mesh: { icon: <Network size={13} />, color: 'text-pink-400 bg-pink-500/15 border-pink-500/25', label: 'Failsafe' },
  incident_rag: { icon: <Search size={13} />, color: 'text-lime-400 bg-lime-500/15 border-lime-500/25', label: 'RAG' },
};

const AGENT_META = META_DATA as Record<string, { icon: React.ReactNode; color: string; label: string }>;

const EVENT_TYPE_COLOR: Record<string, string> = {
  tool_call: 'text-slate-400',
  reasoning: 'text-blue-300',
  intervention: 'text-amber-300',
  alert: 'text-red-300',
};

/**
 * Renders the live agent activity feed on the dashboard.
 * Supports visual mapping of agent actions and severity tracking.
 *
 * @param {AgentFeedProps} props - Component properties containing the events feed array.
 * @returns {React.ReactElement} The rendered agent feed section.
 */
export function AgentFeed({ events }: AgentFeedProps) {
  const { t } = useTranslation();
  return (
    <section className="glass p-5 flex flex-col h-full overflow-hidden" aria-label="Live agent activity feed">
      <div className="flex items-center gap-2 mb-3">
        <Bot size={16} className="text-purple-400" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-slate-200">{t('headers.agents')}</h2>
        <div className="ml-auto flex items-center gap-2">
           <div className="flex gap-0.5 items-center">
             <div className="w-1 h-3 bg-blue-500/40 animate-pulse" />
             <div className="w-1 h-3 bg-blue-500/60 animate-pulse delay-75" />
             <div className="w-1 h-3 bg-blue-500/80 animate-pulse delay-150" />
           </div>
           <span className="text-[10px] text-blue-400 font-mono italic">Pub/Sub Streaming</span>
        </div>
      </div>

      <div className="space-y-2 overflow-y-auto pr-1 flex-1 scrollbar-thin" role="log" aria-live="polite">
        {events && events.map((event) => {
          const meta = AGENT_META[event.agent] || { 
            icon: <Bot size={13} />, 
            color: 'text-slate-400 border-slate-500/25', 
            label: 'System' 
          };
          
          const timeStr = event.timestamp instanceof Date
            ? event.timestamp.toLocaleTimeString()
            : new Date(String(event.timestamp)).toLocaleTimeString();

          return (
            <article key={event.id} className="flex items-start gap-2 p-2 rounded bg-white/5 border border-white/5 animate-fade-in">
              <span className={`w-5 h-5 flex-shrink-0 flex items-center justify-center rounded border ${meta.color} mt-0.5`}>
                {meta.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className={`text-[10px] font-bold uppercase tracking-tighter ${meta.color.split(' ')[0]}`}>{meta.label}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{timeStr}</span>
                </div>
                <p className={`text-xs font-mono break-all leading-relaxed ${EVENT_TYPE_COLOR[event.event_type] || 'text-slate-300'}`}>
                  {event.message}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
