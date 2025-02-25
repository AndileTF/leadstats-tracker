
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamLeadOverview } from "@/types/teamLead";
import { useState } from 'react';
import { Button } from "@/components/ui/button";

interface BarChartComparisonProps {
  data: TeamLeadOverview[];
}

const METRICS = [
  { key: 'total_calls', name: 'Calls', color: '#8884d8' },
  { key: 'total_emails', name: 'Emails', color: '#82ca9d' },
  { key: 'total_live_chat', name: 'Live Chat', color: '#ffc658' },
  { key: 'total_escalations', name: 'Escalations', color: '#ff7f0e' },
  { key: 'total_qa_assessments', name: 'QA Assessments', color: '#2ca02c' },
  { key: 'total_survey_tickets', name: 'Survey Tickets', color: '#d62728' },
];

export const BarChartComparison = ({ data }: BarChartComparisonProps) => {
  const [selectedMetrics, setSelectedMetrics] = useState(['total_calls', 'total_emails']);

  const toggleMetric = (metric: string) => {
    if (selectedMetrics.includes(metric)) {
      if (selectedMetrics.length > 1) {
        setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
      }
    } else {
      setSelectedMetrics([...selectedMetrics, metric]);
    }
  };

  // Format data for the chart
  const chartData = data.map(team => ({
    name: team.name,
    ...METRICS.reduce((acc, metric) => ({
      ...acc,
      [metric.key]: team[metric.key as keyof TeamLeadOverview] || 0
    }), {}),
  }));

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Team Performance Comparison</CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          {METRICS.map(metric => (
            <Button
              key={metric.key}
              variant={selectedMetrics.includes(metric.key) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleMetric(metric.key)}
              style={{
                backgroundColor: selectedMetrics.includes(metric.key) ? metric.color : '',
                color: selectedMetrics.includes(metric.key) ? 'white' : '',
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
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {METRICS.map(metric => (
              selectedMetrics.includes(metric.key) && (
                <Bar 
                  key={metric.key}
                  dataKey={metric.key} 
                  fill={metric.color} 
                  name={metric.name} 
                />
              )
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
