/**
 * Tile size in pixels.
 */
export const TILE_SIZE = 512;

/**
 * Total world size in projected units.
 */
export const WORLD_SIZE = TILE_SIZE * 2000;

/**
 * Earth's radius in meters.
 */
export const EARTH_RADIUS = 6371008.8;

/**
 * Earth's circumference in meters.
 */
export const EARTH_CIRCUMFERENCE = 2 * Math.PI * EARTH_RADIUS;

/**
 * Degrees to radians conversion factor.
 */
export const DEG_TO_RAD = Math.PI / 180;

/**
 * Radians to degrees conversion factor.
 */
export const RAD_TO_DEG = 180 / Math.PI;

/**
 * World units per meter in the map projection.
 */
export const PROJECTION_WORLD_SIZE = WORLD_SIZE / EARTH_CIRCUMFERENCE;

/**
 * Maximum valid latitude for Web Mercator projection.
 */
export const MAX_VALID_LATITUDE = 85.051129;

/**
 * Ratio of tile size to world size.
 */
export const WORLD_SIZE_RATIO = TILE_SIZE / WORLD_SIZE;
