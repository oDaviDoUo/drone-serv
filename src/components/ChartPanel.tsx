"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useChartStore } from "@/store/chartStore";
import { MissionChart } from "@/components/helpers/MissionChart";
import { useEffect } from "react";
import { useMissionStore } from "@/store/missionStore";

export function ChartPanel() {
  const { isOpen } = useChartStore();


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-12 left-1 xl:left-[80px] w-[620px] h-[180px] 
                     z-[1000] bg-transparent"
        >
          <MissionChart  height={140} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
