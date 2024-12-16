import { PortfolioChart } from "./PortfolioChart";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      <PortfolioChart />
    </div>
  );
}