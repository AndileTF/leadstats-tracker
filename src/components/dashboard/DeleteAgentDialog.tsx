
import { Agent } from "@/types/teamLead";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DeleteAgentDialogProps {
  agent: Agent | null;
  teamLeadId: string;
  onClose: () => void;
  onAgentUpdated: () => void;
}

export const DeleteAgentDialog = ({ 
  agent, 
  teamLeadId, 
  onClose, 
  onAgentUpdated 
}: DeleteAgentDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!agent) return;

    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agent.id);

      if (error) throw error;

      // Update team lead's agent count
      const agentCount = await getAgentCount(teamLeadId);
      const { error: updateError } = await supabase
        .from('team_leads')
        .update({ assigned_agents_count: agentCount })
        .eq('id', teamLeadId);

      if (updateError) throw updateError;

      toast({
        title: "Agent Deleted",
        description: `Successfully deleted agent ${agent.name}`,
      });
      
      onAgentUpdated();
      onClose();
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast({
        title: "Error",
        description: "Failed to delete agent",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getAgentCount = async (teamLeadId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('agents')
        .select('*', { count: 'exact', head: true })
        .eq('team_lead_id', teamLeadId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error("Error getting agent count:", error);
      return 0;
    }
  };

  return (
    <Dialog open={!!agent} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Agent</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete agent "{agent?.name}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
