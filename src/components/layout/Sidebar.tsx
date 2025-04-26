
import { Link, useLocation } from "react-router-dom";
import { Building, ChartBar, LineChart, DollarSign, LayoutDashboard, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: LineChart, label: "Transactions", path: "/transactions" },
  { icon: ChartBar, label: "Statistiques", path: "/statistics" },
  { icon: DollarSign, label: "Dividendes", path: "/dividends" },
  { icon: Building, label: "Immobilier", path: "/real-estate" },
  { icon: Search, label: "Analyse d'action", path: "/stock-analysis" },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();

  if (!isOpen) return null;

  return (
    <aside
      className={cn(
        "bg-white border-r transition-all duration-300 flex flex-col",
        isOpen ? (isMobile ? "w-full" : "w-64") : "w-0"
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b">
        <h1 className="font-semibold">Portfolio</h1>
        {!isMobile && (
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isOpen ? "M15 19l-7-7 7-7" : "M9 19l7-7-7-7"}
              />
            </svg>
          </button>
        )}
      </div>
      <nav className="flex-1 py-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors gap-3",
              location.pathname === item.path && "bg-gray-100 text-gray-900"
            )}
            onClick={isMobile ? onToggle : undefined}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};
