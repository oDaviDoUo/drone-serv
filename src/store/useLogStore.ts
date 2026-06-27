//usLogStore
import { create } from "zustand";

interface LogEntry {
  message: string;
  type: "info" | "warn" | "error" | "success";
}

interface LogStore {
  isOpen: boolean;
  logs: LogEntry[];
  toggle: () => void;
  addLog: (msg: string, type?: LogEntry["type"]) => void;
  clear: () => void;
}

export const useLogStore = create<LogStore>((set) => ({
  isOpen: false,
  logs: [],
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),

  addLog: (message, type = "info") =>
    set((s) => ({
      logs: [...s.logs, { message, type }],
    })),

  clear: () => set({ logs: [] }),
}));
