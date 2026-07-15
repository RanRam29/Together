import { useEffect } from "react";
import { Circle, Polyline, Svg } from "react-native-svg";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { isReduceMotionEnabled } from "@/lib/motion";
import { colors } from "@/lib/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);

const RING_LENGTH = 264;
const CHECK_LENGTH = 60;

interface SuccessCheckProps {
  size?: number;
  color?: string;
}

/** Ring draws in, then the checkmark draws — the completion moment for saves/submits. */
export function SuccessCheck({ size = 42, color = colors.teal }: SuccessCheckProps) {
  const reduceMotion = isReduceMotionEnabled();
  const ring = useSharedValue(reduceMotion ? 1 : 0);
  const check = useSharedValue(reduceMotion ? 1 : 0);
  const pop = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    ring.value = withTiming(1, { duration: 480, easing: Easing.out(Easing.ease) });
    check.value = withDelay(260, withTiming(1, { duration: 320, easing: Easing.out(Easing.ease) }));
    pop.value = withDelay(
      560,
      withSequence(
        withTiming(1.12, { duration: 130, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 160, easing: Easing.inOut(Easing.ease) }),
      ),
    );
    return () => {
      cancelAnimation(ring);
      cancelAnimation(check);
      cancelAnimation(pop);
    };
  }, [reduceMotion, ring, check, pop]);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_LENGTH * (1 - ring.value),
  }));

  const checkProps = useAnimatedProps(() => ({
    strokeDashoffset: CHECK_LENGTH * (1 - check.value),
  }));

  const groupStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
  }));

  return (
    <Animated.View style={groupStyle}>
      <Svg width={size} height={size} viewBox="0 0 96 96">
        <AnimatedCircle
          cx={48}
          cy={48}
          r={42}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={RING_LENGTH}
          animatedProps={ringProps}
          transform="rotate(-90 48 48)"
        />
        <AnimatedPolyline
          points="30,50 43,63 67,35"
          fill="none"
          stroke={color}
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={CHECK_LENGTH}
          animatedProps={checkProps}
        />
      </Svg>
    </Animated.View>
  );
}
