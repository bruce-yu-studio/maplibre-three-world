import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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


describe('animate / stopAnimate', () => {
  let rafCallbacks: Map<number, FrameRequestCallback>;
  let nextRafId: number;

  beforeEach(() => {
    rafCallbacks = new Map();
    nextRafId = 0;
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      const id = ++nextRafId;
      rafCallbacks.set(id, cb);
      return id;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      rafCallbacks.delete(id);
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function flush(time: number) {
    const callbacks = [...rafCallbacks.values()];
    rafCallbacks.clear();
    callbacks.forEach(cb => cb(time));
  }

  it('animate() returns a Promise', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    const result = model.animate({ rotation: { x: 90 } }, 1000);
    expect(result).toBeInstanceOf(Promise);
    model.stopAnimate();
  });

  it('stopAnimate() resolves the animate() Promise immediately', async () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    const promise = model.animate({ rotation: { x: 90 } }, 1000);
    model.stopAnimate();
    await expect(promise).resolves.toBe(model);
  });

  it('stopAnimate() is chainable', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    model.animate({ rotation: { x: 90 } }, 1000);
    expect(model.stopAnimate()).toBe(model);
  });

  it('stopAnimate() stops further frame updates', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    model.animate({ rotation: { x: 90 } }, 1000);
    flush(0);
    flush(250);  // t=0.25, rotation ≈ 22.5
    model.stopAnimate();
    const frozenRotation = model.getRotation().x;
    flush(500);  // would advance to t=0.5 if animation were still running
    expect(model.getRotation().x).toBeCloseTo(frozenRotation);
  });

  it('animate() resolves when t reaches 1', async () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    const promise = model.animate({ rotation: { x: 90 } }, 1000);
    flush(0);     // sets _animateStartTime = 0, t = 0
    flush(1000);  // t = 1 → resolves
    await expect(promise).resolves.toBe(model);
  });

  it('animate() interpolates rotation toward target at t=0.5', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    model.animate({ rotation: { x: 90 } }, 1000);
    flush(0);    // _animateStartTime = 0
    flush(500);  // t = 0.5 → x should be 45
    expect(model.getRotation().x).toBeCloseTo(45);
  });

  it('animate() only interpolates specified rotation axes', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    model.setRotation(10, 20, 30);
    model.animate({ rotation: { x: 90 } }, 1000);
    flush(0);
    flush(1000);  // t = 1
    expect(model.getRotation().x).toBeCloseTo(90);
    expect(model.getRotation().y).toBeCloseTo(20);
    expect(model.getRotation().z).toBeCloseTo(30);
  });

  it('animate() interpolates scale toward target at t=0.5', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    model.animate({ scale: { x: 2, y: 2, z: 2 } }, 1000);
    flush(0);
    flush(500);  // t = 0.5 → scale.x should be 1.5
    expect(model.getScale().x).toBeCloseTo(1.5);
    expect(model.getScale().y).toBeCloseTo(1.5);
    expect(model.getScale().z).toBeCloseTo(1.5);
  });

  it('animate() snaps to lngLatAlts[0] immediately', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    model.animate({ lngLatAlts: [[5, 0, 0], [10, 0, 0]] }, 1000);
    expect(model.getLngLatAlt()!.lng).toBeCloseTo(5);
    model.stopAnimate();
  });

  it('animate() interpolates position from lngLatAlts[0] to lngLatAlts[1] at t=0.5', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    model.animate({ lngLatAlts: [[0, 0, 0], [10, 0, 0]] }, 1000);
    flush(0);
    flush(500);  // t = 0.5 → lng should be 5
    expect(model.getLngLatAlt()!.lng).toBeCloseTo(5);
  });

  it('animate() reaches the final waypoint at t=1', () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    const promise = model.animate({ lngLatAlts: [[0, 0, 0], [10, 0, 0]] }, 1000);
    flush(0);
    flush(1000);  // t = 1
    expect(model.getLngLatAlt()!.lng).toBeCloseTo(10);
    model.stopAnimate();
    return promise;
  });

  it('starting a new animate() while animating resolves the previous Promise', async () => {
    const model = new ThreeModel({ type: 'custom', object: new Object3D() });
    const first = model.animate({ rotation: { x: 90 } }, 1000);
    flush(0);
    model.animate({ rotation: { x: 0 } }, 1000);
    await expect(first).resolves.toBe(model);
    model.stopAnimate();
  });
});
