import { Platform, Pressable, ScrollView, Text, View } from "react-native";

import type { Child } from "@/lib/types";

interface ChildSelectorProps {
  children: Child[];
  selectedId: string | null;
  onSelect: (childId: string) => void;
  addLabel?: string;
  onAdd?: () => void;
}

function ChildChip({
  label,
  selected,
  onPress,
  dashed,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  dashed?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`shrink-0 rounded-full px-5 py-2.5 border active:opacity-90 ${
        dashed
          ? "border-dashed border-purple bg-purple-bg"
          : selected
            ? "bg-purple border-purple"
            : "bg-surface border-border"
      }`}
    >
      <Text
        className={`text-sm font-semibold font-rubik whitespace-nowrap ${
          dashed ? "text-purple-ink" : selected ? "text-white" : "text-ink"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function ChildSelector({
  children,
  selectedId,
  onSelect,
  addLabel,
  onAdd,
}: ChildSelectorProps) {
  const chips = (
    <>
      {children.map((child) => {
        const selected = child.id === selectedId;
        return (
          <ChildChip
            key={child.id}
            label={child.first_name}
            selected={selected}
            onPress={() => onSelect(child.id)}
          />
        );
      })}
      {onAdd && addLabel ? (
        <ChildChip
          label={`+ ${addLabel}`}
          dashed
          onPress={onAdd}
        />
      ) : null}
    </>
  );

  if (Platform.OS === "web") {
    return (
      <View className="flex-row flex-wrap gap-2 mb-6 justify-end">{chips}</View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-6 grow-0 shrink-0"
      style={{ flexGrow: 0, flexShrink: 0, maxHeight: 48 }}
      contentContainerStyle={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 4,
      }}
    >
      {chips}
    </ScrollView>
  );
}

interface MatchCardProps {
  name: string;
  bio: string;
  matchReason: string;
  score: number;
  distanceKm: number;
  ratingAvg: number;
  distanceLabel: string;
  onPress?: () => void;
}

export function MatchCard({
  name,
  bio,
  matchReason,
  score,
  ratingAvg,
  distanceLabel,
  onPress,
}: MatchCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-surface border border-border rounded-card p-5 mb-4 active:opacity-90 w-full"
    >
      <View className="flex-row items-start justify-between mb-2">
        <Text className="text-lg font-bold text-ink font-rubik flex-1 text-right">
          {name}
        </Text>
        <View className="bg-purple-bg rounded-full px-3 py-1 ms-2 shrink-0">
          <Text className="text-purple-ink text-sm font-bold font-rubik">
            {Math.round(score)}
          </Text>
        </View>
      </View>
      {bio ? (
        <Text className="text-sm text-ink-2 mb-3 leading-5 text-right" numberOfLines={2}>
          {bio}
        </Text>
      ) : null}
      <View className="flex-row items-start gap-1 bg-teal/10 rounded-lg p-2 mb-3">
        <Text className="text-xs text-teal font-medium flex-1 leading-5 text-right">
          ✦ {matchReason}
        </Text>
      </View>
      <View className="flex-row gap-4 justify-end">
        <Text className="text-xs text-ink-2">{distanceLabel}</Text>
        {ratingAvg > 0 ? (
          <Text className="text-xs text-ink-2">★ {ratingAvg.toFixed(1)}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}
