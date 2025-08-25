import { useEffect } from 'react';
import { useSession } from '@/context/SessionContext';

export const SessionSecurityWrapper = ({ children }: { children: React.ReactNode }) => {
  useSession(); // This activates the session management
  
  return <>{children}</>;
};