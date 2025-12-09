import type { Group } from 'three';
import {
  DEG_TO_RAD,
  WORLD_SIZE,
  MAX_VALID_LATITUDE,
  WORLD_SIZE_RATIO,
} from '../configs';
import {
  makePerspectiveMatrix,
  clamp,
  mercatorXFromLng,
  mercatorYFromLat,
} from '../utils';
import { Matrix4, Vector3, PerspectiveCamera } from 'three';
import { Map } from 'maplibre-gl';


const tempProjectionMatrix = new Matrix4();
const tempCameraTranslateMatrix = new Matrix4();


/**
 * Adapts a Three.js PerspectiveCamera to synchronize with a MapLibre map's
 * transformation lifecycle, ensuring consistent world-to-screen alignment.
 */
export class CameraAdapter {
  /**
   * Three.js perspective camera synchronized with the MapLibre transform state.
   * Acts as the rendering camera for the 3D world.
   * @type {PerspectiveCamera}
   */
  camera: PerspectiveCamera;
  /**
   * Reference to the MapLibre map instance used to read transform values
   * such as pitch, bearing, zoom, and viewport size.
   * @type {Map}
   * @private
   */
  _map: Map;
  /**
   * Root Three.js Group representing the rendered 3D world.
   * Its matrix is recalculated to stay aligned with map movements.
   * @type {Group}
   * @private
   */
  _world: Group;
  /**
   * Precomputed matrix used to reposition the 3D world so that the origin
   * aligns with the WebGL coordinate system expected by MapLibre.
   * @type {Matrix4}
   * @private
   */
  _worldTranslateToGLOrigin: Matrix4;


  /**
   * Creates a new CameraAdapter instance and binds map movement/resize events.
   * @param {Map} map - The MapLibre map instance providing transform data.
   * @param {Group} world - The Three.js world group to transform with the map.
   */
  constructor(map: Map, world: Group) {
    this._map = map;
    this._world = world;

    this.camera = new PerspectiveCamera(
      map.transform.fov,
      map.transform.width / map.transform.height,
      0.001,
      1e21
    );
    this.camera.matrixAutoUpdate = false;

    this._worldTranslateToGLOrigin = new Matrix4().makeTranslation(
      WORLD_SIZE / 2,
      -WORLD_SIZE / 2,
      0
    );

    this._map.on('move', this._mapOnMove);
    this._map.on('resize', this._mapOnResize);
  }


  /**
   * Cleans up event listeners and detaches the internal camera.
   * Should be called when the adapter is no longer needed.
   * @returns {void}
   */
  remove(): void {
    this.camera.remove();
    this._map.off('move', this._mapOnMove);
    this._map.off('resize', this._mapOnResize);
  }


  /**
   * Updates the camera projection and world matrices.
   * @param {boolean} updateProjection - Whether to rebuild the projection matrix.
   * @returns {void}
   */
  updateCameraMatrices(updateProjection: boolean): void {
    const { transform } = this._map;

    if (updateProjection) {
      this._updateProjectionMatrix(transform);
    }

    this._updateCameraWorldMatrix(transform);
    this._updateWorldMatrix(transform);
  }


  /**
   * Recomputes the camera's projection matrix based on map transform parameters.
   * @param {Map['transform']} transform - MapLibre transformation state.
   * @returns {void}
   * @private
   */
  _updateProjectionMatrix(transform: Map['transform']): void {
    const fovRad = transform.fov * DEG_TO_RAD;
    const centerOffset = transform.centerOffset || new Vector3();

    this.camera.aspect = transform.width / transform.height;

    // @ts-ignore
    tempProjectionMatrix.elements = makePerspectiveMatrix(
      fovRad,
      this.camera.aspect,
      transform.height / 50,
      transform.farZ
    );

    this.camera.projectionMatrix = tempProjectionMatrix;

    const matrices = this.camera.projectionMatrix.elements;
    matrices[8] = (-centerOffset.x * 2) / transform.width;
    matrices[9] = (centerOffset.y * 2) / transform.height;
  }


  /**
   * Updates the camera's world matrix to reflect pitch, bearing, elevation,
   * and camera-to-center distance defined by the map transform.
   * @param {Map['transform']} transform - MapLibre transformation state.
   * @returns {void}
   * @private
   */
  _updateCameraWorldMatrix(transform: Map['transform']): void {
    const pitchRad = transform.pitch * DEG_TO_RAD;
    const bearingRad = transform.bearing * DEG_TO_RAD;

    tempCameraTranslateMatrix.makeTranslation(0, 0, transform.cameraToCenterDistance);

    const cameraWorldMatrix = new Matrix4()
      .premultiply(tempCameraTranslateMatrix)
      .premultiply(new Matrix4().makeRotationX(pitchRad))
      .premultiply(new Matrix4().makeRotationZ(-bearingRad));

    if (transform.elevation) {
      cameraWorldMatrix.elements[14] =
        transform.cameraToCenterDistance * Math.cos(pitchRad);
    }

    this.camera.matrixWorld.copy(cameraWorldMatrix);
  }


  /**
   * Rebuilds the Three.js world group's transformation matrix to align it with
   * the map's zoom level, center, and global coordinate system.
   * @param {Map['transform']} transform - MapLibre transformation state.
   * @returns {void}
   * @private
   */
  _updateWorldMatrix(transform: Map['transform']): void {
    const zoomScale = transform.scale * WORLD_SIZE_RATIO;
    const scaleMatrix = new Matrix4().makeScale(zoomScale, zoomScale, zoomScale);

    let { x, y } = transform.centerOffset;
    if (!x || !y) {
      const center = transform.center;
      const lat = clamp(center.lat, -MAX_VALID_LATITUDE, MAX_VALID_LATITUDE);
      x = mercatorXFromLng(center.lng) * transform.worldSize;
      y = mercatorYFromLat(lat) * transform.worldSize;
    }

    const translateMatrix = new Matrix4().makeTranslation(-x, y, 0);
    const flipYMatrix = new Matrix4().makeRotationZ(Math.PI);

    this._world.matrix = new Matrix4()
      .premultiply(flipYMatrix)
      .premultiply(this._worldTranslateToGLOrigin)
      .premultiply(scaleMatrix)
      .premultiply(translateMatrix);
  }


  /**
   * Internal map movement handler that updates camera matrices without
   * modifying the projection matrix.
   * @returns {void}
   * @private
   */
  _mapOnMove = (): void => {
    this.updateCameraMatrices(false);
  }


  /**
   * Internal resize handler that refreshes both projection and world matrices
   * when the map viewport dimensions change.
   * @returns {void}
   * @private
   */
  _mapOnResize = (): void => {
    this.updateCameraMatrices(true);
  }


}
