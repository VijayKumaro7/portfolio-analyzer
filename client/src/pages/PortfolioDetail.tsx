import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { Plus, Loader2, Trash2, Edit2, TrendingUp, DollarSign } from "lucide-react";
import { toast } from "sonner";
import MarketPriceDisplay from "@/components/MarketPriceDisplay";

interface PortfolioDetailProps {
  portfolioId: number;
}

export default function PortfolioDetail({ portfolioId }: PortfolioDetailProps) {
  const [, setLocation] = useLocation();
  const [isAddHoldingOpen, setIsAddHoldingOpen] = useState(false);
  const [liveMarketPrices, setLiveMarketPrices] = useState<Record<string, number>>({});
  const [formData, setFormData] = useState({
    symbol: "",
    name: "",
    assetType: "stock" as const,
    quantity: "",
    purchasePrice: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const { data: portfolioData, isLoading, refetch } = trpc.portfolio.getWithHoldings.useQuery({
    portfolioId,
  });

  const addHoldingMutation = trpc.portfolio.addHolding.useMutation();
  const deleteHoldingMutation = trpc.portfolio.deleteHolding.useMutation();

  const handleAddHolding = async () => {
    if (!formData.symbol || !formData.name || !formData.quantity || !formData.purchasePrice) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await addHoldingMutation.mutateAsync({
        portfolioId,
        symbol: formData.symbol,
        name: formData.name,
        assetType: formData.assetType,
        quantity: formData.quantity,
        purchasePrice: formData.purchasePrice,
        purchaseDate: new Date(formData.purchaseDate),
        notes: formData.notes,
      });
      setFormData({
        symbol: "",
        name: "",
        assetType: "stock",
        quantity: "",
        purchasePrice: "",
        purchaseDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setIsAddHoldingOpen(false);
      refetch();
      toast.success("Holding added successfully");
    } catch (error) {
      toast.error("Failed to add holding");
    }
  };

  const handleDeleteHolding = async (holdingId: number) => {
    if (confirm("Are you sure you want to delete this holding?")) {
      try {
        await deleteHoldingMutation.mutateAsync({
          holdingId,
          portfolioId,
        });
        refetch();
        toast.success("Holding deleted successfully");
      } catch (error) {
        toast.error("Failed to delete holding");
      }
    }
  };

  const handlePricesUpdate = (prices: any[]) => {
    const priceMap: Record<string, number> = {};
    prices.forEach((p) => {
      if (p?.symbol) {
        priceMap[p.symbol] = p.price;
      }
    });
    setLiveMarketPrices(priceMap);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!portfolioData) {
    return (
      <Card className="card-elegant p-8 text-center">
        <p className="text-muted-foreground">Portfolio not found</p>
      </Card>
    );
  }

  const { portfolio, holdings } = portfolioData;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">{portfolio.name}</h1>
          {portfolio.description && (
            <p className="text-muted-foreground mt-2">{portfolio.description}</p>
          )}
        </div>
        <Button
          onClick={() => setIsAddHoldingOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Holding
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Total Holdings</p>
              <p className="metric-value">{holdings.length}</p>
            </div>
            <DollarSign className="w-8 h-8 text-primary/20" />
          </div>
        </Card>

        <Card className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Asset Types</p>
              <p className="metric-value">
                {new Set(holdings.map((h) => h.assetType)).size}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-accent/20" />
          </div>
        </Card>

        <Card className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Last Updated</p>
              <p className="metric-value text-lg">
                {new Date(portfolio.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-destructive/20" />
          </div>
        </Card>
      </div>

      {/* Live Market Prices */}
      {holdings.length > 0 && (
        <MarketPriceDisplay
          holdings={holdings.map((h) => ({
            symbol: h.symbol,
            type: h.assetType as "stock" | "crypto" | "fund",
          }))}
          onPricesUpdate={handlePricesUpdate}
          refetchInterval={60000}
        />
      )}

      {/* Holdings Table */}
      <Card className="card-elegant">
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
                  Purchase Price
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                  Current Price
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {holdings.length > 0 ? (
                holdings.map((holding) => {
                  const currentPrice = liveMarketPrices[holding.symbol.toUpperCase()] || null;
                  const gainLoss = currentPrice
                    ? ((currentPrice - parseFloat(holding.purchasePrice)) / parseFloat(holding.purchasePrice)) * 100
                    : null;

                  return (
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
                        ${holding.purchasePrice}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {currentPrice ? (
                          <div className="text-foreground">
                            <p className="font-medium">${currentPrice.toFixed(2)}</p>
                            {gainLoss !== null && (
                              <p
                                className={`text-xs ${
                                  gainLoss >= 0 ? "text-accent" : "text-destructive"
                                }`}
                              >
                                {gainLoss >= 0 ? "+" : ""}
                                {gainLoss.toFixed(2)}%
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Loading...</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLocation(`/asset/${holding.id}`)}
                            className="text-primary hover:text-primary/80"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteHolding(holding.id)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    No holdings yet. Add your first investment to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Holding Dialog */}
      <Dialog open={isAddHoldingOpen} onOpenChange={setIsAddHoldingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Holding</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Symbol</label>
              <Input
                placeholder="e.g., AAPL"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Name</label>
              <Input
                placeholder="e.g., Apple Inc."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Asset Type</label>
              <Select value={formData.assetType} onValueChange={(value) => setFormData({ ...formData, assetType: value as any })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="fund">Fund</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Quantity</label>
              <Input
                placeholder="e.g., 10"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Purchase Price</label>
              <Input
                placeholder="e.g., 150.50"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Purchase Date</label>
              <Input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="mt-2"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAddHoldingOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddHolding}
                disabled={addHoldingMutation.isPending}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {addHoldingMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
