import { Brand, Page, PageHeader } from '@patternfly/react-core';
import { Link, Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import React from 'react';

import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/patternfly-addons.css';
import '@patternfly/patternfly/patternfly-charts.css';

import Application from 'components/applications/Application';
import Applications from 'components/applications/Applications';
import { ClustersContextProvider } from 'context/ClustersContext';
import Home from 'components/Home';
import Plugins from 'components/plugins/PluginPage';
import { PluginsContextProvider } from 'context/PluginsContext';
import Resources from 'components/resources/Resources';

import 'app.css';

// App is used to set all routes for the react-router and the header for all pages.
const App: React.FunctionComponent = () => {
  const Header = (
    <PageHeader logoComponent={Link} logoProps={{ to: '/' }} logo={<Brand src="/img/header-logo.png" alt="kobs" />} />
  );

  return (
    <ClustersContextProvider>
      <PluginsContextProvider>
        <Router>
          <Page header={Header}>
            <Switch>
              <Route exact={true} path="/" component={Home} />
              <Route exact={true} path="/applications" component={Applications} />
              <Route exact={true} path="/applications/:cluster/:namespace/:name" component={Application} />
              <Route exact={true} path="/resources" component={Resources} />
              <Route exact={true} path="/plugins/:name" component={Plugins} />
            </Switch>
          </Page>
        </Router>
      </PluginsContextProvider>
    </ClustersContextProvider>
  );
};

export default App;
