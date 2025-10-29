import { Product } from "@/types";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini AI Configuration - API v1 (2025)
// ✅ Verified working models: gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash
const GEMINI_API_KEY = "AIzaSyCdwUHiSekrQde3pAuv2Ch_PO_xDlo3ZSc";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Sử dụng model mới nhất (June 2025)
const MODEL_NAME = "gemini-2.5-flash";

export const geminiService = {
  /**
   * AI-POWERED Product Recommendations
   * Sử dụng Gemini AI để phân tích và gợi ý sản phẩm thông minh
   */
  async getProductRecommendations(
    cartItems: Product[],
    allProducts: Product[]
  ): Promise<Product[]> {
    try {
      if (cartItems.length === 0 || allProducts.length === 0) {
        return allProducts.slice(0, 3);
      }

      // Use Gemini AI for intelligent recommendations
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const cartSummary = cartItems.map((item) => ({
        title: item.title,
        category: item.category,
        price: item.price,
        rating: item.rating?.rate,
      }));

      const availableProducts = allProducts
        .filter((p) => !cartItems.find((item) => item.id === p.id))
        .map((p) => ({
          id: p.id,
          title: p.title,
          category: p.category,
          price: p.price,
          rating: p.rating?.rate,
        }));

      const prompt = `You are a smart e-commerce recommendation AI. 

Current cart items:
${JSON.stringify(cartSummary, null, 2)}

Available products:
${JSON.stringify(availableProducts, null, 2)}

Analyze the user's shopping behavior and recommend 3 product IDs that:
1. Complement items in their cart
2. Match their price range preference
3. Are highly rated
4. Make sense as a bundle or related purchase

Return ONLY a JSON array of 3 product IDs, like: [1, 5, 8]
No explanations, just the array.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();

      // Parse AI response - handle various formats
      // Remove markdown code blocks if present
      text = text.replace(/```json\s*/g, "").replace(/```\s*/g, "");

      // Extract array from text (find first [...])
      const arrayMatch = text.match(/\[[\d\s,]+\]/);
      if (!arrayMatch) {
        throw new Error("No valid array found in AI response");
      }

      const recommendedIds = JSON.parse(arrayMatch[0]);
      const recommendations = allProducts.filter((p) =>
        recommendedIds.includes(p.id)
      );

      // Ensure we have 3 recommendations
      if (recommendations.length >= 3) {
        return recommendations.slice(0, 3);
      }

      // If AI didn't return enough, add popular products
      const additional = allProducts
        .filter((p) => !recommendedIds.includes(p.id))
        .filter((p) => !cartItems.find((item) => item.id === p.id))
        .slice(0, 3 - recommendations.length);

      return [...recommendations, ...additional].slice(0, 3);
    } catch (error) {
      console.error("AI Recommendation error:", error);
      // Fallback to category-based recommendations
      const cartCategories = [
        ...new Set(cartItems.map((item) => item.category)),
      ];
      return allProducts
        .filter((p) => cartCategories.includes(p.category))
        .filter((p) => !cartItems.find((item) => item.id === p.id))
        .slice(0, 3);
    }
  },

  /**
   * AI-Enhanced Product Description
   * Cải thiện mô tả sản phẩm với AI
   */
  async enhanceProductDescription(product: Product): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const prompt = `You are a professional e-commerce product copywriter.
      
Product: ${product.title}
Category: ${product.category}
Price: $${product.price}
Current description: ${product.description}

Write a compelling, engaging product description (2-3 sentences) that:
1. Highlights key features
2. Appeals to potential buyers
3. Maintains a professional yet friendly tone

Return ONLY the description text, no quotes or formatting.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error("AI Description error:", error);
      return product.description;
    }
  },

  /**
   * AI Shopping Assistant Chatbot
   * Trợ lý mua sắm thông minh
   */
  async chatWithAssistant(
    userMessage: string,
    context?: string
  ): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const prompt = `You are a helpful e-commerce shopping assistant.

${context ? `Context: ${context}\n` : ""}
User question: ${userMessage}

Provide a helpful, concise response (2-3 sentences). Be friendly and professional.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error("AI Chat error:", error);
      return "I apologize, but I'm having trouble connecting right now. Please try again later!";
    }
  },

  /**
   * AI-Powered Smart Search
   * Tìm kiếm thông minh với hiểu ngữ cảnh
   */
  async smartSearch(query: string, products: Product[]): Promise<Product[]> {
    try {
      if (!query.trim()) {
        return products.slice(0, 5);
      }

      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const productsList = products.map((p) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        description: p.description,
        price: p.price,
      }));

      const prompt = `You are a smart product search AI.

User search query: "${query}"

Available products:
${JSON.stringify(productsList, null, 2)}

Find the most relevant products matching the user's intent. Consider:
1. Direct keyword matches
2. Category relevance
3. Description context
4. Price range if mentioned

Return ONLY a JSON array of up to 5 product IDs, ordered by relevance: [1, 3, 7]`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();

      // Clean AI response
      text = text.replace(/```json\s*/g, "").replace(/```\s*/g, "");
      const arrayMatch = text.match(/\[[\d\s,]+\]/);
      if (!arrayMatch) {
        throw new Error("No valid array in search response");
      }

      const resultIds = JSON.parse(arrayMatch[0]);
      return products.filter((p) => resultIds.includes(p.id));
    } catch (error) {
      console.error("AI Search error:", error);
      // Fallback to basic search
      const lowerQuery = query.toLowerCase();
      return products
        .filter(
          (p) =>
            p.title.toLowerCase().includes(lowerQuery) ||
            p.description.toLowerCase().includes(lowerQuery) ||
            p.category.toLowerCase().includes(lowerQuery)
        )
        .slice(0, 5);
    }
  },
};

// Default export for compatibility
export default geminiService;
