import { create } from 'zustand';
import type { DroneSummary } from '@/lib/types';
import { fetchDrones } from '@/config/clientApi';

type DronesState = {
  drones: DroneSummary[];
  isLoading: boolean;
  error: string | null;
  isDronesEmpty: boolean;

  setDrones: (drones: DroneSummary[]) => void;
  addOrUpdateDrone: (drone: DroneSummary) => void;
  removeDrone: (id: string) => void;
  setLoading: (v: boolean) => void;
  setError: (err: string | null) => void;
  clear: () => void;

  loadDrones: () => Promise<void>;
};

const useDronesStore = create<DronesState>((set, get) => ({
  drones: [],
  isLoading: false,
  error: null,
  isDronesEmpty: true,

  loadDrones: async () => {
    set({ isLoading: true, error: null });
    try {
        const data = await fetchDrones();
        set({ drones: data, isLoading: false, error: null, isDronesEmpty: data.length === 0 });
        console.log("Drones loaded from API and saved to store.");
    } catch (error: any) {
        const errorMessage = error.message || "Ошибка загрузки списка дронов";
        console.error("Ошибка загрузки дронов:", errorMessage);
        set({ drones: [], isLoading: false, error: errorMessage, isDronesEmpty: true });
        throw error; // Перебросить ошибку для обработки в компоненте
    }
  },
  setDrones: (drones) => set({ drones, isLoading: false, error: null }),
  addOrUpdateDrone: (drone) =>
    set((state) => {
      const idx = state.drones.findIndex(d => d.id === drone.id);
      if (idx === -1) {
        return { drones: [...state.drones, drone] };
      } else {
        const copy = [...state.drones];
        copy[idx] = { ...copy[idx], ...drone };
        return { drones: copy };
      }
    }),
  removeDrone: (id) => set((state) => ({ drones: state.drones.filter(d => d.id !== id) })),
  setLoading: (v) => set({ isLoading: v }),
  setError: (err) => set({ error: err, isLoading: false }),
  clear: () => set({ drones: [], isLoading: false, error: null, isDronesEmpty: true }),
}));

export default useDronesStore;
