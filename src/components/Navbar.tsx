
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold">Team Lead Dash</Link>
        </div>
        
        <nav className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/" className="text-gray-300 hover:text-white">
                Dashboard
              </Link>
              
              {isAdmin && (
                <Link to="/users" className="text-gray-300 hover:text-white">
                  User Management
                </Link>
              )}
              
              <span className="text-gray-400">{user.email}</span>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
