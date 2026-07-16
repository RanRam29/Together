import React from "react";
import { View, Text, ViewProps } from "react-native";
import { tv, type VariantProps } from "tailwind-variants";

const badgeStyles = tv({
  base: "flex-row items-center justify-center px-3 py-1 rounded-full",
  variants: {
    variant: {
      default: "bg-surface-2",
      success: "bg-teal-bg",
      warning: "bg-amber-bg",
      danger: "bg-coral-bg",
      primary: "bg-purple-bg",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const textStyles = tv({
  base: "text-xs font-rubik-medium text-center",
  variants: {
    variant: {
      default: "text-ink-2",
      success: "text-teal-ink",
      warning: "text-amber-ink",
      danger: "text-coral-ink",
      primary: "text-purple-ink",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BadgeProps extends ViewProps, VariantProps<typeof badgeStyles> {
  label: string;
  icon?: React.ReactNode;
}

export const Badge = React.forwardRef<View, BadgeProps>(
  ({ label, variant, icon, className, style, ...props }, ref) => {
    return (
      <View ref={ref} className={badgeStyles({ variant, className })} style={style} {...props}>
        {icon && <View className="mr-1">{icon}</View>}
        <Text className={textStyles({ variant })}>{label}</Text>
      </View>
    );
  }
);
Badge.displayName = "Badge";
