import {
  QueryClient,
  QueryClientConfig,
  QueryClientProvider as InternalQueryClientProvider,
} from '@tanstack/react-query';
import { FunctionComponent, ReactNode } from 'react';

/**
 * `queryClientOptions` are the options for the query client created via '@tanstack/react-query'. These options are
 * defined here so that we can reuse them in our tests.
 */
const queryClientOptions: QueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: Infinity,
    },
  },
};

interface IQueryClientProviderProps {
  children: ReactNode;
}

/**
 * The `QueryClientProvider` components wraps the `InternalQueryClientProvider` component from the `react-query` package
 * to apply our app wide `queryClientOptions`.
 */
const QueryClientProvider: FunctionComponent<IQueryClientProviderProps> = ({ children }) => {
  const queryClient = new QueryClient(queryClientOptions);

  return <InternalQueryClientProvider client={queryClient}>{children}</InternalQueryClientProvider>;
};

export default QueryClientProvider;
