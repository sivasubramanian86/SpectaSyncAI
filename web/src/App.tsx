import React, { useState } from 'react';
import { useDashboardData } from './hooks/useDashboardData';
import { Header, TabId } from './components/Header';
import { StatCards } from './components/StatCards';
import { VenueHeatmap } from './components/VenueHeatmap';
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
import './index.css';

/**
 * SpectaSyncAI Command Center — v3.2.0 (High Density)
 */
export default function App(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const dashState = useDashboardData();

  const criticalZones = dashState.zones.filter(z => z.level === 'CRITICAL' || z.level === 'EMERGENCY');
  const avgDensity = dashState.zones.reduce((s, z) => s + z.density, 0) / dashState.zones.length;
  const activeInterventions = dashState.agentFeed.filter(e => e.event_type === 'intervention').length;

  return (
    <div className="min-h-screen font-sans bg-navy-950 text-slate-100 flex flex-col">
      {/* Critical alert banner */}
      {criticalZones.length > 0 && (
        <div
          role="alert"
          className="animate-fade-in bg-red-500/10 border-b border-red-500/30 px-6 py-2 flex items-center gap-3 relative z-50"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <p className="text-red-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            CRITICAL Breach: {criticalZones.map(z => z.label).join(', ')} — Agent mesh activating Tier-2 failsafes.
          </p>
        </div>
      )}

      <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 py-4 space-y-6 flex-grow">
        <Header 
          lastUpdated={dashState.lastUpdated} 
          isLive={dashState.isLive} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        {/* Dynamic View Switcher */}
        <main className="mt-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <StatCards
                avgDensity={avgDensity}
                criticalCount={criticalZones.length}
                totalZones={dashState.zones.length}
                activeInterventions={activeInterventions}
                agentCount={11}
              />
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                 <div className="xl:col-span-2 space-y-6">
                   <PredictionPanel forecast={dashState.forecasts[0]} />
                   <AgentFeed events={dashState.agentFeed} />
                 </div>
                 <div className="space-y-6">
                    <div className="glass p-5">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Mesh Sync Performance</h3>
                      <MeshPerformanceRadar />
                    </div>
                    <QueueBoard zones={dashState.zones} />
                 </div>
                 <div className="space-y-6">
                   <div className="glass p-5">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Crowd Sentiment</h3>
                      <SentimentPie />
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-[10px] uppercase"><span className="text-slate-500">Stability Index</span><span className="text-emerald-400">92%</span></div>
                        <div className="flex justify-between text-[10px] uppercase"><span className="text-slate-500">Cohesion Rate</span><span className="text-blue-400">High</span></div>
                      </div>
                   </div>
                   <div className="glass p-5 space-y-3 font-mono">
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Health</h3>
                     <div className="space-y-2">
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
                         <div key={f.l} className="flex justify-between items-center p-2 bg-white/5 rounded border border-white/5">
                            <span className="text-xs font-semibold">{f.l}</span>
                            <span className={`text-[10px] font-mono p-1 rounded ${f.d === 'SLOW' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-400'}`}>{f.v}</span>
                         </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                      <h3 className="text-lg font-semibold mb-2">Search Corpus Map</h3>
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
                           { s: 'Generating Response (Gemini 2.0)', t: '240ms' },
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

          {activeTab === 'system' && (
            <SystemPanel />
          )}
        </main>
      </div>

      <footer className="mt-auto py-6 border-t border-white/5 px-6">
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
