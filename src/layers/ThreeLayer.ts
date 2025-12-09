import type { Map, LngLat } from 'maplibre-gl';
import type { ThreeModel } from '../objects/ThreeModel';
import { LngLatAlt } from '../geometries/LngLatAlt';
import { Scene, Group, Raycaster, Vector2, AmbientLight } from 'three';
import { CameraAdapter } from '../core/CameraAdapter';
import { ThreeRenderer } from '../core/ThreeRenderer';
import { WORLD_SIZE } from '../configs';


/**
 * Alias for a Three.js model object managed by ThreeLayer.
 */
export type ThreeObject = ThreeModel;


/**
 * Supported event types in ThreeLayer.
 */
export type ThreeEventType =
    'click'
  | 'mouseover'
  | 'mouseenter'
  | 'mouseleave'
  | 'addobject'
  | 'removeobject';


/**
 * Collection of event listeners mapped by event type.
 */
export type ThreeEvents = Record<ThreeEventType, Set<(args: ThreeEventArgs) => void>>;


/**
 * Event argument structure passed to ThreeLayer event callbacks.
 */
export interface ThreeEventArgs {
  type: ThreeEventType;
  target: any;
  lngLatAlt: LngLatAlt;
  point?: {
    x: number;
    y: number;
  }
}


/**
 * Internal structure representing a MapLibre mouse event.
 */
interface MapMouseEventArgs {
  type: string;
  target: any;
  lngLat: LngLat;
  point: {
    x: number;
    y: number;
  }
}


/**
 * Options for initializing a ThreeLayer instance.
 */
export interface ThreeLayerOptions {
  id: string;
  minzoom?: number;
  maxzoom?: number;
  renderOutsideBounds?: boolean;
}


/**
 * Custom layer for rendering Three.js objects on a MapLibre map.
 * Handles event management, object visibility, and camera synchronization.
 */
export class ThreeLayer {
  /**
   * Layer identifier.
   * @type {string}
   */
  id: string;
  /**
   * Minimum zoom level for rendering objects.
   * @type {number}
   */
  minzoom: number;
  /**
   * Maximum zoom level for rendering objects.
   * @type {number}
   */
  maxzoom: number;
  /**
   * Layer type, fixed as 'custom' for MapLibre custom layers.
   * @type {string}
   */
  type: string = 'custom';
  /**
   * Rendering mode of the layer, currently set to '3d'.
   * @type {string} 
   */
  renderingMode: string = '3d';
  /**
   * Reference to the MapLibre map instance.
   * @type {Map|undefined}
   * @private
   */
  _map?: Map;
  /**
   * Three.js scene containing the world and lights.
   * @type {Scene}
   * @private
   */
  _scene: Scene;
  /**
   * Root Three.js group representing the 3D world.
   * @type {Group}
   * @private
   */
  _world: Group;
  /**
   * Ambient light for the 3D scene.
   * @type {AmbientLight}
   * @private
   */
  _light: AmbientLight;
  /**
   * Internal record of ThreeObjects keyed by their unique ID.
   * @type {Record<number, ThreeObject>}
   * @private
   */
  _objects: Record<number, ThreeObject> = {};
  /**
   * Canvas element used for rendering the Three.js scene.
   * @type {HTMLCanvasElement|undefined}
   * @private
   */
  _canvas?: HTMLCanvasElement;
  /**
   * Adapter to synchronize the Three.js camera with MapLibre transform.
   * @type {CameraAdapter|undefined}
   * @private
   */
  _cameraAdapter?: CameraAdapter;
  /**
   * Three.js renderer instance.
   * @type {ThreeRenderer|undefined}
   * @private
   */
  _threeRenderer?: ThreeRenderer;
  /**
   * Tracks the last object interacted with for mouse events.
   * @type {ThreeObject|null}
   * @private
   */
  _prevMouseEventThreeObject: ThreeObject | null = null;
  /**
   * Whether objects outside map bounds should still be rendered.
   * @type {boolean}
   * @private
   */
  _renderOutsideBounds: boolean;
  /**
   * Collection of registered event listeners.
   * @type {ThreeEvents}
   * @private
   */
  _events: ThreeEvents = {
    click: new Set(),
    mouseover: new Set(),
    mouseenter: new Set(),
    mouseleave: new Set(),
    addobject: new Set(),
    removeobject: new Set(),
  }


  /**
   * Initializes a ThreeLayer with a given ID and optional zoom/rendering settings.
   * @param {ThreeLayerOptions} options - Configuration for the layer.
   */
  constructor(options: ThreeLayerOptions) {
    this.id = options.id;
    this.minzoom = options.minzoom || 0;
    this.maxzoom = options.maxzoom || 24;
    this._renderOutsideBounds = options.renderOutsideBounds ?? true;

    this._world = new Group();
    this._world.name = 'ThreeLayer';
    this._world.position.set(WORLD_SIZE / 2, WORLD_SIZE / 2, 0);
    this._world.matrixAutoUpdate = false;

    this._light = new AmbientLight(0xffffff, 1.0);

    this._scene = new Scene();
    this._scene.add(this._world);
    this._scene.add(this._light);
  }


  /**
   * Called when the layer is added to a MapLibre map.
   * Sets up camera adapter, renderer, and event listeners.
   * @param {Map} map - MapLibre map instance.
   * @returns {void}
   */
  onAdd(map: Map): void {
    this._map = map;
    this._canvas = this._map.getCanvas();

    this._cameraAdapter = new CameraAdapter(
      this._map,
      this._world,
    );
    this._cameraAdapter.updateCameraMatrices(true);

    this._threeRenderer = new ThreeRenderer(
      this._canvas,
      this._scene,
      this._cameraAdapter.camera
    );

    this._map.on('move', this._mapOnMove);
    this._map.on('click', this._mapOnClick);
    this._map.on('mousemove', this._mapOnMouseMove);
  }


  /**
   * Called when the layer is removed from the map.
   * Cleans up event listeners, renderer, and objects.
   * @returns {void}
   */
  onRemove(): void {
    this._map?.off('move', this._mapOnMove);
    this._map?.off('click', this._mapOnClick);
    this._map?.off('mousemove', this._mapOnMouseMove);
    this._cameraAdapter?.remove();
    this._threeRenderer?.remove();
    this._objects = {};
    this._world.remove();
    this._scene.remove();
  }


  /**
   * Executes a render pass for this layer.
   * @returns {void}
   */
  render(): void {
    this._threeRenderer?.render();
  }


  /**
   * Registers an event listener for a given event type.
   * @param {ThreeEventType} event - Event type.
   * @param {(args: ThreeEventArgs) => void} callback - Callback function.
   * @returns {void}
   */
  on(event: ThreeEventType, callback: (args: ThreeEventArgs) => void): void {
    this._events[event].add(callback);
  }


  /**
   * Removes a previously registered event listener.
   * @param {ThreeEventType} event - Event type.
   * @param {(args: ThreeEventArgs) => void} callback - Callback function.
   * @returns {void}
   */
  off(event: ThreeEventType, callback: (args: ThreeEventArgs) => void): void {
    this._events[event].delete(callback);
  }


  /**
   * Fires an event and calls all registered callbacks for that event type.
   * @param {ThreeEventType} event - Event type.
   * @param {ThreeEventArgs} args - Event arguments.
   * @returns {void}
   */
  fire(event: ThreeEventType, args: ThreeEventArgs): void {
    this._events[event].forEach(event => event(args));
  }


  /**
   * Returns the topmost ThreeObject at a given canvas coordinate.
   * @param {[number, number]} point - Canvas [x, y] coordinates.
   * @returns {ThreeObject | null} The intersected object or null.
   */
  queryRenderObject([x, y]: [number, number]): ThreeObject | null {
    if (!this._canvas || !this._cameraAdapter?.camera) {
      return null;
    }

    const canvasRect = this._canvas.getBoundingClientRect();
    const raycaster = new Raycaster();
    const mouse = new Vector2();

    /**
     *    ----- y: 1  -----
     *    |               |
     *  x: -1           x: 1
     *    |               |
     *    ----- y: -1 -----
     *
     * top:    y =  1
     * bottom: y = -1
     * left:   x = -1
     * right:  x =  1
     */
    mouse.x = (x / canvasRect.width) * 2 - 1;
    mouse.y = -(y / canvasRect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, this._cameraAdapter.camera);
    const intersects = raycaster.intersectObjects(
      this._world.children,
      true,
    );

    if (intersects.length) {
      let object = intersects[0].object;
      let isFound = false;
      while (!isFound) {
        if (object.name && object.name.startsWith('Three')) {
          isFound = true;
        } else if (object.parent && object.parent.name !== 'ThreeLayer') {
          object = object.parent;
        } else {
          isFound = true;
        }
      }
      return this._objects[object.id];
    }

    return null;
  }


  /**
   * Adds a ThreeObject to the world and registers it internally.
   * @param {ThreeObject} threeObject
   * @returns {void}
   * @private
   */
  _addObject(threeObject: ThreeObject): void {
    this._world.add(threeObject._object);
    this._objects[threeObject._id] = threeObject;
  }


  /**
   * Removes a ThreeObject from the world and unregisters it internally.
   * @param {ThreeObject} threeObject
   * @returns {void}
   * @private
   */
  _removeObject(threeObject: ThreeObject): void {
    this._world.remove(threeObject._object);
    delete this._objects[threeObject._id];
  }

  /**
   * Updates visibility of a ThreeObject based on map bounds and zoom level.
   * @param {ThreeObject} object
   * @returns {void}
   * @private
   */
  _updateObjectVisibility = (object: ThreeObject): void => {
    const bounds = this._map!.getBounds();
    const zoom = this._map!.getZoom();
    const { lng, lat } = object._lngLatAlt!;

    const inBounds = this._renderOutsideBounds || bounds.contains([lng, lat]);
    const inZoomRange = this.minzoom <= zoom && zoom <= this.maxzoom;

    if (inBounds && inZoomRange) {
      this._world.add(object._object);
    } else {
      this._world.remove(object._object);
    }
  }


  /**
   * Handler for MapLibre 'move' event to update object visibility.
   * @returns {void}
   * @private
   */
  _mapOnMove = (): void => {
    if (this.minzoom === 0 && this.maxzoom === 24 && this._renderOutsideBounds) return;
    Object.values(this._objects).forEach(this._updateObjectVisibility);
  }


  /**
   * Handler for MapLibre 'click' event. Fires 'click' event for intersected object.
   * @param {MapMouseEventArgs} event
   * @returns {void}
   * @private
   */
  _mapOnClick = (event: MapMouseEventArgs): void => {
    const threeObject = this.queryRenderObject([
      event.point.x,
      event.point.y,
    ]);

    if (threeObject) {
      this.fire('click', {
        type: 'click',
        lngLatAlt: LngLatAlt.convert(threeObject._lngLatAlt!),
        point: event.point,
        target: threeObject,
      });
    }
  }


  /**
   * Handler for MapLibre 'mousemove' event. Fires 'mouseover', 'mouseenter', 'mouseleave'.
   * @param {MapMouseEventArgs} event
   * @returns {void}
   * @private
   */
  _mapOnMouseMove = (event: MapMouseEventArgs): void => {
    const threeObject = this.queryRenderObject([
      event.point.x,
      event.point.y,
    ]);

    if (threeObject && threeObject !== this._prevMouseEventThreeObject) {
      this.fire('mouseenter', {
        type: 'mouseenter',
        lngLatAlt: LngLatAlt.convert(threeObject._lngLatAlt!),
        point: event.point,
        target: threeObject,
      });
    }

    if (threeObject) {
      this.fire('mouseover', {
        type: 'mouseover',
        lngLatAlt: LngLatAlt.convert(threeObject._lngLatAlt!),
        point: event.point,
        target: threeObject,
      });
    }

    if (this._prevMouseEventThreeObject && threeObject !== this._prevMouseEventThreeObject) {
      this.fire('mouseleave', {
        type: 'mouseleave',
        lngLatAlt: LngLatAlt.convert(this._prevMouseEventThreeObject._lngLatAlt!),
        point: event.point,
        target: this._prevMouseEventThreeObject,
      });
    }

    this._prevMouseEventThreeObject = threeObject;
  }


}
