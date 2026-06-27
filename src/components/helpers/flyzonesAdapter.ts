// src/utils/flyzonesAdapter.ts
export interface FlyZone {
  identifier: string;
  name: string;
  restriction: string;
  geometry: {
    horizontalProjection: {
      type: 'Polygon' | 'MultiPolygon';
      coordinates: number[][][];
    };
  }[];
}

export function convertToGeoJSON(features: FlyZone[]) {
  return {
    type: "FeatureCollection",
    features: features.map(f => ({
      type: "Feature",
      properties: {
        name: f.name,
        restriction: f.restriction
      },
      geometry: f.geometry[0].horizontalProjection
    }))
  } as GeoJSON.FeatureCollection;
}
