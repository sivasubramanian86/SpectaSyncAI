import React, { useEffect, useState } from 'react';
import { Activity, ShieldAlert, Database, Command, Users, Settings, HelpCircle, Info, Compass, Globe, ChevronDown, MoreHorizontal } from 'lucide-react';
import { TRANSLATIONS } from '../translations';
import * as firebase from '../firebase';
import type { User } from 'firebase/auth';

export type TabId = 'dashboard' | 'vision' | 'demographics' | 'crisis' | 'intelligence' | 'pre-event' | 'about' | 'faq' | 'system';

/**
 * Props for the Header component.
 */
interface HeaderProps {
  /** Timestamp of the last telemetry heartbeat. */
  lastUpdated: Date;
  /** Whether the system is receiving live mesh updates. */
  isLive: boolean;
  /** The currently active navigation tab. */
  activeTab: TabId;
  /** Callback triggered when the user switches tabs. */
  onTabChange: (tab: TabId) => void;
  /** Current active language code. */
  language: string;
  /** Callback to change system language. */
  onLanguageChange: (lang: string) => void;
}

/**
 * Header Component
 * Provides global navigation and system status overlays.
 */
export const Header: React.FC<HeaderProps> = ({ lastUpdated, isLive, activeTab, onTabChange, language, onLanguageChange }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const t = TRANSLATIONS[language] || TRANSLATIONS.EN;

  const handleGoogleSignIn = async () => {
    try {
      if (!firebase.isFirebaseConfigured) return;
      setIsConnecting(true);
      const result = await firebase.signInWithGoogle();
      if (result) {
        setUser(result.user);
      }
    } catch (error) {
      console.error('Google sign-in failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await firebase.signOutUser();
    } catch (error) {
      console.error('Firebase sign-out failed:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = firebase.subscribeToAuthState((firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: t.tabs.dashboard, icon: <Activity size={18} /> },
    { id: 'vision', label: t.tabs.vision, icon: <Database size={18} /> },
    { id: 'pre-event', label: t.tabs.strategic, icon: <Compass size={18} /> },
    { id: 'crisis', label: t.tabs.crisis, icon: <ShieldAlert size={18} /> },
    { id: 'intelligence', label: t.tabs.intelligence, icon: <Command size={18} /> },
    { id: 'demographics', label: t.tabs.demographics, icon: <Users size={18} /> },
    { id: 'system', label: t.tabs.settings, icon: <Settings size={18} /> },
    { id: 'about', label: t.tabs.info, icon: <Info size={18} /> },
    { id: 'faq', label: t.tabs.faq, icon: <HelpCircle size={18} /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-white/10 px-6 py-4">
      <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 2xl:gap-8 flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="text-white" size={24} />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-xl font-black text-white tracking-tighter uppercase">SpectaSync<span className="text-blue-500">AI</span></h1>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  {isLive ? t.status.active : t.status.offline} • {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          <nav className="hidden xl:flex items-center gap-0.5 flex-1 min-w-0 py-1">
            {tabs.slice(0, 5).map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] 2xl:text-xs font-bold uppercase tracking-widest transition-all flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
                title={tab.label}
              >
                {tab.icon}
                <span className="hidden 2xl:inline whitespace-nowrap">{tab.label}</span>
                <span className="inline 2xl:hidden whitespace-nowrap">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
            
            <div className="relative ml-2">
              <button
                onClick={() => setShowMore(!showMore)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] 2xl:text-xs font-bold uppercase tracking-widest transition-all border border-transparent ${
                  ['demographics', 'system', 'about', 'faq'].includes(activeTab)
                    ? 'bg-blue-600/10 text-blue-400'
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                <MoreHorizontal size={16} />
                <span className="hidden 2xl:inline">More</span>
                <ChevronDown size={12} className={`transition-transform ${showMore ? 'rotate-180' : ''}`} />
              </button>
              
              {showMore && (
                <div className="absolute top-full left-0 mt-2 w-48 glass border border-white/10 rounded-xl overflow-hidden shadow-2xl z-[60] animate-in fade-in zoom-in-95 duration-200">
                   {tabs.slice(5).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        onTabChange(tab.id);
                        setShowMore(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest transition-colors ${
                        activeTab === tab.id ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                   ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5 glass px-2 2xl:px-3 py-1.5 border-white/5 group bg-white/5">
            <Globe size={14} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
            <select 
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent border-none text-[10px] font-bold text-slate-400 focus:ring-0 cursor-pointer hover:text-white uppercase tracking-widest outline-none"
              aria-label="Select Language"
            >
              <option value="EN" className="bg-navy-900">EN</option>
              <option value="HI" className="bg-navy-900">HI</option>
              <option value="TE" className="bg-navy-900">TE</option>
              <option value="TA" className="bg-navy-900">TA</option>
              <option value="BN" className="bg-navy-900">BN</option>
              <option value="ML" className="bg-navy-900">ML</option>
              <option value="KN" className="bg-navy-900">KN</option>
              <option value="ZH" className="bg-navy-900">ZH</option>
              <option value="JA" className="bg-navy-900">JA</option>
              <option value="ES" className="bg-navy-900">ES</option>
              <option value="FR" className="bg-navy-900">FR</option>
            </select>
          </div>

          {firebase.isFirebaseConfigured ? (
            user ? (
              <div className="flex items-center gap-3 bg-white/5 pl-3 pr-1 py-1 rounded-xl border border-white/10">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-[10px] font-bold text-white uppercase tracking-tight leading-none">{user.displayName?.split(' ')[0] || 'Dev'}</span>
                  <span className="text-[8px] font-medium text-slate-500">{user.email?.split('@')[0]}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-transparent hover:border-white/10"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                disabled={isConnecting}
                className="px-4 py-2 bg-[#4285F4] text-white hover:bg-[#357ae8] disabled:bg-slate-700 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 border border-blue-400/20 whitespace-nowrap overflow-hidden flex-shrink-0"
              >
                {isConnecting ? (
                  <>
                    <Activity className="animate-spin" size={14} />
                    <span className="text-[10px] font-black uppercase">Connecting...</span>
                  </>
                ) : (
                  <>
                    <div className="bg-white p-0.5 rounded flex-shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </div>
                    <span className="hidden sm:inline">Continue with Google</span>
                  </>
                )}
              </button>
            )
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-default">
              <ShieldAlert size={12} />
              <span>Firebase disabled</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
