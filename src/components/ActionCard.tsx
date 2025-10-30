// src/components/ActionCard.tsx
import React, { useCallback, memo } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ActionInputField } from './ActionInputField';
import { 
    ChevronUp, ChevronDown, Trash2, AlertTriangle, 
    ArrowLeft, ArrowRight, Video, Camera as CameraIcon, 
    RotateCcw,
    RotateCw
} from "lucide-react"
import { useMissionStore } from "@/store/missionStore"
import { PointAction, ActionType } from '@/lib/types';
import { cn } from '@/lib/utils'; 

type ActionCardProps = {
    pointId: string;
    action: PointAction;
    index: number;
    totalActions: number;
    isError: (key: string) => boolean;
}

// ⚠️ Утилита для получения заголовка (можно вынести в отдельный файл или использовать enum)
const getActionTitle = (type: ActionType): string => {
    switch(type) {
        case 'TakePhotosByTime': return 'Съемка по времени';
        case 'Panorama': return 'Панорама';
        case 'Wait': return 'Ждать';
        case 'RotateCamera': return 'Поворот камеры';
        case 'CameraState': return 'Вкл/Выкл камеры';
        default: return 'Неизвестное действие';
    }
}

const getUnit = (key: string): string => {
    switch(key) {
        case 'interval':
        case 'delay':
        case 'time': return 'сек';
        case 'angle': 
        case 'roll': 
        case 'tilt': 
        case 'yaw': return '°';
        case 'speed': return 'м/с';
        default: return '';
    }
}

export function ActionCard({ pointId, action, index, totalActions, isError }: ActionCardProps) {
    const updateActionParam = useMissionStore(s => s.updateActionParam);
    const removeAction = useMissionStore(s => s.removeAction);
    const moveAction = useMissionStore(s => s.moveAction);

    const handleParamChange = (key: string, value: string | number | boolean | null) => {
        updateActionParam(pointId, action.id, key, value);
    };

    const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const value = e.target.value;
        let numValue: number | null = null;
        if (value.trim() !== '') {
            numValue = parseFloat(value);
            if (isNaN(numValue)) return; 
        }
        handleParamChange(key, numValue);
    }
    
    // --- ОСНОВНАЯ ЛОГИКА РЕНДЕРА ПО ТИПУ ---
    const renderActionContent = () => {
        const getParamValue = (key: string) => action.params.find(p => p.key === key)?.value ?? null;
        const isParamError = (key: string) => isError(`action-${action.id}-${key}`);
        
        const InputField = ({ label, keyName, placeholder = '', unit = '' }: { label: string, keyName: string, placeholder?: string, unit?: string }) => (
            
            <ActionInputField
                label={label}
                keyName={keyName}
                actionId={action.id}
                placeholder={placeholder}
                unit={unit}
                value={getParamValue(keyName)}
                isError={isParamError(keyName)}
                handleNumberInput={handleNumberInput}
            />
        );

        switch(action.type) {
            case 'TakePhotosByTime':
                return (
                    <div className="space-y-2">
                        <InputField label="Кол-во кадров" keyName="count" placeholder="1" unit="" />
                        <InputField label="Интервал" keyName="interval" placeholder="10" unit="сек" />
                        <InputField label="Задержка" keyName="delay" placeholder="0" unit="сек" />
                    </div>
                );

            case 'Panorama':
                const mode = getParamValue('mode');
                const direction = getParamValue('direction');
                
                return (
                    <div className="space-y-2">
                        
                        <RadioGroup 
                            defaultValue={mode as string} 
                            onValueChange={(v) => handleParamChange('mode', v)} 
                            className="flex justify-start space-x-4 flex-col"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="video" id={`video-${action.id}`}/>
                                <Label htmlFor={`video-${action.id}`} className="flex items-center space-x-1 text-sm"><Video className='h-4 w-4'/> Видео</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="photo" id={`photo-${action.id}`} />
                                <Label htmlFor={`photo-${action.id}`} className="flex items-center space-x-1 text-sm"><CameraIcon className='h-4 w-4'/> Снимки</Label>
                            </div>
                        </RadioGroup>

                        {/* Угол поворота + Направление */}
                        <div className="flex items-center gap-2">
                            <div className="flex-1"> 
                                <InputField label="Угол поворота" keyName="angle" placeholder="360" unit="°" />
                            </div>
                                <Button 
                                size="icon" 
                                onClick={() => handleParamChange('direction', 'left')}
                                className={cn('h-8 w-8', direction === 'left' ? 'bg-blue-400' : 'bg-neutral-100/10 hover:bg-white/20')}
                            >
                                <RotateCcw className="h-5 w-5" />
                            </Button>
                            <Button 
                                size="icon" 
                                onClick={() => handleParamChange('direction', 'right')}
                                className={cn('h-8 w-8', direction === 'right' ? 'bg-blue-400' : 'bg-neutral-100/10 hover:bg-white/20')}
                            >
                                <RotateCw className="h-5 w-5" />
                            </Button>
                            
                        </div>

                        <InputField label="Угловой шаг" keyName="step" placeholder="10" />
                        <InputField label="Угловая скорость" keyName="speed" placeholder="5" unit="м/с" />
                        <InputField label="Задержка между шагами" keyName="delay" placeholder="1" unit="сек" />
                    </div>
                );

            case 'Wait':
                return (
                    <InputField label="Время ожидания" keyName="time" placeholder="5" unit="сек" />
                );

            case 'RotateCamera':
                
                return (
                    <div className="space-y-2">
                        <InputField label="Roll" keyName="roll" placeholder="0" unit="°" />
                        <InputField label="Tilt (-90° до 90°)" keyName="tilt" placeholder="0" unit="°" />
                        <InputField label="Yaw" keyName="yaw" placeholder="0" unit="°" />
                        <InputField label="Уровень зума (опц.)" keyName="zoom" placeholder="1" />
                    </div>
                );

            case 'CameraState':
                const state = getParamValue('state');
                return (
                    <RadioGroup 
                        defaultValue={state as string} 
                        onValueChange={(v) => handleParamChange('state', v)} 
                        className="flex flex-col space-y-2"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="recordOn" id={`recordOn-${action.id}`} />
                            <Label htmlFor={`recordOn-${action.id}`} className="text-sm">Запись: Вкл</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="recordOff" id={`recordOff-${action.id}`} />
                            <Label htmlFor={`recordOff-${action.id}`} className="text-sm">Запись: Выкл</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="snapshot" id={`snapshot-${action.id}`} />
                            <Label htmlFor={`snapshot-${action.id}`} className="text-sm">Снимок</Label>
                        </div>
                    </RadioGroup>
                );

            default:
                return <p className="text-red-500">Неизвестный тип действия.</p>;
        }
    }

    const actionHasErrors = action.params.some(p => isError(`action-${action.id}-${p.key}`));
    // Также проверяем специфические ошибки диапазона
    const hasRangeError = action.type === 'RotateCamera' && isError(`action-${action.id}-tilt-range`);
    const finalHasErrors = actionHasErrors || hasRangeError;

    return (
        <div className={cn("bg-neutral-700/50 border border-neutral-100/35 rounded-lg p-3 space-y-3 relative", finalHasErrors ? 'border-red-400' : 'border-neutral-100/35')}>
            
            {/* ЗАГОЛОВОК И УПРАВЛЕНИЕ */}
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                    <span className={cn("text-lg font-bold text-white", finalHasErrors ? 'text-red-400' : 'text-white')}>{index + 1}.</span>
                    <h4 className={cn("text-base font-semibold", finalHasErrors ? 'text-red-400' : 'text-white')}>
                        {getActionTitle(action.type)}
                    </h4>
                </div>
                
                <div className="flex items-center space-x-1">
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => moveAction(pointId, action.id, 'up')}
                        disabled={index === 0}
                        className="w-6 h-6 p-0 text-white/70 hover:bg-white/10"
                    >
                        <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => moveAction(pointId, action.id, 'down')}
                        disabled={index === totalActions - 1}
                        className="w-6 h-6 p-0 text-white/70 hover:bg-white/10"
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => removeAction(pointId, action.id)}
                        className="w-6 h-6 p-0 text-red-400 hover:bg-white/10"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* КОНТЕНТ ДЕЙСТВИЯ */}
            {renderActionContent()}
        </div>
    );
}

// ⚠️ Предполагаемый cn утилита (для Tailwind-cva, если не существует, используйте простую функцию):
// export function cn(...classes: (string | undefined | null | false)[]) {
//     return classes.filter(Boolean).join(' ');
// }