import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';

export const RoleBasedRedirect = () => {
  const navigate = useNavigate();
  const { isAdmin, isTeamLead, loading, roles } = usePermissions();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (loading || hasRedirected) return;

    console.log('RoleBasedRedirect - Roles:', roles);
    console.log('RoleBasedRedirect - isAdmin:', isAdmin);
    console.log('RoleBasedRedirect - isTeamLead:', isTeamLead);

    // Redirect based on role
    if (isAdmin) {
      console.log('Redirecting to management dashboard');
      setHasRedirected(true);
      navigate('/management-dashboard', { replace: true });
    } else if (isTeamLead) {
      console.log('Redirecting to my team portal');
      setHasRedirected(true);
      navigate('/my-team', { replace: true });
    } else {
      console.log('No specific role, redirecting to my team');
      setHasRedirected(true);
      navigate('/my-team', { replace: true });
    }
  }, [isAdmin, isTeamLead, loading, navigate, hasRedirected, roles]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting...</p>
    </div>
  );
};
