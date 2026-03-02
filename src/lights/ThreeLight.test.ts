import { describe, it, expect } from 'vitest';
import { Group, AmbientLight, DirectionalLight } from 'three';
import { ThreeLight } from './ThreeLight';

describe('ThreeLight constructor', () => {
  it('assigns a numeric _id', () => {
    const light = new ThreeLight({ type: 'default' });
    expect(typeof light._id).toBe('number');
  });

  it('creates a Three.js Group as _light', () => {
    const light = new ThreeLight({ type: 'default' });
    expect(light._light).toBeInstanceOf(Group);
  });

  it('_id matches _light.id', () => {
    const light = new ThreeLight({ type: 'default' });
    expect(light._id).toBe(light._light.id);
  });

  it('_layer is undefined initially', () => {
    const light = new ThreeLight({ type: 'default' });
    expect(light._layer).toBeUndefined();
  });

  describe("type: 'default'", () => {
    it('adds 3 children to the light group', () => {
      const light = new ThreeLight({ type: 'default' });
      expect(light._light.children).toHaveLength(3);
    });

    it('first child is an AmbientLight', () => {
      const light = new ThreeLight({ type: 'default' });
      expect(light._light.children[0]).toBeInstanceOf(AmbientLight);
    });

    it('second and third children are DirectionalLights', () => {
      const light = new ThreeLight({ type: 'default' });
      expect(light._light.children[1]).toBeInstanceOf(DirectionalLight);
      expect(light._light.children[2]).toBeInstanceOf(DirectionalLight);
    });

    it('ambient light has intensity 0.75', () => {
      const light = new ThreeLight({ type: 'default' });
      const ambient = light._light.children[0] as AmbientLight;
      expect(ambient.intensity).toBe(0.75);
    });

    it('directional lights have intensity 0.25', () => {
      const light = new ThreeLight({ type: 'default' });
      const front = light._light.children[1] as DirectionalLight;
      const back = light._light.children[2] as DirectionalLight;
      expect(front.intensity).toBe(0.25);
      expect(back.intensity).toBe(0.25);
    });
  });

  describe("type: 'ambient'", () => {
    it('adds exactly 1 child', () => {
      const light = new ThreeLight({ type: 'ambient' });
      expect(light._light.children).toHaveLength(1);
    });

    it('child is an AmbientLight', () => {
      const light = new ThreeLight({ type: 'ambient' });
      expect(light._light.children[0]).toBeInstanceOf(AmbientLight);
    });

    it('uses provided intensity', () => {
      const light = new ThreeLight({ type: 'ambient', intensity: 0.5 });
      const ambient = light._light.children[0] as AmbientLight;
      expect(ambient.intensity).toBe(0.5);
    });
  });

  describe("type: 'direction'", () => {
    it('adds exactly 1 child', () => {
      const light = new ThreeLight({ type: 'direction' });
      expect(light._light.children).toHaveLength(1);
    });

    it('uses provided intensity', () => {
      const light = new ThreeLight({ type: 'direction', intensity: 0.8 });
      const child = light._light.children[0] as AmbientLight;
      expect(child.intensity).toBe(0.8);
    });
  });
});
