import { useEffect } from "react";
import { Image, Text, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { isReduceMotionEnabled } from "@/lib/motion";

const LOGO = require("@/assets/images/logo-transparent.png");

export type EmptyStateVariant = "full" | "compact";

interface EmptyStateProps {
  title?: string;
  description?: string;
  variant?: EmptyStateVariant;
  className?: string;
}

/** Quiet presence for "nothing here yet" — the logo drifts gently instead of a bare line of text. */
export function EmptyState({ title, description, variant = "full", className }: EmptyStateProps) {
  const compact = variant === "compact";
  const logoSize = compact ? 40 : 72;
  const reduceMotion = isReduceMotionEnabled();

  const float = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
    return () => cancelAnimation(float);
  }, [reduceMotion, float]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: reduceMotion ? 0 : (float.value - 0.5) * 14 }],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: reduceMotion ? 1 : 1 - float.value * 0.18 }],
    opacity: reduceMotion ? 0.15 : 0.18 - float.value * 0.08,
  }));

  return (
    <View className={`items-center ${compact ? "py-4" : "py-10"} ${className ?? ""}`}>
      <Animated.View style={logoStyle}>
        <Image
          source={LOGO}
          accessibilityIgnoresInvertColors
          resizeMode="contain"
          style={{ height: logoSize, width: Math.round(logoSize * (2266 / 1856)) }}
        />
      </Animated.View>
      <Animated.View
        style={[
          {
            width: logoSize * 0.7,
            height: logoSize * 0.12,
            borderRadius: 999,
            backgroundColor: "#24221E",
            marginTop: compact ? 4 : 10,
          },
          shadowStyle,
        ]}
      />
      {title ? (
        <Text
          className={`text-ink-2 text-center font-rubik ${compact ? "text-sm mt-2" : "text-base font-semibold mt-5"}`}
        >
          {title}
        </Text>
      ) : null}
      {description ? (
        <Text className="text-ink-3 text-sm text-center font-rubik mt-1 max-w-xs">
          {description}
        </Text>
      ) : null}
    </View>
  );
}
