import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import Stripe from "stripe";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { subscriptions, paymentIntents, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { getTierConfig } from "../_core/products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export const subscriptionRouter = router({
  /**
   * Create a checkout session for subscription upgrade
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        tier: z.enum(["pro", "premium"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      try {
        const tierConfig = getTierConfig(input.tier);
        const origin = ctx.req.headers.origin || "http://localhost:3000";

        // Get or create Stripe customer
        let stripeCustomerId = ctx.user.stripeCustomerId;

        if (!stripeCustomerId) {
          const customer = await stripe.customers.create({
            email: ctx.user.email || undefined,
            name: ctx.user.name || undefined,
            metadata: {
              user_id: ctx.user.id.toString(),
            },
          });

          stripeCustomerId = customer.id;

          // Update user with Stripe customer ID
          await db
            .update(users)
            .set({ stripeCustomerId })
            .where(eq(users.id, ctx.user.id));
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
          customer: stripeCustomerId,
          mode: "subscription",
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: tierConfig.currency,
                product_data: {
                  name: `Portfolio Analyzer - ${tierConfig.name} Plan`,
                  description: tierConfig.description,
                },
                unit_amount: tierConfig.price,
                recurring: {
                  interval: "month",
                  interval_count: 1,
                },
              },
              quantity: 1,
            },
          ],
          success_url: `${origin}/dashboard?subscription=success&tier=${input.tier}`,
          cancel_url: `${origin}/pricing?subscription=canceled`,
          client_reference_id: ctx.user.id.toString(),
          customer_email: ctx.user.email || undefined,
          metadata: {
            user_id: ctx.user.id.toString(),
            tier: input.tier,
            customer_email: ctx.user.email || "",
            customer_name: ctx.user.name || "",
          },
          allow_promotion_codes: true,
        });

        return {
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        console.error("[Subscription] Checkout session creation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create checkout session",
        });
      }
    }),

  /**
   * Get current subscription status
   */
  getCurrentSubscription: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    try {
      const subscription = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, ctx.user.id))
        .limit(1);

      if (subscription.length === 0) {
        return {
          tier: "free" as const,
          status: "active" as const,
          currentPeriodStart: null,
          currentPeriodEnd: null,
        };
      }

      return subscription[0];
    } catch (error) {
      console.error("[Subscription] Error fetching subscription:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch subscription",
      });
    }
  }),

  /**
   * Cancel subscription
   */
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    try {
      const subscription = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, ctx.user.id))
        .limit(1);

      if (subscription.length === 0 || !subscription[0].stripeSubscriptionId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No active subscription found",
        });
      }

      // Cancel the Stripe subscription
      await stripe.subscriptions.cancel(subscription[0].stripeSubscriptionId);

      // Update local subscription status
      await db
        .update(subscriptions)
        .set({
          status: "canceled",
          canceledAt: new Date(),
          tier: "free",
        })
        .where(eq(subscriptions.userId, ctx.user.id));

      return { success: true };
    } catch (error) {
      console.error("[Subscription] Error canceling subscription:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to cancel subscription",
      });
    }
  }),

  /**
   * Get payment history
   */
  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    try {
      const payments = await db
        .select()
        .from(paymentIntents)
        .where(eq(paymentIntents.userId, ctx.user.id));

      return payments;
    } catch (error) {
      console.error("[Subscription] Error fetching payment history:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch payment history",
      });
    }
  }),

  /**
   * Get billing portal URL
   */
  getBillingPortalUrl: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      if (!ctx.user.stripeCustomerId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No Stripe customer found",
        });
      }

      const origin = ctx.req.headers.origin || "http://localhost:3000";

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: ctx.user.stripeCustomerId,
        return_url: `${origin}/dashboard`,
      });

      return { url: portalSession.url };
    } catch (error) {
      console.error("[Subscription] Error creating billing portal:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create billing portal session",
      });
    }
  }),
});
