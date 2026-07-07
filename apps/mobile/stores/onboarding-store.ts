import { create } from "zustand";

import type { UserRole } from "@/lib/types";

interface OnboardingState {
  selectedRole: UserRole | null;
  pendingPhone: string;
  setSelectedRole: (role: UserRole) => void;
  setPendingPhone: (phone: string) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  selectedRole: null,
  pendingPhone: "",
  setSelectedRole: (selectedRole) => set({ selectedRole }),
  setPendingPhone: (pendingPhone) => set({ pendingPhone }),
  reset: () => set({ selectedRole: null, pendingPhone: "" }),
}));
