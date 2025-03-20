
import { PortfolioChart } from "./PortfolioChart";
import { PortfolioSummaryTable } from "./PortfolioSummaryTable";
import { useIsMobile } from "@/hooks/use-mobile";

export default function DashboardPage() {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl sm:text-3xl font-bold">Dashboard</h1>
      </div>
      <div className="w-full overflow-hidden">
        <PortfolioChart />
      </div>
      <div className={isMobile ? "responsive-table-container" : ""}>
        <PortfolioSummaryTable />
      </div>
    </div>
  );
}
