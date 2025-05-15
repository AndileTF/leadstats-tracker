
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Agent } from "@/types/teamLead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Plus, Edit, X, Check } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface AgentsManagementProps {
  teamLeadId: string | null;
  onAgentChange?: () => void;
}

export const AgentsManagement = ({ teamLeadId, onAgentChange }: AgentsManagementProps) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAgent, setNewAgent] = useState({ name: "", group_name: "CSR" });
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ name: "", group_name: "" });
  const { toast } = useToast();
  
  // Fetch agents when team lead changes
  useEffect(() => {
    const fetchAgents = async () => {
      if (!teamLeadId) {
        setAgents([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .eq('team_lead_id', teamLeadId)
          .order('name', { ascending: true });
          
        if (error) throw error;
        
        setAgents(data || []);
      } catch (err: any) {
        console.error("Error fetching agents:", err);
        setError("Failed to fetch agents: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAgents();
  }, [teamLeadId]);
  
  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamLeadId) {
      toast({
        title: "Error",
        description: "No team lead selected",
        variant: "destructive",
      });
      return;
    }
    
    if (!newAgent.name.trim()) {
      toast({
        title: "Error",
        description: "Agent name is required",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('agents')
        .insert([{
          name: newAgent.name,
          group_name: newAgent.group_name,
          team_lead_id: teamLeadId,
        }]);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Agent added successfully",
      });
      
      // Reset form
      setNewAgent({ name: "", group_name: "CSR" });
      setIsAdding(false);
      
      // Notify parent component
      if (onAgentChange) {
        onAgentChange();
      }
      
      // Refresh agents
      const { data: updatedAgents, error: fetchError } = await supabase
        .from('agents')
        .select('*')
        .eq('team_lead_id', teamLeadId)
        .order('name', { ascending: true });
        
      if (fetchError) throw fetchError;
      setAgents(updatedAgents || []);
      
    } catch (err: any) {
      console.error("Error adding agent:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to add agent",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const startEdit = (agent: Agent) => {
    setEditingId(agent.id);
    setEditFormData({
      name: agent.name,
      group_name: agent.group_name
    });
  };
  
  const cancelEdit = () => {
    setEditingId(null);
  };
  
  const handleEditChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFormData({
      ...editFormData,
      [field]: e.target.value
    });
  };
  
  const saveEdit = async (id: string) => {
    if (!editFormData.name.trim()) {
      toast({
        title: "Error",
        description: "Agent name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('agents')
        .update({
          name: editFormData.name,
          group_name: editFormData.group_name
        })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Agent updated successfully",
      });
      
      // Update local state
      setAgents(agents.map(agent => 
        agent.id === id ? { ...agent, ...editFormData } : agent
      ));
      
      setEditingId(null);
      
      // Notify parent component
      if (onAgentChange) {
        onAgentChange();
      }
      
    } catch (err: any) {
      console.error("Error updating agent:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update agent",
        variant: "destructive",
      });
    }
  };
  
  const deleteAgent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Agent deleted successfully",
      });
      
      // Update local state
      setAgents(agents.filter(agent => agent.id !== id));
      
      // Notify parent component
      if (onAgentChange) {
        onAgentChange();
      }
      
    } catch (err: any) {
      console.error("Error deleting agent:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete agent",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Team Agents</CardTitle>
            <CardDescription>
              Manage agents for this team lead
            </CardDescription>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Add Agent
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-destructive/20 text-destructive p-3 mb-4 rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {isAdding && (
          <form onSubmit={handleAddAgent} className="mb-6 bg-muted/50 p-4 rounded-md">
            <h4 className="font-medium mb-3">Add New Agent</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="agent-name">Agent Name</Label>
                <Input
                  id="agent-name"
                  value={newAgent.name}
                  onChange={e => setNewAgent({...newAgent, name: e.target.value})}
                  placeholder="Enter agent name"
                />
              </div>
              <div>
                <Label htmlFor="agent-group">Group/Role</Label>
                <Input
                  id="agent-group"
                  value={newAgent.group_name}
                  onChange={e => setNewAgent({...newAgent, group_name: e.target.value})}
                  placeholder="e.g. CSR, Specialist"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Agent"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAdding(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
        
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-pulse">Loading agents...</div>
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-md">
            <p className="text-muted-foreground">No agents found for this team lead</p>
            {!isAdding && (
              <Button 
                onClick={() => setIsAdding(true)} 
                variant="outline" 
                className="mt-4"
                size="sm"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Agent
              </Button>
            )}
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Group/Role</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      {editingId === agent.id ? (
                        <Input
                          value={editFormData.name}
                          onChange={handleEditChange('name')}
                        />
                      ) : (
                        agent.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === agent.id ? (
                        <Input
                          value={editFormData.group_name}
                          onChange={handleEditChange('group_name')}
                        />
                      ) : (
                        agent.group_name || 'CSR'
                      )}
                    </TableCell>
                    <TableCell>
                      {agent.start_date ? format(parseISO(agent.start_date), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === agent.id ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => saveEdit(agent.id)}
                            className="h-8 w-8"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={cancelEdit}
                            className="h-8 w-8"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => startEdit(agent)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteAgent(agent.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
