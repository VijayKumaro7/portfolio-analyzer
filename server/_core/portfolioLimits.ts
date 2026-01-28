import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { subscriptions, portfolios } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Portfolio limits for each subscription tier
 */
export const PORTFOLIO_LIMITS = {
  free: 1,
  pro: 5,
  premium: -1, // -1 means unlimited
} as const;

/**
 * Get the portfolio limit for a user based on their subscription tier
 */
export async function getPortfolioLimit(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database unavailable",
    });
  }

  try {
    // Get user's subscription
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    const tier = subscription.length > 0 ? subscription[0].tier : "free";
    const limit = PORTFOLIO_LIMITS[tier as keyof typeof PORTFOLIO_LIMITS];

    return limit;
  } catch (error) {
    console.error("[Portfolio Limits] Error fetching subscription:", error);
    // Default to free tier limits on error
    return PORTFOLIO_LIMITS.free;
  }
}

/**
 * Get the current portfolio count for a user
 */
export async function getPortfolioCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database unavailable",
    });
  }

  try {
    const result = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.userId, userId));

    return result.length;
  } catch (error) {
    console.error("[Portfolio Limits] Error counting portfolios:", error);
    return 0;
  }
}

/**
 * Check if a user can create a new portfolio
 */
export async function canCreatePortfolio(userId: number): Promise<{
  allowed: boolean;
  reason?: string;
  current: number;
  limit: number;
}> {
  try {
    const limit = await getPortfolioLimit(userId);
    const current = await getPortfolioCount(userId);

    // Unlimited portfolios (premium tier)
    if (limit === -1) {
      return {
        allowed: true,
        current,
        limit: -1,
      };
    }

    // Check if at limit
    if (current >= limit) {
      return {
        allowed: false,
        reason: `You have reached the portfolio limit of ${limit} for your subscription tier. Upgrade to create more portfolios.`,
        current,
        limit,
      };
    }

    return {
      allowed: true,
      current,
      limit,
    };
  } catch (error) {
    console.error("[Portfolio Limits] Error checking portfolio creation:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to check portfolio limits",
    });
  }
}

/**
 * Enforce portfolio limit before creating a new portfolio
 */
export async function enforcePortfolioLimit(userId: number): Promise<void> {
  const check = await canCreatePortfolio(userId);

  if (!check.allowed) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: check.reason || "Portfolio limit exceeded for your subscription tier",
    });
  }
}

/**
 * Get subscription tier for a user
 */
export async function getUserSubscriptionTier(userId: number): Promise<"free" | "pro" | "premium"> {
  const db = await getDb();
  if (!db) {
    return "free";
  }

  try {
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    return subscription.length > 0 ? (subscription[0].tier as "free" | "pro" | "premium") : "free";
  } catch (error) {
    console.error("[Portfolio Limits] Error fetching user tier:", error);
    return "free";
  }
}
