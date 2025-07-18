import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LegendList, LegendListRenderItemProps } from "@legendapp/list";
import { useTrades } from "@/hooks/useTradingStore";
import { Trade } from "@/types/trading";
import { formatPrice, formatAmount, formatTimestamp } from "@/utils/formatters";
import Colors from "@/constants/colors";

export default function TradesList() {
  const { data: trades, isLoading } = useTrades();

  if (isLoading || !trades || trades.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Trades</Text>
        <Text style={styles.loadingText}>Loading trades...</Text>
      </View>
    );
  }

  const renderTradeItem = ({ item }: LegendListRenderItemProps<Trade>) => {
    const isGreen = item.type === "buy";

    return (
      <View style={styles.tradeRow}>
        <Text style={styles.tradeTime}>{formatTimestamp(item.timestamp)}</Text>
        <Text
          style={[
            styles.tradePrice,
            isGreen ? styles.greenText : styles.redText,
          ]}
        >
          {formatPrice(item.price)}
        </Text>
        <Text style={styles.tradeAmount}>{formatAmount(item.amount)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Trades</Text>

      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Time</Text>
        <Text style={styles.headerText}>Price</Text>
        <Text style={styles.headerText}>Amount</Text>
      </View>

      <LegendList
        data={trades}
        keyExtractor={(item) => item.id}
        renderItem={renderTradeItem}
        recycleItems={true}
        maintainVisibleContentPosition
        style={styles.tradesList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: Colors.text.primary,
    fontSize: 18,
    fontWeight: "bold" as const,
    marginBottom: 16,
  },
  loadingText: {
    color: Colors.text.secondary,
    textAlign: "center",
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 8,
  },
  headerText: {
    color: Colors.text.secondary,
    fontSize: 12,
    fontWeight: "600" as const,
  },
  tradesList: {
    maxHeight: 300, // Limit height to prevent excessive scrolling
  },
  tradeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  tradeTime: {
    color: Colors.text.primary,
    fontSize: 14,
  },
  tradePrice: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  tradeAmount: {
    color: Colors.text.primary,
    fontSize: 14,
  },
  greenText: {
    color: Colors.text.green,
  },
  redText: {
    color: Colors.text.red,
  },
});
