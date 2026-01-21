import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getPortfolioById, getPortfolioHoldings } from "../db";
import {
  generateMockPriceHistory,
  generateChartDataWithIndicators,
  filterPriceDataByDateRange,
} from "../_core/technicalIndicators";

export const chartAnalysisRouter = router({
  /**
   * Get performance chart data with optional technical indicators
   */
  getPerformanceChartData: protectedProcedure
    .input(
      z.object({
        portfolioId: z.number(),
        dateRange: z.enum(["1M", "3M", "6M", "1Y", "ALL"]).default("1Y"),
        indicators: z.object({
            sma20: z.boolean().optional().default(false),
            sma50: z.boolean().optional().default(false),
            ema12: z.boolean().optional().default(false),
            ema26: z.boolean().optional().default(false),
            macd: z.boolean().optional().default(false),
          }).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const portfolio = await getPortfolioById(input.portfolioId);
      if (!portfolio || portfolio.userId !== ctx.user.id) {
        throw new Error("Portfolio not found or unauthorized");
      }

      // Generate mock price history (in production, fetch from database)
      const priceHistory = generateMockPriceHistory(10000, 365, 0.015);

      // Filter by date range
      let filteredData = priceHistory;
      const now = new Date();
      let startDate = new Date();

      switch (input.dateRange) {
        case "1M":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "3M":
          startDate.setMonth(now.getMonth() - 3);
          break;
        case "6M":
          startDate.setMonth(now.getMonth() - 6);
          break;
        case "1Y":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        case "ALL":
          startDate = priceHistory[0].date;
          break;
      }

      filteredData = filterPriceDataByDateRange(priceHistory, startDate, now);

      // Generate chart data with indicators
      const chartData = generateChartDataWithIndicators(filteredData, input.indicators || {});

      // Calculate statistics
      const prices = filteredData.map((p) => p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const currentPrice = prices[prices.length - 1];
      const startPrice = prices[0];
      const returnPercentage = ((currentPrice - startPrice) / startPrice) * 100;

      return {
        chartData,
        statistics: {
          currentPrice: currentPrice.toFixed(2),
          minPrice: minPrice.toFixed(2),
          maxPrice: maxPrice.toFixed(2),
          avgPrice: avgPrice.toFixed(2),
          returnPercentage: returnPercentage.toFixed(2),
          startPrice: startPrice.toFixed(2),
        },
      };
    }),

  /**
   * Get individual asset performance chart data
   */
  getAssetPerformanceChart: protectedProcedure
    .input(
      z.object({
        portfolioId: z.number(),
        holdingId: z.number(),
        dateRange: z.enum(["1M", "3M", "6M", "1Y", "ALL"]).default("1Y"),
        indicators: z.object({
            sma20: z.boolean().optional().default(false),
            sma50: z.boolean().optional().default(false),
            ema12: z.boolean().optional().default(false),
            ema26: z.boolean().optional().default(false),
            macd: z.boolean().optional().default(false),
          }).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const portfolio = await getPortfolioById(input.portfolioId);
      if (!portfolio || portfolio.userId !== ctx.user.id) {
        throw new Error("Portfolio not found or unauthorized");
      }

      // Generate mock price history for the holding
      const priceHistory = generateMockPriceHistory(100, 365, 0.02);

      // Filter by date range
      let filteredData = priceHistory;
      const now = new Date();
      let startDate = new Date();

      switch (input.dateRange) {
        case "1M":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "3M":
          startDate.setMonth(now.getMonth() - 3);
          break;
        case "6M":
          startDate.setMonth(now.getMonth() - 6);
          break;
        case "1Y":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        case "ALL":
          startDate = priceHistory[0].date;
          break;
      }

      filteredData = filterPriceDataByDateRange(priceHistory, startDate, now);

      // Generate chart data with indicators
      const chartData = generateChartDataWithIndicators(filteredData, input.indicators || {});

      // Calculate statistics
      const prices = filteredData.map((p) => p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const currentPrice = prices[prices.length - 1];
      const startPrice = prices[0];
      const returnPercentage = ((currentPrice - startPrice) / startPrice) * 100;

      // Calculate volatility (standard deviation)
      const mean = avgPrice;
      const variance =
        prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) /
        prices.length;
      const volatility = Math.sqrt(variance);

      return {
        chartData,
        statistics: {
          currentPrice: currentPrice.toFixed(2),
          minPrice: minPrice.toFixed(2),
          maxPrice: maxPrice.toFixed(2),
          avgPrice: avgPrice.toFixed(2),
          returnPercentage: returnPercentage.toFixed(2),
          startPrice: startPrice.toFixed(2),
          volatility: volatility.toFixed(2),
        },
      };
    }),

  /**
   * Get available date ranges
   */
  getDateRanges: protectedProcedure.query(() => {
    return [
      { label: "1 Month", value: "1M" },
      { label: "3 Months", value: "3M" },
      { label: "6 Months", value: "6M" },
      { label: "1 Year", value: "1Y" },
      { label: "All Time", value: "ALL" },
    ];
  }),

  /**
   * Get available technical indicators
   */
  getAvailableIndicators: protectedProcedure.query(() => {
    return [
      {
        id: "sma20",
        name: "SMA 20",
        description: "Simple Moving Average (20 days)",
        color: "oklch(0.577 0.245 27.325)",
      },
      {
        id: "sma50",
        name: "SMA 50",
        description: "Simple Moving Average (50 days)",
        color: "oklch(0.577 0.245 142.495)",
      },
      {
        id: "ema12",
        name: "EMA 12",
        description: "Exponential Moving Average (12 days)",
        color: "oklch(0.704 0.191 22.216)",
      },
      {
        id: "ema26",
        name: "EMA 26",
        description: "Exponential Moving Average (26 days)",
        color: "oklch(0.552 0.016 285.938)",
      },
      {
        id: "macd",
        name: "MACD",
        description: "Moving Average Convergence Divergence",
        color: "oklch(0.623 0.214 259.815)",
      },
    ];
  }),
});
