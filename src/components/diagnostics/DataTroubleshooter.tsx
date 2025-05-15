
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TableDataViewer } from './TableDataViewer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

type Table = string;

export const DataTroubleshooter = () => {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Define available tables explicitly for type safety and to match Supabase table names
  const availableTables = [
    "daily_stats",
    "team_leads", 
    "agents", 
    "profiles",
    "After Call Survey Tickets",
    "Calls",
    "Emails",
    "Escalations",
    "Live Chat",
    "QA Table"
  ] as const;
  
  // Create a type from the availableTables array for type safety
  type AvailableTable = typeof availableTables[number];

  const fetchTableData = async () => {
    if (!selectedTable) return;
    
    setIsLoading(true);
    
    try {
      // Use the table name as a valid Supabase table name
      const { data, error } = await supabase
        .from(selectedTable as AvailableTable)
        .select('*')
        .limit(100);
        
      if (error) throw error;
      
      setTableData(data || []);
      toast({
        title: "Data Fetched",
        description: `Successfully loaded ${data?.length || 0} records from ${selectedTable}`
      });
    } catch (error: any) {
      console.error('Error fetching table data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
      setTableData([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Data Troubleshooter</CardTitle>
        <CardDescription>
          View and inspect data directly from your tables
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-end">
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium">Select Table</label>
            <Select
              value={selectedTable || ""}
              onValueChange={(value) => setSelectedTable(value as Table)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a table" />
              </SelectTrigger>
              <SelectContent>
                {availableTables.map((table) => (
                  <SelectItem key={table} value={table}>
                    {table}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={fetchTableData} 
            disabled={!selectedTable || isLoading}
          >
            {isLoading ? "Loading..." : "Load Data"}
          </Button>
        </div>
        
        <Separator />
        
        {tableData.length > 0 && (
          <TableDataViewer data={tableData} />
        )}
      </CardContent>
    </Card>
  );
};
