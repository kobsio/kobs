import { Route, Switch } from 'react-router-dom';
import React from 'react';

import { IPluginPageProps } from '@kobsio/plugin-core';
import Team from './Team';
import Teams from './Teams';

// The page implementation for the teams plugin supports two different routes. The first page shows a list of all teams,
// while the latter one is used to show a single team.
const Page: React.FunctionComponent<IPluginPageProps> = ({ name, displayName, description }: IPluginPageProps) => {
  return (
    <Switch>
      <Route exact={true} path={`/${name}`}>
        <Teams displayName={displayName} description={description} />
      </Route>
      <Route exact={true} path={`/${name}/:cluster/:namespace/:name`}>
        <Team />
      </Route>
    </Switch>
  );
};

export default Page;
