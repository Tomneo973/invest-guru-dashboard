
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import TransactionsPage from "./pages/transactions/TransactionsPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import StatisticsPage from "./pages/statistics/StatisticsPage";
import DividendsPage from "./pages/dividends/DividendsPage";
import StockAnalysisPage from "./pages/stock-analysis/StockAnalysisPage";
import ProfilePage from "./pages/profile/ProfilePage";
import SubscriptionPage from "./pages/subscription/SubscriptionPage";
import AdminPage from "./pages/admin/AdminPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const LayoutRoute = ({ 
  children,
  requireAuth = true,
  requirePremium = false
}: { 
  children: React.ReactNode;
  requireAuth?: boolean;
  requirePremium?: boolean;
}) => (
  <ProtectedRoute requireAuth={requireAuth} requirePremium={requirePremium}>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Index />} />
            <Route
              path="/dashboard"
              element={
                <LayoutRoute>
                  <DashboardPage />
                </LayoutRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <LayoutRoute>
                  <TransactionsPage />
                </LayoutRoute>
              }
            />
            <Route
              path="/statistics"
              element={
                <LayoutRoute requirePremium>
                  <StatisticsPage />
                </LayoutRoute>
              }
            />
            <Route
              path="/dividends"
              element={
                <LayoutRoute>
                  <DividendsPage />
                </LayoutRoute>
              }
            />
            <Route
              path="/stock-analysis"
              element={
                <LayoutRoute requirePremium>
                  <StockAnalysisPage />
                </LayoutRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <LayoutRoute>
                  <ProfilePage />
                </LayoutRoute>
              }
            />
            <Route
              path="/subscription"
              element={
                <LayoutRoute requirePremium={false}>
                  <SubscriptionPage />
                </LayoutRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <LayoutRoute>
                  <AdminPage />
                </LayoutRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
