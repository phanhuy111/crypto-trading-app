import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LegendList, LegendListRenderItemProps } from "@legendapp/list";
import { useOrderBook } from "@/hooks/useTradingStore";
import { Order } from "@/types/trading";
import { formatPrice, formatAmount } from "@/utils/formatters";
import Colors from "@/constants/colors";

export default function OrderBook() {
  const { data: orderBook, isLoading } = useOrderBook();

  if (isLoading || !orderBook) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Order book</Text>
        <Text style={styles.loadingText}>Loading order book...</Text>
      </View>
    );
  }

  const renderOrderItem = ({ item }: LegendListRenderItemProps<Order>) => {
    const isGreen = item.type === "buy";

    return (
      <View style={styles.orderRow}>
        <Text
          style={[
            styles.orderPrice,
            isGreen ? styles.greenText : styles.redText,
          ]}
        >
          {formatPrice(item.price)}
        </Text>
        <Text style={styles.orderAmount}>{formatAmount(item.amount)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Order book</Text>

      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Price</Text>
        <Text style={styles.headerText}>Amount</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Sell Orders</Text>
        <LegendList
          data={orderBook.sells}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          recycleItems={true}
          style={styles.ordersList}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Buy Orders</Text>
        <LegendList
          data={orderBook.buys}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          recycleItems={true}
          style={styles.ordersList}
        />
      </View>
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
    marginBottom: 12,
  },
  headerText: {
    color: Colors.text.secondary,
    fontSize: 12,
    fontWeight: "600" as const,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontWeight: "600" as const,
    marginBottom: 8,
  },
  ordersList: {
    maxHeight: 200, // Limit height to prevent excessive scrolling
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  orderPrice: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  orderAmount: {
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
