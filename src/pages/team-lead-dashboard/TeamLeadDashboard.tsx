
import { useState, useEffect } from 'react';
import { TeamLead } from "@/types/teamLead";
import { toast } from "@/hooks/use-toast";
import { DashboardHeader } from './DashboardHeader';
import { DashboardContent } from './DashboardContent';
import { useDateRange } from '@/context/DateContext';
import { useAuth } from '@/context/AuthContext';
import { aggregateDataFromAllTables, AggregatedData } from '@/utils/dataAggregation';
import { localDbClient } from '@/utils/localDbClient';

const TeamLeadDashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [teamLeads, setTeamLeads] = useState<TeamLead[]>([]);
  const [selectedTeamLead, setSelectedTeamLead] = useState<string | null>(null);
  const [stats, setStats] = useState<AggregatedData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { dateRange } = useDateRange();
  const { user } = useAuth();

  useEffect(() => {
    fetchTeamLeads();
  }, []);

  useEffect(() => {
    if (selectedTeamLead) {
      fetchStats();
    }
  }, [selectedTeamLead, dateRange]);

  const fetchTeamLeads = async () => {
    try {
      const data = await localDbClient.getTeamLeads();
      setTeamLeads(data);
      if (data.length > 0 && !selectedTeamLead) {
        setSelectedTeamLead(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching team leads:', error);
      toast({
        title: "Error",
        description: "Failed to fetch team leads from local database",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!selectedTeamLead) return;

    try {
      console.log('Fetching aggregated stats from all tables with date range:', dateRange);
      setIsLoading(true);
      
      // Use the aggregation function to get data from all tables
      const aggregatedStats = await aggregateDataFromAllTables(
        dateRange.startDate,
        dateRange.endDate,
        selectedTeamLead
      );

      console.log('Aggregated stats:', aggregatedStats);
      setStats(aggregatedStats);
    } catch (error) {
      console.error('Error fetching aggregated stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch stats from all tables",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        <DashboardHeader 
          showForm={showForm}
          setShowForm={setShowForm}
          onApplyFilter={fetchStats}
        />
        
        <DashboardContent
          teamLeads={teamLeads}
          selectedTeamLead={selectedTeamLead}
          setSelectedTeamLead={setSelectedTeamLead}
          showForm={showForm}
          stats={stats}
          fetchStats={fetchStats}
        />
      </div>
    </div>
  );
};

export default TeamLeadDashboard;
