
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

/**
 * Header component for the team overview page
 * Contains the title, description, and TL Portal button
 */
export const TeamOverviewHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
          Team Lead Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Track and analyze your team's performance metrics</p>
      </div>
      <Button 
        variant="default"
        onClick={() => navigate('/team-lead-dashboard')}
      >
        TL Portal
      </Button>
    </div>
  );
};
