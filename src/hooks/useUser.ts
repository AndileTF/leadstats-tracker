
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
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

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        // Using RPC function to avoid infinite recursion in policies
        const { data, error } = await supabase.rpc('get_profile_role', {
          user_id: user.id
        });
        
        if (error) throw error;
        
        // Get additional profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        // Create profile object with data we have
        setProfile({
          id: user.id,
          email: user.email || '',
          full_name: profileData?.full_name || user.user_metadata?.full_name || null,
          role: data || 'editor', // Default to editor if no role found
          password_changed: profileData?.password_changed
        });
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
    isAdmin: profile?.role === 'admin',
    isEditor: profile?.role === 'editor',
    isViewer: profile?.role === 'viewer'
  };
};
