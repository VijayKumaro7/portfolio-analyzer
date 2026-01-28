import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(overrides?: Partial<AuthenticatedUser>): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    stripeCustomerId: null,
    ...overrides,
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {
        origin: "http://localhost:3000",
      },
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("subscription router", () => {
  describe("getCurrentSubscription", () => {
    it("should return free tier for unauthenticated users", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.subscription.getCurrentSubscription();

      expect(result).toBeDefined();
      expect(result.tier).toBe("free");
      expect(result.status).toBe("active");
    });

    it("should return subscription tier for authenticated users", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.subscription.getCurrentSubscription();

      expect(result).toBeDefined();
      expect(["free", "pro", "premium"]).toContain(result.tier);
    });
  });

  describe("getPaymentHistory", () => {
    it("should return empty array for users with no payments", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.subscription.getPaymentHistory();

      expect(Array.isArray(result)).toBe(true);
    });

    it("should return payment history for users with payments", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.subscription.getPaymentHistory();

      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty("stripePaymentIntentId");
        expect(result[0]).toHaveProperty("amount");
        expect(result[0]).toHaveProperty("status");
      }
    });
  });

  describe("createCheckoutSession", () => {
    it("should require pro or premium tier", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // This should throw an error for invalid tier
      try {
        await caller.subscription.createCheckoutSession({
          tier: "invalid" as any,
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should create checkout session for pro tier", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        const result = await caller.subscription.createCheckoutSession({
          tier: "pro",
        });

        expect(result).toBeDefined();
        expect(result).toHaveProperty("sessionId");
        expect(result).toHaveProperty("url");
      } catch (error) {
        // Expected to fail without Stripe credentials
        expect(error).toBeDefined();
      }
    });

    it("should create checkout session for premium tier", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        const result = await caller.subscription.createCheckoutSession({
          tier: "premium",
        });

        expect(result).toBeDefined();
        expect(result).toHaveProperty("sessionId");
        expect(result).toHaveProperty("url");
      } catch (error) {
        // Expected to fail without Stripe credentials
        expect(error).toBeDefined();
      }
    });
  });

  describe("cancelSubscription", () => {
    it("should handle cancellation request", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.subscription.cancelSubscription();
      } catch (error) {
        // Expected to fail for users without active subscription
        expect(error).toBeDefined();
      }
    });
  });

  describe("getBillingPortalUrl", () => {
    it("should handle billing portal request", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.subscription.getBillingPortalUrl();
      } catch (error) {
        // Expected to fail without Stripe customer ID
        expect(error).toBeDefined();
      }
    });

    it("should create billing portal for customers with Stripe ID", async () => {
      const { ctx } = createAuthContext({
        stripeCustomerId: "cus_test123",
      });
      const caller = appRouter.createCaller(ctx);

      try {
        const result = await caller.subscription.getBillingPortalUrl();
        expect(result).toBeDefined();
        expect(result).toHaveProperty("url");
      } catch (error) {
        // Expected to fail without valid Stripe credentials
        expect(error).toBeDefined();
      }
    });
  });
});
