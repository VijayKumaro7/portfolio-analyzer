import { describe, expect, it, beforeEach, vi } from "vitest";
import axios from "axios";
import {
  getStockPrice,
  getCryptoPrice,
  getStockTimeSeries,
  clearPriceCache,
  getCacheStats,
} from "./marketData";

// Mock axios
vi.mock("axios");
const mockedAxios = axios as any;

describe("Market Data Service", () => {
  beforeEach(() => {
    clearPriceCache();
    vi.clearAllMocks();
  });

  describe("getStockPrice", () => {
    it("should fetch stock price successfully", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          "Global Quote": {
            "05. price": "150.25",
            "09. change": "2.50",
            "10. change percent": "1.69%",
          },
        },
      });

      const result = await getStockPrice("AAPL");

      expect(result).not.toBeNull();
      expect(result?.symbol).toBe("AAPL");
      expect(result?.price).toBe(150.25);
      expect(result?.change).toBe(2.5);
    });

    it("should return null when API key is not configured", async () => {
      // Temporarily remove API key
      const originalKey = process.env.ALPHA_VANTAGE_API_KEY;
      delete process.env.ALPHA_VANTAGE_API_KEY;

      const result = await getStockPrice("AAPL");

      expect(result).toBeNull();

      // Restore API key
      if (originalKey) {
        process.env.ALPHA_VANTAGE_API_KEY = originalKey;
      }
    });

    it("should return null when API returns no data", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          "Global Quote": {},
        },
      });

      const result = await getStockPrice("INVALID");

      expect(result).toBeNull();
    });

    it("should cache results", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          "Global Quote": {
            "05. price": "150.25",
            "09. change": "2.50",
            "10. change percent": "1.69%",
          },
        },
      });

      // First call
      const result1 = await getStockPrice("AAPL");
      expect(result1?.price).toBe(150.25);

      // Second call should use cache
      const result2 = await getStockPrice("AAPL");
      expect(result2?.price).toBe(150.25);

      // Should only call API once
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it("should handle API errors gracefully", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network error"));

      const result = await getStockPrice("AAPL");

      expect(result).toBeNull();
    });
  });

  describe("getCryptoPrice", () => {
    it("should fetch cryptocurrency price successfully", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          "Realtime Currency Exchange Rate": {
            "5. Exchange Rate": "42500.50",
          },
        },
      });

      const result = await getCryptoPrice("BTC", "USD");

      expect(result).not.toBeNull();
      expect(result?.symbol).toBe("BTC/USD");
      expect(result?.price).toBe(42500.5);
    });

    it("should return null when no crypto data found", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          "Realtime Currency Exchange Rate": {},
        },
      });

      const result = await getCryptoPrice("INVALID", "USD");

      expect(result).toBeNull();
    });

    it("should cache crypto prices", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          "Realtime Currency Exchange Rate": {
            "5. Exchange Rate": "42500.50",
          },
        },
      });

      const result1 = await getCryptoPrice("BTC", "USD");
      const result2 = await getCryptoPrice("BTC", "USD");

      expect(result1?.price).toBe(42500.5);
      expect(result2?.price).toBe(42500.5);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getStockTimeSeries", () => {
    it("should fetch time series data successfully", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          "Time Series (Daily)": {
            "2026-01-21": {
              "1. open": "150.00",
              "2. high": "152.00",
              "3. low": "149.50",
              "4. close": "151.50",
              "5. volume": "1000000",
            },
            "2026-01-20": {
              "1. open": "148.00",
              "2. high": "150.00",
              "3. low": "147.50",
              "4. close": "150.00",
              "5. volume": "950000",
            },
          },
        },
      });

      const result = await getStockTimeSeries("AAPL");

      expect(result).not.toBeNull();
      expect(result?.length).toBe(2);
      expect(result?.[0].date).toBe("2026-01-20");
      expect(result?.[0].close).toBe(150.0);
      expect(result?.[1].date).toBe("2026-01-21");
      expect(result?.[1].close).toBe(151.5);
    });

    it("should return null when no time series data found", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {},
      });

      const result = await getStockTimeSeries("INVALID");

      expect(result).toBeNull();
    });

    it("should limit results to 100 data points", async () => {
      const timeSeriesData: Record<string, any> = {};
      for (let i = 0; i < 200; i++) {
        const date = new Date(2026, 0, 1 + i).toISOString().split("T")[0];
        timeSeriesData[date] = {
          "1. open": "150.00",
          "2. high": "152.00",
          "3. low": "149.50",
          "4. close": "151.50",
          "5. volume": "1000000",
        };
      }

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          "Time Series (Daily)": timeSeriesData,
        },
      });

      const result = await getStockTimeSeries("AAPL");

      expect(result?.length).toBeLessThanOrEqual(100);
    });
  });

  describe("Cache Management", () => {
    it("should track cache statistics", async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          "Global Quote": {
            "05. price": "150.25",
            "09. change": "2.50",
            "10. change percent": "1.69%",
          },
        },
      });

      await getStockPrice("AAPL");
      await getStockPrice("GOOGL");

      const stats = getCacheStats();
      expect(stats.size).toBe(2);
      expect(stats.entries).toContain("AAPL");
      expect(stats.entries).toContain("GOOGL");
    });

    it("should clear cache", async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          "Global Quote": {
            "05. price": "150.25",
            "09. change": "2.50",
            "10. change percent": "1.69%",
          },
        },
      });

      await getStockPrice("AAPL");
      let stats = getCacheStats();
      expect(stats.size).toBe(1);

      clearPriceCache();
      stats = getCacheStats();
      expect(stats.size).toBe(0);
    });
  });
});
