import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationMarker({ position, setPosition, onAddressChange }) {
  useMapEvents({
    async click(e) {
      const coords = [e.latlng.lat, e.latlng.lng];
      setPosition(coords);

      if (!onAddressChange) return;
      try {
        const res = await fetch('/nominatim_proxy.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: coords[0], lon: coords[1] }),
        });
        const data = await res.json();
        if (data.success && data.address) {
          onAddressChange(data.address);
        }
      } catch (err) {
        console.error('Ошибка геокодера:', err);
      }
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={defaultIcon} />
  );
}

const MapView = ({ position, setPosition, onAddressChange, height = '250px' }) => {
  const defaultCenter = position || [47.222078, 39.720349];

  return (
    <div className="map-wrapper" style={{ height }}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <LocationMarker
          position={position}
          setPosition={setPosition}
          onAddressChange={onAddressChange}
        />
      </MapContainer>
    </div>
  );
};

export default MapView;