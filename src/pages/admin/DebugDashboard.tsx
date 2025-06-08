import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database, Bug, Logs } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DebugDashboard = () => {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [tableData, setTableData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [authLogs, setAuthLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Checking...");

  // Define the available tables from the database
  const availableTables = [
    "profiles",
    "team_leads", 
    "agents",
    "daily_stats",
    "Calls",
    "Emails",
    "Escalations",
    "Live Chat",
    "QA Table",
    "After Call Survey Tickets"
  ];

  useEffect(() => {
    // Check connection status by testing a simple query
    const checkConnection = async () => {
      try {
        const startTime = performance.now();
        const { data, error } = await supabase.from('team_leads').select('count').limit(1);
        const endTime = performance.now();
        
        if (error) {
          console.error("Connection check error:", error);
          setConnectionStatus("Disconnected");
        } else {
          setConnectionStatus(`Connected (${Math.round(endTime - startTime)}ms)`);
        }
      } catch (error) {
        console.error("Connection check error:", error);
        setConnectionStatus("Disconnected");
      }
    };

    const fetchTables = async () => {
      try {
        setIsLoadingTables(true);
        setTables(availableTables);
        if (availableTables.length > 0) {
          setSelectedTable(availableTables[0]);
        }
      } catch (error: any) {
        console.error("Error setting tables:", error);
        toast({
          variant: "destructive",
          title: "Error loading tables",
          description: error.message || "Could not load database tables",
        });
      } finally {
        setIsLoadingTables(false);
      }
    };

    const fetchAuthLogs = async () => {
      try {
        setIsLoadingLogs(true);
        // Placeholder for auth logs - function doesn't exist yet
        setAuthLogs([]);
      } catch (error: any) {
        console.error("Error fetching auth logs:", error);
        setAuthLogs([]);
      } finally {
        setIsLoadingLogs(false);
      }
    };

    checkConnection();
    fetchTables();
    fetchAuthLogs();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable);
    }
  }, [selectedTable]);

  const fetchTableData = async (tableName: string) => {
    try {
      setIsLoadingData(true);
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(100);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setTableData(data);
        
        // Extract columns from the first row
        if (data.length > 0) {
          setColumns(Object.keys(data[0]));
        } else {
          setColumns([]);
        }
      }
    } catch (error: any) {
      console.error(`Error fetching data from ${tableName}:`, error);
      toast({
        variant: "destructive",
        title: `Error fetching data from ${tableName}`,
        description: error.message || "Could not fetch table data",
      });
      setTableData([]);
      setColumns([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const renderCellContent = (value: any) => {
    if (value === null) return <span className="text-gray-400">null</span>;
    if (value === undefined) return <span className="text-gray-400">undefined</span>;
    
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    
    if (typeof value === 'object') {
      try {
        return <pre className="text-xs max-w-xs overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>;
      } catch (e) {
        return <span className="text-red-500">[Object]</span>;
      }
    }
    
    return String(value);
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Debug Dashboard
              </CardTitle>
              <CardDescription>
                Inspect database tables and system logs
              </CardDescription>
            </div>
            <Badge 
              className={connectionStatus.includes('Connected') ? 'bg-green-500' : 'bg-red-500'}
            >
              {connectionStatus}
            </Badge>
          </div>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="database">
        <TabsList className="mb-4">
          <TabsTrigger value="database" className="flex items-center gap-1">
            <Database className="h-4 w-4" />
            Database Explorer
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-1">
            <Logs className="h-4 w-4" />
            Auth Logs
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Database Tables</CardTitle>
              <div className="mt-2">
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select a table" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((table) => (
                      <SelectItem key={table} value={table}>
                        {table}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground animate-pulse">Loading table data...</p>
                </div>
              ) : tableData.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No data available in this table</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableCaption>Showing up to 100 rows from {selectedTable}</TableCaption>
                    <TableHeader>
                      <TableRow>
                        {columns.map((column) => (
                          <TableHead key={column}>{column}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableData.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {columns.map((column) => (
                            <TableCell key={`${rowIndex}-${column}`}>
                              {renderCellContent(row[column])}
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
        </TabsContent>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Authentication Logs</CardTitle>
              <CardDescription>
                Recent authentication events in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLogs ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground animate-pulse">Loading logs...</p>
                </div>
              ) : authLogs.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No authentication logs available</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Note: Auth logs functionality will be implemented later
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableCaption>Recent authentication events</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {authLogs.map((log, index) => (
                        <TableRow key={index}>
                          <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                          <TableCell>{log.event || log.type}</TableCell>
                          <TableCell>{log.user_email || log.user_id || 'Unknown'}</TableCell>
                          <TableCell>
                            <Badge className={log.error ? 'bg-red-500' : 'bg-green-500'}>
                              {log.error ? 'Failed' : 'Success'}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-md">
                            <pre className="text-xs whitespace-pre-wrap">{log.error || log.details || 'No details'}</pre>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DebugDashboard;
