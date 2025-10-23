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
    'Fetches 3 property recommendations based on ONE user-selected priority. Call this AFTER asking the user which criteria they prioritize: distance (2-5km from work/study), price (within budget), or room_type (preferred category). Properties matching the chosen filter are ranked by amenity score.',
  parameters: {
    type: 'object' as const,
    properties: {
      priority: {
        type: 'string' as const,
        enum: ['distance', 'price', 'room_type'],
        description:
          'The user-selected priority: distance (within 2-5km), price (within budget), or room_type (matches preference)',
      },
    },
    required: ['priority'],
  },
};

export const showNextPropertyTool = {
  name: 'show_next_property',
  description:
    'Shows the next property from the recommendation queue to the user. Use this: 1) Right after get_recommendations to show the first property, 2) After user rejects a property to show the next one, 3) After user applies to a property to show the next one. Returns property data and displays a property card.',
  parameters: {
    type: 'object' as const,
    properties: {},
    required: [],
  },
};

export const rejectRecommendationTool = {
  name: 'reject_recommendation',
  description:
    'Marks a property as rejected by the user. Use this when the user says they are not interested in the currently shown property (e.g., "reject", "no", "not interested", "I don\'t like it", "next", "skip"). The property will not be recommended again and the next property will be automatically shown.',
  parameters: {
    type: 'object' as const,
    properties: {
      property_id: {
        type: 'number' as const,
        description:
          'The current_property_id from the most recent function response. This is the database ID of the property currently being shown to the user. DO NOT use array indices (1,2,3). Use the exact current_property_id value you received (e.g., 45, 70, 127).',
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
