// src/components/layout/StakeholderLayout.jsx
import { Outlet } from "react-router-dom";
import { AppSidebar } from "../AppSidebar"; // we'll make it role-aware
import { SidebarProvider } from "@/components/ui/sidebar";

export const StakeholderLayout = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex">
        <AppSidebar /> {/* Now shows only stakeholder items */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-8 bg-gray-50 flex-grow">
            {children || <Outlet />}
          </div>
          <footer className="border-t border-border py-4 px-6 bg-white flex justify-center lg:justify-end">
            <a
              href="/srap-landing"
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
            >
              <span>SRAP 2.0 Overview</span>
            </a>
          </footer>
        </main>
      </div>
    </SidebarProvider>
  );
};
