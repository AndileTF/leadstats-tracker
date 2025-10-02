
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  User, 
  UserPlus, 
  Shield,
  Database,
  Bug,
  Users
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
              <Button variant="ghost" asChild>
                <Link to="/profile" className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">{profile?.full_name || user.email}</span>
                </Link>
              </Button>
              
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">
                      <Shield className="mr-2 h-4 w-4" />
                      <span className="hidden md:inline">Admin</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>Admin Tools</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/users" className="w-full flex items-center">
                          <Users className="mr-2 h-4 w-4" />
                          <span>User Management</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/debug" className="w-full flex items-center">
                          <Bug className="mr-2 h-4 w-4" />
                          <span>Debug Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
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
