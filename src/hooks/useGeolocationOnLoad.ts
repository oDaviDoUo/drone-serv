// src/hooks/useGeolocationOnLoad.ts
import { useEffect } from 'react';

const IPAPI_URL = "https://ipapi.co/json/";

interface IpLocation {
    latitude: number;
    longitude: number;
    country_name: string;
}

/**
 * Хук для определения местоположения пользователя по IP при первой загрузке.
 * @param onLocationFound Функция обратного вызова (lat, lon)
 */
export const useGeolocationOnLoad = (onLocationFound: (lat: number, lon: number) => void) => {
    
    // Флаг для однократного выполнения
    useEffect(() => {
        let isCancelled = false;
        
        const fetchLocation = async () => {
            try {
                // Если карта уже имеет сохраненное состояние, можно пропустить этот шаг.
                // Но для первого запуска это идеально.
                
                const response = await fetch(IPAPI_URL);
                if (!response.ok) {
                    throw new Error("Не удалось получить данные о местоположении по IP.");
                }

                const data: IpLocation = await response.json();

                if (!isCancelled && data.latitude && data.longitude) {
                    console.log(`Геолокация по IP: ${data.country_name}, Lat: ${data.latitude}, Lon: ${data.longitude}`);
                    onLocationFound(data.latitude, data.longitude);
                }

            } catch (error) {
                console.error("Ошибка геолокации:", error);
                // Опционально: можно установить координаты по умолчанию (например, центр страны)
            }
        };

        fetchLocation();

        return () => {
            isCancelled = true;
        };
    }, [onLocationFound]); 
    // onLocationFound включен в зависимости, но поскольку это будет 
    // стабильная функция (или обернута в useCallback), он не вызовет бесконечного цикла.
};