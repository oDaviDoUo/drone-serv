import React, { useMemo, useRef } from 'react'
import { Marker, useMapEvents } from 'react-leaflet'
import L, { LeafletMouseEvent } from 'leaflet'
import { useMissionStore } from '../store/missionStore'
import { MissionPoint } from '@/lib/types'

import { useUIStore } from '@/store/uiStore'
import { useTelemetryStore } from '@/store/useTelemetryStore'

type Props = {
  point: MissionPoint
  index: number
}

const createIcon = (id: string, index: number, isActive: boolean, isPassed: boolean) => {
  const classes = `marker-root ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`;
  return L.divIcon({
    className: 'marker-wrapper-transparent',
    html: `<div class="${classes}" data-id="${id}">
             ${index + 1} 
           </div>`, 
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

export function MissionPointMarker({ point, index }: Props & { index: number }) {
  const movePoint = useMissionStore((s) => s.movePoint)
  const setActive = useMissionStore((s) => s.setActive)
  const activeId = useMissionStore((s) => s.activeId)

  const activeDroneId = useUIStore((s) => s.activeDroneId);
  
  const currentWpIndex = useTelemetryStore((s) => 
     activeDroneId ? s.drones[activeDroneId]?.current_wp : -1
  );
  const isActive = point.id === activeId

  const isPassed = currentWpIndex !== undefined && index < currentWpIndex;
    const markerRef = useRef<L.Marker>(null)

  const icon = useMemo(() => createIcon(point.id, index, isActive, isPassed), [point.id, index, isActive, isPassed])

  const handleDrag = () => {
    const marker = markerRef.current
    if (marker) {
      const { lat, lng } = marker.getLatLng()
      movePoint(point.id, lat, lng)
    }
  }

  return (
    <Marker
      ref={markerRef}
      position={[point.lat, point.lng]}
      icon={icon}
      draggable={true}
      eventHandlers={{
        click: (e: LeafletMouseEvent) => {
          L.DomEvent.stopPropagation(e)
          setActive(point.id)
        },
        drag: handleDrag,
        dragend: handleDrag
      }}
    />
  )
}

export const MemoizedMissionPointMarker = React.memo(MissionPointMarker)