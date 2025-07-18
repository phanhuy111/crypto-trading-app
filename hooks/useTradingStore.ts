import { useQuery, useQueryClient } from '@tanstack/react-query';
import { create } from 'zustand';
import { ChartData, Currency, OrderBook, TimeRange, Trade, TabType } from '@/types/trading';
import {
    generateChartData,
    generateOrderBook,
    generateTrades,
    updateChartDataRealtime,
    updateOrderBookRealtime,
    updateTradesRealtime,
} from '@/utils/mockDataGenerator';

// Zustand store for UI state
interface TradingState {
    selectedTimeRange: TimeRange;
    selectedCurrency: Currency;
    selectedTab: TabType;
    showCurrencySelector: boolean;
    changeTimeRange: (range: TimeRange) => void;
    changeCurrency: (currency: Currency) => void;
    toggleCurrencySelector: () => void;
    changeTab: (tab: TabType) => void;
}

export const useTradingStore = create<TradingState>((set) => ({
    selectedTimeRange: '7D',
    selectedCurrency: 'USD/BTC',
    selectedTab: 'open',
    showCurrencySelector: false,
    changeTimeRange: (range: TimeRange) => set({ selectedTimeRange: range }),
    changeCurrency: (currency: Currency) => set({ selectedCurrency: currency, showCurrencySelector: false }),
    toggleCurrencySelector: () => set((state: TradingState) => ({ showCurrencySelector: !state.showCurrencySelector })),
    changeTab: (tab: TabType) => set({ selectedTab: tab }),
}));

// React Query hooks for data
function useChartData() {
    const { selectedTimeRange, selectedCurrency } = useTradingStore();
    const queryClient = useQueryClient();
    return useQuery<ChartData>({
        queryKey: ['chartData', selectedTimeRange, selectedCurrency],
        queryFn: () => {
            const prev = queryClient.getQueryData<ChartData>(['chartData', selectedTimeRange, selectedCurrency]);
            if (prev) {
                return updateChartDataRealtime(prev, selectedCurrency);
            }
            return generateChartData(selectedTimeRange, selectedCurrency);
        },
        refetchInterval: 5000,
        staleTime: 0,
    });
}

function useOrderBook() {
    const { selectedCurrency } = useTradingStore();
    const queryClient = useQueryClient();
    
    return useQuery<OrderBook>({
        queryKey: ['orderBook', selectedCurrency],
        queryFn: () => {
            // Get current price from chart data if available
            const chartData = queryClient.getQueryData<ChartData>(['chartData', useTradingStore.getState().selectedTimeRange, selectedCurrency]);
            const currentPrice = chartData?.currentPrice || 66000; // fallback price
            
            const prev = queryClient.getQueryData<OrderBook>(['orderBook', selectedCurrency]);
            if (prev) {
                return updateOrderBookRealtime(prev, currentPrice);
            }
            return generateOrderBook(currentPrice, selectedCurrency);
        },
        refetchInterval: 5000,
        staleTime: 0,
    });
}

function useTrades() {
    const { selectedCurrency } = useTradingStore();
    const queryClient = useQueryClient();
    
    return useQuery<Trade[]>({
        queryKey: ['trades', selectedCurrency],
        queryFn: () => {
            // Get current price from chart data if available
            const chartData = queryClient.getQueryData<ChartData>(['chartData', useTradingStore.getState().selectedTimeRange, selectedCurrency]);
            const currentPrice = chartData?.currentPrice || 66000; // fallback price
            
            const prev = queryClient.getQueryData<Trade[]>(['trades', selectedCurrency]);
            if (prev) {
                return updateTradesRealtime(prev, currentPrice);
            }
            return generateTrades(currentPrice, selectedCurrency);
        },
        refetchInterval: 5000,
        staleTime: 0,
    });
}

export { useChartData, useOrderBook, useTrades };