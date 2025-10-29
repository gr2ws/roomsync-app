import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
      statusBarTranslucent={false}>
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

          <View style={modalStyles.buttonRow}>
            <TouchableOpacity
              onPress={handleCancel}
              style={[modalStyles.secondaryButton, modalStyles.flexButton]}
              disabled={isLoading}>
              <Text style={modalStyles.secondaryButtonText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              style={[
                confirmVariant === 'primary' ? modalStyles.primaryButton : modalStyles.destructiveButton,
                modalStyles.flexButton,
                isLoading && modalStyles.disabledButton,
              ]}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text
                  style={
                    confirmVariant === 'primary'
                      ? modalStyles.primaryButtonText
                      : modalStyles.destructiveButtonText
                  }>
                  {confirmText}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  buttonRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: 'rgb(100, 74, 64)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: 'rgb(250, 244, 235)',
    borderWidth: 1,
    borderColor: 'rgb(100, 74, 64)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destructiveButton: {
    backgroundColor: 'rgb(250, 244, 235)', // secondary color
    borderWidth: 1,
    borderColor: 'rgb(229, 77, 46)', // destructive color
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: 'rgb(100, 74, 64)',
    fontSize: 18,
    fontWeight: '600',
  },
  destructiveButtonText: {
    color: 'rgb(229, 77, 46)', // destructive color
    fontSize: 18,
    fontWeight: '600',
  },
  flexButton: {
    flex: 1,
  },
});

export default ConfirmationModal;
