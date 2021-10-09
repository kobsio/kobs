import { Route, Switch } from 'react-router-dom';
import React from 'react';

import { IPluginPageProps } from '@kobsio/plugin-core';
import User from './User';
import Users from './Users';

// The page implementation for the users plugin supports two different routes. The first page shows a list of all users,
// while the latter one is used to show a single user.
const Page: React.FunctionComponent<IPluginPageProps> = ({ name, displayName, description }: IPluginPageProps) => {
  return (
    <Switch>
      <Route exact={true} path={`/${name}`}>
        <Users displayName={displayName} description={description} />
      </Route>
      <Route exact={true} path={`/${name}/:cluster/:namespace/:name`}>
        <User />
      </Route>
    </Switch>
  );
};

export default Page;
