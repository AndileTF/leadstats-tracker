
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
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
        Team Overview
      </h1>
      <p className="text-muted-foreground mt-2">Overall performance metrics for all teams</p>
    </div>
  );
};
