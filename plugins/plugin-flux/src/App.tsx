import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/patternfly-addons.css';

import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import {
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadMain,
  Page,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { QueryClient, QueryClientProvider } from 'react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';

import FluxPage from './components/page/Page';
import FluxPanel from './components/panel/Panel';
import { IPluginInstance } from '@kobsio/shared';

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

const instance: IPluginInstance = {
  id: 'flux',
  name: 'flux',
  satellite: 'kobs',
  type: 'flux',
  updatedAt: 0,
};

export const App: React.FunctionComponent = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Page
          header={
            <Masthead>
              <MastheadMain>
                <MastheadBrand>Flux</MastheadBrand>
              </MastheadMain>
              <MastheadContent>
                <Toolbar id="header-toolbar" isFullHeight={true} isStatic={true}>
                  <ToolbarContent>
                    <ToolbarItem>
                      <Link to="/">Page</Link>
                    </ToolbarItem>
                    <ToolbarItem>
                      <Link to="/panels">Panel</Link>
                    </ToolbarItem>
                  </ToolbarContent>
                </Toolbar>
              </MastheadContent>
            </Masthead>
          }
        >
          <Routes>
            <Route path="/" element={<FluxPage instance={instance} />} />
            <Route path="/panels" element={<FluxPanel title="Test" instance={instance} />} />
          </Routes>
        </Page>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
