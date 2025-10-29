import type { Meta, StoryObj } from '@storybook/react';
import { CalendarView } from './CalendarView';
import { CalendarEvent } from './CalendarView.types';

const meta: Meta<typeof CalendarView> = {
  title: 'Components/CalendarView',
  component: CalendarView,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    initialView: {
      control: { type: 'select' },
      options: ['month', 'week'],
    },
    onEventAdd: { action: 'event added' },
    onEventUpdate: { action: 'event updated' },
    onEventDelete: { action: 'event deleted' },
  },
};

export default meta;
type Story = StoryObj<typeof CalendarView>;

// Sample events data for different scenarios
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
    startDate: new Date(2024, 11, 16, 14, 0),
    endDate: new Date(2024, 11, 16, 15, 30),
    color: '#10b981',
    category: 'design',
  },
  {
    id: 'evt-3',
    title: 'Client Presentation',
    startDate: new Date(2024, 11, 17, 10, 0),
    endDate: new Date(2024, 11, 17, 11, 30),
    color: '#f59e0b',
    category: 'meeting',
  },
];

const overlappingEvents: CalendarEvent[] = [
  {
    id: 'evt-ov-1',
    title: 'Morning Sync',
    description: 'Team coordination',
    startDate: new Date(2024, 11, 16, 9, 0),
    endDate: new Date(2024, 11, 16, 9, 30),
    color: '#3b82f6',
    category: 'meeting',
  },
  {
    id: 'evt-ov-2',
    title: 'Design Review',
    description: 'UI component review',
    startDate: new Date(2024, 11, 16, 9, 15),
    endDate: new Date(2024, 11, 16, 10, 0),
    color: '#10b981',
    category: 'design',
  },
  {
    id: 'evt-ov-3',
    title: 'Client Call',
    description: 'Weekly checkin',
    startDate: new Date(2024, 11, 16, 9, 45),
    endDate: new Date(2024, 11, 16, 10, 30),
    color: '#f59e0b',
    category: 'meeting',
  },
];

const manyEvents: CalendarEvent[] = Array.from({ length: 25 }, (_, i) => ({
  id: `evt-many-${i + 1}`,
  title: `Event ${i + 1}`,
  description: `Description for event ${i + 1}`,
  startDate: new Date(2024, 11, 15 + Math.floor(i / 5), 9 + (i % 8), (i * 15) % 60),
  endDate: new Date(2024, 11, 15 + Math.floor(i / 5), 10 + (i % 8), (i * 15) % 60),
  color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5],
  category: ['meeting', 'work', 'personal', 'health', 'education'][i % 5],
}));

// Story 1: Default - Current month with sample events
export const Default: Story = {
  args: {
    events: sampleEvents,
    onEventAdd: (event) => console.log('Add event:', event),
    onEventUpdate: (id, updates) => console.log('Update event:', id, updates),
    onEventDelete: (id) => console.log('Delete event:', id),
    initialView: 'month',
    initialDate: new Date(2024, 11, 15), // Fixed date for consistent stories
  },
};

// Story 2: Empty State - Calendar with no events
export const Empty: Story = {
  args: {
    events: [],
    onEventAdd: (event) => console.log('Add event:', event),
    onEventUpdate: (id, updates) => console.log('Update event:', id, updates),
    onEventDelete: (id) => console.log('Delete event:', id),
    initialView: 'month',
    initialDate: new Date(2024, 11, 15),
  },
  parameters: {
    docs: {
      description: {
        story: 'Calendar in empty state showing no events. Users can click on dates to create new events.',
      },
    },
  },
};

// Story 3: Week View - Week view demonstration
export const WeekView: Story = {
  args: {
    events: overlappingEvents,
    onEventAdd: (event) => console.log('Add event:', event),
    onEventUpdate: (id, updates) => console.log('Update event:', id, updates),
    onEventDelete: (id) => console.log('Delete event:', id),
    initialView: 'week',
    initialDate: new Date(2024, 11, 16),
  },
  parameters: {
    docs: {
      description: {
        story: 'Week view showing time slots and overlapping events with side-by-side positioning.',
      },
    },
  },
};

// Story 4: With Many Events - Calendar with 20+ events
export const WithManyEvents: Story = {
  args: {
    events: manyEvents,
    onEventAdd: (event) => console.log('Add event:', event),
    onEventUpdate: (id, updates) => console.log('Update event:', id, updates),
    onEventDelete: (id) => console.log('Delete event:', id),
    initialView: 'month',
    initialDate: new Date(2024, 11, 15),
  },
  parameters: {
    docs: {
      description: {
        story: 'Calendar handling 25+ events across multiple days, demonstrating performance with large datasets.',
      },
    },
  },
};

// Story 5: With Overlapping Events - Demonstrates overlap handling
export const WithOverlappingEvents: Story = {
  args: {
    events: overlappingEvents,
    onEventAdd: (event) => console.log('Add event:', event),
    onEventUpdate: (id, updates) => console.log('Update event:', id, updates),
    onEventDelete: (id) => console.log('Delete event:', id),
    initialView: 'week',
    initialDate: new Date(2024, 11, 16),
  },
  parameters: {
    docs: {
      description: {
        story: 'Week view demonstrating overlap handling with events positioned side-by-side.',
      },
    },
  },
};

// Story 6: Interactive Demo - Fully functional with controls
export const InteractiveDemo: Story = {
  args: {
    events: [],
    onEventAdd: (event) => console.log('Add event:', event),
    onEventUpdate: (id, updates) => console.log('Update event:', id, updates),
    onEventDelete: (id) => console.log('Delete event:', id),
    initialView: 'month',
    initialDate: new Date(2024, 11, 15),
  },
  parameters: {
    docs: {
      description: {
        story: 'Fully interactive calendar demo. Try creating, editing, and deleting events.',
      },
    },
    controls: {
      expanded: true,
    },
  },
};

// Story 7: Mobile View - Responsive layout demonstration
export const MobileView: Story = {
  args: {
    events: sampleEvents,
    onEventAdd: (event) => console.log('Add event:', event),
    onEventUpdate: (id, updates) => console.log('Update event:', id, updates),
    onEventDelete: (id) => console.log('Delete event:', id),
    initialView: 'month',
    initialDate: new Date(2024, 11, 15),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Calendar optimized for mobile devices with responsive layout and touch-friendly interactions.',
      },
    },
  },
};

// Story 8: Accessibility - Keyboard navigation demonstration
export const Accessibility: Story = {
  args: {
    events: sampleEvents,
    onEventAdd: (event) => console.log('Add event:', event),
    onEventUpdate: (id, updates) => console.log('Update event:', id, updates),
    onEventDelete: (id) => console.log('Delete event:', id),
    initialView: 'month',
    initialDate: new Date(2024, 11, 15),
  },
  parameters: {
    docs: {
      description: {
        story: 'Calendar with full keyboard accessibility support. Use Tab, Arrow keys, Enter, and Space to navigate.',
      },
    },
  },
};

// Story 9: Dark Mode - Theme demonstration
export const DarkMode: Story = {
  args: {
    events: sampleEvents,
    onEventAdd: (event) => console.log('Add event:', event),
    onEventUpdate: (id, updates) => console.log('Update event:', id, updates),
    onEventDelete: (id) => console.log('Delete event:', id),
    initialView: 'month',
    initialDate: new Date(2024, 11, 15),
  },
  parameters: {
    themes: {
      default: 'dark',
    },
    docs: {
      description: {
        story: 'Calendar in dark mode theme with proper color contrast and accessibility.',
      },
    },
  },
};

// Story 10: Different Initial Date
export const DifferentMonth: Story = {
  args: {
    events: sampleEvents,
    onEventAdd: (event) => console.log('Add event:', event),
    onEventUpdate: (id, updates) => console.log('Update event:', id, updates),
    onEventDelete: (id) => console.log('Delete event:', id),
    initialView: 'month',
    initialDate: new Date(2025, 0, 15), // January 2025
  },
  parameters: {
    docs: {
      description: {
        story: 'Calendar showing a different month with navigation controls.',
      },
    },
  },
};

// Story 11: Mobile List View - List view with swipe gestures
export const MobileListView: Story = {
  args: {
    events: sampleEvents,
    onEventAdd: (event) => console.log('Add event:', event),
    onEventUpdate: (id, updates) => console.log('Update event:', id, updates),
    onEventDelete: (id) => console.log('Delete event:', id),
    initialView: 'mobile-list',
    initialDate: new Date(2024, 11, 15),
  },
  parameters: {
    docs: {
      description: {
        story: 'Mobile-optimized list view with swipe gestures for event management.',
      },
    },
  },
};

// Story 12: Mobile List Empty State
export const MobileListEmpty: Story = {
  args: {
    events: [],
    onEventAdd: (event) => console.log('Add event:', event),
    onEventUpdate: (id, updates) => console.log('Update event:', id, updates),
    onEventDelete: (id) => console.log('Delete event:', id),
    initialView: 'mobile-list',
    initialDate: new Date(2024, 11, 15),
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state for mobile list view with helpful messaging.',
      },
    },
  },
};

// Story 13: Mobile List with Many Events
export const MobileListManyEvents: Story = {
  args: {
    events: manyEvents,
    onEventAdd: (event) => console.log('Add event:', event),
    onEventUpdate: (id, updates) => console.log('Update event:', id, updates),
    onEventDelete: (id) => console.log('Delete event:', id),
    initialView: 'mobile-list',
    initialDate: new Date(2024, 11, 15),
  },
  parameters: {
    docs: {
      description: {
        story: 'Mobile list view handling many events with smooth scrolling and swipe actions.',
      },
    },
  },
};