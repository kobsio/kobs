import queryString, { ParsedQuery } from 'query-string';
import { SetStateAction, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useMemoizedFn } from './useMemoizedFn';
import { useUpdate } from './useUpdate';

import { timeOptions, times, TTime, TTimeQuick } from '../times';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryState = Record<string, any>;
type PQ = ParsedQuery<string | number | boolean>;

const queryStringHasTime = (q: PQ): q is { time: TTimeQuick } & PQ => {
  return 'time' in q && typeof q.time === 'string' && times.includes(q.time as TTime) && q.time !== 'custom';
};

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

    // Whent the `queryFromUrl` function is run for the first time we have to apply some special handling for the time
    // parameters. Instead of directly using the `timeEnd` and `timeStart` parameters, we have to check if the `time`
    // parameter contains a valid time, so that we are really using the "last 15 minutes" and not the times from the
    // `timeEnd` and `timeStart` parameters.
    if (initialQueryFromUrl.current === true) {
      if (queryStringHasTime(parsedQueryString)) {
        parsedQueryString.timeEnd = Math.floor(Date.now() / 1000);
        parsedQueryString.timeStart = Math.floor(Date.now() / 1000) - timeOptions[parsedQueryString.time].seconds;
      }
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

  return [targetQuery as S, useMemoizedFn(setState) as (s: React.SetStateAction<Partial<S>>) => void] as const;
};
