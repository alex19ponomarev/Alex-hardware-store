import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const CITY_COORDS = {
  'Москва': [55.7558, 37.6173],
  'Санкт-Петербург': [59.9343, 30.3351],
  'Новосибирск': [55.0084, 82.9357],
  'Екатеринбург': [56.8389, 60.6057],
  'Казань': [55.8304, 49.0661],
  'Нижний Новгород': [56.3269, 44.0059],
  'Ростов-на-Дону': [47.222078, 39.720349],
};

const getCityCoords = (city) => {
  if (!city) return CITY_COORDS['Москва'];
  return CITY_COORDS[city] || CITY_COORDS['Москва'];
};

function MapController({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, 12);
    }
  }, [center, map]);

  return null;
}

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

const MapView = ({ position, setPosition, onAddressChange, city, height = '250px' }) => {
  const centerCoords = position || getCityCoords(city);

  return (
    <div className="map-wrapper" style={{ height }}>
      <MapContainer
        center={centerCoords}
        zoom={12}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />


        <MapController center={centerCoords} />

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