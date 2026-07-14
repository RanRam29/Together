import { Alert, Platform } from "react-native";

import { successHaptic } from "@/lib/motion";
import {
  useFeedbackStore,
  type SuccessFeedback,
} from "@/stores/feedback-store";

/** Show a celebration overlay — works on web and native (Alert.alert does not work on web). */
export function showSuccess(options: SuccessFeedback) {
  successHaptic();
  useFeedbackStore.getState().showSuccess({
    autoDismissMs: 2000,
    icon: "checkmark-circle",
    iconColor: "#534AB7",
    iconBgClass: "bg-purple-bg",
    ...options,
  });
}

/** Show a dismissible error banner at the bottom of the screen. */
export function showError(message: string) {
  useFeedbackStore.getState().showError(message);
}

type ConfirmOptions = {
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
};

/** Confirmation dialog — custom modal on web, native Alert elsewhere. */
export function confirmAction(
  title: string,
  message: string,
  options?: ConfirmOptions,
): Promise<boolean> {
  const confirmText = options?.confirmText ?? "OK";
  const cancelText = options?.cancelText ?? "Cancel";

  if (Platform.OS === "web") {
    return useFeedbackStore.getState().requestConfirm({
      title,
      message,
      confirmText,
      cancelText,
      destructive: options?.destructive,
    });
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelText, style: "cancel", onPress: () => resolve(false) },
      {
        text: confirmText,
        style: options?.destructive ? "destructive" : "default",
        onPress: () => resolve(true),
      },
    ]);
  });
}

export function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}
