
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

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
          Team Lead Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Track and analyze your team's performance metrics</p>
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
          onClick={() => navigate('/')}
          className="bg-primary/20 hover:bg-primary/30 text-primary"
        >
          Team Overview
        </Button>
      </div>
    </div>
  );
};
