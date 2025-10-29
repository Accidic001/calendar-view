import type { Meta, StoryObj } from '@storybook/react';
import { WeekView } from './WeekView';
import { CalendarEvent } from './CalendarView.types';

const meta: Meta<typeof WeekView> = {
  title: 'Components/WeekView',
  component: WeekView,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WeekView>;

const overlappingEvents: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Standup',
    startDate: new Date(2024, 11, 16, 9, 0),
    endDate: new Date(2024, 11, 16, 9, 30),
    color: '#3b82f6',
  },
  {
    id: 'evt-2',
    title: 'Design Review',
    startDate: new Date(2024, 11, 16, 9, 15),
    endDate: new Date(2024, 11, 16, 10, 0),
    color: '#10b981',
  },
  {
    id: 'evt-3',
    title: 'Client Call',
    startDate: new Date(2024, 11, 16, 9, 45),
    endDate: new Date(2024, 11, 16, 10, 30),
    color: '#f59e0b',
  },
];

export const Default: Story = {
  args: {
    currentDate: new Date(2024, 11, 16),
    events: overlappingEvents,
    selectedDate: null,
    onDateClick: (date) => console.log('Date clicked:', date),
    onEventClick: (event) => console.log('Event clicked:', event),
    onEventCreate: (date, startHour, endHour) => console.log('Create event:', { date, startHour, endHour }),
  },
};

export const WithSelectedDate: Story = {
  args: {
    currentDate: new Date(2024, 11, 16),
    events: overlappingEvents,
    selectedDate: new Date(2024, 11, 16),
    onDateClick: (date) => console.log('Date clicked:', date),
    onEventClick: (event) => console.log('Event clicked:', event),
    onEventCreate: (date, startHour, endHour) => console.log('Create event:', { date, startHour, endHour }),
  },
};

export const Empty: Story = {
  args: {
    currentDate: new Date(2024, 11, 16),
    events: [],
    selectedDate: null,
    onDateClick: (date) => console.log('Date clicked:', date),
    onEventClick: (event) => console.log('Event clicked:', event),
    onEventCreate: (date, startHour, endHour) => console.log('Create event:', { date, startHour, endHour }),
  },
};