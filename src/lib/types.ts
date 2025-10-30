// src/lib/types.ts (ОБНОВЛЕННЫЙ)
export type ActionParam = { key: string; value: string | number | boolean | null }
export type PointAction = { id: string; type: ActionType; params: ActionParam[] }

export type ActionType = 
  | 'TakePhotosByTime' 
  | 'Panorama' 
  | 'Wait' 
  | 'RotateCamera' 
  | 'CameraState'

// ⚠️ ОБНОВЛЕНИЕ: Расширяем режимы высоты
export type AltitudeMode = 'absolute' | 'relative' | 'AGL' | 'AMSL'

export type MissionPoint = {
  id: string
  lat: number
  lng: number
  altitude: number
  speed: number
  // ⚠️ ОБНОВЛЕНИЕ: Используем новый тип
  altitudeMode: AltitudeMode 
  actions: PointAction[]
  // ⚠️ ДОБАВЛЕНИЕ: Новое поле для названия точки
  name?: string 
}

// Тип для самого хранилища (остается прежним, так как MissionPoint обновлен)
export type MissionStore = {
  points: MissionPoint[]
  activeId: string | null
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