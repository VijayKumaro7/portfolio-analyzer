import { ReactNode } from "react";

interface AnimatedChartProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedChart({ children, delay = 0, className = "" }: AnimatedChartProps) {
  return (
    <div
      className={`scale-in ${className}`}
      style={{
        animationDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
