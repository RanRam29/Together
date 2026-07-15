import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

import { BrandSpinner } from "@/components/motion/BrandSpinner";
import { EmptyState } from "@/components/motion/EmptyState";
import { PrimaryButton } from "@/components/ui/Screen";

interface StaffQueryFeedbackProps {
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
}

export function StaffQueryFeedback({
  isLoading,
  isError,
  error,
  isEmpty,
  emptyMessage,
  onRetry,
}: StaffQueryFeedbackProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <View className="py-8 items-center">
        <BrandSpinner size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="py-8 items-center gap-3">
        <Text className="text-ink-2 text-center font-rubik">
          {error?.message ?? t("staff.loadError")}
        </Text>
        {onRetry ? (
          <PrimaryButton label={t("common.tryAgain")} onPress={onRetry} />
        ) : null}
      </View>
    );
  }

  if (isEmpty && emptyMessage) {
    return <EmptyState variant="compact" title={emptyMessage} />;
  }

  return null;
}
