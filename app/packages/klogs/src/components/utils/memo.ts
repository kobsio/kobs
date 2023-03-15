/**
 * memo returns a memoized version of the passed function
 * when the returned function is called multiple times, it will only run the passed function once
 */
const memo = <T>(fn: () => Promise<T>): (() => Promise<T>) => {
  let result: T | undefined = undefined;
  return async () => {
    if (typeof result !== 'undefined') {
      return result;
    }

    result = await fn();
    return result;
  };
};

export default memo;
