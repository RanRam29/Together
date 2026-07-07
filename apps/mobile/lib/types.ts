export type {
  AppLanguage,
  Child,
  ChildDetails,
  Checkin,
  DailyLog,
  Database,
  Enums,
  Match,
  MatchRequest,
  Profile,
  Professional,
  Review,
  UserRole,
} from "@toghther/shared";

import type { Enums } from "@toghther/shared";

export interface ChildMatch {
  professional_id: string;
  display_name: string;
  bio: string;
  specialties: Enums<"need_category">[];
  experience_years: number;
  rating_avg: number;
  rating_count: number;
  distance_km: number;
  score: number;
  match_reason: string;
}
