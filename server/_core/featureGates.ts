import { getDb } from "../db";
import { eq } from "drizzle-orm";
import { subscriptions, users } from "../../drizzle/schema";

export type FeatureName = 
  | "advanced_analytics"
  | "api_access"
  | "custom_reports"
  | "portfolio_comparison"
  | "performance_attribution"
  | "rebalancing_recommendations";

export type SubscriptionTier = "free" | "pro" | "premium";

// Feature availability by tier
const FEATURE_AVAILABILITY: Record<FeatureName, SubscriptionTier[]> = {
  advanced_analytics: ["pro", "premium"],
  api_access: ["premium"],
  custom_reports: ["pro", "premium"],
  portfolio_comparison: ["pro", "premium"],
  performance_attribution: ["pro", "premium"],
  rebalancing_recommendations: ["pro", "premium"],
};

/**
 * Get the user's current subscription tier
 */
export async function getUserTier(userId: number): Promise<SubscriptionTier> {
  const db = await getDb();
  if (!db) return "free";

  try {
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (!subscription || subscription.length === 0) {
      return "free";
    }

    const sub = subscription[0];
    if (sub.status !== "active") {
      return "free";
    }

    // Return the tier from subscription
    return sub.tier as SubscriptionTier;
  } catch (error) {
    console.error("[Feature Gates] Error getting user tier:", error);
    return "free";
  }
}

/**
 * Check if a user has access to a specific feature
 */
export async function hasFeatureAccess(
  userId: number,
  feature: FeatureName
): Promise<boolean> {
  const tier = await getUserTier(userId);
  const allowedTiers = FEATURE_AVAILABILITY[feature] || [];
  return allowedTiers.includes(tier);
}

/**
 * Get all available features for a user's tier
 */
export async function getAvailableFeatures(userId: number): Promise<FeatureName[]> {
  const tier = await getUserTier(userId);
  return (Object.entries(FEATURE_AVAILABILITY) as [FeatureName, SubscriptionTier[]][])
    .filter(([_, tiers]) => tiers.includes(tier))
    .map(([feature]) => feature);
}

/**
 * Get feature availability for a specific tier
 */
export function getFeaturesForTier(tier: SubscriptionTier): FeatureName[] {
  return (Object.entries(FEATURE_AVAILABILITY) as [FeatureName, SubscriptionTier[]][])
    .filter(([_, tiers]) => tiers.includes(tier))
    .map(([feature]) => feature);
}

/**
 * Get the minimum tier required for a feature
 */
export function getMinimumTierForFeature(feature: FeatureName): SubscriptionTier | null {
  const tiers = FEATURE_AVAILABILITY[feature];
  if (!tiers || tiers.length === 0) return null;
  
  // Return the lowest tier that has access
  if (tiers.includes("pro")) return "pro";
  if (tiers.includes("premium")) return "premium";
  return null;
}

/**
 * Get feature status for all tiers
 */
export function getFeatureComparison(): Record<FeatureName, Record<SubscriptionTier, boolean>> {
  const result: Record<FeatureName, Record<SubscriptionTier, boolean>> = {} as Record<FeatureName, Record<SubscriptionTier, boolean>>;
  
  (Object.entries(FEATURE_AVAILABILITY) as [FeatureName, SubscriptionTier[]][]).forEach(
    ([feature, tiers]) => {
      result[feature] = {
        free: tiers.includes("free"),
        pro: tiers.includes("pro"),
        premium: tiers.includes("premium"),
      };
    }
  );
  
  return result;
}

/**
 * Get human-readable feature name
 */
export function getFeatureLabel(feature: FeatureName): string {
  const labels: Record<FeatureName, string> = {
    advanced_analytics: "Advanced Analytics",
    api_access: "API Access",
    custom_reports: "Custom Reports",
    portfolio_comparison: "Portfolio Comparison",
    performance_attribution: "Performance Attribution",
    rebalancing_recommendations: "Rebalancing Recommendations",
  };
  return labels[feature] || feature;
}

/**
 * Get feature description
 */
export function getFeatureDescription(feature: FeatureName): string {
  const descriptions: Record<FeatureName, string> = {
    advanced_analytics: "Access to advanced portfolio analytics and deep insights",
    api_access: "RESTful API for programmatic portfolio access",
    custom_reports: "Generate and download custom PDF reports",
    portfolio_comparison: "Compare your portfolio against market benchmarks",
    performance_attribution: "Detailed breakdown of returns by asset and time period",
    rebalancing_recommendations: "Automated rebalancing suggestions and optimization",
  };
  return descriptions[feature] || "";
}
