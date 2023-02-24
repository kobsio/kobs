import { QueryClient, QueryClientConfig, QueryClientProvider } from '@tanstack/react-query';
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

interface IProviderProps {
  children: ReactNode;
}

const Provider: FunctionComponent<IProviderProps> = ({ children }) => {
  const queryClient = new QueryClient(queryClientOptions);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default Provider;
