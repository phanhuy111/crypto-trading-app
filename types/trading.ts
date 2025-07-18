export type TimeRange = '7D' | '1M' | '3M' | '1Y' | '5Y' | 'MAX';

export type Currency = 'USD/BTC' | 'ETH/BTC' | 'XRP/BTC' | 'LTC/BTC';

export type CurrencyPair = {
    id: string;
    name: string;
    icon: string;
};

export type PriceData = {
    price: number;
    timestamp: number;
};

export type ChartData = {
    prices: PriceData[];
    high: number;
    low: number;
    currentPrice: number;
    percentageChange: number;
};

export type OrderType = 'buy' | 'sell';

export type Order = {
    id: string;
    price: number;
    amount: number;
    type: OrderType;
    timestamp: number;
};

export type Trade = {
    id: string;
    price: number;
    amount: number;
    type: OrderType;
    timestamp: number;
};

export type OrderBook = {
    buys: Order[];
    sells: Order[];
};

export type TabType = 'open' | 'filled' | 'cancelled';