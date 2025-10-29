import React, { useState } from 'react';
import { Modal, View, Text, Pressable, TouchableOpacity, StyleSheet } from 'react-native';
import RadioGroup from './RadioGroup';

interface User {
  user_id: number;
  name: string;
}

interface UserSelectionModalProps {
  visible: boolean;
  users: User[];
  onConfirm: (selectedUserId: number, selectedUserName: string) => void;
  onCancel: () => void;
}

const UserSelectionModal: React.FC<UserSelectionModalProps> = ({
  visible,
  users,
  onConfirm,
  onCancel,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [error, setError] = useState('');

  console.log('[UserSelectionModal] Rendered, visible:', visible, 'users count:', users.length);

  const handleConfirm = () => {
    console.log('[UserSelectionModal] Confirm pressed, selectedUserId:', selectedUserId);

    if (selectedUserId === null) {
      console.log('[UserSelectionModal] No user selected, showing error');
      setError('Please select a user to report');
      return;
    }

    const selectedUser = users.find((u) => u.user_id === selectedUserId);
    if (!selectedUser) {
      console.error('[UserSelectionModal] Selected user not found:', selectedUserId);
      setError('Selected user not found');
      return;
    }

    console.log('[UserSelectionModal] User confirmed:', {
      user_id: selectedUser.user_id,
      name: selectedUser.name,
    });
    setError('');
    onConfirm(selectedUserId, selectedUser.name);
    setSelectedUserId(null);
  };

  const handleCancel = () => {
    console.log('[UserSelectionModal] Cancel pressed');
    setSelectedUserId(null);
    setError('');
    onCancel();
  };

  // Convert user IDs to strings for RadioGroup
  const options = users.map((user) => user.name);
  const selectedValue = selectedUserId
    ? users.find((u) => u.user_id === selectedUserId)?.name || ''
    : '';

  const handleRadioChange = (userName: string) => {
    console.log('[UserSelectionModal] Radio changed, userName:', userName);

    // If empty string is passed, user is deselecting
    if (userName === '') {
      console.log('[UserSelectionModal] User deselected');
      setSelectedUserId(null);
      setError('');
      return;
    }

    // RadioGroup passes lowercase value, so we need to match case-insensitively
    const user = users.find((u) => u.name.toLowerCase() === userName.toLowerCase());
    if (user) {
      console.log('[UserSelectionModal] User selected:', {
        user_id: user.user_id,
        name: user.name,
      });
      setSelectedUserId(user.user_id);
      setError('');
    } else {
      console.warn('[UserSelectionModal] User not found for name:', userName);
    }
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
          <Text className="mb-3 text-xl font-bold text-card-foreground">Select User to Report</Text>
          <Text className="mb-4 text-base leading-6 text-muted-foreground">
            Choose who you want to report. You will need to provide evidence in the next step.
          </Text>

          {/* Radio Group for User Selection */}
          <View className="mb-2">
            <RadioGroup
              options={options}
              value={selectedValue}
              onChange={handleRadioChange}
              error={error}
            />
          </View>

          <View style={modalStyles.buttonRow}>
            <TouchableOpacity
              onPress={handleCancel}
              style={[modalStyles.secondaryButton, modalStyles.flexButton]}>
              <Text style={modalStyles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              style={[modalStyles.primaryButton, modalStyles.flexButton]}>
              <Text style={modalStyles.primaryButtonText}>Continue</Text>
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
  flexButton: {
    flex: 1,
  },
});

export default UserSelectionModal;
