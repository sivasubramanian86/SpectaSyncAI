/**
 * @file SystemPanelFull.test.tsx
 * @description Enhanced coverage for SystemPanel logic branches including audit formatting and empty states.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SystemPanel } from '../components/SystemPanel';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

const MOCK_STRATEGIC_DATA = {
  event_name: 'Global Expo 2026',
  total_reservations: 25000,
  venue_capacity: 60000,
  weather_forecast: { temp_c: 24, condition: 'Clear', humidity: 30, precipitation_prob: 0.0 },
  additional_context: 'Ideal conditions.',
  meta: {
     tags: ['critical', 'high-priority'],
     nested: { bool: true }
  }
};

const MOCK_ANALYSIS_DATA = {
  risk_level: 'LOW',
  expected_crowd_peak: 8000,
  weather_impact: 'None',
  pro_con_summary: 'Pros: High flow. Cons: None.',
  precautionary_measures: ['Standard patrols', 'Extra hydration'],
  strategic_recommendation: 'Full capacity deployment.'
};

describe('SystemPanel Comprehensive Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockImplementation((url) => {
      if (url.includes('/mock-data')) return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_STRATEGIC_DATA) });
      if (url.includes('/analysis')) return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_ANALYSIS_DATA) });
      return Promise.resolve({ ok: false });
    });
    
    // Mock localStorage
    const storage: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage[key] || null,
      setItem: (key: string, value: string) => { storage[key] = value; },
    });
  });

  it('renders system view with Tactical Mesh and UI Preferences', () => {
    render(<SystemPanel view="system" />);
    
    expect(screen.getByText('Tactical Mesh')).toBeInTheDocument();
    expect(screen.getByText('UI Preferences')).toBeInTheDocument();
    expect(screen.getByText('Research Hub')).toBeInTheDocument();

    // Check toggles
    const toggles = screen.getAllByRole('button', { pressed: true });
    expect(toggles.length).toBeGreaterThan(2);
    
    fireEvent.click(toggles[0]); // Toggle Advanced RAG
  });

  it('handles theme toggling', () => {
    render(<SystemPanel view="system" />);
    const themeBtn = screen.getByLabelText('Toggle interface visual theme');
    fireEvent.click(themeBtn);
    expect(localStorage.getItem('spectasync-theme')).toBe('light');
    fireEvent.click(themeBtn);
    expect(localStorage.getItem('spectasync-theme')).toBe('dark');
  });

  it('renders About and FAQ views', () => {
    const { rerender } = render(<SystemPanel view="about" />);
    expect(screen.getByText('About SpectaSyncAI')).toBeInTheDocument();
    expect(screen.getByText('Google Ecosystem Integration Audit')).toBeInTheDocument();

    rerender(<SystemPanel view="faq" />);
    expect(screen.getByText('Technical FAQ')).toBeInTheDocument();
    expect(screen.getByText('How does the "Crisis Prevention Mesh" work?')).toBeInTheDocument();
  });

  it('covers Pre-Event error fallback and retry', async () => {
    mockFetch.mockImplementation(() => Promise.reject(new Error('Network failure')));
    
    render(<SystemPanel view="pre-event" />);
    
    await waitFor(() => expect(screen.getByText('Agent Link Severed')).toBeInTheDocument());
    
    // Retry
    mockFetch.mockImplementation((url) => {
      if (url.includes('/mock-data')) return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_STRATEGIC_DATA) });
      if (url.includes('/analysis')) return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_ANALYSIS_DATA) });
      return Promise.resolve({ ok: false });
    });
    
    const retryBtn = screen.getByText('Re-establish Mesh Connection');
    fireEvent.click(retryBtn);
    
    await waitFor(() => expect(screen.getByText('Global Expo 2026')).toBeInTheDocument());
  });

  it('covers formatAuditValue complex branches', async () => {
    const complexAnalysis = {
        ...MOCK_ANALYSIS_DATA,
        expected_crowd_peak: {
            peak_inside_venue: 5000,
            description: 'Mid-morning surge'
        },
        pro_con_summary: {
           key: 'val',
           nested: { bool: true }
        },
        strategic_recommendation: false,
        weather_impact: 99
    };
    
    mockFetch.mockImplementation((url) => {
        if (url.includes('/mock-data')) return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_STRATEGIC_DATA) });
        return Promise.resolve({ ok: true, json: () => Promise.resolve(complexAnalysis) });
    });

    render(<SystemPanel view="pre-event" />);
    await waitFor(() => expect(screen.getByText(/Mid-morning surge/)).toBeInTheDocument());
    expect(screen.getByText(/Inside venue: 5000/)).toBeInTheDocument();
    expect(screen.getByText(/key: val/)).toBeInTheDocument();
    expect(screen.getByText(/bool: true/i)).toBeInTheDocument();
  });

  it('covers scenario fetch HTTP error branch (Line 454)', async () => {
    mockFetch.mockImplementation(() => Promise.resolve({ ok: false, status: 500 }));
    render(<SystemPanel view="pre-event" />);
    await waitFor(() => expect(screen.getByText('Agent Link Severed')).toBeInTheDocument());
  });

  it('covers auto-analysis HTTP error branch (Line 482)', async () => {
    mockFetch.mockImplementation((url, options) => {
      if (url.includes('/mock-data')) return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_STRATEGIC_DATA) });
      if (url.includes('/analysis') && options?.method === 'POST') return Promise.resolve({ ok: false, status: 500 });
      return Promise.resolve({ ok: false, status: 404 }); // initial GET fails
    });
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<SystemPanel view="pre-event" />);
    await waitFor(() => expect(spy).toHaveBeenCalledWith('Auto analysis failed:', expect.anything()));
    spy.mockRestore();
  });

  it('covers manual analysis SUCCESS and edge error paths (Lines 523-525)', async () => {
    mockFetch.mockImplementation((url) => {
      if (url.includes('/mock-data')) return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_STRATEGIC_DATA) });
      return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_ANALYSIS_DATA) });
    });
    
    render(<SystemPanel view="pre-event" />);
    await waitFor(() => expect(screen.getByText('Global Expo 2026')).toBeInTheDocument());
    
    // Test SUCCESS path
    const refreshBtn = screen.getByText('Refresh Strategic Analysis');
    fireEvent.click(refreshBtn);
    expect(screen.getByText('Agent Reasoning...')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Refresh Strategic Analysis')).toBeInTheDocument());
    
    // Test HTTP error path (!res.ok) - Line 523
    mockFetch.mockImplementation((_url, opt) => {
       if (opt?.method === 'POST') return Promise.resolve({ ok: false, status: 500 });
       return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_STRATEGIC_DATA) });
    });
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    fireEvent.click(screen.getByText('Refresh Strategic Analysis'));
    await waitFor(() => expect(spy).toHaveBeenCalledWith('Analysis failed:', expect.anything()));
    spy.mockRestore();
  });

  it('covers formatAuditValue edge cases (Lines 403, 411, 427, 443)', async () => {
     const edgeAnalysis = {
        ...MOCK_ANALYSIS_DATA,
        expected_crowd_peak: {
            estimated_peak_outside_perimeter: [1234, null] // Trigger Line 411 recursively and 403
        },
        pro_con_summary: {}, // Trigger Line 443 fallback
        precautionary_measures: [['NestedMeasure'], null] // Recursive Array (Line 411)
     };

     mockFetch.mockImplementation((url) => {
        if (url.includes('/mock-data')) return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_STRATEGIC_DATA) });
        return Promise.resolve({ ok: true, json: () => Promise.resolve(edgeAnalysis) });
     });

     render(<SystemPanel view="pre-event" />);
     await waitFor(() => expect(screen.getByText(/Outside perimeter: 1234/)).toBeInTheDocument());
     expect(screen.getByText('{}')).toBeInTheDocument();
     expect(screen.getByText('NestedMeasure')).toBeInTheDocument();
  });
});
