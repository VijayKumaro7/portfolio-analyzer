import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "Forever",
    description: "Perfect for getting started with portfolio tracking",
    cta: "Get Started",
    highlighted: false,
    features: [
      { name: "Up to 1 portfolio", included: true },
      { name: "Up to 10 holdings per portfolio", included: true },
      { name: "Basic charts and visualizations", included: true },
      { name: "Asset allocation pie chart", included: true },
      { name: "Real-time price updates", included: false },
      { name: "Technical indicators (SMA, EMA, MACD, RSI)", included: false },
      { name: "AI-powered recommendations", included: false },
      { name: "PDF report generation", included: false },
      { name: "Risk metrics and analysis", included: false },
      { name: "Priority support", included: false },
    ],
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "per month",
    description: "For serious investors who want advanced insights",
    cta: "Start Free Trial",
    highlighted: true,
    features: [
      { name: "Up to 5 portfolios", included: true },
      { name: "Unlimited holdings per portfolio", included: true },
      { name: "Advanced charts and visualizations", included: true },
      { name: "Asset allocation pie chart", included: true },
      { name: "Real-time price updates", included: true },
      { name: "Technical indicators (SMA, EMA, MACD, RSI)", included: true },
      { name: "AI-powered recommendations", included: true },
      { name: "PDF report generation", included: true },
      { name: "Risk metrics and analysis", included: true },
      { name: "Email support", included: true },
    ],
  },
  {
    name: "Premium",
    price: "$24.99",
    period: "per month",
    description: "For professional investors and portfolio managers",
    cta: "Start Free Trial",
    highlighted: false,
    features: [
      { name: "Unlimited portfolios", included: true },
      { name: "Unlimited holdings per portfolio", included: true },
      { name: "Advanced charts and visualizations", included: true },
      { name: "Asset allocation pie chart", included: true },
      { name: "Real-time price updates", included: true },
      { name: "Technical indicators (SMA, EMA, MACD, RSI)", included: true },
      { name: "AI-powered recommendations", included: true },
      { name: "PDF report generation", included: true },
      { name: "Risk metrics and analysis", included: true },
      { name: "Priority support with 24/7 access", included: true },
    ],
  },
];

export default function Pricing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl animate-float-slow"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl animate-float-slower"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
      </div>

      {/* Header */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 gradient-text">
            Simple, Transparent Pricing
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 px-4">
            Choose the perfect plan for your investment portfolio analysis needs. All plans include core features with no hidden fees.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-6">
            {pricingTiers.map((tier, index) => (
              <div
                key={tier.name}
                className="fade-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <Card
                  className={`card-elegant p-6 sm:p-8 h-full flex flex-col relative transition-all duration-300 ease-out ${
                    tier.highlighted
                      ? "ring-2 ring-primary shadow-2xl scale-105 hover:shadow-primary/50 hover:ring-primary/80"
                      : "hover-lift card-hover hover:-translate-y-2"
                  }`}
                >
                  {tier.highlighted && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <span className="bg-gradient-to-r from-primary to-accent text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 gradient-text">
                      {tier.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      {tier.description}
                    </p>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-4xl sm:text-5xl font-bold text-foreground">
                        {tier.price}
                      </span>
                      <span className="text-muted-foreground">{tier.period}</span>
                    </div>
                  </div>

                  <Button
                    className={`w-full mb-8 py-6 text-lg font-semibold transition-all duration-300 ease-out hover:scale-105 active:scale-95 ${
                      tier.highlighted
                        ? "bg-primary hover:bg-primary/90 text-white hover:shadow-lg"
                        : "border-border hover:bg-muted hover:shadow-md"
                    }`}
                    variant={tier.highlighted ? "default" : "outline"}
                  >
                    {tier.cta}
                  </Button>

                  <div className="space-y-4 flex-1">
                    {tier.features.map((feature, featureIndex) => (
                      <div
                        key={feature.name}
                        className="flex items-start gap-3 fade-in transition-all duration-300 ease-out hover:translate-x-1"
                        style={{ animationDelay: `${0.3 + featureIndex * 0.05}s` }}
                      >
                        {feature.included ? (
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground/30 flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={`text-sm ${
                            feature.included
                              ? "text-foreground"
                              : "text-muted-foreground/50"
                          }`}
                        >
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto fade-in">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4 gradient-text">
              Detailed Feature Comparison
            </h2>
            <p className="text-lg text-muted-foreground">
              See exactly what's included in each plan
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left text-foreground font-semibold">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center text-foreground font-semibold">
                    Free
                  </th>
                  <th className="px-6 py-4 text-center text-foreground font-semibold">
                    Pro
                  </th>
                  <th className="px-6 py-4 text-center text-foreground font-semibold">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Portfolios", free: "1", pro: "5", premium: "Unlimited" },
                  { name: "Holdings per Portfolio", free: "10", pro: "Unlimited", premium: "Unlimited" },
                  { name: "Real-time Price Updates", free: "No", pro: "Yes", premium: "Yes" },
                  { name: "Technical Indicators", free: "No", pro: "Yes", premium: "Yes" },
                  { name: "AI Recommendations", free: "No", pro: "Yes", premium: "Yes" },
                  { name: "PDF Reports", free: "No", pro: "Yes", premium: "Yes" },
                  { name: "Risk Analysis", free: "No", pro: "Yes", premium: "Yes" },
                  { name: "Correlation Matrix", free: "No", pro: "Yes", premium: "Yes" },
                  { name: "Export Data", free: "No", pro: "Yes", premium: "Yes" },
                  { name: "Support", free: "Community", pro: "Email", premium: "24/7 Priority" },
                ].map((feature, index) => (
                  <tr
                    key={feature.name}
                    className="border-b border-border hover:bg-muted/50 transition-colors fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-4 text-foreground font-medium">
                      {feature.name}
                    </td>
                    <td className="px-6 py-4 text-center text-muted-foreground">
                      {feature.free === "Yes" ? (
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      ) : feature.free === "No" ? (
                        <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                      ) : (
                        feature.free
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-muted-foreground">
                      {feature.pro === "Yes" ? (
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      ) : feature.pro === "No" ? (
                        <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                      ) : (
                        feature.pro
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-muted-foreground">
                      {feature.premium === "Yes" ? (
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      ) : feature.premium === "No" ? (
                        <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                      ) : (
                        feature.premium
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto fade-in">
          <h2 className="text-4xl font-bold text-foreground mb-12 text-center gradient-text">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                question: "Can I switch plans anytime?",
                answer:
                  "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges or credits.",
              },
              {
                question: "Is there a free trial for Pro and Premium?",
                answer:
                  "Absolutely! All paid plans come with a 14-day free trial. No credit card required to start.",
              },
              {
                question: "What payment methods do you accept?",
                answer:
                  "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for annual subscriptions.",
              },
              {
                question: "Do you offer annual discounts?",
                answer:
                  "Yes! Annual subscriptions receive a 20% discount compared to monthly billing. Pro: $95.88/year, Premium: $239.88/year.",
              },
              {
                question: "What happens if I cancel my subscription?",
                answer:
                  "You can cancel anytime. Your account will be downgraded to the Free plan at the end of your billing cycle.",
              },
              {
                question: "Is my data secure?",
                answer:
                  "Yes, we use enterprise-grade encryption and security protocols. Your portfolio data is protected with SSL/TLS encryption and regular security audits.",
              },
            ].map((faq, index) => (
              <Card
                key={faq.question}
                className="card-elegant p-6 hover-lift fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="text-lg font-semibold text-foreground mb-3 gradient-text">
                  {faq.question}
                </h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center fade-in">
          <h2 className="text-4xl font-bold text-foreground mb-6 gradient-text">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Choose your plan and start analyzing your portfolio today. All plans include a 14-day free trial.
          </p>
          {!isAuthenticated && (
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 h-auto"
            >
              Start Your Free Trial
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
