import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";

import { StarRating } from "@/components/shared/StarRating";
import type { Review } from "@/hooks/useReviews";
import { useGetReviewsForProfessional } from "@/hooks/useReviews";

interface ReviewsListProps {
  professionalId: string;
  limit?: number;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("he-IL", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function ReviewRow({ review }: { review: Review }) {
  const { t } = useTranslation();
  const avg =
    (review.reliability + review.professionalism + review.child_fit) / 3;

  return (
    <View className="bg-surface border border-border rounded-card p-4 mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-bold text-ink font-rubik">
          {review.reviewer?.full_name ?? t("reviews.anonymous")}
        </Text>
        <Text className="text-xs text-ink-2">{formatDate(review.created_at)}</Text>
      </View>

      <View className="flex-row items-center gap-2 mb-2">
        <Text className="text-lg">★</Text>
        <Text className="text-sm text-ink-2">
          {t("reviews.averageWithScore", { score: avg.toFixed(1) })}
        </Text>
      </View>

      {review.text ? (
        <Text className="text-sm text-ink leading-5">{review.text}</Text>
      ) : null}
    </View>
  );
}

export function ReviewsList({ professionalId, limit }: ReviewsListProps) {
  const { t } = useTranslation();
  const { data: reviews = [], isLoading } =
    useGetReviewsForProfessional(professionalId);

  const rendered = limit ? reviews.slice(0, limit) : reviews;

  if (isLoading) {
    return <ActivityIndicator size="small" color="#534AB7" className="my-4" />;
  }

  if (reviews.length === 0) {
    return (
      <View className="bg-pearl rounded-card p-4">
        <Text className="text-ink-2 text-sm text-center">
          {t("reviews.emptyForProfessional")}
        </Text>
      </View>
    );
  }

  return (
    <View>
      {rendered.map((review) => (
        <ReviewRow key={review.id} review={review} />
      ))}
      {limit && reviews.length > limit ? (
        <Text className="text-xs text-ink-2 text-center mt-2">
          {t("reviews.andMore", { count: reviews.length - limit })}
        </Text>
      ) : null}
    </View>
  );
}

export function ReviewsSummary({
  professionalId,
}: {
  professionalId: string;
}) {
  const { t } = useTranslation();
  const { data: reviews = [] } = useGetReviewsForProfessional(professionalId);

  if (reviews.length === 0) return null;

  const avg =
    reviews.reduce(
      (sum, r) => sum + (r.reliability + r.professionalism + r.child_fit) / 3,
      0,
    ) / reviews.length;

  return (
    <View className="flex-row items-center gap-2 mb-4">
      <Text className="text-lg">★</Text>
      <Text className="text-sm font-semibold text-ink font-rubik">
        {t("reviews.avgWithCount", {
          score: avg.toFixed(1),
          count: reviews.length,
        })}
      </Text>
    </View>
  );
}

// unused import bridge to satisfy tree shakers in some setups
export { StarRating };
