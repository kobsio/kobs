import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Spinner } from '@patternfly/react-core';

import { IPluginPageProps } from '@kobsio/shared';

const LogsPage = lazy(() => import('./LogsPage'));
// const MetricsPage = lazy(() => import('./MetricsPage'));

const Page: React.FunctionComponent<IPluginPageProps> = ({ instance }: IPluginPageProps) => {
  return (
    <Suspense
      fallback={<Spinner style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }} />}
    >
      <Routes>
        <Route path="/" element={<LogsPage instance={instance} />} />
        {/* <Route path="/metrics" element={<MetricsPage instance={instance} />} /> */}
      </Routes>
    </Suspense>
  );
};

export default Page;
