// src/components/modals/MobileDrawer.tsx
import * as React from "react"
import { useUIStore } from "@/store/uiStore"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerClose,
  DrawerOverlay
} from "@/components/ui/drawer"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
// Импортируем иконки
import { BatteryMedium, Signal, Wifi, Radio } from "lucide-react" 

export function MobileDrawer() {
  const { isDrawerOpen, closeDrawer } = useUIStore()

  // Пример данных
  const slides = [
    { id: 1, title: "Статус", info: "Все системы в норме" },
    { id: 2, title: "Высота", info: "120м (AGL)" },
    { id: 3, title: "Камера", info: "4K 60fps [REC]" },
    { id: 4, title: "GPS", info: "18 спутников" },
  ]

  return (
    <Drawer 
      open={isDrawerOpen} 
      onOpenChange={(open) => {
        if (!open) closeDrawer()
      }}
    >
      <DrawerOverlay className="z-[1100] bg-black/60 backdrop-blur-sm" />
      
      {/* Добавил text-white, чтобы текст по умолчанию был белым */}
      <DrawerContent className="z-[1100] bg-neutral-800/75 backdrop-blur-xs border border-neutral-100/35 text-white">
        
        <div className="mx-auto w-full border-none">
          
          {/* КАСТОМНЫЙ HEADER */}
          <div className="px-4 pt-6 pb-2">
            <div className="flex items-center justify-between relative">
             
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="font-bold text-lg leading-none tracking-wide">ALPHA</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Wifi className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-green-400 font-medium uppercase tracking-wider">Online</span>
                  </div>
                </div>
              </div>

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <Button 
                  disabled={true}
                  variant="destructive" 
                  size="sm" 
                  className="h-7 px-3 text-xs font-bold border border-red-400/50"
                >
                  <Radio className="w-3 h-3 mr-1" /> LIVE
                </Button>
              </div>

              {/* ПРАВАЯ ЧАСТЬ: Батарея */}
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">85%</span>
                {/* Иконка батареи. Можно менять цвет в зависимости от процента */}
                <BatteryMedium className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
              </div>

            </div>
          </div>

          <div className="h-px bg-white/10 mx-4  mt-2"/>
    
          <div className="flex justify-center pb-4">
            <Carousel className="w-full">
              <CarouselContent>
                {slides.map((slide) => (
                  <CarouselItem key={slide.id}> 
                    <div className="p-1">
                      <Card className="bg-transparent border-none">
                        <CardContent className="flex flex-col aspect-[4/3] items-center justify-center p-4 text-center">
                          <span className="text-xl font-bold mb-1 text-white">{slide.title}</span>
                          <span className="text-xs text-neutral-400">{slide.info}</span>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            
              <CarouselPrevious className="hidden sm:flex bg-white/10 border-none text-white hover:bg-white/20" />
              <CarouselNext className="hidden sm:flex bg-white/10 border-none text-white hover:bg-white/20" />
            </Carousel>
          </div>

          <DrawerFooter className="pt-0">
            <Button className="w-full bg-blue-400 text-white font-semibold" onClick={() => console.log("Land")}>
              RETURN TO HOME
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/10 bg-transparent" onClick={closeDrawer}>
                Hide Panel
              </Button>
            </DrawerClose>
          </DrawerFooter>
          
        </div>
      </DrawerContent>
    </Drawer>
  )
}