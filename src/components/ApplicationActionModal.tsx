import React, { useState } from 'react';
import { Modal, View, Text, Pressable, ActivityIndicator } from 'react-native';
import Button from './Button';
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
      onRequestClose={handleCancel}>
      <Pressable
        className="flex-1 items-center justify-center bg-black/50"
        onPress={handleCancel}>
        <Pressable
          className="mx-6 w-full max-w-md rounded-xl bg-card p-6 shadow-xl"
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

          <View className="mt-4 flex-row justify-end gap-3">
            <Button
              variant="secondary"
              onPress={handleCancel}
              className="flex-1"
              disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant={getConfirmVariant()}
              onPress={handleConfirm}
              className="flex-1"
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : action === 'approve' ? (
                'Approve'
              ) : (
                'Reject'
              )}
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ApplicationActionModal;
