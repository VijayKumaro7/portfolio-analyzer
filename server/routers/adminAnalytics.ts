import { z } from "zod";
import { adminProcedure, router } from "../_core/trpc";
import {
  getSubscriptionMetrics,
  getActiveUsers,
  getRevenueAnalytics,
  getUserManagement,
} from "../db/adminAnalytics";

export const adminAnalyticsRouter = router({
  // Get subscription metrics (MRR, churn rate, tier distribution)
  subscriptionMetrics: adminProcedure.query(async () => {
    const metrics = await getSubscriptionMetrics();
    return metrics;
  }),

  // Get active users count
  activeUsers: adminProcedure.query(async () => {
    const users = await getActiveUsers();
    return users;
  }),

  // Get revenue analytics
  revenueAnalytics: adminProcedure.query(async () => {
    const revenue = await getRevenueAnalytics();
    return revenue;
  }),

  // Get user management data
  userManagement: adminProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const users = await getUserManagement(input.limit, input.offset);
      return users;
    }),
});
