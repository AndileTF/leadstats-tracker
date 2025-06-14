
import { useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Agent } from "@/types/teamLead";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentFormProps {
  isOpen: boolean;
  onClose: () => void;
  teamLeadId: string;
  agent?: Agent;
  onSuccess: () => void;
}

type FormValues = {
  name: string;
  group_name: string;
  start_date: Date;
};

export const AgentForm = ({ isOpen, onClose, teamLeadId, agent, onSuccess }: AgentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!agent;

  const defaultValues = {
    name: agent?.name || "",
    group_name: agent?.group_name || "Technical Support",
    start_date: agent ? new Date(agent.start_date) : new Date(),
  };

  const form = useForm<FormValues>({
    defaultValues,
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      const agentData = {
        name: data.name,
        group_name: data.group_name,
        start_date: format(data.start_date, "yyyy-MM-dd"),
        team_lead_id: teamLeadId,
      };

      if (isEditing && agent) {
        // Update existing agent
        const { error } = await supabase
          .from('agents')
          .update({
            name: agentData.name,
            group_name: agentData.group_name,
            start_date: agentData.start_date
          })
          .eq('id', agent.id);

        if (error) throw error;
      } else {
        // Insert new agent
        const { error } = await supabase
          .from('agents')
          .insert(agentData);

        if (error) throw error;
      }

      // Update team lead's agent count
      const agentCount = await getAgentCount(teamLeadId);
      const { error: updateError } = await supabase
        .from('team_leads')
        .update({ assigned_agents_count: agentCount })
        .eq('id', teamLeadId);

      if (updateError) throw updateError;

      toast({
        title: isEditing ? "Agent Updated" : "Agent Added",
        description: `Successfully ${isEditing ? "updated" : "added"} agent ${data.name}`,
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving agent:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "add"} agent`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Agent" : "Add New Agent"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Agent name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="group_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select group" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Technical Support">Technical Support</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Billing">Billing</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEditing ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
