import { Text, View } from "react-native";

import { EmptyState } from "@/components/motion/EmptyState";
import type { ProfileViewEntry } from "@/hooks/useProfileViews";

interface ProfileViewsCardProps {
  title: string;
  emptyLabel: string;
  entries: ProfileViewEntry[];
  formatDate: (iso: string) => string;
  anonymousLabel: string;
}

export function ProfileViewsCard({
  title,
  emptyLabel,
  entries,
  formatDate,
  anonymousLabel,
}: ProfileViewsCardProps) {
  return (
    <View className="bg-surface border border-border rounded-card p-4 mb-4">
      <Text className="text-base font-bold text-ink mb-3 font-rubik text-start">
        {title}
      </Text>
      {entries.length === 0 ? (
        <EmptyState title={emptyLabel} variant="compact" className="py-2" />
      ) : (
        entries.map((entry) => (
          <View
            key={entry.id}
            className="flex-row items-center justify-between py-2 border-b border-border/40"
          >
            <Text className="text-xs text-ink-2">{formatDate(entry.created_at)}</Text>
            <Text className="text-sm text-ink font-medium font-rubik">
              {entry.viewer_name ?? anonymousLabel}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}
