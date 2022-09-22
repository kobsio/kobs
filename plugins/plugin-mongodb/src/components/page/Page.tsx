import React, { Suspense } from 'react';
import { Spinner } from '@patternfly/react-core';

import { QueryClient, QueryClientProvider } from 'react-query';
import { Route, Routes } from 'react-router-dom';

import { IPluginPageProps } from '@kobsio/shared';
import QueryPage from './QueryPage';
import StatsPage from './StatsPage';

const queryClient = new QueryClient();

const Page: React.FunctionComponent<IPluginPageProps> = ({ instance }: IPluginPageProps) => {
  return (
    <Suspense
      fallback={<Spinner style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }} />}
    >
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<StatsPage instance={instance} />} />
          <Route path="/:collectionName/query" element={<QueryPage instance={instance} />} />
        </Routes>
      </QueryClientProvider>
    </Suspense>
  );
};

export default Page;
