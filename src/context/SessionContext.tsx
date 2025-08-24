import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useIdleTimer } from '@/hooks/useIdleTimer';
import { SessionTimeoutDialog } from '@/components/auth/SessionTimeoutDialog';
import { toast } from '@/hooks/use-toast';

interface SessionContextType {
  isSessionActive: boolean;
  extendSession: () => void;
  forceLogout: () => void;
  lastActivity: number;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout
const WARNING_TIME_SECONDS = 5 * 60; // 5 minutes in seconds

export const SessionProvider = ({ children }: SessionProviderProps) => {
  const { user, signOut } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(true);

  const handleIdle = () => {
    if (user && isSessionActive) {
      setShowWarning(true);
    }
  };

  const handleActive = () => {
    if (showWarning) {
      setShowWarning(false);
    }
  };

  const { reset: resetIdleTimer, lastActivity } = useIdleTimer({
    timeout: SESSION_TIMEOUT - WARNING_TIME,
    onIdle: handleIdle,
    onActive: handleActive
  });

  const extendSession = () => {
    setShowWarning(false);
    resetIdleTimer();
    toast({
      title: 'Session Extended',
      description: 'Your session has been extended successfully.',
    });
  };

  const forceLogout = async () => {
    setShowWarning(false);
    setIsSessionActive(false);
    
    toast({
      title: 'Session Expired',
      description: 'You have been logged out due to inactivity.',
      variant: 'destructive',
    });

    await signOut();
  };

  // Handle browser tab/window events
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user) {
        // Store session end time in localStorage
        localStorage.setItem('sessionEndTime', Date.now().toString());
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        const sessionEndTime = localStorage.getItem('sessionEndTime');
        if (sessionEndTime) {
          const timeDiff = Date.now() - parseInt(sessionEndTime);
          // If more than 15 minutes have passed, force logout
          if (timeDiff > 15 * 60 * 1000) {
            forceLogout();
            return;
          }
        }
        localStorage.removeItem('sessionEndTime');
        resetIdleTimer();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, resetIdleTimer]);

  // Reset session state when user changes
  useEffect(() => {
    if (user) {
      setIsSessionActive(true);
      resetIdleTimer();
    } else {
      setIsSessionActive(false);
      setShowWarning(false);
    }
  }, [user, resetIdleTimer]);

  return (
    <SessionContext.Provider
      value={{
        isSessionActive,
        extendSession,
        forceLogout,
        lastActivity
      }}
    >
      {children}
      
      {user && (
        <SessionTimeoutDialog
          isOpen={showWarning}
          onExtendSession={extendSession}
          onLogout={forceLogout}
          warningTime={WARNING_TIME_SECONDS}
        />
      )}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};