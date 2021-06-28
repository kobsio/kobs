import { useEffect, useState } from 'react';

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
