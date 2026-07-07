import { create } from "zustand";

interface ParentState {
  selectedChildId: string | null;
  setSelectedChildId: (childId: string | null) => void;
  reset: () => void;
}

export const useParentStore = create<ParentState>((set) => ({
  selectedChildId: null,
  setSelectedChildId: (selectedChildId) => set({ selectedChildId }),
  reset: () => set({ selectedChildId: null }),
}));
