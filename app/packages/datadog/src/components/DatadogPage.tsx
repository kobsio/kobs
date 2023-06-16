import { IPluginPageProps } from '@kobsio/core';
import { FunctionComponent } from 'react';
import { Route, Routes } from 'react-router-dom';

import LogsPage from './LogsPage';
import MetricsPage from './MetricsPage';

const KLogsPage: FunctionComponent<IPluginPageProps> = (props) => {
  return (
    <Routes>
      <Route path="/" element={<LogsPage {...props} />} />
      <Route path="/metrics" element={<MetricsPage {...props} />} />
    </Routes>
  );
};

export default KLogsPage;
