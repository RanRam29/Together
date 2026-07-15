import { useEffect } from "react";
import { Image, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { isReduceMotionEnabled } from "@/lib/motion";
import { colors } from "@/lib/theme";

const LOGO = require("@/assets/images/logo-transparent.png");

/** One-shot logo reveal shown while the app boots (fonts/i18n), then settles into a quiet breathing loop. */
export function SplashReveal() {
  const reduceMotion = isReduceMotionEnabled();

  const glow = useSharedValue(reduceMotion ? 0 : 0);
  const ring = useSharedValue(reduceMotion ? 0 : 0);
  const logoScale = useSharedValue(reduceMotion ? 1 : 0.72);
  const logoOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const breathe = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;

    glow.value = withTiming(0.85, { duration: 260, easing: Easing.out(Easing.ease) });
    ring.value = withTiming(1, { duration: 650, easing: Easing.out(Easing.ease) });
    logoOpacity.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.ease) });
    logoScale.value = withSequence(
      withTiming(1.05, { duration: 420, easing: Easing.out(Easing.back(1.4)) }),
      withTiming(1, { duration: 240, easing: Easing.inOut(Easing.ease) }),
    );
    breathe.value = withDelay(
      700,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    );

    return () => {
      cancelAnimation(glow);
      cancelAnimation(ring);
      cancelAnimation(logoScale);
      cancelAnimation(logoOpacity);
      cancelAnimation(breathe);
    };
  }, [reduceMotion, glow, ring, logoScale, logoOpacity, breathe]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.5 * (1 - ring.value),
    transform: [{ scale: 0.3 + ring.value * 1.4 }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value + breathe.value * 0.03 }],
  }));

  return (
    <View className="flex-1 items-center justify-center bg-bg px-6">
      <View className="items-center justify-center" style={{ width: 190, height: 190 }}>
        <Animated.View
          style={[
            {
              position: "absolute",
              width: 150,
              height: 150,
              borderRadius: 999,
              backgroundColor: colors.teal,
              opacity: 0.18,
            },
            glowStyle,
          ]}
        />
        <Animated.View
          style={[
            {
              position: "absolute",
              width: 120,
              height: 120,
              borderRadius: 999,
              borderWidth: 2,
              borderColor: colors.teal,
            },
            ringStyle,
          ]}
        />
        <Animated.View style={logoStyle}>
          <Image
            source={LOGO}
            accessibilityLabel="בשילוב"
            style={{ width: 150, height: 150, resizeMode: "contain" }}
          />
        </Animated.View>
      </View>
    </View>
  );
}
