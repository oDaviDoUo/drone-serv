"use client";

import React from "react";
import { motion } from "framer-motion";
import { Drone, Warehouse, Check, Drone as DroneIcon } from "lucide-react";

import Btr20 from "@/icons/btr-20.svg";
import Btr40 from "@/icons/btr-40.svg";
import Btr60 from "@/icons/btr-60.svg";
import Btr80 from "@/icons/btr-80.svg";
import Btr100 from "@/icons/btr-100.svg";

type ItemType = "drone" | "station";

type ToggleCardProps = {
  id: string;
  type: ItemType;
  name: string;
  meta?: { batteryPercent?: number; dockedCount?: number };
  status?: string;
  selected?: boolean;
  disabled?: boolean;
  onToggle?: (id: string) => void;
  onInfo?: (id: string) => void;
  className?: string;
};

const statusConfig: Record<string, { color: string; label: string }> = {
  // Drone Statuses
  AVAILABLE: { color: "bg-emerald-500", label: "Available" },
  FLYING: { color: "bg-blue-400", label: "Flying" },
  CHARGING: { color: "bg-amber-500", label: "Charging" },
  // Station Statuses
  ONLINE: { color: "bg-emerald-500", label: "Online" },
  ERROR: { color: "bg-red-500", label: "Error" },
  // Common
  MAINTENANCE: { color: "bg-purple-500", label: "Maint." },
  OFFLINE: { color: "bg-neutral-500", label: "Offline" },
};

function BatteryIndicator({ percent = 100 }: { percent?: number }) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  if (p <= 20) return <Btr20 className="text-red-600" aria-hidden />;
  if (p <= 40) return <Btr40 className="text-orange-600" aria-hidden />;
  if (p <= 60) return <Btr60 className="text-orange-400" aria-hidden />;
  if (p <= 80) return <Btr80 className="text-amber-400" aria-hidden />;
  return <Btr100 className="text-green-400" aria-hidden />;
}

export function ToggleCard({
  id,
  type,
  name,
  meta,
  status,
  selected = false,
  disabled = false,
  onToggle,
  onInfo,
  className,
}: ToggleCardProps) {
  const Icon = type === "drone" ? Drone : Warehouse;
  
  // Получаем настройки статуса или дефолтные, если статус неизвестен
  const sConf = status ? statusConfig[status] : statusConfig.OFFLINE;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (onToggle) onToggle(id);
    else onInfo?.(id);
  };

  return (
    <motion.div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={selected}
      onClick={handleClick}
      whileHover={!disabled ? { 
        y: -4, 
        backgroundColor: "rgba(38, 38, 38, 0.9)",
        borderColor: selected ? "rgb(96, 165, 250)" : "rgb(82, 82, 82)" 
      } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      initial={false}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={[
        "relative h-24 border rounded-md p-3 flex flex-col justify-between transition-shadow duration-200",
        selected 
          ? "bg-blue-500/10 border-blue-400 ring-1 ring-blue-400/30" 
          : "bg-neutral-900/70 border-neutral-700",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-xl hover:shadow-black/40",
        className || "",
      ].join(" ")}
    >
      {/* Верхняя панель: Иконка и статус */}
      <div className="flex justify-between items-start">
        <div className={`p-1.5 rounded-lg ${selected ? 'bg-blue-500/20' : 'bg-neutral-800'}`}>
          <Icon className={`h-5 w-5 ${selected ? 'text-blue-400' : 'text-neutral-400'}`} />
        </div>

        <div className="flex items-center gap-2">
          {selected ? (
            <div className="bg-blue-400 rounded-full p-0.5">
              <Check className="h-3 w-3 text-neutral-900" strokeWidth={3} />
            </div>
          ) : (
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${
              disabled 
                ? "bg-red-500/10 border-red-500/20"
                : "bg-black/20 border-white/5"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${sConf.color}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                disabled ? "text-red-400" : "text-neutral-400"
              }`}>
                {sConf.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Нижняя панель: Имя и Мета-данные */}
      <div className="flex items-end justify-between w-full">
        <div className="min-w-0">
          <div className="text-[10px] font-medium text-neutral-500 uppercase tracking-widest mb-0.5">
            {type}
          </div>
          <div className="text-sm font-semibold text-neutral-100 truncate">
            {name}
          </div>
        </div>

        <div className="ml-3">
          {type === "drone" ? (
            <div className="flex flex-col items-end gap-1">
               <BatteryIndicator percent={meta?.batteryPercent ?? 100} />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-neutral-300 bg-neutral-800 px-2 py-1 rounded-md border border-neutral-700/50">
              <span className="font-bold text-neutral-100">{meta?.dockedCount ?? 0}</span>
              <DroneIcon className="h-3.5 w-3.5 text-neutral-400" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}