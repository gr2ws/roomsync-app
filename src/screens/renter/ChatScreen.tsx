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
import { SendHorizontal, MessageCircle, Bot, RotateCcw } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendMessageToAI } from '../../utils/gemini';
import { useLoggedIn } from '../../store/useLoggedIn';
import { useRejectedRecommendations } from '../../store/useRejectedRecommendations';
import { getRecommendedProperties } from '../../services/recommendations';
import { Property } from '../../types/property';
import { supabase } from '../../utils/supabase';
import ChatPropertyCard from '../../components/ChatPropertyCard';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  properties?: Property[];
}

const ChatScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { userProfile } = useLoggedIn();
  const {
    rejectedIds,
    addRejectedProperty,
    getRejectedIds,
    setRecommendationQueue,
    getNextRecommendation,
    markPropertyAsShown,
    hasMoreRecommendations,
    setCurrentProperty,
    getCurrentPropertyId,
  } = useRejectedRecommendations();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const [scrollPadding, setScrollPadding] = useState(80);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  const MESSAGE_LIMIT = 30;

  // Calculate user message count
  const userMessageCount = messages.filter((msg) => msg.sender === 'user').length;
  const isAtLimit = userMessageCount >= MESSAGE_LIMIT;
  const isNearLimit = userMessageCount >= 25;

  // Storage key unique to each user
  const getStorageKey = () => {
    return `chat_messages_${userProfile?.user_id || 'guest'}`;
  };

  // Load messages from AsyncStorage
  const loadMessages = async () => {
    console.log('[ChatScreen] Loading messages from storage...');
    try {
      const storageKey = getStorageKey();
      console.log('[ChatScreen] Storage key:', storageKey);
      const storedMessages = await AsyncStorage.getItem(storageKey);
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsedMessages.map((msg: Message) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        console.log('[ChatScreen] Loaded', messagesWithDates.length, 'messages from storage');
        setMessages(messagesWithDates);
      } else {
        console.log('[ChatScreen] No stored messages found');
      }
    } catch (error) {
      console.error('[ChatScreen] Error loading messages from storage:', error);
    } finally {
      setIsLoadingMessages(false);
      console.log('[ChatScreen] Message loading complete');
    }
  };

  // Save messages to AsyncStorage
  const saveMessages = async (messagesToSave: Message[]) => {
    console.log('[ChatScreen] Saving', messagesToSave.length, 'messages to storage');
    try {
      const storageKey = getStorageKey();
      await AsyncStorage.setItem(storageKey, JSON.stringify(messagesToSave));
      console.log('[ChatScreen] Messages saved successfully');
    } catch (error) {
      console.error('[ChatScreen] Error saving messages to storage:', error);
    }
  };

  // Load messages on mount
  useEffect(() => {
    console.log('[ChatScreen] Component mounted, user_id:', userProfile?.user_id);
    loadMessages();

    return () => {
      console.log('[ChatScreen] Component unmounting');
    };
  }, [userProfile?.user_id]);

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

  const handleReset = () => {
    console.log('[ChatScreen] Reset conversation requested');
    Alert.alert('Reset Conversation', 'Are you sure you want to reset the conversation?', [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => {
          console.log('[ChatScreen] Reset cancelled by user');
        },
      },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          console.log('[ChatScreen] Resetting conversation...');
          setMessages([]);
          setInput('');
          // Clear messages from storage
          try {
            const storageKey = getStorageKey();
            await AsyncStorage.removeItem(storageKey);
            console.log('[ChatScreen] Conversation reset successfully');
          } catch (error) {
            console.error('[ChatScreen] Error clearing messages from storage:', error);
          }
        },
      },
    ]);
  };

  const handleSend = async () => {
    if (!input.trim() || isSending) {
      console.log('[ChatScreen] Send blocked - empty input or already sending');
      return;
    }

    console.log('[ChatScreen] User message count:', userMessageCount, '/', MESSAGE_LIMIT);

    // Check message limit
    if (isAtLimit) {
      console.log('[ChatScreen] Message limit reached, showing alert');
      Alert.alert(
        'Message Limit Reached',
        "You've reached the 30-message limit. Please reset the conversation to continue.",
        [
          {
            text: 'Reset Now',
            onPress: handleReset,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
      return;
    }

    const userMessageText = input.trim();
    console.log('[ChatScreen] Sending user message:', userMessageText.substring(0, 50) + '...');

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMessageText,
      timestamp: new Date(),
    };

    const updatedMessagesWithUser = [...messages, userMessage];
    setMessages(updatedMessagesWithUser);
    // Save user message immediately
    await saveMessages(updatedMessagesWithUser);

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

      console.log(
        '[ChatScreen] Sending request to AI with',
        chatHistory.length,
        'history messages'
      );

      // Send message to Gemini AI with tool call handler
      const aiResponse = await sendMessageToAI(
        userMessageText,
        chatHistory,
        async (toolName, args) => {
          console.log('[ChatScreen] Tool called by AI:', toolName, args);

          // Handle reset_conversation tool
          if (toolName === 'reset_conversation') {
            console.log('[ChatScreen] AI requested conversation reset:', args.reason);

            // Disable input during reset
            setIsResetting(true);

            // Clear conversation immediately
            setTimeout(async () => {
              setMessages([]);
              setInput('');
              try {
                const storageKey = getStorageKey();
                await AsyncStorage.removeItem(storageKey);
                console.log('[ChatScreen] Conversation reset by AI tool');

                // After clearing, add the reset message to start the new conversation
                const resetMessage: Message = {
                  id: Date.now().toString(),
                  sender: 'ai',
                  text: "It seems we've gotten a bit off track! Let me help you find the perfect rental in Dumaguete. What are you looking for?",
                  timestamp: new Date(),
                };

                setMessages([resetMessage]);
                await saveMessages([resetMessage]);
              } catch (error) {
                console.error('[ChatScreen] Error clearing messages after AI reset:', error);
              } finally {
                setIsResetting(false);
              }
            }, 1500);
          }

          // Handle get_recommendations tool
          if (toolName === 'get_recommendations') {
            console.log('[ChatScreen] AI requested recommendations with priority:', args.priority);

            try {
              const excludedIds = getRejectedIds();
              console.log('[ChatScreen] Excluded property IDs:', excludedIds);

              const result = await getRecommendedProperties(excludedIds, args.priority);

              if (result.properties.length === 0) {
                console.log('[ChatScreen] No recommendations available');
                return {
                  success: false,
                  message: 'No properties available at the moment.',
                };
              }

              console.log('[ChatScreen] Got', result.properties.length, 'recommendations');

              // Store in recommendation queue
              setRecommendationQueue(result.properties);

              // Automatically show the first property
              const firstProperty = result.properties[0];
              markPropertyAsShown(firstProperty.property_id);
              setCurrentProperty(firstProperty.property_id);
              console.log(
                '[ChatScreen] Auto-showing first property:',
                firstProperty.title,
                'ID:',
                firstProperty.property_id
              );

              // Return first property with fields for AI to discuss (excluding owner_id, coordinates and image_url)
              return {
                success: true,
                count: result.properties.length,
                hasMore: result.properties.length > 1,
                json: JSON.stringify({
                  property_id: firstProperty.property_id,
                  title: firstProperty.title,
                  description: firstProperty.description,
                  category: firstProperty.category,
                  street: firstProperty.street,
                  barangay: firstProperty.barangay,
                  city: firstProperty.city,
                  rent: firstProperty.rent,
                  amenities: firstProperty.amenities,
                  rating: firstProperty.rating,
                  max_renters: firstProperty.max_renters,
                  is_available: firstProperty.is_available,
                  is_verified: firstProperty.is_verified,
                  has_internet: firstProperty.has_internet,
                  allows_pets: firstProperty.allows_pets,
                  is_furnished: firstProperty.is_furnished,
                  has_ac: firstProperty.has_ac,
                  is_secure: firstProperty.is_secure,
                  has_parking: firstProperty.has_parking,
                  number_reviews: firstProperty.number_reviews,
                  distance_formatted: firstProperty.distance_formatted,
                }),
                properties: [firstProperty],
              };
            } catch (error) {
              console.error('[ChatScreen] Error fetching recommendations:', error);
              return {
                success: false,
                message: 'Failed to fetch recommendations. Please try again.',
              };
            }
          }

          // Handle show_next_property tool
          if (toolName === 'show_next_property') {
            console.log('[ChatScreen] AI requested to show next property');

            try {
              const nextProperty = getNextRecommendation();

              if (!nextProperty) {
                console.log('[ChatScreen] No more properties in queue');
                return {
                  success: false,
                  message: 'No more properties to show.',
                };
              }

              // Mark as shown and set as current
              markPropertyAsShown(nextProperty.property_id);
              setCurrentProperty(nextProperty.property_id);
              console.log(
                '[ChatScreen] Showing property:',
                nextProperty.title,
                'ID:',
                nextProperty.property_id
              );

              // Return property data (excluding owner_id, coordinates and image_url)
              return {
                success: true,
                hasMore: hasMoreRecommendations(),
                json: JSON.stringify({
                  property_id: nextProperty.property_id,
                  title: nextProperty.title,
                  description: nextProperty.description,
                  category: nextProperty.category,
                  street: nextProperty.street,
                  barangay: nextProperty.barangay,
                  city: nextProperty.city,
                  rent: nextProperty.rent,
                  amenities: nextProperty.amenities,
                  rating: nextProperty.rating,
                  max_renters: nextProperty.max_renters,
                  is_available: nextProperty.is_available,
                  is_verified: nextProperty.is_verified,
                  has_internet: nextProperty.has_internet,
                  allows_pets: nextProperty.allows_pets,
                  is_furnished: nextProperty.is_furnished,
                  has_ac: nextProperty.has_ac,
                  is_secure: nextProperty.is_secure,
                  has_parking: nextProperty.has_parking,
                  number_reviews: nextProperty.number_reviews,
                  distance_formatted:
                    (nextProperty as any).distance_formatted || 'Distance unavailable',
                }),
                properties: [nextProperty],
              };
            } catch (error) {
              console.error('[ChatScreen] Error showing next property:', error);
              return {
                success: false,
                message: 'Failed to show property. Please try again.',
              };
            }
          }

          // Handle reject_recommendation tool
          if (toolName === 'reject_recommendation') {
            console.log('[ChatScreen] AI requested to reject property:', args.property_id);

            try {
              const propertyId = args.property_id;

              // Add to rejected list
              addRejectedProperty(propertyId);
              console.log('[ChatScreen] Property', propertyId, 'added to rejected list');

              // Automatically show the next property from queue
              const nextProperty = getNextRecommendation();

              if (!nextProperty) {
                console.log('[ChatScreen] No more properties in queue after rejection');
                return {
                  success: true,
                  hasMore: false,
                  message: 'Property rejected. No more properties available.',
                };
              }

              // Mark next property as shown and set as current
              markPropertyAsShown(nextProperty.property_id);
              setCurrentProperty(nextProperty.property_id);
              console.log(
                '[ChatScreen] Auto-showing next property after rejection:',
                nextProperty.title,
                'ID:',
                nextProperty.property_id
              );

              // Return next property (excluding owner_id, coordinates and image_url)
              return {
                success: true,
                hasMore: hasMoreRecommendations(),
                json: JSON.stringify({
                  property_id: nextProperty.property_id,
                  title: nextProperty.title,
                  description: nextProperty.description,
                  category: nextProperty.category,
                  street: nextProperty.street,
                  barangay: nextProperty.barangay,
                  city: nextProperty.city,
                  rent: nextProperty.rent,
                  amenities: nextProperty.amenities,
                  rating: nextProperty.rating,
                  max_renters: nextProperty.max_renters,
                  is_available: nextProperty.is_available,
                  is_verified: nextProperty.is_verified,
                  has_internet: nextProperty.has_internet,
                  allows_pets: nextProperty.allows_pets,
                  is_furnished: nextProperty.is_furnished,
                  has_ac: nextProperty.has_ac,
                  is_secure: nextProperty.is_secure,
                  has_parking: nextProperty.has_parking,
                  number_reviews: nextProperty.number_reviews,
                  distance_formatted:
                    (nextProperty as any).distance_formatted || 'Distance unavailable',
                }),
                properties: [nextProperty],
              };
            } catch (error) {
              console.error('[ChatScreen] Error rejecting recommendation:', error);
              return {
                success: false,
                message: 'Failed to reject property. Please try again.',
              };
            }
          }

          // Apply tool temporarily disabled for testing reject functionality
          // if (toolName === 'apply_to_property') {
          //   console.log('[ChatScreen] AI requested to apply to property:', args.property_id);
          //   // ... implementation commented out
          // }
        }
      );

      // Only add AI message if there's a response (not a tool call)
      if (aiResponse.text) {
        console.log('[ChatScreen] Received AI response:', aiResponse.text.substring(0, 50) + '...');

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: aiResponse.text,
          timestamp: new Date(),
          properties: aiResponse.properties || undefined,
        };

        const updatedMessagesWithAI = [...updatedMessagesWithUser, aiMessage];
        setMessages(updatedMessagesWithAI);
        // Save messages with AI response
        await saveMessages(updatedMessagesWithAI);
        console.log('[ChatScreen] Message exchange complete');
      }
    } catch (error) {
      console.error('[ChatScreen] Error sending message to AI:', error);
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
      <View className={`my-2 ${isUser ? '' : 'w-full'}`}>
        <View className={`flex-row ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start`}>
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
          <View className={isUser ? 'max-w-[75%]' : 'flex-1'}>
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

        {/* Property Cards (only for AI messages) */}
        {!isUser && item.properties && item.properties.length > 0 && (
          <View className="ml-10 mt-2">
            {item.properties.map((property) => (
              <ChatPropertyCard key={property.property_id} property={property} />
            ))}
          </View>
        )}
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
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-primary">Chat</Text>
            <Text className="mt-2.5 text-muted-foreground">
              Find recommendations and ask questions
            </Text>
          </View>
          <View className=" flex-col-reverse items-center gap-2">
            <Text
              className={`text-sm font-medium ${
                isNearLimit ? 'text-destructive' : 'text-muted-foreground'
              }`}>
              {userMessageCount}/{MESSAGE_LIMIT}
            </Text>
            <TouchableOpacity
              onPress={handleReset}
              className="rounded-lg border border-input bg-card p-2 shadow-xs"
              disabled={messages.length === 0}>
              <RotateCcw size={20} color={messages.length === 0 ? '#9CA3AF' : '#644A40'} />
            </TouchableOpacity>
          </View>
        </View>
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
        <View className="flex-1" style={{ height: 44, overflow: 'hidden' }}>
          <TextInput
            className="px-4 text-base text-foreground"
            style={{ height: 44, lineHeight: 18, width: '100%', paddingTop: 12, paddingBottom: 12 }}
            placeholder={
              isResetting
                ? 'Resetting conversation...'
                : isAtLimit
                  ? 'Message limit reached. Please reset.'
                  : 'Type your message...'
            }
            placeholderTextColor="#646464"
            value={input}
            onChangeText={setInput}
            editable={!isSending && !isAtLimit && !isResetting}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline={false}
            maxLength={500}
            numberOfLines={1}
            scrollEnabled={false}
            textAlignVertical="center"
          />
        </View>
        <View className="h-full w-px bg-input" />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!input.trim() || isSending || isAtLimit || isResetting}
          className={`px-3 py-3 ${
            !input.trim() || isSending || isAtLimit || isResetting ? 'opacity-40' : 'opacity-100'
          }`}>
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
