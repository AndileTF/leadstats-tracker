
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { LogOut, User, UserPlus } from "lucide-react";

export const NavBar = () => {
  const { user, signOut } = useAuth();
  const { profile, isAdmin } = useUser();

  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-white/10 shadow-lg px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">
          <span className="liquid-text">LIQUID</span> Dashboard
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="text-sm text-muted-foreground hidden md:block">
                {profile?.full_name || user.email}
              </div>
              
              {isAdmin && (
                <Button variant="ghost" asChild>
                  <Link to="/admin/users">
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span className="hidden md:inline">Manage Users</span>
                  </Link>
                </Button>
              )}
              
              <Button variant="outline" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Sign Out</span>
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link to="/login">
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
