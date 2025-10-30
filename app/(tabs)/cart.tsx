import { AIRecommendations } from "@/components/ai/AIRecommendations";
import { CartItem } from "@/components/cart/CartItem";
import { PriceSummary } from "@/components/cart/PriceSummary";
import { ChatModal } from "@/components/chat/ChatModal";
import { FloatingChatButton } from "@/components/chat/FloatingChatButton";
import { useCart } from "@/contexts/CartContext";
import { useChat } from "@/hooks/use-chat";
import { useProducts } from "@/hooks/use-products";
import { CartItem as CartItemType, Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CartScreen() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
    addToCart,
  } = useCart();
  const { products } = useProducts();
  const [chatModalVisible, setChatModalVisible] = React.useState(false);

  // Chat hook
  const {
    messages,
    loading: chatLoading,
    sendMessage,
    clearChat: clearChatHistory,
  } = useChat(products);

  const handleCheckout = () => {
    Alert.alert(
      "Checkout",
      `Total: $${totalPrice.toFixed(
        2
      )}\n\nThis is a demo app. Checkout functionality would be implemented here.`,
      [{ text: "OK" }]
    );
  };

  const handleClearCart = () => {
    Alert.alert("Clear Cart", "Are you sure you want to remove all items?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: clearCart },
    ]);
  };

  const handleClearChatHistory = () => {
    Alert.alert("Clear Chat", "Are you sure you want to clear all messages?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: clearChatHistory,
      },
    ]);
  };

  const renderItem = ({ item }: { item: CartItemType }) => (
    <CartItem
      item={item}
      onUpdateQuantity={(quantity) => updateQuantity(item.id, quantity)}
      onRemove={() => removeFromCart(item.id)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cart-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptyText}>Add some products to get started</Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => router.push("/")}
        activeOpacity={0.8}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Shopping Cart</Text>
      {items.length > 0 && (
        <TouchableOpacity onPress={handleClearCart}>
          <Text style={styles.clearButton}>Clear All</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => {
    if (items.length === 0) return null;
    return footerContent;
  };

  const footerContent = useMemo(
    () => (
      <View style={styles.footer}>
        <AIRecommendations
          cartItems={items}
          allProducts={products}
          onProductPress={(product: Product) =>
            router.push(`/product/${product.id}`)
          }
          onAddToCart={(product: Product) => {
            addToCart(product);
            Alert.alert("Success", `${product.title} added to cart!`, [
              { text: "OK" },
            ]);
          }}
        />

        <PriceSummary subtotal={totalPrice} total={totalPrice} />
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
          activeOpacity={0.8}
        >
          <Text style={styles.checkoutButtonText}>
            Checkout ({totalItems} {totalItems === 1 ? "item" : "items"})
          </Text>
          <Text style={styles.checkoutButtonPrice}>
            ${totalPrice.toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
    ),
    [items.length, products.length, totalItems, totalPrice]
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
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
        onClear={handleClearChatHistory}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  clearButton: {
    fontSize: 14,
    color: "#FF3B30",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  shopButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    marginTop: 16,
  },
  checkoutButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  checkoutButtonPrice: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
