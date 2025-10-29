import { Product } from "@/types";
import axios from "axios";

const BASE_URL = "https://fakestoreapi.com";

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache: { [key: string]: { data: any; timestamp: number } } = {};

const getCachedData = (key: string) => {
  const cached = cache[key];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache[key] = {
    data,
    timestamp: Date.now(),
  };
};

export const productService = {
  // Fetch all products with pagination
  async getProducts(limit: number = 20, skip: number = 0): Promise<Product[]> {
    const cacheKey = `products_${limit}_${skip}`;
    const cached = getCachedData(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(`${BASE_URL}/products`, {
        params: {
          limit,
          skip,
        },
      });

      const data = response.data;
      setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  // Fetch single product
  async getProductById(id: number): Promise<Product> {
    const cacheKey = `product_${id}`;
    const cached = getCachedData(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(`${BASE_URL}/products/${id}`);
      const data = response.data;
      setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  // Get all categories
  async getCategories(): Promise<string[]> {
    const cacheKey = "categories";
    const cached = getCachedData(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(`${BASE_URL}/products/categories`);
      const data = response.data;
      setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  // Search products by title
  searchProducts(products: Product[], query: string): Product[] {
    if (!query.trim()) {
      return products;
    }

    const lowerQuery = query.toLowerCase();
    return products.filter(
      (product) =>
        product.title.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery)
    );
  },
};
