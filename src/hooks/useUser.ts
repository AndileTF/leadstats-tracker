
import { useEffect, useState } from "react";
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
        // Since we're removing Supabase, we'll create a mock profile
        // You can replace this with your local database user management
        setProfile({
          id: user.id || 'local-user',
          email: user.email || 'admin@local.com',
          full_name: user.user_metadata?.full_name || 'Local Admin',
          role: 'admin', // Default to admin for local setup
          password_changed: true
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
