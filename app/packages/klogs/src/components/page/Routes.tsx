import { IPluginPageProps } from '@kobsio/core';
import { FunctionComponent } from 'react';
import { Route, Routes } from 'react-router-dom';

import LogsPage from './LogsPage';

const Entrypoint: FunctionComponent<IPluginPageProps> = (props) => {
  return (
    <Routes>
      <Route path="/" element={<LogsPage {...props} />} />
      {/* <Route path="/aggregation" element={<AggregationPage instance={instance} />} /> */}
    </Routes>
  );
};

export default Entrypoint;
