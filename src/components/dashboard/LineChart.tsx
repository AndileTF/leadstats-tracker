
import { useState } from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyStats } from "@/types/teamLead";

interface LineChartProps {
  data: DailyStats[];
  teamLeadName: string;
}

const METRICS = [
  { key: 'calls', name: 'Calls', color: '#8884d8' },
  { key: 'emails', name: 'Emails', color: '#82ca9d' },
  { key: 'live_chat', name: 'Live Chat', color: '#ffc658' },
  { key: 'escalations', name: 'Escalations', color: '#ff7f0e' },
  { key: 'qa_assessments', name: 'QA Assessments', color: '#2ca02c' },
  { key: 'survey_tickets', name: 'Survey Tickets', color: '#d62728' },
];

export const LineChart = ({ data, teamLeadName }: LineChartProps) => {
  const [visibleMetrics, setVisibleMetrics] = useState(METRICS.map(m => m.key));

  const toggleMetric = (metric: string) => {
    if (visibleMetrics.includes(metric)) {
      setVisibleMetrics(visibleMetrics.filter(m => m !== metric));
    } else {
      setVisibleMetrics([...visibleMetrics, metric]);
    }
  };

  const formattedData = data.map(stat => ({
    date: stat.date,
    calls: stat.calls || 0,
    emails: stat.emails || 0,
    live_chat: stat.live_chat || 0,
    escalations: stat.escalations || 0,
    qa_assessments: stat.qa_assessments || 0,
    survey_tickets: stat.survey_tickets || 0,
  }));

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Performance Trends - {teamLeadName}
        </CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          {METRICS.map(metric => (
            <Button
              key={metric.key}
              variant={visibleMetrics.includes(metric.key) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleMetric(metric.key)}
              style={{
                backgroundColor: visibleMetrics.includes(metric.key) ? metric.color : '',
                color: visibleMetrics.includes(metric.key) ? 'white' : '',
                borderColor: metric.color
              }}
            >
              {metric.name}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <RechartsLineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {METRICS.map(metric => (
              visibleMetrics.includes(metric.key) && (
                <Line
                  key={metric.key}
                  type="monotone"
                  dataKey={metric.key}
                  stroke={metric.color}
                  name={metric.name}
                  activeDot={{ r: 8 }}
                />
              )
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
