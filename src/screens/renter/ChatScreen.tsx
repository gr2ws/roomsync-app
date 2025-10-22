import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Animated,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SendHorizontal, MessageCircle, Bot } from 'lucide-react-native';
import { sendMessageToAI } from '../../utils/gemini';
import { useLoggedIn } from '../../store/useLoggedIn';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const ChatScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { userProfile } = useLoggedIn();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const [scrollPadding, setScrollPadding] = useState(80);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        const kbHeight = e.endCoordinates.height - insets.bottom * 2.2;
        Animated.timing(keyboardHeight, {
          toValue: kbHeight,
          duration: Platform.OS === 'ios' ? e.duration : 250,
          useNativeDriver: false,
        }).start();
        // Increase scroll padding when keyboard is open
        setScrollPadding(kbHeight + 80);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (e) => {
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? e.duration : 250,
          useNativeDriver: false,
        }).start();
        // Reset scroll padding when keyboard is hidden
        setScrollPadding(80);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [insets.bottom]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMessageText = input.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMessageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);
    setIsTyping(true);
    Keyboard.dismiss();

    try {
      // Build chat history for context
      const chatHistory = messages.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: msg.text,
      }));

      // Send message to Gemini AI
      const aiResponseText = await sendMessageToAI(userMessageText, chatHistory);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message to AI:', error);
      Alert.alert(
        'Error',
        'Failed to get a response from the AI assistant. Please check your API key and try again.'
      );
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';

    return (
      <View className={`my-2 flex-row ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start`}>
        {/* Profile Picture */}
        {isUser ? (
          userProfile?.profile_picture ? (
            <Image
              source={{ uri: userProfile.profile_picture }}
              className="ml-2 mt-1.5 h-8 w-8 rounded-full"
            />
          ) : (
            <View className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-primary">
              <Text className="text-sm font-semibold text-primary-foreground">
                {userProfile?.first_name?.[0]?.toUpperCase() || 'U'}
              </Text>
            </View>
          )
        ) : (
          <View className="mr-2 mt-1.5 h-8 w-8 items-center justify-center rounded-full bg-accent">
            <Bot size={18} color="#644A40" />
          </View>
        )}

        {/* Message Content */}
        <View className="max-w-[75%]">
          <View
            className={`rounded-lg border px-4 py-3 shadow-xs ${
              isUser ? 'border-primary bg-secondary' : 'border-border bg-card'
            }`}>
            <Text
              className={`text-base leading-5 ${
                isUser ? 'text-secondary-foreground' : 'text-card-foreground'
              }`}>
              {item.text}
            </Text>
          </View>
          {/* Timestamp */}
          <Text
            className={`mt-1 text-xs text-muted-foreground ${isUser ? 'text-right' : 'text-left'}`}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View className="my-2 flex-row items-start">
        {/* Bot Icon */}
        <View className="mr-2 mt-1.5 h-8 w-8 items-center justify-center rounded-full bg-accent">
          <Bot size={18} color="#644A40" />
        </View>

        {/* Typing Indicator */}
        <View className="max-w-[75%]">
          <View className="rounded-lg border border-border bg-card px-4 py-3 shadow-xs">
            <View className="flex-row items-center gap-1">
              <View className="h-2 w-2 rounded-full bg-muted-foreground opacity-40" />
              <View className="h-2 w-2 rounded-full bg-muted-foreground opacity-60" />
              <View className="h-2 w-2 rounded-full bg-muted-foreground opacity-80" />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (messages.length > 0 || isTyping) return null;

    return (
      <View className="flex-1 items-center justify-center py-20">
        <MessageCircle size={48} color="#9CA3AF" />
        <Text className="mt-4 text-lg font-semibold text-foreground">Start a Conversation</Text>
        <Text className="mt-2 text-center text-base text-muted-foreground">
          Ask me anything about rentals and I'll help you find answers
        </Text>
      </View>
    );
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: Platform.OS === 'ios' ? 0 : insets.top + 8 }}>
      {/* Fixed Header Section */}
      <View
        className="border-b border-border bg-background px-4 pb-4"
        style={{ paddingTop: Platform.OS === 'ios' ? 50 : 0 }}>
        <Text className="text-3xl font-bold text-primary">Chat</Text>
        <Text className="mt-2.5 text-muted-foreground">Find recommendations and ask questions</Text>
      </View>

      {/* Messages List - Scrollable area */}
      <ScrollView
        ref={scrollViewRef}
        style={{ backgroundColor: 'transparent' }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: scrollPadding,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
        {messages.length === 0 && !isTyping ? (
          renderEmptyState()
        ) : (
          <>
            {messages.map((item) => (
              <View key={item.id}>{renderMessage({ item })}</View>
            ))}
            {renderTypingIndicator()}
          </>
        )}
      </ScrollView>

      {/* Fixed Input Bar with Smooth Keyboard Animation */}
      <Animated.View
        className="absolute bottom-0 left-0 right-0 mx-4 flex-row items-center rounded-lg border border-input bg-card shadow-xs"
        style={{
          bottom: keyboardHeight.interpolate({
            inputRange: [0, 1000],
            outputRange: [16, 1016],
          }),
        }}>
        <TextInput
          className="flex-1 px-4 text-base text-foreground"
          style={{ height: 44, lineHeight: 18 }}
          placeholder="Type your message..."
          placeholderTextColor="#646464"
          value={input}
          onChangeText={setInput}
          editable={!isSending}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          multiline={false}
          maxLength={500}
        />
        <View className="h-full w-px bg-input" />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!input.trim() || isSending}
          className={`px-3 py-3 ${!input.trim() || isSending ? 'opacity-40' : 'opacity-100'}`}>
          {isSending ? (
            <ActivityIndicator size="small" color="#644A40" />
          ) : (
            <SendHorizontal size={22} color="#644A40" />
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default ChatScreen;
