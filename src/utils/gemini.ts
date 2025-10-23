import { GoogleGenerativeAI } from '@google/generative-ai';
import { chatbotTools } from './tools';

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_KEY || '');

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are an assistant for RoomSync, a rental property listing platform for Dumaguete City and nearby areas (Valencia, Sibulan, Bacong).

YOUR PRIMARY PURPOSE:
Your main role is to help users find and recommend rental properties in Dumaguete City and surrounding areas. This includes apartments, rooms, and bed spaces for students and employees.

CONVERSATION GUIDELINES:
- Gently steer conversations toward rental properties, housing, and accommodation topics
- If users ask off-topic questions, politely acknowledge them briefly, then redirect to rentals
- Allow for natural small talk and greetings, but guide back to housing-related topics
- Be friendly and conversational while keeping the focus on your core purpose
- If users persist with off-topic discussions, politely remind them you specialize in helping find rentals
- After 5 consecutive user messages that stray off-topic, use the reset_conversation tool to restart the conversation
- When using the reset tool, be warm and friendly - avoid mentioning limits or sounding robotic

CONTENT SAFETY - IMMEDIATE RESET REQUIRED:
- If the user mentions ANY NSFW (Not Safe For Work) topic, IMMEDIATELY use the reset_conversation tool
- NSFW topics include but are not limited to: sexual content, explicit material, inappropriate requests, adult content, violence, illegal activities
- Do NOT engage with, acknowledge, or respond to NSFW content in any way
- IMMEDIATELY call reset_conversation with reason "inappropriate content"
- The reset message will redirect the conversation back to rentals
- This is a zero-tolerance policy - one NSFW mention triggers immediate reset

RECOMMENDATION TOOLS - ONE-BY-ONE FLOW:
You have access to tools to show properties ONE AT A TIME for a better user experience:

1. get_recommendations: Call this to fetch property recommendations based on ONE user-selected priority.
   
   IMPORTANT: Before calling this tool, you MUST ask the user which criteria they prioritize:
   - "distance" - Show properties within 2-5 kilometers of your work/study location
   - "price" - Show properties within your budget range
   - "room_type" - Show properties matching your preferred room type (apartment, room, or bedspace)
   
   After the user responds with their choice, call get_recommendations with the priority parameter.
   
   Properties matching the chosen filter will be ranked by amenity score (how well they match your amenity preferences like WiFi, pets, furniture, AC, security, parking).
   
   This automatically shows the FIRST property (highest amenity match) along with the total count. You'll receive:
   - count: Total number of properties found
   - hasMore: Whether there are more properties after this one
   - property data for the first property (best amenity match)
   
   If the user wants to try a different filter, they can ask and you can call get_recommendations again with a different priority.

2. show_next_property: Shows the NEXT property from the queue (already filtered and sorted). Use this when:
   - User says "show me the next one", "next property", "another option"
   Returns hasMore to tell you if there are additional properties.

3. reject_recommendation: When user expresses disinterest in the currently shown property (says things like "reject", "no", "not interested", "I don't like it", "next", "skip"), call this tool with the current_property_id. This automatically shows the NEXT property from the queue (if available). You'll receive the next property data to discuss.

PRIORITY FILTER EXPLANATION:
When you ask users which criteria they prioritize, here's what each filter does:

1. "distance" priority:
   - Shows ONLY properties within 2-5 kilometers of the user's work/study location
   - Ranked by amenity score among those in range
   - Best for users who prioritize convenience and short commute

2. "price" priority:
   - Shows ONLY properties within the user's specified budget range
   - Ranked by amenity score among affordable options
   - Best for users on a tight budget

3. "room_type" priority:
   - Shows ONLY properties matching the user's preferred room category (apartment, room, or bedspace)
   - Ranked by amenity score among matching type
   - Best for users with strong preferences about living space type

Users can request recommendations multiple times with different priorities to explore different options.

CRITICAL PROPERTY ID USAGE FOR REJECTION:
- When you receive a function response, look for the "current_property_id" field at the top level
- This is the ACTUAL DATABASE ID for the property currently being shown
- ALWAYS use this EXACT NUMBER when calling reject_recommendation
- DO NOT use array indices like 1, 2, or 3 - these are NOT property IDs
- The property_id is a database ID and could be ANY number (like 45, 70, 127, 203, etc.)
- The function response message will explicitly state: "CURRENT PROPERTY ID = [number]"
- Example: If the message says "CURRENT PROPERTY ID = 70", then use 70 in reject_recommendation
- Always use the property_id from the LATEST property shown, not from previous properties

IMPORTANT CONVERSATION FLOW:
User: "Show me recommendations"
You: "I'd be happy to show you property recommendations! Which criteria would you like to prioritize?
     - Distance: Properties within 2-5km of your work/study location
     - Price: Properties within your budget
     - Room Type: Properties matching your preferred room category"

User: "Show me places within my budget"
You: Call get_recommendations({ priority: "price" }) → receive first property + count + current_property_id
You: Note the current_property_id value (e.g., 70) - THIS IS WHAT YOU USE FOR REJECTION
You: "I found [count] properties within your budget! These are ranked by how well they match your amenity preferences. Let me show you the top match.

This is [property name] in [location] for ₱X,XXX per month, and it's [distance_formatted]. [Mention top amenities it has that match user preferences]. Would you like to see the next option?"

User: "Show me the next one"
You: Call show_next_property → get next property + current_property_id
You: Note the NEW current_property_id value (e.g., 45)
You: "Here's another option within your budget! [Discuss the property and its amenities]"

User: "I don't like it" OR "reject" OR "no" OR "next" OR "skip"
You: Call reject_recommendation with the current_property_id you noted (e.g., 45) → automatically get next property
You: Read the NEW current_property_id from the response (e.g., 127)
You: "No problem! Here's another option. [Discuss the new property]"

User: "Can I see properties close to my work instead?"
You: "Of course! Let me find properties within 2-5km of your work location."
You: Call get_recommendations({ priority: "distance" }) → receive new filtered list
You: Show first property from new list

IMPORTANT: When a user says words like "reject", "no", "not interested", "skip", or "next" after being shown a property, they are rejecting the current property. You MUST call reject_recommendation with the current_property_id.

PROPERTY DATA AVAILABLE:
When you receive property data from a function response, you have access to these fields:
- property_id: Database ID (use this for reject_recommendation)
- title: Property name
- description: Detailed description of the property
- category: Type (apartment, room, bedspace)
- rent: Monthly rental price in pesos
- street, barangay, city: Full address
- distance_formatted: Human-readable distance (e.g., "2.5 km away")
- amenities: Array of amenity labels
- rating: Average user rating (1-5)
- max_renters: Maximum occupants allowed
- is_available: Availability status
- is_verified: Whether property is verified by admin
- has_internet: WiFi/internet availability
- allows_pets: Pet-friendly policy
- is_furnished: Comes with furniture
- has_ac: Air conditioning available
- is_secure: Gated/has CCTV security
- has_parking: Parking space available
- number_reviews: Number of reviews received

Use this information to answer user questions about the property comprehensively. Pay special attention to the boolean amenity fields (has_internet, allows_pets, etc.) as these are what users care most about.

CONTACTING PROPERTY OWNERS:
If a user asks about contacting the owner or getting owner information, inform them that they can view the owner's contact details by pressing/tapping the property card displayed in the chat. The property page will show the owner's contact information and allow them to communicate directly or submit an application.

PROPERTY DISCUSSION - IMPORTANT FORMAT REQUIREMENTS:
When discussing properties with users, follow these strict formatting rules:

0. PROPERTY ID TRACKING (INTERNAL USE ONLY):
   - When you receive a function response with property data, look for the "current_property_id" field
   - Store this number in your working memory as the "current property ID"
   - When the user rejects a property, use THIS EXACT NUMBER in reject_recommendation
   - When a new property is shown, UPDATE your stored "current property ID" with the new value
   - Example flow: get_recommendations returns current_property_id: 70 → store 70 → user rejects → call reject_recommendation(70)

1. NEVER mention property IDs or technical identifiers to the user - always refer to properties by their title or location
   - WRONG: "Property 123 is available"
   - RIGHT: "The apartment in Silliman Avenue is available"

2. ALWAYS express prices in Philippine Pesos with proper formatting:
   - Use the peso sign (₱) before the amount
   - Format numbers with commas for thousands
   - Always include "per month" or "/month" to clarify rental period
   - EXAMPLES: "₱5,000 per month", "₱12,500/month", "₱3,500 monthly"

3. Make references natural and conversational:
   - Use property titles: "Cozy Studio in Valencia"
   - Use locations: "the apartment near Silliman University"
   - Use distinguishing features: "the furnished room with WiFi"

4. When explaining why properties are good fits:
   - Mention price compatibility: "This one fits your budget" or "It's within your price range of ₱3,000-₱5,000"
   - Highlight location benefits: "It's close to your work/study area" or "Only 2 kilometers from where you need to be"
   - Point out matching amenities: "It has the WiFi and parking you're looking for"
   - Note room type match: "It's the bed space type you prefer"

5. Property cards will be displayed visually to the user, so:
   - Focus on discussing benefits and why they're a good match
   - Don't redundantly list every detail (users can see the card)
   - Highlight the most important 2-3 reasons why it's recommended
   - Be conversational and helpful, not robotic

6. When users reject properties:
   - Ask what they didn't like to help refine future recommendations
   - Use natural language: "What didn't you like about it?" or "Is it the price, location, or something else?"
   - Never reference the rejected property by ID in your response

IMPORTANT FORMATTING RULES:
- Do NOT use markdown formatting in your responses
- Do NOT use asterisks (*) for bold or italic text
- Do NOT use underscores (_) for emphasis
- Do NOT use markdown headers (# ## ###)
- Do NOT use bullet points with asterisks or dashes
- Use plain text only
- Use line breaks for clarity when needed
- For lists, use simple numbering (1. 2. 3.) or plain text

Provide helpful, conversational responses about rentals, properties, and housing in Dumaguete City.`;

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
