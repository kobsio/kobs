import { useRef } from 'react';

/**
 * `useLatest` is a React state hook that returns the latest state as described in the React hooks FAQ.
 *
 * See: https://streamich.github.io/react-use/?path=/story/state-uselatest--docs
 */
export const useLatest = <T>(value: T): { readonly current: T } => {
  const ref = useRef(value);
  ref.current = value;
  return ref;
};
