import { describe, it, expect } from 'vitest';
import { Object3D } from 'three';
import { ThreeModel } from './ThreeModel';
import { LngLatAlt } from '../geometries/LngLatAlt';

describe('ThreeModel constructor', () => {
  it('has default scale {x:1, y:1, z:1}', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    expect(model.getScale()).toEqual({ x: 1, y: 1, z: 1 });
  });

  it('has default rotation {x:0, y:0, z:0}', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    expect(model.getRotation()).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('applies scale from options', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D(), scale: { x: 2, y: 3, z: 4 } });
    expect(model.getScale()).toEqual({ x: 2, y: 3, z: 4 });
  });

  it('applies rotation from options', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D(), rotation: { x: 10, y: 20, z: 30 } });
    expect(model.getRotation()).toEqual({ x: 10, y: 20, z: 30 });
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
});

describe('getScale / setScale', () => {
  it('returns the current scale', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    expect(model.getScale()).toEqual({ x: 1, y: 1, z: 1 });
  });

  it('setScale stores the new values', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    model.setScale(2, 3, 4);
    expect(model.getScale()).toEqual({ x: 2, y: 3, z: 4 });
  });

  it('is chainable', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    expect(model.setScale(1, 1, 1)).toBe(model);
  });
});

describe('getRotation / setRotation', () => {
  it('returns the current rotation', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    expect(model.getRotation()).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('setRotation stores degrees', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    model.setRotation(90, 45, 0);
    expect(model.getRotation()).toEqual({ x: 90, y: 45, z: 0 });
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
