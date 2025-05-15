
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyStats } from "@/types/teamLead";
import { StatCard } from "./StatCard";

interface StatsGridProps {
  stats: DailyStats[];
  totalStats?: Record<string, number>;
  statsCount?: number;
}

export const StatsGrid = ({ stats, totalStats, statsCount = 1 }: StatsGridProps) => {
  // If we don't have pre-calculated totals, calculate them from the stats array
  const calculatedTotals = totalStats || stats.reduce(
    (acc, curr) => ({
      calls: acc.calls + (curr.calls || 0),
      emails: acc.emails + (curr.emails || 0),
      live_chat: acc.live_chat + (curr.live_chat || 0),
      escalations: acc.escalations + (curr.escalations || 0),
      qa_assessments: acc.qa_assessments + (curr.qa_assessments || 0),
      survey_tickets: acc.survey_tickets + (curr.survey_tickets || 0),
    }),
    {
      calls: 0,
      emails: 0,
      live_chat: 0,
      escalations: 0,
      qa_assessments: 0,
      survey_tickets: 0,
    }
  );
  
  // Calculate the averages
  const avgCalls = calculatedTotals.calls / statsCount;
  const avgEmails = calculatedTotals.emails / statsCount;
  const avgLiveChat = calculatedTotals.live_chat / statsCount;
  const avgEscalations = calculatedTotals.escalations / statsCount;
  const avgQA = calculatedTotals.qa_assessments / statsCount;
  const avgSurveyTickets = calculatedTotals.survey_tickets / statsCount;

  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>
            Key statistics for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard 
              title="Total Calls" 
              value={calculatedTotals.calls} 
              change={avgCalls}
              isPositive={true}
            />
            <StatCard 
              title="Total Emails" 
              value={calculatedTotals.emails} 
              change={avgEmails}
              isPositive={true}
            />
            <StatCard 
              title="Live Chat" 
              value={calculatedTotals.live_chat} 
              change={avgLiveChat}
              isPositive={true}
            />
            <StatCard 
              title="Escalations" 
              value={calculatedTotals.escalations} 
              change={avgEscalations}
              isPositive={false}
            />
            <StatCard 
              title="QA Assessments" 
              value={calculatedTotals.qa_assessments} 
              change={avgQA}
              isPositive={true}
            />
            <StatCard 
              title="Survey Tickets" 
              value={calculatedTotals.survey_tickets || 0} 
              change={avgSurveyTickets}
              isPositive={false}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Daily data breakdown */}
      {stats.length > 0 && (
        <div className="relative overflow-x-auto rounded-lg border">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted">
              <tr>
                <th scope="col" className="px-4 py-3">Date</th>
                <th scope="col" className="px-4 py-3">Calls</th>
                <th scope="col" className="px-4 py-3">Emails</th>
                <th scope="col" className="px-4 py-3">Live Chat</th>
                <th scope="col" className="px-4 py-3">Escalations</th>
                <th scope="col" className="px-4 py-3">QA</th>
                <th scope="col" className="px-4 py-3">Survey Tickets</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat) => (
                <tr key={stat.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">{stat.date}</td>
                  <td className="px-4 py-3">{stat.calls || 0}</td>
                  <td className="px-4 py-3">{stat.emails || 0}</td>
                  <td className="px-4 py-3">{stat.live_chat || 0}</td>
                  <td className="px-4 py-3">{stat.escalations || 0}</td>
                  <td className="px-4 py-3">{stat.qa_assessments || 0}</td>
                  <td className="px-4 py-3">{stat.survey_tickets || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
