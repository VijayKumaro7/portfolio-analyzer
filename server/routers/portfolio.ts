import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { enforcePortfolioLimit, getPortfolioLimit } from "../_core/portfolioLimits";
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
   * Get all portfolios for the current user with limit info
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const portfolios = await getUserPortfolios(ctx.user.id);
    const limit = await getPortfolioLimit(ctx.user.id);
    const count = portfolios.length;

    return {
      portfolios,
      limit,
      count,
      canCreateMore: limit === -1 || count < limit,
    };
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
   * Create a new portfolio with limit enforcement
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Portfolio name is required"),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Enforce portfolio limit before creating
      await enforcePortfolioLimit(ctx.user.id);

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
        symbol: z.string().min(1, "Symbol is required"),
        name: z.string().min(1, "Asset name is required"),
        assetType: z.enum(["stock", "fund", "crypto"]),
        quantity: z.number().positive("Quantity must be positive"),
        purchasePrice: z.number().positive("Purchase price must be positive"),
        purchaseDate: z.string(),
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
        quantity: input.quantity.toString(),
        purchasePrice: input.purchasePrice.toString(),
        purchaseDate: new Date(input.purchaseDate),
      });
    }),

  /**
   * Update a holding
   */
  updateHolding: protectedProcedure
    .input(
      z.object({
        holdingId: z.number(),
        quantity: z.number().positive().optional(),
        purchasePrice: z.number().positive().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const holding = await getHoldingById(input.holdingId);
      if (!holding) {
        throw new Error("Holding not found");
      }

      const portfolio = await getPortfolioById(holding.portfolioId);
      if (!portfolio || portfolio.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      return updateHolding(input.holdingId, {
        quantity: input.quantity?.toString(),
        purchasePrice: input.purchasePrice?.toString(),
      });
    }),

  /**
   * Delete a holding
   */
  deleteHolding: protectedProcedure
    .input(z.object({ holdingId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const holding = await getHoldingById(input.holdingId);
      if (!holding) {
        throw new Error("Holding not found");
      }

      const portfolio = await getPortfolioById(holding.portfolioId);
      if (!portfolio || portfolio.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      return deleteHolding(input.holdingId);
    }),

  /**
   * Get holdings for a portfolio
   */
  getHoldings: protectedProcedure
    .input(z.object({ portfolioId: z.number() }))
    .query(async ({ input, ctx }) => {
      const portfolio = await getPortfolioById(input.portfolioId);
      if (!portfolio || portfolio.userId !== ctx.user.id) {
        throw new Error("Portfolio not found or unauthorized");
      }
      return getPortfolioHoldings(input.portfolioId);
    }),

  /**
   * Get price history for a holding
   */
  getPriceHistory: protectedProcedure
    .input(z.object({ holdingId: z.number() }))
    .query(async ({ input }) => {
      return getPriceHistory(input.holdingId);
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

  /**
   * Save metrics for a portfolio
   */
  saveMetrics: protectedProcedure
    .input(
      z.object({
        portfolioId: z.number(),
        totalValue: z.number(),
        totalCost: z.number(),
        totalReturn: z.number(),
        returnPercentage: z.number(),
        volatility: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const portfolio = await getPortfolioById(input.portfolioId);
      if (!portfolio || portfolio.userId !== ctx.user.id) {
        throw new Error("Portfolio not found or unauthorized");
      }

      return saveMetrics({
        portfolioId: input.portfolioId,
        totalValue: input.totalValue.toString(),
        totalCost: input.totalCost.toString(),
        totalReturn: input.totalReturn.toString(),
        returnPercentage: input.returnPercentage.toString(),
        volatility: input.volatility?.toString(),
      });
    }),
});
