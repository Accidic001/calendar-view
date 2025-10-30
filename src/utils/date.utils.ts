import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays
} from 'date-fns';

export const getCalendarGrid = (date: Date): Date[] => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  // Manual implementation instead of eachDayOfInterval
  const days: Date[] = [];
  let currentDate = new Date(calendarStart);
  
  while (currentDate <= calendarEnd) {
    days.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  
  return days;
};

export const getWeekDays = (date: Date): Date[] => {
  const weekStart = startOfWeek(date);
  const days: Date[] = [];
  let currentDate = new Date(weekStart);
  
  for (let i = 0; i < 7; i++) {
    days.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  
  return days;
};

export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

export const isCurrentMonth = (date: Date, currentDate: Date): boolean => {
  return isSameMonth(date, currentDate);
};

export const formatDate = (date: Date, formatStr: string): string => {
  return format(date, formatStr);
};

export const navigateMonth = (date: Date, direction: 'prev' | 'next'): Date => {
  return direction === 'next' ? addMonths(date, 1) : subMonths(date, 1);
};

export const navigateWeek = (date: Date, direction: 'prev' | 'next'): Date => {
  return direction === 'next' ? addWeeks(date, 1) : subWeeks(date, 1);
};

export { isSameDay };