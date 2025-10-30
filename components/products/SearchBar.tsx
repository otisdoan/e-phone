import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onAISearch?: (query: string) => void;
  placeholder?: string;
  aiSearchLoading?: boolean;
  showAIButton?: boolean; // Option to hide AI button for speed
}

export const SearchBar = ({
  value,
  onChangeText,
  onAISearch,
  placeholder = "Search products...",
  aiSearchLoading = false,
  showAIButton = true,
}: SearchBarProps) => {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color="#666" style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={() => {
          if (value.trim() && onAISearch && showAIButton) {
            onAISearch(value);
          }
        }}
      />
      {value.length > 0 && (
        <>
          {showAIButton && onAISearch && !aiSearchLoading && (
            <TouchableOpacity
              onPress={() => onAISearch(value)}
              style={styles.aiButton}
            >
              <Ionicons name="sparkles" size={18} color="#007AFF" />
              <Text style={styles.aiText}>AI</Text>
            </TouchableOpacity>
          )}
          {aiSearchLoading && (
            <ActivityIndicator
              size="small"
              color="#007AFF"
              style={styles.aiButton}
            />
          )}
          <Ionicons
            name="close-circle"
            size={20}
            color="#666"
            style={styles.clearIcon}
            onPress={() => onChangeText("")}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    height: 44,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  aiButton: {
    marginLeft: 8,
    padding: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  aiText: {
    fontSize: 10,
    color: "#007AFF",
    fontWeight: "600",
  },
  clearIcon: {
    marginLeft: 8,
  },
});
