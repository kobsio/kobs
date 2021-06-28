import { Brand, Page, PageHeader } from '@patternfly/react-core';
import { Link, Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import React from 'react';

import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/patternfly-addons.css';

import { IPluginComponents, PluginsContextProvider } from '../../context/PluginsContext';
import { ClustersContextProvider } from '../../context/ClustersContext';
import HomePage from './HomePage';
import { PluginPage } from '../plugin/PluginPage';

import logo from '../../assets/logo.png';

import '../../assets/app.css';

// Create a global queryClient, which is used for react-query.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  },
});

export interface IAppProps {
  plugins: IPluginComponents;
}

// App is used to set all routes for the react-router and the header for all pages. The header only contains the kobs
// logo. We only need two routes: One for the home components, which renders a list of all registered plugin instances
// and a second one for the plugin pages, which renders the page component for the corresponding plugin type.
export const App: React.FunctionComponent<IAppProps> = ({ plugins }: IAppProps) => {
  const Header = <PageHeader logoComponent={Link} logoProps={{ to: '/' }} logo={<Brand src={logo} alt="kobs" />} />;

  return (
    <QueryClientProvider client={queryClient}>
      <ClustersContextProvider>
        <PluginsContextProvider components={plugins}>
          <Router>
            <Page header={Header}>
              <Switch>
                <Route exact={true} path="/" component={HomePage} />
                <Route exact={false} path="/:name" component={PluginPage} />
              </Switch>
            </Page>
          </Router>
        </PluginsContextProvider>
      </ClustersContextProvider>
    </QueryClientProvider>
  );
};
