# ThreeModel


## Description

`ThreeModel` represents a 3D object that can be added to a `ThreeLayer`. It supports meshes, GLTF, and FBX models, and allows setting position, rotation, scale, and popups for interaction on a georeferenced map.


## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `url` | `string` | URL to load the 3D model. Required if type is `'gltf'` or `'fbx'`. |
| `mesh` | `THREE.Mesh` | Mesh instance. Required if type is `'mesh'`. |
| `type` | `'mesh'`, `'gltf'`, `'fbx'` | The type of model to load. |
| `lngLatAlt` | `LngLatAltLike` | Optional geographic position for the model `[lng, lat, alt]`. |
| `scale` | `{ x: number, y: number, z: number }` | Optional scale for the model in each axis. Default is `{ x:1, y:1, z:1 }`. |
| `rotation` | `{ x: number, y: number, z: number }` | Optional rotation in degrees. Default is `{ x:0, y:0, z:0 }`. |


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
// Mesh-based Model
import * as THREE from 'three';

/* ... Initial Map ... */

const geometry = new THREE.BoxGeometry(20, 20, 20);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const mesh = new THREE.Mesh(geometry, material);

const model = new ThreeModel({
  mesh: mesh,
  type: 'mesh',
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


### addTo
`addTo(layer: ThreeLayer): this`  
Adds the model to a `ThreeLayer` and registers internal event listeners.

**Example:**
```javascript
model.addTo(layer);
```


### remove
`remove(): this`  
Removes the model from its layer and cleans up associated events.

**Example:**
```javascript
model.remove();
```
