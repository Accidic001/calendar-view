import { CalendarEvent } from '@/components/Calendar/CalendarView.types';
import { isSameDay, isAfter, isBefore } from 'date-fns';

export interface EventPosition {
  left: number;
  width: number;
  column: number;
  totalColumns: number;
}

export interface EventWithPosition {
  event: CalendarEvent;
  position: EventPosition;
}

export const getEventsForDay = (events: CalendarEvent[], date: Date): CalendarEvent[] => {
  return events.filter(event => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    const targetDate = new Date(date);
    
    // Check if event occurs on the target date
    return isSameDay(eventStart, targetDate) || 
           isSameDay(eventEnd, targetDate) ||
           (isAfter(targetDate, eventStart) && isBefore(targetDate, eventEnd));
  });
};

export const generateEventId = (): string => {
  return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const eventsOverlap = (eventA: CalendarEvent, eventB: CalendarEvent): boolean => {
  const startA = new Date(eventA.startDate).getTime();
  const endA = new Date(eventA.endDate).getTime();
  const startB = new Date(eventB.startDate).getTime();
  const endB = new Date(eventB.endDate).getTime();
  
  return startA < endB && endA > startB;
};

export const groupOverlappingEvents = (events: CalendarEvent[]): CalendarEvent[][] => {
  const groups: CalendarEvent[][] = [];
  const usedEvents = new Set<string>();
  
  events.forEach(event => {
    if (usedEvents.has(event.id)) return;
    
    const group: CalendarEvent[] = [event];
    usedEvents.add(event.id);
    
    let foundOverlap;
    do {
      foundOverlap = false;
      events.forEach(otherEvent => {
        if (!usedEvents.has(otherEvent.id) && group.some(groupEvent => eventsOverlap(groupEvent, otherEvent))) {
          group.push(otherEvent);
          usedEvents.add(otherEvent.id);
          foundOverlap = true;
        }
      });
    } while (foundOverlap);
    
    groups.push(group);
  });
  
  return groups;
};

export const calculateEventPosition = (
  event: CalendarEvent, 
  group: CalendarEvent[], 
  allGroups: CalendarEvent[][]
): EventPosition => {
  const eventIndex = group.indexOf(event);
  const totalColumns = Math.max(...allGroups.map(g => g.length));
  
  if (group.length === 1) {
    return { left: 0, width: 1, column: 0, totalColumns: 1 };
  }
  
  const column = eventIndex % totalColumns;
  const width = 1 / totalColumns;
  const left = column * width;
  
  return { left, width, column, totalColumns };
};

export const getEventsForDayWithOverlap = (events: CalendarEvent[], date: Date): EventWithPosition[] => {
  const dayEvents = getEventsForDay(events, date);
  const overlappingGroups = groupOverlappingEvents(dayEvents);
  
  const eventsWithPosition = dayEvents.map(event => {
    const group = overlappingGroups.find(g => g.includes(event)) || [event];
    const position = calculateEventPosition(event, group, overlappingGroups);
    
    return { event, position };
  });
  
  return eventsWithPosition;
};

export const calculateEventTimePosition = (event: CalendarEvent, hourHeight: number = 48): { top: number; height: number } => {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  
  const startHour = startDate.getHours();
  const startMinutes = startDate.getMinutes();
  const endHour = endDate.getHours();
  const endMinutes = endDate.getMinutes();
  
  const startPosition = (startHour - 7) * hourHeight + (startMinutes / 60) * hourHeight;
  const endPosition = (endHour - 7) * hourHeight + (endMinutes / 60) * hourHeight;
  
  return {
    top: startPosition,
    height: Math.max(endPosition - startPosition, 20)
  };
};

export const validateEvent = (event: Partial<CalendarEvent>): string[] => {
  const errors: string[] = [];

  if (!event.title?.trim()) {
    errors.push('Title is required');
  }

  if (event.title && event.title.length > 100) {
    errors.push('Title must be less than 100 characters');
  }

  if (event.description && event.description.length > 500) {
    errors.push('Description must be less than 500 characters');
  }

  if (!event.startDate || !event.endDate) {
    errors.push('Start and end dates are required');
  }

  if (event.startDate && event.endDate && event.startDate > event.endDate) {
    errors.push('End date must be after start date');
  }

  return errors;
};