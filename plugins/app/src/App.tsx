import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/patternfly-addons.css';

import { Alert, AlertVariant, Page, Spinner } from '@patternfly/react-core';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import React, { Suspense, lazy, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ReactDOM from 'react-dom/client';

import { AuthContextProvider } from './context/AuthContext';
import Header from './components/header/Header';
import Notifications from './components/header/Notifications';
import { NotificationsContextProvider } from './context/NotificationsContext';
import { PluginsContextProvider } from './context/PluginsContext';

import 'xterm/css/xterm.css';
import './assets/index.css';

const Application = lazy(() => import('./components/applications/Application'));
const Applications = lazy(() => import('./components/applications/Applications'));
const ApplicationsTopology = lazy(() => import('./components/topology/Applications'));
const DashboardPage = lazy(() => import('./components/dashboards/DashboardPage'));
const PluginInstances = lazy(() => import('./components/plugins/PluginInstances'));
const PluginPage = lazy(() => import('./components/plugins/PluginPage'));
const Profile = lazy(() => import('./components/profile/Profile'));
const Resources = lazy(() => import('./components/resources/Resources'));
const Settings = lazy(() => import('./components/settings/Settings'));
const Sidebar = lazy(() => import('./components/sidebar/Sidebar'));
const Team = lazy(() => import('./components/teams/Team'));
const Teams = lazy(() => import('./components/teams/Teams'));

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

const App: React.FunctionComponent = () => {
  const [isNotificationDrawerExpanded, setIsNotificationDrawerExpanded] = useState<boolean>(false);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <NotificationsContextProvider>
          <PluginsContextProvider>
            <BrowserRouter>
              <Page
                isManagedSidebar={true}
                header={
                  <Header
                    isNotificationDrawerExpanded={isNotificationDrawerExpanded}
                    setIsNotificationDrawerExpanded={setIsNotificationDrawerExpanded}
                  />
                }
                sidebar={<Sidebar />}
                notificationDrawer={
                  <Notifications
                    isNotificationDrawerExpanded={isNotificationDrawerExpanded}
                    setIsNotificationDrawerExpanded={setIsNotificationDrawerExpanded}
                  />
                }
                isNotificationDrawerExpanded={isNotificationDrawerExpanded}
              >
                <ErrorBoundary
                  fallbackRender={({ error }): React.ReactElement => (
                    <Alert
                      style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }}
                      variant={AlertVariant.danger}
                      title="An error occured"
                    >
                      <p>{error?.message}</p>
                    </Alert>
                  )}
                >
                  <Suspense
                    fallback={
                      <Spinner
                        style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }}
                      />
                    }
                  >
                    <Routes>
                      <Route path="/" element={<Navigate to="/applications" replace={true} />} />
                      <Route path="/applications" element={<Applications />} />
                      <Route
                        path="/applications/satellite/:satellite/cluster/:cluster/namespace/:namespace/name/:name"
                        element={<Application />}
                      />
                      <Route
                        path="/dashboards/satellite/:satellite/cluster/:cluster/namespace/:namespace/name/:name"
                        element={<DashboardPage />}
                      />
                      <Route path="/topology" element={<ApplicationsTopology />} />
                      <Route path="/teams" element={<Teams />} />
                      <Route path="/teams/:team" element={<Team />} />
                      <Route path="/resources" element={<Resources />} />
                      <Route path="/plugins" element={<PluginInstances />} />
                      <Route path="/plugins/:satellite/:type/:name/*" element={<PluginPage />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </Page>
            </BrowserRouter>
          </PluginsContextProvider>
        </NotificationsContextProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
