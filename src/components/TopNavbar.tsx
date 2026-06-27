// src/components/TopNavbar.tsx
import { use, useEffect, useState } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useLogStore } from "@/store/useLogStore";
import { CircleQuestionMark, Globe, Fullscreen, Shrink, Plus, List, Check } from "lucide-react"
import { MissionSelector } from "./MissionSelector"
import { CitySearchCombobox } from "./CitySearchCombobox";


import { useUIStore } from "@/store/uiStore";

interface TopNavbarProps {
    onSelectLocation: ((lat: number, lon: number) => void) | null;
    onRequestLogin?: () => void;
    isAuthorized?: boolean;
}

export function TopNavbar({ onSelectLocation, onRequestLogin, isAuthorized }: TopNavbarProps) {
  const { i18n, t } = useTranslation();
  const addLog = useLogStore((s) => s.addLog);
  const [currentLang, setCurrentLang] = useState<string>(i18n.language || 'en');
  const openDialog = useUIStore((s) => s.openDialog);


  useEffect(() => {
    const handle = (lng: string) => setCurrentLang(lng);
    i18n.on('languageChanged', handle);
    setCurrentLang(i18n.language || 'en');
    return () => {
      i18n.off('languageChanged', handle);
    };
  }, [i18n]);

  const languages = [
    { code: "en", label: "English" },
    { code: "ru", label: "Русский" },
    { code: "lv", label: "Latviešu" },
  ];

  const changeLanguage = async (lng: string) => {
    if (i18n.language === lng) return;
    try {
      localStorage.setItem('lang', lng);
      await i18n.changeLanguage(lng);
  
      setCurrentLang(lng);
    } catch (err) {
      console.error("i18n changeLanguage error:", err);
      
    }
  };
  const [time, setTime] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const formatted = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit"})
      setTime(formatted)
    }

    updateTime()
    const interval = setInterval(updateTime, 60000)

    return () => clearInterval(interval)
  }, [])


  const handleLocationSelect = (lat: number, lon: number) => {
        if (onSelectLocation) {
            onSelectLocation(lat, lon);
        } else {
            addLog("Flying to selected location.");
        }
    };

    useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

    
  return (
    <TooltipProvider delayDuration={0}>
      <div 
      className="fixed top-1 left-1 right-1 xl:top-2 xl:left-[80px] xl:right-[80px] h-12 p-2 z-[1000] 
                    flex items-center justify-between bg-neutral-800/75 backdrop-blur-xs 
                    border border-neutral-100/35 rounded-lg shadow-lg">
      <Menubar className="bg-transparent border-none text-white hidden lg:flex">
      
        {/* <MenubarMenu>
          <MenubarTrigger>{t("file")}</MenubarTrigger>
          <MenubarContent className="z-[1000] bg-neutral-800/75 backdrop-blur-xs border border-neutral-100/35 rounded-lg text-white">
            <MenubarItem>{t("newM")}</MenubarItem>
            <MenubarItem>{t("openM")}</MenubarItem>
            <div className="h-px bg-neutral-100/35 mx-4"/>
            <MenubarItem>{t("importM")}</MenubarItem>
            <MenubarItem>{t("exportM")}</MenubarItem>
            <div className="h-px bg-neutral-100/35 mx-4"/>
            <MenubarItem onClick={() => toast.info("IN PROD")}>{t("tutorial")}</MenubarItem>
          </MenubarContent>
        </MenubarMenu> */}
        <MenubarMenu>
          <MenubarTrigger>{t("drones")}</MenubarTrigger>
          <MenubarContent className="z-[1000] bg-neutral-800/75 backdrop-blur-xs border border-neutral-100/35 rounded-lg text-white">
            <MenubarItem onClick={() =>openDialog("drone", "list")}>{t("droneL")}</MenubarItem>
            {/* <MenubarItem onClick={() => toast.warning("IN PROD")}>Drone Settings</MenubarItem> */}
            <div className="h-px bg-neutral-100/35 mx-4"/>
            <MenubarItem onClick={() =>openDialog("drone", "create")}>
              {t("addnewdrone")} <MenubarShortcut><Plus/></MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>{t("stations")}</MenubarTrigger>
          <MenubarContent className="z-[1000] bg-neutral-800/75 backdrop-blur-xs border border-neutral-100/35 rounded-lg text-white">
            <MenubarItem onClick={() =>openDialog("station", "list")}>{t("stationL")}</MenubarItem>
            {/* <MenubarItem onClick={() => toast.error("IN PROD")}>Station Settings</MenubarItem> */}
            <div className="h-px bg-neutral-100/35 mx-4"/>
            <MenubarItem onClick={() =>openDialog("station", "create")}>
              {t("addnewstation")} <MenubarShortcut><Plus/></MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        
        <div className="w-px h-full bg-neutral-100/35 my-2" />
      </Menubar>

      <Menubar className="bg-transparent border-none text-white lg:hidden">
        <MenubarMenu>
          <MenubarTrigger><List/></MenubarTrigger>
          <MenubarContent className="z-[1000] bg-neutral-800/75 backdrop-blur-xs border border-neutral-100/35 rounded-lg text-white">
            <MenubarItem onClick={() =>openDialog("drone", "list")}>{t("droneL")}</MenubarItem>
            <MenubarItem onClick={() =>openDialog("station", "list")}>{t("stationL")}</MenubarItem>
            <div className="h-px bg-neutral-100/35 mx-2"/>
            {/* <MenubarItem onClick={() => toast.info("IN PROD")}>{t("importM")}</MenubarItem>
            <MenubarItem onClick={() => toast.success("IN PROD")}>{t("exportM")}</MenubarItem> */}
            <MenubarItem onClick={() => openDialog("contacts")}>{t('support')}</MenubarItem>
            <div className="h-px bg-neutral-100/35 mx-2"/>
            <div className="py-1">
              <div className="flex items-start gap-2">
                {languages.map((lng) => (
                  <Button
                    variant="ghost" 
                    key={lng.code}
                    onClick={() => {
                      changeLanguage(lng.code);
                     
                      document.documentElement.lang = lng.code;
                    }}
                    className={`text-sm font-medium transition-colors ${
                      currentLang === lng.code ? 'text-teal-400' : 'text-neutral-300 hover:text-white'
                    }`}
                    aria-pressed={currentLang === lng.code}
                    aria-label={`${lng.code}`}
                  >
                    {lng.code.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
            <div className="h-px bg-neutral-100/35 mx-2"/>
            <MenubarItem onClick={() => { onRequestLogin?.(); }}>{t('logout')}</MenubarItem>
          </MenubarContent>

        </MenubarMenu>
        <div className="w-px h-full bg-neutral-100/35 my-2" />
      </Menubar>

      <div className=" flex flex-1 w-full items-start justify-between p-1">
        <MissionSelector />
      </div>
      
      <div className="flex items-center gap-4 ">
        <div className="relative ">
          <CitySearchCombobox onSelectLocation={handleLocationSelect} />
        </div>
        
          
        
      
        
        <span className="text-sm text-white hidden lg:flex ">{time}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="hidden xl:flex"
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Shrink className="h-5 w-5" /> : <Fullscreen className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="z-[1000]">
            <p>{isFullscreen ? t('exitfullscreen') : t('fullscreen')}</p>
          </TooltipContent>
        </Tooltip>
        
      
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-transparent hidden lg:flex"
                >
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>

            <TooltipContent side="bottom" className="z-[1000]">
              <p>{t('lang')}</p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenuContent
            align="end"
            className="z-[1000] bg-neutral-800/75 backdrop-blur-xs border border-neutral-100/35 rounded-lg text-white"
          >
            {languages.map((lng) => (
              <DropdownMenuItem
                key={lng.code}
                onSelect={() => changeLanguage(lng.code)}
                className={`flex justify-between items-center ${
                  currentLang === lng.code ? "text-teal-400" : "opacity-80"
                }`}
              >
                <span>{lng.label}</span>
                {currentLang === lng.code ? <Check className="text-teal-400" /> : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              className="bg-transparent hidden lg:flex"
              variant="ghost" 
              size="sm" 
              onClick={() => openDialog("contacts")}
              >
                <CircleQuestionMark className="h-4 w-4"/>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="z-[1000]">
            <p>{t('support')}</p>
          </TooltipContent>
        </Tooltip>
        
        
        <Button 
          className="hidden lg:flex xl:mr-4"
          variant="ghost" 
          size="sm" 
          onClick={() => {
            onRequestLogin?.();
          }}
        >{t('logout')}</Button>
      </div>

      
    </div>
    </TooltipProvider>
  )
}