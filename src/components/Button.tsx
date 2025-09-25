import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';
import { ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'text';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  activeOpacity,
  ...props
}: ButtonProps) {
  const getButtonStyles = () => {
    const baseStyles = 'rounded-lg';

    const variantStyles = {
      primary: 'bg-blue-500 px-6 py-3 shadow-sm',
      secondary: 'border border-gray-300 bg-white px-6 py-3',
      text: '',
    };

    const sizeStyles = {
      sm: variant !== 'text' ? 'px-4 py-2' : '',
      md: variant !== 'text' ? 'px-6 py-3' : '',
      lg: variant !== 'text' ? 'px-8 py-4' : '',
    };

    return `${baseStyles} ${variantStyles[variant]} ${variant !== 'text' ? sizeStyles[size] : ''} ${className}`.trim();
  };

  const getTextStyles = () => {
    const baseStyles = 'text-center font-semibold';

    const variantStyles = {
      primary: 'text-white text-lg',
      secondary: 'text-gray-700 text-lg',
      text: 'text-blue-500',
    };

    const sizeStyles = {
      sm: variant !== 'text' ? 'text-base' : 'text-sm',
      md: variant !== 'text' ? 'text-lg' : 'text-sm',
      lg: variant !== 'text' ? 'text-xl' : 'text-base',
    };

    return `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]}`.trim();
  };

  const getActiveOpacity = () => {
    if (activeOpacity !== undefined) return activeOpacity;
    return variant === 'text' ? 0.7 : 0.8;
  };

  return (
    <TouchableOpacity className={getButtonStyles()} activeOpacity={getActiveOpacity()} {...props}>
      {typeof children === 'string' ? (
        <Text className={getTextStyles()}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}
