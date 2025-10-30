import { useState, useCallback } from 'react';
import { CalendarState, CalendarEvent } from '@/components/Calendar/CalendarView.types';
import { navigateMonth, navigateWeek } from '@/utils/date.utils';
import { startOfWeek } from 'date-fns';

export const useCalendar = (initialDate: Date = new Date()) => {
  const [state, setState] = useState<CalendarState>({
    currentDate: initialDate,
    view: 'month',
    selectedDate: null,
    selectedEvent: null,
    isModalOpen: false,
    modalMode: 'create'
  });

  const goToNextPeriod = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentDate: prev.view === 'month' || prev.view === 'mobile-list'
        ? navigateMonth(prev.currentDate, 'next')
        : navigateWeek(prev.currentDate, 'next')
    }));
  }, []);

  const goToPreviousPeriod = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentDate: prev.view === 'month' || prev.view === 'mobile-list'
        ? navigateMonth(prev.currentDate, 'prev')
        : navigateWeek(prev.currentDate, 'prev')
    }));
  }, []);

  const goToToday = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentDate: new Date()
    }));
  }, []);

  const setView = useCallback((newView: 'month' | 'week' | 'mobile-list') => {
    setState(prev => ({ 
      ...prev, 
      view: newView,
      currentDate: newView === 'week' ? startOfWeek(prev.currentDate) : prev.currentDate
    }));
  }, []);

  const openCreateModal = useCallback((date: Date) => {
    setState(prev => ({
      ...prev,
      selectedDate: date,
      isModalOpen: true,
      modalMode: 'create',
      selectedEvent: null
    }));
  }, []);

  const openEditModal = useCallback((event: CalendarEvent) => {
    setState(prev => ({
      ...prev,
      selectedEvent: event,
      isModalOpen: true,
      modalMode: 'edit'
    }));
  }, []);

  const closeModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      isModalOpen: false,
      selectedDate: null,
      selectedEvent: null
    }));
  }, []);

  return {
    ...state,
    goToNextPeriod,
    goToPreviousPeriod,
    goToToday,
    setView,
    openCreateModal,
    openEditModal,
    closeModal
  };
};