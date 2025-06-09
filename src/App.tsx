
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthLayout } from "./components/auth/AuthLayout";
import { DateProvider } from "./context/DateContext";
import { NavBar } from "./components/NavBar";

// Pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import TeamLeadDashboard from "./pages/team-lead-dashboard/TeamLeadDashboard";
import UserManagement from "./pages/admin/UserManagement";
import DebugDashboard from "./pages/admin/DebugDashboard";
import NotFound from "./pages/NotFound";
import TeamOverview from "./pages/TeamOverview";
import ProfilePage from "./pages/profile/ProfilePage";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <DateProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
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
                        <TeamOverview />
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
                
                {/* Team Lead Dashboard Route - Accessible by editors and admins */}
                <Route 
                  path="/team-lead-dashboard" 
                  element={
                    <ProtectedRoute editorOrAdmin={true}>
                      <>
                        <NavBar />
                        <TeamLeadDashboard />
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
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </DateProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
