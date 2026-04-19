import React, { useEffect, useState } from 'react';
import { Activity, ShieldAlert, Database, Command, Users, Settings, HelpCircle, Info, Compass } from 'lucide-react';
import { isFirebaseConfigured, signInWithGoogle, signOutUser, subscribeToAuthState } from '../firebase';
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
 * Global Navigation Header for SpectaSyncAI.
 * Handles user authentication (Firebase), tab switching, and system status indicators.
 */
export function Header({ lastUpdated, isLive, activeTab, onTabChange }: HeaderProps) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
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

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured) {
      return;
    }

    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign-in failed:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Firebase sign-out failed:', error);
    }
  };

  useEffect(() => {
    return subscribeToAuthState(setFirebaseUser);
  }, []);

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
            <span className={isFirebaseConfigured ? 'text-orange-400' : 'text-slate-500'}>
              {isFirebaseConfigured ? 'Firebase Sync' : 'Firebase Local'}
            </span>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <button
              type="button"
              onClick={firebaseUser ? handleSignOut : handleGoogleSignIn}
              disabled={!isFirebaseConfigured || isSigningIn}
              aria-label={firebaseUser ? 'Sign out of Firebase' : 'Sign in with Google'}
              className="flex items-center gap-2 bg-white text-gray-900 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path 
                  fill="#4285F4" 
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  aria-hidden="true"
                />
                <path 
                  fill="#34A853" 
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  aria-hidden="true"
                />
                <path 
                  fill="#FBBC05" 
                  d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z"
                  aria-hidden="true"
                />
                <path 
                  fill="#EA4335" 
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  aria-hidden="true"
                />
              </svg>
              {isSigningIn
                ? 'Connecting...'
                : firebaseUser
                  ? 'Sign out'
                  : isFirebaseConfigured
                    ? 'Sign in with Google'
                    : 'Firebase disabled'}
            </button>
            {firebaseUser ? (
              <p className="text-[10px] text-emerald-300 font-mono">
                {firebaseUser.email ?? firebaseUser.displayName ?? 'Signed in'}
              </p>
            ) : (
              <p className="text-[10px] text-slate-500 font-mono">
                {isFirebaseConfigured ? 'Google login ready' : 'Set VITE_FIREBASE_* env vars'}
              </p>
            )}
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

      <nav className="flex items-center p-1 bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl w-fit sm:w-full overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
            aria-label={`Switch to ${tab.label} view`}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
