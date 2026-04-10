import maplibregl from 'maplibre-gl';
import { ThreeLayer, ThreeModel } from 'maplibre-three-world';


const MODEL_POSITIONS = [
  [148.9811, -35.39847, 0],
  [148.9815, -35.39847, 0],
  [148.9819, -35.39847, 0],
  [148.9823, -35.39847, 0],
  [148.9827, -35.39847, 0],
];


// Initial Map
const map = new maplibregl.Map({
  container: 'map',
  style: 'https://tiles.openfreemap.org/styles/bright',
  zoom: 18,
  center: [148.9819, -35.3981],
  pitch: 60,
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


// Create Base Model
const baseModel = new ThreeModel({
  url: 'https://maplibre.org/maplibre-gl-js/docs/assets/34M_17/34M_17.gltf',
  type: 'gltf',
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


// Add Models
MODEL_POSITIONS.forEach(position => {
  const clonedModel = baseModel.clone();
  clonedModel.setLngLatAlt(position);
  clonedModel.addTo(layer);
});
