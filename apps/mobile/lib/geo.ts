export function toGeoPoint(lng: number, lat: number) {
  return {
    type: "Point" as const,
    coordinates: [lng, lat] as [number, number],
  };
}
