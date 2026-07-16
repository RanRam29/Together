import { Image, Pressable, View, type ImageStyle } from "react-native";

const LOGO = require("@/assets/images/logo-transparent.png");

export type AppLogoVariant = "compact" | "hero";

interface AppLogoProps {
  variant?: AppLogoVariant;
  className?: string;
  onPress?: () => void;
}

const LOGO_ASPECT_RATIO = 2266 / 1856;

// react-native-web injects an inline `height` equal to the require()'d asset's raw
// pixel height (to avoid layout shift before it loads) — that inline style wins over
// `aspectRatio` alone (which only fills in a dimension left unset), so on web the box
// collapses to the source PNG's full 1856px height with the logo rendered tiny inside
// it. Giving both width AND height explicitly leaves nothing for that default to fill.
const COMPACT_HEIGHT = 48;
const HERO_WIDTH = 240;

const COMPACT_STYLE: ImageStyle = {
  height: COMPACT_HEIGHT,
  width: Math.round(COMPACT_HEIGHT * LOGO_ASPECT_RATIO),
};
const HERO_STYLE: ImageStyle = {
  width: HERO_WIDTH,
  height: Math.round(HERO_WIDTH / LOGO_ASPECT_RATIO),
};

export function AppLogo({ variant = "compact", className, onPress }: AppLogoProps) {
  const imageStyle = variant === "hero" ? HERO_STYLE : COMPACT_STYLE;
  const image = (
    <Image
      source={LOGO}
      accessibilityLabel="בשילוב"
      resizeMode="contain"
      style={imageStyle}
    />
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
