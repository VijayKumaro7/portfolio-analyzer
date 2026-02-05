import { describe, it, expect } from "vitest";
import {
  getFeaturesForTier,
  getFeatureComparison,
  getFeatureLabel,
  getFeatureDescription,
  getMinimumTierForFeature,
} from "./featureGates";

describe("Feature Gates", () => {
  it("should return correct features for free tier", () => {
    const features = getFeaturesForTier("free");
    expect(features).toEqual([]);
  });

  it("should return correct features for pro tier", () => {
    const features = getFeaturesForTier("pro");
    expect(features).toContain("advanced_analytics");
    expect(features).toContain("custom_reports");
    expect(features).toContain("portfolio_comparison");
    expect(features).not.toContain("api_access");
  });

  it("should return correct features for premium tier", () => {
    const features = getFeaturesForTier("premium");
    expect(features).toContain("advanced_analytics");
    expect(features).toContain("api_access");
    expect(features).toContain("custom_reports");
  });

  it("should return feature comparison for all tiers", () => {
    const comparison = getFeatureComparison();
    
    expect(comparison.advanced_analytics.free).toBe(false);
    expect(comparison.advanced_analytics.pro).toBe(true);
    expect(comparison.advanced_analytics.premium).toBe(true);
    
    expect(comparison.api_access.free).toBe(false);
    expect(comparison.api_access.pro).toBe(false);
    expect(comparison.api_access.premium).toBe(true);
  });

  it("should return correct feature labels", () => {
    expect(getFeatureLabel("advanced_analytics")).toBe("Advanced Analytics");
    expect(getFeatureLabel("api_access")).toBe("API Access");
    expect(getFeatureLabel("custom_reports")).toBe("Custom Reports");
  });

  it("should return correct feature descriptions", () => {
    const desc = getFeatureDescription("advanced_analytics");
    expect(desc).toContain("advanced portfolio analytics");
  });

  it("should return minimum tier for features", () => {
    expect(getMinimumTierForFeature("advanced_analytics")).toBe("pro");
    expect(getMinimumTierForFeature("api_access")).toBe("premium");
    expect(getMinimumTierForFeature("custom_reports")).toBe("pro");
  });

  it("should handle all feature types", () => {
    const features = [
      "advanced_analytics",
      "api_access",
      "custom_reports",
      "portfolio_comparison",
      "performance_attribution",
      "rebalancing_recommendations",
    ] as const;

    features.forEach((feature) => {
      const label = getFeatureLabel(feature);
      const description = getFeatureDescription(feature);
      const minimumTier = getMinimumTierForFeature(feature);

      expect(label).toBeTruthy();
      expect(description).toBeTruthy();
      expect(minimumTier).toMatch(/pro|premium/);
    });
  });
});
