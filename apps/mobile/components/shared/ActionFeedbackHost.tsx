import { useEffect, useRef } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { SentConfirmationOverlay } from "@/components/shared/SentConfirmationOverlay";
import { useFeedbackStore } from "@/stores/feedback-store";

export function ActionFeedbackHost() {
  const { t } = useTranslation();
  const success = useFeedbackStore((s) => s.success);
  const error = useFeedbackStore((s) => s.error);
  const confirm = useFeedbackStore((s) => s.confirm);
  const clearSuccess = useFeedbackStore((s) => s.clearSuccess);
  const clearError = useFeedbackStore((s) => s.clearError);
  const resolveConfirm = useFeedbackStore((s) => s.resolveConfirm);

  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!success) return;

    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
    }

    const delay = success.autoDismissMs ?? 2000;
    successTimerRef.current = setTimeout(() => {
      const onDismiss = success.onDismiss;
      clearSuccess();
      onDismiss?.();
    }, delay);

    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, [success, clearSuccess]);

  useEffect(() => {
    if (!error) return;

    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
    }

    errorTimerRef.current = setTimeout(() => {
      clearError();
    }, 5000);

    return () => {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
    };
  }, [error, clearError]);

  return (
    <>
      <SentConfirmationOverlay
        visible={Boolean(success)}
        title={success?.title ?? ""}
        description={success?.description ?? ""}
        footnote={success?.footnote}
        icon={success?.icon}
        iconColor={success?.iconColor}
        iconBgClass={success?.iconBgClass}
      />

      {error ? (
        <View
          className="absolute bottom-6 start-4 end-4 z-50"
          pointerEvents="box-none"
        >
          <Pressable
            onPress={clearError}
            className="bg-coral rounded-card border border-coral px-4 py-3 shadow-sm active:opacity-90"
          >
            <Text className="text-white text-sm font-semibold font-rubik text-center leading-5">
              {error}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <Modal
        visible={Boolean(confirm)}
        transparent
        animationType="fade"
        onRequestClose={() => resolveConfirm(false)}
      >
        <View className="flex-1 justify-center bg-black/45 px-6">
          <View className="bg-surface rounded-card border border-border p-6">
            <Text className="text-lg font-bold text-ink mb-2 font-rubik text-start">
              {confirm?.title}
            </Text>
            <Text className="text-sm text-ink-2 mb-6 text-start leading-6">
              {confirm?.message}
            </Text>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => resolveConfirm(false)}
                className="flex-1 rounded-card py-3 px-4 border border-border items-center active:opacity-90"
              >
                <Text className="text-ink-2 font-semibold font-rubik">
                  {confirm?.cancelText ?? t("common.cancel")}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => resolveConfirm(true)}
                className={`flex-1 rounded-card py-3 px-4 items-center active:opacity-90 ${
                  confirm?.destructive ? "bg-coral" : "bg-purple"
                }`}
              >
                <Text className="text-white font-semibold font-rubik">
                  {confirm?.confirmText ?? t("common.continue")}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
