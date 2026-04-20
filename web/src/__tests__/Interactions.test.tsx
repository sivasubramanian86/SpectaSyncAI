import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../App';
import { TRANSLATIONS } from '../translations';

/**
 * SpectaSyncAI: User Interaction Integration Tests
 * 
 * Orchestrates high-fidelity simulation of user clickstreams and tab 
 * transitions to verify the integrity of the agentic Command Hub UI.
 */
describe('User Interaction Tests', () => {
  const t = TRANSLATIONS.EN;

  it('interacts with VenueHeatmap zones', () => {
    render(<App />);
    // Switch to Tactical View
    fireEvent.click(screen.getByText(t.tabs.vision));
    
    // Find a zone cell and click it
    const zoneCells = screen.getAllByRole('button').filter(b => b.className.includes('zone-cell'));
    fireEvent.click(zoneCells[0]);
    
    // Check if zone details appear
    expect(screen.getByText('AI Linked')).toBeDefined();
    expect(screen.getByText('Recommended Staff Shift:')).toBeDefined();
    
    // Click again to deselect
    fireEvent.click(zoneCells[0]);
    expect(screen.getByText(/Select a tactical zone/i)).toBeDefined();
  });

  it('interacts with MultiModalHub', async () => {
    vi.useFakeTimers();
    await act(async () => {
      render(<App />);
    });
    
    // Switch to Tactical View (where MultiModalHub is)
    await act(async () => {
      fireEvent.click(screen.getByText(t.tabs.vision));
    });
    
    // Change language to Hindi and verify
    const select = screen.getAllByRole('combobox')[0];
    await act(async () => {
      fireEvent.change(select, { target: { value: 'HI' } });
    });
    expect(screen.getByText(TRANSLATIONS.HI.multiModal.title)).toBeDefined();

    // Iterate languages
    const langs = ['TE', 'TA', 'JA'];
    for (const l of langs) {
      await act(async () => {
        fireEvent.change(select, { target: { value: l } });
      });
    }
    
    // Advance timers
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    
    // Switch to audio media item
    const audioButton = screen.getByText('Panic Signature - Sector 4 (Lyria)');
    await act(async () => {
      fireEvent.click(audioButton);
    });
    expect(screen.getByText('Analysis in Progress: Distress Transients Detected')).toBeDefined();

    // Thermal image (Now Drone Patrol video)
    const thermalButton = screen.getByText('Drone Patrol - North Plaza (VEO)');
    await act(async () => {
      fireEvent.click(thermalButton);
    });
    expect(screen.getAllByText(/Drone Patrol/i).length).toBeGreaterThan(0);
    
    vi.useRealTimers();
  });

  it('interacts with CrisisDashboard agents', () => {
    render(<App />);
    // Switch to Crisis Mesh
    fireEvent.click(screen.getByText(t.tabs.crisis));
    
    // Find an agent card and expand it
    const agentCard = screen.getByText('Perimeter Macro Agent');
    fireEvent.click(agentCard);
    
    expect(screen.getByText('Last Intervention:')).toBeDefined();
    expect(screen.getByText('Analogous Incidents (RAG corpus):')).toBeDefined();
    
    // Close it
    fireEvent.click(agentCard);
    expect(screen.queryByText('Last Intervention:')).toBeNull();
  });

  it('interacts with SystemPanel settings (mock)', () => {
    render(<App />);
    // Open More menu for secondary tabs
    fireEvent.click(screen.getByText('More'));
    const tabButton = screen.getByText(t.tabs.settings);
    fireEvent.click(tabButton);
    
    // Find a toggle (mock)
    const toggles = screen.getAllByRole('generic').filter(el => el.className?.includes('w-10 h-5'));
    if (toggles.length > 0) {
      fireEvent.click(toggles[0]);
    }
    // Just verifying it doesn't crash
    // Switch to About to verify About section
    fireEvent.click(screen.getByText('More'));
    fireEvent.click(screen.getByText(t.tabs.faq)); // Check FAQ first
    fireEvent.click(screen.getByText('More'));
    fireEvent.click(screen.getByText(t.tabs.info));
    expect(screen.getByText(/About SpectaSync/)).toBeDefined();
  });

  it('triggers chart tooltip in PredictionPanel', () => {
    render(<App />);
    // Find the chart container
    const chart = screen.getAllByLabelText(/Surge forecast chart/i)[0];
    fireEvent.mouseOver(chart);
  });
});
