
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { TeamLeadOverview } from "@/types/teamLead";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const TeamOverview = () => {
  const [overview, setOverview] = useState<TeamLeadOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const { data, error } = await supabase
        .from('team_lead_overview')
        .select('*');

      if (error) throw error;

      setOverview(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch overview",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
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
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Team Performance</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Team Lead</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Calls</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Emails</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Live Chat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">SLA %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {overview.map((item) => (
                  <tr key={item.name} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.total_calls?.toLocaleString() ?? 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.total_emails?.toLocaleString() ?? 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.total_live_chat?.toLocaleString() ?? 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.average_sla?.toFixed(1) ?? 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TeamOverview;
