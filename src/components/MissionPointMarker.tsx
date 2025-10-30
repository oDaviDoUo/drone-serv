import React, { useMemo, useRef } from 'react'
import { Marker, useMapEvents } from 'react-leaflet'
import L, { LeafletMouseEvent } from 'leaflet'
import { useMissionStore } from '../store/missionStore'
import { MissionPoint } from '@/lib/types'

type Props = {
  point: MissionPoint
}

// ВЫНОСИМ ЛОГИКУ СОЗДАНИЯ ИКОНКИ, ЧТОБЫ КОМПОНЕНТ БЫЛ ЧИЩЕ
// 1. ИСПРАВЛЕНИЕ ЗДЕСЬ: id теперь string
const createIcon = (id: string, index: number, isActive: boolean) => {
  return L.divIcon({
    className: 'marker-wrapper-transparent', // Пустышка для Leaflet
    html: `<div class="marker-root ${isActive ? 'active' : ''}" data-id="${id}">
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
  const isActive = point.id === activeId
  const markerRef = useRef<L.Marker>(null)

  const icon = useMemo(() => createIcon(point.id, index, isActive), [point.id, index, isActive])

  // 1. Создаем функцию-обработчик
  const handleDrag = () => {
    const marker = markerRef.current
    if (marker) {
      const { lat, lng } = marker.getLatLng()
      movePoint(point.id, lat, lng) // Обновляем store
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