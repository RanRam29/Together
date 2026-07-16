import React from "react";
import { View, ViewProps, Text } from "react-native";
import { tv, type VariantProps } from "tailwind-variants";

const cardStyles = tv({
  base: "bg-surface rounded-card p-4 border border-border",
  variants: {
    variant: {
      default: "",
      elevated: "shadow-sm border-transparent",
      highlight: "border-purple-bg bg-purple-bg/30",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface CardProps extends ViewProps, VariantProps<typeof cardStyles> {
  title?: string;
  subtitle?: string;
}

export const Card = React.forwardRef<View, CardProps>(
  ({ children, variant, title, subtitle, className, style, ...props }, ref) => {
    return (
      <View ref={ref} className={cardStyles({ variant, className })} style={style} {...props}>
        {(title || subtitle) && (
          <View className="mb-4">
            {title && <Text className="text-xl font-rubik-medium text-ink text-right">{title}</Text>}
            {subtitle && <Text className="text-sm font-rubik text-ink-2 text-right mt-1">{subtitle}</Text>}
          </View>
        )}
        {children}
      </View>
    );
  }
);
Card.displayName = "Card";
