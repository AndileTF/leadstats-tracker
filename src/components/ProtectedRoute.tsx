
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  children?: React.ReactNode;
}

const ProtectedRoute = ({ 
  requireAuth = true, 
  requireAdmin = false,
  children 
}: ProtectedRouteProps) => {
  const { session, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3">Loading...</span>
      </div>
    );
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !session) {
    console.log('ProtectedRoute: Redirecting to login - no session');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If admin access is required but user is not an admin
  if (requireAdmin && !isAdmin) {
    console.log('ProtectedRoute: Redirecting to home - not admin');
    return <Navigate to="/" state={{ from: location.pathname }} replace />;
  }

  // Return children or Outlet (for nested routes)
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
