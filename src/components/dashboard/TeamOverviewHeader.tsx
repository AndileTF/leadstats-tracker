
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { UserPlus } from "lucide-react";

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
            src="/lovable-uploads/4f893118-dd2a-4f5f-b494-80f69b20bf3c.png" 
            alt="LIQUID Intelligent Technologies" 
            className="h-14 w-auto"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold liquid-text">
            Team Lead Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Track and analyze your team's performance metrics</p>
        </div>
      </div>
      <div className="flex gap-3">
        <Button 
          variant="default"
          onClick={() => navigate('/team-lead-dashboard')}
          className="bg-[#cf1e90] hover:bg-[#e24bab]"
        >
          TL Portal
        </Button>
        <Button
          variant="default"
          onClick={() => navigate('/admin/users')}
          className="bg-[#8B5CF6] hover:bg-[#7C3AED]"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
    </div>
  );
};
