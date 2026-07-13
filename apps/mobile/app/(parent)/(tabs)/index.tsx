import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ChildSelector, MatchCard } from "@/components/parent/MatchCard";
import { PendingInvitations } from "@/components/parent/PendingInvitations";
import { ActiveMatchBanner } from "@/components/shared/ActiveMatchBanner";
import { PlaceholderCard, ScreenShell } from "@/components/ui/Screen";
import { useActiveMatchForParent } from "@/hooks/useActiveMatch";
import { useChildMatches } from "@/hooks/useChildMatches";
import { useChildren } from "@/hooks/useChildren";
import { useAuthStore } from "@/stores/auth-store";
import { useParentStore } from "@/stores/parent-store";

export default function ParentHomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const parentId = session?.user?.id;
  const setSelectedChildId = useParentStore((s) => s.setSelectedChildId);
  const selectedChildId = useParentStore((s) => s.selectedChildId);

  const {
    children,
    selectedChild,
    isLoading: childrenLoading,
    refetch: refetchChildren,
    isRefetching: childrenRefetching,
  } = useChildren(parentId);

  const { data: activeMatch } = useActiveMatchForParent(parentId);

  const {
    data: matches = [],
    isLoading: matchesLoading,
    refetch: refetchMatches,
    isRefetching: matchesRefetching,
    error: matchesError,
  } = useChildMatches(selectedChild?.published ? selectedChild.id : undefined);

  const isLoading = childrenLoading || matchesLoading;
  const isRefetching = childrenRefetching || matchesRefetching;

  function handleRefresh() {
    refetchChildren();
    refetchMatches();
  }

  const subtitle = selectedChild
    ? t("parent.homeSubtitleNamed", { name: selectedChild.first_name })
    : t("parent.homeSubtitle");

  return (
    <ScreenShell
      title={t("parent.homeTitle")}
      subtitle={subtitle}
      headerRight={
        <Pressable onPress={() => router.push("/settings")} className="p-2 -mr-2 bg-surface rounded-full border border-border">
          <Ionicons name="settings-outline" size={24} color="#534AB7" />
        </Pressable>
      }
    >
      {activeMatch ? (
        <ActiveMatchBanner
          title={t("activeMatch.bannerEyebrow")}
          subtitle={t("activeMatch.bannerSubtitle", {
            name: activeMatch.professional?.display_name ?? "",
          })}
          actionLabel={t("activeMatch.bannerAction")}
          onPress={() =>
            router.push({
              pathname: "/(active-match)",
              params: { matchId: activeMatch.id },
            })
          }
        />
      ) : null}

      <PendingInvitations />

      {children.length > 1 ? (
        <ChildSelector
          children={children}
          selectedId={selectedChildId}
          onSelect={setSelectedChildId}
        />
      ) : null}

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#534AB7" className="mt-8" />
        ) : children.length === 0 ? (
          <PlaceholderCard text={t("parent.noChildProfile")} />
        ) : !selectedChild?.published ? (
          <PlaceholderCard text={t("parent.childNotPublished")} />
        ) : matchesError ? (
          <PlaceholderCard text={t("parent.matchesError")} />
        ) : matches.length === 0 ? (
          <PlaceholderCard text={t("parent.noMatches")} />
        ) : (
          <View
            className={
              Platform.OS === "web" ? "flex-row flex-wrap gap-4 w-full" : "w-full"
            }
          >
            {matches.map((match) => (
              <View
                key={match.professional_id}
                className={Platform.OS === "web" ? "w-[calc(50%-8px)]" : "w-full"}
              >
                <MatchCard
                  name={match.display_name}
                  bio={match.bio}
                  matchReason={match.match_reason}
                  score={match.score}
                  distanceKm={match.distance_km}
                  ratingAvg={match.rating_avg}
                  distanceLabel={t("parent.distanceKm", { km: match.distance_km })}
                  onPress={() =>
                    router.push({
                      pathname: "/(parent)/match-detail",
                      params: {
                        professionalId: match.professional_id,
                        childId: selectedChild!.id,
                        displayName: match.display_name,
                        bio: match.bio,
                        matchReason: match.match_reason,
                        score: String(match.score),
                      },
                    })
                  }
                />
              </View>
            ))}
          </View>
        )}
        <View className="h-6" />
      </ScrollView>
    </ScreenShell>
  );
}
