import { haversineDistance } from './haversine-distance';


export interface GeoPoint {
  lng: number;
  lat: number;
  alt: number;
}


export interface WaypointSegment {
  segmentIndex: number;
  localT: number;
}


/**
 * Computes cumulative distance-based thresholds for constant-speed waypoint interpolation.
 *
 * Given an ordered path of geographic points, returns an array of t-values (normalised to [0, 1])
 * marking where each segment starts and ends. Entry `i` is the start of segment `i`; the final
 * entry is 1 (end of the last segment).
 *
 * @param path - Ordered list of points (≥ 2 entries).
 * @returns Thresholds array of length `path.length`, or `undefined` when the total path distance is 0.
 */
export function computeSegmentThresholds(path: GeoPoint[]): number[] | undefined {
  const distances = path.slice(0, -1).map((from, i) => {
    const to = path[i + 1];
    return haversineDistance(from.lng, from.lat, from.alt, to.lng, to.lat, to.alt);
  });
  const totalDist = distances.reduce((sum, d) => sum + d, 0);
  if (totalDist === 0) return undefined;

  let cumulative = 0;
  const thresholds: number[] = [0];
  for (const d of distances) {
    cumulative += d / totalDist;
    thresholds.push(cumulative);
  }
  return thresholds;
}


/**
 * Resolves the active waypoint segment index and its local progress given a global animation `t`.
 *
 * @param t - Global animation progress in [0, 1].
 * @param thresholds - Cumulative thresholds from {@link computeSegmentThresholds}.
 * @param segmentCount - Total number of segments (equals `waypoints.length`).
 * @returns `segmentIndex` (0-based) and `localT` (progress within that segment, in [0, 1]).
 */
export function resolveWaypointSegment(t: number, thresholds: number[], segmentCount: number): WaypointSegment {
  let segmentIndex = segmentCount - 1;
  for (let i = 0; i < segmentCount; i++) {
    if (t <= thresholds[i + 1]) {
      segmentIndex = i;
      break;
    }
  }
  const segStart = thresholds[segmentIndex];
  const segEnd = thresholds[segmentIndex + 1];
  const localT = segEnd > segStart ? (t - segStart) / (segEnd - segStart) : 1;
  return { segmentIndex, localT };
}
