import { RAD_TO_DEG } from '../configs';


/**
 * Converts longitude to normalized Web Mercator X coordinate.
 * @param {number} lng - Longitude in degrees.
 * @returns {number} X coordinate in [0, 1] range.
 */
export function mercatorXFromLng(lng: number): number {
  return (180 + lng) / 360;
}


/**
 * Converts latitude to normalized Web Mercator Y coordinate.
 * @param {number} lat - Latitude in degrees.
 * @returns {number} Y coordinate in [0, 1] range.
 */
export function mercatorYFromLat(lat: number): number {
  return ((180 - RAD_TO_DEG *
    Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))
  ) / 360);
}
