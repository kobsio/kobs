import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';

import { useMemoizedFn } from './useMemoizedFn';

const useCount = () => {
  const [count, setCount] = useState(0);

  const addCount = () => {
    setCount((c) => c + 1);
  };

  const memoizedFn = useMemoizedFn(() => count);

  return { addCount, memoizedFn };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let hook: any;

describe('useMemoizedFn', () => {
  it('should work', () => {
    act(() => {
      hook = renderHook(() => useCount());
    });
    const currentFn = hook.result.current.memoizedFn;
    expect(hook.result.current.memoizedFn()).toBe(0);

    act(() => {
      hook.result.current.addCount();
    });

    expect(currentFn).toEqual(hook.result.current.memoizedFn);
    expect(hook.result.current.memoizedFn()).toBe(1);
  });
});
