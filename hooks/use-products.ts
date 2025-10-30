import { geminiService } from "@/services/geminiService";
import { productService } from "@/services/productService";
import { Product } from "@/types";
import { useEffect, useState } from "react";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]); // Store all products for search
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]); // Products currently shown
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const ITEMS_PER_PAGE = 10;

  // Fetch all products once
  const fetchAllProducts = async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const allProds = await productService.getAllProducts();
      console.log(`Fetched ${allProds.length} total products`);

      setAllProducts(allProds);
      setProducts(allProds);

      // Initially show only first 10 products
      const initial = allProds.slice(0, ITEMS_PER_PAGE);
      setDisplayedProducts(initial);
      setFilteredProducts(initial);
      setCurrentIndex(ITEMS_PER_PAGE);
      setHasMore(allProds.length > ITEMS_PER_PAGE);

      console.log(`Displaying ${initial.length} products initially`);
    } catch (err) {
      setError("Failed to load products. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    console.log(
      `loadMore called - currentIndex: ${currentIndex}, total: ${products.length}`
    );

    if (loading || !hasMore) {
      console.log(
        `loadMore blocked - loading: ${loading}, hasMore: ${hasMore}`
      );
      return;
    }

    setLoading(true);

    // Simulate 2s loading delay
    setTimeout(() => {
      const nextBatch = products.slice(
        currentIndex,
        currentIndex + ITEMS_PER_PAGE
      );
      console.log(`Loading ${nextBatch.length} more products...`);

      setDisplayedProducts((prev) => [...prev, ...nextBatch]);
      setFilteredProducts((prev) => [...prev, ...nextBatch]);

      const newIndex = currentIndex + ITEMS_PER_PAGE;
      setCurrentIndex(newIndex);
      setHasMore(newIndex < products.length);

      setLoading(false);
      console.log(
        `Now displaying ${newIndex} products, hasMore: ${
          newIndex < products.length
        }`
      );
    }, 2000);
  };

  const refresh = async () => {
    setHasMore(true);
    setProducts([]);
    setDisplayedProducts([]);
    setFilteredProducts([]);
    setSearchQuery("");
    setCurrentIndex(0);
    await fetchAllProducts();
  };

  const search = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      // If search is cleared, show currently displayed products (with pagination)
      setFilteredProducts(displayedProducts);
      return;
    }

    // Search in ALL products (not just displayed ones)
    try {
      setLoading(true);

      // Use allProducts which we already have
      const searchBase = allProducts.length > 0 ? allProducts : products;

      const filtered = productService.searchProducts(searchBase, query);
      setFilteredProducts(filtered);
    } catch (err) {
      console.error("Search error:", err);
      const filtered = productService.searchProducts(products, query);
      setFilteredProducts(filtered);
    } finally {
      setLoading(false);
    }
  };

  // AI-powered smart search
  const aiSearch = async (query: string) => {
    if (!query.trim()) {
      setFilteredProducts(displayedProducts);
      return;
    }

    try {
      setLoading(true);

      // Search in ALL products (we already have them)
      const searchBase = allProducts.length > 0 ? allProducts : products;

      // Show basic search results immediately while AI processes
      const quickResults = productService.searchProducts(searchBase, query);
      setFilteredProducts(quickResults);

      // Then enhance with AI in background (optional - can be disabled for speed)
      try {
        const aiResults = await geminiService.smartSearch(query, searchBase);
        setFilteredProducts(aiResults);
      } catch {
        console.log("AI search failed, using basic results");
        // Keep quickResults if AI fails
      }
    } catch (err) {
      console.error("AI Search error:", err);
      const filtered = productService.searchProducts(
        allProducts.length > 0 ? allProducts : products,
        query
      );
      setFilteredProducts(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    products:
      filteredProducts.length > 0 || searchQuery
        ? filteredProducts
        : displayedProducts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    search,
    aiSearch,
    searchQuery,
  };
};
