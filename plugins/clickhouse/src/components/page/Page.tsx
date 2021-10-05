import { Route, Switch } from 'react-router-dom';
import React from 'react';

import { IPluginPageProps } from '@kobsio/plugin-core';
import LogsPage from './LogsPage';
import VisualizationPage from './VisualizationPage';

const Page: React.FunctionComponent<IPluginPageProps> = ({ name, displayName, description }: IPluginPageProps) => {
  return (
    <Switch>
      <Route exact={true} path={`/${name}`}>
        <LogsPage name={name} displayName={displayName} description={description} />
      </Route>
      <Route exact={true} path={`/${name}/visualization`}>
        <VisualizationPage name={name} displayName={displayName} description={description} />
      </Route>
    </Switch>
  );
};

export default Page;
