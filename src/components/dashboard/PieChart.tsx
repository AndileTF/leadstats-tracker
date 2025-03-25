
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamLeadOverview } from "@/types/teamLead";

interface PieChartProps {
  data: TeamLeadOverview[];
  metric: keyof TeamLeadOverview;
  title: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f0e', '#2ca02c', '#d62728', '#7f7f7f', '#bcbd22', '#17becf'];

export const PieChart = ({ data, metric, title }: PieChartProps) => {
  // Filter to only include items with values for the selected metric
  const pieData = data
    .filter(item => item[metric] && Number(item[metric]) > 0)
    .map(item => ({
      name: item.name || 'Unknown',
      value: Number(item[metric]) || 0,
    }));

  // Calculate total sum for the metric
  const totalSum = pieData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        {totalSum > 0 && (
          <p className="text-muted-foreground text-sm">
            Total sum of {title.replace('Distribution of ', '')}: {totalSum}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}`, 'Sum']} />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex justify-center items-center h-[300px] text-muted-foreground">
            No data available for the selected date range
          </div>
        )}
      </CardContent>
    </Card>
  );
};
