import { create } from 'zustand';
import type { StationSummary, TelemetryPayload, WeatherData } from '@/lib/types';
import { fetchStations } from '@/config/clientApi';

type StationsState = {
  stations: StationSummary[];
  isLoading: boolean;
  error: string | null;
  isStationsEmpty: boolean;

  setStations: (stations: StationSummary[]) => void;
  addOrUpdateStation: (station: StationSummary) => void;
  removeStation: (id: string) => void;
  setLoading: (v: boolean) => void;
  setError: (err: string | null) => void;
  clear: () => void;

  loadStations: () => Promise<void>;

  updateTelemetryLocal: (id: string, sensorData: TelemetryPayload) => void;
};

const useStationsStore = create<StationsState>((set, get) => ({
  stations: [],
  isLoading: false,
  error: null,
  isStationsEmpty: true,

  loadStations: async () => {
    set({ isLoading: true, error: null });
    try {
        const data = await fetchStations();
        set({ stations: data, isLoading: false, error: null, isStationsEmpty: data.length === 0, });
        console.log("Stations loaded from API and saved to store.");
    } catch (error: any) {
        const errorMessage = error.message || "Ошибка загрузки списка станций";
        console.error("Ошибка загрузки станций:", errorMessage);
        set({ stations: [], isLoading: false, error: errorMessage, isStationsEmpty: true });
        throw error; 
    }
  },
  setStations: (stations) => set({ stations, isLoading: false, error: null,  }),
  addOrUpdateStation: (station) =>
    set((state) => {
      const idx = state.stations.findIndex(s => s.id === station.id);
      if (idx === -1) {
        return { stations: [...state.stations, station] };
      } else {
        const copy = [...state.stations];
        copy[idx] = { ...copy[idx], ...station };
        return { stations: copy };
      }
    }),
  removeStation: (id) => set((state) => ({ stations: state.stations.filter(s => s.id !== id) })),
  setLoading: (v) => set({ isLoading: v }),
  setError: (err) => set({ error: err, isLoading: false }),
  clear: () => set({ stations: [], isLoading: false, error: null, isStationsEmpty: true }),

  updateTelemetryLocal: (id, sensorData) =>
  set((state) => ({
    stations: state.stations.map((s) =>
      // Используем Type Casting 'as WeatherData', чтобы TS не ругался
      // Либо меняем аргумент в типе StationsState на WeatherData
      s.id === id ? { ...s, sensorData: sensorData as WeatherData } : s
    ),
  })),
}));

export default useStationsStore;
