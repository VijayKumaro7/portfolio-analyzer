import { Lock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";

interface LockedFeatureProps {
  featureName: string;
  description: string;
  requiredTier: "pro" | "premium";
  onUpgradeClick?: () => void;
}

export default function LockedFeature({
  featureName,
  description,
  requiredTier,
  onUpgradeClick,
}: LockedFeatureProps) {
  const [, setLocation] = useLocation();

  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      setLocation("/pricing");
    }
  };

  return (
    <Card className="relative overflow-hidden p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600">
      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/30 dark:bg-black/20" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4 py-8">
        <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
          <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            {featureName} is Locked
          </h3>
          <p className="text-slate-600 dark:text-slate-300 max-w-sm">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
            Available in {requiredTier === "premium" ? "Premium" : "Pro"} plan
          </span>
        </div>

        <Button
          onClick={handleUpgrade}
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Upgrade Now
        </Button>
      </div>
    </Card>
  );
}
