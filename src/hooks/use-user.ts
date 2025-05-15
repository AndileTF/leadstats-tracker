
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
  status: string;
  avatar_url?: string; // Make this optional since it might not exist
};

type UseUserReturn = {
  user: (UserProfile & { email: string }) | null;
  isLoading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
};

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<(UserProfile & { email: string }) | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoading(true);
        if (!session) {
          setUser(null);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        try {
          // Use RPC function to avoid infinite recursion in RLS policies
          const { data, error } = await supabase
            .rpc('get_profile_role', { user_id: session.user.id });

          if (error) {
            console.error('Error fetching user role:', error);
            throw error;
          }

          // Construct user profile manually with auth data
          const userData = {
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || null,
            role: data || 'editor',
            created_at: session.user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: 'active',
          } as UserProfile & { email: string };
          
          // If avatar_url exists in user_metadata, add it
          if (session.user.user_metadata?.avatar_url) {
            userData.avatar_url = session.user.user_metadata.avatar_url as string;
          }
          
          setUser(userData);
          setIsAdmin(data === 'admin');
        } catch (error) {
          console.error('Error loading user data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    );

    // Initial check for session
    const fetchUserData = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setUser(null);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        // Use RPC function to avoid infinite recursion in RLS policies
        const { data, error } = await supabase
          .rpc('get_profile_role', { user_id: session.user.id });

        if (error) {
          console.error('Error fetching user role:', error);
          throw error;
        }

        // Construct user profile manually with auth data
        const userData = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || null,
          role: data || 'editor',
          created_at: session.user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'active',
        } as UserProfile & { email: string };
        
        // If avatar_url exists in user_metadata, add it
        if (session.user.user_metadata?.avatar_url) {
          userData.avatar_url = session.user.user_metadata.avatar_url as string;
        }
        
        setUser(userData);
        setIsAdmin(data === 'admin');
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    isLoading,
    isAdmin,
    signOut
  };
}
