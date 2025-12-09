# LngLatAlt


## Description

`LngLatAlt` represents a geographic coordinate with optional altitude. It provides methods to convert between various input formats and ensures consistent handling of longitude, latitude, and altitude values.


## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `lng` | `number` | — | Longitude in degrees. |
| `lat` | `number` | — | Latitude in degrees. |
| `alt` | `number` | `0` | Optional altitude in meters. |

**Example:**
```javascript
const coord = new LngLatAlt(148.9819, -35.3981, 50);
```


## Methods


### convert
`convert(input: LngLatAltLike): LngLatAlt`
Converts a coordinate-like object or array into a `LngLatAlt` instance.

**Params:**
- `input`: Can be an object with `lng`/`lon`, optional `alt`, or a tuple `[lng, lat, alt?]`.

**Returns:** A new `LngLatAlt` instance.

**Example:**
```javascript
const coord1 = LngLatAlt.convert({ lng: 148.9819, lat: -35.3981 });
const coord2 = LngLatAlt.convert([148.9819, -35.3981, 50]);
```


### toArray
`toArray(): [number, number, number]`
Returns the coordinate as a tuple `[lng, lat, alt]`.

**Returns:** Array of three numbers representing longitude, latitude, and altitude.

**Example:**
```javascript
const arr = coord.toArray();
console.log(arr); // [148.9819, -35.3981, 50]
```
