import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { GlobalErrorBoundary } from '../components/GlobalErrorBoundary';
import { Header } from '../components/Header';
import { MultiModalHub } from '../components/MultiModalHub';
import * as firebase from '../firebase';
import { renderHook } from '@testing-library/react';
import { useDashboardData } from '../hooks/useDashboardData';

// Mock Firebase
vi.mock('../firebase', () => ({
  isFirebaseConfigured: true,
  signInWithGoogle: vi.fn(),
  signOutUser: vi.fn(),
  subscribeToAuthState: vi.fn((cb) => {
    cb(null);
    return () => {};
  }),
}));

// Mock window.location
const originalLocation = window.location;
delete (window as any).location;
window.location = { ...originalLocation, href: '', reload: vi.fn() } as any;

const BuggyComponent = () => {
  throw new Error('Test Error');
};

describe('Resilience and Coverage Hardening', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('GlobalErrorBoundary catches errors and provides reset', () => {
    // Suppress console.error for expected test error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // We wrap in a container to isolate the error
    render(
      <GlobalErrorBoundary>
        <BuggyComponent />
      </GlobalErrorBoundary>
    );

    expect(screen.getByText(/Interface Failure Detected/)).toBeDefined();
    expect(screen.getByText(/Test Error/)).toBeDefined();

    const resetBtn = screen.getByText('Re-Sync Command Center');
    fireEvent.click(resetBtn);
    
    expect(window.location.reload).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('Header handles failed Google sign-in (null result)', async () => {
    vi.mocked(firebase.signInWithGoogle).mockResolvedValue(null as any);
    
    render(
      <Header 
        lastUpdated={new Date()} 
        isLive={true} 
        activeTab="dashboard" 
        onTabChange={() => {}} 
        onLanguageChange={() => {}}
      />
    );

    const loginBtn = screen.getByText(/Continue with Google/i);
    await act(async () => {
      fireEvent.click(loginBtn);
    });

    expect(screen.getByText(/Continue with Google/i)).toBeDefined();
  });

  it('AudioVisualizer handles isActive state changes', () => {
    const { rerender } = render(<MultiModalHub />);
    
    // Default state check (usually images/video not audio)
    // Find audio tab
    const audioTabs = screen.getAllByRole('button');
    const audioTab = audioTabs.find(t => t.textContent?.includes('Audio'));
    if (audioTab) {
      fireEvent.click(audioTab);
    }
    
    // Ensure animation or static state rendered
    expect(screen.getAllByRole('img', { hidden: true })).toBeDefined(); // Lucide icons
    
    // Rerender to ensure both paths of isActive are hit in internal components
    rerender(<MultiModalHub />);
  });

  it('useDashboardData polling loop handles exceptions', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const cryptoSpy = vi.spyOn(crypto, 'randomUUID').mockImplementation(() => {
      throw new Error('UUID Generation Failure');
    });
    
    renderHook(() => useDashboardData());
    
    // Advance timers to trigger the first interval - will call generateAgentEvent -> crypto.randomUUID -> THROW
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(errorSpy).toHaveBeenCalledWith('[Dashboard Poll Failure]:', expect.any(Error));

    errorSpy.mockRestore();
    cryptoSpy.mockRestore();
  });
});
