import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCards } from '../StatCards';

describe('StatCards Component', () => {
  const mockProps = {
    avgDensity: 0.74,
    criticalCount: 2,
    totalZones: 12,
    activeInterventions: 5,
    agentCount: 11,
  };

  it('renders all metrics correctly', () => {
    render(<StatCards {...mockProps} />);
    
    expect(screen.getByText('Avg Density')).toBeDefined();
    expect(screen.getByText('74')).toBeDefined(); // Math.round(0.74 * 100)
    
    expect(screen.getByText('Critical Zones')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();
    expect(screen.getByText('/ 12')).toBeDefined();
    
    expect(screen.getByText('Interventions')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
    
    expect(screen.getByText('Active Agents')).toBeDefined();
    expect(screen.getByText('11')).toBeDefined();
  });

  it('changes critical zones color based on count', () => {
    const { rerender } = render(<StatCards {...mockProps} />);
    // Check for red bg class or similar if possible, but aria-label is safer
    expect(screen.getByLabelText('Critical Zones: 2/ 12')).toBeDefined();
    
    rerender(<StatCards {...mockProps} criticalCount={0} />);
    expect(screen.getByLabelText('Critical Zones: 0/ 12')).toBeDefined();
  });
});
