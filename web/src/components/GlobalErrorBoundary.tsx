import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * GlobalErrorBoundary — Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 * 
 * Ensures SpectaSyncAI Command Center remains resilient during high-stakes demos.
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[SpectaSyncAI UI Crash]:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full glass p-8 border-red-500/30 text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-2">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-white uppercase tracking-wider">Interface Failure Detected</h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                The agent mesh UI encountered a rendering exception. Tactical monitoring has been paused for safety.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-black/40 rounded p-4 text-xs font-mono text-red-400 text-left overflow-auto max-h-32 border border-red-900/20">
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full h-11 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Re-Sync Command Center
            </button>

            <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-600 uppercase tracking-tighter">
              Status: Failsafe Activated | Secure Node: {window.location.hostname}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
