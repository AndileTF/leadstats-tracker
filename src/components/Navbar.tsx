import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useUser } from "@/hooks/use-user"
import { Link, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

const navItems = [
  { href: "/team-overview", label: "Team Overview" },
  { href: "/team-lead-dashboard", label: "TL Portal" },
  { href: "/user-management", label: "Users" },
  { href: "/diagnostics", label: "Diagnostics" }
];

export function Navbar() {
  const { user, isLoading, signOut } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mr-2 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:w-64">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Navigate through the application.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              {navItems.map((item) => (
                <Link key={item.href} to={item.href}>
                  <Button variant="ghost" className="w-full">{item.label}</Button>
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        <Link className="ml-auto font-bold text-lg" to="/">
          Dashboard
        </Link>
        {user ? (
          <DropdownMenu className="ml-auto">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="ml-auto">
                <Avatar className="mr-2 h-8 w-8">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="hidden lg:inline-flex">{user.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" forceMount>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to="/login" className="ml-auto">
            Login
          </Link>
        )}
      </div>
    </div>
  )
}
