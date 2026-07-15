import { useEffect } from "react";
import { Modal, Text, View, type DimensionValue } from "react-native";
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

const CONFETTI = [
  { left: "18%", color: colors.teal, delay: 0 },
  { left: "34%", color: colors.amber, delay: 90 },
  { left: "50%", color: "#FFFFFF", delay: 40 },
  { left: "64%", color: colors.teal, delay: 150 },
  { left: "80%", color: colors.amber, delay: 60 },
] as const;

interface MatchCelebrationModalProps {
  visible: boolean;
  title: string;
  description?: string;
  footnote?: string;
}

/** Full-screen "a match was just confirmed" moment — two figures converge, confetti falls. */
export function MatchCelebrationModal({
  visible,
  title,
  description,
  footnote,
}: MatchCelebrationModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        className="flex-1 items-center justify-center px-8"
        style={{ backgroundColor: colors.purple }}
      >
        {visible ? <Confetti /> : null}
        <ConvergingCircles />
        <TextReveal title={title} description={description} footnote={footnote} />
      </View>
    </Modal>
  );
}

function ConvergingCircles() {
  const reduceMotion = isReduceMotionEnabled();
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    progress.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.back(1.6)) });
    return () => cancelAnimation(progress);
  }, [reduceMotion, progress]);

  const leftStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateX: -22 - (1 - progress.value) * 70 },
      { scale: 0.5 + progress.value * 0.5 },
    ],
  }));

  const rightStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateX: 22 + (1 - progress.value) * 70 },
      { scale: 0.5 + progress.value * 0.5 },
    ],
  }));

  return (
    <View style={{ width: 100, height: 48, marginBottom: 20 }}>
      <Animated.View
        style={[
          {
            position: "absolute",
            left: "50%",
            top: "50%",
            marginLeft: -22,
            marginTop: -22,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.teal,
          },
          leftStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            position: "absolute",
            left: "50%",
            top: "50%",
            marginLeft: -22,
            marginTop: -22,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.amber,
          },
          rightStyle,
        ]}
      />
    </View>
  );
}

function TextReveal({
  title,
  description,
  footnote,
}: {
  title: string;
  description?: string;
  footnote?: string;
}) {
  const reduceMotion = isReduceMotionEnabled();
  const reveal = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    reveal.value = withDelay(
      450,
      withTiming(1, { duration: 320, easing: Easing.out(Easing.ease) }),
    );
    return () => cancelAnimation(reveal);
  }, [reduceMotion, reveal]);

  const style = useAnimatedStyle(() => ({
    opacity: reveal.value,
    transform: [{ translateY: (1 - reveal.value) * 10 }],
  }));

  return (
    <Animated.View style={[{ alignItems: "center" }, style]}>
      <Text className="text-white text-xl font-bold font-rubik text-center">{title}</Text>
      {description ? (
        <Text className="text-white/90 text-sm font-rubik text-center mt-2 max-w-xs">
          {description}
        </Text>
      ) : null}
      {footnote ? (
        <Text className="text-white/80 text-sm font-rubik text-center mt-3">{footnote}</Text>
      ) : null}
    </Animated.View>
  );
}

function Confetti() {
  const reduceMotion = isReduceMotionEnabled();

  if (reduceMotion) return null;

  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 220 }}>
      {CONFETTI.map((c, i) => (
        <ConfettiPiece key={i} left={c.left} color={c.color} delay={c.delay} />
      ))}
    </View>
  );
}

function ConfettiPiece({
  left,
  color,
  delay,
}: {
  left: DimensionValue;
  color: string;
  delay: number;
}) {
  const fall = useSharedValue(0);

  useEffect(() => {
    fall.value = withDelay(
      delay + 250,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1400, easing: Easing.in(Easing.ease) }),
          withTiming(0, { duration: 0 }),
          withTiming(0, { duration: 500 }),
        ),
        -1,
      ),
    );
    return () => cancelAnimation(fall);
  }, [fall, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: fall.value < 0.85 ? 1 : (1 - fall.value) * 6.6,
    transform: [
      { translateY: fall.value * 170 },
      { rotate: `${fall.value * 300}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 8,
          left: left as any,
          width: 9,
          height: 9,
          borderRadius: 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}
