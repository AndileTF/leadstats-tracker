import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useSessionSecurity = () => {
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Generate a session fingerprint
    const generateFingerprint = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Session fingerprint', 2, 2);
      }
      
      return btoa(JSON.stringify({
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        canvas: canvas.toDataURL(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen: `${screen.width}x${screen.height}`,
      }));
    };

    // Store session fingerprint
    const fingerprint = generateFingerprint();
    localStorage.setItem('sessionFingerprint', fingerprint);

    // Validate session on focus
    const handleFocus = async () => {
      try {
        // Check if fingerprint matches
        const storedFingerprint = localStorage.getItem('sessionFingerprint');
        if (storedFingerprint !== fingerprint) {
          console.warn('Session fingerprint mismatch detected');
          await signOut();
          return;
        }

        // Validate session with Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          console.warn('Invalid session detected');
          await signOut();
          return;
        }

        // Check token expiration
        const tokenExp = session.expires_at;
        if (tokenExp && Date.now() >= tokenExp * 1000) {
          console.warn('Token expired');
          await signOut();
        }
      } catch (error) {
        console.error('Session validation failed:', error);
        await signOut();
      }
    };

    // Handle tab/window events
    const handleBeforeUnload = () => {
      // Mark session as potentially closed
      sessionStorage.setItem('sessionClosed', Date.now().toString());
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const sessionClosed = sessionStorage.getItem('sessionClosed');
        if (sessionClosed) {
          const timeClosed = parseInt(sessionClosed);
          const timeNow = Date.now();
          
          // If tab was closed for more than 5 minutes, require re-authentication
          if (timeNow - timeClosed > 5 * 60 * 1000) {
            signOut();
            return;
          }
        }
        sessionStorage.removeItem('sessionClosed');
        handleFocus();
      }
    };

    // Set up event listeners
    window.addEventListener('focus', handleFocus);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial validation
    handleFocus();

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, signOut]);

  return null;
};