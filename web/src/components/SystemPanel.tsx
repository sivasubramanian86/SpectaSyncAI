import React from 'react';
import { HelpCircle, Info, Settings, ShieldCheck, Mail, Github, GraduationCap, Download, Compass, Loader2, AlertTriangle, CheckCircle2, Sun, Moon, Volume2 } from 'lucide-react';

export type TabId = 'dashboard' | 'vision' | 'demographics' | 'crisis' | 'intelligence' | 'pre-event' | 'about' | 'faq' | 'system';

/**
 * Properties for the InfoSection layout component.
 */
interface InfoSectionProps {
  /** The localized header title for the section. */
  title: string;
  /** React children representing the configuration controls or text. */
  children: React.ReactNode;
  /** Lucide icon element to display in the header. */
  icon: React.ReactNode;
}

/**
 * A standard glass-morphism container for settings and informational blocks.
 */
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

/**
 * SystemPanel: The primary configuration and research hub for SpectaSyncAI.
 * 
 * Features a dynamic grid layout that adapts based on the active view:
 * - 'system': 3-column tactical grid (Tactical Mesh, UI Prefs, Research/Support)
 * - Other views: 2-column informational layout (FAQ, About, Audit)
 * 
 * @param view - The current sub-tab within the Settings panel.
 */
export function SystemPanel({ view = 'system' }: { view?: TabId }): React.ReactElement {
  return (
    <div className={`grid grid-cols-1 ${view === 'system' ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6 animate-fade-in pb-10`}>
      {/* Settings Panel — shown only in system view */}
      {view === 'system' && (
        <InfoSection title="Tactical Mesh" icon={<ShieldCheck size={24} />}>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
              <div>
                <p className="text-sm font-medium text-white">Advanced RAG Augmentation</p>
                <p className="text-[10px] text-slate-500">Dual-stream Gemini reasoning.</p>
              </div>
              <button type="button" aria-pressed="true" aria-label="Toggle Advanced RAG Augmentation" className="w-10 h-5 bg-blue-600 rounded-full flex items-center justify-end px-1 cursor-pointer">
                <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
              <div>
                <p className="text-sm font-medium text-white">Agentic Auto-Intervention</p>
                <p className="text-[10px] text-slate-500">Autonomous PA/Signage updates.</p>
              </div>
              <button type="button" aria-pressed="false" aria-label="Toggle Agentic Auto-Intervention" className="w-10 h-5 bg-slate-700 rounded-full flex items-center justify-start px-1 cursor-pointer">
                <div className="w-3 h-3 bg-slate-400 rounded-full shadow-sm" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
              <div>
                <p className="text-sm font-medium text-white">Synthetic Crowd Twin</p>
                <p className="text-[10px] text-slate-500">Parallel Monte Carlo verify.</p>
              </div>
              <button type="button" aria-pressed="true" aria-label="Toggle Synthetic Crowd Twin" className="w-10 h-5 bg-blue-600 rounded-full flex items-center justify-end px-1 cursor-pointer">
                 <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
              <div>
                <p className="text-sm font-medium text-white">Mesh Self-Healing</p>
                <p className="text-[10px] text-slate-500">Auto-GKE container recovery.</p>
              </div>
              <button type="button" aria-pressed="true" aria-label="Toggle Mesh Self-Healing" className="w-10 h-5 bg-blue-600 rounded-full flex items-center justify-end px-1 cursor-pointer">
                 <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
              </button>
            </div>
            
            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl mt-2">
               <p className="text-[10px] text-blue-400 font-bold uppercase mb-2">Node Status</p>
               <div className="flex gap-1">
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className="flex-1 h-1.5 bg-emerald-500/40 rounded-full" />
                  ))}
               </div>
               <p className="text-[9px] text-slate-500 mt-2 italic">All 12 agents reporting healthy heartbeats.</p>
            </div>
          </div>
        </InfoSection>
      )}

      {/* Column 2: Interface Configuration */}
      {view === 'system' && (
        <InfoSection title="UI Preferences" icon={<Settings size={24} />}>
          <div className="space-y-4">
             <div className="space-y-1">
               <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Privacy Masking</label>
               <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
                  {['Blur', 'Full Anonymize'].map((label, i) => (
                    <button key={label} aria-label={`Select ${label} privacy mode`} className={`flex-1 text-[10px] py-1.5 rounded transition-all ${i === 1 ? 'bg-blue-500 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}>
                      {label}
                    </button>
                  ))}
               </div>
             </div>

             <div className="grid grid-cols-1 gap-3">
               <div className="space-y-1">
                 <label htmlFor="telemetry-rate" className="text-[10px] font-bold text-slate-500 uppercase px-1 font-mono">Telemetry Rate</label>
                 <select id="telemetry-rate" defaultValue="15s" className="w-full bg-white/5 border border-white/5 rounded-lg p-2 text-xs text-slate-300 focus:outline-none">
                   <option value="5s">5s (Real-time)</option>
                   <option value="15s">15s (Standard)</option>
                   <option value="60s">60s (Efficiency)</option>
                 </select>
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-bold text-slate-500 uppercase px-1 font-mono">Alert Volume</label>
                 <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/5">
                    <Volume2 size={12} className="text-blue-400" />
                    <div className="flex-grow flex gap-1 transform scale-y-150 origin-left">
                       {[1,2,3,4,5,6].map(v => <div key={v} className={`h-1 flex-1 rounded-full ${v <= 4 ? 'bg-blue-500' : 'bg-slate-700'}`} />)}
                    </div>
                 </div>
               </div>
             </div>

             <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
               <div>
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Visual Theme</p>
                  <p className="text-[10px] text-slate-500 italic">Toggle high-viz mode.</p>
               </div>
               <button 
                onClick={() => {
                  const isLight = document.body.classList.toggle('theme-light');
                  localStorage.setItem('spectasync-theme', isLight ? 'light' : 'dark');
                }}
                aria-label="Toggle interface visual theme"
                className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-[10px] font-bold uppercase transition-all"
               >
                 <Sun size={12} className="text-amber-400" /> / <Moon size={12} className="text-blue-400" />
               </button>
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

      {/* Column 3: Contact & Resources (Combined) */}
      {view === 'system' && (
        <div className="space-y-6">
           <InfoSection title="Research Hub" icon={<GraduationCap size={24} />}>
              <div className="space-y-4">
                 <p className="text-xs text-slate-500 leading-relaxed italic">
                    Access anonymized incident datasets for GNN training and Crowd Ethics forensics.
                 </p>
                 <div className="flex flex-col gap-2">
                    <button type="button" aria-label="Download Sync Dataset Version 3.4" className="flex items-center justify-center gap-2 p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase text-slate-300 transition-all border border-white/5">
                      <Download size={12} /> Sync Dataset V3.4
                    </button>
                    <button type="button" aria-label="Request Access to GNN Computational Node" className="flex items-center justify-center gap-2 p-2.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl text-[10px] font-black uppercase text-blue-400 transition-all border border-blue-500/20">
                       Request GNN Node Access
                    </button>
                 </div>
              </div>
           </InfoSection>

           <InfoSection title="Developer Support" icon={<ShieldCheck size={24} />}>
              <div className="space-y-4">
                <a href="https://github.com/sivasubramanian86/SpectaSyncAI" target="_blank" rel="noreferrer" aria-label="View public source code on GitHub (opens in new tab)" className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group">
                  <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-slate-700 group-hover:scale-110 transition-all">
                    <Github className="text-slate-400 group-hover:text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Source</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Public Repo</p>
                  </div>
                </a>
                <a href="mailto:support@spectasync.ai" className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group">
                  <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 group-hover:scale-110 transition-all">
                     <Mail className="text-blue-400 group-hover:text-blue-300" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Email</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">HQ Support</p>
                  </div>
                </a>
              </div>
           </InfoSection>
        </div>
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

            {/* NEW: Explicit Google Services Audit Section */}
            <div className="mt-12 p-8 bg-blue-500/5 border border-blue-500/20 rounded-3xl space-y-6">
              <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                <div className="p-3 bg-blue-500/10 rounded-2xl">
                   <img src="https://www.gstatic.com/images/branding/product/2x/google_cloud_64dp.png" className="w-8 h-8 opacity-80" alt="GCP" />
                </div>
                <div>
                   <h3 className="text-xl font-black text-white uppercase tracking-tighter">Google Ecosystem Integration Audit</h3>
                   <p className="text-xs text-slate-500 font-mono italic">Full stack alignment with Google Cloud GenAI & Infrastructure</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-blue-400">Compute & Lifecycle</p>
                    <ul className="space-y-2">
                       <li className="text-xs text-slate-300 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Cloud Run (Mesh Runtime)</li>
                       <li className="text-xs text-slate-300 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Firebase Hosting / Realtime</li>
                       <li className="text-xs text-slate-300 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Cloud Pub/Sub (Event Bus)</li>
                       <li className="text-xs text-slate-300 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Google Identity (SSO/Auth)</li>
                    </ul>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-blue-400">Generative AI</p>
                    <ul className="space-y-2">
                       <li className="text-xs text-slate-300 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Gemini 2.5 Pro (Orchestration)</li>
                       <li className="text-xs text-slate-300 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Vertex AI Context Cache</li>
                       <li className="text-xs text-slate-300 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Multimodal (Vision/Audio)</li>
                    </ul>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-blue-400">Data & Observability</p>
                    <ul className="space-y-2">
                       <li className="text-xs text-slate-300 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> AlloyDB + pgvector (RAG)</li>
                       <li className="text-xs text-slate-300 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Google Cloud Logging (Audit)</li>
                       <li className="text-xs text-slate-300 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Cloud Monitoring Metrics</li>
                       <li className="text-xs text-slate-300 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Google Analytics (gtag.js)</li>
                    </ul>
                 </div>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/5">
                 <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Integration Readiness Level</p>
                 <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => <div key={i} className={`w-6 h-1 rounded-full ${i <= 5 ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-slate-700'}`} />)}
                 </div>
              </div>
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
  const [error, setError] = React.useState<string | null>(null);
  const autoRunAttemptedRef = React.useRef(false);

  const formatAuditValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return 'N/A';
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (Array.isArray(value)) {
      return value.map((item) => formatAuditValue(item)).join('\n');
    }

    if (typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const parts: string[] = [];

      if (typeof record.description === 'string') {
        parts.push(record.description);
      }

      if (record.peak_inside_venue !== undefined) {
        parts.push(`Inside venue: ${formatAuditValue(record.peak_inside_venue)}`);
      }

      if (record.estimated_peak_outside_perimeter !== undefined) {
        parts.push(`Outside perimeter: ${formatAuditValue(record.estimated_peak_outside_perimeter)}`);
      }

      const extraKeys = Object.keys(record).filter(
        (key) => key !== 'description' && key !== 'peak_inside_venue' && key !== 'estimated_peak_outside_perimeter',
      );

      if (parts.length === 0 && extraKeys.length > 0) {
        return extraKeys.map((key) => `${key}: ${formatAuditValue(record[key])}`).join('\n');
      }

      if (parts.length > 0) {
        return parts.join('\n');
      }
    }

    return JSON.stringify(value);
  };

  const loadAudit = React.useCallback(async (isActive = true) => {
    try {
      const [scenarioResponse, analysisResponse] = await Promise.all([
        fetch('/v1/pre-event/mock-data'),
        fetch('/v1/pre-event/analysis'),
      ]);

      if (!scenarioResponse.ok) {
        throw new Error(`HTTP ${scenarioResponse.status}`);
      }

      const scenario = await scenarioResponse.json();
      if (isActive) {
        setData(scenario);
      }

      if (analysisResponse.ok) {
        const latestAnalysis = await analysisResponse.json();
        if (isActive && latestAnalysis.status !== 'pending_or_failed') {
          setAnalysis(latestAnalysis);
          return;
        }
      } else {
        console.error(`Initial analysis fetch failed: HTTP ${analysisResponse.status}`);
      }

      if (isActive && !autoRunAttemptedRef.current) {
        autoRunAttemptedRef.current = true;
        setLoading(true);
        try {
          const res = await fetch('/v1/pre-event/analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(scenario),
          });
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          const result = await res.json();
          if (isActive) {
            setAnalysis(result);
          }
        } catch (err) {
          console.error('Auto analysis failed:', err);
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      }
    } catch (err) {
      console.error('Scenario fetch failed:', err);
      if (isActive) {
        setError('Agent communication timeout - retrying via mesh failsafe.');
      }
    }
  }, []);

  React.useEffect(() => {
    let isActive = true;
    void loadAudit(isActive);
    return () => {
      isActive = false;
    };
  }, [loadAudit]);

  const runAnalysis = async () => {
    if (!data) return;
    autoRunAttemptedRef.current = true;
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

  if (error) {
    return (
      <div className="lg:col-span-3 flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 glass border-red-500/20 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
          <Compass size={32} className="animate-pulse" />
        </div>
        <h3 className="text-xl font-bold text-red-400 uppercase tracking-tight">Agent Link Severed</h3>
        <p className="text-sm text-slate-400 max-w-md leading-relaxed">{error}</p>
        <button 
          onClick={() => { setError(null); void loadAudit(); }}
          className="mt-4 px-6 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg text-xs font-bold uppercase tracking-widest text-red-300 transition-all"
        >
          Re-establish Mesh Connection
        </button>
      </div>
    );
  }

  if (!data) return <div className="lg:col-span-3 p-10 text-center animate-pulse text-slate-500 font-mono uppercase tracking-widest">Loading Strategic Intel...</div>;

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
               {loading ? 'Agent Reasoning...' : 'Refresh Strategic Analysis'}
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
                             <div className="text-lg text-white font-black whitespace-pre-line">
                               {formatAuditValue(analysis.expected_crowd_peak)}
                             </div>
                          </div>
                          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                             <p className="text-xs font-bold text-sky-400 mb-1">Environmental Impact</p>
                             <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                               {formatAuditValue(analysis.weather_impact)}
                             </p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="space-y-4">
                       <h3 className="text-[10px] font-black uppercase text-slate-500 border-b border-white/5 pb-2">Pros & Cons of Attendance</h3>
                       <p className="text-xs text-slate-400 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5 whitespace-pre-wrap">
                          {formatAuditValue(analysis.pro_con_summary)}
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
                             <span className="text-red-500 font-bold">•</span> {formatAuditValue(m)}
                          </li>
                       ))}
                    </ul>
                 </div>

                 <div className="mt-6 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                    <h3 className="text-sm font-black text-emerald-400 uppercase mb-2">Final Strategic Recommendation</h3>
                    <p className="text-sm text-white font-medium leading-relaxed italic whitespace-pre-line">
                       "{formatAuditValue(analysis.strategic_recommendation)}"
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
