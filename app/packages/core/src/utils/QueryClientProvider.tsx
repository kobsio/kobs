import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FunctionComponent, ReactNode } from 'react';

interface IProps {
  children: ReactNode;
}
const Provider: FunctionComponent<IProps> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchInterval: false,
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: false,
        retry: false,
        staleTime: Infinity,
      },
    },
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default Provider;
