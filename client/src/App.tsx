import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import PortfolioDetail from "./pages/PortfolioDetail";
import AssetDetail from "./pages/AssetDetail";
import DemoMode from "./pages/DemoMode";
import Pricing from "./pages/Pricing";
import SubscriptionPage from "./pages/SubscriptionPage";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import AdminDashboard from "./pages/AdminDashboard";

function Router() {
  return (
    <Switch>
      <Route path={"\\"} component={Home} />
      <Route path={"/demo"} component={DemoMode} />
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/subscription"} component={SubscriptionPage} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/blog/:slug"} component={BlogArticle} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/dashboard"}> 
        {() => (
          <div className="page-enter">
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </div>
        )}
      </Route>
      <Route path={"/portfolio/:portfolioId"}>
        {(params) => (
          <div className="page-enter">
            <DashboardLayout>
              <PortfolioDetail portfolioId={parseInt(params.portfolioId)} />
            </DashboardLayout>
          </div>
        )}
      </Route>
      <Route path={"/asset/:holdingId"}>
        {(params) => (
          <div className="page-enter">
            <DashboardLayout>
              <AssetDetail holdingId={parseInt(params.holdingId)} />
            </DashboardLayout>
          </div>
        )}
      </Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
