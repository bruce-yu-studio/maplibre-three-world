import { Scene, PerspectiveCamera, WebGLRenderer } from 'three';


/**
 * Wraps a Three.js WebGLRenderer and centralizes rendering lifecycle management
 * for a scene-camera pair bound to a specific canvas element.
 */
export class ThreeRenderer {
  /**
   * Internal Three.js WebGL renderer responsible for frame rendering.
   * @type {WebGLRenderer}
   * @private
   */
  _renderer: WebGLRenderer;
  /**
   * Active camera used for rendering the scene.
   * @type {PerspectiveCamera}
   * @private
   */
  _camera: PerspectiveCamera;
  /**
   * Three.js scene containing all renderable objects.
   * @type {Scene}
   * @private
   */
  _scene: Scene;


  /**
   * Initializes a WebGL2-backed Three.js renderer and binds scene/camera objects.
   * @param {HTMLCanvasElement} canvas - The target canvas element for rendering.
   * @param {Scene} scene - The Three.js scene to render.
   * @param {PerspectiveCamera} camera - The active camera used for rendering.
   */
  constructor(canvas: HTMLCanvasElement, scene: Scene, camera: PerspectiveCamera) {
    this._renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: false,
      canvas: canvas,
      context: canvas.getContext('webgl2')!,
    });

    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this._renderer.autoClear = false;

    this._scene = scene;
    this._camera = camera;
  }


  /**
   * Executes a render pass using the internal renderer, scene, and camera.
   * @returns {void}
   */
  render(): void {
    this._renderer.resetState();
    this._renderer.render(this._scene, this._camera);
  }


  /**
   * Cleans renderer and detaches scene and camera resources.
   * Should be called when the renderer is no longer required.
   * @returns {void}
   */
  remove(): void {
    this._renderer.clear();
    this._scene.remove();
    this._camera.remove();
  }


}
