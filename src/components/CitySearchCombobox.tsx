// src/components/CitySearchCombobox.tsx
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search, MapPin, SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslation } from "react-i18next";

interface LocationResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface CitySearchComboboxProps {
    onSelectLocation: (lat: number, lon: number) => void;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export function CitySearchCombobox({ onSelectLocation }: CitySearchComboboxProps) {
  const {t} = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [results, setResults] = React.useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);


  const isCyrillic = /[а-яё]/i.test(debouncedSearchTerm);
  const isLatvian = /[āčēģīķļņšūž]/i.test(debouncedSearchTerm);
  let languageHeader = "en";
  if (isCyrillic) {
    languageHeader = "ru";
  } else if (isLatvian) {
    languageHeader = "lv";
  }

  React.useEffect(() => {
    if (!debouncedSearchTerm) {
      setResults([]);
      return;
    }

    const fetchLocations = async () => {
      
      setIsLoading(true);
      try {       
        const url = `${NOMINATIM_URL}?q=${encodeURIComponent(debouncedSearchTerm)}&format=json&limit=10&addressdetails=1&extratags=1`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'DroneAppV1 (your-email@example.com)',
                'Accept-Language': languageHeader
            }
        });
        
        if (!response.ok) {
          throw new Error("Error Nominatim API");
        }
        
        const data: LocationResult[] = await response.json();
        setResults(data);

      } catch (error) {
        console.error("Connection Error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, [debouncedSearchTerm]);

  const handleSelect = (result: LocationResult) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    onSelectLocation(lat, lon); 
    
    setSearchTerm(result.display_name);
    setResults([]); 
    setOpen(false); 
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
    <div className="w-full xl:w-[250px]">
      {/* --- Desktop: outline --- */}
      <Button
        variant="outline"
        className="hidden xl:flex w-full justify-between pl-6 bg-neutral-900/50 border-neutral-100/35 text-white hover:bg-neutral-700/75"
      >
        <div className="truncate">{searchTerm || t("findplace")}</div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {/* --- Mobile: ghost --- */}
      <Button
        variant="ghost"
        className="flex xl:hidden w-full justify-center bg-transparent text-white"
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  </PopoverTrigger>
      <PopoverContent align="end" className="w-full xl:w-[250px] p-0 z-[1001] bg-neutral-800/75 backdrop-blur-xs border border-neutral-100/35 rounded-lg text-white">
        <Command className="bg-transparent text-white" shouldFilter={false}>
          <CommandInput 
            placeholder={t("placename")} 
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="placeholder:text-neutral-400" 
          />
          <CommandList>
            {isLoading ? (
                <CommandEmpty className="py-6 text-center text-sm">{t('searching')}</CommandEmpty>
            ) : (
                <>
                    <CommandEmpty>{t('notfound')}</CommandEmpty>
                    <CommandGroup heading={t('results')}>
                        {results.map((result, index) => (
                            <CommandItem
                                key={`${result.lat}-${result.lon}-${index}`}
                                value={`${result.display_name}-${index}`}
                                onSelect={() => handleSelect(result)}
                                className="hover:bg-neutral-100/10 text-white flex items-center"
                            >
                                <MapPin className="mr-2 h-4 w-4 opacity-70" />
                                {result.display_name}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// 💡 Вспомогательный хук для Debounce (замедления запросов)
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}