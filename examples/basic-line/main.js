import maplibregl from 'maplibre-gl';
import { ThreeLayer, ThreeLine } from 'maplibre-three-world';


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


// Create Line
const line = new ThreeLine({
  lngLatAlts: [
    [148.9811, -35.39847, 0],
    // [148.9815, -35.39847, 200],
    // [148.9819, -35.39847, 50],
    // [148.9823, -35.39847, 200],
    [148.9827, -35.39847, 0],
    [148.9827, -35.39847, 100],
  ],
  width: 10,
  type: 'dash',
  dashSize: 1,
  gapSize: 1,
  color: 'red',
});


// Map on Load
await new Promise(resolve => map.once('style.load', resolve));


// Add Layer
map.addLayer(layer);


// Add Line
line.addTo(layer);


layer.on('mouseenter', e => {
  if (e.target === line) {
    // line.setLngLatAlts([
    //   [148.9811, -35.39847, 50],
    //   [148.9827, -35.39847, 50],
    // ]);
    // line.setWidth(.05);
    line
      .setColor('green')
      .setDashOffset(1);
  }
});


layer.on('mouseleave', e => {
  if (e.target === line) {
    line
      .setColor('red')
      .setDashOffset(0);
  }
});
