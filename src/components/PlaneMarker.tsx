"use client";
import React, { useEffect, useRef, useMemo } from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { renderToString } from 'react-dom/server'
import { Drone, Gauge, MapPin, BatteryFull, ArrowUpNarrowWide, Circle, Activity } from 'lucide-react'
import { useTelemetryStore } from '../store/useTelemetryStore' 
import '../components/styles/popup.css'

interface PlaneMarkerProps {
  droneId?: string; 
}

export function PlaneMarker({ droneId = "57c31257-f0a4-41a4-b825-eb0aef0c83a6" }: PlaneMarkerProps) {
  const markerRef = useRef<L.Marker>(null)

  const telemetry = useTelemetryStore((s) => s.drones[droneId]);

  useEffect(() => {
    if (telemetry && markerRef.current) {
      const newLatLng = new L.LatLng(telemetry.lat, telemetry.lng);
      markerRef.current.setLatLng(newLatLng);
      
      // Опционально: если хочешь, чтобы карта следовала за дроном, раскомментируй:
      // markerRef.current._map.panTo(newLatLng); 
    }
  }, [telemetry]); 

  const droneIcon = useMemo(() => {
    const iconHTML = renderToString(
      <div className="drone-pin">
        <Drone size={20} color="white" />
      </div>
    )
    return L.divIcon({
      className: 'drone-marker-container',
      html: iconHTML,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -20]
    })
  }, [])

  // Если данных нет, не рендерим маркер (или рендерим в дефолтной позиции 0,0)
  if (!telemetry) return null;

  return (
    <Marker position={[telemetry.lat, telemetry.lng]} icon={droneIcon} ref={markerRef}>
      <Popup className="plane-popup" autoClose={false} closeButton={false}>
        <div className="min-w-[140px] font-jura">
          <div className='flex gap-2 items-center mb-2 border-b border-white/20 pb-1'>
            <h4 className='text-lg font-bold'>Drone Alpha</h4>
            <Circle 
              color={telemetry.status === 'FLYING' ? '#22c55e' : '#eab308'} 
              fill={telemetry.status === 'FLYING' ? '#22c55e' : '#eab308'} 
              size={10} 
              className="animate-pulse"
            />
          </div>
          <div className="grid grid-cols-2 gap-y-3 gap-x-1">
            
            {/* Скорость */}
            <div className="flex items-center gap-2">
              <Gauge size={16} className='text-blue-400'/>
              <div className="text-xs">{telemetry.speed.toFixed(1)} m/s</div>
            </div>

            {/* Высота */}
            <div className="flex items-center gap-2">
              <ArrowUpNarrowWide size={16} className='text-blue-400'/>
              <div className="text-xs">{telemetry.altitude.toFixed(0)} m</div>
            </div>

            {/* Статус (вместо номера точки, так как мы не знаем текущую точку из сырой телеметрии) */}
            <div className="flex items-center gap-2">
              <Activity size={16} className='text-blue-400'/>
              <div className="text-xs">{telemetry.status}</div>
            </div>

            {/* Батарея */}
            <div className="flex items-center gap-2">
              <BatteryFull 
                size={16} 
                className={telemetry.battery < 20 ? 'text-red-500' : 'text-green-400'}
              />
              <div className="text-xs font-bold">{telemetry.battery}%</div>
            </div>

            {/* Координаты (для дебага можно вывести) */}
            <div className="col-span-2 text-[10px] text-gray-400 mt-1">
              {telemetry.lat.toFixed(5)}, {telemetry.lng.toFixed(5)}
            </div>

          </div>
        </div>
      </Popup>
    </Marker>
  )
}