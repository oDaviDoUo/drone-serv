// PlaneMarker.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useMissionStore } from '../store/missionStore'
import { Button } from '@/components/ui/button'
import * as turf from '@turf/turf'
import '../components/styles/popup.css'

// Иконка самолета
const planeIcon = L.divIcon({
  className: 'plane-marker-icon',
  html: `✈️`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

export function PlaneMarker() {
  const points = useMissionStore((s) => s.points)
  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number | null>(null)

  const pathLine = useMemo(() => {
    if (points.length < 2) return null
    const coords = points.map((p) => [p.lng, p.lat])
    return turf.lineString(coords)
  }, [points])

  useEffect(() => {
    if (!pathLine) {
      setProgress(0)
      return
    }

    const totalDurationMs = 100000 
    let startTime: number | null = null

    const step = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp
      }

      const elapsedTime = timestamp - startTime
      let newProgress = elapsedTime / totalDurationMs

      if (newProgress >= 1) {
        newProgress = 0 // Зацикливаем
        startTime = timestamp // Начинаем заново
      }
      
      setProgress(newProgress)
      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)

    // Очистка при размонтировании компонента
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [pathLine]) // Перезапускаем анимацию, если путь (pathLine) изменился

  // 3. Вычисляем текущую позицию на основе прогресса
  const currentPos = useMemo(() => {
    if (!pathLine) return null

    // turf.along() берет линию и дистанцию
    const totalDistance = turf.length(pathLine, { units: 'kilometers' })
    const currentDistance = totalDistance * progress
    
    const pointOnLine = turf.along(pathLine, currentDistance, { units: 'kilometers' })

    // turf.along() возвращает [lng, lat]
    const [lng, lat] = pointOnLine.geometry.coordinates
    
    // Leaflet <Marker> хочет [lat, lng]
    return [lat, lng] as [number, number] 
  }, [pathLine, progress]) // Пересчитываем, только если изменился путь или прогресс

  // 4. Рендерим обычный <Marker> в этой точке
  if (!currentPos) {
    return null // Не рендерим, если нет пути
  }

  return (
    <Marker
      position={currentPos}
      icon={planeIcon}
    >
      <Popup className="plane-popup" autoClose={false}>
        <div className="w-48">
          <h4 className="font-semibold">Дрон "Альфа"</h4>
          <div className="text-sm">Скорость: 12 м/с</div>
          <div className="text-sm">Высота: 45 м</div>
          <div className="text-sm">Батарея: 78%</div>
          <Button size="sm" className="mt-2 w-full" style={{borderRadius: 20,  backgroundColor: '#4AA8F0'}}>
            Смотреть видео
          </Button>
        </div>
      </Popup>
    </Marker>
  )
}