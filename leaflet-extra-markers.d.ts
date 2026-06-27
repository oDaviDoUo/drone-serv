import * as L from 'leaflet';

declare module 'leaflet' {
  // Плагин добавляет метод ExtraMarkers напрямую в объект L
  namespace ExtraMarkers {
    interface ExtraMarkersOptions extends L.IconOptions {
      icon?: string;
      innerHTML?: string;
      markerColor?: 'red' | 'orange-dark' | 'orange' | 'yellow' | 'blue' | 'blue-dark' | 'cyan' | 'purple' | 'violet' | 'pink' | 'green-dark' | 'green' | 'green-light' | 'black' | 'white';
      iconColor?: string;
      shape?: 'circle' | 'square' | 'star' | 'penta';
      prefix?: string;
      extraClasses?: string;
    }
    function icon(options: ExtraMarkersOptions): L.Icon;
  }

  // Это позволит писать L.ExtraMarkers.icon(...)
  export const ExtraMarkers: typeof ExtraMarkers;
}