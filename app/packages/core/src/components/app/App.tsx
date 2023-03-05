import { CssBaseline, ThemeProvider, Box, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, ReactNode, useContext } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import Home from './Home';
import Layout from './layout/Layout';
import Signin from './signin/Signin';
import SigninOIDCCallback from './signin/SigninOIDCCallback';

import { APIContextProvider, APIContext, IAPIContext, APIError, IAPIUser } from '../../context/APIContext';
import { AppContextProvider, IAppIcons } from '../../context/AppContext';
import { PluginContextProvider, IPlugin } from '../../context/PluginContext';
import { QueryClientProvider } from '../../context/QueryClientProvider';
import theme from '../../utils/theme';
import ApplicationPage from '../applications/ApplicationPage';
import ApplicationsPage from '../applications/ApplicationsPage';
import TopologyPage from '../applications/TopologyPage';
import DashboardsPage from '../dashboards/DashboardsPage';
import PluginPage from '../plugins/PluginPage';
import PluginsPage from '../plugins/PluginsPage';
import ResourcesLogsPage from '../resources/ResourcesLogsPage';
import ResourcesPage from '../resources/ResourcesPage';
import ResourcesTerminalPage from '../resources/ResourcesTerminalPage';
import TeamPage from '../teams/TeamPage';
import TeamsPage from '../teams/TeamsPage';

/**
 * `IAuthWrapper` is the interface which defines the properties for the `AuthWrapper` component. We only have to provide
 * a `children` which should be protected by the `AuthWrapper` component.
 */
interface IAuthWrapper {
  children: ReactNode;
}

/**
 * The `AuthWrapper` component is used to protect the provided `children`. This means that the provided `children` can
 * only be accessed when the user is authenticated. For this we are calling the `auth` method of our API client which
 * returns the authenticated user. If we can not get a user within the `auth` method and our API returns a unauthorized
 * error we automatically redirecting the user to the sign in page.
 */
const AuthWrapper: FunctionComponent<IAuthWrapper> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isLoading, isError, error } = useQuery<IAPIUser, APIError>(['core/authwrapper'], async () => {
    return apiContext.client.auth();
  });

  if (isLoading) {
    return (
      <Box minHeight="100vh" minWidth="100%" display="flex" flexDirection="column" justifyContent="center">
        <Box sx={{ display: 'inline-flex', mx: 'auto' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (isError) {
    if (error.statusCode === 401) {
      navigate(`/auth?redirect=${encodeURIComponent(location.pathname + location.search)}`);

      return (
        <Box minHeight="100vh" minWidth="100%" display="flex" flexDirection="column" justifyContent="center">
          <Box sx={{ display: 'inline-flex', mx: 'auto' }}>
            <CircularProgress />
          </Box>
        </Box>
      );
    }

    return (
      <Box minHeight="100vh" minWidth="100%" display="flex" flexDirection="column" justifyContent="center">
        <Box sx={{ display: 'inline-flex', mx: 'auto' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return <>{children}</>;
};

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
export const App: FunctionComponent<IAppProps> = ({ icons, plugins }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider>
        <AppContextProvider icons={icons}>
          <APIContextProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Signin />} />
                <Route path="/auth/callback" element={<SigninOIDCCallback />} />
                <Route
                  path="*"
                  element={
                    <AuthWrapper>
                      <PluginContextProvider plugins={plugins}>
                        <Layout>
                          <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/applications" element={<ApplicationsPage />} />
                            <Route
                              path="/applications/cluster/:cluster/namespace/:namespace/name/:name"
                              element={<ApplicationPage />}
                            />
                            <Route path="/topology" element={<TopologyPage />} />
                            <Route path="/teams" element={<TeamsPage />} />
                            <Route path="/teams/:id" element={<TeamPage />} />
                            <Route path="/dashboards/:page" element={<DashboardsPage />} />
                            <Route path="/resources" element={<ResourcesPage />} />
                            <Route path="/resources/logs" element={<ResourcesLogsPage />} />
                            <Route path="/resources/terminal" element={<ResourcesTerminalPage />} />
                            <Route path="/plugins" element={<PluginsPage />} />
                            <Route path="/plugins/:cluster/:type/:name" element={<PluginPage />} />
                          </Routes>
                        </Layout>
                      </PluginContextProvider>
                    </AuthWrapper>
                  }
                />
              </Routes>
            </BrowserRouter>
          </APIContextProvider>
        </AppContextProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};
