import { Image, Pressable, View, type ImageStyle } from "react-native";

const LOGO = require("@/assets/images/logo-transparent.png");

export type AppLogoVariant = "compact" | "hero";

interface AppLogoProps {
  variant?: AppLogoVariant;
  className?: string;
  onPress?: () => void;
}

const LOGO_ASPECT_RATIO = 2266 / 1856;

const COMPACT_STYLE: ImageStyle = { height: 48, aspectRatio: LOGO_ASPECT_RATIO, resizeMode: "contain" };
const HERO_STYLE: ImageStyle = {
  width: "100%",
  maxWidth: 240,
  aspectRatio: LOGO_ASPECT_RATIO,
  resizeMode: "contain",
};

export function AppLogo({ variant = "compact", className, onPress }: AppLogoProps) {
  const imageStyle = variant === "hero" ? HERO_STYLE : COMPACT_STYLE;
  const image = (
    <Image source={LOGO} accessibilityLabel="בשילוב" style={imageStyle} />
  );

  const content = (
    <View
      className={`${variant === "hero" ? "items-center justify-center w-full" : "items-start"} ${className ?? ""}`}
    >
      {image}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button">
        {content}
      </Pressable>
    );
  }

  return content;
}

export function AppLogoHero({ className }: { className?: string }) {
  return <AppLogo variant="hero" className={className ?? "mb-8"} />;
}
