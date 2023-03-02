import { useCallback, useState } from 'react';

/**
 * `useUpdate` is a React hook that returns a function which can be used to force the component to re-render.
 *
 * Note: This is required for the `useQueryState` and taken from https://ahooks.js.org/hooks/use-update
 */
export const useUpdate = () => {
  const [, setState] = useState({});

  return useCallback(() => setState({}), []);
};
