import maplibregl from 'maplibre-gl';
import { ThreeLayer, ThreeModel } from 'maplibre-three-world';


// Initial Map
const map = new maplibregl.Map({
  container: 'map',
  style: 'https://tiles.openfreemap.org/styles/bright',
  zoom: 18,
  center: [148.9818, -35.3981],
  pitch: 45,
  maxPitch: 85,
  canvasContextAttributes: {
    antialias: true,
  },
});


// Create Layer
const layer = new ThreeLayer({
  id: '3d_building',
  minzoom: 16,
  maxzoom: 24,
});


// Create Model
const model = new ThreeModel({
  url: 'https://maplibre.org/maplibre-gl-js/docs/assets/34M_17/34M_17.gltf',
  type: 'gltf',
  lngLatAlt: [148.9819, -35.39797, 0],
  rotation: {
    x: 90,
    y: 0,
    z: 0,
  },
});


// Map on Load
await new Promise(resolve => map.once('style.load', resolve));


// Add Layer
map.addLayer(layer);


// Add Model
model.addTo(layer);


const waypoints = [
  [[148.9819, -35.39847, 0], [148.9819, -35.39747, 0], [148.9817, -35.39747, 0]],
  [[148.9817, -35.39747, 0], [148.9817, -35.39847, 0], [148.9819, -35.39847, 0]],
];


async function loop() {
  for (const lngLatAlts of waypoints) {
    // Start animate
    await model.animate({ lngLatAlts }, 5000);
  }
  loop();
}

loop();
