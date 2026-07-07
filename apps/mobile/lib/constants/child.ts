import type { Enums } from "@toghther/shared";

export type NeedCategory = Enums<"need_category">;
export type FrameworkType = Enums<"framework_type">;

export const NEED_CATEGORIES: NeedCategory[] = [
  "autism",
  "adhd",
  "learning_disability",
  "physical",
  "hearing",
  "vision",
  "intellectual",
  "emotional",
  "speech",
  "other",
];

export const FRAMEWORK_TYPES: FrameworkType[] = [
  "regular_school",
  "special_ed",
  "kindergarten",
  "special_kindergarten",
  "daycare",
  "home",
  "other",
];

export const FUNCTIONING_LEVELS = [1, 2, 3] as const;

export interface CityPreset {
  id: string;
  labelKey: string;
  lng: number;
  lat: number;
}

export const CITY_PRESETS: CityPreset[] = [
  { id: "tel_aviv", labelKey: "cities.telAviv", lng: 34.7818, lat: 32.0853 },
  { id: "ramat_gan", labelKey: "cities.ramatGan", lng: 34.81, lat: 32.07 },
  { id: "haifa", labelKey: "cities.haifa", lng: 34.9896, lat: 32.794 },
  { id: "beer_sheva", labelKey: "cities.beerSheva", lng: 34.7915, lat: 31.253 },
  { id: "herzliya", labelKey: "cities.herzliya", lng: 34.8367, lat: 32.1663 },
  { id: "jerusalem", labelKey: "cities.jerusalem", lng: 35.2137, lat: 31.7683 },
];
