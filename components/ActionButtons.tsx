import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { BarChart, ArrowDownToLine, Share2 } from "lucide-react-native";
import Colors from "@/constants/colors";

export default function ActionButtons() {
  return (
    <View style={styles.container}>
      <Pressable style={styles.actionButton}>
        <BarChart size={20} color={Colors.text.primary} />
      </Pressable>
      <Pressable style={styles.actionButton}>
        <ArrowDownToLine size={20} color={Colors.text.primary} />
      </Pressable>
      <Pressable style={styles.actionButton}>
        <Share2 size={20} color={Colors.text.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: Colors.background.secondary,
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
