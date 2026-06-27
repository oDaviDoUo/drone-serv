// src/store/useMissionsListStore.ts

import { create } from 'zustand';
import { fetchMissions } from "@/config/clientApi";
import { useLogStore } from './useLogStore';

// Соответствует тому, что возвращает ваш GET /api/missions
export type MissionStatus = 
  | 'DRAFT' 
  | 'READY' 
  | 'SENT' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'CANCELLED';

export type MissionListItem = {
    id: string;
    name: string;
    description?: string | null;
    status: MissionStatus;
    points: number,
    createdAt: string; 
    updatedAt: string;
};

type MissionsListStore = {
    missions: MissionListItem[];
    activeMissionId: string | null; 
    missionName: string;
    isLoading: boolean; 


    loadMissions: () => Promise<void>;    
    setMissionName: (name: string) => void;
    setMissions: (missions: MissionListItem[]) => void;
    addMission: (mission: MissionListItem) => void;
    setActiveMissionId: (id: string | null) => void;
    updateMissionName: (id: string, newName: string) => void;
    removeMission: (id: string) => void;
};

export const useMissionsListStore = create<MissionsListStore>((set) => ({
    missions: [],
    activeMissionId: null,
    missionName: '',
    isLoading: false,
    loadMissions: async () => {
        set({ isLoading: true });
        try {
            const data = await fetchMissions();
            set({ missions: data, isLoading: false });
            
            console.log("Missions loaded from API and saved to store.")
        } catch (error) {
            console.error("Ошибка загрузки списка миссий:", error);
            
            set({ missions: [], isLoading: false });
            throw error;
        }
    },
    setMissionName: (name) => set({ missionName: name }),
    setMissions: (missions) => set({ missions }),
    addMission: (mission) => set((state) => ({ 
        missions: [mission, ...state.missions],
        activeMissionId: mission.id 
    })),
    setActiveMissionId: (id) => set({ activeMissionId: id }),
    updateMissionName: (id, newName) => set((state) => ({
        missions: state.missions.map(m => m.id === id ? { ...m, name: newName } : m)
    })),
    removeMission: (id) => set((state) => {
        const missions = state.missions.filter(m => m.id !== id);
        
        let newActiveMissionId = state.activeMissionId;
        
        if (state.activeMissionId === id) {
             newActiveMissionId = null; 
        }

        return { 
            missions,
            activeMissionId: newActiveMissionId
        };
    }),
}));