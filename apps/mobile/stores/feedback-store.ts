import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";
import { create } from "zustand";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export type SuccessFeedback = {
  title: string;
  description?: string;
  footnote?: string;
  icon?: IoniconName;
  iconColor?: string;
  iconBgClass?: string;
  autoDismissMs?: number;
  onDismiss?: () => void;
};

export type ConfirmFeedback = {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  destructive?: boolean;
  resolve: (confirmed: boolean) => void;
};

type FeedbackState = {
  success: SuccessFeedback | null;
  error: string | null;
  confirm: ConfirmFeedback | null;
  showSuccess: (payload: SuccessFeedback) => void;
  clearSuccess: () => void;
  showError: (message: string) => void;
  clearError: () => void;
  requestConfirm: (input: Omit<ConfirmFeedback, "resolve">) => Promise<boolean>;
  resolveConfirm: (confirmed: boolean) => void;
};

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
  success: null,
  error: null,
  confirm: null,

  showSuccess: (payload) => set({ success: payload, error: null }),

  clearSuccess: () => set({ success: null }),

  showError: (message) => set({ error: message, success: null }),

  clearError: () => set({ error: null }),

  requestConfirm: (input) =>
    new Promise<boolean>((resolve) => {
      set({
        confirm: {
          ...input,
          resolve,
        },
      });
    }),

  resolveConfirm: (confirmed) => {
    const pending = get().confirm;
    pending?.resolve(confirmed);
    set({ confirm: null });
  },
}));
