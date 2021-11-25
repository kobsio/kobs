import { Route, Switch } from 'react-router-dom';
import React from 'react';

import ContainerInstancesPage from '../containerinstances/Page';
import { IPluginPageProps } from '@kobsio/plugin-core';
import OverviewPage from './OverviewPage';

const Page: React.FunctionComponent<IPluginPageProps> = ({ name, displayName, description }: IPluginPageProps) => {
  return (
    <Switch>
      <Route exact={true} path={`/${name}`}>
        <OverviewPage name={name} displayName={displayName} description={description} />
      </Route>
      <Route exact={true} path={`/${name}/containerinstances`}>
        <ContainerInstancesPage name={name} displayName={displayName} />
      </Route>
    </Switch>
  );
};

export default Page;
