// src/store/uiStore.ts
import { create } from "zustand";

type DialogMode = "list" | "create" | "info" | "setup" ;
type DialogType = "drone" | "station" | "stream" | "contacts" | null;


interface UIState {
  // панель старта
  canStartMission: boolean;
  setCanStartMission: (canStart: boolean) => void;

  isMissionUploaded: boolean;          // <--- 1. Флаг: загружена ли миссия
  activeDroneId: string | null;        // <--- 2. Какой дрон выбран для полета
  
  // состояние миссии
  isMissionRunning: boolean;
  isPaused: boolean;

  // параметры
  speed: number;
  altitude: number;
  passedWaypoints: number;

  // экшены миссии
  startMission: () => void;
  stopMission: () => void;
  toggleStartStop: () => void;
  togglePause: () => void;

  setMissionUploaded: (v: boolean) => void; // <--- 3. Сеттер флага
  setActiveDroneId: (id: string | null) => void; // <--- 4. Сеттер дрона
  setMissionRunning: (v: boolean) => void; // <--- 5. Явный сеттер (удобно для MissionStarter)

  // утилиты
  setSpeed: (v: number) => void;
  setAltitude: (v: number) => void;
  incrementWaypoint: () => void;
  resetMissionState: () => void;

  // --- mobile drawer ---
  isMobile: boolean;
  setIsMobile: (v: boolean) => void;

  isDrawerOpen: boolean;
  activeDrawerTab: string | null;
  openDrawer: () => void;
  closeDrawer: () => void;
  setActiveDrawerTab: (tab: string) => void;

  // dialog state
  dialogOpen: boolean;
  dialogType: DialogType;
  dialogStack: DialogMode[];
  selectedItemId: string | null;
  selectedIds: string[];
  searchQuery: string;

  // --- fly states ---
  showFlyZones: boolean;
  flyZonesData: GeoJSON.FeatureCollection | null;
  isLoadingFlyZones: boolean;

  // dialog actions
  openDialog: (type: DialogType, initialMode?: DialogMode) => void;
  closeDialog: () => void;
  pushDialogMode: (mode: DialogMode) => void;
  popDialogMode: () => void;
  setDialogType: (type: DialogType) => void;

  // selection actions
  selectItem: (id: string | null) => void;
  toggleSelectId: (id: string) => void;
  clearSelection: () => void;

  // search
  setSearchQuery: (q: string) => void;

  
  // --- fly actions
  setShowFlyZones: (v: boolean) => void;
  setFlyZonesData: (data: GeoJSON.FeatureCollection | null) => void;
  setIsLoadingFlyZones: (v: boolean) => void;

}

export const useUIStore = create<UIState>((set, get) => ({
  // --- mission UI ---
  canStartMission: false,
  setCanStartMission: (canStart) => set({ canStartMission: canStart }),

  isMissionUploaded: false,    // <--- По умолчанию false
  activeDroneId: null,         // <--- По умолчанию null
  
  // --- НОВОЕ: Реализация методов ---
  setMissionUploaded: (v) => set({ isMissionUploaded: v }),
  setActiveDroneId: (id) => set({ activeDroneId: id }),
  setMissionRunning: (v) => set({ isMissionRunning: v, isPaused: false }),

  isMissionRunning: false,
  isPaused: false,

  speed: 5,
  altitude: 120,
  passedWaypoints: 0,

  startMission: () =>
    set(() => ({
      isMissionRunning: true,
      isPaused: false,
    })),

  stopMission: () =>
    set(() => ({
      isMissionRunning: false,
      isPaused: false,
      passedWaypoints: 0,
      isMissionUploaded: false, 
      activeDroneId: null
    })),

  toggleStartStop: () => {
    const { isMissionRunning, startMission, stopMission } = get();
    if (isMissionRunning) stopMission();
    else startMission();
  },

  togglePause: () =>
    set((s) => ({
      isPaused: s.isMissionRunning ? !s.isPaused : s.isPaused,
    })),

  setSpeed: (v) => set({ speed: v }),
  setAltitude: (v) => set({ altitude: v }),
  incrementWaypoint: () => set((s) => ({ passedWaypoints: s.passedWaypoints + 1 })),

  resetMissionState: () =>
    set({
      isMissionRunning: false,
      isPaused: false,
      speed: 5,
      altitude: 120,
      passedWaypoints: 0,
      isMissionUploaded: false,
      activeDroneId: null,
    }),

    // --- mobile drawer defaults ---
isMobile: false,
setIsMobile: (v: boolean) => set({ isMobile: v }),

isDrawerOpen: false,
activeDrawerTab: null,
openDrawer: () => set({ isDrawerOpen: true }),
closeDrawer: () => set({ isDrawerOpen: false, activeDrawerTab: null }),
setActiveDrawerTab: (tab: string) => set({ activeDrawerTab: tab }),

  // --- dialog state defaults ---
  dialogOpen: false,
  dialogType: null,
  dialogStack: ["list"],
  selectedItemId: null,
  selectedIds: [],
  searchQuery: "",

  // --- dialog actions ---
  openDialog: (type, initialMode = "list") =>
    set(() => ({
      dialogOpen: true,
      dialogType: type,
      dialogStack: [initialMode],
      selectedItemId: null,
      selectedIds: [],
      searchQuery: "",
    })),

  closeDialog: () =>
    set(() => ({
      dialogOpen: false,
      dialogType: null,
      dialogStack: ["list"],
      selectedItemId: null,
      selectedIds: [],
      searchQuery: "",
    })),

  pushDialogMode: (mode) =>
    set((s) => ({
      dialogStack: [...s.dialogStack, mode],
    })),

  popDialogMode: () =>
    set((s) => {
      const stack = [...s.dialogStack];
      if (stack.length > 1) stack.pop();
      return { dialogStack: stack };
    }),

  setDialogType: (type) =>
    set(() => ({
      dialogType: type,
    })),

  // --- selection actions ---
  selectItem: (id) =>
    set(() => ({
      selectedItemId: id,
    })),

  toggleSelectId: (id) =>
    set((s) => {
      const isSetupMode = s.dialogStack[s.dialogStack.length - 1] === "setup";

      if (isSetupMode) {
        const exists = s.selectedIds.includes(id);
        return {
          selectedIds: exists ? [] : [id],
        };
      }

      const exists = s.selectedIds.includes(id);
      return {
        selectedIds: exists 
          ? s.selectedIds.filter((x) => x !== id) 
          : [...s.selectedIds, id],
      };
    }),

  clearSelection: () =>
    set(() => ({
      selectedIds: [],
      selectedItemId: null,
    })),

  // --- search ---
  setSearchQuery: (q) => set({ searchQuery: q }),

  showFlyZones: true,
  setShowFlyZones: (v: boolean) => set({ showFlyZones: v }),

  flyZonesData: null,
  setFlyZonesData: (data) => set({ flyZonesData: data }),

  isLoadingFlyZones: false,
  setIsLoadingFlyZones: (v: boolean) => set({ isLoadingFlyZones: v }),

}));
