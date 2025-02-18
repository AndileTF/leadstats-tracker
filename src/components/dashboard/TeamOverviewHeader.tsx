
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';

/**
 * Header component for the team overview page
 * Contains the back button, title, and description
 */
export const TeamOverviewHeader = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => navigate('/team-lead-dashboard')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        TL Portal
      </Button>
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
        Team Lead Dashboard
      </h1>
      <p className="text-muted-foreground mt-2">Track and analyze your team's performance metrics</p>
    </div>
  );
};
