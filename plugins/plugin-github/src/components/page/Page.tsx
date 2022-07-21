import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Spinner } from '@patternfly/react-core';

import { IPluginPageProps } from '@kobsio/shared';

const Overview = lazy(() => import('./Overview'));
const AuthCallback = lazy(() => import('../../context/AuthCallback'));

const Page: React.FunctionComponent<IPluginPageProps> = ({ instance }: IPluginPageProps) => {
  return (
    <Suspense
      fallback={<Spinner style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }} />}
    >
      <Routes>
        <Route path="/" element={<Overview instance={instance} />} />
        <Route path="/oauth/callback" element={<AuthCallback instance={instance} />} />
      </Routes>
    </Suspense>
  );
};

export default Page;
