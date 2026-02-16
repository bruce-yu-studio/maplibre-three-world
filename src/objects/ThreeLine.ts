import type { LngLatAltLike } from '../geometries/LngLatAlt';
import type { ThreeLayer } from '../layers/ThreeLayer';
import { Object3D, Event } from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { Group } from 'three';
import { LngLatAlt } from '../geometries/LngLatAlt';
import { lngLatAltToVector3, normalizeVertices } from '../utils';


export interface ThreeLineOptions {
  coordinates: Array<LngLatAltLike>;
  type: 'solid' | 'dash';
}


export class ThreeLine {
  _id: number;
  _object: Object3D<Event>;
  _layer?: ThreeLayer;


  constructor(options: ThreeLineOptions) {
    const coordinates = options.coordinates.map(lngLatAlt => {
      const { lng, lat, alt } = LngLatAlt.convert(lngLatAlt);
      return lngLatAltToVector3(lng, lat, alt);
    });

    const normalize = normalizeVertices(coordinates)!;
    const flattenedArray = normalize.vertices.flatMap(({x, y, z}) => {
      return [x, y, z];
    });

    const geometry = new LineGeometry();
    geometry.setPositions(flattenedArray);

    const material = new LineMaterial({
      linewidth: 0.01,
      color: 0xff0000,
      // dashed: true,
      // dashOffset: 1,
      // dashSize: 1,
    });
    // material.defines.USE_DASH = '';

    const line = new Line2(geometry, material);
    line.position.copy(normalize.position);
    // line.computeLineDistances();

    this._object = new Group();
    this._object.name = 'ThreeModel';
    this._object.add(line);

    this._id = this._object.id;
  }


  addTo(threeLayer: ThreeLayer): this {
    this._layer = threeLayer;
    this._layer._addObject(this);
    return this;
  }


}
