'use client';

import { useState, useEffect, useRef } from 'react';
import { CalendarView } from '@/components/Calendar/CalendarView';
import { CalendarEvent } from '@/components/Calendar/CalendarView.types';

// Sample events data
const sampleEvents: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Team Standup',
    description: 'Daily sync with the team',
    startDate: new Date(2024, 11, 16, 9, 0),
    endDate: new Date(2024, 11, 16, 9, 30),
    color: '#3b82f6',
    category: 'meeting',
  },
  {
    id: 'evt-2',
    title: 'Design Review',
    description: 'Review new component designs',
    startDate: new Date(2024, 11, 16, 9, 15),
    endDate: new Date(2024, 11, 16, 10, 0),
    color: '#10b981',
    category: 'design',
  },
  {
    id: 'evt-3',
    title: 'Client Call',
    description: 'Weekly client checkin',
    startDate: new Date(2024, 11, 16, 9, 45),
    endDate: new Date(2024, 11, 16, 10, 30),
    color: '#f59e0b',
    category: 'meeting',
  },
  {
    id: 'evt-4',
    title: 'Lunch Break',
    description: 'Lunch time',
    startDate: new Date(2024, 11, 16, 12, 0),
    endDate: new Date(2024, 11, 16, 13, 0),
    color: '#ef4444',
    category: 'personal',
  },
];

export default function Home() {
  const [events, setEvents] = useState<CalendarEvent[]>(sampleEvents);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const isInitialized = useRef(false);

  // Initialize theme - fixed useEffect
  useEffect(() => {
    if (isInitialized.current) return;
    
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    
    // Batch the state update and DOM manipulation
    if (shouldBeDark) {
      // Use setTimeout to avoid calling setState synchronously in useEffect
      const timer = setTimeout(() => {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      }, 0);
      
      return () => clearTimeout(timer);
    }
    
    isInitialized.current = true;
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleEventAdd = (event: CalendarEvent) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setEvents(prev => [...prev, newEvent]);
    console.log('Event added:', newEvent);
  };

  const handleEventUpdate = (id: string, updates: Partial<CalendarEvent>) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === id ? { ...event, ...updates } : event
      )
    );
    console.log('Event updated:', id, updates);
  };

  const handleEventDelete = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
    console.log('Event deleted:', id);
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[var(--color-neutral-900)] transition-colors duration-300 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[var(--color-primary-500)] rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
                Calendar
              </h1>
            </div>
          </div>

          {/* Compact Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="relative w-12 h-6 bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-700)] rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] hover:scale-105"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white dark:bg-[var(--color-neutral-300)] rounded-full shadow transform transition-all duration-300 flex items-center justify-center ${
              isDarkMode ? 'translate-x-6' : 'translate-x-0.5'
            }`}>
              {isDarkMode ? (
                <MoonIcon className="w-3 h-3 text-[var(--color-neutral-700)]" />
              ) : (
                <SunIcon className="w-3 h-3 text-amber-500" />
              )}
            </div>
          </button>
        </div>

        {/* Centered Calendar */}
        <div className="flex justify-center">
          <CalendarView
            events={events}
            onEventAdd={handleEventAdd}
            onEventUpdate={handleEventUpdate}
            onEventDelete={handleEventDelete}
            initialView="month"
            initialDate={new Date()}
          />
        </div>
      </div>
    </main>
  );
}

// Icons remain the same...
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const SunIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
  </svg>
);

const MoonIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
  </svg>
);