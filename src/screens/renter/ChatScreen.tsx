import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const MOCK_LLM_RESPONSE = (input: string) => {
  // Simple mock: echo only the user's message
  return `You said, "${input}"`;
};

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<{ sender: 'user' | 'llm'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage: { sender: 'user' | 'llm'; text: string } = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);
    setTimeout(() => {
      const llmMessage: { sender: 'user' | 'llm'; text: string } = {
        sender: 'llm',
        text: MOCK_LLM_RESPONSE(userMessage.text),
      };
      setMessages((prev) => [...prev, llmMessage]);
      setIsSending(false);
    }, 600);
  };

  const renderItem = ({ item }: { item: { sender: 'user' | 'llm'; text: string } }) => (
    <View
      className={`border-sm my-1 max-w-[80%] flex-row items-end ${item.sender === 'user' ? 'flex-row-reverse self-end' : 'self-start'} `}>
      {/* Mock icon */}
      <View className={`${item.sender === 'user' ? 'ml-2' : 'mr-2'} items-center justify-center`}>
        {item.sender === 'user' ? (
          <Ionicons name="person" size={18} color="#6366f1" />
        ) : (
          <Ionicons name="chatbubbles" size={18} color="#10b981" />
        )}
      </View>
      <View
        className={`border-sm rounded-full border border-gray-200 bg-white px-5 py-3 ${item.sender === 'user' ? 'bg-indigo-100' : 'bg-gray-100'}`}
        style={{ flexShrink: 1 }}>
        <Text className="text-lg">{item.text}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}>
      <View className="bg-white px-4 pb-2 pt-10">
        <Text className="text-center text-2xl font-bold text-gray-900">Chat with LLM</Text>
      </View>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(_, idx) => idx.toString()}
        contentContainerStyle={{ padding: 16, flexGrow: 1, justifyContent: 'flex-end' }}
        inverted
      />
      <View className="flex-row bg-white p-4">
        <TextInput
          className="border-sm mr-3 flex-1 rounded-full border border-gray-200 px-6 py-3 text-lg"
          placeholder="Type your message..."
          value={input}
          onChangeText={setInput}
          editable={!isSending}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!input.trim() || isSending}
          className={`rounded-full bg-indigo-500 px-6 py-3 ${!input.trim() || isSending ? 'opacity-50' : ''}`}>
          <Text className="text-lg font-bold text-white">Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;
