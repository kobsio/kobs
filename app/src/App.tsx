import { Page, PageHeader } from '@patternfly/react-core';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import React from 'react';

import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/patternfly-addons.css';

import Application from 'components/applications/Application';
import Applications from 'components/applications/Applications';
import HeaderLogo from 'components/shared/HeaderLogo';
import Overview from 'components/overview/Overview';
import Resources from 'components/resources/Resources';

import 'app.css';

// App is used to set all routes for the react-router and the header for all pages.
const App: React.FunctionComponent = () => {
  const Header = <PageHeader logo={<HeaderLogo />} />;

  return (
    <Router>
      <Page header={Header}>
        <Switch>
          <Route exact={true} path="/" component={Overview} />
          <Route exact={true} path="/applications" component={Applications} />
          <Route exact={true} path="/applications/:cluster/:namespace/:name" component={Application} />
          <Route exact={true} path="/resources/:kind" component={Resources} />
        </Switch>
      </Page>
    </Router>
  );
};

export default App;
