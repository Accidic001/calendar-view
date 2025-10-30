import React, { useMemo } from 'react';
import { CalendarEvent } from './CalendarView.types';
import { formatDate, isSameDay } from '@/utils/date.utils';
import { useVirtualization } from '@/hooks/useVirtualization';
import { clsx } from 'clsx';

interface VirtualizedEventListProps {
  events: CalendarEvent[];
  selectedDate: Date | null;
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
  height?: number;
}

const EVENT_ITEM_HEIGHT = 80;

export const VirtualizedEventList: React.FC<VirtualizedEventListProps> = ({
  events,
  selectedDate,
  onEventClick,
  onDateClick,
  height = 400,
}) => {
  const eventsByDate = useMemo(() => {
    const grouped: { [key: string]: CalendarEvent[] } = {};
    
    events.forEach(event => {
      const dateKey = new Date(event.startDate).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    
    return grouped;
  }, [events]);

  const virtualizedItems = useMemo(() => {
    const items: Array<{ type: 'date'; date: Date } | { type: 'event'; event: CalendarEvent; date: Date }> = [];
    
    Object.keys(eventsByDate)
      .sort()
      .forEach(dateKey => {
        const date = new Date(dateKey);
        const dateEvents = eventsByDate[dateKey];
        
        items.push({ type: 'date', date });
        
        dateEvents.forEach(event => {
          items.push({ type: 'event', event, date });
        });
      });
    
    return items;
  }, [eventsByDate]);

  const {
    containerRef,
    visibleItems,
    totalHeight,
    getItemStyle,
  } = useVirtualization(virtualizedItems, {
    itemHeight: EVENT_ITEM_HEIGHT,
    containerHeight: height,
    overscan: 5,
  });

  const renderItem = (item: typeof virtualizedItems[0]) => {
    const index = virtualizedItems.indexOf(item);
    const style = getItemStyle(index);

    if (item.type === 'date') {
      const isSelected = selectedDate && isSameDay(item.date, selectedDate);
      const eventCount = eventsByDate[item.date.toDateString()]?.length || 0;
      
      return (
        <div
          key={`date-${item.date.toISOString()}`}
          style={style}
          className={clsx(
            "px-4 py-3 border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-700)] sticky top-0 z-10 cursor-pointer transition-colors",
            isSelected && "bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-800)]"
          )}
          onClick={() => onDateClick(item.date)}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={clsx(
                "w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm",
                isSelected 
                  ? "bg-[var(--color-primary-500)] text-white" 
                  : "bg-white dark:bg-[var(--color-neutral-600)] text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]"
              )}>
                {formatDate(item.date, 'd')}
              </div>
              <div>
                <div className="text-sm font-medium text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
                  {formatDate(item.date, 'EEEE')}
                </div>
                <div className="text-xs text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
                  {formatDate(item.date, 'MMMM yyyy')}
                </div>
              </div>
            </div>
            <div className="text-xs text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
              {eventCount} event{eventCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      );
    } else {
      const { event } = item;
      
      return (
        <div
          key={`event-${event.id}`}
          style={style}
          className="px-4 py-3 border-b border-[var(--color-neutral-100)] dark:border-[var(--color-neutral-600)] bg-white dark:bg-[var(--color-neutral-800)] hover:bg-[var(--color-neutral-50)] dark:hover:bg-[var(--color-neutral-700)] cursor-pointer transition-colors"
          onClick={() => onEventClick(event)}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
              style={{ backgroundColor: event.color || '#3b82f6' }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] truncate">
                  {event.title}
                </h3>
                <div className="text-xs text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)] whitespace-nowrap ml-2">
                  {formatDate(new Date(event.startDate), 'h:mma')}
                </div>
              </div>
              {event.description && (
                <p className="text-sm text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)] line-clamp-2">
                  {event.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1">
                {event.category && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-700)] text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
                    {event.category}
                  </span>
                )}
                <span className="text-xs text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
                  {formatDate(new Date(event.startDate), 'h:mma')} - {formatDate(new Date(event.endDate), 'h:mma')}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full overflow-auto bg-white dark:bg-[var(--color-neutral-800)] rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]"
      style={{ height: `${height}px` }}
      role="list"
      aria-label="Event list"
    >
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        {visibleItems.map((item) => 
          renderItem(item)
        )}
      </div>
      
      {virtualizedItems.length === 0 && (
        <div className="flex items-center justify-center h-full text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
          <div className="text-center">
            <div className="text-lg font-medium mb-2">No events</div>
            <div className="text-sm">Create your first event to get started</div>
          </div>
        </div>
      )}
    </div>
  );
};