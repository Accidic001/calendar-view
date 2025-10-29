import type { Meta, StoryObj } from '@storybook/react';
import { MonthView } from './MonthView';
import { CalendarEvent } from './CalendarView.types';

const meta: Meta<typeof MonthView> = {
  title: 'Components/MonthView',
  component: MonthView,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MonthView>;

const sampleEvents: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Team Meeting',
    startDate: new Date(2024, 11, 16, 9, 0),
    endDate: new Date(2024, 11, 16, 10, 0),
    color: '#3b82f6',
  },
  {
    id: 'evt-2',
    title: 'Lunch',
    startDate: new Date(2024, 11, 16, 12, 0),
    endDate: new Date(2024, 11, 16, 13, 0),
    color: '#10b981',
  },
];

export const Default: Story = {
  args: {
    currentDate: new Date(2024, 11, 15),
    events: sampleEvents,
    selectedDate: null,
    onDateClick: (date) => console.log('Date clicked:', date),
    onEventClick: (event) => console.log('Event clicked:', event),
  },
};

export const WithSelectedDate: Story = {
  args: {
    currentDate: new Date(2024, 11, 15),
    events: sampleEvents,
    selectedDate: new Date(2024, 11, 16),
    onDateClick: (date) => console.log('Date clicked:', date),
    onEventClick: (event) => console.log('Event clicked:', event),
  },
};

export const Empty: Story = {
  args: {
    currentDate: new Date(2024, 11, 15),
    events: [],
    selectedDate: null,
    onDateClick: (date) => console.log('Date clicked:', date),
    onEventClick: (event) => console.log('Event clicked:', event),
  },
};