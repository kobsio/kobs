import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Spinner } from '@patternfly/react-core';

import { IPluginPageProps } from '@kobsio/shared';

const AggregationPage = lazy(() => import('./AggregationPage'));
const LogsPage = lazy(() => import('./LogsPage'));

const Page: React.FunctionComponent<IPluginPageProps> = ({ instance }: IPluginPageProps) => {
  return (
    <Suspense
      fallback={<Spinner style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }} />}
    >
      <Routes>
        <Route path="/" element={<LogsPage instance={instance} />} />
        <Route path="/aggregation" element={<AggregationPage instance={instance} />} />
      </Routes>
    </Suspense>
  );
};

export default Page;
