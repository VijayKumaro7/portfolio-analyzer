import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface AnimatedMetricCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: ReactNode;
  delay?: number;
}

export function AnimatedMetricCard({
  label,
  value,
  change,
  changeType = "neutral",
  icon,
  delay = 0,
}: AnimatedMetricCardProps) {
  return (
    <Card
      className="metric-card slide-up"
      style={{
        animationDelay: `${delay}s`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="metric-label">{label}</p>
          <p className="metric-value">{value}</p>
          {change && (
            <p className={`metric-change ${changeType === "positive" ? "positive" : changeType === "negative" ? "negative" : ""}`}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="ml-4 text-primary rotate-in" style={{ animationDelay: `${delay + 0.2}s` }}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
