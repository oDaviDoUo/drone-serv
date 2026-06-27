"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCalendarStore } from "@/store/calendarStore";
import { X } from "lucide-react";
import EventCalendarMaster from "@/components/helpers/EventCalendar";

export function CalendarPanel() {
  const { isOpen, close } = useCalendarStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Контейнер-обертка, который берет на себя центровку */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1200] flex items-center justify-center sm:p-6"
          >
           
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-md" 
              onClick={close} 
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 12 }}
              transition={{ duration: 0.22 }}
              className="relative z-[1300] w-full max-w-320 bg-neutral-800/60 backdrop-blur-md
              border border-neutral-100/35 rounded-lg shadow-lg flex flex-col overflow-hidden dark"
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
            >
              {/* body */}
              <div className="flex-1 overflow-auto custom-scrollbar">
                <EventCalendarMaster />
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}