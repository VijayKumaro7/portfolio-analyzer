import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  getStockPrice,
  getCryptoPrice,
  getStockTimeSeries,
  getStockPricesBatch,
} from "../_core/marketData";

export const marketDataRouter = router({
  /**
   * Get current stock price
   */
  getStockPrice: publicProcedure
    .input(
      z.object({
        symbol: z.string().min(1).max(10),
      })
    )
    .query(async ({ input }) => {
      const priceData = await getStockPrice(input.symbol);
      return priceData;
    }),

  /**
   * Get cryptocurrency price
   */
  getCryptoPrice: publicProcedure
    .input(
      z.object({
        symbol: z.string().min(1).max(10),
        market: z.string().min(1).max(10).default("USD"),
      })
    )
    .query(async ({ input }) => {
      const priceData = await getCryptoPrice(input.symbol, input.market);
      return priceData;
    }),

  /**
   * Get stock time series data
   */
  getStockTimeSeries: publicProcedure
    .input(
      z.object({
        symbol: z.string().min(1).max(10),
        outputSize: z.enum(["compact", "full"]).default("compact"),
      })
    )
    .query(async ({ input }) => {
      const timeSeries = await getStockTimeSeries(
        input.symbol,
        input.outputSize
      );
      return timeSeries;
    }),

  /**
   * Get multiple stock prices in batch
   */
  getStockPricesBatch: publicProcedure
    .input(
      z.object({
        symbols: z.array(z.string().min(1).max(10)).min(1).max(20),
      })
    )
    .query(async ({ input }) => {
      const prices = await getStockPricesBatch(input.symbols);
      return prices;
    }),

  /**
   * Get portfolio holdings prices
   */
  getPortfolioHoldingsPrices: publicProcedure
    .input(
      z.object({
        holdings: z.array(
          z.object({
            symbol: z.string(),
            type: z.enum(["stock", "crypto", "fund"]),
          })
        ),
      })
    )
    .query(async ({ input }) => {
      const prices = await Promise.all(
        input.holdings.map(async (holding) => {
          if (holding.type === "crypto") {
            return await getCryptoPrice(holding.symbol);
          } else {
            // Stocks and funds use the same endpoint
            return await getStockPrice(holding.symbol);
          }
        })
      );

      return prices.filter((p) => p !== null);
    }),

  /**
   * Get historical price data for a holding
   */
  getHoldingHistoricalData: publicProcedure
    .input(
      z.object({
        symbol: z.string().min(1).max(10),
        type: z.enum(["stock", "crypto", "fund"]),
        days: z.number().int().min(1).max(365).default(30),
      })
    )
    .query(async ({ input }) => {
      if (input.type === "crypto") {
        // For crypto, we can use daily data from the market data service
        // but Alpha Vantage doesn't have direct crypto daily data
        // We'll return null for now and can be extended
        return null;
      }

      const timeSeries = await getStockTimeSeries(input.symbol, "compact");

      if (!timeSeries) {
        return null;
      }

      // Limit to requested number of days
      const limitedData = timeSeries.slice(0, input.days);

      return {
        symbol: input.symbol,
        type: input.type,
        data: limitedData,
        count: limitedData.length,
      };
    }),
});
