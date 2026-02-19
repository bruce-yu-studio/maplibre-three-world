import type { ColorRepresentation } from 'three';
import type { ThreeLayer } from '../layers/ThreeLayer';
import { Object3D, Event } from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { Group } from 'three';
import { LngLatAlt, LngLatAltLike } from '../geometries/LngLatAlt';
import { lngLatAltToVector3, normalizeVertices } from '../utils';


export type ThreeLineType = 'solid' | 'dash';


export interface ThreeLineOptions {
  lngLatAlts: Array<LngLatAlt>;
  type?: ThreeLineType;
  width?: number;
  color?: ColorRepresentation;
}


export class ThreeLine {
  _name: 'ThreeLine' = 'ThreeLine';
  _id: number;
  _lngLatAlts: Array<LngLatAlt>;
  _type: ThreeLineType;
  _width: number;
  _color: ColorRepresentation;
  _object: Object3D<Event>;
  _line?: Line2;
  _layer?: ThreeLayer;


  constructor(options: ThreeLineOptions) {
    this._lngLatAlts = options.lngLatAlts;
    this._type = options.type || 'solid';
    this._width = options.width || 1;
    this._color = options.color || 0x000000;

    this._object = new Group();
    this._id = this._object.id;

    this.setLngLatAlts(this._lngLatAlts);
    this.setWidth(this._width);
    this.setColor(this._color);
  }


  getLngLatAlts(): Array<LngLatAlt> | null {
    return this._lngLatAlts || null;
  }


  setLngLatAlts(lngLatAlts: Array<LngLatAltLike>): this {
    if (this._line) {
      this._object.remove(this._line);
      this._line.remove();
    }

    // TODO: Too mush loops
    this._lngLatAlts = lngLatAlts.map(LngLatAlt.convert);

    const coordinates = this._lngLatAlts.map(lngLatAlt => {
      const { lng, lat, alt } = lngLatAlt;
      return lngLatAltToVector3(lng, lat, alt);
    });

    const normalize = normalizeVertices(coordinates)!;
    const flattenedArray = normalize.vertices.flatMap(({x, y, z}) => {
      return [x, y, z];
    });

    const geometry = new LineGeometry();
    const material = new LineMaterial();

    this._line = new Line2(geometry, material);
    this._line.geometry.setPositions(flattenedArray);
    this._line.computeLineDistances();

    this.setWidth(this._width);
    this.setColor(this._color);

    this._object.position.copy(normalize.position);
    this._object.add(this._line);
    this._layer?._repaint();

    return this;
  }


  getWidth(): number {
    return this._width;
  }


  setWidth(width: number): this {
    if (this._line) {
      this._line.material.linewidth = width;
    this._layer?._repaint();
    }
    return this;
  }


  getColor(): ColorRepresentation {
    return this._color;
  }


  setColor(color: ColorRepresentation): this {
    this._line?.material.color.set(color);
    this._layer?._repaint();
    return this;
  }


  addTo(threeLayer: ThreeLayer): this {
    this._layer = threeLayer;
    this._layer._addObject(this);

    this._layer?.fire('addobject', {
      type: 'addobject',
      lngLatAlts: this._lngLatAlts,
      target: this,
    });

    return this;
  }


  remove() {
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


}
