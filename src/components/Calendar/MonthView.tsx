import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarEvent } from './CalendarView.types';
import { CalendarCell } from './CalendarCell';
import { getCalendarGrid, formatDate, isSameDay } from '@/utils/date.utils';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { useMultiSelect } from '@/hooks/useMultiSelect';
import { VirtualizedEventList } from './VirtualizedEventList';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onRangeSelect: (dates: Date[]) => void;
}

// Threshold to switch to virtualized list view
const EVENT_COUNT_THRESHOLD = 50;

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  events,
  selectedDate,
  onDateClick,
  onEventClick,
  onRangeSelect,
}) => {
  const calendarGrid = getCalendarGrid(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const [showListView, setShowListView] = useState(false);

  // Auto-switch to list view when event count is high
  useEffect(() => {
    if (events.length > EVENT_COUNT_THRESHOLD) {
      setShowListView(true);
    }
  }, [events.length]);

  // Keyboard navigation
  const {
    focusedDate,
    focusedEventId,
    handleKeyDown,
    focusDate,
    focusEvent,
    gridRef,
  } = useKeyboardNavigation({
    currentDate,
    events,
    onDateSelect: (date: Date) => {},
    onEventSelect: (eventId: string) => {},
    onEventAction: (eventId: string) => {
      const event = events.find(e => e.id === eventId);
      if (event) onEventClick(event);
    },
  });

  // Multi-select
  const {
    isSelecting,
    selectedRange,
    startSelection,
    updateSelection,
    endSelection,
    cancelSelection,
    initialize: initializeMultiSelect,
    cleanup: cleanupMultiSelect,
  } = useMultiSelect({
    onRangeSelect,
  });

  // Initialize multi-select
  useEffect(() => {
    initializeMultiSelect();
    return () => {
      cleanupMultiSelect();
    };
  }, [initializeMultiSelect, cleanupMultiSelect]);

  const handleDateClick = useCallback((date: Date) => {
    onDateClick(date);
    focusDate(date);
  }, [onDateClick, focusDate]);

  const handleEventClick = useCallback((event: CalendarEvent) => {
    onEventClick(event);
    focusEvent(event.id);
  }, [onEventClick, focusEvent]);

  const handleEventFocus = useCallback((eventId: string) => {
    focusEvent(eventId);
  }, [focusEvent]);

  const handleSelectionStart = useCallback((date: Date) => {
    startSelection(date);
  }, [startSelection]);

  const handleSelectionUpdate = useCallback((date: Date) => {
    updateSelection(date);
  }, [updateSelection]);

  // Check if a date is in the selection range
  const isDateInSelectionRange = useCallback((date: Date): boolean => {
    return selectedRange.some(selectedDate => isSameDay(selectedDate, date));
  }, [selectedRange]);

  // Performance optimization: Memoize event grouping
  const eventsByDate = useMemo(() => {
    const grouped: { [key: string]: CalendarEvent[] } = {};
    events.forEach(event => {
      const dateKey = new Date(event.startDate).toDateString();
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [events]);

  // Get events for a specific date (memoized)
  const getEventsForDate = useCallback((date: Date): CalendarEvent[] => {
    return eventsByDate[date.toDateString()] || [];
  }, [eventsByDate]);

  if (showListView) {
    return (
      <div className="bg-white dark:bg-[var(--color-neutral-800)] rounded-xl overflow-hidden border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]">
        <div className="p-4 border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-700)]">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
                Event List View
              </h3>
              <p className="text-sm text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
                Showing {events.length} events (optimized for performance)
              </p>
            </div>
            <button
              onClick={() => setShowListView(false)}
              className="px-3 py-1 text-sm bg-[var(--color-primary-500)] text-white rounded-lg hover:bg-[var(--color-primary-600)] transition-colors"
            >
              Show Calendar
            </button>
          </div>
        </div>
        
        <VirtualizedEventList
          events={events}
          selectedDate={selectedDate}
          onEventClick={onEventClick}
          onDateClick={onDateClick}
          height={500}
        />
      </div>
    );
  }

  return (
    <div 
      ref={gridRef}
      className="bg-white dark:bg-[var(--color-neutral-800)] rounded-xl overflow-hidden border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="application"
      aria-label="Calendar month view"
    >
      {/* View Toggle for Large Datasets */}
      {events.length > EVENT_COUNT_THRESHOLD && (
        <div className="p-3 border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--color-primary-700)] dark:text-[var(--color-primary-300)]">
              Large dataset detected ({events.length} events)
            </span>
            <button
              onClick={() => setShowListView(true)}
              className="px-3 py-1 text-xs bg-[var(--color-primary-500)] text-white rounded hover:bg-[var(--color-primary-600)] transition-colors"
            >
              Switch to List View
            </button>
          </div>
        </div>
      )}

      {/* Professional Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-700)]">
        {weekDays.map(day => (
          <div 
            key={day} 
            className="p-4 text-sm font-semibold text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-300)] text-center uppercase tracking-wide"
            aria-label={day}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarGrid.map((date, index) => (
          <CalendarCell
            key={date.toISOString()}
            date={date}
            events={getEventsForDate(date)}
            currentDate={currentDate}
            isSelected={selectedDate ? isSameDay(date, selectedDate) : false}
            isFocused={focusedDate ? isSameDay(date, focusedDate) : false}
            isInSelectionRange={isDateInSelectionRange(date)}
            focusedEventId={focusedEventId}
            onClick={handleDateClick}
            onEventClick={handleEventClick}
            onFocus={focusDate}
            onEventFocus={handleEventFocus}
            onSelectionStart={handleSelectionStart}
            onSelectionUpdate={handleSelectionUpdate}
          />
        ))}
      </div>

      {/* Instructions Footer */}
      <div className="bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-700)] px-4 py-2 border-t border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]">
        <div className="text-xs text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)] text-center space-y-1">
          <div>
            <span className="font-medium">Selection:</span> Hold <kbd className="px-1 py-0.5 bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-600)] rounded text-[10px] font-mono">Shift</kbd> + Click and drag to select date range
          </div>
          <div>
            <span className="font-medium">Navigation:</span> Arrow keys • Enter/Space to select • Escape to cancel
          </div>
          {isSelecting && (
            <div className="text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] font-medium">
              Selecting {selectedRange.length} days...
            </div>
          )}
          {events.length > EVENT_COUNT_THRESHOLD && (
            <div className="text-[var(--color-warning-600)] dark:text-[var(--color-warning-400)]">
              Tip: Switch to list view for better performance with {events.length} events
            </div>
          )}
        </div>
      </div>
    </div>
  );
};