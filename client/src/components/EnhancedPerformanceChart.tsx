import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { Loader2, TrendingUp } from "lucide-react";

interface EnhancedPerformanceChartProps {
  portfolioId: number;
  holdingId?: number;
  title?: string;
}

type DateRange = "1M" | "3M" | "6M" | "1Y" | "ALL";

const DATE_RANGES: { label: string; value: DateRange }[] = [
  { label: "1M", value: "1M" },
  { label: "3M", value: "3M" },
  { label: "6M", value: "6M" },
  { label: "1Y", value: "1Y" },
  { label: "All", value: "ALL" },
];

const INDICATORS = [
  { id: "sma20", name: "SMA 20", color: "oklch(0.577 0.245 27.325)" },
  { id: "sma50", name: "SMA 50", color: "oklch(0.577 0.245 142.495)" },
  { id: "ema12", name: "EMA 12", color: "oklch(0.704 0.191 22.216)" },
  { id: "ema26", name: "EMA 26", color: "oklch(0.552 0.016 285.938)" },
  { id: "macd", name: "MACD", color: "oklch(0.623 0.214 259.815)" },
];

export default function EnhancedPerformanceChart({
  portfolioId,
  holdingId,
  title = "Performance Chart",
}: EnhancedPerformanceChartProps) {
  const [dateRange, setDateRange] = useState<DateRange>("1Y");
  const [selectedIndicators, setSelectedIndicators] = useState<Set<string>>(
    new Set()
  );

  // Fetch chart data
  const { data: chartData, isLoading } = holdingId
    ? trpc.chartAnalysis.getAssetPerformanceChart.useQuery({
        portfolioId,
        holdingId,
        dateRange,
        indicators: {
          sma20: selectedIndicators.has("sma20"),
          sma50: selectedIndicators.has("sma50"),
          ema12: selectedIndicators.has("ema12"),
          ema26: selectedIndicators.has("ema26"),
          macd: selectedIndicators.has("macd"),
        },
      })
    : trpc.chartAnalysis.getPerformanceChartData.useQuery({
        portfolioId,
        dateRange,
        indicators: {
          sma20: selectedIndicators.has("sma20"),
          sma50: selectedIndicators.has("sma50"),
          ema12: selectedIndicators.has("ema12"),
          ema26: selectedIndicators.has("ema26"),
          macd: selectedIndicators.has("macd"),
        },
      });

  const toggleIndicator = (indicatorId: string) => {
    const newIndicators = new Set(selectedIndicators);
    if (newIndicators.has(indicatorId)) {
      newIndicators.delete(indicatorId);
    } else {
      newIndicators.add(indicatorId);
    }
    setSelectedIndicators(newIndicators);
  };

  if (isLoading) {
    return (
      <Card className="card-elegant p-8">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (!chartData) {
    return (
      <Card className="card-elegant p-8 text-center">
        <p className="text-muted-foreground">No chart data available</p>
      </Card>
    );
  }

  const { chartData: data, statistics } = chartData;

  return (
    <Card className="card-elegant p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Price: ${statistics.currentPrice} | Return:{" "}
            <span
              className={
                parseFloat(statistics.returnPercentage) >= 0
                  ? "text-accent"
                  : "text-destructive"
              }
            >
              {statistics.returnPercentage}%
            </span>
          </p>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex gap-2 flex-wrap">
        {DATE_RANGES.map((range) => (
          <Button
            key={range.value}
            onClick={() => setDateRange(range.value)}
            variant={dateRange === range.value ? "default" : "outline"}
            size="sm"
            className={
              dateRange === range.value
                ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                : ""
            }
          >
            {range.label}
          </Button>
        ))}
      </div>

      {/* Technical Indicators Selector */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Technical Indicators</p>
        <div className="flex gap-2 flex-wrap">
          {INDICATORS.map((indicator) => (
            <Button
              key={indicator.id}
              onClick={() => toggleIndicator(indicator.id)}
              variant={
                selectedIndicators.has(indicator.id) ? "default" : "outline"
              }
              size="sm"
              className={
                selectedIndicators.has(indicator.id)
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : ""
              }
            >
              {indicator.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="oklch(0.623 0.214 259.815)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="oklch(0.623 0.214 259.815)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.92 0.004 286.32)"
            />
            <XAxis
              dataKey="date"
              stroke="oklch(0.552 0.016 285.938)"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              stroke="oklch(0.552 0.016 285.938)"
              style={{ fontSize: "12px" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(1 0 0)",
                border: "1px solid oklch(0.92 0.004 286.32)",
                borderRadius: "8px",
              }}
              formatter={(value: any) => {
                if (typeof value === "number") {
                  return value.toFixed(2);
                }
                return value;
              }}
            />
            <Legend />

            {/* Main Price Line */}
            <Area
              type="monotone"
              dataKey="price"
              stroke="oklch(0.623 0.214 259.815)"
              fillOpacity={1}
              fill="url(#colorPrice)"
              name="Price"
              isAnimationActive={false}
            />

            {/* Moving Averages */}
            {selectedIndicators.has("sma20") && (
              <Line
                type="monotone"
                dataKey="sma20"
                stroke="oklch(0.577 0.245 27.325)"
                strokeWidth={2}
                dot={false}
                name="SMA 20"
                isAnimationActive={false}
              />
            )}
            {selectedIndicators.has("sma50") && (
              <Line
                type="monotone"
                dataKey="sma50"
                stroke="oklch(0.577 0.245 142.495)"
                strokeWidth={2}
                dot={false}
                name="SMA 50"
                isAnimationActive={false}
              />
            )}
            {selectedIndicators.has("ema12") && (
              <Line
                type="monotone"
                dataKey="ema12"
                stroke="oklch(0.704 0.191 22.216)"
                strokeWidth={2}
                dot={false}
                name="EMA 12"
                isAnimationActive={false}
              />
            )}
            {selectedIndicators.has("ema26") && (
              <Line
                type="monotone"
                dataKey="ema26"
                stroke="oklch(0.552 0.016 285.938)"
                strokeWidth={2}
                dot={false}
                name="EMA 26"
                isAnimationActive={false}
              />
            )}
            {selectedIndicators.has("macd") && (
              <Line
                type="monotone"
                dataKey="macd"
                stroke="oklch(0.623 0.214 259.815)"
                strokeWidth={2}
                dot={false}
                name="MACD"
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-muted rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Min Price</p>
          <p className="text-sm font-semibold text-foreground">
            ${statistics.minPrice}
          </p>
        </div>
        <div className="bg-muted rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Max Price</p>
          <p className="text-sm font-semibold text-foreground">
            ${statistics.maxPrice}
          </p>
        </div>
        <div className="bg-muted rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Avg Price</p>
          <p className="text-sm font-semibold text-foreground">
            ${statistics.avgPrice}
          </p>
        </div>
        <div className="bg-muted rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Return</p>
          <p
            className={`text-sm font-semibold ${
              parseFloat(statistics.returnPercentage) >= 0
                ? "text-accent"
                : "text-destructive"
            }`}
          >
            {statistics.returnPercentage}%
          </p>
        </div>
      </div>
    </Card>
  );
}
