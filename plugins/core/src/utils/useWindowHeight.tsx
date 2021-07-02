import { useEffect, useState } from 'react';

// useWindowHeight is a custom React Hook, which can be used to get the current height of the browser window.
export const useWindowHeight = (): number => {
  const [height, setHeight] = useState<number>(window.innerHeight);

  useEffect(() => {
    const handleResize = (): void => setHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return (): void => {
      window.removeEventListener('resize', handleResize);
    };
  });

  return height;
};
