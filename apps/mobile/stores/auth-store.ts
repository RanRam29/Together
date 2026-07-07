import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";

import type { AppLanguage, Profile } from "@/lib/types";

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  isHydrated: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setHydrated: (hydrated: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  isHydrated: false,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setHydrated: (isHydrated) => set({ isHydrated }),
  reset: () => set({ session: null, profile: null }),
}));

interface LocaleState {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  language: "he",
  setLanguage: (language) => set({ language }),
}));
