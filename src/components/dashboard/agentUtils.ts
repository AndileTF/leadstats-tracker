
import { differenceInDays } from "date-fns";

export const getTenureText = (startDate: string) => {
  const days = differenceInDays(new Date(), new Date(startDate));
  
  if (days < 30) {
    return `${days} days`;
  } else if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(days / 365);
    const remainingMonths = Math.floor((days % 365) / 30);
    return `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? `, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
  }
};

export const getGroupBadgeColor = (group: string) => {
  switch (group) {
    case 'Technical Support':
      return 'bg-blue-100 text-blue-800';
    case 'Sales':
      return 'bg-green-100 text-green-800';
    case 'Billing':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
