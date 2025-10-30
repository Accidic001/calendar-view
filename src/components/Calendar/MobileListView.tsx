import React, { useState } from 'react';
import { CalendarEvent } from './CalendarView.types';
import { format, isSameDay } from 'date-fns';

interface MobileListViewProps {
  events: CalendarEvent[];
  selectedDate: Date | null;
  onEventClick: (event: CalendarEvent) => void;
  onEventDelete: (id: string) => void;
  onDateSelect: (date: Date) => void;
}

export const MobileListView: React.FC<MobileListViewProps> = ({
  events,
  selectedDate,
  onEventClick,
  onEventDelete,
  onDateSelect,
}) => {
  const [swipedEventId, setSwipedEventId] = useState<string | null>(null);

  const eventsByDate = events.reduce((acc, event) => {
    const dateKey = format(event.startDate, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const sortedDates = Object.keys(eventsByDate)
    .sort()
    .map(dateStr => new Date(dateStr));

  const handleSwipeStart = (eventId: string) => {
    setSwipedEventId(eventId);
  };

  const handleSwipeEnd = () => {
    setSwipedEventId(null);
  };

  const handleDelete = (eventId: string) => {
    onEventDelete(eventId);
    setSwipedEventId(null);
  };

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
        <div className="text-4xl mb-4">📅</div>
        <p className="text-lg font-medium">No events scheduled</p>
        <p className="text-sm text-center mt-2">Tap on a date in month view to create your first event</p>
      </div>
    );
  }

  return (
    <div className="h-[600px] overflow-y-auto bg-white dark:bg-[var(--color-neutral-800)] rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]">
      <div className="sticky top-0 bg-white dark:bg-[var(--color-neutral-800)] border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] p-4 z-10">
        <h2 className="text-lg font-semibold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
          Upcoming Events ({events.length})
        </h2>
        <p className="text-sm text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
          Swipe to delete, tap to edit
        </p>
      </div>

      <div className="divide-y divide-[var(--color-neutral-100)] dark:divide-[var(--color-neutral-700)]">
        {sortedDates.map(date => (
          <DateSection
            key={date.toISOString()}
            date={date}
            events={eventsByDate[format(date, 'yyyy-MM-dd')]}
            isSelected={selectedDate ? isSameDay(date, selectedDate) : false}
            onEventClick={onEventClick}
            onEventDelete={handleDelete}
            onDateSelect={onDateSelect}
            swipedEventId={swipedEventId}
            onSwipeStart={handleSwipeStart}
            onSwipeEnd={handleSwipeEnd}
          />
        ))}
      </div>
    </div>
  );
};

interface DateSectionProps {
  date: Date;
  events: CalendarEvent[];
  isSelected: boolean;
  onEventClick: (event: CalendarEvent) => void;
  onEventDelete: (id: string) => void;
  onDateSelect: (date: Date) => void;
  swipedEventId: string | null;
  onSwipeStart: (eventId: string) => void;
  onSwipeEnd: () => void;
}

const DateSection: React.FC<DateSectionProps> = ({
  date,
  events,
  isSelected,
  onEventClick,
  onEventDelete,
  onDateSelect,
  swipedEventId,
  onSwipeStart,
  onSwipeEnd,
}) => {
  return (
    <div className={`p-4 ${isSelected ? 'bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]' : 'bg-white dark:bg-[var(--color-neutral-800)]'}`}>
      <button
        onClick={() => onDateSelect(date)}
        className={`w-full text-left mb-3 p-3 rounded-lg transition-colors ${
          isSelected 
            ? 'bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-800)] border border-[var(--color-primary-300)] dark:border-[var(--color-primary-600)]' 
            : 'bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-600)]'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] uppercase">
                {format(date, 'MMM')}
              </span>
              <span className="text-xl font-bold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
                {format(date, 'd')}
              </span>
              <span className="text-xs text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
                {format(date, 'EEE')}
              </span>
            </div>
            <div>
              <span className="text-sm text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-300)]">
                {format(date, 'EEEE')}
              </span>
            </div>
          </div>
          <div className="text-sm text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
            {events.length} event{events.length !== 1 ? 's' : ''}
          </div>
        </div>
      </button>

      <div className="space-y-2">
        {events
          .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
          .map(event => (
            <SwipeableEventItem
              key={event.id}
              event={event}
              isSwiped={swipedEventId === event.id}
              onEventClick={onEventClick}
              onEventDelete={onEventDelete}
              onSwipeStart={onSwipeStart}
              onSwipeEnd={onSwipeEnd}
            />
          ))}
      </div>
    </div>
  );
};

interface SwipeableEventItemProps {
  event: CalendarEvent;
  isSwiped: boolean;
  onEventClick: (event: CalendarEvent) => void;
  onEventDelete: (id: string) => void;
  onSwipeStart: (eventId: string) => void;
  onSwipeEnd: () => void;
}

const SwipeableEventItem: React.FC<SwipeableEventItemProps> = ({
  event,
  isSwiped,
  onEventClick,
  onEventDelete,
  onSwipeStart,
  onSwipeEnd,
}) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchOffset, setTouchOffset] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    onSwipeStart(event.id);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    
    const currentTouch = e.touches[0].clientX;
    const difference = touchStart - currentTouch;
    
    if (difference > 0) {
      setTouchOffset(Math.min(difference, 80));
    }
  };

  const handleTouchEnd = () => {
    if (touchOffset > 40) {
      setTouchOffset(80);
    } else {
      setTouchOffset(0);
      onSwipeEnd();
    }
    setTouchStart(null);
  };

  const handleDelete = () => {
    onEventDelete(event.id);
    setTouchOffset(0);
    onSwipeEnd();
  };

  return (
    <div 
      className="relative group"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {touchOffset > 0 && (
        <div 
          className="absolute inset-y-0 right-0 flex items-center justify-end pr-4 bg-[var(--color-error-500)] rounded-lg transition-all duration-200"
          style={{ width: `${touchOffset}px` }}
        >
          {touchOffset > 40 && (
            <button
              onClick={handleDelete}
              className="text-white text-sm font-medium whitespace-nowrap"
            >
              Delete
            </button>
          )}
        </div>
      )}

      <div
        onClick={() => onEventClick(event)}
        className={`bg-white dark:bg-[var(--color-neutral-700)] border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-600)] rounded-lg p-3 cursor-pointer transition-all duration-200 ${
          touchOffset > 0 
            ? 'transform -translate-x-2' 
            : 'hover:shadow-[var(--shadow-card)] active:scale-95 active:bg-[var(--color-neutral-50)] dark:active:bg-[var(--color-neutral-600)]'
        }`}
        style={{
          borderLeft: `4px solid ${event.color || '#3b82f6'}`,
          transform: `translateX(-${touchOffset}px)`,
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] truncate">
              {event.title}
            </h3>
            {event.description && (
              <p className="text-sm text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)] mt-1 line-clamp-2">
                {event.description}
              </p>
            )}
          </div>
          <div className="flex-shrink-0 ml-3">
            <div className="text-sm text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)] whitespace-nowrap">
              {format(event.startDate, 'HH:mm')} - {format(event.endDate, 'HH:mm')}
            </div>
          </div>
        </div>
        
        {event.category && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-600)] text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
              {event.category}
            </span>
          </div>
        )}
      </div>

      {!isSwiped && touchOffset === 0 && (
        <div className="absolute inset-y-0 right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="text-[var(--color-neutral-400)] dark:text-[var(--color-neutral-500)] text-xs">
            ← Swipe to delete
          </div>
        </div>
      )}
    </div>
  );
};