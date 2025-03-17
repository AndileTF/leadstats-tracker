
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center space-y-6 p-8 bg-white rounded-lg shadow-md max-w-md">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="text-xl text-gray-600">Oops! Page not found</p>
        <p className="text-gray-500">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col gap-4 pt-4">
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button 
            onClick={() => navigate('/')} 
            variant="default"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
