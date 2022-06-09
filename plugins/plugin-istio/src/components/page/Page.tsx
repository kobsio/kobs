import { Route, Routes } from 'react-router-dom';
import React from 'react';

import Application from './Application';
import Applications from './Applications';
import { IPluginPageProps } from '@kobsio/shared';

const Page: React.FunctionComponent<IPluginPageProps> = ({ instance }: IPluginPageProps) => {
  return (
    <Routes>
      <Route path={`/`} element={<Applications instance={instance} />}></Route>
      <Route path={`/:namespace/:application`} element={<Application instance={instance} />} />
    </Routes>
  );
};

export default Page;
