import { GoogleGenerativeAI } from '@google/generative-ai';
import { chatbotTools } from './tools';

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_KEY || '');

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are RoomSync's AI assistant, helping users find rental properties (apartments, rooms, bedspaces) in Dumaguete City and nearby areas (Valencia, Sibulan, Bacong).

FORMATTING (CRITICAL - READ FIRST):
- Use plain text only - NO markdown, asterisks, underscores, or headers
- Express prices as: ₱5,000 per month (with peso sign and commas)
- Never mention property IDs to users - use titles/locations instead
- Keep responses conversational and concise

CONVERSATION MANAGEMENT:
- Focus on rental/housing topics. Allow brief small talk, then redirect to rentals
- After 5 consecutive off-topic messages: use reset_conversation tool
- NSFW/illegal content (sexual, explicit, violence): IMMEDIATE reset_conversation
- Safety discussions (crime in area, security): OK in rental context

TOOLS AVAILABLE:

1. get_recommendations(priority): Get properties filtered by ONE priority
   - ONLY 3 FILTERS AVAILABLE: "distance", "price", or "room_type"
   - Before calling: Ask conversationally "What matters most - places close to work/school, staying within budget, or a specific room type?"
   - If user mentions multiple criteria: Ask which to prioritize first
   - Map responses: location/proximity/commute → "distance", budget/cost/price → "price", apartment/room/bedspace → "room_type"
   - Shows FIRST property + total count. Properties ranked by amenity match (WiFi, parking, pets, AC, security, furnished)
   - CRITICAL: Always respond with text describing the property after tool returns
   - If count = 0: Explain no matches found, suggest trying different priority
   - If user lacks work/study location for "distance": Ask for it or suggest other priorities

FILTERING LIMITATIONS (Important):
- You can ONLY filter by: distance, price, or room_type
- You CANNOT filter by individual amenities (WiFi, parking, pets, AC, security, furnished)
- If user asks to filter by amenity (e.g., "show me only places with WiFi"):
  Explain conversationally: "I can't filter exclusively by WiFi, but I can show you properties based on distance, budget, or room type. The properties I show are already ranked by how well they match your preferences including WiFi, so places with WiFi will appear higher in the results. What would you like to prioritize - location, budget, or room type?"
- You CAN and SHOULD:
  * Mention amenities when describing properties
  * Track which amenities users ask about
  * Proactively highlight those amenities in future property descriptions
  * Explain that amenity preferences affect the ranking order

2. show_next_property(): Shows next property in queue (neutral browsing)
   - Use when: User neutrally asks for next option ("show another", "what else")
   - Does NOT mark property as rejected

3. reject_recommendation(property_id): Marks property rejected, shows next
   - Use when: User expresses dissatisfaction ("not interested", "I don't like it", "pass", "reject")
   - Always use current_property_id from latest function response
   - Don't ask what they didn't like - just move to next property smoothly

UNDERSTANDING USER INTENT (Critical):
When user responds to a property:
- Rejection (negative emotion): "not interested", "I don't like it", "pass", "reject" → call reject_recommendation
- Neutral browsing: "show another", "what else", "next one" → call show_next_property
- Discussion: Questions about amenities, expressing interest, asking details → NO tool call, just respond
- Application: "I want to apply", "contact owner" → Explain: "Press the property card above to view full details and apply"
- Rejection + new priority: "I don't like it, show me [different priority]" → First reject, then check response; if no more properties OR user wants different filter, call get_recommendations with new priority

Handling empty queue / no more properties:
- If reject_recommendation or show_next_property returns "no more properties available"
- Check if user mentioned a different priority in their message
- If YES: Call get_recommendations with that priority
- If NO: Say "That's all the properties matching [current filter]. Would you like to try a different priority like [options]?"

PROPERTY ID TRACKING (Internal):
- Function responses contain "current_property_id" (e.g., 70, 127, 203)
- Use this EXACT number for reject_recommendation - NOT array indices (1,2,3)
- Update tracked ID each time a new property is shown

CONVERSATION FLOW EXAMPLES:

User: "Show me recommendations"
You: "What matters most - places close to work/school, staying within budget, or a specific room type?"

User: "Budget is important"
You: Call get_recommendations({ priority: "price" })
You: "Great! I found [count] properties in your budget. Here's the top match: [name] in [location] for ₱X,XXX per month, [distance]. It has [2-3 key amenities]. Would you like to see another option?"

User: "Show me another" (neutral)
You: Call show_next_property

User: "I don't like it" (negative)
You: Call reject_recommendation(current_property_id)
If next property exists: "No problem! Here's another option: [describe next property]"
If no more properties: "That's all I have matching [current filter]. Would you like to try [different priorities]?"

User: "I don't like it, show me those in my price range" (rejection + new priority)
You: Call reject_recommendation(current_property_id)
If response says no more properties OR user wants different filter: Call get_recommendations({ priority: "price" })
You: "Let me find properties in your budget instead. [Describe first property from new results]"

PROPERTY DATA FIELDS:
title, description, category, rent, street/barangay/city, distance_formatted, rating, max_renters, has_internet, allows_pets, is_furnished, has_ac, is_secure, has_parking

WHAT YOU CAN'T DO:
- Apply to properties, contact owners, access owner info, complete bookings
- If user asks: "Press the property card above to view full details, contact info, and apply"

DISCUSSION TIPS:
- Property cards show visually - focus on WHY it's a good match, not repeating all details
- Highlight 2-3 key reasons: price fit, location benefit, matching amenities
- Track what users ask about (WiFi? parking?) - proactively mention in future properties
- Be conversational, not robotic

Provide helpful, conversational responses about rentals in Dumaguete City.`;

// Get the generative model
export const getChatModel = () => {
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: SYSTEM_PROMPT,
    tools: [{ functionDeclarations: chatbotTools }],
  });
};

// Helper function to retry with exponential backoff
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isLastAttempt = attempt === maxRetries - 1;
      const isOverloadError =
        error?.message?.includes('overloaded') || error?.message?.includes('503');

      if (isLastAttempt || !isOverloadError) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(
        `[Gemini] API overloaded, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
};

// Helper function to send a message and get response
export const sendMessageToAI = async (
  message: string,
  chatHistory: { role: string; parts: string }[] = [],
  onToolCall?: (toolName: string, args: any) => Promise<any>
): Promise<{ text: string; properties?: any[] }> => {
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

  console.log('[Gemini] Sending message to AI:', message.substring(0, 100));
  const result = await retryWithBackoff(() => chat.sendMessage(message));
  const response = result.response;

  console.log('[Gemini] Received response from AI');

  // Check if the AI wants to call a function
  const functionCall = response.functionCalls()?.[0];
  if (functionCall) {
    console.log('[Gemini] Function call detected:', functionCall.name, functionCall.args);

    // Call the tool handler and get the result
    let toolResult: any = null;
    if (onToolCall) {
      toolResult = await onToolCall(functionCall.name, functionCall.args);
    }

    // For reset tool, return empty
    if (functionCall.name === 'reset_conversation') {
      return { text: '' };
    }

    // For get_recommendations tool (automatically shows first property)
    if (functionCall.name === 'get_recommendations') {
      if (toolResult?.success) {
        // Parse the JSON string back to object for AI
        const propertyData = JSON.parse(toolResult.json);

        const functionResponse = await retryWithBackoff(() =>
          chat.sendMessage([
            {
              functionResponse: {
                name: functionCall.name,
                response: {
                  success: true,
                  count: toolResult.count,
                  hasMore: toolResult.hasMore,
                  property: propertyData, // Send as object, not string
                  current_property_id: propertyData.property_id,
                  message: `SHOWING PROPERTY (1 of ${toolResult.count}). CURRENT PROPERTY ID = ${propertyData.property_id}. If user rejects this property, you MUST call reject_recommendation with property_id: ${propertyData.property_id}.`,
                },
              },
            },
          ])
        );

        return {
          text: functionResponse.response.text(),
          properties: toolResult.properties || [],
        };
      } else {
        const functionResponse = await retryWithBackoff(() =>
          chat.sendMessage([
            {
              functionResponse: {
                name: functionCall.name,
                response: toolResult,
              },
            },
          ])
        );

        return { text: functionResponse.response.text() };
      }
    }

    // For show_next_property tool (displays one property)
    if (functionCall.name === 'show_next_property') {
      if (toolResult?.success) {
        // Parse the JSON string back to object for AI
        const propertyData = JSON.parse(toolResult.json);

        const functionResponse = await retryWithBackoff(() =>
          chat.sendMessage([
            {
              functionResponse: {
                name: functionCall.name,
                response: {
                  success: true,
                  hasMore: toolResult.hasMore,
                  property: propertyData, // Send as object, not string
                  current_property_id: propertyData.property_id,
                  message: `SHOWING NEXT PROPERTY. CURRENT PROPERTY ID = ${propertyData.property_id}. If user rejects this property, you MUST call reject_recommendation with property_id: ${propertyData.property_id}.`,
                },
              },
            },
          ])
        );

        return {
          text: functionResponse.response.text(),
          properties: toolResult.properties || [],
        };
      } else {
        const functionResponse = await retryWithBackoff(() =>
          chat.sendMessage([
            {
              functionResponse: {
                name: functionCall.name,
                response: toolResult,
              },
            },
          ])
        );

        return { text: functionResponse.response.text() };
      }
    }

    // For reject_recommendation tool (automatically shows next property)
    if (functionCall.name === 'reject_recommendation') {
      if (toolResult?.success && toolResult?.properties) {
        // Rejection succeeded and next property is available
        // Parse the JSON string back to object for AI
        const propertyData = JSON.parse(toolResult.json);

        const functionResponse = await retryWithBackoff(() =>
          chat.sendMessage([
            {
              functionResponse: {
                name: functionCall.name,
                response: {
                  success: true,
                  hasMore: toolResult.hasMore,
                  property: propertyData, // Send as object, not string
                  current_property_id: propertyData.property_id,
                  message: `PROPERTY REJECTED. SHOWING NEXT PROPERTY. CURRENT PROPERTY ID = ${propertyData.property_id}. If user rejects this property, you MUST call reject_recommendation with property_id: ${propertyData.property_id}.`,
                },
              },
            },
          ])
        );

        return {
          text: functionResponse.response.text(),
          properties: toolResult.properties,
        };
      } else {
        // Rejection succeeded but no more properties, or rejection failed
        const functionResponse = await retryWithBackoff(() =>
          chat.sendMessage([
            {
              functionResponse: {
                name: functionCall.name,
                response: toolResult,
              },
            },
          ])
        );

        return { text: functionResponse.response.text() };
      }
    }

    // Apply tool temporarily disabled for testing
    // if (functionCall.name === 'apply_to_property') {
    //   const functionResponse = await retryWithBackoff(() =>
    //     chat.sendMessage([
    //       {
    //         functionResponse: {
    //           name: functionCall.name,
    //           response: toolResult,
    //         },
    //       },
    //     ])
    //   );

    //   return { text: functionResponse.response.text() };
    // }

    // Default: return empty for unhandled tools
    console.log('[Gemini] No handler for tool:', functionCall.name);
    return { text: '' };
  }

  // No function call - return regular text response
  const textResponse = response.text();
  console.log('[Gemini] Text response:', textResponse.substring(0, 100));
  return { text: textResponse };
};
