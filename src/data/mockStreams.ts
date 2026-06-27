// src/data/mockStreams.ts

export type StreamStatus = "live" | "connecting" | "offline" | "error";

export type StreamItem = {
  id: string;
  name: string;
  location: string;
  protocol: "webrtc" | "rtmp";
  status: StreamStatus;
  thumbnailUrl?: string;
  demoVideoUrl?: string;
};

const TEST_VIDEO_URL = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4";

export const mockStreams: StreamItem[] = [
  { 
    id: "cam-01", 
    name: "Gate Alpha Feed", 
    location: "North Gate", 
    protocol: "webrtc", 
    status: "live",
    thumbnailUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400&auto=format&fit=crop",
    demoVideoUrl: TEST_VIDEO_URL
  },
  { 
    id: "cam-02", 
    name: "Warehouse Interior", 
    location: "Zone B", 
    protocol: "webrtc", 
    status: "live",
    thumbnailUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400&auto=format&fit=crop",
    demoVideoUrl: TEST_VIDEO_URL
  },
  { 
    id: "cam-03", 
    name: "Perimeter Drone", 
    location: "Mobile Unit 4", 
    protocol: "rtmp", 
    status: "connecting",
    thumbnailUrl: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=400&auto=format&fit=crop",
    demoVideoUrl: TEST_VIDEO_URL
  },
  { 
    id: "cam-04", 
    name: "Back Entrance", 
    location: "Loading Dock", 
    protocol: "webrtc", 
    status: "live",
    
  },
];