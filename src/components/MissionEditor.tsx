// MissionEditor.tsx
import React, { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Polyline, useMapEvents } from 'react-leaflet'
import L, { LatLngExpression, LeafletMouseEvent } from 'leaflet'
import * as turf from '@turf/turf'
import { useMissionStore, newPointTemplate } from '@/store/missionStore' 
import { Button } from '@/components/ui/button'
import { MemoizedMissionPointMarker } from './MissionPointMarker'
import { AddBetweenMarker } from './AddBetweenMarker'
import { PlaneMarker } from './PlaneMarker'

import { TopNavbar } from './TopNavbar'
import { IconSidebar } from './IconSidebar'
import { MarkerInfoPanel } from './MarkerInfoPanel'
import { PointsQuickNav } from './PointsQuickNav'

import DualJoysticks from './DualJoysticks';

function MapClickHandler() {
  const addPoint = useMissionStore((s) => s.addPoint)
  const setActive = useMissionStore((s) => s.setActive)

  useMapEvents({
    dblclick: (e: LeafletMouseEvent) => {
      const newPoint = newPointTemplate(e.latlng.lat, e.latlng.lng)
      addPoint(newPoint)
      setActive(newPoint.id)
    },
    click: () => {
      setActive(null) 
    }
  })
  return null
}

// ---------- Основной компонент ----------
export default function MissionEditor() {
  const points = useMissionStore((s) => s.points)
  const activeId = useMissionStore((s) => s.activeId)
  
  // Функции можно брать отдельно
  const setActive = useMissionStore((s) => s.setActive)
  const removePoint = useMissionStore((s) => s.removePoint)
  
  const mapCenter: LatLngExpression = [56.95, 24.11] 

  const totalDistance = useMemo(() => {
    if (points.length < 2) return 0
    const coords = points.map(p => [p.lng, p.lat])
    const line = turf.lineString(coords)
    return turf.length(line, { units: 'kilometers' }).toFixed(2)
  }, [points])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'Escape') setActive(null)
      if ((e.key === 'Delete') && activeId) {
        removePoint(activeId)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [activeId, points.length, removePoint, setActive])
  
  return (
    <div className="h-screen flex flex-row overflow-hidden bg-slate-900 text-white">
      
      <TopNavbar />
      <main className="flex-1 relative mt-0"> 
        <MapContainer 
          center={mapCenter} 
          zoom={13} 
          className="h-full" 
          doubleClickZoom={false} 
          zoomControl={false}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />

          <MapClickHandler />
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
        </MapContainer>
        
        <IconSidebar />
        
        {points.length > 0 && (
          <>
            <PointsQuickNav /> 
            <MarkerInfoPanel 
              points={points}
              activeId={activeId}
              totalDistance={totalDistance}
            />
          </>
        )}


        {/* <div className="absolute bottom-4 right-4 z-[2000] pointer-events-none">
          <DualJoysticks />
        </div> */}
        
        
      </main>

        <style jsx global> {`

        .leaflet-container,
          .leaflet-tile-pane {
            background-color: #0f172a;
            background-image:
              repeating-linear-gradient (
                0deg,
                rgba(0, 200, 255, 0.08) 0,
                rgba(0, 200, 255, 0.08) 1px,
                transparent 1px,
                transparent 25px
              ),
              repeating-linear-gradient(
                90deg,
                rgba(0, 200, 255, 0.08) 0,
                rgba(0, 200, 255, 0.08) 1px,
                transparent 1px,
                transparent 25px
              );
            background-size: 100% 100%;
          }

          @keyframes grid-scroll {
            from { background-position: 0 0, 0 0; }
            to { background-position: 25px 25px, 25px 25px; }
          }

          .leaflet-container {
            animation: grid-scroll 30s linear infinite;
          }
          .marker-root { 
            width: 24px;
            height: 24px;
            border-radius: 50%; 
            background: rgba(51, 51, 51, 0.5); /* Выполненые будут #42A660 */
            border: 1px solid rgba(255, 255, 255, 0.75); 
           
            transform-origin: center;
            transition: transform 0.2s ease-out;

            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            font-weight: bold;

            }
            .marker-root.active { 
              transform: scale(1.3); 
              background: #4AA8F0;
            }

          .marker-root.active::after { content: ''; position: absolute; width: 48px; height: 48px; border-radius: 50%; top: -13px; left: -13px; box-shadow: 0 0 0 2px #4AA8F0; animation: pulse 1.4s infinite ease-in-out; }
            @keyframes pulse { 0% { transform: scale(0.6); opacity: 0.9 } 50% { transform: scale(1); opacity: 0.3 } 100% { transform: scale(0.6); opacity: 0.9 } }

          .add-marker-button {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: transparent;
            border: 2px solid #f0b64aff;
            color: #f0b64aff;
            
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
              color: #f0b64aff;
            }
            .plane-marker-icon {
              font-size: 24px;
            }
          /* Plane marker */
          .plane-marker { width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg,#f97316,#fb7185); display: flex; align-items:center; justify-content:center; color: white; font-size:12px; text-align:center; }
        `}</style>
    </div>
  )
}
