import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "./DashboardSidebar";

export function DashboardLayout() {
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
