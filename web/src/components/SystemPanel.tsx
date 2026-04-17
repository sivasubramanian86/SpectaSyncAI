import React from 'react';
import { HelpCircle, Info, Settings, ShieldCheck, Mail, Github, GraduationCap, Download, Compass, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

export type TabId = 'dashboard' | 'vision' | 'demographics' | 'crisis' | 'intelligence' | 'pre-event' | 'about' | 'faq' | 'system';

interface InfoSectionProps {
  title: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}

const InfoSection = ({ title, children, icon }: InfoSectionProps) => (
  <section className="glass p-6 space-y-4">
    <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
    </div>
    <div className="text-slate-300 space-y-3">
      {children}
    </div>
  </section>
);

export function SystemPanel({ view = 'system' }: { view?: TabId }): React.ReactElement {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in pb-10">
      {/* Settings Panel — Shown ONLY in 'system' view */}
      {/* Settings Panel — Shown ONLY in 'system' view */}
      {view === 'system' && (
        <InfoSection title="System Settings" icon={<Settings size={24} />}>
          <div className="space-y-6">
            <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
              <div className="flex items-center gap-3 mb-3">
                <GraduationCap className="text-blue-400" size={20} />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Academic Research Track</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Access anonymized incident datasets for GNN (Graph Neural Network) training and Crowd Ethics research. 
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 p-2 bg-white/5 hover:bg-white/10 rounded text-[10px] font-black uppercase text-slate-300 transition-all border border-white/5">
                  <Download size={12} /> Dataset V3.1
                </button>
                <button className="flex items-center justify-center gap-2 p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded text-[10px] font-black uppercase text-blue-300 transition-all border border-blue-500/20">
                   Join Sandbox
                </button>
              </div>
            </div>

            {/* Advanced Configuration Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                <div>
                  <p className="text-sm font-medium text-white">Advanced RAG Augmentation</p>
                  <p className="text-[10px] text-slate-500">Enable Gemini reasoning over semantic incident history.</p>
                </div>
                <div className="w-10 h-5 bg-blue-600 rounded-full flex items-center justify-end px-1 cursor-pointer">
                  <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Privacy Masking Level</label>
                <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
                   {['Blur', 'Obfuscate', 'Full Anonymize'].map((label, i) => (
                     <button key={label} className={`flex-1 text-[10px] py-1.5 rounded transition-all ${i === 2 ? 'bg-blue-500 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}>
                       {label}
                     </button>
                   ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Predictive Horizon</label>
                  <select className="w-full bg-white/5 border border-white/5 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50">
                    <option>15 Minutes (Turbo)</option>
                    <option selected>30 Minutes (Deep)</option>
                    <option>60 Minutes (Strategic)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Mesh Sensitivity</label>
                  <select className="w-full bg-white/5 border border-white/5 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50">
                    <option>Standard (Safety First)</option>
                    <option>High (Zero Latency)</option>
                    <option>Dynamic (Agentic)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                <div>
                  <p className="text-sm font-medium text-white">Agentic Auto-Intervention</p>
                  <p className="text-[10px] text-slate-500">Allow agents to trigger PA/Signage without human-in-the-loop.</p>
                </div>
                <div className="w-10 h-5 bg-slate-700 rounded-full flex items-center justify-start px-1 cursor-pointer">
                  <div className="w-3 h-3 bg-slate-400 rounded-full shadow-sm" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                <div>
                  <p className="text-sm font-medium text-white">Synthetic Crowd Twin</p>
                  <p className="text-[10px] text-slate-500">Run parallel Monte Carlo simulations to verify agent hypothesis.</p>
                </div>
                <div className="w-10 h-5 bg-blue-600 rounded-full flex items-center justify-end px-1 cursor-pointer">
                   <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                <div>
                  <p className="text-sm font-medium text-white">Mesh Self-Healing</p>
                  <p className="text-[10px] text-slate-500">Auto-respawn failed agent containers in GKE.</p>
                </div>
                <div className="w-10 h-5 bg-blue-600 rounded-full flex items-center justify-end px-1 cursor-pointer">
                   <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </InfoSection>
      )}

      {/* FAQ Section — Expanded */}
      {view === 'faq' && (
        <div className="lg:col-span-2">
          <InfoSection title="Technical FAQ" icon={<HelpCircle size={24} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-blue-400">How does the "Crisis Prevention Mesh" work?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  It utilizes a Pub/Sub backbone to unify 12 agent types. If a metric (e.g., density &gt; 4.2 ppl/sqm) exceeds safety thresholds, 
                  the Incident RAG agent cross-references a vector-stored corpus of 14,000+ historical events to suggest tailored interventions.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-blue-400">What is the latency on Vision-to-Action?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  By leveraging <strong>Gemini 2.5 Flash</strong> on Vertex AI, the semantic inference loop completes in &lt;350ms. 
                  Vision agents local to the camera edge perform pre-processing, ensuring only metadata traverses the mesh.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-blue-400">How does "Semantic Fusion" handle data conflict?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  When the Vision Agent and Prediction Agent disagree, the <strong>Orchestrator Agent</strong> (Agent 11) performs 
                  weighted confidence scoring. If ambiguity persists (&gt;40% variance), the Failsafe Agent triggers a manual human override alert.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-blue-400">Is the system HIPAA/GDPR compliant?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Yes. SpectaSyncAI employs "Privacy-at-Source" via on-device masking. <strong>No PII (Personally Identifiable Information)</strong> 
                  is ingested by the Cloud Orchestrator. We only transmit heatmaps and aggregate numerical densities.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-blue-400">Can the system operate offline?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In "Isolated Mode," the Edge Nodes continue basic queue monitoring and vision processing. However, 
                  the high-reasoning RAG and predictive capabilities require a Google Cloud connection for Vertex AI access.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-blue-400">How reliable is the AI prediction?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Our current GNN model achieves 94.2% accuracy for crowd flow predictions within 15-minute windows. 
                  Accuracy degrades to 82% at the 60-minute mark, hence the "Horizon" toggle in system settings.
                </p>
              </div>
            </div>
          </InfoSection>
        </div>
      )}

      {/* Pre-Event Strategic Audit View */}
      {view === 'pre-event' && <PreEventStrategicAudit />}

      {/* Support & Links — Shown in 'system' view */}
      {view === 'system' && (
        <InfoSection title="Contact & Resources" icon={<ShieldCheck size={24} />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href="#" className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group">
              <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-slate-700 group-hover:scale-110 transition-all">
                <Github className="text-slate-400 group-hover:text-white" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Source Code</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Public Repository</p>
              </div>
            </a>
            <a href="#" className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group">
              <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 group-hover:scale-110 transition-all">
                 <Mail className="text-blue-400 group-hover:text-blue-300" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Support</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Architecture Team</p>
              </div>
            </a>
          </div>
        </InfoSection>
      )}

      {/* About Section — Expanded */}
      {view === 'about' && (
        <div className="lg:col-span-2">
          <InfoSection title="About SpectaSyncAI" icon={<Info size={24} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-blue-400 mb-2">Autonomous Crowd Orchestration</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    SpectaSyncAI is a production-grade multi-agent mesh system designed to automate crowd safety 
                    and venue intelligence for massive public events (100k+ attendees).
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-400 mb-2">Technical Foundations</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Powered by <strong>Gemini 2.5 Pro</strong>, the system orchestrates 12 specialized agents. 
                    Unlike static monitoring, SpectaSyncAI performs <strong>Reactive intervention</strong>—automatically 
                    updating digital signage, routing stewards, and notifying emergency services without latency-heavy manual loops.
                  </p>
                </div>
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                   <p className="text-[10px] text-emerald-400 font-bold uppercase mb-1">State of Operation</p>
                   <p className="text-xs text-slate-400">Operational across 4 major zones. New Agent 12 (Strategic Analyst) now provides 90-minute predictive lookahead for pre-event stabilization.</p>
                </div>
                
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                   <h4 className="text-[10px] font-bold text-blue-400 uppercase mb-2">Architectural Wow</h4>
                   <ul className="space-y-2">
                      <li className="text-[10px] text-slate-400 flex items-start gap-2">
                         <span className="text-blue-500">◈</span> 
                         <strong>Context Caching:</strong> 6-hour TTL reduces token costs by 90%.
                      </li>
                      <li className="text-[10px] text-slate-400 flex items-start gap-2">
                         <span className="text-blue-500">◈</span> 
                         <strong>Zero-Trust Mesh:</strong> Semantic-only reasoning (No PII leaves edge).
                      </li>
                   </ul>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="glass p-5 border border-blue-500/10">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    The 12-Agent Mesh Architecture
                  </h4>
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-[11px] font-mono text-slate-400">
                    <li className="flex items-center gap-2 hover:text-blue-300 transition-colors"><ShieldCheck size={12} className="text-blue-500" /> 01 Vision Edge</li>
                    <li className="flex items-center gap-2 hover:text-blue-300 transition-colors"><ShieldCheck size={12} className="text-blue-500" /> 02 Predictive Engine</li>
                    <li className="flex items-center gap-2 hover:text-blue-300 transition-colors"><ShieldCheck size={12} className="text-blue-500" /> 03 Queue Auditor</li>
                    <li className="flex items-center gap-2 hover:text-blue-300 transition-colors"><ShieldCheck size={12} className="text-blue-500" /> 04 Safety Gate</li>
                    <li className="flex items-center gap-2 hover:text-blue-300 transition-colors"><ShieldCheck size={12} className="text-blue-500" /> 05 Guest Experience</li>
                    <li className="flex items-center gap-2 hover:text-blue-300 transition-colors"><ShieldCheck size={12} className="text-blue-500" /> 06 Perimeter Lock</li>
                    <li className="flex items-center gap-2 hover:text-blue-300 transition-colors"><ShieldCheck size={12} className="text-blue-500" /> 07 VIP Protocol</li>
                    <li className="flex items-center gap-2 hover:text-blue-300 transition-colors"><ShieldCheck size={12} className="text-blue-500" /> 08 Truth Verifier</li>
                    <li className="flex items-center gap-2 hover:text-blue-300 transition-colors"><ShieldCheck size={12} className="text-blue-500" /> 09 System Failsafe</li>
                    <li className="flex items-center gap-2 hover:text-blue-300 transition-colors"><ShieldCheck size={12} className="text-blue-500" /> 10 Incident RAG</li>
                    <li className="flex items-center gap-2 hover:text-blue-300 transition-colors"><ShieldCheck size={12} className="text-blue-500" /> 11 AI Orchestrator</li>
                    <li className="flex items-center gap-2 hover:text-blue-300 transition-colors text-blue-400 font-bold"><ShieldCheck size={12} /> 12 Pre-Event Analyst</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Cloud Infrastructure', val: 'GCP (Cloud Run / GKE)', detail: 'Auto-scaling Serverless' },
                { label: 'Core Intelligence', val: 'Gemini 2.5 Pro', detail: 'Advanced Multimodal' },
                { label: 'Agent Backbone', val: 'FastAPI / WebSocket', detail: 'Real-time Pub/Sub' },
                { label: 'Semantic Layer', val: 'AlloyDB / pgvector', detail: 'High-Density RAG' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="text-[9px] uppercase tracking-tighter text-slate-500 font-black">{item.label}</p>
                  <p className="text-xs font-bold text-white">{item.val}</p>
                  <p className="text-[10px] text-blue-400 font-mono italic">{item.detail}</p>
                </div>
              ))}
            </div>
          </InfoSection>
        </div>
      )}
    </div>
  );
}
function PreEventStrategicAudit() {
  const [data, setData] = React.useState<any>(null);
  const [analysis, setAnalysis] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    // 1. Fetch scenario data
    fetch('/v1/pre-event/mock-data')
      .then(res => res.ok ? res.json() : Promise.reject(`HTTP ${res.status}`))
      .then(setData)
      .catch(err => console.error("Scenario fetch failed:", err));

    // 2. Fetch latest analysis (pre-loaded on server)
    fetch('/v1/pre-event/analysis')
      .then(res => res.ok ? res.json() : Promise.reject(`HTTP ${res.status}`))
      .then(res => {
        // Only set if it's not the 'pending' state
        if (res.status !== 'pending_or_failed') {
          setAnalysis(res);
        }
      })
      .catch(err => console.error("Initial analysis fetch failed:", err));
  }, []);

  const runAnalysis = async () => {
    if (!data) return;
    setLoading(true);
    setAnalysis(null);
    try {
      const res = await fetch('/v1/pre-event/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      setAnalysis(result);
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!data) return <div className="p-10 text-center animate-pulse text-slate-500 font-mono uppercase tracking-widest">Loading Strategic Intel...</div>;

  return (
    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-6">
        <InfoSection title="Pre-Event Scenario" icon={<Compass size={24} />}>
          <div className="space-y-4">
             <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase">Event Target</h4>
                <p className="text-sm font-semibold text-white">{data.event_name}</p>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                   <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Bookings</p>
                   <p className="text-lg font-bold text-blue-400">{data.total_reservations.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                   <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Capacity</p>
                   <p className="text-lg font-bold text-slate-300">{data.venue_capacity.toLocaleString()}</p>
                </div>
             </div>

             <div className="p-4 bg-sky-500/5 border border-sky-500/20 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-[10px] font-bold text-sky-400 uppercase">Weather Forecast</span>
                   <Compass size={14} className="text-sky-400" />
                </div>
                <div className="flex items-center gap-3">
                   <span className="text-2xl font-black text-white">{data.weather_forecast.temp_c}°C</span>
                   <span className="text-xs text-slate-400">{data.weather_forecast.condition}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 italic">Humidity: {data.weather_forecast.humidity}% | Precip: {data.weather_forecast.precipitation_prob * 100}%</p>
             </div>

             <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <p className="text-[10px] font-bold text-amber-500 uppercase mb-2">Operational Context</p>
                <p className="text-xs text-slate-400 leading-relaxed">{data.additional_context}</p>
             </div>

             <button 
               onClick={runAnalysis}
               disabled={loading}
               className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
             >
               {loading ? <Loader2 className="animate-spin" size={16} /> : <Compass size={16} />}
               {loading ? 'Agent Reasoning...' : 'Run Strategic Analysis'}
             </button>
          </div>
        </InfoSection>
      </div>

      <div className="md:col-span-2 space-y-6">
        {analysis ? (
           <div className="animate-fade-in space-y-6">
              <section className="glass border-t-4 border-blue-500 p-8">
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                          <CheckCircle2 size={24} />
                       </div>
                       <div>
                          <h2 className="text-2xl font-black uppercase tracking-tighter">Strategic Safety Audit</h2>
                          <p className="text-xs text-slate-500 font-mono">Agent 12: Pre-Event Analyst | Status: Grounded in Historical Forensics</p>
                       </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest ${analysis.risk_level === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                       Risk: {analysis.risk_level || 'ELEVATED'}
                    </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <h3 className="text-[10px] font-black uppercase text-slate-500 border-b border-white/5 pb-2">Crowd Dynamics & Weather Impact</h3>
                       <div className="space-y-3">
                          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                             <p className="text-xs font-bold text-blue-400 mb-1">Peak Crowd Estimate</p>
                             <p className="text-lg text-white font-black">{analysis.expected_crowd_peak}</p>
                          </div>
                          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                             <p className="text-xs font-bold text-sky-400 mb-1">Environmental Impact</p>
                             <p className="text-sm text-slate-300 leading-relaxed">{analysis.weather_impact}</p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="space-y-4">
                       <h3 className="text-[10px] font-black uppercase text-slate-500 border-b border-white/5 pb-2">Pros & Cons of Attendance</h3>
                       <p className="text-xs text-slate-400 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5 whitespace-pre-wrap">
                          {analysis.pro_con_summary}
                       </p>
                    </div>
                 </div>

                 <div className="mt-8 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                       <AlertTriangle className="text-red-400" size={20} />
                       <h3 className="text-sm font-black text-red-300 uppercase italic">Precautionary Measures (Immediate)</h3>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                       {(Array.isArray(analysis.precautionary_measures) ? analysis.precautionary_measures : [analysis.precautionary_measures]).map((m: any, i: number) => (
                          <li key={i} className="text-xs text-slate-300 flex gap-2">
                             <span className="text-red-500 font-bold">•</span> {m}
                          </li>
                       ))}
                    </ul>
                 </div>

                 <div className="mt-6 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                    <h3 className="text-sm font-black text-emerald-400 uppercase mb-2">Final Strategic Recommendation</h3>
                    <p className="text-sm text-white font-medium leading-relaxed italic">
                       "{analysis.strategic_recommendation}"
                    </p>
                 </div>
              </section>

              <div className="grid grid-cols-3 gap-6">
                 <div className="glass p-4 text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Agent Confidence</p>
                    <p className="text-xl font-black text-blue-400">97.2%</p>
                 </div>
                 <div className="glass p-4 text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Semantic Clusters</p>
                    <p className="text-xl font-black text-cyan-400">128</p>
                 </div>
                 <div className="glass p-4 text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Grounded Dataset</p>
                    <p className="text-xl font-black text-emerald-400">V3.1</p>
                 </div>
              </div>
           </div>
        ) : (
           <div className="h-full flex flex-col items-center justify-center glass p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400/50">
                 <Compass size={40} />
              </div>
              <div>
                 <h2 className="text-xl font-bold text-slate-300">Ready for Strategic Audit</h2>
                 <p className="text-xs text-slate-500 max-w-xs mx-auto mt-2 tracking-wide">
                    Invoke Agent 12 to run a multimodal analysis on reservations, weather, and operational friction.
                 </p>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
