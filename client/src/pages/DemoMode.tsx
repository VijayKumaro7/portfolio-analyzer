import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, TrendingDown, DollarSign, Users } from "lucide-react";
import { useLocation } from "wouter";

export default function DemoMode() {
  const [, setLocation] = useLocation();
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | null>(null);

  // Fetch demo users and portfolios
  const { data: demoUsers, isLoading: usersLoading } =
    trpc.demoMode.getDemoUsers.useQuery();

  // Fetch selected portfolio details
  const { data: portfolioDetails, isLoading: portfolioLoading } =
    trpc.demoMode.getDemoPortfolio.useQuery(
      { portfolioId: selectedPortfolioId! },
      { enabled: selectedPortfolioId !== null }
    );

  // Fetch portfolio stats
  const { data: portfolioStats } = trpc.demoMode.getDemoPortfolioStats.useQuery(
    { portfolioId: selectedPortfolioId! },
    { enabled: selectedPortfolioId !== null }
  );

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!demoUsers || demoUsers.length === 0) {
    return (
      <Card className="card-elegant p-8 text-center">
        <p className="text-muted-foreground">No demo data available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="fade-in">
        <h1 className="text-4xl font-bold text-foreground gradient-text">Demo Portfolio Explorer</h1>
        <p className="text-muted-foreground mt-2">
          Explore sample portfolios without authentication. Select a portfolio to view detailed analytics.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Portfolio List */}
        <div className="lg:col-span-1 fade-in">
          <Card className="card-elegant p-6 hover-lift">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Demo Accounts
            </h2>

            <div className="space-y-4">
              {demoUsers.map((user) => (
                <div key={user.id} className="border border-border rounded-lg p-4">
                  <p className="font-semibold text-foreground">{user.name}</p>
                  <p className="text-sm text-muted-foreground mb-3">{user.email}</p>

                  <div className="space-y-2">
                    {user.portfolios.map((portfolio) => (
                      <Button
                        key={portfolio.id}
                        onClick={() => setSelectedPortfolioId(portfolio.id)}
                        variant={
                          selectedPortfolioId === portfolio.id ? "default" : "outline"
                        }
                        className="w-full justify-start text-left h-auto py-2 px-3"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-sm">{portfolio.name}</span>
                          <span className="text-xs opacity-70">
                            {portfolio.description}
                          </span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Portfolio Details */}
        <div className="lg:col-span-2 space-y-6 fade-in">
          {selectedPortfolioId && portfolioDetails ? (
            <>
              {/* Portfolio Header */}
              <Card className="card-elegant p-6 hover-lift">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {portfolioDetails.portfolio.name}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {portfolioDetails.portfolio.description}
                </p>
                <p className="text-sm text-muted-foreground">
                  Owner: {portfolioDetails.user.name}
                </p>
              </Card>

              {/* Portfolio Statistics */}
              {portfolioStats && (
                <div className="grid md:grid-cols-2 gap-4 fade-in">
                  <Card className="metric-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="metric-label">Total Holdings</p>
                        <p className="metric-value">{portfolioStats.totalHoldings}</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-primary/20" />
                    </div>
                  </Card>

                  <Card className="metric-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="metric-label">Total Value</p>
                        <p className="metric-value">${portfolioStats.totalValue.toLocaleString()}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-accent/20" />
                    </div>
                  </Card>

                  <Card className="metric-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="metric-label">Total Cost</p>
                        <p className="metric-value">${portfolioStats.totalCost.toLocaleString()}</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-primary/20" />
                    </div>
                  </Card>

                  <Card className="metric-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="metric-label">Gain/Loss</p>
                        <p
                          className={`metric-value ${
                            portfolioStats.gainLoss >= 0
                              ? "text-accent"
                              : "text-destructive"
                          }`}
                        >
                          ${portfolioStats.gainLoss.toLocaleString()}
                        </p>
                        <p
                          className={`text-sm mt-1 ${
                            portfolioStats.gainLossPercent >= 0
                              ? "text-accent"
                              : "text-destructive"
                          }`}
                        >
                          {portfolioStats.gainLossPercent >= 0 ? "+" : ""}
                          {portfolioStats.gainLossPercent.toFixed(2)}%
                        </p>
                      </div>
                      {portfolioStats.gainLoss >= 0 ? (
                        <TrendingUp className="w-8 h-8 text-accent/20" />
                      ) : (
                        <TrendingDown className="w-8 h-8 text-destructive/20" />
                      )}
                    </div>
                  </Card>
                </div>
              )}

              {/* Holdings Table */}
              <Card className="card-elegant hover-lift">
                <div className="p-6 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground gradient-text">Holdings</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                          Symbol
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                          Type
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                          Quantity
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolioDetails.holdings.map((holding) => (
                        <tr
                          key={holding.id}
                          className="border-b border-border hover:bg-muted/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-foreground">
                            {holding.symbol}
                          </td>
                          <td className="px-6 py-4 text-foreground">{holding.name}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {holding.assetType}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-foreground">
                            {holding.quantity}
                          </td>
                          <td className="px-6 py-4 text-right text-foreground">
                            ${parseFloat(holding.purchasePrice).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* CTA Button */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setLocation("/dashboard")}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Create Your Own Portfolio
                </Button>
              </div>
            </>
          ) : (
            <Card className="card-elegant p-8 text-center">
              <p className="text-muted-foreground">
                Select a portfolio from the list to view details
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
