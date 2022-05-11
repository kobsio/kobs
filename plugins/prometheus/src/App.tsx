import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/patternfly-addons.css';

import {
  Brand,
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
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom';

import Panel from './components/panel/Panel';

import icon from './assets/icon.png';

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
      <BrowserRouter>
        <Page
          header={
            <Masthead>
              <MastheadMain>
                <MastheadBrand>
                  <Brand style={{ maxHeight: '35px' }} src={icon} alt="Prometheus" />
                </MastheadBrand>
              </MastheadMain>
              <MastheadContent>
                <Toolbar id="header-toolbar" isFullHeight={true} isStatic={true}>
                  <ToolbarContent>
                    <ToolbarItem>Page</ToolbarItem>
                    <ToolbarItem>Panel</ToolbarItem>
                  </ToolbarContent>
                </Toolbar>
              </MastheadContent>
            </Masthead>
          }
        >
          <Panel title="test" instance={{ name: 'name', type: 'prometheus' }} />
        </Page>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
