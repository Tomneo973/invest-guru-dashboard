
import { Link, useLocation } from "react-router-dom";
import { ChartBar, LineChart, DollarSign, LayoutDashboard, Search, Star, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  isPremium?: boolean;
  isAdmin?: boolean;
}

export const Sidebar = ({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { isPremium, isAdmin } = useAuth();

  const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: LineChart, label: "Transactions", path: "/transactions" },
    { icon: ChartBar, label: "Statistiques", path: "/statistics", isPremium: true },
    { icon: DollarSign, label: "Dividendes", path: "/dividends" },
    { icon: Search, label: "Analyse d'action", path: "/stock-analysis", isPremium: true },
    { icon: Star, label: "Abonnement", path: "/subscription" },
  ];

  // Ajouter l'option d'administration seulement pour les admins
  if (isAdmin) {
    menuItems.push({ icon: ShieldCheck, label: "Administration", path: "/admin", isAdmin: true });
  }

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
        {menuItems.map((item) => {
          // Skip premium items for non-premium users UNLESS it's the subscription page
          const isPremiumItem = item.isPremium && !isPremium && item.path !== "/subscription";
          // Skip admin items for non-admin users
          const isAdminItem = item.isAdmin && !isAdmin;
          
          if (isPremiumItem || isAdminItem) return null;
          
          return (
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
              {item.isPremium && (
                <Badge className="ml-auto bg-amber-500 hover:bg-amber-500">
                  <Star className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
              {item.isAdmin && (
                <Badge className="ml-auto bg-purple-500 hover:bg-purple-500">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
