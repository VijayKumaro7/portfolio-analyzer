import { useCallback, useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

interface MarketDataHookOptions {
  refetchInterval?: number; // in milliseconds
  enabled?: boolean;
}

/**
 * Hook to fetch and manage market data for holdings
 */
export function useMarketData(
  holdings: Array<{ symbol: string; type: "stock" | "crypto" | "fund" }>,
  options: MarketDataHookOptions = {}
) {
  const { refetchInterval = 60000, enabled = true } = options;
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { data: prices, isLoading, error, refetch } = trpc.marketData.getPortfolioHoldingsPrices.useQuery(
    { holdings },
    {
      enabled: enabled && holdings.length > 0,
      staleTime: refetchInterval,
    }
  );

  // Auto-refetch based on interval
  useEffect(() => {
    if (!enabled || holdings.length === 0) return;

    const interval = setInterval(() => {
      refetch();
      setLastUpdated(new Date());
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [refetchInterval, enabled, holdings.length, refetch]);

  return {
    prices: prices || [],
    isLoading,
    error,
    lastUpdated,
    refetch,
  };
}

/**
 * Hook to fetch historical data for a single holding
 */
export function useHoldingHistoricalData(
  symbol: string,
  type: "stock" | "crypto" | "fund",
  days: number = 30,
  enabled: boolean = true
) {
  const { data, isLoading, error } =
    trpc.marketData.getHoldingHistoricalData.useQuery(
      { symbol, type, days },
      { enabled }
    );

  return {
    historicalData: data,
    isLoading,
    error,
  };
}

/**
 * Hook to fetch a single stock price
 */
export function useStockPrice(symbol: string, enabled: boolean = true) {
  const { data, isLoading, error, refetch } =
    trpc.marketData.getStockPrice.useQuery({ symbol }, { enabled });

  return {
    price: data,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to fetch cryptocurrency price
 */
export function useCryptoPrice(
  symbol: string,
  market: string = "USD",
  enabled: boolean = true
) {
  const { data, isLoading, error, refetch } =
    trpc.marketData.getCryptoPrice.useQuery(
      { symbol, market },
      { enabled }
    );

  return {
    price: data,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to fetch stock time series data
 */
export function useStockTimeSeries(
  symbol: string,
  outputSize: "compact" | "full" = "compact",
  enabled: boolean = true
) {
  const { data, isLoading, error } =
    trpc.marketData.getStockTimeSeries.useQuery(
      { symbol, outputSize },
      { enabled }
    );

  return {
    timeSeries: data,
    isLoading,
    error,
  };
}
