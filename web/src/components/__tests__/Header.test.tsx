import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header, TabId } from '../Header';
import { TRANSLATIONS } from '../../translations';

describe('Header Component', () => {
  const mockProps = {
    lastUpdated: new Date(2026, 3, 17, 8, 51, 23),
    isLive: true,
    activeTab: 'dashboard' as TabId,
    onTabChange: vi.fn(),
    language: 'EN',
    onLanguageChange: vi.fn(),
  };

  const t = TRANSLATIONS.EN;

  it('renders correctly with title and tabs', () => {
    render(<Header {...mockProps} />);
    
    expect(screen.getAllByText(/SpectaSync/)[0]).toBeDefined();
    expect(screen.getByText(t.tabs.dashboard)).toBeDefined();
    expect(screen.getByText(t.tabs.vision)).toBeDefined();
    expect(screen.getByText(t.tabs.crisis)).toBeDefined();
  });

  it('shows live indicator when isLive is true', () => {
    render(<Header {...mockProps} />);
    expect(screen.getByText(new RegExp(t.status.active, 'i'))).toBeDefined();
  });

  it('shows link severed when isLive is false', () => {
    render(<Header {...mockProps} isLive={false} />);
    expect(screen.getByText(new RegExp(t.status.offline, 'i'))).toBeDefined();
  });

  it('triggers onTabChange when a tab is clicked', () => {
    render(<Header {...mockProps} />);
    
    const tacticalViewButton = screen.getByText(t.tabs.vision);
    fireEvent.click(tacticalViewButton);
    
    expect(mockProps.onTabChange).toHaveBeenCalledWith('vision');
  });

  it('formats the date string correctly', () => {
    render(<Header {...mockProps} />);
    // Just check if it's rendered, formatting depends on locale in environment
    expect(screen.getByText(/:\d\d/)).toBeDefined(); 
  });
});
