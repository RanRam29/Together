import { Pressable, Text, View } from "react-native";

interface ScreenShellProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export function ScreenShell({ title, subtitle, children, footer }: ScreenShellProps) {
  return (
    <View className="flex-1 bg-bg px-6 pt-16">
      <Text className="text-3xl font-bold text-ink mb-2">{title}</Text>
      {subtitle ? (
        <Text className="text-base text-ink-2 mb-8 leading-6">{subtitle}</Text>
      ) : null}
      <View className="flex-1">{children}</View>
      {footer}
    </View>
  );
}

interface PrimaryButtonProps {
  label: string;
  onPress?: () => void;
  variant?: "purple" | "teal";
}

export function PrimaryButton({
  label,
  onPress,
  variant = "purple",
}: PrimaryButtonProps) {
  const bgClass = variant === "purple" ? "bg-purple" : "bg-teal";

  return (
    <Pressable
      onPress={onPress}
      className={`${bgClass} rounded-card py-4 px-6 items-center active:opacity-90`}
    >
      <Text className="text-white text-base font-semibold">{label}</Text>
    </Pressable>
  );
}

interface RoleCardProps {
  title: string;
  description: string;
  onPress?: () => void;
}

export function RoleCard({ title, description, onPress }: RoleCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-surface border border-border rounded-card p-5 mb-4 active:opacity-90"
    >
      <Text className="text-lg font-semibold text-ink mb-2">{title}</Text>
      <Text className="text-sm text-ink-2 leading-5">{description}</Text>
    </Pressable>
  );
}

interface PlaceholderCardProps {
  text: string;
}

export function PlaceholderCard({ text }: PlaceholderCardProps) {
  return (
    <View className="bg-surface border border-border rounded-card p-5">
      <Text className="text-ink-2 text-center leading-6">{text}</Text>
    </View>
  );
}

interface LanguageToggleProps {
  language: "he" | "en";
  onToggle: () => void;
  label: string;
}

export function LanguageToggle({ language, onToggle, label }: LanguageToggleProps) {
  return (
    <Pressable onPress={onToggle} className="self-end mb-4">
      <Text className="text-purple font-medium">
        {label}: {language === "he" ? "עברית" : "English"}
      </Text>
    </Pressable>
  );
}
