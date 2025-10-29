import React, { useCallback } from 'react';
import { clsx } from 'clsx';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  className
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={disabled}
      className={clsx(
        'w-full px-3 py-2 border border-[var(--color-neutral-300)] dark:border-[var(--color-neutral-600)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent transition-all duration-200 bg-white dark:bg-[var(--color-neutral-700)] text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] appearance-none cursor-pointer',
        disabled && 'bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] text-[var(--color-neutral-500)] cursor-not-allowed opacity-60',
        className
      )}
    >
      {placeholder && (
        <option value="" className="text-[var(--color-neutral-500)]">
          {placeholder}
        </option>
      )}
      {options.map(option => (
        <option 
          key={option.value} 
          value={option.value}
          className="text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] bg-white dark:bg-[var(--color-neutral-700)]"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};