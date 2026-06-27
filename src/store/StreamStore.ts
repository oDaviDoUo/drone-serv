import { create } from 'zustand';

interface StreamMetrics {
  bitrate: number;
  latency: number;
  fps: number;
}

interface StreamState {
  // Данные из БД (сущности)
  streams: any[]; 
  // Живые метрики, которые приходят из StreamPlayer через колбэк
  liveMetrics: Record<string, StreamMetrics>; 
  
  setStreams: (streams: any[]) => void;
  updateStreamStatus: (id: string, status: string) => void;
  updateLiveMetrics: (id: string, metrics: StreamMetrics) => void;
  updateThumbnail: (id: string, url: string) => void;
}

export const useStreamStore = create<StreamState>((set) => ({
  streams: [],
  liveMetrics: {},

  setStreams: (streams) => set({ streams }),
  
  updateStreamStatus: (id, status) => set((state) => ({
    streams: state.streams.map(s => s.id === id ? { ...s, status } : s)
  })),

  updateLiveMetrics: (id, metrics) => set((state) => ({
    liveMetrics: { ...state.liveMetrics, [id]: metrics }
  })),

  updateThumbnail: (id, url) => set((state) => ({
    streams: state.streams.map(s => s.id === id ? { ...s, thumbnailUrl: url } : s)
  })),
}));