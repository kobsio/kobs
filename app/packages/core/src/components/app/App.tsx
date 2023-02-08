import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Theme, ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import React from 'react';

import Home from './Home';
import Layout from './Layout';
import SignIn from './SignIn';
import SignInCallback from './SignInCallback';

// Create a global queryClient, which is used for @tanstack/react-query.
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

interface IAppProps {
  theme: Theme;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: any;
}

export const App: React.FunctionComponent<IAppProps> = ({ theme, plugins }: IAppProps) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        {/* TODO: APIContext */}
        <BrowserRouter>
          <Routes>
            {/* TODO: Auth */}
            <Route path="/auth" element={<SignIn />} />
            <Route path="/auth/callback" element={<SignInCallback />} />
            <Route
              path="*"
              element={
                <Layout>
                  {/* TODO: APPContext */}
                  {/* TODO: PluginContext */}
                  <Routes>
                    <Route path="/" element={<Home />} />
                  </Routes>
                </Layout>
              }
            />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
};
