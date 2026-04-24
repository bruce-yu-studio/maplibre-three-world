# ThreeModel


## Description

`ThreeModel` represents a 3D object that can be added to a `ThreeLayer`. It supports GLTF, FBX models, and custom `THREE.Object3D` objects, and allows setting position, rotation, scale, and popups for interaction on a georeferenced map.


## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options.url` | `string` | URL to load the 3D model. Required if type is `'gltf'` or `'fbx'`. |
| `options.object` | `THREE.Object3D<Event>` | The Three.js object to use for the model. Required if type is `'custom'`. |
| `options.type` | `'gltf'`, `'fbx'`, `'custom'` | The type of model to load. |
| `options.lngLatAlt` | `LngLatAltLike` | Optional geographic position for the model `[lng, lat, alt]`. |
| `options.scale` | `{ x: number, y: number, z: number }` | Optional scale for the model in each axis. Default is `{ x:1, y:1, z:1 }`. |
| `options.rotation` | `{ x: number, y: number, z: number }` | Optional rotation in degrees. Default is `{ x:0, y:0, z:0 }`. |


You can create a `ThreeModel` using either a URL to load a GLTF/FBX model or by providing an existing Three.js Mesh.

**Example:**

```javascript
// GLTF Model from URL
const model = new ThreeModel({
  url: 'https://example.com/model.gltf',
  type: 'gltf',
  lngLatAlt: [148.9819, -35.39847, 0],
  scale: { x: 1, y: 1, z: 1 },
  rotation: { x: 90, y: 0, z: 0 },
});
```

**Example:**
```javascript
// Custom THREE.Object3D
import * as THREE from 'three';

/* ... Initial Map ... */

const geometry = new THREE.BoxGeometry(20, 20, 20);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const object = new THREE.Mesh(geometry, material);

const model = new ThreeModel({
  object: object,
  type: 'custom',
  lngLatAlt: [148.9819, -35.39847, 0],
  scale: { x: 1, y: 1, z: 1 },
  rotation: { x: 90, y: 0, z: 0 },
});
```


## Methods


### getLngLatAlt
`getLngLatAlt(): LngLatAlt | undefined`  
Returns the current position of the model.

**Example:**
```javascript
const position = model.getLngLatAlt();
console.log(position);
```


### setLngLatAlt
`setLngLatAlt(lngLatAlt: LngLatAltLike): this`  
Sets the model's position and updates its placement in the layer.


**Example:**
```javascript
model.setLngLatAlt([148.9819, -35.39847, 10]);
```


### getScale
`getScale(): ThreeModelScale`  
Returns the current scale of the model.

**Example:**
```javascript
const scale = model.getScale();
console.log(scale);
```


### setScale
`setScale(x: number, y: number, z: number): this`  
Sets the scale of the model considering geospatial projection.

**Example:**
```javascript
model.setScale(2, 2, 2);
```


### getRotation
`getRotation(): ThreeModelRotation`  
Returns the current rotation of the model.

**Example:**
```javascript
const rotation = model.getRotation();
console.log(rotation);
```


### setRotation
`setRotation(x: number, y: number, z: number): this`  
Sets the rotation of the model in degrees.

**Example:**
```javascript
model.setRotation(90, 0, 45);
```


### clone
`clone(): ThreeModel`  
Returns a clone of the model.

**Example:**
```javascript
const baseModel = new ThreeModel(/* options */);

const clonedModel = baseModel.clone();
clonedModel.setLngLatAlt([148.9819, -35.39847, 0]);
clonedModel.addTo(layer);
```



### getPopup
`getPopup(): Popup | null`  
Returns the popup associated with the model, if any.

**Example:**
```javascript
const popup = model.getPopup();
```


### setPopup
`setPopup(popup?: Popup | null): this`  
Associates a popup with the model.

**Example:**
```javascript
model.setPopup(new maplibregl.Popup().setText('Hello'));
```


### togglePopup
`togglePopup(): this`  
Opens or closes the associated popup.

**Example:**
```javascript
model.togglePopup();
```


### animate
`animate(target: AnimateTarget, duration?: number): Promise<this>`  
Smoothly transitions the model toward the given target state over the specified duration.
Only properties present in `target` are interpolated; others remain unchanged.
If called while an animation is already running, the previous animation resolves immediately.

Returns a `Promise` that resolves with the model instance when the animation completes.

| Parameter | Type | Description |
|-----------|------|-------------|
| `target.lngLatAlts` | `Array<LngLatAltLike>` | Optional. Ordered list of waypoints where `lngLatAlts[0]` is the start position. The model snaps to `lngLatAlts[0]` immediately, then travels `lngLatAlts[0]` → `lngLatAlts[1]` → … → `lngLatAlts[N-1]`. Speed is kept constant proportional to each segment's geographic distance. |
| `target.rotation` | `Partial<{ x, y, z }>` | Optional. Target rotation in degrees. Only specified axes are interpolated. |
| `target.scale` | `Partial<{ x, y, z }>` | Optional. Target scale. Only specified axes are interpolated. |
| `duration` | `number` | Transition duration in milliseconds. Default is `1000`. |

**Example:**
```javascript
// Move the model from A to B over 2 seconds
await model.animate({
  lngLatAlts: [
    [121.50, 25.00, 0],  // start
    [121.55, 25.05, 0],  // end
  ],
}, 2000);

console.log('animation complete');
```

**Example:**
```javascript
// Travel through multiple waypoints with rotation and scale change
await model.animate({
  lngLatAlts: [
    [121.50, 25.00, 0],  // start
    [121.52, 25.03, 0],
    [121.55, 25.05, 0],  // end
  ],
  rotation: { z: 180 },
  scale: { x: 2, y: 2, z: 2 },
}, 3000);
```

**Example:**
```javascript
// Start a new animation mid-flight — the previous one resolves immediately
model.animate({
  lngLatAlts: [[121.50, 25.00, 0], [121.55, 25.05, 0]],
}, 5000);

setTimeout(() => {
  // Interrupts the first animation
  model.animate({
    lngLatAlts: [[121.55, 25.05, 0], [121.60, 25.10, 0]],
  }, 2000);
}, 1000);
```


### stopAnimate
`stopAnimate(): this`  
Stops the active animation immediately and resolves its `Promise` with the current model state.
Has no effect if no animation is running.

**Example:**
```javascript
const promise = model.animate({
  lngLatAlts: [
    [121.50, 25.00, 0],  // start
    [121.55, 25.05, 0],  // end
  ],
}, 5000);

// Stop after 1 second
setTimeout(() => {
  model.stopAnimate();
}, 1000);

await promise; // resolves at the stopped position
```


### addTo
`addTo(layer: ThreeLayer): this`  
Adds the model to a `ThreeLayer`.

**Example:**
```javascript
model.addTo(layer);
```


### remove
`remove(): this`  
Removes the model from its layer and stops any active animation.

**Example:**
```javascript
model.remove();
```
