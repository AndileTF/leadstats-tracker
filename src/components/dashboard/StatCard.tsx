
import { Card } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  highlight?: boolean;
  suffix?: string;
  change?: number;
  isPositive?: boolean;
}

export const StatCard = ({ 
  title, 
  value, 
  icon, 
  highlight = false, 
  suffix = '',
  change,
  isPositive
}: StatCardProps) => (
  <Card className={`p-6 ${highlight ? 'border-primary/30 bg-primary/5' : ''}`}>
    <div className="flex justify-between items-start mb-4">
      <p className="text-muted-foreground font-medium">{title}</p>
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
    </div>
    <div className="flex items-end justify-between">
      <h3 className="text-3xl font-bold">
        {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}{suffix}
      </h3>
      {change !== undefined && (
        <div className={`flex items-center text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? (
            <ArrowUp className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDown className="h-4 w-4 mr-1" />
          )}
          <span>{change.toFixed(1)}</span>
        </div>
      )}
    </div>
  </Card>
);
