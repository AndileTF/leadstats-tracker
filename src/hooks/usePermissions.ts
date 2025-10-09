import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type AppRole = 'admin' | 'team_lead' | 'agent';

type Permissions = {
  canViewAllStats: boolean;
  canViewTeamStats: boolean;
  canViewOwnStats: boolean;
  canManageUsers: boolean;
  canManageTeam: boolean;
  canExportData: boolean;
  canImportData: boolean;
  canAccessAdminPanel: boolean;
};

export const usePermissions = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [permissions, setPermissions] = useState<Permissions>({
    canViewAllStats: false,
    canViewTeamStats: false,
    canViewOwnStats: false,
    canManageUsers: false,
    canManageTeam: false,
    canExportData: false,
    canImportData: false,
    canAccessAdminPanel: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user) {
        setRoles([]);
        setPermissions({
          canViewAllStats: false,
          canViewTeamStats: false,
          canViewOwnStats: false,
          canManageUsers: false,
          canManageTeam: false,
          canExportData: false,
          canImportData: false,
          canAccessAdminPanel: false,
        });
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) throw error;

        const userRoles = data?.map(r => r.role as AppRole) || [];
        setRoles(userRoles);

        // Calculate permissions based on roles
        const isAdmin = userRoles.includes('admin');
        const isTeamLead = userRoles.includes('team_lead');
        const isAgent = userRoles.includes('agent');

        setPermissions({
          canViewAllStats: isAdmin,
          canViewTeamStats: isAdmin || isTeamLead,
          canViewOwnStats: true, // Everyone can view their own stats
          canManageUsers: isAdmin,
          canManageTeam: isAdmin || isTeamLead,
          canExportData: isAdmin || isTeamLead,
          canImportData: isAdmin || isTeamLead,
          canAccessAdminPanel: isAdmin,
        });
      } catch (error: any) {
        console.error("Error fetching user roles:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user permissions",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();

    // Set up real-time subscription for role changes
    const channel = supabase
      .channel('user_roles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchUserRoles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const hasRole = (role: AppRole): boolean => {
    return roles.includes(role);
  };

  const hasAnyRole = (checkRoles: AppRole[]): boolean => {
    return checkRoles.some(role => roles.includes(role));
  };

  const isAdmin = hasRole('admin');
  const isTeamLead = hasRole('team_lead');
  const isAgent = hasRole('agent');

  return {
    roles,
    permissions,
    loading,
    hasRole,
    hasAnyRole,
    isAdmin,
    isTeamLead,
    isAgent,
  };
};
