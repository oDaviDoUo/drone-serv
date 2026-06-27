"use client";

import React, { useMemo, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Search, ChevronLeft, Loader2 } from "lucide-react";

import { toast } from "sonner";
import { Button } from "../ui/button";

import { useUIStore } from "@/store/uiStore";
import useDronesStore from "@/store/useDronesStore";
import useStationsStore from "@/store/useStationsStore";
import { useLogStore } from "@/store/useLogStore";
import { ListScreen } from "./DeviceDialog/ListScreen";
import { CreateScreen } from "./DeviceDialog/CreateScreen";
import { InfoScreen } from "./DeviceDialog/InfoScreen";
import { useMissionStore } from "@/store/missionStore";

import { uploadMissionToDrone } from "@/config/clientApi";

export function DeviceDialog() {
  const dialogOpen = useUIStore((s) => s.dialogOpen);
  const dialogType = useUIStore((s) => s.dialogType);
  const dialogStack = useUIStore((s) => s.dialogStack);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const closeDialog = useUIStore((s) => s.closeDialog);

  const missionRth = useMissionStore((s) => s.rth);

  const logStore = useLogStore.getState();
  
  const pushDialogMode = useUIStore((s) => s.pushDialogMode);
  const popDialogMode = useUIStore((s) => s.popDialogMode);

  const setMissionUploaded = useUIStore((s) => s.setMissionUploaded);
  const setActiveDroneId = useUIStore((s) => s.setActiveDroneId)

  const missionPoints = useMissionStore((s) => s.points);
  const [isUploading, setIsUploading] = useState(false);

  const { drones, loadDrones, removeDrone } = useDronesStore();
  const { stations, loadStations, removeStation } = useStationsStore();

  const prevMode = dialogStack.length > 1 ? dialogStack[dialogStack.length - 2] : null;
  const showBack = prevMode === "list";

  // 3. Загружаем данные при открытии диалога
  useEffect(() => {
    if (dialogOpen) {
      loadDrones();
      loadStations();
    } else {
      setSearchQuery("");
    }
  }, [dialogOpen, loadDrones, loadStations, setSearchQuery]);

  const currentMode = dialogStack[dialogStack.length - 1];

  const title = useMemo(() => {
    if (currentMode === "create") return dialogType === "drone" ? "Create Drone" : "Create Station";
    if (currentMode === "info") return dialogType === "drone" ? "Drone Info" : "Station Info";
    if (currentMode === "setup") return "Setup Drones";
    return dialogType === "drone" ? "Drones" : "Stations";
  }, [currentMode, dialogType]);

  // 4. Исправленная фильтрация (у дрона используем model и serialNumber)
  const filteredDrones = drones.filter((d) => 
    `${d.model} ${d.serialNumber}`.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredStations = stations.filter((s) => 
    `${s.name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isOpen = dialogOpen && (dialogType === "drone" || dialogType === "station");

  const handleUploadMission = async () => {
    const selected = useUIStore.getState().selectedIds;
    
    if (!selected.length) {
      toast.error("No drones selected");
      return;
    }
    
    if (!missionPoints || missionPoints.length === 0) {
      toast.error("Mission is empty");
      return;
    }

    setIsUploading(true);
    const droneId = selected[0];

    try {
      await uploadMissionToDrone(droneId, missionPoints, missionRth);

      setActiveDroneId(droneId);
      setMissionUploaded(true); 

      toast.success(`Mission uploaded to drone ${droneId}`);
      
      useUIStore.getState().clearSelection();
      if (!logStore.isOpen) {
        logStore.toggle();
      }
      closeDialog();
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload mission to drone");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="device-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1200] bg-black/50 backdrop-blur-sm"
            onClick={() => closeDialog()}
          />
          <motion.div
            key="device-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            
            className="fixed left-1/2 top-1/2 z-[1300] -translate-x-1/2 -translate-y-1/2
                       w-[920px] max-w-[95vw] h-[540px] xl:h-[640px] bg-neutral-900/95 border border-neutral-700 rounded-xl shadow-2xl
                       flex flex-col overflow-hidden"
           
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-700">
              {showBack && (
                <Button variant="ghost" onClick={() => popDialogMode()} aria-label="Back">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              <div className="flex-1">
                <div className="text-sm font-semibold text-neutral-100">{title}</div>
              </div>

              <div className="flex items-center gap-2">
                {(currentMode === "list" || currentMode === "setup") && (
                  <div className="relative">
                    <Search className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`Search ${dialogType === "drone" ? "drones" : "stations"}...`}
                      className="h-8 pl-9 pr-3 bg-neutral-900 border border-neutral-700 rounded-md text-sm text-neutral-200 focus:outline-none w-48 transition-all"
                    />
                  </div>
                )}
                <div className="w-px h-6 bg-neutral-800" />
                <Button variant="ghost" className="p-2 rounded" onClick={() => closeDialog()}>
                  <X className="h-5 w-5 text-neutral-300" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 relative">
              <AnimatePresence initial={false} mode="wait">
                {currentMode === "list" && (
                  <motion.div
                    key="list"
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -40, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="absolute inset-0 p-4 overflow-auto"
                  >
                  <ListScreen
                      type={dialogType}
                      
                      
                      onCreate={() => pushDialogMode("create")}
                      onEnterInfo={() => pushDialogMode("info")}
                      onEnterSetup={() => pushDialogMode("setup")}
                    />
                  </motion.div>
                )}

                {currentMode === "create" && (
                  <motion.div
                    key="create"
                    initial={{ x: 200, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -200, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="absolute inset-0 p-4 overflow-auto"
                  >
                  <CreateScreen
                      type={dialogType}
                      onBack={() => popDialogMode()}
                      onCreate={(item) => {
                        dialogType === "drone" ? loadDrones() : loadStations();
                        toast.success("Created");
                        popDialogMode();
                      }}
                    />
                  </motion.div> 
                )}

                {currentMode === "info" && (
                  <motion.div
                    key="info"
                    initial={{ x: -200, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 200, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="absolute inset-0 p-4 overflow-auto"
                  >
                  <InfoScreen
                      type={dialogType}
                      drones={drones}
                      stations={stations}
                      onBack={() => popDialogMode()}
                      onDelete={(id) => {
                        // Используем методы стора для удаления
                        if (dialogType === "drone") removeDrone(id);
                        else removeStation(id);
                        toast.success("Deleted");
                        popDialogMode();
                      }}
                    />
                  </motion.div>
                )}

                {currentMode === "setup" && (
                  <motion.div
                    key="setup"
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -40, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="absolute inset-0 p-4 overflow-auto"
                  >
                    <ListScreen
                      type="drone"
                      isSetupMode
                      onCreate={() => {}}
                      onEnterInfo={() => {}}
                      onEnterSetup={() => {}}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-neutral-700">
              <div className="flex justify-center">
                {currentMode === "list" && (
                  <Button variant="default" className="px-6 py-2 rounded text-white bg-teal-600" onClick={() => pushDialogMode("create")}>
                    Add new {dialogType === "drone" ? "Drone" : "Station"}
                  </Button>
                )}
                {currentMode === "info" && (
                  <div className="text-sm text-neutral-400">Кнопка Delete удалит устройство (ЭТО НЕОБРАТИМО!)</div>
                )}
                {currentMode === "setup" && (
                  <Button
                    variant="default"
                    className="px-6 py-2 rounded-md bg-emerald-600 hover:bg-emerald-600/80 text-white font-semibold"
                    disabled={isUploading}
                    onClick={handleUploadMission}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Prepare Selected"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}