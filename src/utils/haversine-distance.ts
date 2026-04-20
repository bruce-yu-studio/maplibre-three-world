const EARTH_RADIUS_M = 6_371_000;

/**
 * Calculates the 3D distance (metres) between two geographic points using the
 * Haversine formula for horizontal distance and Euclidean addition for altitude.
 *
 * @param lng1 - Longitude of point 1 (degrees).
 * @param lat1 - Latitude of point 1 (degrees).
 * @param alt1 - Altitude of point 1 (metres).
 * @param lng2 - Longitude of point 2 (degrees).
 * @param lat2 - Latitude of point 2 (degrees).
 * @param alt2 - Altitude of point 2 (metres).
 * @returns Distance in metres.
 */
export function haversineDistance(
  lng1: number, lat1: number, alt1: number,
  lng2: number, lat2: number, alt2: number,
): number {
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLng = (lng2 - lng1) * toRad;
  const rlat1 = lat1 * toRad;
  const rlat2 = lat2 * toRad;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(dLng / 2) ** 2;

  const horizontalDist = 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
  const verticalDist = alt2 - alt1;

  return Math.sqrt(horizontalDist ** 2 + verticalDist ** 2);
}
