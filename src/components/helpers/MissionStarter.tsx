"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Play, StopCircle, Pause, Gauge, ArrowUpNarrowWide, MapPinCheckInside, Rocket } from "lucide-react";
import { Layers,ChartArea, CalendarDays, Logs, Video, Compass} from "lucide-react"

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { useUIStore } from "@/store/uiStore";
import { useMapStore } from "@/store/useMapStore";
import { useLogStore } from "@/store/useLogStore";
import { useCalendarStore } from "@/store/calendarStore";
import { useChartStore } from "@/store/chartStore";
import { useMissionStore } from "@/store/missionStore";

import { startMissionOnDrone } from "@/config/clientApi";
import { useTelemetryStore } from "@/store/useTelemetryStore";
import { useTranslation } from "react-i18next";




export function MissionStarter() {
  const {t} = useTranslation();
  const canStartMission = useUIStore((s) => s.canStartMission);
  const isMissionRunning = useUIStore((s) => s.isMissionRunning);
  const isPaused = useUIStore((s) => s.isPaused);

  const isMissionUploaded = useUIStore((s) => s.isMissionUploaded);
  const activeDroneId = useUIStore((s) => s.activeDroneId);
  const setMissionRunning = useUIStore((s) => s.setMissionRunning);

  const droneTelemetry = useTelemetryStore((s) => 
    activeDroneId ? s.drones[activeDroneId] : undefined
  );

  const currentSpeed = droneTelemetry?.speed?.toFixed(1) || "0.0";
  const currentAlt = droneTelemetry?.altitude?.toFixed(0) || "0";
  const currentPassed = droneTelemetry?.current_wp ?? 0;

  const speed = useUIStore((s) => s.speed);
  const altitude = useUIStore((s) => s.altitude);
  const passedWaypoints = useUIStore((s) => s.passedWaypoints);

  const openDialog = useUIStore((s) => s.openDialog);
  const openDrawer = useUIStore((state) => state.openDrawer)
  const startMission = useUIStore((s) => s.startMission);
  const stopMission = useUIStore((s) => s.stopMission);
  const togglePause = useUIStore((s) => s.togglePause);

  const points = useMissionStore((s) => s.points)

  const { layer, toggleLayer } = useMapStore();
  const addLog = useLogStore((s) => s.addLog);

  const handlePrimary = async () => {
    if (isMissionRunning) {
      stopMission();
      useUIStore.getState().setMissionUploaded(false); 
      return;
    }

    if (isMissionUploaded && activeDroneId) {
      try {
        await startMissionOnDrone(activeDroneId);
        setMissionRunning(true); 
        
        toast.success("Mission started! Taking off...");
        addLog("Mission started by user", "success");
      } catch (e) {
        console.error(e);
        toast.error("Failed to start mission");
      }
      return;
    }

    
    openDialog("drone", "setup");
  };

  return (
    <AnimatePresence>
      {canStartMission && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          className="fixed bottom-5 left-1/2 z-[1100] -translate-x-1/2"
        >
          <div
            className=" lg:w-[400px]  bg-neutral-800/75 backdrop-blur-xs
              border border-neutral-100/35 rounded-lg shadow-xl
              p-3 flex flex-col justify-between text-sm"
            role="region"
            aria-label="Flight control panel"
          >
            <div className="flex w-full gap-3 mb-4">

              <div className="lg:hidden flex flex-1 gap-3">
                <Button onClick={toggleLayer} size="sm" variant="ghost" className="flex-1 bg-transparent border-neutral-100/35">
                  <Layers className="h-5 w-5" />
                </Button>
                <div className="w-px h-3/4 bg-neutral-100/35 my-2 align-middle" />
                <Button onClick={() => useCalendarStore.getState().toggle()} size="sm" variant="ghost" className="flex-1 bg-transparent border-neutral-100/35">
                  <CalendarDays className="h-5 w-5" />
                </Button>
                <div className="w-px h-3/4 bg-neutral-100/35 my-2 align-middle" />
                <Button onClick={() => openDialog("stream")} size="sm" variant="ghost" className="flex-1 bg-transparent border-neutral-100/35">
                  <Video className="h-5 w-5" />
                </Button>
                <div className="w-px h-3/4 bg-neutral-100/35 my-2 align-middle" />
                <Button onClick={openDrawer} size="sm" variant="ghost" className="flex-1 bg-transparent border-neutral-100/35">
                  <Compass className="h-5 w-5" />
                </Button>
                <div className="w-px h-3/4 bg-neutral-100/35 my-2 align-middle" />
                <Button onClick={() => useChartStore.getState().toggle()} size="sm" variant="ghost" className="flex-1 bg-transparent border-neutral-100/35">
                  <ChartArea className="h-5 w-5" />
                </Button>
                <div className="w-px h-3/4 bg-neutral-100/35 my-2 align-middle" />
                <Button onClick={() => useLogStore.getState().toggle()} size="sm" variant="ghost" className="flex-1 bg-transparent border-neutral-100/35">
                  <Logs className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 hidden lg:flex items-center gap-2 min-w-0">
                <Gauge className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-neutral-300 truncate">{t('speed')}</div>
                  <div className="font-semibold text-neutral-100">{currentSpeed} {t('m/s')}</div>
                </div>
              </div>

              <div className="flex-1 hidden lg:flex items-center gap-2 min-w-0">
                <ArrowUpNarrowWide className="h-5 w-5 text-amber-400 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-neutral-300 truncate">{t('alt')}</div>
                  <div className="font-semibold text-neutral-100">{currentAlt} {t('meter')}</div>
                </div>
              </div>

              <div className="flex-1 hidden lg:flex items-center gap-2 min-w-0">
                <MapPinCheckInside className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-neutral-300 truncate">{t('wpprogress')}</div>
                  <div className="font-semibold text-neutral-100"><span className="text-emerald-400">{currentPassed}</span> / {points?.length || 0}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1 min-w-0">
                <Button
                  size="sm"
                  className={
                    isMissionRunning 
                      ? "w-full justify-center flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                      : isMissionUploaded 
                        ? "w-full justify-center flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" // Пульсация для взлета
                        : "w-full justify-center flex items-center gap-2 bg-teal-600"
                  }
                  variant={isMissionRunning ? "destructive" : "default"}
                  onClick={handlePrimary}
                  aria-pressed={isMissionRunning}
                >
                  {isMissionRunning ? (
                    <>
                      <StopCircle className="h-4 w-4" />
                      {t('stop')}
                    </>
                  ) : isMissionUploaded ? (
                    <>
                      <Rocket className="h-4 w-4" />
                      {t('takeoff')}
                    </>
                  ) : (
                  
                    <>
                      <Play className="h-4 w-4" />
                      {t('readycheck')}
                    </>
                  )}
                </Button>
              </div>

              <div className="flex-1 min-w-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={togglePause}
                  disabled={!isMissionRunning}
                  className="w-full justify-center flex items-center gap-2"
                >
                  {isPaused ? (
                    <>
                      <Play className="h-4 w-4" />
                      {t('resume')}
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4" />
                      {t('pause')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
