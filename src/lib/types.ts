// src/lib/types.ts
export type ActionParam = { key: string; value: string | number | boolean | null }
export type PointAction = { id: string; type: ActionType; params: ActionParam[] }

export type ActionType = 
  | 'TakePhotosByTime' 
  | 'Panorama' 
  | 'Wait' 
  | 'RotateCamera' 
  | 'CameraState'

export type AltitudeMode = 'absolute' | 'relative' | 'AGL' | 'AMSL'

export type MissionPoint = {
  id: string
  lat: number
  lng: number
  altitude: number
  speed: number
  altitudeMode: AltitudeMode 
  actions: PointAction[]
  name?: string 
}

export type MissionStore = {
  points: MissionPoint[]
  initialPoints: MissionPoint[]
  initialRth: number
  activeId: string | null
  mission: Mission | null              
  rth: number
  setRth: (value: number) => void  
  setMission: (mission: Mission) => void
  setInitialPoints: (points: MissionPoint[]) => void
  setInitialRth: (value: number) => void
  addPoint: (p: MissionPoint) => void
  insertPointAt: (index: number, p: MissionPoint) => void
  updatePoint: (id: string, patch: Partial<MissionPoint>) => void
  movePoint: (id: string, lat: number, lng: number) => void
  removePoint: (id: string) => void
  setActive: (id: string | null) => void

  addAction: (pointId: string, actionType: ActionType) => void
  updateActionParam: (pointId: string, actionId: string, paramKey: string, value: string | number | boolean | null) => void
  moveAction: (pointId: string, actionId: string, direction: 'up' | 'down') => void
  removeAction: (pointId: string, actionId: string) => void
  clearActions: (pointId: string) => void

  getValidationErrors: (point: MissionPoint) => string[]
  getTotalErrorCount: () => number
}

export type Mission = {
  id: string
  name: string
  description?: string
  status: string
  missionData: { rth: number, points: MissionPoint[] }
  createdAt: string
  updatedAt: string
}


export type DroneSummary = {
  id: string;
  serialNumber: string;
  model: string | null;
  status: string;      
  batteryLevel: number;
  currentLocation: string;
  owner?: {
    name: string;
  };
  telemetry?: any | null;
};

export type StationSummary = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  maxCapacity: number;
  status: string;      
  sensorData?: WeatherData | null;
  dockedCount: number; 
};

export type TelemetryPayload = Record<string, any>;

export type DroneCommand = {
  command: string;
  params?: Record<string, any>;
};

export type CalendarStore = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};



export interface WeatherData {
  windSpeed: number;   // м/с
  humidity: number;    // %
  pressure: number;    // гПа / мм рт. ст.
  dewPoint: number;    // °C
  temperature: number; // °C
  visibility: number;  // км
}

export interface ScheduledFlight {
    id: string;
    startTime: string; 
    endTime: string;  
    description?: string;
    color: string;
    status: 'SCHEDULED' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED' | 'DELAYED';
    droneId: string;
    missionId: string;
    createdAt: string;
    updatedAt: string;
    mission?: { name: string };
    drone?: { name: string; serialNumber: string };
}

export interface CreateFlightPayload {
    droneId: string;
    missionId: string;
    start: string;      
    end: string;        
    description?: string;
    color?: string;
}

 
export interface ChartStore {
  isOpen: boolean;
  toggle: () => void;
}
