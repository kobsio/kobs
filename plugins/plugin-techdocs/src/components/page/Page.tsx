import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Spinner } from '@patternfly/react-core';

import { IPluginPageProps } from '@kobsio/shared';

const ServicePage = lazy(() => import('./ServicePage'));
const TechDocsPage = lazy(() => import('./TechDocsPage'));

const Page: React.FunctionComponent<IPluginPageProps> = ({ instance }: IPluginPageProps) => {
  return (
    <Suspense
      fallback={<Spinner style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }} />}
    >
      <Routes>
        <Route path={`/`} element={<TechDocsPage instance={instance} />} />
        <Route path={`/:service`} element={<ServicePage instance={instance} />} />
        <Route path={`/:service/:path`} element={<ServicePage instance={instance} />} />
      </Routes>
    </Suspense>
  );
};

export default Page;
