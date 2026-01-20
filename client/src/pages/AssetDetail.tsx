import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, Loader2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface AssetDetailProps {
  holdingId: number;
}

export default function AssetDetail({ holdingId }: AssetDetailProps) {
  const [, setLocation] = useLocation();

  // Note: This is a placeholder - we'll need to fetch the holding from the portfolio context
  // For now, we'll show a simple message
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLocation("/dashboard")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-4xl font-bold text-foreground">Asset Details</h1>
      </div>

      <Card className="card-elegant p-8 text-center">
        <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Asset Detail Page
        </h3>
        <p className="text-muted-foreground">
          This page will display detailed information about individual holdings including:
        </p>
        <ul className="text-muted-foreground text-sm mt-4 space-y-2">
          <li>• Historical performance chart</li>
          <li>• Price volatility and risk metrics</li>
          <li>• Returns percentage</li>
          <li>• Purchase and current price comparison</li>
          <li>• Performance trends</li>
        </ul>
      </Card>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Current Price</p>
              <p className="metric-value">$0.00</p>
            </div>
            <DollarSign className="w-8 h-8 text-primary/20" />
          </div>
        </Card>

        <Card className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Total Return</p>
              <p className="metric-value positive">+0.00%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-accent/20" />
          </div>
        </Card>

        <Card className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Volatility</p>
              <p className="metric-value">0.00%</p>
            </div>
            <TrendingDown className="w-8 h-8 text-destructive/20" />
          </div>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <Card className="card-elegant p-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Performance Chart
        </h3>
        <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground">Chart will be displayed here</p>
        </div>
      </Card>
    </div>
  );
}
