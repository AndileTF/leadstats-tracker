
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DateFilterProps {
  dateFilter: 'day' | 'week' | 'month' | 'custom';
  setDateFilter: (filter: 'day' | 'week' | 'month' | 'custom') => void;
  customDate: string;
  setCustomDate: (date: string) => void;
}

export const DateFilter = ({
  dateFilter,
  setDateFilter,
  customDate,
  setCustomDate
}: DateFilterProps) => {
  return (
    <div className="flex gap-4">
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setDateFilter('day')}
          className={dateFilter === 'day' ? 'bg-primary/20' : ''}
        >
          Day
        </Button>
        <Button
          variant="outline"
          onClick={() => setDateFilter('week')}
          className={dateFilter === 'week' ? 'bg-primary/20' : ''}
        >
          Week
        </Button>
        <Button
          variant="outline"
          onClick={() => setDateFilter('month')}
          className={dateFilter === 'month' ? 'bg-primary/20' : ''}
        >
          Month
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setDateFilter('custom')}
            className={dateFilter === 'custom' ? 'bg-primary/20' : ''}
          >
            Custom
          </Button>
          <Input
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="w-40"
          />
        </div>
      </div>
    </div>
  );
};
