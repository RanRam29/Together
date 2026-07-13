import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";

interface StaffFilterSelectProps {
  label: string;
  placeholder: string;
  allLabel: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export function StaffFilterSelect({
  label,
  placeholder,
  allLabel,
  value,
  options,
  onChange,
}: StaffFilterSelectProps) {
  const [open, setOpen] = useState(false);
  const display = value || placeholder;

  function select(next: string) {
    onChange(next);
    setOpen(false);
  }

  return (
    <View className="flex-1">
      <Text className="text-xs text-ink-2 mb-1 text-right font-rubik">{label}</Text>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        className="bg-surface border border-border rounded-card px-4 py-3 flex-row items-center justify-between active:opacity-90"
      >
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
          color="#918D84"
        />
        <Text
          className={`text-right flex-1 font-rubik ${
            value ? "text-ink" : "text-ink-3"
          }`}
        >
          {display}
        </Text>
      </Pressable>
      {open ? (
        <View className="bg-surface border border-border rounded-card mt-1 overflow-hidden">
          <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled>
            <Pressable
              onPress={() => select("")}
              className={`px-4 py-3 border-b border-border active:opacity-90 ${
                !value ? "bg-purple-bg" : ""
              }`}
            >
              <Text
                className={`text-right font-rubik ${
                  !value ? "text-purple font-semibold" : "text-ink-2"
                }`}
              >
                {allLabel}
              </Text>
            </Pressable>
            {options.map((option) => {
              const selected = value === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => select(option)}
                  className={`px-4 py-3 border-b border-border last:border-b-0 active:opacity-90 ${
                    selected ? "bg-purple-bg" : ""
                  }`}
                >
                  <Text
                    className={`text-right font-rubik ${
                      selected ? "text-purple font-semibold" : "text-ink"
                    }`}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}
