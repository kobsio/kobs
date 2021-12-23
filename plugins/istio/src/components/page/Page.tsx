import { Route, Switch } from 'react-router-dom';
import React from 'react';

import Application from './Application';
import Applications from './Applications';
import { IPluginOptions } from '../../utils/interfaces';
import { IPluginPageProps } from '@kobsio/plugin-core';

const Page: React.FunctionComponent<IPluginPageProps> = ({
  name,
  displayName,
  description,
  pluginOptions,
}: IPluginPageProps) => {
  if (!pluginOptions || !pluginOptions.hasOwnProperty('prometheus')) {
    return null;
  }

  const tmpPluginOptions: IPluginOptions = {
    klogs: pluginOptions['klogs'],
    prometheus: pluginOptions['prometheus'],
  };

  return (
    <Switch>
      <Route exact={true} path={`/${name}`}>
        <Applications
          name={name}
          displayName={displayName}
          description={description}
          pluginOptions={tmpPluginOptions}
        />
      </Route>
      <Route exact={true} path={`/${name}/:namespace/:application`}>
        <Application name={name} pluginOptions={tmpPluginOptions} />
      </Route>
    </Switch>
  );
};

export default Page;
