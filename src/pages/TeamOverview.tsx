
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TeamLeadOverview, DateRange } from "@/types/teamLead";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { PerformanceTable } from "@/components/dashboard/PerformanceTable";
import { DateFilter } from "@/components/dashboard/DateFilter";
import { TeamOverviewHeader } from "@/components/dashboard/TeamOverviewHeader";
import { FileHandlers } from "@/components/dashboard/FileHandlers";

/**
 * TeamOverview component displays performance metrics for all team leads
 */
const TeamOverview = () => {
  const [overview, setOverview] = useState<TeamLeadOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchOverview();
  }, [dateRange]);

  const fetchOverview = async () => {
    try {
      const { data: dailyStats, error } = await supabase
        .from('daily_stats')
        .select(`
          team_leads (
            name
          ),
          calls,
          emails,
          live_chat,
          escalations,
          qa_assessments,
          survey_tickets
        `)
        .gte('date', dateRange.startDate)
        .lte('date', dateRange.endDate);

      if (error) throw error;

      // Transform daily stats into overview format
      const overview = dailyStats.reduce((acc: { [key: string]: any }, curr) => {
        const name = curr.team_leads?.name;
        if (!name) return acc;
        
        if (!acc[name]) {
          acc[name] = {
            name,
            total_calls: 0,
            total_emails: 0,
            total_live_chat: 0,
            total_escalations: 0,
            total_qa_assessments: 0,
            total_survey_tickets: 0,
            total_days: 0
          };
        }
        
        acc[name].total_calls += curr.calls || 0;
        acc[name].total_emails += curr.emails || 0;
        acc[name].total_live_chat += curr.live_chat || 0;
        acc[name].total_escalations += curr.escalations || 0;
        acc[name].total_qa_assessments += curr.qa_assessments || 0;
        acc[name].total_survey_tickets += curr.survey_tickets || 0;
        acc[name].total_days += 1;
        
        return acc;
      }, {});

      setOverview(Object.values(overview));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch overview",
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
    <div className="min-h-screen p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <TeamOverviewHeader />
          <FileHandlers data={overview} />
        </div>

        <Card className="p-6">
          <DateFilter
            dateRange={dateRange}
            setDateRange={setDateRange}
          />

          <PerformanceChart data={overview} />
          <PerformanceTable data={overview} />
        </Card>
      </div>
    </div>
  );
};

export default TeamOverview;
