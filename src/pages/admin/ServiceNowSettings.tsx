import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface SyncLog {
  id: string;
  sync_date: string;
  records_synced: number;
  status: string;
  error_message: string | null;
}

export const ServiceNowSettings = () => {
  const [instanceUrl, setInstanceUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);

  useEffect(() => {
    fetchSyncLogs();
  }, []);

  const fetchSyncLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('servicenow_sync_log')
        .select('*')
        .order('sync_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSyncLogs(data || []);
    } catch (error) {
      console.error('Error fetching sync logs:', error);
    }
  };

  const testConnection = async () => {
    if (!instanceUrl || !username || !password) {
      toast({
        title: 'Missing Configuration',
        description: 'Please fill in all ServiceNow credentials',
        variant: 'destructive',
      });
      return;
    }

    setTesting(true);
    try {
      // Test the connection by making a simple API call
      const authHeader = 'Basic ' + btoa(`${username}:${password}`);
      const response = await fetch(`${instanceUrl}/api/now/table/incident?sysparm_limit=1`, {
        headers: {
          Authorization: authHeader,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: 'Connection Successful',
          description: 'Successfully connected to ServiceNow instance',
        });
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect to ServiceNow',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  const triggerSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('servicenow-sync', {
        body: {
          instance_url: instanceUrl,
          username,
          password,
        },
      });

      if (error) throw error;

      toast({
        title: 'Sync Started',
        description: `Synced ${data.records_synced} records from ServiceNow`,
      });

      fetchSyncLogs();
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: error instanceof Error ? error.message : 'Failed to sync with ServiceNow',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Success
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-600">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">ServiceNow Integration</h1>
            <p className="text-muted-foreground">Configure and manage ServiceNow ticket synchronization</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connection Settings</CardTitle>
            <CardDescription>Configure your ServiceNow instance credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instanceUrl">Instance URL</Label>
              <Input
                id="instanceUrl"
                placeholder="https://your-instance.service-now.com"
                value={instanceUrl}
                onChange={(e) => setInstanceUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={testConnection} disabled={testing} variant="outline">
                {testing ? 'Testing...' : 'Test Connection'}
              </Button>
              <Button onClick={triggerSync} disabled={syncing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sync History</CardTitle>
            <CardDescription>Recent ServiceNow synchronization logs</CardDescription>
          </CardHeader>
          <CardContent>
            {syncLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No sync history available
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sync Date</TableHead>
                      <TableHead className="text-right">Records Synced</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Error Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {syncLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {format(new Date(log.sync_date), 'MMM dd, yyyy HH:mm:ss')}
                        </TableCell>
                        <TableCell className="text-right">{log.records_synced}</TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {log.error_message || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServiceNowSettings;
