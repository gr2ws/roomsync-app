import React from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', multiline, numberOfLines, ...props }) => {
  // Calculate minimum height for multiline inputs (approximately 40px per line)
  const minHeight = multiline && numberOfLines ? numberOfLines * 40 : undefined;

  return (
    <View className="mb-4 w-full">
      {label && <Text className="mb-1 text-base font-medium text-foreground">{label}</Text>}
      <TextInput
        className={`rounded-lg border border-input bg-card px-4 py-3 text-base text-card-foreground focus:rounded-lg focus:border-ring ${
          error ? 'border-destructive' : ''
        } ${className}`}
        placeholderTextColor="#888"
        textAlignVertical={multiline ? "top" : "center"}
        multiline={multiline}
        numberOfLines={numberOfLines}
        style={minHeight ? { minHeight } : undefined}
        {...props}
      />
      {error && <Text className="mt-1 text-sm text-destructive">{error}</Text>}
    </View>
  );
};

export default Input;
