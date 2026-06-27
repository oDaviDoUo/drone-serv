"use client";

import { useEffect, useRef, useState } from "react";
import { useLogStore } from "@/store/useLogStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const COLORS: Record<string, string> = {
  info: "text-teal-400",
  success: "text-green-400",
  warn: "text-yellow-400",
  error: "text-red-400",
};

const BG_COLORS: Record<string, string> = {
  info: "bg-teal-700/5 border-teal-500/15",
  success: "bg-green-700/5 border-green-500/15",
  warn: "bg-yellow-700/5 border-yellow-500/15",
  error: "bg-red-700/5 border-red-500/15",
};

export function LogPanel() {
  const { isOpen, logs, toggle, clear } = useLogStore();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [filter, setFilter] = useState<null | keyof typeof COLORS>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const filteredLogs =
    filter === null ? logs : logs.filter((log) => log.type === filter);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="fixed top-16 right-1 left-1 md:left-auto xl:right-[80px] 
                     md:w-[380px] h-[420px] z-[1000]
                     bg-neutral-800/75 backdrop-blur-xs 
                     border border-neutral-100/35 
                     rounded-lg shadow-xl flex flex-col text-xs"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-600 px-3 py-2">
            <span className="font-bold text-neutral-200">Logs</span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="text-red-400" onClick={clear}>
                Clear
              </Button>
              <Button size="icon" variant="ghost" onClick={toggle}>
                <X className="h-4 w-4 text-neutral-300" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2 px-3 py-2 border-b border-neutral-600 w-full justify-between">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setFilter(null)}
            >
              All
            </Button>
            {Object.keys(COLORS).map((type) => (
              <Button
                key={type}
                size="sm"
                variant="ghost"
                className={COLORS[type]}
                onClick={() => setFilter(type as keyof typeof COLORS)}
              >
                {type}
              </Button>
            ))}
          </div>

          <ScrollArea className="h-[calc(420px-80px)] p-3 overflow-y-auto">
            <div className="flex flex-col gap-1.5">
              <AnimatePresence>
                {filteredLogs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`
                      px-2 py-1.5 rounded border whitespace-pre-wrap w-full
                      ${BG_COLORS[log.type] ?? "bg-neutral-700/50 border-neutral-600"}
                      ${COLORS[log.type] ?? "text-neutral-200"}
                    `}
                  >
                    <div className="flex justify-between items-center gap-4">
                      <span className="flex-1 text-left">{log.message}</span>
                      <span className="opacity-90 font-mono shrink-0">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div ref={bottomRef} />
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
}