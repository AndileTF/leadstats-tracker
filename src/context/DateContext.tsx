
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { DateRange } from "@/types/teamLead";
import { format, subDays } from "date-fns";

interface DateContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  resetToDefaultRange: () => void;
}

// Default date range: last 30 days to today
const getCurrentDate = () => format(new Date(), 'yyyy-MM-dd');
const getDefaultStartDate = () => format(subDays(new Date(), 30), 'yyyy-MM-dd');

const defaultDateRange: DateRange = {
  startDate: getDefaultStartDate(),
  endDate: getCurrentDate()
};

const DateContext = createContext<DateContextType>({
  dateRange: defaultDateRange,
  setDateRange: () => {},
  resetToDefaultRange: () => {}
});

export const DateProvider = ({ children }: { children: ReactNode }) => {
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange);

  // Reset function to return to default date range
  const resetToDefaultRange = () => {
    const newDefaultRange = {
      startDate: getDefaultStartDate(),
      endDate: getCurrentDate()
    };
    console.log("DateProvider: Resetting to default date range:", newDefaultRange);
    setDateRange(newDefaultRange);
  };

  // Log date range changes for debugging
  useEffect(() => {
    console.log("DateProvider: date range updated:", dateRange);
    
    // Validate date format
    if (dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error("DateProvider: Invalid date format detected", dateRange);
      } else {
        console.log("DateProvider: Valid date range", {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          days: Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        });
      }
    }
  }, [dateRange]);

  return (
    <DateContext.Provider value={{ dateRange, setDateRange, resetToDefaultRange }}>
      {children}
    </DateContext.Provider>
  );
};

export const useDateRange = () => useContext(DateContext);
