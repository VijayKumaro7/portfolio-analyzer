import { describe, expect, it } from "vitest";
import {
  calculateSMA,
  calculateEMA,
  calculateMACD,
  calculateRSI,
  generateMockPriceHistory,
  filterPriceDataByDateRange,
} from "./technicalIndicators";

describe("Technical Indicators", () => {
  describe("calculateSMA", () => {
    it("should calculate simple moving average correctly", () => {
      const prices = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const sma = calculateSMA(prices, 3);

      expect(sma[0]).toBeNull();
      expect(sma[1]).toBeNull();
      expect(sma[2]).toBe(2); // (1+2+3)/3
      expect(sma[3]).toBe(3); // (2+3+4)/3
      expect(sma[9]).toBe(9); // (8+9+10)/3
    });

    it("should return nulls for period smaller than window", () => {
      const prices = [1, 2, 3];
      const sma = calculateSMA(prices, 5);

      expect(sma[0]).toBeNull();
      expect(sma[1]).toBeNull();
      expect(sma[2]).toBeNull();
      expect(sma.length).toBe(3);
    });

    it("should handle single element", () => {
      const prices = [100];
      const sma = calculateSMA(prices, 1);

      expect(sma[0]).toBe(100);
    });
  });

  describe("calculateEMA", () => {
    it("should calculate exponential moving average", () => {
      const prices = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const ema = calculateEMA(prices, 3);

      // First EMA should be SMA
      expect(ema[2]).toBe(2); // (1+2+3)/3
      // Subsequent values should be calculated
      expect(ema[3]).not.toBeNull();
      expect(ema[3]).toBeGreaterThan(2);
    });

    it("should return nulls before period", () => {
      const prices = [1, 2, 3, 4, 5];
      const ema = calculateEMA(prices, 3);

      expect(ema[0]).toBeNull();
      expect(ema[1]).toBeNull();
      expect(ema[2]).not.toBeNull();
    });
  });

  describe("calculateMACD", () => {
    it("should calculate MACD values", () => {
      const prices = Array.from({ length: 50 }, (_, i) => i + 1);
      const { macd, signal, histogram } = calculateMACD(prices);

      expect(macd.length).toBe(prices.length);
      expect(signal.length).toBeGreaterThan(0);
      expect(histogram.length).toBeGreaterThan(0);

      // MACD should have some non-null values
      const nonNullMacd = macd.filter((v) => v !== null);
      expect(nonNullMacd.length).toBeGreaterThan(0);
    });
  });

  describe("calculateRSI", () => {
    it("should calculate RSI values", () => {
      const prices = Array.from({ length: 30 }, (_, i) => 100 + i * 0.5);
      const rsi = calculateRSI(prices, 14);

      expect(rsi.length).toBe(prices.length - 1);

      // RSI should be between 0 and 100
      const nonNullRsi = rsi.filter((v) => v !== null);
      nonNullRsi.forEach((value) => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      });
    });

    it("should return nulls before period", () => {
      const prices = Array.from({ length: 20 }, (_, i) => i + 1);
      const rsi = calculateRSI(prices, 14);

      for (let i = 0; i < 14; i++) {
        expect(rsi[i]).toBeNull();
      }
    });
  });

  describe("generateMockPriceHistory", () => {
    it("should generate correct number of data points", () => {
      const data = generateMockPriceHistory(100, 30, 0.02);

      expect(data.length).toBe(30);
    });

    it("should generate prices close to start price", () => {
      const startPrice = 100;
      const data = generateMockPriceHistory(startPrice, 100, 0.01);

      const prices = data.map((p) => p.price);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

      // Average should be reasonably close to start price
      expect(avgPrice).toBeGreaterThan(startPrice * 0.8);
      expect(avgPrice).toBeLessThan(startPrice * 1.2);
    });

    it("should generate dates in ascending order", () => {
      const data = generateMockPriceHistory(100, 30, 0.02);

      for (let i = 1; i < data.length; i++) {
        expect(data[i].date.getTime()).toBeGreaterThan(
          data[i - 1].date.getTime()
        );
      }
    });
  });

  describe("filterPriceDataByDateRange", () => {
    it("should filter data by date range", () => {
      const data = generateMockPriceHistory(100, 100, 0.02);
      const startDate = new Date(data[20].date);
      const endDate = new Date(data[80].date);

      const filtered = filterPriceDataByDateRange(data, startDate, endDate);

      expect(filtered.length).toBeLessThan(data.length);
      filtered.forEach((point) => {
        expect(point.date.getTime()).toBeGreaterThanOrEqual(
          startDate.getTime()
        );
        expect(point.date.getTime()).toBeLessThanOrEqual(endDate.getTime());
      });
    });

    it("should return empty array if no data in range", () => {
      const data = generateMockPriceHistory(100, 30, 0.02);
      const futureStart = new Date();
      futureStart.setFullYear(futureStart.getFullYear() + 1);
      const futureEnd = new Date(futureStart);
      futureEnd.setMonth(futureEnd.getMonth() + 1);

      const filtered = filterPriceDataByDateRange(data, futureStart, futureEnd);

      expect(filtered.length).toBe(0);
    });
  });
});
