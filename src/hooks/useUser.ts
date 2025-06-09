
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

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          // Update user role to admin if it's not already
          if (data.role !== 'admin') {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ role: 'admin' })
              .eq('id', user.id);
            
            if (updateError) {
              console.error('Error updating user role to admin:', updateError);
            } else {
              data.role = 'admin';
            }
          }
          setProfile(data);
        } else {
          // Create a basic profile if none exists, with admin role
          const newProfile = {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || null,
            role: 'admin',
            password_changed: true
          };
          
          // Insert the new profile into the database
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || null,
              role: 'admin'
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
    isAdmin: true, // All users are now admins
    isEditor: true, // All users can edit
    isViewer: true
  };
};
