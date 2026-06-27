import React, { useEffect, useRef } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import { Warehouse } from 'lucide-react';
import useStationsStore from '@/store/useStationsStore';
import { useWeatherStore } from '@/store/useWeatherStore';

export const StationMarkers = () => {
  const map = useMap();
  const stations = useStationsStore((s) => s.stations);
  const { activeStationId, openStation } = useWeatherStore();
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (activeStationId) {
      const activeStation = stations.find(s => s.id === activeStationId);
      if (activeStation) {
        const stationLatLng = L.latLng(activeStation.lat, activeStation.lng);
        const isVisible = map.getBounds().contains(stationLatLng);

        if (!isVisible) {
          map.flyTo(stationLatLng, map.getZoom(), { duration: 1, easeLinearity: 0.25 });
        }
        const marker = markersRef.current[activeStationId];
        if (marker) {
          marker.closePopup();
        }
      }
    }
  }, [activeStationId, map, stations]);

  const createStationIcon = (status: string, isActive: boolean) => {
    const config = {
      'ONLINE': { bg: 'rgba(34, 197, 94, 0.5)', border: 'rgba(34, 197, 94, 0.75)', extraClass: '' },
      'MAINTENANCE': { bg: 'rgba(249, 115, 22, 0.5)', border: 'rgba(249, 115, 22, 0.75)', extraClass: '' },
      'ERROR': { bg: 'rgba(239, 68, 68, 0.5)', border: 'rgba(239, 68, 68, 0.85)', extraClass: 'marker-pulse' },
      'OFFLINE': { bg: 'rgba(51, 51, 51, 0.5)', border: 'rgba(51, 51, 51, 0.75)', extraClass: '' },
    }[status] || { bg: 'rgba(59, 130, 246, 0.4)', border: 'rgba(59, 130, 246, 0.7)', extraClass: '' };

    const iconSVG = renderToString(
      <Warehouse size={22} color="white" strokeWidth={2} style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' }} />
    );

    const activeClass = isActive ? 'active-station' : '';

    return L.divIcon({
      className: 'custom-station-marker',
      html: `
        <div class="marker-pin ${config.extraClass} ${activeClass}" 
             style="background-color: ${config.bg}; border-color: ${config.border} !important;">
          ${iconSVG}
          ${isActive ? '<div class="active-ring"></div>' : ''}
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20], 
      popupAnchor: [0, -20]
    });
  };

  return (
    <>
      {stations.map((station) => {
        const hasWeather = !!station.sensorData;
        const isActive = station.id === activeStationId;

        return (
          <Marker
            key={station.id}
            position={[station.lat, station.lng]}
            icon={createStationIcon(station.status, isActive)}
            zIndexOffset={isActive ? 1000 : 0}
            ref={(el) => { if (el) markersRef.current[station.id] = el; }}
            eventHandlers={{
              click: (e) => {
                if (hasWeather) {
                  // ЕСЛИ ЕСТЬ ДАННЫЕ: Открываем панель и ЗАКРЫВАЕМ попап (он не нужен)
                  openStation(station.id);
                  e.target.closePopup(); 
                } 
                // ЕСЛИ НЕТ ДАННЫХ: Leaflet сам откроет попап (стандартное поведение)
              },
            }}
          >
            <Popup className="station-popup">
               <div className="font-jura text-white min-w-[140px]">
                <h3 className="font-bold border-b border-white/20 mb-2 pb-1">{station.name}</h3>
                <p className="text-xs opacity-90">Status: {station.status}</p>
                <p className="text-xs opacity-90">Capacity: {station.dockedCount}/{station.maxCapacity}</p>
                {!hasWeather && (
                  <p className="text-[10px] mt-2 text-orange-400 italic">No telemetry data available</p>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

