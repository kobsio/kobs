import { useEffect, useState } from 'react';

/**
 * `getResizeObserver` creates a ResizeObserver used to handle resize events for the given containerRef. If
 * ResizeObserver or the given containerRef are not available, a window resize event listener is used by default.
 */
const getResizeObserver = (
  containerRefElement: Element,
  handleResize: () => void,
  useRequestAnimationFrame?: boolean,
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let unobserve: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { ResizeObserver } = window as any;

  if (containerRefElement && ResizeObserver) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resizeObserver = new ResizeObserver((entries: any) => {
      if (useRequestAnimationFrame) {
        window.requestAnimationFrame(() => {
          if (Array.isArray(entries) && entries.length > 0) {
            handleResize();
          }
        });
      } else {
        if (Array.isArray(entries) && entries.length > 0) {
          handleResize();
        }
      }
    });
    resizeObserver.observe(containerRefElement);
    unobserve = () => resizeObserver.unobserve(containerRefElement);
  } else {
    window.addEventListener('resize', handleResize);
    unobserve = () => window.removeEventListener('resize', handleResize);
  }

  return () => {
    if (unobserve) {
      unobserve();
    }
  };
};

interface IDimensions {
  height: number;
  width: number;
}

/**
 * `debounce` debounces the provided `func` for the provided `wait` time.
 */
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

/**
 * `useDimensions` is a React hook, which can be used to get the dimensions of the provided `targetRef`. For that we are
 * listining to resize events. The change can be delayed by the provided `delay` to improve the render performance.
 */
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
