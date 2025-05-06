
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TeamOverview from "./pages/TeamOverview";
import { DateProvider } from "./context/DateContext";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import UserManagement from "./pages/UserManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthLayout from "./components/AuthLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DateProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route 
                  path="/" 
                  element={
                    <AuthLayout>
                      <TeamOverview />
                    </AuthLayout>
                  } 
                />
                <Route 
                  path="/team-lead-dashboard" 
                  element={
                    <AuthLayout>
                      <Index />
                    </AuthLayout>
                  } 
                />
                
                {/* Admin route */}
                <Route 
                  path="/users" 
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AuthLayout>
                        <UserManagement />
                      </AuthLayout>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </DateProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
