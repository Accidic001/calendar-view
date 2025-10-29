# Calendar View Component

## 📖 Live Storybook
[Your deployed Storybook URL will go here]

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/Accidic001/calendar-view.git

# Navigate to project directory
cd calendar-view

# Install dependencies
npm install

# Run Storybook locally
npm run storybook

# Build for production
npm run build

🏗️ Architecture
This is a production-grade Calendar View component built with modern web technologies following enterprise UI/UX patterns.

Core Features
Month View: 42-cell grid showing complete weeks

Week View: 7-day horizontal layout with time slots

Event Management: Create, edit, delete events with modals

Responsive Design: Mobile-first approach with touch interactions

Accessibility: WCAG 2.1 AA compliant with keyboard navigation

Technology Stack
React 18 with TypeScript strict mode

Tailwind CSS for utility-first styling

Storybook for component documentation

date-fns for date manipulation

Vite for build tooling

📚 Storybook Stories
The component includes comprehensive Storybook stories demonstrating all features:

Default: Current month with sample events

Empty State: Calendar with no events

Week View: Week view demonstration with time slots

With Many Events: Calendar handling 25+ events

Interactive Demo: Fully functional event management

Mobile View: Responsive layout demonstration

Accessibility: Keyboard navigation demonstration

🎯 Key Features
Event Management
Create events by clicking empty cells

Edit events by clicking existing events

Delete events with confirmation

Multi-day event support with range selection

Event categories and color coding

User Experience
Drag selection for multiple days (Shift + Click/Drag)

Keyboard shortcuts (Ctrl/Cmd + T for Today, Esc to close)

Smooth animations and hover states

Mobile-optimized touch interactions

Accessibility
Full keyboard navigation support

ARIA labels and roles throughout

Focus management and visible indicators

Screen reader compatible

🛠️ Development
# Run in development mode
npm run dev

# Type checking
npm run type-check

# Build Storybook
npm run build-storybook

📁 Project Structure

src/
├── components/
│   └── Calendar/
│       ├── CalendarView.tsx      # Main component
│       ├── CalendarView.stories.tsx
│       ├── CalendarView.types.ts
│       ├── MonthView.tsx
│       ├── WeekView.tsx
│       ├── CalendarCell.tsx
│       ├── EventModal.tsx
│       └── MobileListView.tsx    # Bonus mobile feature
├── primitives/
│   ├── Button.tsx
│   ├── Modal.tsx
│   └── Select.tsx
├── hooks/
│   └── useCalendar.ts
├── utils/
│   └── date.utils.ts
└── styles/
    └── globals.css

✅ Assignment Compliance
This implementation follows all assignment requirements:

✅ No forbidden libraries (built from scratch)

✅ TypeScript strict mode enabled

✅ Tailwind CSS only (no CSS-in-JS)

✅ Comprehensive Storybook documentation

✅ WCAG 2.1 AA accessibility standards

✅ Performance optimized with React.memo()

✅ Responsive design for all screen sizes


🎉 Bonus Features
Mobile List View: Swipeable list interface for mobile devices

Dark Mode Support: Complete theme switching

Drag Selection: Visual range selection for multi-day events

Keyboard Shortcuts: Productivity enhancements