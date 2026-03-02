import { describe, it, expect } from 'vitest';
import { Vector3 } from 'three';
import { lngLatAltToVector3 } from './lng-lat-alt-to-vector3';

describe('lngLatAltToVector3', () => {
  it('returns a Three.js Vector3 instance', () => {
    expect(lngLatAltToVector3(0, 0, 0)).toBeInstanceOf(Vector3);
  });

  it('sets z to 0 when alt is 0', () => {
    expect(lngLatAltToVector3(0, 0, 0).z).toBe(0);
  });

  it('sets z > 0 when alt > 0', () => {
    expect(lngLatAltToVector3(0, 0, 100).z).toBeGreaterThan(0);
  });

  it('sets x to negative value for positive longitude', () => {
    expect(lngLatAltToVector3(1, 0, 0).x).toBeLessThan(0);
  });

  it('sets y to negative value for positive latitude', () => {
    expect(lngLatAltToVector3(0, 1, 0).y).toBeLessThan(0);
  });
});
