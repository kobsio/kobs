import { Route, Switch } from 'react-router-dom';
import React from 'react';

import { IPluginPageProps } from '@kobsio/plugin-core';
import ServicePage from './ServicePage';
import TechDocsPage from './TechDocsPage';

const Page: React.FunctionComponent<IPluginPageProps> = ({ name, displayName, description }: IPluginPageProps) => {
  return (
    <Switch>
      <Route exact={true} path={`/${name}`}>
        <TechDocsPage name={name} displayName={displayName} description={description} />
      </Route>
      <Route exact={true} path={`/${name}/:service`}>
        <ServicePage name={name} />
      </Route>
      <Route exact={true} path={`/${name}/:service/:path+`}>
        <ServicePage name={name} />
      </Route>
    </Switch>
  );
};

export default Page;
