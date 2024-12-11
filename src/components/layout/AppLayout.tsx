import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { UserMenu } from "./UserMenu";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col">
        <header className="h-16 px-6 flex items-center justify-end border-b bg-white/80 backdrop-blur-sm">
          <UserMenu />
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};