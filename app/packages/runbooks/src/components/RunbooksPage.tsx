import { IPluginPageProps } from '@kobsio/core';
import { FunctionComponent } from 'react';
import { Route, Routes } from 'react-router-dom';

import DetailsPage from './DetailsPage';
import ListPage from './ListPage';

const RunbooksPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  return (
    <Routes>
      <Route path="/" element={<ListPage instance={instance} />} />
      <Route path="/group/:group/alert/:alert" element={<DetailsPage instance={instance} />} />
    </Routes>
  );
};

export default RunbooksPage;
