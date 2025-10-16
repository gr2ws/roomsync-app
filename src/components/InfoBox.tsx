import React from 'react';
import { View, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface InfoBoxProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export default function InfoBox({ icon: Icon, title, description, className = '' }: InfoBoxProps) {
  return (
    <View className={`rounded-lg border border-primary bg-secondary p-4 ${className}`}>
      <View className="mb-2 flex-row items-center">
        <Icon size={20} color="rgb(100, 74, 64)" />
        <Text className="ml-2 text-lg font-semibold text-primary">{title}</Text>
      </View>
      <Text className="text-base leading-6 text-muted-foreground">{description}</Text>
    </View>
  );
}
