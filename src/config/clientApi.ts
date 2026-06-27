// src/clientApi.ts (Это код для ФРОНТЕНДА, который будет знать адрес бэкенда)

import { MissionListItem } from "@/store/useMissionsListStore";
// src/clientApi.ts
import type { DroneSummary, StationSummary, TelemetryPayload, DroneCommand, MissionPoint, CreateFlightPayload, ScheduledFlight } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = { 
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}), 
    };
    
    const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ error: "Unknown error" }));

      const error: any = new Error(
        errorBody.error || `HTTP error! Status: ${response.status}`
      );

      error.status = response.status;
      throw error;
    }
    
    
    if (response.status === 204) return null;
    return response.json();
}

export const login = async (email: string, password: string) => {
    const result = await fetchApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    return result.user;
};

export const fetchFlyZones = async (): Promise<any> => {
  return fetchApi('/api/flyzones', { method: 'GET' });
};

export const fetchMissions = async (): Promise<MissionListItem[]> => { 
    return fetchApi('/api/missions', {
        method: 'GET'
    });
};

export const fetchMissionById = async (id: string) => {
  return fetchApi(`/api/missions/${id}`, {
    method: 'GET'
  });
};

/**
 * Создание новой миссии. 
 * @param name Название миссии
 * @returns { id, name } новой миссии
 */
export const createMission = async (name: string, description: string): Promise<MissionListItem> => {
    return fetchApi('/api/missions', {
        method: 'POST',
        body: JSON.stringify({ name, description }), 
    });
};
/**
 * Обновление (сохранение) полной миссии (точек и действий).
 * @param missionId ID миссии
 * @param points Массив точек из Zustand
 * @param name Новое имя (опционально)
 */
export const updateMission = async (missionId: string, points?: any[], name?: string, rth?: number) => {
    return fetchApi(`/api/missions/${missionId}`, {
        method: 'PUT',
        body: JSON.stringify({ name, points, rth }),
    });
};
/**
 * Удаление миссии по ID.
 */
export const deleteMission = async (id: string) => {
    return fetchApi(`/api/missions/${id}`, {
        method: 'DELETE'
    });
};

export const fetchDrones = async (filters: { status?: string; model?: string } = {}): Promise<DroneSummary[]> => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.model) params.append('model', filters.model);

  const endpoint = `/api/drones${params.toString() ? `?${params.toString()}` : ''}`;
  return fetchApi(endpoint, { method: 'GET' });
};

export const fetchDroneById = async (id: string): Promise<DroneSummary> => {
  return fetchApi(`/api/drones/${id}`, { method: 'GET' });
};

export const createDrone = async (payload: {
  serialNumber: string;
  model?: string;
  ownerId: string;
  currentStationId?: string | null;
}): Promise<DroneSummary> => {
  return fetchApi('/api/drones', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateDrone = async (id: string, payload: Partial<{
  model: string;
  status: string;
  batteryLevel: number;
  currentLocation: string;
  currentStationId: string | null;
}>): Promise<any> => {
  return fetchApi(`/api/drones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const deleteDrone = async (id: string) => {
  return fetchApi(`/api/drones/${id}`, { method: 'DELETE' });
};

/**
 * Универсальная команда для дрона.
 * Примеры команд: 'takeoff', 'land', 'return_to_base', 'start_mission'
 */
export const sendDroneCommand = async (droneId: string, command: string, params: Record<string, any> = {}) => {
  return fetchApi(`/api/drones/${droneId}/command`, {
    method: 'POST',
    body: JSON.stringify({ command, params }),
  });
};
export const uploadMissionToDrone = async (droneId: string, points: MissionPoint[], rth: number) => {
  return sendDroneCommand(droneId, 'upload_mission', { 
    waypoints: points,
    rth: rth
  });
};
export const startMissionOnDrone = async (droneId: string) => {
  return sendDroneCommand(droneId, 'start_mission');
};
/* -------------------------
   Станции: fetch, CRUD, команды, телеметрия
   ------------------------- */
export const fetchStations = async (filterName?: string): Promise<StationSummary[]> => {
  const params = new URLSearchParams();
  if (filterName) params.append('name', filterName);
  const endpoint = `/api/stations${params.toString() ? `?${params.toString()}` : ''}`;
  return fetchApi(endpoint, { method: 'GET' });
};

export const fetchStationById = async (id: string) => {
  return fetchApi(`/api/stations/${id}`, { method: 'GET' });
};

export const createStation = async (payload: {
  name: string;
  lat: number;
  lng: number;
  maxCapacity?: number;
  sensorData?: TelemetryPayload;
}) => {
  return fetchApi('/api/stations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateStation = async (id: string, payload: Partial<{
  name: string;
  lat: number;
  lng: number;
  maxCapacity: number;
  status: string;
  sensorData: TelemetryPayload | null;
}>) => {
  return fetchApi(`/api/stations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const deleteStation = async (id: string) => {
  return fetchApi(`/api/stations/${id}`, { method: 'DELETE' });
};

/* Команды open/close */
export const openStation = async (id: string) => {
  return fetchApi(`/api/stations/${id}/open`, { method: 'POST' });
};

export const closeStation = async (id: string) => {
  return fetchApi(`/api/stations/${id}/close`, { method: 'POST' });
};

/* Статус станции */
export const fetchStationStatus = async (id: string) => {
  return fetchApi(`/api/stations/${id}/status`, { method: 'GET' });
};

/* Телеметрия */
export const fetchStationTelemetry = async (id: string): Promise<{ sensorData: TelemetryPayload }> => {
  return fetchApi(`/api/stations/${id}/telemetry`, { method: 'GET' });
};

/**
 * Обновление телеметрии.
 * @param id id станции
 * @param sensorData объект телеметрии
 * @param merge если true — shallow merge с текущими данными
 */
export const updateStationTelemetry = async (id: string, sensorData: TelemetryPayload, merge = false) => {
  return fetchApi(`/api/stations/${id}/telemetry`, {
    method: 'POST',
    body: JSON.stringify({ sensorData, merge }),
  });
};

//RASPISANUBE CALENDAR
/**
 * Получить список всех запланированных полетов.
 * Можно передать фильтры по датам или конкретному дрону.
 */
export const fetchSchedule = async (filters: { 
    start?: string; 
    end?: string; 
    droneId?: string 
} = {}): Promise<ScheduledFlight[]> => {
    const params = new URLSearchParams();
    if (filters.start) params.append('start', filters.start);
    if (filters.end) params.append('end', filters.end);
    if (filters.droneId) params.append('droneId', filters.droneId);

    const endpoint = `/api/schedule${params.toString() ? `?${params.toString()}` : ''}`;
    return fetchApi(endpoint, { method: 'GET' });
};

/**
 * Создать новую запись в расписании.
 */
export const createScheduledFlight = async (payload: CreateFlightPayload): Promise<ScheduledFlight> => {
    return fetchApi('/api/schedule', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

/**
 * Отменить полет (смена статуса на CANCELLED).
 */
export const cancelScheduledFlight = async (flightId: string): Promise<{ message: string }> => {
    return fetchApi(`/api/schedule/${flightId}`, {
        method: 'DELETE'
    });
};