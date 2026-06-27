// store/wsStore.ts
import { create } from 'zustand';

type WSMessage = { entity: string; entityId: string; type: string; data: any };

type WSStore = {
  messages: WSMessage[];
  addMessage: (msg: WSMessage) => void;
};

export const useWSStore = create<WSStore>((set) => ({
  messages: [],
  addMessage: (msg) => set(state => ({ messages: [msg, ...state.messages] })),
}));
