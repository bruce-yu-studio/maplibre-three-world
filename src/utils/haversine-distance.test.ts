import { describe, it, expect } from 'vitest';
import { haversineDistance } from './haversine-distance';
import { EARTH_RADIUS_M } from '../configs';

describe('haversineDistance', () => {
  it('returns 0 for identical points', () => {
    expect(haversineDistance(121, 25, 0, 121, 25, 0)).toBe(0);
  });

  it('computes horizontal distance for two points on the equator', () => {
    const dLngRad = 1 * (Math.PI / 180);
    const expected = EARTH_RADIUS_M * dLngRad;
    expect(haversineDistance(0, 0, 0, 1, 0, 0)).toBeCloseTo(expected, 0);
  });

  it('computes distance across one degree of latitude', () => {
    const dLatRad = 1 * (Math.PI / 180);
    const expected = EARTH_RADIUS_M * dLatRad;
    expect(haversineDistance(0, 0, 0, 0, 1, 0)).toBeCloseTo(expected, 0);
  });

  it('is symmetric regardless of argument order', () => {
    const forward = haversineDistance(121, 25, 10, 122, 26, 20);
    const backward = haversineDistance(122, 26, 20, 121, 25, 10);
    expect(forward).toBeCloseTo(backward, 10);
  });

  it('accounts for altitude difference when horizontal distance is 0', () => {
    expect(haversineDistance(121, 25, 0, 121, 25, 100)).toBeCloseTo(100, 10);
  });

  it('combines horizontal and vertical distance via Euclidean addition', () => {
    const horizontal = haversineDistance(0, 0, 0, 1, 0, 0);
    const withAltitude = haversineDistance(0, 0, 0, 1, 0, 100);
    const expected = Math.sqrt(horizontal ** 2 + 100 ** 2);
    expect(withAltitude).toBeCloseTo(expected, 6);
  });
});
