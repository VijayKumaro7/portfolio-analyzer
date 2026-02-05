import { trpc } from "@/lib/trpc";
import type { FeatureName } from "../../../server/_core/featureGates";

export function useFeatureAccess(feature: FeatureName) {
  const { data, isLoading } = trpc.featureGates.hasAccess.useQuery(
    { feature },
    { staleTime: 5 * 60 * 1000 } // Cache for 5 minutes
  );

  return {
    hasAccess: data?.hasAccess ?? false,
    isLoading,
  };
}

export function useAvailableFeatures() {
  const { data, isLoading } = trpc.featureGates.getAvailable.useQuery(
    undefined,
    { staleTime: 5 * 60 * 1000 }
  );

  return {
    features: data?.features ?? [],
    isLoading,
  };
}

export function useCurrentTier() {
  const { data, isLoading } = trpc.featureGates.getCurrentTier.useQuery(
    undefined,
    { staleTime: 5 * 60 * 1000 }
  );

  return {
    tier: data?.tier ?? "free",
    isLoading,
  };
}

export function useNeedsUpgrade(feature: FeatureName) {
  const { data, isLoading } = trpc.featureGates.needsUpgrade.useQuery(
    { feature },
    { staleTime: 5 * 60 * 1000 }
  );

  return {
    needsUpgrade: data?.needsUpgrade ?? false,
    currentTier: data?.currentTier ?? "free",
    requiredTier: data?.requiredTier ?? null,
    isLoading,
  };
}
