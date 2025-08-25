
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  password_changed: boolean | null;
};

export const useUser = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<string>('agent');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        // Get user roles from the new role system
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (rolesError) {
          console.error('Error fetching user roles:', rolesError);
        }

        // Determine highest role
        let highestRole = 'agent';
        if (rolesData && rolesData.length > 0) {
          const roles = rolesData.map(r => r.role);
          if (roles.includes('admin')) {
            highestRole = 'admin';
          } else if (roles.includes('team_lead')) {
            highestRole = 'team_lead';
          }
        }

        setUserRole(highestRole);

        if (profileData) {
          setProfile({
            ...profileData,
            role: highestRole // Override with actual role from user_roles
          });
        } else {
          // Create a basic profile if none exists
          const newProfile = {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || null,
            role: highestRole,
            password_changed: true
          };

          // Insert the new profile into the database
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || null,
              role: highestRole
            });

          if (insertError) {
            console.error('Error creating user profile:', insertError);
          }

          setProfile(newProfile);
        }
      } catch (error: any) {
        console.error("Error loading user data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user profile data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return { 
    profile, 
    loading, 
    isAdmin: userRole === 'admin',
    isTeamLead: userRole === 'team_lead' || userRole === 'admin',
    isEditor: userRole === 'team_lead' || userRole === 'admin', // Team leads can edit
    isViewer: true // All users can view
  };
};
