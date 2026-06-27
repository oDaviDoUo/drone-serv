import { create } from "zustand";

interface WeatherStore {
  activeStationId: string | null; // ID текущей станции
  isOpen: boolean;
  
  // Открыть конкретную станцию (и саму панель)
  openStation: (id: string) => void;
  
  // Просто закрыть панель (но ID останется в памяти как "последний")
  close: () => void;
  
  // Просто переключить видимость (для логики внутри компонентов)
  setOpen: (isOpen: boolean) => void;
}

export const useWeatherStore = create<WeatherStore>((set) => ({
  activeStationId: null,
  isOpen: false,

  openStation: (id) => set({ activeStationId: id, isOpen: true }),
  close: () => set({ isOpen: false, activeStationId: null }),
  setOpen: (isOpen) => set({ isOpen }),
}));