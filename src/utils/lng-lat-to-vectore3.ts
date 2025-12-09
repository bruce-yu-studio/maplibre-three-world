import { Vector3 } from 'three';
import {
  DEG_TO_RAD,
  EARTH_RADIUS,
  PROJECTION_WORLD_SIZE,
} from '../configs';
import { projectedUnitsPerMeter } from './projected-units-per-meter';


/**
 * Converts geographic coordinates to a Three.js Vector3 in projected space.
 * @param {number} lng - Longitude in degrees.
 * @param {number} lat - Latitude in degrees.
 * @param {number} alt - Altitude in meters.
 * @returns {Vector3} Projected 3D position.
 */
export function lngLatToVector3(lng: number, lat: number, alt: number): Vector3 {
  const x = -EARTH_RADIUS * DEG_TO_RAD * lng * PROJECTION_WORLD_SIZE;

  const y = -EARTH_RADIUS *
    Math.log(Math.tan(Math.PI * 0.25 + 0.5 * DEG_TO_RAD * lat)) *
    PROJECTION_WORLD_SIZE;

  const z = alt ? alt * projectedUnitsPerMeter(lat || 0) : 0;

  return new Vector3(x, y, z);
}
