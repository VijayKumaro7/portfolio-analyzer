import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { portfolios, holdings, priceHistory, users } from "../../drizzle/schema";
import { eq, like, inArray, or } from "drizzle-orm";
import { z } from "zod";

/**
 * Demo mode router - provides public access to demo portfolios
 * without requiring authentication
 */
export const demoModeRouter = router({
  /**
   * Get all demo portfolios with their holdings
   */
  getDemoPortfolios: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    try {
      // Get demo users
      const demoUsers = await db
        .select()
        .from(users)
        .where(like(users.openId, "demo-%"));

      if (demoUsers.length === 0) {
        return [];
      }

      const userIds = demoUsers.map((u) => u.id);

      // Get portfolios for demo users
      const demoPortfolios = await db
        .select()
        .from(portfolios)
        .where(inArray(portfolios.userId, userIds));

      // Get holdings for each portfolio
      const portfolioWithHoldings = await Promise.all(
        demoPortfolios.map(async (portfolio) => {
          const portfolioHoldings = await db
            .select()
            .from(holdings)
            .where(eq(holdings.portfolioId, portfolio.id));

          return {
            ...portfolio,
            holdings: portfolioHoldings,
            user: demoUsers.find((u) => u.id === portfolio.userId),
          };
        })
      );

      return portfolioWithHoldings;
    } catch (error) {
      console.error("[DemoMode] Error fetching demo portfolios:", error);
      return [];
    }
  }),

  /**
   * Get a specific demo portfolio with all details
   */
  getDemoPortfolio: publicProcedure
    .input(z.object({ portfolioId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        const portfolio = await db
          .select()
          .from(portfolios)
          .where(eq(portfolios.id, input.portfolioId));

        if (portfolio.length === 0) {
          return null;
        }

        const portfolioData = portfolio[0];

        // Verify it's a demo portfolio
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, portfolioData.userId));

        if (user.length === 0 || !user[0].openId.startsWith("demo-")) {
          throw new Error("Not a demo portfolio");
        }

        // Get holdings
        const portfolioHoldings = await db
          .select()
          .from(holdings)
          .where(eq(holdings.portfolioId, input.portfolioId));

        return {
          portfolio: portfolioData,
          holdings: portfolioHoldings,
          user: user[0],
        };
      } catch (error) {
        console.error("[DemoMode] Error fetching demo portfolio:", error);
        return null;
      }
    }),

  /**
   * Get price history for a demo holding
   */
  getDemoHoldingPriceHistory: publicProcedure
    .input(z.object({ holdingId: z.number(), days: z.number().default(30) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        // Verify the holding exists
        const holding = await db
          .select()
          .from(holdings)
          .where(eq(holdings.id, input.holdingId));

        if (holding.length === 0) {
          return [];
        }

        // Get price history
        const history = await db
          .select()
          .from(priceHistory)
          .where(eq(priceHistory.holdingId, input.holdingId));

        // Return last N days
        return history.slice(-input.days);
      } catch (error) {
        console.error("[DemoMode] Error fetching price history:", error);
        return [];
      }
    }),

  /**
   * Get demo portfolio statistics
   */
  getDemoPortfolioStats: publicProcedure
    .input(z.object({ portfolioId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        const portfolioHoldings = await db
          .select()
          .from(holdings)
          .where(eq(holdings.portfolioId, input.portfolioId));

        if (portfolioHoldings.length === 0) {
          return {
            totalHoldings: 0,
            assetTypes: [],
            totalValue: 0,
            totalCost: 0,
            gainLoss: 0,
            gainLossPercent: 0,
          };
        }

        // Calculate statistics
        const assetTypes = new Set(portfolioHoldings.map((h) => h.assetType));
        let totalCost = 0;
        let totalValue = 0;

        for (const holding of portfolioHoldings) {
          const cost =
            parseFloat(holding.quantity) * parseFloat(holding.purchasePrice);
          totalCost += cost;

          // Use current price if available, otherwise use purchase price
          const currentPrice = holding.currentPrice
            ? parseFloat(holding.currentPrice)
            : parseFloat(holding.purchasePrice);
          const value = parseFloat(holding.quantity) * currentPrice;
          totalValue += value;
        }

        const gainLoss = totalValue - totalCost;
        const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

        return {
          totalHoldings: portfolioHoldings.length,
          assetTypes: Array.from(assetTypes),
          totalValue: parseFloat(totalValue.toFixed(2)),
          totalCost: parseFloat(totalCost.toFixed(2)),
          gainLoss: parseFloat(gainLoss.toFixed(2)),
          gainLossPercent: parseFloat(gainLossPercent.toFixed(2)),
        };
      } catch (error) {
        console.error("[DemoMode] Error calculating stats:", error);
        return {
          totalHoldings: 0,
          assetTypes: [],
          totalValue: 0,
          totalCost: 0,
          gainLoss: 0,
          gainLossPercent: 0,
        };
      }
    }),

  /**
   * Get all demo users with their portfolios
   */
  getDemoUsers: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    try {
      const demoUsers = await db
        .select()
        .from(users)
        .where(like(users.openId, "demo-%"));

      const usersWithPortfolios = await Promise.all(
        demoUsers.map(async (user) => {
          const userPortfolios = await db
            .select()
            .from(portfolios)
            .where(eq(portfolios.userId, user.id));

          return {
            ...user,
            portfolios: userPortfolios,
          };
        })
      );

      return usersWithPortfolios;
    } catch (error) {
      console.error("[DemoMode] Error fetching demo users:", error);
      return [];
    }
  }),
});

export type DemoModeRouter = typeof demoModeRouter;
