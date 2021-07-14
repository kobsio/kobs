import { useEffect, useState } from 'react';

// useWindowWidth is a custom React Hook, which can be used to get the current width of the browser window.
export const useWindowWidth = (): number => {
  const [width, setWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    const handleResize = (): void => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return (): void => {
      window.removeEventListener('resize', handleResize);
    };
  });

  return width;
};
