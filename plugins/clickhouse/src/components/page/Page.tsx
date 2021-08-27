import React from 'react';

import { IPluginPageProps } from '@kobsio/plugin-core';
import LogsPage from './LogsPage';

const Page: React.FunctionComponent<IPluginPageProps> = ({
  name,
  displayName,
  description,
  options,
}: IPluginPageProps) => {
  if (options && options.type && options.type === 'logs') {
    return <LogsPage name={name} displayName={displayName} description={description} />;
  }

  return null;
};

export default Page;
