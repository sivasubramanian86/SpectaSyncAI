import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import App from '../App';

describe('App Component', () => {

  it('renders dashboard by default', () => {
    render(<App />);
    expect(screen.getByTestId('tab-dashboard')).toBeDefined();
    // Check for some dashboard specific text
    expect(screen.getByText('i18n:headers.performance')).toBeDefined();
  });

  it('switches to Tactical View tab', async () => {
    render(<App />);
    const tacticalViewButton = screen.getByTestId('tab-vision');
    await act(async () => {
      fireEvent.click(tacticalViewButton);
    });
    
    expect(screen.getByText('Tactical Asset Grid')).toBeDefined();
    expect(screen.getByText('Vision Confidence')).toBeDefined();
  });

  it('switches to Crisis Mesh tab', async () => {
    render(<App />);
    const tabButton = screen.getByTestId('tab-crisis');
    await act(async () => {
      fireEvent.click(tabButton);
    });
    
    expect(screen.getByText('Kinetic Risk Velocity')).toBeDefined();
  });

  it('switches to Incident RAG tab', async () => {
    render(<App />);
    const tabButton = screen.getByTestId('tab-intelligence');
    await act(async () => {
      fireEvent.click(tabButton);
    });
    
    expect(screen.getAllByText('Agent Mesh Activity')[0]).toBeDefined();
    expect(screen.getByText('AI Extraction Flow')).toBeDefined();
  });

  it('switches to Settings tab', async () => {
    render(<App />);
    // Open More menu for secondary tabs
    await act(async () => {
      fireEvent.click(screen.getByText('More'));
    });
    const tabButton = screen.getByTestId('tab-system');
    await act(async () => {
      fireEvent.click(tabButton);
    });
    
    expect(screen.getByText('Tactical Mesh')).toBeDefined();
    expect(screen.getByText('Research Hub')).toBeDefined();
  });

  it('shows critical alert banner when zones are critical', () => {
    // Note: MOCK_ZONES has critical zones by default
    render(<App />);
    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText(/i18n:alerts\.critical/i)).toBeDefined();
  });

  it('handles language fallback (Line 35)', () => {
    (useTranslation as any).mockReturnValueOnce({
      t: (k: string) => k,
      i18n: { changeLanguage: vi.fn(), language: undefined }
    });
    render(<App />);
    expect(screen.getByTestId('tab-dashboard')).toBeDefined();
  });
});
