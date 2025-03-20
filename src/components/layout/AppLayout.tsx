
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
    <div className="min-h-screen flex flex-col w-full">
      {/* Desktop sidebar - left side */}
      {!isMobile && (
        <div className="flex flex-1 min-h-screen">
          <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex-1 flex flex-col">
            <header className="h-16 px-4 sm:px-6 flex items-center justify-between border-b bg-white/80 backdrop-blur-sm">
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
      )}

      {/* Mobile layout - menu at top, content below */}
      {isMobile && (
        <>
          {/* Fixed top header on mobile */}
          <header className="fixed top-0 left-0 right-0 z-40 h-16 px-4 flex items-center justify-between border-b bg-white/95 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="ml-4">
              <h1 className="font-semibold">Portfolio</h1>
            </div>
            <UserMenu />
          </header>

          {/* Mobile menu sheet */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="top" className="pt-16 px-0">
              <div className="h-full max-h-[80vh] overflow-y-auto">
                <Sidebar isOpen={true} onToggle={() => {}} />
              </div>
            </SheetContent>
          </Sheet>

          {/* Main content area - with padding to account for fixed header */}
          <main className="flex-1 pt-20 px-3 pb-4 overflow-auto touch-scroll">
            <div className="max-w-7xl mx-auto fade-in">
              {children}
            </div>
          </main>
        </>
      )}
    </div>
  );
};
