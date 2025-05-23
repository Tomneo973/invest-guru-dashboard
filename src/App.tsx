
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
import RealEstatePage from "./pages/real-estate/RealEstatePage";
import StockAnalysisPage from "./pages/stock-analysis/StockAnalysisPage";
import ProfilePage from "./pages/profile/ProfilePage";
import AdminPage from "./pages/admin/AdminPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = true;
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

const LayoutRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
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
              <LayoutRoute>
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
            path="/real-estate"
            element={
              <LayoutRoute>
                <RealEstatePage />
              </LayoutRoute>
            }
          />
          <Route
            path="/stock-analysis"
            element={
              <LayoutRoute>
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
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
