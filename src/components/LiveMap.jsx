import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useLanguage } from '../context/LanguageContext';

// Fix for default Leaflet icon paths in Vite/React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons based on status
const createIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const iconRed = createIcon('red');
const iconBlue = createIcon('blue');

// Custom HTML Icon for the LIVE GPS Tracker
const livePulseIcon = L.divIcon({
  className: 'custom-live-icon',
  html: `
    <div style="transform: translate(-50%, -50%); display: inline-flex; align-items: center; gap: 4px; background-color: white; padding: 4px 8px; border-radius: 9999px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #bbf7d0;">
      <span style="position: relative; display: flex; height: 10px; width: 10px;">
        <span style="animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; position: absolute; display: inline-flex; height: 100%; width: 100%; border-radius: 9999px; background-color: #4ade80; opacity: 0.75;"></span>
        <span style="position: relative; display: inline-flex; border-radius: 9999px; height: 10px; width: 10px; background-color: #22c55e;"></span>
      </span>
      <span style="font-size: 11px; font-weight: 800; color: #15803d; letter-spacing: 0.05em;">LIVE</span>
    </div>
  `,
  iconSize: [0, 0], // The size is dictated by the HTML content
  iconAnchor: [0, 0] // Center it precisely on the coordinate
});

// Custom HTML Icon for the Passenger
const passengerIcon = L.divIcon({
  className: 'custom-passenger-icon',
  html: `
    <div style="transform: translate(-50%, -50%); display: inline-flex; align-items: center; justify-content: center; height: 16px; width: 16px; background-color: #3b82f6; border: 2px solid white; border-radius: 9999px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);"></div>
  `,
  iconSize: [0, 0],
  iconAnchor: [0, 0]
});

// Helper component to auto-pan the map
function AutoCenter({ location, trackedLocation }) {
  const map = useMap();
  useEffect(() => {
    // Priority 1: Focus on the specifically searched vehicle
    if (trackedLocation && trackedLocation.lat && trackedLocation.lng) {
      map.flyTo([trackedLocation.lat, trackedLocation.lng], 16, { animate: true });
      return;
    }
    // Priority 2: Focus on the passenger's own location
    if (location && location.lat && location.lng) {
      map.flyTo([location.lat, location.lng], 14, { animate: true });
    }
  }, [location, trackedLocation, map]);
  return null;
}

export default function LiveMap({ buses = [], activeVehicles = {}, passengerLocation = null, trackedVehicle = null }) {
  const { t } = useLanguage();
  // Center roughly around VIT Bhopal
  const defaultCenter = [23.0775, 76.8513];
  
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('liveMapTitle')}</h2>
      <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-gray-300 shadow-inner z-0">
        <MapContainer center={defaultCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
          <AutoCenter 
            location={passengerLocation} 
            trackedLocation={trackedVehicle ? activeVehicles[trackedVehicle] : null} 
          />
          
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Passenger's Own Location Marker */}
          {passengerLocation && (
            <Marker 
              position={[passengerLocation.lat, passengerLocation.lng]} 
              icon={passengerIcon}
              zIndexOffset={900}
            >
              <Popup>
                <div className="font-bold text-blue-700">You are here</div>
              </Popup>
            </Marker>
          )}

          {/* All Global Active Vehicles */}
          {Object.values(activeVehicles).map((vehicle) => (
            <Marker 
              key={vehicle.id}
              position={[vehicle.lat, vehicle.lng]} 
              icon={livePulseIcon}
              zIndexOffset={1000}
            >
              <Popup>
                <div className="font-sans">
                  <h3 className="font-bold text-gray-900 text-sm mb-1 uppercase">{vehicle.id}</h3>
                  <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded capitalize">
                    {vehicle.vehicleType || 'Vehicle'}
                  </span>
                  <div className="mt-2 text-xs text-gray-500">
                    Speed: {Math.round((vehicle.speed || 0) * 3.6)} km/h
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {buses.map(bus => {
            const isDelayed = bus.status !== 'On Time';
            return (
              <Marker 
                key={bus.id} 
                position={[bus.lat, bus.lng]} 
                icon={isDelayed ? iconRed : iconBlue}
              >
                <Popup>
                  <div className="font-sans">
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{bus.route}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      !isDelayed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {!isDelayed ? t('statusOnTime') : t('statusDelayed')}
                    </span>
                    <div className="mt-2 text-xs">
                      {t('etaLabel')} <strong>{bus.eta}</strong>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
