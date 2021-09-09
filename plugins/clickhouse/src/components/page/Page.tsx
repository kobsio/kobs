import React from 'react';

import { IPluginPageProps } from '@kobsio/plugin-core';
import LogsPage from './LogsPage';
import SQLPage from './SQLPage';

const Page: React.FunctionComponent<IPluginPageProps> = ({
  name,
  displayName,
  description,
  options,
}: IPluginPageProps) => {
  if (options && options.type && options.type === 'logs') {
    return <LogsPage name={name} displayName={displayName} description={description} />;
  } else if (options && options.type && options.type === 'sql') {
    return <SQLPage name={name} displayName={displayName} description={description} />;
  }

  return null;
};

export default Page;
