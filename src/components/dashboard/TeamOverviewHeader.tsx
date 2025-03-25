
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
      <div className="flex items-center">
        <div className="mr-4">
          <img 
            src="/lovable-uploads/8568c205-5c17-43b0-8e2f-f774633b1c29.png" 
            alt="LIQUID Intelligent Technologies" 
            className="h-12 w-auto"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold liquid-text">
            Team Lead Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Track and analyze your team's performance metrics</p>
        </div>
      </div>
      <Button 
        variant="default"
        onClick={() => navigate('/team-lead-dashboard')}
        className="bg-[#c630a5] hover:bg-[#d845b6]"
      >
        TL Portal
      </Button>
    </div>
  );
};
