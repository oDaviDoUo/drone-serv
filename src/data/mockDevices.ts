// src/data/mockDevices.ts
export type DroneItem = {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  battery: number; // 0..100
  owner?: string;
  status?: "idle" | "ready" | "error" | "in-flight";
};

export type StationItem = {
  id: string;
  name: string;
  model: string;
  maxCapacity: number;
  docked: string[];
  status?: "online" | "offline" | "maintenance";
};

export const mockDrones: DroneItem[] = [
  { id: "d1", name: "Falcon A1", model: "F-A1", serialNumber: "SN-001", battery: 92, owner: "Ops", status: "ready" },
  { id: "d2", name: "Raven X", model: "R-X", serialNumber: "SN-002", battery: 64, owner: "Ops", status: "idle" },
  { id: "d3", name: "Hawk Pro", model: "H-P", serialNumber: "SN-003", battery: 38, owner: "Field", status: "idle" },
  { id: "d4", name: "Kite Mini", model: "K-M", serialNumber: "SN-004", battery: 15, owner: "Field", status: "error" },
  { id: "d5", name: "Eagle S", model: "E-S", serialNumber: "SN-005", battery: 78, owner: "Ops", status: "ready" },
  { id: "d6", name: "Swift 2", model: "S-2", serialNumber: "SN-006", battery: 55, owner: "Ops", status: "idle" },
];

export const mockStations: StationItem[] = [
  { id: "s1", name: "Station Alpha", model: "STA-1", maxCapacity: 6, docked: ["d1", "d2"], status: "online" },
  { id: "s2", name: "Station Beta", model: "STB-2", maxCapacity: 4, docked: ["d3"], status: "maintenance" },
  { id: "s3", name: "Station Gamma", model: "STG-3", maxCapacity: 8, docked: [], status: "offline" },
];
