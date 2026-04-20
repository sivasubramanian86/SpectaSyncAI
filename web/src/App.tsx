/**
 * @file App.tsx
 * @description Main application entry point for SpectaSyncAI Command Center.
 * Coordinates global state, routing (tabs), and real-time mesh telemetry.
 */
import React, { useState } from 'react';
import { useDashboardData } from './hooks/useDashboardData';
import { useTranslation } from 'react-i18next';
import { Header } from './components/Header';
import type { TabId } from './components/Header';
import { StatCards } from './components/StatCards';
import { VenueHeatmap } from './components/VenueHeatmap';
import { VenueMap } from './components/VenueMap';
import { AgentFeed } from './components/AgentFeed';

import { PredictionPanel } from './components/PredictionPanel';
import { QueueBoard } from './components/QueueBoard';
import { CrisisDashboard } from './components/CrisisDashboard';
import { SystemPanel } from './components/SystemPanel';
import { 
  MeshPerformanceRadar, 
  ZoneOccupancyBars, 
  RiskVelocityArea, 
  SentimentPie 
} from './components/AnalyticsWidgets';
import { MultiModalHub } from './components/MultiModalHub';
import { DemographicInsights } from './components/DemographicInsights';
import { Bot } from 'lucide-react';
import './index.css';

export default function App(): React.ReactElement {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const dashState = useDashboardData();
  const [, setLanguage] = useState(i18n.language.toUpperCase());

  const criticalZones = dashState.zones.filter(z => z.level === 'CRITICAL' || z.level === 'EMERGENCY');
  const avgDensity = dashState.zones.reduce((s, z) => s + z.density, 0) / dashState.zones.length;
  const activeInterventions = dashState.agentFeed.filter(e => e.event_type === 'intervention').length;


  return (
    <div className="h-screen font-sans bg-navy-950 text-slate-100 flex flex-col overflow-hidden">
      {/* Critical alert banner */}
      {criticalZones.length > 0 && (
        <div
          role="alert"
          className="animate-fade-in bg-red-500/10 border-b border-red-500/30 px-6 py-2 flex items-center gap-3 relative z-50 flex-shrink-0"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <p className="text-red-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            {t('alerts.critical')}: {criticalZones.map(z => z.label).join(', ')} — {t('alerts.failsafe')}.
          </p>
        </div>
      )}

      <Header 
        lastUpdated={dashState.lastUpdated} 
        isLive={dashState.isLive} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLanguageChange={setLanguage}
      />

      {/* Main Content Area - Scrollable */}
      <div className="flex-grow overflow-y-auto scrollbar-thin">
        <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 py-4 space-y-6">
          <main className="mt-2">
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-fade-in flex flex-col h-full">
                <StatCards
                  avgDensity={avgDensity}
                  criticalCount={criticalZones.length}
                  totalZones={dashState.zones.length}
                  activeInterventions={activeInterventions}
                  agentCount={12}
                />
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                   <div className="xl:col-span-2 space-y-6">
                     <PredictionPanel forecast={dashState.forecasts[0]} />
                     <AgentFeed events={dashState.agentFeed} />
                   </div>
                   <div className="space-y-6">
                      <div className="glass p-5">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{t('headers.performance')}</h3>
                        <MeshPerformanceRadar />
                      </div>
                      <QueueBoard zones={dashState.zones} />
                   </div>
                   <div className="space-y-6">
                      <div className="glass p-5">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{t('headers.sentiment')}</h3>
                        <SentimentPie />
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-[10px] uppercase"><span className="text-slate-500">Stability Index</span><span className="text-emerald-400">92%</span></div>
                          <div className="flex justify-between text-[10px] uppercase"><span className="text-slate-500">Cohesion Rate</span><span className="text-blue-400">High</span></div>
                        </div>
                     </div>
                      <div className="glass p-5">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{t('headers.health')}</h3>
                        <div className="space-y-4">
                         <div className="flex justify-between text-xs"><span className="text-slate-500 text-[10px] uppercase">API Latency</span><span className="text-emerald-400">12ms</span></div>
                         <div className="flex justify-between text-xs"><span className="text-slate-500 text-[10px] uppercase">RAG Memory</span><span className="text-blue-400">4.2GB</span></div>
                         <div className="flex justify-between text-xs"><span className="text-slate-500 text-[10px] uppercase">ADK Uptime</span><span className="text-emerald-400">99.9%</span></div>
                       </div>
                     </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'vision' && (
              <div className="space-y-6 animate-fade-in">
                <MultiModalHub />
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3 space-y-6">
                    <VenueMap className="rounded-2xl border border-white/5 shadow-2xl" />
                    <VenueHeatmap zones={dashState.zones} />
                    <div className="grid grid-cols-2 gap-6">

                      <div className="glass p-5">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Spatial Occupancy Trends</h3>
                        <ZoneOccupancyBars />
                      </div>
                      <div className="glass p-5 flex flex-col justify-center items-center">
                        <div className="text-center">
                          <p className="text-4xl font-black text-blue-500">98.4<span className="text-xl">%</span></p>
                          <p className="text-xs text-slate-400 uppercase tracking-widest mt-2">Vision Confidence</p>
                        </div>
                        <div className="w-full mt-8 grid grid-cols-2 gap-4">
                           <div className="p-3 bg-white/5 border border-white/5 rounded">
                              <p className="text-[10px] text-slate-500 uppercase">Objects/Sec</p>
                              <p className="text-lg font-bold">1.2k</p>
                           </div>
                           <div className="p-3 bg-white/5 border border-white/5 rounded">
                              <p className="text-[10px] text-slate-500 uppercase">Detection Lag</p>
                              <p className="text-lg font-bold text-emerald-400">4ms</p>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <QueueBoard zones={dashState.zones} />
                    <div className="glass p-5">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Flow Velocity</h3>
                      <div className="space-y-4">
                        {[
                          { l: 'Gate A', v: '2.4 m/s', d: 'IN' },
                          { l: 'Section 102', v: '0.8 m/s', d: 'SLOW' },
                          { l: 'Main Exit', v: '1.2 m/s', d: 'OFF' },
                        ].map(f => (
                          <div key={f.l} className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-300 font-bold uppercase">{f.l}</span>
                            <span className={`text-[10px] font-mono ${f.d === 'SLOW' ? 'text-amber-400' : 'text-emerald-400'}`}>{f.v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'demographics' && (
              <DemographicInsights />
            )}

            {activeTab === 'crisis' && (
               <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in">
                  <div className="lg:col-span-3">
                     <CrisisDashboard />
                  </div>
                  <div className="space-y-6">
                     <div className="glass p-5">
                        <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-4">Kinetic Risk Velocity</h3>
                        <RiskVelocityArea />
                        <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">Calculating real-time physics models for crowd compression levels.</p>
                     </div>
                     <div className="glass p-5">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Tier-2 Mesh Health</h3>
                        <div className="space-y-3">
                           <div className="flex justify-between items-center"><span className="text-xs">VIP-Sync Status</span><span className="w-2 h-2 rounded-full bg-emerald-500" /></div>
                           <div className="flex justify-between items-center"><span className="text-xs">Perimeter Integrity</span><span className="w-2 h-2 rounded-full bg-emerald-500" /></div>
                           <div className="flex justify-between items-center"><span className="text-xs">Rumor Suppression</span><span className="w-2 h-2 rounded-full bg-amber-500" /></div>
                           <div className="flex justify-between items-center"><span className="text-xs">Infra Watchdog</span><span className="w-2 h-2 rounded-full bg-emerald-500" /></div>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'intelligence' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in">
                <div className="lg:col-span-3 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                     <div className="glass p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Bot size={16} className="text-purple-400" aria-hidden="true" />
                          <h2 className="text-sm font-semibold text-slate-200">Agent Mesh Activity</h2>
                          <div className="ml-auto flex items-center gap-2">
                             <div className="flex gap-0.5 items-center">
                               <div className="w-1 h-3 bg-blue-500/40 animate-pulse" />
                               <div className="w-1 h-3 bg-blue-500/60 animate-pulse delay-75" />
                               <div className="w-1 h-3 bg-blue-500/80 animate-pulse delay-150" />
                             </div>
                             <span className="text-[10px] text-blue-400 font-mono italic">Pub/Sub Streaming</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mb-6">Semantic clusters across historical incident databases.</p>
                        <div className="h-64 flex items-end gap-1 px-2 border-b border-white/10">
                          {[65, 40, 85, 30, 90, 45, 70, 55, 80, 40, 95, 60].map((h, i) => (
                            <div key={i} className="flex-1 bg-blue-500/20 border-t-2 border-blue-400/50 rounded-t hover:bg-blue-500/40 transition-all cursor-pointer" style={{ height: `${h}%` }} />
                          ))}
                        </div>
                     </div>
                     <div className="glass p-6">
                        <h3 className="text-lg font-semibold mb-2">AI Extraction Flow</h3>
                        <div className="space-y-4 mt-6">
                           {[
                             { s: 'Retrieving context from AlloyDB', t: '2ms' },
                             { s: 'Running Semantic Overlap', t: '5ms' },
                             { s: 'Generating Response (Gemini 2.5 Pro)', t: '240ms' },
                             { s: 'Mesh Verification', t: '1ms' },
                           ].map((s, i) => (
                              <div key={i} className="flex justify-between text-xs border-l-2 border-blue-500/30 pl-3 py-1">
                                 <span className="text-slate-300">{s.s}</span>
                                 <span className="text-blue-400 font-mono">{s.t}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
                  <PredictionPanel forecast={dashState.forecasts[0]} />
                </div>
                <div className="space-y-6">
                  <AgentFeed events={dashState.agentFeed} />
                </div>
              </div>
            )}

            {activeTab === 'pre-event' && (
              <div className="max-w-6xl mx-auto animate-fade-in">
                <SystemPanel view="pre-event" />
              </div>
            )}

            {activeTab === 'about' && (
               <div className="max-w-4xl mx-auto"><SystemPanel view="about" /></div>
            )}

            {activeTab === 'faq' && (
               <div className="max-w-4xl mx-auto"><SystemPanel view="faq" /></div>
            )}

            {activeTab === 'system' && (
               <div className="max-w-4xl mx-auto"><SystemPanel view="system" /></div>
            )}
          </main>
        </div>
      </div>

      <footer className="py-4 border-t border-white/5 px-6 flex-shrink-0">
        <div className="max-w-[1800px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-slate-600 font-bold">
          <p>© 2026 SpectaSyncAI — Advanced Agentic Safety Mesh</p>
          <div className="flex gap-6">
            <span className="text-emerald-500/80">SOC2 Compliant</span>
            <span className="text-blue-500/80">Google Cloud Runner</span>
            <span className="text-indigo-500/80">Vertex AI Enabled</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
