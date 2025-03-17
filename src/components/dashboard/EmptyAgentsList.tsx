
import { Button } from "@/components/ui/button";
import { Users, UserPlus } from "lucide-react";

interface EmptyAgentsListProps {
  onAddClick: () => void;
}

export const EmptyAgentsList = ({ onAddClick }: EmptyAgentsListProps) => {
  return (
    <div className="py-4 text-center text-muted-foreground rounded-md border p-8">
      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p>No agents assigned to this team lead</p>
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-4"
        onClick={onAddClick}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Add your first agent
      </Button>
    </div>
  );
};
