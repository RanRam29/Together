import { useEffect } from "react";
import { View, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { isReduceMotionEnabled } from "@/lib/motion";
import { colors } from "@/lib/theme";

/** Three dots — one per brand hue — orbiting like the figures in the logo mark. */
const DOT_COLORS = [colors.purple, colors.teal, colors.amber] as const;
const DOT_ANGLES_DEG = [270, 30, 150] as const;

export type BrandSpinnerSize = "small" | "large";

interface BrandSpinnerProps {
  size?: BrandSpinnerSize;
  className?: string;
  style?: ViewStyle;
}

const STAGE_SIZE: Record<BrandSpinnerSize, number> = { small: 24, large: 56 };
const DOT_RATIO = 0.28;

/** Full-area loading indicator in brand colors. Not for use inside small buttons — see AGENTS notes. */
export function BrandSpinner({ size = "large", className, style }: BrandSpinnerProps) {
  const stageSize = STAGE_SIZE[size];
  const dotSize = Math.round(stageSize * DOT_RATIO);
  const radius = (stageSize - dotSize) / 2;
  const reduceMotion = isReduceMotionEnabled();

  const rotation = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    rotation.value = withRepeat(
      withTiming(360, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      -1,
    );
    return () => cancelAnimation(rotation);
  }, [reduceMotion, rotation]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View
      className={className}
      style={[{ width: stageSize, height: stageSize }, style]}
      accessibilityRole="progressbar"
    >
      <Animated.View style={[{ width: stageSize, height: stageSize }, reduceMotion ? undefined : spinStyle]}>
        {DOT_ANGLES_DEG.map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const left = stageSize / 2 + radius * Math.cos(rad) - dotSize / 2;
          const top = stageSize / 2 + radius * Math.sin(rad) - dotSize / 2;
          return (
            <SpinnerDot
              key={angle}
              left={left}
              top={top}
              dotSize={dotSize}
              color={DOT_COLORS[i]}
              delay={i * 460}
              reduceMotion={reduceMotion}
            />
          );
        })}
      </Animated.View>
    </View>
  );
}

function SpinnerDot({
  left,
  top,
  dotSize,
  color,
  delay,
  reduceMotion,
}: {
  left: number;
  top: number;
  dotSize: number;
  color: string;
  delay: number;
  reduceMotion: boolean;
}) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
    return () => cancelAnimation(pulse);
  }, [reduceMotion, pulse, delay]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: reduceMotion ? 0.85 : 0.55 + pulse.value * 0.45,
    transform: [{ scale: reduceMotion ? 1 : 1 + pulse.value * 0.22 }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left,
          top,
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: color,
        },
        dotStyle,
      ]}
    />
  );
}
