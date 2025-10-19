import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronUp, ChevronDown } from 'lucide-react-native';

interface NumericStepperProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  error?: string;
}

const NumericStepper: React.FC<NumericStepperProps> = ({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  error,
}) => {
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  return (
    <View className="mb-4 w-full">
      {label && <Text className="mb-1 text-base font-medium text-foreground">{label}</Text>}
      <View className="flex-row items-center rounded-lg border border-input bg-card">
        <Text className="flex-1 px-4 py-3 text-center text-base text-card-foreground">{value}</Text>
        <View className="flex-row border-l border-input">
          <TouchableOpacity
            onPress={handleDecrement}
            disabled={value <= min}
            className={`px-3 py-3 ${value <= min ? 'opacity-50' : ''}`}>
            <ChevronDown size={20} color={value <= min ? '#888' : '#64504A'} />
          </TouchableOpacity>
          <View className="w-px bg-input" />
          <TouchableOpacity
            onPress={handleIncrement}
            disabled={value >= max}
            className={`px-3 py-3 ${value >= max ? 'opacity-50' : ''}`}>
            <ChevronUp size={20} color={value >= max ? '#888' : '#64504A'} />
          </TouchableOpacity>
        </View>
      </View>
      {error && <Text className="mt-1 text-sm text-destructive">{error}</Text>}
    </View>
  );
};

export default NumericStepper;
