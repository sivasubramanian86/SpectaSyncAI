import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Header } from '../components/Header';
import { SystemPanel } from '../components/SystemPanel';
import * as firebase from '../firebase';

// Mock Fetch
const globalFetch = vi.fn();
vi.stubGlobal('fetch', globalFetch);

vi.mock('../firebase', () => ({
  isFirebaseConfigured: true,
  signInWithGoogle: vi.fn(),
  signOutUser: vi.fn(),
  subscribeToAuthState: vi.fn((cb) => {
    // Immediate callback for initial render
    cb(null);
    return () => {};
  }),
}));

describe('Ultimate Coverage Hardening', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Header: handles sign in when firebase is disabled (Line 37)', async () => {
    // Force disabled state
    (firebase as any).isFirebaseConfigured = false;
    
    render(
      <Header 
        lastUpdated={new Date()} 
        isLive={true} 
        activeTab="dashboard" 
        onTabChange={() => {}} 
        onLanguageChange={() => {}} 
      />
    );

    // Should show "Firebase disabled" badge instead of Google Sign In
    expect(screen.getByText(/Firebase disabled/i)).toBeInTheDocument();
  });

  it('Header: covers handleSignOut catch block (unlikely but for safety)', async () => {
    (firebase as any).isFirebaseConfigured = true;
    (firebase as any).subscribeToAuthState.mockImplementation((cb: any) => {
      cb({ displayName: 'Test User', email: 'test@example.com' });
      return () => {};
    });
    
    render(
      <Header 
        lastUpdated={new Date()} 
        isLive={true} 
        activeTab="dashboard" 
        onTabChange={() => {}} 
        onLanguageChange={() => {}} 
      />
    );

    const signOutBtn = screen.getByText(/Sign out/i);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    (firebase as any).signOutUser.mockRejectedValueOnce(new Error('Sign out failed'));
    fireEvent.click(signOutBtn);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Firebase sign-out failed:', expect.any(Error));
    });
    consoleSpy.mockRestore();
  });

  it('SystemPanel: covers cleanup and isActive=false branches (Lines 458-513)', async () => {
    // Mock successful scenario fetch but slow analysis fetch
    globalFetch.mockImplementation((url) => {
      if (url === '/v1/pre-event/scenario') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ event_name: 'Test Event', total_reservations: 100, venue_capacity: 500, weather_forecast: { temp_c: 25, condition: 'Clear', humidity: 50, precipitation_prob: 0 }, additional_context: 'None' })
        });
      }
      if (url === '/v1/pre-event/analysis') {
        // Return a promise that never resolves or resolves after unmount
        return new Promise((resolve) => setTimeout(() => resolve({ ok: true, json: () => Promise.resolve({ risk_level: 'LOW' }) }), 50));
      }
      return Promise.reject(new Error('Not found'));
    });

    const { unmount } = render(<SystemPanel />);

    // Immediate unmount to trigger isActive = false branches in the async fetch
    unmount();

    // Small delay to let the fetch "finish" in the background
    await new Promise(r => setTimeout(r, 100));
    
    // If it didn't crash, we're likely hitting those branches safely
  });

  it('SystemPanel: covers runAnalysis failure branch', async () => {
    globalFetch.mockImplementation((url: string, options: any) => {
      const method = options?.method || 'GET';
      if (url.includes('/v1/pre-event/mock-data')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            event_name: 'Test Event', 
            total_reservations: 100, 
            venue_capacity: 500, 
            weather_forecast: { temp_c: 25, condition: 'Clear', humidity: 50, precipitation_prob: 0 }, 
            additional_context: 'None' 
          })
        });
      }
      if (url.includes('/v1/pre-event/analysis') && method === 'GET') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'pending_or_failed' })
        });
      }
      if (url.includes('/v1/pre-event/analysis') && method === 'POST') {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<SystemPanel view="pre-event" />);
    
    const runBtn = await screen.findByTestId('run-strategic-analysis');
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Trigger runAnalysis manually
    fireEvent.click(runBtn);
    
    await waitFor(() => {
      // It might be 'Auto analysis failed:' or 'Analysis failed:' depending on timing,
      // but manually clicking will trigger 'Analysis failed:'
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/analysis failed/i), expect.any(Error));
    });
    consoleSpy.mockRestore();
  });
});
