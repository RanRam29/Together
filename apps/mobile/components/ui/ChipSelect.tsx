import { Pressable, Text, View } from "react-native";

interface ChipSelectProps<T extends string | number> {
  label: string;
  options: { value: T; label: string }[];
  value: T | null | undefined;
  onChange: (value: T) => void;
}

export function ChipSelect<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: ChipSelectProps<T>) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-ink-2 mb-2">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={String(option.value)}
              onPress={() => onChange(option.value)}
              className={`rounded-full px-4 py-2 border ${
                selected
                  ? "bg-purple-bg border-purple"
                  : "bg-surface border-border active:opacity-90"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selected ? "text-purple-ink" : "text-ink-2"
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

interface MultiChipSelectProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  values: T[];
  onChange: (values: T[]) => void;
}

export function MultiChipSelect<T extends string>({
  label,
  options,
  values,
  onChange,
}: MultiChipSelectProps<T>) {
  function toggle(value: T) {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  }

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-ink-2 mb-2">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const selected = values.includes(option.value);
          return (
            <Pressable
              key={option.value}
              onPress={() => toggle(option.value)}
              className={`rounded-full px-4 py-2 border ${
                selected
                  ? "bg-teal-bg border-teal"
                  : "bg-surface border-border active:opacity-90"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selected ? "text-teal" : "text-ink-2"
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

interface SwitchRowProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function SwitchRow({ label, description, value, onChange }: SwitchRowProps) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      className="flex-row items-center justify-between bg-surface border border-border rounded-card px-4 py-4 mb-3 active:opacity-90"
    >
      <View className="flex-1 pe-4">
        <Text className="text-base font-medium text-ink">{label}</Text>
        {description ? (
          <Text className="text-sm text-ink-2 mt-1 leading-5">{description}</Text>
        ) : null}
      </View>
      <View
        className={`w-12 h-7 rounded-full justify-center px-1 ${
          value ? "bg-purple" : "bg-border"
        }`}
      >
        <View
          className={`w-5 h-5 rounded-full bg-white ${
            value ? "self-end" : "self-start"
          }`}
        />
      </View>
    </Pressable>
  );
}
