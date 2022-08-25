import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Spinner } from '@patternfly/react-core';

import { IPluginPageProps } from '@kobsio/shared';

const OverviewPage = lazy(() => import('./OverviewPage'));
const RequestsPage = lazy(() => import('./RequestsPage'));
const AgentsPage = lazy(() => import('./AgentsPage'));

const Page: React.FunctionComponent<IPluginPageProps> = ({ instance }: IPluginPageProps) => {
  return (
    <Suspense
      fallback={<Spinner style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }} />}
    >
      <Routes>
        <Route path="/" element={<OverviewPage instance={instance} />} />
        <Route path="/requests" element={<RequestsPage instance={instance} />} />
        <Route path="/agents" element={<AgentsPage instance={instance} />} />
      </Routes>
    </Suspense>
  );
};

export default Page;
