import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getUserPortfolios,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  getPortfolioHoldings,
  createHolding,
  updateHolding,
  deleteHolding,
  getHoldingById,
  getPriceHistory,
  getLatestMetrics,
  saveMetrics,
} from "../db";

export const portfolioRouter = router({
  /**
   * Get all portfolios for the current user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    return getUserPortfolios(ctx.user.id);
  }),

  /**
   * Get a specific portfolio with its holdings
   */
  getWithHoldings: protectedProcedure
    .input(z.object({ portfolioId: z.number() }))
    .query(async ({ input, ctx }) => {
      const portfolio = await getPortfolioById(input.portfolioId);
      if (!portfolio || portfolio.userId !== ctx.user.id) {
        throw new Error("Portfolio not found or unauthorized");
      }
      const holdings = await getPortfolioHoldings(input.portfolioId);
      return { portfolio, holdings };
    }),

  /**
   * Create a new portfolio
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Portfolio name is required"),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return createPortfolio({
        userId: ctx.user.id,
        name: input.name,
        description: input.description,
      });
    }),

  /**
   * Update portfolio details
   */
  update: protectedProcedure
    .input(
      z.object({
        portfolioId: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const portfolio = await getPortfolioById(input.portfolioId);
      if (!portfolio || portfolio.userId !== ctx.user.id) {
        throw new Error("Portfolio not found or unauthorized");
      }
      return updatePortfolio(input.portfolioId, {
        name: input.name,
        description: input.description,
      });
    }),

  /**
   * Delete a portfolio
   */
  delete: protectedProcedure
    .input(z.object({ portfolioId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const portfolio = await getPortfolioById(input.portfolioId);
      if (!portfolio || portfolio.userId !== ctx.user.id) {
        throw new Error("Portfolio not found or unauthorized");
      }
      return deletePortfolio(input.portfolioId);
    }),

  /**
   * Add a holding to a portfolio
   */
  addHolding: protectedProcedure
    .input(
      z.object({
        portfolioId: z.number(),
        symbol: z.string().min(1),
        name: z.string().min(1),
        assetType: z.enum(["stock", "fund", "crypto"]),
        quantity: z.string().min(1),
        purchasePrice: z.string().min(1),
        purchaseDate: z.date(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const portfolio = await getPortfolioById(input.portfolioId);
      if (!portfolio || portfolio.userId !== ctx.user.id) {
        throw new Error("Portfolio not found or unauthorized");
      }
      return createHolding({
        portfolioId: input.portfolioId,
        symbol: input.symbol,
        name: input.name,
        assetType: input.assetType,
        quantity: input.quantity,
        purchasePrice: input.purchasePrice,
        purchaseDate: input.purchaseDate,
        notes: input.notes,
      });
    }),

  /**
   * Update a holding
   */
  updateHolding: protectedProcedure
    .input(
      z.object({
        holdingId: z.number(),
        portfolioId: z.number(),
        symbol: z.string().optional(),
        name: z.string().optional(),
        assetType: z.enum(["stock", "fund", "crypto"]).optional(),
        quantity: z.string().optional(),
        purchasePrice: z.string().optional(),
        purchaseDate: z.date().optional(),
        currentPrice: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const portfolio = await getPortfolioById(input.portfolioId);
      if (!portfolio || portfolio.userId !== ctx.user.id) {
        throw new Error("Portfolio not found or unauthorized");
      }
      const holding = await getHoldingById(input.holdingId);
      if (!holding || holding.portfolioId !== input.portfolioId) {
        throw new Error("Holding not found or unauthorized");
      }
      const { holdingId, portfolioId, ...updates } = input;
      return updateHolding(holdingId, updates);
    }),

  /**
   * Delete a holding
   */
  deleteHolding: protectedProcedure
    .input(
      z.object({
        holdingId: z.number(),
        portfolioId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const portfolio = await getPortfolioById(input.portfolioId);
      if (!portfolio || portfolio.userId !== ctx.user.id) {
        throw new Error("Portfolio not found or unauthorized");
      }
      const holding = await getHoldingById(input.holdingId);
      if (!holding || holding.portfolioId !== input.portfolioId) {
        throw new Error("Holding not found or unauthorized");
      }
      return deleteHolding(input.holdingId);
    }),

  /**
   * Get price history for a holding
   */
  getPriceHistory: protectedProcedure
    .input(
      z.object({
        holdingId: z.number(),
        portfolioId: z.number(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const portfolio = await getPortfolioById(input.portfolioId);
      if (!portfolio || portfolio.userId !== ctx.user.id) {
        throw new Error("Portfolio not found or unauthorized");
      }
      return getPriceHistory(input.holdingId, input.limit);
    }),

  /**
   * Get latest metrics for a portfolio
   */
  getMetrics: protectedProcedure
    .input(z.object({ portfolioId: z.number() }))
    .query(async ({ input, ctx }) => {
      const portfolio = await getPortfolioById(input.portfolioId);
      if (!portfolio || portfolio.userId !== ctx.user.id) {
        throw new Error("Portfolio not found or unauthorized");
      }
      return getLatestMetrics(input.portfolioId);
    }),
});
