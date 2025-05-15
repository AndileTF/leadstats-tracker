
import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  highlight?: boolean;
  suffix?: string;
}

export const StatCard = ({ title, value, icon, highlight = false, suffix = '' }: StatCardProps) => (
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
    </div>
  </Card>
);
