import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { CreditCard, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getTierConfig, SUBSCRIPTION_TIERS } from "../../../server/_core/products";

export default function SubscriptionPage() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const { data: subscription, isLoading: isLoadingSubscription } =
    trpc.subscription.getCurrentSubscription.useQuery(undefined, {
      enabled: isAuthenticated,
    });

  const { data: paymentHistory, isLoading: isLoadingHistory } =
    trpc.subscription.getPaymentHistory.useQuery(undefined, {
      enabled: isAuthenticated,
    });

  const createCheckoutMutation = trpc.subscription.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
        toast.success("Redirecting to checkout...");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create checkout session");
    },
  });

  const cancelSubscriptionMutation = trpc.subscription.cancelSubscription.useMutation({
    onSuccess: () => {
      toast.success("Subscription canceled successfully");
      utils.subscription.getCurrentSubscription.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to cancel subscription");
    },
  });

  const getBillingPortalMutation = trpc.subscription.getBillingPortalUrl.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to open billing portal");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to manage your subscription.
          </p>
          <Button onClick={() => setLocation("/")} className="w-full">
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  const currentTier = subscription?.tier || "free";
  const currentConfig = getTierConfig(currentTier);

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Subscription Management
          </h1>
          <p className="text-muted-foreground">
            Manage your plan and billing information
          </p>
        </div>

        {/* Current Subscription */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Current Plan</h2>
            </div>

            {isLoadingSubscription ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <p className="text-muted-foreground mb-2">Plan</p>
                  <p className="text-3xl font-bold text-primary capitalize">
                    {currentConfig.name}
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-muted-foreground mb-2">Price</p>
                  <p className="text-2xl font-semibold">
                    {currentConfig.price === 0 ? (
                      "Free"
                    ) : (
                      <>
                        ${(currentConfig.price / 100).toFixed(2)}
                        <span className="text-sm text-muted-foreground">/month</span>
                      </>
                    )}
                  </p>
                </div>

                {subscription?.currentPeriodEnd && currentTier !== "free" && (
                  <div className="mb-6">
                    <p className="text-muted-foreground mb-2">Renews on</p>
                    <p className="font-semibold">
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  {currentTier !== "free" && (
                    <>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => getBillingPortalMutation.mutate()}
                        disabled={getBillingPortalMutation.isPending}
                      >
                        {getBillingPortalMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          "Manage Billing"
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => cancelSubscriptionMutation.mutate()}
                        disabled={cancelSubscriptionMutation.isPending}
                      >
                        {cancelSubscriptionMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Canceling...
                          </>
                        ) : (
                          "Cancel Subscription"
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Upgrade Options */}
          <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur">
            <h2 className="text-2xl font-bold mb-6">Upgrade Plan</h2>

            <div className="space-y-3">
              {currentTier !== "pro" && (
                <Button
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  onClick={() => createCheckoutMutation.mutate({ tier: "pro" })}
                  disabled={createCheckoutMutation.isPending}
                >
                  {createCheckoutMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Upgrade to Pro - $9.99/month
                    </>
                  )}
                </Button>
              )}

              {currentTier !== "premium" && (
                <Button
                  className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90"
                  onClick={() => createCheckoutMutation.mutate({ tier: "premium" })}
                  disabled={createCheckoutMutation.isPending}
                >
                  {createCheckoutMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Upgrade to Premium - $24.99/month
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Feature Comparison */}
        <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur mb-12">
          <h2 className="text-2xl font-bold mb-6">Feature Comparison</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Feature</th>
                  <th className="text-center py-3 px-4 font-semibold">Free</th>
                  <th className="text-center py-3 px-4 font-semibold">Pro</th>
                  <th className="text-center py-3 px-4 font-semibold">Premium</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Portfolios", key: "portfolios" },
                  { name: "Holdings per Portfolio", key: "holdingsPerPortfolio" },
                  { name: "Real-time Price Data", key: "realtimeData" },
                  { name: "Technical Indicators", key: "technicalIndicators" },
                  { name: "AI Recommendations", key: "aiRecommendations" },
                  { name: "PDF Reports", key: "pdfReports" },
                  { name: "Risk Analysis", key: "riskAnalysis" },
                  { name: "Correlation Matrix", key: "correlationMatrix" },
                  { name: "Export Data", key: "exportData" },
                  { name: "Support", key: "support" },
                ].map((feature) => (
                  <tr key={feature.key} className="border-b border-border hover:bg-primary/5">
                    <td className="py-3 px-4">{feature.name}</td>
                    <td className="text-center py-3 px-4">
                      {SUBSCRIPTION_TIERS.FREE.features[feature.key as keyof typeof SUBSCRIPTION_TIERS.FREE.features] === true ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : SUBSCRIPTION_TIERS.FREE.features[feature.key as keyof typeof SUBSCRIPTION_TIERS.FREE.features] === false ? (
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">
                          {SUBSCRIPTION_TIERS.FREE.features[feature.key as keyof typeof SUBSCRIPTION_TIERS.FREE.features]}
                        </span>
                      )}
                    </td>
                    <td className="text-center py-3 px-4">
                      {SUBSCRIPTION_TIERS.PRO.features[feature.key as keyof typeof SUBSCRIPTION_TIERS.PRO.features] === true ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : SUBSCRIPTION_TIERS.PRO.features[feature.key as keyof typeof SUBSCRIPTION_TIERS.PRO.features] === false ? (
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">
                          {SUBSCRIPTION_TIERS.PRO.features[feature.key as keyof typeof SUBSCRIPTION_TIERS.PRO.features] === -1
                            ? "Unlimited"
                            : SUBSCRIPTION_TIERS.PRO.features[feature.key as keyof typeof SUBSCRIPTION_TIERS.PRO.features]}
                        </span>
                      )}
                    </td>
                    <td className="text-center py-3 px-4">
                      {SUBSCRIPTION_TIERS.PREMIUM.features[feature.key as keyof typeof SUBSCRIPTION_TIERS.PREMIUM.features] === true ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : SUBSCRIPTION_TIERS.PREMIUM.features[feature.key as keyof typeof SUBSCRIPTION_TIERS.PREMIUM.features] === false ? (
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">
                          {SUBSCRIPTION_TIERS.PREMIUM.features[feature.key as keyof typeof SUBSCRIPTION_TIERS.PREMIUM.features] === -1
                            ? "Unlimited"
                            : SUBSCRIPTION_TIERS.PREMIUM.features[feature.key as keyof typeof SUBSCRIPTION_TIERS.PREMIUM.features]}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Payment History */}
        {paymentHistory && paymentHistory.length > 0 && (
          <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur">
            <h2 className="text-2xl font-bold mb-6">Payment History</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Plan</th>
                    <th className="text-left py-3 px-4 font-semibold">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment) => (
                    <tr key={payment.id} className="border-b border-border hover:bg-primary/5">
                      <td className="py-3 px-4">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 capitalize">{payment.tier}</td>
                      <td className="py-3 px-4">
                        ${(parseInt(payment.amount) / 100).toFixed(2)} {payment.currency.toUpperCase()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-700 dark:text-green-400">
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
