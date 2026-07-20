import { GoogleGenAI, Type } from '@google/genai';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Property from '../models/Property.js';
import { housyNestKnowledgeBase } from '../utils/knowledgeBase.js';

// Setup Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const systemInstruction = `You are the HousyNest AI Assistant. Your goal is to help users with their PGs, Hostels, Co-Living spaces, Flats, Apartments, bookings, payments, and any HousyNest-related queries.
You must ONLY answer questions related to HousyNest services. 
If a user asks about outside topics (like 'Who is Narendra Modi?', 'Write Python code', etc.), politely decline and say: "I can only assist with HousyNest services, properties, bookings, and platform-related questions."
Use function calling for:
- Search Property: Use the 'searchProperties' function to query the database. This platform is for both PG and Tenant Rent (Flats/Apartments). Only show max 3 results with key details. If it's a PG, specify the PG Name and Rent. If it is a Tenant rent (Flat), specify the Society/Property name, BHK Type, and Monthly Rent.
- Booking Lookup: Inform user to check dashboard or use user context.

Be polite, helpful, and format responses nicely using Markdown (bullet points, bold text). Keep responses concise unless asked for details.

Below is the strict knowledge base you must use to answer questions about HousyNest policies, features, contact info, and guidelines. DO NOT hallucinate.
${housyNestKnowledgeBase}`;

const searchPropertiesTool = {
  name: 'searchProperties',
  description: 'Search for properties (PG, Hostel, Co-living) based on user criteria like city, budget, gender.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      city: { type: Type.STRING, description: 'The city to search in, e.g. Ahmedabad, Surat' },
      maxRent: { type: Type.NUMBER, description: 'Maximum monthly rent in INR' },
      gender: { type: Type.STRING, description: 'Target gender: Boys, Girls, or Any' },
      type: { type: Type.STRING, description: 'Property type: PG, Hostel, Co-living' }
    },
  },
};

export const handleChat = async (req, res) => {
  try {
    const { message, history, language, pastSearches } = req.body;
    let currentUser = null;

    // Extract user from HttpOnly refreshToken
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        currentUser = await User.findById(decoded.id).select('fullName email role');
      } catch (e) {
        console.error("JWT verification failed for chatbot:", e.message);
      }
    }

    // Prepare role-based context
    let roleContext = "Guest User";
    if (currentUser) {
      roleContext = `User Role: ${currentUser.role}. User Name: ${currentUser.fullName}.`;
      if (currentUser.role === 'tenant') {
        roleContext += " Can manage their bookings, inquiries, payments, agreements, and schedule visits.";
      } else if (currentUser.role === 'owner') {
        roleContext += " Can manage their properties, inquiries, analytics, verifications, and earnings.";
      } else if (currentUser.role === 'admin') {
        roleContext += " Can manage property approvals, users, statistics, revenue, and reports.";
      }
    }

    let languageContext = "You must respond in English.";
    if (language === 'Hindi') {
      languageContext = "You must respond fluently in Hindi (Devanagari script).";
    } else if (language === 'Gujarati') {
      languageContext = "You must respond fluently in Gujarati script.";
    }

    let pastSearchesContext = "";
    if (pastSearches) {
      pastSearchesContext = `\nThe user has past search preferences: ${JSON.stringify(pastSearches)}. If they ask for recommendations without specifying new criteria, use these past preferences to search and recommend properties.`;
    }

    const fullInstruction = `${systemInstruction}\n\nCurrent User Context:\n${roleContext}\n\nLanguage Instruction:\n${languageContext}${pastSearchesContext}`;

    // Format history for GenAI SDK (Keep only the last 4 messages to reduce latency)
    const recentHistory = (history || []).slice(-4);
    const formattedHistory = recentHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Generate response using Gemini 2.5 Flash
    // Notice how we use generateContent directly for a single turn or start a chat session.
    // For simplicity with history, we use chat sessions.
    
    // We will initialize the model with tools
    const chat = ai.chats.create({
      model: 'gemini-flash-lite-latest',
      config: {
        systemInstruction: fullInstruction,
        temperature: 0.7,
        tools: [{ functionDeclarations: [searchPropertiesTool] }],
      }
    });

    // Replay history if needed (The SDK might not support replaying via .sendMessage easily with history, 
    // so alternatively we can just pass the history array in generateContent, but let's use generateContent directly)
    
    const contents = [...formattedHistory, { role: 'user', parts: [{ text: message }] }];

    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: contents,
      config: {
        systemInstruction: fullInstruction,
        temperature: 0.7,
        tools: [{ functionDeclarations: [searchPropertiesTool] }],
      }
    });

    let finalReply = "";
    let extractedPreferences = null;

    // Check if a tool was called
    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      if (call.name === 'searchProperties') {
        const args = call.args;
        const query = { status: { $in: ['Active', 'Approved'] } };
        if (args.city) {
          query.$or = [
            { city: new RegExp(args.city, 'i') },
            { locality: new RegExp(args.city, 'i') },
            { address: new RegExp(args.city, 'i') }
          ];
        }
        if (args.gender) {
          if (args.gender.toLowerCase() === 'boys' || args.gender.toLowerCase() === 'male') {
            query.preferredGender = { $regex: new RegExp('^(boys|male|anyone|any|both)$', 'i') };
          } else if (args.gender.toLowerCase() === 'girls' || args.gender.toLowerCase() === 'female') {
            query.preferredGender = { $regex: new RegExp('^(girls|female|anyone|any|both)$', 'i') };
          }
        }
        if (args.type) {
           if (args.type.toLowerCase().includes('pg') || args.type.toLowerCase().includes('hostel')) {
               query.propertyType = 'PG';
           } else if (args.type.toLowerCase().includes('flat') || args.type.toLowerCase().includes('apartment') || args.type.toLowerCase().includes('tenant')) {
               query.propertyType = 'Tenant';
           }
        }
        
        // Query DB
        const properties = await Property.find(query).limit(15).select('pgName societyName propertyType city locality monthlyRent preferredGender status bhkType rooms tenantPreference preferredTenants');
        
        let toolResponseText = properties.length > 0 
          ? JSON.stringify(properties) 
          : "No properties found matching criteria.";

        // Send function response back to the model
        const followUp = await ai.models.generateContent({
           model: 'gemini-flash-lite-latest',
           contents: [
             ...contents,
             response.candidates[0].content, // the assistant's function call message
             {
               role: 'user',
               parts: [{
                 functionResponse: {
                   name: 'searchProperties',
                   response: { result: toolResponseText }
                 }
               }]
             }
           ],
           config: {
             systemInstruction: fullInstruction,
           }
        });
        
        finalReply = followUp.text;
        extractedPreferences = args; // Save the args so frontend can persist them
      }
    } else {
      finalReply = response.text;
    }

    res.status(200).json({ reply: finalReply, extractedPreferences });
  } catch (error) {
    console.error("Chatbot Error:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
