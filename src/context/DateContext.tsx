
import { createContext, useContext, useState, ReactNode } from "react";
import { DateRange } from "@/types/teamLead";
import { format } from "date-fns";

interface DateContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

const defaultDateRange: DateRange = {
  startDate: format(new Date(), 'yyyy-MM-dd'),
  endDate: format(new Date(), 'yyyy-MM-dd')
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
