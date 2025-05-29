
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/hooks/useUser";

type ProtectedRouteProps = {
  children: ReactNode;
  adminOnly?: boolean;
};

export const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { user, loading, forcePasswordChange } = useAuth();
  const { profile, loading: profileLoading, isAdmin } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  
  // For debugging
  useEffect(() => {
    console.log("ProtectedRoute check:", { 
      user: user?.email, 
      loading, 
      adminOnly, 
      path: location.pathname,
      forcePasswordChange,
      isAdmin
    });
  }, [user, loading, adminOnly, location, forcePasswordChange, isAdmin]);

  if (loading || profileLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    // Use Navigate component instead of imperative navigation
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Force password change on first login, but only if not already on the profile page
  if (forcePasswordChange && location.pathname !== '/profile') {
    return <Navigate to="/profile" replace />;
  }

  // Check for admin access if required
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
