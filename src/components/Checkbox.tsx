import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Check } from 'lucide-react-native';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
  icon?: React.ComponentType<any>;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onToggle,
  icon: Icon,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onToggle}
      disabled={disabled}
      className={`mb-3 flex-row items-center rounded-lg border bg-card p-4 ${
        checked ? 'border-primary bg-secondary/20' : 'border-border'
      } ${disabled ? 'opacity-50' : ''}`}>
      {/* Icon */}
      {Icon && (
        <View className="mr-3">
          <Icon size={24} color={checked ? 'rgb(100, 74, 64)' : '#888'} />
        </View>
      )}

      {/* Label */}
      <Text
        className={`flex-1 text-base ${checked ? 'font-semibold text-primary' : 'text-foreground'}`}>
        {label}
      </Text>

      {/* Checkbox */}
      <View
        className={`h-6 w-6 items-center justify-center rounded ${
          checked ? 'bg-primary' : 'border-2 border-border bg-card'
        }`}>
        {checked && <Check size={16} color="white" strokeWidth={3} />}
      </View>
    </TouchableOpacity>
  );
};

export default Checkbox;
