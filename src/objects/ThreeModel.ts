import type { Popup } from 'maplibre-gl';
import type { Mesh, Object3D, Event } from 'three';
import type { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import type { ThreeLayer, ThreeEventArgs } from '../layers/ThreeLayer';
import { Group } from 'three';
import { LngLatAlt, LngLatAltLike } from '../geometries/LngLatAlt';
import { lngLatAltToVector3, projectedUnitsPerMeter } from '../utils';
import { DEG_TO_RAD } from '../configs';


/**
 * Scale factors for a ThreeModel along each axis.
 */
export interface ThreeModelScale {
  x: number;
  y: number;
  z: number;
}


/**
 * Rotation angles for a ThreeModel along each axis in degrees.
 */
export interface ThreeModelRotation {
  x: number;
  y: number;
  z: number;
}


/**
 * Options to create a ThreeModel.
 * Can be either:
 * - a URL-based model (GLTF or FBX), or
 * - a customize Three.js object
 */
export type ThreeModelOptions = {
  type: 'gltf';
  url: string;
  lngLatAlt?: LngLatAltLike;
  scale?: ThreeModelScale;
  rotation?: ThreeModelRotation;
} | {
  type: 'fbx';
  url: string;
  lngLatAlt?: LngLatAltLike;
  scale?: ThreeModelScale;
  rotation?: ThreeModelRotation;
} | {
  type: 'custom';
  object: Object3D<Event>;
  lngLatAlt?: LngLatAltLike;
  scale?: ThreeModelScale;
  rotation?: ThreeModelRotation;
} | {
  // ! This will not be supported in the future.
  type: 'mesh';
  mesh: Mesh;
  lngLatAlt?: LngLatAltLike;
  scale?: ThreeModelScale;
  rotation?: ThreeModelRotation;
}


let gltfLoader: GLTFLoader;
let fbxLoader: FBXLoader;


export class ThreeModel {
  _name: 'ThreeModel' = 'ThreeModel';
  /**
   * Unique identifier of this Three.js object.
   * @type {number}
   * @private
   */
  _id: number;
  /**
   * Type of the 3D model: 'gltf', 'fbx', 'custom', or 'cloned'.
   * @type {ThreeModelOptions['type']}
   * @private
   */
  _type: ThreeModelOptions['type'] | 'cloned';
  /**
   * Geographical position of the object in longitude, latitude, and altitude.
   * @type {LngLatAlt|undefined}
   * @private
   */
  _lngLatAlt?: LngLatAlt;
  /**
   * Scale of the model in each axis.
   * @type {ThreeModelScale}
   * @private
   */
  _scale: ThreeModelScale = {
    x: 1,
    y: 1,
    z: 1,
  }
  /**
   * Rotation of the model in degrees.
   * @type {ThreeModelRotation}
   * @private
   */
  _rotation: ThreeModelRotation = {
    x: 0,
    y: 0,
    z: 0,
  }
  /**
   * Root Three.js Group containing the object and its children.
   * @type {Object3D<Event>}
   * @private
   */
  _object: Object3D<Event>;
  /**
   * Reference to the ThreeLayer this object is added to.
   * @type {ThreeLayer|undefined}
   * @private
   */
  _layer?: ThreeLayer;
  /**
   * Optional MapLibre popup associated with this model.
   * @type {Popup|undefined}
   * @private
   */
  _popup?: Popup;
  /**
   * Promise resolved when the model is fully loaded.
   * @type {Promise<this>}
   * @private
   */
  _ready: Promise<this>;


  /**
   * Constructs a new ThreeModel instance.
   * Initializes the model's type, scale, rotation, and optional position.
   * Loads the 3D content based on the specified type ('mesh', 'gltf', or 'fbx').
   * @param {ThreeModelOptions} options - Configuration options for the model.
   */
  constructor(options: ThreeModelOptions) {
    this._type = options.type;
    this._scale.x = options.scale?.x || 1;
    this._scale.y = options.scale?.y || 1;
    this._scale.z = options.scale?.z || 1;
    this._rotation.x = options.rotation?.x || 0;
    this._rotation.y = options.rotation?.y || 0;
    this._rotation.z = options.rotation?.z || 0;

    this._object = new Group();
    this._id = this._object.id;

    if (options.lngLatAlt) {
      this.setLngLatAlt(options.lngLatAlt);
    }

    this.setRotation(
      this._rotation.x,
      this._rotation.y,
      this._rotation.z
    );

    this._ready = this._init(options);
  }


  /**
   * Returns the current position of the object.
   * @returns {LngLatAlt|null}
   */
  getLngLatAlt(): LngLatAlt | null {
    return this._lngLatAlt || null;
  }


  /**
   * Sets the object's geographical position.
   * @param {LngLatAltLike} lngLatAlt - Position in LngLatAlt or compatible format.
   * @returns {this}
   */
  setLngLatAlt(lngLatAlt: LngLatAltLike): this {
    this._lngLatAlt = LngLatAlt.convert(lngLatAlt);
    this.setScale(
      this._scale.x,
      this._scale.y,
      this._scale.z
    );
    this._object.position.copy(
      lngLatAltToVector3(
        this._lngLatAlt.lng,
        this._lngLatAlt.lat,
        this._lngLatAlt.alt
      )
    );
    this._layer?._repaint();
    return this;
  }


  /**
   * Returns the current scale of the object.
   * @returns {ThreeModelScale}
   */
  getScale(): ThreeModelScale {
    return this._scale;
  }


  /**
   * Sets the object's scale.
   * @param {number} x - Scale on X-axis.
   * @param {number} y - Scale on Y-axis.
   * @param {number} z - Scale on Z-axis.
   * @returns {this}
   */
  setScale(x: number, y: number, z: number): this {
    this._scale = { x, y, z };
    if (this._lngLatAlt) {
      const latScale = projectedUnitsPerMeter(this._lngLatAlt.lat);
      this._object.scale.set(
        x * latScale,
        y * latScale,
        z * latScale
      );
    }
    this._layer?._repaint();
    return this;
  }


  /**
   * Returns the popup attached to the model, if any.
   * @returns {Popup|null}
   */
  getRotation(): ThreeModelRotation {
    return this._rotation;
  }


  /**
   * Sets the object's rotation in degrees.
   * @param {number} x - Rotation around X-axis.
   * @param {number} y - Rotation around Y-axis.
   * @param {number} z - Rotation around Z-axis.
   * @returns {this}
   */
  setRotation(x: number, y: number, z: number): this {
    this._rotation = { x, y, z };
    this._object.rotation.set(
      x * DEG_TO_RAD,
      y * DEG_TO_RAD,
      z * DEG_TO_RAD
    );
    this._layer?._repaint();
    return this;
  }


  /**
   * Returns a new ThreeModel with a cloned object attached asynchronously.
   * @returns {ThreeModel}
   */
  clone(): ThreeModel {
    const model = new ThreeModel({
      type: 'custom',
      // @ts-ignore
      object: null,
      lngLatAlt: this._lngLatAlt,
      rotation: this._rotation,
      scale: this._scale,
    });

    model._type = 'cloned';

    this._ready.then(() => {
      const object = this._object.children[0].clone();
      model._loadObject(object);
    });

    return model;
  }


  /**
   * Returns the popup attached to the model, if any.
   * @returns {Popup|null}
   */
  getPopup(): Popup | null {
    return this._popup || null;
  }


  /**
   * Attaches or removes a popup to/from the model.
   * @param {Popup|null|undefined} popup
   * @returns {this}
   */
  setPopup(popup?: Popup | null): this {
    if (this._popup) {
      this._popup.remove();
      this._popup = undefined;
    }
    if (popup) {
      this._popup = popup;
    }
    return this;
  }


  /**
   * Toggles the popup open or closed.
   * @returns {this}
   */
  togglePopup(): this {
    if (!this._popup || !this._lngLatAlt) {
      return this;
    }
    
    if (this._popup.isOpen()) {
      this._popup.remove();
    } else {
      this._popup.setLngLat([
        this._lngLatAlt.lng,
        this._lngLatAlt.lat,
      ]);
      this._popup.addTo(this._layer!._map!);
    }

    return this;
  }


  /**
   * Adds the model to a ThreeLayer.
   * @param {ThreeLayer} threeLayer
   * @returns {this}
   */
  addTo(threeLayer: ThreeLayer): this {
    this._layer = threeLayer;
    this._layer._addObject(this);
    this._layer.on('click', this._modelOnClick);
    this._layer?._repaint();
    return this;
  }


  /**
   * Removes the model from its layer.
   * @returns {this}
   */
  remove(): this {
    if (this._layer) {
      this._layer._removeObject(this);
      this._layer.off('click', this._modelOnClick);
      this._layer.fire('removeobject', {
        type: 'removeobject',
        lngLatAlt: this._lngLatAlt,
        target: this,
      });
      this._layer._repaint();
      this._layer = undefined;
    }
    return this;
  }


  /**
   * Loads the model content based on the given type.
   * @param {ThreeModelOptions} options
   * @returns {Promise<this>}
   * @private
   */
  async _init(options: ThreeModelOptions): Promise<this> {
    switch (options.type) {
      case 'gltf':
        await this._loadGLTF(options.url);
        break;
      case 'fbx':
        await this._loadFBX(options.url);
        break;
      case 'custom':
        options.object && this._loadObject(options.object);
        break;
      // ! This will not be supported in the future.
      case 'mesh':
        console.warn(`Type 'mesh' will not be supported in the future. Please use 'custom' instead.`);
        this._loadObject(options.mesh);
        break;
    }
    return this;
  }


  /**
   * Internal method to load a object into the group.
   * @param {Object3D<Event>} object
   * @returns {void}
   * @private
   */
  _loadObject(object: Object3D<Event>): void {
    this._object.add(object);
    this._layer?._repaint();
    this._onAddObject();
  }


  /**
   * Internal method to asynchronously load a GLTF model.
   * @param {string} url - URL of the GLTF model.
   * @returns {Promise<void>}
   * @private
   */
  async _loadGLTF(url: string): Promise<void> {
    if (!gltfLoader) {
      const module = await import('three/addons/loaders/GLTFLoader.js');
      gltfLoader = new module.GLTFLoader();
    }

    const gltf = await gltfLoader.loadAsync(url);
    this._object.add(gltf.scene);
    this._layer?._repaint();
    this._onAddObject();
  }


  /**
   * Internal method to asynchronously load an FBX model.
   * @param {string} url - URL of the FBX model.
   * @returns {Promise<void>}
   * @private
   */
  async _loadFBX(url: string): Promise<void> {
    if (!fbxLoader) {
      const module = await import('three/addons/loaders/FBXLoader.js');
      fbxLoader = new module.FBXLoader();
    }

    const fbx = await fbxLoader.loadAsync(url);
    this._object.add(fbx);
    this._layer?._repaint();
    this._onAddObject();
  }


  /**
   * Fires an `addobject` event when the model is added to a layer.
   * @returns {void}
   * @private
   */
  _onAddObject(): void {
    this._layer?.fire('addobject', {
      type: 'addobject',
      lngLatAlt: this._lngLatAlt,
      target: this,
    });
  }


  /**
   * Internal click event handler that toggles popup.
   * @param {ThreeEventArgs} event
   * @returns {void}
   * @private
   */
  _modelOnClick = (event: ThreeEventArgs): void => {
    if (event.target === this) {
      this.togglePopup();
    }
  }


}
