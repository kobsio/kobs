import { Route, Routes } from 'react-router-dom';
import React from 'react';

import AggregationPage from './AggregationPage';
import { IPluginPageProps } from '@kobsio/shared';
import LogsPage from './LogsPage';

const Page: React.FunctionComponent<IPluginPageProps> = ({ instance }: IPluginPageProps) => {
  return (
    <Routes>
      <Route path="/" element={<LogsPage instance={instance} />} />
      <Route path="/aggregation" element={<AggregationPage instance={instance} />} />
    </Routes>
  );
};

export default Page;
