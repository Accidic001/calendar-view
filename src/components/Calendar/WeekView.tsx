import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { CalendarEvent } from './CalendarView.types';
import { getWeekDays, formatDate, isToday, isSameDay } from '@/utils/date.utils';
import { 
  getEventsForDay, 
  getEventsForDayWithOverlap, 
  calculateEventTimePosition 
} from '@/utils/event.utils';
import { clsx } from 'clsx';
import { useDragToCreate } from '@/hooks/useDragToCreate';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onEventCreate: (date: Date, startHour: number, endHour: number) => void;
}

const timeSlots = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM
const HOUR_HEIGHT = 48; // h-12 = 3rem = 48px

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  events,
  selectedDate,
  onDateClick,
  onEventClick,
  onEventCreate,
}) => {
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const gridRef = useRef<HTMLDivElement>(null);

  const {
    isDragging,
    dragRange,
    currentDate: dragDate,
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,
  } = useDragToCreate({
    onDragCreate: onEventCreate,
  });

  // Keyboard navigation
  const {
    focusedDate,
    focusedEventId,
    handleKeyDown,
    focusDate,
    focusEvent,
    gridRef: keyboardGridRef,
  } = useKeyboardNavigation({
    currentDate,
    events,
    onDateSelect: (date) => {
      focusDate(date);
      onDateClick(date);
    },
    onEventSelect: (eventId: string) => {
      const event = events.find(e => e.id === eventId);
      if (event) onEventClick(event);
    },
    onEventAction: (eventId) => {
      const event = events.find(e => e.id === eventId);
      if (event) onEventClick(event);
    },
  });

  // Get events for each day with overlap positioning
  const dayEventsWithOverlap = useMemo(() => {
    return weekDays.map(day => getEventsForDayWithOverlap(events, day));
  }, [weekDays, events]);

  const handleMouseDown = useCallback((date: Date, hour: number) => {
    startDrag(date, hour);
  }, [startDrag]);

  const handleMouseEnter = useCallback((hour: number) => {
    updateDrag(hour);
  }, [updateDrag]);

  const handleMouseUp = useCallback((hour: number) => {
    endDrag(hour);
  }, [endDrag]);

  // Add global mouse up listener to cancel drag if mouse leaves grid
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        cancelDrag();
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, cancelDrag]);

  const handleEventClick = useCallback((event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventClick(event);
    focusEvent(event.id);
  }, [onEventClick, focusEvent]);

  const handleEventFocus = useCallback((eventId: string, e: React.FocusEvent) => {
    e.stopPropagation();
    focusEvent(eventId);
  }, [focusEvent]);

  const handleEventKeyDown = useCallback((event: CalendarEvent, e: React.KeyboardEvent) => {
    e.stopPropagation();
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onEventClick(event);
    }
  }, [onEventClick]);

  const getHourFromPosition = useCallback((y: number): number => {
    if (!gridRef.current) return 0;
    
    const rect = gridRef.current.getBoundingClientRect();
    const relativeY = y - rect.top;
    const hourIndex = Math.floor(relativeY / HOUR_HEIGHT);
    
    return timeSlots[Math.max(0, Math.min(timeSlots.length - 1, hourIndex))];
  }, []);

  const handleGridMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const hour = getHourFromPosition(e.clientY);
    updateDrag(hour);
  }, [isDragging, getHourFromPosition, updateDrag]);

  const handleGridMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const hour = getHourFromPosition(e.clientY);
    endDrag(hour);
  }, [isDragging, getHourFromPosition, endDrag]);

  const handleDateHeaderClick = useCallback((day: Date) => {
    onDateClick(day);
    focusDate(day);
  }, [onDateClick, focusDate]);

  const handleDateHeaderFocus = useCallback((day: Date) => {
    focusDate(day);
  }, [focusDate]);

  // Render event with proper positioning for overlaps
  const renderEvent = useCallback((eventWithPosition: { event: CalendarEvent; position: any }, dayIndex: number) => {
    const { event, position } = eventWithPosition;
    const timePosition = calculateEventTimePosition(event, HOUR_HEIGHT);
    const isFocused = focusedEventId === event.id;
    
    return (
      <div
        key={event.id}
        role="button"
        tabIndex={0}
        aria-label={`Event: ${event.title}. ${formatDate(new Date(event.startDate), 'h:mma')} to ${formatDate(new Date(event.endDate), 'h:mma')}`}
        className={clsx(
          "absolute rounded px-2 py-1 text-[10px] text-white cursor-pointer hover:opacity-90 transition-all duration-200 shadow-sm z-10 font-medium truncate focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1",
          isFocused && "ring-2 ring-white ring-offset-1"
        )}
        style={{
          backgroundColor: event.color || '#3b82f6',
          top: `${timePosition.top}px`,
          height: `${timePosition.height}px`,
          left: `${position.left * 100}%`,
          width: `${position.width * 100}%`,
          marginLeft: '2px',
          marginRight: '2px',
        }}
        onClick={(e) => handleEventClick(event, e)}
        onFocus={(e) => handleEventFocus(event.id, e)}
        onKeyDown={(e) => handleEventKeyDown(event, e)}
        title={`${event.title} - ${formatDate(new Date(event.startDate), 'h:mma')} to ${formatDate(new Date(event.endDate), 'h:mma')}`}
      >
        <div className="flex flex-col h-full">
          <div className="font-semibold truncate">{event.title}</div>
          {timePosition.height > 30 && (
            <div className="text-[8px] opacity-90 truncate mt-0.5">
              {formatDate(new Date(event.startDate), 'h:mma')} - {formatDate(new Date(event.endDate), 'h:mma')}
            </div>
          )}
        </div>
      </div>
    );
  }, [focusedEventId, handleEventClick, handleEventFocus, handleEventKeyDown]);

  return (
    <div className="bg-white dark:bg-[var(--color-neutral-800)] rounded-lg overflow-hidden border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]">
      {/* Weekday Headers */}
      <div className="grid grid-cols-8 border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-700)]">
        <div className="p-3 border-r border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]"></div>
        {weekDays.map(day => {
          const isDayFocused = focusedDate ? isSameDay(day, focusedDate) : false;
          const isDaySelected = selectedDate ? isSameDay(day, selectedDate) : false;
          
          return (
            <div
              key={day.toISOString()}
              role="button"
              tabIndex={0}
              aria-label={`${formatDate(day, 'EEEE, MMMM d')}. Click to select date.`}
              className={clsx(
                'p-3 text-center cursor-pointer transition-colors border-r border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] last:border-r-0 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:z-10',
                isToday(day) && 'bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]',
                isDaySelected && 'bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-800)]',
                isDayFocused && !isDaySelected && 'ring-2 ring-[var(--color-primary-500)]'
              )}
              onClick={() => handleDateHeaderClick(day)}
              onFocus={() => handleDateHeaderFocus(day)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleDateHeaderClick(day);
                }
              }}
            >
              <div className="text-xs font-medium text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-300)] uppercase tracking-wide">
                {formatDate(day, 'EEE')}
              </div>
              <div className={clsx(
                'text-sm font-semibold mt-1',
                isToday(day) 
                  ? 'text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]' 
                  : 'text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]'
              )}>
                {formatDate(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time Slots Grid with Drag Support */}
      <div 
        ref={keyboardGridRef}
        className="flex max-h-[480px] overflow-y-auto relative"
        onMouseMove={handleGridMouseMove}
        onMouseUp={handleGridMouseUp}
        onMouseLeave={cancelDrag}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="application"
        aria-label="Calendar week view. Use arrow keys to navigate, Enter or Space to select."
      >
        {/* Time Labels */}
        <div className="w-16 shrink-0 bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-700)] sticky left-0 z-10">
          {timeSlots.map(hour => (
            <div
              key={hour}
              className="h-12 border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] flex items-center justify-end pr-2 text-xs text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)] font-medium"
              aria-label={`${hour} ${hour < 12 ? 'AM' : 'PM'}`}
            >
              {formatDate(new Date(new Date().setHours(hour, 0, 0, 0)), 'ha')}
            </div>
          ))}
        </div>

        {/* Day Columns with Event Containers */}
        <div className="grid grid-cols-7 flex-1 min-w-0 relative">
          {weekDays.map((day, dayIndex) => (
            <div key={day.toISOString()} className="border-l border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] last:border-r-0 relative">
              {/* Time slots for drag interactions */}
              {timeSlots.map(hour => {
                const isInDragRange = isDragging && dragRange && dragDate && isSameDay(day, dragDate) && hour >= dragRange.start && hour <= dragRange.end;
                
                return (
                  <div
                    key={hour}
                    className={clsx(
                      "h-12 border-b border-[var(--color-neutral-100)] dark:border-[var(--color-neutral-700)] cursor-pointer transition-colors relative",
                      isInDragRange && "bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900)]"
                    )}
                    onMouseDown={() => handleMouseDown(day, hour)}
                    onMouseEnter={() => handleMouseEnter(hour)}
                    onMouseUp={() => handleMouseUp(hour)}
                    aria-label={`Time slot: ${formatDate(new Date(new Date().setHours(hour, 0, 0, 0)), 'ha')}. Drag to create event.`}
                  >
                    {/* Drag preview overlay */}
                    {isInDragRange && (
                      <div className="absolute inset-1 bg-[var(--color-primary-200)] dark:bg-[var(--color-primary-800)] rounded border border-[var(--color-primary-300)] dark:border-[var(--color-primary-600)] z-0" />
                    )}
                  </div>
                );
              })}
              
              {/* Events Container for this day */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="relative h-full" style={{ height: `${timeSlots.length * HOUR_HEIGHT}px` }}>
                  {dayEventsWithOverlap[dayIndex]?.map(eventWithPosition => 
                    renderEvent(eventWithPosition, dayIndex)
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Drag Instruction Overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center z-20 pointer-events-none">
            <div className="bg-white dark:bg-[var(--color-neutral-800)] rounded-lg px-4 py-2 shadow-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]">
              <p className="text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] font-medium">
                Drag to select time range
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions Footer */}
      <div className="bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-700)] px-4 py-2 border-t border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]">
        <div className="text-xs text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)] text-center space-y-1">
          <div>
            <span className="font-medium">Mouse:</span> Drag on time slots to create events • Click events to edit
          </div>
          <div>
            <span className="font-medium">Keyboard:</span> Arrow keys to navigate • Enter/Space to select • Escape to cancel
          </div>
        </div>
      </div>
    </div>
  );
};