/**
 * Represents any value that can be converted into a LngLatAlt instance.
 * Accepts:
 * - Objects using `{ lng, lat, alt? }`
 * - Objects using `{ lon, lat, alt? }`
 * - Tuples formatted as `[lng, lat, alt?]`
 */
export type LngLatAltLike = {
  lng: number;
  lat: number;
  alt?: number;
} | {
  lon: number;
  lat: number;
  alt?: number;
} | [number, number, number?];


/**
 * Encapsulates a geographic coordinate containing longitude, latitude,
 * and altitude. Enforces validation and provides normalized conversion helpers.
 */
export class LngLatAlt {
  /**
   * Longitude value in degrees.
   * @type {number}
   */
  lng: number;
  /**
   * Latitude value in degrees.
   * @type {number}
   */
  lat: number;
  /**
   * Altitude value in meters. Defaults to `0` when unspecified.
   * @type {number}
   */
  alt: number;


  /**
   * Constructs a normalized geographic coordinate object.
   * @param {number} lng - Longitude in degrees.
   * @param {number} lat - Latitude in degrees.
   * @param {number} alt - Altitude in meters.
   */
  constructor(lng: number, lat: number, alt: number) {
    if (isNaN(lng) || isNaN(lat) || isNaN(alt)) {
      throw new Error(`Invalid LngLatAlt object: (${lng}, ${lat}, ${alt})`);
    }

    this.lng = Number(lng);
    this.lat = Number(lat);
    this.alt = alt !== undefined ? Number(alt) : 0;

    if (this.lat > 90 || this.lat < -90) {
      throw new Error('Invalid LngLatAlt latitude value: must be between -90 and 90');
    }
  }


  /**
   * Converts any supported `LngLatAltLike` input into a LngLatAlt instance.
   * @param {LngLatAltLike} input - A coordinate in any supported format.
   * @returns {LngLatAlt} A normalized LngLatAlt instance.
   * @throws {Error} When input is not a valid LngLatAlt-like structure.
   */
  static convert(input: LngLatAltLike): LngLatAlt {
    if (input instanceof LngLatAlt) {
      return input;
    }

    if (Array.isArray(input) && input.length >= 2) {
      const lng = Number(input[0]);
      const lat = Number(input[1]);
      const alt = input[2] === undefined ? 0 : Number(input[2]);
      return new LngLatAlt(lng, lat, alt);
    }

    if (typeof input === 'object') {
      const hasLng = 'lng' in input;
      const hasLon = 'lon' in input;
      const hasLat = 'lat' in input;
      const hasAlt = 'alt' in input;

      const isValid = (hasLng || hasLon) && hasLat;

      if (!isValid) {
        throw new Error('`LngLatAltLike` argument must be specified as a LngLatAlt instance, an object {lng: <lng>, lat: <lat>, alt?: <alt>}, an object {lon: <lng>, lat: <lat>, alt?: <alt>}, or an array of [<lng>, <lat>, <alt>?]');
      }

      const lng = hasLng ? Number(input.lng) : Number(input.lon);
      const lat = Number(input.lat);
      const alt = hasAlt ? Number(input.alt) : 0;

      return new LngLatAlt(lng, lat, alt);
    }

    throw new Error('`LngLatAltLike` argument must be specified as a LngLatAlt instance, an object {lng: <lng>, lat: <lat>, alt?: <alt>}, an object {lon: <lng>, lat: <lat>, alt?: <alt>}, or an array of [<lng>, <lat>, <alt>?]');
  }


  /**
   * Converts the coordinate into a `[lng, lat, alt]` tuple.
   * @returns {[number, number, number]} A tuple representation of the coordinate.
   */
  toArray(): [number, number, number] {
    return [this.lng, this.lat, this.alt];
  }


}
