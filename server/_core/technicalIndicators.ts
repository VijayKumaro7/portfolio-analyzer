/**
 * Technical indicators calculations for portfolio analysis
 */

export interface PriceDataPoint {
  date: Date;
  price: number;
}

export interface ChartDataPoint {
  date: string;
  price: number;
  sma20?: number;
  sma50?: number;
  ema12?: number;
  ema26?: number;
  macd?: number;
  signal?: number;
  histogram?: number;
}

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(prices: number[], period: number): (number | null)[] {
  const sma: (number | null)[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      sma.push(null);
    } else {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
  }

  return sma;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(prices: number[], period: number): (number | null)[] {
  const ema: (number | null)[] = [];
  const multiplier = 2 / (period + 1);

  // First EMA is the SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i];
  }
  let currentEMA = sum / period;
  ema[period - 1] = currentEMA;

  // Fill initial nulls
  for (let i = 0; i < period - 1; i++) {
    ema[i] = null;
  }

  // Calculate remaining EMAs
  for (let i = period; i < prices.length; i++) {
    currentEMA = (prices[i] - currentEMA) * multiplier + currentEMA;
    ema[i] = currentEMA;
  }

  return ema;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
  prices: number[]
): {
  macd: (number | null)[];
  signal: (number | null)[];
  histogram: (number | null)[];
} {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);

  const macd: (number | null)[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (ema12[i] !== null && ema26[i] !== null) {
      macd[i] = ema12[i]! - ema26[i]!;
    } else {
      macd[i] = null;
    }
  }

  const signal = calculateEMA(
    macd.filter((v) => v !== null) as number[],
    9
  );

  const histogram: (number | null)[] = [];
  let signalIndex = 0;
  for (let i = 0; i < macd.length; i++) {
    if (macd[i] !== null && signalIndex < signal.length) {
      if (signal[signalIndex] !== null) {
        histogram[i] = macd[i]! - signal[signalIndex]!;
        signalIndex++;
      } else {
        histogram[i] = null;
      }
    } else {
      histogram[i] = null;
    }
  }

  return { macd, signal, histogram };
}

/**
 * Calculate Relative Strength Index (RSI)
 */
export function calculateRSI(prices: number[], period: number = 14): (number | null)[] {
  const rsi: (number | null)[] = [];
  const changes: number[] = [];

  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  let gains = 0;
  let losses = 0;

  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      gains += changes[i];
    } else {
      losses += Math.abs(changes[i]);
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Fill initial nulls
  for (let i = 0; i < period; i++) {
    rsi.push(null);
  }

  // Calculate RSI
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    if (change > 0) {
      avgGain = (avgGain * (period - 1) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
    }

    const rs = avgGain / avgLoss;
    const currentRSI = 100 - 100 / (1 + rs);
    rsi.push(currentRSI);
  }

  return rsi;
}

/**
 * Generate chart data with technical indicators
 */
export function generateChartDataWithIndicators(
  priceData: PriceDataPoint[],
  indicators: {
    sma20?: boolean;
    sma50?: boolean;
    ema12?: boolean;
    ema26?: boolean;
    macd?: boolean;
  } = {}
): ChartDataPoint[] {
  const prices = priceData.map((p) => p.price);
  const chartData: ChartDataPoint[] = [];

  let sma20Data: (number | null)[] = [];
  let sma50Data: (number | null)[] = [];
  let ema12Data: (number | null)[] = [];
  let ema26Data: (number | null)[] = [];
  let macdData: { macd: (number | null)[]; signal: (number | null)[]; histogram: (number | null)[] } = { macd: [], signal: [], histogram: [] };

  if (indicators.sma20) {
    sma20Data = calculateSMA(prices, 20);
  }
  if (indicators.sma50) {
    sma50Data = calculateSMA(prices, 50);
  }
  if (indicators.ema12) {
    ema12Data = calculateEMA(prices, 12);
  }
  if (indicators.ema26) {
    ema26Data = calculateEMA(prices, 26);
  }
  if (indicators.macd) {
    macdData = calculateMACD(prices) as { macd: (number | null)[]; signal: (number | null)[]; histogram: (number | null)[] };
  }

  for (let i = 0; i < priceData.length; i++) {
    const point: ChartDataPoint = {
      date: priceData[i].date.toISOString().split("T")[0],
      price: priceData[i].price,
    };

    if (indicators.sma20 && sma20Data[i] !== null) {
      point.sma20 = sma20Data[i]!;
    }
    if (indicators.sma50 && sma50Data[i] !== null) {
      point.sma50 = sma50Data[i]!;
    }
    if (indicators.ema12 && ema12Data[i] !== null) {
      point.ema12 = ema12Data[i]!;
    }
    if (indicators.ema26 && ema26Data[i] !== null) {
      point.ema26 = ema26Data[i]!;
    }
    if (indicators.macd && macdData.macd[i] !== null) {
      point.macd = macdData.macd[i]!;
      point.signal = macdData.signal[i] || undefined;
      point.histogram = macdData.histogram[i] || undefined;
    }

    chartData.push(point);
  }

  return chartData;
}

/**
 * Generate mock historical price data for testing
 */
export function generateMockPriceHistory(
  startPrice: number = 100,
  days: number = 365,
  volatility: number = 0.02
): PriceDataPoint[] {
  const data: PriceDataPoint[] = [];
  let price = startPrice;

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));

    // Random walk with drift
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    const drift = 0.0005; // Small upward drift
    price = price * (1 + drift + randomChange);

    data.push({
      date,
      price: parseFloat(price.toFixed(2)),
    });
  }

  return data;
}

/**
 * Filter price data by date range
 */
export function filterPriceDataByDateRange(
  data: PriceDataPoint[],
  startDate: Date,
  endDate: Date
): PriceDataPoint[] {
  return data.filter((point) => point.date >= startDate && point.date <= endDate);
}
