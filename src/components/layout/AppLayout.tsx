
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { UserMenu } from "./UserMenu";
import { useIsMobile } from "@/hooks/use-mobile";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar isOpen={!isMobile && sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col">
        <header className="h-16 px-4 sm:px-6 flex items-center justify-between border-b bg-white/80 backdrop-blur-sm">
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}
          <div className="flex-1" />
          <UserMenu />
        </header>
        <main className="flex-1 p-3 sm:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto fade-in">
            {children}
          </div>
        </main>
      </div>
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        >
          <div 
            className="w-64 h-full bg-white" 
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar isOpen={true} onToggle={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
