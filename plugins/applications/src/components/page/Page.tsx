import { Route, Switch } from 'react-router-dom';
import React from 'react';

import Application from './Application';
import Applications from './Applications';
import { IPluginPageProps } from '@kobsio/plugin-core';

// The page for the applications plugin, supports two different routes: One for showing a gallery / topology of
// applications, where the user can select a list of clusters and namespaces for which he wants to get the applications
// and a second one for showing a single application.
const Page: React.FunctionComponent<IPluginPageProps> = ({ name, displayName, description }: IPluginPageProps) => {
  return (
    <Switch>
      <Route exact={true} path={`/${name}`}>
        <Applications name={name} displayName={displayName} description={description} />
      </Route>
      <Route exact={true} path={`/${name}/:cluster/:namespace/:name`}>
        <Application />
      </Route>
    </Switch>
  );
};

export default Page;
