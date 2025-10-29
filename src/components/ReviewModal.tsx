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
import { Star } from 'lucide-react-native';

interface ReviewModalProps {
  visible: boolean;
  propertyTitle: string;
  onConfirm: (rating: number, comment: string) => Promise<void>;
  onCancel: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  propertyTitle,
  onConfirm,
  onCancel,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await onConfirm(rating, comment.trim());
      // Reset state after successful submission
      setRating(0);
      setComment('');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setRating(0);
    setComment('');
    setError('');
    onCancel();
  };

  const renderStars = () => {
    const starColor = 'rgb(250, 204, 21)'; // star color from tailwind config
    return (
      <View className="flex-row items-center gap-2">
        <View className="flex-row gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable
              key={star}
              onPress={() => {
                // If clicking the same star, deselect it
                if (rating === star) {
                  setRating(star - 1);
                } else {
                  setRating(star);
                }
                setError('');
              }}
              className="p-1">
              <Star
                size={24}
                color={starColor}
                fill={star <= rating ? starColor : 'transparent'}
                strokeWidth={2}
              />
            </Pressable>
          ))}
        </View>
        {rating > 0 && (
          <Text className="ml-1 text-sm text-muted-foreground">
            {rating}/5 {rating === 1 ? 'star' : 'stars'}
          </Text>
        )}
      </View>
    );
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
          <Text className="mb-3 text-xl font-bold text-card-foreground">Review Property</Text>
          <Text className="mb-4 text-base leading-6 text-muted-foreground">
            How would you rate your experience at {propertyTitle}?
          </Text>

          {/* Star Rating Picker */}
          <View className="mb-4">
            {renderStars()}
            {error && <Text className="mt-2 text-center text-sm text-destructive">{error}</Text>}
          </View>

          {/* Optional Comment Input */}
          <Input
            label="Comment (Optional)"
            placeholder="Share your experience..."
            value={comment}
            onChangeText={(text) => {
              setComment(text);
            }}
            multiline
            numberOfLines={4}
            className="mb-2"
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
                modalStyles.primaryButton,
                modalStyles.flexButton,
                isLoading && modalStyles.disabledButton,
              ]}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={modalStyles.primaryButtonText}>Submit Review</Text>
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
  flexButton: {
    flex: 1,
  },
});

export default ReviewModal;
