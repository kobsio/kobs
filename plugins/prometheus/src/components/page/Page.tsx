import React from 'react';

import { IPluginPageProps } from '@kobsio/shared';

const Page: React.FunctionComponent<IPluginPageProps> = ({ instance }: IPluginPageProps) => {
  return <div>{JSON.stringify(instance)}</div>;
};

export default Page;
