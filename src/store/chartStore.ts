// src/store/chartStore.ts
import { ChartStore } from "@/lib/types";
import { create } from "zustand";

export const useChartStore = create<ChartStore>((set) => ({
  isOpen: false,
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));
