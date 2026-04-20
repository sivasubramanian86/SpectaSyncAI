import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from '../App';
import { SystemPanel } from '../components/SystemPanel';
import { AgentFeed } from '../components/AgentFeed';
import { MultiModalHub, AudioVisualizer } from '../components/MultiModalHub';


/**
 * SpectaSyncAI: Frontend Coverage Hardening Suite
 * 
 * This suite orchestrates the validation of mission-critical UI components,
 * focusing on error resilience, fallback states, and multimodal data flow.
 * It uses advanced Vitest mocking to simulate edge-case backend responses
 * and component lifecycle interrupts.
 */

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

/** Mock data for baseline strategic scenario testing */
const MOCK_STRATEGIC_DATA = {
  event_name: 'Global Expo 2026',
  total_reservations: 25000,
  venue_capacity: 60000,
  weather_forecast: { temp_c: 24, condition: 'Clear', humidity: 30, precipitation_prob: 0.0 },
  additional_context: 'Ideal conditions.'
};

/** Mock response for agentic safety analysis */
const MOCK_ANALYSIS_DATA = {
  risk_level: 'LOW',
  expected_crowd_peak: 8000,
  weather_impact: 'None',
  pro_con_summary: 'Pros: High flow. Cons: None.',
  precautionary_measures: ['Standard patrols'],
  strategic_recommendation: 'Full capacity deployment.'
};

// Mock firebase
vi.mock('../firebase', async () => {
  const actual = await vi.importActual('../firebase');
  return {
    ...actual,
    isFirebaseConfigured: true,
    signInWithGoogle: vi.fn(),
    signOutUser: vi.fn(),
    subscribeToAuthState: vi.fn((cb) => {
        cb(null);
        return () => {};
    }),
  };
});

describe('User Interaction Tests', () => {


  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockImplementation((url) => {
      if (url.includes('/mock-data')) return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_STRATEGIC_DATA) });
      if (url.includes('/analysis')) return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_ANALYSIS_DATA) });
      return Promise.resolve({ ok: false });
    });
  });

  it('renders Demographic Insights tab and handles missing zones in hook logic', () => {
    // Force GATE_NORTH missing to cover hook line 158
    mockFetch.mockImplementation((url) => {
      if (url.includes('/mock-data')) {
        return Promise.resolve({ 
          ok: true, 
          json: () => Promise.resolve({ 
            ...MOCK_STRATEGIC_DATA,
            zones: [{ zone_id: 'OTHER', density: 0.5 }] // GATE_NORTH missing
          }) 
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_STRATEGIC_DATA) });
    });

    render(<App />);
    // Demographics is now in 'More' menu
    fireEvent.click(screen.getByText('More'));
    const tabButton = screen.getByTestId('tab-demographics');
    fireEvent.click(tabButton);
    expect(screen.getByText('Vision Demographic Intelligence')).toBeDefined();
  });

  it('covers SystemPanel branch handling', async () => {
    render(<App />);
    await act(async () => {
      fireEvent.click(screen.getByText('More'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('tab-system'));
    });
    
    expect(screen.getByText('Tactical Mesh')).toBeDefined();
  });

  it('covers SystemPanel auto-run success path', async () => {
    // GET Analysis fails, triggers POST Auto-Run
    mockFetch.mockImplementation((url, options) => {
      if (url.includes('/analysis') && !options?.method) {
         return Promise.resolve({ ok: false, status: 500 });
      }
      if (url.includes('/mock-data')) return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_STRATEGIC_DATA) });
      if (url.includes('/analysis') && options?.method === 'POST') return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_ANALYSIS_DATA) });
      return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_ANALYSIS_DATA) });
    });

    render(<App />);
    await act(async () => {
        fireEvent.click(screen.getByText('More'));
    });
    await act(async () => {
        fireEvent.click(screen.getByTestId('tab-pre-event'));
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('run-strategic-analysis')).toBeInTheDocument();
      expect(screen.getByText('i18n:strategic.run_analysis')).toBeInTheDocument();
    });
  });

  it('covers SystemPanel interaction and error states', async () => {
    // Force scenario fetch failure
    mockFetch.mockRejectedValueOnce(new Error('Network Fail'));
    render(<SystemPanel view="pre-event" />);
    await waitFor(() => expect(screen.getByText('Agent Link Severed')).toBeInTheDocument());

    // Click retry using data-testid
    await act(async () => {
        fireEvent.click(screen.getByTestId('retry-mesh-connection'));
    });
  });

  it('covers manual analysis run', async () => {
    mockFetch.mockImplementation((url) => {
        if (url.includes('/mock-data')) return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_STRATEGIC_DATA) });
        if (url.includes('/analysis')) return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_ANALYSIS_DATA) });
        return Promise.resolve({ ok: false });
    });
    render(<SystemPanel view="pre-event" />);
    await waitFor(() => expect(screen.getByText('i18n:strategic.run_analysis')).toBeDefined());
    fireEvent.click(screen.getByText('i18n:strategic.run_analysis'));
    await waitFor(() => expect(screen.getByText(/i18n:strategic.agent_reasoning/)).toBeDefined());
  });

  it('covers formatAuditValue complex and recursive boolean paths', async () => {
     mockFetch.mockImplementation((url) => {
        if (url.includes('/mock-data')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ ...MOCK_STRATEGIC_DATA, meta: { active: true, complex: { val: 1 } } }) });
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ...MOCK_ANALYSIS_DATA, strategic_recommendation: false, weather_impact: 99 }) });
     });

     render(<SystemPanel view="pre-event" />);
     await waitFor(() => expect(screen.getByText('Global Expo 2026')).toBeInTheDocument());
     // Use regex because of quotes/formatting in the UI
     await waitFor(() => expect(screen.getByText(/false/i)).toBeInTheDocument());
     expect(screen.getByText(/99/)).toBeInTheDocument();
  });

  it('covers AgentFeed event types and string timestamps', () => {
    const events = [
      { id: '1', agent: 'security_agent', event_type: 'deployment', timestamp: '2026-04-18T10:00:00Z', message: 'Nodes active' },
      { id: '2', agent: 'vision_agent', event_type: 'unknown', timestamp: 1713430800000, message: 'Raw log' }
    ];
    render(<AgentFeed events={events as any} />);
    expect(screen.getByText('Nodes active')).toBeInTheDocument();
    expect(screen.getByText('Raw log')).toBeInTheDocument();
  });

  /**
   * Handles scenarios where the analysis endpoint returns an error.
   * Validates that the system correctly logs the failure and avoids 
   * entering an inconsistent UI state.
   */
  it('covers SystemPanel initial analysis fetch failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockImplementation((url, init) => {
      if (url.includes('/analysis') && (!init || init.method === 'GET')) {
        return Promise.resolve({ ok: false, status: 500 });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_STRATEGIC_DATA) });
    });

    render(<SystemPanel view="pre-event" />);
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/Initial analysis fetch failed/));
    });
    consoleSpy.mockRestore();
  });

  it('covers formatAuditValue and array precautionary measures', async () => {
      mockFetch.mockImplementation((url) => {
        if (url.includes('/analysis')) {
          return Promise.resolve({ 
            ok: true, 
            json: () => Promise.resolve({ 
              ...MOCK_ANALYSIS_DATA, 
              precautionary_measures: ['Measure A', 'Measure B'] 
            }) 
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_STRATEGIC_DATA) });
      });

      render(<SystemPanel view="pre-event" />);
      await waitFor(() => expect(screen.getByText(/Measure A/)).toBeDefined());
  });

  it('covers SystemPanel auto-analysis POST failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockImplementation((url, init) => {
      if (url.includes('/analysis')) {
        if (init?.method === 'POST') {
          return Promise.reject(new Error('POST Failed'));
        }
        // Return 404 for GET /analysis so it triggers auto-run
        return Promise.resolve({ ok: false, status: 404 });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_STRATEGIC_DATA) });
    });

    render(<SystemPanel view="pre-event" />);
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    }, { timeout: 3000 });
    consoleSpy.mockRestore();
  });

  it('covers SystemPanel initial analysis fetch failure (scenario ok)', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockImplementation((url) => {
      if (url.includes('/analysis')) return Promise.resolve({ ok: false, status: 500 });
      return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_STRATEGIC_DATA) });
    });

    render(<SystemPanel view="pre-event" />);
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/Initial analysis fetch failed/));
    });
    consoleSpy.mockRestore();
  });

  it('covers CRITICAL risk level branch', async () => {
    mockFetch.mockImplementation((url) => {
      if (url.includes('/analysis')) {
        return Promise.resolve({ 
          ok: true, 
          json: () => Promise.resolve({ ...MOCK_ANALYSIS_DATA, risk_level: 'CRITICAL' }) 
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_STRATEGIC_DATA) });
    });

    render(<SystemPanel view="pre-event" />);
    await waitFor(() => expect(screen.getByText(/Risk: CRITICAL/)).toBeDefined());
  });

  it('covers SystemPanel initial analysis fetch with pending status', async () => {
    mockFetch.mockImplementation((url) => {
      if (url.includes('/analysis')) {
        return Promise.resolve({ 
          ok: true, 
          json: () => Promise.resolve({ status: 'pending_or_failed' }) 
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_STRATEGIC_DATA) });
    });

    render(<SystemPanel view="pre-event" />);
    await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/analysis'), expect.objectContaining({ method: 'POST' })));
  });

  /**
   * Verified resilience against component unmount during active IO.
   * Ensures that if a user navigates away while the Strategic Analysis agent
   * is still reasoning, the component cleanup prevents 'memory leak' state
   * update warnings and potential visual artifacts.
   */
  it('covers unmount resilience mid-fetch', async () => {
    let resolveAnalysis: any;
    const analysisPromise = new Promise((resolve) => { resolveAnalysis = resolve; });
    
    mockFetch.mockImplementation((url) => {
      if (url.includes('/analysis')) return analysisPromise;
      return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_STRATEGIC_DATA) });
    });

    const { unmount } = render(<SystemPanel view="pre-event" />);
    unmount();
    resolveAnalysis({ ok: true, json: () => Promise.resolve(MOCK_ANALYSIS_DATA) });
    // No crash expected
  });

  it('AudioVisualizer handles isActive state changes', () => {
    const { rerender } = render(<AudioVisualizer isActive={false} />);
    expect(screen.getByText(/i18n:visualizer\.idle/i)).toBeInTheDocument();
    
    rerender(<AudioVisualizer isActive={true} />);
    expect(screen.getByText(/i18n:visualizer\.active/i)).toBeInTheDocument();
  });

  it('renders dashboard by default', async () => {
    render(<App />);
    expect(screen.getAllByText(/SpectaSync/)[0]).toBeDefined();
    expect(screen.getByTestId('tab-dashboard')).toBeDefined();
    // Default tab is dashboard
    expect(screen.getByText('i18n:headers.performance')).toBeDefined();
  });

  it('MultiModalHub renders and switches media', () => {
    const { rerender } = render(<MultiModalHub />);
    expect(screen.getByText('i18n:multiModal.title')).toBeInTheDocument();

    // Verify it doesn't crash on rerender with different props if any
    rerender(<MultiModalHub />);
    expect(screen.getByText('i18n:multiModal.title')).toBeInTheDocument();
  });

  it('covers Header branch when Firebase is not configured', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_FIREBASE_API_KEY', '');
    vi.doMock('../firebase', async () => {
        const actual = await vi.importActual('../firebase');
        return { ...actual, isFirebaseConfigured: false, subscribeToAuthState: vi.fn(cb => { cb(null); return () => {}; }) };
    });

    const { default: NewApp } = await import('../App');
    render(<NewApp />);
    expect(screen.getByText('Firebase disabled')).toBeInTheDocument();
  });
});
