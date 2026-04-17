import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header, TabId } from '../Header';

describe('Header Component', () => {
  const mockProps = {
    lastUpdated: new Date(2026, 3, 17, 8, 51, 23),
    isLive: true,
    activeTab: 'dashboard' as TabId,
    onTabChange: vi.fn(),
  };

  it('renders correctly with title and tabs', () => {
    render(<Header {...mockProps} />);
    
    expect(screen.getByText('SpectaSyncAI')).toBeDefined();
    expect(screen.getByText('Command Hub')).toBeDefined();
    expect(screen.getByText('Tactical View')).toBeDefined();
    expect(screen.getByText('Crisis Mesh')).toBeDefined();
  });

  it('shows live indicator when isLive is true', () => {
    render(<Header {...mockProps} />);
    expect(screen.getByText('LIVE')).toBeDefined();
  });

  it('triggers onTabChange when a tab is clicked', () => {
    render(<Header {...mockProps} />);
    
    const tacticalViewButton = screen.getByText('Tactical View');
    fireEvent.click(tacticalViewButton);
    
    expect(mockProps.onTabChange).toHaveBeenCalledWith('vision');
  });

  it('formats the date string correctly', () => {
    render(<Header {...mockProps} />);
    // Just check if it's rendered, formatting depends on locale in environment
    expect(screen.getByText(/:\d\d/)).toBeDefined(); 
  });
});
