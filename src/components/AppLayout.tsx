import { Outlet } from "react-router";
import { SidebarInset, SidebarProvider } from "./ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Header } from "./Header";
import { Toaster } from "./ui/sonner";

/**
 * Pure layout component - handles structure only
 * No data fetching, loading states, or business logic
 */
export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="p-4 pt-0">
          <Outlet />
          <Toaster />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
