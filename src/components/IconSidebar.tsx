// src/components/IconSidebar.tsx
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  MapPin,
  Layers,
  Component,
  Settings,
  Bot,
  PanelLeft,
  MapPinPlus,
  MapPinMinus,
} from "lucide-react"

export function IconSidebar() {
  return (
    <TooltipProvider delayDuration={0}> 
      <div className="fixed top-16 left-3 h-12 w-12 p-1 z-[1000] 
                      flex flex-col items-center gap-1 bg-neutral-800/75 backdrop-blur-xs 
                      border border-neutral-100/35 rounded-lg shadow-lg">
                        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <MapPinPlus className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="z-[1000]">
            <p>Create Route</p>
          </TooltipContent>
        </Tooltip>
                          
                          
      </div>
      <div className="fixed top-30 left-3 max-h-[calc(100vh-170px)] w-12 p-2 z-[1000] 
                      flex flex-col items-center gap-1 bg-neutral-800/75 backdrop-blur-xs 
                      border border-neutral-100/35 rounded-lg shadow-lg">

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <PanelLeft className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="z-[1000]">
            <p>Toggle Panel</p>
          </TooltipContent>
        </Tooltip>

        <div className="h-px w-full bg-neutral-100/35 my-2" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <MapPin className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="z-[1000]">
            <p>Missions</p>
          </TooltipContent>
        </Tooltip>

        <div className="h-px w-full bg-neutral-100/35 my-2" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <Bot className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="z-[1000]">
            <p>Drones</p>
          </TooltipContent>
        </Tooltip>

        <div className="h-px w-full bg-neutral-100/35 my-2" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <Layers className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="z-[1000]">
            <p>Map Layers</p>
          </TooltipContent>
        </Tooltip>
       
        <div className="flex-1" />

        
      </div>
    </TooltipProvider>
  )
}