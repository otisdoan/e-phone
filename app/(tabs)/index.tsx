import { AIRecommendations } from "@/components/ai/AIRecommendations";
import { ChatModal } from "@/components/chat/ChatModal";
import { FloatingChatButton } from "@/components/chat/FloatingChatButton";
import { ProductCard } from "@/components/products/ProductCard";
import { SearchBar } from "@/components/products/SearchBar";
import { useCart } from "@/contexts/CartContext";
import { useChat } from "@/hooks/use-chat";
import { useProducts } from "@/hooks/use-products";
import { Product } from "@/types";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function ProductListScreen() {
  const router = useRouter();
  const {
    products,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    search,
    aiSearch,
    searchQuery,
  } = useProducts();
  const { addToCart, items } = useCart();
  const [refreshing, setRefreshing] = React.useState(false);
  const [chatModalVisible, setChatModalVisible] = React.useState(false);

  // Chat hook
  const {
    messages,
    loading: chatLoading,
    sendMessage,
    clearChat,
  } = useChat(products);

  const handleProductPress = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    Alert.alert("Success", `${product.title} added to cart!`, [{ text: "OK" }]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={() => handleProductPress(item)}
      onAddToCart={() => handleAddToCart(item)}
    />
  );

  const renderFooter = () => {
    console.log(
      `renderFooter - loading: ${loading}, hasMore: ${hasMore}, searchQuery: "${searchQuery}"`
    );

    // Don't show footer when searching
    if (searchQuery) return null;

    // Show loading indicator when loading more products
    if (loading) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading more products...</Text>
        </View>
      );
    }

    return null;
  };

  const renderEmpty = () => {
    if (loading && products.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (searchQuery && products.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            No products found for &ldquo;{searchQuery}&rdquo;
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No products available</Text>
      </View>
    );
  };

  const renderHeader = useMemo(() => {
    if (searchQuery || products.length === 0) return null;

    return (
      <AIRecommendations
        cartItems={items}
        allProducts={products}
        onProductPress={handleProductPress}
        onAddToCart={handleAddToCart}
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, products.length, searchQuery]); // Only re-render when counts change

  const handleLoadMore = () => {
    console.log(`handleLoadMore called - searchQuery: "${searchQuery}"`);
    if (!searchQuery) {
      loadMore();
    }
  };

  const handleClearChat = () => {
    Alert.alert("Clear Chat", "Are you sure you want to clear all messages?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: clearChat,
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={search}
        onAISearch={aiSearch}
        aiSearchLoading={loading && searchQuery.length > 0}
      />

      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      {/* Floating Chat Button */}
      <FloatingChatButton
        onPress={() => setChatModalVisible(true)}
        unreadCount={0}
      />

      {/* Chat Modal */}
      <ChatModal
        visible={chatModalVisible}
        onClose={() => setChatModalVisible(false)}
        messages={messages}
        loading={chatLoading}
        onSendMessage={sendMessage}
        onClear={handleClearChat}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
