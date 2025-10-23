/**
 * Tool declarations for the chatbot
 * These define the functions the AI can call during conversations
 */

export const resetConversationTool = {
  name: 'reset_conversation',
  description:
    'Resets the conversation when the user has been consistently off-topic for 5+ messages. Use this to gently restart the conversation with a focus on rentals. Say something friendly like "It seems we have gotten a bit off track! Let me help you find the perfect rental in Dumaguete. What are you looking for?" Do not explicitly mention limits or counts.',
  parameters: {
    type: 'object' as const,
    properties: {
      reason: {
        type: 'string' as const,
        description: 'Brief reason for resetting (e.g., "consistently off-topic discussions")',
      },
    },
    required: ['reason'],
  },
};

/**
 * All available tools for the chatbot
 */
export const chatbotTools = [resetConversationTool];

/**
 * Tool function declarations formatted for Gemini API
 */
export const toolDeclarations = chatbotTools.map((tool) => ({
  functionDeclarations: [tool],
}));
