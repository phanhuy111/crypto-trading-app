import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTradingStore } from "@/hooks/useTradingStore";
import { TabType } from "@/types/trading";
import Colors from "@/constants/colors";

export default function TabSelector() {
  const { selectedTab, changeTab } = useTradingStore();

  const tabs: { key: TabType; label: string }[] = [
    { key: "open", label: "Open" },
    { key: "filled", label: "Filled" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.key}
          style={[
            styles.tabButton,
            selectedTab === tab.key && styles.selectedTabButton,
          ]}
          onPress={() => changeTab(tab.key)}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === tab.key && styles.selectedTabText,
            ]}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  selectedTabButton: {
    backgroundColor: Colors.button.selected,
  },
  tabText: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontWeight: "600" as const,
  },
  selectedTabText: {
    color: Colors.text.primary,
  },
});
