import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStatsStore } from '@/store/statsStore';
import { aggregateDataFromAllTables } from '@/utils/dataAggregation';
import { toast } from '@/hooks/use-toast';

export const useRealtimeStats = () => {
  const {
    dateRange,
    selectedTeamLead,
    setDailyStats,
    setTeamOverview,
    updateSingleStat,
    invalidateStats
  } = useStatsStore();
  
  const channelRef = useRef<any>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced refresh function
  const debouncedRefresh = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        // Refresh stats data
        const aggregatedStats = await aggregateDataFromAllTables(
          dateRange.startDate,
          dateRange.endDate,
          selectedTeamLead || undefined
        );
        
        setDailyStats(aggregatedStats);
        invalidateStats();
        
        toast({
          title: "Data Updated",
          description: "Statistics have been refreshed with latest data.",
        });
      } catch (error) {
        console.error('Error refreshing real-time stats:', error);
      }
    }, 1000); // 1 second debounce
  };

  useEffect(() => {
    // Set up real-time subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    channelRef.current = supabase
      .channel('stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_stats_duplicate'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Calls'
        },
        (payload) => {
          console.log('Calls table update:', payload);
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Emails'
        },
        (payload) => {
          console.log('Emails table update:', payload);
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Live Chat'
        },
        (payload) => {
          console.log('Live Chat table update:', payload);
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Escalations'
        },
        (payload) => {
          console.log('Escalations table update:', payload);
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'QA Table'
        },
        (payload) => {
          console.log('QA Table update:', payload);
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'After Call Survey Tickets'
        },
        (payload) => {
          console.log('Survey Tickets update:', payload);
          debouncedRefresh();
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [dateRange, selectedTeamLead]);

  return {
    refreshStats: debouncedRefresh
  };
};