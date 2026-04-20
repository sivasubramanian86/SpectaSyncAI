import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Mic, Globe, ShieldAlert, MonitorPlay } from 'lucide-react';

type MediaType = 'video' | 'audio' | 'image';

interface MediaSource {
  id: string;
  name: string;
  url: string | string[];
  type: MediaType;
  timestamp: string;
  status: 'SAFE' | 'WARNING' | 'CRITICAL';
}


function AudioVisualizer({ isActive }: { isActive: boolean }) {
  return (
    <div className="flex gap-1 items-end h-20 mb-6">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 8, 6, 4, 2].map((_, i) => (
        <div
          key={i}
          className={`w-3 bg-blue-500 rounded-full transition-all duration-150 ${isActive ? 'animate-bounce' : 'h-2'}`}
          style={{ 
            height: isActive ? `${Math.random() * 100}%` : '8px',
            animationDelay: `${i * 0.05}s`,
            animationDuration: `${0.5 + Math.random()}s`
          }}
        />
      ))}
    </div>
  );
}

const SAMPLE_MEDIA: MediaSource[] = [
  { id: '1', name: 'Gate 3 - Forensic Sequence (VEO)', url: ['https://storage.googleapis.com/spectasync-public-assets/crowd_surge_precursor.png', 'https://storage.googleapis.com/spectasync-public-assets/thermal_stagnation.png', 'https://storage.googleapis.com/spectasync-public-assets/gate3_surge.png'], type: 'image', timestamp: '10:42:01', status: 'CRITICAL' },
  { id: '2', name: 'Panic Signature - Sector 4 (Lyria)', url: ['https://storage.googleapis.com/spectasync-public-assets/shouting_mob.mp3', 'https://storage.googleapis.com/spectasync-public-assets/angry_mob.mp3'], type: 'audio', timestamp: '10:42:15', status: 'CRITICAL' },
  { id: '3', name: 'Drone Patrol - North Plaza (VEO)', url: 'https://storage.googleapis.com/spectasync-public-assets/crowd_surge.mp4', type: 'video', timestamp: '10:41:55', status: 'SAFE' },
];

/**
 * Core multi-modal intelligence hub rendering CCTV and drone feeds with live reasoning traces.
 * Demonstrates Gemini 2.5 Flash Multi-Modal capabilities in analyzing visuals and acoustics.
 * 
 * @returns {React.ReactElement} The multi-modal analysis hub.
 */
export function MultiModalHub() {
  const { t, i18n } = useTranslation();
  const [activeMedia, setActiveMedia] = useState<MediaSource>(SAMPLE_MEDIA[0]);
  const [frameIdx, setFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-cycle frames for sequences
  useEffect(() => {
    if (Array.isArray(activeMedia.url)) {
      const interval = setInterval(() => {
        setFrameIdx((prev) => (prev + 1) % (activeMedia.url as string[]).length);
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setFrameIdx(0);
    }
  }, [activeMedia]);

  const currentUrl = Array.isArray(activeMedia.url) 
    ? (activeMedia.url as string[])[frameIdx] 
    : (activeMedia.url as string);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <MonitorPlay size={20} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white tracking-widest uppercase mb-1">{t('multiModal.title')}</h2>
            <p className="text-[10px] text-slate-500 uppercase font-black">Powered by Gemini 2.5 Flash Multi-Modal</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Globe size={14} className="text-slate-500" />
          <select 
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            aria-label="Select Language"
            className="bg-navy-900 border border-white/10 rounded px-3 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          >
            <option value="EN">English</option>
            <option value="HI">हिन्दी (Hindi)</option>
            <option value="TE">తెలుగు (Telugu)</option>
            <option value="TA">தமிழ் (Tamil)</option>
            <option value="BN">বাংলা (Bengali)</option>
            <option value="ML">മലയാളം (Malayalam)</option>
            <option value="KN">ಕನ್ನಡ (Kannada)</option>
            <option value="ZH">中文 (Chinese)</option>
            <option value="JA">日本語 (Japanese)</option>
            <option value="ES">Español (Spanish)</option>
            <option value="FR">Français (French)</option>
            <option value="IT">Italiano (Italian)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
             {activeMedia.type === 'video' && (
               <video key={currentUrl} src={currentUrl} className="w-full h-full object-cover" autoPlay muted loop />
             )}
             {activeMedia.type === 'image' && (
               <div className="relative w-full h-full">
                 <img key={currentUrl} src={currentUrl} className="w-full h-full object-cover" alt="Forensic frame" />
                 {Array.isArray(activeMedia.url) && (
                   <div className="absolute bottom-4 right-4 flex gap-1">
                     {(activeMedia.url as string[]).map((_, i) => (
                       <div key={i} className={`w-2 h-2 rounded-full ${i === frameIdx ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'bg-white/20'}`} />
                     ))}
                   </div>
                 )}
               </div>
             )}
              {activeMedia.type === 'audio' && (
                <div 
                  className="w-full h-full flex flex-col items-center justify-center bg-black/40 backdrop-blur-3xl rounded-2xl overflow-hidden relative"
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{ cursor: 'pointer' }}
                >
                   <AudioVisualizer isActive={isPlaying} />
                   <div className="flex items-center gap-3 mb-2">
                     <Mic size={48} className={`text-blue-400 ${isPlaying ? 'animate-pulse' : 'opacity-40'}`} />
                   </div>
                   <p className="text-xs text-slate-300 uppercase font-black tracking-widest">
                     {isPlaying ? 'Analysis in Progress: Distress Transients Detected' : 'Feed Paused'}
                   </p>
                   <audio key={currentUrl} src={currentUrl} autoPlay={isPlaying} hidden />
                </div>
              )}
             
             <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                <div className="flex gap-2 text-left">
                  <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE
                  </span>
                  <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded border border-white/10">
                    {activeMedia.name} | {activeMedia.timestamp}
                  </span>
                </div>
                
                {/* ADK Live Reasoning Trace Dashboard */}
                <div className="bg-blue-600/20 backdrop-blur-3xl border border-blue-500/30 rounded-lg p-3 max-w-[240px] animate-in fade-in slide-in-from-left duration-700 shadow-2xl text-left">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">ADK Live Mesh Trace</span>
                    </div>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-500/30 border border-blue-400/30 text-blue-200">12 AGENTS</span>
                  </div>
                  <div className="space-y-2 text-left">
                    <p className="text-[9px] text-blue-100/90 leading-tight font-mono whitespace-pre-line">
                      {activeMedia.type === 'video' 
                        ? '> VisionAgent: Detecting high-frequency flow reversal patterns...\n> CoreOrchestrator: Synced 9/12 Mesh Nodes.' 
                        : '> LyriaAgent: Isolating non-ambient acoustic distress signatures...\n> IncidentRAG: Analysing INC-2025-IND-02.'}
                    </p>
                    <div className="flex gap-1 items-center">
                       {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(v => (
                          <div key={v} className="w-1.5 h-1.5 rounded-full bg-blue-400/40 animate-pulse" style={{ animationDelay: `${v * 0.1}s` }} />
                       ))}
                    </div>
                    <div className="w-full bg-blue-900/40 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full w-4/5 animate-progress shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Signal Control Overlay */}
              <div className="absolute bottom-4 left-4 flex gap-2 z-20 text-left">
                 <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-white hover:bg-blue-600 transition-all group">
                    <Camera size={12} className="text-blue-400 group-hover:text-white" /> Capture Frame
                 </button>
                 <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-white hover:bg-emerald-600 transition-all group">
                    <Mic size={12} className="text-emerald-400 group-hover:text-white" /> Record Loop
                 </button>
              </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {SAMPLE_MEDIA.map(media => (
              <button 
                key={media.id}
                onClick={() => setActiveMedia(media)}
                className={`p-3 rounded-xl border transition-all ${activeMedia.id === media.id ? 'bg-blue-500/10 border-blue-500/40 text-blue-400' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {media.type === 'video' ? <Camera size={14} /> : media.type === 'audio' ? <Mic size={14} /> : <Camera size={14} />}
                  <span className="text-[10px] font-black uppercase tracking-widest">{media.type}</span>
                </div>
                <p className="text-xs font-bold truncate text-left">{media.name}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
            <div className="glass p-5 border-l-4 border-l-blue-500">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('multiModal.reco')}</h3>
                <ShieldAlert size={14} className={activeMedia.status === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'} />
              </div>
              
              <div className="space-y-4">
                <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <p className="text-[10px] text-red-500 font-bold uppercase mb-1">Agentic Multi-Modal Reasoning</p>
                  <p className="text-xs text-slate-200 leading-relaxed italic">
                    {activeMedia.id === '1' ? 
                      '"Detected fluid-dynamic inversion at Gate 3. Bounding box density exceeds 7.8 persons/sqm. Probability of shockwave: 92%."' :
                      activeMedia.id === '2' ?
                      '"Acoustic spectrum analysis detects high-frequency distress transients in Sector 4. Correlation with kinetic stasis confirms crushing event."' :
                      '"Thermal indices in Section 102 indicate critical stagnation. Heat-to-Flow ratio is stalled. Evacuation mesh engagement recommended."'
                    }
                  </p>
                </div>

                <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <span className="text-blue-500 font-bold">{t('multiModal.reco')}</span>
                <p className="text-[10px] leading-relaxed text-slate-100 font-medium">
                  {t('multiModal.action')}
                </p>
                </div>
              </div>
           </div>

           <div className="glass p-5">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Security Guardrails</h3>
              <div className="space-y-3">
                 {[
                   { label: 'Prompt Injection Filter', state: 'ACTIVE' },
                   { label: 'PII Scrubbing (Auto)', state: 'ACTIVE' },
                   { label: 'ROI Safety Override', state: 'READY' },
                 ].map(g => (
                    <div key={g.label} className="flex justify-between items-center bg-navy-900 p-2 rounded border border-white/5">
                       <span className="text-[10px] font-bold text-slate-500 uppercase">{g.label}</span>
                       <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-black">{g.state}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
