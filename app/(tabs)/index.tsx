import React from "react";
import { StyleSheet, View, ScrollView, StatusBar, Text } from "react-native";
import { Stack } from "expo-router";
import { RefreshControl } from "react-native-gesture-handler";
import { useTradingStore } from "@/hooks/useTradingStore";
import PriceHeader from "@/components/PriceHeader";
import PriceChart from "@/components/PriceChart";
import OrderBook from "@/components/OrderBook";
import TradesList from "@/components/TradesList";
import TabSelector from "@/components/TabSelector";
import ActionButtons from "@/components/ActionButtons";
import CurrencySelector from "@/components/CurrencySelector";
import Colors from "@/constants/colors";

function TradingScreen() {
  const { selectedCurrency } = useTradingStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate a refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Trading Details",
          headerStyle: {
            backgroundColor: Colors.background.primary,
          },
          headerTintColor: Colors.text.primary,
        }}
      />
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.background.primary}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.text.primary}
            colors={[Colors.button.primary]}
          />
        }
      >
        <PriceHeader />
        <PriceChart />
        <ActionButtons />
        <TabSelector />
        <OrderBook />
        <TradesList />
      </ScrollView>

      <CurrencySelector />
    </View>
  );
}

export default TradingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
});
