import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Modal, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';

interface DatePickerProps {
  value: string; // Format: YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  error?: string;
  label?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  error,
  label,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (value) {
      const date = new Date(value);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    return new Date();
  });

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const handleDateChange = (event: any, date?: Date) => {
    // On Android, the picker is a modal dialog that handles its own dismissal
    if (Platform.OS === 'android') {
      setShowPicker(false);

      // Handle the date selection
      if (event.type === 'set' && date) {
        setSelectedDate(date);
        const formattedDate = formatDate(date);
        onChange(formattedDate);
      }
    } else if (Platform.OS === 'ios') {
      // On iOS, update the date in real-time as user scrolls the picker
      // Don't close the modal - user closes it with "Done" button
      if (date) {
        setSelectedDate(date);
        const formattedDate = formatDate(date);
        onChange(formattedDate);
      }
    }
  };

  const handlePress = () => {
    setShowPicker(true);
  };

  return (
    <View className="mb-4 w-full">
      {label && <Text className="mb-1 text-base font-medium text-foreground">{label}</Text>}

      <TouchableOpacity
        onPress={handlePress}
        className={`flex-row items-center justify-between rounded-lg border bg-card px-4 py-3 ${
          error ? 'border-destructive' : 'border-input'
        }`}>
        <Text className={`text-base ${value ? 'text-card-foreground' : 'text-muted-foreground'}`}>
          {value ? formatDisplayDate(value) : placeholder}
        </Text>
        <Calendar size={20} className="text-muted-foreground" />
      </TouchableOpacity>

      {error && <Text className="mt-1 text-sm text-destructive">{error}</Text>}

      {/* Android: Native date picker dialog */}
      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* iOS: Modal with date picker */}
      {showPicker && Platform.OS === 'ios' && (
        <Modal
          transparent
          animationType="fade"
          visible={showPicker}
          onRequestClose={() => setShowPicker(false)}
          statusBarTranslucent={false}>
          <Pressable
            className="flex-1 justify-end"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onPress={() => setShowPicker(false)}>
            <Pressable className="bg-card pb-8 pt-4" onPress={(e) => e.stopPropagation()}>
              <View className="flex-row items-center justify-between border-b border-border px-4 pb-3">
                <TouchableOpacity
                  onPress={() => {
                    onChange('');
                    setShowPicker(false);
                  }}>
                  <Text className="text-base text-muted-foreground">Clear</Text>
                </TouchableOpacity>
                <Text className="text-base font-semibold text-foreground">Select Date</Text>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text className="text-base font-semibold text-primary">Done</Text>
                </TouchableOpacity>
              </View>
              <View className="items-center px-4 pt-2">
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  themeVariant="light"
                  style={{ width: '100%' }}
                />
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};

export default DatePicker;
