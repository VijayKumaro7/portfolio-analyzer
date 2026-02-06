import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
  Download,
} from "lucide-react";

const TIER_COLORS = {
  free: "#8b5cf6",
  pro: "#3b82f6",
  premium: "#ec4899",
};

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const [currentPage, setCurrentPage] = useState(0);

  // Check if user is admin
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border border-border/50 bg-card/50 p-12 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You do not have permission to access this page. Only administrators can view analytics.
          </p>
          <Button onClick={() => setLocation("/")} variant="outline">
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }

  // Fetch admin analytics data
  const { data: metricsData, isLoading: isLoadingMetrics } =
    trpc.adminAnalytics.subscriptionMetrics.useQuery();
  const { data: usersData, isLoading: isLoadingUsers } =
    trpc.adminAnalytics.activeUsers.useQuery();
  const { data: revenueData, isLoading: isLoadingRevenue } =
    trpc.adminAnalytics.revenueAnalytics.useQuery();
  const { data: userManagementData, isLoading: isLoadingUserMgmt } =
    trpc.adminAnalytics.userManagement.useQuery({
      limit: 10,
      offset: currentPage * 10,
    });

  const isLoading =
    isLoadingMetrics ||
    isLoadingUsers ||
    isLoadingRevenue ||
    isLoadingUserMgmt;

  // Prepare chart data
  const tierDistributionData = metricsData
    ? [
        { name: "Free", value: metricsData.tierDistribution.free },
        { name: "Pro", value: metricsData.tierDistribution.pro },
        { name: "Premium", value: metricsData.tierDistribution.premium },
      ]
    : [];

  const revenueChartData = [
    {
      name: "Last Month",
      revenue: revenueData?.lastMonthRevenue || 0,
    },
    {
      name: "This Month",
      revenue: revenueData?.thisMonthRevenue || 0,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Admin Analytics Dashboard
              </h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                // Export functionality would go here
                console.log("Export analytics data");
              }}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="h-32 bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card className="border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">
                      Monthly Recurring Revenue
                    </span>
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">
                    ${metricsData?.mrr.toFixed(2) || "0.00"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {metricsData?.totalSubscribers || 0} active subscribers
                  </p>
                </div>
              </Card>

              <Card className="border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">
                      Churn Rate
                    </span>
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">
                    {metricsData?.churnRate.toFixed(2) || "0.00"}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This month
                  </p>
                </div>
              </Card>

              <Card className="border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">
                      Active Users
                    </span>
                    <Users className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">
                    {usersData?.lastThirtyDays || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last 30 days
                  </p>
                </div>
              </Card>

              <Card className="border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">
                      Total Revenue
                    </span>
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">
                    ${revenueData?.totalRevenue.toFixed(2) || "0.00"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    All time
                  </p>
                </div>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Tier Distribution */}
              <Card className="border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  Subscription Tier Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={tierDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill={TIER_COLORS.free} />
                      <Cell fill={TIER_COLORS.pro} />
                      <Cell fill={TIER_COLORS.premium} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              {/* Revenue Trend */}
              <Card className="border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  Revenue Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #333",
                      }}
                    />
                    <Bar dataKey="revenue" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Top Paying Users */}
            <Card className="border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-foreground mb-4">
                Top Paying Users
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                        User ID
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                        Name
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-muted-foreground">
                        Monthly Spend
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData?.topPayingUsers.map((user: any) => (
                      <tr
                        key={user.userId}
                        className="border-b border-border/20 hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 px-4 text-foreground">
                          #{user.userId}
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          {user.userName}
                        </td>
                        <td className="py-3 px-4 text-right text-foreground font-semibold">
                          ${user.totalSpent.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* User Management */}
            <Card className="border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-foreground mb-4">
                User Management
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                        Role
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                        Subscription
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userManagementData?.users.map((u: any) => (
                      <tr
                        key={u.id}
                        className="border-b border-border/20 hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 px-4 text-foreground">
                          {u.name || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-foreground text-xs">
                          {u.email || "N/A"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              u.role === "admin"
                                ? "bg-red-100/20 text-red-400"
                                : "bg-blue-100/20 text-blue-400"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              u.subscriptionTier === "premium"
                                ? "bg-pink-100/20 text-pink-400"
                                : u.subscriptionTier === "pro"
                                  ? "bg-blue-100/20 text-blue-400"
                                  : "bg-purple-100/20 text-purple-400"
                            }`}
                          >
                            {u.subscriptionTier}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage + 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={
                    !userManagementData ||
                    userManagementData.users.length < 10
                  }
                >
                  Next
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
