import { Product } from "@/types";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// @ts-ignore - Module exists but TypeScript cache needs refresh
import { geminiService } from "@/services/geminiService";
import { Ionicons } from "@expo/vector-icons";

interface AIRecommendationsProps {
  cartItems: Product[];
  allProducts: Product[];
  onProductPress: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const AIRecommendations = ({
  cartItems,
  allProducts,
  onProductPress,
  onAddToCart,
}: AIRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems.length]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const recs = await geminiService.getProductRecommendations(
        cartItems,
        allProducts
      );
      setRecommendations(recs);
    } catch (error) {
      console.error("Failed to load recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="sparkles" size={20} color="#007AFF" />
          <Text style={styles.title}>AI Recommendations</Text>
        </View>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={20} color="#007AFF" />
        <Text style={styles.title}>
          {cartItems.length > 0 ? "You might also like" : "Popular Products"}
        </Text>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>AI</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {recommendations.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.card}
            onPress={() => onProductPress(product)}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: product.image }}
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.productTitle} numberOfLines={2}>
              {product.title}
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>${product.price.toFixed(2)}</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
              >
                <Ionicons name="add" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
  aiBadge: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingRight: 16,
  },
  card: {
    width: 150,
    marginRight: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 12,
  },
  image: {
    width: "100%",
    height: 100,
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 13,
    color: "#333",
    marginBottom: 8,
    height: 36,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
  },
  addButton: {
    backgroundColor: "#007AFF",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
});
