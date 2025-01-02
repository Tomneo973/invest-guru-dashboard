import { useQuery } from "@tanstack/react-query";
import { PortfolioChart } from "./PortfolioChart";
import { PortfolioSummary } from "./PortfolioSummary";
import { getPortfolioCurrentValue } from "@/services/yahooFinance";

export default function DashboardPage() {
  const { data: portfolioData, isLoading } = useQuery({
    queryKey: ["portfolio-value"],
    queryFn: getPortfolioCurrentValue,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      <PortfolioChart />
      <PortfolioSummary data={portfolioData} isLoading={isLoading} />
    </div>
  );
}