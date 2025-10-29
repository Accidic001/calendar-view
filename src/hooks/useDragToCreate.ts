import { useState, useCallback, useRef } from 'react';

interface DragToCreateState {
  isDragging: boolean;
  startHour: number | null;
  endHour: number | null;
  currentDate: Date | null;
}

interface UseDragToCreateProps {
  onDragCreate: (date: Date, startHour: number, endHour: number) => void;
}

export const useDragToCreate = ({ onDragCreate }: UseDragToCreateProps) => {
  const [state, setState] = useState<DragToCreateState>({
    isDragging: false,
    startHour: null,
    endHour: null,
    currentDate: null,
  });

  const dragDataRef = useRef({
    startHour: null as number | null,
    currentDate: null as Date | null,
  });

  const startDrag = useCallback((date: Date, hour: number) => {
    dragDataRef.current = { startHour: hour, currentDate: date };
    setState({
      isDragging: true,
      startHour: hour,
      endHour: hour,
      currentDate: date,
    });
  }, []);

  const updateDrag = useCallback((hour: number) => {
    if (!state.isDragging || !dragDataRef.current.startHour) return;
    
    setState(prev => ({
      ...prev,
      endHour: hour,
    }));
  }, [state.isDragging]);

  const endDrag = useCallback((hour: number) => {
    if (!state.isDragging || !dragDataRef.current.startHour || !dragDataRef.current.currentDate) {
      return;
    }

    const startHour = dragDataRef.current.startHour;
    const endHour = hour;
    const date = dragDataRef.current.currentDate;

    // Ensure start is before end
    const finalStartHour = Math.min(startHour, endHour);
    const finalEndHour = Math.max(startHour, endHour);

    if (finalEndHour > finalStartHour) {
      onDragCreate(date, finalStartHour, finalEndHour);
    }

    // Reset state
    setState({
      isDragging: false,
      startHour: null,
      endHour: null,
      currentDate: null,
    });
    dragDataRef.current = { startHour: null, currentDate: null };
  }, [state.isDragging, onDragCreate]);

  const cancelDrag = useCallback(() => {
    setState({
      isDragging: false,
      startHour: null,
      endHour: null,
      currentDate: null,
    });
    dragDataRef.current = { startHour: null, currentDate: null };
  }, []);

  return {
    isDragging: state.isDragging,
    dragRange: state.startHour !== null && state.endHour !== null 
      ? { start: Math.min(state.startHour, state.endHour), end: Math.max(state.startHour, state.endHour) }
      : null,
    currentDate: state.currentDate,
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,
  };
};