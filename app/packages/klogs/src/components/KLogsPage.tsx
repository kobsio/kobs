import { IPluginPageProps } from '@kobsio/core';
import { FunctionComponent } from 'react';
import { Route, Routes } from 'react-router-dom';

import AggregationPage from './AggregationPage';
import LogsPage from './LogsPage';

const KLogsPage: FunctionComponent<IPluginPageProps> = (props) => {
  return (
    <Routes>
      <Route path="/" element={<LogsPage {...props} />} />
      <Route path="/aggregation" element={<AggregationPage {...props} />} />
    </Routes>
  );
};

export default KLogsPage;
