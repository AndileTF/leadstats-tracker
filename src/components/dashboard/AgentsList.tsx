
import { useState } from "react";
import { Agent } from "@/types/teamLead";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AgentForm } from "./AgentForm";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { User, Users, Calendar, Edit, Trash2, UserPlus } from "lucide-react";
import { DeleteAgentDialog } from "./DeleteAgentDialog";
import { EmptyAgentsList } from "./EmptyAgentsList";
import { getTenureText, getGroupBadgeColor } from "./agentUtils";

interface AgentsListProps {
  agents: Agent[];
  isLoading: boolean;
  teamLeadId: string;
  onAgentUpdated: () => void;
}

export const AgentsList = ({ agents, isLoading, teamLeadId, onAgentUpdated }: AgentsListProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [deletingAgent, setDeletingAgent] = useState<Agent | null>(null);

  if (isLoading) {
    return <div className="py-4">Loading agents...</div>;
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Team Members</h3>
        <Button
          size="sm"
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1"
        >
          <UserPlus className="h-4 w-4" />
          Add Agent
        </Button>
      </div>
      
      {agents && agents.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableCaption>List of assigned agents</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Tenure</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setEditingAgent(agent)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setDeletingAgent(agent)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyAgentsList onAddClick={() => setShowAddForm(true)} />
      )}
      
      {/* Add Agent Form */}
      {showAddForm && (
        <AgentForm
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          teamLeadId={teamLeadId}
          onSuccess={onAgentUpdated}
        />
      )}
      
      {/* Edit Agent Form */}
      {editingAgent && (
        <AgentForm
          isOpen={!!editingAgent}
          onClose={() => setEditingAgent(null)}
          teamLeadId={teamLeadId}
          agent={editingAgent}
          onSuccess={onAgentUpdated}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <DeleteAgentDialog
        agent={deletingAgent}
        teamLeadId={teamLeadId}
        onClose={() => setDeletingAgent(null)}
        onAgentUpdated={onAgentUpdated}
      />
    </div>
  );
};
