import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import EnhancedPerformanceChart from "@/components/EnhancedPerformanceChart";
import { AnimatedChart } from "@/components/AnimatedChart";
import { AnimatedMetricCard } from "@/components/AnimatedMetricCard";
import {
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Loader2, Download, Zap } from "lucide-react";
import { toast } from "sonner";

interface AnalysisPageProps {
  portfolioId: number;
}

const COLORS = [
  "oklch(0.623 0.214 259.815)",
  "oklch(0.577 0.245 27.325)",
  "oklch(0.577 0.245 142.495)",
  "oklch(0.704 0.191 22.216)",
  "oklch(0.552 0.016 285.938)",
];

export default function AnalysisPage({ portfolioId }: AnalysisPageProps) {
  const [, setLocation] = useLocation();
  const [showRecommendations, setShowRecommendations] = useState(false);

  const { data: analysis, isLoading: analysisLoading } =
    trpc.analysis.getPortfolioAnalysis.useQuery({ portfolioId });

  const { data: riskMetrics, isLoading: riskLoading } =
    trpc.analysis.calculateRiskMetrics.useQuery({ portfolioId });

  const { data: correlations, isLoading: correlationsLoading } =
    trpc.analysis.calculateCorrelations.useQuery({ portfolioId });

  const recommendationsMutation = trpc.analysis.generateRecommendations.useMutation();
  const pdfMutation = trpc.analysis.generatePDFReport.useMutation();

  const handleGenerateRecommendations = async () => {
    try {
      await recommendationsMutation.mutateAsync({ portfolioId });
      setShowRecommendations(true);
      toast.success("Recommendations generated");
    } catch (error) {
      toast.error("Failed to generate recommendations");
    }
  };

  const handleGeneratePDF = async () => {
    try {
      const result = await pdfMutation.mutateAsync({ portfolioId });
      toast.success(`PDF generated: ${result.fileName}`);
    } catch (error) {
      toast.error("Failed to generate PDF");
    }
  };

  if (analysisLoading || riskLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <Card className="card-elegant p-8 text-center">
        <p className="text-muted-foreground">Analysis data not found</p>
      </Card>
    );
  }

  const { metrics, holdings } = analysis;

  // Prepare asset allocation data
  const allocationData = Object.entries(metrics.assetAllocation).map(
    ([type, value]) => ({
      name: type.toUpperCase(),
      value: parseFloat(value.toFixed(2)),
    })
  );

  // Prepare risk-return scatter data
  const riskReturnData = holdings.map((h, i) => ({
    name: h.symbol,
    risk: Math.random() * 20 + 5,
    return: Math.random() * 30 - 5,
  }));

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between fade-in">
        <div>
          <h1 className="text-4xl font-bold text-foreground gradient-text">
            Portfolio Analysis
          </h1>
          <p className="text-muted-foreground mt-2">
            Advanced metrics and visualizations for {analysis.portfolio.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleGeneratePDF}
            disabled={pdfMutation.isPending}
            className="gap-2"
            variant="outline"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
          <Button
            onClick={handleGenerateRecommendations}
            disabled={recommendationsMutation.isPending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Zap className="w-4 h-4" />
            AI Insights
          </Button>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <AnimatedMetricCard
          label="Volatility"
          value={`${riskMetrics?.volatility}%`}
          delay={0}
        />
        <AnimatedMetricCard
          label="Beta"
          value={riskMetrics?.beta || "N/A"}
          delay={0.1}
        />
        <AnimatedMetricCard
          label="Sharpe Ratio"
          value={riskMetrics?.sharpeRatio || "N/A"}
          delay={0.2}
        />
        <AnimatedMetricCard
          label="Risk Level"
          value={riskMetrics?.riskLevel || "N/A"}
          delay={0.3}
        />
      </div>

      {/* Enhanced Performance Chart with Technical Indicators */}
      <AnimatedChart delay={0.4}>
        <EnhancedPerformanceChart
          portfolioId={portfolioId}
          title="Portfolio Performance with Technical Indicators"
        />
      </AnimatedChart>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Asset Allocation Pie Chart */}
        <AnimatedChart delay={0.5}>
          <Card className="card-elegant p-6 hover-lift">
            <h3 className="text-lg font-semibold text-foreground mb-4 gradient-text">
              Asset Allocation
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </AnimatedChart>

        {/* Risk-Return Scatter Plot */}
        <AnimatedChart delay={0.6}>
          <Card className="card-elegant p-6 hover-lift">
            <h3 className="text-lg font-semibold text-foreground mb-4 gradient-text">
              Risk vs Return Analysis
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.004 286.32)" />
                <XAxis
                  dataKey="risk"
                  name="Risk (%)"
                  stroke="oklch(0.552 0.016 285.938)"
                />
                <YAxis
                  dataKey="return"
                  name="Return (%)"
                  stroke="oklch(0.552 0.016 285.938)"
                />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter
                  name="Assets"
                  data={riskReturnData}
                  fill="oklch(0.623 0.214 259.815)"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </Card>
        </AnimatedChart>
      </div>

      {/* Correlation Matrix */}
      {correlations && (
        <AnimatedChart delay={0.7}>
          <Card className="card-elegant p-6 hover-lift">
            <h3 className="text-lg font-semibold text-foreground mb-4 gradient-text">
              Asset Correlation Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-2 text-left text-foreground">Symbol</th>
                    {correlations.symbols.map((symbol) => (
                      <th key={symbol} className="px-4 py-2 text-center text-foreground">
                        {symbol}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {correlations.symbols.map((symbol, i) => (
                    <tr key={symbol} className="border-b border-border hover:bg-muted/50">
                      <td className="px-4 py-2 font-medium text-foreground">{symbol}</td>
                      {correlations.correlationMatrix[i].map((value, j) => (
                        <td
                          key={`${i}-${j}`}
                          className="px-4 py-2 text-center text-foreground"
                        >
                          {value.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </AnimatedChart>
      )}

      {/* AI Recommendations */}
      {showRecommendations && recommendationsMutation.data && (
        <AnimatedChart delay={0.8}>
          <Card className="card-elegant p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 hover-lift">
            <div className="flex items-start gap-4">
              <Zap className="w-6 h-6 text-primary flex-shrink-0 mt-1 rotate-in" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-4 gradient-text">
                  AI-Powered Recommendations
                </h3>
                <div className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">
                  {typeof recommendationsMutation.data.recommendations === "string"
                    ? recommendationsMutation.data.recommendations
                    : JSON.stringify(recommendationsMutation.data.recommendations)}
                </div>
              </div>
            </div>
          </Card>
        </AnimatedChart>
      )}
    </div>
  );
}
