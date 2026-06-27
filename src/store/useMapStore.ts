//useMapStore
import { create } from "zustand";

type LayerType = "satellite" | "streets" | "topo";

interface MapState {
  layer: LayerType;
  setLayer: (layer: LayerType) => void;
  toggleLayer: () => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  layer: "satellite",
  setLayer: (layer) => set({ layer }),
  toggleLayer: () => {
    const next = get().layer === "satellite" ? "streets" : "satellite";
    set({ layer: next });
  },
}));
