import { describe, it, expect, vi } from 'vitest';
import { Scene, Group, Object3D } from 'three';
import { ThreeLayer } from './ThreeLayer';
import { ThreeLight } from '../lights/ThreeLight';
import { ThreeModel } from '../objects/ThreeModel';
import { ThreeLine } from '../objects/ThreeLine';
import { LngLatAlt } from '../geometries/LngLatAlt';
import { WORLD_SIZE } from '../configs';

function makeMockBounds({ containsResult = true } = {}) {
  return {
    getNorth: () => 90,
    getSouth: () => -90,
    getEast: () => 180,
    getWest: () => -180,
    contains: () => containsResult,
  } as any;
}

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

  it('initializes _objects as empty', () => {
    const layer = new ThreeLayer({ id: 'test' });
    expect(Object.keys(layer._objects)).toHaveLength(0);
  });

  it('creates a Three.js Scene as _scene', () => {
    const layer = new ThreeLayer({ id: 'test' });
    expect(layer._scene).toBeInstanceOf(Scene);
  });

  it('creates a Three.js Group as _world', () => {
    const layer = new ThreeLayer({ id: 'test' });
    expect(layer._world).toBeInstanceOf(Group);
  });

  it('positions _world at WORLD_SIZE/2, WORLD_SIZE/2, 0', () => {
    const layer = new ThreeLayer({ id: 'test' });
    expect(layer._world.position.x).toBe(WORLD_SIZE / 2);
    expect(layer._world.position.y).toBe(WORLD_SIZE / 2);
    expect(layer._world.position.z).toBe(0);
  });

  it('names _world ThreeWorld', () => {
    const layer = new ThreeLayer({ id: 'test' });
    expect(layer._world.name).toBe('ThreeWorld');
  });

  it('adds default light when defaultLight is not specified', () => {
    const layer = new ThreeLayer({ id: 'test' });
    expect(Object.keys(layer._lights)).toHaveLength(1);
  });

  it('adds default light when defaultLight: true', () => {
    const layer = new ThreeLayer({ id: 'test', defaultLight: true });
    expect(Object.keys(layer._lights)).toHaveLength(1);
  });

  it('does not add default light when defaultLight: false', () => {
    const layer = new ThreeLayer({ id: 'test', defaultLight: false });
    expect(Object.keys(layer._lights)).toHaveLength(0);
  });

  it('_map is undefined initially', () => {
    const layer = new ThreeLayer({ id: 'test' });
    expect(layer._map).toBeUndefined();
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

describe('_addObject / _removeObject', () => {
  it('adds a ThreeModel to _objects', () => {
    const layer = new ThreeLayer({ id: 'test' });
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    layer._addObject(model);
    expect(layer._objects[model._id]).toBe(model);
  });

  it('removes a ThreeModel from _objects', () => {
    const layer = new ThreeLayer({ id: 'test' });
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    layer._addObject(model);
    layer._removeObject(model);
    expect(layer._objects[model._id]).toBeUndefined();
  });

  it('adds a ThreeLine to _objects', () => {
    const layer = new ThreeLayer({ id: 'test' });
    const line = new ThreeLine({ lngLatAlts: [new LngLatAlt(0, 0, 0), new LngLatAlt(10, 10, 0)] });
    layer._addObject(line);
    expect(layer._objects[line._id]).toBe(line);
  });

  it('adds object to _world children', () => {
    const layer = new ThreeLayer({ id: 'test', defaultLight: false });
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    layer._addObject(model);
    expect(layer._world.children).toContain(model._object);
  });

  it('removes object from _world children', () => {
    const layer = new ThreeLayer({ id: 'test', defaultLight: false });
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    layer._addObject(model);
    layer._removeObject(model);
    expect(layer._world.children).not.toContain(model._object);
  });
});

describe('_addLight / _removeLight', () => {
  it('adds a ThreeLight to _lights', () => {
    const layer = new ThreeLayer({ id: 'test', defaultLight: false });
    const light = new ThreeLight({ type: 'ambient' });
    layer._addLight(light);
    expect(layer._lights[light._id]).toBe(light);
  });

  it('removes a ThreeLight from _lights', () => {
    const layer = new ThreeLayer({ id: 'test', defaultLight: false });
    const light = new ThreeLight({ type: 'ambient' });
    layer._addLight(light);
    layer._removeLight(light);
    expect(layer._lights[light._id]).toBeUndefined();
  });

  it('adds light to _world children', () => {
    const layer = new ThreeLayer({ id: 'test', defaultLight: false });
    const light = new ThreeLight({ type: 'ambient' });
    layer._addLight(light);
    expect(layer._world.children).toContain(light._light);
  });
});

describe('_updateObjectVisibility — ThreeModel', () => {
  it('sets visible=true when renderOutsideBounds=true and zoom in range', () => {
    const layer = new ThreeLayer({ id: 'test' });
    const model = new ThreeModel({ type: 'custom', object: new Object3D(), lngLatAlt: [10, 10, 0] });
    layer._updateObjectVisibility(model, makeMockBounds(), 10);
    expect(model._object.visible).toBe(true);
  });

  it('sets visible=false when zoom is below minzoom', () => {
    const layer = new ThreeLayer({ id: 'test', minzoom: 10, maxzoom: 20 });
    const model = new ThreeModel({ type: 'custom', object: new Object3D(), lngLatAlt: [10, 10, 0] });
    layer._updateObjectVisibility(model, makeMockBounds(), 5);
    expect(model._object.visible).toBe(false);
  });

  it('sets visible=false when zoom is above maxzoom', () => {
    const layer = new ThreeLayer({ id: 'test', minzoom: 5, maxzoom: 10 });
    const model = new ThreeModel({ type: 'custom', object: new Object3D(), lngLatAlt: [10, 10, 0] });
    layer._updateObjectVisibility(model, makeMockBounds(), 15);
    expect(model._object.visible).toBe(false);
  });

  it('sets visible=false when renderOutsideBounds=false and bounds.contains returns false', () => {
    const layer = new ThreeLayer({ id: 'test', renderOutsideBounds: false });
    const model = new ThreeModel({ type: 'custom', object: new Object3D(), lngLatAlt: [10, 10, 0] });
    layer._updateObjectVisibility(model, makeMockBounds({ containsResult: false }), 10);
    expect(model._object.visible).toBe(false);
  });

  it('does not update visibility when model has no lngLatAlt', () => {
    const layer = new ThreeLayer({ id: 'test' });
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    const initialVisible = model._object.visible;
    layer._updateObjectVisibility(model, makeMockBounds(), 10);
    expect(model._object.visible).toBe(initialVisible);
  });
});

describe('_updateObjectVisibility — ThreeLine', () => {
  it('sets visible=true when renderOutsideBounds=true and zoom in range', () => {
    const layer = new ThreeLayer({ id: 'test' });
    const line = new ThreeLine({ lngLatAlts: [new LngLatAlt(0, 0, 0), new LngLatAlt(10, 10, 0)] });
    layer._updateObjectVisibility(line, makeMockBounds(), 10);
    expect(line._object.visible).toBe(true);
  });

  it('sets visible=false when zoom is below minzoom', () => {
    const layer = new ThreeLayer({ id: 'test', minzoom: 15 });
    const line = new ThreeLine({ lngLatAlts: [new LngLatAlt(0, 0, 0), new LngLatAlt(10, 10, 0)] });
    layer._updateObjectVisibility(line, makeMockBounds(), 5);
    expect(line._object.visible).toBe(false);
  });
});
