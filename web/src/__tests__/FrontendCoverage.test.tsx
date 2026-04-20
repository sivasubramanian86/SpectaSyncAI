import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { SystemPanel } from '../components/SystemPanel';
import { AgentFeed } from '../components/AgentFeed';
import { MultiModalHub } from '../components/MultiModalHub';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

const MOCK_STRATEGIC_DATA = {
  event_name: 'Global Expo 2026',
  total_reservations: 25000,
  venue_capacity: 60000,
  weather_forecast: { temp_c: 24, condition: 'Clear', humidity: 30, precipitation_prob: 0.0 },
  additional_context: 'Ideal conditions.'
};

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

describe('Frontend Coverage Hardening', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockImplementation((url) => {
      if (url.includes('/mock-data')) return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_STRATEGIC_DATA) });
      if (url.includes('/analysis')) return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_ANALYSIS_DATA) });
      return Promise.resolve({ ok: false });
    });
  });

  it('renders Demographic Insights tab', () => {
    render(<App />);
    const tabButton = screen.getByText('Demographics');
    fireEvent.click(tabButton);
    expect(screen.getByText('Vision Demographic Intelligence')).toBeDefined();
    expect(screen.getByText('VULNERABLE')).toBeDefined();
  });

  it('renders Pre-Event Strategic Audit and handles analysis flow', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Strategic Audit'));
    await waitFor(() => expect(screen.getByText('Global Expo 2026')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Risk: LOW')).toBeInTheDocument());
  });

  it('covers SystemPanel auto-run success path', async () => {
    // GET Analysis fails, triggers POST Auto-Run
    mockFetch.mockImplementation((url, options) => {
      if (url.includes('/mock-data')) return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_STRATEGIC_DATA) });
      if (url.includes('/analysis') && options?.method === 'POST') return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_ANALYSIS_DATA) });
      return Promise.resolve({ ok: false });
    });

    render(<SystemPanel view="pre-event" />);
    await waitFor(() => expect(screen.getByText('Global Expo 2026')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Risk: LOW')).toBeInTheDocument());
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

  it('covers MultiModalHub language branches', () => {
    render(<MultiModalHub />);
    const select = screen.getByLabelText('Select Language');
    
    // Test Spanish
    fireEvent.change(select, { target: { value: 'ES' } });
    expect(screen.getByText('Inteligencia Multimodal')).toBeInTheDocument();

    // Test Fallback
    fireEvent.change(select, { target: { value: 'IT' } }); 
    expect(screen.getByText('Multi-Modal Intelligence')).toBeInTheDocument();
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
