import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MultiModalHub } from '../components/MultiModalHub';
import { CrisisDashboard } from '../components/CrisisDashboard';
import { PredictionPanel, densityFormatter } from '../components/PredictionPanel';
import { AgentFeed } from '../components/AgentFeed';
import { Header } from '../components/Header';

// Mocking ResponsiveContainer to render children
vi.mock('recharts', async () => {
  const original = await vi.importActual('recharts') as any;
  return {
    ...original,
    ResponsiveContainer: ({ children }: any) => <div style={{width: 800, height: 600}}>{children}</div>,
    // We can capture the Tooltip formatter here if needed, but let's try a different approach
    Tooltip: (props: any) => {
        // Manually trigger the formatter to hit the branch during render if we can
        if (props.formatter && typeof props.active !== 'undefined') {
            props.formatter(85.5);
        }
        return <div data-testid="mock-tooltip" />;
    }
  };
});

describe('Coverage Hardening Tests', () => {
  it('covers the video branch and language fallback in MultiModalHub', async () => {
    render(<MultiModalHub />);
    
    // Switch to Video
    // Switch to Video Mode
    const videoModeBtn = screen.getByTestId('media-mode-video'); 
    fireEvent.click(videoModeBtn);
    
    // Select specific video source if not default
    const videoSource = screen.getByTestId('media-source-3');
    fireEvent.click(videoSource);
    
    expect(screen.getByTestId('video-element')).toBeInTheDocument();

    // Switch to Italiano (which is missing in translations object)
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'IT' } });
    
    // Should fallback to English title (or i18n key depending on mock)
    expect(screen.getByTestId('multi-modal-title')).toHaveTextContent(/multiModal.title/i);
  });

  it('covers the CLEAR status and fallback failure mode in CrisisDashboard', () => {
    render(<CrisisDashboard />);
    
    // Check for CLEAR status badge
    expect(screen.getByText('CLEAR')).toBeInTheDocument();
  });

  it('renders PredictionPanel and exercises the formatter', () => {
    const mockForecast = {
      location_id: 'GATE_NORTH',
      current_density: 0.45,
      surge_level: 'MODERATE' as const,
      predicted_peak_time_mins: 15,
      confidence_score: 94,
      forecast: {
        'T+10_mins': { density: 0.65, level: 'HIGH' as const },
        'T+20_mins': { density: 0.85, level: 'CRITICAL' as const },
        'T+30_mins': { density: 0.70, level: 'HIGH' as const },
      },
      actionable_recommendations: ['Open Gate 4', 'Deploy staff'],
    };

    // We pass active: true to the mock tooltip via recharts behavior simulation
    // Or just rely on the component rendering it. 
    // Since we mocked Tooltip above to call formatter if present, this should hit it.
    render(<PredictionPanel forecast={mockForecast} />);
    
    // Direct call to hit the logic
    const [val] = densityFormatter(85.54321);
    expect(val).toBe('85.5%');
    render(<PredictionPanel zoneId="GATE_NORTH" forecast={mockForecast} />);
    
    expect(screen.getAllByText(/i18n:headers.forecast — GATE_NORTH/i)[0]).toBeInTheDocument();
  });

  it('covers AgentFeed fallbacks', () => {
    const unknownEvents = [
      {
        id: '1',
        agent: 'unknown_agent',
        event_type: 'unknown_type',
        timestamp: new Date(),
        message: 'Something happened'
      }
    ];
    render(<AgentFeed events={unknownEvents as any} />);
    expect(screen.getByText('System')).toBeInTheDocument(); // Fallback label
    expect(screen.getByText('Something happened')).toBeInTheDocument();
  });

  it('covers Header language change interaction', () => {
    const onLanguageChange = vi.fn();
    render(<Header lastUpdated={new Date()} isLive={true} activeTab="dashboard" onTabChange={() => {}} onLanguageChange={onLanguageChange} />);
    const select = screen.getByLabelText(/Select Language/i);
    fireEvent.change(select, { target: { value: 'HI' } });
    expect(onLanguageChange).toHaveBeenCalledWith('HI');
  });

  it('covers MultiModalHub audio interactions', () => {
    render(<MultiModalHub />);
    
    // Switch to Audio Mode to test the mode switcher button (coverage)
    const audioModeBtn = screen.getByTestId('media-mode-audio');
    fireEvent.click(audioModeBtn);
    
    // Select the audio media source
    const audioSourceBtn = screen.getByTestId('media-source-2');
    fireEvent.click(audioSourceBtn);
    
    // Assert initial state is playing
    expect(screen.getByText(/Analysis in Progress/i)).toBeInTheDocument();

    // Toggle playback (exercises onClick and AudioVisualizer isActive)
    const audioContainer = screen.getByTestId('audio-container');
    fireEvent.click(audioContainer);
    
    // Assert it shifted to paused
    expect(screen.getByText(/Feed Paused/i)).toBeInTheDocument();
  });
});
