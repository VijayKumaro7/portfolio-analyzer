import { describe, expect, it, beforeEach, vi } from "vitest";
import { portfolioRouter } from "./portfolio";
import type { TrpcContext } from "../_core/context";
import type { User } from "../../drizzle/schema";

// Mock the database functions
vi.mock("../db", () => ({
  getUserPortfolios: vi.fn(),
  getPortfolioById: vi.fn(),
  createPortfolio: vi.fn(),
  updatePortfolio: vi.fn(),
  deletePortfolio: vi.fn(),
  getPortfolioHoldings: vi.fn(),
  createHolding: vi.fn(),
  updateHolding: vi.fn(),
  deleteHolding: vi.fn(),
  getHoldingById: vi.fn(),
  getPriceHistory: vi.fn(),
  getLatestMetrics: vi.fn(),
}));

function createMockContext(): TrpcContext {
  const user: User = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Portfolio Router", () => {
  let ctx: TrpcContext;

  beforeEach(() => {
    ctx = createMockContext();
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should return user portfolios", async () => {
      const mockPortfolios = [
        {
          id: 1,
          userId: 1,
          name: "Growth Portfolio",
          description: "Long-term growth",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const { getUserPortfolios } = await import("../db");
      vi.mocked(getUserPortfolios).mockResolvedValue(mockPortfolios as any);

      const caller = portfolioRouter.createCaller(ctx);
      const result = await caller.list();

      expect(result).toEqual(mockPortfolios);
      expect(getUserPortfolios).toHaveBeenCalledWith(1);
    });
  });

  describe("create", () => {
    it("should create a new portfolio", async () => {
      const { createPortfolio } = await import("../db");
      vi.mocked(createPortfolio).mockResolvedValue({ insertId: 1 } as any);

      const caller = portfolioRouter.createCaller(ctx);
      const result = await caller.create({
        name: "New Portfolio",
        description: "Test portfolio",
      });

      expect(result).toEqual({ insertId: 1 });
      expect(createPortfolio).toHaveBeenCalledWith({
        userId: 1,
        name: "New Portfolio",
        description: "Test portfolio",
      });
    });

    it("should reject portfolio creation without name", async () => {
      const caller = portfolioRouter.createCaller(ctx);

      await expect(
        caller.create({
          name: "",
          description: "Test",
        })
      ).rejects.toThrow();
    });
  });

  describe("addHolding", () => {
    it("should add a holding to portfolio", async () => {
      const { getPortfolioById, createHolding } = await import("../db");
      vi.mocked(getPortfolioById).mockResolvedValue({
        id: 1,
        userId: 1,
        name: "Test Portfolio",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      vi.mocked(createHolding).mockResolvedValue({ insertId: 1 } as any);

      const caller = portfolioRouter.createCaller(ctx);
      const result = await caller.addHolding({
        portfolioId: 1,
        symbol: "AAPL",
        name: "Apple Inc.",
        assetType: "stock",
        quantity: "10",
        purchasePrice: "150.50",
        purchaseDate: new Date("2024-01-01"),
        notes: "Initial purchase",
      });

      expect(result).toEqual({ insertId: 1 });
      expect(createHolding).toHaveBeenCalledWith(
        expect.objectContaining({
          portfolioId: 1,
          symbol: "AAPL",
          name: "Apple Inc.",
          assetType: "stock",
        })
      );
    });

    it("should reject unauthorized holding addition", async () => {
      const { getPortfolioById } = await import("../db");
      vi.mocked(getPortfolioById).mockResolvedValue({
        id: 1,
        userId: 999, // Different user
        name: "Test Portfolio",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const caller = portfolioRouter.createCaller(ctx);

      await expect(
        caller.addHolding({
          portfolioId: 1,
          symbol: "AAPL",
          name: "Apple Inc.",
          assetType: "stock",
          quantity: "10",
          purchasePrice: "150.50",
          purchaseDate: new Date("2024-01-01"),
        })
      ).rejects.toThrow("Portfolio not found or unauthorized");
    });
  });

  describe("deleteHolding", () => {
    it("should delete a holding", async () => {
      const { getPortfolioById, getHoldingById, deleteHolding } = await import("../db");
      vi.mocked(getPortfolioById).mockResolvedValue({
        id: 1,
        userId: 1,
        name: "Test Portfolio",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      vi.mocked(getHoldingById).mockResolvedValue({
        id: 1,
        portfolioId: 1,
        symbol: "AAPL",
        name: "Apple Inc.",
        assetType: "stock",
        quantity: "10",
        purchasePrice: "150.50",
        purchaseDate: new Date(),
        currentPrice: null,
        lastUpdated: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      vi.mocked(deleteHolding).mockResolvedValue({} as any);

      const caller = portfolioRouter.createCaller(ctx);
      const result = await caller.deleteHolding({
        holdingId: 1,
        portfolioId: 1,
      });

      expect(deleteHolding).toHaveBeenCalledWith(1);
    });
  });
});
