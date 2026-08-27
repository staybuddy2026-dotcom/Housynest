import { GoogleGenAI, Type } from '@google/genai';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Property from '../models/Property.js';
import { housyNestKnowledgeBase } from '../utils/knowledgeBase.js';
import Review from '../models/Review.js';

// Setup Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const systemInstruction = `You are the HousyNest AI Assistant. Your goal is to help users with their PGs, Hostels, Co-Living spaces, Flats, Apartments, bookings, payments, and any HousyNest-related queries.
You must ONLY answer questions related to HousyNest services. 
If a user asks about outside topics (like 'Who is Narendra Modi?', 'Write Python code', etc.), politely decline and say: "I can only assist with HousyNest services, properties, bookings, and platform-related questions."
Use function calling for:
- Search Property: Use the 'searchProperties' function to query the database. This platform is for both PG and Tenant Rent (Flats/Apartments). Only show max 5 results with key details. If it's a PG, specify the PG Name, Rent (can be a range), and locality. If it is a Tenant rent (Flat), specify the Society/Property name, BHK Type, Monthly Rent, and locality. Highlight key amenities if they are relevant to the user's query.
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
      propertyName: { type: Type.STRING, description: 'Specific name of the PG, hostel, or society to search for (if user mentions one).' },
      city: { type: Type.STRING, description: 'The city or locality to search in, e.g. Ahmedabad, Surat' },
      maxRent: { type: Type.NUMBER, description: 'Maximum monthly rent in INR' },
      gender: { type: Type.STRING, description: 'Target gender: Boys, Girls, or Any' },
      type: { type: Type.STRING, description: 'Property type: PG, Hostel, Co-living, Flat, Apartment' }
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
        roleContext += " Can manage their bookings, leads, payments, agreements, and schedule visits.";
      } else if (currentUser.role === 'owner') {
        roleContext += " Can manage their properties, leads, analytics, verifications, and earnings.";
      } else if (currentUser.role === 'admin') {
        roleContext += " Can manage property approvals, users, statistics, revenue, and reports.";
      }
    }

    let languageContext = "CRITICAL INSTRUCTION: You MUST respond entirely in English.";
    if (language === 'Hindi') {
      languageContext = "CRITICAL INSTRUCTION: You MUST respond fluently and entirely in Hindi (Devanagari script). Do not answer in English.";
    } else if (language === 'Gujarati') {
      languageContext = "CRITICAL INSTRUCTION: You MUST respond fluently and entirely in Gujarati script. Do not answer in English.";
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
        const andConditions = [];
        
        if (args.city) {
          andConditions.push({
            $or: [
              { city: new RegExp(args.city, 'i') },
              { locality: new RegExp(args.city, 'i') },
              { address: new RegExp(args.city, 'i') }
            ]
          });
        }
        if (args.propertyName) {
          andConditions.push({
            $or: [
              { pgName: new RegExp(args.propertyName, 'i') },
              { societyName: new RegExp(args.propertyName, 'i') }
            ]
          });
        }
        if (andConditions.length > 0) {
          query.$and = andConditions;
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
        const rawProperties = await Property.find(query)
          .limit(30)
          .select('pgName societyName propertyType city locality address monthlyRent preferredGender status bhkType rooms pgPricing societyAmenities commonAmenities');
        
        const propertyIds = rawProperties.map(p => p._id);
        const reviewsAggregation = await Review.aggregate([
          { $match: { property: { $in: propertyIds } } },
          { $group: { _id: '$property', avgRating: { $avg: '$rating' } } }
        ]);
        const reviewsMap = {};
        reviewsAggregation.forEach(r => {
          reviewsMap[r._id.toString()] = r.avgRating;
        });

        let filteredProps = rawProperties.map(p => {
            let pgPrices = [];
            if (p.pgPricing) {
              Object.values(p.pgPricing).forEach(priceObj => {
                if (priceObj && priceObj.rentPerBed && Number(priceObj.rentPerBed) > 0) {
                  pgPrices.push(Number(priceObj.rentPerBed));
                }
              });
            }
            if (pgPrices.length === 0 && p.rooms && p.rooms.length > 0) {
              p.rooms.forEach(room => {
                if (room.rentPerBed) pgPrices.push(Number(String(room.rentPerBed).replace(/,/g, '')));
              });
            }
            
            let minPrice = 0;
            let maxPrice = 0;
            if (pgPrices.length > 0) {
              minPrice = Math.min(...pgPrices);
              maxPrice = Math.max(...pgPrices);
            } else {
              minPrice = Number((p.monthlyRent || '0').toString().replace(/,/g, ''));
              maxPrice = minPrice;
            }

            return {
              name: p.pgName || p.societyName || 'Property',
              type: p.propertyType,
              bhk: p.bhkType,
              city: p.city,
              locality: p.locality,
              gender: p.preferredGender,
              minPrice,
              maxPrice,
              amenities: p.societyAmenities?.length > 0 ? p.societyAmenities : (p.commonAmenities || []),
              rating: Number((reviewsMap[p._id.toString()] || 0).toFixed(1))
            };
        });

        if (args.maxRent) {
            filteredProps = filteredProps.filter(p => p.minPrice <= args.maxRent);
        }
        
        // Sort by rating descending
        filteredProps.sort((a, b) => b.rating - a.rating);
        
        // Take top 5 to avoid overloading the prompt context
        filteredProps = filteredProps.slice(0, 5);

        let toolResponseText = filteredProps.length > 0 
          ? JSON.stringify(filteredProps) 
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
