import maplibregl from 'maplibre-gl';
import { ThreeLayer, ThreeLine } from 'maplibre-three-world';


// Initial Map
const map = new maplibregl.Map({
  container: 'map',
  style: 'https://tiles.openfreemap.org/styles/bright',
  zoom: 17,
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
    [148.9827, -35.39847, 0],
    [148.9827, -35.39847, 100],
  ],
  width: 20,
  type: 'dash',
  color: 'red',
  opacity: 0.4,
  dashSize: .5,
  gapSize: .25,
});


// Map on Load
await new Promise(resolve => map.once('style.load', resolve));


// Add Layer
map.addLayer(layer);


// Add Line
line.addTo(layer);


setTimeout(() => {
  line.setLngLatAlts([
    [148.9827, -35.39847, 0],
    [148.9827, -35.39847, 100],
    [148.9833, -35.39847, 100],
  ]);
}, 2000);


layer.on('mouseenter', event => {
  if (event.target === line) {
    line
      .setColor('green')
      .setDashOffset(1);
  }
});


layer.on('mouseleave', event => {
  if (event.target === line) {
    line
      .setColor('red')
      .setDashOffset(0);
  }
});
