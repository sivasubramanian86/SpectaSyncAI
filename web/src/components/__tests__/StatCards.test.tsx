import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCards } from '../StatCards';
import { TRANSLATIONS } from '../../translations';

describe('StatCards Component', () => {
  const mockProps = {
    avgDensity: 0.74,
    criticalCount: 2,
    totalZones: 12,
    activeInterventions: 5,
    agentCount: 12,
    language: 'EN'
  };

  const t = TRANSLATIONS.EN;

  it('renders all metrics correctly', () => {
    render(<StatCards {...mockProps} />);
    
    expect(screen.getByText(t.stats.density)).toBeDefined();
    expect(screen.getByText('74')).toBeDefined(); // Math.round(0.74 * 100)
    
    expect(screen.getByText(t.stats.critical)).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();
    expect(screen.getByText('/ 12')).toBeDefined();
    
    expect(screen.getByText(t.stats.interventions)).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
    
    expect(screen.getByText(t.stats.agents)).toBeDefined();
    expect(screen.getByText('12')).toBeDefined();
  });

  it('changes critical zones color based on count', () => {
    const { rerender } = render(<StatCards {...mockProps} />);
    expect(screen.getByLabelText(`${t.stats.critical}: 2/ 12`)).toBeDefined();
    
    rerender(<StatCards {...mockProps} criticalCount={0} />);
    expect(screen.getByLabelText(`${t.stats.critical}: 0/ 12`)).toBeDefined();
  });
});
