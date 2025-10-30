import { useState, useCallback, useRef, useEffect } from 'react';
import { CalendarEvent } from '@/components/Calendar/CalendarView.types';

interface KeyboardNavigationState {
  focusedDate: Date | null;
  focusedEventId: string | null;
}

interface UseKeyboardNavigationProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  onEventSelect: (eventId: string) => void;
  onEventAction: (eventId: string) => void;
}

export const useKeyboardNavigation = ({
  currentDate,
  events,
  onDateSelect,
  onEventSelect,
  onEventAction,
}: UseKeyboardNavigationProps) => {
  const [state, setState] = useState<KeyboardNavigationState>({
    focusedDate: null,
    focusedEventId: null,
  });

  const gridRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  const getMonthGridDates = useCallback((): Date[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    
    const dates: Date[] = [];
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    for (let i = 0; i < 42; i++) {
      dates.push(new Date(startDate));
      startDate.setDate(startDate.getDate() + 1);
    }
    
    return dates;
  }, [currentDate]);

  const getFocusedDateEvents = useCallback((): CalendarEvent[] => {
    if (!state.focusedDate) return [];
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === state.focusedDate?.toDateString();
    });
  }, [state.focusedDate, events]);

  const navigateDate = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    const dates = getMonthGridDates();
    const currentIndex = dates.findIndex(date => 
      state.focusedDate && date.toDateString() === state.focusedDate.toDateString()
    );

    if (currentIndex === -1) {
      const todayIndex = dates.findIndex(date => date.toDateString() === new Date().toDateString());
      const newFocusedDate = todayIndex !== -1 ? dates[todayIndex] : dates[0];
      setState(prev => ({ ...prev, focusedDate: newFocusedDate, focusedEventId: null }));
      onDateSelect(newFocusedDate);
      return;
    }

    const currentIndexValue = currentIndex;
    let newIndex = currentIndexValue;
    
    switch (direction) {
      case 'left':
        newIndex = currentIndexValue - 1;
        break;
      case 'right':
        newIndex = currentIndexValue + 1;
        break;
      case 'up':
        newIndex = currentIndexValue - 7;
        break;
      case 'down':
        newIndex = currentIndexValue + 7;
        break;
    }

    if (newIndex >= 0 && newIndex < dates.length) {
      const newFocusedDate = dates[newIndex];
      setState(prev => ({ ...prev, focusedDate: newFocusedDate, focusedEventId: null }));
      onDateSelect(newFocusedDate);
    }
  }, [state.focusedDate, getMonthGridDates, onDateSelect]);

  const navigateEvent = useCallback((direction: 'next' | 'previous') => {
    const focusedEvents = getFocusedDateEvents();
    if (focusedEvents.length === 0) return;

    const currentIndex = focusedEvents.findIndex(event => event.id === state.focusedEventId);
    
    if (currentIndex === -1) {
      const firstEvent = focusedEvents[0];
      setState(prev => ({ ...prev, focusedEventId: firstEvent.id }));
      onEventSelect(firstEvent.id);
      return;
    }

    const currentIndexValue = currentIndex;
    const newIndex = direction === 'next' ? currentIndexValue + 1 : currentIndexValue - 1;
    
    if (newIndex >= 0 && newIndex < focusedEvents.length) {
      const newEvent = focusedEvents[newIndex];
      setState(prev => ({ ...prev, focusedEventId: newEvent.id }));
      onEventSelect(newEvent.id);
    }
  }, [state.focusedEventId, getFocusedDateEvents, onEventSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!state.focusedDate) return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        navigateDate('left');
        break;
        
      case 'ArrowRight':
        e.preventDefault();
        navigateDate('right');
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        if (state.focusedEventId) {
          navigateEvent('previous');
        } else {
          navigateDate('up');
        }
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        if (state.focusedEventId) {
          navigateEvent('next');
        } else {
          navigateDate('down');
        }
        break;
        
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (state.focusedEventId) {
          onEventAction(state.focusedEventId);
        } else if (state.focusedDate) {
          onDateSelect(state.focusedDate);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setState(prev => ({ ...prev, focusedEventId: null }));
        break;
        
      case 'Tab':
        break;
        
      default:
        break;
    }
  }, [state, navigateDate, navigateEvent, onDateSelect, onEventAction]);

  const focusDate = useCallback((date: Date) => {
    setState(prev => ({ ...prev, focusedDate: date, focusedEventId: null }));
  }, []);

  const focusEvent = useCallback((eventId: string) => {
    setState(prev => ({ ...prev, focusedEventId: eventId }));
  }, []);

  useEffect(() => {
    if (isInitialized.current) return;

    const today = new Date();
    const dates = getMonthGridDates();
    const todayInGrid = dates.find(date => date.toDateString() === today.toDateString());
    
    // Use setTimeout to avoid calling setState synchronously in useEffect
    const timer = setTimeout(() => {
      if (todayInGrid) {
        setState(prev => ({ ...prev, focusedDate: todayInGrid }));
      } else if (dates.length > 0) {
        setState(prev => ({ ...prev, focusedDate: dates[0] }));
      }

      isInitialized.current = true;
    }, 0);

    return () => clearTimeout(timer);
  }, [getMonthGridDates]);

  return {
    focusedDate: state.focusedDate,
    focusedEventId: state.focusedEventId,
    handleKeyDown,
    focusDate,
    focusEvent,
    gridRef,
  };
};