
import { Agent } from "@/types/teamLead";
import { format, differenceInDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { User, Users, Calendar } from "lucide-react";

interface AgentsListProps {
  agents: Agent[];
  isLoading: boolean;
}

export const AgentsList = ({ agents, isLoading }: AgentsListProps) => {
  if (isLoading) {
    return <div className="py-4">Loading agents...</div>;
  }

  if (!agents || agents.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No agents assigned to this team lead</p>
      </div>
    );
  }

  const getTenureText = (startDate: string) => {
    const days = differenceInDays(new Date(), new Date(startDate));
    
    if (days < 30) {
      return `${days} days`;
    } else if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(days / 365);
      const remainingMonths = Math.floor((days % 365) / 30);
      return `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? `, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
    }
  };

  const getGroupBadgeColor = (group: string) => {
    switch (group) {
      case 'Technical Support':
        return 'bg-blue-100 text-blue-800';
      case 'Sales':
        return 'bg-green-100 text-green-800';
      case 'Billing':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="rounded-md border mt-4">
      <Table>
        <TableCaption>List of assigned agents</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Group</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Tenure</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => (
            <TableRow key={agent.id}>
              <TableCell className="font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {agent.name}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`${getGroupBadgeColor(agent.group_name)}`}>
                  {agent.group_name}
                </Badge>
              </TableCell>
              <TableCell className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                {format(new Date(agent.start_date), "MMM d, yyyy")}
              </TableCell>
              <TableCell>{getTenureText(agent.start_date)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
