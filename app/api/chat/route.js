import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
const {VertexAI, HarmCategory, HarmBlockThreshold} = require('@google-cloud/vertexai');
import { useState, useEffect } from "react";

const project = 'extreme-cycling-430919-i7';
const location = 'us-central1';

const [chat, setChat] = useState();

const systemPrompt = "You are an AI chatbot trying to support people for Headstarter. Headstarter is a company that runs programmes from people to learn AI skills through project based learning, AI interviews and teaching people networking skills"

export async function ChatBegin() {
  const vertex_ai = new VertexAI({project: project, location: location});

  const generativeModel = vertex_ai.getGenerativeModel({
    model: 'gemini-pro',
    safety_settings: [{category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE}],
    generation_config: {max_output_tokens: 2560},
  });


  setChat(generativeModel.startChat());
}

export async function POST(req){
  const result1 = await chat.sendMessage(req);
  return JSON.stringify(await result1.response)
}