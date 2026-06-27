// src/components/StreamManagerDialog.tsx
"use client";

import React, { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Search, ChevronLeft, LayoutGrid, Activity } from "lucide-react";
import { mockStreams, StreamItem } from "@/data/mockStreams";
import { StreamCard } from "../StreamCard";
import { StreamPlayer } from "../StreamPlayer";
import { Button } from "../ui/button"; 

import { useUIStore } from "@/store/uiStore";

export function StreamManagerDialog({ 
    
}: { 
 
}) {
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);
  const [currentMetrics, setCurrentMetrics] = useState({ bitrate: 0, latency: 0, fps: 0 });

  const [searchQuery, setSearchQuery] = useState("");

  const { dialogOpen, dialogType, closeDialog } = useUIStore();
  const isOpen = dialogOpen && dialogType === "stream";

  const activeStream = useMemo(
    () => mockStreams.find((s) => s.id === activeStreamId),
    [activeStreamId]
  );

  const filteredStreams = mockStreams.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
      <div className="fixed inset-0 z-[1200] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeDialog}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-[1300] -translate-x-1/2 -translate-y-1/2
                       w-[920px] max-w-[95vw] h-[540px] xl:h-[640px] bg-neutral-900/95 border border-neutral-700 rounded-xl shadow-2xl
                       flex flex-col overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          <div className="h-14 border-b border-neutral-800 flex items-center justify-between px-4 bg-neutral-900/50">
            <div className="flex items-center gap-3">
              {activeStream ? (
                <Button variant="ghost" size="sm" onClick={() => setActiveStreamId(null)} className="text-neutral-400 hover:text-white">
                   <ChevronLeft className="w-5 h-5 mr-1" />
                   Back to Grid
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-neutral-100 font-semibold">
                  <LayoutGrid className="w-5 h-5 text-teal-500" />
                  <span>Live Feeds</span>
                  <span className="hidden sm:block bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded text-xs ml-2">
                    {mockStreams.length} active
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!activeStream && (
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input 
                    type="text"
                    placeholder="Find camera..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-9 pr-3 bg-neutral-900 border border-neutral-700 rounded-md text-sm text-neutral-200 focus:outline-none w-48 transition-all"
                  />
                </div>
              )}
              <div className="w-px h-6 bg-neutral-800" />
              <Button
                                variant="ghost"
                                className="p-2 rounded"
                                onClick={closeDialog}
                                aria-label="Close dialog"
                              >
                                <X className="h-5 w-5 text-neutral-300" />
                              </Button>
            </div>
          </div>

          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              
              {!activeStreamId ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 overflow-y-auto p-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStreams.map((stream) => (
                      <StreamCard
                        key={stream.id}
                        {...stream}
                        onClick={(id) => setActiveStreamId(id)}
                      />
                    ))}
                    {/* <button className="h-40 border border-dashed border-neutral-800 rounded-xl flex flex-col items-center justify-center gap-2 text-neutral-500 hover:bg-neutral-900/50 hover:border-neutral-700 hover:text-neutral-300 transition-all">
                      <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center">
                        <Activity className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium">Add Stream Source</span>
                    </button> */}
                  </div>
                </motion.div>
              ) : (
                
                <motion.div
                  key="player"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 p-4 flex flex-col"
                >
                  <div className="flex-1">
                     {activeStream && <StreamPlayer stream={activeStream} onMetricsUpdate={(m) => setCurrentMetrics(m)}/>}
                  </div>
                  <div className="mt-1 px-1">
                    <h2 className="text-xl font-bold text-white">{activeStream?.name}</h2>
                    <div className="flex items-center gap-4 text-sm text-neutral-400 mt-1">
                      <span>Protocol: <span className="text-teal-400 uppercase">{activeStream?.protocol}</span></span>
                      <span>•</span>
                      <span>Bitrate: <span className="text-white">{currentMetrics.bitrate} Mbps</span></span>
                      <span>•</span>
                      <span>Latency: <span className={currentMetrics.latency > 150 ? "text-red-400" : "text-green-400"}>
                        {currentMetrics.latency}ms
                      </span></span>
                      <span>FPS: <span className="text-white">{currentMetrics.fps}</span></span>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}