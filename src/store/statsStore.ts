import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { AggregatedData } from '@/utils/dataAggregation';
import { TeamLeadOverview, TeamLead } from '@/types/teamLead';

interface StatsState {
  // Data
  teamLeads: TeamLead[];
  dailyStats: AggregatedData[];
  teamOverview: TeamLeadOverview[];
  selectedTeamLead: string | null;
  dateRange: { startDate: string; endDate: string };
  
  // Loading states
  isLoading: boolean;
  isLoadingStats: boolean;
  isLoadingOverview: boolean;
  
  // Actions
  setTeamLeads: (teamLeads: TeamLead[]) => void;
  setDailyStats: (stats: AggregatedData[]) => void;
  setTeamOverview: (overview: TeamLeadOverview[]) => void;
  setSelectedTeamLead: (id: string | null) => void;
  setDateRange: (range: { startDate: string; endDate: string }) => void;
  setLoading: (loading: boolean) => void;
  setLoadingStats: (loading: boolean) => void;
  setLoadingOverview: (loading: boolean) => void;
  
  // Computed values
  getStatsForTeamLead: (teamLeadId: string) => AggregatedData[];
  getTeamLeadById: (id: string) => TeamLead | undefined;
  
  // Real-time actions
  invalidateStats: () => void;
  updateSingleStat: (stat: AggregatedData) => void;
  removeStat: (statId: string) => void;
}

export const useStatsStore = create<StatsState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    teamLeads: [],
    dailyStats: [],
    teamOverview: [],
    selectedTeamLead: null,
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    },
    isLoading: false,
    isLoadingStats: false,
    isLoadingOverview: false,
    
    // Actions
    setTeamLeads: (teamLeads) => set({ teamLeads }),
    setDailyStats: (dailyStats) => set({ dailyStats }),
    setTeamOverview: (teamOverview) => set({ teamOverview }),
    setSelectedTeamLead: (selectedTeamLead) => set({ selectedTeamLead }),
    setDateRange: (dateRange) => set({ dateRange }),
    setLoading: (isLoading) => set({ isLoading }),
    setLoadingStats: (isLoadingStats) => set({ isLoadingStats }),
    setLoadingOverview: (isLoadingOverview) => set({ isLoadingOverview }),
    
    // Computed values
    getStatsForTeamLead: (teamLeadId: string) => {
      const { dailyStats } = get();
      return dailyStats.filter(stat => stat.team_lead_id === teamLeadId);
    },
    
    getTeamLeadById: (id: string) => {
      const { teamLeads } = get();
      return teamLeads.find(tl => tl.id === id);
    },
    
    // Real-time actions
    invalidateStats: () => {
      // Trigger a re-fetch by consumers
      set(state => ({ ...state }));
    },
    
    updateSingleStat: (newStat: AggregatedData) => {
      set(state => {
        const existingIndex = state.dailyStats.findIndex(
          stat => stat.id === newStat.id
        );
        
        let updatedStats;
        if (existingIndex >= 0) {
          // Update existing stat
          updatedStats = [...state.dailyStats];
          updatedStats[existingIndex] = newStat;
        } else {
          // Add new stat
          updatedStats = [...state.dailyStats, newStat];
        }
        
        return { dailyStats: updatedStats };
      });
    },
    
    removeStat: (statId: string) => {
      set(state => ({
        dailyStats: state.dailyStats.filter(stat => stat.id !== statId)
      }));
    }
  }))
);