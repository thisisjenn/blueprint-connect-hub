import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Landing & Auth Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import NotFound from "./pages/NotFound";

// Contractor Dashboard
import { DashboardLayout } from "./components/layout/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import JobsPage from "./pages/dashboard/JobsPage";
import ClientsPage from "./pages/dashboard/ClientsPage";
import DocumentsPage from "./pages/dashboard/DocumentsPage";
import MessagesPage from "./pages/dashboard/MessagesPage";
import SchedulePage from "./pages/dashboard/SchedulePage";
import ContractsPage from "./pages/dashboard/ContractsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";

// Client Portal
import { ClientPortalLayout } from "./components/layout/ClientPortalLayout";
import PortalOverview from "./pages/portal/PortalOverview";
import PortalDocuments from "./pages/portal/PortalDocuments";
import PortalChecklist from "./pages/portal/PortalChecklist";
import PortalMessages from "./pages/portal/PortalMessages";
import PortalInvoices from "./pages/portal/PortalInvoices";
import PortalPhotos from "./pages/portal/PortalPhotos";

// Protected Route Component
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

// Component to handle role-based routing for authenticated users
function RoleBasedRedirect() {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  // Redirect based on role
  if (role === "client") {
    return <Navigate to="/portal" replace />;
  }

  if (role === "contractor") {
    return <Navigate to="/dashboard" replace />;
  }

  // If no role yet (might still be loading), show landing
  return <LandingPage />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<RoleBasedRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Contractor Dashboard (protected) */}
            <Route element={<ProtectedRoute allowedRoles={["contractor"]} />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardHome />} />
                <Route path="jobs" element={<JobsPage />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="schedule" element={<SchedulePage />} />
                <Route path="contracts" element={<ContractsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Client Portal (protected) */}
            <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
              <Route path="/portal" element={<ClientPortalLayout />}>
                <Route index element={<PortalOverview />} />
                <Route path="documents" element={<PortalDocuments />} />
                <Route path="checklist" element={<PortalChecklist />} />
                <Route path="messages" element={<PortalMessages />} />
                <Route path="invoices" element={<PortalInvoices />} />
                <Route path="photos" element={<PortalPhotos />} />
              </Route>
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
