import axios from "axios";

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query";

// Cache to store API responses with timestamps
const priceCache = new Map<
  string,
  { price: number; timestamp: number; symbol: string }
>();
const CACHE_DURATION = 60000; // 1 minute

export interface PriceData {
  symbol: string;
  price: number;
  timestamp: Date;
  change?: number;
  changePercent?: string;
}

export interface TimeSeriesData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Fetch current stock price from Alpha Vantage
 */
export async function getStockPrice(symbol: string): Promise<PriceData | null> {
  try {
    if (!ALPHA_VANTAGE_API_KEY) {
      console.warn("[MarketData] Alpha Vantage API key not configured");
      return null;
    }

    // Check cache first
    const cached = priceCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return {
        symbol: cached.symbol,
        price: cached.price,
        timestamp: new Date(cached.timestamp),
      };
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: "GLOBAL_QUOTE",
        symbol: symbol.toUpperCase(),
        apikey: ALPHA_VANTAGE_API_KEY,
      },
      timeout: 10000,
    });

    const quote = response.data["Global Quote"];

    if (!quote || !quote["05. price"]) {
      console.warn(`[MarketData] No data found for symbol: ${symbol}`);
      return null;
    }

    const price = parseFloat(quote["05. price"]);
    const change = parseFloat(quote["09. change"] || "0");
    const changePercent = quote["10. change percent"] || "0%";

    // Cache the result
    priceCache.set(symbol, {
      price,
      timestamp: Date.now(),
      symbol: symbol.toUpperCase(),
    });

    return {
      symbol: symbol.toUpperCase(),
      price,
      timestamp: new Date(),
      change,
      changePercent,
    };
  } catch (error) {
    console.error(`[MarketData] Error fetching price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch cryptocurrency price from Alpha Vantage
 */
export async function getCryptoPrice(
  symbol: string,
  market: string = "USD"
): Promise<PriceData | null> {
  try {
    if (!ALPHA_VANTAGE_API_KEY) {
      console.warn("[MarketData] Alpha Vantage API key not configured");
      return null;
    }

    const cacheKey = `${symbol}-${market}`;

    // Check cache first
    const cached = priceCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return {
        symbol: cached.symbol,
        price: cached.price,
        timestamp: new Date(cached.timestamp),
      };
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: "CURRENCY_EXCHANGE_RATE",
        from_currency: symbol.toUpperCase(),
        to_currency: market.toUpperCase(),
        apikey: ALPHA_VANTAGE_API_KEY,
      },
      timeout: 10000,
    });

    const exchangeRate = response.data["Realtime Currency Exchange Rate"];

    if (!exchangeRate || !exchangeRate["5. Exchange Rate"]) {
      console.warn(`[MarketData] No data found for crypto: ${symbol}`);
      return null;
    }

    const price = parseFloat(exchangeRate["5. Exchange Rate"]);

    // Cache the result
    priceCache.set(cacheKey, {
      price,
      timestamp: Date.now(),
      symbol: `${symbol.toUpperCase()}/${market.toUpperCase()}`,
    });

    return {
      symbol: `${symbol.toUpperCase()}/${market.toUpperCase()}`,
      price,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error(`[MarketData] Error fetching crypto price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch daily time series data for a stock
 */
export async function getStockTimeSeries(
  symbol: string,
  outputSize: "compact" | "full" = "compact"
): Promise<TimeSeriesData[] | null> {
  try {
    if (!ALPHA_VANTAGE_API_KEY) {
      console.warn("[MarketData] Alpha Vantage API key not configured");
      return null;
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: "TIME_SERIES_DAILY",
        symbol: symbol.toUpperCase(),
        outputsize: outputSize,
        apikey: ALPHA_VANTAGE_API_KEY,
      },
      timeout: 10000,
    });

    const timeSeries = response.data["Time Series (Daily)"];

    if (!timeSeries) {
      console.warn(`[MarketData] No time series data found for symbol: ${symbol}`);
      return null;
    }

    const data: TimeSeriesData[] = Object.entries(timeSeries)
      .slice(0, 100) // Limit to 100 data points
      .map(([date, values]: [string, any]) => ({
        date,
        open: parseFloat(values["1. open"]),
        high: parseFloat(values["2. high"]),
        low: parseFloat(values["3. low"]),
        close: parseFloat(values["4. close"]),
        volume: parseInt(values["5. volume"]),
      }))
      .reverse(); // Reverse to get chronological order

    return data;
  } catch (error) {
    console.error(
      `[MarketData] Error fetching time series for ${symbol}:`,
      error
    );
    return null;
  }
}

/**
 * Fetch intraday time series data for a stock
 */
export async function getStockIntradayTimeSeries(
  symbol: string,
  interval: "1min" | "5min" | "15min" | "30min" | "60min" = "60min"
): Promise<TimeSeriesData[] | null> {
  try {
    if (!ALPHA_VANTAGE_API_KEY) {
      console.warn("[MarketData] Alpha Vantage API key not configured");
      return null;
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: "TIME_SERIES_INTRADAY",
        symbol: symbol.toUpperCase(),
        interval,
        apikey: ALPHA_VANTAGE_API_KEY,
      },
      timeout: 10000,
    });

    const timeSeries = response.data[`Time Series (${interval})`];

    if (!timeSeries) {
      console.warn(
        `[MarketData] No intraday data found for symbol: ${symbol}`
      );
      return null;
    }

    const data: TimeSeriesData[] = Object.entries(timeSeries)
      .slice(0, 100)
      .map(([date, values]: [string, any]) => ({
        date,
        open: parseFloat(values["1. open"]),
        high: parseFloat(values["2. high"]),
        low: parseFloat(values["3. low"]),
        close: parseFloat(values["4. close"]),
        volume: parseInt(values["5. volume"]),
      }))
      .reverse();

    return data;
  } catch (error) {
    console.error(
      `[MarketData] Error fetching intraday data for ${symbol}:`,
      error
    );
    return null;
  }
}

/**
 * Fetch multiple stock prices in batch
 */
export async function getStockPricesBatch(
  symbols: string[]
): Promise<PriceData[]> {
  const results = await Promise.all(
    symbols.map((symbol) => getStockPrice(symbol))
  );
  return results.filter((result) => result !== null) as PriceData[];
}

/**
 * Clear the price cache
 */
export function clearPriceCache(): void {
  priceCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; entries: string[] } {
  return {
    size: priceCache.size,
    entries: Array.from(priceCache.keys()),
  };
}
