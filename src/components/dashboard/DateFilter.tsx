
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateRange } from "@/types/teamLead";
import { useState, useEffect } from "react";
import { CalendarDays } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useDateRange } from "@/context/DateContext";

interface DateFilterProps {
  onApplyFilter?: () => void;
}

export const DateFilter = ({ onApplyFilter }: DateFilterProps) => {
  const { dateRange, setDateRange } = useDateRange();
  const [tempRange, setTempRange] = useState<DateRange>(dateRange);

  // Update tempRange when dateRange from context changes
  useEffect(() => {
    setTempRange(dateRange);
  }, [dateRange]);

  const handleApplyFilter = () => {
    // Validate date range
    if (!tempRange.startDate || !tempRange.endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive"
      });
      return;
    }

    // Validate that start date is not after end date
    if (tempRange.startDate > tempRange.endDate) {
      toast({
        title: "Error",
        description: "Start date cannot be after end date",
        variant: "destructive"
      });
      return;
    }

    console.log("Applying date filter:", tempRange);
    setDateRange(tempRange);
    toast({
      title: "Filters Applied",
      description: `Date range: ${tempRange.startDate} to ${tempRange.endDate}`,
    });
    
    if (onApplyFilter) {
      onApplyFilter();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-muted/50 p-4 rounded-lg">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Date Range:</span>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Input
          type="date"
          value={tempRange.startDate}
          onChange={(e) => setTempRange({ ...tempRange, startDate: e.target.value })}
          className="w-full sm:w-40"
        />
        <span className="text-sm text-muted-foreground">to</span>
        <Input
          type="date"
          value={tempRange.endDate}
          onChange={(e) => setTempRange({ ...tempRange, endDate: e.target.value })}
          className="w-full sm:w-40"
        />
      </div>
      <Button 
        onClick={handleApplyFilter}
        size="sm"
        className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
      >
        Apply Filter
      </Button>
    </div>
  );
};
