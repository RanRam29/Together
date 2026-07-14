import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { OutlineButton, PrimaryButton } from "@/components/ui/Screen";
import { formatMatchReason } from "@/lib/format-match-reason";
import { webPressableClass } from "@/lib/platform";

interface ChildSummaryProps {
  age: number;
  categoryLabel: string;
  frameworkLabel: string;
  functioningLabel: string;
  communicationLabel: string;
}

export function ChildSummary({
  age,
  categoryLabel,
  frameworkLabel,
  functioningLabel,
  communicationLabel,
}: ChildSummaryProps) {
  return (
    <View className="flex-row flex-wrap gap-2 mt-2">
      {[
        `${age}`,
        categoryLabel,
        frameworkLabel,
        functioningLabel,
        communicationLabel,
      ].map((chip, index) => (
        <View
          key={`${chip}-${index}`}
          className="bg-surface-2 rounded-full px-3 py-1"
        >
          <Text className="text-xs text-ink-2">{chip}</Text>
        </View>
      ))}
    </View>
  );
}

interface IncomingRequestCardProps {
  childName: string;
  age: number;
  categoryLabel: string;
  frameworkLabel: string;
  functioningLabel: string;
  communicationLabel: string;
  statusLabel: string;
  statusColor: string;
  parentMessage?: string | null;
  matchReason?: string | null;
  canRespond: boolean;
  respondLabel: string;
  rejectLabel: string;
  viewProfileLabel: string;
  onViewProfile: () => void;
  onAccept: () => void;
  onReject: () => void;
  loading?: boolean;
}

export function IncomingRequestCard({
  childName,
  age,
  categoryLabel,
  frameworkLabel,
  functioningLabel,
  communicationLabel,
  statusLabel,
  statusColor,
  parentMessage,
  matchReason,
  canRespond,
  respondLabel,
  rejectLabel,
  viewProfileLabel,
  onViewProfile,
  onAccept,
  onReject,
  loading = false,
}: IncomingRequestCardProps) {
  const { t } = useTranslation();
  const formattedMatchReason = matchReason
    ? formatMatchReason(matchReason, t)
    : null;

  return (
    <View className="bg-surface border border-border rounded-card p-5 mb-4">
      <View className="flex-row items-center justify-between mb-1">
        <Pressable
          onPress={onViewProfile}
          className={`active:opacity-80 ${webPressableClass}`}
          accessibilityRole="button"
          accessibilityLabel={viewProfileLabel}
        >
          <Text className="text-lg font-bold text-teal font-rubik text-start">
            {childName}
          </Text>
        </Pressable>
        <Text className={`text-sm font-semibold ${statusColor}`}>{statusLabel}</Text>
      </View>

      <ChildSummary
        age={age}
        categoryLabel={categoryLabel}
        frameworkLabel={frameworkLabel}
        functioningLabel={functioningLabel}
        communicationLabel={communicationLabel}
      />

      {parentMessage ? (
        <Text className="text-sm text-ink-2 leading-5 mt-3 text-start" numberOfLines={3}>
          {parentMessage}
        </Text>
      ) : null}

      {formattedMatchReason ? (
        <Text className="text-xs text-teal mt-2 text-start">{formattedMatchReason}</Text>
      ) : null}

      <Pressable
        onPress={onViewProfile}
        className={`mt-4 self-start active:opacity-80 ${webPressableClass}`}
      >
        <Text className="text-sm font-semibold text-purple font-rubik">
          {viewProfileLabel}
        </Text>
      </Pressable>

      {canRespond ? (
        <View className="flex-row gap-3 mt-4">
          <View className="flex-1">
            <PrimaryButton
              label={respondLabel}
              onPress={onAccept}
              variant="teal"
              loading={loading}
              fullWidth
            />
          </View>
          <View className="flex-1">
            <OutlineButton
              label={rejectLabel}
              onPress={onReject}
              disabled={loading}
              variant="coral"
              fullWidth
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

interface BrowseChildCardProps {
  childName: string;
  age: number;
  categoryLabel: string;
  frameworkLabel: string;
  functioningLabel: string;
  communicationLabel: string;
  interestLabel: string;
  onExpressInterest: () => void;
  loading?: boolean;
}

export function BrowseChildCard({
  childName,
  age,
  categoryLabel,
  frameworkLabel,
  functioningLabel,
  communicationLabel,
  interestLabel,
  onExpressInterest,
  loading = false,
}: BrowseChildCardProps) {
  return (
    <View className="bg-surface border border-border rounded-card p-5 mb-4">
      <Text className="text-lg font-bold text-ink font-rubik">{childName}</Text>
      <ChildSummary
        age={age}
        categoryLabel={categoryLabel}
        frameworkLabel={frameworkLabel}
        functioningLabel={functioningLabel}
        communicationLabel={communicationLabel}
      />
      <View className="mt-4">
        <PrimaryButton
          label={interestLabel}
          onPress={onExpressInterest}
          variant="teal"
          loading={loading}
        />
      </View>
    </View>
  );
}
