import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BackButtonProps {
  onPress: () => void;
  label?: string;
}

export default function BackButton({ onPress, label = 'Back' }: BackButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center gap-1 self-start px-4 py-2"
      activeOpacity={0.7}>
      <Ionicons name="arrow-back" size={20} color="rgb(100, 74, 64)" />
      <Text className="text-primary text-base font-medium">{label}</Text>
    </TouchableOpacity>
  );
}
