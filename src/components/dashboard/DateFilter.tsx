
import { Input } from "@/components/ui/input";
import { DateRange } from "@/types/teamLead";

interface DateFilterProps {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

export const DateFilter = ({
  dateRange,
  setDateRange
}: DateFilterProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={dateRange.startDate}
          onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
          className="w-40"
        />
        <span className="text-sm text-muted-foreground">to</span>
        <Input
          type="date"
          value={dateRange.endDate}
          onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
          className="w-40"
        />
      </div>
    </div>
  );
};
