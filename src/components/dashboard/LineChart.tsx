
import { useState } from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyStats } from "@/types/teamLead";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

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

// Target constants
const TARGETS = {
  daily: 20,
  weekly: 120,
  monthly: 480
};

type TimeRange = 'daily' | 'weekly' | 'monthly';

export const LineChart = ({ data, teamLeadName }: LineChartProps) => {
  const [visibleMetrics, setVisibleMetrics] = useState(METRICS.map(m => m.key));
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');

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
    // Add total for reference line comparison
    total: (stat.calls || 0) + (stat.emails || 0) + (stat.live_chat || 0) + 
           (stat.escalations || 0) + (stat.qa_assessments || 0) + (stat.survey_tickets || 0)
  }));

  // Get the current target based on selected time range
  const currentTarget = TARGETS[timeRange];

  // Calculate if the team lead is meeting targets
  const isTargetMet = () => {
    if (formattedData.length === 0) return false;
    
    if (timeRange === 'daily') {
      // Check if the most recent day meets the target
      return formattedData[0].total >= currentTarget;
    } else if (timeRange === 'weekly') {
      // Sum the 7 most recent days or all days if less than 7
      const daysToSum = Math.min(7, formattedData.length);
      const weeklySum = formattedData.slice(0, daysToSum).reduce((sum, day) => sum + day.total, 0);
      return weeklySum >= currentTarget;
    } else if (timeRange === 'monthly') {
      // Sum the 30 most recent days or all days if less than 30
      const daysToSum = Math.min(30, formattedData.length);
      const monthlySum = formattedData.slice(0, daysToSum).reduce((sum, day) => sum + day.total, 0);
      return monthlySum >= currentTarget;
    }
    return false;
  };

  const targetMet = isTargetMet();

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <CardTitle className="text-xl font-semibold">
            Performance Trends - {teamLeadName}
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <ToggleGroup type="single" value={timeRange} onValueChange={(value) => value && setTimeRange(value as TimeRange)}>
              <ToggleGroupItem value="daily" aria-label="Toggle daily view">
                Daily (Target: {TARGETS.daily})
              </ToggleGroupItem>
              <ToggleGroupItem value="weekly" aria-label="Toggle weekly view">
                Weekly (Target: {TARGETS.weekly})
              </ToggleGroupItem>
              <ToggleGroupItem value="monthly" aria-label="Toggle monthly view">
                Monthly (Target: {TARGETS.monthly})
              </ToggleGroupItem>
            </ToggleGroup>

            <div className={`text-sm font-medium px-3 py-1 rounded-full ${targetMet ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {targetMet ? 'Target Met' : 'Target Not Met'}
            </div>
          </div>
        </div>
        
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
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border rounded-md shadow-md p-2">
                      <p className="font-semibold">{label}</p>
                      {payload.map((entry) => (
                        <p key={entry.name} style={{ color: entry.color }}>
                          {entry.name}: {entry.value}
                        </p>
                      ))}
                      <p className="border-t mt-1 pt-1">
                        <span className="font-semibold">Target ({timeRange}):</span> {currentTarget}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            {/* Add reference line for current target */}
            <ReferenceLine 
              y={currentTarget} 
              label={`${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} Target`} 
              stroke="red" 
              strokeDasharray="3 3" 
            />
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
            {/* Add a line for total if needed */}
            {/* <Line type="monotone" dataKey="total" stroke="#000" name="Total" dot={false} /> */}
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
