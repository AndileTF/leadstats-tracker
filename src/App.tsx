import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "./integrations/supabase/client";
import { ThemeProvider } from "@/components/theme-provider"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

import Login from "./pages/Login";
import Index from "./pages/Index";
import TeamOverview from "./pages/TeamOverview";
import TeamLeadDashboard from "./pages/team-lead-dashboard/TeamLeadDashboard";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Diagnostics from "./pages/Diagnostics";

interface Props {
  children?: React.ReactNode;
}

function App() {
  return (
    <ThemeProvider
      defaultTheme="dark"
      storageKey="vite-react-theme"
    >
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

function AppContent() {
  const { toast } = useToast()
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <>
      {session ? (
        <div className="flex flex-col h-screen">
          <Navbar />
          <div className="container pt-2 mx-auto">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/team-overview" element={<TeamOverview />} />
                <Route path="/team-lead-dashboard" element={<TeamLeadDashboard />} />
                <Route path="/user-management" element={<UserManagement />} />
                <Route path="/diagnostics" element={<Diagnostics />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      ) : (
        <>
          <Login />
        </>
      )}
      <Toaster />
    </>
  )
}

function AuthProvider({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;

      // If there's no user and the current path is not /login, redirect to /login
      if (!user && location.pathname !== '/login') {
        navigate('/login');
      }
      // If there is a user and the current path is /login, redirect to /team-overview
      else if (user && location.pathname === '/login') {
        navigate('/team-overview');
      }
    };

    handleAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, navigate]);

  return <>{children}</>;
}

function ProtectedRoute({ children }: Props) {
  const [session, setSession] = useState(null)
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  useEffect(() => {
    if (!session && location.pathname !== '/login') {
      navigate('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, navigate]);

  if (!session) {
    return null;
  }

  return <>{children}</>;
}

export default App
