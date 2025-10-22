import React, { useState } from 'react';
import { Modal, View, Text, Pressable, ActivityIndicator } from 'react-native';
import Button from './Button';
import Input from './Input';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: (inputMessage?: string) => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  showMessageInput?: boolean;
  messageInputPlaceholder?: string;
  messageInputLabel?: string;
  confirmVariant?: 'primary' | 'destructive';
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  showMessageInput = false,
  messageInputPlaceholder = 'Enter message (optional)',
  messageInputLabel,
  confirmVariant = 'primary',
  isLoading = false,
}) => {
  const [inputMessage, setInputMessage] = useState('');

  const handleConfirm = () => {
    onConfirm(showMessageInput ? inputMessage : undefined);
    setInputMessage('');
  };

  const handleCancel = () => {
    onCancel();
    setInputMessage('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <Pressable className="flex-1 items-center justify-center bg-black/50" onPress={handleCancel}>
        <Pressable
          className="mx-6 w-full max-w-md rounded-lg border border-primary bg-card p-6 shadow-xl"
          onPress={(e) => e.stopPropagation()}>
          <Text className="mb-3 text-xl font-bold text-primary">{title}</Text>
          <Text className="mb-4 text-base leading-6 text-muted-foreground">{message}</Text>

          {showMessageInput && (
            <Input
              label={messageInputLabel}
              placeholder={messageInputPlaceholder}
              value={inputMessage}
              onChangeText={setInputMessage}
              multiline
              numberOfLines={3}
              className="mb-2"
            />
          )}

          <View className="mt-4 flex-row justify-end gap-3">
            <Button variant="secondary" onPress={handleCancel} className="flex-1" disabled={isLoading}>
              {cancelText}
            </Button>
            <Button variant={confirmVariant} onPress={handleConfirm} className="flex-1" disabled={isLoading}>
              {isLoading ? <ActivityIndicator size="small" color="#fff" /> : confirmText}
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ConfirmationModal;
