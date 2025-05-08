
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
          return;
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
        return;
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
    async () => {
      // Adding await here to fix the TypeScript error
      return await supabase
        .from('team_leads')
        .select('*')
        .order('name', { ascending: true });
    }
  );
}

export function useAgents(teamLeadId: string | null, enabled: boolean = true) {
  return useFetchData<Agent>(
    'agents',
    async () => {
      if (!teamLeadId || !enabled) {
        return { data: [], error: null };
      }
      
      return await supabase
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
        console.log("Missing parameters for daily stats query:", { teamLeadId, startDate, endDate, enabled });
        return { data: [], error: null };
      }
      
      console.log(`Fetching daily stats for team lead ${teamLeadId} from ${startDate} to ${endDate}`);
      
      try {
        const response = await supabase
          .from('daily_stats')
          .select('*')
          .eq('team_lead_id', teamLeadId)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: false });
          
        console.log(`Daily stats query response:`, {
          data: response.data ? response.data.length : 0,
          error: response.error,
          params: { teamLeadId, startDate, endDate }
        });
          
        return response;
      } catch (err) {
        console.error("Error executing daily stats query:", err);
        throw err;
      }
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
        console.log("Missing parameters for survey tickets query:", { teamLeadId, startDate, endDate, enabled });
        return { data: [], error: null };
      }
      
      console.log(`Fetching survey tickets for team lead ${teamLeadId} from ${startDate} to ${endDate}`);
      
      try {
        const response = await supabase
          .from('After Call Survey Tickets')
          .select('*')
          .eq('team_lead_id', teamLeadId)
          .gte('date', startDate)
          .lte('date', endDate);
          
        console.log(`Survey tickets query response:`, {
          data: response.data ? response.data.length : 0,
          error: response.error,
          params: { teamLeadId, startDate, endDate }
        });
          
        return response;
      } catch (err) {
        console.error("Error executing survey tickets query:", err);
        throw err;
      }
    },
    [teamLeadId, startDate, endDate, enabled]
  );
}

export function useCalls(
  teamLeadId: string | null, 
  startDate: string | null, 
  endDate: string | null,
  enabled: boolean = true
) {
  return useFetchData<any>(
    'Calls',
    async () => {
      if (!teamLeadId || !startDate || !endDate || !enabled) {
        return { data: [], error: null };
      }
      
      return await supabase
        .from('Calls')
        .select('*')
        .eq('team_lead_id', teamLeadId)
        .gte('Date', startDate)
        .lte('Date', endDate);
    },
    [teamLeadId, startDate, endDate, enabled]
  );
}

export function useEmails(
  teamLeadId: string | null, 
  startDate: string | null, 
  endDate: string | null,
  enabled: boolean = true
) {
  return useFetchData<any>(
    'Emails',
    async () => {
      if (!teamLeadId || !startDate || !endDate || !enabled) {
        return { data: [], error: null };
      }
      
      return await supabase
        .from('Emails')
        .select('*')
        .eq('team_lead_id', teamLeadId)
        .gte('Date', startDate)
        .lte('Date', endDate);
    },
    [teamLeadId, startDate, endDate, enabled]
  );
}

export function useLiveChat(
  teamLeadId: string | null, 
  startDate: string | null, 
  endDate: string | null,
  enabled: boolean = true
) {
  return useFetchData<any>(
    'Live Chat',
    async () => {
      if (!teamLeadId || !startDate || !endDate || !enabled) {
        return { data: [], error: null };
      }
      
      return await supabase
        .from('Live Chat')
        .select('*')
        .eq('team_lead_id', teamLeadId)
        .gte('Date', startDate)
        .lte('Date', endDate);
    },
    [teamLeadId, startDate, endDate, enabled]
  );
}

export function useEscalations(
  teamLeadId: string | null, 
  startDate: string | null, 
  endDate: string | null,
  enabled: boolean = true
) {
  return useFetchData<any>(
    'Escalations',
    async () => {
      if (!teamLeadId || !startDate || !endDate || !enabled) {
        return { data: [], error: null };
      }
      
      return await supabase
        .from('Escalations')
        .select('*')
        .eq('team_lead_id', teamLeadId)
        .gte('Date', startDate)
        .lte('Date', endDate);
    },
    [teamLeadId, startDate, endDate, enabled]
  );
}

export function useQAAssessments(
  teamLeadId: string | null, 
  startDate: string | null, 
  endDate: string | null,
  enabled: boolean = true
) {
  return useFetchData<any>(
    'QA Table',
    async () => {
      if (!teamLeadId || !startDate || !endDate || !enabled) {
        return { data: [], error: null };
      }
      
      return await supabase
        .from('QA Table')
        .select('*')
        .eq('team_lead_id', teamLeadId)
        .gte('Date', startDate)
        .lte('Date', endDate);
    },
    [teamLeadId, startDate, endDate, enabled]
  );
}

export function useTeamLeadOverview() {
  return useFetchData<TeamLeadOverview>(
    'team_metrics',
    async () => {
      // Adding await here to fix the TypeScript error
      return await supabase
        .from('team_metrics')
        .select('*');
    }
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
        return false;
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
