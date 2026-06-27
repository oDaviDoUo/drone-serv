"use client";

import React, { useEffect } from "react";
import { ToggleCard } from "@/components/ToggleCard";
import { useUIStore } from "@/store/uiStore";

import useDronesStore from "@/store/useDronesStore";
import useStationsStore from "@/store/useStationsStore";

export function ListScreen({
  type,
  isSetupMode = false,
}: {
  type: "drone" | "station";
  isSetupMode?: boolean;
  
  onCreate: () => void;
  onEnterInfo: () => void;
  onEnterSetup: () => void;
}) {
  const loadDrones = useDronesStore((s) => s.loadDrones);
  const loadStations = useStationsStore((s) => s.loadStations);

  const selectedIds = useUIStore((s) => s.selectedIds);
  const toggleSelectId = useUIStore((s) => s.toggleSelectId);
  const selectItem = useUIStore((s) => s.selectItem);
  const pushDialogMode = useUIStore((s) => s.pushDialogMode);

  const searchQuery = useUIStore((s) => s.searchQuery);
  const allDrones = useDronesStore((s) => s.drones);
  const allStations = useStationsStore((s) => s.stations);

  useEffect(() => {
    if (type === "drone") loadDrones();
    else loadStations();
  }, [type, loadDrones, loadStations]);

  const items = type === "drone" 
  ? allDrones.filter(d => `${d.model} ${d.serialNumber}`.toLowerCase().includes(searchQuery.toLowerCase()))
  : allStations.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((it: any) => {

          const isUnavailable = it.status === "MAINTENANCE" || it.status === "OFFLINE";
          const isDisabled = isSetupMode && isUnavailable;
 
          return (
            <ToggleCard
              key={it.id}
              id={it.id}
              type={type}
              name={type === "drone" ? (it.name || `Drone ${it.serialNumber}`) : it.name}
              meta={
                type === "drone" 
                  ? { batteryPercent: it.batteryLevel } 
                  : { dockedCount: it.dockedCount }
              }
              status={it.status}
              disabled={isDisabled}              
              selected={selectedIds.includes(it.id)}
              onToggle={isSetupMode && !isDisabled ? toggleSelectId : undefined}
              onInfo={!isSetupMode ? (id) => { selectItem(id); pushDialogMode("info"); } : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}