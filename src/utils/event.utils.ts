import { CalendarEvent } from '@/components/Calendar/CalendarView.types';
import { isSameDay, isWithinInterval } from 'date-fns';

export const getEventsForDay = (events: CalendarEvent[], date: Date): CalendarEvent[] => {
  return events.filter(event => 
    isSameDay(event.startDate, date) || 
    isWithinInterval(date, { start: event.startDate, end: event.endDate })
  );
};

export const generateEventId = (): string => {
  return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Check if two events overlap in time
export const eventsOverlap = (eventA: CalendarEvent, eventB: CalendarEvent): boolean => {
  const startA = new Date(eventA.startDate).getTime();
  const endA = new Date(eventA.endDate).getTime();
  const startB = new Date(eventB.startDate).getTime();
  const endB = new Date(eventB.endDate).getTime();
  
  return startA < endB && endA > startB;
};

// Group overlapping events
export const groupOverlappingEvents = (events: CalendarEvent[]): CalendarEvent[][] => {
  const groups: CalendarEvent[][] = [];
  const usedEvents = new Set<string>();
  
  events.forEach(event => {
    if (usedEvents.has(event.id)) return;
    
    const group: CalendarEvent[] = [event];
    usedEvents.add(event.id);
    
    // Find all events that overlap with any event in this group
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

// Calculate event position and width for overlapping events
export const calculateEventPosition = (
  event: CalendarEvent, 
  group: CalendarEvent[], 
  allGroups: CalendarEvent[][]
): { left: number; width: number; column: number; totalColumns: number } => {
  const eventIndex = group.indexOf(event);
  const totalColumns = Math.max(...allGroups.map(g => g.length));
  
  if (group.length === 1) {
    return { left: 0, width: 1, column: 0, totalColumns: 1 };
  }
  
  // Simple round-robin column assignment
  const column = eventIndex % totalColumns;
  const width = 1 / totalColumns;
  const left = column * width;
  
  return { left, width, column, totalColumns };
};

// Get events for a specific day with overlap handling
export const getEventsForDayWithOverlap = (events: CalendarEvent[], date: Date): { event: CalendarEvent; position: any }[] => {
  const dayEvents = getEventsForDay(events, date);
  const overlappingGroups = groupOverlappingEvents(dayEvents);
  
  const eventsWithPosition = dayEvents.map(event => {
    const group = overlappingGroups.find(g => g.includes(event)) || [event];
    const position = calculateEventPosition(event, group, overlappingGroups);
    
    return { event, position };
  });
  
  return eventsWithPosition;
};

// Calculate event height and top position based on duration
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
    height: Math.max(endPosition - startPosition, 20) // Minimum height of 20px
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