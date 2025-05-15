
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AVAILABLE_TABLES = [
  { name: "team_leads", displayName: "Team Leads" },
  { name: "daily_stats", displayName: "Daily Stats" },
  { name: "agents", displayName: "Agents" },
  { name: "Calls", displayName: "Calls" },
  { name: "Emails", displayName: "Emails" },
  { name: "Live Chat", displayName: "Live Chat" },
  { name: "Escalations", displayName: "Escalations" },
  { name: "QA Table", displayName: "QA Assessments" },
  { name: "After Call Survey Tickets", displayName: "Survey Tickets" },
];

export const TableDataViewer = () => {
  const [selectedTable, setSelectedTable] = useState<string>("team_leads");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState<string[]>([]);

  const fetchTableData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from(selectedTable)
        .select("*")
        .limit(20);
        
      if (error) {
        setError(error.message);
        toast({
          title: "Error",
          description: `Failed to fetch data from ${selectedTable}: ${error.message}`,
          variant: "destructive"
        });
      } else {
        setData(data || []);
        
        // Extract column names from the first row
        if (data && data.length > 0) {
          setColumns(Object.keys(data[0]));
        } else {
          setColumns([]);
        }
        
        toast({
          title: "Data Fetched",
          description: `Retrieved ${data?.length || 0} records from ${selectedTable}`
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <CardTitle className="text-lg">Table Data Viewer</CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select table" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_TABLES.map(table => (
                  <SelectItem key={table.name} value={table.name}>
                    {table.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={fetchTableData} 
              disabled={isLoading} 
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isLoading ? "Loading..." : "Fetch Data"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {error ? (
          <div className="p-6 bg-destructive/10 text-destructive">
            <p className="font-medium">Error fetching data</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : !data ? (
          <div className="p-6 text-center text-muted-foreground">
            Select a table and click "Fetch Data" to view records
          </div>
        ) : data.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No data found in the {selectedTable} table
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map(column => (
                    <TableHead key={column}>{column}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index}>
                    {columns.map(column => (
                      <TableCell key={column}>
                        {typeof row[column] === 'object' ? 
                          JSON.stringify(row[column]) : 
                          String(row[column] !== null && row[column] !== undefined ? row[column] : '')}
                      </TableCell>
                    ))}
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
