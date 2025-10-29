import React, { useState, useCallback, useEffect } from 'react';
import { Modal } from '@/components/primitives/Modal';
import { Button } from '@/components/primitives/Button';
import { CalendarEvent } from './CalendarView.types';
import { generateEventId, validateEvent } from '@/utils/event.utils';
import { formatDate } from '@/utils/date.utils';
import { Select } from '@/components/primitives/Select';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  selectedDate?: Date | null;
  event?: CalendarEvent | null;
  onSave: (event: CalendarEvent) => void;
  onDelete?: (id: string) => void;
}

const categoryOptions = [
  { value: 'meeting', label: 'Meeting' },
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'health', label: 'Health' },
  { value: 'education', label: 'Education' },
  { value: 'travel', label: 'Travel' },
];

const colorOptions = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // yellow
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
];

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  mode,
  selectedDate,
  event,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    startDate: selectedDate || new Date(),
    endDate: new Date(),
    color: colorOptions[0],
    category: ''
  });
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (mode === 'edit' && event) {
      setFormData(event);
    } else if (mode === 'create' && selectedDate) {
      const startDate = new Date(selectedDate);
      const endDate = new Date(selectedDate);
      endDate.setHours(endDate.getHours() + 1);
      
      setFormData(prev => ({
        ...prev,
        startDate,
        endDate,
        title: '',
        description: '',
        color: colorOptions[0]
      }));
    }
  }, [mode, event, selectedDate]);

  const handleSave = useCallback(() => {
    const validationErrors = validateEvent(formData);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const eventData: CalendarEvent = {
      id: mode === 'edit' && event ? event.id : generateEventId(),
      title: formData.title!,
      description: formData.description,
      startDate: formData.startDate!,
      endDate: formData.endDate!,
      color: formData.color,
      category: formData.category
    };

    onSave(eventData);
    onClose();
    setErrors([]);
  }, [formData, mode, event, onSave, onClose]);

  const handleDelete = useCallback(() => {
    if (event && onDelete) {
      onDelete(event.id);
      onClose();
    }
  }, [event, onDelete, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create Event' : 'Edit Event'}
    >
      <div className="space-y-6">
        {errors.length > 0 && (
          <div className="bg-[var(--color-error-50)] dark:bg-[var(--color-error-900)] border border-[var(--color-error-200)] dark:border-[var(--color-error-700)] rounded-lg p-4">
            <ul className="text-sm text-[var(--color-error-700)] dark:text-[var(--color-error-300)] list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] mb-2">
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-[var(--color-neutral-300)] dark:border-[var(--color-neutral-600)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent bg-white dark:bg-[var(--color-neutral-700)] text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] transition-colors"
            maxLength={100}
            placeholder="Enter event title"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-[var(--color-neutral-300)] dark:border-[var(--color-neutral-600)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent bg-white dark:bg-[var(--color-neutral-700)] text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] transition-colors resize-none"
            rows={3}
            maxLength={500}
            placeholder="Enter event description (optional)"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] mb-2">
              Start Date & Time
            </label>
            <input
              id="startDate"
              type="datetime-local"
              value={formData.startDate ? formatDate(formData.startDate, "yyyy-MM-dd'T'HH:mm") : ''}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
              className="w-full px-3 py-2 border border-[var(--color-neutral-300)] dark:border-[var(--color-neutral-600)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent bg-white dark:bg-[var(--color-neutral-700)] text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] transition-colors"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] mb-2">
              End Date & Time
            </label>
            <input
              id="endDate"
              type="datetime-local"
              value={formData.endDate ? formatDate(formData.endDate, "yyyy-MM-dd'T'HH:mm") : ''}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: new Date(e.target.value) }))}
              className="w-full px-3 py-2 border border-[var(--color-neutral-300)] dark:border-[var(--color-neutral-600)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent bg-white dark:bg-[var(--color-neutral-700)] text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] mb-3">
            Event Color
          </label>
          <div className="flex gap-3 flex-wrap">
            {colorOptions.map(color => (
              <button
                key={color}
                type="button"
                className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                  formData.color === color 
                    ? 'border-[var(--color-neutral-900)] dark:border-[var(--color-neutral-100)] shadow-md' 
                    : 'border-transparent hover:border-[var(--color-neutral-400)]'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setFormData(prev => ({ ...prev, color }))}
              />
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] mb-2">
            Category
          </label>
          <Select
            value={formData.category || ''}
            onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            options={categoryOptions}
            placeholder="Select category..."
          />
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]">
          <div>
            {mode === 'edit' && onDelete && (
              <Button
                variant="ghost"
                onClick={handleDelete}
                className="text-[var(--color-error-600)] dark:text-[var(--color-error-400)] hover:bg-[var(--color-error-50)] dark:hover:bg-[var(--color-error-900)]"
              >
                Delete Event
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              onClick={onClose}
              className="min-w-[80px]"
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSave}
              className="min-w-[80px]"
            >
              {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};