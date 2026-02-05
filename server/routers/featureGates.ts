import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import {
  hasFeatureAccess,
  getAvailableFeatures,
  getFeaturesForTier,
  getFeatureComparison,
  getFeatureLabel,
  getFeatureDescription,
  getUserTier,
  getMinimumTierForFeature,
  type FeatureName,
} from "../_core/featureGates";

export const featureGatesRouter = router({
  /**
   * Check if current user has access to a feature
   */
  hasAccess: protectedProcedure
    .input(z.object({ feature: z.string() as z.ZodType<FeatureName> }))
    .query(async ({ ctx, input }) => {
      const hasAccess = await hasFeatureAccess(ctx.user.id, input.feature);
      return { hasAccess };
    }),

  /**
   * Get all available features for current user
   */
  getAvailable: protectedProcedure.query(async ({ ctx }) => {
    const features = await getAvailableFeatures(ctx.user.id);
    return {
      features: features.map((f) => ({
        name: f,
        label: getFeatureLabel(f),
        description: getFeatureDescription(f),
      })),
    };
  }),

  /**
   * Get current user's tier
   */
  getCurrentTier: protectedProcedure.query(async ({ ctx }) => {
    const tier = await getUserTier(ctx.user.id);
    return { tier };
  }),

  /**
   * Get features for a specific tier (public)
   */
  getFeaturesForTier: publicProcedure
    .input(z.object({ tier: z.enum(["free", "pro", "premium"]) }))
    .query(({ input }) => {
      const features = getFeaturesForTier(input.tier);
      return {
        tier: input.tier,
        features: features.map((f) => ({
          name: f,
          label: getFeatureLabel(f),
          description: getFeatureDescription(f),
        })),
      };
    }),

  /**
   * Get feature comparison table (public)
   */
  getComparison: publicProcedure.query(() => {
    const comparison = getFeatureComparison();
    return {
      features: Object.entries(comparison).map(([name, availability]) => ({
        name: name as FeatureName,
        label: getFeatureLabel(name as FeatureName),
        description: getFeatureDescription(name as FeatureName),
        free: availability.free,
        pro: availability.pro,
        premium: availability.premium,
      })),
    };
  }),

  /**
   * Get minimum tier required for a feature
   */
  getMinimumTier: publicProcedure
    .input(z.object({ feature: z.string() as z.ZodType<FeatureName> }))
    .query(({ input }) => {
      const minimumTier = getMinimumTierForFeature(input.feature);
      return {
        feature: input.feature,
        minimumTier,
      };
    }),

  /**
   * Check if user needs to upgrade for a feature
   */
  needsUpgrade: protectedProcedure
    .input(z.object({ feature: z.string() as z.ZodType<FeatureName> }))
    .query(async ({ ctx, input }) => {
      const hasAccess = await hasFeatureAccess(ctx.user.id, input.feature);
      const minimumTier = getMinimumTierForFeature(input.feature);
      const currentTier = await getUserTier(ctx.user.id);

      return {
        feature: input.feature,
        hasAccess,
        currentTier,
        requiredTier: minimumTier,
        needsUpgrade: !hasAccess && minimumTier !== null,
      };
    }),
});
