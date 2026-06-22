import L from 'leaflet';
import { mapPoints } from '../data/mock-data.js';

const colors = {
  low: '#43A047',
  monitor: '#E8A317',
  'follow-up': '#D93025',
};

let mapInstance;

export function renderRiskMap() {
  const element = document.getElementById('riskMap');
  if (!element) return;

  if (mapInstance) {
    mapInstance.remove();
  }

  mapInstance = L.map(element, {
    zoomControl: false,
    attributionControl: false,
    scrollWheelZoom: false,
  }).setView([-6.602, 106.224], 12);

  element.style.background =
    'linear-gradient(135deg, #DDF1FF 0%, #E8F5E9 52%, #FFF4E5 100%)';

  L.rectangle(
    [
      [-6.628, 106.195],
      [-6.572, 106.252],
    ],
    {
      color: '#073B6F',
      weight: 2,
      fillColor: '#FFFFFF',
      fillOpacity: 0.2,
    },
  )
    .bindPopup('Ilustrasi area Kanekes - bukan batas administratif resmi')
    .addTo(mapInstance);

  L.polyline(
    [
      [-6.62, 106.205],
      [-6.61, 106.216],
      [-6.6, 106.225],
      [-6.588, 106.24],
    ],
    { color: '#1976C9', weight: 4, opacity: 0.6 },
  ).addTo(mapInstance);

  mapPoints.forEach((point) => {
    L.circleMarker([point.lat, point.lng], {
      radius: 10,
      color: colors[point.level],
      fillColor: colors[point.level],
      fillOpacity: 0.75,
      weight: 2,
    })
      .bindPopup(`<strong>${point.label}</strong><br>Data ilustratif prototype`)
      .addTo(mapInstance);
  });

  L.control
    .attribution({
      prefix: 'Leaflet',
    })
    .addAttribution('Peta ilustratif prototype')
    .addTo(mapInstance);

  setTimeout(() => mapInstance.invalidateSize(), 150);
}
