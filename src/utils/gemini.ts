import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_KEY || '');

// Get the generative model
export const getChatModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
};

// Helper function to send a message and get response
export const sendMessageToAI = async (
  message: string,
  chatHistory: { role: string; parts: string }[] = []
) => {
  const model = getChatModel();
  const chat = model.startChat({
    history: chatHistory.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.parts }],
    })),
    generationConfig: {
      maxOutputTokens: 1000,
      temperature: 0.7,
    },
  });

  const result = await chat.sendMessage(message);
  const response = await result.response;
  return response.text();
};
