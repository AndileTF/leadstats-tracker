import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "@/components/dashboard/PieChart";
import { LineChart } from "@/components/dashboard/LineChart";
import { TeamLeadOverview, DailyStats, TeamLead } from "@/types/teamLead";

interface PerformanceOverviewProps {
  teamLead: TeamLead | null;
  stats: DailyStats[];
}

export const PerformanceOverview = ({ teamLead, stats }: PerformanceOverviewProps) => {
  const metricLabels: { [key: string]: string } = {
    calls: 'Calls',
    emails: 'Emails',
    live_chat: 'Live Chat',
    escalations: 'Escalations',
    qa_assessments: 'QA Assessments'
  };
  
  const getMetricTotal = (metric: string): number => {
    return stats.reduce((acc, curr) => acc + (curr[metric] || 0), 0);
  };
  
  const dailyStatsForChart = stats.map(stat => ({
    date: stat.date,
    calls: stat.calls || 0,
    emails: stat.emails || 0,
    live_chat: stat.live_chat || 0,
    escalations: stat.escalations || 0,
    qa_assessments: stat.qa_assessments || 0
  }));
  
  const formatPieChartData = (metric: string): TeamLeadOverview[] => {
    // Create a complete TeamLeadOverview object for chart display
    return [
      {
        name: metricLabels[metric] || metric,
        value: getMetricTotal(metric),
        team_lead_id: teamLead?.id || '',
        total_days: 0,
        total_calls: getMetricTotal('calls'),
        total_emails: getMetricTotal('emails'),
        total_live_chat: getMetricTotal('live_chat'),
        total_escalations: getMetricTotal('escalations'),
        total_qa_assessments: getMetricTotal('qa_assessments'),
        total_survey_tickets: 0,
        average_sla: 0
      }
    ];
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Team Lead Performance Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {teamLead ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PieChart 
                data={formatPieChartData('calls')} 
                title="Call Volume" 
                description="Total number of calls handled"
                metric="value"
              />
              <PieChart 
                data={formatPieChartData('emails')} 
                title="Email Volume" 
                description="Total number of emails handled"
                metric="value"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PieChart 
                data={formatPieChartData('live_chat')} 
                title="Live Chat Volume" 
                description="Total number of live chats handled"
                metric="value"
              />
              <PieChart 
                data={formatPieChartData('escalations')} 
                title="Escalation Volume" 
                description="Total number of escalations handled"
                metric="value"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PieChart 
                data={formatPieChartData('qa_assessments')} 
                title="QA Assessments" 
                description="Total number of QA assessments performed"
                metric="value"
              />
            </div>
            
            <LineChart 
              data={dailyStatsForChart} 
              teamLeadName={teamLead.name} 
            />
          </>
        ) : (
          <p>No team lead selected.</p>
        )}
      </CardContent>
    </Card>
  );
};
