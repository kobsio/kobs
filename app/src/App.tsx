import { Page, PageHeader } from '@patternfly/react-core';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import React from 'react';

import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/patternfly-addons.css';

import Applications from './components/applications/Applications';
import Logo from './components/menu/Logo';
import Overview from './components/overview/Overview';
import Resources from './components/resources/Resources';

import './app.css';

const App: React.FunctionComponent = () => {
  const Header = <PageHeader logo={<Logo />} />;

  return (
    <Router>
      <Page header={Header}>
        <Switch>
          <Route exact path="/" component={Overview} />
          <Route exact path="/applications" component={Applications} />
          <Route exact path="/resources/:kind" component={Resources} />
        </Switch>
      </Page>
    </Router>
  );
};

export default App;
