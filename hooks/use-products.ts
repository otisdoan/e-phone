import { productService } from "@/services/productService";
import { Product } from "@/types";
import { useEffect, useState } from "react";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const ITEMS_PER_PAGE = 10;

  const fetchProducts = async (pageNum: number, append: boolean = false) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const newProducts = await productService.getProducts(
        ITEMS_PER_PAGE,
        pageNum * ITEMS_PER_PAGE
      );

      if (newProducts.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }

      setProducts((prev) => {
        if (append) {
          // Filter out duplicates by checking existing IDs
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueNewProducts = newProducts.filter(
            (p) => !existingIds.has(p.id)
          );
          return [...prev, ...uniqueNewProducts];
        }
        return newProducts;
      });

      setFilteredProducts((prev) => {
        if (append) {
          // Filter out duplicates by checking existing IDs
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueNewProducts = newProducts.filter(
            (p) => !existingIds.has(p.id)
          );
          return [...prev, ...uniqueNewProducts];
        }
        return newProducts;
      });
    } catch (err) {
      setError("Failed to load products. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, true);
    }
  };

  const refresh = () => {
    setPage(0);
    setHasMore(true);
    setProducts([]);
    setFilteredProducts([]);
    fetchProducts(0, false);
  };

  const search = (query: string) => {
    setSearchQuery(query);
    const filtered = productService.searchProducts(products, query);
    setFilteredProducts(filtered);
  };

  useEffect(() => {
    fetchProducts(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    products: filteredProducts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    search,
    searchQuery,
  };
};
