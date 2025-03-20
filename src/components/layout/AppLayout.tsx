
import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { UserMenu } from "./UserMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Close sidebar automatically on mobile
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  return (
    <div className="min-h-screen flex w-full">
      {/* Desktop sidebar */}
      {!isMobile && (
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      )}

      {/* Mobile sidebar (using Sheet component) */}
      {isMobile && (
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0">
            <div className="h-full">
              <Sidebar isOpen={true} onToggle={() => {}} />
            </div>
          </SheetContent>
        </Sheet>
      )}

      <div className="flex-1 flex flex-col">
        <header className="h-16 px-4 sm:px-6 flex items-center justify-between border-b bg-white/80 backdrop-blur-sm">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className={isMobile ? "ml-4" : "hidden"}>
            <h1 className="font-semibold">Portfolio</h1>
          </div>
          <UserMenu />
        </header>
        <main className="flex-1 p-3 sm:p-6 overflow-auto touch-scroll">
          <div className="max-w-7xl mx-auto fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
