
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DataDebugger } from "./DataDebugger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define known tables as a type to ensure type safety
type KnownTable = 
  | "After Call Survey Tickets" 
  | "Calls" 
  | "Emails" 
  | "QA Table" 
  | "agents" 
  | "Escalations" 
  | "Live Chat" 
  | "team_leads" 
  | "daily_stats" 
  | "profiles";

const TABLES: KnownTable[] = [
  "After Call Survey Tickets",
  "Calls",
  "Emails", 
  "QA Table", 
  "agents", 
  "Escalations", 
  "Live Chat", 
  "team_leads", 
  "daily_stats"
];

export const TableDataViewer = () => {
  const [tableData, setTableData] = useState<Record<string, any[] | null>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const { toast } = useToast();

  const fetchTableData = async (tableName: KnownTable) => {
    try {
      setIsLoading(prev => ({ ...prev, [tableName]: true }));
      setErrors(prev => ({ ...prev, [tableName]: null }));

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(10);

      if (error) throw error;
      
      setTableData(prev => ({ ...prev, [tableName]: data }));
      toast({
        title: "Data Refreshed",
        description: `Successfully fetched data from ${tableName}`,
      });
    } catch (err: any) {
      console.error(`Error fetching data from ${tableName}:`, err);
      setErrors(prev => ({ ...prev, [tableName]: err.message || "Failed to fetch data" }));
      setTableData(prev => ({ ...prev, [tableName]: null }));
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to fetch data from ${tableName}: ${err.message}`,
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [tableName]: false }));
    }
  };

  const refreshAllTables = () => {
    TABLES.forEach(table => {
      fetchTableData(table);
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Table Data</h2>
        <Button onClick={refreshAllTables} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh All Tables
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Database Tables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TABLES.map((table) => (
              <DataDebugger
                key={table}
                title={table}
                tableName={table}
                data={tableData[table] || null}
                error={errors[table] || null}
                isLoading={isLoading[table] || false}
                onRefresh={() => fetchTableData(table)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
