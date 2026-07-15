import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { WeeklySummary } from "@/hooks/useWeeklySummary";

interface Props {
  summary: WeeklySummary;
  childName: string;
}

export function WeeklySummaryCard({ summary, childName }: Props) {
  const { t } = useTranslation();

  const getTrendIcon = (trend: WeeklySummary["mood_trend"]) => {
    switch (trend) {
      case "improving":
        return "📈";
      case "declining":
        return "📉";
      case "stable":
      case "new":
      default:
        return "➡️";
    }
  };

  const getTrendText = (trend: WeeklySummary["mood_trend"]) => {
    switch (trend) {
      case "improving":
        return "מגמת שיפור";
      case "declining":
        return "מגמת ירידה";
      case "stable":
        return "מגמה יציבה";
      case "new":
        return "שבוע ראשון";
      default:
        return "אין מספיק נתונים";
    }
  };

  return (
    <View className="bg-surface border border-border rounded-card p-5 mb-6">
      <Text className="text-lg font-bold text-purple mb-1 font-rubik text-start">
        השבוע של {childName} 🌟
      </Text>
      <Text className="text-sm text-ink-2 mb-4 text-start">
        סיכום שבועי קצר של המפגשים
      </Text>

      <View className="flex-row justify-between mb-4">
        <View className="flex-1 items-center bg-sand rounded-card p-3 mr-2">
          <Text className="text-2xl font-bold text-purple mb-1 font-rubik">
            {summary.days_attended}
          </Text>
          <Text className="text-xs text-ink-2">ימי מפגש</Text>
        </View>
        <View className="flex-1 items-center bg-sand rounded-card p-3 ml-2">
          <Text className="text-2xl font-bold text-purple mb-1 font-rubik">
            {summary.mood_avg}
          </Text>
          <Text className="text-xs text-ink-2">ממוצע מצב רוח</Text>
        </View>
      </View>

      <View className="bg-sand rounded-card p-3 mb-4 flex-row items-center justify-between">
        <Text className="text-sm text-ink font-rubik">מגמת מצב רוח השבוע</Text>
        <View className="flex-row items-center">
          <Text className="text-sm font-bold text-purple mr-2 font-rubik">
            {getTrendText(summary.mood_trend)}
          </Text>
          <Text className="text-lg">{getTrendIcon(summary.mood_trend)}</Text>
        </View>
      </View>

      {summary.highlights && summary.highlights.length > 0 && (
        <View>
          <Text className="text-sm font-bold text-amber mb-2 font-rubik text-start">
            רגעים שווים השבוע:
          </Text>
          {summary.highlights.map((h, i) => (
            <View key={i} className="flex-row items-start mb-2">
              <Text className="text-sm text-amber mr-2 mt-0.5">•</Text>
              <Text className="text-sm text-ink leading-5 flex-1 text-start">
                {h}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
