
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { DateFilter } from "@/components/dashboard/DateFilter";

interface DashboardHeaderProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  onApplyFilter?: () => void;
}

export const DashboardHeader = ({ 
  showForm, 
  setShowForm,
  onApplyFilter
}: DashboardHeaderProps) => {
  const navigate = useNavigate();

  const handleNavigateToOverview = () => {
    console.log("Navigating to Team Overview (/)");
    navigate('/');
  };

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
      <div className="flex gap-4">
        <DateFilter onApplyFilter={onApplyFilter} />
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-primary/20 hover:bg-primary/30 text-primary"
        >
          {showForm ? 'Close Form' : 'Add Daily Stats'}
        </Button>
        <Button
          variant="outline"
          onClick={handleNavigateToOverview}
          className="bg-primary/20 hover:bg-primary/30 text-primary"
        >
          Team Overview
        </Button>
      </div>
    </div>
  );
};
