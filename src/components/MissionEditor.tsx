// MissionEditor.tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next';
import { MapContainer, useMap, TileLayer, Polyline, useMapEvents } from 'react-leaflet'
import L, { LatLngExpression, LeafletMouseEvent } from 'leaflet'
import * as turf from '@turf/turf'
import { GeoJSON } from 'react-leaflet';
import { toast } from 'sonner';

// Stores
import { useMapStore } from "@/store/useMapStore";
import { useMissionStore, newPointTemplate } from '@/store/missionStore' 
import { useMissionsListStore } from '@/store/useMissionsListStore';
import useDronesStore from '@/store/useDronesStore';
import useStationsStore from '@/store/useStationsStore';
import { useLogStore } from '@/store/useLogStore';
import { useUIStore } from '@/store/uiStore';
import { useTelemetryStore } from '@/store/useTelemetryStore';

// Hooks & API
import { useGeolocationOnLoad } from '@/hooks/useGeolocationOnLoad';
import { fetchFlyZones } from '@/config/clientApi';
import { convertToGeoJSON } from './helpers/flyzonesAdapter';

// Components
import { MemoizedMissionPointMarker } from './MissionPointMarker'
import { AddBetweenMarker } from './AddBetweenMarker'
import { PlaneMarker } from './PlaneMarker'
import { TopNavbar } from './TopNavbar'
import { IconSidebar } from './IconSidebar'
import { MarkerInfoPanel } from './MarkerInfoPanel'
import { PointsQuickNav } from './PointsQuickNav'
import { LogPanel } from './helpers/LogPanel';
import { ChartPanel } from './ChartPanel';
import { CalendarPanel } from './CalendarPanel';
import { ManageHelper } from './helpers/ManageHelper';
import { DeviceDialog } from './modals/DeviceDialog';
import { StationMarkers } from './StationMarkers';
import WeatherPanel from './helpers/WeatherPanel';
import { MissionStarter } from './helpers/MissionStarter';
import { MobileDrawer } from './modals/MobileDrawer';
import { StreamManagerDialog } from './modals/StreamManagerDialog';
import { ContactsDialog } from './modals/InfoDialog';

// Import New Component
import { LoginScreen } from './LoginScreen'; 
import { EventCalendar } from './calendar/components';
import EventCalendarMaster from './helpers/EventCalendar';

// --- Вспомогательные компоненты для карты (можно вынести в отдельные файлы при желании) ---
function MapClickHandler() {
  const addPoint = useMissionStore((s) => s.addPoint)
  const setActive = useMissionStore((s) => s.setActive)
  useMapEvents({
    dblclick: (e: LeafletMouseEvent) => {
      const newPoint = newPointTemplate(e.latlng.lat, e.latlng.lng)
      addPoint(newPoint)
      setActive(newPoint.id)
    },
    click: () => setActive(null)
  })
  return null
}

function MapInitializer({ defaultLat, defaultLon, children }: { defaultLat: number, defaultLon: number, children: React.ReactNode }) {
  const [center, setCenter] = useState<LatLngExpression>([defaultLat, defaultLon]);
  const [zoom, setZoom] = useState(13);
  const [isLoading, setIsLoading] = useState(true);
  const setInitialCenter = useCallback((lat: number, lon: number) => {
    setCenter([lat, lon]);
    setZoom(12); 
    setIsLoading(false);
  }, []);

  useGeolocationOnLoad(setInitialCenter);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
        if(isLoading) setIsLoading(false);
      }, 1500);
      return () => clearTimeout(timeout);
    }, [isLoading]);

    if (isLoading) {
      return <div className="h-full w-full flex items-center justify-center text-xl bg-slate-900">Загрузка карты...</div>
  }

  return (
    <MapContainer 
      center={center} zoom={zoom} className="h-full" 
      doubleClickZoom={false} zoomControl={false} attributionControl={false}
    >
        {children}
    </MapContainer>
  );
}

function BoundsUpdater({ onBoundsChange }: { onBoundsChange: (bounds: L.LatLngBounds) => void }) {
    const map = useMap();
    useEffect(() => { onBoundsChange(map.getBounds()); }, []);
    useMapEvents({ moveend: () => onBoundsChange(map.getBounds()) });
    return null;
}

function MapMover({ onReady }: { onReady: (flyFunc: (lat: number, lon: number) => void) => void }) {
    const map = useMap();
    const flyToLocation = useCallback((lat: number, lon: number, zoom: number = 13) => {
        map.flyTo([lat, lon], zoom, { duration: 1.5 });
    }, [map]);
    useEffect(() => { onReady(flyToLocation); }, [onReady, flyToLocation]);
    return null;
}

// --- Main Component ---

export default function MissionEditor() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const setFlyZonesData = useUIStore(s => s.setFlyZonesData);
  const setIsLoadingFlyZones = useUIStore(s => s.setIsLoadingFlyZones);
  const flyZonesData = useUIStore(s => s.flyZonesData);
  const showFlyZones = useUIStore(s => s.showFlyZones);
  const updateTelemetry = useTelemetryStore((s) => s.updateTelemetry);
  const addLog = useLogStore((s) => s.addLog);
  
  const loadMissions = useMissionsListStore(s => s.loadMissions); 
  const loadDrones = useDronesStore(s => s.loadDrones);
  const loadStations = useStationsStore(s => s.loadStations);

  const isLoadingDrones = useDronesStore(s => s.isLoading);
  const isDronesEmpty = useDronesStore(s => s.isDronesEmpty);
  const isLoadingStations = useStationsStore(s => s.isLoading);
  const isStationsEmpty = useStationsStore(s => s.isStationsEmpty);

  const layer = useMapStore((s) => s.layer) as "streets" | "satellite";
  const tileLayers = {
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    streets: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  };

  const points = useMissionStore((s) => s.points)
  const activeId = useMissionStore((s) => s.activeId)
  const setActive = useMissionStore((s) => s.setActive)
  const removePoint = useMissionStore((s) => s.removePoint)
  
  const defaultLat = 56.95;
  const defaultLon = 24.11;

  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null); 
  const [flyToMap, setFlyToMap] = useState<((lat: number, lon: number) => void) | null>(null);

  const handleBoundsChange = useCallback((bounds: L.LatLngBounds) => {
      setMapBounds((prev) => {
          if (prev && prev.equals(bounds)) return prev;
          return bounds;
      });
  }, []);

  const totalDistance = useMemo(() => {
    if (points.length < 2) return 0
    const coords = points.map(p => [p.lng, p.lat])
    const line = turf.lineString(coords)
    return turf.length(line, { units: 'kilometers' }).toFixed(2)
  }, [points])

  // Key handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'Escape') setActive(null)
      if ((e.key === 'Delete') && activeId) removePoint(activeId)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [activeId, points.length, removePoint, setActive])

  const handleMapReady = useCallback((flyFunc: (lat: number, lon: number) => void) => {
      setFlyToMap(() => flyFunc);
  }, []);

  // Logout Logic
  const handleLogout = useCallback(() => {
        localStorage.removeItem('accessToken'); 
        setIsAuthorized(false);
    }, []); 

  // Data Loading Effect (срабатывает, когда isAuthorized становится true)
    useEffect(() => {
      if (!isAuthorized) {
          useMissionsListStore.setState({ missions: [] });
          useDronesStore.getState().clear(); 
          useStationsStore.getState().clear();
          return;
      }

      const load = async () => {
          try {
              await Promise.all([
                    loadMissions(),
                    loadDrones(),
                    loadStations(),
                ]);
                setIsLoadingFlyZones(true);
                const data = await fetchFlyZones();
                const geojson = convertToGeoJSON(data.features);
                setFlyZonesData(geojson);
                setIsLoadingFlyZones(false);
              addLog("All essential data loaded successfully.","success")
          } catch (error: any) {
                addLog("Failed to load essential data","error")
                toast.error("Ошибка загрузки данных", {
                    description: "Возможно, истек срок действия вашей сессии.",
                });
                handleLogout(); 
          } 
      };
      
      load();
  }, [isAuthorized, loadMissions, loadDrones, loadStations, handleLogout, addLog, setFlyZonesData, setIsLoadingFlyZones]);

  // WebSocket Effect
  useEffect(() => {
    if (!isAuthorized) return;

    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);

    ws.onopen = () => addLog('WebSocket connected', 'success');
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.entity === 'drone' && msg.type === 'telemetry' && msg.data) {
           updateTelemetry(msg.entityId, msg.data);
        }
      } catch (e) {
        console.error("WS Parse error", e);
      }
    }
    ws.onclose = () => addLog('WebSocket disconnected', 'warn');
    ws.onerror = (err) => addLog(`WS error:`, 'error');

    return () => ws.close();
  }, [isAuthorized, addLog, updateTelemetry]);

  return (
    <div className="h-screen flex flex-row overflow-hidden bg-slate-900 text-white relative">
      
      <main 
        className={`flex-1 relative transition-all duration-500 ${
          isAuthorized ? "blur-0" : "blur-2xl brightness-50"
        }`}
      > 
      
        <TopNavbar onSelectLocation={flyToMap} onRequestLogin={handleLogout} isAuthorized={isAuthorized}/>
        <MapInitializer defaultLat={defaultLat} defaultLon={defaultLon}>
          <TileLayer url={tileLayers[layer]} key={layer} />
          <MapClickHandler />
          <MapMover onReady={handleMapReady} />
          <BoundsUpdater onBoundsChange={handleBoundsChange} />
          <StationMarkers />
          {points.length >= 2 && (
            <Polyline pathOptions={{ color: '#fff', weight: 2, opacity: 0.8 }}
              positions={points.map((p) => [p.lat, p.lng]) as LatLngExpression[]} 
            />
          )}
          {points.map((p, idx) => (
            <MemoizedMissionPointMarker key={p.id} point={p} index={idx}/>
          ))}
          <AddBetweenMarker />
          <PlaneMarker />

          {flyZonesData && showFlyZones && (
            <GeoJSON
              data={flyZonesData}
              style={{ color: "red", opacity: 0.35 }}
              onEachFeature={(feature, layer) => {
                layer.bindPopup(feature.properties?.name || "No-Fly Zone");
              }}
            />
          )}
        </MapInitializer>
        
        <IconSidebar />
        
        {points.length > 0 && (
          <>
          <div className='fixed top-16 left-1 right-1 lg:right-auto lg:left-[80px]  z-[1000] flex flex-col gap-1 xl:gap-4'>
            {isAuthorized && !isLoadingDrones && isDronesEmpty && (
              <ManageHelper type="drone" />
            )}
            {isAuthorized && !isLoadingStations && isStationsEmpty && (
              <ManageHelper type="station" />
            )}
            <div className={(
            (isAuthorized && !isLoadingDrones && isDronesEmpty) ||
            (isAuthorized && !isLoadingStations && isStationsEmpty)
            ) ? 'mt-0 xl:mt-0'
              : 'mt-0 xl:mt-10'}> 
                <PointsQuickNav onFlyTo={flyToMap} mapBounds={mapBounds}/> 
            </div>
            <MarkerInfoPanel
              points={points}
              activeId={activeId}
              totalDistance={totalDistance}
              onFlyTo={flyToMap}
            />
          </div>
          </>
        )}

        <LogPanel/>
        <WeatherPanel/>
        <ChartPanel/>
        <ContactsDialog/>
        <CalendarPanel />
        <MissionStarter/>
        <DeviceDialog/>
        <MobileDrawer/>
        <StreamManagerDialog/>
      </main>
      
        
      {!isAuthorized && (
        <LoginScreen onLoginSuccess={() => setIsAuthorized(true)} />
      )}
      <style jsx global>{`
          .leaflet-container,
          .leaflet-tile-pane {
            background-color: #041c1e;
            background-image:
              repeating-linear-gradient(
                90deg,
                rgba(255,255,255,0.04) 0,
                rgba(255,255,255,0.04) 1px,
                transparent 1px,
                transparent 28px
              ),
              repeating-linear-gradient(
                0deg,
                rgba(255,255,255,0.04) 0,
                rgba(255,255,255,0.04) 1px,
                transparent 1px,
                transparent 28px
              ),  
            linear-gradient(180deg, rgba(96,165,250,0.02), rgba(2,6,23,0.02));
            background-blend-mode: normal, normal, overlay;
            background-size: auto;
          }
          @keyframes grid-scroll {
            from { background-position: 0 0, 0 0, 0 0; }
            to { background-position: 28px 28px, 28px 28px, 28px 28px; }
          }

          .leaflet-container {
            animation: grid-scroll 60s linear infinite;
          }
          .leaflet-container.tiles-loaded {
            transition: background 0.35s ease, background-image 0.35s ease, opacity 0.35s ease;
            background-image:
              repeating-linear-gradient(
                90deg,
                rgba(255,255,255,0.02) 0,
                rgba(255,255,255,0.02) 1px,
                transparent 1px,
                transparent 28px
              ),
              repeating-linear-gradient(
                0deg,
                rgba(255,255,255,0.02) 0,
                rgba(255,255,255,0.02) 1px,
                transparent 1px,
                transparent 28px
              ),
              linear-gradient(180deg, rgba(96,165,250,0.01), rgba(2,6,23,0.01));
          }

          .marker-root {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: rgba(51, 51, 51, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.75);
            transform-origin: center;
            transition: transform 0.2s ease-out, box-shadow 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            font-weight: bold;
            font-family: var(--font-jura, sans-serif);
            position: relative;
          }
          .marker-root.active {
            transform: scale(1.3);
            background: #39AF96;
            box-shadow: 0 6px 16px rgba(74,168,240,0.18);
          }

          .marker-root.active::after {
            content: '';
            position: absolute;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            top: -13px;
            left: -13px;
            box-shadow: 0 0 0 1.2px #39AF96;
            animation: pulse 1.4s infinite ease-in-out;
          }
          .marker-root.passed {
            background-color: #42A660;
          }
          @keyframes pulse {
            0% { transform: scale(0.6); opacity: 0.3 }
            50% { transform: scale(1); opacity: 0.9 }
            100% { transform: scale(0.6); opacity: 0.3 }
          }

          .add-marker-button {
            width: 32px;
            height: 32px;
            border-radius: 10px;
            background: transparent;
            border: 2px solid #00d5be;
            color: #00d5be;
            font-size: 20px;
            font-weight: bold;
            line-height: 30px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .add-marker-button:hover {
            transform: scale(1.2);
            background: transparent;
            color: #00d5be;
            border: 2px solid #00d5be;
          }
          .plane-marker-icon {
            font-size: 24px;
          }

          .plane-marker {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: linear-gradient(135deg,#f97316,#fb7185);
            display: flex;
            align-items:center;
            justify-content:center;
            color: white;
            font-size:12px;
            text-align:center;
          }
        `}</style>
    </div>
  )
}


        
    