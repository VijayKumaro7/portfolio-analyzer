import { getDb } from "../db";
import { users, subscriptions } from "../../drizzle/schema";
import { eq, sql, desc, and, gte } from "drizzle-orm";

export interface SubscriptionMetrics {
  mrr: number; // Monthly Recurring Revenue
  churnRate: number; // Percentage of users who cancelled
  tierDistribution: {
    free: number;
    pro: number;
    premium: number;
  };
  totalSubscribers: number;
  newSubscribersThisMonth: number;
}

export interface ActiveUsersData {
  total: number;
  lastSevenDays: number;
  lastThirtyDays: number;
}

export interface RevenueAnalyticsData {
  totalRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  averageOrderValue: number;
  topPayingUsers: Array<{
    userId: number;
    userName: string;
    totalSpent: number;
  }>;
}

export interface UserManagementData {
  users: Array<{
    id: number;
    name: string | null;
    email: string | null;
    role: string;
    createdAt: Date;
    lastSignedIn: Date;
    subscriptionTier: string;
  }>;
  total: number;
}

/**
 * Get subscription metrics including MRR, churn rate, and tier distribution
 */
export async function getSubscriptionMetrics(): Promise<SubscriptionMetrics> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Get all active subscriptions
  const activeSubscriptions = await db
    .select({
      userId: subscriptions.userId,
      tier: subscriptions.tier,
      status: subscriptions.status,
    })
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"));

  // Calculate tier distribution
  const tierDistribution = {
    free: activeSubscriptions.filter((s: any) => s.tier === "free").length,
    pro: activeSubscriptions.filter((s: any) => s.tier === "pro").length,
    premium: activeSubscriptions.filter((s: any) => s.tier === "premium").length,
  };

  // Calculate MRR (Monthly Recurring Revenue) - Pro: $9.99, Premium: $24.99
  const tierPrices: Record<string, number> = {
    free: 0,
    pro: 9.99,
    premium: 24.99,
  };
  const mrr = activeSubscriptions
    .filter((s: any) => s.tier !== "free")
    .reduce((sum: number, s: any) => sum + (tierPrices[s.tier] || 0), 0);

  // Get new subscribers this month
  const newThisMonth = await db
    .select({ count: sql`COUNT(*)` })
    .from(subscriptions)
    .where(
      and(
        gte(subscriptions.createdAt, startOfMonth),
        eq(subscriptions.status, "active")
      )
    );

  // Get cancelled subscriptions this month (for churn rate)
  const cancelledThisMonth = await db
    .select({ count: sql`COUNT(*)` })
    .from(subscriptions)
    .where(
      and(
        gte(subscriptions.updatedAt, startOfMonth),
        eq(subscriptions.status, "canceled")
      )
    );

  // Calculate churn rate (cancelled / (active + cancelled) * 100)
  const totalActiveAtStartOfMonth = tierDistribution.pro + tierDistribution.premium;
  const churnRate =
    totalActiveAtStartOfMonth > 0
      ? (Number(cancelledThisMonth[0]?.count || 0) / totalActiveAtStartOfMonth) * 100
      : 0;

  return {
    mrr,
    churnRate: Math.round(churnRate * 100) / 100,
    tierDistribution,
    totalSubscribers: activeSubscriptions.length,
    newSubscribersThisMonth: Number(newThisMonth[0]?.count || 0),
  };
}

/**
 * Get active users count
 */
export async function getActiveUsers(): Promise<ActiveUsersData> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Total users
  const totalUsers = await db.select({ count: sql`COUNT(*)` }).from(users);

  // Active in last 7 days
  const activeSevenDays = await db
    .select({ count: sql`COUNT(*)` })
    .from(users)
    .where(gte(users.lastSignedIn, sevenDaysAgo));

  // Active in last 30 days
  const activeThirtyDays = await db
    .select({ count: sql`COUNT(*)` })
    .from(users)
    .where(gte(users.lastSignedIn, thirtyDaysAgo));

  return {
    total: Number(totalUsers[0]?.count || 0),
    lastSevenDays: Number(activeSevenDays[0]?.count || 0),
    lastThirtyDays: Number(activeThirtyDays[0]?.count || 0),
  };
}

/**
 * Get revenue analytics
 */
export async function getRevenueAnalytics(): Promise<RevenueAnalyticsData> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Get all paid subscriptions for revenue calculation
  const allPaidSubscriptions = await db
    .select({
      userId: subscriptions.userId,
      tier: subscriptions.tier,
      createdAt: subscriptions.createdAt,
    })
    .from(subscriptions);
  
  const paidSubscriptions = allPaidSubscriptions.filter((s: any) => s.tier !== "free");

  // Calculate total revenue (assuming monthly billing)
  const tierPrices: Record<string, number> = {
    free: 0,
    pro: 9.99,
    premium: 24.99,
  };
  const totalRevenue = paidSubscriptions.reduce(
    (sum: number, s: any) => sum + (tierPrices[s.tier] || 0),
    0
  );

  // This month revenue
  const thisMonthRevenue = paidSubscriptions
    .filter((s: any) => s.createdAt >= startOfMonth)
    .reduce((sum: number, s: any) => sum + (tierPrices[s.tier] || 0), 0);

  // Last month revenue
  const lastMonthRevenue = paidSubscriptions
    .filter((s: any) => s.createdAt >= startOfLastMonth && s.createdAt <= endOfLastMonth)
    .reduce((sum: number, s: any) => sum + (tierPrices[s.tier] || 0), 0);

  // Average order value
  const paidCount = allPaidSubscriptions.length;
  const averageOrderValue = paidCount > 0 ? totalRevenue / paidCount : 0;

  // Top paying users (mock data - would need payment history table in production)
  const topPayingUsers = allPaidSubscriptions
    .sort((a: any, b: any) => (tierPrices[b.tier] || 0) - (tierPrices[a.tier] || 0))
    .slice(0, 5)
    .map((s: any) => ({
      userId: s.userId,
      userName: `User ${s.userId}`,
      totalSpent: tierPrices[s.tier] || 0,
    }));

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    thisMonthRevenue: Math.round(thisMonthRevenue * 100) / 100,
    lastMonthRevenue: Math.round(lastMonthRevenue * 100) / 100,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    topPayingUsers: topPayingUsers as Array<{
      userId: number;
      userName: string;
      totalSpent: number;
    }>,
  };
}

/**
 * Get user management data with pagination
 */
export async function getUserManagement(
  limit: number,
  offset: number
): Promise<UserManagementData> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const userList = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  // Get subscription tier for each user
  const userSubscriptions = await db
    .select({
      userId: subscriptions.userId,
      tier: subscriptions.tier,
    })
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"));

  const subscriptionMap = new Map(
    userSubscriptions.map((s: any) => [s.userId, s.tier])
  );

  const usersWithSubscription = userList.map((u: any) => ({
    ...u,
    subscriptionTier: (subscriptionMap.get(u.id) || "free") as string,
  }));

  // Get total count
  const totalCount = await db.select({ count: sql`COUNT(*)` }).from(users);

  return {
    users: usersWithSubscription as Array<{
      id: number;
      name: string | null;
      email: string | null;
      role: string;
      createdAt: Date;
      lastSignedIn: Date;
      subscriptionTier: string;
    }>,
    total: Number(totalCount[0]?.count || 0),
  };
}
