import { useEffect, useLayoutEffect, useState } from 'react';

export interface IDimensions {
  height: number;
  width: number;
}

export const useDimensions = (targetRef: React.RefObject<HTMLDivElement>): IDimensions => {
  const getDimensions = (): IDimensions => {
    return {
      height: targetRef.current ? targetRef.current.offsetHeight : 0,
      width: targetRef.current ? targetRef.current.offsetWidth : 0,
    };
  };

  const [dimensions, setDimensions] = useState(getDimensions);

  const handleResize = (): void => {
    setDimensions(getDimensions());
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return (): void => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    handleResize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return dimensions;
};
