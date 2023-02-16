import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';

import Home from './Home';
import Layout from './Layout';
import SignIn from './SignIn';
import SignInCallback from './SignInCallback';
import SigninOIDC from './SignInOIDC';

import theme from '../../theme/theme';
import APIContext from '../api/context';
import User from '../user/context';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: any;
}

export const App: React.FunctionComponent<IAppProps> = ({ plugins }: IAppProps) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <APIContext.Wrapper>
            <Routes>
              <Route path="/auth" element={<SignIn />} />
              <Route path="/auth/oidc" element={<SigninOIDC />} />
              <Route path="/auth/callback" element={<SignInCallback />} />
              <Route
                path="*"
                element={
                  <User.Provider>
                    <Outlet />
                  </User.Provider>
                }
              >
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
              </Route>
            </Routes>
          </APIContext.Wrapper>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
};
