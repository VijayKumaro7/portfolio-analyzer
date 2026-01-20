import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
import { Loader2, Download, Zap, TrendingUp } from "lucide-react";
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

  // Prepare performance data (mock)
  const performanceData = [
    { month: "Jan", value: 10000 },
    { month: "Feb", value: 10500 },
    { month: "Mar", value: 10200 },
    { month: "Apr", value: 11000 },
    { month: "May", value: 10800 },
    { month: "Jun", value: 11500 },
  ];

  // Prepare risk-return scatter data
  const riskReturnData = holdings.map((h, i) => ({
    name: h.symbol,
    risk: Math.random() * 20 + 5,
    return: Math.random() * 30 - 5,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">
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
        <Card className="metric-card">
          <div>
            <p className="metric-label">Volatility</p>
            <p className="metric-value">{riskMetrics?.volatility}%</p>
          </div>
        </Card>
        <Card className="metric-card">
          <div>
            <p className="metric-label">Beta</p>
            <p className="metric-value">{riskMetrics?.beta}</p>
          </div>
        </Card>
        <Card className="metric-card">
          <div>
            <p className="metric-label">Sharpe Ratio</p>
            <p className="metric-value">{riskMetrics?.sharpeRatio}</p>
          </div>
        </Card>
        <Card className="metric-card">
          <div>
            <p className="metric-label">Risk Level</p>
            <p className="metric-value text-lg">{riskMetrics?.riskLevel}</p>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Asset Allocation Pie Chart */}
        <Card className="card-elegant p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
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

        {/* Performance Area Chart */}
        <Card className="card-elegant p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Portfolio Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.623 0.214 259.815)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="oklch(0.623 0.214 259.815)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.004 286.32)" />
              <XAxis dataKey="month" stroke="oklch(0.552 0.016 285.938)" />
              <YAxis stroke="oklch(0.552 0.016 285.938)" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="value"
                stroke="oklch(0.623 0.214 259.815)"
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Risk-Return Scatter Plot */}
      <Card className="card-elegant p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
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

      {/* Correlation Matrix */}
      {correlations && (
        <Card className="card-elegant p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
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
      )}

      {/* AI Recommendations */}
      {showRecommendations && recommendationsMutation.data && (
        <Card className="card-elegant p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-start gap-4">
            <Zap className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                AI-Powered Recommendations
              </h3>
              <div className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">
                {typeof recommendationsMutation.data.recommendations === 'string'
                  ? recommendationsMutation.data.recommendations
                  : JSON.stringify(recommendationsMutation.data.recommendations)}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
