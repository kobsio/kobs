import { Route, Switch } from 'react-router-dom';
import React from 'react';

import Dashboard from './Dashboard';
import Dashboards from './Dashboards';
import { IPluginPageProps } from '@kobsio/plugin-core';

const Page: React.FunctionComponent<IPluginPageProps> = ({ name, displayName, description }: IPluginPageProps) => {
  return (
    <Switch>
      <Route exact={true} path={`/${name}`}>
        <Dashboards displayName={displayName} description={description} />
      </Route>
      <Route exact={true} path={`/${name}/:cluster/:namespace/:name`}>
        <Dashboard />
      </Route>
    </Switch>
  );
};

export default Page;
