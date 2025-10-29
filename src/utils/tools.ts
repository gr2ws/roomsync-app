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

export const getRecommendationsTool = {
  name: 'get_recommendations',
  description:
    'Get properties filtered by ONE priority. CRITICAL: Check user profile FIRST. For "distance": requires place_of_work_study (if not_set, ask user to set in Profile). For "price": requires price_range (if not_set, ask user to set in Profile). For "room_type": requires room_preference (if not_set, ask user to set in Profile). NEVER call if required preference is missing. Priorities: "distance" (2-5km from work/study), "price" (within budget), "room_type" (preferred category). Returns first property + count. Properties ranked by amenity match.',
  parameters: {
    type: 'object' as const,
    properties: {
      priority: {
        type: 'string' as const,
        enum: ['distance', 'price', 'room_type'],
        description:
          'User-selected priority: "distance", "price", or "room_type". CHECK user profile BEFORE calling - distance needs place_of_work_study, price needs price_range, room_type needs room_preference.',
      },
    },
    required: ['priority'],
  },
};

export const showNextPropertyTool = {
  name: 'show_next_property',
  description:
    'Shows the next property from the queue (neutral browsing, does NOT mark as rejected). Use when user neutrally asks for more options: "show another", "what else do you have", "next one". DO NOT use after get_recommendations (already shows first property).',
  parameters: {
    type: 'object' as const,
    properties: {},
    required: [],
  },
};

export const rejectRecommendationTool = {
  name: 'reject_recommendation',
  description:
    'Marks property as rejected and shows next. Use when user expresses NEGATIVE emotion/dissatisfaction: "not interested", "I don\'t like it", "pass", "reject". Automatically shows next property. Use current_property_id from latest function response (database ID like 45, 70, 127 - NOT indices 1,2,3).',
  parameters: {
    type: 'object' as const,
    properties: {
      property_id: {
        type: 'number' as const,
        description:
          'The current_property_id from most recent function response (database ID, e.g., 45, 70, 127). NOT array indices.',
      },
    },
    required: ['property_id'],
  },
};

// TEMPORARILY DISABLED - Testing reject functionality first
// export const applyToPropertyTool = {
//   name: 'apply_to_property',
//   description:
//     'Submits a rental application for a specific property on behalf of the user. Use this when the user explicitly wants to apply to a property. The system will validate: user is not banned, user is verified, no approved applications exist, no pending application to this property, and pending applications < 5.',
//   parameters: {
//     type: 'object' as const,
//     properties: {
//       property_id: {
//         type: 'number' as const,
//         description:
//           'The database ID of the property to apply to. This is the "property_id" field from the property object in the function response. DO NOT use array indices (1,2,3). Use the actual property_id number (e.g., 45, 70, 127).',
//       },
//     },
//     required: ['property_id'],
//   },
// };

/**
 * All available tools for the chatbot
 */
export const chatbotTools = [
  resetConversationTool,
  getRecommendationsTool,
  showNextPropertyTool,
  rejectRecommendationTool,
  // applyToPropertyTool, // TEMPORARILY DISABLED
];

/**
 * Tool function declarations formatted for Gemini API
 */
export const toolDeclarations = chatbotTools.map((tool) => ({
  functionDeclarations: [tool],
}));
