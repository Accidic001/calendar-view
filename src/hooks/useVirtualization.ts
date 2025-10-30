import { useState, useCallback, useRef, useEffect } from 'react';

interface VirtualizationConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface VirtualizationState {
  startIndex: number;
  endIndex: number;
  visibleItems: number;
  totalHeight: number;
  offsetY: number;
}

export const useVirtualization = <T>(
  items: T[],
  config: VirtualizationConfig
) => {
  const { itemHeight, containerHeight, overscan = 3 } = config;
  
  const [state, setState] = useState<VirtualizationState>({
    startIndex: 0,
    endIndex: 0,
    visibleItems: 0,
    totalHeight: 0,
    offsetY: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  const calculateVisibleItems = useCallback(() => {
    const startIndex = Math.max(0, Math.floor(state.offsetY / itemHeight) - overscan);
    const visibleItems = Math.ceil(containerHeight / itemHeight) + overscan * 2;
    const endIndex = Math.min(items.length, startIndex + visibleItems);
    
    setState(prev => ({
      ...prev,
      startIndex,
      endIndex,
      visibleItems,
      totalHeight: items.length * itemHeight,
    }));
  }, [items.length, itemHeight, containerHeight, overscan, state.offsetY]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const scrollTop = containerRef.current.scrollTop;
    setState(prev => ({
      ...prev,
      offsetY: scrollTop,
    }));
  }, []);

  const getVisibleItems = useCallback((): T[] => {
    return items.slice(state.startIndex, state.endIndex);
  }, [items, state.startIndex, state.endIndex]);

  const getItemStyle = useCallback((index: number): React.CSSProperties => {
    return {
      position: 'absolute',
      top: `${index * itemHeight}px`,
      height: `${itemHeight}px`,
      width: '100%',
      left: 0,
      right: 0,
    };
  }, [itemHeight]);

  useEffect(() => {
    if (isInitialized.current) return;
    
    // Use setTimeout to avoid calling setState synchronously in useEffect
    const timer = setTimeout(() => {
      calculateVisibleItems();
      isInitialized.current = true;
    }, 0);

    return () => clearTimeout(timer);
  }, [calculateVisibleItems]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToIndex = useCallback((index: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTop = index * itemHeight;
    }
  }, [itemHeight]);

  return {
    containerRef,
    visibleItems: getVisibleItems(),
    startIndex: state.startIndex,
    endIndex: state.endIndex,
    totalHeight: state.totalHeight,
    getItemStyle,
    scrollToIndex,
  };
};