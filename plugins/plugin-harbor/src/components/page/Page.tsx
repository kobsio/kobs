import { Route, Routes } from 'react-router-dom';
import React from 'react';

import ArtifactsPage from './ArtifactsPage';
import { IPluginPageProps } from '@kobsio/shared';
import ProjectsPage from './ProjectsPage';
import RepositoriesPage from './RepositoriesPage';

const Page: React.FunctionComponent<IPluginPageProps> = ({ instance }: IPluginPageProps) => {
  return (
    <Routes>
      <Route path="/" element={<ProjectsPage instance={instance} />} />
      <Route path="/:projectName" element={<RepositoriesPage instance={instance} />} />
      <Route path="/:projectName/:repositoryName" element={<ArtifactsPage instance={instance} />} />
    </Routes>
  );
};

export default Page;
