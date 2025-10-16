import React from 'react';
import { View, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface InfoBoxProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

const InfoBox: React.FC<InfoBoxProps> = ({ icon: Icon, title, description, className = '' }) => {
  return (
    <View className={`rounded-lg border border-primary bg-secondary p-4 ${className}`}>
      <View className="mb-2 flex-row items-center gap-2">
        <Icon size={20} color="rgb(100, 74, 64)" />
        <Text className="text-lg font-semibold text-primary">{title}</Text>
      </View>
      <Text className="text-base leading-6 text-muted-foreground">{description}</Text>
    </View>
  );
};

export default InfoBox;
