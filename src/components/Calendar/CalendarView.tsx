import React, { useState, useCallback } from 'react';
import { CalendarViewProps, CalendarEvent } from './CalendarView.types';
import { useCalendar } from '@/hooks/useCalendar';
import { MonthView } from './MonthView';
import { EventModal } from './EventModal';
import { Button } from '@/components/primitives/Button';
import { formatDate } from '@/utils/date.utils';
import { WeekView } from './WeekView';
import { MobileListView } from './MobileListView';

interface MultiDayEventData {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  color: string;
}

interface TimeRangeEventData {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  color: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  initialDate = new Date()
}) => {
  const {
    currentDate,
    view,
    selectedDate,
    selectedEvent,
    isModalOpen,
    modalMode,
    goToNextPeriod,
    goToPreviousPeriod,
    goToToday,
    setView,
    openCreateModal,
    openEditModal,
    closeModal
  } = useCalendar(initialDate);

  const [selectedRange, setSelectedRange] = useState<Date[]>([]);

  const handleDateClick = (date: Date) => {
    openCreateModal(date);
  };

  const handleEventClick = (event: CalendarEvent) => {
    openEditModal(event);
  };

  const handleSaveEvent = (eventData: CalendarEvent) => {
    if (modalMode === 'create') {
      onEventAdd(eventData);
    } else if (eventData.id) {
      onEventUpdate(eventData.id, eventData);
    }
  };

  const handleRangeSelect = useCallback((dates: Date[]) => {
    setSelectedRange(dates);
    
    if (dates.length > 1) {
      const startDate = new Date(dates[0]);
      startDate.setHours(9, 0, 0, 0);
      
      const endDate = new Date(dates[dates.length - 1]);
      endDate.setHours(17, 0, 0, 0);
      
      const multiDayEvent: MultiDayEventData = {
        id: `range-${Date.now()}`,
        title: 'Multi-day Event',
        description: `Event spanning ${dates.length} days`,
        startDate: startDate,
        endDate: endDate,
        color: '#8b5cf6',
      };
      
      openEditModal(multiDayEvent as CalendarEvent);
    }
  }, [openEditModal]);

  const handleGlobalKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
      e.preventDefault();
      goToToday();
    }
    
    if (e.key === 'Escape' && isModalOpen) {
      e.preventDefault();
      closeModal();
    }

    if (e.key === 'Escape' && selectedRange.length > 0) {
      e.preventDefault();
      setSelectedRange([]);
    }
  };

  const handleWeekViewEventCreate = (date: Date, startHour: number, endHour: number) => {
    const startDate = new Date(date);
    startDate.setHours(startHour, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(endHour, 0, 0, 0);
    
    const newEvent: TimeRangeEventData = {
      id: `temp-${Date.now()}`,
      title: 'New Event',
      startDate: startDate,
      endDate: endDate,
      color: '#3b82f6',
    };
    
    openEditModal(newEvent as CalendarEvent);
  };

  return (
    <div 
      className="w-full max-w-4xl mx-auto p-4 bg-white dark:bg-[var(--color-neutral-800)] rounded-xl shadow-[var(--shadow-card)] border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]"
      tabIndex={0}
      onKeyDown={handleGlobalKeyDown}
      role="application"
      aria-label="Calendar application"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={goToToday}
              className="text-xs"
              aria-label="Go to today"
            >
              Today
            </Button>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={goToPreviousPeriod}
                className="w-8 h-8 p-0 flex items-center justify-center text-sm"
                aria-label={`Go to previous ${view}`}
              >
                ‹
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={goToNextPeriod}
                className="w-8 h-8 p-0 flex items-center justify-center text-sm"
                aria-label={`Go to next ${view}`}
              >
                ›
              </Button>
            </div>
          </div>
          <h2 
            className="text-lg font-semibold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] min-w-[120px] text-center"
            aria-live="polite"
            aria-atomic="true"
          >
            {formatDate(currentDate, 'MMM yyyy')}
          </h2>
        </div>

        <div 
          className="flex gap-1 bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-700)] p-1 rounded-lg"
          role="tablist"
          aria-label="Calendar view options"
        >
          <Button
            variant={view === 'month' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setView('month')}
            className="min-w-[70px] text-xs"
            role="tab"
            aria-selected={view === 'month'}
            aria-controls="calendar-content"
          >
            Month
          </Button>
          <Button
            variant={view === 'week' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setView('week')}
            className="min-w-[70px] text-xs"
            role="tab"
            aria-selected={view === 'week'}
            aria-controls="calendar-content"
          >
            Week
          </Button>
          <Button
            variant={view === 'mobile-list' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setView('mobile-list')}
            className="min-w-[70px] text-xs"
            role="tab"
            aria-selected={view === 'mobile-list'}
            aria-controls="calendar-content"
          >
            List
          </Button>
        </div>
      </div>

      {selectedRange.length > 0 && (
        <div className="mb-4 p-3 bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)] rounded-lg border border-[var(--color-primary-200)] dark:border-[var(--color-primary-700)]">
          <div className="flex items-center justify-between">
            <div className="text-sm text-[var(--color-primary-700)] dark:text-[var(--color-primary-300)]">
              <span className="font-semibold">{selectedRange.length} days selected:</span>{' '}
              {formatDate(selectedRange[0], 'MMM d')} - {formatDate(selectedRange[selectedRange.length - 1], 'MMM d, yyyy')}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedRange([])}
              className="text-xs text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] hover:text-[var(--color-primary-700)] dark:hover:text-[var(--color-primary-300)]"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      <div 
        id="calendar-content"
        role="tabpanel"
        aria-label={`${view} view calendar`}
      >
        {view === 'month' && (
          <MonthView
            currentDate={currentDate}
            events={events}
            selectedDate={selectedDate}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
            onRangeSelect={handleRangeSelect}
          />
        )}

        {view === 'week' && (
          <WeekView
            currentDate={currentDate}
            events={events}
            selectedDate={selectedDate}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
            onEventCreate={handleWeekViewEventCreate}
          />
        )}

        {view === 'mobile-list' && (
          <MobileListView
            events={events}
            selectedDate={selectedDate}
            onEventClick={handleEventClick}
            onEventDelete={onEventDelete}
            onDateSelect={handleDateClick}
          />
        )}
      </div>

      <div className="mt-4 p-3 bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-700)] rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]">
        <div className="text-xs text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)] text-center space-y-2">
          <div>
            <span className="font-medium">Selection:</span>{' '}
            <kbd className="px-1 py-0.5 bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-600)] rounded text-[10px] font-mono">Shift</kbd> + Click/Drag to select multiple days
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="font-medium">Shortcuts:</span>
            <kbd className="px-1 py-0.5 bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-600)] rounded text-[10px] font-mono">Ctrl/Cmd + T</kbd>
            <span>Today</span>
            <kbd className="px-1 py-0.5 bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-600)] rounded text-[10px] font-mono">Esc</kbd>
            <span>Close/Clear</span>
          </div>
        </div>
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={closeModal}
        mode={modalMode}
        selectedDate={selectedRange.length > 0 ? selectedRange[0] : selectedDate}
        event={selectedEvent}
        onSave={handleSaveEvent}
        onDelete={onEventDelete}
      />
    </div>
  );
};