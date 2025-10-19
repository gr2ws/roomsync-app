import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface RadioGroupProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ options, value, onChange, label, error }) => {
  return (
    <View className="w-full">
      {label && <Text className="mb-2 text-base font-medium text-foreground">{label}</Text>}

      <View className="gap-2">
        {options.map((option) => {
          const lowercaseValue = option.toLowerCase();
          const isSelected = value.toLowerCase() === lowercaseValue;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(lowercaseValue)}
              className={`flex-row items-center rounded-lg border px-4 py-3 ${
                isSelected ? 'border-primary bg-muted' : 'border-input bg-card'
              }`}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
              {/* Radio Circle */}
              <View
                className={`mr-3 h-5 w-5 items-center justify-center rounded-full border bg-card ${
                  isSelected ? 'border-primary' : 'border-muted-foreground'
                }`}>
                {isSelected && <View className="h-2.5 w-2.5 rounded-full bg-primary" />}
              </View>

              {/* Option Text */}
              <Text
                className={`text-base ${
                  isSelected ? 'font-semibold text-primary' : 'font-normal text-foreground'
                }`}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error && <Text className="mt-1 text-sm text-destructive">{error}</Text>}
    </View>
  );
};

export default RadioGroup;
