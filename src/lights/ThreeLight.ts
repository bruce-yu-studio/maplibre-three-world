import type { ColorRepresentation } from 'three';
import type { ThreeLayer } from '../layers/ThreeLayer';
import { Group, AmbientLight, DirectionalLight } from 'three';


/**
 * Represents a 3D vector for directional light position.
 */
interface LightVector {
  x: number;
  y: number;
  z: number;
}


/**
 * Options to create a ThreeLight.
 * Can be either:
 * - 'default': a pre-configured combination of ambient and directional lights.
 * - 'ambient': a single ambient light.
 * - 'direction': a single directional light with optional vector.
 */
export type ThreeLightOptions = {
  type: 'default';
} | {
  type: 'ambient';
  color?: ColorRepresentation;
  intensity?: number;
} | {
  type: 'direction';
  color?: ColorRepresentation;
  intensity?: number;
  vector?: LightVector;
}



/**
 * Wrapper class for Three.js lights in a ThreeLayer context.
 * Supports ambient lights, directional lights, and a default light setup.
 */
export class ThreeLight {
  /**
   * Unique identifier of this Three.js object.
   * @type {number}
   * @private
   */
  _id: number;
  /**
   * Root Three.js Group containing the light and its children.
   * @type {Group}
   * @private
   */
  _light: Group;
  /**
   * Reference to the ThreeLayer this object is added to.
   * @type {ThreeLayer|undefined}
   * @private
   */
  _layer?: ThreeLayer;


  /**
   * Constructs a new ThreeLight instance.
   * @param {ThreeLightOptions} options - Options to create the light.
   */
  constructor(options: ThreeLightOptions) {
    this._light = new Group();
    this._id = this._light.id;

    switch (options.type) {
      case 'default':
        this._addDefaultLight();
        break;
      case 'ambient':
        this._addAmbientLight(options.color, options.intensity);
        break;
      case 'direction':
        this._addAmbientLight(options.color, options.intensity);
        break;
    }
  }


  /**
   * Adds a default light setup: one ambient and two directional lights.
   * Useful for quick scenes with simple lighting.
   * @private
   */
  _addDefaultLight(): void {
    const ambientLight = new AmbientLight(0xffffff, 0.75);
    this._light.add(ambientLight);

    const directionFrontLight = new DirectionalLight(0xffffff, 0.25);
    directionFrontLight.position.set(-30, 100, -100);
    this._light.add(directionFrontLight);

    const directionBackLight = new DirectionalLight(0xffffff, 0.25);
    directionBackLight.position.set(30, 100, 100);
    this._light.add(directionBackLight);
  }


  /**
   * Adds a single ambient light to the group.
   * @param {ColorRepresentation} [color] - Color of the light.
   * @param {number} [intensity] - Light intensity.
   * @private
   */
  _addAmbientLight(color?: ColorRepresentation, intensity?: number): void {
    const ambientLight = new AmbientLight(color, intensity);
    this._light.add(ambientLight);
  }


  /**
   * Adds a single directional light to the group.
   * @param {ColorRepresentation} [color] - Color of the light.
   * @param {number} [intensity] - Light intensity.
   * @param {LightVector} [vector] - Optional position vector for the light.
   * @private
   */
  _addDirectionLight(color?: ColorRepresentation, intensity?: number, vector?: LightVector): void {
    const directionLight = new DirectionalLight(color, intensity);
    vector && directionLight.position.set(vector.x, vector.y, vector.z);
    this._light.add(directionLight);
  }


  /**
   * Adds the light to a ThreeLayer.
   * @param {ThreeLayer} threeLayer
   * @returns {this}
   */
  addTo(threeLayer: ThreeLayer): this {
    this._layer = threeLayer;
    this._layer._addLight(this);
    this._layer.fire('addlight', {
      type: 'addlight',
      target: this,
    });
    return this;
  }


  /**
   * Removes the light from its layer.
   * @returns {this}
   */
  remove(): this {
    if (this._layer) {
      this._layer._removeLight(this);
      this._layer.fire('removelight', {
        type: 'removelight',
        target: this,
      });
      this._layer = undefined;
    }
    return this;
  }


}
