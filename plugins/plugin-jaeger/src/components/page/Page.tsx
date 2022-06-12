import { Route, Routes } from 'react-router-dom';
import React from 'react';

import { IPluginPageProps } from '@kobsio/shared';
import Trace from './Trace';
import Traces from './Traces';

const Page: React.FunctionComponent<IPluginPageProps> = ({ instance }: IPluginPageProps) => {
  return (
    <Routes>
      <Route path="/" element={<Traces instance={instance} />} />
      <Route path="/trace/" element={<Trace instance={instance} />} />
      <Route path="/trace/:traceID" element={<Trace instance={instance} />} />
    </Routes>
  );
};

export default Page;
