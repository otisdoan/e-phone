import { ChatMessage, chatService } from "@/services/chatService";
import { Product } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const CHAT_STORAGE_KEY = "@e-phone:chat-history";

export const useChat = (products?: Product[]) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load chat history from storage
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const history = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
      if (history) {
        const parsed = JSON.parse(history);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  };

  const saveChatHistory = async (newMessages: ChatMessage[]) => {
    try {
      await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(newMessages));
    } catch (err) {
      console.error("Failed to save chat history:", err);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    // Add user message immediately
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);
    setError(null);

    try {
      // Get AI response
      const aiResponse = await chatService.chat(content, messages, products);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to get response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    setMessages([]);
    await AsyncStorage.removeItem(CHAT_STORAGE_KEY);
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearChat,
  };
};
