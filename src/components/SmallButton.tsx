import { Text, TouchableOpacity, View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface SmallButtonProps {
  // Content
  text?: string;
  Icon?: LucideIcon;
  iconColor?: string;
  iconSize?: number;
  children?: React.ReactNode;

  // Variant (affects colors)
  variant?: 'primary' | 'secondary' | 'destructive';

  // State
  disabled?: boolean;

  // Behavior
  onPress: () => void;

  // Layout
  className?: string;
}

export default function SmallButton({
  text,
  Icon,
  iconColor,
  iconSize = 14,
  children,
  variant = 'primary',
  disabled = false,
  onPress,
  className = '',
}: SmallButtonProps) {
  // Base styles
  const baseStyles = 'flex-row items-center justify-center rounded-lg px-3 py-2';

  // Variant styles
  const variantStyles = {
    primary: 'bg-primary shadow-sm',
    secondary: 'border border-primary bg-secondary',
    destructive: 'border border-destructive bg-secondary',
  };

  // Icon color based on variant (if not explicitly provided)
  const defaultIconColors = {
    primary: 'white',
    secondary: '#582D1D',
    destructive: '#E54D2E',
  };

  // Text color based on variant
  const textColorStyles = {
    primary: 'text-primary-foreground',
    secondary: 'text-secondary-foreground',
    destructive: 'text-destructive',
  };

  const finalIconColor = iconColor || defaultIconColors[variant];
  const finalClassName = `${baseStyles} ${variantStyles[variant]} ${disabled ? 'opacity-50' : ''} ${className}`;

  return (
    <TouchableOpacity
      className={finalClassName}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}>
      {Icon && <Icon size={iconSize} color={finalIconColor} />}
      {text && (
        <Text className={`text-xs font-semibold ${textColorStyles[variant]} ${Icon ? 'ml-1.5' : ''}`}>
          {text}
        </Text>
      )}
      {children && !text && (
        typeof children === 'string' ? (
          <Text className={`text-xs font-semibold ${textColorStyles[variant]} ${Icon ? 'ml-1.5' : ''}`}>
            {children}
          </Text>
        ) : children
      )}
    </TouchableOpacity>
  );
}
