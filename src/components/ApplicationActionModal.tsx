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

interface ApplicationActionModalProps {
  visible: boolean;
  action: 'approve' | 'reject';
  renterName: string;
  propertyTitle: string;
  onConfirm: (message: string) => Promise<void>;
  onCancel: () => void;
}

const ApplicationActionModal: React.FC<ApplicationActionModalProps> = ({
  visible,
  action,
  renterName,
  propertyTitle,
  onConfirm,
  onCancel,
}) => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!message.trim()) {
      setError('Message is required');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await onConfirm(message.trim());
      setMessage('');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setMessage('');
    setError('');
    onCancel();
  };

  const getTitle = () => {
    return action === 'approve' ? 'Approve Application' : 'Reject Application';
  };

  const getMessage = () => {
    return action === 'approve'
      ? `You are about to approve ${renterName}'s application for ${propertyTitle}.`
      : `You are about to reject ${renterName}'s application for ${propertyTitle}.`;
  };

  const getConfirmVariant = () => {
    return action === 'approve' ? 'primary' : 'destructive';
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
          className="mx-6 w-full max-w-md rounded-lg bg-card p-6 shadow-xl"
          onPress={(e) => e.stopPropagation()}>
          <Text className="mb-3 text-xl font-bold text-card-foreground">{getTitle()}</Text>
          <Text className="mb-4 text-base leading-6 text-muted-foreground">{getMessage()}</Text>

          <Input
            label="Message *"
            placeholder={`Enter ${action === 'approve' ? 'approval' : 'rejection'} message`}
            value={message}
            onChangeText={(text) => {
              setMessage(text);
              setError('');
            }}
            error={error}
            multiline
            numberOfLines={4}
          />

          <View style={modalStyles.buttonRow}>
            <TouchableOpacity
              onPress={handleCancel}
              style={[modalStyles.secondaryButton, modalStyles.flexButton]}
              disabled={isLoading}>
              <Text style={modalStyles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              style={[
                action === 'approve' ? modalStyles.primaryButton : modalStyles.destructiveButton,
                modalStyles.flexButton,
                isLoading && modalStyles.disabledButton,
              ]}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text
                  style={
                    action === 'approve'
                      ? modalStyles.primaryButtonText
                      : modalStyles.destructiveButtonText
                  }>
                  {action === 'approve' ? 'Approve' : 'Reject'}
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

export default ApplicationActionModal;
