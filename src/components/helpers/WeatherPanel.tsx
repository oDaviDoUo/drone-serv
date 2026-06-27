"use client";
import React, { useMemo } from 'react';
import { useWeatherStore } from '@/store/useWeatherStore';
import useStationsStore from '@/store/useStationsStore';
import { Button } from '../ui/button';
import { 
  Wind, Droplets, Gauge, Thermometer, Eye, CloudRain, X, 
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

const WeatherPanel = () => {
  const { activeStationId, isOpen, close, openStation } = useWeatherStore();
  
  const stations = useStationsStore((s) => s.stations);

  const currentStation = useMemo(() => 
    stations.find(s => s.id === activeStationId), 
  [stations, activeStationId]);

  const availableStations = useMemo(() => 
    stations.filter(s => s.sensorData), 
  [stations]);

  // 1. УБРАЛИ return null ОТСЮДА!
  // Раньше тут был if (!currentStation?.sensorData) return null; 
  // Это не давало анимации проиграться.

  const weather = currentStation?.sensorData;

  const handleSwitch = (direction: 'prev' | 'next') => {
    if (!currentStation) return; // Добавили проверку на null здесь

    const currentIndex = availableStations.findIndex(s => s.id === currentStation.id);
    if (currentIndex === -1) return;

    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % availableStations.length;
    } else {
      nextIndex = (currentIndex - 1 + availableStations.length) % availableStations.length;
    }
    
    openStation(availableStations[nextIndex].id);
  };

  // 2. ЗАЩИТА PARAMS
  // Мы вычисляем params только если есть weather. Иначе пустой массив.
  // Это нужно, чтобы код не падал с ошибкой "Cannot read property of undefined".
  const params = weather ? [
    { label: 'Wind Speed', value: `${weather.windSpeed} m/s`, icon: Wind, color: 'text-blue-400' },
    { label: 'Temperature', value: `${weather.temperature}°C`, icon: Thermometer, color: 'text-orange-400' },
    { label: 'Humidity', value: `${weather.humidity}%`, icon: Droplets, color: 'text-cyan-400' },
    { label: 'Pressure', value: `${weather.pressure} hPa`, icon: Gauge, color: 'text-emerald-400' },
    { label: 'Dew Point', value: `${weather.dewPoint}°C`, icon: CloudRain, color: 'text-indigo-400' },
    { label: 'Visibility', value: `${weather.visibility} km`, icon: Eye, color: 'text-slate-400' },
  ] : [];

  return (
    <AnimatePresence>
      {/* 3. ПРОВЕРКА ЗДЕСЬ 
          Мы показываем панель только если isOpen=true И есть weather.
          Когда ты нажмешь close(), isOpen станет false, и AnimatePresence
          начнет анимацию exit, используя последние данные из стора. 
      */}
      {isOpen && currentStation && weather && (
        <motion.div
          key="weather-panel" // Всегда добавляй key для AnimatePresence
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-5 right-1 xl:right-[80px] w-[200px] xl:w-[350px] z-[1000]
                     bg-neutral-800/75 backdrop-blur-xs border border-neutral-100/35 
                     rounded-lg shadow-xl flex flex-col text-xs overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
               <div>
                 <h3 className="font-bold text-sm text-white tracking-wide">{currentStation.name}</h3>
                 <p className="text-[10px] text-neutral-400 uppercase tracking-widest">Weather Station</p>
               </div>
            </div>

            <div className="flex items-center gap-1 mr-1">
                  {availableStations.length > 1 && (
                  <div>
                    <button onClick={() => handleSwitch('prev')} className="p-1 hover:bg-white/10 rounded-md transition text-neutral-400 hover:text-white">
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleSwitch('next')} className="p-1 hover:bg-white/10 rounded-md transition text-neutral-400 hover:text-white">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                  </div>
                   )}
                   
                   <Button size="icon" variant="ghost" onClick={close}>
                    <X className="h-4 w-4 text-neutral-300" />
                  </Button>
                </div>
          </div>
          
          {/* Grid */}
          <div className="px-4 py-2 grid grid-cols-1 xl:grid-cols-2 gap-1">
            {params.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-1 p-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2 text-neutral-400">
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                  <span className="text-[10px] uppercase font-medium">{item.label}</span>
                </div>
                <div className="text-[16px] font-mono font-semibold ml-6 text-neutral-200">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default WeatherPanel;