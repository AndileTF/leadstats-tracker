
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

type ProtectedRouteProps = {
  children: ReactNode;
  adminOnly?: boolean;
};

export const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // For debugging
  useEffect(() => {
    console.log("ProtectedRoute check:", { user: user?.email, loading, adminOnly, path: location.pathname });
  }, [user, loading, adminOnly, location]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    // Use Navigate component instead of imperative navigation
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If adminOnly checking is needed, you would do additional checks here
  // using the useUser hook to get the role information

  return <>{children}</>;
};
