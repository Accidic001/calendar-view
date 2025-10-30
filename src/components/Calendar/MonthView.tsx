import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { CalendarEvent } from './CalendarView.types';
import { CalendarCell } from './CalendarCell';
import { getCalendarGrid, isSameDay } from '@/utils/date.utils';
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
  const listViewInitialized = useRef(false);

  // Declare focus handlers first
  const handleDateFocus = useCallback(() => {
    // Focus logic will be implemented when useKeyboardNavigation provides the function
  }, []);

  const handleEventFocus = useCallback(() => {
    // Focus logic will be implemented when useKeyboardNavigation provides the function
  }, []);

  const handleEventAction = useCallback((eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) onEventClick(event);
  }, [events, onEventClick]);

  // Now initialize useKeyboardNavigation with the handlers
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
    onDateSelect: handleDateFocus,
    onEventSelect: handleEventFocus,
    onEventAction: handleEventAction,
  });

  // Update the handlers to use the actual focus functions
  const updatedHandleDateFocus = useCallback((date: Date) => {
    focusDate(date);
  }, [focusDate]);

  const updatedHandleEventFocus = useCallback((eventId: string) => {
    focusEvent(eventId);
  }, [focusEvent]);

  useEffect(() => {
    if (listViewInitialized.current) return;

    // Use setTimeout to avoid calling setState synchronously in useEffect
    const timer = setTimeout(() => {
      if (events.length > EVENT_COUNT_THRESHOLD) {
        setShowListView(true);
        listViewInitialized.current = true;
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [events.length]);

  const {
    isSelecting,
    selectedRange,
    startSelection,
    updateSelection,
    initialize: initializeMultiSelect,
    cleanup: cleanupMultiSelect,
  } = useMultiSelect({
    onRangeSelect,
  });

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

  const handleSelectionStart = useCallback((date: Date) => {
    startSelection(date);
  }, [startSelection]);

  const handleSelectionUpdate = useCallback((date: Date) => {
    updateSelection(date);
  }, [updateSelection]);

  const isDateInSelectionRange = useCallback((date: Date): boolean => {
    return selectedRange.some(selectedDate => isSameDay(selectedDate, date));
  }, [selectedRange]);

  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    events.forEach(event => {
      const dateKey = new Date(event.startDate).toDateString();
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [events]);

  const getEventsForDate = useCallback((date: Date): CalendarEvent[] => {
    return eventsByDate[date.toDateString()] || [];
  }, [eventsByDate]);

  const handleShowCalendar = useCallback(() => {
    setShowListView(false);
  }, []);

  const handleShowListView = useCallback(() => {
    setShowListView(true);
  }, []);

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
              onClick={handleShowCalendar}
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
      {events.length > EVENT_COUNT_THRESHOLD && (
        <div className="p-3 border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--color-primary-700)] dark:text-[var(--color-primary-300)]">
              Large dataset detected ({events.length} events)
            </span>
            <button
              onClick={handleShowListView}
              className="px-3 py-1 text-xs bg-[var(--color-primary-500)] text-white rounded hover:bg-[var(--color-primary-600)] transition-colors"
            >
              Switch to List View
            </button>
          </div>
        </div>
      )}

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

      <div className="grid grid-cols-7">
        {calendarGrid.map((date) => (
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
            onFocus={updatedHandleDateFocus}
            onEventFocus={updatedHandleEventFocus}
            onSelectionStart={handleSelectionStart}
            onSelectionUpdate={handleSelectionUpdate}
          />
        ))}
      </div>

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