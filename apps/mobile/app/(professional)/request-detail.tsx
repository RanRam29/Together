import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import { ChildSummary } from "@/components/professional/Cards";
import { OutlineButton, PlaceholderCard, PrimaryButton, ScreenShell } from "@/components/ui/Screen";
import { promptPushPermission } from "@/components/shared/PushPermissionProvider";
import {
  useIncomingRequest,
  useMyProfessional,
  useRespondToRequest,
} from "@/hooks/useProfessional";
import { formatMatchReason } from "@/lib/format-match-reason";
import { useAuthStore } from "@/stores/auth-store";

export default function ProfessionalRequestDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;
  const { requestId } = useLocalSearchParams<{ requestId: string }>();

  const { data: professional } = useMyProfessional(userId);
  const professionalId = professional?.id;

  const { data: request, isLoading, error } = useIncomingRequest(
    requestId,
    professionalId,
  );
  const respond = useRespondToRequest(professionalId);

  const child = request?.child;
  const isPending = request?.status === "pending";

  function handleRespond(status: "interested" | "rejected") {
    if (!requestId) return;

    respond.mutate(
      { requestId, status },
      {
        onSuccess: () => {
          if (status === "interested" && userId) {
            void promptPushPermission(userId);
          }
          router.back();
        },
        onError: (err) => {
          const message =
            err instanceof Error ? err.message : t("common.tryAgain");
          if (Platform.OS === "web") {
            window.alert(message);
            return;
          }
          Alert.alert(t("common.error"), message);
        },
      },
    );
  }

  if (isLoading) {
    return (
      <ScreenShell title={t("professional.childProfileTitle")} showBack>
        <ActivityIndicator size="large" color="#0F6E56" className="mt-8" />
      </ScreenShell>
    );
  }

  if (error || !request || !child) {
    return (
      <ScreenShell title={t("professional.childProfileTitle")} showBack>
        <PlaceholderCard text={t("common.tryAgain")} />
      </ScreenShell>
    );
  }

  const detailRows = [
    {
      label: t("parent.childAge"),
      value: String(child.age),
    },
    {
      label: t("parent.primaryCategory"),
      value: t(`enums.needCategory.${child.category}`),
    },
    ...(child.secondary_category
      ? [
          {
            label: t("parent.secondaryCategory"),
            value: t(`enums.needCategory.${child.secondary_category}`),
          },
        ]
      : []),
    {
      label: t("parent.framework"),
      value: t(`enums.frameworkType.${child.framework}`),
    },
    {
      label: t("parent.functioningLevel"),
      value: t(`parent.functioningLevel${child.functioning_level}`),
    },
    {
      label: t("parent.communicationVerbal"),
      value: child.communication_verbal
        ? t("professional.verbal")
        : t("professional.nonVerbal"),
    },
  ];

  return (
    <ScreenShell title={t("professional.childProfileTitle")} showBack>
      <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-ink font-rubik mb-2 text-start">
          {child.first_name}
        </Text>
        <Text className="text-sm text-ink-2 mb-4 text-start leading-5">
          {t("professional.childProfileSubtitle")}
        </Text>

        <ChildSummary
          age={child.age}
          categoryLabel={t(`enums.needCategory.${child.category}`)}
          frameworkLabel={t(`enums.frameworkType.${child.framework}`)}
          functioningLabel={t(`parent.functioningLevel${child.functioning_level}`)}
          communicationLabel={
            child.communication_verbal
              ? t("professional.verbal")
              : t("professional.nonVerbal")
          }
        />

        <View className="bg-surface border border-border rounded-card p-4 mt-4 mb-4">
          {detailRows.map((row) => (
            <View
              key={row.label}
              className="flex-row items-start justify-between py-2 border-b border-border/40 last:border-b-0"
            >
              <Text className="text-sm text-ink-2 text-start flex-1">{row.label}</Text>
              <Text className="text-sm font-semibold text-ink text-start flex-1">
                {row.value}
              </Text>
            </View>
          ))}
        </View>

        {request.parent_message ? (
          <View className="bg-surface-2 rounded-card p-4 mb-4">
            <Text className="text-sm font-bold text-ink mb-2 text-start">
              {t("professional.parentMessageLabel")}
            </Text>
            <Text className="text-sm text-ink-2 leading-6 text-start">
              {request.parent_message}
            </Text>
          </View>
        ) : null}

        {request.match_reason ? (
          <View className="bg-teal/10 rounded-card p-4 mb-4">
            <Text className="text-sm font-bold text-teal mb-2 text-start">
              {t("professional.matchReasonLabel")}
            </Text>
            <Text className="text-sm text-teal leading-6 text-start">
              {formatMatchReason(request.match_reason, t)}
            </Text>
          </View>
        ) : null}

        <Text className="text-xs text-ink-2 mb-6 leading-5 text-start">
          {t("parent.requestPrivacyNote")}
        </Text>

        {isPending ? (
          <View className="flex-row gap-3 mb-8">
            <View className="flex-1">
              <PrimaryButton
                label={t("professional.accept")}
                onPress={() => handleRespond("interested")}
                variant="teal"
                loading={respond.isPending}
                fullWidth
              />
            </View>
            <View className="flex-1">
              <OutlineButton
                label={t("professional.reject")}
                onPress={() => handleRespond("rejected")}
                disabled={respond.isPending}
                variant="coral"
                fullWidth
              />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </ScreenShell>
  );
}
