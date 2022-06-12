import { Route, Routes } from 'react-router-dom';
import React from 'react';

import { IPluginPageProps } from '@kobsio/shared';
import ServicePage from './ServicePage';
import TechDocsPage from './TechDocsPage';

const Page: React.FunctionComponent<IPluginPageProps> = ({ instance }: IPluginPageProps) => {
  return (
    <Routes>
      <Route path={`/`} element={<TechDocsPage instance={instance} />} />
      <Route path={`/:service`} element={<ServicePage instance={instance} />} />
      <Route path={`/:service/:path`} element={<ServicePage instance={instance} />} />
    </Routes>
  );
};

export default Page;
