import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

// Create a public context for demo mode testing
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Demo Mode Router", () => {
  const ctx = createPublicContext();
  const caller = appRouter.createCaller(ctx);

  it("should fetch demo users", async () => {
    const users = await caller.demoMode.getDemoUsers();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
    expect(users[0]).toHaveProperty("name");
    expect(users[0]).toHaveProperty("email");
    expect(users[0]).toHaveProperty("portfolios");
  });

  it("should fetch demo portfolios", async () => {
    const portfolios = await caller.demoMode.getDemoPortfolios();
    expect(Array.isArray(portfolios)).toBe(true);
    expect(portfolios.length).toBeGreaterThan(0);
    expect(portfolios[0]).toHaveProperty("name");
    expect(portfolios[0]).toHaveProperty("holdings");
  });

  it("should fetch specific demo portfolio", async () => {
    // First get all portfolios
    const portfolios = await caller.demoMode.getDemoPortfolios();
    expect(portfolios.length).toBeGreaterThan(0);

    const firstPortfolioId = portfolios[0].id;

    // Then fetch specific portfolio
    const portfolio = await caller.demoMode.getDemoPortfolio({
      portfolioId: firstPortfolioId,
    });

    expect(portfolio).not.toBeNull();
    expect(portfolio?.portfolio.id).toBe(firstPortfolioId);
    expect(portfolio?.holdings).toBeDefined();
    expect(Array.isArray(portfolio?.holdings)).toBe(true);
  });

  it("should return null for non-existent portfolio", async () => {
    const portfolio = await caller.demoMode.getDemoPortfolio({
      portfolioId: 99999,
    });
    expect(portfolio).toBeNull();
  });

  it("should fetch portfolio statistics", async () => {
    // Get first demo portfolio
    const portfolios = await caller.demoMode.getDemoPortfolios();
    expect(portfolios.length).toBeGreaterThan(0);

    const firstPortfolioId = portfolios[0].id;

    // Fetch stats
    const stats = await caller.demoMode.getDemoPortfolioStats({
      portfolioId: firstPortfolioId,
    });

    expect(stats).toHaveProperty("totalHoldings");
    expect(stats).toHaveProperty("assetTypes");
    expect(stats).toHaveProperty("totalValue");
    expect(stats).toHaveProperty("totalCost");
    expect(stats).toHaveProperty("gainLoss");
    expect(stats).toHaveProperty("gainLossPercent");

    expect(typeof stats.totalHoldings).toBe("number");
    expect(stats.totalHoldings).toBeGreaterThanOrEqual(0);
    expect(typeof stats.totalValue).toBe("number");
    expect(typeof stats.gainLoss).toBe("number");
  });

  it("should fetch holding price history", async () => {
    // Get first demo portfolio with holdings
    const portfolios = await caller.demoMode.getDemoPortfolios();
    expect(portfolios.length).toBeGreaterThan(0);

    const firstPortfolio = portfolios[0];
    expect(firstPortfolio.holdings.length).toBeGreaterThan(0);

    const firstHolding = firstPortfolio.holdings[0];

    // Fetch price history
    const history = await caller.demoMode.getDemoHoldingPriceHistory({
      holdingId: firstHolding.id,
      days: 30,
    });

    expect(Array.isArray(history)).toBe(true);
    // Should have some history data
    if (history.length > 0) {
      expect(history[0]).toHaveProperty("price");
      expect(history[0]).toHaveProperty("date");
      expect(history[0]).toHaveProperty("symbol");
    }
  });

  it("should handle invalid holding ID gracefully", async () => {
    const history = await caller.demoMode.getDemoHoldingPriceHistory({
      holdingId: 99999,
      days: 30,
    });

    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBe(0);
  });

  it("should return empty stats for portfolio with no holdings", async () => {
    const stats = await caller.demoMode.getDemoPortfolioStats({
      portfolioId: 99999,
    });

    expect(stats.totalHoldings).toBe(0);
    expect(stats.totalValue).toBe(0);
    expect(stats.totalCost).toBe(0);
  });

  it("demo users should have demo-prefixed openIds", async () => {
    const users = await caller.demoMode.getDemoUsers();
    expect(users.length).toBeGreaterThan(0);

    users.forEach((user) => {
      expect(user.openId).toMatch(/^demo-/);
    });
  });

  it("demo portfolios should belong to demo users", async () => {
    const portfolios = await caller.demoMode.getDemoPortfolios();
    expect(portfolios.length).toBeGreaterThan(0);

    portfolios.forEach((portfolio) => {
      expect(portfolio.user).toBeDefined();
      expect(portfolio.user?.openId).toMatch(/^demo-/);
    });
  });
});
