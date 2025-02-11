
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TeamLeadOverview, DateFilter } from "@/types/teamLead";
import { toast } from "@/hooks/use-toast";
import { format, startOfToday, endOfToday, subDays, subWeeks, subMonths } from "date-fns";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { PerformanceTable } from "@/components/dashboard/PerformanceTable";
import { DateFilter as DateFilterComponent } from "@/components/dashboard/DateFilter";
import { TeamOverviewHeader } from "@/components/dashboard/TeamOverviewHeader";
import { FileHandlers } from "@/components/dashboard/FileHandlers";

/**
 * TeamOverview component displays performance metrics for all team leads
 */
const TeamOverview = () => {
  const [overview, setOverview] = useState<TeamLeadOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [customDate, setCustomDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    fetchOverview();
  }, [dateFilter, customDate]);

  /**
   * Gets the date range based on the selected filter
   * @returns Object containing start and end dates
   */
  const getDateRange = () => {
    const today = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (dateFilter) {
      case 'today':
        startDate = startOfToday();
        endDate = endOfToday();
        break;
      case 'day':
        startDate = subDays(today, 1);
        endDate = today;
        break;
      case 'week':
        startDate = subDays(today, 7);
        endDate = today;
        break;
      case 'month':
        startDate = subMonths(today, 1);
        endDate = today;
        break;
      case 'custom':
        startDate = new Date(customDate);
        endDate = new Date(customDate);
        endDate.setHours(23, 59, 59);
        break;
      default:
        startDate = startOfToday();
        endDate = endOfToday();
    }

    return { startDate, endDate };
  };

  /**
   * Fetches overview data from the database
   */
  const fetchOverview = async () => {
    try {
      const { startDate, endDate } = getDateRange();
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');

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
          sla_percentage
        `)
        .gte('date', formattedStartDate)
        .lte('date', formattedEndDate);

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
            total_days: 0,
            average_sla: 0,
            sla_count: 0
          };
        }
        
        acc[name].total_calls += curr.calls || 0;
        acc[name].total_emails += curr.emails || 0;
        acc[name].total_live_chat += curr.live_chat || 0;
        acc[name].total_escalations += curr.escalations || 0;
        acc[name].total_qa_assessments += curr.qa_assessments || 0;
        acc[name].average_sla += curr.sla_percentage || 0;
        acc[name].sla_count += 1;
        acc[name].total_days += 1;
        
        return acc;
      }, {});

      // Calculate final averages and convert to array
      const overviewArray = Object.values(overview).map((item: any) => ({
        ...item,
        average_sla: item.sla_count > 0 ? item.average_sla / item.sla_count : 0
      }));

      setOverview(overviewArray as TeamLeadOverview[]);
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
          <DateFilterComponent
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            customDate={customDate}
            setCustomDate={setCustomDate}
          />

          <PerformanceChart data={overview} />
          <PerformanceTable data={overview} />
        </Card>
      </div>
    </div>
  );
};

export default TeamOverview;
