
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { TeamLead, DailyStats, Agent, TeamLeadOverview } from "@/types/teamLead";

// Generic hook for fetching data with proper error handling and loading states
export function useFetchData<T>(
  tableName: string,
  queryFn: () => Promise<{
    data: T[] | null;
    error: any;
  }>,
  dependencies: any[] = [],
  onSuccess?: (data: T[]) => void
) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log(`Fetching data from ${tableName}...`);
        
        const { data, error } = await queryFn();
        
        if (error) {
          console.error(`Error fetching data from ${tableName}:`, error);
          setError(`Failed to fetch data: ${error.message}`);
          toast({
            title: "Error",
            description: `Failed to fetch data from ${tableName}: ${error.message}`,
            variant: "destructive",
          });
          throw error;
        }
        
        console.log(`Successfully fetched ${data?.length || 0} records from ${tableName}`);
        
        if (data) {
          setData(data);
          if (onSuccess) onSuccess(data);
        }
      } catch (err: any) {
        console.error(`Error in useFetchData(${tableName}):`, err);
        setError(`Failed to fetch data: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [...dependencies]);

  const refetch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(`Refetching data from ${tableName}...`);
      
      const { data, error } = await queryFn();
      
      if (error) {
        console.error(`Error refetching data from ${tableName}:`, error);
        setError(`Failed to fetch data: ${error.message}`);
        toast({
          title: "Error",
          description: `Failed to refetch data from ${tableName}: ${error.message}`,
          variant: "destructive",
        });
        throw error;
      }
      
      console.log(`Successfully refetched ${data?.length || 0} records from ${tableName}`);
      
      if (data) {
        setData(data);
        if (onSuccess) onSuccess(data);
      }
      
      toast({
        title: "Success",
        description: `${tableName} data refreshed successfully`,
      });
    } catch (err: any) {
      console.error(`Error in refetch(${tableName}):`, err);
      setError(`Failed to fetch data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, refetch };
}

// Specialized hooks for different tables
export function useTeamLeads() {
  return useFetchData<TeamLead>(
    'team_leads',
    () => supabase
      .from('team_leads')
      .select('*')
      .order('name', { ascending: true })
  );
}

export function useAgents(teamLeadId: string | null, enabled: boolean = true) {
  return useFetchData<Agent>(
    'agents',
    async () => {
      if (!teamLeadId || !enabled) {
        return { data: [], error: null };
      }
      
      return supabase
        .from('agents')
        .select('*')
        .eq('team_lead_id', teamLeadId)
        .order('start_date', { ascending: false });
    },
    [teamLeadId, enabled]
  );
}

export function useDailyStats(
  teamLeadId: string | null, 
  startDate: string | null, 
  endDate: string | null,
  enabled: boolean = true
) {
  return useFetchData<DailyStats>(
    'daily_stats',
    async () => {
      if (!teamLeadId || !startDate || !endDate || !enabled) {
        return { data: [], error: null };
      }
      
      return supabase
        .from('daily_stats')
        .select('*')
        .eq('team_lead_id', teamLeadId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
    },
    [teamLeadId, startDate, endDate, enabled]
  );
}

export function useSurveyTickets(
  teamLeadId: string | null, 
  startDate: string | null, 
  endDate: string | null,
  enabled: boolean = true
) {
  return useFetchData<any>(
    'After Call Survey Tickets',
    async () => {
      if (!teamLeadId || !startDate || !endDate || !enabled) {
        return { data: [], error: null };
      }
      
      return supabase
        .from('After Call Survey Tickets')
        .select('*')
        .eq('team_lead_id', teamLeadId)
        .gte('date', startDate)
        .lte('date', endDate);
    },
    [teamLeadId, startDate, endDate, enabled]
  );
}

export function useTeamLeadOverview() {
  return useFetchData<TeamLeadOverview>(
    'team_metrics',
    () => supabase
      .from('team_metrics')
      .select('*')
  );
}

// Hook to verify database connection is working
export function useDatabaseConnection() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const checkConnection = async () => {
    try {
      setIsChecking(true);
      setConnectionError(null);
      
      console.log('Checking database connection...');
      
      // Try to fetch a single row from team_leads table as a connection test
      const { data, error } = await supabase
        .from('team_leads')
        .select('id')
        .limit(1);
        
      if (error) {
        console.error('Database connection error:', error);
        setConnectionError(`Failed to connect to database: ${error.message}`);
        setIsConnected(false);
        throw error;
      }
      
      console.log('Database connection successful');
      setIsConnected(true);
      return true;
    } catch (err: any) {
      console.error('Database connection check failed:', err);
      setConnectionError(`Failed to connect to database: ${err.message}`);
      setIsConnected(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  };
  
  useEffect(() => {
    checkConnection();
  }, []);

  return { isConnected, isChecking, connectionError, checkConnection };
}
