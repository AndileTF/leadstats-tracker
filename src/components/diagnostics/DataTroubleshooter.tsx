
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertCircle, ChevronDown, ChevronUp, Database, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const DataTroubleshooter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<{
    tablesCount?: number;
    teamLeadsCount?: number;
    dailyStatsCount?: number;
    agentsCount?: number;
    error?: string;
  } | null>(null);

  const runDiagnostics = async () => {
    setChecking(true);
    setResults(null);
    
    try {
      // Test database connection
      const { data: tables, error: tablesError } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public')
        .limit(20);
        
      if (tablesError) {
        toast({
          title: "Connection Error",
          description: `Database connection issue: ${tablesError.message}`,
          variant: "destructive"
        });
        setResults({ error: tablesError.message });
        setChecking(false);
        return;
      }
      
      // Check team_leads table
      const { data: teamLeads, error: teamLeadsError } = await supabase
        .from('team_leads')
        .select('id, name')
        .limit(10);
        
      if (teamLeadsError) {
        setResults({ 
          tablesCount: tables?.length || 0,
          error: `Team leads table error: ${teamLeadsError.message}`
        });
        setChecking(false);
        return;
      }
      
      // Check daily_stats table
      const { data: dailyStats, error: dailyStatsError } = await supabase
        .from('daily_stats')
        .select('id, team_lead_id, date')
        .limit(10);
        
      // Check agents table
      const { data: agents, error: agentsError } = await supabase
        .from('agents')
        .select('id, team_lead_id, name')
        .limit(10);
        
      setResults({
        tablesCount: tables?.length || 0,
        teamLeadsCount: teamLeads?.length || 0,
        dailyStatsCount: dailyStats?.length || 0,
        agentsCount: agents?.length || 0,
        error: dailyStatsError?.message || agentsError?.message || undefined
      });
      
      toast({
        title: "Diagnostics Complete",
        description: `Found ${tables?.length} tables, ${teamLeads?.length} team leads, ${dailyStats?.length} stats records`,
      });
    } catch (err: any) {
      setResults({ error: err.message });
      toast({
        title: "Diagnostics Failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data Connection Troubleshooter
          </CardTitle>
          <CollapsibleTrigger asChild onClick={() => setIsOpen(!isOpen)}>
            <Button size="sm" variant="ghost">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
      </CardHeader>
      <Collapsible open={isOpen}>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Run diagnostics to check database connectivity and table access.
              </p>
              
              <Button 
                onClick={runDiagnostics} 
                disabled={checking}
                className="w-full"
              >
                {checking ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Database className="h-4 w-4 mr-2" />
                )}
                {checking ? "Running Diagnostics..." : "Run Diagnostics"}
              </Button>
              
              {results && (
                <div className="space-y-3">
                  {results.error ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Connection Error</AlertTitle>
                      <AlertDescription>{results.error}</AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant={results.dailyStatsCount === 0 ? "warning" : "default"}>
                      <AlertTitle>Diagnostics Results</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                          <li>Tables found: <strong>{results.tablesCount}</strong></li>
                          <li>Team leads: <strong>{results.teamLeadsCount}</strong></li>
                          <li>Daily stats records: <strong>{results.dailyStatsCount}</strong></li>
                          <li>Agents: <strong>{results.agentsCount}</strong></li>
                        </ul>
                        
                        {results.dailyStatsCount === 0 && (
                          <p className="mt-3 text-amber-600">
                            No daily stats records found. This explains why the dashboard is empty.
                          </p>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
