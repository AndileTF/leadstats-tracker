
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
          // Fetch user profile
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) throw error;

          // Merge profile data with auth data
          const userData = {
            ...data,
            email: session.user.email || '',
          } as UserProfile & { email: string };
          
          // Only add avatar_url if it exists in data
          if ('avatar_url' in data && data.avatar_url) {
            userData.avatar_url = data.avatar_url;
          }
          
          setUser(userData);
          setIsAdmin(data.role === 'admin');
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
        // Fetch user profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        // Merge profile data with auth data
        const userData = {
          ...data,
          email: session.user.email || '',
        } as UserProfile & { email: string };
        
        // Only add avatar_url if it exists in data
        if ('avatar_url' in data && data.avatar_url) {
          userData.avatar_url = data.avatar_url;
        }
        
        setUser(userData);
        setIsAdmin(data.role === 'admin');
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
