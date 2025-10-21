
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthLayout } from "./components/auth/AuthLayout";
import { DateProvider } from "./context/DateContext";
import { NavBar } from "./components/NavBar";
import { useIdleTimer } from "./hooks/useIdleTimer";
import { IdleWarningDialog } from "./components/auth/IdleWarningDialog";
import { RoleBasedRedirect } from "./components/RoleBasedRedirect";

// Pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import TeamLeadDashboard from "./pages/team-lead-dashboard/TeamLeadDashboard";
import TeamLeadPortal from "./pages/team-lead/TeamLeadPortal";
import UserManagement from "./pages/admin/UserManagement";
import DebugDashboard from "./pages/admin/DebugDashboard";
import ServiceNowSettings from "./pages/admin/ServiceNowSettings";
import NotFound from "./pages/NotFound";
import TeamOverview from "./pages/TeamOverview";
import ProfilePage from "./pages/profile/ProfilePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 1000 * 60, // 1 minute
    },
  },
});

const AppContent = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // Idle timeout: 30 minutes with 5-minute warning
  const { showWarning, remainingTime, resetTimer } = useIdleTimer({
    timeout: 30 * 60 * 1000, // 30 minutes
    warningTime: 5 * 60 * 1000, // 5 minutes
    onIdle: async () => {
      await signOut();
      navigate('/login');
    },
  });

  return (
    <>
      <IdleWarningDialog
        open={showWarning}
        remainingTime={remainingTime}
        onContinue={resetTimer}
      />
      <Routes>
                {/* Auth Routes - Now inside AuthProvider */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                </Route>
                
                {/* Protected Routes */}
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <>
                        <NavBar />
                        <RoleBasedRedirect />
                      </>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Profile Page Route */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <>
                        <NavBar />
                        <ProfilePage />
                      </>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Team Lead Portal - For team leads only */}
                <Route 
                  path="/my-team" 
                  element={
                    <ProtectedRoute editorOrAdmin={true}>
                      <>
                        <NavBar />
                        <TeamLeadPortal />
                      </>
                    </ProtectedRoute>
                  } 
                />

                {/* Management Dashboard Route - Accessible by admins only */}
                <Route 
                  path="/management-dashboard" 
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <>
                        <NavBar />
                        <TeamOverview />
                      </>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Admin Routes */}
                <Route 
                  path="/admin/users" 
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <>
                        <NavBar />
                        <UserManagement />
                      </>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/admin/debug" 
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <>
                        <NavBar />
                        <DebugDashboard />
                      </>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/admin/servicenow" 
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <>
                        <NavBar />
                        <ServiceNowSettings />
                      </>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <DateProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </DateProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
