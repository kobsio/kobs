import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/patternfly-addons.css';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Page } from '@patternfly/react-core';
import React from 'react';
import ReactDOM from 'react-dom/client';

import Application from './components/applications/Application';
import Applications from './components/applications/Applications';
import ApplicationsTopology from './components/topology/Applications';
import { AuthContextProvider } from './context/AuthContext';
import DashboardPage from './components/dashboards/DashboardPage';
import Header from './components/header/Header';
import PluginInstances from './components/plugins/PluginInstances';
import PluginPage from './components/plugins/PluginPage';
import { PluginsContextProvider } from './context/PluginsContext';
import Profile from './components/profile/Profile';
import Resources from './components/resources/Resources';
import Settings from './components/settings/Settings';
import Sidebar from './components/sidebar/Sidebar';
import Team from './components/teams/Team';
import Teams from './components/teams/Teams';

import 'xterm/css/xterm.css';
import './assets/index.css';

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
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <PluginsContextProvider>
          <BrowserRouter>
            <Page isManagedSidebar={true} header={<Header />} sidebar={<Sidebar />}>
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
            </Page>
          </BrowserRouter>
        </PluginsContextProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
