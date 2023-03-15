const memo = <T>(fn: () => Promise<T>): (() => Promise<T>) => {
  let result: T | undefined = undefined;
  return async () => {
    if (result) {
      return result;
    }

    result = await fn();
    return result as T;
  };
};

export default memo;
