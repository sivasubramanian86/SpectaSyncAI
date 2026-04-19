import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDashboardData } from '../useDashboardData';

describe('useDashboardData Extended Coverage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('covers recommendation branch for low density (Line 168)', () => {
    // Force random to return 0 consistently to drive density down
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    
    const { result } = renderHook(() => useDashboardData());
    
    act(() => {
      // Advance multiple times. 
      // 0.91 -> 0.895 -> 0.88 -> 0.865
      vi.advanceTimersByTime(9000); 
    });
    
    // northGateDensity should reach ~0.865 (<= 0.88)
    expect(result.current.recommendations.length).toBe(3);
    randomSpy.mockRestore();
  });

  it('covers high density branch (Line 168 path 2)', () => {
    // Force random to return 1 to drive density up
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    
    const { result } = renderHook(() => useDashboardData());
    
    act(() => {
      vi.advanceTimersByTime(3000); 
    });
    
    expect(result.current.recommendations.length).toBe(4);
  });
});
