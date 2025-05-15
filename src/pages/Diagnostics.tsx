
import { useState } from "react";
import { DataTroubleshooter } from "@/components/diagnostics/DataTroubleshooter";
import { TableDataViewer } from "@/components/diagnostics/TableDataViewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const Diagnostics = () => {
  const [isClearing, setIsClearing] = useState(false);

  const clearSupabaseCache = async () => {
    setIsClearing(true);
    try {
      // Sign out and back in to clear auth cache
      await supabase.auth.signOut();
      
      // Clear localStorage
      localStorage.clear();
      
      toast({
        title: "Cache Cleared",
        description: "Local cache has been cleared. Please log in again.",
      });
      
      // Force reload the page
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to clear cache: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Diagnostics</h1>
            <p className="text-muted-foreground mt-1">
              Troubleshoot data connection issues and view table data directly
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={clearSupabaseCache}
            disabled={isClearing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isClearing ? 'animate-spin' : ''}`} />
            {isClearing ? "Clearing..." : "Clear Cache & Logout"}
          </Button>
        </div>
        
        <Tabs defaultValue="troubleshoot" className="w-full">
          <TabsList>
            <TabsTrigger value="troubleshoot">Troubleshoot</TabsTrigger>
            <TabsTrigger value="data-viewer">Data Viewer</TabsTrigger>
          </TabsList>
          
          <TabsContent value="troubleshoot" className="space-y-6 mt-6">
            <DataTroubleshooter />
            
            <Card>
              <CardHeader>
                <CardTitle>Common Issues</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">No Data Showing in Dashboard</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    This usually means there are no records in the daily_stats table or the team_lead_id doesn't match.
                    Use the Data Viewer tab to check if there's actually data in the tables.
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium">Authentication Issues</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Try clearing the cache and logging in again if you're experiencing authentication problems.
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium">Tables Not Updating</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Make sure Realtime is enabled for your tables in Supabase. Also check that the date range
                    in the dashboard matches when your data was added.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="data-viewer" className="space-y-6 mt-6">
            <TableDataViewer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Diagnostics;
