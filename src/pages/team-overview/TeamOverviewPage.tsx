
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TeamLeadOverview, DateRange, DailyStats, TeamLead } from "@/types/teamLead";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTeamData } from './hooks/useTeamData';
import { TeamOverviewHeader } from "@/components/dashboard/TeamOverviewHeader";
import { DateFilter } from "@/components/dashboard/DateFilter";
import { OverviewTabContent } from './components/OverviewTabContent';
import { DetailedTabContent } from './components/DetailedTabContent';

const TeamOverviewPage = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: format(new Date(new Date().setDate(new Date().getDate() - 7)), 'yyyy-MM-dd'), // Default to 7 days ago
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  
  const { 
    overview, 
    dailyStats, 
    teamLeads, 
    selectedTeamLead, 
    setSelectedTeamLead, 
    isLoading, 
    realTimeCleanup 
  } = useTeamData(dateRange);

  useEffect(() => {
    return () => {
      // Clean up real-time subscriptions when component unmounts
      realTimeCleanup();
    };
  }, []);

  if (isLoading && !overview.length && !dailyStats.length) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <TeamOverviewHeader />

        <Card>
          <CardContent className="p-6">
            <DateFilter dateRange={dateRange} setDateRange={setDateRange} />

            <Tabs defaultValue="overview" className="mt-6">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="overview">Team Overview</TabsTrigger>
                <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <OverviewTabContent overview={overview} />
              </TabsContent>
              
              <TabsContent value="detailed" className="space-y-6">
                <DetailedTabContent 
                  overview={overview}
                  dailyStats={dailyStats}
                  teamLeads={teamLeads}
                  selectedTeamLead={selectedTeamLead}
                  setSelectedTeamLead={setSelectedTeamLead}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamOverviewPage;
