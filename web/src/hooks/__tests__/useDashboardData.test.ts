import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDashboardData } from '../useDashboardData';

describe('useDashboardData Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with mock data', () => {
    const { result } = renderHook(() => useDashboardData());
    
    expect(result.current.zones.length).toBeGreaterThan(0);
    expect(result.current.agentFeed.length).toBe(5);
    expect(result.current.isLive).toBe(true);
  });

  it('updates state periodically', () => {
    const { result } = renderHook(() => useDashboardData());
    const initialLastUpdated = result.current.lastUpdated;
    const initialFeedLength = result.current.agentFeed.length;

    // Advance time by 4 seconds (interval is 3s)
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(result.current.lastUpdated.getTime()).toBeGreaterThan(initialLastUpdated.getTime());
    expect(result.current.agentFeed.length).toBe(initialFeedLength + 1);
  });

  it('caps agent feed at 20 events', () => {
    const { result } = renderHook(() => useDashboardData());

    act(() => {
      // Advance by 60 seconds (20 intervals of 3s)
      vi.advanceTimersByTime(60000);
    });

    expect(result.current.agentFeed.length).toBe(20);
  });

  it('varies density and reclassifies levels', () => {
    const { result } = renderHook(() => useDashboardData());
    
    // We can't easily predict the random noise, but we can verify it changes
    const initialDensities = result.current.zones.map(z => z.density);
    
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    const newDensities = result.current.zones.map(z => z.density);
    expect(newDensities).not.toEqual(initialDensities);
  });
});
