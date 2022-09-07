import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Spinner } from '@patternfly/react-core';

import { IPluginPageProps } from '@kobsio/shared';

const Trace = lazy(() => import('./Trace'));
const Traces = lazy(() => import('./Traces'));
const Monitor = lazy(() => import('./Monitor'));

const Page: React.FunctionComponent<IPluginPageProps> = ({ instance }: IPluginPageProps) => {
  return (
    <Suspense
      fallback={<Spinner style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }} />}
    >
      <Routes>
        <Route path="/" element={<Traces instance={instance} />} />
        <Route path="/trace/" element={<Trace instance={instance} />} />
        <Route path="/trace/:traceID" element={<Trace instance={instance} />} />
        <Route path="/monitor" element={<Monitor instance={instance} />} />
      </Routes>
    </Suspense>
  );
};

export default Page;
