import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { useChartData, useTradingStore } from "@/hooks/useTradingStore";
import { formatPrice, formatPercentage } from "@/utils/formatters";
import Colors from "@/constants/colors";

export default function PriceHeader() {
  const { data: chartData, isLoading } = useChartData();
  const { selectedCurrency, toggleCurrencySelector } = useTradingStore();

  if (isLoading || !chartData) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const { currentPrice, percentageChange, high, low } = chartData;
  const isPositive = percentageChange >= 0;

  return (
    <View style={styles.container}>
      <View style={styles.highLowContainer}>
        <View style={styles.priceColumn}>
          <Text style={styles.priceLabel}>High</Text>
          <Text style={[styles.priceValue, styles.highPrice]}>
            {formatPrice(high)}
          </Text>
        </View>
        <View style={styles.priceColumn}>
          <Text style={styles.priceLabel}>Low</Text>
          <Text style={[styles.priceValue, styles.lowPrice]}>
            {formatPrice(low)}
          </Text>
        </View>
      </View>

      <View style={styles.currentPriceContainer}>
        <Text style={styles.currentPrice}>${formatPrice(currentPrice)}</Text>
        <Text
          style={[
            styles.percentageChange,
            isPositive ? styles.positiveChange : styles.negativeChange,
          ]}
        >
          {formatPercentage(percentageChange)}
        </Text>
      </View>

      <Pressable
        style={styles.currencySelectorButton}
        onPress={toggleCurrencySelector}
      >
        <Text style={styles.currencyText}>{selectedCurrency}</Text>
        <ChevronDown size={16} color={Colors.text.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  loadingText: {
    color: Colors.text.primary,
    textAlign: "center",
  },
  highLowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  priceColumn: {
    alignItems: "flex-start",
  },
  priceLabel: {
    color: Colors.text.secondary,
    fontSize: 12,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  highPrice: {
    color: Colors.text.green,
  },
  lowPrice: {
    color: Colors.text.red,
  },
  currentPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  currentPrice: {
    color: Colors.text.primary,
    fontSize: 28,
    fontWeight: "bold" as const,
    marginRight: 8,
  },
  percentageChange: {
    fontSize: 16,
    fontWeight: "600" as const,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  positiveChange: {
    color: Colors.text.green,
    backgroundColor: "rgba(0, 192, 118, 0.1)",
  },
  negativeChange: {
    color: Colors.text.red,
    backgroundColor: "rgba(255, 104, 56, 0.1)",
  },
  currencySelectorButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background.secondary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  currencyText: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: "600" as const,
    marginRight: 8,
  },
});
