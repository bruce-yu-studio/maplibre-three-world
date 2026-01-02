# ThreeLight


## Description

`ThreeLight` represents a light that can be added to a `ThreeLayer`.  
It supports ambient lights, directional lights, and a default combination of lights.  
You can configure the light type, color, intensity, and position, and then add it to a `ThreeLayer`.


## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options.type` | `'default'`, `'ambient'`, `'direction'` | The type of light to create. `'default'` adds one ambient and two directional lights. `'ambient'` adds a single ambient light. `'direction'` adds a single directional light. |
| `options.color` | `ColorRepresentation` | Optional color of the light. |
| `options.intensity` | `number` | Optional intensity of the light. |
| `options.vector` | `{ x: number, y: number, z: number }` | Optional position vector for directional light. Only used if `options.type` is `'direction'`. |

You can create a `ThreeLight` with different types depending on your scene needs.


**Example:**

```javascript
// Default light
const defaultLight = new ThreeLight({
  type: 'default',
});

// Ambient light
const ambientLight = new ThreeLight({
  type: 'ambient',
  color: 0xffffff,
  intensity: 0.5,
});

// Directional light
const directionalLight = new ThreeLight({ 
  type: 'direction', 
  color: 0xffffff, 
  intensity: 0.8, 
  vector: {
    x: 10,
    y: 20,
    z: 30,
  }, 
});
```


## Methods


### addTo
`addTo(layer: ThreeLayer): this`  
Adds the light to a `ThreeLayer`.

**Example:**
```javascript
light.addTo(layer);
```


### remove
`remove(): this`  
Removes the light from its layer.

**Example:**
```javascript
light.remove();
```
