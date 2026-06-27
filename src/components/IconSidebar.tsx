import React from 'react'
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Layers2,
  Map,
  ChartArea,
  CalendarDays,
  Logs,
  Video,
  Compass
} from "lucide-react"

import { Toggle } from "@/components/ui/toggle"

import { useMapStore } from "@/store/useMapStore";
import { useLogStore } from "@/store/useLogStore";
import { useChartStore } from "@/store/chartStore";
import { useCalendarStore } from "@/store/calendarStore"
import { useUIStore } from "@/store/uiStore";
import { useWeatherStore } from '@/store/useWeatherStore'
import useStationsStore from '@/store/useStationsStore'
import { useTranslation } from 'react-i18next'

const IconSidebar = React.memo(function IconSidebar() {
  const {t} = useTranslation();
  const toggleLayer = useMapStore((s) => s.toggleLayer);
  const addLog = useLogStore((s) => s.addLog);
  const openDialog = useUIStore((s) => s.openDialog);
  const showFlyZones = useUIStore((s) => s.showFlyZones);
  const setShowFlyZones = useUIStore((s) => s.setShowFlyZones);
  const { isOpen: isWeatherOpen, activeStationId, openStation, close: closeWeather } = useWeatherStore();
  const stations = useStationsStore(s => s.stations);

  const handleWeatherToggle = () => {
    if (isWeatherOpen) {
      closeWeather();
    } else {
      // 1. Если уже была выбрана станция ранее - открываем её
      if (activeStationId) {
        openStation(activeStationId);
      } else {

        const firstWithData = stations.find(s => s.sensorData);
        if (firstWithData) {
          openStation(firstWithData.id);
        } else {
          addLog("No stations with weather data found", "warn");
        }
      }
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="hidden lg:flex fixed top-16 left-1 xl:left-3 z-[1000]"> 
              <Toggle 
                variant="outline" 
                size="lg" 
                className={`w-12 h-12 flex items-center justify-center bg-neutral-800/75 backdrop-blur-xs border border-neutral-100/35 rounded-lg shadow-lg text-white transition-colors
                  ${showFlyZones ? "bg-red-600/50! border-red-500/35" : "hover:bg-neutral-700"}
                `}
                pressed={showFlyZones}
                onPressedChange={setShowFlyZones}
              >
                <Layers2 className="h-5 w-5" />
              </Toggle>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="z-[1001]">
            <p>{t('flyzone')}</p>
          </TooltipContent>
        </Tooltip>

      <div className="hidden fixed top-30 left-1 xl:left-3 max-h-[calc(100vh-170px)] w-12 p-2 z-[1000] 
                      lg:flex flex-col items-center gap-1 bg-neutral-800/75 backdrop-blur-xs 
                      border border-neutral-100/35 rounded-lg shadow-lg">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={toggleLayer} variant="ghost" size="icon" className="text-white">
              <Map className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="z-[1000]">
            <p>{t('maplayer')}</p>
          </TooltipContent>
        </Tooltip>

        <div className="h-px w-full bg-neutral-100/35 my-2" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white" onClick={() => useCalendarStore.getState().toggle()}>
              <CalendarDays className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="z-[1000]">
            <p>{t('calendar')}</p>
          </TooltipContent>
        </Tooltip>

        <div className="h-px w-full bg-neutral-100/35 my-2" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white" onClick={() => openDialog("stream")}>
              <Video className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="z-[1000]">
            <p>{t('streams')}</p>
          </TooltipContent>
        </Tooltip>

        <div className="h-px w-full bg-neutral-100/35 my-2" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white" onClick={handleWeatherToggle}>
              <Compass className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="z-[1000]">
            <p>{t('weather')}</p>
          </TooltipContent>
        </Tooltip>
      
        <div className="h-px w-full bg-neutral-100/35 my-2" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => useChartStore.getState().toggle()}
              variant="ghost"
              size="icon"
              className="text-white"
            >
              <ChartArea className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="z-[1000]">
            <p>{t('Alt')}</p>
          </TooltipContent>
        </Tooltip>

        <div className="h-px w-full bg-neutral-100/35 my-2" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => useLogStore.getState().toggle()}
              variant="ghost"
              size="icon"
              className="text-white"
            >
              <Logs className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="z-[1000]">
            <p>{t('Logs')}</p>
          </TooltipContent>
        </Tooltip>

        <div className="flex-1" />
      </div>
    </TooltipProvider>
  )
});

export { IconSidebar }; // Для совместимости
export default IconSidebar; // Чтобы import IconSidebar from... работал