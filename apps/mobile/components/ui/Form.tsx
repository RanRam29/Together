import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppLogo } from "@/components/ui/AppLogo";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/motion/EmptyState";
import { AppPageWidth } from "@/components/ui/AppPageWidth";
import { BackButton } from "@/components/ui/BackButton";
import { colors } from "@/lib/theme";


interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  showPasswordToggle?: boolean;
}

export function TextField({
  label,
  error,
  className,
  showPasswordToggle,
  secureTextEntry,
  ...props
}: TextFieldProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isSecure = showPasswordToggle ? !passwordVisible : secureTextEntry;

  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-ink-2 mb-2">{label}</Text>
      <View
        className={`flex-row items-center bg-surface border rounded-card ${
          error ? "border-coral border" : isFocused ? "border-purple border-2" : "border-border border"
        }`}
      >
        <TextInput
          placeholderTextColor={colors.ink3}
          className={`flex-1 px-4 py-4 text-ink text-base ${className ?? ""}`}
          secureTextEntry={isSecure}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {showPasswordToggle ? (
          <Pressable
            onPress={() => setPasswordVisible((v) => !v)}
            className="px-4 py-4"
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? "Hide password" : "Show password"}
            hitSlop={8}
          >
            <Ionicons
              name={passwordVisible ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={colors.ink3}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text className="text-coral text-sm mt-1">{error}</Text> : null}
    </View>
  );
}

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
}

export function OtpInput({ value, onChange, length = 6 }: OtpInputProps) {
  return (
    <View className="mb-6">
      <TextInput
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, "").slice(0, length))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        className="bg-surface border border-border rounded-card px-4 py-5 text-ink text-2xl text-center tracking-[12px] font-rubik"
        placeholder={"•".repeat(length)}
        placeholderTextColor={colors.borderStrong}
      />
    </View>
  );
}

interface PrimaryButtonProps {
  label: string;
  onPress?: () => void;
  variant?: "purple" | "teal";
  loading?: boolean;
  disabled?: boolean;
  /** Stretch to parent width (e.g. split action rows). Default: content-sized. */
  fullWidth?: boolean;
}

export function PrimaryButton({
  label,
  onPress,
  variant = "purple",
  loading = false,
  disabled = false,
  fullWidth = false,
}: PrimaryButtonProps) {
  return (
    <Button
      label={label}
      onPress={onPress}
      variant={variant === "purple" ? "primary" : "secondary"}
      loading={loading}
      disabled={disabled}
      className={fullWidth ? "w-full self-stretch" : Platform.OS === "web" ? "self-start" : "w-full"}
      size="lg"
    />
  );
}

interface OutlineButtonProps {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  variant?: "neutral" | "coral";
}

export function OutlineButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  fullWidth = false,
  variant = "neutral",
}: OutlineButtonProps) {
  return (
    <Button
      label={label}
      onPress={onPress}
      variant={variant === "coral" ? "outline-destructive" : "outline"}
      loading={loading}
      disabled={disabled}
      className={fullWidth ? "w-full self-stretch" : Platform.OS === "web" ? "self-start" : "w-full"}
      size="lg"
    />
  );
}

interface RoleCardProps {
  title: string;
  description: string;
  selected?: boolean;
  onPress?: () => void;
}

export function RoleCard({ title, description, selected, onPress }: RoleCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-card p-5 mb-4 border ${
        selected
          ? "bg-purple-bg border-purple"
          : "bg-surface border-border active:opacity-90"
      }`}
    >
      <Text
        className={`text-lg font-semibold mb-2 font-rubik ${
          selected ? "text-purple-ink" : "text-ink"
        }`}
      >
        {title}
      </Text>
      <Text className="text-sm text-ink-2 leading-5">{description}</Text>
    </Pressable>
  );
}

interface PlaceholderCardProps {
  text: string;
}

export function PlaceholderCard({ text }: PlaceholderCardProps) {
  return (
    <View className="bg-surface border border-border/50 rounded-card p-8 shadow-sm justify-center items-center">
      <EmptyState variant="compact" title={text} />
    </View>
  );
}

interface ScreenShellProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  headerRight?: React.ReactNode;
  hero?: React.ReactNode;
  /** Show brand logo above the title. Defaults to true on web when no custom hero is set. */
  brandLogo?: boolean;
  showBack?: boolean;
  backFallbackHref?: string;
}

export function ScreenShell({
  title,
  subtitle,
  eyebrow,
  children,
  footer,
  headerRight,
  hero,
  brandLogo,
  showBack = false,
  backFallbackHref,
}: ScreenShellProps) {
  const showBrandLogo = brandLogo ?? (Platform.OS === "web" && !hero);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName={
          Platform.OS === "web"
            ? "flex-grow items-center pt-12 pb-6 min-h-full"
            : "flex-grow items-center pt-16 pb-6"
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AppPageWidth className="flex-grow px-6">
          {showBack ? <BackButton fallbackHref={backFallbackHref} /> : null}
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              {hero ? <View className="mb-4 items-start w-full">{hero}</View> : null}
              {showBrandLogo ? (
                <View className="mb-4">
                  <AppLogo variant="compact" />
                </View>
              ) : null}
              {eyebrow ? (
                <Text className="text-xs font-bold text-purple uppercase tracking-widest mb-3 font-rubik text-start w-full">
                  {eyebrow}
                </Text>
              ) : null}
              <Text className="text-3xl font-bold text-ink mb-2 font-rubik text-start w-full">
                {title}
              </Text>
            </View>
            {headerRight ? <View className="mt-2 ms-4">{headerRight}</View> : null}
          </View>
          {subtitle ? (
            <Text className="text-base text-ink-2 mb-8 leading-6 text-start">
              {subtitle}
            </Text>
          ) : null}
          <View className="flex-grow">{children}</View>
          {footer}
        </AppPageWidth>
      </ScrollView>
    </KeyboardAvoidingView>
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
      <Text className="text-purple font-medium font-rubik">
        {label}: {language === "he" ? "עברית" : "English"}
      </Text>
    </Pressable>
  );
}
