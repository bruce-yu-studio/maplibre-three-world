# ThreeLayer


## Description

`ThreeLayer` provides a 3D layer for MapLibre GL JS, enabling the addition, removal, and interaction of Three.js objects on a georeferenced map.


## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `options.id` | `string` | — | Unique identifier for the layer. |
| `options.minzoom` | `number` | `0` | Minimum zoom level for rendering objects. |
| `options.maxzoom` | `number` | `24` | Maximum zoom level for rendering objects. |
| `options.renderOutsideBounds` | `boolean` | `true` | Whether to render objects outside the current map bounds. |

**Example:**
```javascript
const layer = new ThreeLayer({
  id: '3d_building',
  minzoom: 16,
  maxzoom: 24,
  renderOutsideBounds: false,
});
```


## Methods


### on
`on(event: ThreeEventType, callback: (args: ThreeEventArgs) => void): void`
Registers an event listener for the layer.

**Params:**
- `event`: Event type (`click`, `mouseover`, `mouseenter`, `mouseleave`, `addobject`, `removeobject`).  
- `callback`: Function invoked when the event occurs.

**Example:**
```javascript
layer.on('click', yourEventHandler);
```


### off
`off(event: ThreeEventType, callback: (args: ThreeEventArgs) => void): void`
Removes a previously registered event listener.

**Params:**
- `event`: Event type to remove the listener from.  
- `callback`: Function to remove.

**Example:**
```javascript
layer.off('click', yourEventHandler);
```


### fire
`fire(event: ThreeEventType, args: ThreeEventArgs): void`
Manually triggers a layer event.

**Params:**
- `event`: Event type to fire.  
- `args`: Arguments passed to listeners (includes target ThreeObject and coordinates).

**Example:**
```javascript
layer.fire('click', yourEventArgs);
```


### queryRenderObject
`queryRenderObject(coordinates: [number, number]): ThreeObject | null`
Queries which 3D object is rendered under given canvas coordinates.  

**Params:**
- `coordinates`: `[x, y]` tuple in canvas pixels.

**Returns:** The `ThreeObject` under the cursor, or `null` if none.

**Example:**
```javascript
const point = [100, 150];
const object = layer.queryRenderObject(point);

if (object) {
  console.log('Object found:', object);
} else {
  console.log('No object at this point.');
}
```