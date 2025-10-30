import { useState, useCallback, useRef } from 'react';

interface MultiSelectState {
  isSelecting: boolean;
  selectionStart: Date | null;
  selectionEnd: Date | null;
  selectedRange: Date[];
}

interface UseMultiSelectProps {
  onRangeSelect: (dates: Date[]) => void;
}

export const useMultiSelect = ({ onRangeSelect }: UseMultiSelectProps) => {
  const [state, setState] = useState<MultiSelectState>({
    isSelecting: false,
    selectionStart: null,
    selectionEnd: null,
    selectedRange: [],
  });

  const shiftPressedRef = useRef(false);

  // Get all dates between start and end (inclusive)
  const getDatesInRange = useCallback((start: Date, end: Date): Date[] => {
    const dates: Date[] = [];
    let current = new Date(start);
    let endDate = new Date(end);
    
    if (current > endDate) {
      [current, endDate] = [endDate, current];
    }
    
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  }, []);

  // Declare endSelection first to avoid usage before declaration
  const endSelection = useCallback(() => {
    if (!state.isSelecting) return;
    
    setState(prev => ({
      ...prev,
      isSelecting: false,
    }));
    
    if (state.selectedRange.length > 1) {
      onRangeSelect(state.selectedRange);
    }
  }, [state.isSelecting, state.selectedRange, onRangeSelect]);

  // Now declare handleKeyUp that uses endSelection
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Shift') {
      shiftPressedRef.current = true;
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Shift') {
      shiftPressedRef.current = false;
      if (state.isSelecting) {
        endSelection();
      }
    }
  }, [state.isSelecting, endSelection]); // Added endSelection dependency

  const startSelection = useCallback((date: Date) => {
    if (!shiftPressedRef.current) return;
    
    setState({
      isSelecting: true,
      selectionStart: date,
      selectionEnd: date,
      selectedRange: [date],
    });
  }, []);

  const updateSelection = useCallback((date: Date) => {
    if (!state.isSelecting || !state.selectionStart) return;
    
    const selectedRange = getDatesInRange(state.selectionStart, date);
    
    setState(prev => ({
      ...prev,
      selectionEnd: date,
      selectedRange,
    }));
  }, [state.isSelecting, state.selectionStart, getDatesInRange]);

  const cancelSelection = useCallback(() => {
    setState({
      isSelecting: false,
      selectionStart: null,
      selectionEnd: null,
      selectedRange: [],
    });
  }, []);

  const initialize = useCallback(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mouseup', endSelection);
  }, [handleKeyDown, handleKeyUp, endSelection]);

  const cleanup = useCallback(() => {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    document.removeEventListener('mouseup', endSelection);
  }, [handleKeyDown, handleKeyUp, endSelection]);

  // Create a separate function to check shift state that can be called in event handlers
  const isShiftPressed = useCallback(() => {
    return shiftPressedRef.current;
  }, []);

  return {
    isSelecting: state.isSelecting,
    selectionStart: state.selectionStart,
    selectionEnd: state.selectionEnd,
    selectedRange: state.selectedRange,
    startSelection,
    updateSelection,
    endSelection,
    cancelSelection,
    initialize,
    cleanup,
    isShiftPressed, // Return function instead of ref.current
  };
};