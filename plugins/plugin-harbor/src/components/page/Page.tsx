import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Spinner } from '@patternfly/react-core';

import { IPluginPageProps } from '@kobsio/shared';

const ArtifactsPage = lazy(() => import('./ArtifactsPage'));
const ProjectsPage = lazy(() => import('./ProjectsPage'));
const RepositoriesPage = lazy(() => import('./RepositoriesPage'));

const Page: React.FunctionComponent<IPluginPageProps> = ({ instance }: IPluginPageProps) => {
  return (
    <Suspense
      fallback={<Spinner style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }} />}
    >
      <Routes>
        <Route path="/" element={<ProjectsPage instance={instance} />} />
        <Route path="/:projectName" element={<RepositoriesPage instance={instance} />} />
        <Route path="/:projectName/:repositoryName" element={<ArtifactsPage instance={instance} />} />
      </Routes>
    </Suspense>
  );
};

export default Page;
