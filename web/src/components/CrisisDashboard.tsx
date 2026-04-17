import React, { useState } from 'react';
import {
  Radio, Zap, AlertOctagon,
  CheckCircle2, Clock, MapPin, Wifi, Database
} from 'lucide-react';

/**
 * CrisisDashboard — Tier 2 Crisis Prevention Agent Control Panel
 * All incident references use the corpus INC-YYYY-ISO2-NN code system.
 * No individual names, venue brands, political entities, or celebrity references.
 */

interface AgentStatus {
  name: string;
  model: string;
  failure_mode: string;
  analogous_incidents: string[];
  status: 'MONITORING' | 'ALERT' | 'INTERVENING' | 'CLEAR';
  lastAction: string;
  icon: React.ReactNode;
  color: string;
}

const CRISIS_AGENTS: AgentStatus[] = [
  {
    name: 'Perimeter Macro Agent',
    model: 'Gemini 2.5 Pro',
    failure_mode: 'EXOGENOUS_SURGE',
    analogous_incidents: ['INC-2025-IND-02', 'INC-2022-KOR-01', 'INC-2010-DEU-01'],
    status: 'ALERT',
    lastAction: 'Cell tower load 4.2x baseline. Transit ridership 3.8x. Street diversion activated on approach corridors.',
    icon: <MapPin size={16} aria-hidden="true" />,
    color: 'blue',
  },
  {
    name: 'Logistics Mesh Agent',
    model: 'Gemini 2.5 Flash',
    failure_mode: 'NONE',
    analogous_incidents: [],
    status: 'CLEAR',
    lastAction: 'Inventory sync complete. No disruptions.',
    icon: <Database size={16} aria-hidden="true" />,
    color: 'blue',
  },
  {
    name: 'VIP Sync Agent',
    model: 'Gemini 2.5 Pro',
    failure_mode: 'TEMPORAL_DISRUPTION',
    analogous_incidents: ['INC-2025-IND-01', 'INC-2021-USA-01', 'INC-2015-SAU-01'],
    status: 'INTERVENING',
    lastAction: 'Convoy 74 mins late. Surge coeff: 5.8 — CRITICAL. ADDRESS_BY_MC program active. 18 staff pre-positioned at STAGE_FRONT_PIT.',
    icon: <Clock size={16} aria-hidden="true" />,
    color: 'amber',
  },
  {
    name: 'Rumor Control Agent',
    model: 'Gemini 2.5 Flash',
    failure_mode: 'INFO_CASCADE',
    analogous_incidents: ['INC-2025-IND-02', 'INC-2013-IND-01', 'INC-2021-USA-01'],
    status: 'ALERT',
    lastAction: 'UNAUTHORIZED_ENTRY keyword: 8,200 mentions/5min. Counter-broadcast sent EN/TA/KN/HI. Response: 1.6 seconds.',
    icon: <Radio size={16} aria-hidden="true" />,
    color: 'red',
  },
  {
    name: 'Failsafe Mesh Agent',
    model: 'Gemini 2.5 Pro',
    failure_mode: 'INFRA_FAILURE',
    analogous_incidents: ['INC-2025-IND-01', 'INC-2017-IND-01', 'INC-2010-KHM-01'],
    status: 'INTERVENING',
    lastAction: 'MAIN_POWER failure detected. BLE mesh ACTIVE (72hr battery). Offline routing dispatched. Generator ETA: 4 mins.',
    icon: <Wifi size={16} aria-hidden="true" />,
    color: 'purple',
  },
];

const STATUS_STYLES: Record<AgentStatus['status'], string> = {
  MONITORING: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  CLEAR: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  ALERT: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  INTERVENING: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-500/15 border-blue-500/25 text-blue-400',
  amber: 'bg-amber-500/15 border-amber-500/25 text-amber-400',
  red: 'bg-red-500/15 border-red-500/25 text-red-400',
  purple: 'bg-purple-500/15 border-purple-500/25 text-purple-400',
};

const FAILURE_MODE_COLORS: Record<string, string> = {
  EXOGENOUS_SURGE: 'text-blue-400',
  TEMPORAL_DISRUPTION: 'text-amber-400',
  INFO_CASCADE: 'text-red-400',
  INFRA_FAILURE: 'text-purple-400',
};

/** Global incident summary — derived from agents/incident_corpus.py */
const CORPUS_SUMMARY = {
  incidents: 12,
  deaths: 3298,
  countries: 9,
  span: '2010–2025',
};

export function CrisisDashboard(): React.ReactElement {
  const [expanded, setExpanded] = useState<string | null>(null);
  const alertCount = CRISIS_AGENTS.filter(
    a => a.status === 'ALERT' || a.status === 'INTERVENING'
  ).length;

  return (
    <section className="glass p-5" aria-label="Crisis prevention agent dashboard">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <AlertOctagon size={16} className="text-red-400" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-slate-200">Crisis Prevention Mesh</h2>
          <span className="badge badge-critical">{alertCount} ACTIVE</span>
        </div>
        {/* Corpus stats — no specific venue/person names */}
        <div className="flex items-center gap-2 text-right">
          <Database size={12} className="text-slate-500" aria-hidden="true" />
          <div className="text-xs text-slate-500 text-right">
            <span className="text-slate-400 font-medium">{CORPUS_SUMMARY.incidents}</span> incidents analyzed
            {' · '}<span className="text-red-400 font-medium">{CORPUS_SUMMARY.deaths.toLocaleString()}</span> deaths
            {' · '}<span className="text-slate-400">{CORPUS_SUMMARY.countries}</span> countries
            {' · '}<span className="text-slate-400">{CORPUS_SUMMARY.span}</span>
          </div>
        </div>
      </div>

      {/* RAG context banner */}
      <div
        className="mb-4 p-3 rounded-xl bg-blue-500/6 border border-blue-500/15"
        role="note"
        aria-label="RAG corpus reference"
      >
        <p className="text-xs text-blue-300 leading-relaxed">
          <span className="font-bold">Incident RAG Active:</span> Each agent is grounded in
          semantic similarity search across {CORPUS_SUMMARY.incidents} anonymized incidents.
          Interventions are ranked by historical evidence frequency across the corpus.
          All incident identifiers follow ISO format: <code className="font-mono text-blue-200">INC-YYYY-ISO2-NN</code>.
        </p>
      </div>

      {/* Agent cards */}
      <div className="space-y-3" role="list" aria-label="Crisis prevention agents">
        {CRISIS_AGENTS.map(agent => (
          <article
            key={agent.name}
            className={`rounded-xl border p-3 transition-all duration-300 cursor-pointer ${
              agent.status === 'INTERVENING'
                ? 'border-red-500/40 bg-red-500/5'
                : agent.status === 'ALERT'
                ? 'border-amber-500/30 bg-amber-500/5'
                : 'border-white/10 bg-white/2'
            }`}
            onClick={() => setExpanded(expanded === agent.name ? null : agent.name)}
            role="listitem"
            aria-expanded={expanded === agent.name}
            aria-label={`${agent.name}: ${agent.status}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                {/* Icon */}
                <div
                  className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg border ${COLOR_MAP[agent.color]}`}
                >
                  {agent.icon}
                </div>

                {/* Info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-slate-100">{agent.name}</h3>
                    <span className={`badge border ${STATUS_STYLES[agent.status]}`}>
                      {agent.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[10px] text-slate-500 font-mono">{agent.model}</span>
                    <span className="text-[10px] text-slate-600">→</span>
                    <span className={`text-[10px] font-bold tracking-wider ${FAILURE_MODE_COLORS[agent.failure_mode] ?? 'text-slate-400'}`}>
                      {agent.failure_mode}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded detail */}
            {expanded === agent.name && (
              <div className="mt-3 pt-3 border-t border-white/10 animate-fade-in space-y-2">
                {/* Last action */}
                <div className="p-2 rounded-lg bg-black/30 border border-white/10">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                    Last Intervention:
                  </p>
                  <p className="text-xs font-mono text-emerald-300 leading-relaxed">
                    {agent.lastAction}
                  </p>
                </div>

                {/* Analogous incidents from RAG corpus */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">
                    Analogous Incidents (RAG corpus):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.analogous_incidents.map(inc => (
                      <span
                        key={inc}
                        className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300"
                      >
                        {inc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-2">
                  <button
                    className="btn-primary text-xs flex items-center gap-1"
                    aria-label={`Run ${agent.name} now`}
                  >
                    <Zap size={11} aria-hidden="true" /> Run Agent
                  </button>
                  <button
                    className="btn-ghost text-xs flex items-center gap-1"
                    aria-label={`View ${agent.name} logs`}
                  >
                    <CheckCircle2 size={11} aria-hidden="true" /> RA Audit Log
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      <p className="mt-3 text-[10px] text-slate-600 text-right">
        All interventions logged to AlloyDB audit trail · Responsible AI review within 12 seconds
      </p>
    </section>
  );
}
