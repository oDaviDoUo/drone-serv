import { create } from 'zustand'

interface TelemetryData {
  droneId: string;
  lat: number;
  lng: number;
  altitude: number;
  speed: number;
  battery: number;
  status: string;
  current_wp?: number;
  timestamp?: number;
}

interface TelemetryStore {
  drones: Record<string, TelemetryData>; // Храним телеметрию по ID дрона
  updateTelemetry: (id: string, data: TelemetryData) => void;
}

export const useTelemetryStore = create<TelemetryStore>((set) => ({
  drones: {},
  updateTelemetry: (id, data) => set((state) => ({
    drones: {
      ...state.drones,
      [id]: { ...data, timestamp: Date.now() }
    }
  }))
}))