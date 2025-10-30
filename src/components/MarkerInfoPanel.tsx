// src/components/MarkerInfoPanel.tsx
import React, { useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Camera, Video, Clock, Repeat, Trash2, AlertTriangle, Play } from "lucide-react"

import { useMissionStore } from "@/store/missionStore" 
import { MissionPoint, AltitudeMode, ActionType } from '@/lib/types';

import { ActionCard } from './ActionCard';


type Props = {
  points: MissionPoint[]
  activeId: string | null
  totalDistance: string | number
}

const DEFAULT_ALTITUDE = 30;
const DEFAULT_SPEED = 10;
const DEFAULT_ALTITUDE_MODE: AltitudeMode = 'AGL'; 

export function MarkerInfoPanel({ points, activeId, totalDistance }: Props) {
  const updatePoint = useMissionStore(s => s.updatePoint);
    const setActive = useMissionStore(s => s.setActive);
    const getValidationErrors = useMissionStore(s => s.getValidationErrors);
    const removePoint = useMissionStore(s => s.removePoint);

    const addAction = useMissionStore(s => s.addAction);
    const clearActions = useMissionStore(s => s.clearActions);
    
    

    const handleNumberChange = useCallback((
        e: React.ChangeEvent<HTMLInputElement>, 
        field: 'altitude' | 'speed'
    ) => {
        const value = e.target.value;
        let numValue: number | null = null;
        if (value.trim() !== '') {
            numValue = parseFloat(value);
            if (isNaN(numValue)) return; 
        }
        if (activeId) updatePoint(activeId, { [field]: numValue }); 
    }, [activeId, updatePoint]);

    const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (activeId) updatePoint(activeId, { name: e.target.value.trim() });
    }, [activeId, updatePoint]);


    
    const activePoint = points.find(p => p.id === activeId);
    const activeIndex = activePoint ? points.indexOf(activePoint) : -1;
    const navigatePoint = (direction: 'prev' | 'next') => {
      if (activeIndex === -1) return;
      const newIndex = direction === 'prev' 
        ? Math.max(0, activeIndex - 1) 
        : Math.min(points.length - 1, activeIndex + 1);
      
      if (newIndex !== activeIndex) {
        setActive(points[newIndex].id);
      }
    }
    const ActionIcons = [Camera, Video, Clock, Repeat, Trash2];

    const ActionButtons: { Icon: React.ElementType, type: ActionType }[] = [
        { Icon: Camera, type: 'TakePhotosByTime' },
        { Icon: Video, type: 'Panorama' },
        { Icon: Clock, type: 'Wait' },
        { Icon: Repeat, type: 'RotateCamera' },
        { Icon: Play, type: 'CameraState' },
    ];

  if (!activePoint) {
       return (
          <div className="fixed top-[190px] left-[80px] w-86 max-h-[calc(100vh-240px)] z-[1000] flex flex-col">
            <Card className="flex-1 bg-neutral-800/75 backdrop-blur-xs border border-neutral-100/35 
                      rounded-3xl shadow-lg text-white p-4">
                 <h3 className="font-medium">All Points ({points.length})</h3>
                 <div className="text-sm text-white mt-1">
                     Total Distance: {totalDistance} km
                 </div>
                 <p className="text-sm text-white">Select a point from the QuickNav bar above or the map to view details.</p>
            </Card>
          </div>
       );
  }

  const errors = getValidationErrors(activePoint); 
  const isError = (field: string) => errors.includes(field);

  const currentAltitude = activePoint.altitude ?? DEFAULT_ALTITUDE;
  const currentSpeed = activePoint.speed ?? DEFAULT_SPEED;
  const currentAltitudeMode = activePoint.altitudeMode ?? DEFAULT_ALTITUDE_MODE;

    

  

  return (
    <div className="fixed top-[190px] left-[80px] w-86 max-h-[calc(100vh-240px)] z-[1000] flex flex-col">
      <Card className="flex-1 bg-neutral-800/75 backdrop-blur-xs border border-neutral-100/35 
                      rounded-3xl shadow-lg text-white">
        
       
        <CardHeader className="px-4 flex flex-row items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigatePoint('prev')}
            disabled={activeIndex === 0}
            className="text-white/70 w-8 h-8"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Input
            value={activePoint.name || ''}
            onChange={handleNameChange}
            className={`
              bg-neutral-100/10 border border-neutral-100/35 rounded-lg text-base font-semibold text-center w-full focus:ring-0 focus:border-0 p-0 h-8
              ${isError('name') ? 'border-red-500 ring-red-500' : 'border-neutral-100/35'}
            `}
            placeholder={`WAY POINT ${activeIndex + 1}`}
          />

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigatePoint('next')}
            disabled={activeIndex === points.length - 1}
            className="text-white/70 w-8 h-8"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </CardHeader>

        

        <CardContent className="px-4 flex flex-col justify-between min-h-0">
          
          <div className="h-px bg-neutral-100/35 mb-2"/>
          <div className="flex flex-col gap-2 mb-4 flex-1 min-h-0">
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div>
                <Label htmlFor="lat" className="text-sm mb-1">Широта</Label>
                <Input 
                  id="lat" 
                  value={activePoint.lat.toFixed(6)} 
                  onChange={(e) => updatePoint(activePoint.id, { lat: parseFloat(e.target.value) || activePoint.lat })}
                  className="bg-neutral-100/10 border border-neutral-100/35 h-8 text-sm" 
                />
              </div>
              <div>
                <Label htmlFor="lng" className="text-sm mb-1">Долгота</Label>
                <Input 
                  id="lng" 
                  value={activePoint.lng.toFixed(6)} 
                  onChange={(e) => updatePoint(activePoint.id, { lng: parseFloat(e.target.value) || activePoint.lng })}
                  className="bg-neutral-100/10 border border-neutral-100/35 h-8 text-sm" 
                />
              </div>
            </div>

            <div className="h-px bg-neutral-100/35"/>
            
            
            <Tabs defaultValue="basic" className="flex-1 flex flex-col min-h-0 h-full">
              
              <TabsList className="text-white grid w-full grid-cols-2 h-8 p-0 bg-neutral-100/10 border-none rounded-lg">
                <TabsTrigger value="basic" className="data-[state=active]:bg-blue-400 h-full rounded-l-lg rounded-r-none text-mt">Basic</TabsTrigger>
                <TabsTrigger value="actions" className="data-[state=active]:bg-blue-400 h-full rounded-r-lg rounded-l-none text-mt">Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="mt-4 space-y-4 flex-1 h-full min-h-0 flex flex-col">
                <div className="grid grid-cols-2">
                  <Label htmlFor="altitude" className="text-sm">Высота</Label>
                  <div className="relative">
                    <Input 
                      id="altitude" 
                      value={activePoint.altitude === null ? '' : activePoint.altitude} 
                      onChange={(e) => handleNumberChange(e, 'altitude')}
                      className={`
                        bg-neutral-100/10 h-8 text-sm pr-8
                        ${isError('altitude') ? 'border-red-500 ring-red-500' : 'border-neutral-100/35'}
                     `} 
                      placeholder={DEFAULT_ALTITUDE.toString()}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">m</span>
                  </div>
                </div>

                <div className="grid grid-cols-2">
                  <Label htmlFor="speed" className="text-sm">Скорость</Label>
                  <div className="relative w-full">
                    <Input 
                      id="speed" 
                      value={activePoint.speed === null ? '' : activePoint.speed}
                      onChange={(e) => handleNumberChange(e, 'speed')}
                      className={`
                        bg-neutral-100/10 h-8 text-sm pr-12 w-full
                        ${isError('speed') ? 'border-red-500 ring-red-500' : 'border-neutral-100/35'}
                      `} 
                      placeholder={DEFAULT_SPEED.toString()}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">m/s</span>
                  </div>
                </div>
                <div className="grid grid-cols-2">
                  <Label className="text-sm">Режим Высоты</Label>
                  <Select 
                    defaultValue={currentAltitudeMode}
                    onValueChange={(value) => updatePoint(activePoint.id, { altitudeMode: value as AltitudeMode })}
                  >
                    <SelectTrigger className={`
                      w-full bg-neutral-100/10 h-8 text-sm 
                      ${isError('altitudeMode') ? 'border-red-500 ring-red-500' : 'border-neutral-100/35'}
                    `}>
                    <SelectValue />
                    </SelectTrigger>
                      <SelectContent position='popper' className="bg-neutral-700 border-neutral-100/35 z-[1000] text-white">
                        <SelectItem value="AGL">AGL</SelectItem>
                        <SelectItem value="AMSL">AMSL</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              <TabsContent value="actions" className="mt-1 space-y-2 flex flex-col flex-1 min-h-0 h-full">
                    <div className="flex justify-center items-center space-x-4">
                        {ActionButtons.map(({ Icon, type }, index) => (
                            <Button 
                                key={index}
                                variant="ghost" 
                                size="icon" 
                                onClick={() => addAction(activePoint.id, type)}
                                className="w-8 h-8 p-1 text-white/70"
                            >
                                <Icon className="h-5 w-5" />
                            </Button>
                        ))}
                    </div>
                    

                    <div className="flex-1 overflow-y-auto pr-1  space-y-3 min-h-0 max-h-80 scrollbar-thin"> 
                        {activePoint.actions.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center pt-4">Нажмите на иконку выше, чтобы добавить действие.</p>
                        ) : (
                            activePoint.actions.map((action, index) => (
                                <ActionCard
                                    key={action.id}
                                    pointId={activePoint.id}
                                    action={action}
                                    index={index}
                                    totalActions={activePoint.actions.length}
                                    isError={isError}
                                />
                            ))
                        )}
                        {/* КНОПКА УДАЛИТЬ ВСЕ ДЕЙСТВИЯ */}
                        {activePoint.actions.length > 0 && (
                            <div className="w-full pt-2 px-2">
                                <Button 
                                    onClick={() => clearActions(activePoint.id)}
                                    variant="outline"
                                    className="w-full bg-red-600/50 hover:bg-red-600 text-white font-bold h-8 text-sm rounded-md border-red-500"
                                >
                                    Удалить все действия ({activePoint.actions.length})
                                </Button>
                            </div>
                        )}
                    </div>
                    
                    
                </TabsContent>
            </Tabs>
          </div>

          <div className="h-px bg-neutral-100/35"/>
          
          <div className="w-full pt-4">
            <Button className="w-full bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 h-10 text-base rounded-lg">
              Save Route
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}