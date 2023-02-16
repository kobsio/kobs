import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Home from './Home';
import Layout from './layout/Layout';
import SignIn from './SignIn';
import SignInCallback from './SignInCallback';

import { AppContextProvider, IAppIcons } from '../../context/AppContext';
import { PluginContextProvider, IPlugin } from '../../context/PluginContext';
import theme from '../../utils/theme';

/**
 * `queryClient` is our global query client for `@tanstack/react-query`.
 */
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

/**
 * `IAppProps` are the properties for our `App` component. Currently we only require a list of `plugins`, so that
 * plugins can be registered without touching the core of our app.
 */
interface IAppProps {
  icons?: IAppIcons;
  plugins: IPlugin[];
}

/**
 * The `App` component defines, defines all the contexts and routes we are using in our app. The `App` component is also
 * responsible for defining our layout and registering the theme.
 */
export const App: React.FunctionComponent<IAppProps> = ({ icons, plugins }: IAppProps) => {
  return (
    <AppContextProvider icons={icons}>
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
                  <PluginContextProvider plugins={plugins}>
                    <Layout>
                      {/* TODO: APPContext */}
                      {/* TODO: PluginContext */}
                      <Routes>
                        <Route path="/" element={<Home />} />
                      </Routes>
                    </Layout>
                  </PluginContextProvider>
                }
              />
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </AppContextProvider>
  );
};
