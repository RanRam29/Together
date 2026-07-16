import { Image, Pressable, View, type ImageStyle } from "react-native";

// Icon-only mark (no wordmark) — for compact/nav contexts. From the Beshiluv Logo
// Animation Kit's own assets/logo-mark.png, 1643x1056px.
const LOGO_MARK = require("@/assets/images/logo-mark.png");
const MARK_ASPECT_RATIO = 1643 / 1056;

// Full lockup (mark + "בשילוב" wordmark + tagline) — for splash/hero contexts only,
// per the kit's own usage. From assets/logo-full.png, 1745x1856px (portrait).
const LOGO_FULL = require("@/assets/images/logo-full.png");
const FULL_ASPECT_RATIO = 1745 / 1856;

export type AppLogoVariant = "compact" | "hero";

interface AppLogoProps {
  variant?: AppLogoVariant;
  className?: string;
  onPress?: () => void;
}

// react-native-web injects an inline `height` equal to the require()'d asset's raw
// pixel height (to avoid layout shift before it loads) — that inline style wins over
// `aspectRatio` alone (which only fills in a dimension left unset), so on web the box
// collapses to the source PNG's full pixel height with the logo rendered tiny inside
// it. Giving both width AND height explicitly leaves nothing for that default to fill.
const COMPACT_HEIGHT = 48;
const HERO_HEIGHT = 190;

const COMPACT_STYLE: ImageStyle = {
  height: COMPACT_HEIGHT,
  width: Math.round(COMPACT_HEIGHT * MARK_ASPECT_RATIO),
};
const HERO_STYLE: ImageStyle = {
  height: HERO_HEIGHT,
  width: Math.round(HERO_HEIGHT * FULL_ASPECT_RATIO),
};

export function AppLogo({ variant = "compact", className, onPress }: AppLogoProps) {
  const isHero = variant === "hero";
  const image = (
    <Image
      source={isHero ? LOGO_FULL : LOGO_MARK}
      accessibilityLabel="בשילוב"
      resizeMode="contain"
      style={isHero ? HERO_STYLE : COMPACT_STYLE}
    />
  );

  const content = (
    <View
      className={`${isHero ? "items-center justify-center w-full" : "items-start"} ${className ?? ""}`}
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
