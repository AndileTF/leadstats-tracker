
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const DataTroubleshooter = () => {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [rowCounts, setRowCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [functionResult, setFunctionResult] = useState<any>(null);

  // Fetch available tables
  useEffect(() => {
    const fetchTables = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data: tablesData, error: tablesError } = await supabase
          .from("team_leads")  // Use a table we know exists as a starting point
          .select("id")
          .limit(1);

        if (tablesError) throw tablesError;

        // Get list of tables from Supabase (this may be limited based on permissions)
        const tableNames = [
          "daily_stats",
          "team_leads",
          "agents",
          "Calls",
          "Emails",
          "Live Chat",
          "Escalations",
          "QA Table",
          "After Call Survey Tickets",
          "profiles"
        ];
        
        setTables(tableNames);
        
        // Fetch row counts for each table
        const counts: Record<string, number> = {};
        
        for (const table of tableNames) {
          try {
            const { count, error: countError } = await supabase
              .from(table)
              .select("*", { count: 'exact', head: true });
              
            if (countError) {
              console.error(`Error counting rows in ${table}:`, countError);
              counts[table] = -1;  // Error indicator
            } else {
              counts[table] = count || 0;
            }
          } catch (err) {
            console.error(`Error accessing table ${table}:`, err);
            counts[table] = -1;
          }
        }
        
        setRowCounts(counts);
        
        if (tableNames.length > 0) {
          setSelectedTable(tableNames[0]);
        }
        
      } catch (err: any) {
        console.error("Error fetching tables:", err);
        setError(err.message || "Failed to fetch database tables");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTables();
  }, []);

  // Test the Supabase function
  const testFunction = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to use the get_weekly_stats function as a test
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      const { data, error } = await supabase
        .rpc('get_weekly_stats', { 
          start_date: startDate.toISOString().split('T')[0] 
        });
        
      if (error) throw error;
      
      setFunctionResult(data);
      
      // Update row counts to show we got data
      setRowCounts(prev => ({
        ...prev,
        "Function Test": data ? 1 : 0
      }));
      
    } catch (err: any) {
      console.error("Error testing function:", err);
      setError(err.message || "Failed to test function");
      setFunctionResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Database Troubleshooter</CardTitle>
        <CardDescription>
          Check database connectivity and table data counts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-destructive/20 p-4 rounded-md mb-4 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Database Error</p>
              <p className="text-sm text-destructive/80 mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="mr-2 h-3 w-3" />
                Reload Page
              </Button>
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <h3 className="font-medium mb-2">Table Row Counts</h3>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table Name</TableHead>
                  <TableHead>Row Count</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.map(table => (
                  <TableRow key={table}>
                    <TableCell className="font-mono text-sm">{table}</TableCell>
                    <TableCell>
                      {rowCounts[table] === -1 ? (
                        <span className="text-destructive">Error</span>
                      ) : rowCounts[table] === undefined ? (
                        <span className="text-muted-foreground">Loading...</span>
                      ) : (
                        rowCounts[table]
                      )}
                    </TableCell>
                    <TableCell>
                      {rowCounts[table] === -1 ? (
                        <Badge variant="destructive">Not accessible</Badge>
                      ) : rowCounts[table] === undefined ? (
                        <Badge variant="outline">Checking...</Badge>
                      ) : rowCounts[table] === 0 ? (
                        <Badge variant="outline">Empty</Badge>
                      ) : (
                        <Badge variant="secondary">Contains data</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="font-medium mb-2">Database Function Test</h3>
          <Button
            variant="outline"
            onClick={testFunction}
            disabled={isLoading}
            className="mb-4"
          >
            {isLoading ? "Testing..." : "Test get_weekly_stats Function"}
          </Button>
          
          {functionResult && (
            <div className="border p-3 rounded-md bg-muted/30">
              <h4 className="text-sm font-medium mb-2">Function Result:</h4>
              <pre className="text-xs overflow-auto max-h-40 bg-slate-900 p-3 rounded text-slate-100">
                {JSON.stringify(functionResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <h3 className="font-medium mb-2">Query Table Data</h3>
          <div className="flex gap-2 mb-4">
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select table" />
              </SelectTrigger>
              <SelectContent>
                {tables.map(table => (
                  <SelectItem key={table} value={table}>
                    {table}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => window.location.href = `/diagnostics?table=${selectedTable}`}>
              View Table Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
