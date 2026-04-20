import { describe, it, expect } from 'vitest';
import { computeSegmentThresholds, resolveWaypointSegment } from './animate-waypoints';


describe('computeSegmentThresholds', () => {
  it('returns undefined when total path distance is 0', () => {
    const path = [
      { lng: 0, lat: 0, alt: 0 },
      { lng: 0, lat: 0, alt: 0 },
    ];
    expect(computeSegmentThresholds(path)).toBeUndefined();
  });

  it('returns [0, 1] for a single segment', () => {
    const path = [
      { lng: 0, lat: 0, alt: 0 },
      { lng: 1, lat: 0, alt: 0 },
    ];
    const result = computeSegmentThresholds(path);
    expect(result).toHaveLength(2);
    expect(result![0]).toBe(0);
    expect(result![1]).toBeCloseTo(1);
  });

  it('allocates thresholds proportional to segment distances for two equal segments', () => {
    const path = [
      { lng: 0, lat: 0, alt: 0 },
      { lng: 5, lat: 0, alt: 0 },
      { lng: 10, lat: 0, alt: 0 },
    ];
    const result = computeSegmentThresholds(path);
    expect(result).toHaveLength(3);
    expect(result![0]).toBe(0);
    expect(result![1]).toBeCloseTo(0.5);
    expect(result![2]).toBeCloseTo(1);
  });

  it('allocates thresholds proportional to segment distances for unequal segments', () => {
    // First segment is twice as long as the second.
    const path = [
      { lng: 0, lat: 0, alt: 0 },
      { lng: 10, lat: 0, alt: 0 },
      { lng: 15, lat: 0, alt: 0 },
    ];
    const result = computeSegmentThresholds(path);
    expect(result).toHaveLength(3);
    expect(result![0]).toBe(0);
    // First segment (~667 km) covers roughly 2/3 of the total.
    expect(result![1]).toBeCloseTo(2 / 3, 1);
    expect(result![2]).toBeCloseTo(1);
  });
});


describe('resolveWaypointSegment', () => {
  it('returns segment 0 with localT=0 at t=0', () => {
    const { segmentIndex, localT } = resolveWaypointSegment(0, [0, 0.5, 1], 2);
    expect(segmentIndex).toBe(0);
    expect(localT).toBeCloseTo(0);
  });

  it('returns segment 0 at t=0.25 with equal thresholds', () => {
    const { segmentIndex, localT } = resolveWaypointSegment(0.25, [0, 0.5, 1], 2);
    expect(segmentIndex).toBe(0);
    expect(localT).toBeCloseTo(0.5);
  });

  it('returns segment 1 at t=0.75 with equal thresholds', () => {
    const { segmentIndex, localT } = resolveWaypointSegment(0.75, [0, 0.5, 1], 2);
    expect(segmentIndex).toBe(1);
    expect(localT).toBeCloseTo(0.5);
  });

  it('returns last segment with localT=1 at t=1', () => {
    const { segmentIndex, localT } = resolveWaypointSegment(1, [0, 0.5, 1], 2);
    expect(segmentIndex).toBe(1);
    expect(localT).toBeCloseTo(1);
  });

  it('returns localT=1 when segStart equals segEnd (degenerate segment)', () => {
    const { localT } = resolveWaypointSegment(1, [0, 1, 1], 2);
    expect(localT).toBe(1);
  });
});
