import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';

export const RoleBasedRedirect = () => {
  const navigate = useNavigate();
  const { isAdmin, isTeamLead, loading } = usePermissions();

  useEffect(() => {
    if (loading) return;

    // Redirect based on role
    if (isAdmin) {
      // Admins go to management dashboard
      navigate('/management-dashboard', { replace: true });
    } else if (isTeamLead) {
      // Team leads go to their team portal
      navigate('/my-team', { replace: true });
    } else {
      // Default fallback (agents or others)
      navigate('/my-team', { replace: true });
    }
  }, [isAdmin, isTeamLead, loading, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting...</p>
    </div>
  );
};
