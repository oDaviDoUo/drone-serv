// src/store/missionStore.ts (ФИНАЛЬНЫЙ ИСПРАВЛЕННЫЙ КОД)
import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { MissionPoint, MissionStore, ActionType, ActionParam, PointAction } from '../lib/types' 

const MAX_POINTS = 256

export const newActionTemplate = (type: ActionType): PointAction => {
    let params: ActionParam[] = [];

    switch (type) {
        case 'TakePhotosByTime':
            params = [
                // ⚠️ Заменено null на числовые дефолты
                { key: 'count', value: 1 },      // кол-во (число)
                { key: 'interval', value: 10 },   // интервал (сек)
                { key: 'delay', value: 0 },      // задержка (сек)
            ];
            break;
        case 'Panorama':
            params = [
                { key: 'mode', value: 'video' },    // video/photo
                // ⚠️ Заменено null на числовые дефолты
                { key: 'angle', value: 360 },      // угол поворота (градусы)
                { key: 'direction', value: 'left' },// left/right
                { key: 'step', value: 10 },       // угловой шаг
                { key: 'speed', value: 5 },      // угловая скорость
                { key: 'delay', value: 1 },      // задержка
            ];
            break;
        case 'Wait':
            params = [
                // ⚠️ Заменено null на числовой дефолт
                { key: 'time', value: 5 },       // время ожидания (сек)
            ];
            break;
        case 'RotateCamera':
            params = [
                // ⚠️ Заменено null на числовые дефолты
                { key: 'roll', value: 0 },       // Roll
                { key: 'tilt', value: 0 },       // Tilt (от -90 до 90)
                { key: 'yaw', value: 0 },        // Yaw
                { key: 'zoom', value: null },       // Уровень зума (опционально - остается null)
            ];
            break;
        case 'CameraState':
            // Здесь все в порядке, 'state' уже имеет дефолтное строковое значение
            params = [
                { key: 'state', value: 'recordOn' },// recordOn/recordOff/snapshot
            ];
            break;
    }

    return { id: uuidv4(), type, params };
};

export const newPointTemplate = (lat = 56.95, lng = 24.11): MissionPoint => ({
    id: uuidv4(),
    lat,
    lng,
    name: `WAY POINT ${uuidv4().substring(0, 4)}`, 
    altitude: 30, 
    speed: 10, 
    altitudeMode: 'AGL', 
    actions: [],
})

// Создаем и экспортируем хук
// Теперь он полностью соответствует типу MissionStore
export const useMissionStore = create<MissionStore>((set, get) => ({
    points: [],
    activeId: null,
    addPoint: (p) => set((s) => (s.points.length < MAX_POINTS ? { points: [...s.points, p] } : s)),
    insertPointAt: (index, p) =>
        set((s) => {
            if (s.points.length >= MAX_POINTS) return s
            const newPoints = [...s.points]
            newPoints.splice(index, 0, p)
            return { points: newPoints }
        }),
    updatePoint: (id, patch) => set((s) => ({ points: s.points.map((pt) => (pt.id === id ? { ...pt, ...patch } : pt)) })),
    movePoint: (id, lat, lng) => set((s) => ({ points: s.points.map((pt) => (pt.id === id ? { ...pt, lat, lng } : pt)) })),
    removePoint: (id) => set((s) => ({ points: s.points.filter((pt) => pt.id !== id) })),
    setActive: (id) => set(() => ({ activeId: id })),
    
    addAction: (pointId, actionType) => set(s => ({
        points: s.points.map(p => 
            p.id === pointId 
                ? { ...p, actions: [...p.actions, newActionTemplate(actionType)] } 
                : p
        )
    })),

    updateActionParam: (pointId, actionId, paramKey, value) => set(s => ({
        points: s.points.map(p => 
            p.id === pointId 
                ? { 
                    ...p, 
                    actions: p.actions.map(action => 
                        action.id === actionId 
                            ? { 
                                ...action, 
                                params: action.params.map(param => 
                                    param.key === paramKey 
                                        ? { ...param, value: value } 
                                        : param
                                )
                            } 
                            : action
                    )
                } 
                : p
        )
    })),

    moveAction: (pointId, actionId, direction) => set(s => ({
        points: s.points.map(p => {
            if (p.id !== pointId) return p;
            
            const actions = [...p.actions];
            const index = actions.findIndex(a => a.id === actionId);
            if (index === -1) return p;

            const newIndex = direction === 'up' ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= actions.length) return p;

            // Переставляем элементы
            const [movedAction] = actions.splice(index, 1);
            actions.splice(newIndex, 0, movedAction);

            return { ...p, actions };
        })
    })),

    removeAction: (pointId, actionId) => set(s => ({
        points: s.points.map(p => 
            p.id === pointId 
                ? { ...p, actions: p.actions.filter(a => a.id !== actionId) } 
                : p
        )
    })),

    clearActions: (pointId) => set(s => ({
        points: s.points.map(p => 
            p.id === pointId 
                ? { ...p, actions: [] } 
                : p
        )
    })),

    // 👇 РАСШИРЕНИЕ: Валидация для полей действий
    getValidationErrors: (point: MissionPoint): string[] => {
        const errors: string[] = [];
        
        // ... (Существующая проверка altitude, speed, name) ...
        
        // --- НОВАЯ ПРОВЕРКА ДЕЙСТВИЙ ---
        point.actions.forEach((action, actionIndex) => {
            action.params.forEach(param => {
                // Все числовые поля обязательны, кроме 'zoom' в RotateCamera
                const isOptionalZoom = action.type === 'RotateCamera' && param.key === 'zoom';
                const isRadioParam = ['mode', 'direction', 'state'].includes(param.key);

                if (!isRadioParam && !isOptionalZoom) {
                    if (param.value === null) {
                        errors.push(`action-${action.id}-${param.key}`); // Уникальный ключ для ошибки
                    }
                }

                // Дополнительная валидация для Tilt (от -90 до 90)
                if (action.type === 'RotateCamera' && param.key === 'tilt' && typeof param.value === 'number') {
                    if (param.value < -90 || param.value > 90) {
                        errors.push(`action-${action.id}-tilt-range`);
                    }
                }
            });
        });
        
        return errors;
    },

    // ФУНКЦИЯ ПОДСЧЕТА ОШИБОК
    getTotalErrorCount: () => {
        const state = get();
        let errorCount = 0;
        
        // Теперь get().getValidationErrors(p) не подчеркивается,
        // потому что оно добавлено в тип MissionStore
        state.points.forEach(p => {
            if (get().getValidationErrors(p).length > 0) {
                errorCount++;
            }
        });
        return errorCount;
    },
}));