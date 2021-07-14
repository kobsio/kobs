import { Route, Switch } from 'react-router-dom';
import React from 'react';

import { IPluginPageProps } from '@kobsio/plugin-core';
import Trace from './Trace';
import Traces from './Traces';

const Page: React.FunctionComponent<IPluginPageProps> = ({ name, displayName, description }: IPluginPageProps) => {
  return (
    <Switch>
      <Route exact={true} path={`/${name}`}>
        <Traces name={name} displayName={displayName} description={description} />
      </Route>
      <Route exact={true} path={`/${name}/trace/:traceID?`}>
        <Trace name={name} />
      </Route>
    </Switch>
  );
};

export default Page;
