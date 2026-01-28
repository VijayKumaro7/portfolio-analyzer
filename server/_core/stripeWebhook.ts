import Stripe from "stripe";
import { Request, Response } from "express";
import { getDb } from "../db";
import { subscriptions, paymentIntents, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const db = await getDb();
  if (!db) {
    console.error("[Webhook] Database unavailable");
    return res.status(503).json({ error: "Service unavailable" });
  }

  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("[Webhook] Signature verification failed:", err);
    return res.status(400).json({ error: "Webhook signature verification failed" });
  }

  try {
    // Handle test events
    if (event.id.startsWith("evt_test_")) {
      console.log("[Webhook] Test event detected, returning verification response");
      return res.json({
        verified: true,
      });
    }

    console.log(`[Webhook] Processing event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session, db);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription, db);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription, db);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice, db);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent, db);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing event:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, db: any) {
  const clientReferenceId = session.client_reference_id;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!clientReferenceId) {
    console.error("[Webhook] No client_reference_id in session");
    return;
  }

  const userId = parseInt(clientReferenceId, 10);
  const tier = (session.metadata?.tier || "pro") as "pro" | "premium";

  try {
    // Check if subscription already exists
    const existing = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      // Update existing subscription
      await db
        .update(subscriptions)
        .set({
          stripeSubscriptionId: subscriptionId,
          tier,
          status: "active",
          currentPeriodStart: new Date(session.created * 1000),
        })
        .where(eq(subscriptions.userId, userId));
    } else {
      // Create new subscription
      await db.insert(subscriptions).values({
        userId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        tier,
        status: "active",
        currentPeriodStart: new Date(session.created * 1000),
      });
    }

    console.log(`[Webhook] Subscription created/updated for user ${userId}`);
  } catch (error) {
    console.error("[Webhook] Error handling checkout session:", error);
    throw error;
  }
}

/**
 * Handle customer.subscription.updated event
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription, db: any) {
  const customerId = subscription.customer as string;
  const tier = (subscription.metadata?.tier || "pro") as "pro" | "premium";
  const sub = subscription as any;

  try {
    // Find user by Stripe customer ID
    const user = await db
      .select()
      .from(users)
      .where(eq(users.stripeCustomerId, customerId))
      .limit(1);

    if (user.length === 0) {
      console.error(`[Webhook] User not found for customer ${customerId}`);
      return;
    }

    const userId = user[0].id;

    // Update subscription
    await db
      .update(subscriptions)
      .set({
        tier,
        status: subscription.status as any,
        currentPeriodStart: sub.current_period_start ? new Date(sub.current_period_start * 1000) : null,
        currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
      })
      .where(eq(subscriptions.userId, userId));

    console.log(`[Webhook] Subscription updated for user ${userId}`);
  } catch (error) {
    console.error("[Webhook] Error handling subscription update:", error);
    throw error;
  }
}

/**
 * Handle customer.subscription.deleted event
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription, db: any) {
  const customerId = subscription.customer as string;

  try {
    // Find user by Stripe customer ID
    const user = await db
      .select()
      .from(users)
      .where(eq(users.stripeCustomerId, customerId))
      .limit(1);

    if (user.length === 0) {
      console.error(`[Webhook] User not found for customer ${customerId}`);
      return;
    }

    const userId = user[0].id;

    // Update subscription to canceled
    await db
      .update(subscriptions)
      .set({
        status: "canceled",
        tier: "free",
        canceledAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId));

    console.log(`[Webhook] Subscription canceled for user ${userId}`);
  } catch (error) {
    console.error("[Webhook] Error handling subscription deletion:", error);
    throw error;
  }
}

/**
 * Handle invoice.paid event
 */
async function handleInvoicePaid(invoice: Stripe.Invoice, db: any) {
  const customerId = invoice.customer as string;

  try {
    // Find user by Stripe customer ID
    const user = await db
      .select()
      .from(users)
      .where(eq(users.stripeCustomerId, customerId))
      .limit(1);

    if (user.length === 0) {
      console.error(`[Webhook] User not found for customer ${customerId}`);
      return;
    }

    console.log(`[Webhook] Invoice paid for user ${user[0].id}`);
  } catch (error) {
    console.error("[Webhook] Error handling invoice paid:", error);
    throw error;
  }
}

/**
 * Handle payment_intent.succeeded event
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent, db: any) {
  const clientReferenceId = paymentIntent.metadata?.user_id;
  const tier = paymentIntent.metadata?.tier as "pro" | "premium" | undefined;

  if (!clientReferenceId || !tier) {
    console.error("[Webhook] Missing metadata in payment intent");
    return;
  }

  const userId = parseInt(clientReferenceId, 10);

  try {
    // Check if payment intent already exists
    const existing = await db
      .select()
      .from(paymentIntents)
      .where(eq(paymentIntents.stripePaymentIntentId, paymentIntent.id))
      .limit(1);

    if (existing.length === 0) {
      // Create new payment intent record
      await db.insert(paymentIntents).values({
        userId,
        stripePaymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount.toString(),
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        tier,
      });
    }

    console.log(`[Webhook] Payment intent recorded for user ${userId}`);
  } catch (error) {
    console.error("[Webhook] Error handling payment intent:", error);
    throw error;
  }
}
