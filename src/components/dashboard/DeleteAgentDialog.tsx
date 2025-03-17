
import { Agent } from "@/types/teamLead";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

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
      
      // Delete the agent
      const { error } = await supabase
        .from("agents")
        .delete()
        .eq("id", agent.id);
      
      if (error) throw error;
      
      // Update team lead's agent count
      await supabase
        .from("team_leads")
        .update({
          assigned_agents_count: await getAgentCount()
        })
        .eq("id", teamLeadId);
      
      toast({
        title: "Agent Removed",
        description: `Successfully removed ${agent.name}`,
      });
      
      onAgentUpdated();
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast({
        title: "Error",
        description: "Failed to remove agent",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };
  
  const getAgentCount = async (): Promise<number> => {
    const { count, error } = await supabase
      .from("agents")
      .select("*", { count: "exact", head: true })
      .eq("team_lead_id", teamLeadId);
      
    if (error) {
      console.error("Error getting agent count:", error);
      return 0;
    }
    
    return count || 0;
  };

  return (
    <Dialog open={!!agent} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove {agent?.name}? This action cannot be undone.
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
