import type { ColorRepresentation } from 'three';
import type { ThreeLayer } from '../layers/ThreeLayer';
import { Vector3, Object3D, Event, Group, BufferGeometry, BufferAttribute } from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LngLatAlt, LngLatAltLike } from '../geometries/LngLatAlt';
import { lngLatAltToVector3 } from '../utils';


export type ThreeLineType = 'solid' | 'dash';


export interface ThreeLineOptions {
  lngLatAlts: Array<LngLatAlt>;
  type?: ThreeLineType;
  width?: number;
  color?: ColorRepresentation;
  opacity?: number;
  gapSize?: number;
  dashSize?: number;
  dashOffset?: number;
}


export class ThreeLine {
  _name: 'ThreeLine' = 'ThreeLine';
  _id: number;
  _lngLatAlts: Array<LngLatAlt>;
  _type: ThreeLineType;
  _width: number;
  _color: ColorRepresentation;
  _opacity: number;
  _gapSize: number;
  _dashSize: number;
  _dashOffset: number;
  _object: Object3D<Event>;
  _line?: Line2;
  _layer?: ThreeLayer;
  _bounds = {
    north: -Infinity,
    south: Infinity,
    east: -Infinity,
    west: Infinity,
  }


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


  getLngLatAlts(): Array<LngLatAlt> | null {
    return this._lngLatAlts || null;
  }


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


  getType(): ThreeLineType {
    return this._type;
  }


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


  getWidth(): number {
    return this._width;
  }


  setWidth(width: number): this {
    this._width = width;
    if (this._line) {
      this._line.material.linewidth = width;
    }
    this._layer?._repaint();
    return this;
  }


  getColor(): ColorRepresentation {
    return this._color;
  }


  setColor(color: ColorRepresentation): this {
    this._color = color;
    this._line?.material.color.set(color);
    this._layer?._repaint();
    return this;
  }


  getOpacity(): number {
    return this._opacity;
  }


  setOpacity(opacity: number): this {
    this._opacity = opacity;
    if (this._line) {
      this._line.material.opacity = opacity;
    }
    this._layer?._repaint();
    return this;
  }


  getDashSize(): number {
    return this._dashSize;
  }


  setDashSize(dashSize: number): this {
    this._dashSize = dashSize;
    if (this._line) {
      this._line.material.dashSize = dashSize;
    }
    this._layer?._repaint();
    return this;
  }


  getGapSize(): number {
    return this._gapSize;
  }


  setGapSize(gapSize: number): this {
    this._gapSize = gapSize;
    if (this._line) {
      this._line.material.gapSize = gapSize;
    }
    this._layer?._repaint();
    return this;
  }


  getDashOffset(): number {
    return this._dashOffset;
  }


  setDashOffset(dashOffset: number): this {
    this._dashOffset = dashOffset;
    if (this._line) {
      this._line.material.dashOffset = dashOffset;
    }
    this._layer?._repaint();
    return this;
  }


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


  _resetResolution(): void {
    if (this._line && this._layer?._threeRenderer) {
      const { width, height } = this._layer._threeRenderer._renderer.domElement;
      this._line.material.resolution.set(width, height);
    }
  }


}
