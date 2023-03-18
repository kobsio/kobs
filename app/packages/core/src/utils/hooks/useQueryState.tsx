import queryString from 'query-string';
import { SetStateAction, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useMemoizedFn } from './useMemoizedFn';
import { useUpdate } from './useUpdate';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryState = Record<string, any>;

/**
 * `useQueryState` is a React hook, which allows us to store the state into a url query.
 *
 * Note: The implementation is heavily inspired by https://ahooks.js.org/hooks/use-url-state, but only supports React
 * Router v6, uses `react-router-dom` instead of `react-router` and removes the options, which should always be the same
 * across all our components.
 */
export const useQueryState = <S extends QueryState = QueryState>(initialState?: S | (() => S)) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type State = Partial<{ [key in keyof S]: any }>;

  const location = useLocation();
  const navigate = useNavigate();
  const update = useUpdate();

  const initialStateRef = useRef(typeof initialState === 'function' ? (initialState as () => S)() : initialState || {});
  const initialQueryFromUrl = useRef(true);

  const queryFromUrl = useMemo(() => {
    const parsedQueryString = queryString.parse(location.search, {
      arrayFormat: 'bracket',
      parseBooleans: true,
      parseNumbers: true,
    });

    // When the `queryFromUrl` function is run for the first time we want to use the `initialStateRef` in the
    // `targetQuery`, but if the function runs again, we want to be able to overwrite an array value in the
    // `initialStateRef` with an empty array. Without this "hack" this would not be possible and we are not able to use
    // empty arrays.
    if (initialQueryFromUrl.current === false) {
      Object.entries(initialStateRef.current).forEach(([key, value]) => {
        if (Array.isArray(value) && !(key in parsedQueryString)) {
          parsedQueryString[key] = [];
        }
      });
    }

    initialQueryFromUrl.current = false;
    return parsedQueryString;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const targetQuery: State = useMemo(
    () => ({
      ...initialStateRef.current,
      ...queryFromUrl,
    }),
    [queryFromUrl],
  );

  const setState = (s: SetStateAction<State>) => {
    const newQuery = typeof s === 'function' ? s(targetQuery) : s;

    update();

    if (navigate) {
      navigate(
        {
          hash: location.hash,
          search:
            queryString.stringify(
              { ...queryFromUrl, ...newQuery },
              { arrayFormat: 'bracket', skipEmptyString: false, skipNull: false },
            ) || '?',
        },
        {
          replace: false,
          state: location.state,
        },
      );
    }
  };

  return [targetQuery as S, useMemoizedFn(setState)] as const;
};
