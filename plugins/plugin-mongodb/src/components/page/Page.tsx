import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Spinner } from '@patternfly/react-core';

import DocumentPage from './DocumentPage';
import { IPluginPageProps } from '@kobsio/shared';
import OverviewPage from './OverviewPage';
import QueryPage from './QueryPage';

const Page: React.FunctionComponent<IPluginPageProps> = ({ instance }: IPluginPageProps) => {
  return (
    <Suspense
      fallback={<Spinner style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }} />}
    >
      <Routes>
        <Route path="/" element={<OverviewPage instance={instance} />} />
        <Route path="/:collectionName/query" element={<QueryPage instance={instance} />} />
        <Route path="/:collectionName/document" element={<DocumentPage instance={instance} />} />
      </Routes>
    </Suspense>
  );
};

export default Page;
