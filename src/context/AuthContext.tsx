
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";

// Define mock user and session types for local auth
interface MockUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface MockSession {
  user: MockUser;
  access_token: string;
}

type AuthContextType = {
  session: MockSession | null;
  user: MockUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  createUser: (email: string, password: string, fullName: string, role: string) => Promise<void>;
  forcePasswordChange: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<MockSession | null>(null);
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [forcePasswordChange, setForcePasswordChange] = useState(false);

  useEffect(() => {
    // Check for existing session in localStorage
    const initializeAuth = async () => {
      try {
        const savedSession = localStorage.getItem('cx_dashboard_session');
        if (savedSession) {
          const parsedSession = JSON.parse(savedSession);
          setSession(parsedSession);
          setUser(parsedSession.user);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Mock authentication for demo purposes
      // In a real application, you would validate against your database
      if (email && password) {
        const mockUser: MockUser = {
          id: 'local-user-' + Date.now(),
          email: email,
          user_metadata: {
            full_name: 'Local User'
          }
        };

        const mockSession: MockSession = {
          user: mockUser,
          access_token: 'mock-token-' + Date.now()
        };

        setSession(mockSession);
        setUser(mockUser);
        
        // Save session to localStorage
        localStorage.setItem('cx_dashboard_session', JSON.stringify(mockSession));
        
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      } else {
        throw new Error('Please provide valid email and password');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message || "Failed to sign in. Please try again.",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Mock signup for demo purposes
      if (email && password && fullName) {
        toast({
          title: "Account created",
          description: "Account created successfully. You can now sign in.",
        });
      } else {
        throw new Error('Please provide all required information');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message || "Failed to create account. Please try again.",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setSession(null);
      setUser(null);
      localStorage.removeItem('cx_dashboard_session');
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to sign out. Please try again.",
      });
      throw error;
    }
  };

  const createUser = async (email: string, password: string, fullName: string, role: string) => {
    try {
      // Mock user creation for demo purposes
      toast({
        title: "User created",
        description: `User ${email} has been successfully created.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create user",
        description: error.message || "An error occurred while creating the user",
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signIn,
        signUp,
        signOut,
        createUser,
        forcePasswordChange,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
