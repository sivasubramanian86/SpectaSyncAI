import React from 'react';
import { HelpCircle, Info, Settings, ShieldCheck, Mail, Github, ExternalLink, GraduationCap, Download } from 'lucide-react';

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

export function SystemPanel(): React.ReactElement {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in pb-10">
      {/* About Section */}
      <InfoSection title="About SpectaSyncAI" icon={<Info size={24} />}>
        <p>
          SpectaSyncAI is a state-of-the-art multi-agent mesh system designed to automate crowd safety 
          and venue intelligence for large-scale public events.
        </p>
        <p>
          Built on the <strong>Google ADK (Agent Development Kit)</strong> and powered by <strong>Gemini 2.5</strong>, 
          the system orchestrates 11 specialized agents to analyze live vision feeds, predict surges, 
          and deploy interventions across two critical tiers of safety.
        </p>
        <ul className="grid grid-cols-2 gap-2 text-xs font-mono text-blue-300 mt-4">
          <li className="flex items-center gap-2">✓ Vertex AI Architecture</li>
          <li className="flex items-center gap-2">✓ Real-time RAG Integration</li>
          <li className="flex items-center gap-2">✓ Multi-Agent Orchestration</li>
          <li className="flex items-center gap-2">✓ Fail-safe Crisis Mesh</li>
        </ul>
      </InfoSection>

      {/* FAQ Section */}
      <InfoSection title="Frequently Asked Questions" icon={<HelpCircle size={24} />}>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-blue-300 mb-1">How does the "Crisis Prevention Mesh" work?</h4>
            <p className="text-sm">
              It monitors perimeter surges, VIP delays, and infrastructure failures. If a metric exceeds safety thresholds, 
              it cross-references a RAG-stored corpus of 12 global incidents to suggest life-saving interventions.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-300 mb-1">What is Tier-1 vs Tier-2 safety?</h4>
            <p className="text-sm">
              Tier-1 handles operational tasks like queue management and vision analysis. Tier-2 is reserved for 
              high-severity crisis scenarios where lives may be at risk.
            </p>
          </div>
        </div>
      </InfoSection>

      {/* Settings Panel */}
      <InfoSection title="System Settings" icon={<Settings size={24} />}>
        <div className="space-y-4">
          <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
            <div className="flex items-center gap-3 mb-3">
              <GraduationCap className="text-blue-400" size={20} />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Academic Research Track</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Access anonymized incident datasets for GNN (Graph Neural Network) training and Crowd Ethics research. 
              Designed for students participating in the 'AI for Social Good' track.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 p-2 bg-white/5 hover:bg-white/10 rounded text-[10px] font-black uppercase text-slate-300 transition-all">
                <Download size={12} /> Dataset V3.1
              </button>
              <button className="flex items-center justify-center gap-2 p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded text-[10px] font-black uppercase text-blue-300 transition-all">
                 Join Sandbox
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
            <div>
              <p className="text-sm font-medium text-white">Advanced RAG Augmentation</p>
              <p className="text-xs text-slate-500">Enable Gemini reasoning over the incident corpus.</p>
            </div>
            <div className="w-10 h-5 bg-blue-600 rounded-full flex items-center justify-end px-1 cursor-pointer">
              <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
            <div>
              <p className="text-sm font-medium text-white">Live Vision Sync</p>
              <p className="text-xs text-slate-500">Enable real-time density mapping from vision agents.</p>
            </div>
            <div className="w-10 h-5 bg-blue-600 rounded-full flex items-center justify-end px-1 cursor-pointer">
              <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 italic">
            Note: Changes to system settings require administrative credentials in production environments.
          </p>
        </div>
      </InfoSection>

      {/* Support & Links */}
      <InfoSection title="Contact & Resources" icon={<ShieldCheck size={24} />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a href="#" className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group">
            <Github className="text-slate-400 group-hover:text-white" size={20} />
            <div>
              <p className="text-sm font-medium text-white">Source Code</p>
              <p className="text-xs text-slate-500">View on GitHub</p>
            </div>
            <ExternalLink size={14} className="ml-auto text-slate-600" />
          </a>
          <a href="#" className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group">
            <Mail className="text-slate-400 group-hover:text-white" size={20} />
            <div>
              <p className="text-sm font-medium text-white">Support</p>
              <p className="text-xs text-slate-500">Email Architecture Team</p>
            </div>
            <ExternalLink size={14} className="ml-auto text-slate-600" />
          </a>
        </div>
      </InfoSection>
    </div>
  );
}
