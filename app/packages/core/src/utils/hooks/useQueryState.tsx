import queryString from 'query-string';
import { useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import useMemoizedFn from './useMemoizedFn';
import useUpdate from './useUpdate';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryState = Record<string, any>;

/**
 * `useQueryState` is a React hook, which allows us to store the state into a url query.
 *
 * Note: The implementation is heavily inspired by https://ahooks.js.org/hooks/use-url-state, but only supports React
 * Router v6, uses `react-router-dom` instead of `react-router` and removes the options, which should always be the same
 * across all our components.
 */
const useQueryState = <S extends QueryState = QueryState>(initialState?: S | (() => S)) => {
  type State = Partial<{ [key in keyof S]: string }>;

  const location = useLocation();
  const navigate = useNavigate();
  const update = useUpdate();

  const initialStateRef = useRef(typeof initialState === 'function' ? (initialState as () => S)() : initialState || {});

  const queryFromUrl = useMemo(() => {
    return queryString.parse(location.search, { parseBooleans: false, parseNumbers: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const targetQuery: State = useMemo(
    () => ({
      ...initialStateRef.current,
      ...queryFromUrl,
    }),
    [queryFromUrl],
  );

  const setState = (s: React.SetStateAction<State>) => {
    const newQuery = typeof s === 'function' ? s(targetQuery) : s;

    update();

    if (navigate) {
      navigate(
        {
          hash: location.hash,
          search:
            queryString.stringify({ ...queryFromUrl, ...newQuery }, { skipEmptyString: false, skipNull: false }) || '?',
        },
        {
          replace: false,
          state: location.state,
        },
      );
    }
  };

  return [targetQuery, useMemoizedFn(setState)] as const;
};

export default useQueryState;
