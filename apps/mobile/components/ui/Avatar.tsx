import React from "react";
import { View, Text, Image, ViewProps } from "react-native";
import { tv, type VariantProps } from "tailwind-variants";

const avatarStyles = tv({
  base: "items-center justify-center bg-surface-2 rounded-full overflow-hidden",
  variants: {
    size: {
      sm: "w-10 h-10",
      md: "w-14 h-14",
      lg: "w-20 h-20",
      xl: "w-28 h-28",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface AvatarProps extends ViewProps, VariantProps<typeof avatarStyles> {
  url?: string | null;
  fallbackText?: string;
}

export const Avatar = React.forwardRef<View, AvatarProps>(
  ({ url, fallbackText, size, className, style, ...props }, ref) => {
    // Extract initials if no url is provided
    const initials = fallbackText
      ? fallbackText
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
      : "?";

    return (
      <View ref={ref} className={avatarStyles({ size, className })} style={style} {...props}>
        {url ? (
          <Image source={{ uri: url }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <Text className={`font-rubik-medium text-ink-2 ${size === "xl" ? "text-3xl" : "text-base"}`}>
            {initials}
          </Text>
        )}
      </View>
    );
  }
);
Avatar.displayName = "Avatar";
