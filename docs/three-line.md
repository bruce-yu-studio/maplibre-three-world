# ThreeLine


## Description

`ThreeLine` represents a georeferenced 3D line that can be added to a `ThreeLayer`. It supports solid and dashed line styles, and allows setting color, width, opacity, and dash parameters.


## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options.lngLatAlts` | `Array<LngLatAltLike>` | Required. An array of geographic positions `[lng, lat, alt]` that define the line path. |
| `options.type` | `'solid'`, `'dash'` | Line style. Default is `'solid'`. |
| `options.width` | `number` | Line width in pixels. Default is `1`. |
| `options.color` | `ColorRepresentation` | Line color. Default is `0x000000`. |
| `options.opacity` | `number` | Line opacity between `0` and `1`. Default is `1`. |
| `options.dashSize` | `number` | Length of each dash segment. Only applies when `type` is `'dash'`. Default is `1`. |
| `options.gapSize` | `number` | Length of the gap between dashes. Only applies when `type` is `'dash'`. Default is `1`. |
| `options.dashOffset` | `number` | Offset of the dash pattern along the line. Only applies when `type` is `'dash'`. Default is `0`. |


**Example:**

```javascript
// Solid line
const line = new ThreeLine({
  lngLatAlts: [
    [121.5, 25.05, 0],
    [121.52, 25.07, 0],
    [121.55, 25.04, 0],
  ],
  type: 'solid',
  width: 3,
  color: 0xff0000,
  opacity: 1,
});
```

**Example:**
```javascript
// Dashed line
const line = new ThreeLine({
  lngLatAlts: [
    [121.5, 25.05, 0],
    [121.52, 25.07, 0],
    [121.55, 25.04, 0],
  ],
  type: 'dash',
  width: 2,
  color: 0x0000ff,
  opacity: 0.8,
  dashSize: 2,
  gapSize: 1,
  dashOffset: 0,
});
```


## Methods


### getLngLatAlts
`getLngLatAlts(): Array<LngLatAlt> | null`
Returns the current array of geographic positions that define the line path.

**Example:**
```javascript
const positions = line.getLngLatAlts();
console.log(positions);
```


### setLngLatAlts
`setLngLatAlts(lngLatAlts: Array<LngLatAltLike>): this`
Sets a new array of geographic positions, rebuilding the line geometry.

**Example:**
```javascript
line.setLngLatAlts([
  [121.5, 25.05, 0],
  [121.52, 25.07, 100],
  [121.55, 25.04, 0],
]);
```


### getType
`getType(): ThreeLineType`
Returns the current line type (`'solid'` or `'dash'`).

**Example:**
```javascript
const type = line.getType();
console.log(type); // 'solid' or 'dash'
```


### setType
`setType(type: ThreeLineType): this`
Sets the line type to `'solid'` or `'dash'`.

**Example:**
```javascript
line.setType('dash');
```


### getWidth
`getWidth(): number`
Returns the current line width in pixels.

**Example:**
```javascript
const width = line.getWidth();
console.log(width);
```


### setWidth
`setWidth(width: number): this`
Sets the line width in pixels.

**Example:**
```javascript
line.setWidth(5);
```


### getColor
`getColor(): ColorRepresentation`
Returns the current line color.

**Example:**
```javascript
const color = line.getColor();
console.log(color);
```


### setColor
`setColor(color: ColorRepresentation): this`
Sets the line color.

**Example:**
```javascript
line.setColor(0x00ff00);
line.setColor('red');
```


### getOpacity
`getOpacity(): number`
Returns the current line opacity.

**Example:**
```javascript
const opacity = line.getOpacity();
console.log(opacity);
```


### setOpacity
`setOpacity(opacity: number): this`
Sets the line opacity between `0` (transparent) and `1` (fully opaque).

**Example:**
```javascript
line.setOpacity(0.5);
```


### getDashSize
`getDashSize(): number`
Returns the current dash size. Only relevant when `type` is `'dash'`.

**Example:**
```javascript
const dashSize = line.getDashSize();
console.log(dashSize);
```


### setDashSize
`setDashSize(dashSize: number): this`
Sets the length of each dash segment. Only has visual effect when `type` is `'dash'`.

**Example:**
```javascript
line.setDashSize(3);
```


### getGapSize
`getGapSize(): number`
Returns the current gap size between dashes. Only relevant when `type` is `'dash'`.

**Example:**
```javascript
const gapSize = line.getGapSize();
console.log(gapSize);
```


### setGapSize
`setGapSize(gapSize: number): this`
Sets the length of the gap between dashes. Only has visual effect when `type` is `'dash'`.

**Example:**
```javascript
line.setGapSize(2);
```


### getDashOffset
`getDashOffset(): number`
Returns the current dash offset along the line.

**Example:**
```javascript
const dashOffset = line.getDashOffset();
console.log(dashOffset);
```


### setDashOffset
`setDashOffset(dashOffset: number): this`
Sets the offset of the dash pattern along the line. Can be used to animate a moving dash effect.

**Example:**
```javascript
// Animate moving dashes
let offset = 0;
setInterval(() => {
  offset += 0.1;
  line.setDashOffset(offset);
}, 16);
```


### addTo
`addTo(layer: ThreeLayer): this`
Adds the line to a `ThreeLayer`.

**Example:**
```javascript
line.addTo(layer);
```


### remove
`remove(): this`
Removes the line from its layer.

**Example:**
```javascript
line.remove();
```
