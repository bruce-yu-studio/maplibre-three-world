import { describe, it, expect } from 'vitest';
import { LngLatAlt } from './LngLatAlt';

describe('LngLatAlt constructor', () => {
  it('stores valid coordinates correctly', () => {
    const coord = new LngLatAlt(10, 20, 300);
    expect(coord.lng).toBe(10);
    expect(coord.lat).toBe(20);
    expect(coord.alt).toBe(300);
  });

  it('throws when lat > 90', () => {
    expect(() => new LngLatAlt(0, 91, 0)).toThrow();
  });

  it('throws when lat < -90', () => {
    expect(() => new LngLatAlt(0, -91, 0)).toThrow();
  });

  it('throws when input contains NaN', () => {
    expect(() => new LngLatAlt(NaN, 0, 0)).toThrow();
    expect(() => new LngLatAlt(0, NaN, 0)).toThrow();
    expect(() => new LngLatAlt(0, 0, NaN)).toThrow();
  });
});

describe('LngLatAlt.convert', () => {
  it('converts [lng, lat] array to instance', () => {
    const coord = LngLatAlt.convert([10, 20]);
    expect(coord.lng).toBe(10);
    expect(coord.lat).toBe(20);
    expect(coord.alt).toBe(0);
  });

  it('converts [lng, lat, alt] array to instance', () => {
    const coord = LngLatAlt.convert([10, 20, 300]);
    expect(coord.lng).toBe(10);
    expect(coord.lat).toBe(20);
    expect(coord.alt).toBe(300);
  });

  it('converts { lng, lat } object to instance', () => {
    const coord = LngLatAlt.convert({ lng: 10, lat: 20 });
    expect(coord.lng).toBe(10);
    expect(coord.lat).toBe(20);
  });

  it('supports lon as alias for lng', () => {
    const coord = LngLatAlt.convert({ lon: 10, lat: 20 });
    expect(coord.lng).toBe(10);
    expect(coord.lat).toBe(20);
  });

  it('converts { lng, lat, alt } object with alt correctly', () => {
    const coord = LngLatAlt.convert({ lng: 10, lat: 20, alt: 300 });
    expect(coord.alt).toBe(300);
  });

  it('throws on invalid input', () => {
    expect(() => LngLatAlt.convert({ lat: 20 } as any)).toThrow();
  });

  it('returns the same instance when given a LngLatAlt', () => {
    const original = new LngLatAlt(10, 20, 0);
    expect(LngLatAlt.convert(original)).toBe(original);
  });
});

describe('LngLatAlt.toArray', () => {
  it('returns [lng, lat, alt] tuple', () => {
    const coord = new LngLatAlt(10, 20, 300);
    expect(coord.toArray()).toEqual([10, 20, 300]);
  });
});
