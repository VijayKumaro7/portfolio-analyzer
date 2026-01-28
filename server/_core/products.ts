/**
 * Stripe Products and Prices Configuration
 * Define all subscription tiers and their pricing here
 */

export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: "Free",
    tier: "free" as const,
    price: 0,
    currency: "usd",
    description: "Perfect for getting started with portfolio tracking",
    features: {
      portfolios: 1,
      holdingsPerPortfolio: 10,
      realtimeData: false,
      technicalIndicators: false,
      aiRecommendations: false,
      pdfReports: false,
      riskAnalysis: false,
      correlationMatrix: false,
      exportData: false,
      support: "community",
    },
  },
  PRO: {
    name: "Pro",
    tier: "pro" as const,
    price: 999, // $9.99 in cents
    currency: "usd",
    interval: "month" as const,
    description: "For serious investors who want advanced insights",
    features: {
      portfolios: 5,
      holdingsPerPortfolio: -1, // unlimited
      realtimeData: true,
      technicalIndicators: true,
      aiRecommendations: true,
      pdfReports: true,
      riskAnalysis: true,
      correlationMatrix: true,
      exportData: true,
      support: "email",
    },
  },
  PREMIUM: {
    name: "Premium",
    tier: "premium" as const,
    price: 2499, // $24.99 in cents
    currency: "usd",
    interval: "month" as const,
    description: "For professional investors and portfolio managers",
    features: {
      portfolios: -1, // unlimited
      holdingsPerPortfolio: -1, // unlimited
      realtimeData: true,
      technicalIndicators: true,
      aiRecommendations: true,
      pdfReports: true,
      riskAnalysis: true,
      correlationMatrix: true,
      exportData: true,
      support: "24/7_priority",
    },
  },
};

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;
export type TierName = "free" | "pro" | "premium";

/**
 * Get tier configuration by name
 */
export function getTierConfig(tier: TierName) {
  const tierKey = tier.toUpperCase() as SubscriptionTier;
  return SUBSCRIPTION_TIERS[tierKey];
}

/**
 * Check if a tier has unlimited portfolios
 */
export function hasUnlimitedPortfolios(tier: TierName): boolean {
  const config = getTierConfig(tier);
  return config.features.portfolios === -1;
}

/**
 * Get max portfolios for a tier
 */
export function getMaxPortfolios(tier: TierName): number {
  const config = getTierConfig(tier);
  return config.features.portfolios === -1 ? Infinity : config.features.portfolios;
}

/**
 * Check if a tier has unlimited holdings per portfolio
 */
export function hasUnlimitedHoldings(tier: TierName): boolean {
  const config = getTierConfig(tier);
  return config.features.holdingsPerPortfolio === -1;
}

/**
 * Get max holdings per portfolio for a tier
 */
export function getMaxHoldingsPerPortfolio(tier: TierName): number {
  const config = getTierConfig(tier);
  return config.features.holdingsPerPortfolio === -1 ? Infinity : config.features.holdingsPerPortfolio;
}

/**
 * Check if a tier has a specific feature
 */
export function hasTierFeature(tier: TierName, feature: keyof typeof SUBSCRIPTION_TIERS.FREE.features): boolean {
  const config = getTierConfig(tier);
  const featureValue = config.features[feature];
  
  // For boolean features, return the boolean value
  if (typeof featureValue === "boolean") {
    return featureValue;
  }
  
  // For numeric features (portfolios, holdings), check if they're available
  if (typeof featureValue === "number") {
    return featureValue !== 0;
  }
  
  // For string features (support), they're always available if set
  return !!featureValue;
}
