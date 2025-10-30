import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[var(--color-neutral-800)] rounded-2xl shadow-[var(--shadow-modal)] max-w-md w-full mx-auto border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-700)]">
          <h2 id="modal-title" className="text-lg font-semibold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)] dark:hover:text-[var(--color-neutral-300)] transition-colors duration-200 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-neutral-200)] dark:hover:bg-[var(--color-neutral-600)]"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};