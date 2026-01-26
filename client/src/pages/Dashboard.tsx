import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { Plus, Loader2, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState("");
  const [newPortfolioDesc, setNewPortfolioDesc] = useState("");

  const { data: portfolios, isLoading, refetch } = trpc.portfolio.list.useQuery();
  const createMutation = trpc.portfolio.create.useMutation();

  const handleCreatePortfolio = async () => {
    if (!newPortfolioName.trim()) {
      toast.error("Portfolio name is required");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: newPortfolioName,
        description: newPortfolioDesc,
      });
      setNewPortfolioName("");
      setNewPortfolioDesc("");
      setIsCreateOpen(false);
      refetch();
      toast.success("Portfolio created successfully");
    } catch (error) {
      toast.error("Failed to create portfolio");
    }
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between fade-in">
        <div>
          <h1 className="text-4xl font-bold text-foreground gradient-text">My Portfolios</h1>
          <p className="text-muted-foreground mt-2">
            Manage and analyze your investment portfolios
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          <Plus className="w-4 h-4" />
          New Portfolio
        </Button>
      </div>

      {/* Portfolios Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : portfolios && portfolios.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in">
          {portfolios.map((portfolio) => (
            <Card
              key={portfolio.id}
              className="card-elegant p-6 cursor-pointer hover-lift"
              onClick={() => setLocation(`/portfolio/${portfolio.id}`)}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {portfolio.name}
                    </h3>
                    {portfolio.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {portfolio.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-primary">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">View Details</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="card-elegant p-12 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No portfolios yet
          </h3>
          <p className="text-muted-foreground mb-6">
            Create your first portfolio to start analyzing your investments
          </p>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Create Portfolio
          </Button>
        </Card>
      )}

      {/* Create Portfolio Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Portfolio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                Portfolio Name
              </label>
              <Input
                placeholder="e.g., Tech Growth Portfolio"
                value={newPortfolioName}
                onChange={(e) => setNewPortfolioName(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Description (Optional)
              </label>
              <Textarea
                placeholder="Describe your portfolio strategy..."
                value={newPortfolioDesc}
                onChange={(e) => setNewPortfolioDesc(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePortfolio}
                disabled={createMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Portfolio"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
