import React from "react";
import { View, Text, StyleSheet, Pressable, Modal, Image } from "react-native";
import { useTradingStore } from "@/hooks/useTradingStore";
import { Currency } from "@/types/trading";
import { CURRENCY_PAIRS } from "@/constants/currencies";
import { X } from "lucide-react-native";
import Colors from "@/constants/colors";

export default function CurrencySelector() {
  const {
    showCurrencySelector,
    toggleCurrencySelector,
    changeCurrency,
    selectedCurrency,
  } = useTradingStore();

  const handleSelectCurrency = (currency: Currency) => {
    changeCurrency(currency);
  };

  return (
    <Modal
      visible={showCurrencySelector}
      transparent
      animationType="fade"
      onRequestClose={toggleCurrencySelector}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Currency</Text>
            <Pressable
              onPress={toggleCurrencySelector}
              style={styles.closeButton}
            >
              <X size={20} color={Colors.text.primary} />
            </Pressable>
          </View>

          {CURRENCY_PAIRS.map((pair) => (
            <Pressable
              key={pair.id}
              style={[
                styles.currencyItem,
                selectedCurrency === pair.name && styles.selectedCurrencyItem,
              ]}
              onPress={() => handleSelectCurrency(pair.name as Currency)}
            >
              <Image source={{ uri: pair.icon }} style={styles.currencyIcon} />
              <Text style={styles.currencyName}>{pair.name}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.modal.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    color: Colors.text.primary,
    fontSize: 18,
    fontWeight: "bold" as const,
  },
  closeButton: {
    padding: 4,
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  selectedCurrencyItem: {
    backgroundColor: Colors.button.selected + "33",
  },
  currencyIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  currencyName: {
    color: Colors.text.primary,
    fontSize: 16,
  },
});
