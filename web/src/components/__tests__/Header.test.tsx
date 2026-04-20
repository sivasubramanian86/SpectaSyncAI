import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Header, TabId } from '../Header';


describe('Header Component', () => {
  const mockProps = {
    lastUpdated: new Date(2026, 3, 17, 8, 51, 23),
    isLive: true,
    activeTab: 'dashboard' as TabId,
    onTabChange: vi.fn(),
    language: 'EN',
    onLanguageChange: vi.fn(),
  };



  it('renders correctly with title and tabs', () => {
    render(<Header {...mockProps} />);
    expect(screen.getAllByText(/SpectaSync/)[0]).toBeDefined();
    expect(screen.getByTestId('tab-dashboard')).toBeDefined();
    expect(screen.getByTestId('tab-vision')).toBeDefined();
    expect(screen.getByTestId('tab-crisis')).toBeDefined();
  });

  it('shows live indicator when isLive is true', () => {
    render(<Header {...mockProps} />);
    expect(screen.getByText(/i18n:status\.active/i)).toBeDefined();
  });

  it('shows link severed when isLive is false', () => {
    render(<Header {...mockProps} isLive={false} />);
    expect(screen.getByText(/i18n:status\.offline/i)).toBeDefined();
  });

  it('triggers onTabChange when a tab is clicked', async () => {
    render(<Header {...mockProps} />);
    
    const tacticalViewButton = screen.getByTestId('tab-vision');
    await act(async () => {
      fireEvent.click(tacticalViewButton);
    });
    
    expect(mockProps.onTabChange).toHaveBeenCalledWith('vision');
  });

  it('navigates to secondary tabs via More menu', async () => {
    render(<Header {...mockProps} />);
    
    // Open More menu
    const moreButton = screen.getByText('More');
    await act(async () => {
      fireEvent.click(moreButton);
    });

    const settingsButton = screen.getByTestId('tab-system');
    await act(async () => {
      fireEvent.click(settingsButton);
    });
    
    expect(mockProps.onTabChange).toHaveBeenCalledWith('system');
  });

  it('formats the date string correctly', () => {
    render(<Header {...mockProps} />);
    // Just check if it's rendered, formatting depends on locale in environment
    expect(screen.getByText(/:\d\d/)).toBeDefined(); 
  });
});
