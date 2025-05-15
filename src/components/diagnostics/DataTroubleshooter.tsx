
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Database, Terminal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const KNOWN_TABLES = [
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

export const DataTroubleshooter = () => {
  const [tables, setTables] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  const [isCountLoading, setIsCountLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get tables directly from PostgreSQL's information_schema
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .neq('table_name', 'pg_stat_statements')
        .order('table_name');

      if (error) throw new Error(error.message);
      
      if (data) {
        const tableNames = data.map(t => t.table_name).filter(name => 
          // Filter out system tables
          !name.startsWith('_') && 
          !name.includes('schema') && 
          !name.startsWith('pg_')
        );
        
        setTables(tableNames);
        
        // Initialize counts object
        const initialCounts: Record<string, null> = {};
        tableNames.forEach(table => {
          initialCounts[table] = null;
        });
        setCounts(initialCounts);
        
        // Get counts for each table
        tableNames.forEach(fetchTableCount);
      }
    } catch (err: any) {
      console.error('Error fetching tables:', err);
      setError(err.message || 'Failed to fetch database tables');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTableCount = async (tableName: string) => {
    try {
      setIsCountLoading(prev => ({ ...prev, [tableName]: true }));
      
      // We need to use raw SQL for this to handle tables with spaces in their names
      const { data, error } = await supabase.rpc('get_row_count', {
        table_name: tableName
      });

      if (error) throw new Error(error.message);
      
      setCounts(prev => ({ ...prev, [tableName]: data }));
    } catch (err: any) {
      console.error(`Error fetching count for ${tableName}:`, err);
      setCounts(prev => ({ ...prev, [tableName]: null }));
    } finally {
      setIsCountLoading(prev => ({ ...prev, [tableName]: false }));
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={fetchTables}>Retry</Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" /> Database Tables
        </CardTitle>
        <CardDescription>
          Overview of all tables in your database and their record counts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tables.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="h-12 w-12 mx-auto opacity-50 mb-3" />
            <p>No tables found in the database.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tables.map((table) => (
              <div key={table} className="border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono">{table}</span>
                    {KNOWN_TABLES.includes(table) ? (
                      <Badge variant="default">System Table</Badge>
                    ) : (
                      <Badge variant="outline">Custom Table</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isCountLoading[table] ? (
                      <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full"></div>
                    ) : (
                      <Badge variant={counts[table] === 0 ? "outline" : "default"} className="font-mono">
                        {counts[table] === null ? '?' : `${counts[table]} rows`}
                      </Badge>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => fetchTableCount(table)}
                      disabled={isCountLoading[table]}
                    >
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <Separator className="my-6" />
            <div className="flex justify-end">
              <Button onClick={fetchTables}>Refresh All Tables</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
