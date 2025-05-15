
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { TableDataViewer } from './TableDataViewer';

// Define valid table names to avoid type errors
const VALID_TABLE_NAMES = [
  "After Call Survey Tickets",
  "team_leads",
  "agents",
  "Calls",
  "daily_stats",
  "Emails",
  "Escalations",
  "Live Chat",
  "profiles",
  "QA Table",
  "team_metrics",
  "team_lead_overview"
] as const;

type ValidTableName = typeof VALID_TABLE_NAMES[number];

export const DataTroubleshooter = () => {
  const [selectedTable, setSelectedTable] = useState<ValidTableName>("team_leads");
  const [tableData, setTableData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rowCount, setRowCount] = useState<number | null>(null);
  
  const fetchTableData = async () => {
    setIsLoading(true);
    setError(null);
    setTableData([]);
    setRowCount(null);
    
    try {
      const { data, error } = await supabase
        .from(selectedTable)
        .select('*')
        .limit(100);
        
      if (error) throw error;
      
      setTableData(data || []);
      setRowCount(data?.length || 0);
    } catch (err: any) {
      console.error(`Error fetching ${selectedTable} data:`, err);
      setError(`Failed to fetch data: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Data Troubleshooter</CardTitle>
        <CardDescription>
          Inspect table data to help troubleshoot issues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
            <Select value={selectedTable} onValueChange={(value) => setSelectedTable(value as ValidTableName)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select table" />
              </SelectTrigger>
              <SelectContent>
                {VALID_TABLE_NAMES.map(table => (
                  <SelectItem key={table} value={table}>
                    {table}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={fetchTableData} disabled={isLoading} className="md:ml-2">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
                </>
              ) : (
                'Load Data'
              )}
            </Button>
            
            {rowCount !== null && (
              <div className="md:ml-4 text-sm text-muted-foreground">
                {rowCount} rows retrieved (limit: 100)
              </div>
            )}
          </div>
          
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-destructive font-medium">Error</p>
              <p className="text-sm text-destructive/80 mt-1">{error}</p>
            </div>
          )}
          
          <TableDataViewer data={tableData} isLoading={isLoading} />
        </div>
      </CardContent>
    </Card>
  );
};
