// src/store/calendarStore.ts
import { create } from "zustand";
import { CalendarStore } from "@/lib/types";


export const useCalendarStore = create<CalendarStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));
