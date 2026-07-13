import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Tracks which roles have permanently dismissed the first-launch usage guide
 * ("don't show again"). Persisted to AsyncStorage so it survives restarts.
 */
interface GuideState {
  dismissedRoles: string[];
  hydrated: boolean;
  isDismissed: (role: string) => boolean;
  dismiss: (role: string) => void;
  reset: () => void;
}

export const useGuideStore = create<GuideState>()(
  persist(
    (set, get) => ({
      dismissedRoles: [],
      hydrated: false,
      isDismissed: (role) => get().dismissedRoles.includes(role),
      dismiss: (role) =>
        set({ dismissedRoles: Array.from(new Set([...get().dismissedRoles, role])) }),
      reset: () => set({ dismissedRoles: [] }),
    }),
    {
      name: "together-usage-guide",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ dismissedRoles: s.dismissedRoles }),
      onRehydrateStorage: () => () => {
        useGuideStore.setState({ hydrated: true });
      },
    }
  )
);
