import { useMarketData } from "@/hooks/useMarketData";
import { Card } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface MarketPriceDisplayProps {
  holdings: Array<{ symbol: string; type: "stock" | "crypto" | "fund" }>;
  onPricesUpdate?: (prices: any[]) => void;
  refetchInterval?: number;
}

export default function MarketPriceDisplay({
  holdings,
  onPricesUpdate,
  refetchInterval = 60000,
}: MarketPriceDisplayProps) {
  const { prices, isLoading, lastUpdated, refetch } = useMarketData(holdings, {
    refetchInterval,
    enabled: holdings.length > 0,
  });

  // Call callback when prices update
  if (prices.length > 0 && onPricesUpdate) {
    onPricesUpdate(prices);
  }

  if (holdings.length === 0) {
    return (
      <Card className="card-elegant p-6 text-center">
        <p className="text-muted-foreground">No holdings to display</p>
      </Card>
    );
  }

  return (
    <Card className="card-elegant p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Live Market Prices
        </h3>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
            </span>
          )}
          <Button
            onClick={() => refetch()}
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {isLoading && prices.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {holdings.map((holding) => {
            const priceData = prices.find(
              (p) => p?.symbol === holding.symbol.toUpperCase()
            );

            return (
              <div
                key={holding.symbol}
                className="bg-muted rounded-lg p-4 border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-foreground">
                      {holding.symbol.toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {holding.type}
                    </p>
                  </div>
                  {priceData?.change !== undefined && (
                    <div
                      className={`flex items-center gap-1 ${
                        priceData.change >= 0 ? "text-accent" : "text-destructive"
                      }`}
                    >
                      {priceData.change >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">
                        {priceData.change >= 0 ? "+" : ""}
                        {priceData.change.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {priceData ? (
                  <>
                    <p className="text-2xl font-bold text-foreground mb-2">
                      ${priceData.price.toFixed(2)}
                    </p>
                    {priceData.changePercent && (
                      <p
                        className={`text-sm ${
                          parseFloat(priceData.changePercent) >= 0
                            ? "text-accent"
                            : "text-destructive"
                        }`}
                      >
                        {priceData.changePercent}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {prices.length > 0 && prices.length < holdings.length && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Could not fetch prices for {holdings.length - prices.length} holding(s).
            This may be due to API rate limits or invalid symbols.
          </p>
        </div>
      )}
    </Card>
  );
}
