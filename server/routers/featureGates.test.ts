import { describe, it, expect } from "vitest";
import { featureGatesRouter } from "./featureGates";
import type { TrpcContext } from "../_core/context";

describe("Feature Gates Router", () => {
  it("should get feature comparison for all tiers", async () => {
    const caller = featureGatesRouter.createCaller({} as TrpcContext);
    const result = await caller.getComparison();

    expect(result.features).toBeDefined();
    expect(result.features.length).toBeGreaterThan(0);
    expect(result.features[0]).toHaveProperty("name");
    expect(result.features[0]).toHaveProperty("label");
    expect(result.features[0]).toHaveProperty("free");
    expect(result.features[0]).toHaveProperty("pro");
    expect(result.features[0]).toHaveProperty("premium");
  });

  it("should get features for free tier", async () => {
    const caller = featureGatesRouter.createCaller({} as TrpcContext);
    const result = await caller.getFeaturesForTier({ tier: "free" });

    expect(result.tier).toBe("free");
    expect(result.features).toEqual([]);
  });

  it("should get features for pro tier", async () => {
    const caller = featureGatesRouter.createCaller({} as TrpcContext);
    const result = await caller.getFeaturesForTier({ tier: "pro" });

    expect(result.tier).toBe("pro");
    expect(result.features.length).toBeGreaterThan(0);
    expect(result.features.some(f => f.name === "advanced_analytics")).toBe(true);
  });

  it("should get features for premium tier", async () => {
    const caller = featureGatesRouter.createCaller({} as TrpcContext);
    const result = await caller.getFeaturesForTier({ tier: "premium" });

    expect(result.tier).toBe("premium");
    expect(result.features.length).toBeGreaterThan(0);
    expect(result.features.some(f => f.name === "api_access")).toBe(true);
  });

  it("should get minimum tier for advanced_analytics", async () => {
    const caller = featureGatesRouter.createCaller({} as TrpcContext);
    const result = await caller.getMinimumTier({ feature: "advanced_analytics" });

    expect(result.feature).toBe("advanced_analytics");
    expect(result.minimumTier).toBe("pro");
  });

  it("should get minimum tier for api_access", async () => {
    const caller = featureGatesRouter.createCaller({} as TrpcContext);
    const result = await caller.getMinimumTier({ feature: "api_access" });

    expect(result.feature).toBe("api_access");
    expect(result.minimumTier).toBe("premium");
  });
});
