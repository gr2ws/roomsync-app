import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Pressable } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import Button from './Button';

interface PickerProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

const Picker: React.FC<PickerProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select an option',
  error,
  disabled = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsModalOpen(false);
  };

  return (
    <View className="mb-4 w-full">
      {label && <Text className="mb-2 text-base font-medium text-foreground">{label}</Text>}

      <TouchableOpacity
        onPress={() => !disabled && setIsModalOpen(true)}
        disabled={disabled}
        className={`flex-row items-center justify-between rounded-lg border bg-card px-4 py-3 ${
          error ? 'border-destructive' : 'border-input'
        } ${disabled ? 'opacity-50' : ''}`}>
        <Text
          className={`text-base ${value ? 'text-card-foreground' : 'text-muted-foreground'}`}
          style={{ color: value ? undefined : '#888' }}>
          {value || placeholder}
        </Text>
        <ChevronDown size={20} color="#888" />
      </TouchableOpacity>

      {error && <Text className="mt-1 text-sm text-destructive">{error}</Text>}

      {/* Modal for selecting options */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalOpen(false)}>
        <Pressable
          onPress={() => setIsModalOpen(false)}
          className="flex-1 items-center justify-center bg-black/50">
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="max-h-96 w-4/5 rounded-lg bg-card">
            {/* Header */}
            <View className="border-b border-border p-4">
              <Text className="text-lg font-semibold text-card-foreground">
                {label || 'Select an option'}
              </Text>
            </View>

            {/* Options */}
            <ScrollView className="max-h-72">
              {options.map((option) => {
                const isSelected = value === option;
                return (
                  <TouchableOpacity
                    key={option}
                    onPress={() => handleSelect(option)}
                    className={`flex-row items-center justify-between border-b border-border px-4 py-3 ${
                      isSelected ? 'bg-secondary/20' : ''
                    }`}>
                    <Text
                      className={`text-base ${
                        isSelected ? 'font-semibold text-primary' : 'text-foreground'
                      }`}>
                      {option}
                    </Text>
                    {isSelected && <Check size={20} color="rgb(100, 74, 64)" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Footer */}
            <View className="p-4">
              <Button variant="secondary" onPress={() => setIsModalOpen(false)}>
                Cancel
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default Picker;
