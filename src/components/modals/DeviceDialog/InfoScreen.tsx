"use client";

import React from "react";
import { useUIStore } from "@/store/uiStore";
import type { DroneSummary, StationSummary } from "@/lib/types";

export function InfoScreen({
  type,
  drones,
  stations,
  onBack,
  onDelete,
}: {
  type: "drone" | "station";
  drones: DroneSummary[];
  stations: StationSummary[];
  onBack: () => void;
  onDelete: (id: string) => void;
}) {
  const selectedItemId = useUIStore((s) => s.selectedItemId);
  
  // Ищем элемент в массивах из стора
  const item = type === "drone" 
    ? drones.find((d) => d.id === selectedItemId) 
    : stations.find((st) => st.id === selectedItemId);

  if (!item) {
    return (
      <div className="h-full flex flex-col justify-center items-center text-neutral-500">
        <div className="text-sm mb-4">Device not found</div>
        <button className="px-4 py-2 rounded bg-neutral-800" onClick={onBack}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-2 gap-4 max-w-[700px]">
          {type === "drone" ? (
            <>
              {/* У дрона нет name в JSON, выводим модель как основное имя */}
              <div><div className="text-xs text-neutral-400">Model</div><div className="font-semibold">{(item as DroneSummary).model}</div></div>
              <div><div className="text-xs text-neutral-400">Serial</div><div className="font-semibold">{(item as DroneSummary).serialNumber}</div></div>
              <div><div className="text-xs text-neutral-400">Battery</div><div className="font-semibold">{(item as DroneSummary).batteryLevel}%</div></div>
              <div><div className="text-xs text-neutral-400">Status</div><div className="font-semibold">{(item as DroneSummary).status}</div></div>
              <div><div className="text-xs text-neutral-400">Owner</div><div className="font-semibold">{(item as DroneSummary).owner?.name || "N/A"}</div></div>
              <div><div className="text-xs text-neutral-400">Location</div><div className="font-semibold">{(item as DroneSummary).currentLocation}</div></div>
            </>
          ) : (
            <>
              <div><div className="text-xs text-neutral-400">Station Name</div><div className="font-semibold">{(item as StationSummary).name}</div></div>
              <div><div className="text-xs text-neutral-400">Max Capacity</div><div className="font-semibold">{(item as StationSummary).maxCapacity}</div></div>
              <div><div className="text-xs text-neutral-400">Currently Docked</div><div className="font-semibold">{(item as StationSummary).dockedCount}</div></div>
              <div><div className="text-xs text-neutral-400">Status</div><div className="font-semibold">{(item as StationSummary).status}</div></div>
              <div className="col-span-2">
                <div className="text-xs text-neutral-400">Coordinates</div>
                <div className="font-mono text-xs">Lat: {(item as StationSummary).lat}, Lng: {(item as StationSummary).lng}</div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          className="px-6 py-2 rounded bg-red-600/50 hover:bg-red-600/70 border border-red-500 text-white"
          onClick={() => {
            if (!confirm("Delete item?")) return;
            onDelete(item.id);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}