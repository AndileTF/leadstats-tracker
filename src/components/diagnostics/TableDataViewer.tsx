
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DataDebugger } from "./DataDebugger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define props interface for TableDataViewer
interface TableDataViewerProps {
  data?: any[];
}

export const TableDataViewer = ({ data }: TableDataViewerProps) => {
  const [tableData, setTableData] = useState<Record<string, any[] | null>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const { toast } = useToast();

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
    "daily_stats",
    "profiles"
  ];

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

  // If data is provided directly as a prop, display it instead of fetching tables
  if (data && data.length > 0) {
    return (
      <div className="space-y-4 mt-4">
        <div className="overflow-x-auto border rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key} className="p-2 text-left font-medium">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="border-t hover:bg-muted/50">
                  {Object.values(row).map((value, i) => (
                    <td key={i} className="p-2">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

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
