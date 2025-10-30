// src/components/PointsQuickNav.tsx (Финальная версия с исправлениями)
import React, { useRef, useEffect, useMemo } from 'react'
import { useMissionStore } from "@/store/missionStore"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MapPin, AlertTriangle } from "lucide-react"

// Условная ширина одной кнопки + отступ (для скролла)
const ITEM_WIDTH = 40 + 16;
const MAX_VISIBLE_ITEMS = 6; 

export function PointsQuickNav() {
  const points = useMissionStore((s) => s.points)
  const activeId = useMissionStore((s) => s.activeId)
  const setActive = useMissionStore((s) => s.setActive)

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
    
    const itemPosition = activeIndex * ITEM_WIDTH

    if (itemPosition < container.scrollLeft || itemPosition > container.scrollLeft + scrollableAreaWidth - ITEM_WIDTH) {
      
      container.scrollTo({
        left: itemPosition,
        behavior: 'smooth'
      })
    }
  }, [activeIndex, scrollableAreaWidth])

  const totalErrors = getTotalErrorCount();

  if (points.length === 0) return null

  return (
    <div className="fixed top-26 left-[80px] w-86 z-[1000] flex flex-col items-center">
      <div className="relative z-[1001] -top-1 flex justify-center w-full"> 
        <div className="flex items-center gap-1 px-10  bg-neutral-800/75 backdrop-blur-xs border border-neutral-100/35 rounded-lg text-blue-400 font-semibold text-xl">
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
                <div key={p.id} className="flex-shrink-0">
                  <Button
                    onClick={() => setActive(p.id)}
                    className={`
                      w-10 h-10 p-0 rounded-full text-xl font-bold 
                      border transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-400 border-none text-white' 
                        : hasErrors 
                        ? 'bg-red-600/30 border-red-500 text-white hover:bg-red-600/70'
                        : 'bg-transparent border-white/50 text-white/90 hover:bg-white/10' 
                      }
                    `}
                  >
                    {idx + 1}
                  </Button>
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