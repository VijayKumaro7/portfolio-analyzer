import { describe, it, expect, beforeAll } from "vitest";
import { adminAnalyticsRouter } from "./adminAnalytics";
import type { TrpcContext } from "../_core/context";

describe("Admin Analytics Router", () => {
  const adminContext = {
    user: {
      id: 1,
      role: "admin",
      openId: "admin-user",
      email: "admin@test.com",
      name: "Admin User",
      loginMethod: "manus",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  } as TrpcContext;

  const userContext = {
    user: {
      id: 2,
      role: "user",
      openId: "regular-user",
      email: "user@test.com",
      name: "Regular User",
      loginMethod: "manus",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  } as TrpcContext;

  it("should get subscription metrics for admin", async () => {
    const caller = adminAnalyticsRouter.createCaller(adminContext);
    const result = await caller.subscriptionMetrics();

    expect(result).toHaveProperty("mrr");
    expect(result).toHaveProperty("churnRate");
    expect(result).toHaveProperty("tierDistribution");
    expect(result).toHaveProperty("totalSubscribers");
    expect(result).toHaveProperty("newSubscribersThisMonth");
    expect(typeof result.mrr).toBe("number");
    expect(typeof result.churnRate).toBe("number");
  });

  it("should get active users for admin", async () => {
    const caller = adminAnalyticsRouter.createCaller(adminContext);
    const result = await caller.activeUsers();

    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("lastSevenDays");
    expect(result).toHaveProperty("lastThirtyDays");
    expect(typeof result.total).toBe("number");
    expect(result.total >= 0).toBe(true);
  });

  it("should get revenue analytics for admin", async () => {
    const caller = adminAnalyticsRouter.createCaller(adminContext);
    const result = await caller.revenueAnalytics();

    expect(result).toHaveProperty("totalRevenue");
    expect(result).toHaveProperty("thisMonthRevenue");
    expect(result).toHaveProperty("lastMonthRevenue");
    expect(result).toHaveProperty("averageOrderValue");
    expect(result).toHaveProperty("topPayingUsers");
    expect(typeof result.totalRevenue).toBe("number");
    expect(Array.isArray(result.topPayingUsers)).toBe(true);
  });

  it("should get user management data for admin", async () => {
    const caller = adminAnalyticsRouter.createCaller(adminContext);
    const result = await caller.userManagement({ limit: 10, offset: 0 });

    expect(result).toHaveProperty("users");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.users)).toBe(true);
    expect(typeof result.total).toBe("number");
  });

  it("should prevent non-admin from accessing subscription metrics", async () => {
    const caller = adminAnalyticsRouter.createCaller(userContext);
    
    try {
      await caller.subscriptionMetrics();
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should prevent non-admin from accessing active users", async () => {
    const caller = adminAnalyticsRouter.createCaller(userContext);
    
    try {
      await caller.activeUsers();
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should prevent non-admin from accessing revenue analytics", async () => {
    const caller = adminAnalyticsRouter.createCaller(userContext);
    
    try {
      await caller.revenueAnalytics();
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should prevent non-admin from accessing user management", async () => {
    const caller = adminAnalyticsRouter.createCaller(userContext);
    
    try {
      await caller.userManagement({ limit: 10, offset: 0 });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });
});
