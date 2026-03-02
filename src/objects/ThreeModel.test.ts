import { describe, it, expect } from 'vitest';
import { Object3D, Group } from 'three';
import { ThreeModel } from './ThreeModel';
import { LngLatAlt } from '../geometries/LngLatAlt';
import { DEG_TO_RAD } from '../configs';

describe('ThreeModel constructor', () => {
  it('_name is ThreeModel', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    expect(model._name).toBe('ThreeModel');
  });

  it('assigns a numeric _id', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    expect(typeof model._id).toBe('number');
  });

  it('_id matches _object.id', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    expect(model._id).toBe(model._object.id);
  });

  it('_object is a Three.js Group', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    expect(model._object).toBeInstanceOf(Group);
  });

  it('_ready is a Promise', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    expect(model._ready).toBeInstanceOf(Promise);
  });

  it('has default scale {x:1, y:1, z:1}', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    expect(model._scale).toEqual({ x: 1, y: 1, z: 1 });
  });

  it('has default rotation {x:0, y:0, z:0}', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    expect(model._rotation).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('applies scale from options', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D(), scale: { x: 2, y: 3, z: 4 } });
    expect(model._scale).toEqual({ x: 2, y: 3, z: 4 });
  });

  it('applies rotation from options', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D(), rotation: { x: 10, y: 20, z: 30 } });
    expect(model._rotation).toEqual({ x: 10, y: 20, z: 30 });
  });

  it('_layer is undefined initially', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    expect(model._layer).toBeUndefined();
  });
});

describe('getLngLatAlt / setLngLatAlt', () => {
  it('returns null when not set', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    expect(model.getLngLatAlt()).toBeNull();
  });

  it('stores and returns LngLatAlt after setLngLatAlt', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    model.setLngLatAlt([10, 20, 300]);
    const result = model.getLngLatAlt();
    expect(result).toBeInstanceOf(LngLatAlt);
    expect(result!.lng).toBe(10);
    expect(result!.lat).toBe(20);
    expect(result!.alt).toBe(300);
  });

  it('accepts object format', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    model.setLngLatAlt({ lng: 5, lat: 15, alt: 100 });
    expect(model.getLngLatAlt()!.lng).toBe(5);
  });

  it('is chainable', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    expect(model.setLngLatAlt([0, 0, 0])).toBe(model);
  });

  it('updates _object.position after set', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    model.setLngLatAlt([10, 20, 0]);
    // Position is set in projected space; not zero for non-origin coords
    const pos = model._object.position;
    expect(isNaN(pos.x)).toBe(false);
    expect(isNaN(pos.y)).toBe(false);
  });
});

describe('getScale / setScale', () => {
  it('returns the current _scale', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    expect(model.getScale()).toEqual({ x: 1, y: 1, z: 1 });
  });

  it('setScale stores the new values', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    model.setScale(2, 3, 4);
    expect(model._scale).toEqual({ x: 2, y: 3, z: 4 });
    expect(model.getScale()).toEqual({ x: 2, y: 3, z: 4 });
  });

  it('is chainable', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    expect(model.setScale(1, 1, 1)).toBe(model);
  });

  it('applies latScale to _object.scale when lngLatAlt is set', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    model.setLngLatAlt([0, 0, 0]);
    model.setScale(1, 1, 1);
    // projectedUnitsPerMeter(0) is a small non-1 number
    expect(model._object.scale.x).not.toBe(1);
    expect(model._object.scale.x).toBeGreaterThan(0);
  });
});

describe('getRotation / setRotation', () => {
  it('returns the current _rotation', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    expect(model.getRotation()).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('setRotation stores degrees in _rotation', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    model.setRotation(90, 45, 0);
    expect(model._rotation).toEqual({ x: 90, y: 45, z: 0 });
  });

  it('converts degrees to radians on _object.rotation', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    model.setRotation(90, 0, 0);
    expect(model._object.rotation.x).toBeCloseTo(90 * DEG_TO_RAD, 10);
    expect(model._object.rotation.y).toBeCloseTo(0, 10);
  });

  it('is chainable', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    expect(model.setRotation(0, 0, 0)).toBe(model);
  });
});

describe('getPopup / setPopup', () => {
  it('returns null initially', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    expect(model.getPopup()).toBeNull();
  });

  it('setPopup stores a popup object', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    const fakePopup = { remove: () => {} } as any;
    model.setPopup(fakePopup);
    expect(model.getPopup()).toBe(fakePopup);
  });

  it('setPopup(null) clears the popup', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    const fakePopup = { remove: () => {} } as any;
    model.setPopup(fakePopup);
    model.setPopup(null);
    expect(model.getPopup()).toBeNull();
  });

  it('is chainable', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    expect(model.setPopup(null)).toBe(model);
  });
});
