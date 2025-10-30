import { ChatBox } from "@/components/chat/ChatBox";
import { useChat } from "@/hooks/use-chat";
import { useProducts } from "@/hooks/use-products";
import { Alert, SafeAreaView, StyleSheet } from "react-native";

export default function ChatScreen() {
  const { products } = useProducts();
  const { messages, loading, sendMessage, clearChat } = useChat(products);

  const handleClear = () => {
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
      <ChatBox
        messages={messages}
        loading={loading}
        onSendMessage={sendMessage}
        onClear={handleClear}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});
