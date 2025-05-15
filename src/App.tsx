
import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { supabase } from "./integrations/supabase/client";
import { ThemeProvider } from "./components/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Index from "./pages/Index";
import TeamOverview from "./pages/TeamOverview";
import TeamLeadDashboard from "./pages/team-lead-dashboard/TeamLeadDashboard";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";
import AuthLayout from "./components/AuthLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Diagnostics from "./pages/Diagnostics";

function App() {
  const { toast } = useToast();

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-react-theme">
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Index />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/team-overview" element={<TeamOverview />} />
              <Route path="/team-lead-dashboard" element={<TeamLeadDashboard />} />
              <Route path="/user-management" element={<UserManagement />} />
              <Route path="/diagnostics" element={<Diagnostics />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
