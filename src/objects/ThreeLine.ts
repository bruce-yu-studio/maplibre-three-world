import type { ColorRepresentation } from 'three';
import type { ThreeLayer } from '../layers/ThreeLayer';
import { Vector3, Object3D, Event, Group, BufferGeometry, BufferAttribute } from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LngLatAlt, LngLatAltLike } from '../geometries/LngLatAlt';
import { lngLatAltToVector3 } from '../utils';


/**
 * Line style type for a ThreeLine.
 * - `'solid'`: A continuous line.
 * - `'dash'`: A dashed line controlled by dashSize, gapSize, and dashOffset.
 */
export type ThreeLineType = 'solid' | 'dash';


/**
 * Options to create a ThreeLine.
 */
export interface ThreeLineOptions {
  /**
   * Array of geographic coordinate points that define the line path.
   */
  lngLatAlts: Array<LngLatAlt>;
  /**
   * Line style type. Defaults to `'solid'`.
   */
  type?: ThreeLineType;
  /**
   * Line width in pixels. Defaults to `1`.
   */
  width?: number;
  /**
   * Line color. Defaults to `0x000000` (black).
   */
  color?: ColorRepresentation;
  /**
   * Line opacity, from `0` (transparent) to `1` (opaque). Defaults to `1`.
   */
  opacity?: number;
  /**
   * Gap size between dashes when type is `'dash'`. Defaults to `1`.
   */
  gapSize?: number;
  /**
   * Dash segment size when type is `'dash'`. Defaults to `1`.
   */
  dashSize?: number;
  /**
   * Offset of the dash pattern along the line. Defaults to `0`.
   */
  dashOffset?: number;
}


export class ThreeLine {
  _name: 'ThreeLine' = 'ThreeLine';
  /**
   * Unique identifier of this Three.js object.
   * @type {number}
   * @private
   */
  _id: number;
  /**
   * Array of geographic coordinate points that define the line path.
   * @type {Array<LngLatAlt>}
   * @private
   */
  _lngLatAlts: Array<LngLatAlt>;
  /**
   * Line style type: `'solid'` or `'dash'`.
   * @type {ThreeLineType}
   * @private
   */
  _type: ThreeLineType;
  /**
   * Line width in pixels.
   * @type {number}
   * @private
   */
  _width: number;
  /**
   * Line color.
   * @type {ColorRepresentation}
   * @private
   */
  _color: ColorRepresentation;
  /**
   * Line opacity, from `0` (transparent) to `1` (opaque).
   * @type {number}
   * @private
   */
  _opacity: number;
  /**
   * Gap size between dashes when type is `'dash'`.
   * @type {number}
   * @private
   */
  _gapSize: number;
  /**
   * Dash segment size when type is `'dash'`.
   * @type {number}
   * @private
   */
  _dashSize: number;
  /**
   * Offset of the dash pattern along the line.
   * @type {number}
   * @private
   */
  _dashOffset: number;
  /**
   * Root Three.js Group containing the line object.
   * @type {Object3D<Event>}
   * @private
   */
  _object: Object3D<Event>;
  /**
   * The Line2 instance representing the rendered line.
   * @type {Line2|undefined}
   * @private
   */
  _line?: Line2;
  /**
   * Reference to the ThreeLayer this line is added to.
   * @type {ThreeLayer|undefined}
   * @private
   */
  _layer?: ThreeLayer;
  /**
   * Geographical bounding box of the line in north/south/east/west coordinates.
   * @private
   */
  _bounds = {
    north: -Infinity,
    south: Infinity,
    east: -Infinity,
    west: Infinity,
  }


  /**
   * Constructs a new ThreeLine instance.
   * Initializes the line's type, width, color, opacity, and dash settings,
   * then builds the geometry from the provided coordinate points.
   * @param {ThreeLineOptions} options - Configuration options for the line.
   */
  constructor(options: ThreeLineOptions) {
    this._lngLatAlts = options.lngLatAlts;
    this._type = options.type || 'solid';
    this._width = options.width || 1;
    this._color = options.color || 0x000000;
    this._opacity = options.opacity || 1;
    this._gapSize = options.gapSize || 1;
    this._dashSize = options.dashSize || 1;
    this._dashOffset = options.dashOffset || 0;

    this._object = new Group();
    this._id = this._object.id;

    this.setLngLatAlts(this._lngLatAlts);
  }


  /**
   * Returns the current array of coordinate points defining the line path.
   * @returns {Array<LngLatAlt>|null}
   */
  getLngLatAlts(): Array<LngLatAlt> | null {
    return this._lngLatAlts || null;
  }


  /**
   * Sets the line's coordinate points and rebuilds the geometry.
   * Removes the previous line object if one exists.
   * @param {Array<LngLatAltLike>} lngLatAlts - New array of coordinate points.
   * @returns {this}
   */
  setLngLatAlts(lngLatAlts: Array<LngLatAltLike>): this {
    if (this._line) {
      this._lngLatAlts = [];
      this._object.remove(this._line);
      this._line.remove();
    }

    const {
      vertices,
      flattenedPositions,
      center,
    } = this._createGeometryPayload(lngLatAlts);  

    const bufferGeometry = new BufferGeometry();

    bufferGeometry.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(flattenedPositions), 3)
    );

    const flattenedVertices = vertices.flatMap(vector => {
      const { x, y, z } = vector.sub(center);
      return [x, y, z];
    });

    const geometry = new LineGeometry();
    const material = new LineMaterial();

    this._line = new Line2(geometry, material);
    this._line.geometry.setPositions(flattenedVertices);
    this._line.computeLineDistances();

    this.setType(this._type);
    this.setWidth(this._width);
    this.setColor(this._color);
    this.setOpacity(this._opacity);
    this.setDashSize(this._dashSize);
    this.setGapSize(this._gapSize);
    this.setDashOffset(this._dashOffset);

    this._object.position.copy(center);
    this._object.add(this._line);
    this._layer?._repaint();
    this._resetResolution();

    return this;
  }


  /**
   * Returns the current line style type.
   * @returns {ThreeLineType}
   */
  getType(): ThreeLineType {
    return this._type;
  }


  /**
   * Sets the line style type to `'solid'` or `'dash'`.
   * Updates the material shader defines accordingly.
   * @param {ThreeLineType} type - The new line style type.
   * @returns {this}
   */
  setType(type: ThreeLineType): this {
    this._type = type;
    if (!this._line) return this;
    if (this._type === 'solid') {
      this._line.material.defines = {};
    } else if (this._type === 'dash') {
      this._line.material.defines.USE_DASH = '';
    }
    this._layer?._repaint();
    return this;
  }


  /**
   * Returns the current line width in pixels.
   * @returns {number}
   */
  getWidth(): number {
    return this._width;
  }


  /**
   * Sets the line width in pixels.
   * @param {number} width - The new line width.
   * @returns {this}
   */
  setWidth(width: number): this {
    this._width = width;
    if (this._line) {
      this._line.material.linewidth = width;
    }
    this._layer?._repaint();
    return this;
  }


  /**
   * Returns the current line color.
   * @returns {ColorRepresentation}
   */
  getColor(): ColorRepresentation {
    return this._color;
  }


  /**
   * Sets the line color.
   * @param {ColorRepresentation} color - The new line color.
   * @returns {this}
   */
  setColor(color: ColorRepresentation): this {
    this._color = color;
    this._line?.material.color.set(color);
    this._layer?._repaint();
    return this;
  }


  /**
   * Returns the current line opacity.
   * @returns {number}
   */
  getOpacity(): number {
    return this._opacity;
  }


  /**
   * Sets the line opacity.
   * @param {number} opacity - Opacity value from `0` (transparent) to `1` (opaque).
   * @returns {this}
   */
  setOpacity(opacity: number): this {
    this._opacity = opacity;
    if (this._line) {
      this._line.material.opacity = opacity;
    }
    this._layer?._repaint();
    return this;
  }


  /**
   * Returns the current dash segment size.
   * @returns {number}
   */
  getDashSize(): number {
    return this._dashSize;
  }


  /**
   * Sets the dash segment size. Only effective when type is `'dash'`.
   * @param {number} dashSize - The new dash segment size.
   * @returns {this}
   */
  setDashSize(dashSize: number): this {
    this._dashSize = dashSize;
    if (this._line) {
      this._line.material.dashSize = dashSize;
    }
    this._layer?._repaint();
    return this;
  }


  /**
   * Returns the current gap size between dashes.
   * @returns {number}
   */
  getGapSize(): number {
    return this._gapSize;
  }


  /**
   * Sets the gap size between dashes. Only effective when type is `'dash'`.
   * @param {number} gapSize - The new gap size.
   * @returns {this}
   */
  setGapSize(gapSize: number): this {
    this._gapSize = gapSize;
    if (this._line) {
      this._line.material.gapSize = gapSize;
    }
    this._layer?._repaint();
    return this;
  }


  /**
   * Returns the current dash pattern offset.
   * @returns {number}
   */
  getDashOffset(): number {
    return this._dashOffset;
  }


  /**
   * Sets the dash pattern offset along the line. Only effective when type is `'dash'`.
   * @param {number} dashOffset - The new dash offset.
   * @returns {this}
   */
  setDashOffset(dashOffset: number): this {
    this._dashOffset = dashOffset;
    if (this._line) {
      this._line.material.dashOffset = dashOffset;
    }
    this._layer?._repaint();
    return this;
  }


  /**
   * Adds the line to a ThreeLayer and fires an `addobject` event.
   * @param {ThreeLayer} threeLayer - The layer to add the line to.
   * @returns {this}
   */
  addTo(threeLayer: ThreeLayer): this {
    this._layer = threeLayer;
    this._layer._addObject(this);
    this._resetResolution();
    this._layer.fire('addobject', {
      type: 'addobject',
      lngLatAlts: this._lngLatAlts,
      target: this,
    });
    return this;
  }


  /**
   * Removes the line from its layer and fires a `removeobject` event.
   * @returns {this}
   */
  remove(): this {
    if (this._layer) {
      this._layer._removeObject(this);
      this._layer.fire('removeobject', {
        type: 'removeobject',
        lngLatAlts: this._lngLatAlts,
        target: this,
      });
      this._layer._repaint();
      this._layer = undefined;
    }
    return this;
  }


  /**
   * Internal method to convert an array of coordinate points into geometry data.
   * Computes 3D vertices, flattened position arrays, bounding box center,
   * and updates the geographical bounds of the line.
   * @param {Array<LngLatAltLike>} lngLatAlts - Array of coordinate points to process.
   * @returns {{ vertices: Array<Vector3>, flattenedPositions: Array<number>, center: Vector3 }}
   * @private
   */
  _createGeometryPayload(lngLatAlts: Array<LngLatAltLike>): {
    vertices: Array<Vector3>,
    flattenedPositions: Array<number>,
    center: Vector3,
  } {
    const {
      vertices,
      flattenedPositions,
      minX,
      minY,
      minZ,
      maxX,
      maxY,
      maxZ,
      north,
      south,
      east,
      west,
    } = lngLatAlts.reduce<{
      vertices: Array<Vector3>,
      flattenedPositions: Array<number>,
      minX: number,
      minY: number,
      minZ: number,
      maxX: number,
      maxY: number,
      maxZ: number,
      north: number,
      south: number,
      east: number,
      west: number,
    }>((prev, lngLatAlt) => {
      const convertLnglatAlt = LngLatAlt.convert(lngLatAlt);
      this._lngLatAlts.push(convertLnglatAlt);

      const { lng, lat, alt } = convertLnglatAlt;
      const vector = lngLatAltToVector3(lng, lat, alt);
      const { x, y, z } = vector;

      prev.vertices.push(vector);
      prev.flattenedPositions.push(x, y, z);

      if (x < prev.minX) prev.minX = x;
      if (y < prev.minY) prev.minY = y;
      if (z < prev.minZ) prev.minZ = z;

      if (x > prev.maxX) prev.maxX = x;
      if (y > prev.maxY) prev.maxY = y;
      if (z > prev.maxZ) prev.maxZ = z;

      prev.north = Math.max(prev.north, lat);
      prev.south = Math.min(prev.south, lat);
      prev.east = Math.max(prev.east, lng);
      prev.west = Math.min(prev.west, lng);

      return prev;
    }, {
      vertices: [],
      flattenedPositions: [],
      minX: Infinity,
      minY: Infinity,
      minZ: Infinity,
      maxX: -Infinity,
      maxY: -Infinity,
      maxZ: -Infinity,
      north: -Infinity,
      south: Infinity,
      east: -Infinity,
      west: Infinity,
    });

    const center = new Vector3(
      (minX + maxX) / 2,
      (minY + maxY) / 2,
      (minZ + maxZ) / 2
    );

    this._bounds = { north, south, east, west };

    return {
      vertices,
      flattenedPositions,
      center,
    }
  }


  /**
   * Internal method to sync the line material's resolution with the renderer's canvas size.
   * Should be called whenever the line is added to a layer or the canvas is resized.
   * @returns {void}
   * @private
   */
  _resetResolution(): void {
    if (this._line && this._layer?._threeRenderer) {
      const { width, height } = this._layer._threeRenderer._renderer.domElement;
      this._line.material.resolution.set(width, height);
    }
  }


}
