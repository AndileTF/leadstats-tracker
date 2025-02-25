
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateRange } from "@/types/teamLead";
import { useState } from "react";
import { CalendarDays } from "lucide-react";

interface DateFilterProps {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

export const DateFilter = ({
  dateRange,
  setDateRange
}: DateFilterProps) => {
  const [tempRange, setTempRange] = useState<DateRange>(dateRange);

  const handleApplyFilter = () => {
    setDateRange(tempRange);
  };

  return (
    <div className="flex items-center gap-4 bg-muted/50 p-2 rounded-lg">
      <CalendarDays className="h-4 w-4 text-muted-foreground" />
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={tempRange.startDate}
          onChange={(e) => setTempRange({ ...tempRange, startDate: e.target.value })}
          className="w-40"
        />
        <span className="text-sm text-muted-foreground">to</span>
        <Input
          type="date"
          value={tempRange.endDate}
          onChange={(e) => setTempRange({ ...tempRange, endDate: e.target.value })}
          className="w-40"
        />
      </div>
      <Button 
        onClick={handleApplyFilter}
        size="sm"
        className="bg-primary/20 hover:bg-primary/30 text-primary"
      >
        Apply Filter
      </Button>
    </div>
  );
};
