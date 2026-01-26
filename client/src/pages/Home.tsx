import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { BarChart3, TrendingUp, PieChart, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted animated-gradient relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl float-slower"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl float-slow"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-primary/3 rounded-full blur-3xl float-slower" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 glass-effect">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Portfolio Analyzer</h1>
          </div>
          <div className="flex gap-3 items-center">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button
                onClick={() => setLocation("/dashboard")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => (window.location.href = getLoginUrl())}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => setLocation("/demo")}
                  variant="outline"
                  className="border-border hover:bg-muted"
                >
                  Try Demo
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-20 md:py-32 relative z-10 fade-in">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Elegant Portfolio Management
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Analyze your investment portfolio with sophisticated visualizations, real-time price updates, and AI-powered recommendations. Track stocks, funds, and cryptocurrencies all in one elegant platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Button
                onClick={() => setLocation("/dashboard")}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Open Dashboard
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => (window.location.href = getLoginUrl())}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Get Started
                </Button>
                <Button
                  onClick={() => setLocation("/demo")}
                  variant="outline"
                  size="lg"
                  className="border-border hover:bg-muted"
                >
                  Explore Demo
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="card-elegant p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Advanced Charts
            </h3>
            <p className="text-muted-foreground text-sm">
              Interactive visualizations for portfolio performance, correlations, and risk analysis
            </p>
          </div>

          <div className="card-elegant p-6">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Real-time Data
            </h3>
            <p className="text-muted-foreground text-sm">
              Live price updates for stocks, funds, and cryptocurrencies
            </p>
          </div>

          <div className="card-elegant p-6">
            <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
              <PieChart className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Asset Allocation
            </h3>
            <p className="text-muted-foreground text-sm">
              Comprehensive breakdown of your portfolio composition
            </p>
          </div>

          <div className="card-elegant p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              AI Insights
            </h3>
            <p className="text-muted-foreground text-sm">
              Personalized recommendations and portfolio optimization suggestions
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 relative z-10">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20 p-12 text-center">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            Ready to optimize your portfolio?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of investors using Portfolio Analyzer to make smarter investment decisions
          </p>
          {!isAuthenticated && (
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Start Analyzing Now
              </Button>
              <Button
                onClick={() => setLocation("/demo")}
                variant="outline"
                size="lg"
                className="border-border hover:bg-muted"
              >
                View Demo First
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm py-8 mt-20 relative z-10 glass-effect">
        <div className="container text-center text-muted-foreground text-sm">
          <p>&copy; 2026 Portfolio Analyzer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
