import { describe, it, expect } from 'vitest';
import { mercatorXFromLng, mercatorYFromLat } from './mercator';

describe('mercatorXFromLng', () => {
  it('returns 0.5 for longitude 0', () => {
    expect(mercatorXFromLng(0)).toBe(0.5);
  });

  it('returns 0 for longitude -180', () => {
    expect(mercatorXFromLng(-180)).toBe(0);
  });

  it('returns 1 for longitude 180', () => {
    expect(mercatorXFromLng(180)).toBe(1);
  });
});

describe('mercatorYFromLat', () => {
  it('returns approximately 0.5 for latitude 0 (equator)', () => {
    expect(mercatorYFromLat(0)).toBeCloseTo(0.5, 10);
  });
});
