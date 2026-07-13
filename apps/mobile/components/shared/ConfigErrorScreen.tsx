import { ScrollView, Text, View } from "react-native";

/**
 * Fatal-config screen shown when required environment variables are missing at
 * runtime (e.g. an EAS build produced without the Supabase env vars). Renders
 * instead of the app so the failure is visible and diagnosable rather than a
 * silent white screen or a startup crash. Intentionally self-contained: no
 * Supabase, network, i18n, or navigation dependencies — those may be exactly
 * what is broken. Copy is hard-coded Hebrew.
 */
export function ConfigErrorScreen() {
  const missing = [
    "EXPO_PUBLIC_SUPABASE_URL",
    "EXPO_PUBLIC_SUPABASE_ANON_KEY",
  ].filter((key) => !process.env[key]);

  return (
    <View className="flex-1 items-center justify-center bg-bg px-6">
      <ScrollView
        contentContainerClassName="items-center"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-16 h-16 rounded-full bg-coral-bg items-center justify-center mb-5">
          <Text className="text-coral text-3xl font-rubik-bold">!</Text>
        </View>

        <Text className="text-2xl font-rubik-bold text-ink mb-3 text-center">
          האפליקציה אינה מוגדרת
        </Text>

        <Text className="text-base font-rubik text-ink-2 mb-6 text-center leading-6">
          חסרים משתני סביבה נדרשים בבנייה. יש להגדיר אותם ב‑EAS ולבנות מחדש.
        </Text>

        <View className="w-full bg-surface border border-border rounded-card p-4">
          <Text className="text-sm font-rubik-medium text-ink-3 mb-2 text-right">
            משתנים חסרים
          </Text>
          {missing.length > 0 ? (
            missing.map((key) => (
              <Text
                key={key}
                className="text-sm font-rubik text-coral-ink mb-1 text-right"
              >
                {key}
              </Text>
            ))
          ) : (
            <Text className="text-sm font-rubik text-ink-2 text-right">
              כתובת Supabase אינה תקינה
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
