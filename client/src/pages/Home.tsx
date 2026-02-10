import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { TrendingUp, BarChart3, Zap, Shield, LineChart, Sparkles, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { MobileNav } from "@/components/MobileNav";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  // Scroll reveal hooks for different sections
  const heroSection = useScrollReveal({ threshold: 0.2 });
  const featuresSection = useScrollReveal({ threshold: 0.15 });
  const analyticsSection = useScrollReveal({ threshold: 0.15 });
  const securitySection = useScrollReveal({ threshold: 0.15 });
  const ctaSection = useScrollReveal({ threshold: 0.2 });

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const handleDashboard = () => {
    setLocation("/dashboard");
  };

  const handleDemo = () => {
    setLocation("/demo");
  };

  const handlePricing = () => {
    setLocation("/pricing");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl animate-float-slow"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl animate-float-slower"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/40 transition-all duration-300 ease-out">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Portfolio Analyzer
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleDemo}
              className="text-foreground hover:text-primary transition-all duration-300 ease-out hover:scale-105"
            >
              Try Demo
            </Button>
            <Button
              variant="ghost"
              onClick={handlePricing}
              className="text-foreground hover:text-primary transition-all duration-300 ease-out hover:scale-105"
            >
              Pricing
            </Button>
            <Button
              variant="ghost"
              onClick={() => setLocation("/blog")}
              className="text-foreground hover:text-primary transition-all duration-300 ease-out hover:scale-105"
            >
              Blog
            </Button>
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Welcome, {user?.name || "User"}
                </span>
                <Button
                  onClick={handleDashboard}
                  className="bg-primary hover:bg-primary/90"
                >
                  Dashboard
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-border hover:bg-muted gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="bg-primary hover:bg-primary/90"
              >
                Login
              </Button>
            )}
          </div>

          <MobileNav
            isAuthenticated={isAuthenticated}
            userName={user?.name || undefined}
            onDashboard={handleDashboard}
            onDemo={handleDemo}
            onPricing={handlePricing}
            onBlog={() => setLocation("/blog")}
            onLogout={handleLogout}
            onLogin={() => (window.location.href = getLoginUrl())}
          >
            <div className="px-4 py-2">
              <ThemeToggle />
            </div>
          </MobileNav>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 fade-in">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight">
                  <span className="gradient-text">Elegant Portfolio</span>
                  <br />
                  <span className="gradient-text">Management</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
                  Analyze your investment portfolio with sophisticated visualizations, real-time price updates, and AI-powered recommendations. Track stocks, funds, and cryptocurrencies all in one elegant platform.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-primary uppercase tracking-wide">
                  ✨ What You Get
                </p>
                <ul className="space-y-2 text-foreground">
                <li className="flex items-center gap-3 transition-all duration-300 ease-out hover:translate-x-1">
                  <BarChart3 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Advanced portfolio analytics and visualizations</span>
                </li>
                <li className="flex items-center gap-3 transition-all duration-300 ease-out hover:translate-x-1">
                  <TrendingUp className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Real-time market data and price updates</span>
                </li>
                <li className="flex items-center gap-3 transition-all duration-300 ease-out hover:translate-x-1">
                  <Zap className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>AI-powered investment recommendations</span>
                </li>
                <li className="flex items-center gap-3 transition-all duration-300 ease-out hover:translate-x-1">
                  <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Secure portfolio management and PDF reports</span>
                </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {isAuthenticated ? (
                  <Button
                    onClick={handleDashboard}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 h-auto"
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <Button
                    onClick={() => (window.location.href = getLoginUrl())}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 h-auto"
                  >
                    Get Started
                  </Button>
                )}
                <Button
                  onClick={handleDemo}
                  size="lg"
                  variant="outline"
                  className="border-border hover:bg-muted text-lg px-8 py-6 h-auto"
                >
                  Explore Demo
                </Button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative h-64 sm:h-80 md:h-96 lg:h-full min-h-64 fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-2xl"></div>
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663301308772/PgaBfRefFjisqynO.jpg"
                alt="Portfolio Dashboard"
                className="relative w-full h-full object-cover rounded-2xl shadow-2xl hover-lift transition-all duration-500 ease-out hover:shadow-2xl hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div ref={featuresSection.ref} className={`text-center mb-16 fade-in scroll-reveal ${featuresSection.isVisible ? 'visible' : ''}`}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 gradient-text">
              Powerful Features for Smart Investors
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Everything you need to make informed investment decisions with confidence and clarity.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 scroll-reveal-stagger" ref={featuresSection.ref}>
            {/* Feature 1 */}
            <Card className="card-elegant p-6 sm:p-8 hover-lift fade-in card-hover scroll-reveal" style={{ animationDelay: "0.3s" }}>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <LineChart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3 gradient-text">
                Advanced Analytics
              </h3>
              <p className="text-muted-foreground">
                Visualize your portfolio with interactive charts, technical indicators, and correlation matrices. Understand your asset allocation and performance trends at a glance.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="card-elegant p-8 hover-lift fade-in card-hover scroll-reveal" style={{ animationDelay: "0.2s" }}>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3 gradient-text">
                Real-Time Insights
              </h3>
              <p className="text-muted-foreground">
                Get live stock prices, cryptocurrency rates, and fund values powered by Alpha Vantage. Stay updated with current market data and portfolio valuations.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="card-elegant p-8 hover-lift fade-in card-hover scroll-reveal" style={{ animationDelay: "0.3s" }}>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3 gradient-text">
                AI Recommendations
              </h3>
              <p className="text-muted-foreground">
                Receive personalized investment recommendations and risk assessments powered by advanced AI analysis of your portfolio holdings.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features with Images */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-20">
          {/* Feature Row 1 */}
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div ref={analyticsSection.ref} className={`fade-in scroll-reveal-left ${analyticsSection.isVisible ? 'visible' : ''}`}>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 gradient-text">
                Comprehensive Analytics
              </h3>
              <p className="text-base sm:text-lg text-muted-foreground mb-6">
                Dive deep into your portfolio with advanced analytics. Analyze correlation matrices, risk-return relationships, and asset allocation breakdowns. Use technical indicators like moving averages, MACD, and RSI to identify trends and make data-driven decisions.
              </p>
              <ul className="space-y-3 text-foreground">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Interactive charts with date range selectors</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Technical indicators and trend analysis</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Risk metrics and volatility calculations</span>
                </li>
              </ul>
            </div>
            <div ref={analyticsSection.ref} className={`relative h-64 sm:h-80 md:h-96 fade-in scroll-reveal-right ${analyticsSection.isVisible ? 'visible' : ''}`} style={{ animationDelay: "0.2s" }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-2xl"></div>
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663301308772/SROkcGHEVOzRpyCZ.jpg"
                alt="Analytics Dashboard"
                className="relative w-full h-full object-cover rounded-2xl shadow-2xl hover-lift transition-all duration-500 ease-out hover:shadow-2xl hover:scale-105"
              />
            </div>
          </div>

          {/* Feature Row 2 */}
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div ref={securitySection.ref} className={`relative h-64 sm:h-80 md:h-96 fade-in scroll-reveal-left ${securitySection.isVisible ? 'visible' : ''}`} style={{ animationDelay: "0.1s" }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-2xl"></div>
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663301308772/OwnlAJdQDRaRsagT.jpg"
                alt="Security & Protection"
                className="relative w-full h-full object-cover rounded-2xl shadow-2xl hover-lift transition-all duration-500 ease-out hover:shadow-2xl hover:scale-105"
              />
            </div>
            <div ref={securitySection.ref} className={`fade-in scroll-reveal-right ${securitySection.isVisible ? 'visible' : ''}`} style={{ animationDelay: "0.2s" }}>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 gradient-text">
                Secure & Reliable
              </h3>
              <p className="text-base sm:text-lg text-muted-foreground mb-6">
                Your portfolio data is protected with enterprise-grade security. Generate detailed PDF reports of your holdings and performance, stored securely in the cloud. Export and share your analysis with confidence.
              </p>
              <ul className="space-y-3 text-foreground">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Secure authentication and data encryption</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>PDF report generation and cloud storage</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Multi-device synchronization</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm">
        <div ref={ctaSection.ref} className={`max-w-4xl mx-auto text-center fade-in scroll-reveal-scale ${ctaSection.isVisible ? 'visible' : ''}`}>
          <h2 className="text-4xl font-bold text-foreground mb-6 gradient-text">
            Ready to Master Your Investments?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start analyzing your portfolio today with our elegant and powerful platform. Join investors who trust us for their portfolio management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Button
                onClick={handleDashboard}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 h-auto"
              >
                Open Dashboard
              </Button>
            ) : (
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 h-auto"
              >
                Get Started Free
              </Button>
            )}
            <Button
              onClick={handleDemo}
              size="lg"
              variant="outline"
              className="border-border hover:bg-muted text-lg px-8 py-6 h-auto"
            >
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border/40 bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-foreground">Portfolio Analyzer</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Elegant investment portfolio management for modern investors.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">Features</a></li>
                <li><a href="#" className="hover:text-primary transition">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">About</a></li>
                <li><a href="#" className="hover:text-primary transition">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition">Terms</a></li>
                <li><a href="#" className="hover:text-primary transition">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 Portfolio Analyzer. All rights reserved. Powered by cutting-edge technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
