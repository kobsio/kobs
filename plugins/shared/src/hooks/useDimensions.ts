import { useEffect, useState } from 'react';
import { getResizeObserver } from '@patternfly/react-charts';

export interface IDimensions {
  height: number;
  width: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const debounce = (func: (...args: any[]) => any, wait: number): ((...args: any[]) => any) => {
  let timeout: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (...args: any[]) => {
    clearTimeout(timeout);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    timeout = setTimeout(() => func.apply(this, args), wait) as any;
  };
};

export const useDimensions = (
  targetRef: React.RefObject<HTMLDivElement>,
  defaults: IDimensions = { height: 0, width: 0 },
  delay = 500,
): IDimensions => {
  const [dimensions, setDimensions] = useState({
    height: targetRef.current ? targetRef.current.offsetHeight : defaults.height,
    width: targetRef.current ? targetRef.current.offsetWidth : defaults.width,
  });

  useEffect(() => {
    if (targetRef.current) {
      getResizeObserver(
        targetRef.current,
        debounce(() => {
          if (targetRef.current && targetRef.current.clientHeight && targetRef.current.clientWidth) {
            setDimensions({ height: targetRef.current.clientHeight, width: targetRef.current.clientWidth });
          }
        }, delay),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return dimensions;
};
