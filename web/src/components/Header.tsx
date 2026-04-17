import { Activity, ShieldAlert, Database, Command, Users, Settings, HelpCircle, Info, Compass } from 'lucide-react';

export type TabId = 'dashboard' | 'vision' | 'demographics' | 'crisis' | 'intelligence' | 'pre-event' | 'about' | 'faq' | 'system';

interface HeaderProps {
  lastUpdated: Date;
  isLive: boolean;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function Header({ lastUpdated, isLive, activeTab, onTabChange }: HeaderProps) {
  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Command Hub', icon: <Command size={16} /> },
    { id: 'vision', label: 'Tactical View', icon: <Activity size={16} /> },
    { id: 'demographics', label: 'Demographic Intel', icon: <Users size={16} /> },
    { id: 'crisis', label: 'Crisis Mesh', icon: <ShieldAlert size={16} /> },
    { id: 'intelligence', label: 'Incident RAG', icon: <Database size={16} /> },
    { id: 'pre-event', label: 'Strategic Audit', icon: <Compass size={16} /> },
    { id: 'about', label: 'About', icon: <Info size={16} /> },
    { id: 'faq', label: 'FAQ', icon: <HelpCircle size={16} /> },
    { id: 'system', label: 'Settings', icon: <Settings size={16} /> },
  ];

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between" role="banner">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30">
            <Command size={20} className="text-blue-400" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              SpectaSyncAI
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Mesh Intelligence OS</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 text-[10px] text-slate-400 glass px-3 py-1.5 uppercase font-bold tracking-wider">
            <span className="text-blue-400 flex items-center gap-1"><Users size={12} /> 12-Agent Mesh</span>
            <span className="w-px h-3 bg-white/20" />
            <span className="text-emerald-400">Vertex AI</span>
            <span className="w-px h-3 bg-white/20" />
            <span className="text-cyan-400">ADK 2.1</span>
            <span className="w-px h-3 bg-white/20" />
            <span className="text-orange-400">Firebase Sync</span>
          </div>


          <div className="flex flex-col items-end">
             {isLive && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 mb-0.5" aria-label="Live feed active">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                LIVE
              </div>
            )}
            <time className="text-xs text-slate-500 font-mono">
              {lastUpdated.toLocaleTimeString()}
            </time>
          </div>
        </div>
      </header>

      {/* Navigation Menu */}
      <nav className="flex items-center p-1 bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl w-fit sm:w-full overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

