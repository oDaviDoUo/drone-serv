// src/components/PointsQuickNav.tsx (Финальная версия с исправлениями)
import React, { useRef, useEffect, useMemo } from 'react'
import { useMissionStore } from "@/store/missionStore"
import { MissionPoint } from '@/lib/types'
import L, { LatLngBounds } from 'leaflet'
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MapPin, AlertTriangle } from "lucide-react"
import { Badge } from './ui/badge'

// Условная ширина одной кнопки + отступ (для скролла)
const ITEM_WIDTH = 40 + 16;
const MAX_VISIBLE_ITEMS = 6; 

interface PointsQuickNavProps {
    onFlyTo: ((lat: number, lon: number) => void) | null;
    mapBounds: LatLngBounds | null;
}

export function PointsQuickNav({ onFlyTo, mapBounds }: PointsQuickNavProps) {
  const points = useMissionStore((s) => s.points)
  const activeId = useMissionStore((s) => s.activeId)
  const setActive = useMissionStore((s) => s.setActive)

  const handlePointClick = (pointId: string) => {
    setActive(pointId); 
    
    const point = points.find(p => p.id === pointId);
    if (!point) return;

    if (!onFlyTo) {
        console.warn(`[PNV] 🔴 FLYTO ERROR: Функция onFlyTo не доступна (null). Точка: ${point.name}`);
        return;
    }

    const isVisible = isPointVisible(point);

    if (isVisible) {
        console.log(`[PNV] 🟡 FLYTO SKIP: Точка '${point.name}' (ID: ${pointId}) уже видима на карте.`);
    } else {
        console.log(`[PNV] 🟢 FLYTO CALL: Карта летит к точке '${point.name}' (${point.lat}, ${point.lng}).`);
        onFlyTo(point.lat, point.lng); 
    }
};

const isPointVisible = (point: MissionPoint) => {
    if (!mapBounds) {
        console.log(`[PNV] 🟡 BOUNDS ERROR: mapBounds null. Точка '${point.name}' считается видимой.`);
        return true; 
    }
    
    if (!onFlyTo) return true;
    
    const latLng = L.latLng(point.lat, point.lng);
    
    const contains = mapBounds.contains(latLng);
  
    return contains; 
};

  const getTotalErrorCount = useMissionStore((s) => s.getTotalErrorCount)
  const getValidationErrors = useMissionStore((s) => s.getValidationErrors)

  const activeIndex = points.findIndex(p => p.id === activeId)
  const pointsContainerRef = useRef<HTMLDivElement>(null)
  
  const scrollableAreaWidth = useMemo(() => {
    return 384 - 40 - 40 - 16; 
  }, [])
  
  const scroll = (direction: 'left' | 'right') => {
    if (!pointsContainerRef.current) return
    
    const container = pointsContainerRef.current
    const currentScroll = container.scrollLeft
    
    const scrollAmount = Math.min(
        MAX_VISIBLE_ITEMS * ITEM_WIDTH, 
        container.scrollWidth - scrollableAreaWidth
    );
    
    const newScroll = direction === 'left' 
      ? currentScroll - scrollAmount
      : currentScroll + scrollAmount
 
    container.scrollTo({
      left: Math.max(0, Math.min(newScroll, container.scrollWidth - scrollableAreaWidth)),
      behavior: 'smooth'
    })
  }

  useEffect(() => {
    const container = pointsContainerRef.current
    if (!container || activeIndex === -1) return

    const itemStart = activeIndex * ITEM_WIDTH
    const itemEnd = itemStart + ITEM_WIDTH

    const viewStart = container.scrollLeft
    const viewEnd = viewStart + scrollableAreaWidth

    if (itemStart >= viewStart && itemEnd <= viewEnd) {
      return
    }

    // Точка левее видимой области
    if (itemStart < viewStart) {
      container.scrollTo({
        left: itemStart,
        behavior: 'smooth',
      })
      return
    }

    if (itemEnd > viewEnd) {
      container.scrollTo({
        left: itemEnd - scrollableAreaWidth,
        behavior: 'smooth',
      })
    }
  }, [activeIndex, scrollableAreaWidth])


  const totalErrors = getTotalErrorCount();

  if (points.length === 0) return null

  return (
    <div className="left-[80px] w-86 z-[1000] hidden lg:flex flex-col items-center">
      <div className="relative z-[1001] -top-1.5 flex justify-center w-full"> 
        <div className="flex items-center gap-1 px-10  bg-neutral-800/75 backdrop-blur-xs border border-neutral-100/35 rounded-lg text-teal-500 font-semibold text-xl">
          <MapPin className="h-4 w-4" />
          {points.length}
          {totalErrors > 0 && (
            <div className="ml-2 flex  items-center text-red-500 font-semibold text-xl">
              <AlertTriangle className="h-5 w-5 mr-1" />
                {totalErrors}
            </div>
          )}
        </div>
      </div>
      <div className="relative w-full -mt-3 ">
        <div className="flex items-center p-2 bg-neutral-800/75 backdrop-blur-xs border border-neutral-100/35 rounded-xl shadow-lg">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => scroll('left')}
            className="w-5 h-10 text-white/70 flex-shrink-0"
            
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div 
            ref={pointsContainerRef}
            className="flex flex-1 space-x-2 overflow-x-hidden overflow-y-hidden px-1"
            style={{ width: `${scrollableAreaWidth}px` }}
          > 
            {points.map((p, idx) => {
              const isActive = activeId === p.id
              const hasErrors = getValidationErrors(p).length > 0;
              
              return (
                <div key={p.id} className="relative flex-shrink-0">
                  <Button
                    onClick={() => handlePointClick(p.id)}
                    className={`
                      w-10 h-10 p-0 rounded-lg text-xl font-bold 
                      border transition-all duration-200
                      ${isActive 
                        ? 'bg-teal-600 border-none text-white' 
                        : hasErrors 
                        ? 'bg-red-600/30 border-red-500 text-white hover:bg-red-600/70'
                        : 'bg-transparent border-white/50 text-white/90 hover:bg-white/10' 
                      }
                    `}
                  >
                    {idx + 1}
                  </Button>
                  {p.actions.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="
                      absolute -top-0 -right-1
                      h-4 min-w-4 px-1
                      flex items-center justify-center
                      rounded-full
                      bg-neutral-800 border border-white/30
                      text-white
                      pointer-events-none
                    "
                  >
                    {p.actions.length}
                  </Badge>
                )}

                </div>
              )
            })}
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => scroll('right')}
            className="w-5 h-10 text-white/70  flex-shrink-0"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}