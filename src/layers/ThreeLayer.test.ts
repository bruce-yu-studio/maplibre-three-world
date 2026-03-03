import { describe, it, expect, vi } from 'vitest';
import { ThreeLayer } from './ThreeLayer';

describe('ThreeLayer constructor', () => {
  it('stores the id', () => {
    const layer = new ThreeLayer({ id: 'my-layer' });
    expect(layer.id).toBe('my-layer');
  });

  it('defaults minzoom to 0', () => {
    const layer = new ThreeLayer({ id: 'test' });
    expect(layer.minzoom).toBe(0);
  });

  it('defaults maxzoom to 24', () => {
    const layer = new ThreeLayer({ id: 'test' });
    expect(layer.maxzoom).toBe(24);
  });

  it('applies provided minzoom and maxzoom', () => {
    const layer = new ThreeLayer({ id: 'test', minzoom: 5, maxzoom: 15 });
    expect(layer.minzoom).toBe(5);
    expect(layer.maxzoom).toBe(15);
  });

  it('type is custom', () => {
    const layer = new ThreeLayer({ id: 'test' });
    expect(layer.type).toBe('custom');
  });

  it('renderingMode is 3d', () => {
    const layer = new ThreeLayer({ id: 'test' });
    expect(layer.renderingMode).toBe('3d');
  });
});

describe('event system: on / off / fire', () => {
  it('registers and fires a callback', () => {
    const layer = new ThreeLayer({ id: 'test' });
    const cb = vi.fn();
    layer.on('click', cb);
    layer.fire('click', { type: 'click', target: null });
    expect(cb).toHaveBeenCalledOnce();
    expect(cb).toHaveBeenCalledWith({ type: 'click', target: null });
  });

  it('off removes the callback so it no longer fires', () => {
    const layer = new ThreeLayer({ id: 'test' });
    const cb = vi.fn();
    layer.on('click', cb);
    layer.off('click', cb);
    layer.fire('click', { type: 'click', target: null });
    expect(cb).not.toHaveBeenCalled();
  });

  it('fire does nothing when no listeners are registered', () => {
    const layer = new ThreeLayer({ id: 'test', defaultLight: false });
    expect(() => layer.fire('click', { type: 'click', target: null })).not.toThrow();
  });

  it('supports multiple callbacks for the same event', () => {
    const layer = new ThreeLayer({ id: 'test' });
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    layer.on('click', cb1);
    layer.on('click', cb2);
    layer.fire('click', { type: 'click', target: null });
    expect(cb1).toHaveBeenCalledOnce();
    expect(cb2).toHaveBeenCalledOnce();
  });

  it('off does not affect other listeners on the same event', () => {
    const layer = new ThreeLayer({ id: 'test' });
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    layer.on('click', cb1);
    layer.on('click', cb2);
    layer.off('click', cb1);
    layer.fire('click', { type: 'click', target: null });
    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).toHaveBeenCalledOnce();
  });

  it('fires different event types independently', () => {
    const layer = new ThreeLayer({ id: 'test' });
    const clickCb = vi.fn();
    const mouseoverCb = vi.fn();
    layer.on('click', clickCb);
    layer.on('mouseover', mouseoverCb);
    layer.fire('click', { type: 'click', target: null });
    expect(clickCb).toHaveBeenCalledOnce();
    expect(mouseoverCb).not.toHaveBeenCalled();
  });
});
