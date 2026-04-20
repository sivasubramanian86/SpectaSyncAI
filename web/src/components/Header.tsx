import React, { useEffect, useState } from 'react';
import { Activity, ShieldAlert, Database, Command, Users, Settings, HelpCircle, Info, Compass } from 'lucide-react';
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
}

/**
 * Header Component
 * Provides global navigation and system status overlays.
 */
export const Header: React.FC<HeaderProps> = ({ lastUpdated, isLive, activeTab, onTabChange }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

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
    { id: 'dashboard', label: 'Command Hub', icon: <Activity size={18} /> },
    { id: 'vision', label: 'Tactical View', icon: <Database size={18} /> },
    { id: 'demographics', label: 'Demographics', icon: <Users size={18} /> },
    { id: 'crisis', label: 'Crisis Mesh', icon: <ShieldAlert size={18} /> },
    { id: 'intelligence', label: 'Incident RAG', icon: <Command size={18} /> },
    { id: 'pre-event', label: 'Strategic Audit', icon: <Compass size={18} /> },
    { id: 'system', label: 'Settings', icon: <Settings size={18} /> },
    { id: 'about', label: 'Info', icon: <Info size={18} /> },
    { id: 'faq', label: 'FAQ', icon: <HelpCircle size={18} /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-white/10 px-6 py-4">
      <div className="max-w-[1800px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase">SpectaSync<span className="text-blue-500">AI</span></h1>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  {isLive ? 'Link Active' : 'Link Severed'} • {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          <nav className="hidden xl:flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {firebase.isFirebaseConfigured ? (
            user ? (
              <div className="flex items-center gap-4 bg-white/5 pl-4 pr-1 py-1 rounded-xl border border-white/10">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-white uppercase tracking-tight">{user.displayName || 'Dev User'}</span>
                  <span className="text-[8px] font-medium text-slate-500 leading-none">{user.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                disabled={isConnecting}
                className="px-5 py-2.5 bg-[#4285F4] text-white hover:bg-[#357ae8] disabled:bg-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 shadow-lg shadow-blue-500/20 border border-blue-400/20"
              >
                {isConnecting ? (
                  <>
                    <Activity className="animate-spin" size={14} />
                    Connecting...
                  </>
                ) : (
                  <>
                    <div className="bg-white p-1 rounded-sm">
                      <svg width="12" height="12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </div>
                    Continue with Google
                  </>
                )}
              </button>
            )
          ) : (
            <button 
              onClick={handleGoogleSignIn}
              className="px-6 py-2.5 bg-white/5 border border-white/10 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
            >
              <ShieldAlert size={14} />
              Firebase disabled
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
