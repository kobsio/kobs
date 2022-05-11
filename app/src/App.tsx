import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/patternfly-addons.css';

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Page } from '@patternfly/react-core';
import React from 'react';
import ReactDOM from 'react-dom';

import Applications from './components/applications/Applications';
import { AuthContextProvider } from './context/AuthContext';
import Header from './components/header/Header';
import PluginInstances from './components/plugins/PluginInstances';
import PluginPage from './components/plugins/PluginPage';
import { PluginsContextProvider } from './context/PluginsContext';
import Sidebar from './components/sidebar/Sidebar';
import Teams from './components/teams/Teams';

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

export const App: React.FunctionComponent = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <PluginsContextProvider>
          <BrowserRouter>
            <Page isManagedSidebar={true} header={<Header />} sidebar={<Sidebar />}>
              <Routes>
                <Route path="/" element={<Applications />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/plugins" element={<PluginInstances />} />
                <Route path="/plugins/:type/:name" element={<PluginPage />} />
              </Routes>
            </Page>
          </BrowserRouter>
        </PluginsContextProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
