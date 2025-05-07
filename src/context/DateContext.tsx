
import { createContext, useContext, useState, ReactNode } from "react";
import { DateRange } from "@/types/teamLead";
import { format, subDays } from "date-fns";

interface DateContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
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
  setDateRange: () => {}
});

export const DateProvider = ({ children }: { children: ReactNode }) => {
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange);

  return (
    <DateContext.Provider value={{ dateRange, setDateRange }}>
      {children}
    </DateContext.Provider>
  );
};

export const useDateRange = () => useContext(DateContext);
