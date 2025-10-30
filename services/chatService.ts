import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const chatService = {
  async chat(
    message: string,
    conversationHistory: ChatMessage[],
    productContext?: any[]
  ): Promise<string> {
    try {
      console.log("Chat service called");

      if (!API_KEY) {
        throw new Error("API key not configured");
      }

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      const prompt =
        "You are a helpful shopping assistant. User says: " + message;

      console.log("Sending to AI...");
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      console.log("AI response received:", text.substring(0, 50));
      return text;
    } catch (error: any) {
      console.error("Chat error details:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      throw new Error("AI Error: " + (error.message || "Unknown error"));
    }
  },
};
