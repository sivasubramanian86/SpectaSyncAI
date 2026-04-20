import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { TRANSLATIONS } from '../translations';

describe('App Component', () => {
  const t = TRANSLATIONS.EN;

  it('renders dashboard by default', () => {
    render(<App />);
    expect(screen.getAllByText(/SpectaSync/)[0]).toBeDefined();
    expect(screen.getByText(t.tabs.dashboard)).toBeDefined();
    // Default tab is dashboard
    expect(screen.getByText(t.headers.performance)).toBeDefined();
  });

  it('switches to Tactical View tab', () => {
    render(<App />);
    const tabButton = screen.getByText(t.tabs.vision);
    fireEvent.click(tabButton);
    
    expect(screen.getByText('Tactical Asset Grid')).toBeDefined();
    expect(screen.getByText('Vision Confidence')).toBeDefined();
  });

  it('switches to Crisis Mesh tab', () => {
    render(<App />);
    const tabButton = screen.getByText(t.tabs.crisis);
    fireEvent.click(tabButton);
    
    expect(screen.getByText('Kinetic Risk Velocity')).toBeDefined();
  });

  it('switches to Incident RAG tab', () => {
    render(<App />);
    const tabButton = screen.getByText(t.tabs.intelligence);
    fireEvent.click(tabButton);
    
    expect(screen.getAllByText('Agent Mesh Activity')[0]).toBeDefined();
    expect(screen.getByText('AI Extraction Flow')).toBeDefined();
  });

  it('switches to Settings tab', () => {
    render(<App />);
    // Open More menu for secondary tabs
    fireEvent.click(screen.getByText('More'));
    const tabButton = screen.getByText(t.tabs.settings);
    fireEvent.click(tabButton);
    
    expect(screen.getByText('Tactical Mesh')).toBeDefined();
    expect(screen.getByText('Research Hub')).toBeDefined();
  });

  it('shows critical alert banner when zones are critical', () => {
    // Note: MOCK_ZONES has critical zones by default
    render(<App />);
    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText(new RegExp(t.alerts.critical, 'i'))).toBeDefined();
  });
});
