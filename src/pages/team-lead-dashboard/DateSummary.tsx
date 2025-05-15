
import { useMemo } from 'react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface DateSummaryProps {
  startDate: string | null;
  endDate: string | null;
}

export const DateSummary = ({ startDate, endDate }: DateSummaryProps) => {
  const dateInfo = useMemo(() => {
    if (!startDate || !endDate) {
      return { formattedRange: 'Date range not selected', dayCount: 0 };
    }
    
    try {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      
      const formattedStart = format(start, 'MMM d, yyyy');
      const formattedEnd = format(end, 'MMM d, yyyy');
      const dayCount = differenceInDays(end, start) + 1; // +1 to include the start day
      
      return {
        formattedRange: `${formattedStart} - ${formattedEnd}`,
        dayCount
      };
    } catch (error) {
      console.error("Error formatting dates:", error);
      return { formattedRange: 'Invalid date range', dayCount: 0 };
    }
  }, [startDate, endDate]);
  
  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span>{dateInfo.formattedRange}</span>
      </Badge>
      <Badge variant="secondary" className="px-3 py-1">
        {dateInfo.dayCount} {dateInfo.dayCount === 1 ? 'day' : 'days'}
      </Badge>
    </div>
  );
};
