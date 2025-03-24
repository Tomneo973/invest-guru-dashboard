
import { PortfolioChart } from "./PortfolioChart";
import { PortfolioSummaryTable } from "./PortfolioSummaryTable";
import { useIsMobile } from "@/hooks/use-mobile";

export default function DashboardPage() {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
      </div>
      <PortfolioChart />
      <PortfolioSummaryTable />
    </div>
  );
}
