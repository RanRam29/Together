import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps, View } from "react-native";
import { tv, type VariantProps } from "tailwind-variants";

const buttonStyles = tv({
  base: "flex-row items-center justify-center rounded-card px-6 py-4 active:opacity-80 transition-opacity",
  variants: {
    variant: {
      primary: "bg-purple",
      secondary: "bg-teal",
      outline: "border-2 border-purple bg-transparent",
      "outline-destructive": "border-2 border-coral bg-transparent",
      ghost: "bg-transparent",
      destructive: "bg-coral",
    },
    size: {
      sm: "px-4 py-2",
      md: "px-6 py-4",
      lg: "px-8 py-5",
    },
    disabled: {
      true: "opacity-50",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

const textStyles = tv({
  base: "font-rubik-medium text-base text-center",
  variants: {
    variant: {
      primary: "text-white",
      secondary: "text-white",
      outline: "text-purple",
      "outline-destructive": "text-coral",
      ghost: "text-purple",
      destructive: "text-white",
    },
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

export interface ButtonProps extends TouchableOpacityProps, VariantProps<typeof buttonStyles> {
  label: string;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<View, ButtonProps>(
  ({ label, variant, size, disabled, loading, icon, className, style, ...props }, ref) => {
    return (
      <TouchableOpacity
        ref={ref}
        style={style}
        className={buttonStyles({ variant, size, disabled: disabled || loading, className })}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <ActivityIndicator color={variant === "outline" || variant === "ghost" ? "#534AB7" : variant === "outline-destructive" ? "#BA1A1A" : "#FFF"} />
        ) : (
          <>
            {icon && <View className="mr-2">{icon}</View>}
            <Text className={textStyles({ variant, size })}>{label}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }
);
Button.displayName = "Button";
