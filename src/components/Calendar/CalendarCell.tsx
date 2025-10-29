import React, { useCallback, useMemo } from 'react';
import { clsx } from 'clsx';
import { CalendarEvent } from './CalendarView.types';
import { isToday, isCurrentMonth, formatDate, isSameDay } from '@/utils/date.utils';
import { getEventsForDay } from '@/utils/event.utils';

interface CalendarCellProps {
  date: Date;
  events: CalendarEvent[];
  currentDate: Date;
  isSelected: boolean;
  isFocused: boolean;
  isInSelectionRange: boolean;
  focusedEventId: string | null;
  onClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onFocus: (date: Date) => void;
  onEventFocus: (eventId: string) => void;
  onSelectionStart: (date: Date) => void;
  onSelectionUpdate: (date: Date) => void;
}

export const CalendarCell: React.FC<CalendarCellProps> = React.memo(({ 
  date, 
  events, 
  currentDate,
  isSelected, 
  isFocused,
  isInSelectionRange,
  focusedEventId,
  onClick, 
  onEventClick,
  onFocus,
  onEventFocus,
  onSelectionStart,
  onSelectionUpdate,
}) => {
  const dayEvents = useMemo(() => getEventsForDay(events, date), [events, date]);
  const isTodayDate = useMemo(() => isToday(date), [date]);
  const isCurrentMonthDate = useMemo(() => isCurrentMonth(date, currentDate), [date, currentDate]);

  const handleClick = useCallback(() => {
    onClick(date);
  }, [date, onClick]);

  const handleFocus = useCallback(() => {
    onFocus(date);
  }, [date, onFocus]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.shiftKey) {
      e.preventDefault();
      onSelectionStart(date);
    }
  }, [date, onSelectionStart]);

  const handleMouseEnter = useCallback(() => {
    onSelectionUpdate(date);
  }, [date, onSelectionUpdate]);

  const handleEventClick = useCallback((event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventClick(event);
  }, [onEventClick]);

  const handleEventFocus = useCallback((eventId: string, e: React.FocusEvent) => {
    e.stopPropagation();
    onEventFocus(eventId);
  }, [onEventFocus]);

  const handleEventKeyDown = useCallback((event: CalendarEvent, e: React.KeyboardEvent) => {
    e.stopPropagation();
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onEventClick(event);
    }
  }, [onEventClick]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${formatDate(date, 'MMMM d, yyyy')}. ${dayEvents.length} events.${isInSelectionRange ? ' Part of selection range.' : ''}`}
      className={clsx(
        'border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] h-24 p-2 transition-all duration-200 cursor-pointer focus:outline-none bg-white dark:bg-[var(--color-neutral-800)] hover:bg-[var(--color-neutral-50)] dark:hover:bg-[var(--color-neutral-700)]',
        isSelected && 'bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)] border-[var(--color-primary-300)] dark:border-[var(--color-primary-600)] ring-1 ring-[var(--color-primary-500)]',
        isFocused && 'ring-2 ring-[var(--color-primary-500)] ring-offset-1 z-20',
        isInSelectionRange && 'bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-800)] border-[var(--color-primary-200)] dark:border-[var(--color-primary-700)]',
        !isCurrentMonthDate && 'bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-800)] text-[var(--color-neutral-400)] dark:text-[var(--color-neutral-500)]',
        isTodayDate && 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      )}
      onClick={handleClick}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
    >
      <div className="flex justify-between items-start mb-1">
        <span className={clsx(
          'text-sm font-medium transition-colors',
          isTodayDate && !isCurrentMonthDate && 'text-blue-600 dark:text-blue-400',
          isCurrentMonthDate ? 'text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]' : 'text-[var(--color-neutral-400)] dark:text-[var(--color-neutral-500)]',
          isTodayDate && isCurrentMonthDate && 'text-blue-600 dark:text-blue-400 font-semibold',
          isInSelectionRange && 'text-[var(--color-primary-700)] dark:text-[var(--color-primary-300)] font-semibold'
        )}>
          {formatDate(date, 'd')}
        </span>
        {isTodayDate && isCurrentMonthDate && (
          <span className="w-5 h-5 bg-[var(--color-primary-500)] rounded-full text-white text-[10px] flex items-center justify-center font-medium">
            {formatDate(date, 'd')}
          </span>
        )}
        {isInSelectionRange && !isTodayDate && (
          <div className="w-2 h-2 bg-[var(--color-primary-500)] rounded-full" />
        )}
      </div>

      <div className="space-y-1 overflow-hidden">
        {dayEvents.slice(0, 2).map(event => (
          <div
            key={event.id}
            role="button"
            tabIndex={0}
            aria-label={`Event: ${event.title}. ${formatDate(new Date(event.startDate), 'h:mma')} to ${formatDate(new Date(event.endDate), 'h:mma')}`}
            className={clsx(
              "text-[10px] px-1 py-0.5 rounded truncate text-white cursor-pointer hover:opacity-90 transition-opacity shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 focus:ring-offset-[var(--color-primary-500)]",
              focusedEventId === event.id && "ring-2 ring-white ring-offset-1 ring-offset-[var(--color-primary-500)]"
            )}
            style={{ backgroundColor: event.color || '#3b82f6' }}
            onClick={(e) => handleEventClick(event, e)}
            onFocus={(e) => handleEventFocus(event.id, e)}
            onKeyDown={(e) => handleEventKeyDown(event, e)}
          >
            {event.title}
          </div>
        ))}
        {dayEvents.length > 2 && (
          <button 
            className="text-[10px] text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] hover:underline focus:outline-none focus:underline font-medium focus:ring-1 focus:ring-[var(--color-primary-500)] rounded px-1"
            tabIndex={0}
            aria-label={`Show ${dayEvents.length - 2} more events`}
          >
            +{dayEvents.length - 2} more
          </button>
        )}
      </div>
    </div>
  );
});

CalendarCell.displayName = 'CalendarCell';