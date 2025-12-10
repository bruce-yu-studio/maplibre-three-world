import type { Popup } from 'maplibre-gl';
import type { Mesh } from 'three';
import type { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import type { ThreeLayer, ThreeEventArgs } from '../layers/ThreeLayer';
import { Group } from 'three';
import { LngLatAlt, LngLatAltLike } from '../geometries/LngLatAlt';
import { lngLatToVector3, projectedUnitsPerMeter } from '../utils';
import { DEG_TO_RAD } from '../configs';


/**
 * Type of 3D model.
 * - 'mesh': a pre-existing Three.js Mesh object.
 * - 'gltf': a GLTF model loaded from URL.
 * - 'fbx': an FBX model loaded from URL.
 */
export type ThreeModelType = 'mesh' | 'gltf' | 'fbx';


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
 * - a pre-existing Three.js Mesh.
 */
export type ThreeModelOptions = {
  url: string;
  type: Exclude<ThreeModelType, 'mesh'>;
  lngLatAlt?: LngLatAltLike;
  scale?: ThreeModelScale;
  rotation?: ThreeModelRotation;
} | {
  mesh: Mesh;
  type: Extract<ThreeModelType, 'mesh'>;
  lngLatAlt?: LngLatAltLike;
  scale?: ThreeModelScale;
  rotation?: ThreeModelRotation;
}


let gltfLoader: GLTFLoader;
let fbxLoader: FBXLoader;


export class ThreeModel {
  /**
   * Unique identifier of this Three.js object.
   * @type {number}
   * @private
   */
  _id: number;
  /**
   * Type of the 3D model: 'mesh', 'gltf', or 'fbx'.
   * @type {ThreeModelType}
   * @private
   */
  _type: ThreeModelType;
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
   * @type {Group}
   * @private
   */
  _object: Group;
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
    this._object.name = 'ThreeModel';

    this._id = this._object.id;

    if (options.lngLatAlt) {
      this.setLngLatAlt(options.lngLatAlt);
    }

    this.setRotation(
      this._rotation.x,
      this._rotation.y,
      this._rotation.z
    );

    switch (options.type) {
      case 'mesh':
        this._loadMesh(options.mesh);
        break;
      case 'gltf':
        this._loadGLTF(options.url);
        break;
      case 'fbx':
        this._loadFBX(options.url);
        break;
    }
  }


  /**
   * Returns the current position of the object.
   * @returns {LngLatAlt|undefined}
   */
  getLngLatAlt(): LngLatAlt | undefined {
    return this._lngLatAlt;
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
      lngLatToVector3(
        this._lngLatAlt.lng,
        this._lngLatAlt.lat,
        this._lngLatAlt.alt
      )
    );
    this._repaint();
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
    if (this._lngLatAlt) {
      const latScale = projectedUnitsPerMeter(this._lngLatAlt.lat);
      this._object.scale.set(
        x * latScale,
        y * latScale,
        z * latScale
      );
    }
    this._repaint();
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
    this._object.rotation.set(
      x * DEG_TO_RAD,
      y * DEG_TO_RAD,
      z * DEG_TO_RAD
    );
    this._repaint();
    return this;
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
    this._repaint();
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
        lngLatAlt: LngLatAlt.convert(this._lngLatAlt!),
        target: this,
      });
      this._layer = undefined;
    }
    this._repaint();
    return this;
  }


  /**
   * Internal method to load a mesh object into the group.
   * @param {Mesh} mesh
   * @returns {void}
   * @private
   */
  _loadMesh(mesh: Mesh): void {
    this._object.add(mesh);
    this._repaint();

    this._layer?.fire('addobject', {
      type: 'addobject',
      lngLatAlt: LngLatAlt.convert(this._lngLatAlt!),
      target: this,
    });
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
    this._repaint();

    this._layer?.fire('addobject', {
      type: 'addobject',
      lngLatAlt: LngLatAlt.convert(this._lngLatAlt!),
      target: this,
    });
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
    this._repaint();

    this._layer?.fire('addobject', {
      type: 'addobject',
      lngLatAlt: LngLatAlt.convert(this._lngLatAlt!),
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


  /**
   * Triggers a repaint of the ThreeLayer map canvas.
   * @returns {void}
   * @private
   */
  _repaint(): void {
    this._layer?._map?.triggerRepaint();
  }


}
