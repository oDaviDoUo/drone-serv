// src/components/StreamCard.tsx
"use client";

import React from "react";
import { Play, Wifi, WifiOff, AlertCircle, Loader2 } from "lucide-react";

type StreamStatus = "live" | "connecting" | "offline" | "error";

type StreamCardProps = {
  id: string;
  name: string;
  location: string;
  status: StreamStatus;
  thumbnailUrl?: string;
  selected?: boolean;
  onClick?: (id: string) => void;
};

function StatusBadge({ status }: { status: StreamStatus }) {
  if (status === "live") {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30 backdrop-blur-md">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-medium text-green-400">LIVE</span>
      </div>
    );
  }
  if (status === "connecting") {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 backdrop-blur-md">
        <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
        <span className="text-xs font-medium text-amber-400">CONN</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-neutral-800/80 border border-neutral-700 backdrop-blur-md">
      <WifiOff className="w-3 h-3 text-neutral-400" />
      <span className="text-xs font-medium text-neutral-400">OFFLINE</span>
    </div>
  );
}

export function StreamCard({
  id,
  name,
  location,
  status,
  thumbnailUrl,
  selected,
  onClick,
}: StreamCardProps) {
  return (
    <div
      role="button"
      onClick={() => onClick?.(id)}
      className={`
        group relative h-40 w-full overflow-hidden rounded-xl border flex flex-col justify-between p-4 transition-all duration-300
        ${selected ? "border-teal-400 ring-1 ring-teal-400/50" : "border-neutral-800 hover:border-neutral-800"}
        bg-neutral-900
      `}
    >
      {thumbnailUrl ? (
        <>
          <img
            src={thumbnailUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110 filter blur-[3px]" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/60 to-neutral-900/30" />
        </>
      ) : (
        <div className="absolute inset-0 bg-black/80 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800 to-neutral-950" />
      )}

      <div className="relative z-10 flex justify-between items-start">
        <div className="bg-black/40 p-1.5 rounded-md backdrop-blur-sm border border-white/10">
          <Wifi className={`w-4 h-4 ${status === 'live' ? 'text-white' : 'text-neutral-500'}`} />
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="relative z-10">
        <h3 className="text-sm font-semibold text-white group-hover:text-teal-300 transition-colors">
            {name}
        </h3>
        <p className="text-xs text-neutral-300 mt-0.5 flex items-center gap-1">
            {location} {/* ИЛИ СОСТОЯНИЕ по типу mission(идифыидф), standy, ready, если cтанция то статус */}
        </p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
        <div className="bg-transparent py-3 px-5 rounded-sm shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-12 h-12 text-teal-500 fill-current " />
        </div>
      </div>
    </div>
  );
}