import {
  DEG_TO_RAD,
  EARTH_CIRCUMFERENCE,
  WORLD_SIZE,
} from '../configs';


/**
 * Computes the scale factor to convert meters to projected world units at a given latitude.
 * @param {number} lat - Latitude in degrees.
 * @returns {number} Scale factor (world units per meter).
 */
export function projectedUnitsPerMeter(lat: number): number {
  return Math.abs(WORLD_SIZE / Math.cos(DEG_TO_RAD * lat) / EARTH_CIRCUMFERENCE);
}
