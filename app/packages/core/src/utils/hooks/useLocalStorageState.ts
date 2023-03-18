import { useState } from 'react';

import { useMemoizedFn } from './useMemoizedFn';

interface IFuncUpdater<T> {
  (previousState?: T): T;
}

/**
 * `useLocalStorageState` is a React hook, which allows us to store the state into localStorage.
 *
 * Note: The implementation is heavily inspired by https://ahooks.js.org/hooks/use-local-storage-state, but doesn't
 * support custom serialization deserialization, like the original one.
 */
export const useLocalStorageState = <T>(key: string, defaultValue?: T) => {
  function setStoredValue(value?: T) {
    if (typeof value === 'undefined') {
      localStorage.removeItem(key);
    } else {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // If user is in private mode or has storage restriction localStorage can throw. Also JSON.stringify can throw.
      }
    }
  }

  function getStoredValue() {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // If user is in private mode or has storage restriction localStorage can throw. Also JSON.parse can throw.
    }

    const internalDefaultValue =
      typeof defaultValue === 'function' ? (defaultValue as IFuncUpdater<T>)() : defaultValue;

    setStoredValue(internalDefaultValue);

    return internalDefaultValue;
  }

  const [state, setState] = useState<T>(() => getStoredValue());

  const updateState = (value: T | IFuncUpdater<T>) => {
    const currentState = typeof value === 'function' ? (value as IFuncUpdater<T>)(state) : value;

    setState(currentState);
    setStoredValue(currentState);
  };

  return [state, useMemoizedFn(updateState)] as const;
};
