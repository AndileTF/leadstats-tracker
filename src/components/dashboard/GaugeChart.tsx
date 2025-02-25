
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TeamLeadOverview } from "@/types/teamLead";

interface GaugeChartProps {
  data: TeamLeadOverview[];
  title: string;
  description?: string;
}

const calculateAverageSLA = (data: TeamLeadOverview[]): number => {
  if (data.length === 0) return 0;
  const totalSLA = data.reduce((sum, item) => sum + (item.average_sla || 0), 0);
  return totalSLA / data.length;
};

export const GaugeChart = ({ data, title, description }: GaugeChartProps) => {
  const averageSLA = calculateAverageSLA(data);
  const percentage = Math.min(100, Math.max(0, averageSLA));
  
  // Determine color based on percentage
  const getColor = (value: number) => {
    if (value >= 90) return 'bg-green-600';
    if (value >= 75) return 'bg-green-500';
    if (value >= 60) return 'bg-yellow-500';
    if (value >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const color = getColor(percentage);
  
  // Calculate rotation for gauge needle (from -90 to 90 degrees)
  const rotation = (percentage / 100) * 180 - 90;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative w-48 h-24 mb-6">
          {/* Gauge background */}
          <div className="absolute w-full h-full bg-gray-200 rounded-t-full overflow-hidden"></div>
          
          {/* Gauge fill */}
          <div 
            className={`absolute w-full h-full rounded-t-full overflow-hidden ${color}`}
            style={{ 
              clipPath: `polygon(0% 100%, 100% 100%, 100% ${100 - percentage}%, 0% ${100 - percentage}%)` 
            }}
          ></div>
          
          {/* Gauge needle */}
          <div 
            className="absolute top-full left-1/2 w-1 h-24 -mt-1 -ml-0.5 bg-gray-800 origin-top"
            style={{ transform: `rotate(${rotation}deg)` }}
          ></div>
          
          {/* Gauge center point */}
          <div className="absolute bottom-0 left-1/2 w-3 h-3 -ml-1.5 rounded-full bg-gray-800"></div>
        </div>
        
        {/* Percentage display */}
        <div className="text-3xl font-bold">{percentage.toFixed(1)}%</div>
        
        {/* Gauge labels */}
        <div className="w-48 flex justify-between mt-2">
          <span className="text-xs">0%</span>
          <span className="text-xs">50%</span>
          <span className="text-xs">100%</span>
        </div>
      </CardContent>
    </Card>
  );
};
