import { Route, Switch } from 'react-router-dom';
import React from 'react';

import ArtifactsPage from './ArtifactsPage';
import { IPluginPageProps } from '@kobsio/plugin-core';
import ProjectsPage from './ProjectsPage';
import RepositoriesPage from './RepositoriesPage';

const Page: React.FunctionComponent<IPluginPageProps> = ({
  name,
  displayName,
  description,
  options,
}: IPluginPageProps) => {
  return (
    <Switch>
      <Route exact={true} path={`/${name}`}>
        <ProjectsPage name={name} displayName={displayName} description={description} />
      </Route>
      <Route exact={true} path={`/${name}/repositories/:projectName`}>
        <RepositoriesPage name={name} />
      </Route>
      <Route exact={true} path={`/${name}/artifacts/:projectName/:repositoryName`}>
        <ArtifactsPage name={name} address={options && options.address ? options.address : ''} />
      </Route>
    </Switch>
  );
};

export default Page;
