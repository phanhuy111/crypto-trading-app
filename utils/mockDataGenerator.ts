import { ChartData, Order, OrderBook, OrderType, PriceData, TimeRange, Trade } from '@/types/trading';

// Base price for BTC in USD
const BASE_PRICE_USD_BTC = 66000;
const BASE_PRICE_ETH_BTC = 0.052;
const BASE_PRICE_XRP_BTC = 0.000018;
const BASE_PRICE_LTC_BTC = 0.0032;

const getBasePriceForCurrency = (currency: string): number => {
    switch (currency) {
        case 'USD/BTC': return BASE_PRICE_USD_BTC;
        case 'ETH/BTC': return BASE_PRICE_ETH_BTC;
        case 'XRP/BTC': return BASE_PRICE_XRP_BTC;
        case 'LTC/BTC': return BASE_PRICE_LTC_BTC;
        default: return BASE_PRICE_USD_BTC;
    }
};

// Generate random price with volatility based on time range
const generateRandomPrice = (basePrice: number, timeRange: TimeRange, index: number, totalPoints: number): number => {
    // Different volatility based on time range
    let volatility = 0.005; // Default volatility

    switch (timeRange) {
        case '7D':
            volatility = 0.01;
            break;
        case '1M':
            volatility = 0.02;
            break;
        case '3M':
            volatility = 0.03;
            break;
        case '1Y':
            volatility = 0.05;
            break;
        case '5Y':
            volatility = 0.08;
            break;
        case 'MAX':
            volatility = 0.1;
            break;
    }

    // Add some trends based on the index to make the chart look more realistic
    const trend = Math.sin(index / (totalPoints / 6)) * volatility * basePrice;

    // Random component
    const randomComponent = (Math.random() - 0.5) * 2 * volatility * basePrice;

    return basePrice + trend + randomComponent;
};

// Get number of data points based on time range
const getDataPointsCount = (timeRange: TimeRange): number => {
    switch (timeRange) {
        case '7D': return 168; // 24 * 7 hours
        case '1M': return 30; // 30 days
        case '3M': return 90; // 90 days
        case '1Y': return 365; // 365 days
        case '5Y': return 60; // 60 months
        case 'MAX': return 120; // 10 years (120 months)
        default: return 168;
    }
};

// Get time interval in milliseconds based on time range
const getTimeInterval = (timeRange: TimeRange): number => {
    switch (timeRange) {
        case '7D': return 60 * 60 * 1000; // 1 hour
        case '1M': return 24 * 60 * 60 * 1000; // 1 day
        case '3M': return 24 * 60 * 60 * 1000; // 1 day
        case '1Y': return 24 * 60 * 60 * 1000; // 1 day
        case '5Y': return 30 * 24 * 60 * 60 * 1000; // 1 month
        case 'MAX': return 30 * 24 * 60 * 60 * 1000; // 1 month
        default: return 60 * 60 * 1000;
    }
};

export const generateChartData = (timeRange: TimeRange, currency: string): ChartData => {
    const basePrice = getBasePriceForCurrency(currency);
    const dataPoints = getDataPointsCount(timeRange);
    const timeInterval = getTimeInterval(timeRange);
    const now = Date.now();

    const prices: PriceData[] = [];
    let high = -Infinity;
    let low = Infinity;

    for (let i = 0; i < dataPoints; i++) {
        const timestamp = now - (dataPoints - i) * timeInterval;
        const price = generateRandomPrice(basePrice, timeRange, i, dataPoints);

        prices.push({ price, timestamp });

        if (price > high) high = price;
        if (price < low) low = price;
    }

    const currentPrice = prices[prices.length - 1].price;
    const startPrice = prices[0].price;
    const percentageChange = ((currentPrice - startPrice) / startPrice) * 100;

    return {
        prices,
        high,
        low,
        currentPrice,
        percentageChange,
    };
};

export const generateOrderBook = (currentPrice: number, currency: string): OrderBook => {
    const buys: Order[] = [];
    const sells: Order[] = [];

    // Generate buy orders (slightly below current price)
    for (let i = 0; i < 10; i++) {
        const priceOffset = (i + 1) * 0.01 * currentPrice;
        const price = currentPrice - priceOffset;
        const amount = 0.001 + Math.random() * 0.01;

        buys.push({
            id: `buy-${i}`,
            price,
            amount,
            type: 'buy',
            timestamp: Date.now() - i * 1000,
        });
    }

    // Generate sell orders (slightly above current price)
    for (let i = 0; i < 10; i++) {
        const priceOffset = (i + 1) * 0.01 * currentPrice;
        const price = currentPrice + priceOffset;
        const amount = 0.001 + Math.random() * 0.01;

        sells.push({
            id: `sell-${i}`,
            price,
            amount,
            type: 'sell',
            timestamp: Date.now() - i * 1000,
        });
    }

    return {
        buys: buys.sort((a, b) => b.price - a.price), // Sort buys in descending order
        sells: sells.sort((a, b) => a.price - b.price), // Sort sells in ascending order
    };
};

export const generateTrades = (currentPrice: number, currency: string): Trade[] => {
    const trades: Trade[] = [];

    for (let i = 0; i < 10; i++) {
        const priceVariation = (Math.random() - 0.5) * 0.02 * currentPrice;
        const price = currentPrice + priceVariation;
        const amount = 0.001 + Math.random() * 0.01;
        const type: OrderType = Math.random() > 0.5 ? 'buy' : 'sell';

        trades.push({
            id: `trade-${i}`,
            price,
            amount,
            type,
            timestamp: Date.now() - i * 1000,
        });
    }

    return trades;
};

export const updateChartDataRealtime = (
    chartData: ChartData,
    currency: string
): ChartData => {
    const { prices, high: prevHigh, low: prevLow } = chartData;
    const lastPrice = prices[prices.length - 1].price;
    const basePrice = getBasePriceForCurrency(currency);

    // Generate a new price with small variation from the last price
    const variation = (Math.random() - 0.5) * 0.005 * basePrice;
    const newPrice = lastPrice + variation;

    // Update high and low if needed
    const high = Math.max(prevHigh, newPrice);
    const low = Math.min(prevLow, newPrice);

    // Add new price data point
    const newPrices = [...prices.slice(1), {
        price: newPrice,
        timestamp: Date.now(),
    }];

    // Calculate percentage change from the first price
    const startPrice = newPrices[0].price;
    const percentageChange = ((newPrice - startPrice) / startPrice) * 100;

    return {
        prices: newPrices,
        high,
        low,
        currentPrice: newPrice,
        percentageChange,
    };
};

export const updateOrderBookRealtime = (
    orderBook: OrderBook,
    currentPrice: number
): OrderBook => {
    // Update a random buy order
    const buyIndex = Math.floor(Math.random() * orderBook.buys.length);
    const updatedBuys = [...orderBook.buys];
    const buyPriceVariation = Math.random() * 0.005 * currentPrice;
    updatedBuys[buyIndex] = {
        ...updatedBuys[buyIndex],
        price: updatedBuys[buyIndex].price - buyPriceVariation,
        amount: 0.001 + Math.random() * 0.01,
        timestamp: Date.now(),
    };

    // Update a random sell order
    const sellIndex = Math.floor(Math.random() * orderBook.sells.length);
    const updatedSells = [...orderBook.sells];
    const sellPriceVariation = Math.random() * 0.005 * currentPrice;
    updatedSells[sellIndex] = {
        ...updatedSells[sellIndex],
        price: updatedSells[sellIndex].price + sellPriceVariation,
        amount: 0.001 + Math.random() * 0.01,
        timestamp: Date.now(),
    };

    return {
        buys: updatedBuys.sort((a, b) => b.price - a.price),
        sells: updatedSells.sort((a, b) => a.price - b.price),
    };
};

export const updateTradesRealtime = (
    trades: Trade[],
    currentPrice: number
): Trade[] => {
    // Generate a new trade
    const priceVariation = (Math.random() - 0.5) * 0.01 * currentPrice;
    const price = currentPrice + priceVariation;
    const amount = 0.001 + Math.random() * 0.01;
    const type: OrderType = Math.random() > 0.5 ? 'buy' : 'sell';

    const newTrade: Trade = {
        id: `trade-${Date.now()}`,
        price,
        amount,
        type,
        timestamp: Date.now(),
    };

    // Add new trade to the beginning and remove the last one
    return [newTrade, ...trades.slice(0, -1)];
};