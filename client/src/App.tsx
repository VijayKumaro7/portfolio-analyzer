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

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/demo"} component={DemoMode} />
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/dashboard"}>
        {() => (
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/portfolio/:portfolioId"}>
        {(params) => (
          <DashboardLayout>
            <PortfolioDetail portfolioId={parseInt(params.portfolioId)} />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/asset/:holdingId"}>
        {(params) => (
          <DashboardLayout>
            <AssetDetail holdingId={parseInt(params.holdingId)} />
          </DashboardLayout>
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
