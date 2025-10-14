import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

interface DropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  label?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  error,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <View className="mb-4 w-full">
      {label && <Text className="mb-1 text-base font-medium text-foreground">{label}</Text>}

      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className={`flex-row items-center justify-between rounded-lg border bg-card px-4 py-3 ${
          error ? 'border-destructive' : 'border-input'
        }`}>
        <Text
          className={`text-base ${value ? 'text-card-foreground' : 'text-muted-foreground'}`}
          style={{ color: value ? undefined : '#888' }}>
          {value || placeholder}
        </Text>
        <ChevronDown size={20} color="#888" />
      </TouchableOpacity>

      {error && <Text className="mt-1 text-sm text-destructive">{error}</Text>}

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <Pressable
          className="flex-1 items-center justify-center bg-black/50"
          onPress={() => setIsOpen(false)}>
          <View className="mx-6 w-4/5 max-w-sm rounded-lg bg-card p-4">
            <Text className="mb-4 text-lg font-semibold text-card-foreground">
              {placeholder}
            </Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  className={`rounded-lg px-4 py-3 ${item === value ? 'bg-primary' : ''}`}>
                  <Text
                    className={`text-base ${item === value ? 'text-white font-semibold' : 'text-card-foreground'}`}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setIsOpen(false)}
              className="mt-4 rounded-lg bg-muted px-4 py-3">
              <Text className="text-center text-base font-medium text-card-foreground">Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default Dropdown;
