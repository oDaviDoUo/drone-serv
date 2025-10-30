// AddBetweenMarker.tsx
import React from 'react'
import { Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import * as turf from '@turf/turf' 
import {useMissionStore , newPointTemplate} from '../store/missionStore'

const addIcon = L.divIcon({
  className: 'marker-icon-container',
  html: `<div class="add-marker-button">+</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

export function AddBetweenMarker() {

  const points = useMissionStore((s) => s.points)
  const activeId = useMissionStore((s) => s.activeId)
  const insertPointAt = useMissionStore((s) => s.insertPointAt)

  const map = useMapEvents({})

  if (!activeId || points.length < 2) return null

  const activeIndex = points.findIndex(p => p.id === activeId)

  if (activeIndex < 1) return null 

  const pointA = points[activeIndex - 1]
  const pointB = points[activeIndex]
  
  const from = turf.point([pointA.lng, pointA.lat])
  const to = turf.point([pointB.lng, pointB.lat])
  const midpoint = turf.midpoint(from, to)

  const [midLng, midLat] = midpoint.geometry.coordinates

  const handleClick = (e: L.LeafletMouseEvent) => {
    L.DomEvent.stopPropagation(e)
    console.log(midLat, midLng)
    insertPointAt(activeIndex, newPointTemplate(midLat, midLng))
  }

  return (
    <Marker
      position={[midLat, midLng]}
      icon={addIcon}
      eventHandlers={{
        click: handleClick,
        dblclick: handleClick,
      }}
      opacity={0.8}
    />
  )
}