import { describe, it, expect } from 'vitest';
import { projectedUnitsPerMeter } from './projected-units-per-meter';
import { WORLD_SIZE, EARTH_CIRCUMFERENCE } from '../constants';

describe('projectedUnitsPerMeter', () => {
  it('returns positive value', () => {
    expect(projectedUnitsPerMeter(0)).toBeGreaterThan(0);
  });

  it('computes correct scale at lat=0', () => {
    const expected = WORLD_SIZE / EARTH_CIRCUMFERENCE;
    expect(projectedUnitsPerMeter(0)).toBeCloseTo(expected, 10);
  });

  it('returns a larger value at lat=45 than at lat=0 due to projection distortion', () => {
    expect(projectedUnitsPerMeter(45)).toBeGreaterThan(projectedUnitsPerMeter(0));
  });
});
