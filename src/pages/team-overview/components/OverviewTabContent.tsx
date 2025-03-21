
import { TeamLeadOverview } from "@/types/teamLead";
import { GaugeChart } from "@/components/dashboard/GaugeChart";
import { BarChartComparison } from "@/components/dashboard/BarChartComparison";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { PerformanceTable } from "@/components/dashboard/PerformanceTable";
import { TeamNetworkGraph } from "@/components/dashboard/TeamNetworkGraph";

interface OverviewTabContentProps {
  overview: TeamLeadOverview[];
}

export const OverviewTabContent = ({ overview }: OverviewTabContentProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GaugeChart 
          data={overview} 
          title="Issues Per Agent Per Day" 
          description="Daily target performance for customer support issues"
        />
        <BarChartComparison data={overview} />
      </div>
      
      <PerformanceChart data={overview} />
      <PerformanceTable data={overview} />
      <TeamNetworkGraph data={overview} />
    </>
  );
};
